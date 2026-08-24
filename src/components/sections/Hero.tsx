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
      {/* Capas de fondo, de atrás hacia delante: imagen, retícula técnica,
          halo radial y velo que garantiza el contraste del texto. */}
      <Image
        src="/images/hero.svg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div aria-hidden className="reticula absolute inset-0 z-10 opacity-60" />
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-[radial-gradient(65%_75%_at_78%_18%,rgba(255,255,255,0.5),transparent_65%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 z-10 bg-gradient-to-r from-surface/92 via-surface/70 to-surface/35"
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
