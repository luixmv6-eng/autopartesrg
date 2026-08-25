import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { CONTACTO, SITE_URL } from "@/lib/contacto";
import { serializarJsonLd } from "@/lib/jsonld";
import { organizacionSchema, sitioSchema } from "@/lib/seo";
import "./globals.css";

/*
 * Pesos declarados: 400 cuerpo, 500 etiquetas, 600 titulares, 700 display. El
 * 800 estaba pedido y no lo usaba nadie.
 *
 * Quitarlo no ahorra bytes —`next/font` sirve el fichero variable de la familia
 * y el array `weight` solo decide qué reglas `@font-face` se emiten—, pero
 * declarar un peso que no se usa invita a usarlo sin querer y a que la escala
 * tipográfica se desordene. Medido: el woff2 pesa lo mismo con 800 y sin él.
 *
 * Coste real de las dos familias: 30,6 KB Hanken + 33,9 KB JetBrains. Es el
 * suelo con estas dos tipografías; el único recorte posible sería renunciar a
 * la monoespaciada, que es la que da el registro técnico de todo el sitio.
 */
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

/**
 * Subconjunto de Material Symbols con solo los iconos del sitio.
 * `display: block` evita que se vea el nombre del glifo antes de cargar.
 */
const materialSymbols = localFont({
  src: "./fonts/material-symbols-subset.woff2",
  weight: "100 700",
  display: "block",
  variable: "--font-material-symbols",
});

const TITULO = "Catálogo de repuestos y autopartes por marca y modelo";
const DESCRIPCION =
  "Busca repuestos por marca, modelo y año. Verifica la compatibilidad con tu vehículo y cotiza al instante por WhatsApp con Autopartes ERG.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${TITULO} | ${CONTACTO.nombre}`,
    template: `%s | ${CONTACTO.nombre}`,
  },
  description: DESCRIPCION,
  applicationName: CONTACTO.nombre,
  category: "automotive",
  keywords: [
    "repuestos automotrices",
    "autopartes",
    "repuestos por modelo",
    "catálogo de repuestos",
    "repuestos Colombia",
    "compatibilidad de repuestos",
    "frenos",
    "suspensión",
    "embrague",
  ],
  authors: [{ name: CONTACTO.nombre, url: SITE_URL }],
  creator: CONTACTO.nombre,
  publisher: CONTACTO.nombre,
  alternates: {
    canonical: "/",
    languages: { "es-CO": "/" },
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: SITE_URL,
    siteName: CONTACTO.nombre,
    title: `${TITULO} | ${CONTACTO.nombre}`,
    description: DESCRIPCION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITULO} | ${CONTACTO.nombre}`,
    description: DESCRIPCION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Evita que el navegador convierta cifras sueltas en enlaces de teléfono.
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#00357f",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  /*
   * `cover` extiende el lienzo hasta los bordes físicos de la pantalla, que es
   * lo que hace que `env(safe-area-inset-*)` devuelva algo distinto de cero.
   * Sin esto, el relleno de área segura de la barra inferior no se aplica y en
   * un iPhone con indicador de inicio el último destino queda debajo de él.
   */
  viewportFit: "cover",
  // Sin `maximumScale`: bloquear el zoom es una barrera de accesibilidad.
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es-CO"
      className={`${hanken.variable} ${jetbrains.variable} ${materialSymbols.variable}`}
    >
      {/*
       * El relleno inferior deja sitio a la barra de navegación móvil. Sale de
       * `--alto-barra-inferior`, que ya incluye el área segura del dispositivo
       * y vale 0 a partir de `lg`, donde la barra desaparece.
       */}
      <body className="flex min-h-dvh flex-col pb-[var(--alto-barra-inferior)] antialiased">
        {/*
         * Datos estructurados: la organización y el sitio con su buscador.
         * Se serializan con `serializarJsonLd`, que escapa `<`, `>`, `&` y los
         * separadores de línea Unicode para que ningún dato pueda cerrar la
         * etiqueta `<script>` antes de tiempo.
         */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializarJsonLd(organizacionSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializarJsonLd(sitioSchema()) }}
        />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-md focus:top-md focus:z-[60] focus:rounded-lg focus:bg-primary focus:px-md focus:py-sm focus:font-mono focus:text-label-technical focus:text-on-primary"
        >
          Saltar al contenido
        </a>
        <div id="tope-pagina" aria-hidden className="absolute top-0 h-px w-full" />
        <Navbar />
        <main id="contenido" className="flex-grow pt-[var(--alto-cabecera)]">
          {children}
        </main>
        <Footer />
        <WhatsAppFab />
        <BottomNav />
      </body>
    </html>
  );
}
