import { SectionTitle } from "@/components/section-title";
import { AppointmentForm } from "@/components/appointment-form";

export function AppointmentSection({ standalone = false }: { standalone?: boolean }) {
  return (
    <section id="turno" className={standalone ? "pb-16" : "section-space"}>
      <div className="shell grid items-start gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div className="lg:sticky lg:top-32">
          <SectionTitle
            eyebrow="Solicitud de turno"
            title="Pedir una consulta debería sentirse fácil y directo."
            description="El formulario registra información clave para agilizar tu atención. Al finalizar, se abrirá WhatsApp con todos tus datos listos para enviar."
          />
          <div className="mt-10 glass rounded-[40px] p-8 lg:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink/30 mb-8 border-b border-ink/5 pb-4">¿Cómo funciona?</p>
            <ol className="space-y-6">
              {[
                { step: "1", text: "Completas tus datos y motivo de consulta." },
                { step: "2", text: "El sistema valida y prepara la información." },
                { step: "3", text: "Se abre WhatsApp con el mensaje ya escrito." }
              ].map((item) => (
                <li key={item.step} className="flex gap-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/10 text-[10px] font-bold text-teal">
                    {item.step}
                  </span>
                  <p className="text-sm leading-relaxed text-ink/50">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="glass rounded-[48px] p-2 sm:p-4">
          <AppointmentForm />
        </div>
      </div>
    </section>
  );
}
