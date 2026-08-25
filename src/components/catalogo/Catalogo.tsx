"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { useFiltros } from "@/hooks/useFiltros";
import { filtrarProductos, rangoAnios } from "@/lib/productos";
import { ORDENES } from "@/lib/taxonomia";
import type { OrdenId, Producto } from "@/lib/types";
import { EstadoVacio } from "./EstadoVacio";
import { FiltroSidebar } from "./FiltroSidebar";
import { ProductoCard } from "./ProductoCard";
import { ProductoModal } from "./ProductoModal";
import { MarcasProvider, useMarcas } from "./ContextoMarcas";
import type { Opcion } from "@/lib/taxonomia";

/*
 * Múltiplo de 2, 3 y 4: la retícula usa esas tres cuentas de columna según la
 * anchura, así que 12 llena la última fila entera en cualquiera de ellas. Con
 * 9 quedaba una fila coja en cuanto había 4 columnas.
 */
const POR_PAGINA = 12;

interface Props {
  /**
   * El catálogo, leído del disco por la página en cada visita.
   *
   * Antes se importaba aquí como constante del módulo, lo que lo congelaba en el
   * momento de compilar. Ahora llega por propiedad para que lo que edite el
   * panel de administración se vea sin reconstruir el sitio.
   */
  productos: Producto[];
  /** Marcas vivas, leídas de los datos. Alimentan el filtro y las etiquetas. */
  marcas: Opcion<string>[];
}

/**
 * Envoltorio: instala el contexto de marcas antes de montar el catálogo.
 *
 * Va aparte porque `useMarcas` solo puede leerse por debajo del proveedor, y el
 * propio catálogo lo necesita para las etiquetas de los chips.
 */
export function Catalogo({ productos, marcas }: Props) {
  return (
    <MarcasProvider marcas={marcas}>
      <CatalogoInterno productos={productos} />
    </MarcasProvider>
  );
}

