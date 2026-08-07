/**
 * Serialización segura de JSON-LD para incrustar en un `<script>`.
 *
 * `JSON.stringify` no escapa `<`, así que un dato que contuviera `</script>`
 * cerraría la etiqueta antes de tiempo y el navegador interpretaría el resto
 * como marcado. Hoy los datos son constantes del repositorio, pero en cuanto
 * vengan de un CMS o de una API eso es una vía de inyección directa.
 *
 * Se escapan también U+2028 y U+2029: son saltos de línea válidos en JavaScript
 * pero no en JSON, y rompen el script si aparecen sin escapar.
 *
 * Los separadores se construyen por punto de código a propósito, para no
 * incrustar caracteres invisibles en este archivo.
 */
const SEPARADOR_LINEA = String.fromCharCode(0x2028);
const SEPARADOR_PARRAFO = String.fromCharCode(0x2029);

const SUSTITUCIONES: ReadonlyArray<readonly [string, string]> = [
  ["<", "\\u003c"],
  [">", "\\u003e"],
  ["&", "\\u0026"],
  [SEPARADOR_LINEA, "\\u2028"],
  [SEPARADOR_PARRAFO, "\\u2029"],
];

export function serializarJsonLd(datos: unknown): string {
  let salida = JSON.stringify(datos) ?? "{}";
  for (const [caracter, escape] of SUSTITUCIONES) {
    salida = salida.split(caracter).join(escape);
  }
  return salida;
}
