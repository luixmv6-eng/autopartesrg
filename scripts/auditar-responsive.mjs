/**
 * Auditoría de responsive sobre la compilación de producción.
 *
 * Recorre las páginas en un abanico de viewports —del móvil de 320px al
 * monitor de 2560, pasando por el teléfono en horizontal— y comprueba en cada
 * uno lo que se rompe en silencio y no aparece en ninguna prueba de unidad:
 *
 *   1. **Desbordamiento horizontal.** El fallo más molesto y el más fácil de
 *      colar: basta un elemento que se pase unos píxeles para que toda la
 *      página se pueda arrastrar de lado.
 *   2. **Áreas táctiles.** 44x44 como mínimo donde el puntero es grueso. Se
 *      ignoran los controles que amplían su área con un `::after` estirado
 *      sobre la tarjeta, porque ahí el objetivo real es la tarjeta entera.
 *   3. **Tamaño de letra.** Nada por debajo de 10px, el mínimo que fija
 *      `DESIGN.md` §1 para las etiquetas técnicas.
 *   4. **Barra inferior contra relleno del body.** Si dejan de cuadrar, la
 *      barra fija tapa el final del contenido.
 *   5. **Diálogos.** Ficha técnica y hoja de filtros, que la pasada de páginas
 *      no llega a abrir.
 *   6. **Superposiciones.** Que ningún elemento flotante tape un control. El
 *      botón de WhatsApp llegó a cubrir media acción "Filtrar" en móvil.
 *   7. **Contraste.** Los pares de color de `globals.css` contra WCAG. Se leen
 *      los tokens del propio fichero, no una copia: el blanco sobre el verde de
 *      WhatsApp daba 1.98:1 y nadie lo había medido.
 *
 * Uso:
 *   npm run build && npm run responsive:auditar
 *
 * Levanta él mismo un servidor de producción en un puerto libre y lo apaga al
 * terminar. Con `BASE` apunta a un servidor ya en marcha:
 *   BASE=http://localhost:3000 npm run responsive:auditar
 *
 * Sale con código 1 si algo falla, para poder colgarlo de CI.
 */
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { chromium } from "playwright";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Anchuras reales, no redondas: son las que se ven en analítica. */
const VIEWPORTS = [
  { nombre: "320  móvil mínimo", width: 320, height: 568, tactil: true },
  { nombre: "360  Android común", width: 360, height: 800, tactil: true },
  { nombre: "390  iPhone 14", width: 390, height: 844, tactil: true },
  { nombre: "414  phablet", width: 414, height: 896, tactil: true },
  { nombre: "480  móvil grande", width: 480, height: 900, tactil: true },
  { nombre: "640  sm", width: 640, height: 900, tactil: true },
  { nombre: "768  tableta vertical", width: 768, height: 1024, tactil: true },
  { nombre: "844  móvil apaisado", width: 844, height: 390, tactil: true },
  { nombre: "1024 tableta apaisada", width: 1024, height: 768, tactil: false },
  { nombre: "1280 portátil", width: 1280, height: 800, tactil: false },
  { nombre: "1440 escritorio", width: 1440, height: 900, tactil: false },
  { nombre: "1536 2xl", width: 1536, height: 960, tactil: false },
  { nombre: "1920 full HD", width: 1920, height: 1080, tactil: false },
  { nombre: "2560 ultra ancho", width: 2560, height: 1440, tactil: false },
];

const RUTAS = ["/", "/nosotros"];

/** Tamaño mínimo de un objetivo táctil, en píxeles CSS. */
const OBJETIVO_MIN = 44;
/** Holgura para redondeos de subpíxel al medir. */
const HOLGURA = 1;
const SELECTOR_INTERACTIVO =
  "a[href], button, input:not([type=hidden]), select, textarea, [role=tab]";
/** Fracción de un control que un flotante puede cubrir. Ver `WhatsAppFab`. */
const UMBRAL_SOLAPE = 0.25;

// ---------------------------------------------------------------------------
// Sondas. Se serializan al navegador, así que no pueden cerrar sobre nada de
// aquí: todo lo que necesitan llega por argumento.
// ---------------------------------------------------------------------------

