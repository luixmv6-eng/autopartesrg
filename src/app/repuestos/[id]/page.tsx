import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FichaProducto } from "@/components/catalogo/FichaProducto";
import { buscarProducto, cargarCatalogo } from "@/lib/catalogo";
import { serializarJsonLd } from "@/lib/jsonld";
import { rutaProducto } from "@/lib/rutas";
import {
  descripcionProducto,
  fichaSchema,
  migasProducto,
  migasSchema,
  tituloProducto,
} from "@/lib/seo";

/**
 * Una página por repuesto.
 *
 * Es el arreglo de fondo al problema de posicionamiento: hasta ahora el sitio
 * tenía dos URLs indexables —la portada y Nosotros— y cincuenta repuestos que
 * solo existían dentro de una ventana modal, sin dirección propia. Un buscador
 * no puede devolver como resultado algo que no tiene URL, así que la única forma
 * de que el catálogo apareciera era buscar el nombre del negocio, que es lo único
 * que la portada nombra. De ahí que hiciera falta escribir «autoparteserg»
 * además del nombre de la pieza.
 *
 * Con esta ruta cada repuesto es una página con su propio `<h1>`, su título, su
 * descripción y su canonical, y todo eso habla de **una** pieza concreta. Eso es
 * lo que compite por «culata Nissan X-Trail» sin tener que nombrar la tienda.
 *
 * ## Sin prerenderizado, igual que la portada
 *
 * Se podrían generar las cincuenta rutas en el despliegue con
 * `generateStaticParams`, pero entonces un repuesto añadido desde el panel no
 * tendría página hasta la siguiente subida de código —que en este negocio puede
 * tardar meses— y el sitio devolvería 404 en la URL que el propio catálogo
 * enlaza. Renderizar en cada visita cuesta una lectura de archivo de unas
 * decenas de kilobytes, y `cargarCatalogo` la comparte con `generateMetadata`,
 * así que es una sola por visita.
 */
export const dynamic = "force-dynamic";

/** Los parámetros de ruta son una promesa desde Next 16. */
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { productos, etiquetaMarca } = await cargarCatalogo();
  const producto = buscarProducto(productos, id);

  // Sin producto no hay nada que describir. La página responderá 404 y Next usa
  // los metadatos de la raíz; devolver aquí un título inventado haría que una
  // URL borrada siguiera apareciendo con buena pinta en los resultados.
  if (!producto) return { title: "Repuesto no encontrado", robots: { index: false } };

  const titulo = tituloProducto(producto, etiquetaMarca);
  const descripcion = descripcionProducto(producto, etiquetaMarca);
  const ruta = rutaProducto(producto.id);

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: ruta },
    openGraph: {
      type: "article",
      url: ruta,
      title: titulo,
      description: descripcion,
      /*
       * La foto del repuesto como imagen para compartir, en lugar de la genérica
       * del sitio. Cuando alguien pega el enlace en un grupo de WhatsApp —que es
       * por donde circula este catálogo— la vista previa enseña la pieza.
       */
      images: [{ url: producto.imagen, alt: producto.nombre }],
    },
    twitter: {
      title: titulo,
      description: descripcion,
      images: [producto.imagen],
    },
  };
}

export default async function PaginaProducto({ params }: Props) {
  const { id } = await params;
  const { productos, etiquetaMarca } = await cargarCatalogo();
  const producto = buscarProducto(productos, id);

  // Un repuesto retirado del catálogo debe responder 404 y no una ficha vacía:
  // una página que existe con contenido a medias se queda indexada.
  if (!producto) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializarJsonLd(fichaSchema(producto, etiquetaMarca)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializarJsonLd(migasSchema(migasProducto(producto, etiquetaMarca))),
        }}
      />
      <FichaProducto producto={producto} productos={productos} etiquetaMarca={etiquetaMarca} />
    </>
  );
}
