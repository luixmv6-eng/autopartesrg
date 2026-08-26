import type { Metadata } from "next";
import { Nosotros } from "@/components/sections/Nosotros";
import { serializarJsonLd } from "@/lib/jsonld";
import { migasSchema } from "@/lib/seo";

const TITULO = "Nosotros";
const DESCRIPCION =
  "Conoce a Autopartes ERG: visión, misión e historia del equipo detrás del catálogo de repuestos con compatibilidad verificada.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: "/nosotros" },
  openGraph: {
    type: "article",
    url: "/nosotros",
    title: TITULO,
    description: DESCRIPCION,
  },
  twitter: { title: TITULO, description: DESCRIPCION },
};

/**
 * Nosotros vive en su propia ruta, fuera de la landing.
 *
 * En la página principal competía con el catálogo por la atención; aquí puede
 * desarrollarse sin estorbar a quien llega buscando una pieza concreta.
 *
 * ## Por qué la sección llega por `?s=` y no solo por el ancla
 *
 * El ancla de una dirección (`#envios`) **nunca se envía al servidor**: vive
 * solo en el navegador. Con las pestañas eligiéndose a partir del ancla, el
 * HTML salía siempre con la primera —Visión— y la correcta no aparecía hasta
 * que React terminaba de hidratar la página. En un teléfono lento eso medía
 * cuatro segundos: quien pulsaba «Envíos» en el menú aterrizaba en «Visión» y
 * daba por hecho que el enlace estaba roto.
 *
 * Un parámetro normal sí viaja, así que la pestaña correcta ya viene decidida
 * en el primer byte del HTML, incluso sin JavaScript. El ancla se conserva
 * junto al parámetro porque sigue haciendo su trabajo: que el navegador baje
 * solo hasta la sección.
 */
export default async function PaginaNosotros({
  searchParams,
}: {
  searchParams: Promise<{ s?: string | string[] }>;
}) {
  // En Next 16 los parámetros de consulta son una promesa.
  const { s } = await searchParams;
  const seccion = Array.isArray(s) ? s[0] : s;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializarJsonLd(
            migasSchema([{ nombre: "Nosotros", ruta: "/nosotros" }])
          ),
        }}
      />
      <Nosotros seccionInicial={seccion} />
    </>
  );
}
