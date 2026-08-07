import type { NextConfig } from "next";

const EN_DESARROLLO = process.env.NODE_ENV === "development";

/**
 * Política de seguridad de contenido.
 *
 * El sitio es estático y no carga script de terceros, así que en producción
 * puede permitirse una política estricta. Dos concesiones inevitables:
 *
 * - `'unsafe-inline'` en `script-src`: Next inyecta el payload de hidratación
 *   como script en línea. Sin `nonce` por petición (que obligaría a renderizar
 *   en servidor y tirar el prerender estático) no hay forma de evitarlo.
 * - `'unsafe-inline'` en `style-src`: `next/font` y los estilos críticos se
 *   emiten en línea.
 *
 * En desarrollo hacen falta además:
 *
 * - `'unsafe-eval'`: React lo usa en modo desarrollo para reconstruir pilas de
 *   llamada y otras ayudas de depuración. **Nunca lo usa en producción**, así
 *   que permitirlo aquí no relaja la política del sitio publicado.
 * - `ws:` y `wss:` en `connect-src`: el canal de Fast Refresh.
 * - `blob:` en `script-src`: mapas de origen y recarga en caliente.
 *
 * Todo lo demás queda cerrado en ambos entornos: sin `object-src`, sin marcos,
 * sin base arbitraria y sin destinos de formulario fuera del propio origen.
 */
function construirCSP(): string {
  const script = ["'self'", "'unsafe-inline'"];
  const connect = ["'self'"];

  if (EN_DESARROLLO) {
    script.push("'unsafe-eval'", "blob:");
    connect.push("ws:", "wss:");
  }

  const directivas = [
    "default-src 'self'",
    `script-src ${script.join(" ")}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    // wa.me es navegación, no fetch; no hace falta abrirlo en connect-src.
    `connect-src ${connect.join(" ")}`,
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "manifest-src 'self'",
  ];

  // Forzar HTTPS solo tiene sentido en el sitio publicado; en local rompería
  // las peticiones a http://localhost.
  if (!EN_DESARROLLO) directivas.push("upgrade-insecure-requests");

  return directivas.join("; ");
}

const CABECERAS_SEGURIDAD = [
  { key: "Content-Security-Policy", value: construirCSP() },
  // Refuerza `frame-ancestors` en navegadores antiguos.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

// HSTS solo en producción: en local no hay HTTPS y la cabecera es contraria a
// lo que hace falta para trabajar. `preload` es difícil de revertir, así que
// conviene desplegarlo únicamente sobre el dominio definitivo.
if (!EN_DESARROLLO) {
  CABECERAS_SEGURIDAD.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  // No anunciar el framework ni su versión.
  poweredByHeader: false,
  reactStrictMode: true,

  images: {
    formats: ["image/avif", "image/webp"],
    /**
     * Las imágenes son SVG propios servidos desde /public. El optimizador los
     * entrega con su propia CSP y `Content-Disposition: attachment`, así que un
     * SVG con script no se ejecutaría. Al sustituirlos por fotos se puede
     * volver a poner en false.
     */
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Sin orígenes remotos: nada externo puede pasar por el optimizador.
    remotePatterns: [],
  },

  async headers() {
    return [{ source: "/:path*", headers: CABECERAS_SEGURIDAD }];
  },
};

export default nextConfig;
