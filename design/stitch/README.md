# Pantallas de Stitch

Exportación del proyecto de Stitch **AutopartesRG Digital Catalog**
(`projects/1460787968701154207`). Material de referencia de diseño: no forma
parte de la compilación de la aplicación.

Descargado el 2026-08-06 desde el servidor MCP de Stitch
(`https://stitch.googleapis.com/mcp`), método `list_screens`.

## Contenido

| Pantalla | Dispositivo | Tamaño | Captura | Código |
|---|---|---|---|---|
| Home / Catálogo (Desktop) | Desktop | 2560x3632 | `screenshots/home-catalogo-desktop.png` | `html/home-catalogo-desktop.html` |
| Home / Catálogo (Mobile) | Mobile | 780x2338 | `screenshots/home-catalogo-mobile.png` | `html/home-catalogo-mobile.html` |
| Nosotros (Mobile) | Mobile | 780x3102 | `screenshots/nosotros-mobile.png` | `html/nosotros-mobile.html` |
| Nosotros (Desktop) - Mejorado | Desktop | 2560x2268 | `screenshots/nosotros-desktop-mejorado.png` | `html/nosotros-desktop-mejorado.html` |
| Detalle de Producto (Desktop) | Desktop | 2560x2048 | `screenshots/detalle-de-producto-desktop.png` | `html/detalle-de-producto-desktop.html` |
| Detalle de Producto (Mobile) | Mobile | 780x2048 | `screenshots/detalle-de-producto-mobile.png` | `html/detalle-de-producto-mobile.html` |

`screens.json` guarda el índice con los identificadores de Stitch de cada pantalla.

La pantalla "Nosotros (Desktop) - Mejorado" no venía en la lista pedida, pero
existe en el proyecto y se descargó junto al resto.

## Sobre el código exportado

Los HTML son maquetas estáticas de una sola página, no componentes de producción:

- Tailwind por CDN (`cdn.tailwindcss.com`), configurado en línea con un `<script>`.
- Paleta de tokens **Material 3** (`primary`, `surface-container`, `on-surface-variant`…),
  con azul primario `#004aad` y tinte `#215abd`.
- Tipografía **Hanken Grotesk** + **JetBrains Mono**.
- Iconografía **Material Symbols Outlined**.
- Imágenes enlazadas a URLs remotas de Google.
- Precios de ejemplo en MXN.

Sirven como referencia de composición y contenido. Para llevarlos a la aplicación
hay que traducirlos al sistema de tokens y de componentes de este repositorio
(ver `DESIGN.md`), no copiarlos tal cual.

## Cómo volver a descargarlos

El servidor MCP de Stitch está registrado en la configuración local del proyecto,
pero el cliente no puede cargar sus herramientas: el esquema del servidor tiene una
referencia rota (`can't resolve reference #/$defs/ScreenInstance from id #`). Hasta
que Google lo corrija, la vía es hablar JSON-RPC directamente contra el endpoint:

```bash
curl -sS -X POST https://stitch.googleapis.com/mcp \
  -H "X-Goog-Api-Key: $STITCH_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{
        "name":"list_screens",
        "arguments":{"projectId":"1460787968701154207"}}}'
```

La respuesta trae, por pantalla, un `screenshot.downloadUrl` (PNG) y un
`htmlCode.downloadUrl` (HTML), ambos descargables con `curl -L`.
