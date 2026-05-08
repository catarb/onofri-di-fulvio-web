import { demoAppointments } from "@/lib/demo-data";
import type { AppointmentRecord } from "@/lib/types";
import { createPatient } from "@/lib/admin-patients";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";

export type AppointmentStatus = "nuevo" | "contactado" | "aceptado" | "rechazado";

export type AdminAppointment = AppointmentRecord & {
  status: AppointmentStatus;
  patientId: string | null;
  linkedPatient: {
    id: string;
    fullName: string;
    phone: string;
    email: string | null;
  } | null;
};

export type AppointmentFilters = {
  status?: AppointmentStatus | "todos";
  specialty?: string | "todas";
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  limit?: number;
  pageSize?: number;
};

export type PaginatedAppointmentsResult = {
  data: AdminAppointment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getAdminAppointments(filters: AppointmentFilters = {}): Promise<PaginatedAppointmentsResult> {
  const page = Math.max(1, filters.page || 1);
  const pageSize = Math.max(1, Math.min(200, filters.pageSize || filters.limit || 20));
  const hasConfig = hasSupabaseConfig();

  if (!hasConfig) {
    const filtered = applyFilters(getDemoAppointments(), filters);
    const total = filtered.length;
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    const data = filtered.slice(from, to);
    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    };
  }

  return await getSupabaseAppointments(filters, page, pageSize);
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  if (!hasSupabaseConfig()) {
    return { ok: true, mode: "demo" as const };
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id);

  if (error) {
    if (isMissingStatusColumnError(error)) {
      return { ok: true, mode: "fallback-no-status-column" as const };
    }
    throw new Error("No se pudo actualizar el estado de la solicitud.");
  }

  return { ok: true, mode: "supabase" as const };
}

type PatientMatch = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  dni: string | null;
};

type LinkResult =
  | { mode: "already-linked"; patientId: string }
  | { mode: "linked-existing"; patientId: string }
  | { mode: "created-and-linked"; patientId: string }
  | { mode: "possible-duplicates"; matches: PatientMatch[] };

export async function linkAppointmentToPatient(appointmentId: string, patientId: string): Promise<LinkResult> {
  if (!hasSupabaseConfig()) {
    return { mode: "linked-existing", patientId };
  }

  const supabase = getSupabaseAdminClient();
  const { data: appointment, error: readError } = await supabase
    .from("appointments")
    .select("id, patient_id")
    .eq("id", appointmentId)
    .single();

  if (readError || !appointment) {
    throw new Error("No se encontró la solicitud.");
  }

  if (appointment.patient_id) {
    return { mode: "already-linked", patientId: appointment.patient_id };
  }

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id")
    .eq("id", patientId)
    .single();

  if (patientError || !patient) {
    throw new Error("Paciente no encontrado.");
  }

  const { error: updateError } = await supabase
    .from("appointments")
    .update({ patient_id: patientId })
    .eq("id", appointmentId);

  if (updateError) {
    throw new Error("No se pudo vincular la solicitud.");
  }

  return { mode: "linked-existing", patientId };
}

export async function createPatientFromAppointmentAndLink(appointmentId: string): Promise<LinkResult> {
  if (!hasSupabaseConfig()) {
    return { mode: "created-and-linked", patientId: "demo-patient-id" };
  }

  const supabase = getSupabaseAdminClient();
  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, full_name, phone, email, coverage_type, coverage_name, notes, patient_id")
    .eq("id", appointmentId)
    .single();

  if (appointmentError || !appointment) {
    throw new Error("No se encontró la solicitud.");
  }

  if (appointment.patient_id) {
    return { mode: "already-linked", patientId: appointment.patient_id };
  }

  const normalizedPhone = String(appointment.phone || "").replace(/\D/g, "");
  const normalizedEmail = String(appointment.email || "").trim().toLowerCase();
  const orFilters: string[] = [];
  if (normalizedPhone) orFilters.push(`phone.eq.${appointment.phone}`);
  if (normalizedEmail) orFilters.push(`email.eq.${normalizedEmail}`);

  let matches: PatientMatch[] = [];
  if (orFilters.length > 0) {
    const { data: possibleMatches, error: matchError } = await supabase
      .from("patients")
      .select("id, full_name, phone, email, dni")
      .or(orFilters.join(","))
      .limit(8);

    if (matchError) {
      throw new Error("No se pudieron validar posibles duplicados.");
    }

    matches = (possibleMatches || []).filter((row) => {
      const rowPhone = String(row.phone || "").replace(/\D/g, "");
      const rowEmail = String(row.email || "").trim().toLowerCase();
      return (normalizedPhone && rowPhone === normalizedPhone) || (normalizedEmail && rowEmail === normalizedEmail);
    }).map((row) => ({
      id: row.id,
      fullName: row.full_name,
      phone: row.phone,
      email: row.email,
      dni: row.dni
    }));
  }

  if (matches.length > 0) {
    return { mode: "possible-duplicates", matches };
  }

  const creation = await createPatient({
    fullName: appointment.full_name,
    phone: appointment.phone,
    email: appointment.email || undefined,
    birthDate: undefined,
    dni: undefined,
    coverageType: appointment.coverage_type === "obra_social" ? "obra_social" : "particular",
    coverageName: appointment.coverage_name || undefined,
    affiliateNumber: undefined,
    notes: appointment.notes || undefined
  });

  const { error: updateError } = await supabase
    .from("appointments")
    .update({ patient_id: creation.id })
    .eq("id", appointmentId);

  if (updateError) {
    throw new Error("Se creó el paciente, pero no se pudo vincular la solicitud.");
  }

  return { mode: "created-and-linked", patientId: creation.id };
}

function isMissingStatusColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybe = error as { code?: string; message?: string };
  const code = String(maybe.code || "");
  const message = String(maybe.message || "").toLowerCase();
  return code === "42703" || (message.includes("column") && message.includes("status"));
}

function getDemoAppointments(): AdminAppointment[] {
  return demoAppointments.map((item, index) => ({
    ...item,
    status: index === 0 ? "nuevo" : index === 1 ? "contactado" : "aceptado",
    patientId: null,
    linkedPatient: null
  }));
}

function applyFilters(items: AdminAppointment[], filters: AppointmentFilters) {
  const q = filters.q?.trim().toLowerCase();
  return items.filter((item) => {
    if (q) {
      const haystack = `${item.fullName} ${item.phone} ${item.email || ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (filters.status && filters.status !== "todos" && item.status !== filters.status) {
      return false;
    }

    if (filters.specialty && filters.specialty !== "todas" && item.specialtySlug !== filters.specialty) {
      return false;
    }

    const createdAt = new Date(item.createdAt);

    if (filters.from) {
      const from = new Date(`${filters.from}T00:00:00`);
      if (createdAt < from) return false;
    }

    if (filters.to) {
      const to = new Date(`${filters.to}T23:59:59`);
      if (createdAt > to) return false;
    }

    return true;
  });
}

async function getSupabaseAppointments(
  filters: AppointmentFilters,
  page: number,
  pageSize: number
): Promise<PaginatedAppointmentsResult> {
  const supabase = getSupabaseAdminClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const q = filters.q?.trim();

  let query = supabase
    .from("appointments")
    .select(
      "id, created_at, full_name, phone, email, consultation_reason, specialty_slug, specialty_label, professional_slug, professional_label, coverage_type, coverage_name, notes, status, patient_id, patient:patients!appointments_patient_id_fkey(id, full_name, phone, email)",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (filters.status && filters.status !== "todos") {
    query = query.eq("status", filters.status);
  }
  if (filters.specialty && filters.specialty !== "todas") {
    query = query.eq("specialty_slug", filters.specialty);
  }
  if (filters.from) {
    query = query.gte("created_at", `${filters.from}T00:00:00`);
  }
  if (filters.to) {
    query = query.lte("created_at", `${filters.to}T23:59:59`);
  }
  if (q) {
    const escaped = q.replace(/[%_,]/g, "");
    query = query.or(
      `full_name.ilike.%${escaped}%,phone.ilike.%${escaped}%,email.ilike.%${escaped}%`
    );
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("Error consultando Supabase:", error.message);
    return {
      data: [],
      total: 0,
      page,
      pageSize,
      totalPages: 1
    };
  }

  const mapped = (data || []).map((row) => {
    const patient = Array.isArray(row.patient) ? row.patient[0] : row.patient;
    return {
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
      }).format(new Date(row.created_at)),
      status: normalizeStatus(row.status),
      patientId: row.patient_id || null,
      linkedPatient: patient
        ? {
            id: patient.id,
            fullName: patient.full_name,
            phone: patient.phone,
            email: patient.email
          }
        : null
    };
  });

  const total = count || 0;
  return {
    data: mapped,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  };
}

function normalizeStatus(status: unknown): AppointmentStatus {
  if (status === "contactado" || status === "aceptado" || status === "rechazado") {
    return status;
  }
  return "nuevo";
}
