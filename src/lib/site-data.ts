export const professionals = [
  {
    slug: "dra-onofri",
    name: "Dra. Onofri",
    role: "Co-fundadora",
    bio: "Especialista en odontopediatría y atención integral, con enfoque cálido, cercano y preventivo para niños y familias.",
    specialties: ["Odontología integral", "Atención familiar", "Odontopediatría"],
    gradient: "from-[#efd7c8] via-[#d9a084] to-[#7c4b3f]"
  },
  {
    slug: "dr-di-fulvio",
    name: "Dr. Di Fulvio",
    role: "Co-fundador",
    bio: "Especialista en Cirugía Maxilofacial, rehabilitación oral e implantes. Enfoque preciso y resolutivo para tratamientos funcionales y estéticos.",
    specialties: ["Implantes", "Estética dental", "Casos complejos"],
    gradient: "from-[#d7e5e3] via-[#89aeb0] to-[#23555d]"
  }
] as const;

export const specialties = [
  {
    slug: "odontopediatria",
    name: "Odontopediatría",
    shortLabel: "Pediátrica",
    description: "Atención odontológica para niños, con prevención temprana, controles periódicos y acompañamiento cálido para cada etapa.",
    professional: "Dra. Onofri"
  },
  {
    slug: "odontologia-general",
    name: "Odontología general",
    shortLabel: "General",
    description: "Chequeos, diagnóstico, seguimiento preventivo y resolución integral de consultas frecuentes.",
    professional: "Dra. Onofri"
  },
  {
    slug: "rehabilitacion-oral",
    name: "Rehabilitación oral",
    shortLabel: "Rehab",
    description: "Planes de tratamiento orientados a recuperar función, estabilidad y comodidad.",
    professional: "Dra. Onofri"
  },
  {
    slug: "estetica-dental",
    name: "Estética dental",
    shortLabel: "Estética",
    description: "Blanqueamiento, armonía visual y tratamientos enfocados en mejorar la sonrisa.",
    professional: "Dr. Di Fulvio"
  },
  {
    slug: "implantes",
    name: "Implantes",
    shortLabel: "Implantes",
    description: "Evaluación, planificación y tratamiento para recuperar piezas con soluciones duraderas.",
    professional: "Dr. Di Fulvio"
  },
  {
    slug: "diseno-sonrisa",
    name: "Diseño de sonrisa",
    shortLabel: "Smile",
    description: "Abordaje funcional y estético con mirada integral sobre forma, color y proporciones.",
    professional: "Dr. Di Fulvio"
  },
  {
    slug: "consulta-integral",
    name: "Consulta integral",
    shortLabel: "Integral",
    description: "Ideal para pacientes que todavía no saben qué especialidad necesitan y quieren una primera orientación.",
    professional: "Dra. Onofri"
  }
] as const;

export const specialtyMap = Object.fromEntries(
  specialties.map((specialty) => [specialty.slug, specialty.name])
);

export const professionalMap = Object.fromEntries(
  professionals.map((professional) => [professional.slug, professional.name])
);