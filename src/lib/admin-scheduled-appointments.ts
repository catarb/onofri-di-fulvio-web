import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";

export type ScheduledAppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";

export type ScheduledAppointment = {
  id: string;
  createdAt: string;
  updatedAt: string;
  patientId: string;
  appointmentId: string | null;
  title: string;
  startsAt: string;
  endsAt: string;
  status: ScheduledAppointmentStatus;
  specialty: string | null;
  professional: string | null;
  notes: string | null;
  patient: {
    id: string;
    fullName: string;
    phone: string;
    email: string | null;
  } | null;
};

export type ListScheduledFilters = {
  from?: string;
  to?: string;
  patientId?: string;
  status?: ScheduledAppointmentStatus;
  limit?: number;
};

export type CreateScheduledInput = {
  patientId: string;
  appointmentId?: string | null;
  title: string;
  startsAt: string;
  endsAt: string;
  status: ScheduledAppointmentStatus;
  specialty?: string | null;
  professional?: string | null;
  notes?: string | null;
};

export type UpdateScheduledInput = Partial<CreateScheduledInput>;

export async function listScheduledAppointments(filters: ListScheduledFilters = {}): Promise<ScheduledAppointment[]> {
  if (!hasSupabaseConfig()) return [];

  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("scheduled_appointments")
    .select("*, patient:patients(id, full_name, phone, email)")
    .order("starts_at", { ascending: true })
    .limit(filters.limit || 400);

  if (filters.from) query = query.gte("starts_at", filters.from);
  if (filters.to) query = query.lte("starts_at", filters.to);
  if (filters.patientId) query = query.eq("patient_id", filters.patientId);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw new Error("No se pudieron obtener los turnos agendados.");

  return (data || []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    patientId: row.patient_id,
    appointmentId: row.appointment_id,
    title: row.title,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: normalizeStatus(row.status),
    specialty: row.specialty,
    professional: row.professional,
    notes: row.notes,
    patient: row.patient
      ? {
          id: row.patient.id,
          fullName: row.patient.full_name,
          phone: row.patient.phone,
          email: row.patient.email
        }
      : null
  }));
}

export async function createScheduledAppointment(input: CreateScheduledInput): Promise<ScheduledAppointment> {
  if (!hasSupabaseConfig()) {
    throw new Error("Agenda no disponible sin configuración de Supabase.");
  }
  validateTimeRange(input.startsAt, input.endsAt);
  await assertNoProfessionalOverlap(input.professional || null, input.startsAt, input.endsAt);

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("scheduled_appointments")
    .insert({
      patient_id: input.patientId,
      appointment_id: input.appointmentId || null,
      title: input.title,
      starts_at: input.startsAt,
      ends_at: input.endsAt,
      status: input.status,
      specialty: input.specialty || null,
      professional: input.professional || null,
      notes: input.notes || null
    })
    .select("*, patient:patients(id, full_name, phone, email)")
    .single();

  if (error || !data) throw new Error("No se pudo crear el turno.");

  return {
    id: data.id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    patientId: data.patient_id,
    appointmentId: data.appointment_id,
    title: data.title,
    startsAt: data.starts_at,
    endsAt: data.ends_at,
    status: normalizeStatus(data.status),
    specialty: data.specialty,
    professional: data.professional,
    notes: data.notes,
    patient: data.patient
      ? {
          id: data.patient.id,
          fullName: data.patient.full_name,
          phone: data.patient.phone,
          email: data.patient.email
        }
      : null
  };
}

export async function updateScheduledAppointment(id: string, input: UpdateScheduledInput): Promise<void> {
  if (!hasSupabaseConfig()) throw new Error("Agenda no disponible sin configuración de Supabase.");

  const supabase = getSupabaseAdminClient();
  const { data: current, error: currentError } = await supabase
    .from("scheduled_appointments")
    .select("id, starts_at, ends_at, professional")
    .eq("id", id)
    .single();

  if (currentError || !current) throw new Error("Turno no encontrado.");

  const startsAt = input.startsAt || current.starts_at;
  const endsAt = input.endsAt || current.ends_at;
  const professional = input.professional !== undefined ? input.professional || null : current.professional;

  validateTimeRange(startsAt, endsAt);
  await assertNoProfessionalOverlap(professional, startsAt, endsAt, id);

  const payload: Record<string, unknown> = {};
  if (input.patientId !== undefined) payload.patient_id = input.patientId;
  if (input.appointmentId !== undefined) payload.appointment_id = input.appointmentId || null;
  if (input.title !== undefined) payload.title = input.title;
  if (input.startsAt !== undefined) payload.starts_at = input.startsAt;
  if (input.endsAt !== undefined) payload.ends_at = input.endsAt;
  if (input.status !== undefined) payload.status = input.status;
  if (input.specialty !== undefined) payload.specialty = input.specialty || null;
  if (input.professional !== undefined) payload.professional = input.professional || null;
  if (input.notes !== undefined) payload.notes = input.notes || null;

  const { error } = await supabase.from("scheduled_appointments").update(payload).eq("id", id);
  if (error) throw new Error("No se pudo actualizar el turno.");
}

async function assertNoProfessionalOverlap(
  professional: string | null,
  startsAt: string,
  endsAt: string,
  excludeId?: string
) {
  if (!professional) return;
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("scheduled_appointments")
    .select("id")
    .eq("professional", professional)
    .not("status", "in", "(cancelled,no_show)")
    .lt("starts_at", endsAt)
    .gt("ends_at", startsAt)
    .limit(1);

  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query;
  if (error) throw new Error("No se pudo validar solapamiento de turnos.");
  if ((data || []).length > 0) {
    throw new Error("Ya existe un turno solapado para este profesional en ese horario.");
  }
}

function validateTimeRange(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Fecha/hora inválida.");
  }
  if (end <= start) {
    throw new Error("La hora de fin debe ser posterior a la hora de inicio.");
  }
}

function normalizeStatus(status: unknown): ScheduledAppointmentStatus {
  if (status === "confirmed" || status === "completed" || status === "cancelled" || status === "no_show") {
    return status;
  }
  return "scheduled";
}
