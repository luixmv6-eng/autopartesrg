# Graph Report - C:/Users/pedro/AutopartesRG  (2026-08-18)

## Corpus Check
- 68 files · ~58,752 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 606 nodes · 1036 edges · 27 communities (26 shown, 1 thin omitted)
- Extraction: 86% EXTRACTED · 12% INFERRED · 1% AMBIGUOUS · INFERRED: 129 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Catálogo, productos y componentes
- Cabeceras de seguridad y CSP
- Filtros, query string y validación
- Scripts de generación y verificación
- Pipeline del grafo de conocimiento
- Dependencias del proyecto
- Sistema de diseño y página Nosotros
- Configuración de TypeScript
- Captura Home/Catálogo escritorio
- Captura Home/Catálogo móvil
- Captura Nosotros escritorio
- Captura Ficha de producto escritorio
- Captura Ficha de producto móvil
- Captura Nosotros móvil
- Tokens de diseño de las maquetas
- Patrones de ficha de producto
- Patrones de navegación
- Señalización de compatibilidad y color
- Patrones de filtrado
- Exportación de maquetas de Stitch
- Reglas de agente y stack
- Flujo de cotización por WhatsApp
- Imagen Open Graph
- Tipografía de las maquetas
- Configuración de ESLint
- Botón flotante de WhatsApp
- Configuración de PostCSS

