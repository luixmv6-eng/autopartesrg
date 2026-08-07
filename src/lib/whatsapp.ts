import type { Producto } from "./types";
import { LABEL_MARCA } from "./taxonomia";

/**
 * Número de destino. Se configura en `.env.local` como
 * NEXT_PUBLIC_WHATSAPP_NUMBER=593999999999 (solo dígitos, con código de país).
 */
export const WHATSAPP_NUMERO = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

/** Mensaje genérico del botón flotante, cuando no hay producto seleccionado. */
export const MENSAJE_GENERICO = "Hola, quisiera más información sobre sus repuestos";

/**
 * Mensaje de cotización. El formato es fijo y lo definió el negocio:
 * "Hola, estoy interesado en el repuesto: [NOMBRE], para el vehículo: [MARCA Y MODELO].
 *  Me interesaría cotizar el precio y recibir más información."
 */
export function mensajeCotizacion(producto: Producto, modelo?: string): string {
  const marca = LABEL_MARCA[producto.marca];
  const modeloElegido = modelo?.trim() || producto.modelos[0];
  const vehiculo = modeloElegido ? `${marca} ${modeloElegido}` : marca;
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
