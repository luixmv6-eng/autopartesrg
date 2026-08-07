"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/** Tarjetas de valores, tal como aparecen en la pantalla Nosotros de Stitch. */
const VALORES: Array<{ icono: IconName; titulo: string; texto: string }> = [
  {
    icono: "precision_manufacturing",
    titulo: "Calidad OEM",
    texto:
      "Solo trabajamos con proveedores certificados para garantizar el rendimiento exacto que tu vehículo requiere.",
  },
  {
    icono: "local_shipping",
    titulo: "Logística Eficiente",
    texto:
      "Entregas rápidas y seguras a talleres y particulares, minimizando el tiempo de inactividad de las flotas.",
  },
  {
    icono: "verified",
    titulo: "Soporte Técnico",
    texto:
      "Asesoramiento especializado para asegurar la compatibilidad exacta de cada pieza con el número de chasis.",
  },
];

interface Pestana {
  id: string;
  label: string;
  icono: IconName;
  titulo: string;
  parrafos: string[];
  puntos?: string[];
  /** Alterna el lado de la imagen entre pestañas, como en la maqueta. */
  imagenPrimero?: boolean;
  /** Texto alternativo de la imagen de la pestaña. */
  alt: string;
}

/**
 * Contenido de ejemplo, listo para reemplazar por el texto definitivo.
 * El orden lo fija el encargo: Visión, Misión, Sobre nosotros.
 */
const PESTANAS: Pestana[] = [
  {
    id: "vision",
    label: "Visión",
    icono: "insights",
    titulo: "Visión de Futuro",
    alt: "Vista de la bodega de AutopartesRG con estantería organizada por secciones",
    parrafos: [
      "Ser reconocidos como el estándar definitivo de calidad en la distribución de autopartes a nivel nacional. Aspiramos a integrar tecnologías avanzadas en nuestros procesos logísticos y de atención al cliente, ofreciendo una experiencia sin fisuras que anticipe las necesidades de un mercado automotriz en constante evolución.",
    ],
  },
  {
    id: "mision",
    label: "Misión",
    icono: "precision_manufacturing",
    titulo: "Nuestra Misión",
    imagenPrimero: true,
    alt: "Repuestos clasificados y etiquetados en el almacén de AutopartesRG",
    parrafos: [
      "Proveer al sector automotor repuestos de la más alta confiabilidad, garantizando que cada reparación o mantenimiento cumpla con las especificaciones técnicas originales. Nos enfocamos en la eficiencia operativa, asegurando entregas precisas y asesoramiento experto para mantener los vehículos de nuestros clientes en movimiento seguro.",
    ],
  },
  {
    id: "sobre-nosotros",
    label: "Sobre nosotros",
    icono: "history",
    titulo: "Historia de Precisión",
    alt: "Zona de recepción y verificación de piezas de AutopartesRG",
    parrafos: [
      "Fundada con la visión de elevar los estándares de repuestos automotrices, nuestra empresa ha crecido adaptándose a las demandas tecnológicas del sector. Cada pieza en nuestro catálogo es seleccionada bajo rigurosos criterios de calidad, reflejando nuestro compromiso con la excelencia mecánica.",
    ],
    puntos: [
      "Más de 20 años de experiencia técnica.",
      "Alianzas estratégicas con fabricantes líderes mundiales.",
      "Equipo de asesores altamente capacitados.",
    ],
  },
];

function suscribirAlHash(alCambiar: () => void) {
  window.addEventListener("hashchange", alCambiar);
  return () => window.removeEventListener("hashchange", alCambiar);
}

