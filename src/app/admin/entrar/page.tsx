import type { Metadata } from "next";
import { FormularioEntrada } from "@/components/admin/FormularioEntrada";
import { Icon } from "@/components/ui/Icon";
import { configuracionCompleta } from "@/lib/admin/almacen";

/**
 * Pantalla de entrada al panel.
 *
 * `noindex` y `nofollow`: esta página no debe aparecer en Google. No es un
 * secreto —la ruta es adivinable— pero no hay ninguna razón para publicitarla,
 * y una pantalla de acceso indexada solo atrae intentos automatizados.
 */
export const metadata: Metadata = {
  title: "Entrar al panel",
  robots: { index: false, follow: false, nocache: true },
};

export default function PaginaEntrar() {
  const listo = configuracionCompleta();

  return (
    <div className="contenedor py-xl">
      {/*
       * Anchura en `rem` explícitos, no `max-w-md`.
       *
       * Este sistema de diseño define `--spacing-md: 16px`, y como no declara
       * ningún `--container-*`, Tailwind resuelve `max-w-md` contra la escala de
       * espaciado: la tarjeta salía de 16 píxeles de ancho y el título caía a
       * una palabra por línea. Por eso el resto del sitio tampoco usa
       * `max-w-sm|md|lg|xl` en ninguna parte.
       */}
      <div className="mx-auto flex min-h-[60dvh] max-w-[30rem] flex-col justify-center">
        <div className="mb-lg">
          <p className="eyebrow mb-md">Área privada</p>
          <h1 className="display-tight text-headline-lg text-on-surface">Panel del catálogo</h1>
          <p className="mt-sm text-body-md leading-relaxed text-on-surface-variant">
            Desde aquí se añaden, editan y eliminan los repuestos publicados.
          </p>
        </div>

        {/* Si faltan variables, decirlo aquí ahorra el desconcierto de una
            contraseña correcta que no deja entrar. */}
        {!listo && (
          <p className="mb-md flex items-start gap-sm rounded-lg border border-error/40 bg-error/5 p-md text-label-technical leading-relaxed text-on-surface">
            <Icon name="warning" size={18} className="mt-px shrink-0 text-error" />
            <span>
              El panel todavía no está configurado en este servidor. Faltan dos variables de
              entorno: <code className="font-mono">ADMIN_PASSWORD_HASH</code> y{" "}
              <code className="font-mono">ADMIN_SESSION_SECRET</code>. Se generan con{" "}
              <code className="font-mono">npm run admin:clave</code>.
            </span>
          </p>
        )}

        <FormularioEntrada />

        <p className="mt-md flex items-center gap-sm font-mono text-label-sm uppercase tracking-[0.12em] text-on-surface-variant">
          <Icon name="verified" size={16} className="shrink-0 text-primary" />
          Acceso restringido al personal
        </p>
      </div>
    </div>
  );
}
