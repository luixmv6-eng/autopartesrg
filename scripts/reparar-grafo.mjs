/**
 * Documenta (y verifica) la reparación que aplica `scripts/graphify-reparar.py`.
 *
 * El extractor AST de graphify emite aristas `imports_from` hacia módulos
 * externos (`ref_react`, `ref_next_image`, `ref_node_fs_promises`...) y hacia
 * archivos locales que no producen nodos propios (`globals.css`,
 * `productos.json`), pero no crea el nodo de destino. El resultado son aristas
 * con extremo colgante que el chequeo de salud de graphify marca como posible
 * corrupción.
 *
 * La reparación crea esos nodos, así que el grafo pasa a responder también
 * "qué archivos importan React" o "quién lee productos.json".
 *
 * Uso:  node scripts/reparar-grafo.mjs   (solo verifica el grafo ya construido)
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const grafo = JSON.parse(readFileSync(join(raiz, "graphify-out", "graph.json"), "utf8"));

// graphify exporta en formato node-link de NetworkX: las aristas van en `links`.
const aristas = grafo.links ?? [];
const ids = new Set(grafo.nodes.map((n) => n.id));
const colgantes = aristas.filter((e) => !ids.has(e.source) || !ids.has(e.target));

const externos = grafo.nodes.filter((n) => n.id.startsWith("ref_"));

console.log(`nodos: ${grafo.nodes.length}`);
console.log(`aristas: ${aristas.length}`);
console.log(`nodos de dependencia externa: ${externos.length}`);
console.log(`aristas con extremo colgante: ${colgantes.length}`);

if (colgantes.length) {
  for (const e of colgantes.slice(0, 20)) {
    console.log(`  ${e.source} -> ${e.target}`);
  }
  process.exitCode = 1;
} else {
  console.log("OK: todos los extremos existen como nodo.");
}
