"use client";

import { useEffect, useRef, useState } from "react";
import { MENSAJE_GENERICO, enlaceWhatsApp } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

/** Lo que se considera un control que no se puede tapar. */
const SELECTOR_CONTROL = "a[href], button, input:not([type=hidden]), select, textarea";

/** Margen hacia dentro al muestrear, para no dar por tapado lo que solo roza. */
const MARGEN = 6;

/**
 * Fracción de un control que el flotante puede cubrir antes de considerarse un
 * estorbo.
 *
 * No vale «cualquier solape»: sobre una retícula de tarjetas el botón siempre
 * pisa la esquina de algún "Ver ficha", y apagarlo por eso lo dejaba
 * parpadeando la mitad del recorrido. Lo que molesta de verdad es tapar el
 * centro de un control —donde está la etiqueta y donde se pulsa— o comerse un
 * cuarto de su superficie. Rozar una esquina no impide pulsar nada.
 */
const UMBRAL_SOLAPE = 0.25;

/**
 * Botón flotante de contacto.
 *
 * Se aparta cuando tapa un control. En una pantalla de 320px el botón ocupa los
 * últimos 48px del ancho útil, así que se montaba encima del borde derecho de
 * cualquier acción a lo ancho: el "Buscar" del hero, el "Filtrar" del catálogo
 * y el "Cargar más repuestos". Un botón de contacto no puede comerse una acción
 * primaria.
 *
 * La comprobación es geométrica y no una lista de elementos concretos: se
 * muestrean cinco puntos de su propia caja y, si debajo hay algo pulsable, se
 * retira. Así sigue funcionando cuando se añada un control nuevo, que es
 * justo lo que fallaba al observar solo el bloque de filtros.
 *
 * Detalle que importa: al ocultarse solo cambia la opacidad, nunca el tamaño.
 * Si encogiera, su caja mediría menos, dejaría de detectar el control debajo,
 * volvería a aparecer, volvería a detectarlo... y parpadearía sin parar.
 */
export function WhatsAppFab() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [estorbando, setEstorbando] = useState(false);

  useEffect(() => {
    const fab = ref.current;
    if (!fab) return;

    let programado = false;

    const revisar = () => {
      programado = false;
      const r = fab.getBoundingClientRect();
      const puntos: Array<[number, number]> = [
        [r.left + MARGEN, r.top + MARGEN],
        [r.right - MARGEN, r.top + MARGEN],
        [r.left + MARGEN, r.bottom - MARGEN],
        [r.right - MARGEN, r.bottom - MARGEN],
        [r.left + r.width / 2, r.top + r.height / 2],
      ];

      // Los puntos solo sirven para encontrar candidatos baratos; quién estorba
      // de verdad lo decide después la geometría.
      const candidatos = new Set<Element>();
      for (const [x, y] of puntos) {
        for (const nodo of document.elementsFromPoint(x, y)) {
          if (nodo === fab || fab.contains(nodo)) continue;
          const control = nodo.closest?.(SELECTOR_CONTROL);
          // Lo fijo (la barra inferior) convive con el botón por diseño; lo que
          // no puede quedar debajo es el contenido que se desplaza.
          if (control && getComputedStyle(control).position !== "fixed") {
            candidatos.add(control);
          }
        }
      }

      const estorba = [...candidatos].some((control) => {
        const c = control.getBoundingClientRect();
        if (!c.width || !c.height) return false;

        // Tapar el centro es tapar la etiqueta y el punto natural de pulsación.
        const cx = c.left + c.width / 2;
        const cy = c.top + c.height / 2;
        if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) return true;

        const solapeX = Math.min(r.right, c.right) - Math.max(r.left, c.left);
        const solapeY = Math.min(r.bottom, c.bottom) - Math.max(r.top, c.top);
        if (solapeX <= 0 || solapeY <= 0) return false;
        return (solapeX * solapeY) / (c.width * c.height) >= UMBRAL_SOLAPE;
      });

      setEstorbando(estorba);
    };

    const alCambiar = () => {
      if (programado) return;
      programado = true;
      requestAnimationFrame(revisar);
    };

    revisar();
    // `passive`: la comprobación nunca cancela el desplazamiento, y así el
    // navegador no tiene que esperar al manejador para desplazar.
    window.addEventListener("scroll", alCambiar, { passive: true });
    window.addEventListener("resize", alCambiar);
    return () => {
      window.removeEventListener("scroll", alCambiar);
      window.removeEventListener("resize", alCambiar);
    };
  }, []);

  return (
    <a
      ref={ref}
      href={enlaceWhatsApp(MENSAJE_GENERICO)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir a Autopartes ERG por WhatsApp"
      aria-hidden={estorbando}
      tabIndex={estorbando ? -1 : undefined}
      /*
       * Se apoya sobre la barra inferior en vez de sobre un número fijo: la
       * variable ya incluye el área segura, así que en un iPhone con indicador
       * de inicio el botón sube lo que haga falta. En escritorio la variable
       * vale 0 y el margen inferior lo pone `--gutter`.
       */
      style={{
        bottom: "calc(var(--alto-barra-inferior) + var(--gutter))",
        right: "var(--gutter)",
      }}
      className={cn(
        "wa-fab group fixed z-40 flex size-[var(--tamano-fab)] items-center justify-center rounded-full bg-wa text-on-wa shadow-e2",
        "transition-[box-shadow,opacity] duration-[var(--dur-media)] hover:shadow-e3",
        estorbando && "pointer-events-none opacity-0"
      )}
    >
      {/* Pulso sutil para llamar la atención sin ser invasivo. Se apaga bajo
          prefers-reduced-motion, ver globals.css */}
      <span aria-hidden className="fab-ping absolute inset-0 rounded-full bg-wa" />
      {/* Material Symbols no incluye la marca de WhatsApp, así que va su glifo oficial. */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        /*
         * El feedback de pulsación va aquí, en el glifo, y no en el enlace.
         *
         * Escalar el enlace cambiaría su caja, y su caja es justo lo que la
         * comprobación de superposición mide para decidir si el botón estorba:
         * al encoger dejaría de detectar el control de debajo, reaparecería,
         * volvería a detectarlo y parpadearía sin fin. El glifo se puede
         * escalar libremente porque no participa en esa medida.
         */
        className="relative size-6 transition-transform duration-[var(--dur-toque)] motion-safe:group-hover:scale-110 motion-safe:group-active:scale-90 lg:size-7"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.88-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
      <span className="pointer-events-none absolute right-full mr-md hidden whitespace-nowrap rounded bg-inverse-surface px-3 py-1.5 font-mono text-label-sm text-inverse-on-surface opacity-0 transition-opacity group-hover:opacity-100 lg:block">
        Asistencia técnica
      </span>
    </a>
  );
}
