"use client";

import { motion } from "framer-motion";

const faqs = [
  {
    question: "¿Cómo solicito un turno?",
    answer:
      "Podés completar el formulario online en esta web. Al finalizar, se abrirá tu WhatsApp con los datos listos para enviar a nuestra secretaría y confirmar el horario."
  },
  {
    question: "¿Atienden obras sociales?",
    answer:
      "Trabajamos de forma particular y con algunas coberturas específicas. Te recomendamos consultarnos vía WhatsApp con tu carnet para confirmarte el alcance de tu plan."
  },
  {
    question: "¿Dónde se encuentra el consultorio?",
    answer:
      "Estamos ubicados en Av. Uruguay 785, Santa Rosa, La Pampa. Contamos con fácil acceso y estacionamiento en la zona para tu comodidad."
  }
];

export function FaqSection() {
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
    <section className="pt-12 pb-14 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20">
      <div className="shell">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={cardsContainer}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
        >
          {faqs.map((faq) => (
            <motion.article
              key={faq.question}
              variants={cardItem}
              className="glass premium-card rounded-[32px] p-8 lg:p-10 flex flex-col group"
            >
              <div className="mb-6 h-1 w-12 bg-aqua/25 rounded-full group-hover:w-16 group-hover:bg-aqua transition-all duration-300" />
              <h3 className="font-display text-2xl text-ink leading-tight">{faq.question}</h3>
              <p className="mt-6 text-[15px] leading-relaxed text-ink/50">{faq.answer}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}