## God Nodes (most connected - your core abstractions)
1. `cn()` - 26 edges
2. `useFiltros()` - 19 edges
3. `compilerOptions` - 16 edges
4. `Icon()` - 14 edges
5. `Producto` - 13 edges
6. `Home/Catalogo Mobile Mockup (Stitch)` - 12 edges
7. `Sistema de diseño AutopartesRG` - 11 edges
8. `AutopartesRG Design Token System` - 11 edges
9. `Ficha Tecnica de Autoparte Modal` - 10 edges
10. `Home/Catalogo Desktop Screen (Stitch Mockup)` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Nada se esconde en un carril invisible` --conceptually_related_to--> `Modal()`  [INFERRED]
  DESIGN.md → src/components/ui/Modal.tsx
- `Banda marrón rojiza del rótulo` --conceptually_related_to--> `Paleta Material 3 en tema claro`  [AMBIGUOUS]
  public/logo.png → DESIGN.md
- `Guard __main__ obligatorio en Windows` --rationale_for--> `main()`  [EXTRACTED]
  README.md → scripts/graphify-reparar.py
- `Retícula de catálogo auto-ajustable` --rationale_for--> `Catalogo()`  [EXTRACTED]
  DESIGN.md → src/components/catalogo/Catalogo.tsx
- `Consultas de contenedor en la tarjeta de producto` --rationale_for--> `ProductoCard()`  [EXTRACTED]
  DESIGN.md → src/components/catalogo/ProductoCard.tsx

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Catálogo sin comercio electrónico** — readme_catalogo_es_indice_de_compatibilidad, design_sin_precio_condicion_stock, design_sin_carrito_ni_cuentas, design_sin_sku, readme_identificador_oem [EXTRACTED 1.00]
- **Sistema tipográfico e icónico autohospedado** — design_tipografia_hanken_jetbrains, design_material_symbols_subconjunto, readme_iconos_subconjunto, scripts_descargar_iconos, src_components_ui_icon_iconname [INFERRED 0.85]
- **Consecuencias de no tener sede física** — design_sin_direccion_ni_horario, readme_contacto_ts, readme_seo_datos_estructurados, src_lib_seo_organizacionschema, src_lib_contacto_contacto [INFERRED 0.90]
- **WhatsApp Quoting Conversion Path** — design_stitch_html_detalle_de_producto_desktop_whatsapp_first_quoting_flow, design_stitch_html_home_catalogo_desktop_quote_on_request_card_variant, design_stitch_html_home_catalogo_desktop_floating_whatsapp_button, design_stitch_html_home_catalogo_mobile_whatsapp_fab, design_stitch_html_detalle_de_producto_desktop_whatsapp_quote_cta, design_stitch_html_detalle_de_producto_desktop_whatsapp_message_preview, design_stitch_html_detalle_de_producto_mobile_fixed_bottom_action_bar [INFERRED 0.90]
- **Catalog Filter-and-Browse Flow** — design_stitch_html_home_catalogo_desktop_filter_sidebar, design_stitch_html_home_catalogo_desktop_active_filter_chips, design_stitch_html_home_catalogo_desktop_product_grid, design_stitch_html_home_catalogo_desktop_product_card, design_stitch_html_home_catalogo_mobile_filter_bottom_sheet, design_stitch_html_home_catalogo_mobile_horizontal_filter_chip_rail, design_stitch_html_home_catalogo_mobile_compact_product_card [INFERRED 0.90]
- **Shared Stitch Design Token Foundation** — design_stitch_html_home_catalogo_desktop_color_token_palette, design_stitch_html_home_catalogo_desktop_type_scale, design_stitch_html_home_catalogo_desktop_spacing_scale, design_stitch_html_home_catalogo_desktop_border_radius_scale, design_stitch_html_home_catalogo_desktop_material_symbols_icon_family, design_stitch_html_home_catalogo_desktop_hanken_grotesk_typeface, design_stitch_html_home_catalogo_desktop_jetbrains_mono_typeface [EXTRACTED 1.00]

## Communities (27 total, 1 thin omitted)

### Community 0 - "Catálogo, productos y componentes"
Cohesion: 0.05
Nodes (68): Retícula de catálogo auto-ajustable, Sin precio, condición ni disponibilidad, Sin SKU: solo el número OEM, El catálogo es un índice de compatibilidad, no un inventario, Catálogo de ejemplo en src/data/productos.json, Punto único de lectura de datos: src/lib/productos.ts, El OEM como único identificador publicado, Mensaje de cotización de WhatsApp (+60 more)

### Community 1 - "Cabeceras de seguridad y CSP"
Cohesion: 0.06
Nodes (41): Sin dirección postal ni horario, CABECERAS_SEGURIDAD, construirCSP(), nextConfig, Cabeceras de seguridad por entorno, Datos de contacto en src/lib/contacto.ts, unsafe-eval solo en desarrollo, JSON-LD escapado (+33 more)

### Community 2 - "Filtros, query string y validación"
Cohesion: 0.10
Nodes (37): Query string tratada como entrada no confiable, El estado de filtros vive en la query string, useSyncExternalStore en lugar de useSearchParams, Props, ChipActivo, ClaveMulti, CLAVES, leerLista() (+29 more)

### Community 3 - "Scripts de generación y verificación"
Cohesion: 0.07
Nodes (38): Subconjunto de Material Symbols Outlined, Subconjunto de iconos autohospedado, Marcadores de posición SVG de marca, node_child_process, node:fs/promises, node_net, node:path, node:url (+30 more)

### Community 4 - "Pipeline del grafo de conocimiento"
Cohesion: 0.06
Nodes (37): graphify.analyze, graphify.build, graphify.cache, graphify.cli, graphify.cluster, graphify.detect, graphify.diagnostics, graphify.export (+29 more)

### Community 5 - "Dependencias del proyecto"
Cohesion: 0.05
Nodes (38): eslint, eslint-config-next, next, dependencies, next, react, react-dom, devDependencies (+30 more)

### Community 6 - "Sistema de diseño y página Nosotros"
Cohesion: 0.07
Nodes (38): Área segura con viewport-fit=cover, Sistema de diseño AutopartesRG, Consultas de contenedor en la tarjeta de producto, Contraste AA verificado, Correcciones de contraste en CTA y badges, El corte estructural es lg, no md, Desviaciones deliberadas respecto a las maquetas, Escala de espaciado, radios y elevación (+30 more)

### Community 7 - "Configuración de TypeScript"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 8 - "Captura Home/Catálogo escritorio"
Cohesion: 0.13
Nodes (24): Active Filter Chips Row ('Filtros activos'), AutopartesRG Brand Identity, Limpiar Filtros Action, Vehicle Compatibility Badge on Card, Condition Badge (NUEVO / REMANUFACTURADO), Dark Industrial Visual Theme with Blue Accent, Shopping Cart / Account Icons, Facet Taxonomy (Marca, Categoria, Vehiculo, Modelo/Ano, Condicion, Disponibilidad) (+16 more)

### Community 9 - "Captura Home/Catálogo móvil"
Cohesion: 0.16
Nodes (23): Active Filter Chip Row (Frenos, Toyota Hilux 2020, + Motor), Primary CTA "Anadir" (orange, full-card width), Bottom Tab Bar (Inicio, Catalogo, Mi Garaje, Cuenta), Cart Icon, Catalogo Tab (active state), Compatibility Badge (green check / amber warning / red x), CTA State Variants (Anadir / Ver Detalles / No Compatible disabled), Filter Button ("Filtrar") (+15 more)

### Community 10 - "Captura Nosotros escritorio"
Cohesion: 0.13
Nodes (23): Nosotros Desktop Mejorado (Stitch Mockup), AutopartesRG Brand Identity, Calidad OEM Value Pillar, Cart / Quote Basket Icon, Catalogo (Catalog) Page, Contacto (Contact) Page, Credibility Bullet List (20 anos, alianzas, asesores), Desktop Wide-Canvas Layout (+15 more)

### Community 11 - "Captura Ficha de producto escritorio"
Cohesion: 0.12
Nodes (22): Detalle de Producto Desktop (Stitch Mockup), AutopartesRG Auto-Parts Catalog Site, Category Breadcrumb (Electrico / Alternadores), Ver todo el catalogo Link, Alta Compatibilidad Confirmada Callout, Ficha Tecnica de Autoparte Modal, Fitment Confidence Pattern (compatibility above the fold), Modal Close (X) Control (+14 more)

### Community 12 - "Captura Ficha de producto móvil"
Cohesion: 0.14
Nodes (21): Mockup Stitch: Detalle de Producto (Mobile), Atributos de Compatibilidad (Diámetro, Espesor, Posición), AutopartesRG (Marca del Catálogo), Badge de Categoría (FRENOS), Badge de Disponibilidad en Verde, Bloque de Precio con Precio Tachado, Búsqueda en Barra Superior, Ícono de Carrito de Compras (+13 more)

### Community 13 - "Captura Nosotros móvil"
Cohesion: 0.23
Nodes (18): AutopartesRG Brand Identity, Blue Square Icon Tile, Calidad OEM Value, Shopping Cart Icon, Site Footer, Hamburger Menu Trigger, LEGAL Footer Link Group, Logistica Eficiente Value (+10 more)

### Community 14 - "Tokens de diseño de las maquetas"
Cohesion: 0.24
Nodes (13): Border Radius Scale (4 / 8 / 12 / full), AutopartesRG Design Token System, Desktop Four-Column Footer, Material Symbols Outlined Icon Family, Home / Catálogo Desktop Screen, Spacing Scale (xs 4 / sm 8 / md 16 / lg 24 / xl 40), Inline Tailwind Config Theme Extension, Nosotros Four-Column Footer (+5 more)

### Community 15 - "Patrones de ficha de producto"
Cohesion: 0.21
Nodes (12): Category Breadcrumb, Product Image Panel with Zoom Affordance, Blurred Modal Backdrop, Product Detail Modal, Related Parts Grid (Repuestos Relacionados), Product Detail Desktop Screen, Zebra-Striped Technical Specs Table, Transactional Back Header (+4 more)

### Community 16 - "Patrones de navegación"
Cohesion: 0.22
Nodes (11): Scroll-Reactive Header Shadow, Desktop Top Navigation Bar, Mobile Bottom Navigation Bar, Compact Mobile Footer, Home / Catálogo Mobile Screen, Mobile Top App Bar, Alternating Two-Column Tab Panels, Tab Switching Script (+3 more)

### Community 17 - "Señalización de compatibilidad y color"
Cohesion: 0.24
Nodes (10): Compatibility Confirmation Panel, Traffic-Light Compatibility Signaling, Material 3 Color Role Palette, Primary Corporate Blue Token (#00357f), Desktop Product Card, Bento Product Grid, Ad-hoc Semantic Status Colors, Compact Mobile Product Card (+2 more)

### Community 18 - "Patrones de filtrado"
Cohesion: 0.29
Nodes (8): Active Filter Chip Row, Filter Sidebar (SideNavBar), Hero Section with Part Finder, Filter Bottom Sheet Drawer, Bottom Sheet Open/Close Script, Horizontal Snap-Scroll Filter Chips, Mobile Search and Vehicle Selector, Nuestra Historia Hero

### Community 19 - "Exportación de maquetas de Stitch"
Cohesion: 0.29
Nodes (7): Descarga vía JSON-RPC del método list_screens, Maqueta Detalle de Producto (desktop y mobile), Maqueta Home / Catálogo (desktop y mobile), Maqueta Nosotros (mobile y desktop mejorado), Servidor MCP de Stitch con referencia de esquema rota, screens.json (índice de pantallas de Stitch), Exportación de pantallas de Stitch

### Community 20 - "Reglas de agente y stack"
Cohesion: 0.33
Nodes (6): generate-agent-files.js (regenerador del bloque de reglas), Reglas de agente para Next.js (nextjs-agent-rules), CLAUDE.md (delegación a AGENTS.md), Despliegue en Vercel, Stack Next.js 16 (App Router) + TypeScript + Tailwind v4, Variables de entorno NEXT_PUBLIC_*

### Community 21 - "Flujo de cotización por WhatsApp"
Cohesion: 0.40
Nodes (6): WhatsApp-First Quoting Flow, Pre-filled WhatsApp Message Preview, Cotizar por WhatsApp CTA (Desktop), Fixed Bottom Action Bar, Quote-on-Request Card Variant, Tertiary Amber Accent Token

### Community 22 - "Imagen Open Graph"
Cohesion: 0.33
Nodes (4): next/og, alt, contentType, size

### Community 23 - "Tipografía de las maquetas"
Cohesion: 0.40
Nodes (5): Hanken Grotesk Display/Body Typeface, JetBrains Mono Technical Label Typeface, Monospace Technical Labeling Convention, Type Scale (display-lg to label-sm), Mobile Historia Hero

### Community 24 - "Configuración de ESLint"
Cohesion: 0.40
Nodes (4): eslintConfig, eslint/config, eslint-config-next/core-web-vitals, eslint-config-next/typescript

### Community 25 - "Botón flotante de WhatsApp"
Cohesion: 1.00
Nodes (3): Floating WhatsApp Button (Desktop), WhatsApp Brand Green (#25D366), WhatsApp FAB with Inline Brand SVG

## Ambiguous Edges - Review These
- `Paleta Material 3 en tema claro` → `Banda marrón rojiza del rótulo`  [AMBIGUOUS]
  public/logo.png · relation: conceptually_related_to
- `Desktop Top Navigation Bar` → `Flat Collapsible Top Nav`  [AMBIGUOUS]
  design/stitch/html/nosotros-desktop-mejorado.html · relation: semantically_similar_to
- `Product Image Panel with Zoom Control` → `Repuestos Relacionados Footer Bar`  [AMBIGUOUS]
  design/stitch/screenshots/detalle-de-producto-desktop.png · relation: conceptually_related_to
- `Bloque de Precio con Precio Tachado` → `Flujo de Cotización sin Checkout`  [AMBIGUOUS]
  design/stitch/screenshots/detalle-de-producto-mobile.png · relation: conceptually_related_to
- `Flujo de Cotización sin Checkout` → `Ícono de Carrito de Compras`  [AMBIGUOUS]
  design/stitch/screenshots/detalle-de-producto-mobile.png · relation: conceptually_related_to
- `Quote-on-Request Pricing ('Precio previa cotizacion' / 'Consultar precio')` → `Shopping Cart / Account Icons`  [AMBIGUOUS]
  design/stitch/screenshots/home-catalogo-desktop.png · relation: conceptually_related_to
- `OEM Search Bar ("Buscar por numero OEM o palabra clave")` → `Vehicle Fitment / Compatibility System`  [AMBIGUOUS]
  design/stitch/screenshots/home-catalogo-mobile.png · relation: conceptually_related_to
- `Vehicle Fitment / Compatibility System` → `Floating WhatsApp Contact Button`  [AMBIGUOUS]
  design/stitch/screenshots/home-catalogo-mobile.png · relation: conceptually_related_to
- `Soporte Tecnico Value Pillar` → `Contacto (Contact) Page`  [AMBIGUOUS]
  design/stitch/screenshots/nosotros-desktop-mejorado.png · relation: conceptually_related_to
- `Tab Navigation (Sobre Nosotros / Mision / Vision)` → `Light Minimal Visual Theme`  [AMBIGUOUS]
  design/stitch/screenshots/nosotros-desktop-mejorado.png · relation: conceptually_related_to
- `Single-Column Mobile Layout` → `Mobile Header Bar`  [AMBIGUOUS]
  design/stitch/screenshots/nosotros-mobile.png · relation: conceptually_related_to

## Knowledge Gaps
- **152 isolated node(s):** `eslintConfig`, `nextConfig`, `name`, `version`, `private` (+147 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Paleta Material 3 en tema claro` and `Banda marrón rojiza del rótulo`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Desktop Top Navigation Bar` and `Flat Collapsible Top Nav`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Product Image Panel with Zoom Control` and `Repuestos Relacionados Footer Bar`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Bloque de Precio con Precio Tachado` and `Flujo de Cotización sin Checkout`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Flujo de Cotización sin Checkout` and `Ícono de Carrito de Compras`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Quote-on-Request Pricing ('Precio previa cotizacion' / 'Consultar precio')` and `Shopping Cart / Account Icons`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `OEM Search Bar ("Buscar por numero OEM o palabra clave")` and `Vehicle Fitment / Compatibility System`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._