import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/contacto";
import { leerCatalogo } from "@/lib/admin/almacen";

/**
 * Solo las URLs canónicas.
 *
 * Las vistas filtradas (`/?cat=frenos`) no van aquí: todas declaran `canonical`
 * apuntando a la portada, así que listarlas sería una señal contradictoria
 * (pedir indexación de algo que a la vez se marca como duplicado). Se llega a
 * ellas desde los enlaces del footer, que es lo que corresponde.
 */

/**
 * Las fotos del catálogo, declaradas como imágenes de la portada.
 *
 * En repuestos, buena parte de las búsquedas empiezan por la imagen: quien tiene
 * la pieza vieja en la mano la reconoce antes de saber cómo se llama. Esas
 * cincuenta fotos son propias, no de catálogo de fabricante, y hoy Google solo
 * puede llegar a ellas rastreando el HTML. Declararlas en el sitemap las pone
 * en cola de indexación de Google Imágenes directamente.
 *
 * Van colgando de la portada porque es donde se muestran: no existe una página
 * por repuesto. El límite de la extensión de imágenes son 1000 por URL, así que
 * con cincuenta sobra margen.
 *
 * Si el catálogo no se puede leer, se devuelve la lista vacía y el sitemap sale
 * igual con sus dos URLs. Un sitemap sin imágenes es un sitemap peor; uno que
 * devuelve error no existe.
 */
async function fotosDelCatalogo(): Promise<string[]> {
  try {
    const productos = await leerCatalogo();
    return productos.map((p) => `${SITE_URL}${p.imagen}`);
  } catch {
    return [];
  }
}

/**
 * Sin prerenderizado, por el mismo motivo que la portada.
 *
 * Prerenderizado, la lista de fotos se congela en el despliegue: un repuesto
 * añadido desde el panel no entraría en el sitemap hasta la siguiente subida de
 * código, y en este negocio eso puede tardar meses. Cuesta una lectura de
 * archivo, y Google pide el sitemap unas pocas veces al día.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ahora = new Date();
  const imagenes = await fotosDelCatalogo();

  return [
    {
      url: SITE_URL,
      lastModified: ahora,
      changeFrequency: "weekly",
      priority: 1,
      images: imagenes,
    },
    {
      url: `${SITE_URL}/nosotros`,
      lastModified: ahora,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
