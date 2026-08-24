/**
 * Descarga un subconjunto de Material Symbols Outlined con solo los iconos que
 * usa el sitio, y lo deja autoalojado en `src/app/fonts/`.
 *
 * La fuente completa pesa varios megabytes. La API de Google Fonts acepta el
 * parámetro `icon_names`, que devuelve un woff2 recortado a esos glifos.
 *
 * Uso:  node scripts/descargar-iconos.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const destino = join(raiz, "src", "app", "fonts");

/** Mantener ordenado y sin duplicados. Cada icono añade unos pocos cientos de bytes. */
export const ICONOS = [
  "account_tree",
  "arrow_forward",
  "build_circle",
  "calendar_today",
  "call",
  "category",
  "chat",
  "check",
  "check_circle",
  "chevron_right",
  "close",
  "directions_car",
  "edit",
  "expand_more",
  "forum",
  "history",
  "home",
  "insights",
  "inventory_2",
  "local_shipping",
  "mail",
  "precision_manufacturing",
  "refresh",
  "search",
  "settings_input_component",
  "storefront",
  "tune",
  "verified",
  "zoom_in",
].sort();

/**
 * Ejes de la fuente variable, y por qué están casi todos fijos.
 *
 * Material Symbols tiene cuatro ejes: `opsz`, `wght`, `FILL` y `GRAD`. Pedir el
 * rango completo de los cuatro obliga a que cada glifo viaje con los deltas de
 * interpolación de todos ellos, y eso cuesta caro: 33,2 KB para 29 iconos.
 *
 * El sitio solo mueve uno. `globals.css` fija `"wght" 400`, `"GRAD" 0` y
 * `"opsz" 24` en `.material-symbols-outlined`, y lo único que cambia es `FILL`,
 * que la clase `.filled` lleva a 1 para el icono de la pestaña activa y el de
 * compatibilidad confirmada.
 *
 * Fijando los tres ejes muertos el subconjunto baja a 5,9 KB. Mismo aspecto,
 * 27 KB menos en cada primera visita.
 *
 * Si algún día hace falta otro peso o tamaño óptico, hay que ampliar el rango
 * aquí **y** en `globals.css`: pedir el eje sin usarlo solo engorda el fichero,
 * y usarlo sin pedirlo no hace nada.
 */
const EJES = "opsz,wght,FILL,GRAD@24,400,0..1,0";

const url =
  `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:${EJES}` +
  `&icon_names=${ICONOS.join(",")}`;

// Sin User-Agent moderno, Google devuelve formatos antiguos en vez de woff2.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

const css = await fetch(url, { headers: { "User-Agent": UA } }).then((r) => {
  if (!r.ok) throw new Error(`Google Fonts respondió ${r.status}`);
  return r.text();
});

// La URL del subset no termina en .woff2, así que se localiza por su `format`.
const fuente = css.match(/url\((https:[^)]+)\)\s*format\('woff2'\)/);
if (!fuente) throw new Error(`No se encontró un woff2 en la respuesta:\n${css.slice(0, 500)}`);

const binario = await fetch(fuente[1], { headers: { "User-Agent": UA } }).then((r) =>
  r.arrayBuffer()
);

await mkdir(destino, { recursive: true });
await writeFile(join(destino, "material-symbols-subset.woff2"), Buffer.from(binario));

console.log(
  `Material Symbols: ${ICONOS.length} iconos, ${(binario.byteLength / 1024).toFixed(1)} KB`
);
