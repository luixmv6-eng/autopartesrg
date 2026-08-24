"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Barra de navegación inferior en móvil, como en el catálogo de Stitch. Es la
 * única navegación móvil: el encabezado no la duplica.
 */
const DESTINOS: Array<{
  id: string;
  label: string;
  icono: IconName;
  href: string;
  ancla: boolean;
}> = [
  { id: "inicio", label: "Inicio", icono: "home", href: "/#inicio", ancla: true },
  { id: "catalogo", label: "Catálogo", icono: "category", href: "/#catalogo", ancla: true },
  { id: "nosotros", label: "Nosotros", icono: "storefront", href: "/nosotros", ancla: false },
  { id: "contacto", label: "Contacto", icono: "call", href: "#contacto", ancla: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const enLanding = pathname === "/";
  const [seccionVisible, setSeccionVisible] = useState("inicio");

  useEffect(() => {
    const secciones = DESTINOS.filter((d) => d.ancla)
      .map((d) => document.getElementById(d.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!secciones.length) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        const visible = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setSeccionVisible(visible.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 0.25, 0.5] }
    );
    secciones.forEach((s) => observador.observe(s));
    return () => observador.disconnect();
  }, [pathname]);

  return (
    <nav
      aria-label="Navegación inferior"
      /*
       * El alto sale de `--alto-barra-inferior`, la misma variable de la que
       * el `body` toma su relleno inferior: así no hay forma de que la barra
       * tape contenido. La variable ya incluye `env(safe-area-inset-bottom)`,
       * y el relleno propio lo reserva dentro para que los destinos no queden
       * bajo el indicador de inicio.
       */
      className="fixed bottom-0 z-50 flex h-[var(--alto-barra-inferior)] w-full items-stretch justify-around border-t border-outline-variant bg-surface-container-lowest pb-[env(safe-area-inset-bottom,0px)] lg:hidden"
    >
      {DESTINOS.map((d) => {
        const activo = d.ancla
          ? enLanding && seccionVisible === d.id
          : pathname === d.href;
        return (
          <Link
            key={d.id}
            href={d.href}
            aria-current={activo ? "page" : undefined}
            className={cn(
              // Sin `transition-all`: animaba `border-width`, que provoca reflujo en
              // cada cambio de sección al desplazarse.
              "flex h-full w-full flex-col items-center justify-center gap-xs transition-[background-color,color] duration-[var(--dur-rapida)]",
              activo
                ? "border-t-2 border-primary bg-primary-container/10 text-primary"
                : "text-on-surface-variant active:opacity-70"
            )}
          >
            <Icon name={d.icono} size={24} filled={activo} />
            <span
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.08em]",
                activo && "font-bold"
              )}
            >
              {d.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
