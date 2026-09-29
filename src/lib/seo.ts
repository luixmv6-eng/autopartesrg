import { CONTACTO, SITE_URL } from "./contacto";
import { RUTA_CATALOGO, rutaMarca, rutaProducto } from "./rutas";
import {
  listarCompatibles,
  MODELO_GENERICO,
  nombrarVehiculo,
  rangoAniosLegible,
  type EtiquetaMarca,
} from "./utils";
import type { MarcaId, Producto } from "./types";

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
 * Cada repuesto ya tiene su propia URL (`/repuestos/<id>`), que es la mitad de
 * la condición; falta la otra. El día que el negocio publique precio y
 * disponibilidad reales, esto vuelve a ser `Product` con su `offers` — y
 * entonces sí opta al resultado enriquecido.
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
      /*
       * La dirección de la ficha. Es lo que faltaba: un `ItemList` sin `url` le
       * dice a Google que hay cincuenta cosas y ninguna a la que ir. Con ella,
       * el listado deja de ser una descripción y pasa a ser un índice, y cada
       * entrada tiene una página propia que puede posicionar por su cuenta.
       */
      url: `${SITE_URL}${rutaProducto(producto.id)}`,
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

/**
 * Título de la ficha de un repuesto.
 *
 * El nombre primero, sin adornos delante. El título es la señal más fuerte que
 * tiene una página y Google lo recorta alrededor de los 60 caracteres: cualquier
 * prefijo del tipo «Repuesto —» empuja fuera del corte justo las palabras con
 * las que se busca la pieza.
 *
 * El nombre del negocio lo añade la plantilla de `layout.tsx`. Si el nombre del
 * repuesto es largo se perderá en el recorte, y está bien: quien busca una
 * culata no escribe el nombre de la tienda —eso era exactamente el problema.
 *
 * ## Cuándo se añade el vehículo
 *
 * Casi nunca. Cuarenta y nueve de los cincuenta nombres del catálogo ya nombran
 * la marca o el modelo («Culata Nissan X-Trail T30 YD22 diésel»), así que
 * añadirlo daría títulos como «… Toyota Hilux / Vigo / Fortuner para Toyota
 * Hilux, Toyota Hilux Vigo, Toyota Fortuner»: la misma palabra cuatro veces, que
 * es exactamente el patrón que Google descarta y reescribe por su cuenta.
 *
 * Solo se completa cuando el nombre no menciona **ni** la marca **ni** ningún
 * modelo —un nombre puramente descriptivo, como «Lágrima de barra
 * estabilizadora»—, y entonces se añade un único vehículo, no la lista entera.
 * Los repuestos sin aplicación marcada (`MODELO_GENERICO`) no añaden nada: «para
 * Varios modelos» ocupa sitio en el título sin aportar una palabra por la que
 * alguien pueda buscar.
 */
export function tituloProducto(producto: Producto, etiquetaMarca: EtiquetaMarca): string {
  const nombre = normalizarComparacion(producto.nombre);
  const modelo = producto.modelos[0];

  const loNombra =
    nombre.includes(normalizarComparacion(etiquetaMarca(producto.marca))) ||
    producto.modelos.some((m) => nombre.includes(normalizarComparacion(m)));

  if (loNombra || !modelo || modelo === MODELO_GENERICO) return producto.nombre;

  return `${producto.nombre} para ${nombrarVehiculo(producto, modelo, etiquetaMarca)}`;
}

/**
 * Descripción de la ficha: lo que Google enseña bajo el título.
 *
 * Lleva los tres datos con los que se busca un repuesto —qué es, para qué
 * vehículo y de qué años— y la referencia OEM cuando consta, porque es lo que
 * teclea un taller. Se acota a 155 caracteres para que no acabe en puntos
 * suspensivos justo en el dato útil.
 */
export function descripcionProducto(
  producto: Producto,
  etiquetaMarca: EtiquetaMarca
): string {
  const anios = rangoAniosLegible(producto.anioDesde, producto.anioHasta);
  const oem = producto.oem ? `Ref. OEM ${producto.oem}. ` : "";

  /*
   * Los repuestos sin aplicación marcada en la pieza llevan `MODELO_GENERICO`.
   * Escribir «para Varios modelos» gastaría tres palabras de las 155 en no decir
   * nada; «aplicación universal» sí es lo que alguien teclearía, y es cierto.
   */
  const aplicacion =
    producto.modelos[0] === MODELO_GENERICO
      ? `de aplicación universal (${anios})`
      : `para ${listarCompatibles(producto, etiquetaMarca)} (${anios})`;

  return recortar(
    `${producto.nombre} ${aplicacion}. ${oem}Verifica la compatibilidad y cotiza por WhatsApp.`,
    155
  );
}

/** Título del listado de una marca. */
export function tituloMarca(nombreMarca: string): string {
  return `Repuestos y autopartes para ${nombreMarca}`;
}

