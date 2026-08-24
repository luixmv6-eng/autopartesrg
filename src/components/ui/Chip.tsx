"use client";

import { useRef, useState } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

interface ChipProps {
  grupo: string;
  valor: string;
  onQuitar: () => void;
}

/**
 * Duración de la salida, en milisegundos. Tiene que coincidir con
 * `--dur-salida` de `globals.css`: aquí se necesita el número porque el
 * temporizador vive en JavaScript.
 */
const MS_SALIDA = 160;

/**
 * Chip de filtro activo. Píldora `primary-container` con la X integrada,
 * igual que en el catálogo de Stitch. Toda la píldora quita el filtro.
 *
 * Al quitarlo se encoge y se desvanece antes de irse, en lugar de desaparecer
 * de golpe. No es adorno: en una fila de cuatro o cinco chips, uno que se
 * esfuma sin transición hace que los de su derecha salten de sitio y cuesta
 * saber cuál se ha ido. Encogiendo, la vista sigue el hueco.
 *
 * El filtro se retira de la URL al terminar la salida. Son 160ms, por debajo
 * del umbral en que una interfaz empieza a sentirse lenta, y a cambio la
 * acción se lee como algo que ha ocurrido y no como un parpadeo.
 */
export function Chip({ grupo, valor, onQuitar }: ChipProps) {
  const [saliendo, setSaliendo] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const quitar = () => {
    // Doble clic sobre el mismo chip: la primera pulsación ya lo está sacando.
    if (temporizador.current) return;
    setSaliendo(true);
    temporizador.current = setTimeout(onQuitar, MS_SALIDA);
  };

  return (
    <button
      type="button"
      onClick={quitar}
      disabled={saliendo}
      aria-label={`Quitar filtro ${grupo}: ${valor}`}
      title={`Quitar filtro ${grupo}: ${valor}`}
      className={cn(
        "group inline-flex h-9 max-w-full shrink-0 items-center gap-sm rounded-full border border-primary-fixed-dim bg-primary-container px-3 font-mono text-label-technical text-on-primary-container",
        "transition-[background-color,border-color,scale,opacity] duration-[var(--dur-rapida)]",
        saliendo
          ? "pointer-events-none opacity-0 motion-safe:scale-75"
          : "motion-safe:hover:scale-[1.03] hover:border-error/40 hover:bg-error/10 hover:text-error motion-safe:active:scale-95"
      )}
    >
      <span className="min-w-0 truncate">
        {grupo}: {valor}
      </span>
      <Icon
        name="close"
        size={16}
        className="shrink-0 transition-transform duration-[var(--dur-rapida)] motion-safe:group-hover:rotate-90"
      />
    </button>
  );
}
