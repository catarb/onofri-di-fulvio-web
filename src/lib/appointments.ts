import { appointmentFormSchema, type AppointmentFormInput } from "@/lib/schema";
import { professionalMap, specialtyMap } from "@/lib/site-data";
import { getSupabaseAdminClient, hasSupabaseConfig } from "@/lib/supabase";

export async function createAppointment(input: AppointmentFormInput) {
  const parsed = appointmentFormSchema.parse(input);

  if (!hasSupabaseConfig()) {
    return {
      id: `demo-${Date.now()}`,
      mode: "demo" as const
    };
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
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
      notes: parsed.notes || null
    })
    .select("id")
    .single();

  if (error) {
    throw new Error("No se pudo guardar la consulta en la base.");
  }

  return {
    id: data.id as string,
    mode: "supabase" as const
  };
}
