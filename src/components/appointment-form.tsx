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
  Stethoscope,
  Clock,
  ChevronDown,
  ChevronRight,
  Loader2,
  Shield
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
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    console.log(data);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitted(true);
  };

  const Field = ({ label, error, children, icon }: any) => (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest text-ink/40 ml-1 flex items-center gap-2">
        {icon && <span className="opacity-60">{icon}</span>} {label}
      </label>
      {children}
      {error && <p className="text-[10px] text-red-500 font-medium ml-1">{error}</p>}
    </div>
  );

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[500px] flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-[40px] shadow-glow"
      >
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal/10 text-teal">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="font-display text-3xl text-ink mb-4">¡Solicitud Enviada!</h3>
        <p className="text-sm text-ink/60 max-w-sm leading-relaxed">
          Gracias por confiar en Onofri & Difulvio. Nos pondremos en contacto con vos a la brevedad para confirmar el día y horario de tu cita.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="mt-10 rounded-full border border-ink/10 px-8 py-3 text-sm font-bold text-ink hover:bg-ink hover:text-white transition-all"
        >
          Volver al formulario
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white p-8 sm:p-12 rounded-[40px] shadow-glow border border-white/50">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
           <Calendar className="text-teal" size={18} />
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal/60">Reserva Online</p>
        </div>
        <h2 className="font-display text-4xl text-ink">Solicitá tu turno</h2>
        <p className="mt-4 text-sm text-ink/50 leading-relaxed">
          Completá tus datos y un especialista se contactará con vos en minutos.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Nombre Completo" error={errors.name?.message} icon={<User size={14} strokeWidth={1} />}>
            <input
              {...register("name")}
              type="text"
              placeholder="Ej. Juan Pérez"
              className="w-full rounded-2xl border border-ink/5 bg-soft-gray/50 px-5 py-4 text-sm outline-none transition-all focus:border-teal focus:ring-4 focus:ring-teal/5"
            />
          </Field>

          <Field label="Teléfono" error={errors.phone?.message} icon={<Phone size={14} strokeWidth={1} />}>
            <input
              {...register("phone")}
              type="tel"
              placeholder="Ej. +54 9 11 ..."
              className="w-full rounded-2xl border border-ink/5 bg-soft-gray/50 px-5 py-4 text-sm outline-none transition-all focus:border-teal focus:ring-4 focus:ring-teal/5"
            />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Especialidad" error={errors.specialty?.message} icon={<Stethoscope size={14} strokeWidth={1} />}>
            <div className="relative">
              <select
                {...register("specialty")}
                className="w-full appearance-none rounded-2xl border border-ink/5 bg-soft-gray/50 px-5 py-4 text-sm outline-none transition-all focus:border-teal focus:ring-4 focus:ring-teal/5"
              >
                <option value="">Seleccioná una opción</option>
                <option value="general">Odontología General</option>
                <option value="estetica">Estética Dental</option>
                <option value="implantes">Implantes</option>
                <option value="ortodoncia">Ortodoncia</option>
              </select>
              <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-ink/20 pointer-events-none" size={16} strokeWidth={1} />
            </div>
          </Field>

          <Field label="Obra Social / Prepaga" error={errors.insurance?.message} icon={<Shield size={14} strokeWidth={1} />}>
             <input
              {...register("insurance")}
              type="text"
              className="w-full rounded-2xl border border-ink/5 bg-soft-gray/50 px-5 py-4 text-sm outline-none transition-all focus:border-teal focus:ring-4 focus:ring-teal/5"
              placeholder="Ej: OSDE"
            />
          </Field>
        </div>

        <Field label="Observaciones adicionales" error={errors.notes?.message} icon={<Calendar size={14} strokeWidth={1} />}>
          <textarea
            {...register("notes")}
            rows={2}
            className="w-full rounded-2xl border border-ink/5 bg-white px-5 py-4 outline-none transition-all focus:border-teal focus:ring-4 focus:ring-teal/5 shadow-sm resize-none"
            placeholder="Horarios preferidos, urgencia, comentarios"
          />
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative mt-4 flex items-center justify-center gap-3 overflow-hidden rounded-full bg-ink px-8 py-5 text-sm font-bold text-white shadow-premium hover:bg-teal hover:shadow-premium-hover transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
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

        <p className="text-center text-[10px] font-medium text-ink/30 flex items-center justify-center gap-2">
          <Clock size={12} /> Atención rápida personalizada vía WhatsApp.
        </p>
      </form>
    </div>
  );
}
