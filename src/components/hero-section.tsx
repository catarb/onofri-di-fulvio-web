"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, ShieldCheck, Heart, Sparkles, Smile } from "lucide-react";
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
    <section className="relative overflow-hidden bg-hero-radial pb-24 pt-20 sm:pb-32 sm:pt-28 lg:pb-36">
      <div className="pointer-events-none absolute inset-x-0 top-14 h-[28rem] bg-[radial-gradient(circle_at_center,rgba(40,40,41,0.04),transparent_70%)]" />

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
              className="mt-9 max-w-[17ch] text-balance font-display text-5xl leading-[1.01] tracking-[-0.015em] text-ink sm:text-7xl lg:text-8xl"
            >
              Sonrisas cuidadas con <span className="font-normal italic text-aqua/70">precisión, calma</span> y una experiencia distinta.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-10 max-w-[50ch] text-base leading-relaxed text-ink/60 sm:text-lg"
            >
              Onofri-Di Fulvio Odontología combina odontología integral, estética sobria y un trato humano cercano. Diseñamos una experiencia ágil y confiable desde el primer contacto.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, x: 16 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="w-full max-w-[572px] self-start lg:ml-auto"
          >
            <div className="flex flex-col gap-7 sm:gap-8">
              <div className="relative aspect-[4/3] w-full">
                <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-aqua/10 via-sand to-aqua/5 opacity-60 shadow-premium" />
                <div className="absolute inset-0 overflow-hidden rounded-[40px] border border-white/70 bg-white/95 p-8 shadow-glow sm:p-10">
                  <div className="pointer-events-none absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 p-10 opacity-[0.02]">
                    <Sparkles size={220} />
                  </div>

                  <div className="relative z-10 grid h-full gap-6 md:gap-7 lg:grid-cols-[1fr_236px]">
                    <div className="flex flex-col justify-center gap-6 sm:gap-8">
                      <div className="grid grid-cols-2 gap-6 border-b border-ink/5 pb-6 sm:gap-8 sm:pb-8">
                        <div className="flex flex-col">
                          <div className="mb-2 flex items-baseline font-display text-4xl text-aqua sm:text-5xl">
                            <Counter value={20} suffix="+" />
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/30">Años de trayectoria</p>
                        </div>
                        <div className="flex flex-col">
                          <div className="mb-2 flex items-baseline font-display text-4xl text-ink sm:text-5xl">
                            <Counter value={500} suffix="+" />
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/30">Pacientes anuales</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-display text-2xl font-light italic leading-tight text-balance text-ink/80 sm:text-3xl">
                          Una sola forma de entender la odontología: <span className="not-italic font-medium text-aqua/80">con excelencia.</span>
                        </h3>
                        <p className="text-[11px] font-medium tracking-tight text-ink/40">Confianza que trasciende generaciones</p>
                      </div>
                    </div>

                    <div className="relative self-center h-[280px] overflow-hidden rounded-[30px] bg-white shadow-[0_14px_28px_rgba(40,40,41,0.10)] md:h-[320px] lg:h-[360px]">
                      <Image
                        src="/Consultorio_3.webp"
                        alt="Consultorio Onofri-Di Fulvio"
                        fill
                        className="origin-center object-cover object-[58%_50%] scale-[1.78]"
                        sizes="236px"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <motion.div whileHover={{ y: -6 }} className="premium-card flex cursor-pointer items-center gap-4 rounded-[24px] border border-white/70 bg-white/85 p-6 shadow-premium">
                  <div className="premium-card-icon flex h-12 w-12 items-center justify-center rounded-2xl bg-aqua/8 text-aqua">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/30">Seguridad</p>
                    <p className="text-[15px] font-bold text-ink">Bioseguridad 100%</p>
                    <p className="text-[12px] text-ink/50">Protocolos odontológicos</p>
                  </div>
                </motion.div>

                <motion.div whileHover={{ y: -6 }} className="premium-card flex cursor-pointer items-center gap-4 rounded-[24px] border border-white/70 bg-white/85 p-6 shadow-premium">
                  <div className="premium-card-icon flex h-12 w-12 items-center justify-center rounded-2xl bg-ink/[0.04] text-ink/45">
                    <Calendar size={22} />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/30">Próximo Turno</p>
                    <p className="text-[15px] font-bold text-ink">Hoy disponible</p>
                    <p className="text-[12px] text-ink/50">Reserva inmediata</p>
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.8 }}
                className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row sm:items-center sm:justify-center"
              >
                <Link href="/solicitar-turno" className="ui-cta group relative w-full bg-ink text-white shadow-premium hover:bg-aqua hover:shadow-premium-hover sm:w-auto">
                  <span className="grid grid-cols-[18px_auto_18px] items-center gap-3">
                    <Calendar size={18} />
                    <span>Reservar Turno Online</span>
                    <span aria-hidden className="h-4 w-4" />
                  </span>
                  <ChevronRight size={16} className="absolute right-5 top-1/2 -translate-y-1/2 transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href="https://wa.me/your-number"
                  className="ui-cta w-full border border-ink/10 bg-white/45 text-ink/80 backdrop-blur-sm hover:border-aqua/20 hover:bg-white/70 hover:text-ink sm:w-auto"
                >
                  <Smile size={18} className="text-aqua" />
                  <span>WhatsApp</span>
                </a>
              </motion.div>

              <div className="border-t border-ink/5 pt-7">
                <div className="grid gap-4 sm:grid-cols-3 sm:gap-4">
                  {highlights.map((item) => (
                    <motion.div
                      key={item.title}
                      whileHover={{ y: -4 }}
                      className="premium-card rounded-[20px] border border-white/70 bg-white/70 p-4 shadow-premium backdrop-blur-sm"
                    >
                      <div className="premium-card-icon mb-2">{item.icon}</div>
                      <p className="text-sm font-bold text-ink/80">{item.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-ink/45">{item.text}</p>
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


