"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, MessageCircle, MapPin, User, Sparkles, Info, ScanFace } from "lucide-react";
import { buildHeroWhatsappUrl } from "@/lib/whatsapp";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const whatsappUrl = buildHeroWhatsappUrl();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isAdminRoute) {
    return <main>{children}</main>;
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 transition-all duration-500">
        <div className={`shell transition-all duration-500 ${isScrolled ? "pt-2" : "pt-3 sm:pt-4"}`}>
          <div
            className={`flex items-center justify-between rounded-full border px-3 sm:px-4 shadow-premium transition-all duration-500 ${isScrolled
                ? "border-white/85 bg-white/72 py-2 shadow-[0_18px_44px_-20px_rgba(15,23,32,0.42)] backdrop-blur-2xl"
                : "glass border-white/70 py-2.5 backdrop-blur-md"
              }`}
          >
            <Link href="/" className="group flex min-w-0 cursor-pointer items-center gap-2.5 sm:gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/80 bg-white shadow-sm transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:w-11">
                <Image
                  src="/icon.png?v=1"
                  alt="Logo Onofri-Di Fulvio"
                  fill
                  className="rounded-full object-contain p-1"
                  sizes="(max-width: 640px) 36px, 44px"
                  priority
                />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="font-display text-sm leading-none tracking-tight text-ink whitespace-nowrap sm:text-xl">Onofri-Di Fulvio</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-aqua sm:hidden">Odontología</span>
              </div>
            </Link>

            <nav className="hidden items-center gap-6 text-sm font-medium text-ink/70 lg:flex">
              <Link href="/#nosotros" className="group relative flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-ink/70 transition-all duration-300 ease-in-out hover:bg-aqua/[0.08] hover:text-aqua">
                <Info size={16} className="premium-card-icon text-ink/45 group-hover:text-aqua" />
                <span>Nosotros</span>
                <span aria-hidden className="absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-aqua/70 transition-transform duration-300 ease-in-out group-hover:scale-x-100" />
              </Link>
              <Link href="/#profesionales" className="group relative flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-ink/70 transition-all duration-300 ease-in-out hover:bg-aqua/[0.08] hover:text-aqua">
                <User size={16} className="premium-card-icon text-ink/45 group-hover:text-aqua" />
                <span>Profesionales</span>
                <span aria-hidden className="absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-aqua/70 transition-transform duration-300 ease-in-out group-hover:scale-x-100" />
              </Link>
              <Link href="/#especialidades" className="group relative flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-ink/70 transition-all duration-300 ease-in-out hover:bg-aqua/[0.08] hover:text-aqua">
                <Sparkles size={16} className="premium-card-icon text-ink/45 group-hover:text-aqua" />
                <span>Especialidades</span>
                <span aria-hidden className="absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-aqua/70 transition-transform duration-300 ease-in-out group-hover:scale-x-100" />
              </Link>
              <Link href="/#consultorio" className="group relative flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-ink/70 transition-all duration-300 ease-in-out hover:bg-aqua/[0.08] hover:text-aqua">
                <MapPin size={16} className="premium-card-icon text-ink/45 group-hover:text-aqua" />
                <span>Consultorio</span>
                <span aria-hidden className="absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-aqua/70 transition-transform duration-300 ease-in-out group-hover:scale-x-100" />
              </Link>
              <Link href="/#contacto" className="group relative flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-ink/70 transition-all duration-300 ease-in-out hover:bg-aqua/[0.08] hover:text-aqua">
                <ScanFace size={16} className="premium-card-icon text-ink/45 group-hover:text-aqua" />
                <span>Contacto</span>
                <span aria-hidden className="absolute bottom-1 left-3 right-3 h-px origin-left scale-x-0 bg-aqua/70 transition-transform duration-300 ease-in-out group-hover:scale-x-100" />
              </Link>

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

      <footer className="mt-14 border-t border-ink/10 bg-ink py-9 text-white/90 sm:py-14">
        <div className="shell">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
            <div className="mx-auto w-full max-w-[24rem] text-center md:mx-0 md:max-w-none md:text-left">
              <Link href="/" className="inline-block">
                <Image
                  src="/logo-adultos-hd.png"
                  alt="Onofri-Di Fulvio Odontología"
                  width={240}
                  height={80}
                  className="mx-auto h-12 w-auto object-contain brightness-0 invert opacity-80 transition-opacity hover:opacity-100 md:mx-0 md:h-16"
                />
              </Link>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/60 md:mx-0 md:mt-6 md:text-base">
                Odontología moderna, cercana y precisa. Un enfoque humano para el cuidado de tu salud bucal en un espacio diseñado para tu bienestar.
              </p>
            </div>

            <div className="mx-auto w-full max-w-[24rem] text-center md:mx-0 md:max-w-none md:text-left">
              <h4 className="font-display text-lg">Navegación</h4>
              <nav className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/60 md:mt-0 md:flex md:flex-col md:gap-3">
                <Link href="/#nosotros" className="cursor-pointer transition-colors duration-300 hover:text-white">Sobre nosotros</Link>
                <Link href="/#profesionales" className="cursor-pointer transition-colors duration-300 hover:text-white">Nuestro equipo</Link>
                <Link href="/#especialidades" className="cursor-pointer transition-colors duration-300 hover:text-white">Especialidades</Link>
                <Link href="/#consultorio" className="cursor-pointer transition-colors duration-300 hover:text-white">Consultorio</Link>
                <Link href="/#contacto" className="col-span-2 cursor-pointer transition-colors duration-300 hover:text-white md:col-span-1">Contacto</Link>
              </nav>
            </div>

            <div className="mx-auto flex w-full max-w-[24rem] flex-col gap-3 text-center md:mx-0 md:max-w-none md:gap-6 md:text-left">
              <h4 className="font-display text-lg">Contacto directo</h4>
              <div className="flex flex-col gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:border-white/20 hover:bg-white/10 md:p-4"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366]">
                    <MessageCircle size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/40">WhatsApp</p>
                    <p className="text-sm font-medium">Escribinos por consultas</p>
                  </div>
                </a>

                <Link href="/solicitar-turno" className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:border-white/20 hover:bg-white/10 md:p-4">
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

          <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-5 text-[10px] uppercase tracking-[0.16em] text-white/30 md:mt-14 md:flex-row md:gap-4 md:pt-8 md:text-xs md:tracking-[0.2em]">
            <p>© 2026 Onofri-Di Fulvio Odontología. Todos los derechos reservados.</p>
            <p>Diseño & Experiencia Digital</p>
          </div>
        </div>
      </footer>
    </>
  );
}

