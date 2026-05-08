"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { ShieldCheck, Sparkles, Heart, CheckCircle2 } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

const values = [
  {
    icon: Sparkles,
    title: "Enfoque Interdisciplinario",
    text: "Abordamos cada caso desde múltiples especialidades para garantizar resultados integrales.",
  },
  {
    icon: ShieldCheck,
    title: "Calidad y Bioseguridad",
    text: "Combinamos formación continua, tecnología actual y protocolos estrictos para tu seguridad.",
  },
  {
    icon: Heart,
    title: "Base de Confianza",
    text: "Ofrecemos un trato cercano, claro y profesional durante todo el tratamiento.",
  },
];

const specialties = [
  "Ortodoncia",
  "Alineadores",
  "Ortopedia Dentomaxilar",
  "Implantes Dentales",
  "Rehabilitación Protésica",
  "Estética",
];

export function AboutSection() {
  return (
    <section
      id="nosotros"
      className="scroll-mt-8 bg-white py-12 sm:scroll-mt-10 sm:py-14 lg:scroll-mt-12 lg:pb-18 lg:pt-8"
    >
      <div className="shell">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid items-stretch gap-12 lg:grid-cols-[1fr_0.82fr]"
        >
          {/* IZQUIERDA */}
          <motion.div
            variants={containerVariants}
            className="flex h-full flex-col justify-between gap-9"
          >
            <div className="space-y-7 max-sm:text-center">
              <motion.div variants={itemVariants}>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#282829]/55">
                  Nuestra Identidad
                </p>

                <h2 className="font-display text-4xl leading-[0.95] tracking-tight text-[#282829] md:text-5xl">
                  Trayectoria, compromiso y calidez humana.
                </h2>

                <p className="mt-6 max-w-xl text-sm leading-7 text-[#282829]/55 md:text-base">
                  Somos un matrimonio de profesionales especialistas en Cirugía
                  Maxilofacial y Odontopediatría. Nuestra unión personal y
                  profesional define el criterio de excelencia de nuestro centro.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center gap-5 max-sm:justify-center">
                <div className="h-px flex-1 bg-[#282829]/10" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#282829]/35">
                  Más de 20 años de experiencia
                </p>
                <div className="h-px flex-1 bg-[#282829]/10" />
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="relative overflow-hidden rounded-[34px] bg-[#f8f9f9] p-7 shadow-[0_22px_46px_rgba(40,40,41,0.10)]"
              >
                <div className="absolute left-0 top-0 h-full w-[6px] rounded-r-full bg-[#282829]" />

                <div className="pointer-events-none absolute -right-8 -top-10 text-[180px] font-display leading-none text-[#282829]/[0.025]">
                  ”
                </div>

                <p className="relative mx-auto max-w-[520px] text-[1.72rem] italic leading-[1.18] text-[#282829]/70 max-sm:text-center">
                  “Creemos que la base de un buen tratamiento es la{" "}
                  <span className="font-semibold not-italic text-[#282829] underline decoration-[#282829]/25 underline-offset-4">
                    confianza
                  </span>
                  . Acompañamos a cada paciente durante todo el proceso con un
                  trato{" "}
                  <span className="font-semibold not-italic text-[#282829]">
                    cercano, claro y profesional.
                  </span>
                  ”
                </p>

                <div className="relative mt-7 grid gap-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#282829]/35 sm:grid-cols-3">
                  {specialties.map((item) => (
                    <div key={item} className="flex items-center gap-2 max-sm:justify-center">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#282829]/30" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* DERECHA */}
          <motion.div
            variants={containerVariants}
            className="flex h-full flex-col gap-6"
          >
            <motion.div
              variants={itemVariants}
              className="relative h-[360px] overflow-hidden rounded-[34px] shadow-[0_24px_54px_rgba(40,40,41,0.12)] lg:h-[calc(100vh-100px)] lg:min-h-[540px] lg:max-h-[820px]"
            >
              <Image
                src="/Consultorio_1.webp"
                alt="Fachada de Onofri-Di Fulvio Odontología"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 420px, 100vw"
                priority
              />
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-8 grid items-stretch gap-6 lg:grid-cols-[1fr_0.82fr]"
        >
          <motion.div
            variants={itemVariants}
            className="rounded-[30px] bg-[#f8f9f9] p-6 shadow-[0_18px_42px_rgba(40,40,41,0.10)] max-sm:text-center"
          >
            <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#282829]/40">
              Nuestros pilares
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {values.map((value) => {
                const Icon = value.icon;

                return (
                  <div
                    key={value.title}
                    className="rounded-[22px] border border-white/80 bg-white p-4 shadow-[0_10px_22px_rgba(40,40,41,0.06)]"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f4f6f6] shadow-[0_10px_22px_rgba(40,40,41,0.07)]">
                      <Icon className="h-5 w-5 text-[#282829]/45" />
                    </div>

                    <h3 className="mt-3 font-display text-[1.05rem] leading-tight text-[#282829]">
                      {value.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#282829]/55">
                      {value.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div variants={containerVariants} className="flex flex-col gap-4">
            <motion.div
              variants={itemVariants}
              className="relative h-[220px] overflow-hidden rounded-[30px] shadow-[0_20px_42px_rgba(40,40,41,0.10)]"
            >
              <Image
                src="/Consultorio_2.webp"
                alt="Interior del consultorio Onofri-Di Fulvio"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 420px, 100vw"
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="rounded-[30px] bg-[#f8f9f9] p-6 shadow-[0_18px_42px_rgba(40,40,41,0.10)] max-sm:text-center"
            >
              <div className="mb-4 h-[2px] w-12 rounded-full bg-[#282829]/15" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#282829]/40">
                Misión médica
              </p>
              <p className="mt-3 max-w-sm text-sm leading-6 text-[#282829]/60">
                Brindamos tratamientos de{" "}
                <span className="font-semibold text-[#282829]">
                  alta calidad
                </span>
                , combinando tecnología actual y bioseguridad.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}



