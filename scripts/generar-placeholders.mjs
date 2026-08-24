/**
 * Genera las imágenes de marcador de posición del sitio.
 *
 * Siguen la paleta Material 3 del diseño de Stitch: fondo claro de estudio
 * para las fichas de producto (las tarjetas las muestran con `object-contain`
 * sobre `surface-container-highest`) y composiciones azules para hero y
 * Nosotros. Para sustituirlas basta con dejar la foto real con el mismo
 * nombre y actualizar la extensión donde corresponda.
 *
 * Uso:  node scripts/generar-placeholders.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const dirPartes = join(raiz, "public", "images", "parts");
const dirImagenes = join(raiz, "public", "images");

const productos = JSON.parse(
  await readFile(join(raiz, "src", "data", "productos.json"), "utf8")
);

const PRIMARY = "#00357f";
const PRIMARY_CONTAINER = "#004aad";
const ON_SURFACE_VARIANT = "#434653";
const OUTLINE_VARIANT = "#c3c6d5";
const SURFACE_LOW = "#f3f3f6";
const SURFACE_HIGHEST = "#e2e2e5";

const ETIQUETAS = {
  motor: "Motor",
  frenos: "Frenos",
  suspension: "Suspension",
  electrico: "Electrico",
  carroceria: "Carroceria",
  transmision: "Transmision",
  filtros: "Filtros",
  refrigeracion: "Refrigeracion",
};

const escapar = (texto) =>
  texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Parte el nombre en líneas de ancho razonable. */
function envolver(texto, maximo = 24) {
  const palabras = texto.split(" ");
  const lineas = [];
  let actual = "";
  for (const palabra of palabras) {
    if ((actual + " " + palabra).trim().length > maximo) {
      if (actual) lineas.push(actual.trim());
      actual = palabra;
    } else {
      actual = `${actual} ${palabra}`.trim();
    }
  }
  if (actual) lineas.push(actual);
  return lineas.slice(0, 3);
}

/**
 * Ficha de producto: fondo de estudio claro con viñeta, sello de categoría y
 * el número OEM, para que la tarjeta se lea completa antes de tener foto.
 */
