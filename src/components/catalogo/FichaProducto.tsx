import Image from "next/image";
import Link from "next/link";
import { BadgeTecnico } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { relacionados } from "@/lib/productos";
import { RUTA_CATALOGO, rutaMarca, rutaProducto } from "@/lib/rutas";
import { LABEL_CATEGORIA, LABEL_SECCION } from "@/lib/taxonomia";
import type { Producto } from "@/lib/types";
import {
  listarCompatibles,
  nombrarVehiculo,
  rangoAniosLegible,
  type EtiquetaMarca,
} from "@/lib/utils";
import { CotizadorWhatsApp } from "./CotizadorWhatsApp";
import { Migas } from "./Migas";

interface Props {
  producto: Producto;
  /** Catálogo completo, para calcular los repuestos relacionados. */
  productos: Producto[];
  etiquetaMarca: EtiquetaMarca;
}

/**
 * Ficha técnica de un repuesto, como página propia.
 *
 * Es el mismo contenido que antes se abría en una ventana modal sobre el
 * catálogo, con una diferencia que lo cambia todo: ahora lo renderiza el
 * servidor en una URL propia. La modal se pintaba en el navegador y solo después
 * de un clic, así que nada de lo que hay aquí —el nombre de la pieza, la
 * compatibilidad, los años, la referencia OEM— existía en el HTML que rastrea un
 * buscador. El catálogo tenía cincuenta repuestos y dos páginas indexables.
 *
 * El `<h1>` es el nombre del repuesto. Es la razón de ser de este archivo: una
 * página cuyo encabezado, título, descripción y canonical hablan de *una* pieza
 * concreta es lo que Google puede devolver cuando alguien busca esa pieza. La
 * portada, con un solo `<h1>` genérico, competía por cincuenta búsquedas
 * distintas y no ganaba ninguna.
 *
 * Se conserva el diseño de la modal —cabecera técnica, foto a la izquierda,
 * datos a la derecha, aviso de compatibilidad, tabla de especificaciones y
 * relacionados— porque estaba bien resuelto y el visitante ya lo conoce.
 */
