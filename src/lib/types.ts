/**
 * Identificador de marca de vehículo.
 *
 * Es `string` y no una lista cerrada de literales porque las marcas se
 * administran desde el panel: la empresa puede añadir una que hoy no existe. El
 * conjunto válido vive en los datos (`marcas.json`), no en el código, así que el
 * compilador ya no puede comprobarlo — de eso se encarga `validarProducto`
 * contra la lista real en cada guardado.
 */
export type MarcaId = string;

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
  /**
   * Clasificación interna, opcional.
   *
   * Dejó de ser un filtro del catálogo y de pedirse en el panel: el negocio la
   * consideró innecesaria para buscar un repuesto, que se localiza por marca,
   * modelo y año. Los productos cargados antes conservan la suya y se sigue
   * mostrando en la ficha; los nuevos simplemente no la llevan.
   */
  categoria?: CategoriaId;
  seccion?: SeccionId;
  /** Ruta pública de la foto del repuesto. */
  imagen: string;
  destacado?: boolean;
}

/** Estado completo de los filtros. Es también la forma que se serializa a la URL. */
export interface EstadoFiltros {
  q: string;
  marcas: MarcaId[];
  modelo: string;
  anio: number | null;
  orden: OrdenId;
}

export type OrdenId = "relevancia" | "nombre";
