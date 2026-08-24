import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded bg-surface-container", className)} />;
}

/** Misma forma que ProductoCard, para que el grid no salte al cargar. */
export function ProductoCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest @container">
      {/* Misma proporción que la imagen real, para que no salte al cargar. */}
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-sm p-sm @[15rem]:p-md">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-9 w-full rounded" />
        <div className="mt-sm flex items-center justify-between border-t border-outline-variant/30 pt-sm">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-9 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Retícula de carga. Replica exactamente la del catálogo, ver `Catalogo.tsx`.
 *
 * Hoy no la usa nadie, y es deliberado: con el catálogo en un JSON local el
 * filtrado tarda menos de 1ms y enseñar un skeleton sería inventar una espera.
 * Queda lista para el día en que `src/lib/productos.ts` lea de una API, que es
 * el punto único de lectura que documenta el README: ahí sí habrá algo
 * pendiente que anunciar.
 */
export function GridSkeleton({ cantidad = 6 }: { cantidad?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-sm sm:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] sm:gap-lg 2xl:grid-cols-[repeat(auto-fill,minmax(15.5rem,1fr))]"
      role="status"
      aria-live="polite"
      aria-label="Cargando repuestos"
    >
      {Array.from({ length: cantidad }, (_, i) => (
        <ProductoCardSkeleton key={i} />
      ))}
    </div>
  );
}
