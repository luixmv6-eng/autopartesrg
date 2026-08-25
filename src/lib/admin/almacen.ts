import { copyFile, mkdir, readFile, readdir, rename, unlink, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, sep } from "node:path";
import { URL_FOTO } from "./esquema";
import { MARCAS_INICIALES, type Opcion } from "@/lib/taxonomia";
import type { MarcaId, Producto } from "@/lib/types";

/**
 * Almacén del catálogo: archivos en el disco del servidor.
 *
 * Sustituye a lo que en otros proyectos sería una base de datos. Para un
 * catálogo de decenas o pocos cientos de repuestos, un archivo JSON leído
 * entero es más rápido que cualquier consulta a base de datos, y no hay
 * servidor de datos que instalar, actualizar ni pagar.
 *
 * Todo vive bajo una única carpeta, configurable con `ADMIN_DATA_DIR`:
 *
 *     datos/
 *       productos.json      el catálogo en vivo
 *       marcas.json         las marcas de vehículo, ampliables desde el panel
 *       imagenes/           las fotos que se suben desde el panel
 *       copias/             copias de seguridad automáticas
 *
 * Está **fuera** de `src/` y de `public/` a propósito. Si el catálogo viviera
 * dentro del proyecto, cada vez que se subiera una versión nueva del código se
 * sobrescribiría con el archivo del repositorio y la empresa perdería todo lo
 * que hubiera editado. Al estar aparte, actualizar el sitio no toca los datos.
 *
 * ## Sobre las copias de seguridad
 *
 * Aquí no hay historial de cambios como lo tendría un repositorio, así que las
 * copias no son un extra: son la única forma de deshacer un borrado. Antes de
 * **cada** escritura se guarda el estado anterior. Son archivos de texto de unos
 * pocos kilobytes; conservar los últimos treinta no cuesta nada y cubre semanas.
 *
 * ## Sobre la escritura
 *
 * Se escribe primero en un archivo temporal y luego se renombra encima del
 * bueno. El renombrado es atómico: si se va la luz a mitad, el catálogo queda
 * intacto en su versión anterior en vez de a medio escribir, que es como se
 * pierde un archivo entero.
 */

/** Raíz de los datos. Por defecto, `datos/` junto al proyecto. */
export function directorioDatos(): string {
  return resolve(process.env.ADMIN_DATA_DIR || join(process.cwd(), "datos"));
}

export const rutaCatalogo = () => join(directorioDatos(), "productos.json");
export const rutaMarcas = () => join(directorioDatos(), "marcas.json");
export const rutaImagenes = () => join(directorioDatos(), "imagenes");
export const rutaCopias = () => join(directorioDatos(), "copias");

/** Semilla: el catálogo y las fotos que viajan con el código, para el primer arranque. */
const SEMILLA_CATALOGO = join(process.cwd(), "src", "data", "productos.json");
const SEMILLA_FOTOS = join(process.cwd(), "public", "images", "parts");

const MAX_COPIAS = 30;

async function asegurarCarpetas(): Promise<void> {
  await mkdir(rutaImagenes(), { recursive: true });
  await mkdir(rutaCopias(), { recursive: true });
}

/**
 * Lee el catálogo.
 *
 * La primera vez que arranca no existe todavía, así que se copia el que viene
 * con el código. Así la empresa encuentra sus 50 repuestos ya cargados en vez de
 * un panel vacío, y a partir de ahí el archivo del repositorio no se vuelve a
 * mirar nunca.
 */
export async function leerCatalogo(): Promise<Producto[]> {
  await asegurarCarpetas();
  const ruta = rutaCatalogo();

  if (!existsSync(ruta)) await sembrar();

  const crudo = await readFile(ruta, "utf8");
  const datos = JSON.parse(crudo);
  if (!Array.isArray(datos)) throw new Error("productos.json no contiene una lista.");
  return datos as Producto[];
}

/**
 * Primer arranque: traslada a la carpeta de datos el catálogo y las fotos que
 * vienen con el código.
 *
 * Las fotos se copian, no se enlazan, y las rutas de los productos se reescriben
 * de `/images/parts/…` a `/api/foto/…`. A partir de ahí todo lo que la empresa
 * administra vive en un único sitio, fuera del código: actualizar el sitio no
 * puede pisarlo, y hacer una copia de seguridad es copiar una carpeta.
 */
async function sembrar(): Promise<void> {
  let productos: Producto[] = [];
  if (existsSync(SEMILLA_CATALOGO)) {
    productos = JSON.parse(await readFile(SEMILLA_CATALOGO, "utf8")) as Producto[];
  }

  if (existsSync(SEMILLA_FOTOS)) {
    for (const archivo of await readdir(SEMILLA_FOTOS)) {
      if (!/\.(jpg|jpeg|png|webp)$/i.test(archivo)) continue;
      await copyFile(join(SEMILLA_FOTOS, archivo), join(rutaImagenes(), archivo));
    }
  }

  const migrados = productos.map((p) => ({
    ...p,
    imagen: p.imagen.startsWith("/images/parts/")
      ? URL_FOTO + p.imagen.slice("/images/parts/".length)
      : p.imagen,
  }));

  await writeFile(rutaCatalogo(), `${JSON.stringify(migrados, null, 2)}\n`, "utf8");
}

