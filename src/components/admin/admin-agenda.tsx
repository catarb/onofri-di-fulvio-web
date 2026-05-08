"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, MessageCircle, Pencil, Plus, XCircle } from "lucide-react";
import { professionals, specialties } from "@/lib/site-data";

type ScheduledStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";

type AgendaItem = {
  id: string;
  patientId: string;
  appointmentId: string | null;
  title: string;
  startsAt: string;
  endsAt: string;
  status: ScheduledStatus;
  specialty: string | null;
  professional: string | null;
  notes: string | null;
  patient: {
    id: string;
    fullName: string;
    phone: string;
    email: string | null;
  } | null;
};

type PatientOption = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
};

export type AgendaPrefill = {
  token: number;
  patientId?: string;
  patientName?: string;
  patientPhone?: string;
  appointmentId?: string;
  appointmentLabel?: string;
  requiresPatientLink?: boolean;
  title?: string;
  specialty?: string;
  professional?: string;
  notes?: string;
};

const statusLabels: Record<ScheduledStatus, string> = {
  scheduled: "Programado",
  confirmed: "Confirmado",
  completed: "Completado",
  cancelled: "Cancelado",
  no_show: "No asistió"
};

function toLocalInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toDateInputValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getDayRange(dateInput: string) {
  const from = `${dateInput}T00:00:00`;
  const to = `${dateInput}T23:59:59`;
  return { from, to };
}

function buildPatientWhatsappUrl(phone: string, fullName: string, startsAt: string) {
  const normalized = phone.replace(/\D/g, "");
  const d = new Date(startsAt);
  const date = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
  const hour = new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false }).format(d);
  const text = encodeURIComponent(`Hola ${fullName}, te escribimos de Onofri-Di Fulvio Odontología para recordarte tu turno del ${date} a las ${hour}.`);
  return `https://wa.me/${normalized}?text=${text}`;
}

