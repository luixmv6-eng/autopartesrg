export type MarcaId =
  | "toyota"
  | "chevrolet"
  | "nissan"
  | "suzuki"
  | "kia"
  | "hyundai"
  | "ford"
  | "mazda"
  | "renault"
  | "volkswagen"
  | "mitsubishi"
  | "isuzu"
  | "lexus"
  | "universal";

export type CategoriaId =
  | "motor"
  | "frenos"
  | "suspension"
  | "electrico"
  | "carroceria"
  | "transmision"
  | "filtros"
  | "refrigeracion"
  | "combustible";

export type SeccionId =
  | "motor"
  | "transmision"
  | "tren-delantero"
  | "tren-trasero"
  | "sistema-frenos"
  | "sistema-electrico"
  | "exterior";

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
  /**
   * Número de parte del fabricante, el dato con el que buscan los talleres.
   *
   * Opcional a propósito. No hay SKU interno: sin un inventario detrás, un
   * código propio no identificaría nada. El OEM sí es universal, pero solo se
   * publica cuando consta de verdad; inventarlo sería peor que omitirlo,
   * porque un taller lo cruzaría contra su despiece y pediría la pieza
   * equivocada. Donde falta, la referencia se confirma por WhatsApp.
   */
  oem?: string;
  nombre: string;
  descripcion: string;
  marca: MarcaId;
  /** Modelos compatibles del vehículo. */
  modelos: string[];
  anioDesde: number;
  anioHasta: number;
  categoria: CategoriaId;
  seccion: SeccionId;
  /** Ruta pública de la foto del repuesto. */
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
