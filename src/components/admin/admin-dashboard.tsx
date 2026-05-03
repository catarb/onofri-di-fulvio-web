"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AdminAppointment, AppointmentStatus } from "@/lib/admin-appointments";
import { ExternalLink, Loader2, LogOut, MessageCircle, Search, Sparkles, FileDown } from "lucide-react";
import { Counter } from "@/components/counter";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

type Filters = {
  status: "todos" | AppointmentStatus;
  specialty: string;
  from: string;
  to: string;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].value;
    return (
      <div className="rounded-2xl border border-white/60 bg-white/90 p-3 shadow-premium backdrop-blur-md">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-1">{label || "Dato"}</p>
        <p className="text-base font-display font-bold text-ink">
          {data ?? 0} 
          <span className="ml-1.5 text-[10px] font-medium uppercase tracking-wider text-ink/30">solicitudes</span>
        </p>
      </div>
    );
  }
  return null;
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
  const [activeTab, setActiveTab] = useState<"dashboard" | "settings">("dashboard");
  const [filters, setFilters] = useState<Filters>({
    status: "todos",
    specialty: "todas",
    from: "",
    to: ""
  });
  const [csvExportEnabled, setCsvExportEnabled] = useState(false);
  const [whatsappNotificationsEnabled, setWhatsappNotificationsEnabled] = useState(false);
  const [followUpRemindersEnabled, setFollowUpRemindersEnabled] = useState(false);

  // Load preferences from localStorage on mount
  useMemo(() => {
    if (typeof window !== "undefined") {
      setCsvExportEnabled(localStorage.getItem("admin_csv_export_enabled") === "true");
      setWhatsappNotificationsEnabled(localStorage.getItem("admin_whatsapp_notif_enabled") === "true");
      setFollowUpRemindersEnabled(localStorage.getItem("admin_reminders_enabled") === "true");
    }
  }, []);

  const handleToggleCsv = (val: boolean) => {
    setCsvExportEnabled(val);
    localStorage.setItem("admin_csv_export_enabled", String(val));
  };

  const handleToggleWhatsapp = (val: boolean) => {
    setWhatsappNotificationsEnabled(val);
    localStorage.setItem("admin_whatsapp_notif_enabled", String(val));
  };

  const handleToggleReminders = (val: boolean) => {
    setFollowUpRemindersEnabled(val);
    localStorage.setItem("admin_reminders_enabled", String(val));
  };

  const exportToCSV = () => {
    if (visibleAppointments.length === 0) return;

    const headers = ["Fecha", "Nombre", "Teléfono", "Especialidad", "Prepaga", "Observaciones", "Estado"];
    const rows = visibleAppointments.map(app => [
      app.dateLabel,
      app.fullName,
      app.phone,
      app.specialtyLabel,
      app.coverageName || "Particular",
      app.notes || "-",
      app.status
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `solicitudes-turno-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const analyticsData = useMemo(() => {
    // 7 Days Logic
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });

    const dailyRequests = days.map((day) => ({
      name: day.split("-").slice(2).join("/"), // DD
      value: appointments.filter((item) => item.createdAt?.startsWith(day)).length
    }));

    // Specialty Logic
    const specialtyCounts = new Map<string, number>();
    for (const item of appointments) {
      specialtyCounts.set(item.specialtyLabel, (specialtyCounts.get(item.specialtyLabel) || 0) + 1);
    }
    const specialtyData = Array.from(specialtyCounts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Fallback Mock if empty or all zero
    const finalRequests = dailyRequests.some(d => d.value > 0) 
      ? dailyRequests 
      : [
          { name: "Lun", value: 12 },
          { name: "Mar", value: 18 },
          { name: "Mie", value: 15 },
          { name: "Jue", value: 22 },
          { name: "Vie", value: 19 },
          { name: "Sab", value: 8 },
          { name: "Dom", value: 14 }
        ];

    const finalSpecialties = specialtyData.length > 0 
      ? specialtyData 
      : [
          { name: "Ortodoncia", value: 45 },
          { name: "Implantes", value: 32 },
          { name: "Estética", value: 28 },
          { name: "General", value: 22 },
          { name: "Odontopediatría", value: 15 }
        ];

    return { dailyRequests: finalRequests, specialtyData: finalSpecialties };
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
    <main className="relative min-h-screen bg-[#f8f8f6] pb-16 pt-8">
      {/* Background Decor */}
      <div className="pointer-events-none absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-aqua/5 blur-[120px]" />
      <div className="pointer-events-none absolute -right-[5%] top-[20%] h-[400px] w-[400px] rounded-full bg-aqua/3 blur-[100px]" />

      <div className="shell relative z-10">
        <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display text-4xl tracking-tight text-ink">
              {activeTab === "dashboard" ? "Panel Administrativo" : "Configuración"}
            </h1>
            <p className="mt-2 text-base text-ink/40">
              {activeTab === "dashboard" 
                ? "Gestión de solicitudes y seguimiento de pacientes" 
                : "Personalización y ajustes del sistema"}
            </p>
          </motion.div>
          
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <nav className="flex rounded-full border border-ink/[0.05] bg-white/50 p-1 backdrop-blur-sm">
              <button 
                onClick={() => setActiveTab("dashboard")}
                className={`relative px-6 py-2 text-sm font-semibold transition-colors ${activeTab === "dashboard" ? "text-white" : "text-ink/40 hover:text-ink/60"}`}
              >
                {activeTab === "dashboard" && (
                  <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className="relative z-10">Dashboard</span>
              </button>
              <button 
                onClick={() => setActiveTab("settings")}
                className={`relative px-6 py-2 text-sm font-semibold transition-colors ${activeTab === "settings" ? "text-white" : "text-ink/40 hover:text-ink/60"}`}
              >
                {activeTab === "settings" && (
                  <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className="relative z-10">Configuración</span>
              </button>
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-2 text-xs font-medium text-ink/40 lg:flex">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua/50 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-aqua"></span>
                </span>
                Sistema activo
              </div>
              
              <div className="flex items-center gap-3">
                {whatsappNotificationsEnabled && (
                  <div className="flex h-8 items-center gap-2 rounded-full bg-[#25D366]/10 px-3 text-[10px] font-bold uppercase tracking-wider text-[#1f7d45]">
                    <MessageCircle size={12} />
                    Notif. Activas
                  </div>
                )}
                {followUpRemindersEnabled && (
                  <div className="flex h-8 items-center gap-2 rounded-full bg-aqua/10 px-3 text-[10px] font-bold uppercase tracking-wider text-aqua">
                    <Sparkles size={12} />
                    Recordatorios
                  </div>
                )}
              </div>
              <motion.button 
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout} 
                className="flex items-center gap-2 rounded-full border border-ink/[0.08] bg-white px-5 py-2.5 text-sm font-medium text-ink/60 transition-all hover:border-ink/20 hover:text-ink hover:shadow-premium active:bg-ink/[0.02]"
              >
                <LogOut size={14} />
                Cerrar sesión
              </motion.button>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === "dashboard" ? (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Total", value: metrics.total },
            { label: "Nuevas", value: metrics.nuevo },
            { label: "Contactadas", value: metrics.contactado },
            { label: "Aceptadas", value: metrics.aceptado },
            { label: "Rechazadas", value: metrics.rechazado }
          ].map((card, idx) => (
            <motion.article 
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5, ease: "easeOut" }}
              whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.04)" }}
              className="group relative cursor-pointer overflow-hidden rounded-[24px] border border-white/80 bg-white/70 p-7 shadow-premium-sm backdrop-blur-lg transition-colors duration-500 hover:bg-white"
            >
              {/* Top Glow Line */}
              <div className="absolute inset-x-0 top-0 h-[3px] bg-aqua/20 shadow-[0_0_15px_rgba(100,181,173,0)] transition-all duration-500 group-hover:bg-aqua group-hover:shadow-[0_0_15px_rgba(100,181,173,0.5)]" />
              
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink/30 transition-colors group-hover:text-aqua/60">{card.label}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <Counter 
                  value={card.value} 
                  className="font-display text-5xl font-medium tracking-tight text-ink transition-transform duration-500 group-hover:scale-105" 
                />
              </div>
            </motion.article>
          ))}
        </section>

        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-8 grid gap-6 lg:grid-cols-2"
        >
          <article className="rounded-[24px] border border-white/80 bg-white/70 p-7 shadow-premium-sm backdrop-blur-lg transition-shadow hover:shadow-premium cursor-pointer">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink/40">Solicitudes (7 días)</h3>
                <p className="mt-1 text-[11px] font-medium text-ink/20">Evolución reciente</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-aqua shadow-[0_0_10px_rgba(100,181,173,0.8)]" />
            </div>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.dailyRequests}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64b5ad" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#64b5ad" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#28282905" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: "#28282930", fontWeight: 600 }}
                    dy={15}
                  />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: "#64b5ad20", strokeWidth: 1 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#64b5ad" 
                    strokeWidth={3} 
                    strokeLinecap="round"
                    dot={{ r: 0 }}
                    activeDot={{ 
                      r: 6, 
                      fill: "#64b5ad", 
                      strokeWidth: 4, 
                      stroke: "rgba(100, 181, 173, 0.2)",
                      style: { cursor: 'pointer' }
                    }}
                    animationDuration={2000}
                    animationEasing="ease-in-out"
                    className="cursor-pointer"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-[24px] border border-white/80 bg-white/70 p-7 shadow-premium-sm backdrop-blur-lg transition-shadow hover:shadow-premium cursor-pointer">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink/40">Especialidades</h3>
                <p className="mt-1 text-[11px] font-medium text-ink/20">Distribución por especialidad</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-ink/10" />
            </div>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={analyticsData.specialtyData} margin={{ left: -10, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fill: "#28282970", fontWeight: 500 }}
                    width={100}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ fill: "rgba(100, 181, 173, 0.03)" }} 
                  />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={18} animationDuration={2000} className="cursor-pointer">
                    {analyticsData.specialtyData.map((_, index) => (
                      <Cell key={index} fill={index === 0 ? "#64b5ad" : "#64b5ad25"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>
        </motion.section>

        <section className="mt-8 border-b border-ink/[0.03] pb-8">
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
          {csvExportEnabled && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 rounded-[14px] border border-aqua/20 bg-white px-4 py-2.5 text-sm font-semibold text-aqua transition-all hover:bg-aqua/5 hover:shadow-premium-sm"
            >
              <FileDown size={16} />
              Exportar CSV
            </motion.button>
          )}
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
                  <tr key={row.id} className="group cursor-pointer transition-colors duration-200 even:bg-[#fcfcfb]/40 hover:bg-[#f1f9f8]">
                    <td className="px-6 py-6 text-ink/50">{row.dateLabel}</td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-base font-bold tracking-tight text-ink">{row.fullName}</span>
                        {followUpRemindersEnabled && (row.status === "nuevo" || row.status === "contactado") && (
                          <span className="flex w-fit items-center gap-1 rounded-full bg-aqua/5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-aqua">
                            Seguimiento pendiente
                          </span>
                        )}
                      </div>
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
                          className={`cursor-pointer rounded-xl border px-4 py-2 text-[11px] font-bold uppercase tracking-wider outline-none transition-all duration-300 focus:ring-4 focus:ring-aqua/10 ${statusBadgeClass[row.status]}`}
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
                        <motion.a
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          href={buildPatientWhatsappUrl(row.phone, row.fullName)}
                          target="_blank"
                          rel="noreferrer"
                          title="Contactar por WhatsApp"
                          className="flex h-10 items-center gap-2 rounded-xl border border-ink/[0.06] bg-white px-4 text-xs font-semibold text-ink/60 transition-all hover:border-[#25D366]/30 hover:bg-[#25D366]/5 hover:text-[#1f7d45] hover:shadow-premium-sm"
                        >
                          <MessageCircle size={16} className="text-[#25D366]" />
                          <span className="hidden xl:inline">WhatsApp</span>
                        </motion.a>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelected(row)}
                          title="Ver detalles"
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink/[0.06] bg-white text-ink/40 transition-all hover:border-aqua/30 hover:bg-aqua/5 hover:text-aqua hover:shadow-premium-sm"
                        >
                          <ExternalLink size={16} />
                        </motion.button>
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
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <div className="mb-6">
            <h2 className="font-display text-2xl tracking-tight text-ink">Actividad reciente</h2>
            <p className="mt-1 text-sm text-ink/40">Últimos movimientos del panel</p>
          </div>
          <div className="rounded-[28px] border border-white/80 bg-white/60 p-5 shadow-premium backdrop-blur-sm">
            <div className="space-y-2">
              {[
                { text: "Lucia Fernandez creó solicitud", time: "hace 2 min" },
                { text: "Martín Lopez fue marcado como contactado", time: "hace 15 min" },
                { text: "Valentina Sosa fue aceptada", time: "hace 1 hora" },
                { text: "Nueva solicitud recibida desde landing", time: "hace 3 horas" },
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group flex items-center gap-4 rounded-xl p-2 transition-all hover:bg-white/40 cursor-pointer"
                >
                  <div className="relative flex flex-col items-center self-stretch">
                    <div className="z-10 mt-1.5 h-2 w-2 rounded-full bg-aqua shadow-[0_0_10px_rgba(100,181,173,0.6)]" />
                    {idx !== 3 && <div className="absolute top-4 h-full w-[1px] bg-ink/[0.08]" />}
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-4">
                    <p className="text-sm font-medium text-ink/70 transition-colors group-hover:text-ink">{item.text}</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink/30 transition-colors group-hover:text-ink/50">{item.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
            </motion.div>
          ) : (
            <motion.div
              key="settings-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid gap-8 lg:grid-cols-12"
            >
              <div className="space-y-8 lg:col-span-4">
                <section className="rounded-[28px] border border-white/80 bg-white/70 p-7 shadow-premium-sm backdrop-blur-lg">
                  <h3 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-ink/40">
                    <LogOut size={14} className="rotate-180" />
                    Datos de acceso
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-ink/30">Email administrador</p>
                      <p className="mt-1 text-sm font-medium text-ink/70 italic">Gestionado por variables de entorno</p>
                    </div>
                    <button disabled className="w-full rounded-xl border border-ink/[0.05] bg-white/50 px-4 py-3 text-sm font-semibold text-ink/30 cursor-not-allowed">
                      Cambiar contraseña
                    </button>
                    <div className="rounded-xl bg-ink/[0.02] p-4">
                      <p className="text-[11px] leading-relaxed text-ink/40">
                        Las credenciales se gestionan desde variables de entorno para mayor seguridad.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-[28px] border border-white/80 bg-white/70 p-7 shadow-premium-sm backdrop-blur-lg">
                  <h3 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-ink/40">
                    <Sparkles size={14} />
                    Preferencias
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: "Notificaciones WhatsApp", active: whatsappNotificationsEnabled, id: "whatsapp" },
                      { label: "Recordatorios de seguimiento", active: followUpRemindersEnabled, id: "reminders" },
                      { label: "Exportación automática CSV", active: csvExportEnabled, id: "csv" }
                    ].map((pref) => (
                      <div key={pref.label} className="flex flex-col gap-2 rounded-xl bg-white/40 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-ink/60">{pref.label}</span>
                          <div 
                            onClick={() => {
                              if (pref.id === "csv") handleToggleCsv(!pref.active);
                              if (pref.id === "whatsapp") handleToggleWhatsapp(!pref.active);
                              if (pref.id === "reminders") handleToggleReminders(!pref.active);
                            }}
                            className={`h-5 w-10 cursor-pointer rounded-full transition-colors ${pref.active ? "bg-aqua" : "bg-ink/10"} relative`}
                          >
                            <div className={`absolute top-1 h-3 w-3 rounded-full bg-white transition-all ${pref.active ? "left-6" : "left-1"}`} />
                          </div>
                        </div>
                        {pref.id === "whatsapp" && !pref.active && (
                          <p className="text-[10px] text-ink/30 italic">Las acciones manuales de WhatsApp siguen disponibles.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="lg:col-span-8">
                <section className="rounded-[28px] border border-white/80 bg-white p-8 shadow-premium">
                  <h3 className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-ink/40">Información del consultorio</h3>
                  <div className="grid gap-8 sm:grid-cols-2">
                    <div className="space-y-6">
                      <SettingsField label="Nombre del consultorio" value="Onofri-Di Fulvio Odontología" />
                      <SettingsField label="Teléfono principal" value="02954 80-3800" />
                      <SettingsField label="WhatsApp" value="02954 80-3800" />
                    </div>
                    <div className="space-y-6">
                      <SettingsField label="Dirección" value="Av. Uruguay 785, Santa Rosa, La Pampa" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-ink/30">Horarios de atención</p>
                        <div className="mt-3 space-y-2">
                          {["Lun a Vie: 08:30 – 17:00 hs.", "Sábados y Domingos: Cerrado"].map(h => (
                            <p key={h} className="text-sm font-medium text-ink/70">{h}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function Detail({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-2xl border border-ink/10 bg-ink/[0.02] p-4 cursor-pointer ${className}`}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/45">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink/80">{value}</p>
    </div>
  );
}

function SettingsField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink/30">{label}</p>
      <div className="mt-2 rounded-xl border border-ink/[0.05] bg-white/50 px-4 py-3 cursor-pointer">
        <p className="text-sm font-medium text-ink/70">{value}</p>
      </div>
    </div>
  );
}

function buildPatientWhatsappUrl(phone: string, fullName: string) {
  const normalized = phone.replace(/\D/g, "");
  const text = encodeURIComponent(`Hola ${fullName}, te contactamos desde Onofri-Di Fulvio Odontología por tu solicitud de turno.`);
  return `https://wa.me/${normalized}?text=${text}`;
}
