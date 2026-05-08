import { appointmentFormSchema, type AppointmentFormInput } from "@/lib/schema";
import { professionalMap, specialtyMap } from "@/lib/site-data";
import { getSupabasePublicClient, hasSupabaseConfig } from "@/lib/supabase";

export async function createAppointment(input: AppointmentFormInput) {
  const parsed = appointmentFormSchema.parse(input);

  if (!hasSupabaseConfig()) {
    return {
      id: `demo-${Date.now()}`,
      mode: "demo" as const
    };
  }

  // Usamos el cliente público (Anon) para respetar las políticas RLS de inserción
  const supabase = getSupabasePublicClient();
  const { error } = await supabase
    .from("appointments")
    .insert({
      full_name: parsed.fullName,
      phone: parsed.phone,
      email: parsed.email || null,
      consultation_reason: parsed.consultationReason,
      specialty_slug: parsed.specialtySlug,
      specialty_label: specialtyMap[parsed.specialtySlug] || parsed.specialtySlug,
      professional_slug: parsed.professionalSlug,
      professional_label: professionalMap[parsed.professionalSlug] || parsed.professionalSlug,
      coverage_type: parsed.coverageType,
      coverage_name: parsed.coverageName || null,
      notes: parsed.notes || null,
      status: "nuevo" // Forzamos el estado inicial desde el servidor
    });

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error creating appointment:", error);
    }
    throw new Error("No se pudo guardar la consulta en la base.");
  }

  // Devolvemos éxito con un ID generado localmente ya que no tenemos permisos de SELECT
  return {
    id: `app-${Date.now()}`,
    mode: "supabase" as const
  };
}
