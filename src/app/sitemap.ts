import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/contacto";

/**
 * Solo las URLs canónicas.
 *
 * Las vistas filtradas (`/?cat=frenos`) no van aquí: todas declaran `canonical`
 * apuntando a la portada, así que listarlas sería una señal contradictoria
 * (pedir indexación de algo que a la vez se marca como duplicado). Se llega a
 * ellas desde los enlaces del footer, que es lo que corresponde.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const ahora = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: ahora,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/nosotros`,
      lastModified: ahora,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
