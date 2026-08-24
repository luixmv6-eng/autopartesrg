#!/usr/bin/env node
/**
 * Comprueba que el catálogo y la barra de filtros digan lo mismo.
 *
 * Los filtros se dibujan a partir de `taxonomia.ts` y los resultados salen de
 * `productos.json`. Son dos archivos distintos, así que pueden desincronizarse
 * de dos maneras y las dos son silenciosas en producción:
 *
 *   - una opción que ningún producto usa: aparece la casilla, el usuario la
 *     marca, salen cero resultados y deja de fiarse del resto de filtros;
 *   - un producto que apunta a un identificador que no existe en la taxonomía:
 *     no lo encuentra ningún filtro, y `LABEL_*` devuelve `undefined` donde
 *     debería ir el nombre de la marca.
 *
 * También verifica que cada `imagen` exista en `public/` y que no queden fotos
 * huérfanas en `public/images/parts/`.
 *
 * Uso: npm run verificar:taxonomia
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const productos = JSON.parse(readFileSync(join(raiz, "src/data/productos.json"), "utf8"));
const taxonomia = readFileSync(join(raiz, "src/lib/taxonomia.ts"), "utf8");

/**
 * Se leen los identificadores del fuente con una expresión regular en vez de
 * importar el módulo: es TypeScript, y añadir un compilador al script para leer
 * tres listas de literales no compensa.
 */
function idsDe(constante) {
  const bloque = taxonomia.match(new RegExp(`${constante}[^=]*=\\s*\\[([\\s\\S]*?)\\n\\];`));
  if (!bloque) throw new Error(`No se encontró la constante ${constante} en taxonomia.ts`);
  return [...bloque[1].matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]);
}

const grupos = [
  { campo: "marca", constante: "MARCAS", ids: idsDe("MARCAS") },
  { campo: "categoria", constante: "CATEGORIAS", ids: idsDe("CATEGORIAS") },
  { campo: "seccion", constante: "SECCIONES", ids: idsDe("SECCIONES") },
];

const problemas = [];

for (const { campo, constante, ids } of grupos) {
  const usados = new Set(productos.map((p) => p[campo]));

  for (const id of ids) {
    if (!usados.has(id)) {
      problemas.push(`${constante}: la opción "${id}" no la usa ningún producto (filtro vacío).`);
    }
  }
  for (const id of usados) {
    if (!ids.includes(id)) {
      problemas.push(`productos.json: ${campo} "${id}" no existe en ${constante}.`);
    }
  }
}

// Identificadores repetidos: el `id` es la clave de React y el ancla de la URL.
const vistos = new Set();
for (const p of productos) {
  if (vistos.has(p.id)) problemas.push(`productos.json: id repetido "${p.id}".`);
  vistos.add(p.id);
}

// Imágenes: cada producto apunta a un archivo real, y ningún archivo sobra.
const referenciadas = new Set();
for (const p of productos) {
  const ruta = join(raiz, "public", p.imagen);
  referenciadas.add(p.imagen.replace("/images/parts/", ""));
  if (!existsSync(ruta)) problemas.push(`${p.id}: no existe la imagen ${p.imagen}.`);
}
for (const archivo of readdirSync(join(raiz, "public/images/parts"))) {
  if (!referenciadas.has(archivo)) {
    problemas.push(`public/images/parts/${archivo}: no lo referencia ningún producto.`);
  }
}

const conteo = (campo) =>
  productos.reduce((acc, p) => ({ ...acc, [p[campo]]: (acc[p[campo]] ?? 0) + 1 }), {});

if (problemas.length) {
  console.error(`\n${problemas.length} problema(s):\n`);
  for (const p of problemas) console.error(`  - ${p}`);
  console.error("");
  process.exit(1);
}

console.log(`\nOK — ${productos.length} productos, taxonomía e imágenes en correspondencia.\n`);
for (const { campo, constante } of grupos) {
  const filas = Object.entries(conteo(campo)).sort((a, b) => b[1] - a[1]);
  console.log(`  ${constante}: ${filas.map(([k, n]) => `${k} (${n})`).join(", ")}`);
}
console.log("");
