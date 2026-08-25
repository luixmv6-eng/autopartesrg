/**
 * Rango de años admitido para la compatibilidad de un repuesto.
 *
 * Vive en su propio módulo porque lo necesitan dos sitios que no deberían
 * discrepar nunca:
 *
 *   - `admin/esquema.ts`, al guardar un repuesto desde el panel;
 *   - `validarFiltros.ts`, al leer `?anio=` de la dirección.
 *
 * Estaba duplicado en los dos. Mientras coincidieran no pasaba nada, pero en
 * cuanto uno se tocara sin el otro aparecería el peor de los fallos: se podría
 * guardar un repuesto hasta 2040 y, al compartir el enlace del catálogo
 * filtrado por 2040, el filtro descartaría ese año y la página saldría sin
 * resultados. Un solo valor, imposible que se separen.
 *
 * ## Sobre el tope superior
 *
 * Es una fecha fija y lejana, no un margen sobre el año en curso.
 *
 * Antes era «año actual + N», y eso obligaba a elegir un margen: corto
 * bloqueaba entradas legítimas, largo dejaba de cazar erratas. Peor aún, hacía
 * que el mismo dato fuera válido un año e inválido el anterior. Con un tope
 * absoluto, un repuesto declarado hasta 2040 se guarda hoy igual que en 2035, y
 * nadie tiene que volver a tocar este archivo nunca.
 *
 * **El tope no está para opinar sobre qué años son razonables.** Está para dos
 * cosas concretas:
 *
 * 1. Cazar erratas evidentes. Un `9999` tecleado de más se rechaza.
 * 2. Acotar el desplegable de años del catálogo. `rangoAnios` genera una opción
 *    por cada año entre el mínimo y el máximo publicados: con un `9999` colado,
 *    el selector pasaría a tener casi ocho mil entradas y quedaría inservible.
 *    Entre 1950 y 2100 caben 151, que un `<select>` maneja sin despeinarse.
 *
 * ## Y el desplegable de años del catálogo
 *
 * No sale de aquí. Se calcula a partir de los años que realmente usan los
 * repuestos publicados (`rangoAnios`), así que ofrecer un año nuevo no requiere
 * tocar nada: en cuanto se guarda un repuesto que llega hasta 2040, el 2040
 * aparece en el filtro. Y al revés, nunca se ofrece un año que no tenga
 * repuestos detrás.
 */

/** El parque automotor más antiguo que tiene sentido catalogar. */
export const ANIO_MIN = 1950;

/**
 * Techo absoluto. Generoso a propósito: que nadie choque con él editando.
 *
 * Si alguna vez hiciera falta pasar de aquí, el sitio llevará décadas
 * funcionando y este será el menor de los cambios pendientes.
 */
export const ANIO_MAX = 2100;
