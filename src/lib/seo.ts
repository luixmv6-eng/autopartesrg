import { CONTACTO, SITE_URL } from "./contacto";

/**
 * Datos estructurados del sitio.
 *
 * El negocio no tiene punto de venta físico, así que se describe como
 * `Organization` y no como `Store` / `AutoPartsStore` / `LocalBusiness`: esos
 * tipos esperan `address` y `geo` reales, y declararlos en falso es motivo de
 * acción manual por spam de datos estructurados.
 *
 * `areaServed` sustituye a la dirección: expresa a dónde se despacha sin
 * afirmar que exista una sede. Tampoco se declara horario de atención, porque
 * el sitio no lo publica.
 */
export function organizacionSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organizacion`,
    name: CONTACTO.nombre,
    description: CONTACTO.descripcion,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/opengraph-image`,
      width: 1200,
      height: 630,
    },
    areaServed: {
      "@type": "Country",
      name: "Colombia",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: CONTACTO.telefono,
      email: CONTACTO.correo,
      availableLanguage: ["es"],
    },
    sameAs: CONTACTO.redes.map((r) => r.url),
  };
}

/**
 * El sitio, con su buscador declarado. Permite que el catálogo aparezca como
 * caja de búsqueda en los resultados.
 */
export function sitioSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#sitio`,
    url: SITE_URL,
    name: CONTACTO.nombre,
    description: CONTACTO.descripcion,
    inLanguage: "es-CO",
    publisher: { "@id": `${SITE_URL}/#organizacion` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}#catalogo`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Migas de pan para las páginas que cuelgan de la portada. */
export function migasSchema(items: Array<{ nombre: string; ruta: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: SITE_URL,
      },
      ...items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: item.nombre,
        item: `${SITE_URL}${item.ruta}`,
      })),
    ],
  };
}
