"use client";

import { motion } from "framer-motion";
import { SectionTitle } from "@/components/section-title";
import { professionals } from "@/lib/site-data";
import { Award, Star, Clock } from "lucide-react";

export function ProfessionalsSection() {
  const cardsContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.14
      }
    }
  };

  const cardItem = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

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
            description="Dos trayectorias especializadas que se complementan para brindarte una atenciÃ³n integral, precisa y cercana en cada etapa de tu tratamiento."
          />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.18 }}
          variants={cardsContainer}
          className="mt-20 grid gap-12 lg:gap-16 md:grid-cols-2"
        >
          {professionals.map((prof) => (
            <motion.article
              key={prof.name}
              variants={cardItem}
              className="group glass premium-card rounded-[48px] p-8 lg:p-10"
            >
              <div className="flex flex-col sm:flex-row gap-10 lg:gap-12 items-center sm:items-start text-center sm:text-left">
                <div className="relative h-48 w-48 sm:h-56 sm:w-56 shrink-0">
                  <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-ink/10 to-ink/5 rotate-6 group-hover:rotate-12 transition-transform duration-700 opacity-50" />
                  <div className="absolute inset-0 rounded-[40px] bg-white shadow-premium -rotate-3 group-hover:-rotate-6 transition-transform duration-700 border border-white/60 overflow-hidden">
                    <div className="premium-card-icon flex h-full w-full items-center justify-center text-ink/10 group-hover:text-aqua/30">
                      <Award size={80} strokeWidth={1} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col py-2">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                    <div className="flex text-ink/40">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink/30">Especialista Senior</span>
                  </div>

                  <h3 className="font-display text-3xl text-ink mb-2 leading-tight">{prof.name}</h3>
                  <p className="text-ink/60 font-bold mb-6 uppercase tracking-[0.25em] text-[10px]">{prof.role}</p>

                  <p className="text-sm leading-relaxed text-ink/50 mb-8 italic max-w-sm">
                    "{prof.bio}"
                  </p>

                  <div className="grid grid-cols-2 gap-6 mt-auto">
                    <div className="flex items-center gap-2 text-ink/40">
                      <Award size={18} className="premium-card-icon text-ink/60 group-hover:text-aqua" strokeWidth={1.5} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">{prof.specialties[0]}</span>
                    </div>
                    <div className="flex items-center gap-2 text-ink/40">
                      <Clock size={18} className="premium-card-icon text-ink/60 group-hover:text-aqua" strokeWidth={1.5} />
                      <span className="text-[11px] font-bold uppercase tracking-wider">AtenciÃ³n Lu-Vi</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
