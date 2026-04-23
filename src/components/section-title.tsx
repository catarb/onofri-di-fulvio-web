import { motion } from "framer-motion";

interface SectionTitleProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal/60 mb-4">{eyebrow}</p>
      <h2 className="font-display text-4xl sm:text-5xl text-ink leading-tight mb-6">{title}</h2>
      <p className="text-lg text-ink/50 leading-relaxed">{description}</p>
    </div>
  );
}
