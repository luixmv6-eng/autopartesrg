"use client";

import { Icon } from "./Icon";

interface ChipProps {
  grupo: string;
  valor: string;
  onQuitar: () => void;
}

/**
 * Chip de filtro activo. Píldora `primary-container` con la X integrada,
 * igual que en el catálogo de Stitch. Toda la píldora quita el filtro.
 */
export function Chip({ grupo, valor, onQuitar }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onQuitar}
      aria-label={`Quitar filtro ${grupo}: ${valor}`}
      className="group inline-flex h-9 shrink-0 items-center gap-sm rounded-full border border-primary-fixed-dim bg-primary-container px-3 font-mono text-label-technical text-on-primary-container transition-[background-color,border-color,scale] duration-200 hover:scale-[1.03] hover:border-error/40 hover:bg-error/10 hover:text-error active:scale-95"
    >
      <span>
        {grupo}: {valor}
      </span>
      <Icon
        name="close"
        size={16}
        className="transition-transform duration-200 group-hover:rotate-90"
      />
    </button>
  );
}
