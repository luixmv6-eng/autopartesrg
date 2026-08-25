"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Fotografías de la sección.
 *
 * Tres imágenes distintas, una por pestaña, para que la página no repita el
 * mismo motor tres veces. La cabecera reutiliza la del vano motor: es la única
 * con resolución para una banda de 3:1, y allí el recorte panorámico la hace
 * irreconocible frente al de la pestaña.
 *
 * Todas reciben el mismo tratamiento —recorte por `object-cover` y el tinte
 * azul de marca— para que se lean como una sola familia.
 */
const FOTOS = {
  motor: "/images/hero.png",
  culata: "/images/nosotros-culata.jpg",
  bloque: "/images/nosotros-bloque.jpg",
} as const;

/** Tarjetas de valores, alineadas con lo que el negocio dice de sí mismo. */
const VALORES: Array<{ icono: IconName; titulo: string; texto: string }> = [
  {
    icono: "precision_manufacturing",
    titulo: "Originales y alternativas",
    texto:
      "Un amplio stock de marcas originales y alternativas, para que puedas elegir entre el repuesto de agencia y una opción más económica que cumpla.",
  },
  {
    icono: "local_shipping",
    titulo: "Envíos a toda Colombia",
    texto:
      "Cotizamos con varias transportadoras y te ayudamos a elegir la que más te convenga. Despacho de uno a tres días tras confirmar el pago.",
  },
  {
    icono: "verified",
    titulo: "Asesoría experta",
    texto:
      "Un equipo altamente calificado que verifica la compatibilidad antes de que compres, para que la pieza entre a la primera.",
  },
];

interface Bloque {
  titulo: string;
  parrafos?: string[];
  puntos?: string[];
}

interface Pestana {
  id: string;
  label: string;
  icono: IconName;
  titulo: string;
  parrafos?: string[];
  puntos?: string[];
  /** Apartados internos, para los textos largos de las dos políticas. */
  bloques?: Bloque[];
  /** Alterna el lado de la imagen entre pestañas, como en la maqueta. */
  imagenPrimero?: boolean;
  /**
   * Sin imagen y a todo el ancho.
   *
   * Las políticas son textos largos y con apartados. Encajonarlas en media
   * columna las convertía en una tira estrechísima de veinte líneas, y estiraba
   * la fotografía de al lado hasta deformarla. A todo el ancho se leen como lo
   * que son: un documento de referencia.
   */
  anchoCompleto?: boolean;
  /** Texto alternativo de la imagen de la pestaña. */
  alt?: string;
  /** Fotografía de la pestaña. */
  foto?: string;
  /** Zona de la fotografía que se muestra. */
  encuadre?: string;
}

/**
 * Contenido facilitado por el negocio.
 *
 * El orden lo fija el encargo: Visión, Misión y Sobre nosotros primero, que son
 * la presentación; después las dos políticas, que son información de referencia
 * y se consultan, no se leen de corrido.
 */
