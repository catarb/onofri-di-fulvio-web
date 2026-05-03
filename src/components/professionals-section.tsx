"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SectionTitle } from "@/components/section-title";
import { professionals } from "@/lib/site-data";
import { ShieldCheck, Heart } from "lucide-react";

type ProfileStyle = {
  specialty: string;
  founder: string;
  bio: string;
  chips: string[];
  imageSrc: string;
  imageAlt: string;
  toneClass: string;
  icon: React.ReactNode;
};

const profileStyles: Record<string, ProfileStyle> = {
  "dra-onofri": {
    specialty: "Especialista en Odontopediatría",
    founder: "Co-Fundadora",
    bio: "Atención cálida y preventiva para niños, adolescentes y familias. Enfoque cercano y seguimiento integral.",
    chips: ["Odontopediatría", "Atención familiar", "Prevención"],
    imageSrc: "/dra-onofri.webp",
    imageAlt: "Dra. Onofri",
    toneClass: "border-aqua/30 bg-gradient-to-br from-white via-[#f7fbfb] to-aqua/10",
    icon: <Heart size={18} strokeWidth={1.5} />
  },
  "dr-di-fulvio": {
    specialty: "Especialista en Cirugía Maxilofacial",
    founder: "Co-Fundador",
    bio: "Especialista en cirugía maxilofacial, implantes y rehabilitación oral. Precisión clínica con enfoque funcional y estético.",
    chips: ["Implantes", "Maxilofacial", "Estética dental"],
    imageSrc: "/dr-difulvio.webp",
    imageAlt: "Dr. Di Fulvio",
    toneClass: "border-white/70 bg-gradient-to-br from-white via-[#f8f9f9] to-ink/[0.04]",
    icon: <ShieldCheck size={18} strokeWidth={1.5} />
  }
};

function ProfessionalWatermark() {
  return (
    <svg
      width="170"
      height="170"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="text-ink/[0.05]"
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

export function ProfessionalsSection() {
  return (
    <section id="profesionales" className="section-space">
      <div className="shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <SectionTitle
            eyebrow="Nuestro Equipo"
            title="Excelencia profesional con un enfoque humano."
            description="Dos especialidades que trabajan en sinergia para ofrecer tratamientos precisos, cercanos y confiables en cada etapa."
          />
        </motion.div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:gap-10">
          {professionals.map((prof, index) => {
            const style = profileStyles[prof.slug];

            return (
              <motion.a
                key={prof.name}
                href="#turno"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.06 }}
                className="group glass premium-card flex h-full cursor-pointer flex-col rounded-[42px] p-6 sm:p-7 lg:p-8"
              >
                <div className="grid items-start gap-6 sm:gap-7 lg:grid-cols-[184px_1fr] lg:gap-8">
                  <div className={`relative aspect-[4/5] w-full overflow-hidden rounded-[30px] border shadow-[0_18px_45px_rgba(15,23,32,0.14)] ${style.toneClass}`}>
                    <div className="pointer-events-none absolute -right-8 -top-8">
                      <ProfessionalWatermark />
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/10 via-white/0 to-white/20">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/80 bg-white/75 shadow-premium backdrop-blur-sm">
                        <Image
                          src="/logo-adultos.png"
                          alt="Onofri-Di Fulvio"
                          width={48}
                          height={48}
                          className="object-contain"
                        />
                      </div>
                    </div>

                    <Image
                      src={style.imageSrc}
                      alt={style.imageAlt}
                      fill
                      className="z-10 object-cover"
                      sizes="(min-width: 1024px) 184px, (min-width: 640px) 45vw, 100vw"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  <div className="flex h-full flex-col">
                    <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-ink/10 bg-white/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/50">
                      <span className="premium-card-icon text-aqua/70">{style.icon}</span>
                      <span>{style.founder}</span>
                    </div>

                    <h3 className="text-balance font-display text-[2.05rem] leading-[1.03] tracking-[-0.018em] text-ink sm:text-[2.18rem]">
                      {prof.name}
                    </h3>
                    <p className="mt-2 text-[15px] font-semibold text-ink/80">{style.specialty}</p>
                    <p className="mt-5 max-w-[52ch] text-sm leading-relaxed text-ink/65">{style.bio}</p>

                    <div className="mt-7 flex flex-wrap gap-3">
                      {style.chips.map((chip) => (
                        <span
                          key={chip}
                          className="inline-flex min-h-10 items-center justify-center rounded-full border border-ink/15 bg-white/92 px-5 py-2 text-center text-[11px] font-semibold tracking-[0.04em] text-ink transition-all duration-300 hover:border-aqua/45 hover:bg-aqua/[0.1]"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t border-ink/5 pt-4 text-[10px] font-medium uppercase tracking-[0.16em] text-ink/45">
                  Atención personalizada
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
