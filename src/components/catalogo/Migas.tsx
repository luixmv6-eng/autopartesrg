import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

/**
 * Migas de pan visibles, a juego con el `BreadcrumbList` de los datos
 * estructurados.
 *
 * Se dibujan de verdad y no solo en el JSON-LD por dos motivos. Para quien llega
 * desde un buscador a la ficha de un repuesto —que es el caso que este cambio
 * busca provocar— son la única pista de dónde ha aterrizado y de que hay un
 * catálogo entero detrás. Y para Google son enlaces internos reales desde las
 * cincuenta fichas hacia el índice y hacia cada marca, que es lo que reparte
 * autoridad entre ellas en vez de dejarlas colgando.
 *
 * El último tramo no se enlaza: es la página actual.
 */
export function Migas({ tramos }: { tramos: Array<{ nombre: string; ruta: string }> }) {
  return (
    <nav aria-label="Ruta de navegación" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-x-xs gap-y-1 font-mono text-label-sm text-on-surface-variant">
        <li className="flex items-center gap-x-xs">
          <Link href="/" className="inline-flex items-center gap-1 transition-colors hover:text-primary">
            <Icon name="home" size={16} />
            Inicio
          </Link>
        </li>
        {tramos.map((tramo, i) => {
          const ultimo = i === tramos.length - 1;
          return (
            <li key={tramo.ruta} className="flex min-w-0 items-center gap-x-xs">
              <Icon name="chevron_right" size={16} className="shrink-0 opacity-60" />
              {ultimo ? (
                // `aria-current` en vez de un enlace a la propia página: un enlace
                // que no lleva a ningún sitio es ruido para quien navega con
                // teclado o lector de pantalla.
                <span aria-current="page" className="truncate text-on-surface">
                  {tramo.nombre}
                </span>
              ) : (
                <Link href={tramo.ruta} className="truncate transition-colors hover:text-primary">
                  {tramo.nombre}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
