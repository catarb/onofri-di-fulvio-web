export type AppointmentRecord = {
  id: string;
  createdAt: string;
  fullName: string;
  phone: string;
  email: string | null;
  consultationReason: string;
  specialtySlug: string;
  specialtyLabel: string;
  professionalSlug: string;
  professionalLabel: string;
  coverageType: "obra_social" | "particular";
  coverageName: string | null;
  coverageSummary: string;
  notes: string | null;
  dateLabel: string;
};
