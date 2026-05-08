import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";

type MonthlyReportParams = {
  year: number;
  month: number;
};

type MonthlyReportCsv = {
  filename: string;
  content: string;
};

type DetailRow = {
  fecha: string;
  tipo_registro: "solicitud" | "paciente" | "turno";
  paciente_nombre: string;
  telefono: string;
  email: string;
  dni: string;
  especialidad: string;
  profesional: string;
  cobertura: string;
  estado: string;
  observaciones: string;
  origen_solicitud: string;
  id_referencia: string;
};

export async function buildMonthlyReportCsv(params: MonthlyReportParams): Promise<MonthlyReportCsv> {
  if (!hasSupabaseConfig()) {
    throw new Error("Reportes no disponibles sin configuración de Supabase.");
  }

  const { fromIso, toIso, yyyyMm } = getMonthRange(params.year, params.month);
  const supabase = getSupabaseAdminClient();

  const [appointmentsRes, patientsRes, scheduledRes] = await Promise.all([
    supabase
      .from("appointments")
      .select("id, created_at, full_name, phone, email, specialty_label, professional_label, coverage_type, coverage_name, status, notes")
      .gte("created_at", fromIso)
      .lt("created_at", toIso)
      .order("created_at", { ascending: true }),
    supabase
      .from("patients")
      .select("id, created_at, full_name, phone, email, dni, coverage_type, coverage_name, notes")
      .gte("created_at", fromIso)
      .lt("created_at", toIso)
      .order("created_at", { ascending: true }),
    supabase
      .from("scheduled_appointments")
      .select("id, created_at, starts_at, ends_at, title, specialty, professional, status, notes, patient:patients(full_name, phone, email)")
      .gte("created_at", fromIso)
      .lt("created_at", toIso)
      .order("starts_at", { ascending: true })
  ]);

  if (appointmentsRes.error) throw new Error("No se pudieron obtener solicitudes del mes.");
  if (patientsRes.error) throw new Error("No se pudieron obtener pacientes del mes.");
  if (scheduledRes.error) throw new Error("No se pudieron obtener turnos del mes.");

  const appointments = appointmentsRes.data || [];
  const patients = patientsRes.data || [];
  const scheduled = scheduledRes.data || [];

  const totalSolicitudes = appointments.length;
  const totalPacientes = patients.length;
  const totalTurnos = scheduled.length;
  const totalProgramados = scheduled.filter((r) => normalizeScheduledStatus(r.status) === "scheduled").length;
  const totalConfirmados = scheduled.filter((r) => normalizeScheduledStatus(r.status) === "confirmed").length;
  const totalCompletados = scheduled.filter((r) => normalizeScheduledStatus(r.status) === "completed").length;
  const totalCancelados = scheduled.filter((r) => normalizeScheduledStatus(r.status) === "cancelled").length;
  const totalNoShow = scheduled.filter((r) => normalizeScheduledStatus(r.status) === "no_show").length;

  const bySpecialty = countMap(
    scheduled.map((r) => String(r.specialty || "Sin especialidad")),
    appointments.map((r) => String(r.specialty_label || "Sin especialidad"))
  );
  const byProfessional = countMap(scheduled.map((r) => String(r.professional || "Sin profesional")));
  const byCoverage = countMap(
    appointments.map((r) => formatCoverage(r.coverage_type, r.coverage_name)),
    patients.map((r) => formatCoverage(r.coverage_type, r.coverage_name))
  );

  const detailRows: DetailRow[] = [
    ...appointments.map((r) => ({
      fecha: r.created_at,
      tipo_registro: "solicitud" as const,
      paciente_nombre: String(r.full_name || ""),
      telefono: String(r.phone || ""),
      email: String(r.email || ""),
      dni: "",
      especialidad: String(r.specialty_label || ""),
      profesional: String(r.professional_label || ""),
      cobertura: formatCoverage(r.coverage_type, r.coverage_name),
      estado: normalizeAppointmentStatus(r.status),
      observaciones: String(r.notes || ""),
      origen_solicitud: "web",
      id_referencia: String(r.id)
    })),
    ...patients.map((r) => ({
      fecha: r.created_at,
      tipo_registro: "paciente" as const,
      paciente_nombre: String(r.full_name || ""),
      telefono: String(r.phone || ""),
      email: String(r.email || ""),
      dni: String(r.dni || ""),
      especialidad: "",
      profesional: "",
      cobertura: formatCoverage(r.coverage_type, r.coverage_name),
      estado: "nuevo",
      observaciones: String(r.notes || ""),
      origen_solicitud: "",
      id_referencia: String(r.id)
    })),
    ...scheduled.map((r) => {
      const patient = Array.isArray(r.patient) ? r.patient[0] : r.patient;
      return {
        fecha: String(r.starts_at || r.created_at),
        tipo_registro: "turno" as const,
        paciente_nombre: String(patient?.full_name || ""),
        telefono: String(patient?.phone || ""),
        email: String(patient?.email || ""),
        dni: "",
        especialidad: String(r.specialty || ""),
        profesional: String(r.professional || ""),
        cobertura: "",
        estado: labelScheduledStatus(normalizeScheduledStatus(r.status)),
        observaciones: String(r.notes || ""),
        origen_solicitud: "",
        id_referencia: String(r.id)
      };
    })
  ].sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  const lines: string[] = [];
  lines.push("sep=;");
  lines.push("");

  lines.push("RESUMEN_MENSUAL");
  lines.push(csvLine(["metrica", "valor"]));
  lines.push(csvLine(["mes", yyyyMm]));
  lines.push(csvLine(["total_solicitudes_recibidas", String(totalSolicitudes)]));
  lines.push(csvLine(["total_pacientes_nuevos", String(totalPacientes)]));
  lines.push(csvLine(["total_turnos_programados", String(totalProgramados)]));
  lines.push(csvLine(["total_turnos_confirmados", String(totalConfirmados)]));
  lines.push(csvLine(["total_turnos_completados", String(totalCompletados)]));
  lines.push(csvLine(["total_turnos_cancelados", String(totalCancelados)]));
  lines.push(csvLine(["total_turnos_no_asistio", String(totalNoShow)]));
  lines.push(csvLine(["total_turnos_mes", String(totalTurnos)]));
  lines.push("");

  lines.push("DISTRIBUCION_ESPECIALIDAD");
  lines.push(csvLine(["especialidad", "cantidad"]));
  for (const [k, v] of bySpecialty) lines.push(csvLine([k, String(v)]));
  lines.push("");

  lines.push("DISTRIBUCION_PROFESIONAL");
  lines.push(csvLine(["profesional", "cantidad"]));
  for (const [k, v] of byProfessional) lines.push(csvLine([k, String(v)]));
  lines.push("");

  lines.push("DISTRIBUCION_COBERTURA");
  lines.push(csvLine(["cobertura", "cantidad"]));
  for (const [k, v] of byCoverage) lines.push(csvLine([k, String(v)]));
  lines.push("");

  lines.push("DETALLE_REGISTROS");
  lines.push(
    csvLine([
      "fecha",
      "tipo_registro",
      "paciente_nombre",
      "telefono",
      "email",
      "dni",
      "especialidad",
      "profesional",
      "cobertura",
      "estado",
      "observaciones",
      "origen_solicitud",
      "id_referencia"
    ])
  );
  for (const row of detailRows) {
    lines.push(
      csvLine([
        row.fecha,
        row.tipo_registro,
        row.paciente_nombre,
        row.telefono,
        row.email,
        row.dni,
        row.especialidad,
        row.profesional,
        row.cobertura,
        row.estado,
        row.observaciones,
        row.origen_solicitud,
        row.id_referencia
      ])
    );
  }

  const content = lines.join("\r\n");
  return {
    filename: `reporte-consultorio-${yyyyMm}.csv`,
    content
  };
}

