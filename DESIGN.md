# Autopartes ERG · Decisiones de diseño

El sitio implementa el proyecto de Stitch **Autopartes ERG Digital Catalog**
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
| `outline` / `outline-variant` | `#737784` / `#c3c6d5` | Divisores decorativos |
| `borde-campo` | `#7d8aa6` | Contorno de control de formulario |
| `accent` | `#ff6f00` | CTA de búsqueda del hero |
| `on-tertiary-container` | `#ffb159` | CTA de cotización de la ficha |
| `wa` / `on-wa` | `#25d366` / `#10281a` | Botón flotante y CTA de WhatsApp |
| `panel` / `panel-borde` | `#eef3fc` / `#c3d4f0` | Superficie de las zonas de herramienta |
| `on-panel-suave` | `#3f5680` | Texto de apoyo sobre el panel |

### Zonas de color

El azul separa **acción** de **contenido**. Las tarjetas del catálogo viven sobre
el lienzo neutro; todo lo que sirve para manipularlas se tiñe:

| Zona | Tratamiento |
|---|---|
| Cabecera del panel de filtros | `primary` sólido con texto blanco |
| Cuerpo del panel | `panel`, con los campos en blanco para que el control resalte |
| Banda de buscador y orden | `panel` con borde `panel-borde` |
| Footer | Fondo blanco con tipografía azul; franja de cierre en `panel` |

**El sitio se mantiene en claro de principio a fin.** Se probó un footer en azul
profundo y se descartó: el logotipo lleva la sigla y el eslogan en gris oscuro,
así que sobre fondo profundo exigía una placa blanca que lo recortaba del resto
de la composición. En claro se apoya directo sobre el fondo.

Contrastes verificados: cabecera del panel 11.6:1, texto de apoyo sobre panel
6.6:1, encabezados del footer 11.6:1, datos de contacto 14.2:1, enlaces 7.4:1 y
el aviso de la franja de cierre 6.6:1. Todos por encima de AA.

Las etiquetas de 10px y el aviso de 11px van **sin opacidad**: atenuarlos los
dejaba en 3.98:1 y 4.45:1, y el umbral de 3:1 solo vale para texto grande.

Contrastes verificados sobre fondo claro: `primary` 12.9:1, `on-surface-variant`
8.7:1, `on-primary-container` sobre `primary-container` 5.6:1.

**Dos pares que no cumplían y ya cumplen:**

- **Texto sobre el verde de WhatsApp.** Blanco daba 1.98:1. Se aplica el mismo
  criterio que al naranja del hero (§9): conservar el color de marca y oscurecer
  el texto. `on-wa` pasa a `#10281a` y el par sube a **7.9:1**. La alternativa
  era oscurecer el verde hasta `#075e54`, y entonces deja de leerse como
  WhatsApp.
- **Contorno de los campos.** `outline-variant` daba 1.70:1 y `panel-borde`
  1.50:1, contra el mínimo de 3:1 de WCAG 1.4.11. Un divisor decorativo está
  exento, pero el borde de un campo no: el relleno contra su entorno es 1.03:1,
  así que el borde es lo único que identifica el control. El token
  `borde-campo` cumple en las tres superficies donde hay campos: **3.47:1**
  sobre blanco, **3.11:1** sobre `panel` y **3.13:1** sobre
  `surface-container-low`.

Los quince pares se comprueban solos en cada `npm run responsive:auditar`,
leyendo los tokens de `globals.css` en vez de una copia.

## 2. Tipografía

Las dos familias del proyecto de Stitch, cargadas con `next/font/google`
(autohospedadas, `display: swap`, sin `<link>` a Google):

- **Hanken Grotesk**: titulares y cuerpo.
- **JetBrains Mono**: todo lo que Stitch marca como `label-technical`, es decir
  navegación, números OEM, especificaciones, chips y cifras tabulares.

Escala de Stitch, expuesta como utilidades de Tailwind. **Los titulares son
fluidos**: interpolan con `clamp()` entre 360px y 1280px de viewport, así que
no hay ninguna anchura intermedia donde el titular quede desproporcionado. Los
tamaños de Stitch son el extremo de escritorio.

