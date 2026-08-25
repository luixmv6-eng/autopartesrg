import type { EstadoFiltros, Producto } from "./types";

/**
 * Operaciones sobre el catálogo.
 *
 * Antes este archivo exportaba `PRODUCTOS`, una constante creada al importar el
 * JSON. Eso ataba el catálogo al momento de compilar: para cambiar un repuesto
 * había que volver a construir el sitio entero.
 *
 * Ahora no hay constante. Todas las funciones reciben la lista por parámetro y
 * quien la tiene es la página, que la lee del disco en cada visita. Así el panel
 * de administración puede escribir un producto y verse publicado en segundos,
 * sin recompilar nada.
 *
 * El efecto secundario es que este módulo quedó sin estado y sin dependencias:
 * son funciones puras que valen igual en el servidor y en el navegador.
 */

/** Rango de años cubierto por el catálogo, para poblar el selector de año. */
export function rangoAnios(productos: Producto[]): number[] {
  if (productos.length === 0) return [];
  const min = Math.min(...productos.map((p) => p.anioDesde));
  const max = Math.max(...productos.map((p) => p.anioHasta));
  const anios: number[] = [];
  for (let a = max; a >= min; a -= 1) anios.push(a);
  return anios;
}

/** Cuántos productos hay por categoría. */
export function conteoPorCategoria(productos: Producto[]) {
  return productos.reduce<Record<string, number>>((acc, p) => {
    if (!p.categoria) return acc;
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

/**
 * Texto indexable: nombre, número de parte, marca, modelos, categoría y sección.
 *
 * También la descripción, porque es donde vive el dato que el taller conoce y
 * que no cabe en el nombre: el código del bloque (`YD22`, `6G72`, `4KH1`), la
 * marca del repuesto (`Aisin`, `Dayco`, `NSK`) o la referencia del fabricante.
 */
function textoBuscable(p: Producto): string {
  return normalizar(
    [p.nombre, p.oem ?? "", p.descripcion, p.marca, p.categoria ?? "", p.seccion ?? "", ...p.modelos].join(" ")
  );
}

/**
 * Índice de búsqueda, recalculado solo cuando cambia la lista.
 *
 * Se guarda contra la identidad del array, no contra su contenido: mientras la
 * página siga sirviendo la misma lista, el índice se reutiliza; cuando el panel
 * guarda y llega una lista nueva, se descarta sola. Sin esto se normalizaría el
 * texto de todos los productos en cada pulsación del buscador.
 */
let indiceCache: { lista: Producto[]; mapa: Map<string, string> } | null = null;

function indiceDe(productos: Producto[]): Map<string, string> {
  if (indiceCache?.lista === productos) return indiceCache.mapa;
  const mapa = new Map(productos.map((p) => [p.id, textoBuscable(p)]));
  indiceCache = { lista: productos, mapa };
  return mapa;
}

/**
 * Repuestos relacionados: misma categoría primero, luego misma sección y marca.
 * Alimenta el bloque "Repuestos Relacionados" de la ficha técnica.
 */
export function relacionados(
  producto: Producto,
  productos: Producto[],
  limite = 4
): Producto[] {
  /*
   * La categoría y la sección son opcionales, así que solo puntúan cuando las
   * dos partes la tienen. Sin la guarda, dos repuestos sin clasificar sumarían
   * puntos por parecerse en un dato que ninguno de los dos tiene.
   */
  const puntuar = (p: Producto) =>
    (producto.categoria && p.categoria === producto.categoria ? 2 : 0) +
    (producto.seccion && p.seccion === producto.seccion ? 1 : 0) +
    (p.marca === producto.marca ? 2 : 0);

  return productos
    .filter((p) => p.id !== producto.id)
    .map((p) => ({ p, punto: puntuar(p) }))
    .filter(({ punto }) => punto > 0)
    .sort((a, b) => b.punto - a.punto)
    .slice(0, limite)
    .map(({ p }) => p);
}

export function filtrarProductos(filtros: EstadoFiltros, productos: Producto[]): Producto[] {
  const termino = normalizar(filtros.q.trim());
  const palabras = termino ? termino.split(/\s+/) : [];
  const modelo = normalizar(filtros.modelo.trim());
  const indice = palabras.length ? indiceDe(productos) : null;

  const resultado = productos.filter((p) => {
    if (palabras.length) {
      const texto = indice?.get(p.id) ?? textoBuscable(p);
      if (!palabras.every((w) => texto.includes(w))) return false;
    }
    if (filtros.marcas.length && !filtros.marcas.includes(p.marca)) return false;
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
