"use client";

import { motion } from "framer-motion";
import { SectionTitle } from "@/components/section-title";
import { MapPin, Clock, Phone, ExternalLink, Star } from "lucide-react";

const visitData = [
  {
    icon: <MapPin size={22} className="text-current" strokeWidth={1.5} />,
    label: "Dirección",
    value: "Av. Uruguay 785, Santa Rosa",
    subValue: "L6300, La Pampa",
    href: "https://www.google.com/maps/search/?api=1&query=Av.+Uruguay+785,+Santa+Rosa,+La+Pampa"
  },
  {
    icon: <Clock size={22} className="text-current" strokeWidth={1.5} />,
    label: "Horarios de Atención",
    value: "Lun a Vie: 08:30 - 17:00 hs",
    subValue: "Atención con turno previo",
    href: "#"
  },
  {
    icon: <Phone size={22} className="text-current" strokeWidth={1.5} />,
    label: "Teléfono de Contacto",
    value: "+54 9 2954 44-9441",
    subValue: "Click para llamar",
    href: "tel:+5492954449441"
  }
];

export function ClinicSection() {
  const cardsContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardItem = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
    }
  };

  return (
    <section id="consultorio" className="section-space scroll-mt-8 bg-mist/30 py-10 sm:scroll-mt-10 sm:py-12 lg:scroll-mt-12 lg:pb-14 lg:pt-10">
      <div className="shell">
        <div className="grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <SectionTitle
              eyebrow="Contacto & Ubicación"
              title="Onofri-Di Fulvio Odontología"
              description="Visitanos en nuestro centro especializado en Santa Rosa. Un espacio diseñado para brindarte la mejor atención en un ambiente profesional y cálido."
            />

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={cardsContainer} className="mt-6 space-y-3">
              {visitData.map((item) => (
                <motion.div key={item.label} variants={cardItem} className="group glass premium-card rounded-[28px] p-4 sm:p-5">
                  <div className="flex items-center justify-between max-sm:justify-center">
                    <div className="flex items-center gap-3.5 sm:gap-4 max-sm:flex-col max-sm:text-center">
                      <div className="premium-card-icon flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-ink/60 shadow-premium group-hover:bg-aqua/10 group-hover:text-aqua">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink/30 mb-1">{item.label}</p>
                        <p className="text-base font-bold text-ink/80 leading-tight mb-1">{item.value}</p>
                        <p className="text-xs text-ink/40">{item.subValue}</p>
                      </div>
                    </div>
                    <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined} className="premium-card-icon hidden sm:flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-ink/5 text-ink/25 transition-all duration-300 hover:border-aqua hover:bg-aqua hover:text-white">
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }} className="mt-6 rounded-[34px] border-t-4 border-t-ink/20 p-5 glass consultorio-facade-card">
              <div className="flex items-center justify-between flex-wrap gap-3 max-sm:justify-center max-sm:text-center">
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={16} className="fill-ink/40 text-ink/40" />
                    ))}
                  </div>
                  <p className="text-sm font-bold text-ink/80">Confianza garantizada</p>
                  <p className="text-xs text-ink/40 mt-1">Lo que nuestros pacientes dicen en Google.</p>
                </div>
                <a href="https://www.google.com/maps/search/?api=1&query=Onofri-Di+Fulvio+Odontología+Santa+Rosa" target="_blank" rel="noopener noreferrer" className="ui-cta bg-ink text-white shadow-premium hover:bg-aqua hover:shadow-premium-hover">
                  <span>Ver Reseñas en Google</span>
                  <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="lg:sticky lg:top-24">
            <div className="relative aspect-video w-full max-w-full lg:h-[540px] lg:aspect-auto rounded-[40px] overflow-hidden shadow-premium border border-white group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3202.0465354565743!2d-64.29658422345517!3d-36.62527096695244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95c2cd17f8b91901%3A0x867375a0690069b2!2sAv.%20Uruguay%20785%2C%20L6300%20Santa%20Rosa%2C%20La%20Pampa!5e0!3m2!1ses-419!2sar!4v1713726000000!5m2!1ses-419!2sar"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale contrast-[1.1] opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              />

              <div className="absolute bottom-6 right-6 sm:hidden">
                <a href="https://www.google.com/maps/search/?api=1&query=Av.+Uruguay+785,+Santa+Rosa,+La+Pampa" target="_blank" rel="noopener noreferrer" className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-white text-teal shadow-premium">
                  <MapPin size={24} />
                </a>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 justify-center lg:justify-start px-2">
              <div className="h-2 w-2 rounded-full bg-ink/40 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/30">Fácil acceso y estacionamiento libre</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


