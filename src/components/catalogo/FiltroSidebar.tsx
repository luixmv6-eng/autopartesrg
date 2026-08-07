"use client";

import { useId, useState } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CATEGORIAS, MARCAS, SECCIONES } from "@/lib/taxonomia";
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
  const actuales = filtros[clave] as string[];
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
          "flex w-full items-center justify-between rounded-lg p-3 font-mono text-label-technical uppercase tracking-[0.08em] transition-all duration-200",
          resaltado
            ? "bg-primary-container font-semibold text-on-primary-container"
            : "text-on-surface-variant hover:bg-surface-container-highest"
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
          className={cn("transition-transform duration-200", abierto && "rotate-180")}
        />
      </button>
      <div id={idPanel} hidden={!abierto} className="px-2 py-2">
        {children}
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

  const grupos: Array<{
    titulo: string;
    icono: IconName;
    clave: ClaveMulti;
    opciones: ReadonlyArray<{ id: string; label: string }>;
  }> = [
    { titulo: "Marca", icono: "directions_car", clave: "marcas", opciones: MARCAS },
    { titulo: "Categoría", icono: "category", clave: "categorias", opciones: CATEGORIAS },
    {
      titulo: "Sección",
      icono: "settings_input_component",
      clave: "secciones",
      opciones: SECCIONES,
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-outline-variant/30 p-md">
        <h2 className="text-headline-md font-bold tracking-[-0.01em] text-primary">
          Filtros de Búsqueda
        </h2>
        <p className="mt-xs font-mono text-label-sm uppercase tracking-[0.12em] text-on-surface-variant">
          Refina tu selección
        </p>
      </div>

      {/* Contenedor con desplazamiento propio: la barra queda siempre visible
          para que se note que hay más contenido por debajo. */}
      <div className="scrollbar-visible min-h-0 flex-1 overflow-y-auto overscroll-contain p-md">
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
                  className="mb-1.5 block text-label-sm text-on-surface-variant"
                >
                  Modelo
                </label>
                <input
                  id={`${uid}-modelo`}
                  type="text"
                  value={filtros.modelo}
                  onChange={(e) => definir("modelo", e.target.value)}
                  placeholder="Corolla, Ranger, Rio..."
                  className="h-11 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary"
                />
              </div>
              <div>
                <label
                  htmlFor={`${uid}-anio`}
                  className="mb-1.5 block text-label-sm text-on-surface-variant"
                >
                  Año del vehículo
                </label>
                <select
                  id={`${uid}-anio`}
                  value={filtros.anio ?? ""}
                  onChange={(e) => definir("anio", e.target.value ? Number(e.target.value) : null)}
                  className="tabular h-11 w-full rounded border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition-colors focus:border-primary"
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
              activos={(filtros[g.clave] as string[]).length}
            >
              <div className="space-y-0.5 pl-6">
                {g.opciones.map((opcion) => (
                  <Checkbox
                    key={opcion.id}
                    id={`${uid}-${g.clave}-${opcion.id}`}
                    label={opcion.label}
                    checked={(filtros[g.clave] as string[]).includes(opcion.id)}
                    onChange={() => alternar(g.clave, opcion.id)}
                    conteo={conteoSiSeAplica(filtros, g.clave, opcion.id, productos)}
                  />
                ))}
              </div>
            </Grupo>
          ))}

          {/* Sin filtro de disponibilidad: la confirma el equipo por WhatsApp. */}
          <p className="mt-sm rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-3 text-label-sm leading-relaxed text-on-surface-variant">
            La disponibilidad de cada repuesto se confirma por WhatsApp.
          </p>
        </div>
      </div>

      <div className="shrink-0 border-t border-outline-variant/30 bg-surface-container-lowest p-md">
        <button
          type="button"
          onClick={limpiar}
          disabled={!hayFiltros}
          className="flex h-11 w-full items-center justify-center gap-xs rounded border border-outline font-mono text-label-technical uppercase tracking-[0.08em] text-on-surface-variant transition-colors hover:bg-surface-container disabled:pointer-events-none disabled:opacity-40"
        >
          <Icon name="refresh" size={18} />
          Limpiar Filtros
        </button>
      </div>
    </div>
  );
}
