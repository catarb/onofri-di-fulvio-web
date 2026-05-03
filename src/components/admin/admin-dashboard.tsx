"use client";

import { useMemo, useState } from "react";
import type { AdminAppointment, AppointmentStatus } from "@/lib/admin-appointments";
import { ExternalLink, Loader2, LogOut, MessageCircle, Search } from "lucide-react";
import { Counter } from "@/components/counter";

type Filters = {
  status: "todos" | AppointmentStatus;
  specialty: string;
  from: string;
  to: string;
};

const statusOptions: Array<{ value: Filters["status"]; label: string }> = [
  { value: "todos", label: "Todos" },
  { value: "nuevo", label: "Nuevas" },
  { value: "contactado", label: "Contactadas" },
  { value: "aceptado", label: "Aceptadas" },
  { value: "rechazado", label: "Rechazadas" }
];

const statusBadgeClass: Record<AppointmentStatus, string> = {
  nuevo: "bg-[#fcfaf7] text-[#918163] border-[#f2ece1]",
  contactado: "bg-[#f4f9ff] text-[#5b7ea6] border-[#e1edf8]",
  aceptado: "bg-[#f0fbf7] text-[#488e7b] border-[#daf2ea]",
  rechazado: "bg-[#fcfafa] text-[#b87676] border-[#f5e6e6]"
};