/** Mide una página entera: desbordes, objetivos táctiles y letra pequeña. */
function sondarPagina({ minimo, holgura, selector }) {
  const vw = window.innerWidth;
  const doc = document.documentElement;
  const visible = (el) => {
    const e = getComputedStyle(el);
    return e.display !== "none" && e.visibility !== "hidden" && e.opacity !== "0";
  };

  const desbordes = [];
  for (const el of document.querySelectorAll("body *")) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    if (r.right > vw + holgura || r.left < -holgura) {
      desbordes.push({
        descripcion: `<${el.tagName.toLowerCase()}> [${Math.round(r.left)},${Math.round(r.right)}] ${(el.getAttribute("class") ?? "").slice(0, 70)}`,
      });
    }
  }

  const tactiles = [];
  for (const el of document.querySelectorAll(selector)) {
    if (!visible(el) || el.closest(".sr-only")) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    // El área real puede venir de un ::after estirado sobre el contenedor.
    const after = getComputedStyle(el, "::after");
    if (after.position === "absolute" && after.inset === "0px") continue;
    if (r.height < minimo - holgura / 2) {
      tactiles.push({
        descripcion: `<${el.tagName.toLowerCase()}> ${Math.round(r.width)}x${Math.round(r.height)} "${(el.textContent ?? "").trim().slice(0, 30)}"`,
      });
    }
  }

  const pequenos = [];
  for (const el of document.querySelectorAll("body *")) {
    const conTexto = [...el.childNodes].some(
      (n) => n.nodeType === 3 && n.textContent.trim().length > 1
    );
    if (!conTexto || !visible(el) || el.closest(".sr-only")) continue;
    const px = parseFloat(getComputedStyle(el).fontSize);
    if (px < 10) {
      pequenos.push({ descripcion: `${px.toFixed(1)}px "${el.textContent.trim().slice(0, 30)}"` });
    }
  }

  const barra = document.querySelector("nav[aria-label='Navegación inferior']");
  return {
    scrollWidth: doc.scrollWidth,
    clientWidth: doc.clientWidth,
    desbordes,
    tactiles,
    pequenos,
    altoBarra: barra ? Math.round(barra.getBoundingClientRect().height) : 0,
    rellenoBody: Math.round(parseFloat(getComputedStyle(document.body).paddingBottom)),
  };
}

/** Mide el diálogo abierto: nada debe salirse de su caja. */
function sondarDialogo({ holgura }) {
  const dlg = document.querySelector("dialog[open]");
  if (!dlg) return null;
  const caja = dlg.getBoundingClientRect();
  const fuera = [];
  for (const el of dlg.querySelectorAll("*")) {
    const e = getComputedStyle(el);
    if (e.display === "none" || e.visibility === "hidden") continue;
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    // Lo que vive dentro de un carril con scroll horizontal desborda por
    // definición: es lo que lo hace deslizable, no un fallo de layout.
    let p = el.parentElement;
    let enCarril = false;
    while (p && p !== dlg) {
      const pe = getComputedStyle(p);
      if (pe.overflowX === "auto" || pe.overflowX === "scroll") {
        enCarril = true;
        break;
      }
      p = p.parentElement;
    }
    if (enCarril) continue;
    if (r.right > caja.right + holgura || r.left < caja.left - holgura) {
      fuera.push({
        descripcion: `<${el.tagName.toLowerCase()}> ${(el.getAttribute("class") ?? "").slice(0, 60)}`,
      });
    }
  }
  return {
    fuera,
    w: Math.round(caja.width),
    h: Math.round(caja.height),
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  };
}

/**
 * Comprueba que ningún elemento fijo estorbe un control interactivo.
 *
 * «Estorbar» no es «rozar»: el criterio es el mismo que aplica `WhatsAppFab`,
 * tapar el centro del control o un cuarto de su superficie. Si aquí se exigiera
 * solape cero, la auditoría pediría algo que el componente no promete.
 */
