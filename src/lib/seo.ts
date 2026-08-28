import { CONTACTO, SITE_URL } from "./contacto";
import { nombrarVehiculo, rangoAniosLegible, type EtiquetaMarca } from "./utils";
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
 * lo que no puede es deducir qué es cada cosa. Con esto pasa de ver una lista de
 * frases a saber que cada tarjeta es un **repuesto**, de qué **marca**, para qué
 * **vehículos** y con qué **años** — que es exactamente como busca la gente
 * («bomba de agua Spark GT 2015») y lo que hoy no está declarado en ninguna
 * parte.
 *
 * ## Por qué no lleva `offers`
 *
 * `offers` es lo que habilita los resultados enriquecidos de producto (el
 * precio y la disponibilidad bajo el enlace). Este catálogo no publica precio
 * ni stock a propósito —es un índice de compatibilidad, no un inventario— y
 * declarar precios inventados en el marcado es motivo de acción manual. Se
 * omite, y con ello se renuncia al adorno del precio en el resultado, no a que
 * Google entienda el producto.
 *
 * ## Por qué los productos no llevan `url`
 *
 * No existe una página por repuesto: la ficha se abre en un modal sobre la
 * portada. Apuntar los cincuenta a la misma URL sería declarar cincuenta
 * productos en la misma dirección, que es peor que no declarar ninguna. El día
 * que cada repuesto tenga ruta propia, este es el campo que hay que añadir.
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
      item: {
        "@type": "Product",
        name: producto.nombre,
        description: producto.descripcion,
        image: `${SITE_URL}${producto.imagen}`,
        brand: { "@type": "Brand", name: etiquetaMarca(producto.marca) },
        // El OEM solo se declara donde consta de verdad. `mpn` es el campo que
        // los buscadores cruzan con el número de parte del fabricante.
        ...(producto.oem ? { mpn: producto.oem } : {}),
        /*
         * La compatibilidad, que es el dato por el que se busca un repuesto.
         * `isAccessoryOrSparePartFor` es el campo que schema.org reserva
         * justamente para «esta pieza sirve para este vehículo».
         */
        isAccessoryOrSparePartFor: producto.modelos.map((modelo) => ({
          "@type": "Vehicle",
          name: nombrarVehiculo(producto, modelo, etiquetaMarca),
          ...(producto.marca !== "universal"
            ? { brand: { "@type": "Brand", name: etiquetaMarca(producto.marca) } }
            : {}),
        })),
        // El rango de años no cabe en ningún campo propio de `Vehicle`, que
        // espera una fecha única. Como propiedad adicional sí queda declarado.
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: "Años compatibles",
            value: rangoAniosLegible(producto.anioDesde, producto.anioHasta),
          },
        ],
      },
    })),
  };
}
