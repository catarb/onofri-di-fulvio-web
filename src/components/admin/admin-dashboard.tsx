"use client";

import { useMemo, useState } from "react";
import type { AdminAppointment, AppointmentStatus } from "@/lib/admin-appointments";
import { ExternalLink, Loader2, LogOut, MessageCircle } from "lucide-react";

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
  nuevo: "bg-aqua/15 text-ink border-aqua/30",
  contactado: "bg-ink/[0.06] text-ink/80 border-ink/15",
  aceptado: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rechazado: "bg-rose-100 text-rose-700 border-rose-200"
};

export function AdminDashboard({ initialAppointments }: { initialAppointments: AdminAppointment[] }) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState<AdminAppointment | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
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
    <main className="shell pb-16 pt-20">
      <div className="mb-8 flex flex-col gap-4 rounded-[30px] border border-ink/10 bg-white/80 p-6 shadow-glow md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-ink/45">Panel administrador</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Solicitudes de turno</h1>
          <p className="mt-2 text-sm text-ink/60">Gestiona contactos, estados y seguimiento en un solo lugar.</p>
        </div>
        <button onClick={handleLogout} className="ui-cta border border-ink/10 bg-white text-ink hover:bg-ink hover:text-white">
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total", value: metrics.total },
          { label: "Nuevas", value: metrics.nuevo },
          { label: "Contactadas", value: metrics.contactado },
          { label: "Aceptadas", value: metrics.aceptado },
          { label: "Rechazadas", value: metrics.rechazado }
        ].map((card) => (
          <article key={card.label} className="rounded-[24px] border border-ink/10 bg-white/85 p-5 shadow-premium">
            <p className="text-sm text-ink/60">{card.label}</p>
            <p className="mt-2 font-display text-3xl text-ink">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-[30px] border border-ink/10 bg-white/85 p-5 shadow-premium">
        <div className="grid gap-3 md:grid-cols-4">
          <select
            value={filters.status}
            onChange={(e) => {
              const next = { ...filters, status: e.target.value as Filters["status"] };
              setFilters(next);
              void loadAppointments(next);
            }}
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-aqua"
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
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-aqua"
          >
            <option value="todas">Todas las especialidades</option>
            {specialties.map(([slug, label]) => (
              <option key={slug} value={slug}>{label}</option>
            ))}
          </select>

          <input
            type="date"
            value={filters.from}
            onChange={(e) => {
              const next = { ...filters, from: e.target.value };
              setFilters(next);
              void loadAppointments(next);
            }}
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-aqua"
          />

          <input
            type="date"
            value={filters.to}
            onChange={(e) => {
              const next = { ...filters, to: e.target.value };
              setFilters(next);
              void loadAppointments(next);
            }}
            className="rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-aqua"
          />
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[30px] border border-ink/10 bg-white/90 shadow-premium">
        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-ink/[0.04] text-ink/65">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Teléfono</th>
                <th className="px-4 py-3 font-medium">Especialidad</th>
                <th className="px-4 py-3 font-medium">Obra social / prepaga</th>
                <th className="px-4 py-3 font-medium">Observaciones</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10 bg-white">
              {appointments.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-4 text-ink/70">{row.dateLabel}</td>
                  <td className="px-4 py-4 font-medium text-ink">{row.fullName}</td>
                  <td className="px-4 py-4 text-ink/75">{row.phone}</td>
                  <td className="px-4 py-4 text-ink/75">{row.specialtyLabel}</td>
                  <td className="px-4 py-4 text-ink/75">{row.coverageName || "Particular"}</td>
                  <td className="max-w-[180px] truncate px-4 py-4 text-ink/65">{row.notes || "-"}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      {statusUpdatingId === row.id ? <Loader2 className="animate-spin" size={14} /> : null}
                      <select
                        value={row.status}
                        onChange={(e) => void handleStatusChange(row.id, e.target.value as AppointmentStatus)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium ${statusBadgeClass[row.status]}`}
                      >
                        <option value="nuevo">nuevo</option>
                        <option value="contactado">contactado</option>
                        <option value="aceptado">aceptado</option>
                        <option value="rechazado">rechazado</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <a
                        href={buildPatientWhatsappUrl(row.phone, row.fullName)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-ink/70 transition-colors hover:border-aqua hover:bg-aqua/10 hover:text-ink"
                      >
                        <MessageCircle size={16} />
                      </a>
                      <button
                        onClick={() => setSelected(row)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink/10 text-ink/70 transition-colors hover:border-aqua hover:bg-aqua/10 hover:text-ink"
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
              <button onClick={() => setSelected(null)} className="ui-cta border border-ink/10 bg-white text-ink hover:bg-ink hover:text-white">Cerrar</button>
            </div>
          </article>
        </div>
      ) : null}
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
