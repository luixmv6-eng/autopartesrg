import type { Metadata } from "next";
import { Nosotros } from "@/components/sections/Nosotros";
import { serializarJsonLd } from "@/lib/jsonld";
import { migasSchema } from "@/lib/seo";

const TITULO = "Nosotros";
const DESCRIPCION =
  "Conoce a AutopartesRG: visión, misión e historia del equipo detrás del catálogo de repuestos con compatibilidad verificada.";

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
 */
export default function PaginaNosotros() {
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
      <Nosotros />
    </>
  );
}
