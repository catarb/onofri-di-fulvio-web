import { demoAppointments } from "@/lib/demo-data";
import type { AppointmentRecord } from "@/lib/types";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";

export type AppointmentStatus = "nuevo" | "contactado" | "aceptado" | "rechazado";

export type AdminAppointment = AppointmentRecord & {
  status: AppointmentStatus;
};

export type AppointmentFilters = {
  status?: AppointmentStatus | "todos";
  specialty?: string | "todas";
  from?: string;
  to?: string;
};

export async function getAdminAppointments(filters: AppointmentFilters = {}): Promise<AdminAppointment[]> {
  const appointments = hasSupabaseConfig() ? await getSupabaseAppointments() : getDemoAppointments();
  return applyFilters(appointments, filters);
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
    status: index === 0 ? "nuevo" : index === 1 ? "contactado" : "aceptado"
  }));
}

function applyFilters(items: AdminAppointment[], filters: AppointmentFilters) {
  return items.filter((item) => {
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

async function getSupabaseAppointments(): Promise<AdminAppointment[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error || !data) {
    return getDemoAppointments();
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
    }).format(new Date(row.created_at)),
    status: normalizeStatus(row.status)
  }));
}

function normalizeStatus(status: unknown): AppointmentStatus {
  if (status === "contactado" || status === "aceptado" || status === "rechazado") {
    return status;
  }
  return "nuevo";
}
