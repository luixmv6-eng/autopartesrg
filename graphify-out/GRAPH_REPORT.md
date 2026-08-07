# Graph Report - C:/Users/pedro/AutopartesRG  (2026-08-07)

## Corpus Check
- Corpus is ~49,951 words - fits in a single context window. You may not need a graph.

## Summary
- 516 nodes · 878 edges · 29 communities (27 shown, 2 thin omitted)
- Extraction: 86% EXTRACTED · 13% INFERRED · 1% AMBIGUOUS · INFERRED: 114 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Catálogo, filtros y tarjetas
- Layout, navegación y SEO
- Sistema de diseño documentado
- Dependencias del proyecto
- Configuración de TypeScript
- Maqueta Home escritorio
- Maqueta Home móvil
- Maqueta Nosotros escritorio
- Maqueta Ficha escritorio
- Maqueta Ficha móvil
- Maqueta Nosotros móvil
- Botones y contacto WhatsApp
- Estado de filtros en la URL
- Tokens de espaciado y forma
- Patrones de ficha de producto
- Patrones de navegación
- Generador de imágenes
- Señalización de compatibilidad
- Patrones de filtrado
- Flujo de cotización WhatsApp
- Tipografía Hanken y JetBrains
- Subconjunto de iconos
- Imagen Open Graph
- Reglas de agente Next.js
- Botón flotante de WhatsApp
- Configuración de ESLint
- Configuración de Next.js
- Configuración de PostCSS
- Comunidad 28

