"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Plus, Search, X, Edit2, User, Phone, Mail, Shield, ArrowLeft, MessageCircle, ExternalLink } from "lucide-react";

type PatientCoverageType = "particular" | "obra_social" | "prepaga";

type Patient = {
  id: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  dni: string | null;
  phone: string;
  email: string | null;
  birthDate: string | null;
  coverageType: PatientCoverageType | null;
  coverageName: string | null;
  affiliateNumber: string | null;
  notes: string | null;
};

type LinkedAppointment = {
  id: string;
  createdAt: string;
  specialtyLabel: string;
  professionalLabel: string;
  coverageType: "obra_social" | "particular" | null;
  coverageName: string | null;
  notes: string | null;
  status: "nuevo" | "contactado" | "aceptado" | "rechazado";
};

type PatientDetail = {
  patient: Patient;
  appointments: LinkedAppointment[];
};

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatCoverage(coverageType: PatientCoverageType | null, coverageName: string | null, affiliateNumber: string | null) {
  if (coverageType === "particular" || !coverageType) return "Particular";
  const label = coverageType === "obra_social" ? "Obra Social" : "Prepaga";
  if (affiliateNumber) return `${label} - ${affiliateNumber}`;
  return coverageName || label;
}

function getCoverageSearchTerms(coverageType: PatientCoverageType | null, coverageName: string | null) {
  const terms: string[] = [];
  if (coverageType) {
    terms.push(coverageType);
    if (coverageType === "particular") terms.push("particular");
    if (coverageType === "obra_social") {
      terms.push("obra social");
      terms.push("obra_social");
    }
    if (coverageType === "prepaga") terms.push("prepaga");
  }
  if (coverageName) terms.push(coverageName);
  return terms.join(" ").toLowerCase();
}

function buildPatientWhatsappUrl(phone: string, fullName: string) {
  const normalized = phone.replace(/\D/g, "");
  const text = encodeURIComponent(`Hola ${fullName}, te escribimos de Onofri-Di Fulvio Odontología.`);
  return `https://wa.me/${normalized}?text=${text}`;
}

