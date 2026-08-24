"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { LABEL_CATEGORIA } from "@/lib/taxonomia";
import type { Producto } from "@/lib/types";
import { nombrarVehiculo, rangoAniosLegible } from "@/lib/utils";

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
 * Responsive por **consulta de contenedor**, no por anchura de ventana. La
 * tarjeta vive en una retícula auto-ajustable cuyo número de columnas depende
 * de si la barra lateral de filtros está montada, así que la misma ventana de
 * 1024px puede darle 300px o 500px de ancho. Preguntando por su propio ancho
 * (`@container`) la tarjeta acierta en los dos casos; preguntando por el de la
 * ventana acertaría solo en uno.
 *
 * Movimiento: entra sola al asomar en el viewport (`card-reveal`, atado a la
 * posición de scroll por CSS) y al pasar el puntero se enciende el borde, la
 * imagen escala y el pie se rellena.
 */
export function ProductoCard({ producto, indice, onAbrir, prioridad }: Props) {
  const compatibilidad = `${nombrarVehiculo(producto, producto.modelos[0])} ${rangoAniosLegible(
    producto.anioDesde,
    producto.anioHasta
  )}`;

  return (
    <article
      className="borde-vivo card-in card-reveal group relative flex h-full flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest transition-[box-shadow,translate] duration-[var(--dur-rapida)] motion-safe:hover:-translate-y-1 hover:shadow-realce @container"
      style={{ "--i": indice % 12 } as React.CSSProperties}
    >
      {/* Proporción fija en vez de alto fijo: la imagen acompaña al ancho real
          de la columna y no se aplasta cuando la tarjeta es estrecha. */}
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-outline-variant bg-surface-container-highest">
        <Image
          src={producto.imagen}
          alt={`${producto.nombre} para ${compatibilidad}`}
          fill
          loading={prioridad ? "eager" : "lazy"}
          sizes="(min-width: 1536px) 20rem, (min-width: 1024px) 22vw, (min-width: 640px) 30vw, 46vw"
          className="object-contain p-4 transition-transform duration-[var(--dur-media)] motion-safe:group-hover:scale-[1.07] @[15rem]:p-6"
        />
        {/* Velo que aporta profundidad al pasar el puntero */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/8 to-transparent opacity-0 transition-opacity duration-[var(--dur-rapida)] group-hover:opacity-100"
        />
      </div>

      <div className="flex flex-grow flex-col p-sm @[15rem]:p-md">
        {/* Etiqueta técnica: categoría en versalitas monoespaciadas */}
        <p className="mb-xs truncate font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
          {LABEL_CATEGORIA[producto.categoria]}
        </p>

        {/* Reserva las dos líneas que el recorte permite: sin ella, un nombre
            de una línea subía el resto del contenido y la franja de
            compatibilidad quedaba a distinta altura en cada tarjeta de la
            misma fila. */}
        <h3 className="mb-xs line-clamp-2 text-label-sm font-semibold leading-snug tracking-[-0.01em] text-on-surface transition-colors duration-[var(--dur-rapida)] group-hover:text-primary @[15rem]:min-h-12 @[15rem]:text-body-md @[15rem]:leading-6">
          <button
            type="button"
            onClick={() => onAbrir(producto)}
            className="text-left after:absolute after:inset-0 after:content-['']"
          >
            {producto.nombre}
          </button>
        </h3>

        {/* Número de parte. No se parte: es un código, y romperlo por la mitad
            lo hace ilegible; si no cabe, se recorta con puntos suspensivos.
            Cuando el repuesto no trae referencia impresa, la línea dice a qué
            se sustituye en vez de mostrar "OEM" seguido de nada. */}
        <p className="tabular mb-sm truncate font-mono text-[10px] tracking-[0.06em] text-on-surface-variant @[15rem]:text-label-sm">
          {producto.oem ? `OEM ${producto.oem}` : "Referencia por WhatsApp"}
        </p>

        {/* La franja de compatibilidad solo aparece cuando la tarjeta tiene
            ancho para que se lea entera. En la retícula de dos columnas del
            móvil no cabe, y recortada no informa de nada. */}
        <p className="mb-md hidden items-center gap-2 rounded border border-outline-variant/50 bg-surface-container-low p-2 transition-colors duration-[var(--dur-rapida)] group-hover:border-primary/30 group-hover:bg-primary-fixed/50 @[15rem]:flex">
          <Icon name="check_circle" size={16} className="shrink-0 text-primary" />
          <span className="line-clamp-1 text-label-sm text-on-surface">{compatibilidad}</span>
        </p>

        <div className="mt-auto border-t border-outline-variant/30 pt-sm">
          <span className="flex h-9 w-full items-center justify-center gap-xs rounded border border-primary px-2 font-mono text-label-sm uppercase tracking-[0.1em] text-primary transition-colors duration-[var(--dur-rapida)] group-hover:bg-primary group-hover:text-on-primary @[15rem]:px-4">
            Ver ficha
            <Icon
              name="arrow_forward"
              size={16}
              className="transition-transform duration-[var(--dur-rapida)] motion-safe:group-hover:translate-x-1"
            />
          </span>
        </div>
      </div>
    </article>
  );
}
