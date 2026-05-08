"use client";

import { useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";

export function AdminReports() {
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(String(now.getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function downloadMonthlyReport() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/reports/monthly?month=${month}&year=${year}`, { cache: "no-store" });
      if (!response.ok) {
        let message = "No se pudo generar el reporte.";
        try {
          const json = await response.json();
          message = json.message || message;
        } catch {}
        setError(message);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `reporte-consultorio-${year}-${month}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("No se pudo generar el reporte.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-[24px] border border-white/80 bg-white/70 p-6 shadow-premium-sm backdrop-blur-lg">
      <h2 className="font-display text-2xl text-ink">Reportes mensuales</h2>
      <p className="mt-1 text-sm text-ink/50">Descargá un CSV con resumen y detalle del mes seleccionado.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-xl border border-ink/[0.08] bg-white px-3 py-2 text-sm outline-none focus:border-aqua/40"
        >
          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <input
          type="number"
          min={2020}
          max={2100}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded-xl border border-ink/[0.08] bg-white px-3 py-2 text-sm outline-none focus:border-aqua/40"
        />

        <button
          onClick={() => void downloadMonthlyReport()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Descargar reporte mensual
        </button>
      </div>

      {error ? <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
