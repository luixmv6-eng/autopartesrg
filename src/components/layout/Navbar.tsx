"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { Icon } from "@/components/ui/Icon";
import { useFiltros } from "@/hooks/useFiltros";
import { cn } from "@/lib/utils";

/**
 * Destinos de la navegación.
 *
 * `ancla` son secciones de la landing; `ruta` son páginas propias. El scroll-spy
 * solo observa las anclas, y únicamente cuando estamos en la landing.
 */
export const DESTINOS = [
  { id: "inicio", label: "Inicio", href: "/#inicio", ancla: true },
  { id: "catalogo", label: "Catálogo", href: "/#catalogo", ancla: true },
  { id: "nosotros", label: "Nosotros", href: "/nosotros", ancla: false },
  { id: "contacto", label: "Contacto", href: "#contacto", ancla: true },
] as const;

/** El orden lo fija el encargo: Visión, Misión, Sobre nosotros. */
const SUB_NOSOTROS = [
  { href: "/nosotros#vision", label: "Visión" },
  { href: "/nosotros#mision", label: "Misión" },
  { href: "/nosotros#sobre-nosotros", label: "Sobre nosotros" },
];

export function Navbar() {
  const { filtros, definir } = useFiltros();
  const pathname = usePathname();
  const enLanding = pathname === "/";

  const q = filtros.q;
  const [termino, setTermino] = useState(q);
  const [qPrevio, setQPrevio] = useState(q);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);
  const [seccionVisible, setSeccionVisible] = useState<string>("inicio");
  const [elevado, setElevado] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (q !== qPrevio) {
    setQPrevio(q);
    setTermino(q);
  }

  // Sombra del encabezado en cuanto la página deja el tope.
  useEffect(() => {
    const centinela = document.getElementById("tope-pagina");
    if (!centinela) return;
    const observador = new IntersectionObserver(([e]) => setElevado(!e.isIntersecting));
    observador.observe(centinela);
    return () => observador.disconnect();
  }, []);

  // Enlace activo según la sección visible. Solo aplica dentro de la landing.
  useEffect(() => {
    const secciones = DESTINOS.filter((d) => d.ancla)
      .map((d) => document.getElementById(d.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!secciones.length) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        const visible = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setSeccionVisible(visible.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.25, 0.5] }
    );
    secciones.forEach((s) => observador.observe(s));
    return () => observador.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (buscadorAbierto) inputRef.current?.focus();
  }, [buscadorAbierto]);

  const buscar = (evento: React.FormEvent) => {
    evento.preventDefault();
    definir("q", termino.trim() || null);
    setBuscadorAbierto(false);
    document.getElementById("catalogo")?.scrollIntoView({ block: "start" });
  };

  /** Un destino está activo por ruta si es página propia; por scroll si es ancla. */
  const esActivo = (destino: (typeof DESTINOS)[number]) =>
    destino.ancla ? enLanding && seccionVisible === destino.id : pathname === destino.href;

  const enlaceClase = (activo: boolean) =>
    cn(
      "font-mono text-label-technical uppercase tracking-[0.08em] transition-colors hover:text-primary",
      activo ? "text-primary border-b-2 border-primary pb-1" : "text-on-surface-variant"
    );

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full border-b border-outline-variant bg-surface-container-lowest transition-shadow duration-300",
        elevado ? "shadow-md" : "shadow-sm"
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-md md:h-16 md:px-xl">
        {/* En móvil la navegación vive en la barra inferior (BottomNav). Aquí
            no se repite: las maquetas de Stitch traían dos modelos distintos
            (barra inferior en Home, hamburguesa en Nosotros) y montar los dos
            deja cuatro destinos duplicados en la misma pantalla. */}
        <div className="flex items-center gap-lg">
          <Link href="/" aria-label="AutopartesRG, ir al inicio">
            <span className="hidden md:block">
              <Logo tamanoTexto="text-headline-lg font-bold tracking-[-0.02em]" tamanoIcono={28} />
            </span>
            <span className="block md:hidden">
              <Logo
                tamanoTexto="text-headline-lg-mobile tracking-[-0.02em]"
                mostrarIcono={false}
              />
            </span>
          </Link>

          <nav aria-label="Navegación principal" className="ml-lg hidden md:block">
            <ul className="flex items-center gap-md">
              {DESTINOS.map((d) =>
                d.id === "nosotros" ? (
                  <li key={d.id} className="group relative">
                    <Link
                      href={d.href}
                      aria-current={esActivo(d) ? "page" : undefined}
                      className={cn(enlaceClase(esActivo(d)), "inline-flex items-center gap-xs")}
                    >
                      {d.label}
                      <Icon name="expand_more" size={16} />
                    </Link>
                    <ul className="invisible absolute left-0 top-full w-48 translate-y-1 rounded-lg border border-outline-variant bg-surface-container-lowest p-xs opacity-0 shadow-lg transition-[opacity,transform] duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                      {SUB_NOSOTROS.map((sub) => (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            className="flex h-10 items-center rounded px-sm font-mono text-label-technical text-on-surface-variant transition-colors hover:bg-surface-container-highest hover:text-primary"
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : (
                  <li key={d.id}>
                    <Link
                      href={d.href}
                      aria-current={esActivo(d) ? "page" : undefined}
                      className={enlaceClase(esActivo(d))}
                    >
                      {d.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-sm">
          {/* Buscador siempre alcanzable, sea cual sea la posición de scroll */}
          <form
            onSubmit={buscar}
            role="search"
            className="hidden items-center rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary lg:flex"
          >
            <label htmlFor="buscador-nav" className="sr-only">
              Buscar por número OEM o nombre de repuesto
            </label>
            <Icon name="search" size={20} className="mr-2 text-on-surface-variant" />
            <input
              id="buscador-nav"
              type="search"
              value={termino}
              onChange={(e) => setTermino(e.target.value)}
              placeholder="Buscar por número de pieza o nombre..."
              className="w-56 border-none bg-transparent p-0 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:w-64"
            />
          </form>

          <button
            type="button"
            onClick={() => setBuscadorAbierto((v) => !v)}
            aria-expanded={buscadorAbierto}
            aria-controls="buscador-compacto"
            aria-label="Abrir buscador"
            className="-mr-2 grid size-11 place-items-center rounded-full text-primary transition-colors hover:bg-surface-container-low lg:hidden"
          >
            <Icon name="search" />
          </button>
        </div>
      </div>

      {/* Progreso de lectura. Va atado al scroll del documento por CSS, sin
          JavaScript ni listeners; donde no hay soporte simplemente no aparece. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
        <div className="barra-progreso h-full w-full origin-left scale-x-0 bg-gradient-to-r from-primary to-accent" />
      </div>

      {buscadorAbierto && (
        <div
          id="buscador-compacto"
          className="border-t border-outline-variant bg-surface-container-lowest px-md py-sm lg:hidden"
        >
          <form onSubmit={buscar} role="search" className="mx-auto flex max-w-7xl gap-sm">
            <label htmlFor="buscador-compacto-input" className="sr-only">
              Buscar por número OEM o nombre de repuesto
            </label>
            <div className="flex flex-grow items-center rounded-lg border border-outline-variant bg-surface-container-low px-sm">
              <Icon name="search" size={20} className="mr-sm text-on-surface-variant" />
              <input
                id="buscador-compacto-input"
                ref={inputRef}
                type="search"
                value={termino}
                onChange={(e) => setTermino(e.target.value)}
                placeholder="Buscar por número OEM o palabra clave..."
                className="h-11 w-full border-none bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant"
              />
            </div>
            <button
              type="submit"
              className="h-11 rounded-lg bg-primary px-md font-mono text-label-technical uppercase tracking-[0.08em] text-on-primary transition-opacity active:opacity-80"
            >
              Buscar
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
