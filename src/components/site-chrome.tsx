import Link from "next/link";
import Image from "next/image";
import { Calendar, MessageCircle, MapPin, User, Stethoscope, Info } from "lucide-react";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 transition-all duration-300">
        <div className="shell pt-4">
          <div className="glass flex items-center justify-between rounded-full border border-white/70 px-4 py-2.5 shadow-premium backdrop-blur-md">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/80 bg-white/70 shadow-sm">
                <Image
                  src="/logo-adultos.png"
                  alt="Logo Onofri-Di Fulvio"
                  fill
                  className="object-contain p-1.5"
                  sizes="40px"
                  priority
                />
              </div>
              <span className="font-display text-xl tracking-tight text-ink">
                Onofri-Di Fulvio Odontología
              </span>
            </Link>

            <nav className="hidden items-center gap-8 text-sm font-medium text-ink/70 lg:flex">
              <a
                href="#nosotros"
                className="group relative flex items-center gap-1.5 rounded-full px-3 py-2 text-ink/70 transition-all duration-300 ease-in-out hover:bg-aqua/[0.08] hover:text-aqua"
              >
                <Info size={16} className="premium-card-icon text-ink/45 group-hover:text-aqua" />
                <span>Nosotros</span>
                <span
                  aria-hidden
                  className="absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-aqua/70 transition-transform duration-300 ease-in-out group-hover:scale-x-100"
                />
              </a>
              <a
                href="#profesionales"
                className="group relative flex items-center gap-1.5 rounded-full px-3 py-2 text-ink/70 transition-all duration-300 ease-in-out hover:bg-aqua/[0.08] hover:text-aqua"
              >
                <User size={16} className="premium-card-icon text-ink/45 group-hover:text-aqua" />
                <span>Profesionales</span>
                <span
                  aria-hidden
                  className="absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-aqua/70 transition-transform duration-300 ease-in-out group-hover:scale-x-100"
                />
              </a>
              <a
                href="#especialidades"
                className="group relative flex items-center gap-1.5 rounded-full px-3 py-2 text-ink/70 transition-all duration-300 ease-in-out hover:bg-aqua/[0.08] hover:text-aqua"
              >
                <Stethoscope size={16} className="premium-card-icon text-ink/45 group-hover:text-aqua" />
                <span>Especialidades</span>
                <span
                  aria-hidden
                  className="absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-aqua/70 transition-transform duration-300 ease-in-out group-hover:scale-x-100"
                />
              </a>
              <a
                href="#consultorio"
                className="group relative flex items-center gap-1.5 rounded-full px-3 py-2 text-ink/70 transition-all duration-300 ease-in-out hover:bg-aqua/[0.08] hover:text-aqua"
              >
                <MapPin size={16} className="premium-card-icon text-ink/45 group-hover:text-aqua" />
                <span>Consultorio</span>
                <span
                  aria-hidden
                  className="absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-aqua/70 transition-transform duration-300 ease-in-out group-hover:scale-x-100"
                />
              </a>
              
              <Link
                href="/solicitar-turno"
                className="flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-white shadow-premium hover:opacity-90 hover:shadow-premium-hover transition-all active:scale-95"
              >
                <Calendar size={18} />
                <span>Solicitar turno</span>
              </Link>
            </nav>

            <div className="lg:hidden flex items-center gap-4">
               <Link
                href="/solicitar-turno"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white shadow-premium active:scale-90 transition-transform"
              >
                <Calendar size={20} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="bg-ink text-white/90 py-16 mt-20">
        <div className="shell">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Link href="/" className="font-display text-2xl tracking-tight">
                Onofri-Di Fulvio Odontología
              </Link>
              <p className="mt-6 text-white/60 leading-relaxed max-w-sm">
                Odontología moderna, cercana y precisa. Un enfoque humano para el cuidado de tu salud bucal en un espacio diseñado para tu bienestar.
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              <h4 className="font-display text-lg">Navegación</h4>
              <nav className="flex flex-col gap-3 text-white/60">
                <a href="#nosotros" className="hover:text-white transition-colors">Sobre nosotros</a>
                <a href="#profesionales" className="hover:text-white transition-colors">Nuestro equipo</a>
                <a href="#especialidades" className="hover:text-white transition-colors">Especialidades</a>
                <a href="#consultorio" className="hover:text-white transition-colors">Ubicación y contacto</a>
              </nav>
            </div>

            <div className="flex flex-col gap-6">
              <h4 className="font-display text-lg">Contacto directo</h4>
              <div className="flex flex-col gap-4">
                <a 
                  href="https://wa.me/your-number" 
                  className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 hover:bg-white/10 transition-colors border border-white/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-widest">WhatsApp</p>
                    <p className="text-sm font-medium">Escribinos por consultas</p>
                  </div>
                </a>
                
                <Link
                  href="/solicitar-turno"
                  className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 hover:bg-white/10 transition-colors border border-white/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase tracking-widest">Turnos</p>
                    <p className="text-sm font-medium">Reserva online</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/30 uppercase tracking-[0.2em]">
            <p>© {new Date().getFullYear()} Onofri-Di Fulvio Odontología. Todos los derechos reservados.</p>
            <p>Diseño & Experiencia Digital</p>
          </div>
        </div>
      </footer>
    </>
  );
}
