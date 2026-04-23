import { z } from "zod";

export const appointmentFormSchema = z
  .object({
    fullName: z.string().min(3, "Ingresa nombre y apellido."),
    phone: z.string().min(8, "Ingresa un telefono valido."),
    email: z.union([z.literal(""), z.string().email("Ingresa un email valido.")]),
    consultationReason: z.string().min(8, "Contanos brevemente el motivo de consulta."),
    specialtySlug: z.string().min(1, "Selecciona una especialidad."),
    professionalSlug: z.string().min(1, "Selecciona un profesional."),
    coverageType: z.enum(["obra_social", "particular"], {
      errorMap: () => ({ message: "Selecciona tu tipo de cobertura." })
    }),
    coverageName: z.string().optional().default(""),
    notes: z.string().optional().default("")
  })
  .superRefine((value, ctx) => {
    if (value.coverageType === "obra_social" && !value.coverageName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["coverageName"],
        message: "Indica cual es tu obra social."
      });
    }
  });

export type AppointmentFormInput = z.infer<typeof appointmentFormSchema>;
