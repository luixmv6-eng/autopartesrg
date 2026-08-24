/**
 * Pequeño almacén externo para la query string.
 *
 * ¿Por qué no `useSearchParams`? Porque en una página estática obliga a Next a
 * renderizar en cliente todo el subárbol que lo usa, y el hero y el catálogo
 * dejarían de existir en el HTML servido (malo para SEO y para el LCP).
 *
 * Con `useSyncExternalStore` el servidor renderiza el catálogo sin filtros, el
 * cliente hidrata con el mismo valor y, justo después, aplica los filtros reales
 * de la URL. La navegación sigue siendo instantánea y el enlace, compartible.
 */
const EVENTO = "autopartes-erg:urlchange";

const oyentes = new Set<() => void>();
let instantanea = "";
let iniciado = false;

function notificar() {
  const actual = window.location.search;
  if (actual === instantanea) return;
  instantanea = actual;
  for (const oyente of oyentes) oyente();
}

export function suscribirAQuery(oyente: () => void) {
  if (!iniciado) {
    iniciado = true;
    window.addEventListener("popstate", notificar);
    window.addEventListener(EVENTO, notificar);
  }
  // useSyncExternalStore relee la instantánea al suscribirse, así que basta
  // con dejarla al día aquí para aplicar los filtros que traía la URL.
  instantanea = window.location.search;
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

export const leerQuery = () => instantanea;

/** En el servidor no hay query: el catálogo se renderiza completo. */
export const leerQueryServidor = () => "";

/**
 * Escribe la query sin pasar por el router: no hay ida y vuelta al servidor.
 * Se usa `replaceState` a propósito, para que teclear en el buscador no llene
 * el historial de entradas intermedias.
 */
export function escribirQuery(query: string) {
  const { pathname, hash } = window.location;
  window.history.replaceState(null, "", `${pathname}${query ? `?${query}` : ""}${hash}`);
  window.dispatchEvent(new Event(EVENTO));
}
