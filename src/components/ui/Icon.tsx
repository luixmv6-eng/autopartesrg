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

/**
 * Escala de tamaños. Material Symbols se dimensiona por `font-size`.
 *
 * Es una unión de literales y no un `number` a propósito, igual que `IconName`:
 * un tamaño fuera de la escala no compila. Había nueve valores distintos
 * repartidos por el sitio (13, 15, 16, 18, 20, 22, 24, 26 y 28), elegidos a ojo
 * uno por uno, y eso rompe el ritmo visual aunque cada uno por separado
 * parezca razonable.
 *
 *   16  dentro de texto corrido y en etiquetas
 *   18  botones y controles compactos
 *   20  controles estándar y campos
 *   24  cabeceras, navegación y acciones destacadas
 *   28  ilustrativo, solo en encabezados de sección
 */
export type IconSize = 16 | 18 | 20 | 24 | 28;

interface IconProps {
  name: IconName;
  size?: IconSize;
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
