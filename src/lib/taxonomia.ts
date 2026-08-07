import type { CategoriaId, MarcaId, OrdenId, SeccionId } from "./types";

export interface Opcion<T extends string> {
  id: T;
  label: string;
}

export const MARCAS: Opcion<MarcaId>[] = [
  { id: "toyota", label: "Toyota" },
  { id: "chevrolet", label: "Chevrolet" },
  { id: "ford", label: "Ford" },
  { id: "hyundai", label: "Hyundai" },
  { id: "kia", label: "Kia" },
  { id: "nissan", label: "Nissan" },
  { id: "mazda", label: "Mazda" },
  { id: "suzuki", label: "Suzuki" },
  { id: "volkswagen", label: "Volkswagen" },
  { id: "renault", label: "Renault" },
];

export const CATEGORIAS: Opcion<CategoriaId>[] = [
  { id: "motor", label: "Motor" },
  { id: "frenos", label: "Frenos" },
  { id: "suspension", label: "Suspensión" },
  { id: "electrico", label: "Eléctrico" },
  { id: "carroceria", label: "Carrocería" },
  { id: "transmision", label: "Transmisión" },
  { id: "filtros", label: "Filtros" },
  { id: "refrigeracion", label: "Refrigeración" },
];

export const SECCIONES: Opcion<SeccionId>[] = [
  { id: "motor", label: "Motor" },
  { id: "exterior", label: "Exterior" },
  { id: "interior", label: "Interior" },
  { id: "chasis", label: "Chasis" },
  { id: "sistema-electrico", label: "Sistema eléctrico" },
  { id: "sistema-frenos", label: "Sistema de frenos" },
  { id: "tren-delantero", label: "Tren delantero" },
  { id: "tren-trasero", label: "Tren trasero" },
];

export const ORDENES: Opcion<OrdenId>[] = [
  { id: "relevancia", label: "Destacados primero" },
  { id: "nombre", label: "Nombre A a Z" },
];

const buildLookup = <T extends string>(opciones: Opcion<T>[]) =>
  Object.fromEntries(opciones.map((o) => [o.id, o.label])) as Record<T, string>;

export const LABEL_MARCA = buildLookup(MARCAS);
export const LABEL_CATEGORIA = buildLookup(CATEGORIAS);
export const LABEL_SECCION = buildLookup(SECCIONES);