## God Nodes (most connected - your core abstractions)
1. `cn()` - 24 edges
2. `useFiltros()` - 18 edges
3. `compilerOptions` - 16 edges
4. `Icon()` - 15 edges
5. `Home/Catalogo Mobile Mockup (Stitch)` - 12 edges
6. `AutopartesRG Design Token System` - 11 edges
7. `Producto` - 10 edges
8. `Ficha Tecnica de Autoparte Modal` - 10 edges
9. `Home/Catalogo Desktop Screen (Stitch Mockup)` - 10 edges
10. `Nosotros (About) Page` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Modal()` --references--> `react`  [EXTRACTED]
  src/components/ui/Modal.tsx → package.json
- `Related Parts Grid (Repuestos Relacionados)` --semantically_similar_to--> `Desktop Product Card`  [INFERRED] [semantically similar]
  design/stitch/html/detalle-de-producto-desktop.html → design/stitch/html/home-catalogo-desktop.html
- `Transactional Back Header` --semantically_similar_to--> `Mobile Top App Bar`  [INFERRED] [semantically similar]
  design/stitch/html/detalle-de-producto-mobile.html → design/stitch/html/home-catalogo-mobile.html
- `Desktop Top Navigation Bar` --semantically_similar_to--> `Flat Collapsible Top Nav`  [AMBIGUOUS] [semantically similar]
  design/stitch/html/home-catalogo-desktop.html → design/stitch/html/nosotros-desktop-mejorado.html
- `Grupo()` --calls--> `cn()`  [EXTRACTED]
  src/components/catalogo/FiltroSidebar.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **WhatsApp Quoting Conversion Path** — design_stitch_html_detalle_de_producto_desktop_whatsapp_first_quoting_flow, design_stitch_html_home_catalogo_desktop_quote_on_request_card_variant, design_stitch_html_home_catalogo_desktop_floating_whatsapp_button, design_stitch_html_home_catalogo_mobile_whatsapp_fab, design_stitch_html_detalle_de_producto_desktop_whatsapp_quote_cta, design_stitch_html_detalle_de_producto_desktop_whatsapp_message_preview, design_stitch_html_detalle_de_producto_mobile_fixed_bottom_action_bar [INFERRED 0.90]
- **Catalog Filter-and-Browse Flow** — design_stitch_html_home_catalogo_desktop_filter_sidebar, design_stitch_html_home_catalogo_desktop_active_filter_chips, design_stitch_html_home_catalogo_desktop_product_grid, design_stitch_html_home_catalogo_desktop_product_card, design_stitch_html_home_catalogo_mobile_filter_bottom_sheet, design_stitch_html_home_catalogo_mobile_horizontal_filter_chip_rail, design_stitch_html_home_catalogo_mobile_compact_product_card [INFERRED 0.90]
- **Shared Stitch Design Token Foundation** — design_stitch_html_home_catalogo_desktop_color_token_palette, design_stitch_html_home_catalogo_desktop_type_scale, design_stitch_html_home_catalogo_desktop_spacing_scale, design_stitch_html_home_catalogo_desktop_border_radius_scale, design_stitch_html_home_catalogo_desktop_material_symbols_icon_family, design_stitch_html_home_catalogo_desktop_hanken_grotesk_typeface, design_stitch_html_home_catalogo_desktop_jetbrains_mono_typeface [EXTRACTED 1.00]

## Communities (29 total, 2 thin omitted)

### Community 0 - "Catálogo, filtros y tarjetas"
Cohesion: 0.07
Nodes (51): next/image, next_link, next_navigation, react, ANIOS, EstadoVacio(), ProductoCard(), Props (+43 more)

### Community 1 - "Layout, navegación y SEO"
Cohesion: 0.07
Nodes (33): CABECERAS_SEGURIDAD, nextConfig, next, next/font/google, next/font/local, Tokens de diseño y animaciones, hanken, jetbrains (+25 more)

### Community 2 - "Sistema de diseño documentado"
Cohesion: 0.10
Nodes (38): conteoSiSeAplica(), FiltroSidebar(), Grupo(), Props, ChipActivo, ClaveMulti, CLAVES, leerLista() (+30 more)

### Community 3 - "Dependencias del proyecto"
Cohesion: 0.06
Nodes (35): eslint, eslint-config-next, next, dependencies, next, react, react-dom, devDependencies (+27 more)

### Community 4 - "Configuración de TypeScript"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "Maqueta Home escritorio"
Cohesion: 0.10
Nodes (22): node_fs, node:fs/promises, node:path, node:url, destino, fuente, ICONOS, raiz (+14 more)

### Community 6 - "Maqueta Home móvil"
Cohesion: 0.13
Nodes (24): Active Filter Chips Row ('Filtros activos'), AutopartesRG Brand Identity, Limpiar Filtros Action, Vehicle Compatibility Badge on Card, Condition Badge (NUEVO / REMANUFACTURADO), Dark Industrial Visual Theme with Blue Accent, Shopping Cart / Account Icons, Facet Taxonomy (Marca, Categoria, Vehiculo, Modelo/Ano, Condicion, Disponibilidad) (+16 more)

### Community 7 - "Maqueta Nosotros escritorio"
Cohesion: 0.16
Nodes (23): Active Filter Chip Row (Frenos, Toyota Hilux 2020, + Motor), Primary CTA "Anadir" (orange, full-card width), Bottom Tab Bar (Inicio, Catalogo, Mi Garaje, Cuenta), Cart Icon, Catalogo Tab (active state), Compatibility Badge (green check / amber warning / red x), CTA State Variants (Anadir / Ver Detalles / No Compatible disabled), Filter Button ("Filtrar") (+15 more)

### Community 8 - "Maqueta Ficha escritorio"
Cohesion: 0.13
Nodes (23): Nosotros Desktop Mejorado (Stitch Mockup), AutopartesRG Brand Identity, Calidad OEM Value Pillar, Cart / Quote Basket Icon, Catalogo (Catalog) Page, Contacto (Contact) Page, Credibility Bullet List (20 anos, alianzas, asesores), Desktop Wide-Canvas Layout (+15 more)

### Community 9 - "Maqueta Ficha móvil"
Cohesion: 0.12
Nodes (22): Detalle de Producto Desktop (Stitch Mockup), AutopartesRG Auto-Parts Catalog Site, Category Breadcrumb (Electrico / Alternadores), Ver todo el catalogo Link, Alta Compatibilidad Confirmada Callout, Ficha Tecnica de Autoparte Modal, Fitment Confidence Pattern (compatibility above the fold), Modal Close (X) Control (+14 more)

### Community 10 - "Maqueta Nosotros móvil"
Cohesion: 0.14
Nodes (21): Mockup Stitch: Detalle de Producto (Mobile), Atributos de Compatibilidad (Diámetro, Espesor, Posición), AutopartesRG (Marca del Catálogo), Badge de Categoría (FRENOS), Badge de Disponibilidad en Verde, Bloque de Precio con Precio Tachado, Búsqueda en Barra Superior, Ícono de Carrito de Compras (+13 more)

### Community 11 - "Botones y contacto WhatsApp"
Cohesion: 0.23
Nodes (18): AutopartesRG Brand Identity, Blue Square Icon Tile, Calidad OEM Value, Shopping Cart Icon, Site Footer, Hamburger Menu Trigger, LEGAL Footer Link Group, Logistica Eficiente Value (+10 more)

### Community 12 - "Estado de filtros en la URL"
Cohesion: 0.13
Nodes (15): graphify_analyze, graphify_build, graphify_cache, graphify_cluster, graphify_detect, graphify_diagnostics, graphify_export, graphify_extract (+7 more)

### Community 13 - "Tokens de espaciado y forma"
Cohesion: 0.24
Nodes (13): Border Radius Scale (4 / 8 / 12 / full), AutopartesRG Design Token System, Desktop Four-Column Footer, Material Symbols Outlined Icon Family, Home / Catálogo Desktop Screen, Spacing Scale (xs 4 / sm 8 / md 16 / lg 24 / xl 40), Inline Tailwind Config Theme Extension, Nosotros Four-Column Footer (+5 more)

### Community 14 - "Patrones de ficha de producto"
Cohesion: 0.21
Nodes (12): Category Breadcrumb, Product Image Panel with Zoom Affordance, Blurred Modal Backdrop, Product Detail Modal, Related Parts Grid (Repuestos Relacionados), Product Detail Desktop Screen, Zebra-Striped Technical Specs Table, Transactional Back Header (+4 more)

### Community 15 - "Patrones de navegación"
Cohesion: 0.23
Nodes (9): Catalogo(), Catálogo de productos (datos), filtrarProductos(), indice, normalizar(), ordenar(), PRODUCTOS, rangoAnios() (+1 more)

### Community 16 - "Generador de imágenes"
Cohesion: 0.22
Nodes (11): Scroll-Reactive Header Shadow, Desktop Top Navigation Bar, Mobile Bottom Navigation Bar, Compact Mobile Footer, Home / Catálogo Mobile Screen, Mobile Top App Bar, Alternating Two-Column Tab Panels, Tab Switching Script (+3 more)

### Community 17 - "Señalización de compatibilidad"
Cohesion: 0.24
Nodes (10): Compatibility Confirmation Panel, Traffic-Light Compatibility Signaling, Material 3 Color Role Palette, Primary Corporate Blue Token (#00357f), Desktop Product Card, Bento Product Grid, Ad-hoc Semantic Status Colors, Compact Mobile Product Card (+2 more)

### Community 18 - "Patrones de filtrado"
Cohesion: 0.29
Nodes (8): Active Filter Chip Row, Filter Sidebar (SideNavBar), Hero Section with Part Finder, Filter Bottom Sheet Drawer, Bottom Sheet Open/Close Script, Horizontal Snap-Scroll Filter Chips, Mobile Search and Vehicle Selector, Nuestra Historia Hero

### Community 19 - "Flujo de cotización WhatsApp"
Cohesion: 0.29
Nodes (7): Descarga vía JSON-RPC del método list_screens, Maqueta Detalle de Producto (desktop y mobile), Maqueta Home / Catálogo (desktop y mobile), Maqueta Nosotros (mobile y desktop mejorado), Servidor MCP de Stitch con referencia de esquema rota, screens.json (índice de pantallas de Stitch), Exportación de pantallas de Stitch

### Community 20 - "Tipografía Hanken y JetBrains"
Cohesion: 0.33
Nodes (6): design_autopartesrg_sistema_de_diseno, design_material_symbols_subconjunto, design_paleta_material_3, Las maquetas exportadas no son código de producción, design_tipografia_hanken_jetbrains, readme_contacto_ts

### Community 21 - "Subconjunto de iconos"
Cohesion: 0.40
Nodes (6): WhatsApp-First Quoting Flow, Pre-filled WhatsApp Message Preview, Cotizar por WhatsApp CTA (Desktop), Fixed Bottom Action Bar, Quote-on-Request Card Variant, Tertiary Amber Accent Token

### Community 22 - "Imagen Open Graph"
Cohesion: 0.33
Nodes (4): next/og, alt, contentType, size

### Community 23 - "Reglas de agente Next.js"
Cohesion: 0.40
Nodes (5): Hanken Grotesk Display/Body Typeface, JetBrains Mono Technical Label Typeface, Monospace Technical Labeling Convention, Type Scale (display-lg to label-sm), Mobile Historia Hero

### Community 24 - "Botón flotante de WhatsApp"
Cohesion: 0.40
Nodes (4): eslintConfig, eslint/config, eslint-config-next/core-web-vitals, eslint-config-next/typescript

### Community 25 - "Configuración de ESLint"
Cohesion: 0.50
Nodes (4): generate-agent-files.js (regenerador del bloque de reglas), Reglas de agente para Next.js (nextjs-agent-rules), CLAUDE.md (delegación a AGENTS.md), readme_stack_nextjs_16

### Community 26 - "Configuración de Next.js"
Cohesion: 1.00
Nodes (3): Floating WhatsApp Button (Desktop), WhatsApp Brand Green (#25D366), WhatsApp FAB with Inline Brand SVG

## Ambiguous Edges - Review These
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
- **138 isolated node(s):** `eslintConfig`, `CABECERAS_SEGURIDAD`, `nextConfig`, `name`, `version` (+133 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

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
- **What is the exact relationship between `Vehicle Fitment / Compatibility System` and `Floating WhatsApp Contact Button`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._