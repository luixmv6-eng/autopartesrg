import { stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { rutaImagenSegura } from "@/lib/admin/almacen";

/**
 * Sirve las fotos que la empresa sube desde el panel.
 *
 * No están en `public/` a propósito. `public/` forma parte del código que se
 * despliega: una foto guardada ahí desaparecería en la siguiente actualización
 * del sitio. Al vivir en la carpeta de datos, sobreviven a cualquier despliegue,
 * igual que el catálogo.
 *
 * El precio de esa decisión es este archivo: hay que servirlas nosotros.
 *
 * ## Sobre la caché
 *
 * El nombre de la foto se deriva del identificador del repuesto, así que
 * reemplazar la imagen de un producto **no cambia su URL**. Con una caché larga,
 * el navegador seguiría enseñando la foto vieja durante días y parecería que el
 * cambio no se guardó. Por eso se usa una `ETag` construida con la fecha y el
 * tamaño del archivo: el navegador pregunta, y si nada cambió recibe un 304 de
 * dos bytes; si cambió, recibe la nueva al instante.
 */

const TIPOS: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(
  request: Request,
  contexto: { params: Promise<{ nombre: string }> }
) {
  // En Next 16 los parámetros de ruta son una promesa.
  const { nombre } = await contexto.params;

  const ruta = rutaImagenSegura(nombre);
  if (!ruta) return new Response("No encontrada", { status: 404 });

  const info = await stat(ruta);
  const etiqueta = `"${info.mtimeMs.toString(36)}-${info.size.toString(36)}"`;

  if (request.headers.get("if-none-match") === etiqueta) {
    return new Response(null, { status: 304, headers: { ETag: etiqueta } });
  }

  const extension = nombre.split(".").pop()?.toLowerCase() ?? "";
  const cuerpo = Readable.toWeb(createReadStream(ruta)) as ReadableStream;

  return new Response(cuerpo, {
    headers: {
      "Content-Type": TIPOS[extension] ?? "application/octet-stream",
      "Content-Length": String(info.size),
      ETag: etiqueta,
      /*
       * Caché permanente, porque el nombre del fichero ya identifica al
       * contenido: al subir una foto desde el panel se guarda como
       * `id-marcaDeTiempo.jpg`, así que una foto distinta es siempre una
       * dirección distinta. Cambiar la imagen de un repuesto no reescribe este
       * fichero, escribe otro nuevo y actualiza el catálogo para que apunte
       * ahí. Por eso nunca hay nada rancio que servir.
       *
       * Antes iba con `max-age=0, must-revalidate`, que obligaba a preguntar
       * por cada una de las doce fotos de la portada en cada visita. Peor aún,
       * el optimizador de imágenes de Next hereda de aquí su propia caducidad:
       * con cero segundos volvía a leer y a recodificar los WebP una y otra
       * vez, que es justo el trabajo más caro del servidor. En un alojamiento
       * compartido eso se nota.
       *
       * El ETag se mantiene: si algo revalida de todos modos, la respuesta es
       * un 304 sin cuerpo.
       */
      "Cache-Control": "public, max-age=31536000, immutable",
      // Refuerza que el navegador no intente interpretar esto como otra cosa.
      "X-Content-Type-Options": "nosniff",
    },
  });
}
