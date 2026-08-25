import type { Producto } from "./types";
import { CONTACTO } from "./contacto";
import { LABEL_MARCA } from "./taxonomia";
import { MODELO_GENERICO, type EtiquetaMarca } from "./utils";

/**
 * Número de destino.
 *
 * Sale de `contacto.ts`, junto al resto de los datos del negocio. La variable
 * de entorno sigue admitiéndose para poder desviar las pruebas a otro número
 * sin tocar el código, pero ya no hace falta configurarla: si falta, el enlace
 * funciona igual. Antes era al revés y un despliegue sin esa variable dejaba el
 * botón de cotizar abriendo WhatsApp sin destinatario.
 */
export const WHATSAPP_NUMERO = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || CONTACTO.whatsapp
).replace(/\D/g, "");

/** Mensaje genérico del botón flotante, cuando no hay producto seleccionado. */
export const MENSAJE_GENERICO = "Hola, quisiera más información sobre sus repuestos";

/**
 * Mensaje de cotización. El formato es fijo y lo definió el negocio:
 * "Hola, estoy interesado en el repuesto: [NOMBRE], para el vehículo: [MARCA Y MODELO].
 *  Me interesaría cotizar el precio y recibir más información."
 */
export function mensajeCotizacion(
  producto: Producto,
  modelo?: string,
  // La lista de marcas es editable desde el panel, así que el nombre visible ya
  // no se puede resolver desde una constante del módulo.
  etiquetaMarca: EtiquetaMarca = (id) => LABEL_MARCA[id] ?? id
): string {
  // Los repuestos sin aplicación marcada no tienen vehículo que nombrar: en vez
  // de mandar "para el vehículo: Varios modelos", el mensaje deja el hueco
  // abierto para que el cliente lo complete. Es el dato que el vendedor
  // necesita primero, y así la conversación arranca pidiéndolo.
  const marca = producto.marca === "universal" ? "" : etiquetaMarca(producto.marca);
  const modeloElegido = modelo?.trim() || producto.modelos[0] || "";
  const vehiculo =
    modeloElegido === MODELO_GENERICO || !modeloElegido
      ? `${marca} (te indico marca, modelo y año)`.trim()
      : [marca, modeloElegido].filter(Boolean).join(" ");
  return `Hola, estoy interesado en el repuesto: ${producto.nombre}, para el vehículo: ${vehiculo}. Me interesaría cotizar el precio y recibir más información.`;
}

/** Construye el enlace wa.me con el mensaje ya codificado. */
export function enlaceWhatsApp(mensaje: string = MENSAJE_GENERICO): string {
  const texto = encodeURIComponent(mensaje);
  if (!WHATSAPP_NUMERO) {
    // Sin número configurado, wa.me abre el selector de contacto con el texto listo.
    return `https://wa.me/?text=${texto}`;
  }
  return `https://wa.me/${WHATSAPP_NUMERO}?text=${texto}`;
}
