"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { Icon } from "@/components/ui/Icon";
import { useFiltros } from "@/hooks/useFiltros";
import { CONTACTO } from "@/lib/contacto";
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
  { href: "/nosotros#garantias", label: "Garantías" },
  { href: "/nosotros#envios", label: "Envíos" },
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
        elevado ? "shadow-e2" : "shadow-e1"
      )}
    >
      <div className="contenedor flex h-[var(--alto-cabecera)] items-center justify-between gap-sm">
        {/* Hasta `lg` la navegación vive en la barra inferior (BottomNav). Aquí
            no se repite: las maquetas de Stitch traían dos modelos distintos
            (barra inferior en Home, hamburguesa en Nosotros) y montar los dos
            deja cuatro destinos duplicados en la misma pantalla.
            El corte es `lg` y no `md` porque en tableta vertical los cuatro
            destinos, el logotipo y el buscador no caben sin apretarse. */}
        <div className="flex min-w-0 items-center gap-lg">
          <Link
            href="/"
            aria-label={`${CONTACTO.nombre}, ir al inicio`}
            /* `min-h-11`: con el logotipo a 40px de alto el enlace se quedaba
               en un objetivo táctil de 40, por debajo del mínimo de 44. */
            className="flex min-h-11 shrink-0 items-center"
          >
            <Logo prioridad className="h-10 xs:h-[2.75rem] lg:h-[3.75rem]" />
          </Link>

          <nav aria-label="Navegación principal" className="hidden lg:block xl:ml-lg">
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
                    {/*
                     * `visibility` entra en la lista de transición. Sin ella el
                     * submenú tenía entrada pero no salida: al retirar el ratón
                     * la visibilidad saltaba a `hidden` en el acto y el fundido
                     * de salida no llegaba a verse nunca.
                     *
                     * La salida va más corta que la entrada, como debe ser:
                     * entrando el movimiento explica de dónde sale el panel,
                     * saliendo solo estorba.
                     */}
                    <ul className="invisible absolute left-0 top-full w-48 origin-top rounded-lg border border-outline-variant bg-surface-container-lowest p-xs opacity-0 shadow-e2 transition-[opacity,translate,scale,visibility] duration-[var(--dur-salida)] ease-salida motion-safe:-translate-y-1 motion-safe:scale-95 group-hover:visible group-hover:opacity-100 group-hover:duration-[var(--dur-media)] motion-safe:group-hover:translate-y-0 motion-safe:group-hover:scale-100 group-focus-within:visible group-focus-within:opacity-100 motion-safe:group-focus-within:translate-y-0 motion-safe:group-focus-within:scale-100">
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

        <div className="flex shrink-0 items-center gap-sm">
          {/*
           * Buscador siempre alcanzable, sea cual sea la posición de scroll.
           * En línea a partir de `xl`, que es donde sobra anchura junto a los
           * cuatro destinos; por debajo se pliega en el botón de al lado.
           * El campo se mide en `ch` para que su anchura la fije el texto que
           * debe caber, no un número redondo de píxeles.
           */}
          <form
            onSubmit={buscar}
            role="search"
            className="hidden items-center rounded-full border border-borde-campo bg-surface-container-low px-4 py-2 transition-[border-color,box-shadow] duration-[var(--dur-rapida)] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary xl:flex"
          >
            <label htmlFor="buscador-nav" className="sr-only">
              Buscar repuesto por nombre, marca o modelo
            </label>
            <Icon name="search" size={20} className="mr-2 text-on-surface-variant" />
            <input
              id="buscador-nav"
              type="search"
              value={termino}
              onChange={(e) => setTermino(e.target.value)}
              /* El marcador de posición cabe entero: uno más largo se cortaba
                 a media palabra, que es peor que decir menos. */
              placeholder="Buscar repuesto, marca o modelo"
              /* Anchura fija: al enfocarlo se ensanchaba animando `width`, que
                 recalcula el layout de toda la cabecera y empuja el logotipo.
                 El campo ya cabe entero, así que el ensanchado no aportaba
                 nada que compensara el coste. */
              className="w-[24ch] border-none bg-transparent p-0 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant 2xl:w-[32ch]"
            />
          </form>

          <button
            type="button"
            onClick={() => setBuscadorAbierto((v) => !v)}
            aria-expanded={buscadorAbierto}
            aria-controls="buscador-compacto"
            aria-label="Abrir buscador"
            className="-mr-2 grid size-11 place-items-center rounded-full text-primary transition-colors hover:bg-surface-container-low xl:hidden"
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

      {/*
       * El panel de búsqueda se despliega en vez de aparecer.
       *
       * Antes era un render condicional: al pulsar la lupa el panel se
       * materializaba de golpe y empujaba la página entera hacia abajo de un
       * fotograma al siguiente, que en un móvil se lee como un fallo de la
       * página, no como una respuesta a lo que acabas de tocar.
       *
       * Se queda siempre montado y colapsado a `0fr`, con `inert` para que ni
       * el tabulador ni un lector de pantalla lleguen a un campo que no está.
       */}
      <div
        id="buscador-compacto"
        inert={!buscadorAbierto}
        className={cn(
          "grid transition-[grid-template-rows] duration-[var(--dur-panel)] ease-salida xl:hidden",
          buscadorAbierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "border-t border-outline-variant bg-surface-container-lowest py-sm transition-opacity duration-[var(--dur-rapida)]",
              buscadorAbierto ? "opacity-100" : "opacity-0"
            )}
          >
          <form onSubmit={buscar} role="search" className="contenedor flex gap-sm">
            <label htmlFor="buscador-compacto-input" className="sr-only">
              Buscar repuesto por nombre, marca o modelo
            </label>
            <div className="flex flex-grow items-center rounded-lg border border-borde-campo bg-surface-container-low px-sm">
              <Icon name="search" size={20} className="mr-sm text-on-surface-variant" />
              <input
                id="buscador-compacto-input"
                ref={inputRef}
                type="search"
                value={termino}
                onChange={(e) => setTermino(e.target.value)}
                placeholder="Buscar repuesto, marca o modelo…"
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
        </div>
      </div>
    </header>
  );
}
