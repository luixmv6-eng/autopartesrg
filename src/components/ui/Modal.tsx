"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  abierto: boolean;
  onCerrar: () => void;
  /** Id del elemento que titula el diálogo, para aria-labelledby. */
  labelledBy: string;
  /** `sheet` ancla el panel al borde inferior, como el drawer de filtros móvil. */
  variante?: "centrado" | "sheet";
  className?: string;
  children: React.ReactNode;
}

/**
 * Diálogo sobre `<dialog>` nativo: trampa de foco, cierre con Escape, `inert`
 * del resto de la página y backdrop los aporta el navegador. Aquí solo se
 * añade el cierre al pulsar fuera y la sincronización con React.
 */
export function Modal({
  abierto,
  onCerrar,
  labelledBy,
  variante = "centrado",
  className,
  children,
}: ModalProps) {
  const ref = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (abierto && !dialog.open) dialog.showModal();
    if (!abierto && dialog.open) dialog.close();
  }, [abierto]);

  const alHacerClick = (evento: React.MouseEvent<HTMLDialogElement>) => {
    // Un click cuyo target es el propio dialog cae fuera del panel.
    if (evento.target === ref.current) onCerrar();
  };

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onCancel={onCerrar}
      onClick={alHacerClick}
      aria-labelledby={labelledBy}
      className={cn(
        "border border-outline-variant/30 bg-surface-container-lowest p-0 text-on-surface shadow-e3 backdrop:cursor-pointer",
        variante === "sheet"
          ? // Hoja inferior. El área segura se reserva dentro para que el pie de
            // acciones no quede bajo el indicador de inicio del dispositivo.
            "sheet mb-0 mt-auto max-h-[88dvh] w-full rounded-t-xl pb-[env(safe-area-inset-bottom,0px)]"
          : // A pantalla completa en móvil, como la ficha de Stitch; centrada en
            // escritorio. La anchura sigue a `--ancho-contenido`, así que en un
            // monitor ancho la ficha crece con el resto del sitio en vez de
            // quedarse clavada en 1280px.
            "m-0 h-dvh max-h-dvh w-screen rounded-none sm:m-auto sm:h-auto sm:max-h-[calc(100dvh-var(--gutter)*2)] sm:w-[min(100vw-var(--gutter)*2,var(--ancho-contenido))] sm:rounded-xl",
        className
      )}
    >
      {children}
    </dialog>
  );
}
