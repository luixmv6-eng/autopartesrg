/** Une clases condicionales sin arrastrar dependencias. */
export function cn(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(" ");
}

/** Rango de años de compatibilidad, en el formato de la ficha técnica. */
export function rangoAniosLegible(desde: number, hasta: number): string {
  return desde === hasta ? String(desde) : `${desde}-${hasta}`;
}
