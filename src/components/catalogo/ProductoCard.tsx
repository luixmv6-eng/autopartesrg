"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { LABEL_CATEGORIA, LABEL_MARCA } from "@/lib/taxonomia";
import type { Producto } from "@/lib/types";
import { rangoAniosLegible } from "@/lib/utils";

interface Props {
  producto: Producto;
  indice: number;
  onAbrir: (producto: Producto) => void;
  prioridad?: boolean;
}

/**
 * Tarjeta del catálogo.
 *
 * Muestra solo lo que el catálogo puede sostener: categoría, nombre, número de
 * parte y compatibilidad. Nada de condición, disponibilidad ni precio.
 *
 * Movimiento: entra sola al asomar en el viewport (`card-reveal`, atado a la
 * posición de scroll por CSS) y al pasar el puntero se enciende el borde, la
 * imagen escala y el pie se rellena.
 */
export function ProductoCard({ producto, indice, onAbrir, prioridad }: Props) {
  const compatibilidad = `${LABEL_MARCA[producto.marca]} ${producto.modelos[0]} ${rangoAniosLegible(
    producto.anioDesde,
    producto.anioHasta
  )}`;

  return (
    <article
      className="borde-vivo card-in card-reveal group relative flex h-full flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest transition-[box-shadow,translate] duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,53,127,0.10)]"
      style={{ "--i": indice % 12 } as React.CSSProperties}
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden border-b border-outline-variant bg-surface-container-highest p-4 sm:h-48">
        <Image
          src={producto.imagen}
          alt={`${producto.nombre} para ${compatibilidad}`}
          fill
          loading={prioridad ? "eager" : "lazy"}
          sizes="(min-width: 1024px) 24vw, (min-width: 640px) 40vw, 46vw"
          className="object-contain p-4 transition-transform duration-[600ms] ease-out group-hover:scale-[1.07]"
        />
        {/* Velo que aporta profundidad al pasar el puntero */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/8 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      </div>

      <div className="flex flex-grow flex-col p-sm md:p-md">
        {/* Etiqueta técnica: categoría en versalitas monoespaciadas */}
        <p className="mb-xs font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
          {LABEL_CATEGORIA[producto.categoria]}
        </p>

        <h3 className="mb-xs line-clamp-2 text-label-sm font-semibold tracking-[-0.01em] text-on-surface transition-colors duration-200 group-hover:text-primary md:text-body-md md:leading-6">
          <button
            type="button"
            onClick={() => onAbrir(producto)}
            className="text-left after:absolute after:inset-0 after:content-['']"
          >
            {producto.nombre}
          </button>
        </h3>

        <p className="tabular mb-sm font-mono text-[10px] tracking-[0.06em] text-on-surface-variant md:text-label-sm">
          OEM {producto.oem}
        </p>

        <p className="mb-md hidden items-center gap-2 rounded border border-outline-variant/50 bg-surface-container-low p-2 transition-colors duration-300 group-hover:border-primary/30 group-hover:bg-primary-fixed/50 sm:flex">
          <Icon name="check_circle" size={16} className="text-primary" />
          <span className="line-clamp-1 text-label-sm text-on-surface">{compatibilidad}</span>
        </p>

        <div className="mt-auto border-t border-outline-variant/30 pt-sm">
          <span className="flex h-9 w-full items-center justify-center gap-xs rounded border border-primary px-4 font-mono text-label-sm uppercase tracking-[0.1em] text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-on-primary">
            Ver ficha
            <Icon
              name="arrow_forward"
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </article>
  );
}
