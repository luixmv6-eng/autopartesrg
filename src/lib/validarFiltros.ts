import { CATEGORIAS, MARCAS, ORDENES, SECCIONES } from "./taxonomia";
import type { CategoriaId, MarcaId, OrdenId, SeccionId } from "./types";

/**
 * Saneado de los parámetros de la URL.
 *
 * El estado de los filtros viene de la query string, que es entrada de usuario:
 * cualquiera puede escribir lo que quiera en la barra de direcciones o repartir
 * un enlace manipulado. Antes esos valores se casteaban a ciegas
 * (`as MarcaId[]`), lo que dejaba pasar cadenas arbitrarias al estado de React
 * y de ahí a los chips que se pintan en pantalla.
 *
 * Aquí se descartan los valores que no pertenecen a la taxonomía, se acotan los
 * de texto y se rechazan los años fuera de rango. Lo que no encaja, se ignora.
 */

/** Tope de caracteres de los campos libres, para que un enlace no infle el DOM. */
const MAX_TEXTO = 80;

const ANIO_MIN = 1950;
const ANIO_MAX = new Date().getFullYear() + 2;

const IDS_MARCA = new Set<string>(MARCAS.map((m) => m.id));
const IDS_CATEGORIA = new Set<string>(CATEGORIAS.map((c) => c.id));
const IDS_SECCION = new Set<string>(SECCIONES.map((s) => s.id));
const IDS_ORDEN = new Set<string>(ORDENES.map((o) => o.id));

/** Deja solo los valores que existen en la taxonomía, sin repetidos. */
function filtrarConocidos<T extends string>(valores: string[], validos: Set<string>): T[] {
  const vistos = new Set<string>();
  const salida: T[] = [];
  for (const valor of valores) {
    if (validos.has(valor) && !vistos.has(valor)) {
      vistos.add(valor);
      salida.push(valor as T);
    }
  }
  return salida;
}

export const marcasValidas = (v: string[]) => filtrarConocidos<MarcaId>(v, IDS_MARCA);
export const categoriasValidas = (v: string[]) => filtrarConocidos<CategoriaId>(v, IDS_CATEGORIA);
export const seccionesValidas = (v: string[]) => filtrarConocidos<SeccionId>(v, IDS_SECCION);

/**
 * ¿Es un carácter de control? Se comprueba por punto de código en vez de con
 * una expresión regular, para no incrustar caracteres invisibles en el fuente.
 */
function esControl(caracter: string): boolean {
  const codigo = caracter.codePointAt(0) ?? 0;
  return codigo < 0x20 || (codigo >= 0x7f && codigo <= 0x9f);
}

/** Texto libre: sin caracteres de control, recortado y con longitud acotada. */
export function textoValido(valor: string | null): string {
  if (!valor) return "";
  let limpio = "";
  for (const caracter of valor) {
    if (!esControl(caracter)) limpio += caracter;
    if (limpio.length >= MAX_TEXTO) break;
  }
  return limpio.trim();
}

/** Año: entero de cuatro cifras dentro de un rango razonable, o nada. */
export function anioValido(valor: string | null): number | null {
  if (!valor || !/^\d{4}$/.test(valor)) return null;
  const n = Number(valor);
  return n >= ANIO_MIN && n <= ANIO_MAX ? n : null;
}

/** Orden: uno de los declarados, o el de por defecto. */
export function ordenValido(valor: string | null): OrdenId {
  return valor !== null && IDS_ORDEN.has(valor) ? (valor as OrdenId) : "relevancia";
}
