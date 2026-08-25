#!/usr/bin/env node
/**
 * Comprueba si una frase coincide con el `ADMIN_PASSWORD_HASH` configurado.
 *
 * Uso:
 *   npm run admin:verificar -- "la frase que crees que es"
 *   npm run admin:verificar               (la pide por teclado)
 *
 * Sirve para separar dos causas que se parecen mucho desde el navegador:
 * que la contraseña esté mal escrita, o que el panel no esté leyendo el
 * archivo que crees. Aquí se prueba contra el hash directamente, sin pasar
 * por el servidor: si esto dice que coincide y el navegador sigue diciendo
 * que no, el problema es que el servidor no se reinició.
 *
 * Todo ocurre en tu máquina. La frase no se guarda ni se envía a ningún sitio.
 */
import { scrypt, timingSafeEqual } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const ARCHIVOS = [".env.local", ".env.production.local", ".env"];

const archivo = ARCHIVOS.find((a) => existsSync(a) && /^ADMIN_PASSWORD_HASH=/m.test(readFileSync(a, "utf8")));

if (!archivo) {
  console.error(
    "\nNo encontré ADMIN_PASSWORD_HASH en ninguno de: " + ARCHIVOS.join(", ") + "\n"
  );
  process.exit(1);
}

const guardado = readFileSync(archivo, "utf8")
  .match(/^ADMIN_PASSWORD_HASH=(.*)$/m)[1]
  .trim()
  .replace(/^["']|["']$/g, "");

const partes = guardado.includes(".") ? guardado.split(".") : guardado.split("$");
if (partes.length !== 4 || partes[0] !== "scrypt") {
  console.error(`\nEl hash de ${archivo} no tiene el formato esperado.\n`);
  process.exit(1);
}

let candidata = process.argv.slice(2).join(" ");

if (!candidata) {
  const teclado = createInterface({ input: stdin, output: stdout });
  candidata = await teclado.question("Frase a comprobar: ");
  teclado.close();
}

const derivar = (texto, sal, longitud, n) =>
  new Promise((res, rej) =>
    scrypt(texto, sal, longitud, { N: n }, (e, k) => (e ? rej(e) : res(k)))
  );

const sal = Buffer.from(partes[2], "hex");
const esperado = Buffer.from(partes[3], "hex");

/*
 * Se prueban dos formas: la frase tal cual y la frase sin espacios en los
 * extremos. El generador recorta esos espacios, así que una frase tecleada con
 * un espacio de más produce un hash distinto del que se espera; distinguir los
 * dos casos aquí ahorra media hora de desconcierto.
 */
const intentos = [
  ["tal cual", candidata],
  ...(candidata !== candidata.trim() ? [["sin espacios sobrantes", candidata.trim()]] : []),
];

let acierto = null;
for (const [etiqueta, texto] of intentos) {
  const derivada = await derivar(texto.normalize("NFKC"), sal, esperado.length, Number(partes[1]));
  if (derivada.length === esperado.length && timingSafeEqual(derivada, esperado)) {
    acierto = etiqueta;
    break;
  }
}

console.log(`\nArchivo comprobado: ${archivo}`);
console.log(`Frase de ${candidata.length} caracteres.`);

if (acierto) {
  console.log(
    `\n  ✓ COINCIDE${acierto === "tal cual" ? "" : ` (${acierto})`}\n\n` +
      `Si aun así el panel dice "Contraseña incorrecta", el servidor no se ha\n` +
      `reiniciado desde que cambiaste el archivo. Párale con Ctrl+C y vuelve a\n` +
      `lanzar "npm run dev".\n`
  );
} else {
  console.log(
    `\n  ✗ NO coincide\n\n` +
      `Esa no es la frase con la que se generó el hash. Genera uno nuevo con:\n` +
      `  npm run admin:clave -- "la frase que quieras"\n` +
      `y reemplaza la línea ADMIN_PASSWORD_HASH de ${archivo}.\n`
  );
  process.exitCode = 1;
}