function CatalogoInterno({ productos }: { productos: Producto[] }) {
  const { etiqueta: etiquetaMarca } = useMarcas();
  const { filtros, alternar, definir, limpiar, chips, firma } = useFiltros(etiquetaMarca);

  const [texto, setTexto] = useState(filtros.q);
  const [qPrevio, setQPrevio] = useState(filtros.q);
  const [visibles, setVisibles] = useState(POR_PAGINA);
  const [firmaPrevia, setFirmaPrevia] = useState(firma);
  const [panelFiltros, setPanelFiltros] = useState(false);
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null);

  if (filtros.q !== qPrevio) {
    setQPrevio(filtros.q);
    setTexto(filtros.q);
  }

  /** Al cambiar un filtro se vuelve a la primera página. */
  if (firma !== firmaPrevia) {
    setFirmaPrevia(firma);
    setVisibles(POR_PAGINA);
  }

  // Búsqueda en tiempo real con antirrebote, para no reescribir la URL en cada tecla.
  useEffect(() => {
    if (texto === filtros.q) return;
    const t = setTimeout(() => definir("q", texto.trim() || null), 300);
    return () => clearTimeout(t);
  }, [texto, filtros.q, definir]);

  /*
   * Lo único que de verdad está pendiente en este catálogo: el antirrebote del
   * buscador. Mientras lo escrito no coincide con lo que hay en la URL, los
   * resultados en pantalla son los de la consulta anterior, y eso sí merece un
   * indicador.
   *
   * Es estado derivado, sin `useState` ni temporizador. Antes había un
   * `setCargando(true)` en cada cambio de filtro que se apagaba 260ms después:
   * sobre datos locales, que se filtran en menos de 1ms, era latencia
   * inventada. Medido, del clic en una casilla a la retícula quieta pasaban
   * 842ms.
   */
  const esperandoBusqueda = texto.trim() !== filtros.q;

  const anios = useMemo(() => rangoAnios(productos), [productos]);
  const resultados = useMemo(() => filtrarProductos(filtros, productos), [filtros, productos]);
  const mostrados = resultados.slice(0, visibles);
  const hayFiltros = chips.length > 0;

  const panelLateral = (
    <FiltroSidebar
      filtros={filtros}
      alternar={alternar}
      definir={definir}
      limpiar={limpiar}
      hayFiltros={hayFiltros}
      anios={anios}
      productos={productos}
    />
  );

  return (
    <section id="catalogo" aria-labelledby="titulo-catalogo">
      <div className="contenedor pt-xl">
        <p className="eyebrow mb-md">Catálogo</p>
        <h2
          id="titulo-catalogo"
          className="display-tight max-w-[22ch] text-headline-lg text-on-surface"
        >
          Todo el catálogo, filtrado por compatibilidad
        </h2>
        {/* La medida se fija en caracteres, no en rem: así sigue siendo cómoda
            de leer aunque el tamaño de letra base del usuario no sea 16px. */}
        <p className="mt-sm max-w-[60ch] text-body-md text-on-surface-variant">
          Busca por nombre, marca o modelo, o acota con los filtros de la izquierda.
        </p>
      </div>

      <div className="contenedor flex flex-col gap-lg py-lg lg:flex-row lg:gap-xl lg:py-xl">
        {/*
         * Filtros: barra lateral a partir de `lg`. En tableta vertical (768px)
         * los 288px del panel dejaban las tarjetas en columnas de ~200px, así
         * que hasta ahí se usa la hoja inferior, igual que en móvil.
         *
         * El desplazamiento pegajoso y el alto máximo salen del alto real de la
         * cabecera, no de un `top-28` que solo cuadraba con una de las dos.
         */}
        <aside className="hidden w-72 shrink-0 lg:block 2xl:w-80">
          <div className="sticky top-[calc(var(--alto-cabecera)+var(--gutter))] flex max-h-[calc(100dvh-var(--alto-cabecera)-var(--gutter)*2)] flex-col overflow-hidden rounded-xl border border-panel-borde bg-panel shadow-e1">
            {panelLateral}
          </div>
        </aside>

        <div className="flex flex-grow flex-col gap-lg">
          {/*
           * Banda de herramientas. El tinte azul la separa del lienzo neutro
           * donde viven las tarjetas: buscar, ordenar y filtrar son acciones,
           * no contenido del catálogo.
           *
           * Una sola barra para todas las anchuras. Antes había dos árboles de
           * marcado alternados con `md:hidden` / `hidden md:flex`: dos campos
           * de búsqueda con el mismo cometido, dos `id` distintos y dos
           * `select` que había que mantener a la vez. Ahora es una fila que se
           * reordena.
           */}
          <div className="rounded-xl border border-panel-borde bg-panel p-sm md:p-md">
            <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:gap-md">
              <div className="flex min-w-0 flex-grow items-center rounded-lg border border-borde-campo bg-surface-container-lowest px-sm shadow-e1 transition-colors focus-within:border-primary sm:shadow-none">
                <label htmlFor="buscador-catalogo" className="sr-only">
                  Buscar repuesto por nombre, marca o modelo
                </label>
                <Icon name="search" size={20} className="mr-sm shrink-0 text-primary" />
                <input
                  id="buscador-catalogo"
                  type="search"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Buscar repuesto, marca o modelo. Ej. clutch NP300"
                  className="h-11 w-full min-w-0 border-none bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant lg:h-12"
                />
                {esperandoBusqueda && (
                  <Icon name="refresh" size={18} className="shrink-0 animate-spin text-primary" />
                )}
              </div>

              <div className="flex shrink-0 items-center gap-sm">
                <select
                  aria-label="Ordenar resultados"
                  value={filtros.orden}
                  onChange={(e) => definir("orden", e.target.value as OrdenId)}
                  className="h-11 min-w-0 flex-grow rounded-lg border border-borde-campo bg-surface-container-lowest px-3 font-mono text-label-technical text-on-surface outline-none focus:border-primary sm:flex-grow-0 lg:h-12"
                >
                  {ORDENES.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>

                {/* Solo mientras la barra lateral esté plegada. */}
                <Button
                  variante="primary"
                  onClick={() => setPanelFiltros(true)}
                  aria-haspopup="dialog"
                  className="shrink-0 lg:hidden"
                >
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
          </div>

          {/*
           * Chips de filtros activos.
           *
           * Fluyen a varias líneas en cualquier anchura. Antes se deslizaban en
           * horizontal en móvil con la barra oculta, así que los chips que
           * quedaban fuera del borde no tenían ninguna señal de existir: se
           * podía creer que un filtro aplicado se había perdido. Ocupar dos
           * líneas cuesta menos que esconder estado.
           */}
          <div className="flex flex-wrap items-center gap-x-md gap-y-sm border-b border-outline-variant/30 pb-sm">
            {hayFiltros && (
              <span className="hidden font-mono text-label-sm text-on-surface-variant sm:inline">
                Filtros activos:
              </span>
            )}
            <div className="flex min-w-0 flex-wrap gap-sm">
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
            {/*
             * El número entra en vez de sustituirse. Con `key` en la cifra,
             * React monta un nodo nuevo cada vez que cambia y la animación se
             * vuelve a ejecutar: el ojo detecta que el dato se ha actualizado
             * sin tener que leerlo. Antes el 22 se convertía en un 3 sin que
             * nada lo señalara.
             */}
            <p
              aria-live="polite"
              className="ml-auto shrink-0 font-mono text-label-technical text-primary"
            >
              <span key={resultados.length} className="tabular cifra-entra inline-block">
                {resultados.length}
              </span>{" "}
              {resultados.length === 1 ? "resultado" : "resultados"}
            </p>
          </div>

          {/* Resultados */}
          {resultados.length === 0 ? (
            <EstadoVacio termino={filtros.q} onLimpiar={limpiar} />
          ) : (
            <>
              {/*
               * Retícula auto-ajustable en vez de un número fijo de columnas
               * por punto de corte. Las columnas las decide el espacio real
               * disponible, que además depende de si la barra lateral está
               * montada: con `lg:grid-cols-3` fijo, las mismas tres columnas
               * tenían que servir para 1024px y para 1920px.
               *
               * En móvil se mantienen dos columnas explícitas, como en la
               * maqueta: por debajo de 640px una columna de tarjetas dejaría el
               * catálogo demasiado largo.
               *
               * El mínimo sube en `2xl` para que un monitor ancho no acabe con
               * seis columnas de tarjetas estrechas.
               */}
              <div
                key={firma}
                className="grid grid-cols-2 gap-sm sm:grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] sm:gap-lg 2xl:grid-cols-[repeat(auto-fill,minmax(15.5rem,1fr))]"
              >
                {mostrados.map((producto, i) => (
                  <ProductoCard
                    key={producto.id}
                    producto={producto}
                    indice={i}
                    prioridad={i < 4}
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
              Aplicar filtros ({resultados.length})
            </Button>
          </div>
        </div>
      </Modal>

      <ProductoModal
        producto={seleccionado}
        productos={productos}
        onCerrar={() => setSeleccionado(null)}
        onAbrirOtro={setSeleccionado}
      />
    </section>
  );
}
