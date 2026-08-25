import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, sesionValida } from "@/lib/admin/sesion";

/**
 * Guardián de `/admin`.
 *
 * En Next 16 este archivo se llama `proxy.ts` y no `middleware.ts`, y la función
 * exportada se llama `proxy`: el nombre cambió para dejar claro que es una capa
 * de red y enrutado, no un lugar donde meter lógica de negocio. Corre siempre en
 * Node, el runtime `edge` ya no está admitido aquí.
 *
 * Esto solo decide **a dónde va** quien no ha entrado. La comprobación que de
 * verdad protege los datos está dentro de cada ruta de API, porque una redirección
 * es cosmética: quien manda la petición con `curl` no la sigue. Repetir la
 * comprobación en los dos sitios es intencionado — si algún día alguien cambia el
 * `matcher` de abajo y se olvida de una ruta, las API siguen cerradas.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // La pantalla de entrada tiene que ser accesible sin sesión, evidentemente.
  if (pathname === "/admin/entrar") return NextResponse.next();

  if (sesionValida(request.cookies.get(COOKIE_SESION)?.value)) return NextResponse.next();

  const destino = request.nextUrl.clone();
  destino.pathname = "/admin/entrar";
  destino.search = "";
  return NextResponse.redirect(destino);
}

export const config = {
  /*
   * Solo las páginas del panel. Las rutas de API se protegen solas y no se
   * incluyen aquí a propósito: si una API respondiera con una redirección 307 a
   * una página HTML, el `fetch` del panel intentaría interpretar ese HTML como
   * JSON y el error que vería el usuario no tendría nada que ver con la causa.
   */
  matcher: ["/admin", "/admin/:path*"],
};
