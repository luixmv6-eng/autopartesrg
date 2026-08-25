import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Autenticación del panel: contraseña y sesión por cookie firmada.
 *
 * No hay base de datos, así que no hay tabla de usuarios ni de sesiones. La
 * sesión es un texto firmado que viaja en una cookie: el servidor no guarda
 * nada, solo comprueba que la firma sea suya y que no haya caducado. Es el
 * mismo principio de un JWT, escrito a mano para no traer una dependencia
 * entera por doscientas líneas.
 *
 * Tres decisiones que conviene entender antes de tocar esto:
 *
 * 1. **La contraseña no se guarda.** En la variable de entorno va un resumen
 *    scrypt con su sal. Aunque alguien leyera las variables del hosting, no
 *    tendría la contraseña, solo algo que cuesta mucho revertir.
 *
 *    El formato separa sus cuatro campos con puntos, no con `$` como es
 *    costumbre en Unix. El motivo es concreto: el cargador de archivos `.env`
 *    de Next expande variables al estilo del intérprete de comandos, así que un
 *    `$16384` dentro del valor lo toma por una variable inexistente y **borra
 *    el resto del texto**. El servidor recibía `scrypt` a secas y ninguna
 *    contraseña podía coincidir nunca. Con puntos no hay nada que expandir.
 *
 * 2. **Las comparaciones son de tiempo constante.** Un `===` normal se detiene
 *    en el primer carácter distinto, y medir esa diferencia permite adivinar la
 *    firma byte a byte. `timingSafeEqual` siempre tarda lo mismo.
 *
 * 3. **El contador de intentos vive en memoria.** En un servidor propio frena
 *    la fuerza bruta; en un hosting sin estado, cada petición puede caer en una
 *    instancia nueva y el contador se reinicia. Ahí la defensa real es que
 *    scrypt es deliberadamente lento y que la contraseña sea larga. No lo
 *    consideres una protección fuerte por sí solo.
 */

/** Coste de scrypt. Alto a propósito: encarece probar contraseñas en masa. */
const SCRYPT_N = 16384;
const SCRYPT_LONGITUD = 64;

/**
 * `scrypt` con promesa, escrito a mano en vez de con `promisify`.
 *
 * `promisify` se queda con la primera firma sobrecargada de la función, que es
 * la que no admite opciones, y así no hay forma de pasarle el coste `N`. Con la
 * envoltura explícita el coste es configurable y el tipo de retorno correcto.
 */
function derivarClave(
  contrasena: string,
  sal: Buffer,
  longitud: number,
  n: number
): Promise<Buffer> {
  return new Promise((resolver, rechazar) => {
    scrypt(contrasena, sal, longitud, { N: n }, (error, clave) => {
      if (error) rechazar(error);
      else resolver(clave);
    });
  });
}

export const COOKIE_SESION = "erg_admin";
/** Ocho horas: una jornada. Al día siguiente hay que volver a entrar. */
const DURACION_MS = 8 * 60 * 60 * 1000;

function secretoSesion(): string {
  const secreto = process.env.ADMIN_SESSION_SECRET;
  if (!secreto || secreto.length < 32) {
    throw new Error(
      "ADMIN_SESSION_SECRET no está configurada o es demasiado corta (mínimo 32 caracteres)."
    );
  }
  return secreto;
}

const aBase64Url = (b: Buffer) => b.toString("base64url");

