export const professionals = [
  {
    slug: "dra-onofri",
    name: "Dra. Onofri",
    role: "Co-fundadora",
    bio: "Perfil enfocado en odontologia integral, rehabilitacion funcional y un acompanamiento calmo durante todo el tratamiento.",
    specialties: ["Odontologia general", "Rehabilitacion oral", "Consultas integrales"],
    gradient: "from-[#efd7c8] via-[#d9a084] to-[#7c4b3f]"
  },
  {
    slug: "dr-difulvio",
    name: "Dr. Difulvio",
    role: "Co-fundador",
    bio: "Enfoque en diagnostico preciso, tratamientos esteticos y resolucion ordenada de consultas de media y alta complejidad.",
    specialties: ["Estetica dental", "Implantes", "Diseno de sonrisa"],
    gradient: "from-[#d7e5e3] via-[#89aeb0] to-[#23555d]"
  }
] as const;

export const specialties = [
  {
    slug: "odontologia-general",
    name: "Odontologia general",
    shortLabel: "General",
    description: "Chequeos, diagnostico, seguimiento preventivo y resolucion integral de consultas frecuentes.",
    professional: "Dra. Onofri"
  },
  {
    slug: "rehabilitacion-oral",
    name: "Rehabilitacion oral",
    shortLabel: "Rehab",
    description: "Planes de tratamiento orientados a recuperar funcion, estabilidad y comodidad.",
    professional: "Dra. Onofri"
  },
  {
    slug: "estetica-dental",
    name: "Estetica dental",
    shortLabel: "Estetica",
    description: "Blanqueamiento, armonia visual y tratamientos enfocados en mejorar la sonrisa.",
    professional: "Dr. Difulvio"
  },
  {
    slug: "implantes",
    name: "Implantes",
    shortLabel: "Implantes",
    description: "Evaluacion, planificacion y tratamiento para recuperar piezas con soluciones duraderas.",
    professional: "Dr. Difulvio"
  },
  {
    slug: "diseno-sonrisa",
    name: "Diseno de sonrisa",
    shortLabel: "Smile",
    description: "Abordaje funcional y estetico con mirada integral sobre forma, color y proporciones.",
    professional: "Dr. Difulvio"
  },
  {
    slug: "consulta-integral",
    name: "Consulta integral",
    shortLabel: "Integral",
    description: "Ideal para pacientes que todavia no saben que especialidad necesitan y quieren una primera orientacion.",
    professional: "Dra. Onofri"
  }
] as const;

export const specialtyMap = Object.fromEntries(
  specialties.map((specialty) => [specialty.slug, specialty.name])
);

export const professionalMap = Object.fromEntries(
  professionals.map((professional) => [professional.slug, professional.name])
);
