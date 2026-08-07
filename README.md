# AutopartesRG

Landing page y catálogo digital de repuestos automotrices, con captación de leads
por WhatsApp. Next.js 16 (App Router) + TypeScript + Tailwind CSS v4.

La interfaz implementa el proyecto de Stitch **AutopartesRG Digital Catalog**.
Las maquetas de referencia están en [`design/stitch/`](./design/stitch/README.md)
y el sistema de diseño resultante, con las desviaciones deliberadas y su motivo,
en [`DESIGN.md`](./DESIGN.md).

---

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # en Windows: copy .env.example .env.local
npm run dev
```

La aplicación queda en <http://localhost:3000>.

### Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Sirve la compilación de producción |
| `npm run lint` | ESLint, incluidas las reglas del compilador de React |
| `npm run placeholders` | Regenera las imágenes de marcador de posición |
| `npm run iconos` | Regenera el subconjunto de Material Symbols |
| `npm run grafo:verificar` | Comprueba que el grafo de conocimiento no tenga aristas rotas |

---

## Variables de entorno

Plantilla en `.env.example`.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Sí | Número de destino, **solo dígitos y con código de país**, sin `+` ni espacios. Ejemplo para Colombia: `573001234567`. Si se deja vacío, los enlaces abren WhatsApp con el mensaje listo pero sin destinatario. |
| `NEXT_PUBLIC_SITE_URL` | Recomendada | URL pública. Alimenta los metadatos canónicos, Open Graph, `sitemap.xml` y `robots.txt`. |

Llevan el prefijo `NEXT_PUBLIC_` porque se leen en el navegador. Al desplegar hay
que registrarlas también en el panel del hosting.

---

## Editar el contenido

### Productos

`src/data/productos.json`. Cada entrada sigue el tipo `Producto`
(`src/lib/types.ts`):

```jsonc
{
  "id": "pastillas-freno-delanteras-ceramicas", // identificador y nombre de imagen
  "oem": "04465-YZZED",               // número de parte del fabricante
  "nombre": "Pastillas de freno delanteras cerámicas",
  "descripcion": "…",
  "marca": "toyota",                  // ver MARCAS en src/lib/taxonomia.ts
  "modelos": ["Corolla", "Yaris"],
  "anioDesde": 2014,
  "anioHasta": 2022,
  "categoria": "frenos",              // ver CATEGORIAS
  "seccion": "sistema-frenos",        // ver SECCIONES
  "imagen": "/images/parts/pastillas-freno-delanteras-ceramicas.svg",
  "destacado": true                   // opcional, ordena primero
}
```

Para añadir marcas, categorías o secciones basta con extender las listas de
`src/lib/taxonomia.ts` y el tipo correspondiente en `src/lib/types.ts`. Los
filtros, los chips y las etiquetas se generan a partir de ahí.

Los **repuestos relacionados** de la ficha se derivan solos: misma categoría
primero, luego misma sección y marca (`relacionados()` en `src/lib/productos.ts`).

### Identificadores: OEM, y por qué no hay SKU

El único código que publica el catálogo es el **OEM** (*Original Equipment
Manufacturer*), el número de parte que asigna el fabricante del vehículo. Es
universal: cualquier taller lo reconoce y le sirve a quien ya lo tiene apuntado
de la pieza vieja. Por eso se muestra en la tarjeta, en la ficha y se indexa en
el buscador.

**No hay SKU** (código interno de inventario). Sin una base de datos de stock
detrás, un código propio no identificaría nada real: sería ruido en pantalla.

> Los números OEM del catálogo de ejemplo **son inventados**. El formato es
> plausible por marca, pero no corresponden verificadamente a la pieza que
> acompañan. Sustitúyelos por los reales antes de publicar: el buscador indexa
> este campo, así que un OEM equivocado devuelve resultados equivocados.

### Lo que el catálogo no publica

El catálogo es un **índice de compatibilidad**, no un inventario. No hay en el
código, ni en los datos, ni en la interfaz:

- **Precio ni moneda**: sin importes, sin filtro de rango, sin orden por precio.
- **Condición del repuesto** (nuevo / usado / remanufacturado).
- **Disponibilidad** (en stock / bajo pedido).
- **SKU interno**.

Todo eso se confirma por WhatsApp. La razón es la misma en todos los casos: sin
un sistema de inventario detrás, publicarlos sería prometer algo que no se puede
sostener. Cuando exista ese sistema, se reintroducen añadiendo los campos al
tipo `Producto` y sus filtros a `taxonomia.ts`.

Las maquetas de Stitch sí muestran precio, condición y stock; omitirlos es una
desviación deliberada, anotada en `DESIGN.md`.

### Conectar una API o un CMS

Toda la lectura de datos pasa por `src/lib/productos.ts`. Sustituir el `import`
del JSON por una llamada a la fuente real es el único cambio necesario.

### Textos de Nosotros

`src/components/sections/Nosotros.tsx`: la constante `VALORES` para las tres
tarjetas y `PESTANAS` para Sobre Nosotros, Misión y Visión.

### Datos de contacto y redes

`src/lib/contacto.ts`. Alimenta el footer y los datos estructurados.

**No hay dirección postal ni horario de atención.** El comercio no tiene punto
de venta físico, así que en su lugar se declara `cobertura` (la zona de
despacho). Esto condiciona el marcado: el sitio se describe como
`Organization`, no como `Store` / `LocalBusiness`, porque esos tipos esperan
`address` y `geo` reales y declararlos en falso es motivo de acción manual por
spam de datos estructurados. El `contactPoint` tampoco lleva `hoursAvailable`.

### Mensaje de WhatsApp

`src/lib/whatsapp.ts`. El mensaje de cotización mantiene el formato acordado:

> Hola, estoy interesado en el repuesto: **[NOMBRE]**, para el vehículo:
> **[MARCA Y MODELO]**. Me interesaría cotizar el precio y recibir más información.

Los corchetes se rellenan con los datos del producto y con el modelo que el
usuario elija en la ficha. El texto se puede editar antes de abrir WhatsApp con
el botón "Editar".

### Iconos

Material Symbols Outlined, autohospedado como subconjunto de 29 glifos (33 KB).
Para usar uno nuevo:

1. Añádelo a `ICONOS` en `scripts/descargar-iconos.mjs`.
2. Añádelo al tipo `IconName` en `src/components/ui/Icon.tsx`.
3. Ejecuta `npm run iconos`.

Un glifo que no esté en el subconjunto no compila, así que no puede colarse un
icono que luego no se renderice.

### Imágenes

El repositorio trae **marcadores de posición SVG** generados por
`npm run placeholders`: fichas de producto sobre fondo de estudio claro y
composiciones azules para el hero y Nosotros.

Para poner material real:

| Archivo | Formato recomendado |
|---|---|
| `public/images/parts/<id>.webp` | 4:3, unos 1200x900, fondo claro |
| `public/images/hero.webp` | panorámica, unos 2000x900 |
| `public/images/nosotros.webp` | banda ancha, unos 1600x440 |
| `public/images/nosotros-{sobre-nosotros,mision,vision}.webp` | 2:1, unos 1200x620 |

Después actualiza la ruta en `src/data/productos.json` (productos) y las
extensiones en `Hero.tsx` y `Nosotros.tsx`. Cuando no queden SVG puedes poner
`dangerouslyAllowSVG: false` en `next.config.ts`.

---

## Cómo funcionan los filtros

El estado vive **en la query string**, así que cualquier catálogo filtrado se
comparte pegando el enlace:

```
/?q=freno&marca=toyota,kia&cat=frenos&sec=sistema-frenos&anio=2018&orden=nombre
```

| Parámetro | Significado |
|---|---|
| `q` | Búsqueda libre: nombre, OEM, marca, modelo, categoría |
| `marca` | Marcas del vehículo, separadas por coma |
| `cat` | Categorías del repuesto |
| `sec` | Secciones del vehículo |
| `modelo` | Texto libre de modelo |
| `anio` | Año que debe caer dentro del rango de compatibilidad |
| `orden` | `nombre` (por defecto: destacados primero) |

La lectura y escritura de la URL está en `src/lib/urlQuery.ts`, que expone un
`useSyncExternalStore` en lugar de `useSearchParams`. Es deliberado:
`useSearchParams` obliga a Next a renderizar en cliente todo el subárbol que lo
usa, y el hero y el catálogo desaparecerían del HTML servido. Con este enfoque la
página sigue siendo estática, el catálogo completo viaja en el HTML y los filtros
se aplican al hidratar, sin ida y vuelta al servidor.

---

## Estructura

```
design/stitch/            maquetas de referencia (capturas + HTML exportado)
src/
  app/
    layout.tsx            fuentes, metadatos, JSON-LD, navegación, footer
    page.tsx              landing: hero + catálogo
    nosotros/page.tsx     página Nosotros, fuera de la landing
    globals.css           tokens Material 3, escala tipográfica, motion
    fonts/                subconjunto de Material Symbols
    opengraph-image.tsx   imagen de Open Graph generada en build
    robots.ts sitemap.ts
  components/
    layout/               Navbar, BottomNav, Footer, WhatsAppFab, Logo
    sections/             Hero, Nosotros
    catalogo/             Catalogo, ProductoCard, ProductoModal, FiltroSidebar,
                          EstadoVacio
    ui/                   Button, Badge, Chip, Checkbox, Icon, Modal, Skeleton
  data/productos.json     catálogo de ejemplo (22 repuestos)
  hooks/useFiltros.ts     estado de filtros sobre la URL
  lib/                    tipos, taxonomía, datos, contacto, WhatsApp, utilidades
