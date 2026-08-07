# AutopartesRG · Decisiones de diseño

El sitio implementa el proyecto de Stitch **AutopartesRG Digital Catalog**
(`projects/1460787968701154207`). Las maquetas de referencia, con capturas y el
HTML exportado, están en [`design/stitch/`](./design/stitch/README.md).

Este documento recoge el sistema replicado y, al final, las desviaciones
deliberadas respecto a las maquetas y por qué.

---

## 1. Sistema de color

Paleta Material 3 en tema claro, con los mismos nombres de token que usa Stitch
para que el marcado se traduzca uno a uno. Definida en `src/app/globals.css`.

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#00357f` | Texto de marca, enlaces, estados activos |
| `on-primary` | `#ffffff` | Texto sobre primary |
| `primary-container` | `#004aad` | Chips de filtro activo, grupos aplicados |
| `on-primary-container` | `#a9c1ff` | Texto sobre primary-container |
| `primary-fixed` / `-dim` | `#d9e2ff` / `#b0c6ff` | Callout de compatibilidad, fondos de icono |
| `background` / `surface` | `#f9f9fc` | Fondo de página |
| `surface-container-lowest` | `#ffffff` | Tarjetas, barra superior, ficha |
| `surface-container-low` | `#f3f3f6` | Panel de filtros, franjas alternas |
| `surface-container` / `-high` / `-highest` | `#eeeef0` / `#e8e8ea` / `#e2e2e5` | Píldoras, footer, fondo de imagen |
| `on-surface` | `#1a1c1e` | Texto principal |
| `on-surface-variant` | `#434653` | Texto de apoyo |
| `outline` / `outline-variant` | `#737784` / `#c3c6d5` | Bordes y divisores |
| `accent` | `#ff6f00` | CTA de búsqueda del hero |
| `on-tertiary-container` | `#ffb159` | CTA de cotización de la ficha |
| `wa` | `#25d366` | Botón flotante de WhatsApp |

Contrastes verificados sobre fondo claro: `primary` 12.9:1, `on-surface-variant`
8.7:1, `on-primary-container` sobre `primary-container` 5.6:1.

## 2. Tipografía

Las dos familias del proyecto de Stitch, cargadas con `next/font/google`
(autohospedadas, `display: swap`, sin `<link>` a Google):

- **Hanken Grotesk**: titulares y cuerpo.
- **JetBrains Mono**: todo lo que Stitch marca como `label-technical`, es decir
  navegación, números OEM, especificaciones, chips y cifras tabulares.

Escala exacta de Stitch, expuesta como utilidades de Tailwind:

| Utilidad | Tamaño | Interlineado | Peso |
|---|---|---|---|
| `text-display-lg` | 48px | 56px | 700, tracking -0.02em |
| `text-headline-lg` | 32px | 40px | 600 |
| `text-headline-lg-mobile` | 24px | 32px | 600 |
| `text-headline-md` | 20px | 28px | 600 |
| `text-body-lg` | 18px | 28px | 400 |
| `text-body-md` | 16px | 24px | 400 |
| `text-label-technical` | 14px | 20px | 500, tracking 0.02em |
| `text-label-sm` | 12px | 16px | 500 |

## 3. Espaciado, forma y elevación

- Escala de Stitch como utilidades: `xs` 4, `sm` 8, `md` 16, `lg` 24, `xl` 40.
  Se usan directamente (`p-md`, `gap-lg`, `py-xl`).
- Contenedor `max-w-7xl` (1280px), el `container-max` de las maquetas.
- Radios: `rounded` 4px (controles y etiquetas), `rounded-lg` 8px (tarjetas,
  botones, campos), `rounded-xl` 12px (paneles y ficha), `rounded-full` (chips).
- Elevación en tres niveles: plano, `shadow-sm` en tarjetas y barra superior,
  `shadow-2xl` en la ficha técnica.

## 4. Iconografía

**Material Symbols Outlined**, la familia de las maquetas. La fuente completa
pesa varios megabytes, así que `scripts/descargar-iconos.mjs` descarga un
subconjunto con los 39 glifos que usa el sitio (39 KB) y lo autohospeda en
`src/app/fonts/`. El componente `Icon` expone los nombres como unión de tipos,
de modo que un glifo fuera del subconjunto no compila.

Al añadir un icono: incorporarlo a la lista del script y al tipo `IconName`, y
ejecutar `npm run iconos`.

