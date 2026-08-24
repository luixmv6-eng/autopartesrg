/**
 * Verifica el grafo de conocimiento ya construido por `scripts/graphify-reparar.py`.
 *
 * Comprueba tres cosas, y las tres han fallado alguna vez en silencio:
 *
 * 1. **Extremos colgantes.** El extractor AST emite aristas `imports_from` hacia
 *    módulos externos (`ref_react`, `ref_next_image`...) y hacia archivos locales
 *    que no producen nodos propios (`globals.css`, `productos.json`), pero no
 *    crea el nodo de destino. La reparación los materializa; aquí se comprueba
 *    que no quede ninguno suelto.
 *
 * 2. **Archivos del corpus sin ningún nodo.** Si la caché semántica de un
 *    documento se invalida al editarlo y la reconstrucción corre sin volver a
 *    extraerlo, ese archivo desaparece del grafo entero sin avisar. Pasó con
 *    README.md y DESIGN.md.
 *
 * 3. **Coherencia de etiquetas.** Los ids de comunidad de Louvain no son
 *    estables entre corridas, así que una etiqueta guardada por número acaba
 *    describiendo un grupo de nodos distinto. Se comprueba que haya un nombre
 *    por comunidad y que ninguno sea el marcador de posición.
 *
 * Uso:  node scripts/reparar-grafo.mjs   (equivale a `npm run grafo:verificar`)
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const leer = (...partes) => JSON.parse(readFileSync(join(raiz, ...partes), "utf8"));

// Archivos que entran al corpus pero que legítimamente no producen nodos:
// configuración local del editor e índice de pantallas de Stitch (datos puros).
const SIN_NODOS_ESPERADO = new Set([
  ".claude/settings.local.json",
  "design/stitch/screens.json",
]);

const grafo = leer("graphify-out", "graph.json");

// graphify exporta en formato node-link de NetworkX: las aristas van en `links`.
const aristas = grafo.links ?? [];
const ids = new Set(grafo.nodes.map((n) => n.id));
const colgantes = aristas.filter((e) => !ids.has(e.source) || !ids.has(e.target));
const externos = grafo.nodes.filter((n) => n.id.startsWith("ref_"));

const comunidades = new Set(grafo.nodes.map((n) => n.community));

console.log(`nodos: ${grafo.nodes.length}`);
console.log(`aristas: ${aristas.length}`);
console.log(`comunidades: ${comunidades.size}`);
console.log(`nodos de dependencia externa: ${externos.length}`);

let fallo = false;

// --- 1. Extremos colgantes -------------------------------------------------
console.log(`\naristas con extremo colgante: ${colgantes.length}`);
if (colgantes.length) {
  for (const e of colgantes.slice(0, 20)) console.log(`  ${e.source} -> ${e.target}`);
  fallo = true;
} else {
  console.log("  OK: todos los extremos existen como nodo.");
}

// --- 2. Archivos del corpus sin representación -----------------------------
const rutaManifiesto = join(raiz, "graphify-out", "manifest.json");
if (existsSync(rutaManifiesto)) {
  const manifiesto = leer("graphify-out", "manifest.json");
  const conNodos = new Set(grafo.nodes.map((n) => n.source_file));
  const huerfanos = Object.keys(manifiesto).filter(
    (f) => !conNodos.has(f) && !SIN_NODOS_ESPERADO.has(f),
  );

  console.log(`\narchivos del corpus sin ningún nodo: ${huerfanos.length}`);
  if (huerfanos.length) {
    for (const f of huerfanos) console.log(`  ${f}`);
    console.log("  Su contenido no está en el grafo. Vuelve a extraerlos.");
    fallo = true;
  } else {
    console.log("  OK: todo archivo sellado en el manifiesto aporta nodos.");
  }
} else {
  console.log("\nAVISO: no hay manifest.json; se omite el chequeo de cobertura.");
}

// --- 3. Coherencia de etiquetas de comunidad -------------------------------
const rutaEtiquetas = join(raiz, "graphify-out", ".graphify_labels.json");
if (existsSync(rutaEtiquetas)) {
  const etiquetas = leer("graphify-out", ".graphify_labels.json");
  const sinEtiqueta = [...comunidades].filter((c) => !(String(c) in etiquetas));
  const sobrantes = Object.keys(etiquetas).filter((k) => !comunidades.has(Number(k)));
  const marcador = Object.entries(etiquetas).filter(([, v]) => /^Comunidad \d+$/.test(v));

  console.log(`\netiquetas de comunidad: ${Object.keys(etiquetas).length}`);
  if (sinEtiqueta.length || sobrantes.length || marcador.length) {
    for (const c of sinEtiqueta) console.log(`  comunidad ${c} sin etiqueta`);
    for (const k of sobrantes) console.log(`  etiqueta ${k} sin comunidad (${etiquetas[k]})`);
    for (const [k, v] of marcador) console.log(`  comunidad ${k} sin nombrar (${v})`);
    console.log("  Pon los nombres en graphify-out/etiquetas.json y relanza graphify-reparar.py.");
    fallo = true;
  } else {
    console.log("  OK: una etiqueta por comunidad, ninguna sin nombrar.");
  }
} else {
  console.log("\nAVISO: no hay .graphify_labels.json; se omite el chequeo de etiquetas.");
}

console.log(fallo ? "\nFALLO: el grafo necesita atención." : "\nOK: el grafo está sano.");
if (fallo) process.exitCode = 1;
