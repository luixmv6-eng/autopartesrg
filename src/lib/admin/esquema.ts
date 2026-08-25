import { CATEGORIAS, SECCIONES } from "@/lib/taxonomia";
import type { CategoriaId, MarcaId, Producto, SeccionId } from "@/lib/types";

/**
 * Validación de un producto que llega del panel de administración.
 *
 * Esta es la frontera de seguridad del panel. Todo lo que pase por aquí acaba
 * escrito en `productos.json` del repositorio, se publica en el sitio y lo lee
 * Google. Un campo mal validado no es un error de formulario: es contenido
 * arbitrario en producción, y el repositorio guarda el historial para siempre.
 *
 * Por eso no se confía en el formulario del navegador. El `<input>` puede tener
 * `maxlength` y `required`, pero eso solo ayuda a quien lo usa bien; quien
 * quiera saltárselo manda la petición directa. La comprobación de verdad es
 * esta, en el servidor.
 *
 * El criterio es lista blanca en todo lo que se pueda: marca, categoría y
 * sección tienen que existir en `taxonomia.ts`, el identificador solo admite
 * un alfabeto reducido y la ruta de la imagen se construye aquí en vez de
 * aceptarse tal cual.
 */

/**
 * Prefijo público de las fotos.
 *
 * Vive aquí y no en `almacen.ts` porque este archivo lo importa también el
 * formulario del navegador, y `almacen.ts` usa `node:fs`: arrastrarlo al
 * paquete del cliente rompería la compilación.
 */
export const URL_FOTO = "/api/foto/";

const IDS_CATEGORIA = new Set<string>(CATEGORIAS.map((c) => c.id));
const IDS_SECCION = new Set<string>(SECCIONES.map((s) => s.id));

const ANIO_MIN = 1950;
const ANIO_MAX = new Date().getFullYear() + 2;

/** Límites de longitud. Generosos para escribir, pero acotados. */
const LIMITES = {
  id: 80,
  nombre: 140,
  descripcion: 700,
  oem: 40,
  modelo: 60,
  modelos: 12,
} as const;

export interface ResultadoValidacion {
  ok: boolean;
  /** Errores por campo, en español y listos para pintar junto al `<input>`. */
  errores: Record<string, string>;
  /** El producto ya saneado. Solo tiene sentido si `ok` es `true`. */
  producto?: Producto;
}

/**
 * Convierte un texto libre en identificador.
 *
 * El `id` es a la vez clave de React, ancla de la URL y **nombre del archivo de
 * la foto**. Eso último es lo que obliga a ser estricto: si se admitiera
 * cualquier carácter, un `id` con `../` escribiría fuera de la carpeta de
 * imágenes al subir la foto. Se reduce a minúsculas sin tildes, dígitos y
 * guiones, y nada más.
 */
export function generarId(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, LIMITES.id);
}

/** Quita caracteres de control, que no se ven pero viajan hasta el HTML. */
function limpiar(valor: unknown): string {
  if (typeof valor !== "string") return "";
  let salida = "";
  for (const caracter of valor) {
    const codigo = caracter.codePointAt(0) ?? 0;
    if (codigo >= 0x20 && !(codigo >= 0x7f && codigo <= 0x9f)) salida += caracter;
  }
  return salida.trim();
}

function numero(valor: unknown): number | null {
  if (typeof valor === "number" && Number.isInteger(valor)) return valor;
  if (typeof valor === "string" && /^\d{1,4}$/.test(valor.trim())) return Number(valor.trim());
  return null;
}

/**
 * Valida y sanea un producto entrante.
 *
 * `idsExistentes` sirve para detectar duplicados al crear. Al editar se pasa el
 * `idOriginal`, que queda excluido de esa comprobación: un producto no colisiona
 * consigo mismo.
 */
