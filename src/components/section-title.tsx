interface SectionTitleProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function SectionTitle({
  eyebrow,
  title,
  description,
}: SectionTitleProps) {
  return (
    <div className="max-w-2xl">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-teal/60">
        {eyebrow}
      </p>

      <h2 className="mb-6 font-display text-4xl leading-tight text-ink sm:text-5xl">
        {title}
      </h2>

      <p className="text-lg leading-relaxed text-ink/50">
        {description}
      </p>
    </div>
  );
}