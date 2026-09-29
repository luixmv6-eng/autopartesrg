"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { Producto } from "@/lib/types";
import { nombrarVehiculo } from "@/lib/utils";
import { enlaceWhatsApp, mensajeCotizacion } from "@/lib/whatsapp";

interface Props {
  producto: Producto;
  /**
   * Nombre visible de la marca, ya resuelto.
   *
   * Antes esto se leía del contexto `MarcasProvider`, que solo existe dentro del
   * catálogo interactivo de la portada. La ficha es una página de servidor y no
   * monta ese contexto, así que el dato llega como texto: es lo único que el
   * cotizador necesita de la lista de marcas, y una cadena sí cruza la frontera
   * entre servidor y cliente —una función no.
   */
  marcaLabel: string;
}

/**
 * Bloque de cotización de la ficha: elige el modelo, revisa el mensaje y abre
 * WhatsApp.
 *
 * Es la única parte interactiva de la ficha, y por eso está aparte. Antes vivía
 * dentro de la ventana modal del catálogo, que era un componente de cliente
 * entero: el nombre del repuesto, la compatibilidad y las especificaciones —todo
 * lo que un buscador necesita leer— se pintaban en el navegador y no existían en
 * el HTML. Ahora ese contenido lo renderiza el servidor y aquí queda solo lo que
 * de verdad necesita estado.
 */
export function CotizadorWhatsApp({ producto, marcaLabel }: Props) {
  const etiquetaMarca = () => marcaLabel;
  const modeloInicial = producto.modelos[0] ?? "";
  const construirMensaje = (modelo: string) =>
    mensajeCotizacion(producto, modelo, etiquetaMarca);

  const [modelo, setModelo] = useState(modeloInicial);
  const [mensaje, setMensaje] = useState(() => construirMensaje(modeloInicial));
  const [editando, setEditando] = useState(false);

  const cambiarModelo = (valor: string) => {
    setModelo(valor);
    // Si el visitante escribió su propio mensaje, no se le pisa al cambiar de
    // modelo: lo que redactó vale más que la plantilla.
    if (!editando) setMensaje(construirMensaje(valor));
  };

  const alternarEdicion = () => {
    if (editando) setMensaje(construirMensaje(modelo));
    setEditando((v) => !v);
  };

  return (
    <div className="flex flex-col gap-md">
      {/* Sin precio publicado: la cotización se resuelve por WhatsApp. */}
      <p className="flex items-start gap-sm text-body-md text-on-surface-variant">
        <Icon name="forum" size={24} className="mt-0.5 text-primary" />
        Confirmamos disponibilidad y precio por WhatsApp el mismo día.
      </p>

      {producto.modelos.length > 1 && (
        <div>
          <label
            htmlFor="modelo-cotizacion"
            className="mb-xs block text-label-technical font-semibold text-on-surface"
          >
            Modelo de tu vehículo
          </label>
          <select
            id="modelo-cotizacion"
            value={modelo}
            onChange={(e) => cambiarModelo(e.target.value)}
            className="h-11 w-full rounded-lg border border-borde-campo bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition-colors focus:border-primary"
          >
            {producto.modelos.map((m) => (
              <option key={m} value={m}>
                {nombrarVehiculo(producto, m, etiquetaMarca)}
              </option>
            ))}
          </select>
        </div>
      )}

      <ButtonLink
        href={enlaceWhatsApp(mensaje)}
        target="_blank"
        rel="noopener noreferrer"
        variante="cta"
        tamano="lg"
        className="w-full"
      >
        <Icon name="chat" size={24} />
        Cotizar por WhatsApp
      </ButtonLink>

      {/* Vista previa del mensaje, editable */}
      <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-sm">
        <div className="flex items-center justify-between gap-sm">
          <label
            htmlFor="mensaje-cotizacion"
            className="font-mono text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant"
          >
            Mensaje que se enviará
          </label>
          <button
            type="button"
            onClick={alternarEdicion}
            aria-pressed={editando}
            className="inline-flex h-9 items-center gap-xs rounded px-2 font-mono text-label-sm font-semibold text-primary transition-colors hover:bg-primary-fixed"
          >
            <Icon name={editando ? "refresh" : "edit"} size={16} />
            {editando ? "Restaurar" : "Editar"}
          </button>
        </div>
        <textarea
          id="mensaje-cotizacion"
          value={mensaje}
          readOnly={!editando}
          onChange={(e) => setMensaje(e.target.value)}
          rows={3}
          className="mt-xs w-full resize-y rounded border border-transparent bg-transparent p-1 text-label-technical italic leading-relaxed text-on-surface-variant outline-none focus:border-primary focus:bg-surface-container-lowest focus:not-italic"
        />
      </div>
    </div>
  );
}