## 5. Estructura

La landing (hero y catálogo), la ficha técnica en diálogo, y Nosotros en ruta aparte:

1. **Barra superior fija**. Logotipo `build_circle`, navegación monoespaciada en
   versalitas con subrayado en la sección visible (scroll-spy), submenú de
   Nosotros y buscador en píldora. En móvil: marca y buscador desplegable; la
   navegación vive en la barra inferior, no se duplica en el encabezado.
2. **Hero**. Imagen a sangre con degradado, titular `display-lg`, y tarjeta
   blanca con buscador, campo de modelo y CTA naranja.
3. **Catálogo**. Barra lateral de filtros plegables, pegajosa en escritorio con
   desplazamiento propio y barra visible, y hoja inferior en móvil; chips de
   filtros activos; grid de 3 columnas (2 en móvil) con categoría en versalitas,
   nombre, número OEM, franja de compatibilidad y "Ver ficha".
4. **Ficha técnica**. Cabecera "Ficha Técnica de Autoparte", galería a la
   izquierda, migas, título, píldora con el número OEM, callout de compatibilidad,
   tabla de especificaciones con filas alternas, CTA de WhatsApp con
   vista previa editable del mensaje y repuestos relacionados.
5. **Nosotros**. En su propia ruta `/nosotros`, fuera de la landing: cabecera con
   imagen, tres tarjetas de valores con icono, y pestañas Visión / Misión /
   Sobre nosotros con imagen alternada.
6. **Footer**. Cuatro bloques: identidad con llamada a WhatsApp y redes,
   Navegación, atajos de Catálogo y Contacto (teléfono, correo y cobertura).
   Cierra con una franja de copyright y aviso de compatibilidad. Sin dirección
   postal ni horario: el comercio no tiene punto de venta físico y la
   disponibilidad se confirma por WhatsApp.
7. **Barra inferior** en móvil y **botón flotante de WhatsApp**.

## 6. Tratamientos tipográficos

Sobre la escala de Stitch, dos recursos dan el registro técnico y sobrio:

- **`.display-tight`**: titulares de display con `letter-spacing: -0.035em`. El
  bloque pesa más y se lee como una unidad.
- **`.eyebrow`**: etiqueta de sección monoespaciada, en versalitas, con
  `letter-spacing: 0.18em` y una regla corta delante que la ancla a la retícula.

Además, todo lo que es dato de máquina va en JetBrains Mono con versalitas y
tracking amplio: navegación, categoría de la tarjeta, números OEM, encabezados
del footer, pestañas de Nosotros y etiquetas de los grupos de filtros. El texto
de lectura se queda en Hanken Grotesk.

## 7. Movimiento

Sin librería de animación: 0 KB de JavaScript dedicado a motion. Todo es CSS,
y todo vive dentro de `@media (prefers-reduced-motion: no-preference)`, así que
con movimiento reducido la interfaz queda estática y completa.

| Efecto | Cómo | Para qué |
|---|---|---|
| Entrada del hero | `@keyframes subir` con desfase de 60 a 300ms por elemento | Ordena la lectura: etiqueta, titular, subtítulo, buscador |
| Barrido de luz del hero | `@keyframes barrido`, una sola pasada | Da materialidad a la superficie, sin bucle |
| Progreso de lectura | `animation-timeline: scroll(root block)` | Sitúa al usuario en una página larga, sin listeners de scroll |
| Aparición de tarjetas | `animation-timeline: view()` por tarjeta | Cada una entra al asomar, en vez de todas a la vez |
| Hover de tarjeta | Borde con degradado enmascarado, elevación de 4px, imagen a 1.07, pie relleno | Señala el objetivo y anticipa la acción |
| Pestañas de Nosotros | Indicador que se despliega desde el centro | Continuidad entre pestañas |
| Chip de filtro | Aspa que gira 90 grados y vira a color de error | Anticipa que la píldora elimina el filtro |

**Trampa de Tailwind v4:** las utilidades `translate-*`, `scale-*` y `rotate-*`
emiten las propiedades CSS independientes `translate`, `scale` y `rotate`, no un
`transform` compuesto. Una transición declarada sobre `transform` **no las
interpola**: hay que nombrarlas (`transition-[box-shadow,translate]`) o usar
`transition-transform`, que en v4 ya cubre las cuatro.

