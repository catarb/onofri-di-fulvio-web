"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, ShieldCheck, Heart, Sparkles, Phone } from "lucide-react";
import { Counter } from "@/components/counter";

const highlights = [
  {
    icon: <ShieldCheck className="text-aqua/70" size={22} strokeWidth={1.2} />,
    title: "Garantía de Calidad",
    text: "Materiales premium y técnicas avaladas."
  },
  {
    icon: <Heart className="text-aqua/70" size={22} strokeWidth={1.2} />,
    title: "Atención Cercana",
    text: "Escuchamos tus necesidades reales."
  },
  {
    icon: <Sparkles className="text-aqua/70" size={22} strokeWidth={1.2} />,
    title: "Estética Natural",
    text: "Resultados armónicos y duraderos."
  }
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-hero-radial pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pb-36">
      <div className="absolute inset-x-0 top-14 h-[28rem] bg-[radial-gradient(circle_at_center,rgba(40,40,41,0.04),transparent_70%)] pointer-events-none" />

      <div className="shell relative">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1fr] lg:gap-x-16">
          <div className="flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-aqua/20 bg-aqua/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-aqua"
            >
              <Sparkles size={14} />
              <span>Odontología de Vanguardia en Santa Rosa, La Pampa</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="mt-9 max-w-[17ch] font-display text-5xl leading-[1.03] text-balance sm:text-7xl lg:text-8xl text-ink"
            >
              Sonrisas cuidadas con <span className="italic font-normal text-aqua/70">precisión, calma</span> y una experiencia distinta.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-12 max-w-[52ch] text-base sm:text-lg leading-relaxed text-ink/60"
            >
              Onofri-Di Fulvio Odontología combina odontología integral, estética sobria y un trato humano cercano. Diseñamos una experiencia ágil y confiable desde el primer contacto.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, x: 16 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="w-full max-w-[580px] self-start lg:ml-auto"
          >
            <div className="flex flex-col gap-7 sm:gap-8">
              <div className="relative aspect-[4/3] w-full">
                <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-aqua/10 via-sand to-aqua/5 shadow-premium opacity-60" />
                <div className="absolute inset-0 rounded-[40px] bg-white/95 p-8 sm:p-10 border border-white/70 shadow-glow overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.02] pointer-events-none translate-x-1/4 -translate-y-1/4">
                    <Sparkles size={220} />
                  </div>

                  <div className="relative z-10 flex flex-col gap-6 sm:gap-8">
                    <div className="grid grid-cols-2 gap-6 sm:gap-8 border-b border-ink/5 pb-6 sm:pb-8">
                      <div className="flex flex-col">
                        <div className="text-4xl sm:text-5xl font-display text-aqua mb-2 flex items-baseline">
                          <Counter value={20} suffix="+" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/30">Años de trayectoria</p>
                      </div>
                      <div className="flex flex-col">
                        <div className="text-4xl sm:text-5xl font-display text-ink mb-2 flex items-baseline">
                          <Counter value={500} suffix="+" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/30">Pacientes anuales</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-display text-2xl sm:text-3xl leading-tight text-balance text-ink/80 italic font-light">
                        Una sola forma de entender la odontología: <span className="text-aqua/80 font-medium not-italic">con excelencia.</span>
                      </h3>
                      <p className="text-[11px] text-ink/40 font-medium tracking-tight">Confianza que trasciende generaciones</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <motion.div
                  whileHover={{ y: -6 }}
                  className="premium-card rounded-[24px] border border-white/70 bg-white/85 p-6 flex items-center gap-4 shadow-premium"
                >
                  <div className="premium-card-icon h-12 w-12 rounded-2xl bg-aqua/8 flex items-center justify-center text-aqua">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/30 mb-1">Seguridad</p>
                    <p className="text-[15px] font-bold text-ink">Bioseguridad 100%</p>
                    <p className="text-[12px] text-ink/50">Protocolos médicos</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -6 }}
                  className="premium-card rounded-[24px] border border-white/70 bg-white/85 p-6 flex items-center gap-4 shadow-premium"
                >
                  <div className="premium-card-icon h-12 w-12 rounded-2xl bg-ink/[0.04] flex items-center justify-center text-ink/45">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/30 mb-1">Próximo Turno</p>
                    <p className="text-[15px] font-bold text-ink">Hoy disponible</p>
                    <p className="text-[12px] text-ink/50">Reserva inmediata</p>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.8 }}
                className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:items-center"
              >
                <Link
                  href="/solicitar-turno"
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-ink px-9 py-4 text-sm font-bold text-white shadow-premium hover:bg-aqua hover:shadow-premium-hover transition-all active:scale-95"
                >
                  <Calendar size={18} />
                  <span>Reservar Turno Online</span>
                  <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href="https://wa.me/your-number"
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-ink/10 bg-white/45 px-9 py-4 text-sm font-bold text-ink/80 backdrop-blur-sm transition hover:bg-white/70 hover:border-aqua/20 hover:text-ink active:scale-95"
                >
                  <Phone size={18} className="text-aqua" />
                  <span>WhatsApp</span>
                </a>
              </motion.div>

              <div className="border-t border-ink/5 pt-7">
                <div className="grid gap-4 sm:grid-cols-3 sm:gap-4">
                  {highlights.map((item) => (
                    <motion.div
                      key={item.title}
                      whileHover={{ y: -4 }}
                      className="premium-card rounded-[20px] border border-white/70 bg-white/70 p-4 backdrop-blur-sm shadow-premium"
                    >
                      <div className="premium-card-icon mb-2">{item.icon}</div>
                      <p className="text-sm font-bold text-ink/80">{item.title}</p>
                      <p className="mt-1 text-xs text-ink/45 leading-relaxed">{item.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
