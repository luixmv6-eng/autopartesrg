import Image from "next/image";
import { CONTACTO } from "@/lib/contacto";
import { cn } from "@/lib/utils";

/**
 * Proporción del archivo original (552 x 600).
 *
 * El logotipo pasó a ser más alto que ancho. Antes era apaisado (325 x 277),
 * así que a igual alto ahora ocupa menos anchura: por eso los tamaños de la
 * cabecera y del pie subieron, para que la marca pese lo mismo en pantalla.
 */
const RELACION = 552 / 600;

/**
 * Logotipo de la empresa.
 *
 * El archivo ya contiene el nombre y el eslogan, así que no se acompaña de
 * texto: repetirlo al lado duplicaría el mensaje. El nombre accesible viaja en
 * el `alt`, que es lo que leen los lectores de pantalla y los buscadores.
 *
 * `alto` es el tamaño **intrínseco** que se pide al optimizador, y es el mismo
 * en toda la web a propósito: el tamaño **mostrado** lo controla `className`.
 * Con un valor distinto por sitio el optimizador generaba dos AVIF diferentes y
 * el navegador se bajaba los dos, para enseñar una vez la misma imagen. Con uno
 * solo hay una descarga y un acierto de caché en la segunda aparición.
 *
 * El valor está por encima del mayor tamaño mostrado (128 px en el pie) para
 * que en pantallas de alta densidad siga viéndose nítido.
 *
 * Antes de eso había además dos instancias alternadas con `hidden`/`block`: el
 * navegador descargaba las dos y ambas iban con `priority`, así que la cabecera
 * precargaba un logotipo que nunca se llegaba a ver.
 *
 * `priority` en la cabecera: el logo entra en el primer pantallazo y sin él
 * Next lo cargaría en diferido, provocando un salto visible al arrancar.
 */
export function Logo({
  className,
  alto = 200,
  prioridad = false,
}: {
  className?: string;
  /**
   * Alto intrínseco en píxeles, no el mostrado. Cambiarlo por instancia obliga
   * al optimizador a generar una variante nueva; usa `className` para el
   * tamaño en pantalla.
   */
  alto?: number;
  prioridad?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt={CONTACTO.nombre}
      width={Math.round(alto * RELACION)}
      height={alto}
      priority={prioridad}
      className={cn("w-auto object-contain", className)}
    />
  );
}
