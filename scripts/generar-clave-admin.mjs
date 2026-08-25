#!/usr/bin/env node
/**
 * Genera las dos variables secretas del panel de administración.
 *
 * Uso:
 *   npm run admin:clave -- "la contraseña que quieras"
 *   npm run admin:clave              (la pide por teclado)
 *
 * Imprime el valor de `ADMIN_PASSWORD_HASH` y uno nuevo de
 * `ADMIN_SESSION_SECRET` listos para pegar en las variables de entorno del
 * hosting. La contraseña en claro no se guarda en ningún sitio: de ella solo
 * queda este resumen, que no se puede revertir.
 *
 * El formato tiene que coincidir con el que lee `src/lib/admin/sesion.ts`:
 *   scrypt.<coste>.<sal en hexadecimal>.<resumen en hexadecimal>
 *
 * Los campos se separan con PUNTOS, no con `$`. El cargador de `.env` de Next
 * expande variables como el intérprete de comandos: un `$16384` en el valor lo
 * toma por una variable inexistente y se come el resto del hash.
 * Se reimplementa aquí, en vez de importarlo, porque aquel archivo es
 * TypeScript y este script corre con Node a pelo, sin compilar nada.
 */
import { randomBytes, scrypt } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const SCRYPT_N = 16384;
const LONGITUD = 64;

const derivar = (contrasena, sal) =>
  new Promise((resolver, rechazar) => {
    scrypt(contrasena, sal, LONGITUD, { N: SCRYPT_N }, (error, clave) => {
      if (error) rechazar(error);
      else resolver(clave);
    });
  });

let contrasena = process.argv.slice(2).join(" ").trim();

if (!contrasena) {
  const teclado = createInterface({ input: stdin, output: stdout });
  contrasena = (await teclado.question("Contraseña para el panel: ")).trim();
  teclado.close();
}

if (contrasena.length < 12) {
  console.error(
    "\nLa contraseña debe tener al menos 12 caracteres.\n" +
      "Es la única puerta del panel, y el freno de intentos no siempre funciona\n" +
      "en hostings sin estado. Usa una frase larga en vez de una palabra corta.\n"
  );
  process.exit(1);
}

const sal = randomBytes(16);
const derivada = await derivar(contrasena.normalize("NFKC"), sal);

const hash = `scrypt.${SCRYPT_N}.${sal.toString("hex")}.${derivada.toString("hex")}`;
const secreto = randomBytes(48).toString("base64url");

console.log(`
Pega estas dos líneas en las variables de entorno de tu hosting.
NO las subas al repositorio: .env* está en .gitignore por eso mismo.

ADMIN_PASSWORD_HASH=${hash}
ADMIN_SESSION_SECRET=${secreto}

No hace falta nada más: el panel guarda en la carpeta "datos/" del servidor.
Si quieres ponerla en otro sitio (recomendable en producción, fuera de la
carpeta del sitio), añade ADMIN_DATA_DIR con la ruta.

Cambiar ADMIN_SESSION_SECRET cierra al instante todas las sesiones abiertas.
`);
