import type { AppointmentFormInput } from "@/lib/schema";
import { professionalMap, specialtyMap } from "@/lib/site-data";

function getSecretaryWhatsappPhone() {
  return process.env.NEXT_PUBLIC_SECRETARY_WHATSAPP?.trim();
}

function buildWhatsappUrlWithMessage(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsappUrl(input: AppointmentFormInput) {
  const phone = getSecretaryWhatsappPhone();
  if (!phone) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[WhatsApp Config] Falta NEXT_PUBLIC_SECRETARY_WHATSAPP en .env.local");
    }
    throw new Error("El WhatsApp del consultorio no está configurado.");
  }
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

  return buildWhatsappUrlWithMessage(phone, message);
}

export function buildHeroWhatsappUrl() {
  const phone = getSecretaryWhatsappPhone();
  if (!phone) {
    return "#";
  }

  const message = [
    "Hola, quiero consultar por un turno en Onofri-Di Fulvio Odontología.",
    "",
    "Mis datos:",
    "Nombre completo:",
    "Telefono:",
    "Especialidad o motivo de consulta:",
    "Obra social / prepaga:",
    "Disponibilidad horaria:",
    "Comentarios adicionales:"
  ].join("\n");

  return buildWhatsappUrlWithMessage(phone, message);
}