export function AdminDashboard({ initialAppointments }: { initialAppointments: AdminAppointment[] }) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<AdminAppointment | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>({
    status: "todos",
    specialty: "todas",
    from: "",
    to: ""
  });

  const specialties = useMemo(() => {
    const unique = new Map<string, string>();
    for (const item of initialAppointments) {
      unique.set(item.specialtySlug, item.specialtyLabel);
    }
    return Array.from(unique.entries());
  }, [initialAppointments]);

  const visibleAppointments = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return appointments;
    return appointments.filter((item) => item.fullName.toLowerCase().includes(q) || item.phone.toLowerCase().includes(q));
  }, [appointments, query]);

  const metrics = useMemo(() => {
    const total = appointments.length;
    const byStatus = {
      nuevo: appointments.filter((item) => item.status === "nuevo").length,
      contactado: appointments.filter((item) => item.status === "contactado").length,
      aceptado: appointments.filter((item) => item.status === "aceptado").length,
      rechazado: appointments.filter((item) => item.status === "rechazado").length
    };

    return { total, ...byStatus };
  }, [appointments]);

  async function loadAppointments(nextFilters: Filters) {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (nextFilters.status !== "todos") params.set("status", nextFilters.status);
    if (nextFilters.specialty !== "todas") params.set("specialty", nextFilters.specialty);
    if (nextFilters.from) params.set("from", nextFilters.from);
    if (nextFilters.to) params.set("to", nextFilters.to);

    const response = await fetch(`/api/admin/appointments?${params.toString()}`, { cache: "no-store" });
    const json = await response.json();

    if (json.success) {
      setAppointments(json.appointments);
    }

    setIsLoading(false);
  }

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    setStatusUpdatingId(id);
    const response = await fetch("/api/admin/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });

    if (response.ok) {
      setAppointments((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
      setSelected((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
    }

    setStatusUpdatingId(null);
  }

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8f8f6] pb-16 pt-8">
      {/* Background Decor */}
      <div className="pointer-events-none absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-aqua/5 blur-[120px]" />
      <div className="pointer-events-none absolute -right-[5%] top-[20%] h-[400px] w-[400px] rounded-full bg-aqua/3 blur-[100px]" />

      <div className="shell relative z-10">
        <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-4xl tracking-tight text-ink">Panel Administrativo</h1>
            <p className="mt-2 text-base text-ink/40">Gestión de solicitudes y seguimiento de pacientes</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-2 text-xs font-medium text-ink/40 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua/50 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-aqua"></span>
              </span>
              Actividad en tiempo real
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-full border border-ink/[0.08] bg-white px-5 py-2.5 text-sm font-medium text-ink/60 transition-all hover:border-ink/20 hover:text-ink hover:shadow-premium-sm active:scale-95">
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </div>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Total", value: metrics.total },
            { label: "Nuevas", value: metrics.nuevo },
            { label: "Contactadas", value: metrics.contactado },
            { label: "Aceptadas", value: metrics.aceptado },
            { label: "Rechazadas", value: metrics.rechazado }
          ].map((card) => (
            <article key={card.label} className="group relative overflow-hidden rounded-[24px] border border-white/80 bg-white/70 p-7 shadow-premium-sm backdrop-blur-lg transition-all duration-500 hover:-translate-y-2 hover:bg-white hover:shadow-premium">
              {/* Top Glow Line */}
              <div className="absolute inset-x-0 top-0 h-[3px] bg-aqua/20 shadow-[0_0_15px_rgba(100,181,173,0)] transition-all duration-500 group-hover:bg-aqua group-hover:shadow-[0_0_15px_rgba(100,181,173,0.5)]" />
              
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink/30 transition-colors group-hover:text-aqua/60">{card.label}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <Counter 
                  value={card.value} 
                  className="font-display text-5xl font-medium tracking-tight text-ink transition-transform duration-500 group-hover:scale-110" 
                />
              </div>
            </article>
          ))}
        </section>

        <section className="mt-12 border-b border-ink/[0.03] pb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35 transition-colors peer-focus:text-aqua/60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="peer w-full rounded-[14px] border border-ink/[0.06] bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-all focus:border-aqua/40 focus:ring-4 focus:ring-aqua/10"
            />
          </label>
          <select
            value={filters.status}
            onChange={(e) => {
              const next = { ...filters, status: e.target.value as Filters["status"] };
              setFilters(next);
              void loadAppointments(next);
            }}
            className="rounded-[14px] border border-ink/[0.06] bg-white px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-aqua/40 focus:ring-4 focus:ring-aqua/10"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={filters.specialty}
            onChange={(e) => {
              const next = { ...filters, specialty: e.target.value };
              setFilters(next);
              void loadAppointments(next);
            }}
            className="rounded-[14px] border border-ink/[0.06] bg-white px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-aqua/40 focus:ring-4 focus:ring-aqua/10"
          >
            <option value="todas">Especialidad...</option>
            {specialties.map(([slug, label]) => (
              <option key={slug} value={slug}>{label}</option>
            ))}
          </select>

          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider text-ink/40">Desde</span>
            <input
              type="date"
              value={filters.from}
              onChange={(e) => {
                const next = { ...filters, from: e.target.value };
                setFilters(next);
                void loadAppointments(next);
              }}
              className="w-full rounded-[14px] border border-ink/[0.06] bg-white py-2.5 pl-16 pr-3 text-sm text-ink outline-none transition-all focus:border-aqua/40 focus:ring-4 focus:ring-aqua/10"
            />
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider text-ink/40">Hasta</span>
            <input
              type="date"
              value={filters.to}
              onChange={(e) => {
                const next = { ...filters, to: e.target.value };
                setFilters(next);
                void loadAppointments(next);
              }}
              className="w-full rounded-[14px] border border-ink/[0.06] bg-white py-2.5 pl-16 pr-3 text-sm text-ink outline-none transition-all focus:border-aqua/40 focus:ring-4 focus:ring-aqua/10"
            />
          </div>
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-3xl border border-white bg-white shadow-premium">
          <div className="max-h-[70vh] overflow-auto">
            <table className="min-w-[980px] w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-white/95 text-[10px] font-bold uppercase tracking-[0.15em] text-ink/40 backdrop-blur supports-[backdrop-filter]:bg-white/90">
                <tr>
                  <th className="border-b border-ink/[0.06] px-6 py-5">Fecha</th>
                  <th className="border-b border-ink/[0.06] px-6 py-5">Nombre</th>
                  <th className="border-b border-ink/[0.06] px-6 py-5">Teléfono</th>
                  <th className="border-b border-ink/[0.06] px-6 py-5">Especialidad</th>
                  <th className="border-b border-ink/[0.06] px-6 py-5">Prepaga</th>
                  <th className="border-b border-ink/[0.06] px-6 py-5">Observaciones</th>
                  <th className="border-b border-ink/[0.06] px-6 py-5">Estado</th>
                  <th className="border-b border-ink/[0.06] px-6 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/[0.04] bg-white">
                {visibleAppointments.map((row) => (
                  <tr key={row.id} className="group transition-colors duration-200 even:bg-[#fcfcfb]/40 hover:bg-[#f1f9f8]">
                    <td className="px-6 py-6 text-ink/50">{row.dateLabel}</td>
                    <td className="px-6 py-6">
                      <span className="text-base font-bold tracking-tight text-ink">{row.fullName}</span>
                    </td>
                    <td className="px-6 py-6 font-mono text-xs tracking-tighter text-ink/60">{row.phone}</td>
                    <td className="px-6 py-6 text-ink/60">{row.specialtyLabel}</td>
                    <td className="px-6 py-6 text-ink/60">{row.coverageName || "Particular"}</td>
                    <td className="max-w-[180px] truncate px-6 py-6 text-ink/40 italic">{row.notes || "-"}</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        {statusUpdatingId === row.id ? (
                          <div className="flex h-5 w-5 items-center justify-center">
                            <Loader2 className="animate-spin text-aqua" size={14} />
                          </div>
                        ) : null}
                        <select
                          value={row.status}
                          onChange={(e) => void handleStatusChange(row.id, e.target.value as AppointmentStatus)}
                          className={`rounded-xl border px-4 py-2 text-[11px] font-bold uppercase tracking-wider outline-none transition-all duration-300 focus:ring-4 focus:ring-aqua/10 ${statusBadgeClass[row.status]}`}
                        >
                          <option value="nuevo">nuevo</option>
                          <option value="contactado">contactado</option>
                          <option value="aceptado">aceptado</option>
                          <option value="rechazado">rechazado</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-end gap-3">
                        <a
                          href={buildPatientWhatsappUrl(row.phone, row.fullName)}
                          target="_blank"
                          rel="noreferrer"
                          title="Contactar por WhatsApp"
                          className="flex h-10 items-center gap-2 rounded-xl border border-ink/[0.06] bg-white px-4 text-xs font-semibold text-ink/60 transition-all hover:border-[#25D366]/30 hover:bg-[#25D366]/5 hover:text-[#1f7d45] hover:shadow-premium-sm active:scale-95"
                        >
                          <MessageCircle size={16} className="text-[#25D366]" />
                          <span className="hidden xl:inline">WhatsApp</span>
                        </a>
                        <button
                          onClick={() => setSelected(row)}
                          title="Ver detalles"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink/[0.06] bg-white text-ink/40 transition-all hover:border-aqua/30 hover:bg-aqua/5 hover:text-aqua hover:shadow-premium-sm active:scale-95"
                        >
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>

        {isLoading ? <p className="p-4 text-sm text-ink/55">Actualizando listado...</p> : null}
      </section>

      {selected ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/35 p-4 sm:items-center" onClick={() => setSelected(null)}>
          <article className="w-full max-w-2xl rounded-[28px] border border-ink/10 bg-white p-6 shadow-glow" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display text-3xl text-ink">{selected.fullName}</h3>
            <p className="mt-1 text-sm text-ink/60">{selected.dateLabel}</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Detail label="Teléfono" value={selected.phone} />
              <Detail label="Email" value={selected.email || "No informado"} />
              <Detail label="Especialidad" value={selected.specialtyLabel} />
              <Detail label="Obra social / prepaga" value={selected.coverageName || "Particular"} />
            </div>

            <Detail className="mt-4" label="Motivo" value={selected.consultationReason} />
            <Detail className="mt-4" label="Observaciones" value={selected.notes || "Sin observaciones"} />

            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelected(null)} className="ui-cta border border-ink/10 bg-white px-8 py-3 text-ink transition-all hover:bg-ink hover:text-white active:scale-95">Cerrar</button>
            </div>
          </article>
        </div>
      ) : null}
        <section className="mt-12">
          <h2 className="mb-6 font-display text-2xl tracking-tight text-ink">Actividad reciente</h2>
          <div className="rounded-3xl border border-white bg-white/60 p-6 shadow-premium backdrop-blur-sm">
            <div className="space-y-5">
              {[
                { text: "Lucia Fernandez creó solicitud", time: "hace 2 min" },
                { text: "Martín Lopez fue marcado como contactado", time: "hace 15 min" },
                { text: "Valentina Sosa fue aceptada", time: "hace 1 hora" },
                { text: "Nueva solicitud recibida desde landing", time: "hace 3 horas" },
              ].map((item, idx) => (
                <div key={idx} className="group flex items-center gap-5 rounded-2xl p-2 transition-colors hover:bg-white/40">
                  <div className="relative flex flex-col items-center self-stretch">
                    <div className="z-10 mt-1.5 h-2.5 w-2.5 rounded-full bg-aqua shadow-[0_0_12px_rgba(100,181,173,0.8)]" />
                    {idx !== 3 && <div className="absolute top-4 h-full w-[2px] bg-ink/[0.08]" />}
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <p className="text-sm font-medium text-ink/80 transition-colors group-hover:text-ink">{item.text}</p>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-ink/40">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Detail({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-2xl border border-ink/10 bg-ink/[0.02] p-4 ${className}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/45">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink/80">{value}</p>
    </div>
  );
}

function buildPatientWhatsappUrl(phone: string, fullName: string) {
  const normalized = phone.replace(/\D/g, "");
  const text = encodeURIComponent(`Hola ${fullName}, te contactamos desde Onofri-Di Fulvio Odontología por tu solicitud de turno.`);
  return `https://wa.me/${normalized}?text=${text}`;
}