const PESTANAS: Pestana[] = [
  {
    id: "vision",
    label: "Visión",
    icono: "insights",
    titulo: "Nuestra visión",
    alt: "Culata de motor con riel e inyectores de alta presión",
    foto: FOTOS.culata,
    encuadre: "50% 45%",
    parrafos: [
      "La visión de Autopartes ERG es conectar el mercado por la disponibilidad, oportunidad y competitividad, en el abastecimiento de repuestos y servicios para vehículos.",
    ],
  },
  {
    id: "mision",
    label: "Misión",
    icono: "precision_manufacturing",
    titulo: "Nuestra misión",
    imagenPrimero: true,
    alt: "Bloque de motor mecanizado, con los cilindros a la vista",
    foto: FOTOS.bloque,
    encuadre: "45% 50%",
    parrafos: [
      "Somos una empresa dedicada a la comercialización de autopartes y repuestos de alta calidad. Ofrecemos un amplio stock de marcas originales y alternativas a precios competitivos, solucionando las necesidades de nuestros clientes de forma inmediata y profesional.",
    ],
  },
  {
    id: "sobre-nosotros",
    label: "Sobre nosotros",
    icono: "history",
    titulo: "Sobre nosotros",
    alt: "Alternador y poleas de accesorios en el vano motor",
    foto: FOTOS.motor,
    encuadre: "25% 70%",
    parrafos: [
      "Somos una empresa especializada en el sector de repuestos automotriz, con 4 años de trayectoria en el mercado. Contamos con un equipo de personal altamente calificado que brinda asesoría experta a cada uno de nuestros clientes.",
      "Nos esforzamos día a día por ofrecer una experiencia de compra segura, garantizando la confianza y el respaldo que tu vehículo necesita para seguir en movimiento.",
    ],
    puntos: [
      "4 años de trayectoria en el sector automotriz.",
      "Equipo de personal altamente calificado.",
      "Asesoría experta en cada compra.",
    ],
  },
  {
    id: "garantias",
    label: "Garantías",
    icono: "verified",
    titulo: "Política de devoluciones y garantías",
    anchoCompleto: true,
    parrafos: [
      "Una vez expire el término de la garantía legal, el cliente deberá asumir el pago de cualquier revisión, diagnóstico, reparación y/o repuesto que requiera el bien.",
    ],
    bloques: [
      {
        titulo: "Cambio del producto o devolución del dinero",
        parrafos: [
          "Se procederá al cambio de un producto o a la devolución de lo pagado por este por parte de Autopartes ERG, a elección del consumidor, siempre que, estando dentro del plazo de garantía, el producto reincida en la misma falla o no se cuente con el repuesto requerido para su correcto funcionamiento.",
        ],
      },
      {
        titulo: "Costos de transporte",
        parrafos: [
          "Si el producto estuviera en un lugar diferente al de la compra, el cliente deberá asumir los costos de transporte para hacer efectiva la garantía.",
        ],
      },
    ],
  },
  {
    id: "envios",
    label: "Envíos",
    icono: "local_shipping",
    titulo: "Política de fletes y manipulación",
    anchoCompleto: true,
    bloques: [
      {
        titulo: "Tiempo de envío",
        parrafos: [
          "De uno a tres días, después de confirmar su pago y dependiendo de la existencia en stock de los artículos solicitados. Contáctanos para ofrecerte información sobre la disponibilidad del artículo y el tiempo de entrega.",
        ],
      },
      {
        titulo: "Envío de tu mercancía a toda Colombia",
        parrafos: [
          "Sabemos lo importante que es para ti recibir tu mercancía de manera segura, y por eso te ayudamos a seleccionar el mejor método de envío. Cotizamos con distintas paqueterías, compañías fleteras y transportes de carga para que elijas la que más te convenga, o bien nos sugieras la compañía de transporte de tu preferencia.",
          "No importa dónde te encuentres: en Autopartes ERG hacemos todo lo que está en nuestras manos para embarcar tu mercancía lo más rápido posible y que el transporte la lleve al destino que tú elijas.",
          "Registra correctamente tu dirección al momento de realizar tu pedido, para poder cotizar la mejor opción de envío.",
        ],
      },
      {
        titulo: "Responsabilidad sobre el transporte",
        parrafos: [
          "Autopartes ERG no es la compañía de transporte y no tiene control sobre el envío una vez que la mercancía sale de nuestro almacén, por lo que no se hace responsable de los daños y/o pérdidas. Una vez que la mercancía sale de nuestras instalaciones, el embarque se consigna al cliente.",
          "Tu pedido será empaquetado para que salga en buenas condiciones de nuestras instalaciones y quede protegido del daño que pudiera presentarse durante la manipulación normal de su transportación.",
        ],
      },
      {
        titulo: "Al recibir la mercancía",
        parrafos: [
          "La mercancía debe ser inspeccionada por el destinatario tan pronto como sea recibida de la compañía de transporte.",
        ],
        puntos: [
          "Si algún producto está dañado, ANTES de aceptar la mercancía haz el reclamo al transportista en ese mismo momento y deja constancia escrita del daño.",
          "Toma fotografías digitales de los daños: acelera el proceso de reclamación.",
          "Si después aparecieran pérdidas o daños ocultos, notifícalos al transportista de inmediato y presenta el reclamo a la compañía de transporte.",
          "Autopartes ERG no se hace responsable de las reclamaciones de transporte, ni del reemplazo de productos o partes extraviadas o dañadas.",
        ],
      },
      {
        titulo: "Rastreo de tu pedido",
        parrafos: [
          "Se te enviará un correo electrónico de confirmación con la información de rastreo, para que puedas saber en tiempo real dónde está tu mercancía.",
        ],
      },
    ],
  },
];

function suscribirAlHash(alCambiar: () => void) {
  window.addEventListener("hashchange", alCambiar);
  return () => window.removeEventListener("hashchange", alCambiar);
}