| Utilidad | Móvil (360px) | Escritorio (≥1280px) | Interlineado | Peso |
|---|---|---|---|---|
| `text-display-lg` | 32px | 48px | 1.1 | 700, tracking -0.02em |
| `text-headline-lg` | 24px | 32px | 1.25 | 600 |
| `text-headline-md` | 18px | 20px | 1.4 | 600 |
| `text-body-lg` | 16px | 18px | 1.55 | 400 |
| `text-body-md` | 16px | 16px | 24px | 400 |
| `text-label-technical` | 14px | 14px | 20px | 500, tracking 0.02em |
| `text-label-sm` | 12px | 12px | 16px | 500 |

**Solo escala el tramo de titulares.** El texto de lectura (`body`, `label`) se
queda fijo a propósito: 16px es cómodo en cualquier anchura, y hacerlo crecer
con el viewport alarga la medida de línea justo donde ya es más larga. El
interlineado de lo fluido va en razón y no en píxeles, para que acompañe al
tamaño.

Ya no hay `text-headline-lg-mobile`: existía para emparejarlo con
`md:text-headline-lg` y saltar de 24 a 32px en el punto de corte. Con la escala
fluida ese salto lo hace `text-headline-lg` sola.

## 3. Espaciado, forma y elevación

- Escala de Stitch como utilidades: `xs` 4, `sm` 8, `md` 16, `lg` 24, `xl` 40.
  Se usan directamente (`p-md`, `gap-lg`, `py-xl`).
- Contenedor: utilidad `contenedor` (`margin-inline: auto`, `--ancho-contenido`
  de anchura máxima, `--gutter` de margen lateral). Sustituye al trío repetido
  `mx-auto max-w-7xl px-md md:px-xl`. Ver §8.
- Radios: `rounded` 4px (controles y etiquetas), `rounded-lg` 8px (tarjetas,
  botones, campos), `rounded-xl` 12px (paneles y ficha), `rounded-full` (chips).
  Fuera de esa escala no hay nada.
- **Elevación en tres niveles**, y ahora de verdad: esta sección afirmaba tres y
  había ocho sombras distintas, cinco de la escala de fábrica de Tailwind y tres
  escritas a mano.

  | Token | Para qué |
  |---|---|
  | `shadow-e1` | Reposo: tarjetas, barra superior, panel de filtros |
  | `shadow-e2` | Algo se ha levantado: hover, menús, botón flotante |
  | `shadow-e3` | Capa superior: diálogos |
  | `shadow-realce` | No es un nivel: el resplandor azul del hover de tarjeta |

  Van teñidas del azul de marca en vez de negro puro. Sobre un lienzo `#f9f9fc`
  una sombra negra se lee gris sucio; con el tinte de `primary` la penumbra
  pertenece a la misma familia que el resto de la paleta.

## 4. Iconografía

**Material Symbols Outlined**, la familia de las maquetas. La fuente completa
pesa varios megabytes, así que `scripts/descargar-iconos.mjs` descarga un
subconjunto con los 29 glifos que usa el sitio (**5,9 KB**) y lo autohospeda en
`src/app/fonts/`.

Los 5,9 KB salen de pedir solo el eje que el sitio mueve. Material Symbols tiene
cuatro (`opsz`, `wght`, `FILL`, `GRAD`) y el subconjunto los pedía todos en su
rango completo: cada glifo viajaba con los deltas de interpolación de los cuatro
y el fichero pesaba **33,2 KB**. Pero `globals.css` fija `wght 400`, `GRAD 0` y
`opsz 24`, y lo único que varía es `FILL`, que la clase `.filled` lleva a 1.
Fijando los tres ejes muertos el mismo subconjunto baja un 82 % con idéntico
aspecto.

Al tocar el peso o el tamaño óptico hay que ampliar el rango en el script **y**
en `globals.css`: pedir un eje sin usarlo solo engorda el fichero, y usarlo sin
pedirlo no hace nada. El componente `Icon` expone los nombres como unión de tipos,
de modo que un glifo fuera del subconjunto no compila.

Al añadir un icono: incorporarlo a la lista del script y al tipo `IconName`, y
ejecutar `npm run iconos`.

