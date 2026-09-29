import type { MarcaId } from "./types";

/**
 * Las URLs canónicas del catálogo, en un solo sitio.
 *
 * Hasta ahora el catálogo entero vivía en la portada y cada repuesto se abría en
 * una ventana modal, sin dirección propia. Para quien navega daba igual; para un
 * buscador significaba que el sitio tenía **dos** páginas indexables —la portada
 * y Nosotros— y ninguna cuyo tema fuera «culata Nissan X-Trail». Google no puede
 * posicionar lo que no tiene URL: por eso el catálogo solo aparecía cuando la
 * búsqueda incluía el nombre del negocio, que es lo único que la portada nombra.
 *
 * Con estas rutas cada repuesto es una página con su título, su descripción y su
 * canonical, y cada marca tiene la suya. Se centralizan aquí porque las escriben
 * cuatro sitios —tarjetas, ficha, sitemap y pie— y una ruta escrita a mano en
 * uno de ellos es un enlace roto que nadie nota hasta que lo rastrea Google.
 */

/** Índice del catálogo: la página que enlaza con todas las fichas. */
export const RUTA_CATALOGO = "/repuestos";

/** Ficha de un repuesto. El identificador ya viene saneado del catálogo. */
export const rutaProducto = (id: string) => `${RUTA_CATALOGO}/${id}`;

/** Listado de los repuestos de una marca de vehículo. */
export const rutaMarca = (marca: MarcaId) => `${RUTA_CATALOGO}/marca/${marca}`;
