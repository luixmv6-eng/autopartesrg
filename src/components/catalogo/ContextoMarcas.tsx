"use client";

import { createContext, useContext, useMemo } from "react";
import { LABEL_MARCA, type Opcion } from "@/lib/taxonomia";
import type { MarcaId } from "@/lib/types";

/**
 * La lista viva de marcas, disponible en todo el catálogo.
 *
 * Antes las marcas eran una constante del código y cualquier componente podía
 * importar `LABEL_MARCA` y ya. Ahora se administran desde el panel, así que la
 * lista la lee el servidor en cada visita y hay que hacerla llegar a la barra de
 * filtros, a las tarjetas, a la ficha y al mensaje de WhatsApp.
 *
 * Se usa un contexto en vez de pasarla por propiedades porque esos componentes
 * están a tres y cuatro niveles de profundidad, y encadenar el mismo dato por
 * media docena de firmas solo para llegar abajo ensucia todas las de en medio.
 *
 * El respaldo es `LABEL_MARCA`, la lista con la que se sembró el archivo: si
 * algún componente quedara fuera del proveedor, enseñaría los nombres de las
 * marcas de siempre en vez de romperse.
 */

interface Valor {
  /** Todas las marcas conocidas, ya ordenadas por nombre. */
  marcas: Opcion<MarcaId>[];
  /** Nombre visible de una marca. Si no se conoce, devuelve el identificador. */
  etiqueta: (id: MarcaId) => string;
}

const Contexto = createContext<Valor>({
  marcas: [],
  etiqueta: (id) => LABEL_MARCA[id] ?? id,
});

export function MarcasProvider({
  marcas,
  children,
}: {
  marcas: Opcion<MarcaId>[];
  children: React.ReactNode;
}) {
  const valor = useMemo<Valor>(() => {
    const mapa = new Map(marcas.map((m) => [m.id, m.label]));
    return {
      marcas,
      // El respaldo encadenado cubre el hueco entre que alguien borra una marca
      // y se corrigen los productos que la usaban: se ve el identificador, feo
      // pero legible, en vez de "undefined".
      etiqueta: (id) => mapa.get(id) ?? LABEL_MARCA[id] ?? id,
    };
  }, [marcas]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export const useMarcas = () => useContext(Contexto);
