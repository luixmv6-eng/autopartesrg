import { cache } from "react";
import { leerCatalogo, leerMarcas } from "./admin/almacen";
import { MARCAS_INICIALES, type Opcion } from "./taxonomia";
import type { EtiquetaMarca } from "./utils";
import type { MarcaId, Producto } from "./types";

/**
 * Carga del catálogo para las páginas del servidor, una sola vez por petición.
 *
 * Las páginas de ficha y de marca necesitan los mismos datos **dos veces**: una
 * en `generateMetadata`, para el título y la descripción, y otra en el propio
 * componente. Sin esto serían dos lecturas de disco por visita, y las dos podrían
 * devolver cosas distintas si el panel guarda justo en medio: el `<title>` de un
 * repuesto y su contenido dejarían de corresponderse.
 *
 * `cache` de React memoriza el resultado dentro de una misma renderización, así
 * que las dos llamadas ven exactamente el mismo catálogo y solo se lee un vez.
 * No es una caché entre peticiones: cada visita vuelve a leer, que es lo que
 * hace que un cambio del panel se publique al instante.
 */
export interface CatalogoCargado {
  productos: Producto[];
  marcas: Opcion<MarcaId>[];
  /** Nombre visible de una marca, resuelto contra la lista viva. */
  etiquetaMarca: EtiquetaMarca;
}

export const cargarCatalogo = cache(async (): Promise<CatalogoCargado> => {
  let productos: Producto[] = [];
  let marcas: Opcion<MarcaId>[] = MARCAS_INICIALES;

  try {
    [productos, marcas] = await Promise.all([leerCatalogo(), leerMarcas()]);
  } catch {
    // Mismo criterio que la portada: si el archivo de datos no se puede leer, el
    // sitio sigue en pie con el catálogo vacío en vez de devolver un error.
    productos = [];
    marcas = MARCAS_INICIALES;
  }

  const etiquetas = new Map(marcas.map((m) => [m.id, m.label]));

  return {
    productos,
    marcas,
    etiquetaMarca: (id) => etiquetas.get(id) ?? id,
  };
});

/** Un repuesto por su identificador, o `null` si ya no está en el catálogo. */
export function buscarProducto(productos: Producto[], id: string): Producto | null {
  return productos.find((p) => p.id === id) ?? null;
}

/**
 * Los repuestos de una marca, ordenados por nombre.
 *
 * Por nombre y no por destacados: en una página de marca el visitante ya eligió
 * el vehículo y lo que busca es la pieza, así que un orden alfabético le sirve
 * para recorrer la lista. En la portada manda el destacado, que es una decisión
 * comercial sobre qué enseñar primero a quien todavía no ha elegido nada.
 */
export function productosDeMarca(productos: Producto[], marca: MarcaId): Producto[] {
  return productos
    .filter((p) => p.marca === marca)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}