export function FichaProducto({ producto, productos, etiquetaMarca }: Props) {
  const compatibles = listarCompatibles(producto, etiquetaMarca);
  const anios = rangoAniosLegible(producto.anioDesde, producto.anioHasta);
  const nombreMarca = etiquetaMarca(producto.marca);
  const sugeridos = relacionados(producto, productos);

  // Sin condición ni disponibilidad: son datos de inventario que el catálogo no
  // puede sostener todavía. Se confirman por WhatsApp. La fila del número de
  // parte solo se dibuja cuando el repuesto trae referencia impresa.
  const especificaciones: Array<{ etiqueta: string; valor: React.ReactNode }> = [
    {
      etiqueta: "Marca",
      valor: (
        // Enlace, no texto: desde cualquier ficha se llega al listado de la
        // marca, y ese es el camino por el que se reparte autoridad entre las
        // páginas del catálogo.
        <Link href={rutaMarca(producto.marca)} className="text-primary hover:underline">
          {nombreMarca}
        </Link>
      ),
    },
    { etiqueta: "Modelos", valor: producto.modelos.join(", ") },
    { etiqueta: "Años", valor: <span className="tabular">{anios}</span> },
    // Categoría y sección son opcionales: los repuestos dados de alta después de
    // retirarlas del panel no las llevan, y una fila vacía no informa.
    ...(producto.categoria
      ? [{ etiqueta: "Categoría", valor: LABEL_CATEGORIA[producto.categoria] }]
      : []),
    ...(producto.seccion ? [{ etiqueta: "Sección", valor: LABEL_SECCION[producto.seccion] }] : []),
    ...(producto.oem
      ? [{ etiqueta: "N.º de parte", valor: <span className="tabular">{producto.oem}</span> }]
      : []),
  ];

  return (
    <article className="contenedor py-lg lg:py-xl">
      <div className="mb-lg flex flex-wrap items-center justify-between gap-md">
        <Migas
          tramos={[
            { nombre: "Repuestos", ruta: RUTA_CATALOGO },
            { nombre: nombreMarca, ruta: rutaMarca(producto.marca) },
            { nombre: producto.nombre, ruta: rutaProducto(producto.id) },
          ]}
        />
        <span className="flex items-center gap-sm">
          <Icon name="verified" size={20} className="text-primary" />
          <span className="font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
            Ficha técnica de autoparte
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-outline-variant lg:grid-cols-12">
        {/* Foto. Proporción fija para que acompañe al ancho de la columna en vez
            de aplastarse en pantallas bajas. */}
        <div className="relative flex aspect-[4/3] items-center justify-center bg-surface-container-low lg:col-span-7 lg:aspect-auto lg:h-[clamp(24rem,38vw,35rem)] lg:border-r lg:border-outline-variant">
          <Image
            src={producto.imagen}
            alt={`${producto.nombre} para ${nombrarVehiculo(producto, producto.modelos[0], etiquetaMarca)}`}
            fill
            /* La foto de la ficha es el elemento más grande de la página y lo
               primero que se mira: se carga con prioridad en vez de en diferido,
               que es lo que medía el LCP. */
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-contain p-lg lg:p-xl"
          />
        </div>

        {/* Datos */}
        <div className="flex flex-col justify-between bg-surface-container-lowest p-md lg:col-span-5 lg:p-xl">
          <div className="flex flex-col gap-md">
            {/* Clasificación. Sin categoría no hay nada que migar, y en su lugar
                se enseña la marca del vehículo. */}
            <p className="flex items-center gap-xs font-mono text-label-technical text-on-surface-variant">
              {producto.categoria ? (
                <>
                  <span>{LABEL_CATEGORIA[producto.categoria]}</span>
                  {producto.seccion && (
                    <>
                      <Icon name="chevron_right" size={16} />
                      <span>{LABEL_SECCION[producto.seccion]}</span>
                    </>
                  )}
                </>
              ) : (
                <span>{nombreMarca}</span>
              )}
            </p>

            <div>
              <h1 className="mb-sm text-headline-lg text-on-surface">{producto.nombre}</h1>
              {/* La insignia solo aparece si hay referencia impresa. Un
                  "OEM: —" ocuparía el mismo sitio sin decir nada. */}
              {producto.oem && <BadgeTecnico>OEM: {producto.oem}</BadgeTecnico>}
            </div>

            <div className="mt-sm flex items-start gap-sm rounded-lg border border-primary-fixed-dim bg-primary-fixed p-md">
              <Icon name="check_circle" size={24} filled className="mt-xs text-primary" />
              <div>
                <h2 className="text-body-md font-bold text-on-primary-fixed">
                  Compatibilidad confirmada
                </h2>
                <p className="mt-xs text-body-md text-on-primary-fixed-variant">
                  Ajuste para: <strong>{compatibles}</strong>{" "}
                  <span className="tabular">({anios})</span>.
                </p>
              </div>
            </div>

            {/*
             * Especificaciones, con filas alternas. Una sola retícula para toda
             * la lista, no una por fila: así las dos columnas se alinean entre
             * filas y la de etiquetas se mide por la etiqueta más larga en vez
             * de llevarse un tercio fijo del ancho.
             */}
            <dl className="mt-md grid grid-cols-[minmax(min-content,auto)_minmax(0,1fr)] overflow-hidden rounded-lg border border-outline-variant font-mono text-label-technical">
              {especificaciones.map((fila, i) => {
                const fondo =
                  i % 2 === 0 ? "bg-surface-container-low" : "bg-surface-container-lowest";
                const borde =
                  i < especificaciones.length - 1 ? "border-b border-outline-variant" : "";
                return (
                  <div key={fila.etiqueta} className="col-span-2 grid grid-cols-subgrid">
                    <dt className={`p-sm pr-md text-on-surface-variant ${fondo} ${borde}`}>
                      {fila.etiqueta}
                    </dt>
                    <dd className={`p-sm pl-0 font-semibold text-on-surface ${fondo} ${borde}`}>
                      {fila.valor}
                    </dd>
                  </div>
                );
              })}
            </dl>

            <p className="text-body-md leading-relaxed text-on-surface-variant">
              {producto.descripcion}
            </p>
          </div>

          <div className="mt-lg border-t border-outline-variant pt-lg">
            <CotizadorWhatsApp producto={producto} marcaLabel={nombreMarca} />
          </div>
        </div>
      </div>

      {/* Repuestos relacionados */}
      {sugeridos.length > 0 && (
        <section aria-labelledby="titulo-relacionados" className="pt-xl">
          <div className="mb-lg flex flex-wrap items-center justify-between gap-x-md gap-y-sm">
            <h2
              id="titulo-relacionados"
              className="flex items-center gap-sm text-headline-md text-on-surface"
            >
              <Icon name="account_tree" size={24} className="shrink-0 text-primary" />
              Repuestos relacionados
            </h2>
            <Link
              href={RUTA_CATALOGO}
              className="inline-flex shrink-0 items-center gap-xs font-mono text-label-technical text-primary hover:underline"
            >
              Ver todo el catálogo
              <Icon name="arrow_forward" size={16} />
            </Link>
          </div>

          {/*
           * Carrusel hasta `md` y retícula a partir de ahí. El envoltorio
           * `carril` añade el degradado en los extremos, que es la única señal
           * de que hay más fichas fuera del borde; al llegar a cada tope se
           * apaga solo. En la retícula sobra, y se oculta.
           */}
          <div
            className="carril -mx-[var(--gutter)] md:mx-0 md:before:hidden md:after:hidden"
            style={{ "--carril-fondo": "var(--color-surface-bright)" } as React.CSSProperties}
          >
            <ul className="carril-pista gap-md px-[var(--gutter)] pb-sm md:grid md:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] md:overflow-x-visible md:px-0">
              {sugeridos.map((rel) => (
                <li key={rel.id} className="w-40 shrink-0 md:w-auto">
                  <Link
                    href={rutaProducto(rel.id)}
                    className="group flex h-full w-full flex-col gap-sm rounded-lg border border-outline-variant bg-surface-container-lowest p-sm transition-shadow hover:shadow-e2 md:p-md"
                  >
                    <span className="relative mb-sm block h-24 overflow-hidden rounded-lg bg-surface-container-low md:h-32">
                      <Image
                        src={rel.imagen}
                        alt=""
                        fill
                        loading="lazy"
                        sizes="200px"
                        className="object-contain p-2 transition-transform motion-safe:group-hover:scale-110"
                      />
                    </span>
                    <span className="font-mono text-label-sm text-on-surface-variant">
                      {rel.oem ? `OEM: ${rel.oem}` : etiquetaMarca(rel.marca)}
                    </span>
                    <span className="line-clamp-2 text-label-sm font-semibold leading-tight text-on-surface md:text-body-md">
                      {rel.nombre}
                    </span>
                    <span className="mt-auto flex items-center justify-between border-t border-outline-variant pt-sm">
                      <span className="font-mono text-label-sm uppercase tracking-[0.1em] text-primary">
                        Ver ficha
                      </span>
                      <Icon
                        name="chevron_right"
                        size={20}
                        className="text-primary transition-transform motion-safe:group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
