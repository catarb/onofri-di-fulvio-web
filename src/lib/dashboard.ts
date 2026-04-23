import { demoAppointments } from "@/lib/demo-data";
import type { AppointmentRecord } from "@/lib/types";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";

function formatAppointmentRows(rows: AppointmentRecord[]) {
  return rows;
}

export async function getDashboardData() {
  const appointments = hasSupabaseConfig() ? await getSupabaseAppointments() : demoAppointments;
  const latestAppointments = formatAppointmentRows(appointments).slice(0, 6);
  const totalAppointments = appointments.length;
  const coverageWithInsurance = appointments.filter((item) => item.coverageType === "obra_social");
  const privatePatients = appointments.filter((item) => item.coverageType === "particular");
  const professionalCounter = countBy(appointments, (item) => item.professionalLabel);

  return {
    summary: {
      totalAppointments
    },
    cards: [
      {
        label: "Consultas totales",
        value: String(totalAppointments),
        caption: "Leads acumulados visibles en el panel"
      },
      {
        label: "Con obra social",
        value: String(coverageWithInsurance.length),
        caption: "Pacientes que declaran cobertura"
      },
      {
        label: "Particulares",
        value: String(privatePatients.length),
        caption: "Consultas sin cobertura declarada"
      },
      {
        label: "Especialidad mas consultada",
        value: topLabel(countBy(appointments, (item) => item.specialtyLabel)),
        caption: "Dato util para campanas y contenidos"
      }
    ],
    latestAppointments,
    byProfessional: professionalCounter.map((item) => ({
      ...item,
      percent: Math.max(20, Math.round((item.value / Math.max(totalAppointments, 1)) * 100))
    })),
    coverageBreakdown: [
      {
        label: "Obra social",
        value: String(coverageWithInsurance.length),
        caption: "Consultas con cobertura declarada"
      },
      {
        label: "Particular",
        value: String(privatePatients.length),
        caption: "Consultas particulares"
      }
    ]
  };
}

async function getSupabaseAppointments(): Promise<AppointmentRecord[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    return demoAppointments;
  }

  return data.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    consultationReason: row.consultation_reason,
    specialtySlug: row.specialty_slug,
    specialtyLabel: row.specialty_label,
    professionalSlug: row.professional_slug,
    professionalLabel: row.professional_label,
    coverageType: row.coverage_type,
    coverageName: row.coverage_name,
    coverageSummary:
      row.coverage_type === "obra_social"
        ? `Obra social - ${row.coverage_name || "No informada"}`
        : "Particular",
    notes: row.notes,
    dateLabel: new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(row.created_at))
  }));
}

function countBy<T>(items: T[], getLabel: (item: T) => string) {
  const map = new Map<string, number>();

  for (const item of items) {
    const label = getLabel(item);
    map.set(label, (map.get(label) || 0) + 1);
  }

  return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
}

function topLabel(items: Array<{ label: string; value: number }>) {
  return items.sort((a, b) => b.value - a.value)[0]?.label || "Sin datos";
}