export function AdminPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [globalSuccess, setGlobalSuccess] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientDetail, setPatientDetail] = useState<PatientDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    dni: "",
    phone: "",
    email: "",
    birthDate: "",
    coverageType: "particular" as PatientCoverageType,
    coverageName: "",
    affiliateNumber: "",
    notes: ""
  });

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const params = query ? `?q=${encodeURIComponent(query)}` : "";
      const response = await fetch(`/api/admin/patients${params}`, { cache: "no-store" });
      const json = await response.json();
      if (json.success) {
        setPatients(json.patients || []);
      }
    } catch (e) {
      console.error("Error loading patients:", e);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadPatients();
    }
  }, [query]);

  useEffect(() => {
    if (!globalSuccess) return;
    const timeout = setTimeout(() => {
      setGlobalSuccess("");
    }, 3500);
    return () => clearTimeout(timeout);
  }, [globalSuccess]);

  const resetForm = () => {
    setFormData({
      fullName: "",
      dni: "",
      phone: "",
      email: "",
      birthDate: "",
      coverageType: "particular",
      coverageName: "",
      affiliateNumber: "",
      notes: ""
    });
    setFormError("");
    setFormSuccess("");
  };

  const resetFormFeedback = () => {
    setFormError("");
    setFormSuccess("");
    setFormLoading(false);
  };

  const closeFormModal = () => {
    resetFormFeedback();
    setEditingPatient(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setGlobalSuccess("");
    resetForm();
    resetFormFeedback();
    setEditingPatient(null);
    setShowForm(true);
  };

  const openEdit = (patient: Patient) => {
    setGlobalSuccess("");
    resetFormFeedback();
    setFormData({
      fullName: patient.fullName,
      dni: patient.dni || "",
      phone: patient.phone,
      email: patient.email || "",
      birthDate: patient.birthDate || "",
      coverageType: patient.coverageType || "particular",
      coverageName: patient.coverageName || "",
      affiliateNumber: patient.affiliateNumber || "",
      notes: patient.notes || ""
    });
    setEditingPatient(patient);
    setShowForm(true);
  };

  const openPatientDetail = async (patientId: string) => {
    setSelectedPatientId(patientId);
    setDetailLoading(true);
    setDetailError("");
    try {
      const response = await fetch(`/api/admin/patients/${patientId}`, { cache: "no-store" });
      const json = await response.json();
      if (json.success) {
        setPatientDetail({ patient: json.patient, appointments: json.appointments || [] });
      } else {
        setDetailError(json.message || "No se pudo cargar la ficha del paciente.");
      }
    } catch {
      setDetailError("No se pudo cargar la ficha del paciente.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closePatientDetail = () => {
    setSelectedPatientId(null);
    setPatientDetail(null);
    setDetailError("");
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setFormLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        dni: formData.dni || undefined,
        phone: formData.phone,
        email: formData.email || undefined,
        birthDate: formData.birthDate || undefined,
        coverageType: formData.coverageType,
        coverageName: formData.coverageType !== "particular" ? (formData.coverageName || undefined) : undefined,
        affiliateNumber: formData.coverageType !== "particular" ? (formData.affiliateNumber || undefined) : undefined,
        notes: formData.notes || undefined
      };

      let response;
      if (editingPatient) {
        response = await fetch(`/api/admin/patients/${editingPatient.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch("/api/admin/patients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const json = await response.json();

      if (json.success) {
        const successMessage = editingPatient
          ? "Paciente actualizado correctamente"
          : "Paciente creado correctamente";
        setFormSuccess(successMessage);
        setGlobalSuccess(successMessage);
        setTimeout(() => {
          closeFormModal();
          loadPatients();
          if (editingPatient && selectedPatientId === editingPatient.id) {
            void openPatientDetail(editingPatient.id);
          }
        }, 1000);
      } else {
        setFormError(json.message || "Error al guardar.");
      }
    } catch (e) {
      setFormError("Error de conexión.");
    }

    setFormLoading(false);
  };

  const filteredPatients = useMemo(() => {
    if (!query.trim()) return patients;
    const q = query.toLowerCase();
    return patients.filter(p =>
      p.fullName.toLowerCase().includes(q) ||
      p.dni?.toLowerCase().includes(q) ||
      p.phone.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      getCoverageSearchTerms(p.coverageType, p.coverageName).includes(q)
    );
  }, [patients, query]);

  return (
    <>
      <div className="w-full">
      <section className="mb-6 flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 w-full flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            value={query}
            onChange={(e) => {
              setGlobalSuccess("");
              setQuery(e.target.value);
            }}
            placeholder="Buscar por nombre, DNI, teléfono, email u obra social..."
            className="peer w-full rounded-[14px] border border-ink/[0.06] bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-all focus:border-aqua/40 focus:ring-4 focus:ring-aqua/10"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openCreate}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-ink/90 hover:shadow-premium-sm sm:w-auto"
        >
          <Plus size={16} />
          Nuevo paciente
        </motion.button>
      </section>

      {globalSuccess && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {globalSuccess}
        </div>
      )}

      {selectedPatientId ? (
        <section className="rounded-[24px] border border-white/80 bg-white/70 p-6 shadow-premium-sm backdrop-blur-lg">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={closePatientDetail}
              className="inline-flex items-center gap-2 rounded-xl border border-ink/[0.08] bg-white px-3 py-2 text-sm font-semibold text-ink/60 transition-all hover:border-aqua/30 hover:text-aqua"
            >
              <ArrowLeft size={14} />
              Volver al listado
            </button>
            {patientDetail?.patient ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => openEdit(patientDetail.patient)}
                  className="inline-flex items-center gap-2 rounded-xl border border-ink/[0.08] bg-white px-3 py-2 text-sm font-semibold text-ink/60 transition-all hover:border-aqua/30 hover:text-aqua"
                >
                  <Edit2 size={14} />
                  Editar paciente
                </button>
                <a
                  href={buildPatientWhatsappUrl(patientDetail.patient.phone, patientDetail.patient.fullName)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#25D366]/30 bg-[#25D366]/5 px-3 py-2 text-sm font-semibold text-[#1f7d45] transition-all hover:bg-[#25D366]/10"
                >
                  <MessageCircle size={14} />
                  WhatsApp
                </a>
              </div>
            ) : null}
          </div>

          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-aqua" size={24} />
            </div>
          ) : detailError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{detailError}</p>
          ) : patientDetail ? (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem label="Nombre completo" value={patientDetail.patient.fullName} />
                <DetailItem label="Teléfono" value={patientDetail.patient.phone} />
                <DetailItem label="Email" value={patientDetail.patient.email || "No informado"} />
                <DetailItem label="DNI" value={patientDetail.patient.dni || "No informado"} />
                <DetailItem label="Fecha de nacimiento" value={patientDetail.patient.birthDate ? formatDate(patientDetail.patient.birthDate) : "No informada"} />
                <DetailItem label="Cobertura" value={formatCoverage(patientDetail.patient.coverageType, patientDetail.patient.coverageName, patientDetail.patient.affiliateNumber)} />
                <DetailItem label="N° afiliado" value={patientDetail.patient.affiliateNumber || "No informado"} />
                <DetailItem label="Fecha de alta" value={formatDate(patientDetail.patient.createdAt)} />
                <DetailItem label="Última actualización" value={formatDate(patientDetail.patient.updatedAt)} />
              </div>
              <DetailItem label="Observaciones" value={patientDetail.patient.notes || "Sin observaciones"} fullWidth />

              <div>
                <h3 className="mb-3 font-display text-xl text-ink">Solicitudes vinculadas</h3>
                {patientDetail.appointments.length === 0 ? (
                  <p className="rounded-xl border border-ink/[0.08] bg-white px-4 py-3 text-sm text-ink/60">
                    Este paciente todavía no tiene solicitudes vinculadas.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {patientDetail.appointments.map((item) => (
                      <div key={item.id} className="rounded-xl border border-ink/[0.08] bg-white p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-semibold text-ink">{formatDate(item.createdAt)} · {item.specialtyLabel}</p>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-ink/[0.04] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink/50">{item.status}</span>
                            <a
                              href={buildPatientWhatsappUrl(patientDetail.patient.phone, patientDetail.patient.fullName)}
                              target="_blank"
                              rel="noreferrer"
                              title="Contactar por WhatsApp"
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-ink/[0.08] text-ink/60 transition-all hover:border-[#25D366]/30 hover:bg-[#25D366]/5 hover:text-[#1f7d45]"
                            >
                              <MessageCircle size={14} />
                            </a>
                          </div>
                        </div>
                        <p className="mt-1 text-xs text-ink/50">
                          {item.professionalLabel || "Profesional no informado"} · {item.coverageName || (item.coverageType === "obra_social" ? "Obra social" : "Particular")}
                        </p>
                        <p className="mt-2 text-sm text-ink/60">{item.notes || "Sin observaciones en la solicitud."}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </section>
      ) : !mounted ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-aqua" size={24} />
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-aqua" size={24} />
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="rounded-[24px] border border-white/80 bg-white/60 p-12 text-center shadow-premium-sm">
          <User size={48} className="mx-auto mb-4 text-ink/20" />
          <p className="text-lg font-medium text-ink/60">
            {query ? "No se encontraron pacientes." : "Todavía no hay pacientes registrados."}
          </p>
          <p className="mt-2 text-sm text-ink/40">
            {!query && "Creá el primer paciente del consultorio."}
          </p>
        </div>
      ) : (
        <div className="mx-auto grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredPatients.map((patient) => (
            <motion.article
              key={patient.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="group relative flex h-full min-h-[220px] flex-col cursor-pointer rounded-[24px] border border-white/80 bg-white/70 p-5 shadow-premium-sm backdrop-blur-lg transition-all hover:bg-white hover:shadow-premium"
            >
              <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => void openPatientDetail(patient.id)}
                  title="Ver ficha"
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-ink/[0.06] bg-white text-ink/40 transition-all hover:border-aqua/30 hover:bg-aqua/5 hover:text-aqua"
                >
                  <ExternalLink size={14} />
                </button>
                <button
                  onClick={() => openEdit(patient)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-ink/[0.06] bg-white text-ink/40 transition-all hover:border-aqua/30 hover:bg-aqua/5 hover:text-aqua"
                >
                  <Edit2 size={14} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-aqua/10">
                  <User size={20} className="text-aqua" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="truncate text-base font-bold text-ink">{patient.fullName}</h3>
                  <p className="text-xs text-ink/40">{formatDate(patient.createdAt)}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-ink/60">
                  <Phone size={12} className="text-ink/30" />
                  <span className="font-mono">{patient.phone}</span>
                </div>
                {patient.email && (
                  <div className="flex items-center gap-2 text-sm text-ink/60">
                    <Mail size={12} className="text-ink/30" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                )}
                {patient.dni && (
                  <div className="flex items-center gap-2 text-sm text-ink/60">
                    <Shield size={12} className="text-ink/30" />
                    <span>DNI: {patient.dni}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-ink/60">
                  <Shield size={12} className="text-ink/30" />
                  <span>{formatCoverage(patient.coverageType, patient.coverageName, patient.affiliateNumber)}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/35 p-4 sm:items-center" onClick={closeFormModal}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-[28px] border border-ink/10 bg-white p-6 shadow-glow"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl text-ink">
                  {editingPatient ? "Editar paciente" : "Nuevo paciente"}
                </h2>
                <button
                  onClick={closeFormModal}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-ink/5"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/30">Nombre completo *</label>
                  <input
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    minLength={2}
                    placeholder="Nombre y apellido"
                    className="mt-1 w-full rounded-xl border border-ink/[0.06] bg-white px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-aqua/40"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/30">Teléfono *</label>
                    <input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      minLength={8}
                      placeholder="Teléfono"
                      className="mt-1 w-full rounded-xl border border-ink/[0.06] bg-white px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-aqua/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/30">DNI</label>
                    <input
                      value={formData.dni}
                      onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                      placeholder="DNI (opcional)"
                      className="mt-1 w-full rounded-xl border border-ink/[0.06] bg-white px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-aqua/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/30">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email (opcional)"
                    className="mt-1 w-full rounded-xl border border-ink/[0.06] bg-white px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-aqua/40"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/30">Fecha de nacimiento</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-ink/[0.06] bg-white px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-aqua/40"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/30">Tipo de cobertura</label>
                  <select
                    value={formData.coverageType}
                    onChange={(e) => setFormData({ ...formData, coverageType: e.target.value as PatientCoverageType })}
                    className="mt-1 w-full rounded-xl border border-ink/[0.06] bg-white px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-aqua/40"
                  >
                    <option value="particular">Particular</option>
                    <option value="obra_social">Obra Social</option>
                    <option value="prepaga">Prepaga</option>
                  </select>
                </div>

                {formData.coverageType !== "particular" && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/30">
                        {formData.coverageType === "obra_social" ? "Obra Social" : "Prepaga"}
                      </label>
                      <input
                        value={formData.coverageName}
                        onChange={(e) => setFormData({ ...formData, coverageName: e.target.value })}
                        placeholder="Nombre"
                        className="mt-1 w-full rounded-xl border border-ink/[0.06] bg-white px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-aqua/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/30">Número de afiliado</label>
                      <input
                        value={formData.affiliateNumber}
                        onChange={(e) => setFormData({ ...formData, affiliateNumber: e.target.value })}
                        placeholder="Número"
                        className="mt-1 w-full rounded-xl border border-ink/[0.06] bg-white px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-aqua/40"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/30">Observaciones</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    placeholder="Notas adicionales (opcional)"
                    className="mt-1 w-full rounded-xl border border-ink/[0.06] bg-white px-4 py-2.5 text-sm text-ink outline-none transition-all focus:border-aqua/40 resize-none"
                  />
                </div>

                {formError && (
                  <p className="text-sm text-red-500">{formError}</p>
                )}
                {formSuccess && (
                  <p className="text-sm text-green-600">{formSuccess}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeFormModal}
                    className="flex-1 rounded-xl border border-ink/10 px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-50"
                  >
                    {formLoading && <Loader2 size={14} className="animate-spin" />}
                    {editingPatient ? "Actualizar" : "Crear paciente"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function DetailItem({ label, value, fullWidth = false }: { label: string; value: string; fullWidth?: boolean }) {
  return (
    <div className={`rounded-xl border border-ink/[0.08] bg-white p-4 ${fullWidth ? "sm:col-span-2 lg:col-span-3" : ""}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink/35">{label}</p>
      <p className="mt-1 text-sm text-ink/70">{value}</p>
    </div>
  );
}
