export type MarcaId =
  | "toyota"
  | "chevrolet"
  | "ford"
  | "hyundai"
  | "kia"
  | "nissan"
  | "mazda"
  | "suzuki"
  | "volkswagen"
  | "renault";

export type CategoriaId =
  | "motor"
  | "frenos"
  | "suspension"
  | "electrico"
  | "carroceria"
  | "transmision"
  | "filtros"
  | "refrigeracion";

export type SeccionId =
  | "motor"
  | "exterior"
  | "interior"
  | "chasis"
  | "sistema-electrico"
  | "sistema-frenos"
  | "tren-delantero"
  | "tren-trasero";

/**
 * El catálogo es un índice de compatibilidad, no un inventario.
 *
 * No hay precio, ni condición del repuesto, ni disponibilidad: sin un sistema
 * de stock detrás, publicar esos datos es prometer algo que no se puede
 * sostener. Todo eso se confirma por WhatsApp.
 */
export interface Producto {
  /** Identificador estable y legible. Se usa como ancla y como nombre de imagen. */
  id: string;
  sku: string;
  /** Número de parte del fabricante, el dato con el que buscan los talleres. */
  oem: string;
  nombre: string;
  descripcion: string;
  marca: MarcaId;
  /** Modelos compatibles del vehículo. */
  modelos: string[];
  anioDesde: number;
  anioHasta: number;
  categoria: CategoriaId;
  seccion: SeccionId;
  /** Ruta pública de la imagen. Sustituir por foto real conservando el nombre. */
  imagen: string;
  destacado?: boolean;
}

/** Estado completo de los filtros. Es también la forma que se serializa a la URL. */
export interface EstadoFiltros {
  q: string;
  marcas: MarcaId[];
  categorias: CategoriaId[];
  secciones: SeccionId[];
  modelo: string;
  anio: number | null;
  orden: OrdenId;
}

export type OrdenId = "relevancia" | "nombre";
