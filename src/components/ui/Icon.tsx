import { cn } from "@/lib/utils";

/**
 * Iconos disponibles. La lista debe coincidir con la de
 * `scripts/descargar-iconos.mjs`, que genera el subconjunto de la fuente.
 * Al añadir uno aquí hay que volver a ejecutar `npm run iconos`.
 */
export type IconName =
  | "account_tree"
  | "arrow_forward"
  | "build_circle"
  | "calendar_today"
  | "call"
  | "category"
  | "chat"
  | "check"
  | "check_circle"
  | "chevron_right"
  | "close"
  | "directions_car"
  | "edit"
  | "expand_more"
  | "forum"
  | "history"
  | "home"
  | "insights"
  | "inventory_2"
  | "local_shipping"
  | "mail"
  | "precision_manufacturing"
  | "refresh"
  | "search"
  | "settings_input_component"
  | "storefront"
  | "tune"
  | "verified"
  | "zoom_in";

interface IconProps {
  name: IconName;
  /** Tamaño en píxeles. Material Symbols se dimensiona por font-size. */
  size?: number;
  /** Variante rellena del glifo (eje FILL de la fuente variable). */
  filled?: boolean;
  className?: string;
}

/**
 * Los iconos son decorativos: el texto adyacente o el aria-label del control
 * que los contiene aporta el nombre accesible.
 */
export function Icon({ name, size = 24, filled, className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      translate="no"
      className={cn("material-symbols-outlined", filled && "filled", className)}
      style={{ fontSize: `${size}px` }}
    >
      {name}
    </span>
  );
}
