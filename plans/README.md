# Plan de mejora: movimiento, diseño y dinamismo

Auditoría del 2026-08-19 sobre `2317862`. 17 hallazgos confirmados en navegador o
en el CSS compilado, agrupados en diez paquetes por orden de ejecución.

**Restricción del encargo:** conservar funcionalidad y diseño lo más parecido
posible. Nada de repintar la paleta ni reordenar pantallas; el objetivo es que lo
que ya existe se distribuya y se mueva mejor.

**Retirado de la auditoría:** el hallazgo M10 («movimiento en `hover:` sin
`@media (hover: hover)`») era falso. El variante `hover:` de Tailwind v4 ya
envuelve en `@media (hover:hover)`; se comprobó en el CSS compilado. Por eso no
se pudo reproducir el hover pegado en emulación.

| # | Paquete | Cubre | Estado |
|---|---|---|---|
| P1 | Tokens de movimiento | M9 | HECHO |
| P2 | Latencia de filtrado y entrada de tarjetas | M1 + hallazgo principal | HECHO |
| P3 | Movimiento reducido de verdad | M2 | HECHO |
| P4 | Transiciones que no tocan layout | M4, M5 | HECHO |
| P5 | Los diálogos y el submenú tienen salida | M6, M7 | HECHO |
| P6 | Duraciones dentro de presupuesto y feedback de pulsación | M3, M8, M11, M12 | HECHO |
| P7 | Contraste | D1, D2 | HECHO |
| P8 | Escalas de icono, elevación y radio | D3, D4, D6 | HECHO |
| P9 | Dinamismo nuevo | 4 oportunidades | HECHO (transiciones de ruta descartadas, ver abajo) |
| P10 | Documentación y verificación | D5 + DESIGN.md | HECHO |

Dependencias: P1 antes que P6 y P9 (ambos consumen los tokens). P8 antes que P10
(la documentación describe las escalas). El resto es independiente.

---

## P1 · Tokens de movimiento

**Hallazgo M9.** Tres curvas escritas a mano en seis sitios y once duraciones
distintas. Es el único eje del sistema sin tokens: color, tipografía y espaciado
sí los tienen.

Tailwind v4 expone `--ease-*` como namespace de tema, así que los tokens generan
utilidades (`ease-salida`) y sirven a la vez dentro de `globals.css`. Las
duraciones van en `:root` porque no hay namespace equivalente.

Curvas (valores del catálogo de auditoría, no aproximados):

```
--ease-salida:  cubic-bezier(0.23, 1, 0.32, 1)     entradas y salidas
--ease-mov:     cubic-bezier(0.77, 0, 0.175, 1)    movimiento en pantalla
--ease-cajon:   cubic-bezier(0.32, 0.72, 0, 1)     hojas y cajones
```

Duraciones: `--dur-toque` 120ms, `--dur-rapida` 180ms, `--dur-media` 240ms,
`--dur-panel` 320ms.

## P2 · Latencia de filtrado y entrada de tarjetas

**Hallazgo principal, medido: 842ms** del clic en un filtro a que la retícula
quede quieta, sobre datos que se filtran en menos de 1ms.

**Hallazgo M1.** `.card-in` (globals.css:800) y `.card-reveal` (:752) tienen la
misma especificidad y la primera va después, así que gana: la entrada por scroll
documentada nunca se ejecuta. Verificado: `animationTimeline: "auto"`.

Dos causas encadenadas, dos correcciones:

1. El `setTimeout(260)` de `Catalogo.tsx:63` añade latencia falsa a cada cambio
   de filtro. Se probó primero a armar el skeleton con un umbral de 300ms, y
   estaba mal pensado: sin nada asíncrono que lo apagara, el temporizador lo
   habría dejado encendido para siempre. Lo correcto es derivarlo de la única
   espera real que existe, el antirrebote del buscador. `GridSkeleton` se queda
   en el kit, sin usar y documentado, para cuando `productos.ts` lea de una API.
2. `.card-in` deja de competir con `.card-reveal`: la entrada por scroll pasa a
   ser la única en navegadores con `animation-timeline`, y la temporal queda como
   respaldo bajo `@supports not`.

## P3 · Movimiento reducido de verdad

**Hallazgo M2.** `prefers-reduced-motion: reduce` solo apaga el shimmer.
Verificado: con reduce activo el hover de tarjeta sigue dando `translate: 0 -4px`
y la imagen `scale: 1.069`.

Regla: bajo reduce se conservan color y opacidad, se elimina el desplazamiento.
No es apagarlo todo.

## P4 · Transiciones que no tocan layout

**M4:** `transition-all` en `FiltroSidebar.tsx:63`, `Navbar.tsx:177` y
`BottomNav.tsx:71`. En `BottomNav` anima `border-width`, que es layout.

**M5:** `transition-[width]` en `Footer.tsx:75` (subrayado del enlace) y
`Navbar.tsx:191` (buscador al enfocar). Ambas pasan a `transform`.

