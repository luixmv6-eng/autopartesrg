import { CONTACTO, SITE_URL } from "./contacto";
import { listarCompatibles, rangoAniosLegible, type EtiquetaMarca } from "./utils";
import type { Producto } from "./types";

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

/**
 * El catálogo completo como datos estructurados.
 *
 * Los cincuenta repuestos ya viajan en el HTML, así que Google puede leerlos;
 * lo que no puede es deducir que la portada es un catálogo ni qué hay en cada
 * entrada. Con esto pasa de ver una lista de frases a ver una lista declarada,
 * con el nombre, la foto y la compatibilidad de cada repuesto.
 *
 * ## Por qué las entradas ya no son `Product`
 *
 * Lo fueron, y Search Console lo marcó como error crítico de «Fragmentos de
 * productos»: *debe especificarse `offers`, `review` o `aggregateRating`*.
 * Ninguno de los tres se puede declarar aquí sin mentir: el catálogo no publica
 * precio ni disponibilidad a propósito —es un índice de compatibilidad, no un
 * inventario— y no hay reseñas. `offers` sin `price` tampoco vale: cambia un
 * error por otro, y precios o valoraciones inventados en el marcado son motivo
 * de acción manual.
 *
 * Sin ninguno de los tres, el repuesto nunca podía salir como resultado
 * enriquecido de producto. El tipo `Product` no ganaba nada, y a cambio dejaba
 * cincuenta elementos inválidos en el informe. Los datos siguen aquí, ahora en
 * las propiedades que `ListItem` sí admite, que es además el marcado que Google
 * pide para una página de listado.
 *
 * El día que el negocio publique precio y disponibilidad reales por repuesto,
 * y cada uno tenga su propia URL, esto vuelve a ser `Product` con su `offers`
 * — y entonces sí opta al resultado enriquecido.
 */
export function catalogoSchema(
  productos: Producto[],
  etiquetaMarca: EtiquetaMarca
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_URL}/#catalogo`,
    name: `Catálogo de repuestos de ${CONTACTO.nombre}`,
    inLanguage: "es-CO",
    numberOfItems: productos.length,
    itemListElement: productos.map((producto, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: producto.nombre,
      description: descripcionListada(producto, etiquetaMarca),
      image: `${SITE_URL}${producto.imagen}`,
    })),
  };
}

/**
 * Descripción de una entrada del listado, con la compatibilidad dentro.
 *
 * `ListItem` no tiene dónde colgar la marca, el OEM ni los vehículos: esas son
 * propiedades de `Product`. Así que el dato por el que de verdad se busca una
 * pieza —«bomba de agua Spark GT 2015»— se escribe en la descripción, que sí
 * admite. No añade nada nuevo: es la misma información que ya muestra la ficha.
 */
function descripcionListada(
  producto: Producto,
  etiquetaMarca: EtiquetaMarca
): string {
  const anios = rangoAniosLegible(producto.anioDesde, producto.anioHasta);
  const compatibilidad = `Compatible con ${listarCompatibles(producto, etiquetaMarca)} (${anios}).`;
  const oem = producto.oem ? ` Referencia OEM ${producto.oem}.` : "";
  return `${producto.descripcion} ${compatibilidad}${oem}`;
}
