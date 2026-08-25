"use client";

import { useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { useFiltros } from "@/hooks/useFiltros";

/**
 * Hero del catálogo: imagen técnica a sangre, degradado sobre ella y una
 * tarjeta blanca con el buscador. Réplica de la pantalla Home de Stitch.
 */
export function Hero() {
  const { filtros, definirVarios } = useFiltros();

  const [termino, setTermino] = useState(filtros.q);
  const [modelo, setModelo] = useState(filtros.modelo);
  const [previo, setPrevio] = useState(`${filtros.q}|${filtros.modelo}`);

  const firma = `${filtros.q}|${filtros.modelo}`;
  if (firma !== previo) {
    setPrevio(firma);
    setTermino(filtros.q);
    setModelo(filtros.modelo);
  }

  const buscar = (evento: React.FormEvent) => {
    evento.preventDefault();
    definirVarios({ q: termino.trim() || null, modelo: modelo.trim() || null });
    document.getElementById("catalogo")?.scrollIntoView({ block: "start" });
  };

  return (
    <section
      id="inicio"
      className="hero-barrido alto-hero relative flex items-center justify-center overflow-hidden"
    >
      {/*
       * Capas de fondo, de atrás hacia delante:
       *   1. la fotografía del motor,
       *   2. el tinte azul de marca,
       *   3. la retícula técnica,
       *   4. el velo que garantiza que el titular se lea.
       *
       * El orden importa: el tinte va pegado a la foto, por debajo del velo. Si
       * fuera al revés teñiría también el texto y lo enturbiaría. Así el azul se
       * nota donde la foto se ve —la derecha— y desaparece bajo el velo de la
       * izquierda, que es donde vive el titular.
       */}
      <Image
        src="/images/hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Tinte azul de marca, muy tenue: da color sin tapar la fotografía. */}
      <div aria-hidden className="absolute inset-0 bg-primary/20 mix-blend-multiply" />
      <div aria-hidden className="reticula absolute inset-0 z-10 opacity-40" />
      {/*
       * Velo de legibilidad. El titular es casi negro (#1a1c1e) sobre una foto
       * de medios tonos: sin esto no habría contraste suficiente para leerlo.
       *
       * Es radial y centrado, no un degradado de izquierda a derecha. El de
       * antes venía de una maqueta con el texto alineado a la izquierda; sobre
       * un titular centrado dejaba la foto lavada en un lado y oscura en el
       * otro, como si el velo estuviera descuadrado. Centrado, protege el texto
       * y deja que la fotografía respire por igual en los cuatro bordes.
       */}
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-[radial-gradient(58%_62%_at_50%_46%,rgba(249,249,252,0.94),rgba(249,249,252,0.72)_45%,rgba(249,249,252,0.28)_100%)]"
      />
      {/* Filo inferior: marca el corte hacia el catálogo. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 z-20 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
      />

      {/*
       * La medida crece con la pantalla en tres escalones. Encajonar el hero en
       * `max-w-3xl` (48rem) dejaba un bloque estrecho perdido en el centro de
       * un monitor ancho; pasar de ahí sin control estropearía la medida de
       * línea del subtítulo, así que crece el continente y no el texto.
       */}
      <div className="hero-entra contenedor-fluido relative z-20 mx-auto max-w-3xl py-xl text-center xl:max-w-4xl 3xl:max-w-5xl">
        <p className="eyebrow mb-md justify-center">Catálogo técnico</p>
        <h1 className="display-tight mb-sm text-display-lg text-on-surface">
          Encuentra la pieza exacta
        </h1>
        <p className="mx-auto mb-lg max-w-[42ch] text-balance text-body-lg text-on-surface-variant">
          Precisión técnica y confiabilidad para tu vehículo.
        </p>

        {/*
         * Retícula en tres etapas en vez del salto único de columna a fila:
         *   móvil    los tres controles apilados;
         *   xs+      término y modelo comparten fila, el botón debajo a lo ancho;
         *   lg+      los tres en línea, con el término llevándose el sobrante.
         * En tableta vertical la fila de tres apretaba el campo de búsqueda
         * hasta dejarlo más corto que su propio marcador de posición.
         */}
        <form
          onSubmit={buscar}
          role="search"
          className="grid gap-sm rounded-lg border border-outline-variant bg-surface-container-lowest p-sm shadow-e2 transition-shadow duration-300 focus-within:border-primary/50 focus-within:shadow-realce xs:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_13rem_auto]"
        >
          <div className="flex min-w-0 items-center rounded border border-borde-campo bg-surface-container-low px-3 transition-colors focus-within:border-primary">
            <label htmlFor="hero-q" className="sr-only">
              Buscar repuesto por nombre, marca o modelo
            </label>
            <Icon name="search" size={20} className="mr-2 text-outline" />
            <input
              id="hero-q"
              type="search"
              value={termino}
              onChange={(e) => setTermino(e.target.value)}
              placeholder="Ej. Kit de clutch NP300"
              className="h-11 w-full min-w-0 border-none bg-transparent p-0 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant"
            />
          </div>

          <div className="flex min-w-0 items-center rounded border border-borde-campo bg-surface-container-low px-3 transition-colors focus-within:border-primary">
            <label htmlFor="hero-modelo" className="sr-only">
              Modelo del vehículo, opcional
            </label>
            <Icon name="directions_car" size={20} className="mr-2 text-outline" />
            <input
              id="hero-modelo"
              type="text"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="Modelo (opcional)"
              className="h-11 w-full min-w-0 border-none bg-transparent p-0 font-mono text-label-technical text-on-surface outline-none placeholder:text-on-surface-variant"
            />
          </div>

          <button
            type="submit"
            className="flex h-11 items-center justify-center gap-xs rounded bg-accent px-lg font-mono text-label-technical uppercase tracking-[0.1em] text-on-accent shadow-e1 transition-[background-color,transform] hover:bg-accent-hover motion-safe:active:scale-[0.98] xs:col-span-2 lg:col-span-1"
          >
            Buscar
            <Icon name="arrow_forward" size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}
