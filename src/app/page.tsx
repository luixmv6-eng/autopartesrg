import { Hero } from "@/components/sections/Hero";
import { Catalogo } from "@/components/catalogo/Catalogo";

/**
 * Landing: hero y catálogo, nada más.
 *
 * Nosotros vive en `/nosotros` para no competir con el catálogo por la
 * atención de quien llega buscando una pieza concreta.
 *
 * La página es estática. El estado de los filtros vive en la URL y se lee con
 * `useSyncExternalStore` (ver `src/lib/urlQuery.ts`), así el catálogo completo
 * viaja en el HTML y solo después se aplican los filtros del enlace.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Catalogo />
    </>
  );
}
