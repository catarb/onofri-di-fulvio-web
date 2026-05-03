"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import {
  Calendar,
  User,
  Phone,
  CheckCircle2,
  Smile,
  Clock,
  ChevronDown,
  ChevronRight,
  Loader2,
  ShieldCheck
} from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, "Por favor, ingresá tu nombre completo"),
  phone: z.string().min(8, "Ingresá un número de contacto válido"),
  specialty: z.string().min(1, "Seleccioná una especialidad"),
  message: z.string().optional(),
  insurance: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function AppointmentForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    setSubmitError("");
    const specialtySlugMap: Record<string, string> = {
      odontopediatria: "odontopediatria",
      general: "odontologia-general",
      estetica: "estetica-dental",
      implantes: "implantes",
      ortodoncia: "consulta-integral"
    };

    const specialtySlug = specialtySlugMap[data.specialty] || "consulta-integral";
    const professionalSlug =
      specialtySlug === "implantes" || specialtySlug === "estetica-dental"
        ? "dr-difulvio"
        : "dra-onofri";

    const payload = {
      fullName: data.name,
      phone: data.phone,
      email: "",
      consultationReason:
        data.message?.trim() ||
        data.notes?.trim() ||
        "Solicitud de turno desde formulario web.",
      specialtySlug,
      professionalSlug,
      coverageType: data.insurance?.trim() ? "obra_social" : "particular",
      coverageName: data.insurance?.trim() || "",
      notes: data.notes?.trim() || ""
    };

    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const json = await response.json();
    if (!response.ok || !json.success) {
      setSubmitError(json.message || "No se pudo enviar la solicitud.");
      return;
    }

    if (json.whatsappUrl) {
      window.open(json.whatsappUrl, "_blank", "noopener,noreferrer");
    }

    setIsSubmitted(true);
  };

  const Field = ({ label, error, children, icon }: any) => (
    <div className="space-y-2">
      <label className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink/40">
        {icon && <span className="opacity-60">{icon}</span>} {label}
      </label>
      {children}
      {error && <p className="ml-1 text-[10px] font-medium text-red-500">{error}</p>}
    </div>
  );

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[500px] flex-col items-center justify-center rounded-[40px] bg-white p-8 text-center shadow-glow sm:p-12"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal/10 text-teal">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="mb-4 font-display text-3xl text-ink">¡Solicitud enviada!</h3>
        <p className="max-w-sm text-sm leading-relaxed text-ink/60">
          Gracias por confiar en Onofri-Di Fulvio. Nos pondremos en contacto con vos a la brevedad para confirmar el día y horario de tu cita.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="ui-cta mt-10 border border-ink/10 text-ink hover:bg-ink hover:text-white"
        >
          Volver al formulario
        </button>
      </motion.div>
    );
  }

  return (
    <div className="rounded-[40px] border border-white/50 bg-white p-8 shadow-glow sm:p-12">
      <div className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="text-teal" size={18} />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal/60">Reserva Online</p>
        </div>
        <h2 className="font-display text-4xl text-ink">Solicitá tu turno</h2>
        <p className="mt-4 text-sm leading-relaxed text-ink/50">
          Completá tus datos y un especialista se contactará con vos en minutos.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Nombre completo" error={errors.name?.message} icon={<User size={14} strokeWidth={1} />}>
            <input
              {...register("name")}
              type="text"
              placeholder="Ej. Juan Pérez"
              className="w-full cursor-text rounded-2xl border border-ink/10 bg-soft-gray/50 px-5 py-4 text-sm outline-none transition-all hover:border-aqua/40 focus:border-aqua focus:ring-4 focus:ring-aqua/10"
            />
          </Field>

          <Field label="Teléfono" error={errors.phone?.message} icon={<Phone size={14} strokeWidth={1} />}>
            <input
              {...register("phone")}
              type="tel"
              placeholder="Ej. +54 9 11 ..."
              className="w-full cursor-text rounded-2xl border border-ink/10 bg-soft-gray/50 px-5 py-4 text-sm outline-none transition-all hover:border-aqua/40 focus:border-aqua focus:ring-4 focus:ring-aqua/10"
            />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Especialidad" error={errors.specialty?.message} icon={<Smile size={14} strokeWidth={1} />}>
            <div className="relative">
              <select
                {...register("specialty")}
                className="w-full cursor-pointer appearance-none rounded-2xl border border-ink/10 bg-soft-gray/50 px-5 py-4 text-sm outline-none transition-all hover:border-aqua/40 focus:border-aqua focus:ring-4 focus:ring-aqua/10"
              >
                <option value="">Seleccioná una opción</option>
                <option value="odontopediatria">Odontopediatría</option>
                <option value="general">Odontología General</option>
                <option value="estetica">Estética Dental</option>
                <option value="implantes">Implantes</option>
                <option value="ortodoncia">Ortodoncia</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-ink/20" size={16} strokeWidth={1} />
            </div>
          </Field>

          <Field label="Obra social / prepaga" error={errors.insurance?.message} icon={<ShieldCheck size={14} strokeWidth={1} />}>
            <input
              {...register("insurance")}
              type="text"
              className="w-full cursor-text rounded-2xl border border-ink/10 bg-soft-gray/50 px-5 py-4 text-sm outline-none transition-all hover:border-aqua/40 focus:border-aqua focus:ring-4 focus:ring-aqua/10"
              placeholder="Ej: OSDE"
            />
          </Field>
        </div>

        <Field label="Observaciones adicionales" error={errors.notes?.message} icon={<Calendar size={14} strokeWidth={1} />}>
          <textarea
            {...register("notes")}
            rows={2}
            className="w-full cursor-text resize-none rounded-2xl border border-ink/10 bg-white px-5 py-4 shadow-sm outline-none transition-all hover:border-aqua/40 focus:border-aqua focus:ring-4 focus:ring-aqua/10"
            placeholder="Horarios preferidos, urgencia, comentarios"
          />
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="ui-cta group relative mt-4 flex w-full cursor-pointer overflow-hidden bg-ink text-white shadow-premium hover:bg-teal hover:shadow-premium-hover disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <Calendar size={20} />
              <span>Reservar y abrir WhatsApp</span>
              <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        {submitError ? <p className="text-center text-xs font-medium text-rose-600">{submitError}</p> : null}

        <p className="flex items-center justify-center gap-2 text-center text-[10px] font-medium text-ink/30">
          <Clock size={12} /> Atención rápida personalizada vía WhatsApp.
        </p>
      </form>
    </div>
  );
}
