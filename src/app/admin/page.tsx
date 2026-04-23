import { getDashboardData } from "@/lib/dashboard";

export default async function AdminPage() {
  const dashboard = await getDashboardData();

  return (
    <main className="shell pt-28 pb-20">
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="rounded-full border border-ink/10 bg-white/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-ink/60">
            Panel admin
          </span>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl">Consultas y estadisticas</h1>
          <p className="mt-3 max-w-2xl text-base text-ink/70">
            Vista inicial para seguimiento comercial y operativo. Si Supabase no esta configurado,
            se muestran datos de demostracion.
          </p>
        </div>
        <div className="rounded-[28px] border border-ink/10 bg-white/80 px-5 py-4 text-sm text-ink/70 shadow-glow">
          Total de consultas registradas:{" "}
          <strong className="text-ink">{dashboard.summary.totalAppointments}</strong>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        {dashboard.cards.map((card) => (
          <article
            key={card.label}
            className="rounded-[28px] border border-ink/10 bg-white/80 p-6 shadow-glow"
          >
            <p className="text-sm text-ink/60">{card.label}</p>
            <p className="mt-3 font-display text-4xl">{card.value}</p>
            <p className="mt-4 text-sm text-ink/60">{card.caption}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-[32px] border border-ink/10 bg-white/80 p-6 shadow-glow">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl">Ultimas solicitudes</h2>
            <span className="text-sm text-ink/50">Detalle rapido</span>
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-ink/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-ink/[0.04] text-ink/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Paciente</th>
                  <th className="px-4 py-3 font-medium">Especialidad</th>
                  <th className="px-4 py-3 font-medium">Profesional</th>
                  <th className="px-4 py-3 font-medium">Cobertura</th>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 bg-white">
                {dashboard.latestAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-4 py-4">
                      <div className="font-medium">{appointment.fullName}</div>
                      <div className="text-ink/55">{appointment.phone}</div>
                    </td>
                    <td className="px-4 py-4">{appointment.specialtyLabel}</td>
                    <td className="px-4 py-4">{appointment.professionalLabel}</td>
                    <td className="px-4 py-4">{appointment.coverageSummary}</td>
                    <td className="px-4 py-4">{appointment.dateLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <div className="space-y-8">
          <article className="rounded-[32px] border border-ink/10 bg-white/80 p-6 shadow-glow">
            <h2 className="font-display text-2xl">Distribucion por profesional</h2>
            <div className="mt-6 space-y-4">
              {dashboard.byProfessional.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="h-3 rounded-full bg-ink/10">
                    <div
                      className="h-3 rounded-full bg-teal"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] border border-ink/10 bg-white/80 p-6 shadow-glow">
            <h2 className="font-display text-2xl">Cobertura</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {dashboard.coverageBreakdown.map((item) => (
                <div key={item.label} className="rounded-[24px] bg-ink/[0.04] p-5">
                  <p className="text-sm text-ink/60">{item.label}</p>
                  <p className="mt-2 font-display text-3xl">{item.value}</p>
                  <p className="mt-2 text-sm text-ink/50">{item.caption}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