**Tamaños**: `16` en texto corrido y etiquetas, `18` en controles compactos,
`20` en controles estándar y campos, `24` en cabeceras y navegación, `28` solo
ilustrativo. El tipo `IconSize` es una unión de literales, igual que `IconName`,
así que un tamaño fuera de escala no compila. Había nueve valores distintos
elegidos a ojo (13, 15, 16, 18, 20, 22, 24, 26 y 28), y eso rompe el ritmo
visual aunque cada uno por separado parezca razonable.

## 5. Estructura

La landing (hero y catálogo), la ficha técnica en diálogo, y Nosotros en ruta aparte:

1. **Barra superior fija** (64px hasta `lg`, 76px a partir de ahí; el alto vive
   en `--alto-cabecera`). Logotipo de la empresa (`public/logo.png`), navegación
   monoespaciada en versalitas con subrayado en la sección visible (scroll-spy),
   submenú de Nosotros y buscador en píldora. Por debajo de `lg`: marca y
   buscador desplegable; la navegación vive en la barra inferior, no se duplica
   en el encabezado.
2. **Hero**. Imagen a sangre con degradado, titular `display-lg`, y tarjeta
   blanca con buscador, campo de modelo y CTA naranja.
3. **Catálogo**. Barra lateral de filtros plegables a partir de `lg`, pegajosa,
   con desplazamiento propio y barra visible; hoja inferior por debajo de ahí.
   Chips de filtros activos y retícula auto-ajustable (dos columnas fijas en
   móvil) con categoría en versalitas, nombre, número OEM, franja de
   compatibilidad y "Ver ficha".
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

Sin librería de animación: 0 KB de JavaScript dedicado a motion. Todo es CSS.

### Tokens

El movimiento era el único eje del sistema sin tokens: tres curvas escritas a
mano repetidas en seis sitios y once duraciones distintas, incluida una de 600ms
en el hover más frecuente del sitio.

| Token | Valor | Para qué |
|---|---|---|
| `--ease-salida` | `cubic-bezier(0.23, 1, 0.32, 1)` | Entradas y salidas. Arranca rápido, que es lo que hace que la interfaz se sienta obediente |
| `--ease-mov` | `cubic-bezier(0.77, 0, 0.175, 1)` | Algo que ya está en pantalla y se desplaza |
| `--ease-cajon` | `cubic-bezier(0.32, 0.72, 0, 1)` | Hojas y cajones |
| `--dur-toque` | 120ms | Respuesta a una pulsación |
| `--dur-rapida` | 180ms | Hover, color, foco |
| `--dur-media` | 240ms | Entrada de diálogos y menús |
| `--dur-panel` | 320ms | Hojas, cajones, despliegues |
| `--dur-salida` | 160ms | Cualquier salida |

`--ease-*` es namespace de tema de Tailwind v4, así que cada curva genera además
su utilidad (`ease-salida`). `--default-transition-timing-function` apunta a
`--ease-salida`, de modo que un `transition-colors` suelto ya cae en el ritmo
del sitio sin declarar nada.

**Nada de interfaz pasa de 300ms** y **las salidas van más cortas que las
entradas**: entrando, el movimiento explica de dónde sale algo y merece tiempo;
saliendo solo retrasa volver a lo de antes.

### Qué se mueve y por qué

| Efecto | Cómo | Para qué |
|---|---|---|
| Entrada del hero | `@keyframes subir`, 460ms con desfase de 40 a 220ms | Ordena la lectura: etiqueta, titular, subtítulo, buscador |
| Barrido de luz del hero | `@keyframes barrido` lineal, una sola pasada | Da materialidad a la superficie, sin bucle |
| Progreso de lectura | `animation-timeline: scroll(root block)` | Sitúa al usuario en una página larga, sin listeners de scroll |
| Aparición de tarjetas | `animation-timeline: view()` por tarjeta | Cada una entra al asomar, en vez de todas a la vez |
| Hover de tarjeta | Borde con degradado enmascarado, elevación de 4px, imagen a 1.07, pie relleno | Señala el objetivo y anticipa la acción |
| Grupos de filtros | Retícula de `0fr` a `1fr` | Antes el panel se teletransportaba y empujaba todo de golpe |
| Buscador móvil | La misma retícula | Antes aparecía de la nada y desplazaba la página |
| Diálogos | Transición con `@starting-style` y `allow-discrete` | Entran **y salen**; con keyframes el cierre era instantáneo |
| Submenú de Nosotros | `visibility` dentro de la lista de transición | Sin ella tenía entrada pero no salida |
| Chip de filtro | Aspa que gira 90 grados, y encoge al quitarlo | Anticipa que la píldora elimina el filtro, y la vista sigue el hueco |
| Contador de resultados | La cifra entra con `key` | El 22 pasaba a 3 sin que nada lo señalara |
| Botón flotante | Se desvanece si tapa un control | Ver §8 |

