"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { enlaceWhatsApp } from "@/lib/whatsapp";

export function EstadoVacio({ termino, onLimpiar }: { termino: string; onLimpiar: () => void }) {
  const mensaje = termino
    ? `Hola, busqué "${termino}" en su catálogo y no encontré resultados. ¿Podrían ayudarme a ubicar el repuesto?`
    : "Hola, no encontré el repuesto que necesito en su catálogo. ¿Podrían ayudarme a ubicarlo?";

  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest px-md py-xl text-center">
      <span className="grid size-14 place-items-center rounded-full bg-primary-fixed text-primary">
        <Icon name="search" size={28} />
      </span>
      <h3 className="mt-lg text-headline-md text-on-surface">
        Ningún repuesto coincide con esa combinación
      </h3>
      <p className="mt-sm max-w-[28rem] text-body-md text-on-surface-variant">
        Prueba quitando algún filtro, o busca por la marca y el modelo del vehículo. Si la pieza
        no está publicada, es probable que igual la consigamos bajo pedido.
      </p>
      <div className="mt-lg flex flex-col gap-sm sm:flex-row">
        <Button variante="outline" onClick={onLimpiar}>
          <Icon name="refresh" size={18} />
          Limpiar filtros
        </Button>
        <ButtonLink
          href={enlaceWhatsApp(mensaje)}
          target="_blank"
          rel="noopener noreferrer"
          variante="cta"
        >
          <Icon name="chat" size={18} />
          Preguntar por WhatsApp
        </ButtonLink>
      </div>
    </div>
  );
}