## P5 · Los diálogos y el submenú tienen salida

**M6:** el submenú de Nosotros (`Navbar.tsx:137`) no tiene salida porque
`visibility` no está en la lista de transición. Verificado:
`transitionProperty: "opacity, transform"`.

**M7:** los diálogos solo tienen entrada por keyframes. Pasan a transiciones con
`@starting-style` y `transition-behavior: allow-discrete`, que sí permiten
animar el cierre. La salida dura el 65% de la entrada.

## P6 · Duraciones y feedback de pulsación

**M3:** `duration-[600ms]` en el zoom de imagen de tarjeta, el hover más
frecuente del sitio. **M12:** `duration-500` en la ficha. **M8:** el shimmer usa
`ease-in-out` donde el movimiento constante pide `linear`. **M11:** el botón
flotante perdió el feedback de pulsación; se recupera escalando el SVG interior,
que no cambia la caja del enlace y por tanto no reactiva el bucle de medición.

## P7 · Contraste

**D1:** blanco sobre el verde de WhatsApp da **1,98:1**, falla AA. Se aplica el
mismo criterio ya documentado en `DESIGN.md §9` para el naranja del hero:
conservar el color de marca y oscurecer el texto. `on-wa` pasa a `#10281a`, un
verde muy oscuro en vez de un gris neutro para que el par siga perteneciendo a
la familia de la marca, y da **7,90:1**.

**D2:** los bordes de campo dan 1,70:1 (`outline-variant`) y 1,50:1
(`panel-borde`), contra el mínimo de 3:1 de WCAG 1.4.11. El relleno del campo
contra su entorno es 1,03:1, así que el borde es lo único que identifica el
control. Se separa en dos tokens: `outline-variant` y `panel-borde` siguen
siendo divisores decorativos, que WCAG exime, y el nuevo `borde-campo`
(`#7d8aa6`) es el contorno de control.

## P8 · Escalas de icono, elevación y radio

**D3:** nueve tamaños de icono (13, 15, 16, 18, 20, 22, 24, 26, 28).
**D4:** ocho elevaciones, cuando `DESIGN.md §3` afirma tres.
**D6:** `rounded-md` y `rounded-[3px]` fuera de la escala documentada.

## P9 · Dinamismo nuevo

Lo aditivo, que es lo que pide el encargo. Ninguna de estas animaciones bloquea
la interacción ni cambia lo que la pantalla hace:

- Grupos de filtros: despliegue con `grid-template-rows: 0fr → 1fr` en vez del
  atributo `hidden`, que teletransporta.
- Panel de búsqueda móvil: misma técnica, hoy da un salto de layout.
- Chips: salida con colapso al quitarlos, en vez de desaparecer de golpe.
- Contador de resultados: el número deja de saltar.
- ~~Navegación entre rutas con `<ViewTransition>`~~. **Descartado tras
  probarlo.** El bundler lo resuelve contra el React canary que vendoriza Next
  (19.3.0-canary, que sí lo exporta) y el build compila, pero `tsc` falla:
  `@types/react` de la 19.2.8 instalada no declara `unstable_ViewTransition`.
  Sacarlo adelante pedía un shim de tipos para un export inestable, cuyo nombre
  cambiará al estabilizarse, a cambio de un fundido entre dos rutas. No compensa.

## P10 · Documentación y verificación

`DESIGN.md §7` y `§8` recogen los tokens, las escalas y las reglas nuevas.
Verificación completa: `npm run responsive:auditar`, `tsc`, ESLint, build, y una
medición nueva de la latencia de filtrado para confirmar la mejora.


---

## Resultado

Ejecutado el 2026-08-19. Verificación de cada arreglo, no solo del build:

| Comprobación | Antes | Después |
|---|---|---|
| Clic en filtro → retícula quieta | **842 ms** | **177 ms** |
| Entrada de tarjeta por scroll | `animationTimeline: auto` (pisada) | `view()` |
| Hover de tarjeta con `reduce` | `translate: 0 -4px`, `scale: 1.069` | `none`, `none` |
| Indicador de pestañas con `reduce` | — | sigue funcionando (`1` / `0 1` / `0 1`) |
| Salida del submenú | `opacity, transform` | `opacity, translate, scale, visibility` |
| Salida de diálogos | ninguna | `opacity, translate, scale, overlay, display` |
| Texto sobre verde de WhatsApp | 1.98:1 | **7.90:1** |
| Contorno de campo sobre blanco | 1.70:1 | **3.47:1** |
| Tamaños de icono | 9 | 5, con el tipo cerrado |
| Elevaciones | 8 | 3 + realce |
| `transition-all` | 3 | 0 |
| Animación de propiedades de layout | 2 | 0 |
| Curvas escritas a mano | 3 en 6 sitios | 0, todas en tokens |

Además, la auditoría del repo gana una séptima comprobación: los quince pares de
contraste se miden leyendo los tokens de `globals.css`, así que el fallo del
verde de WhatsApp no puede repetirse sin que salte.
