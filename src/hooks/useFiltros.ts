"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  escribirQuery,
  leerQuery,
  leerQueryServidor,
  suscribirAQuery,
} from "@/lib/urlQuery";
import type { EstadoFiltros } from "@/lib/types";
import { LABEL_MARCA } from "@/lib/taxonomia";
import { anioValido, marcasValidas, ordenValido, textoValido } from "@/lib/validarFiltros";

/**
 * Nombres cortos de los parámetros. El estado de los filtros vive en la URL,
 * así cualquier catálogo filtrado se puede compartir por enlace y el botón
 * "atrás" del navegador funciona como el usuario espera.
 */
const CLAVES = {
  q: "q",
  marcas: "marca",
  modelo: "modelo",
  anio: "anio",
  orden: "orden",
} as const;

/**
 * Filtros de selección múltiple. Solo queda la marca: categoría y sección se
 * retiraron del catálogo por innecesarias para buscar un repuesto.
 */
export type ClaveMulti = "marcas";

export interface ChipActivo {
  clave: string;
  grupo: string;
  valor: string;
  quitar: () => void;
}

function leerLista(sp: URLSearchParams, clave: string): string[] {
  const bruto = sp.get(clave);
  if (!bruto) return [];
  return bruto.split(",").filter(Boolean);
}

/**
 * `etiquetaMarca` traduce el identificador de marca a su nombre para los chips.
 * Se pasa desde fuera porque la lista de marcas vive en los datos, no en el
 * código. Sin ella se usa la de siempre, que basta para quien no pinta chips
 * (el buscador del hero, por ejemplo).
 */
export function useFiltros(etiquetaMarca: (id: string) => string = (id) => LABEL_MARCA[id] ?? id) {
  const query = useSyncExternalStore(suscribirAQuery, leerQuery, leerQueryServidor);
  const searchParams = useMemo(() => new URLSearchParams(query), [query]);

  /**
   * La query string es entrada de usuario: todo lo que sale de ella pasa por
   * `validarFiltros` antes de entrar al estado. Un valor desconocido se
   * descarta en vez de propagarse a la interfaz.
   */
  const filtros = useMemo<EstadoFiltros>(
    () => ({
      q: textoValido(searchParams.get(CLAVES.q)),
      marcas: marcasValidas(leerLista(searchParams, CLAVES.marcas)),
      modelo: textoValido(searchParams.get(CLAVES.modelo)),
      anio: anioValido(searchParams.get(CLAVES.anio)),
      orden: ordenValido(searchParams.get(CLAVES.orden)),
    }),
    [searchParams]
  );

  const aplicar = useCallback(
    (mutar: (sp: URLSearchParams) => void) => {
      const sp = new URLSearchParams(searchParams.toString());
      mutar(sp);
      escribirQuery(sp.toString());
    },
    [searchParams]
  );

  /** Marca o desmarca un valor dentro de un filtro de selección múltiple. */
  const alternar = useCallback(
    (clave: ClaveMulti, valor: string) => {
      aplicar((sp) => {
        const actuales = leerLista(sp, CLAVES[clave]);
        const siguientes = actuales.includes(valor)
          ? actuales.filter((v) => v !== valor)
          : [...actuales, valor];
        if (siguientes.length) sp.set(CLAVES[clave], siguientes.join(","));
        else sp.delete(CLAVES[clave]);
      });
    },
    [aplicar]
  );

  /** Reemplaza por completo un filtro de valor único. */
  const definir = useCallback(
    (clave: keyof typeof CLAVES, valor: string | number | null) => {
      aplicar((sp) => {
        if (valor === null || valor === "" || valor === "relevancia") sp.delete(CLAVES[clave]);
        else sp.set(CLAVES[clave], String(valor));
      });
    },
    [aplicar]
  );

  /** Aplica varios filtros de valor único en una sola escritura de la URL. */
  const definirVarios = useCallback(
    (cambios: Partial<Record<keyof typeof CLAVES, string | number | null>>) => {
      aplicar((sp) => {
        for (const [clave, valor] of Object.entries(cambios)) {
          const parametro = CLAVES[clave as keyof typeof CLAVES];
          if (valor === null || valor === "" || valor === "relevancia") sp.delete(parametro);
          else sp.set(parametro, String(valor));
        }
      });
    },
    [aplicar]
  );

  /** Fija un filtro múltiple a un único valor. Lo usan los atajos de categoría. */
  const definirLista = useCallback(
    (clave: ClaveMulti, valores: string[]) => {
      aplicar((sp) => {
        if (valores.length) sp.set(CLAVES[clave], valores.join(","));
        else sp.delete(CLAVES[clave]);
      });
    },
    [aplicar]
  );

  const limpiar = useCallback(() => {
    escribirQuery("");
  }, []);

  const chips = useMemo<ChipActivo[]>(() => {
    const lista: ChipActivo[] = [];
    const multi: Array<[ClaveMulti, string, (v: string) => string]> = [
      ["marcas", "Marca", etiquetaMarca],
    ];

    for (const [clave, grupo, etiquetar] of multi) {
      for (const valor of filtros[clave] as string[]) {
        lista.push({
          clave: `${clave}-${valor}`,
          grupo,
          valor: etiquetar(valor),
          quitar: () => alternar(clave, valor),
        });
      }
    }
    if (filtros.q) {
      lista.push({
        clave: "q",
        grupo: "Búsqueda",
        valor: filtros.q,
        quitar: () => definir("q", null),
      });
    }
    if (filtros.modelo) {
      lista.push({
        clave: "modelo",
        grupo: "Modelo",
        valor: filtros.modelo,
        quitar: () => definir("modelo", null),
      });
    }
    if (filtros.anio !== null) {
      lista.push({
        clave: "anio",
        grupo: "Año",
        valor: String(filtros.anio),
        quitar: () => definir("anio", null),
      });
    }
    return lista;
  }, [filtros, alternar, definir, etiquetaMarca]);

  /** Firma estable del estado, para disparar el skeleton solo cuando algo cambia. */
  const firma = useMemo(
    () =>
      [
        filtros.q,
        filtros.marcas.join(),
        filtros.modelo,
        filtros.anio,
        filtros.orden,
      ].join("|"),
    [filtros]
  );

  return { filtros, alternar, definir, definirVarios, definirLista, limpiar, chips, firma };
}
