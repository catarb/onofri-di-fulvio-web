"use client";

import { motion } from "framer-motion";
import { SectionTitle } from "@/components/section-title";
import { specialties } from "@/lib/site-data";
import {
  Sparkles,
  Heart,
  Smile,
  ShieldCheck,
  ScanFace,
  BadgeCheck,
  CircleCheck
} from "lucide-react";

function ToothWatermark() {
  return (
    <svg
      width="132"
      height="132"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M8.2 3.5C6 3.5 4.2 5.3 4.2 7.5c0 1.9.8 3.6 1.8 5.1.8 1.2 1.3 2.5 1.6 3.9l.3 1.4c.1.5.5.8 1 .8.4 0 .8-.3.9-.7l.5-2.1c.2-.9 1-1.5 1.9-1.5s1.7.6 1.9 1.5l.5 2.1c.1.4.5.7.9.7.5 0 .9-.3 1-.8l.3-1.4c.3-1.4.8-2.7 1.6-3.9 1-1.5 1.8-3.2 1.8-5.1 0-2.2-1.8-4-4-4-.9 0-1.8.3-2.6.8-.9.6-2.1.6-3 0-.8-.5-1.7-.8-2.6-.8z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const iconMap: Record<string, React.ReactNode> = {
  odontopediatria: <Heart size={24} strokeWidth={1.2} />,
  "odontologia-general": <Smile size={24} strokeWidth={1.2} />,
  "rehabilitacion-oral": <CircleCheck size={24} strokeWidth={1.2} />,
  "estetica-dental": <Sparkles size={24} strokeWidth={1.2} />,
  implantes: <ShieldCheck size={24} strokeWidth={1.2} />,
  "diseno-sonrisa": <ScanFace size={24} strokeWidth={1.2} />
};

const watermarkIcon = <ToothWatermark />;

const orderedSlugs = [
  "odontopediatria",
  "odontologia-general",
  "rehabilitacion-oral",
  "estetica-dental",
  "implantes",
  "diseno-sonrisa"
] as const;

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

  const orderedSpecialties = orderedSlugs
    .map((slug) => specialties.find((specialty) => specialty.slug === slug))
    .filter((specialty): specialty is (typeof specialties)[number] => Boolean(specialty));

  return (
    <section id="especialidades" className="section-space bg-sand/20 py-12 sm:py-16 lg:py-20">
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

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-ink/55 max-sm:mx-auto max-sm:text-center">
            Incluye atención especializada para niños, adultos y tratamientos integrales.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          variants={cardsContainer}
          className="mt-8 grid gap-4 md:grid-cols-2 lg:mt-10 lg:gap-5 xl:grid-cols-3"
        >
          {orderedSpecialties.map((specialty) => {
            const isPediatric = specialty.slug === "odontopediatria";

            return (
              <motion.a
                key={specialty.slug}
                href="#turno"
                variants={cardItem}
                className={`group glass premium-card rounded-[36px] p-5 lg:p-6 flex h-full cursor-pointer flex-col overflow-hidden max-sm:items-center max-sm:text-center ${
                  isPediatric ? "border border-aqua/25 shadow-[0_24px_55px_rgba(95,183,191,0.18)]" : ""
                }`}
              >
                <div className="pointer-events-none absolute -right-7 -top-7 text-ink/[0.04] transition-all duration-500 ease-out group-hover:scale-110 group-hover:text-ink/[0.07]">
                  {watermarkIcon}
                </div>

                <div className="relative z-10 mb-5 flex w-full items-center justify-between gap-3 max-sm:justify-center max-sm:gap-2">
                  <div
                    className={`premium-card-icon flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${
                      isPediatric
                        ? "bg-aqua/12 text-aqua"
                        : "bg-white/95 text-ink/70 group-hover:bg-aqua/12 group-hover:text-aqua"
                    }`}
                  >
                    {iconMap[specialty.slug] || <Smile size={26} />}
                  </div>
                  <span className="ui-chip min-h-7 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em]">
                    {specialty.shortLabel}
                  </span>
                </div>

                <h3 className="relative z-10 mb-2.5 font-display text-[1.65rem] leading-tight text-ink transition-opacity group-hover:opacity-70">
                  {specialty.name}
                </h3>

                <p className="relative z-10 mb-5 flex-grow text-sm leading-relaxed text-ink/50">
                  {specialty.description}
                </p>

                <div className="relative z-10 mt-auto flex items-center gap-3 border-t border-ink/5 pt-5 max-sm:justify-center">
                  <div className="premium-card-icon flex h-9 w-9 items-center justify-center rounded-2xl bg-sand/50 text-ink/45 group-hover:text-aqua">
                    <BadgeCheck size={16} strokeWidth={1.5} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[8px] font-bold uppercase tracking-widest text-ink/20">Atendido por</p>
                    <p className="text-[13px] font-bold text-ink/70">{specialty.professional}</p>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}




