import type { AppointmentRecord } from "@/lib/types";
import { professionalMap, specialtyMap } from "@/lib/site-data";

export const demoAppointments: AppointmentRecord[] = [
  {
    id: "demo-1",
    createdAt: "2026-04-18T13:15:00.000Z",
    fullName: "Lucia Fernandez",
    phone: "11 4422 1100",
    email: "lucia@mail.com",
    consultationReason: "Quiero una consulta por estetica dental y evaluar blanqueamiento.",
    specialtySlug: "estetica-dental",
    specialtyLabel: specialtyMap["estetica-dental"],
    professionalSlug: "dr-difulvio",
    professionalLabel: professionalMap["dr-difulvio"],
    coverageType: "particular",
    coverageName: null,
    coverageSummary: "Particular",
    notes: "Preferencia por turnos de tarde.",
    dateLabel: "18 Abr 2026"
  },
  {
    id: "demo-2",
    createdAt: "2026-04-17T10:35:00.000Z",
    fullName: "Martin Lopez",
    phone: "11 5566 2200",
    email: null,
    consultationReason: "Necesito evaluar implantes.",
    specialtySlug: "implantes",
    specialtyLabel: specialtyMap.implantes,
    professionalSlug: "dr-difulvio",
    professionalLabel: professionalMap["dr-difulvio"],
    coverageType: "obra_social",
    coverageName: "OSDE",
    coverageSummary: "Obra social - OSDE",
    notes: "Puede asistir por la manana.",
    dateLabel: "17 Abr 2026"
  },
  {
    id: "demo-3",
    createdAt: "2026-04-16T15:20:00.000Z",
    fullName: "Valentina Sosa",
    phone: "11 6677 3300",
    email: "vale@mail.com",
    consultationReason: "Consulta integral para revisar molestias y presupuesto.",
    specialtySlug: "consulta-integral",
    specialtyLabel: specialtyMap["consulta-integral"],
    professionalSlug: "dra-onofri",
    professionalLabel: professionalMap["dra-onofri"],
    coverageType: "obra_social",
    coverageName: "Swiss Medical",
    coverageSummary: "Obra social - Swiss Medical",
    notes: "",
    dateLabel: "16 Abr 2026"
  }
];
