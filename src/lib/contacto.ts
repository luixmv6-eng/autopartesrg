/**
 * Datos de contacto del negocio, centralizados para editarlos en un solo sitio
 * (footer, datos estructurados y metadatos).
 *
 * No hay dirección: el comercio no tiene punto de venta físico. Por eso los
 * datos estructurados lo describen como `Organization` y no como `Store` o
 * `LocalBusiness`, que exigen una ubicación real y penalizarían al declararla
 * en falso.
 *
 * Es la única fuente de estos datos: el pie de página, los metadatos y los
 * datos estructurados los leen de aquí, así que se cambian en un solo sitio.
 */
export const CONTACTO = {
  nombre: "Autopartes ERG",
  descripcion:
    "Catálogo digital de repuestos y autopartes con cotización directa por WhatsApp.",
  correo: "autoparteserg@gmail.com",
  telefono: "+57 316 401 5318",
  /** Zona a la que se despacha. Sustituye a la dirección física. */
  cobertura: "Cobertura nacional en Colombia",
  pais: "CO",
  /**
   * Número de WhatsApp, solo dígitos y con código de país.
   *
   * Vive aquí y no en una variable de entorno porque es un dato público del
   * negocio, igual que el teléfono: incrustado en el enlace `wa.me` que va en el
   * HTML, no hay nada que ocultar. Tenerlo en el código evita el fallo silencioso
   * de desplegar sin configurarlo, que dejaba el botón de cotizar sin destinatario
   * en las cincuenta fichas.
   */
  whatsapp: "573164015318",
  /**
   * Solo las redes que existen de verdad.
   *
   * Añadir una obliga a añadir su glifo en `IconoRed`; el compilador lo exige,
   * porque `RedId` sale de esta misma lista.
   */
  redes: [
    {
      id: "facebook",
      nombre: "Facebook",
      url: "https://www.facebook.com/profile.php?id=100089236563161",
    },
    // Sin el parámetro `igsi` del enlace para compartir: es un identificador de
    // seguimiento de la sesión desde la que se copió, no forma parte del perfil.
    { id: "instagram", nombre: "Instagram", url: "https://www.instagram.com/autoparteserg" },
  ],
} as const;

/** Redes admitidas. Añadir una implica añadir su glifo en `IconoRed`. */
export type RedId = (typeof CONTACTO.redes)[number]["id"];

/**
 * Dominio definitivo del negocio, registrado el 2026-08-27.
 *
 * Es el respaldo de `NEXT_PUBLIC_SITE_URL` y vive en un único sitio a
 * propósito: antes había dos copias literales aquí y otra variante distinta en
 * `.env.example`, y ninguna de ellas era el dominio real. Con un solo valor no
 * pueden desincronizarse.
 *
 * Sin `www` y en `https`: es la forma canónica que se declara en el canonical,
 * el sitemap y `robots.txt`. Si algún día se sirve también `www`, tiene que
 * redirigir aquí con 301 y no responder por su cuenta: dos dominios sirviendo
 * el mismo catálogo reparten la señal entre los dos.
 */
const SITE_URL_POR_DEFECTO = "https://autopartesergsas.com";

/**
 * URL pública del sitio. Se usa en metadatos, sitemap y datos estructurados.
 *
 * Se normaliza a origen sin barra final y se valida el protocolo: una variable
 * de entorno mal puesta (por ejemplo `javascript:`) no debe acabar siendo el
 * `href` de un canonical.
 */
function resolverSiteUrl(): string {
  const bruto = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!bruto) return SITE_URL_POR_DEFECTO;
  try {
    const url = new URL(bruto);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error(`protocolo no admitido: ${url.protocol}`);
    }
    return url.origin;
  } catch {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`NEXT_PUBLIC_SITE_URL no es una URL válida: ${bruto}`);
    }
    return SITE_URL_POR_DEFECTO;
  }
}

export const SITE_URL = resolverSiteUrl();
