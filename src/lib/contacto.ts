/**
 * Datos de contacto del negocio, centralizados para editarlos en un solo sitio
 * (footer, datos estructurados y metadatos).
 *
 * No hay dirección: el comercio no tiene punto de venta físico. Por eso los
 * datos estructurados lo describen como `Organization` y no como `Store` o
 * `LocalBusiness`, que exigen una ubicación real y penalizarían al declararla
 * en falso.
 *
 * Los valores son de ejemplo: sustitúyelos por los reales antes de publicar.
 */
export const CONTACTO = {
  nombre: "AutopartesRG",
  descripcion:
    "Catálogo digital de repuestos y autopartes con cotización directa por WhatsApp.",
  correo: "ventas@autopartesrg.com",
  telefono: "+57 601 742 8890",
  /** Zona a la que se despacha. Sustituye a la dirección física. */
  cobertura: "Cobertura nacional en Colombia",
  pais: "CO",
  redes: [
    { id: "facebook", nombre: "Facebook", url: "https://facebook.com/autopartesrg" },
    { id: "instagram", nombre: "Instagram", url: "https://instagram.com/autopartesrg" },
    { id: "tiktok", nombre: "TikTok", url: "https://tiktok.com/@autopartesrg" },
  ],
} as const;

/** Redes admitidas. Añadir una implica añadir su glifo en `IconoRed`. */
export type RedId = (typeof CONTACTO.redes)[number]["id"];

/**
 * URL pública del sitio. Se usa en metadatos, sitemap y datos estructurados.
 *
 * Se normaliza a origen sin barra final y se valida el protocolo: una variable
 * de entorno mal puesta (por ejemplo `javascript:`) no debe acabar siendo el
 * `href` de un canonical.
 */
function resolverSiteUrl(): string {
  const bruto = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!bruto) return "https://autopartesrg.com";
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
    return "https://autopartesrg.com";
  }
}

export const SITE_URL = resolverSiteUrl();