function sondarSuperposicion({ selector, umbral }) {
  const flotantes = [...document.querySelectorAll("body *")].filter((el) => {
    const e = getComputedStyle(el);
    if (e.position !== "fixed" || e.display === "none" || e.visibility === "hidden") return false;
    if (e.opacity === "0" || e.pointerEvents === "none") return false;
    const r = el.getBoundingClientRect();
    // Solo los que flotan sobre el contenido, no las barras a lo ancho.
    return r.width > 0 && r.height > 0 && r.width < window.innerWidth * 0.5;
  });

  const choques = [];
  for (const flotante of flotantes) {
    const f = flotante.getBoundingClientRect();
    for (const el of document.querySelectorAll(selector)) {
      if (flotante.contains(el) || el.contains(flotante)) continue;
      const e = getComputedStyle(el);
      if (e.display === "none" || e.visibility === "hidden") continue;
      if (e.position === "fixed") continue;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      // Fuera de pantalla: no hay nada que tapar.
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      const solapeX = Math.min(f.right, r.right) - Math.max(f.left, r.left);
      const solapeY = Math.min(f.bottom, r.bottom) - Math.max(f.top, r.top);
      if (solapeX <= 0 || solapeY <= 0) continue;

      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const tapaElCentro = cx >= f.left && cx <= f.right && cy >= f.top && cy <= f.bottom;
      const fraccion = (solapeX * solapeY) / (r.width * r.height);

      if (tapaElCentro || fraccion >= umbral) {
        choques.push({
          descripcion:
            `flotante <${flotante.tagName.toLowerCase()}.${(flotante.getAttribute("class") ?? "").split(" ")[0]}> ` +
            `tapa ${tapaElCentro ? "el centro de" : `${Math.round(fraccion * 100)}% de`} ` +
            `<${el.tagName.toLowerCase()}> "${(el.textContent ?? "").trim().slice(0, 26)}"`,
        });
      }
    }
  }
  return choques;
}

// ---------------------------------------------------------------------------
// Contraste
// ---------------------------------------------------------------------------

/**
 * Pares foreground/background que tienen que cumplir WCAG.
 *
 * Los colores **no** se escriben aquí: se leen de `globals.css`, que es la
 * única fuente. Una copia a mano se queda desfasada en cuanto alguien retoca un
 * token, y entonces la comprobación certifica un valor que ya no existe.
 *
 * `min` es 4.5 para texto (WCAG 1.4.3) y 3 para contornos de control y
 * elementos gráficos (1.4.11).
 */
const PARES_CONTRASTE = [
  ["texto principal sobre tarjeta", "on-surface", "surface-container-lowest", 4.5],
  ["texto de apoyo sobre tarjeta", "on-surface-variant", "surface-container-lowest", 4.5],
  ["texto de apoyo sobre fondo", "on-surface-variant", "background", 4.5],
  ["OEM sobre fondo de imagen", "on-surface-variant", "surface-container-highest", 4.5],
  ["marcador de posición en campo", "on-surface-variant", "surface-container-low", 4.5],
  ["CTA del hero", "on-accent", "accent", 4.5],
  ["CTA de cotización", "on-tertiary-fixed", "on-tertiary-container", 4.5],
  ["chip de filtro activo", "on-primary-container", "primary-container", 4.5],
  ["callout de compatibilidad", "on-primary-fixed-variant", "primary-fixed", 4.5],
  ["botón de WhatsApp", "on-wa", "wa", 4.5],
  ["aviso legal sobre panel", "on-panel-suave", "panel", 4.5],
  ["cabecera del panel de filtros", "on-primary", "primary", 4.5],
  ["contorno de campo sobre blanco", "borde-campo", "surface-container-lowest", 3],
  ["contorno de campo sobre panel", "borde-campo", "panel", 3],
  ["contorno de campo sobre campo", "borde-campo", "surface-container-low", 3],
];

function leerTokensDeColor() {
  const css = readFileSync(join(RAIZ, "src/app/globals.css"), "utf8");
  const tokens = {};
  for (const [, nombre, valor] of css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    tokens[nombre] = valor;
  }
  return tokens;
}