/**
 * Lee las marcas de vehículo.
 *
 * La primera vez siembra el archivo con las que vienen en el código. A partir
 * de ahí manda este archivo: la empresa puede añadir marcas desde el panel, y
 * el código ya no vuelve a mirarse.
 */
export async function leerMarcas(): Promise<Opcion<MarcaId>[]> {
  await asegurarCarpetas();
  const ruta = rutaMarcas();

  if (!existsSync(ruta)) {
    await writeFile(ruta, `${JSON.stringify(MARCAS_INICIALES, null, 2)}
`, "utf8");
  }

  const datos = JSON.parse(await readFile(ruta, "utf8"));
  if (!Array.isArray(datos)) throw new Error("marcas.json no contiene una lista.");

  // Se filtra al leer, no solo al escribir: un archivo editado a mano no debe
  // poder meter entradas rotas en los filtros del sitio público.
  return (datos as Opcion<MarcaId>[])
    .filter((m) => m && typeof m.id === "string" && typeof m.label === "string" && m.id && m.label)
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

/** Escribe la lista completa de marcas, de forma atómica. */
export async function escribirMarcas(marcas: Opcion<MarcaId>[]): Promise<void> {
  await asegurarCarpetas();
  const destino = rutaMarcas();
  const temporal = `${destino}.tmp`;
  await writeFile(temporal, `${JSON.stringify(marcas, null, 2)}
`, "utf8");
  await rename(temporal, destino);
}

/** Guarda una copia del catálogo actual y descarta las más antiguas. */
async function guardarCopia(): Promise<void> {
  const ruta = rutaCatalogo();
  if (!existsSync(ruta)) return;

  const marca = new Date().toISOString().replace(/[:.]/g, "-");
  await writeFile(join(rutaCopias(), `productos-${marca}.json`), await readFile(ruta), "utf8");

  const archivos = (await readdir(rutaCopias()))
    .filter((n) => n.startsWith("productos-") && n.endsWith(".json"))
    .sort();
  for (const viejo of archivos.slice(0, Math.max(0, archivos.length - MAX_COPIAS))) {
    await unlink(join(rutaCopias(), viejo)).catch(() => {});
  }
}

/** Escribe el catálogo entero, con copia previa y de forma atómica. */
export async function escribirCatalogo(contenido: string): Promise<void> {
  await asegurarCarpetas();
  await guardarCopia();

  const destino = rutaCatalogo();
  const temporal = `${destino}.tmp`;
  await writeFile(temporal, contenido, "utf8");
  await rename(temporal, destino);
}

/**
 * Guarda la foto de un repuesto y devuelve el nombre con el que quedó.
 *
 * El nombre lo decide quien llama (derivado del identificador del producto, ya
 * saneado); aquí no se acepta ninguna ruta, solo un nombre de archivo, y se
 * comprueba que no contenga separadores antes de tocar el disco.
 */
export async function guardarImagen(nombre: string, datos: Buffer): Promise<void> {
  if (!/^[a-z0-9-]+\.(jpg|jpeg|png|webp)$/i.test(nombre)) {
    throw new Error(`Nombre de imagen no admitido: ${nombre}`);
  }
  await asegurarCarpetas();
  const destino = join(rutaImagenes(), nombre);
  const temporal = `${destino}.tmp`;
  await writeFile(temporal, datos);
  await rename(temporal, destino);
}

/** Borra la foto de un repuesto. No falla si ya no está. */
export async function borrarImagen(nombre: string): Promise<void> {
  if (!/^[a-z0-9-]+\.(jpg|jpeg|png|webp)$/i.test(nombre)) return;
  await unlink(join(rutaImagenes(), nombre)).catch(() => {});
}

/**
 * Devuelve la ruta absoluta de una foto para poder servirla.
 *
 * Se vuelve a comprobar el nombre aquí, aunque ya venga comprobado de antes: es
 * el punto donde un nombre con `..` se convertiría en leer un archivo cualquiera
 * del servidor. Nunca se confía en que la comprobación de arriba se hizo.
 */
export function rutaImagenSegura(nombre: string): string | null {
  if (!/^[a-z0-9-]+\.(jpg|jpeg|png|webp)$/i.test(nombre)) return null;
  const destino = join(rutaImagenes(), nombre);
  // Cinturón y tirantes: el resultado tiene que seguir dentro de la carpeta.
  if (!destino.startsWith(rutaImagenes())) return null;
  return existsSync(destino) ? destino : null;
}

/**
 * ¿Los datos están dentro de la carpeta del proyecto?
 *
 * Si lo están, la próxima vez que se despliegue una versión nueva del sitio se
 * llevará por delante el catálogo y las fotos que la empresa haya editado. En
 * hostings que reemplazan la carpeta de la aplicación en cada despliegue —que
 * son casi todos— eso no es un riesgo teórico: pasa a la primera actualización.
 *
 * Vale como valor por defecto para trabajar en local, donde nadie despliega
 * nada. En un servidor hay que apuntar `ADMIN_DATA_DIR` fuera, y el panel avisa
 * mientras no se haga.
 */
export function datosDentroDelProyecto(): boolean {
  const datos = directorioDatos();
  const proyecto = resolve(process.cwd());
  return datos === proyecto || datos.startsWith(proyecto + sep);
}

/** ¿Está el panel listo para funcionar? */
export function configuracionCompleta(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_SESSION_SECRET);
}