export function AdminAgenda({ prefill }: { prefill: AgendaPrefill | null }) {
  const formRef = useRef<HTMLElement | null>(null);
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ScheduledStatus>("all");
  const [selectedDate, setSelectedDate] = useState(toDateInputValue(new Date()));
  const [prefillNotice, setPrefillNotice] = useState("");
  const [linkedAppointmentLabel, setLinkedAppointmentLabel] = useState("");

  const [patientQuery, setPatientQuery] = useState("");
  const [patientOptions, setPatientOptions] = useState<PatientOption[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null);

  const now = useMemo(() => new Date(), []);
  const plusThirty = useMemo(() => new Date(now.getTime() + 30 * 60 * 1000), [now]);
  const professionalOptions = useMemo(() => professionals.map((professional) => professional.name), []);
  const specialtyOptions = useMemo(() => specialties.map((specialty) => specialty.name), []);

  const [form, setForm] = useState({
    appointmentId: "",
    title: "Turno odontológico",
    startsAt: toLocalInputValue(now),
    endsAt: toLocalInputValue(plusThirty),
    status: "scheduled" as ScheduledStatus,
    specialty: "",
    professional: "",
    notes: ""
  });

  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return items;
    return items.filter((item) => item.status === statusFilter);
  }, [items, statusFilter]);
  const selectedDateLabel = useMemo(() => {
    const d = new Date(`${selectedDate}T12:00:00`);
    return new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(d);
  }, [selectedDate]);

  function moveSelectedDate(days: number) {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setDate(d.getDate() + days);
    setSelectedDate(toDateInputValue(d));
  }

  async function loadAgenda(dateValue: string = selectedDate) {
    setLoading(true);
    try {
      const { from, to } = getDayRange(dateValue);
      const params = new URLSearchParams({
        from,
        to,
        limit: "300"
      });
      const response = await fetch(`/api/admin/scheduled-appointments?${params.toString()}`, { cache: "no-store" });
      const json = await response.json();
      if (!response.ok || !json.success) {
        setError(json.message || "No se pudieron cargar los turnos.");
        return;
      }
      setItems(json.appointments || []);
    } catch {
      setError("No se pudieron cargar los turnos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAgenda(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (!prefill) return;

    setPrefillNotice("");
    setLinkedAppointmentLabel(prefill.appointmentLabel || "");

    setForm((prev) => ({
      ...prev,
      appointmentId: prefill.appointmentId || "",
      title: prefill.title || prev.title,
      specialty: prefill.specialty || "",
      professional: prefill.professional && professionalOptions.some((name) => name === prefill.professional) ? prefill.professional : "",
      notes: prefill.notes || ""
    }));

    if (prefill.patientId) {
      const fromAgenda = items.find((i) => i.patient?.id === prefill.patientId)?.patient;
      const fromPrefill = prefill.patientName && prefill.patientPhone
        ? { id: prefill.patientId, fullName: prefill.patientName, phone: prefill.patientPhone, email: null }
        : null;
      const candidate = fromAgenda || fromPrefill;

      if (candidate) {
        setSelectedPatient(candidate);
        setPatientOptions((prev) => {
          if (prev.some((p) => p.id === candidate.id)) return prev;
          return [candidate, ...prev];
        });
      }
      return;
    }

    setSelectedPatient(null);
    if (prefill.requiresPatientLink) {
      setPrefillNotice("Primero vinculá esta solicitud a un paciente para poder agendar un turno.");
    }
  }, [prefill, items, professionalOptions, specialtyOptions]);

  async function searchPatients(q: string) {
    setPatientQuery(q);
    if (!q.trim()) {
      setPatientOptions((prev) => (selectedPatient ? [selectedPatient, ...prev.filter((p) => p.id !== selectedPatient.id)] : []));
      return;
    }
    const response = await fetch(`/api/admin/patients?q=${encodeURIComponent(q)}`, { cache: "no-store" });
    const json = await response.json();
    if (json.success) {
      const next = (json.patients || []) as PatientOption[];
      if (selectedPatient && !next.some((p) => p.id === selectedPatient.id)) {
        setPatientOptions([selectedPatient, ...next]);
      } else {
        setPatientOptions(next);
      }
    }
  }

  async function createScheduled() {
    setError("");
    setSuccess("");
    if (!selectedPatient) {
      setError("Seleccioná un paciente.");
      return;
    }
    const start = new Date(form.startsAt);
    const end = new Date(form.endsAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      setError("La hora de finalización debe ser posterior a la hora de inicio.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        patientId: selectedPatient.id,
        appointmentId: form.appointmentId || null,
        title: form.title,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        status: form.status,
        specialty: form.specialty || null,
        professional: form.professional || null,
        notes: form.notes || null
      };
      const response = await fetch(
        editingId ? `/api/admin/scheduled-appointments/${editingId}` : "/api/admin/scheduled-appointments",
        {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        setError(json.message || "No se pudo crear el turno.");
        return;
      }
      setSuccess(editingId ? "Turno actualizado correctamente." : "Turno agendado correctamente.");
      if (editingId) setEditingId(null);
      setForm({
        appointmentId: "",
        title: "Turno odontológico",
        startsAt: toLocalInputValue(now),
        endsAt: toLocalInputValue(plusThirty),
        status: "scheduled",
        specialty: "",
        professional: "",
        notes: ""
      });
      await loadAgenda();
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: ScheduledStatus) {
    const response = await fetch(`/api/admin/scheduled-appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const json = await response.json();
    if (!response.ok || !json.success) {
      setError(json.message || "No se pudo actualizar el estado del turno.");
      return;
    }
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  function startEdit(item: AgendaItem) {
    setEditingId(item.id);
    setError("");
    setSuccess("");
    setPrefillNotice("");
    setLinkedAppointmentLabel(item.appointmentId ? "Solicitud vinculada a este turno." : "");
    setSelectedPatient(item.patient);
    if (item.patient) {
      setPatientOptions((prev) => (prev.some((p) => p.id === item.patient!.id) ? prev : [item.patient!, ...prev]));
    }
    setForm({
      appointmentId: item.appointmentId || "",
      title: item.title,
      startsAt: toLocalInputValue(new Date(item.startsAt)),
      endsAt: toLocalInputValue(new Date(item.endsAt)),
      status: item.status,
      specialty: item.specialty || "",
      professional: item.professional || "",
      notes: item.notes || ""
    });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function cancelScheduled(item: AgendaItem) {
    const confirmed = window.confirm("¿Querés cancelar este turno?");
    if (!confirmed) return;
    setError("");
    setSuccess("");
    const response = await fetch(`/api/admin/scheduled-appointments/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" })
    });
    const json = await response.json();
    if (!response.ok || !json.success) {
      setError(json.message || "No se pudo cancelar el turno.");
      return;
    }
    setItems((prev) => prev.map((current) => (current.id === item.id ? { ...current, status: "cancelled" } : current)));
    setSuccess("Turno cancelado correctamente.");
  }

  return (
    <div className="space-y-6">
      <section ref={formRef} className="scroll-mt-24 rounded-[24px] border border-white/80 bg-white/70 p-6 shadow-premium-sm backdrop-blur-lg">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <input
            value={patientQuery}
            onChange={(e) => void searchPatients(e.target.value)}
            placeholder="Buscar paciente por nombre, DNI, tel, email..."
            className="rounded-xl border border-ink/[0.08] bg-white px-3 py-2 text-sm outline-none focus:border-aqua/40"
          />
          <select
            value={selectedPatient?.id || ""}
            onChange={(e) => {
              const next = patientOptions.find((p) => p.id === e.target.value) || null;
              setSelectedPatient(next);
            }}
            className="rounded-xl border border-ink/[0.08] bg-white px-3 py-2 text-sm outline-none focus:border-aqua/40"
          >
            <option value="">Paciente...</option>
            {patientOptions.map((p) => (
              <option key={p.id} value={p.id}>{p.fullName} - {p.phone}</option>
            ))}
          </select>
          <input
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Título"
            className="rounded-xl border border-ink/[0.08] bg-white px-3 py-2 text-sm outline-none focus:border-aqua/40"
          />
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">Inicio del turno</span>
            <input
              type="datetime-local"
              value={form.startsAt}
              onChange={(e) => setForm((prev) => ({ ...prev, startsAt: e.target.value }))}
              className="w-full rounded-xl border border-ink/[0.08] bg-white px-3 py-2 text-sm outline-none focus:border-aqua/40"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">Fin del turno</span>
            <input
              type="datetime-local"
              value={form.endsAt}
              onChange={(e) => setForm((prev) => ({ ...prev, endsAt: e.target.value }))}
              className="w-full rounded-xl border border-ink/[0.08] bg-white px-3 py-2 text-sm outline-none focus:border-aqua/40"
            />
          </label>
          <select
            value={form.specialty}
            onChange={(e) => setForm((prev) => ({ ...prev, specialty: e.target.value }))}
            className="rounded-xl border border-ink/[0.08] bg-white px-3 py-2 text-sm outline-none focus:border-aqua/40"
          >
            <option value="">Sin especialidad</option>
            {specialtyOptions.map((specialtyName) => (
              <option key={specialtyName} value={specialtyName}>{specialtyName}</option>
            ))}
            {form.specialty && !specialtyOptions.some((name) => name === form.specialty) ? (
              <option value={form.specialty}>{form.specialty}</option>
            ) : null}
          </select>
          <select
            value={form.professional}
            onChange={(e) => setForm((prev) => ({ ...prev, professional: e.target.value }))}
            className="rounded-xl border border-ink/[0.08] bg-white px-3 py-2 text-sm outline-none focus:border-aqua/40"
          >
            <option value="">Profesional...</option>
            {professionalOptions.map((professionalName) => (
              <option key={professionalName} value={professionalName}>{professionalName}</option>
            ))}
          </select>
          <select
            value={form.status}
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as ScheduledStatus }))}
            className="rounded-xl border border-ink/[0.08] bg-white px-3 py-2 text-sm outline-none focus:border-aqua/40"
          >
            <option value="scheduled">Programado</option>
            <option value="confirmed">Confirmado</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
            <option value="no_show">No asistió</option>
          </select>
        </div>

        {form.appointmentId ? (
          <p className="mt-3 rounded-xl border border-ink/[0.08] bg-white px-3 py-2 text-sm text-ink/70">
            {linkedAppointmentLabel || "Solicitud vinculada a este turno."}
          </p>
        ) : null}

        <textarea
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          rows={2}
          placeholder="Notas del turno..."
          className="mt-3 w-full rounded-xl border border-ink/[0.08] bg-white px-3 py-2 text-sm outline-none focus:border-aqua/40"
        />

        {prefillNotice ? <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{prefillNotice}</p> : null}
        {error ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
        {success ? <p className="mt-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p> : null}

        <button
          disabled={saving}
          onClick={() => void createScheduled()}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : editingId ? <Pencil size={14} /> : <Plus size={14} />}
          {editingId ? "Guardar cambios" : "Crear turno"}
        </button>
        {editingId ? (
          <button
            disabled={saving}
            onClick={() => {
              setEditingId(null);
              setError("");
              setSuccess("");
            }}
            className="mt-4 ml-2 inline-flex items-center gap-2 rounded-xl border border-ink/[0.12] bg-white px-4 py-2 text-sm font-semibold text-ink/70 disabled:opacity-60"
          >
            <XCircle size={14} />
            Cancelar edición
          </button>
        ) : null}
      </section>

      <section className="rounded-[24px] border border-white/80 bg-white/70 p-6 shadow-premium-sm backdrop-blur-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-xl text-ink">Turnos del día</h3>
            <p className="mt-1 text-sm capitalize text-ink/55">{selectedDateLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedDate(toDateInputValue(new Date()))}
              className="inline-flex items-center gap-1 rounded-lg border border-ink/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-ink/70 hover:border-aqua/30 hover:text-aqua"
            >
              <CalendarDays size={14} />
              Hoy
            </button>
            <button
              onClick={() => moveSelectedDate(-1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink/[0.08] bg-white text-ink/70 hover:border-aqua/30 hover:text-aqua"
              title="Día anterior"
            >
              <ChevronLeft size={14} />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-ink/[0.08] bg-white px-2 py-1.5 text-xs font-semibold text-ink/70"
            />
            <button
              onClick={() => moveSelectedDate(1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink/[0.08] bg-white text-ink/70 hover:border-aqua/30 hover:text-aqua"
              title="Día siguiente"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { value: "all" as const, label: "Todos" },
            { value: "scheduled" as const, label: "Programados" },
            { value: "confirmed" as const, label: "Confirmados" },
            { value: "completed" as const, label: "Completados" },
            { value: "cancelled" as const, label: "Cancelados" },
            { value: "no_show" as const, label: "No asistió" }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === option.value
                  ? "border-aqua/40 bg-aqua/10 text-aqua"
                  : "border-ink/[0.08] bg-white text-ink/60 hover:border-aqua/20 hover:text-aqua"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="py-8"><Loader2 className="animate-spin text-aqua" size={24} /></div>
        ) : filteredItems.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">
            {statusFilter === "all"
              ? "No hay turnos agendados para este día."
              : "No hay turnos para este estado en el día seleccionado."}
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {filteredItems.map((item) => (
              <div key={item.id} className={`rounded-xl border p-4 ${item.status === "cancelled" ? "border-ink/[0.06] bg-white/60 opacity-75" : "border-ink/[0.08] bg-white"}`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.patient?.fullName || "Paciente"} · {item.title}</p>
                    <p className="text-xs text-ink/50">
                      {new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(item.startsAt))}
                      {" - "}
                      {new Intl.DateTimeFormat("es-AR", { hour: "2-digit", minute: "2-digit" }).format(new Date(item.endsAt))}
                    </p>
                    <p className="mt-1 text-xs text-ink/50">{item.specialty || "Sin especialidad"} · {item.professional || "Sin profesional"}</p>
                    {item.patient?.phone ? <p className="mt-1 text-xs text-ink/50">Tel: {item.patient.phone}</p> : null}
                    {item.notes ? <p className="mt-1 text-xs italic text-ink/55">{item.notes}</p> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(e) => void updateStatus(item.id, e.target.value as ScheduledStatus)}
                      className="rounded-lg border border-ink/[0.08] bg-white px-2 py-1 text-xs font-semibold text-ink/70"
                    >
                      <option value="scheduled">{statusLabels.scheduled}</option>
                      <option value="confirmed">{statusLabels.confirmed}</option>
                      <option value="completed">{statusLabels.completed}</option>
                      <option value="cancelled">{statusLabels.cancelled}</option>
                      <option value="no_show">{statusLabels.no_show}</option>
                    </select>
                    {item.patient?.phone ? (
                      <a
                        href={buildPatientWhatsappUrl(item.patient.phone, item.patient.fullName, item.startsAt)}
                        target="_blank"
                        rel="noreferrer"
                        title="Contactar por WhatsApp"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink/[0.08] text-ink/60 transition-all hover:border-[#25D366]/30 hover:bg-[#25D366]/5 hover:text-[#1f7d45]"
                      >
                        <MessageCircle size={14} />
                      </a>
                    ) : null}
                    <button
                      onClick={() => startEdit(item)}
                      title="Editar turno"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink/[0.08] text-ink/60 transition-all hover:border-aqua/30 hover:bg-aqua/5 hover:text-aqua"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => void cancelScheduled(item)}
                      title="Cancelar turno"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ink/[0.08] text-ink/60 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
