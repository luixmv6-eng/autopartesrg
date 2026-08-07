"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { GridSkeleton } from "@/components/ui/Skeleton";
import { useFiltros } from "@/hooks/useFiltros";
import { PRODUCTOS, filtrarProductos, rangoAnios } from "@/lib/productos";
import { ORDENES } from "@/lib/taxonomia";
import type { OrdenId, Producto } from "@/lib/types";
import { EstadoVacio } from "./EstadoVacio";
import { FiltroSidebar } from "./FiltroSidebar";
import { ProductoCard } from "./ProductoCard";
import { ProductoModal } from "./ProductoModal";

const POR_PAGINA = 9;
const ANIOS = rangoAnios();

export function Catalogo() {
  const { filtros, alternar, definir, limpiar, chips, firma } = useFiltros();

  const [texto, setTexto] = useState(filtros.q);
  const [qPrevio, setQPrevio] = useState(filtros.q);
  const [cargando, setCargando] = useState(false);
  const [visibles, setVisibles] = useState(POR_PAGINA);
  const [firmaPrevia, setFirmaPrevia] = useState(firma);
  const [panelFiltros, setPanelFiltros] = useState(false);
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null);

  if (filtros.q !== qPrevio) {
    setQPrevio(filtros.q);
    setTexto(filtros.q);
  }

  /**
   * Al cambiar un filtro se vuelve a la primera página y se muestra el estado
   * de carga. Con datos locales el filtrado es inmediato, así que el skeleton
   * se sostiene un instante para que el cambio sea legible. Al conectar una
   * API real basta con atar `cargando` al estado de la petición.
   */
  if (firma !== firmaPrevia) {
    setFirmaPrevia(firma);
    setVisibles(POR_PAGINA);
    setCargando(true);
  }

  // Búsqueda en tiempo real con antirrebote, para no reescribir la URL en cada tecla.
  useEffect(() => {
    if (texto === filtros.q) return;
    const t = setTimeout(() => definir("q", texto.trim() || null), 300);
    return () => clearTimeout(t);
  }, [texto, filtros.q, definir]);

  useEffect(() => {
    if (!cargando) return;
    const t = setTimeout(() => setCargando(false), 260);
    return () => clearTimeout(t);
  }, [cargando]);

  const resultados = useMemo(() => filtrarProductos(filtros), [filtros]);
  const mostrados = resultados.slice(0, visibles);
  const hayFiltros = chips.length > 0;

  const panelLateral = (
    <FiltroSidebar
      filtros={filtros}
      alternar={alternar}
      definir={definir}
      limpiar={limpiar}
      hayFiltros={hayFiltros}
      anios={ANIOS}
      productos={PRODUCTOS}
    />
  );

  return (
    <section id="catalogo" aria-labelledby="titulo-catalogo">
      <div className="mx-auto max-w-7xl px-md pt-xl md:px-xl">
        <p className="eyebrow mb-md">Catálogo</p>
        <h2
          id="titulo-catalogo"
          className="display-tight max-w-2xl text-headline-lg-mobile text-on-surface md:text-headline-lg"
        >
          Todo el inventario, filtrado por compatibilidad
        </h2>
        <p className="mt-sm max-w-[38rem] text-body-md text-on-surface-variant">
          Busca por número de parte o acota por marca, categoría y sección del vehículo.
        </p>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-lg px-md py-lg md:flex-row md:gap-xl md:px-xl md:py-xl">
        {/* Filtros: barra lateral en escritorio */}
        <aside className="hidden w-72 shrink-0 md:block">
          <div className="sticky top-24 flex max-h-[calc(100dvh-8rem)] flex-col overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low shadow-sm">
            {panelLateral}
          </div>
        </aside>

        <div className="flex flex-grow flex-col gap-lg">

          {/* Buscador y controles en móvil */}
          <div className="flex flex-col gap-sm md:hidden">
            <div className="flex items-center rounded-lg border border-outline-variant bg-surface-container-lowest p-sm shadow-sm">
              <label htmlFor="buscador-catalogo" className="sr-only">
                Buscar por número OEM o palabra clave
              </label>
              <Icon name="search" size={22} className="mr-sm text-on-surface-variant" />
              <input
                id="buscador-catalogo"
                type="search"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Buscar por número OEM o palabra clave..."
                className="h-9 w-full border-none bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant"
              />
              {cargando && <Icon name="refresh" size={18} className="animate-spin text-primary" />}
            </div>

            <div className="flex items-center gap-sm">
              <select
                aria-label="Ordenar resultados"
                value={filtros.orden}
                onChange={(e) => definir("orden", e.target.value as OrdenId)}
                className="h-11 flex-grow rounded-lg border border-outline-variant bg-surface-container-high px-3 font-mono text-label-technical text-on-surface-variant outline-none"
              >
                {ORDENES.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <Button variante="primary" onClick={() => setPanelFiltros(true)} aria-haspopup="dialog">
                <Icon name="tune" size={18} />
                Filtrar
                {hayFiltros && (
                  <span className="tabular rounded-full bg-on-primary px-1.5 text-[11px] font-bold text-primary">
                    {chips.length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Buscador y orden en escritorio */}
          <div className="hidden items-center gap-md md:flex">
            <div className="flex flex-grow items-center rounded-lg border border-outline-variant bg-surface-container-lowest px-3 transition-colors focus-within:border-primary">
              <label htmlFor="buscador-catalogo-desktop" className="sr-only">
                Buscar por número OEM o palabra clave
              </label>
              <Icon name="search" size={20} className="mr-sm text-on-surface-variant" />
              <input
                id="buscador-catalogo-desktop"
                type="search"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Buscar por número OEM, nombre, marca o modelo"
                className="h-12 w-full border-none bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant"
              />
              {cargando && <Icon name="refresh" size={18} className="animate-spin text-primary" />}
            </div>
            <select
              aria-label="Ordenar resultados"
              value={filtros.orden}
              onChange={(e) => definir("orden", e.target.value as OrdenId)}
              className="h-12 rounded-lg border border-outline-variant bg-surface-container-lowest px-3 font-mono text-label-technical text-on-surface outline-none focus:border-primary"
            >
              {ORDENES.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Chips de filtros activos */}
          <div className="flex flex-wrap items-center gap-sm border-b border-outline-variant/30 pb-sm">
            {hayFiltros && (
              <span className="hidden font-mono text-label-sm text-on-surface-variant md:inline">
                Filtros activos:
              </span>
            )}
            <div className="flex max-w-full gap-sm overflow-x-auto hide-scrollbar md:flex-wrap md:overflow-visible">
              {chips.map((chip) => (
                <Chip
                  key={chip.clave}
                  grupo={chip.grupo}
                  valor={chip.valor}
                  onQuitar={chip.quitar}
                />
              ))}
              {hayFiltros && (
                <button
                  type="button"
                  onClick={limpiar}
                  className="inline-flex h-9 shrink-0 items-center gap-xs rounded-full border border-outline-variant bg-surface-container-high px-3 font-mono text-label-technical text-on-surface-variant transition-colors hover:bg-surface-container-highest"
                >
                  <Icon name="close" size={16} />
                  Limpiar
                </button>
              )}
            </div>
            <p
              aria-live="polite"
              className="tabular ml-auto font-mono text-label-technical text-primary"
            >
              {cargando
                ? "Actualizando..."
                : `${resultados.length} ${resultados.length === 1 ? "resultado" : "resultados"}`}
            </p>
          </div>

          {/* Resultados */}
          {cargando ? (
            <GridSkeleton cantidad={6} />
          ) : resultados.length === 0 ? (
            <EstadoVacio termino={filtros.q} onLimpiar={limpiar} />
          ) : (
            <>
              <div key={firma} className="grid grid-cols-2 gap-sm sm:gap-lg lg:grid-cols-3">
                {mostrados.map((producto, i) => (
                  <ProductoCard
                    key={producto.id}
                    producto={producto}
                    indice={i}
                    prioridad={i < 2}
                    onAbrir={setSeleccionado}
                  />
                ))}
              </div>

              {visibles < resultados.length && (
                <div className="flex justify-center pt-md">
                  <Button
                    variante="outline"
                    tamano="lg"
                    onClick={() => setVisibles((v) => v + POR_PAGINA)}
                  >
                    Cargar más repuestos
                    <span className="tabular font-mono text-label-sm">
                      {resultados.length - visibles} restantes
                    </span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filtros en móvil: hoja inferior */}
      <Modal
        abierto={panelFiltros}
        onCerrar={() => setPanelFiltros(false)}
        labelledBy="titulo-filtros-movil"
        variante="sheet"
      >
        <div className="flex max-h-[88dvh] flex-col">
          <h2 id="titulo-filtros-movil" className="sr-only">
            Filtros del catálogo
          </h2>
          <div className="flex-1 overflow-hidden">{panelLateral}</div>
          <div className="flex shrink-0 gap-sm border-t border-outline-variant bg-surface-container-lowest p-md">
            <Button
              variante="neutral"
              className="w-1/3"
              onClick={() => {
                limpiar();
                setPanelFiltros(false);
              }}
            >
              Limpiar
            </Button>
            <Button className="w-2/3" onClick={() => setPanelFiltros(false)}>
              Aplicar Filtros ({resultados.length})
            </Button>
          </div>
        </div>
      </Modal>

      <ProductoModal
        producto={seleccionado}
        onCerrar={() => setSeleccionado(null)}
        onAbrirOtro={setSeleccionado}
      />
    </section>
  );
}
