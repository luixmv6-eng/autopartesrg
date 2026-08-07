import raw from "@/data/productos.json";
import type { EstadoFiltros, Producto } from "./types";

/**
 * Fuente de datos del catálogo.
 *
 * Está deliberadamente desacoplada: hoy lee un JSON local, mañana puede ser
 * `await fetch(process.env.API_URL)` o un cliente de CMS. Nada fuera de este
 * archivo sabe de dónde vienen los productos.
 */
export const PRODUCTOS = raw as Producto[];

export function getProducto(id: string): Producto | undefined {
  return PRODUCTOS.find((p) => p.id === id);
}

/** Rango de años cubierto por el catálogo, para poblar el selector de año. */
export function rangoAnios(productos: Producto[] = PRODUCTOS): number[] {
  const min = Math.min(...productos.map((p) => p.anioDesde));
  const max = Math.max(...productos.map((p) => p.anioHasta));
  const anios: number[] = [];
  for (let a = max; a >= min; a -= 1) anios.push(a);
  return anios;
}

/** Cuántos productos hay por categoría. */
export function conteoPorCategoria(productos: Producto[] = PRODUCTOS) {
  return productos.reduce<Record<string, number>>((acc, p) => {
    acc[p.categoria] = (acc[p.categoria] ?? 0) + 1;
    return acc;
  }, {});
}

/** Minúsculas y sin tildes, para que "suspension" encuentre "suspensión". */
const normalizar = (valor: string) =>
  valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

/** Texto indexable: nombre, OEM, SKU, marca, modelos, categoría y sección. */
function textoBuscable(p: Producto): string {
  return normalizar(
    [p.nombre, p.oem, p.sku, p.marca, p.categoria, p.seccion, ...p.modelos].join(" ")
  );
}

/**
 * Repuestos relacionados: misma categoría primero, luego misma sección y marca.
 * Alimenta el bloque "Repuestos Relacionados" de la ficha técnica.
 */
export function relacionados(producto: Producto, limite = 4): Producto[] {
  const puntuar = (p: Producto) =>
    (p.categoria === producto.categoria ? 2 : 0) +
    (p.seccion === producto.seccion ? 1 : 0) +
    (p.marca === producto.marca ? 1 : 0);

  return PRODUCTOS.filter((p) => p.id !== producto.id)
    .map((p) => ({ p, punto: puntuar(p) }))
    .filter(({ punto }) => punto > 0)
    .sort((a, b) => b.punto - a.punto)
    .slice(0, limite)
    .map(({ p }) => p);
}

const indice = new Map<string, string>(PRODUCTOS.map((p) => [p.id, textoBuscable(p)]));

export function filtrarProductos(
  filtros: EstadoFiltros,
  productos: Producto[] = PRODUCTOS
): Producto[] {
  const termino = normalizar(filtros.q.trim());
  const palabras = termino ? termino.split(/\s+/) : [];
  const modelo = normalizar(filtros.modelo.trim());

  const resultado = productos.filter((p) => {
    if (palabras.length) {
      const texto = indice.get(p.id) ?? textoBuscable(p);
      if (!palabras.every((w) => texto.includes(w))) return false;
    }
    if (filtros.marcas.length && !filtros.marcas.includes(p.marca)) return false;
    if (filtros.categorias.length && !filtros.categorias.includes(p.categoria)) return false;
    if (filtros.secciones.length && !filtros.secciones.includes(p.seccion)) return false;
    if (modelo && !p.modelos.some((m) => normalizar(m).includes(modelo))) return false;
    if (filtros.anio !== null && (filtros.anio < p.anioDesde || filtros.anio > p.anioHasta)) {
      return false;
    }
    return true;
  });

  return ordenar(resultado, filtros.orden);
}

function ordenar(productos: Producto[], orden: EstadoFiltros["orden"]): Producto[] {
  const copia = [...productos];
  switch (orden) {
    case "nombre":
      return copia.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    default:
      return copia.sort((a, b) => Number(b.destacado ?? false) - Number(a.destacado ?? false));
  }
}
