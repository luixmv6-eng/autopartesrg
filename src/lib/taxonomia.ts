import type { CategoriaId, MarcaId, OrdenId, SeccionId } from "./types";

export interface Opcion<T extends string> {
  id: T;
  label: string;
}

/**
 * Las tres taxonomías salen del catálogo real, no al revés.
 *
 * Cada opción que se lista aquí aparece como casilla en la barra de filtros,
 * y una casilla que siempre devuelve cero resultados es ruido: el usuario la
 * marca, no pasa nada y deja de confiar en el resto. Por eso no hay marcas,
 * categorías ni secciones "de reserva" esperando a que algún día entre un
 * repuesto que las use. Cuando el catálogo crezca, se añaden aquí.
 *
 * `npm run verificar:taxonomia` comprueba la correspondencia en los dos
 * sentidos: que ninguna opción esté vacía y que ningún producto apunte a un
 * identificador que no exista.
 *
 * Las **marcas** son la excepción: se administran desde el panel y viven en los
 * datos. Aquí abajo solo queda la lista con la que se siembran.
 */

/**
 * Marcas de arranque.
 *
 * A diferencia de categorías y secciones, esta lista **no es la fuente de
 * verdad**: solo siembra `marcas.json` la primera vez que arranca el sitio. A
 * partir de ahí manda el archivo de datos, porque la empresa añade marcas desde
 * el panel sin tocar el código.
 *
 * `LABEL_MARCA` de abajo sirve de respaldo para las marcas de siempre; lo que
 * se pinta en pantalla sale del contexto `MarcasProvider`, que lleva la lista
 * viva.
 */
export const MARCAS_INICIALES: Opcion<MarcaId>[] = [
  { id: "chevrolet", label: "Chevrolet" },
  { id: "ford", label: "Ford" },
  { id: "hyundai", label: "Hyundai" },
  { id: "isuzu", label: "Isuzu" },
  { id: "kia", label: "Kia" },
  { id: "lexus", label: "Lexus" },
  { id: "mazda", label: "Mazda" },
  { id: "mitsubishi", label: "Mitsubishi" },
  { id: "nissan", label: "Nissan" },
  { id: "renault", label: "Renault" },
  { id: "suzuki", label: "Suzuki" },
  { id: "toyota", label: "Toyota" },
  { id: "volkswagen", label: "Volkswagen" },
  { id: "universal", label: "Universal / varias" },
];

export const CATEGORIAS: Opcion<CategoriaId>[] = [
  { id: "motor", label: "Motor" },
  { id: "transmision", label: "Transmisión y embrague" },
  { id: "suspension", label: "Suspensión y dirección" },
  { id: "frenos", label: "Frenos" },
  { id: "refrigeracion", label: "Refrigeración" },
  { id: "combustible", label: "Alimentación y combustible" },
  { id: "electrico", label: "Eléctrico" },
  { id: "filtros", label: "Filtros" },
  { id: "carroceria", label: "Carrocería" },
];

export const SECCIONES: Opcion<SeccionId>[] = [
  { id: "motor", label: "Motor" },
  { id: "transmision", label: "Caja y embrague" },
  { id: "tren-delantero", label: "Tren delantero" },
  { id: "tren-trasero", label: "Tren trasero" },
  { id: "sistema-frenos", label: "Sistema de frenos" },
  { id: "sistema-electrico", label: "Sistema eléctrico" },
  { id: "exterior", label: "Exterior" },
];

export const ORDENES: Opcion<OrdenId>[] = [
  { id: "relevancia", label: "Destacados primero" },
  { id: "nombre", label: "Nombre A a Z" },
];

const buildLookup = <T extends string>(opciones: Opcion<T>[]) =>
  Object.fromEntries(opciones.map((o) => [o.id, o.label])) as Record<T, string>;

export const LABEL_MARCA = buildLookup(MARCAS_INICIALES);
export const LABEL_CATEGORIA = buildLookup(CATEGORIAS);
export const LABEL_SECCION = buildLookup(SECCIONES);
