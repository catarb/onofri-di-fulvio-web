"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MessageCircle, MapPin, User, Sparkles, Info, ScanFace } from "lucide-react";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 transition-all duration-500">
        <div className={`shell transition-all duration-500 ${isScrolled ? "pt-2" : "pt-4"}`}>
          <div
            className={`flex items-center justify-between rounded-full border px-4 shadow-premium transition-all duration-500 ${
              isScrolled
                ? "border-white/85 bg-white/72 py-2 shadow-[0_18px_44px_-20px_rgba(15,23,32,0.42)] backdrop-blur-2xl"
                : "glass border-white/70 py-2.5 backdrop-blur-md"
            }`}
          >
            <Link href="/" className="group flex cursor-pointer items-center gap-2">
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-white/80 bg-white/70 shadow-sm">
                <Image src="/logo-adultos.png" alt="Logo Onofri-Di Fulvio" fill className="object-contain p-1.5" sizes="40px" priority />
              </div>
              <span className="font-display text-xl tracking-tight text-ink">Onofri-Di Fulvio Odontología</span>
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-medium text-ink/70 lg:flex">
              <a href="#nosotros" className="group relative flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-ink/70 transition-all duration-300 ease-in-out hover:bg-aqua/[0.08] hover:text-aqua">
                <Info size={16} className="premium-card-icon text-ink/45 group-hover:text-aqua" />
                <span>Nosotros</span>
                <span aria-hidden className="absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-aqua/70 transition-transform duration-300 ease-in-out group-hover:scale-x-100" />
              </a>
              <a href="#profesionales" className="group relative flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-ink/70 transition-all duration-300 ease-in-out hover:bg-aqua/[0.08] hover:text-aqua">
                <User size={16} className="premium-card-icon text-ink/45 group-hover:text-aqua" />
                <span>Profesionales</span>
                <span aria-hidden className="absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-aqua/70 transition-transform duration-300 ease-in-out group-hover:scale-x-100" />
              </a>
              <a href="#especialidades" className="group relative flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-ink/70 transition-all duration-300 ease-in-out hover:bg-aqua/[0.08] hover:text-aqua">
                <Sparkles size={16} className="premium-card-icon text-ink/45 group-hover:text-aqua" />
                <span>Especialidades</span>
                <span aria-hidden className="absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-aqua/70 transition-transform duration-300 ease-in-out group-hover:scale-x-100" />
              </a>
              <a href="#consultorio" className="group relative flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-ink/70 transition-all duration-300 ease-in-out hover:bg-aqua/[0.08] hover:text-aqua">
                <MapPin size={16} className="premium-card-icon text-ink/45 group-hover:text-aqua" />
                <span>Consultorio</span>
                <span aria-hidden className="absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-aqua/70 transition-transform duration-300 ease-in-out group-hover:scale-x-100" />
              </a>
              <a href="#turno" className="group relative flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-ink/70 transition-all duration-300 ease-in-out hover:bg-aqua/[0.08] hover:text-aqua">
                <ScanFace size={16} className="premium-card-icon text-ink/45 group-hover:text-aqua" />
                <span>Contacto</span>
                <span aria-hidden className="absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-aqua/70 transition-transform duration-300 ease-in-out group-hover:scale-x-100" />
              </a>

              <Link href="/solicitar-turno" className="ui-cta bg-ink text-white shadow-premium hover:bg-aqua hover:shadow-premium-hover">
                <Calendar size={18} />
                <span>Solicitar turno</span>
              </Link>
            </nav>

            <div className="flex items-center gap-4 lg:hidden">
              <Link href="/solicitar-turno" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-ink text-white shadow-premium transition-transform active:scale-90">
                <Calendar size={20} />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-14 border-t border-ink/10 bg-ink py-14 text-white/90">
        <div className="shell">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            <div>
              <Link href="/" className="font-display text-2xl tracking-tight">Onofri-Di Fulvio Odontología</Link>
              <p className="mt-6 max-w-sm leading-relaxed text-white/60">
                Odontología moderna, cercana y precisa. Un enfoque humano para el cuidado de tu salud bucal en un espacio diseñado para tu bienestar.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-display text-lg">Navegación</h4>
              <nav className="flex flex-col gap-3 text-white/60">
                <a href="#nosotros" className="cursor-pointer transition-colors duration-300 hover:text-white">Sobre nosotros</a>
                <a href="#profesionales" className="cursor-pointer transition-colors duration-300 hover:text-white">Nuestro equipo</a>
                <a href="#especialidades" className="cursor-pointer transition-colors duration-300 hover:text-white">Especialidades</a>
                <a href="#consultorio" className="cursor-pointer transition-colors duration-300 hover:text-white">Consultorio</a>
                <a href="#turno" className="cursor-pointer transition-colors duration-300 hover:text-white">Contacto</a>
              </nav>
            </div>

            <div className="flex flex-col gap-6">
              <h4 className="font-display text-lg">Contacto directo</h4>
              <div className="flex flex-col gap-4">
                <a href="https://wa.me/your-number" className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-white/20 hover:bg-white/10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/40">WhatsApp</p>
                    <p className="text-sm font-medium">Escribinos por consultas</p>
                  </div>
                </a>

                <Link href="/solicitar-turno" className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-white/20 hover:bg-white/10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/40">Turnos</p>
                    <p className="text-sm font-medium">Reserva online</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs uppercase tracking-[0.2em] text-white/30 md:flex-row">
            <p>© 2026 Onofri-Di Fulvio Odontología. Todos los derechos reservados.</p>
            <p>Diseño & Experiencia Digital</p>
          </div>
        </div>
      </footer>
    </>
  );
}

