"use client";

import { useId, useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon, type IconName } from "@/components/ui/Icon";
import { useMarcas } from "./ContextoMarcas";
import { filtrarProductos } from "@/lib/productos";
import type { EstadoFiltros, Producto } from "@/lib/types";
import type { ClaveMulti } from "@/hooks/useFiltros";
import { cn } from "@/lib/utils";

interface Props {
  filtros: EstadoFiltros;
  alternar: (clave: ClaveMulti, valor: string) => void;
  definir: (clave: "modelo" | "anio", valor: string | number | null) => void;
  limpiar: () => void;
  hayFiltros: boolean;
  anios: number[];
  productos: Producto[];
}

/** Resultados que quedarían si se añadiera una opción, con el resto intacto. */
function conteoSiSeAplica(
  filtros: EstadoFiltros,
  clave: ClaveMulti,
  valor: string,
  productos: Producto[]
): number {
  const actuales = filtros[clave];
  if (actuales.includes(valor)) return filtrarProductos(filtros, productos).length;
  return filtrarProductos({ ...filtros, [clave]: [...actuales, valor] }, productos).length;
}

/**
 * Grupo plegable. Fila con icono, etiqueta y `expand_more` que rota; el grupo
 * con filtros aplicados se abre solo y se resalta en `primary-container`.
 */
