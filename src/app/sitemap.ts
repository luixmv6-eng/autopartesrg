import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/contacto";
import { cargarCatalogo } from "@/lib/catalogo";
import { RUTA_CATALOGO, rutaMarca, rutaProducto } from "@/lib/rutas";

/**
 * Solo las URLs canónicas.
 *
 * Las vistas filtradas de la portada (`/?marca=nissan`) no van aquí: todas
 * declaran `canonical` apuntando a la portada, así que listarlas sería una señal
 * contradictoria —pedir indexación de algo que a la vez se marca como duplicado.
 * Su equivalente indexable es `/repuestos/marca/nissan`, que sí tiene título,
 * encabezado y canonical propios, y es la que se lista.
 *
 * ## Lo que cambió
 *
 * Antes este archivo tenía dos entradas —la portada y Nosotros— y colgaba las
 * cincuenta fotos del catálogo de la portada, porque no existía una página por
 * repuesto. Esa era la raíz del problema de posicionamiento: un sitio con dos
 * URLs no puede aparecer para cincuenta búsquedas distintas, y la portada, con un
 * `<h1>` genérico, solo podía ganar la búsqueda de su propio nombre.
 *
 * Ahora se listan el índice, una URL por marca y una por repuesto, y cada foto
 * cuelga de la ficha donde de verdad se muestra. Para Google Imágenes esto
 * importa tanto como para la búsqueda de texto: en repuestos mucha gente busca
 * con la pieza vieja en la mano, y al pulsar el resultado llega a la ficha de esa
 * pieza en vez de a una portada donde tendría que volver a buscarla.
 */
async function urlsDelCatalogo(): Promise<MetadataRoute.Sitemap> {
  const { productos, marcas } = await cargarCatalogo();

  const deMarcas = marcas
    // Solo las marcas con repuestos publicados: su página responde 404 mientras
    // no haya ninguno, y una 404 en el sitemap es un error en Search Console.
    .filter((marca) => productos.some((p) => p.marca === marca.id))
    .map((marca) => ({
      url: `${SITE_URL}${rutaMarca(marca.id)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const deProductos = productos.map((producto) => ({
    url: `${SITE_URL}${rutaProducto(producto.id)}`,
    changeFrequency: "monthly" as const,
    /*
     * Las fichas por debajo del índice y de las marcas, y los destacados por
     * encima del resto. `priority` es una pista débil —Google la usa poco—, pero
     * cuando el sitio es nuevo y todavía no tiene historial es una de las pocas
     * señales que hay para ordenar la cola de rastreo.
     */
    priority: producto.destacado ? 0.8 : 0.6,
    // La foto en la página donde se muestra, no en la portada.
    images: [`${SITE_URL}${producto.imagen}`],
  }));

  return [
    {
      url: `${SITE_URL}${RUTA_CATALOGO}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...deMarcas,
    ...deProductos,
  ];
}

/**
 * Sin prerenderizado, por el mismo motivo que la portada.
 *
 * Prerenderizado, la lista se congela en el despliegue: un repuesto añadido desde
 * el panel no entraría en el sitemap hasta la siguiente subida de código, y en
 * este negocio eso puede tardar meses. Cuesta una lectura de archivo, y Google
 * pide el sitemap unas pocas veces al día.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ahora = new Date();

  /*
   * Si el catálogo no se puede leer, el sitemap sale igual con sus dos URLs
   * fijas. Uno sin las fichas es un sitemap peor; uno que devuelve error no
   * existe.
   */
  let catalogo: MetadataRoute.Sitemap = [];
  try {
    catalogo = await urlsDelCatalogo();
  } catch {
    catalogo = [];
  }

  return [
    {
      url: SITE_URL,
      lastModified: ahora,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...catalogo.map((entrada) => ({ ...entrada, lastModified: ahora })),
    {
      url: `${SITE_URL}/nosotros`,
      lastModified: ahora,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
