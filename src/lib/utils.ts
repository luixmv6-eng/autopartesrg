import { LABEL_MARCA } from "./taxonomia";
import type { Producto } from "./types";

/** Une clases condicionales sin arrastrar dependencias. */
export function cn(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(" ");
}

/** Rango de años de compatibilidad, en el formato de la ficha técnica. */
export function rangoAniosLegible(desde: number, hasta: number): string {
  return desde === hasta ? String(desde) : `${desde}-${hasta}`;
}

/**
 * Modelo que llevan los repuestos cuya aplicación no viene marcada en la pieza.
 *
 * Son pocos y reales: una lágrima de barra estabilizadora sin referencia, un
 * amortiguador del que la foto solo confirma la marca. Antes que inventarles un
 * modelo —que un taller cruzaría contra su despiece y pediría mal— se declaran
 * así y la aplicación se cierra por WhatsApp.
 */
export const MODELO_GENERICO = "Varios modelos";

/**
 * Cómo se nombra el vehículo de un repuesto.
 *
 * Casi siempre es "Nissan Kicks". Los de marca `universal` no tienen marca que
 * anteponer: concatenar las dos partes daba "Universal / varias Varios
 * modelos". Ahí manda el modelo solo.
 */
export function nombrarVehiculo(producto: Producto, modelo: string): string {
  if (producto.marca === "universal") return modelo;
  return `${LABEL_MARCA[producto.marca]} ${modelo}`;
}

/** Todos los modelos compatibles, ya con su marca delante. */
export function listarCompatibles(producto: Producto): string {
  return producto.modelos.map((m) => nombrarVehiculo(producto, m)).join(", ");
}
