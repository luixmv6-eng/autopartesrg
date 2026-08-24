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
     * Los repuestos del catálogo ya son fotografías JPEG. Lo único que sigue
     * siendo SVG son cinco ilustraciones decorativas propias: el fondo del hero
     * y las cuatro de la página Nosotros.
     *
     * Se mantiene la bandera porque esas cinco pasan por el optimizador, pero
     * el riesgo que el nombre advierte no se materializa aquí: `remotePatterns`
     * está vacío, así que solo se puede optimizar lo que ya vive en `/public`,
     * y el sitio no tiene ninguna vía de subida de archivos. Además el
     * optimizador entrega el SVG con la CSP de abajo (`script-src 'none'`) y
     * `Content-Disposition: attachment`, de modo que un SVG con script no se
     * ejecutaría igualmente.
     *
     * Al sustituir esas cinco por mapas de bits, ponerlo en false.
     */
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Sin orígenes remotos: nada externo puede pasar por el optimizador.
    remotePatterns: [],
  },

  async headers() {
    return [
      { source: "/:path*", headers: CABECERAS_SEGURIDAD },
      {
        /*
         * Estáticos de `public/`.
         *
         * Next sirve `/_next/static/*` con `immutable` y un año de caché porque
         * esos nombres llevan hash: si el contenido cambia, cambia la URL. Lo
         * que hay en `public/` no lleva hash, así que Next se cura en salud y
         * manda `max-age=0`: cada visita revalida el logotipo y los treinta SVG
         * del catálogo, y son treinta viajes de ida y vuelta para recibir otros
         * tantos "304, sigue igual".
         *
         * `stale-while-revalidate` resuelve las dos mitades del problema: media
         * hora de frescura para que la navegación normal no pregunte nada, y
         * una semana en la que el navegador pinta la copia guardada al instante
         * mientras comprueba por detrás si hay una nueva. Sustituir una imagen
         * sigue propagándose solo; lo que desaparece es la espera.
         *
         * No se usa `immutable`: los nombres son estables, así que reemplazar
         * un SVG dejaría a quien ya lo tuviera con el viejo durante un año.
         */
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=1800, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/logo.png",
        headers: [
          { key: "Cache-Control", value: "public, max-age=1800, stale-while-revalidate=604800" },
        ],
      },
    ];
  },
};

export default nextConfig;