const luminancia = (hex) => {
  const c = hex
    .replace("#", "")
    .match(/../g)
    .map((h) => {
      const v = parseInt(h, 16) / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

const contraste = (a, b) => {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
};

function auditarContraste() {
  console.log("\n── Contraste ────────────────────────────────────────────────");
  const tokens = leerTokensDeColor();
  for (const [nombre, fg, bg, minimo] of PARES_CONTRASTE) {
    if (!tokens[fg] || !tokens[bg]) {
      informar(nombre, "token ausente", [
        { descripcion: `no existe --color-${!tokens[fg] ? fg : bg} en globals.css` },
      ]);
      continue;
    }
    const ratio = contraste(tokens[fg], tokens[bg]);
    informar(
      nombre,
      `${ratio.toFixed(2)}:1  (mín ${minimo})  ${tokens[fg]} sobre ${tokens[bg]}`,
      ratio >= minimo ? [] : [{ descripcion: `por debajo del mínimo de ${minimo}:1` }]
    );
  }
}

// ---------------------------------------------------------------------------
// Arranque del servidor
// ---------------------------------------------------------------------------

const puertoLibre = () =>
  new Promise((resolve, reject) => {
    const s = createServer();
    s.on("error", reject);
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });

async function esperarServidor(base, intentos = 60) {
  for (let i = 0; i < intentos; i++) {
    try {
      const r = await fetch(base, { signal: AbortSignal.timeout(1000) });
      if (r.ok) return;
    } catch {
      // Todavía no responde.
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`El servidor no respondió en ${base}`);
}

async function levantarServidor() {
  if (!existsSync(join(RAIZ, ".next"))) {
    console.error("No hay compilación en .next/. Ejecuta primero: npm run build");
    process.exit(1);
  }
  const puerto = await puertoLibre();
  const base = `http://127.0.0.1:${puerto}`;
  const proceso = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["next", "start", "-p", String(puerto)],
    { cwd: RAIZ, stdio: "ignore", shell: process.platform === "win32" }
  );
  await esperarServidor(base);
  return { base, cerrar: () => proceso.kill() };
}

// ---------------------------------------------------------------------------
// Recorrido
// ---------------------------------------------------------------------------

const fallos = [];

function informar(etiqueta, detalle, problemas) {
  const ok = problemas.length === 0;
  if (!ok) fallos.push(etiqueta);
  console.log(`${ok ? "  ok  " : " FALLA"} ${etiqueta.padEnd(38)} ${detalle}`);
  for (const p of problemas.slice(0, 5)) console.log(`         ${p.descripcion}`);
  if (problemas.length > 5) console.log(`         (+${problemas.length - 5} más)`);
}

async function auditarPaginas(navegador, base) {
  console.log("\n── Páginas ──────────────────────────────────────────────────");
  for (const ruta of RUTAS) {
    for (const vp of VIEWPORTS) {
      const ctx = await navegador.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.tactil,
        hasTouch: vp.tactil,
        deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();
      await page.goto(base + ruta, { waitUntil: "networkidle" });
      await page.waitForTimeout(150);

      const r = await page.evaluate(sondarPagina, {
        minimo: OBJETIVO_MIN,
        holgura: HOLGURA,
        selector: SELECTOR_INTERACTIVO,
      });

      const problemas = [...r.desbordes, ...r.pequenos];
      if (vp.tactil) problemas.push(...r.tactiles);
      if (r.scrollWidth > r.clientWidth + HOLGURA) {
        problemas.unshift({
          descripcion: `scroll horizontal del documento: ${r.scrollWidth} > ${r.clientWidth}`,
        });
      }
      if (r.altoBarra !== r.rellenoBody) {
        problemas.push({
          descripcion: `la barra inferior mide ${r.altoBarra}px y el body reserva ${r.rellenoBody}px`,
        });
      }

      informar(`${ruta}  ${vp.nombre}`, `barra=${r.altoBarra} pb=${r.rellenoBody}`, problemas);
      await ctx.close();
    }
  }
}

async function auditarDialogos(navegador, base) {
  console.log("\n── Diálogos ─────────────────────────────────────────────────");
  for (const vp of VIEWPORTS) {
    const ctx = await navegador.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.tactil,
      hasTouch: vp.tactil,
    });
    const page = await ctx.newPage();
    await page.goto(base + "/", { waitUntil: "networkidle" });

    await page.locator("#catalogo article h3 button").first().click();
    await page.waitForSelector("dialog[open]");
    await page.waitForTimeout(250);
    const ficha = await page.evaluate(sondarDialogo, { holgura: HOLGURA });
    const malFicha = [...ficha.fuera];
    if (ficha.scrollWidth > ficha.clientWidth + HOLGURA) {
      malFicha.unshift({ descripcion: "la ficha provoca scroll horizontal en el documento" });
    }
    informar(`ficha    ${vp.nombre}`, `${ficha.w}x${ficha.h}`, malFicha);

    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);

    const filtrar = page.getByRole("button", { name: /Filtrar/ }).first();
    if ((await filtrar.count()) && (await filtrar.isVisible())) {
      await filtrar.click();
      await page.waitForSelector("dialog[open]");
      await page.waitForTimeout(250);
      const hoja = await page.evaluate(sondarDialogo, { holgura: HOLGURA });
      const malHoja = [...hoja.fuera];
      if (hoja.scrollWidth > hoja.clientWidth + HOLGURA) {
        malHoja.unshift({ descripcion: "la hoja provoca scroll horizontal en el documento" });
      }
      informar(`filtros  ${vp.nombre}`, `${hoja.w}x${hoja.h}`, malHoja);
    }

    await ctx.close();
  }
}

