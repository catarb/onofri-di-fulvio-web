import type { PatientFormInput } from "@/lib/schema";
import { getSupabaseAdminClient } from "@/lib/supabase";

export type PatientCoverageType = "particular" | "obra_social" | "prepaga";

export type Patient = {
  id: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  dni: string | null;
  phone: string;
  email: string | null;
  birthDate: string | null;
  coverageType: PatientCoverageType | null;
  coverageName: string | null;
  affiliateNumber: string | null;
  notes: string | null;
};

export type PatientLinkedAppointment = {
  id: string;
  createdAt: string;
  specialtyLabel: string;
  professionalLabel: string;
  coverageType: "obra_social" | "particular" | null;
  coverageName: string | null;
  notes: string | null;
  status: "nuevo" | "contactado" | "aceptado" | "rechazado";
};

export type PatientDetail = {
  patient: Patient;
  appointments: PatientLinkedAppointment[];
};

export async function getPatients(): Promise<Patient[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    throw new Error("No se pudieron obtener los pacientes.");
  }

  if (!data) return [];

  return data.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    fullName: row.full_name,
    dni: row.dni,
    phone: row.phone,
    email: row.email,
    birthDate: row.birth_date,
    coverageType: row.coverage_type,
    coverageName: row.coverage_name,
    affiliateNumber: row.affiliate_number,
    notes: row.notes
  }));
}

export async function getPatientById(id: string): Promise<Patient | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error("No se pudo obtener el paciente.");
  }

  return {
    id: data.id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    fullName: data.full_name,
    dni: data.dni,
    phone: data.phone,
    email: data.email,
    birthDate: data.birth_date,
    coverageType: data.coverage_type,
    coverageName: data.coverage_name,
    affiliateNumber: data.affiliate_number,
    notes: data.notes
  };
}

export async function getPatientDetailById(id: string): Promise<PatientDetail | null> {
  const patient = await getPatientById(id);
  if (!patient) return null;

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("id, created_at, specialty_label, professional_label, coverage_type, coverage_name, notes, status")
    .eq("patient_id", id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error("No se pudieron obtener las solicitudes vinculadas.");
  }

  const appointments: PatientLinkedAppointment[] = (data || []).map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    specialtyLabel: row.specialty_label,
    professionalLabel: row.professional_label,
    coverageType: row.coverage_type,
    coverageName: row.coverage_name,
    notes: row.notes,
    status: normalizeAppointmentStatus(row.status)
  }));

  return { patient, appointments };
}

function normalizeAppointmentStatus(status: unknown): "nuevo" | "contactado" | "aceptado" | "rechazado" {
  if (status === "contactado" || status === "aceptado" || status === "rechazado") {
    return status;
  }
  return "nuevo";
}

export async function createPatient(input: PatientFormInput): Promise<{ id: string }> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("patients")
    .insert({
      full_name: input.fullName,
      dni: input.dni || null,
      phone: input.phone,
      email: input.email || null,
      birth_date: input.birthDate || null,
      coverage_type: input.coverageType,
      coverage_name: input.coverageName || null,
      affiliate_number: input.affiliateNumber || null,
      notes: input.notes || null
    })
    .select("id")
    .single();

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[createPatient] Supabase error:", error.code, error.message);
    }
    if (error.code === "23505") {
      const constraint = String((error as { constraint?: string }).constraint || "").toLowerCase();
      const details = String((error as { details?: string }).details || "").toLowerCase();
      const message = String(error.message || "").toLowerCase();
      const source = `${constraint} ${details} ${message}`;
      const hasDni = source.includes("patients_dni_unique_idx") || source.includes(" dni") || source.includes("(dni)");
      const hasEmail = source.includes("patients_email_unique_idx") || source.includes(" email") || source.includes("(email)");

      if (hasDni && hasEmail) {
        throw new Error("Ya existe un paciente con ese DNI o email.");
      }
      if (hasDni) {
        throw new Error("Ya existe un paciente con ese DNI.");
      }
      if (hasEmail) {
        throw new Error("Ya existe un paciente con ese email.");
      }
      throw new Error("Ya existe un paciente con ese DNI o email.");
    }
    if (error.code === "42501") {
      throw new Error("Sin permisos para crear paciente.");
    }
    if (error.code === "42P01") {
      throw new Error("Tabla patients no existe.");
    }
    throw new Error("No se pudo crear el paciente.");
  }

  if (!data) {
    throw new Error("No se recibió respuesta del servidor.");
  }

  return { id: data.id };
}

export async function updatePatient(id: string, input: Partial<PatientFormInput>): Promise<void> {
  const supabase = getSupabaseAdminClient();

  if (input.dni) {
    const { data: existing } = await supabase
      .from("patients")
      .select("id")
      .eq("dni", input.dni)
      .neq("id", id)
      .single();

    if (existing) {
      throw new Error("Ya existe un paciente con ese DNI.");
    }
  }

  if (input.email) {
    const { data: existing } = await supabase
      .from("patients")
      .select("id")
      .eq("email", input.email)
      .neq("id", id)
      .single();

    if (existing) {
      throw new Error("Ya existe un paciente con ese email.");
    }
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString()
  };

  if (input.fullName !== undefined) updates.full_name = input.fullName;
  if (input.dni !== undefined) updates.dni = input.dni || null;
  if (input.phone !== undefined) updates.phone = input.phone;
  if (input.email !== undefined) updates.email = input.email || null;
  if (input.birthDate !== undefined) updates.birth_date = input.birthDate || null;
  if (input.coverageType !== undefined) updates.coverage_type = input.coverageType;
  if (input.coverageName !== undefined) updates.coverage_name = input.coverageName || null;
  if (input.affiliateNumber !== undefined) updates.affiliate_number = input.affiliateNumber || null;
  if (input.notes !== undefined) updates.notes = input.notes || null;

  const { error } = await supabase
    .from("patients")
    .update(updates)
    .eq("id", id);

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[updatePatient] Supabase error:", error.code, error.message);
    }
    if (error.code === "23505") {
      if (error.message.includes("dni")) {
        throw new Error("Ya existe un paciente con ese DNI.");
      }
      if (error.message.includes("email")) {
        throw new Error("Ya existe un paciente con ese email.");
      }
    }
    throw new Error("No se pudo actualizar el paciente.");
  }
}
