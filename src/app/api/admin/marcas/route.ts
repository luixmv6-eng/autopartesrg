import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { COOKIE_SESION, sesionValida } from "@/lib/admin/sesion";
import { configuracionCompleta, escribirMarcas, leerMarcas } from "@/lib/admin/almacen";
import { generarId } from "@/lib/admin/esquema";

/**
 * Marcas de vehículo: listar y añadir.
 *
 * Antes eran una constante del código y ampliarlas exigía tocar dos archivos y
 * volver a desplegar. Ahora viven en `marcas.json`, junto al catálogo, y se
 * añaden desde el propio formulario de alta de repuestos: quien está creando un
 * producto de una marca nueva no tiene por qué interrumpir su trabajo ni llamar
 * a nadie.
 *
 * **No hay borrado**, y es deliberado. Eliminar una marca dejaría huérfanos a
 * los repuestos que la usan: quedarían con un identificador que ya no tiene
 * nombre, invisibles en el filtro pero presentes en el catálogo. Para retirar
 * una marca hay que reasignar antes sus productos, y eso es una operación que
 * merece pensarse, no un botón. Una marca sin repuestos tampoco estorba: la
 * barra de filtros solo muestra las que tienen alguno.
 */

/** Tope de longitud del nombre visible. Da para "Mercedes-Benz" de sobra. */
const MAX_NOMBRE = 40;

async function autorizado(): Promise<boolean> {
  const tarro = await cookies();
  return sesionValida(tarro.get(COOKIE_SESION)?.value);
}

const noAutorizado = () =>
  Response.json({ error: "Tu sesión caducó. Vuelve a entrar." }, { status: 401 });

/** Quita caracteres de control, que no se ven pero llegan hasta el HTML. */
function limpiar(valor: unknown): string {
  if (typeof valor !== "string") return "";
  let salida = "";
  for (const caracter of valor) {
    const codigo = caracter.codePointAt(0) ?? 0;
    if (codigo >= 0x20 && !(codigo >= 0x7f && codigo <= 0x9f)) salida += caracter;
  }
  return salida.trim();
}

export async function GET() {
  if (!(await autorizado())) return noAutorizado();
  try {
    return Response.json({ marcas: await leerMarcas() });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "No se pudieron leer las marcas.";
    return Response.json({ error: mensaje }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await autorizado())) return noAutorizado();
  if (!configuracionCompleta()) {
    return Response.json({ error: "El panel no está configurado del todo." }, { status: 503 });
  }

  let nombre = "";
  try {
    nombre = limpiar(((await request.json()) as { nombre?: unknown }).nombre);
  } catch {
    return Response.json({ error: "Petición mal formada." }, { status: 400 });
  }

  if (!nombre) {
    return Response.json({ error: "Escribe el nombre de la marca." }, { status: 422 });
  }
  if (nombre.length > MAX_NOMBRE) {
    return Response.json(
      { error: `El nombre no puede pasar de ${MAX_NOMBRE} caracteres.` },
      { status: 422 }
    );
  }

  // El identificador se deriva del nombre con la misma función que los
  // productos: minúsculas, sin tildes, solo letras, dígitos y guiones.
  const id = generarId(nombre);
  if (!id) {
    return Response.json(
      { error: "Ese nombre no produce un identificador válido. Usa letras y números." },
      { status: 422 }
    );
  }

  try {
    const marcas = await leerMarcas();

    // Duplicados por identificador, no por nombre: "Land Rover" y "land-rover"
    // son la misma marca escrita de dos maneras.
    const existente = marcas.find((m) => m.id === id);
    if (existente) {
      return Response.json(
        { error: `"${existente.label}" ya está en la lista.`, marcas, marca: existente },
        { status: 409 }
      );
    }

    const marca = { id, label: nombre };
    const siguiente = [...marcas, marca].sort((a, b) => a.label.localeCompare(b.label, "es"));
    await escribirMarcas(siguiente);

    // La portada tiene que reflejar la marca nueva en cuanto se use.
    revalidatePath("/");

    return Response.json({ ok: true, marca, marcas: siguiente });
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : "No se pudo guardar la marca.";
    return Response.json({ error: mensaje }, { status: 500 });
  }
}
