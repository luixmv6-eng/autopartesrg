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
import { rangoAniosLegible } from "@/lib/utils";
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

  const compatibles = producto.modelos
    .map((m) => `${LABEL_MARCA[producto.marca]} ${m}`)
    .join(", ");
  const anios = rangoAniosLegible(producto.anioDesde, producto.anioHasta);

  // Sin condición ni disponibilidad: son datos de inventario que el catálogo
  // no puede sostener todavía. Se confirman por WhatsApp.
  const especificaciones: Array<{ etiqueta: string; valor: React.ReactNode }> = [
    { etiqueta: "Marca", valor: LABEL_MARCA[producto.marca] },
    { etiqueta: "Modelos", valor: producto.modelos.join(", ") },
    { etiqueta: "Años", valor: <span className="tabular">{anios}</span> },
    { etiqueta: "Categoría", valor: LABEL_CATEGORIA[producto.categoria] },
    { etiqueta: "Sección", valor: LABEL_SECCION[producto.seccion] },
  ];

  const sugeridos = relacionados(producto);

  return (
    <Modal abierto onCerrar={onCerrar} labelledBy="ficha-titulo">
      <div className="flex h-dvh flex-col sm:h-auto sm:max-h-[calc(100dvh-2rem)]">
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
            <Icon name="close" size={26} className="group-hover:text-error" />
          </button>
        </header>

        <div className="custom-scrollbar flex-1 overflow-y-auto overscroll-contain bg-surface-bright">
          <div className="grid grid-cols-1 border-b border-outline-variant lg:grid-cols-12">
            {/* Imagen */}
            {/* En escritorio la imagen queda fija mientras se leen las
                especificaciones, en vez de estirarse con la columna de datos. */}
            <div className="group relative flex min-h-[280px] items-center justify-center bg-surface-container-low p-lg lg:sticky lg:top-0 lg:col-span-7 lg:h-[560px] lg:self-start lg:border-r lg:border-outline-variant lg:p-xl">
              <Image
                src={producto.imagen}
                alt={`${producto.nombre} para ${LABEL_MARCA[producto.marca]} ${producto.modelos[0]}`}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-contain p-lg transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute bottom-md right-md flex items-center rounded-lg border border-outline-variant bg-surface-container-lowest/80 p-sm text-on-surface-variant shadow-sm backdrop-blur-md">
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
                  <h2
                    id="ficha-titulo"
                    className="mb-sm text-headline-lg-mobile text-on-surface lg:text-headline-lg"
                  >
                    {producto.nombre}
                  </h2>
                  <div className="flex flex-wrap items-center gap-sm">
                    <BadgeTecnico>OEM: {producto.oem}</BadgeTecnico>
                    <BadgeTecnico>SKU: {producto.sku}</BadgeTecnico>
                  </div>
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

                {/* Especificaciones, con filas alternas */}
                <dl className="mt-md overflow-hidden rounded-lg border border-outline-variant font-mono text-label-technical">
                  {especificaciones.map((fila, i) => (
                    <div
                      key={fila.etiqueta}
                      className={`grid grid-cols-3 p-sm ${
                        i % 2 === 0 ? "bg-surface-container-low" : "bg-surface-container-lowest"
                      } ${i < especificaciones.length - 1 ? "border-b border-outline-variant" : ""}`}
                    >
                      <dt className="col-span-1 text-on-surface-variant">{fila.etiqueta}</dt>
                      <dd className="col-span-2 font-semibold text-on-surface">{fila.valor}</dd>
                    </div>
                  ))}
                </dl>

                <p className="text-body-md leading-relaxed text-on-surface-variant">
                  {producto.descripcion}
                </p>
              </div>

              {/* Cotización */}
              <div className="mt-lg flex flex-col gap-md border-t border-outline-variant pt-lg">
                {/* Sin precio publicado: la cotización se resuelve por WhatsApp. */}
                <p className="flex items-start gap-sm text-body-md text-on-surface-variant">
                  <Icon name="forum" size={22} className="mt-0.5 text-primary" />
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
                      className="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition-colors focus:border-primary"
                    >
                      {producto.modelos.map((m) => (
                        <option key={m} value={m}>
                          {LABEL_MARCA[producto.marca]} {m}
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
              <div className="mb-lg flex items-center justify-between gap-md">
                <h3 className="flex items-center gap-sm text-headline-md text-on-surface">
                  <Icon name="account_tree" size={22} className="text-primary" />
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

              <ul className="-mx-md flex snap-x gap-md overflow-x-auto px-md pb-sm hide-scrollbar md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">
                {sugeridos.map((rel) => (
                  <li
                    key={rel.id}
                    className="w-40 shrink-0 snap-start md:w-auto"
                  >
                    <button
                      type="button"
                      onClick={() => onAbrirOtro(rel)}
                      className="group flex h-full w-full flex-col gap-sm rounded-lg border border-outline-variant bg-surface-container-lowest p-sm text-left transition-shadow hover:shadow-md md:p-md"
                    >
                      <span className="relative mb-sm block h-24 overflow-hidden rounded-md bg-surface-container-low md:h-32">
                        <Image
                          src={rel.imagen}
                          alt=""
                          fill
                          loading="lazy"
                          sizes="200px"
                          className="object-contain p-2 transition-transform group-hover:scale-110"
                        />
                      </span>
                      <span className="font-mono text-label-sm text-on-surface-variant">
                        OEM: {rel.oem}
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
                          className="text-primary transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </Modal>
  );
}
