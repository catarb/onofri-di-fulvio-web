import { SectionTitle } from "@/components/section-title";
import { AppointmentForm } from "@/components/appointment-form";

export function AppointmentSection({ standalone = false }: { standalone?: boolean }) {
  return (
    <section
      id="contacto"
      className={
        standalone
          ? "pb-16"
          : "section-space py-12 sm:py-16 lg:py-20"
      }
    >
      {!standalone && <div id="turno" className="relative -top-24" aria-hidden="true" />}
      <div className="shell grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div>
          <SectionTitle
            eyebrow="Solicitud de turno"
            title="Pedir una consulta debería sentirse fácil y directo."
            description="El formulario registra información clave para agilizar tu atención. Al finalizar, se abrirá WhatsApp con todos tus datos listos para enviar."
          />
          <div className="mt-6 glass rounded-[36px] p-6 lg:p-7 max-sm:text-center">
            <p className="mb-6 border-b border-ink/5 pb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-ink/30">¿Cómo funciona?</p>
            <ol className="space-y-4">
              {[
                { step: "1", text: "Completas tus datos y motivo de consulta." },
                { step: "2", text: "El sistema valida y prepara la información." },
                { step: "3", text: "Se abre WhatsApp con el mensaje ya escrito." }
              ].map((item) => (
                <li key={item.step} className="flex gap-3 max-sm:justify-center max-sm:text-left">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal/10 text-[10px] font-bold text-teal">
                    {item.step}
                  </span>
                  <p className="text-sm leading-relaxed text-ink/50">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="glass mx-auto w-full max-w-full rounded-[44px] p-2 sm:p-3">
          <AppointmentForm />
        </div>
      </div>
    </section>
  );
}


