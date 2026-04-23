"use client";

import { motion } from "framer-motion";
import { SectionTitle } from "@/components/section-title";
import { ShieldCheck, Award, Zap, Heart, CheckCircle2 } from "lucide-react";

const values = [
  {
    icon: <Zap className="text-ink/60" size={22} strokeWidth={1.5} />,
    title: "Enfoque Interdisciplinario",
    text: "Abordamos cada caso desde múltiples especialidades para garantizar resultados integrales y duraderos."
  },
  {
    icon: <ShieldCheck className="text-ink/60" size={22} strokeWidth={1.5} />,
    title: "Calidad y Bioseguridad",
    text: "Combinamos formación continua, tecnología actual y los más estrictos protocolos para tu seguridad."
  },
  {
    icon: <Heart className="text-ink/60" size={22} strokeWidth={1.5} />,
    title: "Base de Confianza",
    text: "Ofrecemos un trato cercano, claro y profesional, acompañándote en cada paso de tu tratamiento."
  }
];

const specialtiesList = [
  "Ortodoncia", "Alineadores", "Ortopedia Dentomaxilar",
  "Implantes dentales", "Rehabilitación protésica", "Estética"
];

export function AboutSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section id="nosotros" className="section-space overflow-hidden bg-white/50">
      <div className="shell">
        <div className="grid gap-14 lg:gap-16 lg:grid-cols-[1.1fr_0.9fr] items-start lg:items-stretch">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="flex h-full flex-col gap-14 lg:gap-16"
          >
            <motion.div variants={itemVariants}>
              <SectionTitle
                eyebrow="Nuestra Identidad"
                title="Trayectoria, compromiso y calidez humana."
                description="Somos un matrimonio de profesionales especialistas en Cirugía Maxilofacial y Odontopediatría. Nuestra unión personal y profesional define el criterio de excelencia de nuestro centro."
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="relative"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="h-[1px] flex-grow bg-ink/5" />
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/40">Más de 20 años de experiencia</span>
                <div className="h-[1px] flex-grow bg-ink/5" />
              </div>

              <div className="p-8 lg:p-12 glass rounded-[56px] border-l-8 border-l-ink shadow-premium-hover relative overflow-hidden">
                <div className="absolute -top-10 -right-10 p-12 opacity-[0.02] pointer-events-none rotate-12">
                   <Award size={320} />
                </div>

                <p className="text-2xl lg:text-3xl text-ink/80 leading-snug font-light italic">
                  “Creemos que la base de un buen tratamiento es la <span className="text-ink font-medium not-italic underline decoration-ink/20 underline-offset-8">confianza</span>. Acompañamos a cada paciente durante todo el proceso con un trato <span className="text-ink font-medium not-italic">cercano, claro y profesional</span>.”
                </p>

                <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4">
                   {specialtiesList.map((spec) => (
                     <div key={spec} className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-ink/40 shrink-0" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-ink/40">{spec}</span>
                     </div>
                   ))}
                </div>
              </div>
            </motion.div>

            <div className="grid gap-8 md:gap-10 md:grid-cols-3 md:auto-rows-fr">
              {values.map((item) => (
                <motion.article
                  key={item.title}
                  variants={itemVariants}
                  className="group flex h-full flex-col"
                >
                  <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-[24px] bg-white shadow-premium group-hover:shadow-premium-hover group-hover:-translate-y-1 transition-all duration-500">
                    {item.icon}
                  </div>
                  <h3 className="font-display text-xl text-ink leading-tight mb-4 group-hover:opacity-70 transition-opacity">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-ink/50">{item.text}</p>
                </motion.article>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-full self-start lg:self-stretch"
          >
            <div className="flex h-full flex-col gap-8 lg:grid lg:grid-rows-[minmax(0,1.55fr)_minmax(0,1fr)_auto] lg:gap-6">
              <div className="aspect-[4/5] lg:aspect-auto lg:h-full rounded-[72px] about-facade-panel overflow-hidden relative shadow-premium border border-white/60" />

              <div className="aspect-[4/3] lg:aspect-auto lg:h-full rounded-[44px] about-facade-panel-secondary overflow-hidden shadow-premium border border-white/60" />

              <div className="glass w-full rounded-[40px] p-8 sm:p-10 border border-white/70 shadow-premium-hover">
                <div className="h-1 w-12 bg-ink/20 rounded-full mb-6" />
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-ink/60 mb-4">Misión Médica</p>
                <p className="text-base text-ink/75 leading-relaxed font-light">
                  Brindamos tratamientos de <span className="text-ink font-medium">alta calidad</span>, combinando tecnología actual y bioseguridad.
                </p>
                <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-ink/10 bg-white/65 px-4 py-2">
                  <div className="h-8 w-8 rounded-full bg-sand flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-ink/25" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-ink/45">Formación Continua</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