---

## 8. Desviaciones respecto a las maquetas, y por qué

| Maqueta | Implementación | Motivo |
|---|---|---|
| Precios y moneda (`$2,850.00 MXN / pza`, filtro de rango, orden por precio) | El catálogo no publica importes en ninguna parte | Decisión de negocio: la cotización se resuelve por WhatsApp |
| Etiquetas de condición (`NUEVO`, `REMANUFACTURADO`) y de stock (`En Stock (3 unidades)`, `Bajo pedido`) | Eliminadas de tarjeta, ficha y filtros | Sin un sistema de inventario detrás, publicarlas sería prometer algo que no se puede sostener. Se confirman por WhatsApp |
| Filtros de Condición y Disponibilidad en el panel lateral | Eliminados; quedan Modelo/Año, Marca, Categoría y Sección | Filtran por datos que el catálogo ya no publica |
| Carrito e icono de carrito | No existen | Excluido expresamente del encargo |
| `account_circle`, "Mi Garaje", "Cuenta" | Sustituidos por Nosotros y Contacto en la barra inferior | Dependen de un sistema de cuentas que el sitio no tiene; dejarlos sería un control muerto |
| Botón "Añadir" en las tarjetas móviles | "Ver detalle" | Es la acción de carrito |
| CTA del hero `#ff6f00` con texto blanco | Mismo naranja con texto `#2c1700` | Blanco sobre ese naranja da 2.7:1 y no pasa AA. El texto oscuro da 5.9:1 y es el mismo tratamiento que Stitch ya aplica al CTA de la ficha |
| Badge "Nuevo" `#2e7d32` sobre `#e8f5e9` | `#1b5e20` sobre el mismo fondo | 4.06:1 no basta para texto de 10px; el tono oscurecido da 6.2:1 |
| Badge "Remanufacturado" `#e65100` | `#bf360c` | Mismo motivo, pasa de 4.06:1 a 6.1:1 |
| Campo "VIN / Chasis" en el hero | Campo "Modelo (opcional)" | El VIN no filtra nada en el catálogo; el modelo sí, y conserva la composición de dos campos |
| "Añadir Vehículo" en móvil | Selector de orden junto a "Filtrar" | Misma razón |
| Nosotros como página aparte | Sección anclada de la misma página | El encargo pide una landing única con Nosotros en pestañas |
| Ficha móvil como página con barra de acción fija | Diálogo a pantalla completa | El encargo admite modal o página; el modal conserva el estado del catálogo detrás |
| Filas de la ficha móvil con datos inventados (diámetro, espesor) | Especificaciones derivadas de los datos reales del producto | No inventar precisión técnica que el catálogo no tiene |
| Imágenes de producto y de bodega | Marcadores de posición SVG de marca | No hay fotografía real todavía. Ver el README para sustituirlas |
| Tema claro y oscuro | Solo claro | Stitch define únicamente tokens de tema claro |
| Dirección postal en el footer y `PostalAddress` en los datos estructurados | Eliminada; en su lugar, cobertura de despacho y `areaServed` | El comercio no tiene sede física. Declarar una dirección falsa es motivo de acción manual por spam de datos estructurados |
| Horario de atención en el footer y `openingHours` en el marcado | Eliminados | El sitio no publica horario; la atención se resuelve por WhatsApp |
| Píldora `SKU:` junto al OEM en la ficha | Eliminada; solo queda el OEM | Sin base de datos de inventario, un código interno no identifica nada. El OEM sí es universal y le sirve a quien ya lo tiene |
| Enlaces a Términos y Condiciones y Política de Privacidad | Eliminados del footer | Apuntaban a un ancla vacía; enlazar a páginas inexistentes perjudica más que ayuda |
| Dos modelos de navegación móvil (barra inferior en Home, hamburguesa en Nosotros) | Solo barra inferior | Montar los dos deja cuatro destinos duplicados en la misma pantalla |
| Colores de estado sueltos y distintos por pantalla (`#2e7d32` vs `#10b981`, `#fbc02d` vs `#f59e0b`) | Tokens `ok` / `warn` únicos | Las maquetas se contradicen entre sí; un solo par de tokens mantiene la lectura constante |
| CTA "Cotizar" ámbar en escritorio y verde en móvil | Ámbar en las dos anchuras | Es el mismo componente responsive; cambiar de color por breakpoint desorienta |