function Grupo({
  titulo,
  icono,
  activos,
  defectoAbierto,
  children,
}: {
  titulo: string;
  icono: IconName;
  activos: number;
  defectoAbierto?: boolean;
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(defectoAbierto ?? activos > 0);
  const idPanel = useId();
  const resaltado = activos > 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls={idPanel}
        className={cn(
          // Lista explícita: `transition-all` animaba también propiedades de layout
          // y lo hacía fuera de la GPU.
          "flex w-full items-center justify-between rounded-lg p-3 font-mono text-label-technical uppercase tracking-[0.08em] transition-[background-color,color] duration-[var(--dur-rapida)]",
          resaltado
            ? "bg-primary-container font-semibold text-on-primary-container"
            : "text-on-panel-suave hover:bg-primary-fixed"
        )}
      >
        <span className="flex items-center gap-3">
          <Icon name={icono} size={20} />
          <span>{titulo}</span>
          {activos > 0 && (
            <span className="tabular rounded-full bg-on-primary-container px-1.5 text-[11px] font-bold text-primary-container">
              {activos}
            </span>
          )}
        </span>
        <Icon
          name="expand_more"
          size={20}
          className={cn(
            "transition-transform duration-[var(--dur-rapida)]",
            abierto && "rotate-180"
          )}
        />
      </button>

      {/*
       * Despliegue animado en lugar del atributo `hidden`, que teletransportaba
       * el contenido. Es de las interacciones más repetidas del catálogo y era
       * la única sin ninguna continuidad visual: pulsabas y el panel aparecía
       * de la nada, empujando todo lo de abajo de golpe.
       *
       * La técnica es la retícula de una fila que va de `0fr` a `1fr`: es la
       * única forma de interpolar hasta una altura automática sin medir el
       * contenido con JavaScript. Sí toca layout en cada fotograma, a
       * diferencia de `transform`, pero el subárbol es media docena de
       * casillas y se prefiere eso a cablear alturas a mano.
       *
       * `inert` mientras está plegado: sin el `hidden` de antes, el contenido
       * seguiría siendo enfocable con el tabulador y visible para un lector de
       * pantalla aunque mida cero.
       */}
      <div
        id={idPanel}
        inert={!abierto}
        className={cn(
          "grid transition-[grid-template-rows] duration-[var(--dur-panel)] ease-salida",
          abierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "px-2 py-2 transition-opacity duration-[var(--dur-rapida)]",
              abierto ? "opacity-100" : "opacity-0"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FiltroSidebar({
  filtros,
  alternar,
  definir,
  limpiar,
  hayFiltros,
  anios,
  productos,
}: Props) {
  const uid = useId();
  const { marcas } = useMarcas();

  /*
   * Solo se ofrecen las marcas que tienen al menos un repuesto.
   *
   * La lista es editable desde el panel, y quien añade una marca lo hace justo
   * antes de crear el producto: entre los dos pasos existe un instante en que la
   * marca no tiene nada. Enseñarla ahí sería ofrecer un filtro que devuelve
   * cero, que es exactamente lo que este catálogo evita. Las que sí se usan
   * aparecen solas en cuanto se guarda el repuesto.
   */
  const marcasConProductos = useMemo(() => {
    const usadas = new Set(productos.map((p) => p.marca));
    return marcas.filter((m) => usadas.has(m.id));
  }, [marcas, productos]);

  const grupos: Array<{
    titulo: string;
    icono: IconName;
    clave: ClaveMulti;
    opciones: ReadonlyArray<{ id: string; label: string }>;
  }> = [
    { titulo: "Marca", icono: "directions_car", clave: "marcas", opciones: marcasConProductos },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 bg-primary px-md py-md text-on-primary">
        <h2 className="flex items-center gap-sm text-headline-md font-bold tracking-[-0.01em]">
          <Icon name="tune" size={20} />
          Filtros
        </h2>
        <p className="mt-xs font-mono text-label-sm uppercase tracking-[0.12em] text-on-primary/70">
          Refina tu selección
        </p>
      </div>

      {/* Contenedor con desplazamiento propio: la barra queda siempre visible
          para que se note que hay más contenido por debajo. */}
      <div className="scrollbar-visible min-h-0 flex-1 overflow-y-auto overscroll-contain bg-panel p-md">
        <div className="flex flex-col gap-sm">
          <Grupo
            titulo="Modelo y año"
            icono="calendar_today"
            activos={(filtros.modelo ? 1 : 0) + (filtros.anio !== null ? 1 : 0)}
            defectoAbierto
          >
            <div className="space-y-3">
              <div>
                <label
                  htmlFor={`${uid}-modelo`}
                  className="mb-1.5 block text-label-sm text-on-panel-suave"
                >
                  Modelo
                </label>
                <input
                  id={`${uid}-modelo`}
                  type="text"
                  value={filtros.modelo}
                  onChange={(e) => definir("modelo", e.target.value)}
                  placeholder="Spark GT, Hilux, NP300..."
                  className="h-11 w-full rounded border border-borde-campo bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary"
                />
              </div>
              <div>
                <label
                  htmlFor={`${uid}-anio`}
                  className="mb-1.5 block text-label-sm text-on-panel-suave"
                >
                  Año del vehículo
                </label>
                <select
                  id={`${uid}-anio`}
                  value={filtros.anio ?? ""}
                  onChange={(e) => definir("anio", e.target.value ? Number(e.target.value) : null)}
                  className="tabular h-11 w-full rounded border border-borde-campo bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition-colors focus:border-primary"
                >
                  <option value="">Cualquier año</option>
                  {anios.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Grupo>

          {grupos.map((g) => (
            <Grupo
              key={g.clave}
              titulo={g.titulo}
              icono={g.icono}
              activos={filtros[g.clave].length}
            >
              <div className="space-y-0.5 pl-6">
                {g.opciones.map((opcion) => (
                  <Checkbox
                    key={opcion.id}
                    id={`${uid}-${g.clave}-${opcion.id}`}
                    label={opcion.label}
                    checked={filtros[g.clave].includes(opcion.id)}
                    onChange={() => alternar(g.clave, opcion.id)}
                    conteo={conteoSiSeAplica(filtros, g.clave, opcion.id, productos)}
                  />
                ))}
              </div>
            </Grupo>
          ))}

          {/* Sin filtro de disponibilidad: la confirma el equipo por WhatsApp. */}
          <p className="mt-sm rounded-lg border border-dashed border-panel-borde bg-surface-container-lowest p-3 text-label-sm leading-relaxed text-on-panel-suave">
            La disponibilidad de cada repuesto se confirma por WhatsApp.
          </p>
        </div>
      </div>

      <div className="shrink-0 border-t border-panel-borde bg-surface-container-lowest p-md">
        <button
          type="button"
          onClick={limpiar}
          disabled={!hayFiltros}
          className="flex h-11 w-full items-center justify-center gap-xs rounded border border-outline font-mono text-label-technical uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:bg-surface-container disabled:pointer-events-none disabled:opacity-40"
        >
          <Icon name="refresh" size={18} />
          Limpiar filtros
        </button>
      </div>
    </div>
  );
}
