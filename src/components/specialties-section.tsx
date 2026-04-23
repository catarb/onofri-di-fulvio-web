"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionTitle } from "@/components/section-title";
import { specialties } from "@/lib/site-data";
import {
  Stethoscope,
  Activity,
  Heart,
  Sparkles,
  Layers,
  Smile,
  ClipboardCheck,
  User
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  "odontopediatria": <Heart size={24} strokeWidth={1} />,
  "cirugia-maxilofacial": <Layers size={24} strokeWidth={1} />,
  "ortodoncia-alineadores": <Smile size={24} strokeWidth={1} />,
  "implantes-dentales": <ClipboardCheck size={24} strokeWidth={1} />,
  "rehabilitacion-protesica": <Activity size={24} strokeWidth={1} />,
  "estetica-dental": <Sparkles size={24} strokeWidth={1} />
};

export function SpecialtiesSection() {
  const cardsContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardItem = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

  return (
    <section id="especialidades" className="section-space bg-sand/20">
      <div className="shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <SectionTitle
            eyebrow="Nuestros Servicios"
            title="Cuidado especializado para toda la familia."
            description="Combinamos formación continua y tecnología de vanguardia para ofrecerte soluciones precisas en un entorno de máxima seguridad y calma."
          />

          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-aqua/20 bg-white/70 px-4 py-2 backdrop-blur-sm">
            <div className="relative h-9 w-9 aspect-square overflow-hidden rounded-full border border-white/80 bg-white shadow-sm">
              <Image
                src="/logo-ninos.png"
                alt="Logo odontopediatría"
                fill
                className="object-contain p-1"
                sizes="36px"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-aqua/90">Área Pediátrica</span>
              <span className="text-[12px] font-medium text-ink/70">Odontopediatría</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          variants={cardsContainer}
          className="mt-20 grid gap-8 md:grid-cols-2 xl:grid-cols-3"
        >
          {specialties.map((specialty) => (
            <motion.article
              key={specialty.slug}
              variants={cardItem}
              className="group glass premium-card rounded-[40px] p-8 lg:p-10 flex flex-col overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 text-ink/[0.02] transition-transform duration-700 group-hover:scale-150 group-hover:-rotate-12 group-hover:text-ink/5">
                {iconMap[specialty.slug] || <Stethoscope size={140} />}
              </div>

              <div className="flex items-start justify-between gap-4 mb-10 relative z-10">
                <div className="premium-card-icon flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-ink/45 group-hover:bg-aqua/10 group-hover:text-aqua shadow-sm">
                  {iconMap[specialty.slug] || <Stethoscope size={26} />}
                </div>
                <span className="rounded-full bg-ink/[0.03] px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-ink/30 border border-ink/5">
                  {specialty.shortLabel}
                </span>
              </div>

              <h3 className="font-display text-2xl text-ink mb-4 group-hover:opacity-70 transition-opacity relative z-10 leading-tight">
                {specialty.name}
              </h3>

              <p className="text-sm leading-relaxed text-ink/50 mb-10 flex-grow relative z-10">
                {specialty.description}
              </p>

              <div className="mt-auto pt-8 border-t border-ink/5 flex items-center gap-4 relative z-10">
                <div className="premium-card-icon flex h-10 w-10 items-center justify-center rounded-2xl bg-sand/50 text-ink/35 group-hover:text-aqua">
                  <User size={16} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-ink/20 uppercase font-bold tracking-widest text-[8px]">Atendido por</p>
                  <p className="text-[13px] font-bold text-ink/70">{specialty.professional}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
