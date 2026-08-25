import { cookies } from "next/headers";
import { COOKIE_SESION, sesionValida } from "@/lib/admin/sesion";
import { configuracionCompleta, guardarImagen } from "@/lib/admin/almacen";
import { URL_FOTO, generarId } from "@/lib/admin/esquema";

/**
 * Subida de la foto de un repuesto.
 *
 * Una subida de archivos es de las piezas más delicadas de cualquier panel, así
 * que aquí no se acepta nada por su palabra:
 *
 * - **El nombre lo ponemos nosotros.** Se deriva del identificador del producto,
 *   ya saneado por `generarId`. El nombre original del archivo se descarta por
 *   completo, que es lo que impide un `../../` o un `.php` colado en la ruta.
 * - **El tipo se comprueba en los bytes.** La cabecera `Content-Type` la escribe
 *   quien envía, así que no prueba nada; los primeros bytes de un JPEG, un PNG o
 *   un WebP sí son inconfundibles.
 * - **El tamaño se acota** antes de leer el archivo entero en memoria.
 *
 * Al nombre se le añade una marca de tiempo. No es capricho: sin ella, cambiar
 * la foto de un repuesto mantendría la misma dirección, y tanto el navegador
 * como el optimizador de imágenes seguirían enseñando la anterior durante horas.
 * Con un nombre nuevo en cada subida, el cambio se ve al instante y la foto vieja
 * se borra al guardar el producto.
 */

/** Cuatro megas: de sobra para una foto de catálogo y poco para agotar memoria. */
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Firmas de archivo. Se comprueban sobre los bytes reales.
 * WebP necesita dos trozos: "RIFF" al principio y "WEBP" en la posición 8.
 */
function detectarTipo(bytes: Uint8Array): "jpg" | "png" | "webp" | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }
  const texto = (inicio: number, fin: number) => String.fromCharCode(...bytes.slice(inicio, fin));
  if (texto(0, 4) === "RIFF" && texto(8, 12) === "WEBP") return "webp";
  return null;
}

export async function POST(request: Request) {
  const tarro = await cookies();
  if (!sesionValida(tarro.get(COOKIE_SESION)?.value)) {
    return Response.json({ error: "Tu sesión caducó. Vuelve a entrar." }, { status: 401 });
  }
  if (!configuracionCompleta()) {
    return Response.json({ error: "El panel no está configurado del todo." }, { status: 503 });
  }

  let formulario: FormData;
  try {
    formulario = await request.formData();
  } catch {
    return Response.json({ error: "No se pudo leer el archivo enviado." }, { status: 400 });
  }

  const archivo = formulario.get("archivo");
  const idBruto = formulario.get("id");

  if (!(archivo instanceof File)) {
    return Response.json({ error: "No llegó ninguna foto." }, { status: 400 });
  }
  if (archivo.size === 0) {
    return Response.json({ error: "El archivo está vacío." }, { status: 400 });
  }
  if (archivo.size > MAX_BYTES) {
    return Response.json(
      { error: `La foto pesa ${(archivo.size / 1024 / 1024).toFixed(1)} MB. El máximo son 4 MB.` },
      { status: 413 }
    );
  }

  const id = generarId(typeof idBruto === "string" ? idBruto : "");
  if (!id) {
    return Response.json(
      { error: "Escribe primero el nombre del repuesto: la foto se guarda con ese nombre." },
      { status: 400 }
    );
  }

  const bytes = new Uint8Array(await archivo.arrayBuffer());
  const tipo = detectarTipo(bytes);
  if (!tipo) {
    return Response.json({ error: "El archivo no es una imagen JPG, PNG ni WebP." }, { status: 415 });
  }

  const nombre = `${id}-${Date.now().toString(36)}.${tipo}`;

  try {
    await guardarImagen(nombre, Buffer.from(bytes));
  } catch (error) {
    const mensaje =
      error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "EACCES"
        ? "El servidor no tiene permiso de escritura en la carpeta de datos."
        : "No se pudo guardar la foto en el servidor.";
    return Response.json({ error: mensaje }, { status: 500 });
  }

  return Response.json({ ok: true, imagen: URL_FOTO + nombre });
}
