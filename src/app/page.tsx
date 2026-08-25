import { Hero } from "@/components/sections/Hero";
import { Catalogo } from "@/components/catalogo/Catalogo";
import { leerCatalogo, leerMarcas } from "@/lib/admin/almacen";
import { MARCAS_INICIALES, type Opcion } from "@/lib/taxonomia";
import type { Producto } from "@/lib/types";

/**
 * Landing: hero y catálogo, nada más.
 *
 * Nosotros vive en `/nosotros` para no competir con el catálogo por la atención
 * de quien llega buscando una pieza concreta.
 *
 * El catálogo se lee del disco **en cada visita**. Antes se importaba el JSON
 * como módulo, lo que lo congelaba en el momento de compilar: cambiar un
 * repuesto obligaba a reconstruir y volver a subir el sitio entero. Ahora lo que
 * la empresa guarda en el panel se ve enseguida, sin tocar nada.
 *
 * El estado de los filtros sigue viviendo en la URL y leyéndose con
 * `useSyncExternalStore` (ver `src/lib/urlQuery.ts`), así que el catálogo
 * completo viaja igualmente en el HTML y solo después se aplican los filtros del
 * enlace. Para buscadores y para el primer pintado no cambia nada.
 */

/**
 * Sin prerenderizado.
 *
 * La alternativa era regenerar la página cada X minutos, pero entonces un
 * reinicio del servidor volvería a servir el HTML construido en el despliegue,
 * con el catálogo viejo, hasta que algo lo refrescara. Renderizar en cada
 * visita cuesta leer un archivo de unas decenas de kilobytes: para el tráfico de
 * un catálogo de repuestos, invisible, y a cambio nunca se enseña un dato
 * caducado. Si algún día el tráfico lo justifica, aquí se cambia.
 */
export const dynamic = "force-dynamic";

export default async function Home() {
  let productos: Producto[] = [];
  let marcas: Opcion<string>[] = MARCAS_INICIALES;
  try {
    [productos, marcas] = await Promise.all([leerCatalogo(), leerMarcas()]);
  } catch {
    // Si el archivo de datos no se puede leer, el sitio sigue en pie con el
    // catálogo vacío en vez de devolver un error: el hero, el contacto y el
    // botón de WhatsApp siguen sirviendo para algo.
    productos = [];
    marcas = MARCAS_INICIALES;
  }

  return (
    <>
      <Hero />
      <Catalogo productos={productos} marcas={marcas} />
    </>
  );
}