/** Párrafos de un bloque o de la pestaña, con el mismo tratamiento. */
function Parrafos({ textos }: { textos: string[] }) {
  return (
    <>
      {textos.map((texto) => (
        <p
          key={texto.slice(0, 24)}
          className="mt-sm text-body-md leading-relaxed text-on-surface-variant first:mt-0 md:text-body-lg"
        >
          {texto}
        </p>
      ))}
    </>
  );
}

export function Nosotros() {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Los enlaces del menú (#sobre-nosotros, #mision, #vision…) activan su pestaña.
  const hash = useSyncExternalStore(
    suscribirAlHash,
    () => window.location.hash.replace("#", ""),
    () => ""
  );

  const [activa, setActiva] = useState(PESTANAS[0].id);
  const [hashPrevio, setHashPrevio] = useState("");

  if (hash !== hashPrevio) {
    setHashPrevio(hash);
    if (PESTANAS.some((p) => p.id === hash)) setActiva(hash);
  }

  const alPulsarTecla = (evento: React.KeyboardEvent) => {
    const indice = PESTANAS.findIndex((p) => p.id === activa);
    let siguiente = indice;
    if (evento.key === "ArrowRight") siguiente = (indice + 1) % PESTANAS.length;
    else if (evento.key === "ArrowLeft")
      siguiente = (indice - 1 + PESTANAS.length) % PESTANAS.length;
    else if (evento.key === "Home") siguiente = 0;
    else if (evento.key === "End") siguiente = PESTANAS.length - 1;
    else return;
    evento.preventDefault();
    const id = PESTANAS[siguiente].id;
    setActiva(id);
    refs.current[id]?.focus();
  };

  return (
    <section
      id="nosotros"
      aria-labelledby="titulo-nosotros"
      className="border-t border-outline-variant bg-background"
    >
      <div className="contenedor flex flex-col gap-xl py-xl">
        {/* Encabezado */}
        <div className="reveal flex flex-col gap-md">
          <p className="eyebrow">Nosotros</p>
          <h1 id="titulo-nosotros" className="display-tight text-display-lg text-on-surface">
            Nuestra historia
          </h1>
          <p className="max-w-[65ch] text-body-lg text-on-surface-variant">
            Cuatro años abasteciendo al sector automotriz con repuestos originales y alternativos,
            más la asesoría necesaria para acertar con la pieza.
          </p>
          {/* Proporción en vez de alto fijo: la banda mantiene el mismo recorte
              en cualquier anchura, con un tope para que no se coma la pantalla
              en un monitor ancho. */}
          <div className="relative mt-sm aspect-[16/9] max-h-[22rem] w-full overflow-hidden rounded-xl border border-outline-variant sm:aspect-[3/1]">
            <Image
              src={FOTOS.motor}
              alt="Vano motor de un vehículo con correas, poleas y engranajes de distribución"
              fill
              loading="lazy"
              sizes="(min-width: 96rem) 1408px, 100vw"
              className="object-cover"
              style={{ objectPosition: "50% 55%" }}
            />
            {/* El mismo tinte azul del hero, para que las dos bandas del sitio
                se lean como parte de la misma pieza gráfica. */}
            <div aria-hidden className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
          </div>
        </div>

        {/* Valores */}
        <ul className="reveal grid grid-cols-1 gap-md sm:grid-cols-2 lg:grid-cols-3">
          {VALORES.map((v) => (
            <li
              key={v.titulo}
              /* Con dos columnas y tres tarjetas, la última ocupa el ancho
                 completo en vez de dejar un hueco a su derecha. */
              className="borde-vivo group flex flex-col gap-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-e1 transition-[translate,box-shadow] duration-300 motion-safe:hover:-translate-y-1 hover:shadow-realce sm:last:col-span-2 md:p-lg lg:last:col-span-1"
            >
              <div className="flex items-center gap-sm">
                <span className="grid size-10 place-items-center rounded-lg bg-primary-fixed text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-on-primary">
                  <Icon name={v.icono} size={24} />
                </span>
                <h2 className="text-headline-md tracking-[-0.01em] text-on-surface">{v.titulo}</h2>
              </div>
              <p className="text-body-md text-on-surface-variant">{v.texto}</p>
            </li>
          ))}
        </ul>

        {/* Pestañas */}
        <div className="reveal">
          <div
            role="tablist"
            aria-label="Información sobre Autopartes ERG"
            onKeyDown={alPulsarTecla}
            /*
             * Cinco pestañas, repartidas en una retícula que se reordena.
             * Antes eran tres columnas fijas; con cinco, las etiquetas se
             * apretaban hasta partirse en un portátil. En móvil van de dos en
             * dos, y a partir de `lg` caben las cinco en una fila.
             */
            className="mb-lg grid grid-cols-2 border-b border-outline-variant xs:grid-cols-3 lg:grid-cols-5"
          >
            {PESTANAS.map((p) => {
              const activo = p.id === activa;
              return (
                <button
                  key={p.id}
                  id={p.id}
                  ref={(el) => {
                    refs.current[p.id] = el;
                  }}
                  role="tab"
                  type="button"
                  aria-selected={activo}
                  aria-controls={`panel-${p.id}`}
                  tabIndex={activo ? 0 : -1}
                  onClick={() => setActiva(p.id)}
                  className={cn(
                    // Área táctil de 44px garantizada aunque la etiqueta quepa
                    // en una sola línea corta.
                    "relative min-h-11 px-sm py-sm font-mono text-[11px] uppercase leading-tight tracking-[0.06em] transition-colors duration-300 xs:text-label-technical xs:tracking-[0.08em] md:px-md",
                    activo
                      ? "bg-surface-container-low text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface"
                  )}
                >
                  {p.label}
                  {/* Indicador: se despliega desde el centro al activarse */}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 bottom-0 h-0.5 origin-center bg-primary transition-transform duration-300 ease-out",
                      activo ? "scale-x-100" : "scale-x-0"
                    )}
                  />
                </button>
              );
            })}
          </div>

          {PESTANAS.map((p) => (
            <div
              key={p.id}
              id={`panel-${p.id}`}
              role="tabpanel"
              aria-labelledby={p.id}
              hidden={p.id !== activa}
              tabIndex={0}
              className={cn(
                "grid grid-cols-1 gap-lg",
                !p.anchoCompleto && "md:grid-cols-2"
              )}
            >
              {!p.anchoCompleto && (
                <div
                  className={cn(
                    "relative aspect-[16/10] overflow-hidden rounded-lg border border-outline-variant shadow-e1 md:aspect-auto md:min-h-72",
                    p.imagenPrimero ? "md:order-first" : "md:order-last"
                  )}
                >
                  <Image
                    src={p.foto ?? FOTOS.motor}
                    alt={p.alt ?? ""}
                    fill
                    loading="lazy"
                    sizes="(min-width: 48rem) 50vw, 100vw"
                    className="object-cover"
                    style={{ objectPosition: p.encuadre ?? "50% 50%" }}
                  />
                  <div aria-hidden className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
                </div>
              )}

              <div className="flex flex-col justify-center rounded-lg border border-outline-variant bg-surface-container-lowest p-md shadow-e1 md:p-lg">
                <h2 className="display-tight mb-md flex items-center gap-sm text-headline-lg text-primary">
                  <Icon name={p.icono} size={28} className="shrink-0" />
                  {p.titulo}
                </h2>

                {p.parrafos && <Parrafos textos={p.parrafos} />}

                {p.puntos && (
                  <ul className="mt-md list-inside list-disc text-body-md text-on-surface-variant">
                    {p.puntos.map((punto) => (
                      <li key={punto}>{punto}</li>
                    ))}
                  </ul>
                )}

                {/*
                 * Apartados de las políticas.
                 *
                 * La medida se acota en caracteres: un texto legal a todo el
                 * ancho de un monitor daría renglones de 200 caracteres, que se
                 * pierden al saltar de línea.
                 */}
                {p.bloques && (
                  <div className="mt-lg flex max-w-[80ch] flex-col gap-lg">
                    {p.bloques.map((b) => (
                      <div key={b.titulo}>
                        <h3 className="mb-xs font-mono text-label-technical uppercase tracking-[0.1em] text-primary">
                          {b.titulo}
                        </h3>
                        {b.parrafos && <Parrafos textos={b.parrafos} />}
                        {b.puntos && (
                          <ul className="mt-sm flex flex-col gap-xs text-body-md leading-relaxed text-on-surface-variant">
                            {b.puntos.map((punto) => (
                              <li key={punto} className="flex gap-sm">
                                <Icon
                                  name="check_circle"
                                  size={18}
                                  className="mt-0.5 shrink-0 text-primary"
                                />
                                <span>{punto}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
