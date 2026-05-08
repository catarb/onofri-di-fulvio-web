"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AdminAppointment, AppointmentStatus } from "@/lib/admin-appointments";
import { CalendarPlus, ExternalLink, Link2, Loader2, LogOut, Menu, MessageCircle, Search, Sparkles, UserPlus, X, FileDown } from "lucide-react";
import { Counter } from "@/components/counter";
import type { AgendaPrefill } from "@/components/admin/admin-agenda";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminPatients = dynamic(
  () => import("@/components/admin/admin-patients").then((mod) => mod.AdminPatients),
  { ssr: false, loading: () => <div className="py-8 text-sm text-ink/50">Cargando pacientes...</div> }
);

const AdminAgenda = dynamic(
  () => import("@/components/admin/admin-agenda").then((mod) => mod.AdminAgenda),
  { ssr: false, loading: () => <div className="py-8 text-sm text-ink/50">Cargando agenda...</div> }
);

const AdminReports = dynamic(
  () => import("@/components/admin/admin-reports").then((mod) => mod.AdminReports),
  { ssr: false, loading: () => <div className="py-8 text-sm text-ink/50">Cargando reportes...</div> }
);

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

export function AdminDashboard({
  initialAppointments,
  initialPage,
  initialPageSize,
  initialTotal,
  initialTotalPages
}: {
  initialAppointments: AdminAppointment[];
  initialPage: number;
  initialPageSize: number;
  initialTotal: number;
  initialTotalPages: number;
}) {
  const tabs: Array<{ key: "dashboard" | "patients" | "agenda" | "reports" | "settings"; label: string }> = [
    { key: "dashboard", label: "Dashboard" },
    { key: "patients", label: "Pacientes" },
    { key: "agenda", label: "Agenda" },
    { key: "reports", label: "Reportes" },
    { key: "settings", label: "Configuración" }
  ];

  const [appointments, setAppointments] = useState(initialAppointments);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [selected, setSelected] = useState<AdminAppointment | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"dashboard" | "patients" | "agenda" | "reports" | "settings">("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [agendaPrefill, setAgendaPrefill] = useState<AgendaPrefill | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: "todos",
    specialty: "todas",
    from: "",
    to: ""
  });
  const [csvExportEnabled, setCsvExportEnabled] = useState(false);
  const [whatsappNotificationsEnabled, setWhatsappNotificationsEnabled] = useState(false);
  const [followUpRemindersEnabled, setFollowUpRemindersEnabled] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkingAppointment, setLinkingAppointment] = useState<AdminAppointment | null>(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [patientResults, setPatientResults] = useState<Array<{ id: string; fullName: string; phone: string; email: string | null; dni: string | null }>>([]);
  const [linkingLoading, setLinkingLoading] = useState(false);
  const [linkingError, setLinkingError] = useState("");
  const [linkingMessage, setLinkingMessage] = useState("");

  // Load preferences from localStorage on mount
  useEffect(() => {
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
    if (appointments.length === 0) return;

    const headers = ["Fecha", "Nombre", "Teléfono", "Especialidad", "Prepaga", "Observaciones", "Estado"];
    const rows = appointments.map(app => [
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
    for (const item of appointments) {
      unique.set(item.specialtySlug, item.specialtyLabel);
    }
    return Array.from(unique.entries());
  }, [appointments]);

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

  const recentActivity = useMemo(() => {
    if (appointments.length === 0) return [];
    return [...appointments]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((item) => {
        let text = "";
        if (item.status === "nuevo") {
          text = `${item.fullName} creó una solicitud`;
        } else if (item.status === "contactado") {
          text = `${item.fullName} fue marcado/a como contactado/a`;
        } else if (item.status === "aceptado") {
          text = `${item.fullName} fue aceptado/a`;
        } else if (item.status === "rechazado") {
          text = `${item.fullName} fue rechazado/a`;
        }

        const diffMs = Date.now() - new Date(item.createdAt).getTime();
        const diffMin = Math.floor(diffMs / (1000 * 60));
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        const time =
          diffMin < 1
            ? "ahora"
            : diffMin < 60
              ? `hace ${diffMin} min`
              : diffHour < 24
                ? `hace ${diffHour} h`
                : `hace ${diffDay} d`;

        return { text, time };
      });
  }, [appointments]);

  async function loadAppointments(
    nextFilters: Filters,
    nextPage: number = page,
    nextPageSize: number = pageSize,
    nextQuery: string = query
  ) {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (nextFilters.status !== "todos") params.set("status", nextFilters.status);
    if (nextFilters.specialty !== "todas") params.set("specialty", nextFilters.specialty);
    if (nextFilters.from) params.set("from", nextFilters.from);
    if (nextFilters.to) params.set("to", nextFilters.to);
    if (nextQuery.trim()) params.set("q", nextQuery.trim());
    params.set("page", String(nextPage));
    params.set("pageSize", String(nextPageSize));

    const response = await fetch(`/api/admin/appointments?${params.toString()}`, { cache: "no-store" });
    const json = await response.json();

    if (json.success) {
      setAppointments(json.appointments);
      setTotal(json.total || 0);
      setPage(json.page || nextPage);
      setPageSize(json.pageSize || nextPageSize);
      setTotalPages(json.totalPages || 1);
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

  function setTab(tab: "dashboard" | "patients" | "agenda" | "reports" | "settings") {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  }

  function openAgendaFromAppointment(row: AdminAppointment) {
    const linkedName = row.linkedPatient?.fullName || row.fullName;
    const linkedPhone = row.linkedPatient?.phone || row.phone;
    setAgendaPrefill({
      token: Date.now(),
      appointmentId: row.id,
      patientId: row.patientId || undefined,
      patientName: row.patientId ? linkedName : undefined,
      patientPhone: row.patientId ? linkedPhone : undefined,
      appointmentLabel: `Solicitud vinculada: ${row.fullName} - ${row.dateLabel}`,
      requiresPatientLink: !row.patientId,
      title: "Turno odontológico",
      specialty: row.specialtyLabel,
      notes: row.notes || undefined
    });
    setActiveTab("agenda");
  }

  function openLinkModal(row: AdminAppointment) {
    setLinkingAppointment(row);
    setPatientSearchQuery("");
    setPatientResults([]);
    setLinkingError("");
    setLinkingMessage("");
    setLinkModalOpen(true);
  }

  async function searchPatientsForLink(q: string) {
    setPatientSearchQuery(q);
    if (!q.trim()) {
      setPatientResults([]);
      return;
    }
    const response = await fetch(`/api/admin/patients?q=${encodeURIComponent(q)}`, { cache: "no-store" });
    const json = await response.json();
    if (json.success) {
      setPatientResults(json.patients || []);
    }
  }

  async function linkExistingPatient(patientId: string) {
    if (!linkingAppointment) return;
    setLinkingLoading(true);
    setLinkingError("");
    setLinkingMessage("");
    try {
      const response = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "link-existing",
          appointmentId: linkingAppointment.id,
          patientId
        })
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        setLinkingError(json.message || "No se pudo vincular la solicitud.");
        return;
      }
      setLinkingMessage("Solicitud vinculada al paciente.");
      await loadAppointments(filters, page, pageSize, query);
      setLinkModalOpen(false);
    } finally {
      setLinkingLoading(false);
    }
  }

  async function createAndLinkPatient() {
    if (!linkingAppointment) return;
    setLinkingLoading(true);
    setLinkingError("");
    setLinkingMessage("");
    try {
      const response = await fetch("/api/admin/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-and-link",
          appointmentId: linkingAppointment.id
        })
      });
      const json = await response.json();
      if (!response.ok || !json.success) {
        setLinkingError(json.message || "No se pudo crear/vincular el paciente.");
        if (Array.isArray(json.matches)) {
          setPatientResults(json.matches);
        }
        return;
      }
      setLinkingMessage("Paciente creado y vinculado correctamente.");
      await loadAppointments(filters, page, pageSize, query);
      setLinkModalOpen(false);
    } finally {
      setLinkingLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#f8f8f6] pb-16 pt-8">
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-aqua/5 blur-[120px]" />
        <div className="absolute -right-[5%] top-[20%] h-[400px] w-[400px] rounded-full bg-aqua/3 blur-[100px]" />
      </div>

      <div className="shell relative z-10 max-w-full min-w-0">
        <header className="mb-10 flex max-w-full min-w-0 flex-col gap-5">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display text-4xl tracking-tight text-ink">
              {activeTab === "dashboard"
                ? "Panel Administrativo"
                : activeTab === "patients"
                  ? "Pacientes"
                  : activeTab === "agenda"
                    ? "Agenda"
                    : activeTab === "reports"
                      ? "Reportes"
                    : "Configuración"}
            </h1>
            <p className="mt-2 text-base text-ink/40">
              {activeTab === "dashboard"
                ? "Gestión de solicitudes y seguimiento de pacientes"
                : activeTab === "patients"
                  ? "Registro y gestión de pacientes del consultorio"
                  : activeTab === "agenda"
                    ? "Administración de turnos programados"
                    : activeTab === "reports"
                      ? "Descarga de reportes mensuales del consultorio"
                    : "Personalización y ajustes del sistema"}
            </p>
          </motion.div>
          
          <div className="flex w-full max-w-full min-w-0 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <nav className="hidden rounded-full border border-ink/[0.05] bg-white/50 p-1 backdrop-blur-sm lg:flex">
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
                onClick={() => setActiveTab("patients")}
                className={`relative px-6 py-2 text-sm font-semibold transition-colors ${activeTab === "patients" ? "text-white" : "text-ink/40 hover:text-ink/60"}`}
              >
                {activeTab === "patients" && (
                  <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className="relative z-10">Pacientes</span>
              </button>
              <button
                onClick={() => setActiveTab("agenda")}
                className={`relative px-6 py-2 text-sm font-semibold transition-colors ${activeTab === "agenda" ? "text-white" : "text-ink/40 hover:text-ink/60"}`}
              >
                {activeTab === "agenda" && (
                  <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className="relative z-10">Agenda</span>
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`relative px-6 py-2 text-sm font-semibold transition-colors ${activeTab === "reports" ? "text-white" : "text-ink/40 hover:text-ink/60"}`}
              >
                {activeTab === "reports" && (
                  <motion.div layoutId="tab-bg" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
                )}
                <span className="relative z-10">Reportes</span>
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

            <div className="flex w-full min-w-0 items-center justify-between gap-3 lg:hidden">
              <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-ink/50">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua/50 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-aqua"></span>
                </span>
                Sistema activo
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-expanded={mobileMenuOpen}
                aria-label="Abrir menú del panel"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ink/[0.08] bg-white text-ink/70 transition-all hover:border-ink/20 hover:text-ink hover:shadow-premium-sm"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>

            <div className="hidden items-center gap-4 lg:flex">
              <div className="hidden items-center gap-2 text-xs font-medium text-ink/40 lg:flex">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua/50 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-aqua"></span>
                </span>
                Sistema activo
              </div>
              
              <div className="flex items-center gap-2">
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

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.nav
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-full rounded-2xl border border-white/70 bg-white/85 p-3 shadow-premium-sm backdrop-blur-lg lg:hidden"
              >
                <div className="flex flex-col gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setTab(tab.key)}
                      className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                        activeTab === tab.key
                          ? "bg-ink text-white"
                          : "bg-white text-ink/70 hover:bg-ink/[0.04] hover:text-ink"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-ink/[0.08] bg-white px-4 py-2.5 text-sm font-medium text-ink/70 transition-all hover:border-ink/20 hover:text-ink"
                  >
                    <LogOut size={14} />
                    Cerrar sesión
                  </button>
                </div>
              </motion.nav>
            )}
          </AnimatePresence>
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
            <div className="mb-4 flex items-center justify-between">
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

          <article className="rounded-[24px] border border-white/80 bg-white/70 px-6 py-6 shadow-premium-sm backdrop-blur-lg transition-shadow hover:shadow-premium cursor-pointer flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink/40">Especialidades</h3>
                <p className="mt-1 text-[11px] font-medium text-ink/20">Distribución por especialidad</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-ink/10" />
            </div>
            <div className="flex flex-1 flex-col justify-evenly gap-3">
              {analyticsData.specialtyData.map((item, index) => {
                const maxValue = Math.max(...analyticsData.specialtyData.map((entry) => entry.value), 1);
                const widthPct = Math.max((item.value / maxValue) * 100, 8);
                return (
                  <div key={item.name} className="grid w-full min-w-0 grid-cols-[116px_minmax(0,1fr)_28px] items-center gap-2">
                    <p
                      title={item.name}
                      className="overflow-hidden text-ellipsis whitespace-nowrap text-[11px] font-medium leading-tight text-ink/65"
                    >
                      {item.name}
                    </p>
                    <div className="h-[17px] min-w-0 overflow-hidden rounded-full bg-[#64b5ad1f]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: index === 0 ? "#64b5ad" : "rgba(100, 181, 173, 0.35)"
                        }}
                        title={`${item.name}: ${item.value}`}
                      />
                    </div>
                    <span className="text-right text-[10px] font-semibold text-ink/45">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </article>
        </motion.section>

        <section className="mt-8 border-b border-ink/[0.03] pb-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <label className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35 transition-colors peer-focus:text-aqua/60" />
            <input
              value={query}
              onChange={(e) => {
                const nextQuery = e.target.value;
                setQuery(nextQuery);
                void loadAppointments(filters, 1, pageSize, nextQuery);
              }}
              placeholder="Buscar..."
              className="peer w-full rounded-[14px] border border-ink/[0.06] bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-all focus:border-aqua/40 focus:ring-4 focus:ring-aqua/10"
            />
          </label>
          <select
            value={filters.status}
            onChange={(e) => {
              const next = { ...filters, status: e.target.value as Filters["status"] };
              setFilters(next);
              void loadAppointments(next, 1, pageSize, query);
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
              void loadAppointments(next, 1, pageSize, query);
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
                void loadAppointments(next, 1, pageSize, query);
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
                void loadAppointments(next, 1, pageSize, query);
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
            <table className="min-w-[1080px] w-full table-fixed text-left text-sm">
              <thead className="sticky top-0 z-10 bg-white/95 text-[10px] font-bold uppercase tracking-[0.15em] text-ink/40 backdrop-blur supports-[backdrop-filter]:bg-white/90">
                <tr>
                  <th className="w-[90px] border-b border-ink/[0.06] px-3 py-3 whitespace-nowrap lg:px-4">Fecha</th>
                  <th className="w-[190px] border-b border-ink/[0.06] px-3 py-3 whitespace-nowrap lg:px-4">Nombre</th>
                  <th className="w-[115px] border-b border-ink/[0.06] px-3 py-3 whitespace-nowrap lg:px-4">Teléfono</th>
                  <th className="w-[120px] border-b border-ink/[0.06] px-3 py-3 lg:px-4">Especialidad</th>
                  <th className="w-[100px] border-b border-ink/[0.06] px-3 py-3 lg:px-4">Prepaga</th>
                  <th className="w-[150px] border-b border-ink/[0.06] px-3 py-3 lg:px-4">Paciente</th>
                  <th className="w-[160px] border-b border-ink/[0.06] px-3 py-3 lg:px-4">Observaciones</th>
                  <th className="w-[150px] border-b border-ink/[0.06] px-3 py-3 lg:px-4">Estado</th>
                  <th className="w-[130px] border-b border-ink/[0.06] px-3 py-3 text-right lg:px-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/[0.04] bg-white">
                {appointments.map((row) => (
                  <tr key={row.id} className="group cursor-pointer transition-colors duration-200 even:bg-[#fcfcfb]/40 hover:bg-[#f1f9f8]">
                    <td className="w-[90px] px-3 py-3.5 align-top text-xs text-ink/50 lg:px-4">{row.dateLabel}</td>
                    <td className="w-[190px] px-3 py-3.5 align-top lg:px-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold tracking-tight text-ink">{row.fullName}</span>
                        {followUpRemindersEnabled && (row.status === "nuevo" || row.status === "contactado") && (
                          <span className="flex w-fit items-center gap-1 rounded-full bg-aqua/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-aqua">
                            Seguimiento pendiente
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="w-[115px] truncate px-3 py-3.5 align-top font-mono text-xs tracking-tight text-ink/60 lg:px-4">{row.phone}</td>
                    <td className="w-[120px] px-3 py-3.5 align-top text-xs text-ink/60 lg:px-4"><p className="truncate" title={row.specialtyLabel}>{row.specialtyLabel}</p></td>
                    <td className="w-[100px] px-3 py-3.5 align-top text-xs text-ink/60 lg:px-4"><p className="truncate" title={row.coverageName || "Particular"}>{row.coverageName || "Particular"}</p></td>
                    <td className="w-[150px] px-3 py-3.5 align-top lg:px-4">
                      {row.patientId ? (
                        <span className="inline-flex items-center justify-center gap-1 text-center rounded-full border border-green-200 bg-green-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-green-700">
                          <Link2 size={11} />Vinculado</span>
                      ) : (
                        <button
                          onClick={() => openLinkModal(row)}
                          className="inline-flex items-center justify-center gap-1 text-center rounded-full border border-aqua/25 bg-aqua/5 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-aqua transition-colors hover:bg-aqua/10"
                        >
                          <UserPlus size={11} />Crear/Vincular</button>
                      )}
                    </td>
                    <td className="w-[160px] px-3 py-3.5 align-top lg:px-4">
                      <p className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap text-xs italic text-ink/40" title={row.notes || "-"}>{row.notes || "-"}</p>
                    </td>
                    <td className="w-[150px] px-3 py-3.5 align-top lg:px-4">
                      <div className="flex items-center gap-2">
                        {statusUpdatingId === row.id ? (
                          <div className="flex h-5 w-5 items-center justify-center">
                            <Loader2 className="animate-spin text-aqua" size={14} />
                          </div>
                        ) : null}
                        <select
                          value={row.status}
                          onChange={(e) => void handleStatusChange(row.id, e.target.value as AppointmentStatus)}
                          className={`cursor-pointer w-[112px] rounded-lg border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide outline-none transition-all duration-300 focus:ring-4 focus:ring-aqua/10 ${statusBadgeClass[row.status]}`}
                        >
                          <option value="nuevo">nuevo</option>
                          <option value="contactado">contactado</option>
                          <option value="aceptado">aceptado</option>
                          <option value="rechazado">rechazado</option>
                        </select>
                      </div>
                    </td>
                    <td className="w-[150px] px-3 py-3.5 align-top lg:px-4">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <motion.a
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          href={buildPatientWhatsappUrl(row.phone, row.fullName)}
                          target="_blank"
                          rel="noreferrer"
                          title="Contactar por WhatsApp"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink/[0.06] bg-white text-ink/60 transition-all hover:border-[#25D366]/30 hover:bg-[#25D366]/5 hover:text-[#1f7d45] hover:shadow-premium-sm"
                        >
                          <MessageCircle size={14} className="text-[#25D366]" />
                        </motion.a>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openAgendaFromAppointment(row)}
                          title="Agendar turno"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink/[0.06] bg-white text-ink/60 transition-all hover:border-aqua/30 hover:bg-aqua/5 hover:text-aqua hover:shadow-premium-sm"
                        >
                          <CalendarPlus size={14} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelected(row)}
                          title="Ver detalles"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink/[0.06] bg-white text-ink/40 transition-all hover:border-aqua/30 hover:bg-aqua/5 hover:text-aqua hover:shadow-premium-sm"
                        >
                          <ExternalLink size={14} />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-ink/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-ink/55">
            {isLoading ? <span>Actualizando listado...</span> : null}
            {!isLoading && appointments.length === 0 ? <span>No hay solicitudes para los filtros actuales.</span> : null}
            {!isLoading && appointments.length > 0 ? (
              <span>
                Mostrando {appointments.length} de {total} solicitudes · página {page} de {totalPages}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                const nextPageSize = Number(e.target.value);
                setPageSize(nextPageSize);
                void loadAppointments(filters, 1, nextPageSize, query);
              }}
              className="rounded-lg border border-ink/[0.08] bg-white px-2 py-1 text-xs font-semibold text-ink/70"
            >
              <option value={20}>20 / pág</option>
              <option value={50}>50 / pág</option>
              <option value={100}>100 / pág</option>
            </select>
            <button
              disabled={page <= 1 || isLoading}
              onClick={() => void loadAppointments(filters, page - 1, pageSize, query)}
              className="rounded-lg border border-ink/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-ink/70 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              disabled={page >= totalPages || isLoading}
              onClick={() => void loadAppointments(filters, page + 1, pageSize, query)}
              className="rounded-lg border border-ink/[0.08] bg-white px-3 py-1.5 text-xs font-semibold text-ink/70 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
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
      {linkModalOpen && linkingAppointment ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/35 p-4 sm:items-center" onClick={() => setLinkModalOpen(false)}>
          <article className="w-full max-w-2xl rounded-[28px] border border-ink/10 bg-white p-6 shadow-glow" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl text-ink">Vincular paciente</h3>
                <p className="mt-1 text-sm text-ink/55">
                  {linkingAppointment.fullName} · {linkingAppointment.dateLabel}
                </p>
              </div>
              <button onClick={() => setLinkModalOpen(false)} className="rounded-lg border border-ink/10 p-2 text-ink/50 hover:text-ink">
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <button
                disabled={linkingLoading}
                onClick={() => void createAndLinkPatient()}
                className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {linkingLoading ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                Crear y vincular automáticamente
              </button>

              <input
                value={patientSearchQuery}
                onChange={(e) => void searchPatientsForLink(e.target.value)}
                placeholder="Buscar paciente por nombre, DNI, teléfono o email..."
                className="w-full rounded-lg border border-ink/[0.08] bg-white px-3 py-2 text-sm outline-none focus:border-aqua/40"
              />

              {patientResults.length > 0 ? (
                <div className="space-y-2">
                  {patientResults.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-lg border border-ink/[0.08] bg-white p-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">{p.fullName}</p>
                        <p className="text-xs text-ink/55">{p.phone}{p.email ? ` · ${p.email}` : ""}{p.dni ? ` · DNI ${p.dni}` : ""}</p>
                      </div>
                      <button
                        disabled={linkingLoading}
                        onClick={() => void linkExistingPatient(p.id)}
                        className="rounded-lg border border-aqua/30 bg-aqua/5 px-3 py-1.5 text-xs font-semibold text-aqua hover:bg-aqua/10 disabled:opacity-60"
                      >
                        Vincular
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {linkingError ? <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{linkingError}</p> : null}
            {linkingMessage ? <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{linkingMessage}</p> : null}
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
              {recentActivity.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-sm font-medium text-ink/45 italic">Todavía no hay actividad reciente.</p>
                </div>
              ) : recentActivity.map((item, idx) => (
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
                    {idx !== recentActivity.length - 1 && <div className="absolute top-4 h-full w-[1px] bg-ink/[0.08]" />}
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
          ) : activeTab === "patients" ? (
            <motion.div
              key="patients-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <AdminPatients />
            </motion.div>
          ) : activeTab === "agenda" ? (
            <motion.div
              key="agenda-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <AdminAgenda prefill={agendaPrefill} />
            </motion.div>
          ) : activeTab === "reports" ? (
            <motion.div
              key="reports-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <AdminReports />
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
                    <button disabled className="w-full rounded-lg border border-ink/[0.05] bg-white/50 px-4 py-3 text-sm font-semibold text-ink/30 cursor-not-allowed">
                      Cambiar contraseña
                    </button>
                    <div className="rounded-xl bg-ink/[0.02] p-4">
                      <p className="text-[11px] leading-relaxed text-ink/40">
                        Las credenciales se gestionan desde variables de entorno para mayor seguridad.
                      </p>
                    </div>
                  </div>
                </section>

              </div>

              <div className="lg:col-span-8">
                <section className="rounded-[28px] border border-white/80 bg-white p-8 shadow-premium">
                  <h3 className="mb-8 text-xs font-bold uppercase tracking-[0.2em] text-ink/40">Información del consultorio</h3>
                  <div className="grid gap-8 sm:grid-cols-2">
                    <div className="space-y-6">
                      <SettingsField label="Nombre del consultorio" value="Onofri-Di Fulvio Odontología" />
                      <SettingsField label="Teléfono principal" value="+54 9 2954 44-9441" />
                      <SettingsField label="WhatsApp" value="+54 9 2954 44-9441" />
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
      <div className="mt-2 rounded-lg border border-ink/[0.05] bg-white/50 px-4 py-3 cursor-pointer">
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


