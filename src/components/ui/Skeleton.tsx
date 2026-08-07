import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded bg-surface-container", className)} />;
}

/** Misma forma que ProductoCard, para que el grid no salte al cargar. */
export function ProductoCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
      <Skeleton className="h-40 w-full rounded-none sm:h-48" />
      <div className="flex flex-col gap-sm p-md">
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

export function GridSkeleton({ cantidad = 6 }: { cantidad?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-sm sm:gap-lg lg:grid-cols-3"
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
