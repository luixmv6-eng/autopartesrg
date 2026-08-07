import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Píldora técnica para OEM y SKU.
 *
 * El catálogo no muestra condición ni disponibilidad: sin un sistema de stock
 * detrás, esas etiquetas prometerían algo que no se puede sostener. Se
 * confirman por WhatsApp.
 */
export function BadgeTecnico({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-md border border-outline-variant bg-surface-container px-sm py-xs font-mono text-label-technical tracking-[0.04em] text-on-surface-variant",
        className
      )}
    >
      {children}
    </span>
  );
}
