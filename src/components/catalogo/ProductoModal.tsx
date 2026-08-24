"use client";

import { useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { BadgeTecnico } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { relacionados } from "@/lib/productos";
import { LABEL_CATEGORIA, LABEL_MARCA, LABEL_SECCION } from "@/lib/taxonomia";
import type { Producto } from "@/lib/types";
import { listarCompatibles, nombrarVehiculo, rangoAniosLegible } from "@/lib/utils";
import { enlaceWhatsApp, mensajeCotizacion } from "@/lib/whatsapp";

interface Props {
  producto: Producto | null;
  onCerrar: () => void;
  onAbrirOtro: (producto: Producto) => void;
}

const mensajeInicial = (producto: Producto | null, modelo: string) =>
  producto ? mensajeCotizacion(producto, modelo) : "";

/**
 * Ficha técnica. Réplica de la pantalla "Detalle de Producto" de Stitch:
 * cabecera con `verified`, galería a la izquierda, datos a la derecha, callout
 * de compatibilidad, tabla de especificaciones con filas alternas, CTA de
 * WhatsApp con vista previa del mensaje y repuestos relacionados. Sin precio:
 * el catálogo no publica importes, la cotización se resuelve por WhatsApp.
 */
export function ProductoModal({ producto, onCerrar, onAbrirOtro }: Props) {
  const modeloInicial = producto?.modelos[0] ?? "";
  const [productoPrevio, setProductoPrevio] = useState(producto);
  const [modelo, setModelo] = useState(modeloInicial);
  const [mensaje, setMensaje] = useState(() => mensajeInicial(producto, modeloInicial));
  const [editando, setEditando] = useState(false);

  if (producto !== productoPrevio) {
    setProductoPrevio(producto);
    setModelo(modeloInicial);
    setMensaje(mensajeInicial(producto, modeloInicial));
    setEditando(false);
  }

  const cambiarModelo = (valor: string) => {
    setModelo(valor);
    if (!editando) setMensaje(mensajeInicial(producto, valor));
  };

  const alternarEdicion = () => {
    if (editando) setMensaje(mensajeInicial(producto, modelo));
    setEditando((v) => !v);
  };

  if (!producto) {
    return (
      <Modal abierto={false} onCerrar={onCerrar} labelledBy="ficha-titulo">
        <span className="sr-only">Sin repuesto seleccionado</span>
      </Modal>
    );
  }

  const compatibles = listarCompatibles(producto);
  const anios = rangoAniosLegible(producto.anioDesde, producto.anioHasta);

  // Sin condición ni disponibilidad: son datos de inventario que el catálogo
  // no puede sostener todavía. Se confirman por WhatsApp. La fila del número de
  // parte solo se dibuja cuando el repuesto trae referencia impresa.
  const especificaciones: Array<{ etiqueta: string; valor: React.ReactNode }> = [
    { etiqueta: "Marca", valor: LABEL_MARCA[producto.marca] },
    { etiqueta: "Modelos", valor: producto.modelos.join(", ") },
    { etiqueta: "Años", valor: <span className="tabular">{anios}</span> },
    { etiqueta: "Categoría", valor: LABEL_CATEGORIA[producto.categoria] },
    { etiqueta: "Sección", valor: LABEL_SECCION[producto.seccion] },
    ...(producto.oem
      ? [{ etiqueta: "N.º de parte", valor: <span className="tabular">{producto.oem}</span> }]
      : []),
  ];

  const sugeridos = relacionados(producto);

  return (
    <Modal abierto onCerrar={onCerrar} labelledBy="ficha-titulo">
      <div className="flex h-dvh flex-col sm:h-auto sm:max-h-[calc(100dvh-var(--gutter)*2)]">
        <header className="flex shrink-0 items-center justify-between border-b border-outline-variant bg-surface-bright px-md py-sm md:px-lg md:py-md">
          <span className="flex items-center gap-sm">
            <Icon name="verified" size={24} className="text-primary" />
            <span className="font-mono text-label-sm uppercase tracking-wider text-on-surface-variant md:text-label-technical">
              Ficha Técnica de Autoparte
            </span>
          </span>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar ficha técnica"
            className="group grid size-11 place-items-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            <Icon name="close" size={24} className="group-hover:text-error" />
          </button>
        </header>

        <div className="custom-scrollbar flex-1 overflow-y-auto overscroll-contain bg-surface-bright">
          <div className="grid grid-cols-1 border-b border-outline-variant lg:grid-cols-12">
            {/* Imagen */}
            {/* En escritorio la imagen queda fija mientras se leen las
                especificaciones, en vez de estirarse con la columna de datos. */}
            {/* Alto fluido: fijo en 560px, en una pantalla de portátil de 720px
                la imagen se comía la ficha entera y las especificaciones
                quedaban siempre por debajo del pliegue. */}
            <div className="group relative flex aspect-[4/3] max-h-[45svh] items-center justify-center bg-surface-container-low lg:sticky lg:top-0 lg:col-span-7 lg:aspect-auto lg:h-[clamp(24rem,38vw,35rem)] lg:max-h-none lg:self-start lg:border-r lg:border-outline-variant">
              <Image
                src={producto.imagen}
                alt={`${producto.nombre} para ${nombrarVehiculo(producto, producto.modelos[0])}`}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-contain p-lg transition-transform duration-[var(--dur-panel)] motion-safe:group-hover:scale-105 lg:p-xl"
              />
              <span className="absolute bottom-md right-md flex items-center rounded-lg border border-outline-variant bg-surface-container-lowest/80 p-sm text-on-surface-variant shadow-e1 backdrop-blur-md">
                <Icon name="zoom_in" size={20} />
              </span>
            </div>

            {/* Datos */}
            <div className="flex flex-col justify-between bg-surface-container-lowest p-md lg:col-span-5 lg:p-xl">
              <div className="flex flex-col gap-md">
                <p className="flex items-center gap-xs font-mono text-label-technical text-on-surface-variant">
                  <span>{LABEL_CATEGORIA[producto.categoria]}</span>
                  <Icon name="chevron_right" size={16} />
                  <span>{LABEL_SECCION[producto.seccion]}</span>
                </p>

                <div>
                  <h2 id="ficha-titulo" className="mb-sm text-headline-lg text-on-surface">
                    {producto.nombre}
                  </h2>
                  {/* La insignia solo aparece si hay referencia impresa. Un
                      "OEM: —" ocuparía el mismo sitio sin decir nada. */}
                  {producto.oem && <BadgeTecnico>OEM: {producto.oem}</BadgeTecnico>}
                </div>

                <div className="mt-sm flex items-start gap-sm rounded-lg border border-primary-fixed-dim bg-primary-fixed p-md">
                  <Icon name="check_circle" size={24} filled className="mt-xs text-primary" />
                  <div>
                    <h3 className="text-body-md font-bold text-on-primary-fixed">
                      Compatibilidad confirmada
                    </h3>
                    <p className="mt-xs text-body-md text-on-primary-fixed-variant">
                      Ajuste para: <strong>{compatibles}</strong>{" "}
                      <span className="tabular">({anios})</span>.
                    </p>
                  </div>
                </div>

                {/*
                 * Especificaciones, con filas alternas.
                 *
                 * Una sola retícula para toda la lista, no una por fila: así
                 * las dos columnas se alinean entre filas y la de etiquetas se
                 * mide por la etiqueta más larga en vez de llevarse un tercio
                 * fijo. En un móvil estrecho ese tercio dejaba valores como
                 * "Corolla, Yaris, Camry" partidos en cuatro líneas.
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

              {/* Cotización */}
              <div className="mt-lg flex flex-col gap-md border-t border-outline-variant pt-lg">
                {/* Sin precio publicado: la cotización se resuelve por WhatsApp. */}
                <p className="flex items-start gap-sm text-body-md text-on-surface-variant">
                  <Icon name="forum" size={24} className="mt-0.5 text-primary" />
                  Confirmamos disponibilidad y precio por WhatsApp el mismo día.
                </p>

                {producto.modelos.length > 1 && (
                  <div>
                    <label
                      htmlFor="modelo-cotizacion"
                      className="mb-xs block text-label-technical font-semibold text-on-surface"
                    >
                      Modelo de tu vehículo
                    </label>
                    <select
                      id="modelo-cotizacion"
                      value={modelo}
                      onChange={(e) => cambiarModelo(e.target.value)}
                      className="h-11 w-full rounded-lg border border-borde-campo bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition-colors focus:border-primary"
                    >
                      {producto.modelos.map((m) => (
                        <option key={m} value={m}>
                          {nombrarVehiculo(producto, m)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <ButtonLink
                  href={enlaceWhatsApp(mensaje)}
                  target="_blank"
                  rel="noopener noreferrer"
                  variante="cta"
                  tamano="lg"
                  className="w-full"
                >
                  <Icon name="chat" size={24} />
                  Cotizar por WhatsApp
                </ButtonLink>

                {/* Vista previa del mensaje, editable */}
                <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-sm">
                  <div className="flex items-center justify-between gap-sm">
                    <label
                      htmlFor="mensaje-cotizacion"
                      className="font-mono text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant"
                    >
                      Mensaje que se enviará
                    </label>
                    <button
                      type="button"
                      onClick={alternarEdicion}
                      aria-pressed={editando}
                      className="inline-flex h-9 items-center gap-xs rounded px-2 font-mono text-label-sm font-semibold text-primary transition-colors hover:bg-primary-fixed"
                    >
                      <Icon name={editando ? "refresh" : "edit"} size={16} />
                      {editando ? "Restaurar" : "Editar"}
                    </button>
                  </div>
                  <textarea
                    id="mensaje-cotizacion"
                    value={mensaje}
                    readOnly={!editando}
                    onChange={(e) => setMensaje(e.target.value)}
                    rows={3}
                    className="mt-xs w-full resize-y rounded border border-transparent bg-transparent p-1 text-label-technical italic leading-relaxed text-on-surface-variant outline-none focus:border-primary focus:bg-surface-container-lowest focus:not-italic"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Repuestos relacionados */}
          {sugeridos.length > 0 && (
            <section className="bg-surface-bright p-md lg:p-xl">
              <div className="mb-lg flex flex-wrap items-center justify-between gap-x-md gap-y-sm">
                <h3 className="flex items-center gap-sm text-headline-md text-on-surface">
                  <Icon name="account_tree" size={24} className="shrink-0 text-primary" />
                  Repuestos Relacionados
                </h3>
                <button
                  type="button"
                  onClick={onCerrar}
                  className="inline-flex shrink-0 items-center gap-xs font-mono text-label-technical text-primary hover:underline"
                >
                  Ver todo el catálogo
                  <Icon name="arrow_forward" size={16} />
                </button>
              </div>

              {/*
               * Carrusel hasta `md` y retícula a partir de ahí. El envoltorio
               * `carril` añade el degradado en los extremos, que es la única
               * señal de que hay más fichas fuera del borde; al llegar a cada
               * tope se apaga solo. En la retícula sobra, y se oculta.
               */}
              <div
                className="carril -mx-[var(--gutter)] md:mx-0 md:before:hidden md:after:hidden"
                style={{ "--carril-fondo": "var(--color-surface-bright)" } as React.CSSProperties}
              >
                <ul className="carril-pista gap-md px-[var(--gutter)] pb-sm md:grid md:grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] md:overflow-x-visible md:px-0">
                {sugeridos.map((rel) => (
                  <li
                    key={rel.id}
                    className="w-40 shrink-0 md:w-auto"
                  >
                    <button
                      type="button"
                      onClick={() => onAbrirOtro(rel)}
                      className="group flex h-full w-full flex-col gap-sm rounded-lg border border-outline-variant bg-surface-container-lowest p-sm text-left transition-shadow hover:shadow-e2 md:p-md"
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
                        {rel.oem ? `OEM: ${rel.oem}` : LABEL_MARCA[rel.marca]}
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
                    </button>
                  </li>
                ))}
                </ul>
              </div>
            </section>
          )}
        </div>
      </div>
    </Modal>
  );
}