/** Compara dos textos sin filtrar por dónde dejaron de parecerse. */
function igualSeguro(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  // `timingSafeEqual` exige la misma longitud, y la longitud sí se puede
  // comprobar antes: no revela nada útil sobre el contenido.
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Genera el valor que va en `ADMIN_PASSWORD_HASH`.
 * Se usa desde `npm run admin:clave`; en la aplicación no se llama nunca.
 */
export async function generarHashContrasena(contrasena: string): Promise<string> {
  const sal = randomBytes(16);
  const derivada = await derivarClave(
    contrasena.trim().normalize("NFKC"),
    sal,
    SCRYPT_LONGITUD,
    SCRYPT_N
  );
  return `scrypt.${SCRYPT_N}.${sal.toString("hex")}.${derivada.toString("hex")}`;
}

/** ¿Coincide la contraseña tecleada con el resumen configurado? */
export async function contrasenaValida(contrasena: string): Promise<boolean> {
  const guardado = process.env.ADMIN_PASSWORD_HASH;
  if (!guardado) return false;

  /*
   * Se admiten los dos separadores. El punto es el formato actual; el `$` era
   * el anterior y sigue valiendo cuando la variable se define directamente en
   * el panel del hosting, donde no hay expansión que la rompa.
   */
  const partes = guardado.includes(".") ? guardado.split(".") : guardado.split("$");

  if (guardado === "scrypt") {
    // Síntoma inconfundible del hash comido por la expansión de variables.
    console.error(
      "[admin] ADMIN_PASSWORD_HASH llegó truncado a \"scrypt\": el archivo .env expandió " +
        "los `$` del valor. Genera uno nuevo con `npm run admin:clave`, que ya usa puntos."
    );
    return false;
  }
  if (partes.length !== 4 || partes[0] !== "scrypt") return false;

  const n = Number(partes[1]);
  if (!Number.isInteger(n) || n < 1024) return false;

  let sal: Buffer;
  let esperado: Buffer;
  try {
    sal = Buffer.from(partes[2], "hex");
    esperado = Buffer.from(partes[3], "hex");
  } catch {
    return false;
  }
  if (sal.length === 0 || esperado.length === 0) return false;

  /*
   * `trim()` antes de comparar, igual que hace el generador al crear el hash.
   *
   * Sin esto los dos lados no eran simétricos: `admin:clave` recorta los
   * espacios de los extremos, así que es imposible que exista un hash de una
   * frase que empiece o acabe en espacio; pero aquí llegaba la frase tal cual.
   * Resultado: un espacio de más al teclear —o el que añade el gestor de
   * contraseñas del navegador al autocompletar— daba "contraseña incorrecta"
   * sin ninguna pista de por qué.
   */
  const derivada = await derivarClave(contrasena.trim().normalize("NFKC"), sal, esperado.length, n);
  return derivada.length === esperado.length && timingSafeEqual(derivada, esperado);
}

/** Crea el texto firmado que se guarda en la cookie. */
export function crearSesion(): string {
  const carga = aBase64Url(Buffer.from(JSON.stringify({ exp: Date.now() + DURACION_MS })));
  const firma = createHmac("sha256", secretoSesion()).update(carga).digest("base64url");
  return `${carga}.${firma}`;
}

/** ¿Es una sesión firmada por nosotros y todavía vigente? */
export function sesionValida(token: string | undefined): boolean {
  if (!token) return false;
  const corte = token.lastIndexOf(".");
  if (corte <= 0) return false;

  const carga = token.slice(0, corte);
  const firma = token.slice(corte + 1);

  let esperada: string;
  try {
    esperada = createHmac("sha256", secretoSesion()).update(carga).digest("base64url");
  } catch {
    // Falta el secreto: sin él no se puede validar nada, así que no hay sesión.
    return false;
  }
  if (!igualSeguro(firma, esperada)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(carga, "base64url").toString());
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}

/**
 * Atributos de la cookie de sesión.
 *
 * `httpOnly` para que ningún script pueda leerla, `sameSite: lax` para que no
 * viaje en peticiones nacidas en otro sitio (que es lo que neutraliza el CSRF
 * en los formularios del panel) y `secure` fuera de desarrollo, donde no hay
 * HTTPS en localhost.
 */
export function opcionesCookie(): string {
  const partes = [
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${Math.floor(DURACION_MS / 1000)}`,
  ];
  if (process.env.NODE_ENV === "production") partes.push("Secure");
  return partes.join("; ");
}

/** Cabecera que borra la cookie al cerrar sesión. */
export function cookieBorrada(): string {
  const partes = [`${COOKIE_SESION}=`, `Path=/`, `HttpOnly`, `SameSite=Lax`, `Max-Age=0`];
  if (process.env.NODE_ENV === "production") partes.push("Secure");
  return partes.join("; ");
}

/**
 * Freno de intentos por dirección IP.
 *
 * Ver la nota 3 de la cabecera: es una barrera contra el ruido, no contra un
 * atacante decidido en un hosting sin estado.
 */
const intentos = new Map<string, { fallos: number; hasta: number }>();
const MAX_FALLOS = 8;
const BLOQUEO_MS = 15 * 60 * 1000;

export function bloqueado(ip: string): boolean {
  const registro = intentos.get(ip);
  if (!registro) return false;
  if (Date.now() > registro.hasta) {
    intentos.delete(ip);
    return false;
  }
  return registro.fallos >= MAX_FALLOS;
}

export function anotarFallo(ip: string): void {
  const registro = intentos.get(ip) ?? { fallos: 0, hasta: Date.now() + BLOQUEO_MS };
  registro.fallos += 1;
  registro.hasta = Date.now() + BLOQUEO_MS;
  intentos.set(ip, registro);
}

export function limpiarIntentos(ip: string): void {
  intentos.delete(ip);
}
