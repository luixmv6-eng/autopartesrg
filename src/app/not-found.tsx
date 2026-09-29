import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { ButtonLink } from "@/components/ui/Button";
import { RUTA_CATALOGO } from "@/lib/rutas";
import { enlaceWhatsApp } from "@/lib/whatsapp";

/**
 * Página 404.
 *
 * Hasta ahora no hacía falta: el sitio tenía dos rutas fijas y ninguna forma de
 * pedir algo que no existiera. Con una página por repuesto sí la hay —un enlace
 * compartido de una pieza que después se retira del catálogo— y ese caso merece
 * una salida, no la 404 en blanco de Next.
 *
 * `robots: noindex` porque una 404 que se indexa es una URL basura en los
 * resultados; los enlaces de salida sí importan, para que quien llegue aquí
 * desde un enlace viejo acabe en el catálogo en vez de cerrar la pestaña.
 */
export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

export default function NoEncontrada() {
  return (
    <div className="contenedor flex flex-col items-center py-xl text-center lg:py-[6rem]">
      <span className="grid size-16 place-items-center rounded-full bg-primary-fixed text-primary">
        <Icon name="search" size={28} />
      </span>

      <p className="eyebrow mt-lg">Error 404</p>
      <h1 className="display-tight mt-sm max-w-[24ch] text-headline-lg text-on-surface">
        Esta página ya no está disponible
      </h1>
      <p className="mt-md max-w-[52ch] text-body-md text-on-surface-variant">
        Puede que el repuesto se haya retirado del catálogo o que la dirección esté mal escrita.
        Búscalo en el catálogo completo, o escríbenos y lo ubicamos por ti: muchas piezas las
        conseguimos bajo pedido aunque no estén publicadas.
      </p>

      <div className="mt-xl flex flex-col gap-sm sm:flex-row">
        <ButtonLink href={RUTA_CATALOGO} tamano="lg">
          <Icon name="category" size={20} />
          Ver el catálogo
        </ButtonLink>
        <ButtonLink
          href={enlaceWhatsApp()}
          target="_blank"
          rel="noopener noreferrer"
          variante="cta"
          tamano="lg"
        >
          <Icon name="chat" size={20} />
          Preguntar por WhatsApp
        </ButtonLink>
      </div>

      <Link
        href="/"
        className="mt-lg inline-flex items-center gap-xs font-mono text-label-technical text-on-surface-variant transition-colors hover:text-primary"
      >
        <Icon name="home" size={16} />
        Volver al inicio
      </Link>
    </div>
  );
}
