import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { COOKIE_SESION, sesionValida } from "@/lib/admin/sesion";
import {
  borrarImagen,
  configuracionCompleta,
  escribirCatalogo,
  leerCatalogo,
  leerMarcas,
} from "@/lib/admin/almacen";
import { serializarCatalogo, validarProducto } from "@/lib/admin/esquema";

/**
 * El catálogo: leer, crear, actualizar y eliminar.
 *
 * Escribe en un archivo del servidor, sin base de datos ni servicios externos.
 * Al terminar cada cambio se llama a `revalidatePath("/")`, que hace que Next
 * regenere la portada con los datos nuevos: la empresa guarda y, al recargar, el
 * catálogo público ya está actualizado. Sin eso, la página seguiría sirviendo la
 * versión guardada en caché hasta que alguien reiniciara el servidor.
 *
 * ## Sobre escrituras simultáneas
 *
 * Cada operación es un ciclo leer-modificar-escribir sobre el archivo entero. Si
 * dos personas guardaran a la vez, sus ciclos podrían entrelazarse y el segundo
 * borraría el cambio del primero. El turno de abajo lo impide: las escrituras se
 * encadenan y se ejecutan de una en una.
 */

/** Turno de escritura: encadena las operaciones para que no se solapen. */
let turno: Promise<unknown> = Promise.resolve();
function enTurno<T>(tarea: () => Promise<T>): Promise<T> {
  const resultado = turno.then(tarea, tarea);
  // El turno sigue aunque una tarea falle; si no, un error dejaría la cola parada.
  turno = resultado.catch(() => {});
  return resultado;
}

async function autorizado(): Promise<boolean> {
  const tarro = await cookies();
  return sesionValida(tarro.get(COOKIE_SESION)?.value);
}

const noAutorizado = () =>
  Response.json({ error: "Tu sesión caducó. Vuelve a entrar." }, { status: 401 });

const sinConfigurar = () =>
  Response.json(
    {
      error:
        "El panel no está configurado. Faltan ADMIN_PASSWORD_HASH y ADMIN_SESSION_SECRET en el servidor.",
    },
    { status: 503 }
  );

function respuestaDeError(error: unknown): Response {
  const mensaje = error instanceof Error ? error.message : "Error inesperado.";
  return Response.json({ error: mensaje }, { status: 500 });
}

/** Nombre del archivo dentro de una ruta `/api/foto/…`. */
const archivoDe = (ruta: string) => ruta.split("/").pop() ?? "";

export async function GET() {
  if (!(await autorizado())) return noAutorizado();
  if (!configuracionCompleta()) return sinConfigurar();

  try {
    return Response.json({ productos: await leerCatalogo() });
  } catch (error) {
    return respuestaDeError(error);
  }
}

export async function PUT(request: Request) {
  if (!(await autorizado())) return noAutorizado();
  if (!configuracionCompleta()) return sinConfigurar();

  let entrada: unknown;
  try {
    entrada = ((await request.json()) as { producto?: unknown }).producto;
  } catch {
    return Response.json({ error: "Petición mal formada." }, { status: 400 });
  }

  try {
    return await enTurno(async () => {
      const [productos, marcas] = await Promise.all([leerCatalogo(), leerMarcas()]);

      // El identificador original permite renombrar un repuesto sin que choque
      // consigo mismo al comprobar duplicados.
      const idOriginal =
        typeof (entrada as Record<string, unknown>)?.idOriginal === "string"
          ? ((entrada as Record<string, unknown>).idOriginal as string)
          : undefined;

      const validacion = validarProducto(entrada, {
        idsExistentes: new Set(productos.map((p) => p.id)),
        idOriginal,
        // Se lee ahora, no al importar: la empresa pudo añadir una marca hace
        // un segundo desde el propio formulario.
        marcasValidas: new Set(marcas.map((m) => m.id)),
      });

      if (!validacion.ok || !validacion.producto) {
        return Response.json(
          { error: "Revisa los campos marcados.", errores: validacion.errores },
          { status: 422 }
        );
      }

      const producto = validacion.producto;
      const indice = productos.findIndex((p) => p.id === (idOriginal ?? producto.id));
      const esNuevo = indice === -1;
      const anterior = esNuevo ? null : productos[indice];

      const siguiente = esNuevo
        ? [...productos, producto]
        : productos.map((p, i) => (i === indice ? producto : p));

      await escribirCatalogo(serializarCatalogo(siguiente));

      /*
       * Si se cambió la foto, la vieja ya no la usa nadie: cada subida genera un
       * nombre nuevo, así que no hay riesgo de borrar una que otro producto
       * comparta. Se hace después de guardar, para que un fallo aquí no impida
       * que el cambio quede escrito.
       */
      if (anterior && anterior.imagen !== producto.imagen) {
        await borrarImagen(archivoDe(anterior.imagen)).catch(() => {});
      }

      revalidatePath("/");
      return Response.json({ ok: true, producto, esNuevo });
    });
  } catch (error) {
    return respuestaDeError(error);
  }
}

export async function DELETE(request: Request) {
  if (!(await autorizado())) return noAutorizado();
  if (!configuracionCompleta()) return sinConfigurar();

  let id = "";
  try {
    const cuerpo = (await request.json()) as { id?: unknown };
    id = typeof cuerpo.id === "string" ? cuerpo.id : "";
  } catch {
    return Response.json({ error: "Petición mal formada." }, { status: 400 });
  }
  if (!id) return Response.json({ error: "Falta el identificador." }, { status: 400 });

  try {
    return await enTurno(async () => {
      const productos = await leerCatalogo();
      const objetivo = productos.find((p) => p.id === id);
      if (!objetivo) {
        return Response.json({ error: "Ese repuesto ya no existe." }, { status: 404 });
      }

      await escribirCatalogo(serializarCatalogo(productos.filter((p) => p.id !== id)));
      await borrarImagen(archivoDe(objetivo.imagen)).catch(() => {});

      revalidatePath("/");
      return Response.json({ ok: true });
    });
  } catch (error) {
    return respuestaDeError(error);
  }
}