function svgProducto({ nombre, categoria, oem }) {
  const lineas = envolver(nombre, 20);
  const inicioY = 398 - ((lineas.length - 1) * 46) / 2;

  const textos = lineas
    .map(
      (linea, i) =>
        `<text x="400" y="${inicioY + i * 46}" text-anchor="middle" font-family="'Hanken Grotesk',system-ui,sans-serif" font-size="38" font-weight="600" fill="${ON_SURFACE_VARIANT}">${escapar(linea)}</text>`
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600" role="img">
  <defs>
    <radialGradient id="v" cx="0.5" cy="0.4" r="0.75">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="${SURFACE_HIGHEST}"/>
    </radialGradient>
    <pattern id="r" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="${OUTLINE_VARIANT}" stroke-opacity="0.4" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="800" height="600" fill="url(#v)"/>
  <rect width="800" height="600" fill="url(#r)"/>
  <circle cx="400" cy="238" r="132" fill="${SURFACE_LOW}" stroke="${OUTLINE_VARIANT}" stroke-width="3"/>
  <circle cx="400" cy="238" r="82" fill="none" stroke="${PRIMARY_CONTAINER}" stroke-width="5" stroke-dasharray="20 15" stroke-opacity="0.85"/>
  <circle cx="400" cy="238" r="30" fill="${PRIMARY}" fill-opacity="0.14"/>
  <text x="400" y="86" text-anchor="middle" font-family="'JetBrains Mono',ui-monospace,monospace" font-size="30" font-weight="700" fill="${PRIMARY}" letter-spacing="5">${escapar((ETIQUETAS[categoria] ?? categoria).toUpperCase())}</text>
  ${textos}
  <text x="400" y="512" text-anchor="middle" font-family="'JetBrains Mono',ui-monospace,monospace" font-size="30" fill="${ON_SURFACE_VARIANT}" letter-spacing="2">OEM ${escapar(oem)}</text>
  <text x="400" y="566" text-anchor="middle" font-family="'Hanken Grotesk',system-ui,sans-serif" font-size="24" font-weight="700" fill="${OUTLINE_VARIANT}" letter-spacing="3">AUTOPARTES ERG</text>
</svg>
`;
}

/**
 * Composición azul para el hero: solo geometría.
 *
 * Sin texto a propósito. El titular, la etiqueta y la retícula los pone el
 * componente con CSS, así que rotularlo aquí duplicaba mensaje y el texto
 * quedaba cortado bajo la barra superior.
 */
function svgHero() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 700" width="1600" height="700" role="img">
  <defs>
    <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a4694"/>
      <stop offset="0.55" stop-color="${PRIMARY_CONTAINER}"/>
      <stop offset="1" stop-color="#001c52"/>
    </linearGradient>
    <pattern id="hr" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1"/>
    </pattern>
    <radialGradient id="hl" cx="0.74" cy="0.2" r="0.7">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.24"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="700" fill="url(#hg)"/>
  <rect width="1600" height="700" fill="url(#hr)"/>
  <rect width="1600" height="700" fill="url(#hl)"/>
  <g transform="translate(1180 350)">
    <g fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2">
      <circle r="240"/><circle r="150"/><circle r="62"/>
    </g>
    <circle r="240" fill="none" stroke="#ffb159" stroke-width="4" stroke-dasharray="32 24" stroke-opacity="0.9"/>
    <g fill="#ffffff" fill-opacity="0.18">
      <circle cx="0" cy="-192" r="16"/><circle cx="166" cy="-96" r="16"/><circle cx="166" cy="96" r="16"/>
      <circle cx="0" cy="192" r="16"/><circle cx="-166" cy="96" r="16"/><circle cx="-166" cy="-96" r="16"/>
    </g>
  </g>
</svg>
`;
}

/**
 * Imágenes de la sección Nosotros: estantería de bodega esquemática. El alto se
 * pasa por parámetro para que la relación de aspecto se acerque a la del hueco
 * y `object-cover` recorte lo mínimo.
 */
function svgNosotros(titulo, acento, ancho = 1600, alto = 460) {
  const filas = [];
  const columnas = Math.round(ancho / 300);
  const anchoCol = (ancho - 120) / columnas;

  for (let c = 0; c < columnas; c += 1) {
    const x = 60 + c * anchoCol + 14;
    const w = anchoCol - 28;
    const y = 120 + (c % 2) * 26;
    const h = alto - y - 60;
    filas.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>`);
    for (let n = 1; n <= 3; n += 1) {
      const ly = y + (h / 4) * n;
      filas.push(`<path d="M${x} ${ly}h${w}"/>`);
    }
  }

  // Un par de cajas acentuadas para que la estantería no se lea vacía.
  const cajas = [0, columnas - 1]
    .map((c, i) => {
      const x = 60 + c * anchoCol + 30;
      const y = 120 + (c % 2) * 26 + (alto - 180 - (c % 2) * 26) * (i === 0 ? 0.52 : 0.24);
      return `<rect x="${x}" y="${Math.round(y)}" width="${Math.round(anchoCol - 60)}" height="${Math.round((alto - 180) / 4 - 12)}" rx="6" fill="${acento}" fill-opacity="0.8"/>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ancho} ${alto}" width="${ancho}" height="${alto}" role="img">
  <defs>
    <linearGradient id="ng" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0d4f9e"/>
      <stop offset="1" stop-color="#00204f"/>
    </linearGradient>
    <pattern id="nr" width="44" height="44" patternUnits="userSpaceOnUse">
      <path d="M44 0H0V44" fill="none" stroke="#ffffff" stroke-opacity="0.11" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${ancho}" height="${alto}" fill="url(#ng)"/>
  <rect width="${ancho}" height="${alto}" fill="url(#nr)"/>
  <g stroke="#ffffff" stroke-opacity="0.22" stroke-width="3" fill="none">${filas.join("")}</g>
  ${cajas}
  <text x="60" y="76" font-family="'JetBrains Mono',ui-monospace,monospace" font-size="26" font-weight="700" fill="#ffffff" fill-opacity="0.72" letter-spacing="5">${escapar(titulo.toUpperCase())}</text>
  <text x="${ancho - 60}" y="76" text-anchor="end" font-family="'Hanken Grotesk',system-ui,sans-serif" font-size="24" font-weight="700" fill="#ffffff" fill-opacity="0.45" letter-spacing="2">AUTOPARTES ERG</text>
</svg>
`;
}

await mkdir(dirPartes, { recursive: true });

for (const producto of productos) {
  await writeFile(join(dirPartes, `${producto.id}.svg`), svgProducto(producto), "utf8");
}

await writeFile(join(dirImagenes, "hero.svg"), svgHero(), "utf8");
// Banda ancha para la cabecera de Nosotros, y formato 2:1 para las pestañas.
await writeFile(
  join(dirImagenes, "nosotros.svg"),
  svgNosotros("Bodega tecnica", "#ffb159", 1600, 440),
  "utf8"
);
await writeFile(
  join(dirImagenes, "nosotros-sobre-nosotros.svg"),
  svgNosotros("Historia", "#b0c6ff", 1200, 620),
  "utf8"
);
await writeFile(
  join(dirImagenes, "nosotros-mision.svg"),
  svgNosotros("Mision", "#ffb159", 1200, 620),
  "utf8"
);
await writeFile(
  join(dirImagenes, "nosotros-vision.svg"),
  svgNosotros("Vision", "#a9c1ff", 1200, 620),
  "utf8"
);

console.log(`Generados ${productos.length} placeholders de producto, 1 hero y 4 de Nosotros.`);
