import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/contacto";

/**
 * Se permite todo el sitio público y se cierra lo que no es contenido.
 *
 * El panel (`/admin`) y su API no deben aparecer en resultados: no es contenido,
 * y una pantalla de acceso indexada es una invitación a probar contraseñas. No
 * sustituye a la autenticación —`robots.txt` es una petición, no un control de
 * acceso, y el panel ya exige sesión— pero evita que la URL se publique.
 *
 * `/api/foto` se queda **abierta** a propósito, y es importante: las cincuenta
 * fotos del catálogo se sirven desde ahí y no desde `public/`. Cerrar `/api`
 * entero, que es el reflejo habitual, bloquearía el rastreo de todas las imágenes
 * del sitio, y en repuestos Google Imágenes es un canal de entrada de primer
 * orden —quien tiene la pieza vieja en la mano la reconoce antes de saber cómo se
 * llama.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/admin"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
