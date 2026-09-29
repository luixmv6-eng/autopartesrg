import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListaRepuestos } from "@/components/catalogo/ListaRepuestos";
import { Migas } from "@/components/catalogo/Migas";
import { Icon } from "@/components/ui/Icon";
import { cargarCatalogo, productosDeMarca } from "@/lib/catalogo";
import { serializarJsonLd } from "@/lib/jsonld";
import { RUTA_CATALOGO, rutaMarca } from "@/lib/rutas";
import {
  descripcionMarca,
  listadoSchema,
  migasMarca,
  migasSchema,
  tituloMarca,
} from "@/lib/seo";

/**
 * Una página por marca de vehículo.
 *
 * Cubre el otro tipo de búsqueda que el sitio no podía atender: la de quien
 * todavía no sabe cómo se llama la pieza y escribe «repuestos Nissan» o
 * «autopartes Toyota Colombia». Antes eso apuntaba al catálogo filtrado por
 * query (`/?marca=nissan`), que declara la portada como canonical —es decir, le
 * pide expresamente a Google que no la indexe— y de todas formas se vería con el
 * título y el `<h1>` genéricos de la portada.
 *
 * Aquí el título, el encabezado y la descripción nombran la marca, y el listado
 * de piezas es el contenido que sostiene ese tema. De paso son quince enlaces
 * internos más hacia las fichas, que es lo que las saca de estar colgando.
 */
export const dynamic = "force-dynamic";

/** Los parámetros de ruta son una promesa desde Next 16. */
type Props = { params: Promise<{ marca: string }> };

/**
 * Resuelve la marca de la URL contra la lista viva.
 *
 * Se exige que **tenga repuestos**, no solo que exista. Una marca dada de alta
 * en el panel y todavía sin piezas daría una página vacía con su propio título:
 * para un buscador es contenido escaso, y para un visitante es un enlace que no
 * lleva a nada. Mejor 404 hasta que haya algo que enseñar.
 */
async function resolver(marcaId: string) {
  const { productos, marcas, etiquetaMarca } = await cargarCatalogo();
  const marca = marcas.find((m) => m.id === marcaId);
  if (!marca) return null;

  const suyos = productosDeMarca(productos, marca.id);
  if (suyos.length === 0) return null;

  return { marca, productos: suyos, etiquetaMarca };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { marca: marcaId } = await params;
  const datos = await resolver(marcaId);

  if (!datos) return { title: "Marca no encontrada", robots: { index: false } };

  const titulo = tituloMarca(datos.marca.label);
  const descripcion = descripcionMarca(datos.marca.label, datos.productos.length);
  const ruta = rutaMarca(datos.marca.id);

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: ruta },
    openGraph: { type: "website", url: ruta, title: titulo, description: descripcion },
    twitter: { title: titulo, description: descripcion },
  };
}

export default async function PaginaMarca({ params }: Props) {
  const { marca: marcaId } = await params;
  const datos = await resolver(marcaId);
  if (!datos) notFound();

  const { marca, productos, etiquetaMarca } = datos;
  const titulo = tituloMarca(marca.label);

  /* Los modelos cubiertos, sin repetir. Es el dato por el que la gente busca de
     verdad —«repuestos Frontier NP300», no «repuestos Nissan»— y hasta ahora no
     aparecía en ningún encabezado del sitio. */
  const modelos = [...new Set(productos.flatMap((p) => p.modelos))].sort((a, b) =>
    a.localeCompare(b, "es")
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializarJsonLd(
            listadoSchema(productos, etiquetaMarca, {
              ruta: rutaMarca(marca.id),
              nombre: titulo,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializarJsonLd(migasSchema(migasMarca(marca.id, marca.label))),
        }}
      />

      <div className="contenedor py-lg lg:py-xl">
        <Migas tramos={migasMarca(marca.id, marca.label)} />

        <header className="mt-lg max-w-[68ch]">
          <p className="eyebrow mb-md">{marca.label}</p>
          <h1 className="display-tight text-headline-lg text-on-surface">{titulo}</h1>
          <p className="mt-sm text-body-md text-on-surface-variant">
            <span className="tabular font-semibold text-on-surface">{productos.length}</span>{" "}
            {productos.length === 1 ? "repuesto" : "repuestos"} para {marca.label} con
            compatibilidad verificada por modelo y año. Cada ficha indica los modelos exactos que
            admite la pieza y su referencia OEM cuando viene impresa.
          </p>

          {modelos.length > 0 && (
            <p className="mt-md text-body-md text-on-surface-variant">
              Modelos cubiertos: <strong className="text-on-surface">{modelos.join(", ")}</strong>.
            </p>
          )}

          <Link
            href={`/?marca=${marca.id}#catalogo`}
            className="mt-lg inline-flex items-center gap-xs font-mono text-label-technical text-primary hover:underline"
          >
            <Icon name="tune" size={18} />
            Filtrar {marca.label} por modelo y año
          </Link>
        </header>

        <section aria-labelledby="titulo-listado-marca" className="mt-xl">
          <h2 id="titulo-listado-marca" className="mb-md text-headline-md text-on-surface">
            Repuestos disponibles
          </h2>
          <ListaRepuestos productos={productos} etiquetaMarca={etiquetaMarca} />
        </section>

        <Link
          href={RUTA_CATALOGO}
          className="mt-xl inline-flex items-center gap-xs font-mono text-label-technical text-primary hover:underline"
        >
          Ver el catálogo completo
          <Icon name="arrow_forward" size={16} />
        </Link>
      </div>
    </>
  );
}
