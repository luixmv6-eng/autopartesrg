"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

/**
 * Formulario de acceso.
 *
 * Tras entrar hay que llamar a `router.refresh()` antes de navegar. La cookie de
 * sesión acaba de llegar en la respuesta, pero el router todavía tiene guardado
 * lo que el servidor contestó cuando no había sesión; sin refrescar, `/admin`
 * podría servirse desde esa copia y rebotar de vuelta aquí.
 *
 * La tarjeta usa los mismos tokens que las del catálogo —`rounded-xl`, borde
 * `panel-borde`, fondo `panel`, `shadow-e1`, cabecera en primario— para que el
 * panel no parezca una aplicación distinta pegada al sitio.
 */
export function FormularioEntrada() {
  const router = useRouter();
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setEnviando(true);
    setError(null);

    try {
      const respuesta = await fetch("/api/admin/sesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contrasena }),
      });
      const datos = (await respuesta.json()) as { error?: string };

      if (!respuesta.ok) {
        setError(datos.error ?? "No se pudo entrar.");
        setEnviando(false);
        return;
      }
      router.refresh();
      router.push("/admin");
    } catch {
      setError("No se pudo contactar con el servidor. Revisa tu conexión.");
      setEnviando(false);
    }
  };

  return (
    <form
      onSubmit={enviar}
      className="overflow-hidden rounded-xl border border-panel-borde bg-panel shadow-e1"
    >
      {/* Cabecera en primario, igual que la del panel de filtros del catálogo. */}
      <div className="bg-primary px-md py-md text-on-primary">
        <h2 className="flex items-center gap-sm text-headline-md font-bold tracking-[-0.01em]">
          <Icon name="build_circle" size={20} />
          Iniciar sesión
        </h2>
        <p className="mt-xs font-mono text-label-sm uppercase tracking-[0.12em] text-on-primary/70">
          Autopartes ERG
        </p>
      </div>

      <div className="p-md md:p-lg">
        <label
          htmlFor="contrasena"
          className="mb-xs block text-label-technical font-semibold text-on-surface"
        >
          Contraseña
        </label>
        <input
          id="contrasena"
          name="contrasena"
          type="password"
          autoComplete="current-password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          placeholder="••••••••••••"
          className="h-11 w-full rounded-lg border border-borde-campo bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant focus:border-primary"
          required
          autoFocus
        />

        {error && (
          <p
            role="alert"
            className="mt-md flex items-start gap-sm rounded-lg border border-error/40 bg-error/5 p-sm text-label-technical leading-relaxed text-on-surface"
          >
            <Icon name="warning" size={18} className="mt-px shrink-0 text-error" />
            {error}
          </p>
        )}

        <Button type="submit" tamano="lg" className="mt-lg w-full" disabled={enviando}>
          {enviando ? (
            <>
              <Icon name="refresh" size={20} className="animate-spin" />
              Entrando…
            </>
          ) : (
            <>
              <Icon name="arrow_forward" size={20} />
              Entrar
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
