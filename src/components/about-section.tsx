"use client";

import { motion, type Variants } from "framer-motion";
import { SectionTitle } from "@/components/section-title";
import { ShieldCheck, Award, Zap, Heart, CheckCircle2 } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const features = [
  {
    icon: ShieldCheck,
    title: "Atención profesional",
    description:
      "Brindamos tratamientos odontológicos con enfoque integral, priorizando la salud, la estética y el bienestar de cada paciente.",
  },
  {
    icon: Award,
    title: "Calidad y experiencia",
    description:
      "Trabajamos con compromiso, actualización constante y materiales de calidad para lograr resultados confiables y duraderos.",
  },
  {
    icon: Zap,
    title: "Tecnología y precisión",
    description:
      "Incorporamos herramientas y procedimientos modernos para ofrecer diagnósticos más precisos y tratamientos más eficientes.",
  },
  {
    icon: Heart,
    title: "Trato humano",
    description:
      "Nos importa que cada persona se sienta acompañada, escuchada y contenida desde la primera consulta.",
  },
];

const benefits = [
  "Atención personalizada para cada caso",
  "Profesionales capacitados y en formación constante",
  "Acompañamiento cercano durante todo el tratamiento",
  "Compromiso con la comodidad y confianza del paciente",
];

export function AboutSection() {
  return (
    <section id="nosotros" className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid items-center gap-12 lg:grid-cols-2"
        >
          <motion.div variants={itemVariants} className="space-y-6">
            <SectionTitle
              eyebrow="Sobre nosotros"
              title="Odontología pensada para cuidar tu salud y tu sonrisa"
              description="Combinamos experiencia, atención cercana y tratamientos personalizados para acompañarte en cada etapa de tu cuidado bucal."
            />

            <p className="text-base leading-7 text-slate-600 md:text-lg">
              Nuestro objetivo es ofrecer una experiencia profesional, cálida y
              confiable. Creemos que una buena atención odontológica no solo se
              basa en la técnica, sino también en la escucha, la claridad y el
              acompañamiento.
            </p>

            <div className="grid gap-3 pt-2">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="text-sm text-slate-700 md:text-base">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            className="grid gap-4 sm:grid-cols-2"
          >
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}