scripts/                  generadores de imágenes y del subconjunto de iconos
```

---

## Despliegue

### Vercel

1. Sube el repositorio a GitHub, GitLab o Bitbucket.
2. En Vercel elige **Add New… > Project** e importa el repositorio.
3. El framework se detecta solo; comando de build `next build`.
4. En **Settings > Environment Variables** añade `NEXT_PUBLIC_WHATSAPP_NUMBER` y
   `NEXT_PUBLIC_SITE_URL` para Production, Preview y Development.
5. Despliega. Cada push a la rama principal publica una versión.

Tras el primer despliegue conviene actualizar `NEXT_PUBLIC_SITE_URL` al dominio
definitivo y volver a desplegar, para que los canónicos y el sitemap apunten bien.

### Otro hosting con Node

```bash
npm run build
npm run start   # puerto 3000, configurable con PORT
```

Requiere Node 20 o superior, detrás de un proxy inverso con HTTPS.

---

## Grafo de conocimiento

`graphify-out/` contiene un grafo navegable del proyecto: **532 nodos, 903
aristas, 26 comunidades** sobre el código, la documentación y las maquetas de
Stitch. Abre `graphify-out/graph.html` en el navegador, o lee
`graphify-out/GRAPH_REPORT.md`.

Para consultarlo desde la terminal: `graphify query "<pregunta>"`.

### Reparación de extremos

El extractor AST de graphify emite aristas `imports_from` hacia módulos externos
(`react`, `next/image`, `node:fs/promises`...) y hacia archivos que no generan
nodos propios (`globals.css` no se parsea, `productos.json` es dato puro), pero
no crea el nodo de destino. El resultado son aristas con extremo colgante que el
chequeo de salud marca como posible corrupción.

`scripts/graphify-reparar.py` reconstruye el grafo materializando esos nodos, así
que el grafo pasa a responder también qué archivos importan React o quién lee
`productos.json`:

```bash
python scripts/graphify-reparar.py   # reconstruye y repara
npm run grafo:verificar              # comprueba que no queden extremos rotos
```

En Windows hace falta el guard `if __name__ == "__main__":` en cualquier script
que llame a `graphify.extract.extract()`, porque usa `ProcessPoolExecutor` con
`spawn` y reimporta el módulo en cada worker.

---

## SEO

| Elemento | Dónde |
|---|---|
| Título y plantilla, descripción, keywords, canonical, `hreflang` | `src/app/layout.tsx` |
| Título y canónica propios por página | `src/app/nosotros/page.tsx` |
| Open Graph y Twitter Card | `layout.tsx` y sobrescritura por página |
| Imagen OG generada en build | `src/app/opengraph-image.tsx` |
| `robots.txt` y `sitemap.xml` | `src/app/robots.ts`, `src/app/sitemap.ts` |
| Datos estructurados | `src/lib/seo.ts` |

Los datos estructurados son tres:

- **`Organization`** con `contactPoint` y `areaServed`. No es `Store` ni
  `LocalBusiness` porque no hay sede física, y no declara horario porque el
  sitio no lo publica.
- **`WebSite`** con `SearchAction`, que declara el buscador del catálogo.
- **`BreadcrumbList`** en `/nosotros`.

**El sitemap solo lista URLs canónicas.** Las vistas filtradas (`/?cat=frenos`)
no aparecen: todas declaran `canonical` hacia la portada, así que listarlas
sería pedir la indexación de algo marcado a la vez como duplicado. Se llega a
ellas desde los enlaces del footer.

Cada página tiene **un solo `<h1>`**, jerarquía de encabezados sin saltos y
`alt` en todas las imágenes (verificado sobre el HTML servido).

---

## Seguridad

Cabeceras aplicadas a todas las rutas desde `next.config.ts`. La política
**distingue entorno**: producción va cerrada, desarrollo abre lo justo para que
las herramientas de Next funcionen.

| Cabecera | Valor |
|---|---|
| `Content-Security-Policy` | `default-src 'self'`, sin `object-src`, `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`, `upgrade-insecure-requests` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | cámara, micrófono, geolocalización, pagos y FLoC denegados |
| `Cross-Origin-Opener-Policy` / `-Resource-Policy` | `same-origin` |

Además:

- **`poweredByHeader: false`**: no se anuncia el framework ni su versión.
- **Entrada de usuario saneada** (`src/lib/validarFiltros.ts`): la query string
  es entrada no confiable. Los valores que no pertenecen a la taxonomía se
  descartan, el texto libre se recorta a 80 caracteres y se le quitan los
  caracteres de control, y el año debe ser un entero de cuatro cifras en rango.
  Antes se casteaban a ciegas con `as MarcaId[]`.
- **JSON-LD escapado** (`src/lib/jsonld.ts`): `JSON.stringify` no escapa `<`,
  así que un dato con `</script>` cerraría la etiqueta y el resto se
  interpretaría como marcado. Se neutralizan `<`, `>`, `&`, U+2028 y U+2029.
- **`NEXT_PUBLIC_SITE_URL` validada**: se comprueba el protocolo antes de usarla
  como `href` canónico, para que una variable mal puesta no acabe en la página.
- **Enlaces externos** con `rel="noopener noreferrer"`.
- **Sin orígenes remotos** en el optimizador de imágenes.

### Diferencias entre desarrollo y producción

En `next dev` la CSP añade tres permisos, y solo ahí:

| Permiso | Por qué | Riesgo en producción |
|---|---|---|
| `'unsafe-eval'` en `script-src` | React lo usa en modo desarrollo para reconstruir pilas de llamada y otras ayudas de depuración | Ninguno: **React nunca usa `eval()` en producción**, y la cabecera publicada no lo lleva |
| `ws:` y `wss:` en `connect-src` | Canal de Fast Refresh | No se emite fuera de desarrollo |
| `blob:` en `script-src` | Mapas de origen y recarga en caliente | No se emite fuera de desarrollo |

`HSTS` y `upgrade-insecure-requests` tampoco se emiten en desarrollo: en local
no hay HTTPS y forzarlo rompe las peticiones a `localhost`.

Sin esta separación, `next dev` lanza en consola
`eval() is not supported in this environment`.

La CSP mantiene `'unsafe-inline'` en `script-src` y `style-src` en ambos
entornos porque Next inyecta el payload de hidratación y los estilos críticos
en línea. Eliminarlo exigiría un `nonce` por petición, lo que obliga a
renderizar en servidor y sacrifica el prerender estático.

Verificado en navegador, en los dos entornos: **0 violaciones de CSP y la
aplicación hidrata correctamente**. Comprobado además que la cabecera de
producción **no** contiene `unsafe-eval`.

---

## Rendimiento y accesibilidad

Medido sobre la compilación de producción de este repositorio:

- **HTML servido**: hero, las 9 primeras tarjetas del catálogo, las tres pestañas
  de Nosotros y el footer llegan renderizados. Nada del contenido depende de
  JavaScript para existir.
- **CSS**: 68 KB sin comprimir, 12 KB con gzip, en un solo archivo.
- **JavaScript de primera carga**: unos 193 KB con gzip, de los que cerca de
  112 KB son el runtime de React 19 y del App Router.
- **Iconos**: 40 KB de woff2 con los 39 glifos usados, en vez de los varios
  megabytes de la familia completa. Se carga con `font-display: block` y
  precarga, así que no aparece el nombre del glifo antes de la fuente.
- **Sin librería de animación ni de componentes**: el motion es CSS nativo
  (`animation-timeline: view()`), degradado a contenido visible donde no hay
  soporte y desactivado bajo `prefers-reduced-motion`.
- **Accesibilidad**: contraste AA verificado (ver las correcciones de contraste
  en `DESIGN.md`), foco visible, enlace de salto al contenido, pestañas con
  `role="tablist"` y navegación por flechas, filtros plegables con
  `aria-expanded`/`aria-controls`, ficha sobre `<dialog>` nativo (trampa de foco,
  Escape y backdrop del navegador) y áreas táctiles de 44 px o más.
- **Sin desbordamiento horizontal**: verificado con emulación de dispositivo a
  390 px (`scrollWidth` igual al viewport, cero elementos fuera de rango).

Antes de anunciar el sitio conviene pasar Lighthouse contra el despliegue real,
no contra `next dev`, que sirve JavaScript sin minificar.