### Movimiento reducido

Reducir no es apagar: se conservan color, opacidad y sombra, que explican lo que
está pasando, y se elimina el desplazamiento, que es lo que marea.

El reparto se hace con el variante `motion-safe:` en el marcado, no con una
regla global. **Si el movimiento adorna, va supeditado; si el movimiento es el
dato, se queda.** Se intentó primero con `* { translate: none !important }` y
era demasiado bruto: también anulaba el `scale-x` del indicador de pestañas, que
habría aparecido bajo las tres a la vez.

Antes solo estaban cubiertas las animaciones por keyframes, porque vivían dentro
de `no-preference`. Las transiciones de hover no, y con la preferencia activa el
hover de tarjeta seguía dando `translate: 0 -4px`.

### La latencia también es movimiento

El catálogo forzaba un skeleton de 260ms en cada cambio de filtro sobre datos
que se filtran en menos de 1ms. Medido, del clic en una casilla a la retícula
quieta pasaban **842ms**; ahora son **177ms**. El estado de carga es ahora
derivado del antirrebote del buscador, que es lo único que de verdad está
pendiente. `GridSkeleton` sigue en el kit, listo para cuando
`src/lib/productos.ts` lea de una API.

**Trampa de Tailwind v4:** las utilidades `translate-*`, `scale-*` y `rotate-*`
emiten las propiedades CSS independientes `translate`, `scale` y `rotate`, no un
`transform` compuesto. Una transición declarada sobre `transform` **no las
interpola**: hay que nombrarlas (`transition-[box-shadow,translate]`) o usar
`transition-transform`, que en v4 ya cubre las cuatro.

## 8. Responsive

El principio: **que el layout dependa del espacio disponible, no de una lista de
anchuras de pantalla**. Los puntos de corte se reservan para lo que de verdad
cambia de forma; lo que solo cambia de tamaño interpola.

### Puntos de corte

A los cuatro de Tailwind se añaden dos, declarados en `@theme`:

| Corte | Anchura | Para qué |
|---|---|---|
| `xs` | 416px | Móvil pequeño: buscador del hero en dos columnas, pestañas de Nosotros a tamaño normal |
| `sm` | 640px | La retícula de tarjetas pasa de dos columnas fijas a auto-ajustable |
| `md` | 768px | Repuestos relacionados de carrusel a retícula |
| `lg` | 1024px | **Corte estructural**: barra lateral de filtros, navegación superior, se retira la barra inferior |
| `xl` | 1280px | Buscador de la cabecera en línea |
| `2xl` | 1536px | El contenido crece a 1408px; sube el mínimo de la tarjeta |
| `3xl` | 1920px | El contenido crece a 1536px; el hero gana altura |

**El corte estructural es `lg`, no `md`.** La tableta en vertical (768px) no
tiene sitio para los 288px de la barra lateral más una retícula de tarjetas
legible: salían columnas de unos 200px. Hasta `lg` se usa el patrón móvil
completo, hoja inferior de filtros y barra de navegación inferior incluidas.

### Lo que interpola en vez de saltar

| Qué | Cómo |
|---|---|
| Titulares | `clamp()` entre 360 y 1280px, ver §2 |
| Margen lateral | `--gutter`: 16px → 40px |
| Anchura del contenido | `--ancho-contenido`: 1280 → 1408 → 1536px |
| Alto del hero | `clamp()` por anchura, con tope de `70svh` |
| Celda de la retícula técnica | 36 → 72px |
| Columnas del catálogo | `repeat(auto-fill, minmax(14rem, 1fr))` |

