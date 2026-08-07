"use client";

import { Icon } from "./Icon";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Resultados que quedarían al aplicar esta opción. */
  conteo?: number;
}

export function Checkbox({ id, label, checked, onChange, conteo }: CheckboxProps) {
  const deshabilitado = conteo === 0 && !checked;
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-11 items-center gap-sm rounded px-2 text-body-md transition-colors",
        deshabilitado
          ? "cursor-not-allowed opacity-45"
          : "cursor-pointer hover:bg-surface-container-highest has-[:focus-visible]:bg-surface-container-highest"
      )}
    >
      <span className="relative grid size-4 shrink-0 place-items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={deshabilitado}
          onChange={(e) => onChange(e.target.checked)}
          className="peer size-4 cursor-pointer appearance-none rounded-[3px] border border-outline-variant bg-surface-container-lowest transition-colors checked:border-primary checked:bg-primary disabled:cursor-not-allowed"
        />
        <Icon
          name="check"
          size={13}
          filled
          className="pointer-events-none absolute text-on-primary opacity-0 transition-opacity peer-checked:opacity-100"
        />
      </span>
      <span className="flex-1 text-label-sm text-on-surface sm:text-body-md">{label}</span>
      {typeof conteo === "number" && (
        <span className="tabular font-mono text-label-sm text-on-surface-variant">{conteo}</span>
      )}
    </label>
  );
}