async function auditarSuperposiciones(navegador, base) {
  console.log("\n── Superposiciones ──────────────────────────────────────────");
  // Solo donde el flotante convive con contenido apretado.
  const anchos = VIEWPORTS.filter((v) => v.width <= 1024);
  for (const vp of anchos) {
    const ctx = await navegador.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.tactil,
      hasTouch: vp.tactil,
    });
    const page = await ctx.newPage();
    await page.goto(base + "/", { waitUntil: "networkidle" });

    const alto = await page.evaluate(() => document.documentElement.scrollHeight);
    const pasos = 8;
    const choques = [];
    let vecesVisible = 0;
    for (let i = 0; i <= pasos; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round((alto * i) / pasos));
      await page.waitForTimeout(200);
      choques.push(
        ...(await page.evaluate(sondarSuperposicion, {
          selector: SELECTOR_INTERACTIVO,
          umbral: UMBRAL_SOLAPE,
        }))
      );
      if (await page.locator(".wa-fab").evaluate((el) => getComputedStyle(el).opacity !== "0")) {
        vecesVisible++;
      }
    }

    // Un mismo choque aparece en varias posiciones de scroll; se muestra una vez.
    const problemas = [...new Map(choques.map((c) => [c.descripcion, c])).values()];
    // Apartarse siempre no es apartarse: sería esconder el botón y llamarlo
    // arreglado. Tiene que estar disponible en la mayor parte del recorrido.
    if (vecesVisible < Math.ceil((pasos + 1) / 2)) {
      problemas.push({
        descripcion: `el botón de WhatsApp solo se ve en ${vecesVisible} de ${pasos + 1} posiciones`,
      });
    }

    informar(
      `flotantes ${vp.nombre}`,
      `${pasos + 1} posiciones · FAB visible en ${vecesVisible}`,
      problemas
    );
    await ctx.close();
  }
}

// ---------------------------------------------------------------------------

// El contraste sale de los tokens, así que no hace falta navegador ni servidor.
auditarContraste();

const externo = process.env.BASE;
const servidor = externo ? { base: externo, cerrar: () => {} } : await levantarServidor();
console.log(`Auditoría de responsive contra ${servidor.base}`);

const navegador = await chromium.launch();
try {
  await auditarPaginas(navegador, servidor.base);
  await auditarDialogos(navegador, servidor.base);
  await auditarSuperposiciones(navegador, servidor.base);
} finally {
  await navegador.close();
  servidor.cerrar();
}

console.log("");
if (fallos.length) {
  console.log(`${fallos.length} comprobaciones con fallos:`);
  for (const f of fallos) console.log(`  - ${f}`);
  process.exitCode = 1;
} else {
  console.log("Responsive OK: sin desbordes, objetivos pequeños ni superposiciones.");
}
