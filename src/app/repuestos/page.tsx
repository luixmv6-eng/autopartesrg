import type { Metadata } from "next";
import Link from "next/link";
import { ListaRepuestos } from "@/components/catalogo/ListaRepuestos";
import { Migas } from "@/components/catalogo/Migas";
import { Icon } from "@/components/ui/Icon";
import { cargarCatalogo } from "@/lib/catalogo";
import { CONTACTO } from "@/lib/contacto";
import { serializarJsonLd } from "@/lib/jsonld";
import { RUTA_CATALOGO, rutaMarca } from "@/lib/rutas";
import { listadoSchema, migasSchema } from "@/lib/seo";

/**
 * Índice del catálogo: el mapa que le faltaba al sitio.
 *
 * La portada tiene el catálogo bueno —el que filtra por marca, modelo y año—,
 * pero es un componente de cliente que pinta doce tarjetas y espera un clic en
 * «cargar más». Un buscador que rastrea el HTML ve esas doce y nada más, así que
 * treinta y ocho repuestos no tenían ningún enlace que los alcanzara.
 *
 * Esta página es lo contrario: HTML plano, los repuestos completos, un `<a>` por
 * ficha y un enlace por marca. No pretende sustituir al catálogo interactivo
 * —arriba hay un enlace a él— sino garantizar que ninguna ficha quede a más de
 * dos clics de la raíz, que es la condición para que se rastreen todas.
 */
export const dynamic = "force-dynamic";

const TITULO = "Catálogo de repuestos por marca y modelo";
const DESCRIPCION =
  "Índice completo de autopartes de Autopartes ERG: entra a la ficha de cada repuesto para ver la compatibilidad por modelo y año, y cotiza por WhatsApp.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: RUTA_CATALOGO },
  openGraph: {
    type: "website",
    url: RUTA_CATALOGO,
    title: TITULO,
    description: DESCRIPCION,
  },
  twitter: { title: TITULO, description: DESCRIPCION },
};

export default async function PaginaCatalogo() {
  const { productos, marcas, etiquetaMarca } = await cargarCatalogo();

  /*
   * Solo las marcas que tienen repuestos publicados.
   *
   * La lista de marcas es editable desde el panel y puede contener alguna dada
   * de alta antes de cargar sus piezas. Enlazarla llevaría a un listado vacío, y
   * una página sin contenido que además se enlaza desde el índice es justo el
   * tipo de URL que conviene no crear.
   */
  const conRepuestos = marcas
    .map((marca) => ({
      ...marca,
      cuantos: productos.filter((p) => p.marca === marca.id).length,
    }))
    .filter((marca) => marca.cuantos > 0);

  // Orden alfabético: en un índice el visitante busca un nombre concreto, y una
  // lista ordenada por destacados obliga a leerla entera para saber si está.
  const ordenados = [...productos].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return (
    <>
      {productos.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializarJsonLd(
              listadoSchema(ordenados, etiquetaMarca, {
                ruta: RUTA_CATALOGO,
                nombre: `Catálogo de repuestos de ${CONTACTO.nombre}`,
              })
            ),
          }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializarJsonLd(migasSchema([{ nombre: "Repuestos", ruta: RUTA_CATALOGO }])),
        }}
      />

      <div className="contenedor py-lg lg:py-xl">
        <Migas tramos={[{ nombre: "Repuestos", ruta: RUTA_CATALOGO }]} />

        <header className="mt-lg max-w-[68ch]">
          <p className="eyebrow mb-md">Catálogo completo</p>
          <h1 className="display-tight text-headline-lg text-on-surface">{TITULO}</h1>
          <p className="mt-sm text-body-md text-on-surface-variant">
            {productos.length === 0 ? (
              "El catálogo se está actualizando. Escríbenos por WhatsApp y te confirmamos la pieza que necesitas."
            ) : (
              <>
                <span className="tabular font-semibold text-on-surface">{productos.length}</span>{" "}
                repuestos con compatibilidad verificada por marca, modelo y año. Cada ficha indica
                para qué vehículos sirve la pieza y su referencia OEM cuando viene impresa.
              </>
            )}
          </p>

          {/* El catálogo interactivo sigue siendo la herramienta buena para
              buscar; esta página es el índice. Conviene decirlo y enlazarlo. */}
          <Link
            href="/#catalogo"
            className="mt-lg inline-flex items-center gap-xs font-mono text-label-technical text-primary hover:underline"
          >
            <Icon name="tune" size={18} />
            Buscar con filtros de marca, modelo y año
          </Link>
        </header>

        {conRepuestos.length > 0 && (
          <nav aria-labelledby="titulo-marcas" className="mt-xl">
            <h2
              id="titulo-marcas"
              className="mb-md font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary"
            >
              Repuestos por marca
            </h2>
            <ul className="flex flex-wrap gap-sm">
              {conRepuestos.map((marca) => (
                <li key={marca.id}>
                  <Link
                    href={rutaMarca(marca.id)}
                    className="inline-flex h-11 items-center gap-xs rounded-full border border-outline-variant bg-surface-container-lowest px-md font-mono text-label-technical text-on-surface transition-colors hover:border-primary hover:text-primary"
                  >
                    {marca.label}
                    <span className="tabular text-on-surface-variant">{marca.cuantos}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {ordenados.length > 0 && (
          <section aria-labelledby="titulo-listado" className="mt-xl">
            <h2 id="titulo-listado" className="mb-md text-headline-md text-on-surface">
              Todos los repuestos
            </h2>
            <ListaRepuestos productos={ordenados} etiquetaMarca={etiquetaMarca} />
          </section>
        )}
      </div>
    </>
  );
}