La retícula de tarjetas no declara un número de columnas por punto de corte:
las cuenta el navegador según el espacio real, que además depende de si la barra
lateral está montada. Con `lg:grid-cols-3` fijo, las mismas tres columnas tenían
que servir para 1024px y para 1920px.

### Consultas de contenedor

`ProductoCard` pregunta por **su propio ancho** (`@container`), no por el de la
ventana. Vive en una retícula auto-ajustable, así que la misma ventana de
1024px puede darle 300px o 500px según los filtros: preguntando por la ventana
solo acertaría en uno de los dos casos. De ahí dependen el tamaño del título,
el relleno y si se muestra la franja de compatibilidad.

### Métricas de layout

Cinco variables en `:root` (no en `@theme`, que no admite media queries) son la
única fuente de las medidas que se repiten:

| Variable | Qué gobierna |
|---|---|
| `--alto-cabecera` | Alto de la cabecera, relleno del `main` y `scroll-padding-top` |
| `--alto-barra-inferior` | Alto de la barra inferior, relleno del `body` y posición del FAB |
| `--gutter` | Margen lateral, desplazamiento de lo pegajoso, velos de los carriles |
| `--ancho-contenido` | Anchura máxima del contenido y de la ficha técnica |
| `--tamano-fab` | Tamaño del botón flotante y el hueco que se le reserva en el footer |

Antes cada una de estas medidas estaba escrita a mano en tres o cuatro sitios
con valores que ya no coincidían: `scroll-padding-top: 6rem` contra una cabecera
de 64/76px, o `top-28` contra `top-[76px]`.

### Área segura

`viewport-fit=cover` en `layout.tsx` es lo que hace que `env(safe-area-inset-*)`
devuelva algo distinto de cero. Sin él, el relleno de área segura de la barra
inferior no se aplicaba y en un iPhone con indicador de inicio el último destino
quedaba debajo. El alto de la barra ya incluye el inset, y de ahí lo toman el
relleno del `body` y la posición del botón flotante.

### Nada se esconde en un carril invisible

Los chips de filtros activos y las pestañas de Nosotros se deslizaban en
horizontal con la barra oculta: en un móvil estrecho, lo que quedaba fuera del
borde no tenía **ninguna** señal de existir. Los chips ahora fluyen a varias
líneas y las pestañas reparten el ancho a partes iguales. Donde sí se conserva
el carril —repuestos relacionados en móvil— lleva un degradado en cada extremo
que se apaga al llegar al tope, con línea de tiempo de scroll nombrada.

### El flotante se aparta

El botón de WhatsApp vive fijo en la esquina inferior derecha, y en una pantalla
de 320px esa esquina son los últimos 48px del ancho útil: se montaba encima del
borde derecho del "Buscar" del hero, del "Filtrar" del catálogo y del "Cargar
más repuestos". Un botón de contacto no puede comerse una acción primaria.

Se retira cuando **tapa el centro de un control o un cuarto de su superficie**.
Los dos umbrales importan: con la regla ingenua de «cualquier solape», sobre la
retícula de tarjetas el botón siempre pisa la esquina de algún "Ver ficha" y
acababa parpadeando la mitad del recorrido. Rozar una esquina no impide pulsar
nada; tapar el centro sí.

La comprobación es geométrica y no una lista de elementos concretos: muestrea
cinco puntos de su propia caja para encontrar candidatos y decide por área. Así
sigue funcionando cuando se añada un control nuevo. Al ocultarse solo cambia la
opacidad, nunca el tamaño: si encogiera, su caja mediría menos, dejaría de
detectar lo que hay debajo, volvería a aparecer y parpadearía sin fin.

### Red de seguridad

`overflow-x: clip` en el `body` (no `hidden`, que lo convertiría en contenedor
de scroll y rompería `position: sticky` de la cabecera y del panel de filtros) y
`max-width: 100%` en todo elemento sustituido.

Y una comprobación automática: `npm run responsive:auditar` abre el sitio en un
navegador real en catorce anchuras y falla si reaparece cualquiera de los fallos
descritos aquí. Ver el README.

---

## 9. Desviaciones respecto a las maquetas, y por qué

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