export function validarProducto(
  entrada: unknown,
  opciones: {
    idsExistentes?: Set<string>;
    idOriginal?: string;
    /**
     * Marcas admitidas, leídas de los datos en el momento de guardar.
     *
     * Va por parámetro y no como constante del módulo porque la lista es
     * editable desde el panel: fijarla al importar dejaría fuera cualquier
     * marca añadida después de arrancar el servidor.
     */
    marcasValidas?: Set<string>;
  } = {}
): ResultadoValidacion {
  const errores: Record<string, string> = {};
  const datos = (entrada ?? {}) as Record<string, unknown>;

  const nombre = limpiar(datos.nombre);
  if (!nombre) errores.nombre = "El nombre es obligatorio.";
  else if (nombre.length > LIMITES.nombre)
    errores.nombre = `El nombre no puede pasar de ${LIMITES.nombre} caracteres.`;

  /*
   * El identificador se deriva del nombre al crear, para que quien da de alta un
   * repuesto no tenga que inventárselo.
   *
   * Al editar, en cambio, **no se recalcula**: se conserva el original. El `id`
   * es la identidad del producto —el ancla de su enlace y la base del nombre de
   * su foto—, así que regenerarlo al corregir una tilde del nombre convertiría
   * el repuesto en otro distinto: cualquier enlace compartido dejaría de
   * apuntar a él. Se vuelve a pasar por `generarId` de todos modos, porque
   * viene del archivo de datos y ahí no se confía en nada.
   */
  const id = opciones.idOriginal
    ? generarId(opciones.idOriginal)
    : generarId(limpiar(datos.id) || nombre);
  if (!id) errores.id = "No se pudo generar un identificador a partir del nombre.";
  else if (opciones.idsExistentes && id !== opciones.idOriginal && opciones.idsExistentes.has(id)) {
    errores.id = `Ya existe un repuesto con el identificador "${id}". Cambia el nombre.`;
  }

  const descripcion = limpiar(datos.descripcion);
  if (!descripcion) errores.descripcion = "La descripción es obligatoria.";
  else if (descripcion.length > LIMITES.descripcion)
    errores.descripcion = `La descripción no puede pasar de ${LIMITES.descripcion} caracteres.`;

  const marca = limpiar(datos.marca);
  if (!marca) errores.marca = "Elige una marca de la lista.";
  else if (opciones.marcasValidas && !opciones.marcasValidas.has(marca)) {
    errores.marca = "Esa marca ya no existe. Elige una de la lista o añádela de nuevo.";
  } else if (!/^[a-z0-9-]{1,40}$/.test(marca)) {
    errores.marca = "La marca tiene un identificador no admitido.";
  }

  /*
   * Categoría y sección ya no se piden en el panel: dejaron de ser filtros del
   * catálogo. Se siguen aceptando si vienen —los 50 repuestos cargados al
   * principio las traen y no hay motivo para borrárselas al editarlos— pero un
   * valor que no exista en la taxonomía se descarta en silencio en vez de
   * bloquear el guardado por un campo que ya nadie rellena.
   */
  const categoriaBruta = limpiar(datos.categoria);
  const categoria = IDS_CATEGORIA.has(categoriaBruta) ? categoriaBruta : "";

  const seccionBruta = limpiar(datos.seccion);
  const seccion = IDS_SECCION.has(seccionBruta) ? seccionBruta : "";

  // Los modelos llegan como lista o como texto separado por comas, según cómo
  // los teclee quien edita.
  const modelosBruto = Array.isArray(datos.modelos)
    ? datos.modelos
    : limpiar(datos.modelos).split(",");
  const modelos = modelosBruto
    .map((m) => limpiar(m))
    .filter(Boolean)
    .map((m) => m.slice(0, LIMITES.modelo))
    .slice(0, LIMITES.modelos);
  if (modelos.length === 0) errores.modelos = "Indica al menos un modelo compatible.";

  const anioDesde = numero(datos.anioDesde);
  const anioHasta = numero(datos.anioHasta);
  if (anioDesde === null || anioDesde < ANIO_MIN || anioDesde > ANIO_MAX) {
    errores.anioDesde = `El año inicial debe estar entre ${ANIO_MIN} y ${ANIO_MAX}.`;
  }
  if (anioHasta === null || anioHasta < ANIO_MIN || anioHasta > ANIO_MAX) {
    errores.anioHasta = `El año final debe estar entre ${ANIO_MIN} y ${ANIO_MAX}.`;
  }
  if (anioDesde !== null && anioHasta !== null && anioDesde > anioHasta) {
    errores.anioHasta = "El año final no puede ser anterior al inicial.";
  }

  const oem = limpiar(datos.oem);
  if (oem.length > LIMITES.oem)
    errores.oem = `El número de parte no puede pasar de ${LIMITES.oem} caracteres.`;

  /*
   * La ruta de la imagen no se acepta tal cual: se construye. Del valor que
   * llega solo se aprovecha el nombre del archivo, y solo si encaja con el
   * alfabeto permitido. Así ni `../../` ni una URL externa pueden acabar en el
   * `src` de una etiqueta `<Image>`.
   */
  const imagenBruta = limpiar(datos.imagen);
  const archivo = imagenBruta.split("/").pop() ?? "";
  const imagen = /^[a-z0-9-]+\.(jpg|jpeg|png|webp)$/i.test(archivo)
    ? URL_FOTO + archivo
    : "";
  if (!imagen) errores.imagen = "Falta la foto del repuesto.";

  if (Object.keys(errores).length > 0) return { ok: false, errores };

  const producto: Producto = {
    id,
    nombre,
    descripcion,
    marca: marca as MarcaId,
    modelos,
    anioDesde: anioDesde as number,
    anioHasta: anioHasta as number,
    imagen,
    ...(categoria ? { categoria: categoria as CategoriaId } : {}),
    ...(seccion ? { seccion: seccion as SeccionId } : {}),
    ...(oem ? { oem } : {}),
    ...(datos.destacado === true || datos.destacado === "true" ? { destacado: true } : {}),
  };

  return { ok: true, errores: {}, producto };
}

/**
 * Orden estable del archivo: destacados primero, luego por nombre.
 *
 * Sin un orden fijo, mover un producto en la lista produciría un cambio enorme
 * en el repositorio y sería imposible ver en el historial qué se tocó de
 * verdad. Con esto, editar un producto cambia solo su bloque.
 */
export function ordenarParaArchivo(productos: Producto[]): Producto[] {
  return [...productos].sort((a, b) => {
    const destacado = Number(b.destacado ?? false) - Number(a.destacado ?? false);
    if (destacado !== 0) return destacado;
    return a.nombre.localeCompare(b.nombre, "es");
  });
}

/** Serializa el catálogo con el mismo formato que ya tiene el archivo. */
export function serializarCatalogo(productos: Producto[]): string {
  return JSON.stringify(ordenarParaArchivo(productos), null, 2) + "\n";
}
