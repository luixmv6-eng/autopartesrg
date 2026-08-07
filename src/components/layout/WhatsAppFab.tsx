import { MENSAJE_GENERICO, enlaceWhatsApp } from "@/lib/whatsapp";

/**
 * Botón flotante de contacto. En móvil sube por encima de la barra inferior,
 * igual que en la maqueta de Stitch. Lleva el mensaje genérico porque no hay
 * producto seleccionado; la ficha técnica usa su propio texto de cotización.
 */
export function WhatsAppFab() {
  return (
    <a
      href={enlaceWhatsApp(MENSAJE_GENERICO)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir a AutopartesRG por WhatsApp"
      className="wa-fab group fixed bottom-[76px] right-md z-40 flex size-12 items-center justify-center rounded-full bg-wa text-on-wa shadow-lg transition-[transform,box-shadow,opacity] duration-300 hover:scale-105 hover:shadow-xl active:scale-95 md:bottom-8 md:right-8 md:size-14"
    >
      {/* Pulso sutil para llamar la atención sin ser invasivo. Se apaga bajo
          prefers-reduced-motion, ver globals.css */}
      <span aria-hidden className="fab-ping absolute inset-0 rounded-full bg-wa" />
      {/* Material Symbols no incluye la marca de WhatsApp, así que va su glifo oficial. */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="relative size-6 md:size-7"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.88-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
      <span className="pointer-events-none absolute right-full mr-md hidden whitespace-nowrap rounded bg-inverse-surface px-3 py-1.5 font-mono text-label-sm text-inverse-on-surface opacity-0 transition-opacity group-hover:opacity-100 md:block">
        Asistencia Técnica
      </span>
    </a>
  );
}
