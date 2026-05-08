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

export const patientFormSchema = z
  .object({
    fullName: z.string().min(1, "Nombre obligatorio.").min(2, "Nombre muy corto."),
    dni: z.string().optional(),
    phone: z.string().min(1, "Teléfono obligatorio.").min(8, "Teléfono muy corto."),
    email: z.union([z.literal(""), z.string().email("Email inválido.")]).optional(),
    birthDate: z.string().optional(),
    coverageType: z.enum(["particular", "obra_social", "prepaga"]).optional().default("particular"),
    coverageName: z.string().optional(),
    affiliateNumber: z.string().optional(),
    notes: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (data.coverageType !== "particular" && !data.coverageName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["coverageName"],
        message: "Indica la obra social o prepaga."
      });
    }
  });

export type PatientFormInput = z.infer<typeof patientFormSchema>;
