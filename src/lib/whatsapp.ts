import type { AppointmentFormInput } from "@/lib/schema";
import { professionalMap, specialtyMap } from "@/lib/site-data";

export function buildWhatsappUrl(input: AppointmentFormInput) {
  const phone = process.env.NEXT_PUBLIC_SECRETARY_WHATSAPP || "5491100000000";
  const specialty = specialtyMap[input.specialtySlug] || input.specialtySlug;
  const professional = professionalMap[input.professionalSlug] || input.professionalSlug;

  const message = [
    "Hola, quiero solicitar un turno.",
    `Nombre: ${input.fullName}`,
    `Telefono: ${input.phone}`,
    `Email: ${input.email || "No informado"}`,
    `Motivo de consulta: ${input.consultationReason}`,
    `Especialidad: ${specialty}`,
    `Profesional elegido: ${professional}`,
    `Cobertura: ${input.coverageType === "obra_social" ? "Obra social" : "Particular"}`,
    `Obra social: ${input.coverageName || "No aplica"}`,
    `Observaciones: ${input.notes || "Sin observaciones"}`
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