/** Descripción del listado de una marca, con el recuento real de piezas. */
export function descripcionMarca(nombreMarca: string, cuantos: number): string {
  const piezas = cuantos === 1 ? "1 repuesto" : `${cuantos} repuestos`;
  return recortar(
    `${piezas} para ${nombreMarca} con compatibilidad verificada por modelo y año. Consulta la ficha de cada pieza y cotiza por WhatsApp con ${CONTACTO.nombre}.`,
    155
  );
}

/**
 * La ficha de un repuesto como datos estructurados.
 *
 * No es `Product` por lo explicado arriba en `catalogoSchema`: sin precio ni
 * disponibilidad publicados, ese tipo deja la URL marcada como inválida en el
 * informe de fragmentos de producto sin dar nada a cambio.
 *
 * `ItemPage` sí encaja y aporta lo que aquí importa de verdad: declara que la
 * página trata de **una** cosa concreta —no de un listado— y cuelga la foto del
 * repuesto como imagen principal. Esa segunda parte no es un detalle: en
 * repuestos mucha gente busca por imagen, porque tiene la pieza vieja en la mano
 * y la reconoce antes de saber cómo se llama.
 */
export function fichaSchema(producto: Producto, etiquetaMarca: EtiquetaMarca) {
  const url = `${SITE_URL}${rutaProducto(producto.id)}`;
  return {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    "@id": `${url}#pagina`,
    url,
    name: tituloProducto(producto, etiquetaMarca),
    description: descripcionListada(producto, etiquetaMarca),
    inLanguage: "es-CO",
    isPartOf: { "@id": `${SITE_URL}/#sitio` },
    publisher: { "@id": `${SITE_URL}/#organizacion` },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${SITE_URL}${producto.imagen}`,
      contentUrl: `${SITE_URL}${producto.imagen}`,
      caption: `${producto.nombre} — ${listarCompatibles(producto, etiquetaMarca)}`,
    },
    /*
     * Las palabras con las que un taller pide la pieza, cada una por separado.
     * No sustituyen al texto de la página —Google no posiciona por `keywords`—,
     * pero sí declaran la marca, los modelos y la referencia como datos, y no
     * como una frase de la que haya que deducirlos.
     */
    about: producto.modelos.map((modelo) => ({
      "@type": "Thing",
      name: nombrarVehiculo(producto, modelo, etiquetaMarca),
    })),
  };
}

/**
 * Un listado de repuestos (el índice completo o el de una marca).
 *
 * Mismo marcado que la portada, con otro nombre y otra URL, y con las fichas
 * enlazadas una a una: es el camino por el que Google llega a las cincuenta
 * páginas sin depender de que interprete el catálogo interactivo.
 */
export function listadoSchema(
  productos: Producto[],
  etiquetaMarca: EtiquetaMarca,
  { ruta, nombre }: { ruta: string; nombre: string }
) {
  const url = `${SITE_URL}${ruta}`;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}#listado`,
    url,
    name: nombre,
    inLanguage: "es-CO",
    numberOfItems: productos.length,
    itemListElement: productos.map((producto, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}${rutaProducto(producto.id)}`,
      name: producto.nombre,
      description: descripcionListada(producto, etiquetaMarca),
      image: `${SITE_URL}${producto.imagen}`,
    })),
  };
}

/** Migas de la ficha de un repuesto: Inicio > Repuestos > Marca > Pieza. */
export function migasProducto(
  producto: Producto,
  etiquetaMarca: EtiquetaMarca
): Array<{ nombre: string; ruta: string }> {
  return [
    { nombre: "Repuestos", ruta: RUTA_CATALOGO },
    { nombre: etiquetaMarca(producto.marca), ruta: rutaMarca(producto.marca) },
    { nombre: producto.nombre, ruta: rutaProducto(producto.id) },
  ];
}

/** Migas del listado de una marca. */
export function migasMarca(
  marca: MarcaId,
  nombreMarca: string
): Array<{ nombre: string; ruta: string }> {
  return [
    { nombre: "Repuestos", ruta: RUTA_CATALOGO },
    { nombre: nombreMarca, ruta: rutaMarca(marca) },
  ];
}

/** Minúsculas y sin tildes, solo para comparar dos cadenas entre sí. */
function normalizarComparacion(valor: string): string {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/**
 * Recorta por la última palabra entera que cabe.
 *
 * Cortar a mitad de palabra en una meta descripción se lee como un error de la
 * página, no como un recorte del buscador.
 */
function recortar(texto: string, maximo: number): string {
  if (texto.length <= maximo) return texto;
  const cortado = texto.slice(0, maximo - 1);
  const hueco = cortado.lastIndexOf(" ");
  return `${(hueco > 0 ? cortado.slice(0, hueco) : cortado).replace(/[,.;:]$/, "")}…`;
}