function csvLine(values: string[]) {
  return values
    .map((value) => {
      const normalized = String(value ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      const escaped = normalized.replace(/"/g, '""');
      return `"${escaped}"`;
    })
    .join(";");
}

function getMonthRange(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  const yyyyMm = `${year}-${String(month).padStart(2, "0")}`;
  return { fromIso: start.toISOString(), toIso: end.toISOString(), yyyyMm };
}

function normalizeScheduledStatus(status: unknown) {
  if (status === "confirmed" || status === "completed" || status === "cancelled" || status === "no_show") return status;
  return "scheduled";
}

function labelScheduledStatus(status: string) {
  if (status === "confirmed") return "Confirmado";
  if (status === "completed") return "Completado";
  if (status === "cancelled") return "Cancelado";
  if (status === "no_show") return "No asistió";
  return "Programado";
}

function normalizeAppointmentStatus(status: unknown) {
  if (status === "contactado") return "Contactado";
  if (status === "aceptado") return "Aceptado";
  if (status === "rechazado") return "Rechazado";
  return "Nuevo";
}

function formatCoverage(type: unknown, name: unknown) {
  if (type === "obra_social") return String(name || "Obra social");
  if (type === "prepaga") return String(name || "Prepaga");
  return "Particular";
}

function countMap(...groups: string[][]) {
  const map = new Map<string, number>();
  for (const group of groups) {
    for (const value of group) {
      const key = value && value.trim() ? value.trim() : "Sin dato";
      map.set(key, (map.get(key) || 0) + 1);
    }
  }
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
}
