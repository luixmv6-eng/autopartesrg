import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { rutaProducto } from "@/lib/rutas";
import type { Producto } from "@/lib/types";
import { listarCompatibles, rangoAniosLegible, type EtiquetaMarca } from "@/lib/utils";

/**
 * Listado de repuestos con enlace a cada ficha, renderizado en el servidor.
 *
 * Es la pieza que faltaba para que el catálogo fuera rastreable. La retícula de
 * la portada es un componente de cliente: las tarjetas se pintan en el navegador
 * y de doce en doce, así que un buscador nunca veía más allá de la primera
 * página y no tenía por dónde llegar al resto. Esto es lo contrario: HTML plano,
 * los cincuenta repuestos de una vez, cada uno con su `<a>` y su texto de
 * compatibilidad.
 *
 * Deliberadamente sin filtros ni paginación. Es un índice, no una herramienta de
 * búsqueda —para eso está el catálogo de la portada— y su único trabajo es que
 * ninguna ficha quede a más de dos clics de la raíz.
 */
export function ListaRepuestos({
  productos,
  etiquetaMarca,
}: {
  productos: Producto[];
  etiquetaMarca: EtiquetaMarca;
}) {
  return (
    <ul className="grid grid-cols-1 gap-sm sm:grid-cols-2 xl:grid-cols-3">
      {productos.map((producto) => (
        <li key={producto.id}>
          <Link
            href={rutaProducto(producto.id)}
            className="group flex h-full gap-md rounded-lg border border-outline-variant bg-surface-container-lowest p-sm transition-[box-shadow,translate] duration-[var(--dur-rapida)] motion-safe:hover:-translate-y-px hover:shadow-e2"
          >
            <span className="relative block size-20 shrink-0 overflow-hidden rounded border border-outline-variant bg-surface-container-highest sm:size-24">
              <Image
                src={producto.imagen}
                alt=""
                fill
                loading="lazy"
                sizes="96px"
                className="object-contain p-1.5"
              />
            </span>

            <span className="flex min-w-0 flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                {etiquetaMarca(producto.marca)}
              </span>
              {/*
               * El nombre del repuesto en un `<h3>` y no en un `<span>`: en una
               * página de listado los encabezados son el esqueleto que un
               * buscador —y un lector de pantalla— usan para entender que hay
               * cincuenta entradas y cuál es el título de cada una.
               */}
              <h3 className="text-body-md font-semibold leading-snug text-on-surface transition-colors group-hover:text-primary">
                {producto.nombre}
              </h3>
              <span className="text-label-sm leading-snug text-on-surface-variant">
                {listarCompatibles(producto, etiquetaMarca)}{" "}
                <span className="tabular">
                  ({rangoAniosLegible(producto.anioDesde, producto.anioHasta)})
                </span>
              </span>
              {producto.oem && (
                <span className="tabular font-mono text-label-sm text-on-surface-variant">
                  OEM {producto.oem}
                </span>
              )}
              <span className="mt-auto inline-flex items-center gap-xs pt-xs font-mono text-label-sm uppercase tracking-[0.1em] text-primary">
                Ver ficha
                <Icon
                  name="arrow_forward"
                  size={16}
                  className="transition-transform motion-safe:group-hover:translate-x-1"
                />
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