export function Nosotros() {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Los enlaces del menú (#sobre-nosotros, #mision, #vision) activan su pestaña.
  const hash = useSyncExternalStore(
    suscribirAlHash,
    () => window.location.hash.replace("#", ""),
    () => ""
  );

  const [activa, setActiva] = useState(PESTANAS[0].id);
  const [hashPrevio, setHashPrevio] = useState("");

  if (hash !== hashPrevio) {
    setHashPrevio(hash);
    if (PESTANAS.some((p) => p.id === hash)) setActiva(hash);
  }

  const alPulsarTecla = (evento: React.KeyboardEvent) => {
    const indice = PESTANAS.findIndex((p) => p.id === activa);
    let siguiente = indice;
    if (evento.key === "ArrowRight") siguiente = (indice + 1) % PESTANAS.length;
    else if (evento.key === "ArrowLeft")
      siguiente = (indice - 1 + PESTANAS.length) % PESTANAS.length;
    else if (evento.key === "Home") siguiente = 0;
    else if (evento.key === "End") siguiente = PESTANAS.length - 1;
    else return;
    evento.preventDefault();
    const id = PESTANAS[siguiente].id;
    setActiva(id);
    refs.current[id]?.focus();
  };

  return (
    <section
      id="nosotros"
      aria-labelledby="titulo-nosotros"
      className="border-t border-outline-variant bg-background"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-xl px-md py-xl md:px-xl">
        {/* Encabezado */}
        <div className="reveal flex flex-col gap-md">
          <p className="eyebrow">Nosotros</p>
          <h1
            id="titulo-nosotros"
            className="display-tight text-headline-lg text-on-surface md:text-display-lg"
          >
            Nuestra Historia
          </h1>
          <p className="max-w-3xl text-body-lg text-on-surface-variant">
            Proveemos confianza y precisión mecánica en cada repuesto. Conoce el equipo detrás de
            la eficiencia.
          </p>
          <div className="relative mt-sm h-56 w-full overflow-hidden rounded-xl border border-outline-variant md:h-72">
            <Image
              src="/images/nosotros.svg"
              alt="Bodega de repuestos de AutopartesRG con estantería organizada"
              fill
              loading="lazy"
              sizes="(min-width: 768px) 1280px, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        {/* Valores */}
        <ul className="reveal grid grid-cols-1 gap-md md:grid-cols-3">
          {VALORES.map((v) => (
            <li
              key={v.titulo}
              className="borde-vivo group flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,53,127,0.10)] md:p-lg"
            >
              <div className="flex items-center gap-sm">
                <span className="grid size-10 place-items-center rounded-lg bg-primary-fixed text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-on-primary">
                  <Icon name={v.icono} size={22} />
                </span>
                <h2 className="text-headline-md tracking-[-0.01em] text-on-surface">{v.titulo}</h2>
              </div>
              <p className="text-body-md text-on-surface-variant">{v.texto}</p>
            </li>
          ))}
        </ul>

        {/* Pestañas */}
        <div className="reveal">
          <div
            role="tablist"
            aria-label="Información sobre AutopartesRG"
            onKeyDown={alPulsarTecla}
            className="mb-lg flex overflow-x-auto border-b border-outline-variant hide-scrollbar"
          >
            {PESTANAS.map((p) => {
              const activo = p.id === activa;
              return (
                <button
                  key={p.id}
                  id={p.id}
                  ref={(el) => {
                    refs.current[p.id] = el;
                  }}
                  role="tab"
                  type="button"
                  aria-selected={activo}
                  aria-controls={`panel-${p.id}`}
                  tabIndex={activo ? 0 : -1}
                  onClick={() => setActiva(p.id)}
                  className={cn(
                    "relative shrink-0 px-md py-sm font-mono text-label-technical uppercase tracking-[0.1em] transition-colors duration-300 md:px-lg",
                    activo
                      ? "bg-surface-container-low text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                  )}
                >
                  {p.label}
                  {/* Indicador: se despliega desde el centro al activarse */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 bottom-0 h-0.5 origin-center bg-primary transition-transform duration-300 ease-out",
                      activo ? "scale-x-100" : "scale-x-0"
                    )}
                  />
                </button>
              );
            })}
          </div>

          {PESTANAS.map((p) => (
            <div
              key={p.id}
              id={`panel-${p.id}`}
              role="tabpanel"
              aria-labelledby={p.id}
              hidden={p.id !== activa}
              tabIndex={0}
              className="grid grid-cols-1 gap-lg md:grid-cols-2"
            >
              <div
                className={cn(
                  "relative h-56 overflow-hidden rounded-lg border border-outline-variant shadow-sm md:h-auto md:min-h-72",
                  p.imagenPrimero ? "md:order-first" : "md:order-last"
                )}
              >
                <Image
                  src={`/images/nosotros-${p.id}.svg`}
                  alt={p.alt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 620px, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col justify-center rounded-lg border border-outline-variant bg-surface-container-lowest p-md shadow-sm md:p-lg">
                <h2 className="display-tight mb-md flex items-center gap-sm text-headline-lg-mobile text-primary md:text-headline-lg">
                  <Icon name={p.icono} size={28} />
                  {p.titulo}
                </h2>
                {p.parrafos.map((parrafo) => (
                  <p
                    key={parrafo.slice(0, 24)}
                    className="text-body-md text-on-surface-variant md:text-body-lg"
                  >
                    {parrafo}
                  </p>
                ))}
                {p.puntos && (
                  <ul className="mt-md list-inside list-disc text-body-md text-on-surface-variant">
                    {p.puntos.map((punto) => (
                      <li key={punto}>{punto}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
