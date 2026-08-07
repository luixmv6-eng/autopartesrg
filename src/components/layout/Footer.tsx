import { Logo } from "./Logo";
import { IconoRed } from "./IconoRed";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CONTACTO } from "@/lib/contacto";
import { MENSAJE_GENERICO, enlaceWhatsApp } from "@/lib/whatsapp";
import { CATEGORIAS } from "@/lib/taxonomia";

const NAVEGACION = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#catalogo", label: "Catálogo" },
  { href: "/nosotros", label: "Nosotros" },
];

/** Cuatro categorías de mayor rotación, como atajos al catálogo filtrado. */
const ATAJOS = CATEGORIAS.filter((c) =>
  ["frenos", "motor", "suspension", "electrico"].includes(c.id)
);

/** Fila de contacto: icono, etiqueta y valor enlazado cuando aplica. */
function Dato({
  icono,
  etiqueta,
  children,
}: {
  icono: IconName;
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-sm">
      <Icon name={icono} size={18} className="mt-0.5 shrink-0 text-primary" />
      <span className="flex flex-col gap-0.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-on-surface-variant/70">
          {etiqueta}
        </span>
        <span className="text-label-technical text-on-surface-variant">{children}</span>
      </span>
    </li>
  );
}

function ColumnaEnlaces({
  id,
  titulo,
  enlaces,
}: {
  id: string;
  titulo: string;
  enlaces: Array<{ href: string; label: string }>;
}) {
  return (
    <nav aria-labelledby={id}>
      <h2
        id={id}
        className="mb-md font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface"
      >
        {titulo}
      </h2>
      <ul className="space-y-1">
        {enlaces.map((e) => (
          <li key={`${e.href}-${e.label}`}>
            <a
              href={e.href}
              className="group inline-flex h-8 items-center gap-1.5 text-label-technical text-on-surface-variant transition-colors hover:text-primary"
            >
              <span className="h-px w-0 bg-primary transition-[width] duration-300 group-hover:w-3" />
              {e.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Footer en cuatro bloques: identidad y contacto directo a la izquierda, dos
 * columnas de enlaces en el centro y datos de contacto a la derecha.
 *
 * Sin dirección postal: el comercio no tiene punto de venta físico, así que en
 * su lugar se declara la cobertura de despacho.
 */
export function Footer() {
  const anio = new Date().getFullYear();

  return (
    <footer
      id="contacto"
      className="relative mt-auto w-full border-t border-outline-variant bg-surface-container-high"
    >
      {/* Filo superior: cierra la página con el mismo recurso que abre el hero */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-md py-xl md:px-xl">
        <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.4fr]">
          {/* Identidad y llamada a la acción */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo className="mb-md text-on-surface [&>span:last-child]:font-black" />
            <p className="mb-lg max-w-[30rem] text-label-technical leading-relaxed text-on-surface-variant">
              Catálogo digital de repuestos con compatibilidad verificada por marca, modelo y año.
              Cotiza por WhatsApp y te confirmamos disponibilidad el mismo día.
            </p>

            <a
              href={enlaceWhatsApp(MENSAJE_GENERICO)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-sm rounded-lg bg-wa px-md font-mono text-label-technical uppercase tracking-[0.08em] text-on-wa shadow-sm transition-[translate,box-shadow] duration-200 hover:-translate-y-px hover:shadow-md"
            >
              <Icon name="chat" size={18} />
              Escríbenos
            </a>

            <ul className="mt-lg flex gap-sm">
              {CONTACTO.redes.map((red) => (
                <li key={red.nombre}>
                  <a
                    href={red.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`AutopartesRG en ${red.nombre}`}
                    className="grid size-11 place-items-center rounded-lg border border-outline-variant/60 text-on-surface-variant transition-[color,border-color,translate] duration-200 hover:-translate-y-px hover:border-primary hover:text-primary"
                  >
                    <IconoRed id={red.id} className="size-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <ColumnaEnlaces id="footer-navegacion" titulo="Navegación" enlaces={NAVEGACION} />

          <ColumnaEnlaces
            id="footer-catalogo"
            titulo="Catálogo"
            enlaces={ATAJOS.map((c) => ({ href: `/?cat=${c.id}#catalogo`, label: c.label }))}
          />

          {/* Contacto */}
          <div>
            <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface">
              Contacto
            </h2>
            <ul className="space-y-md">
              <Dato icono="call" etiqueta="Teléfono">
                <a
                  href={`tel:${CONTACTO.telefono.replace(/[^\d+]/g, "")}`}
                  className="tabular font-mono transition-colors hover:text-primary"
                >
                  {CONTACTO.telefono}
                </a>
              </Dato>
              <Dato icono="mail" etiqueta="Correo">
                <a
                  href={`mailto:${CONTACTO.correo}`}
                  className="font-mono transition-colors hover:text-primary"
                >
                  {CONTACTO.correo}
                </a>
              </Dato>
              <Dato icono="local_shipping" etiqueta="Cobertura">
                {CONTACTO.cobertura}
              </Dato>
            </ul>
          </div>
        </div>
      </div>

      {/*
       * Cierre: copyright y aviso de compatibilidad en una sola franja. El
       * relleno derecho reserva el hueco del botón flotante de WhatsApp, que si
       * no se superpone al texto.
       */}
      <div className="border-t border-outline-variant/40">
        <div className="mx-auto flex max-w-7xl flex-col gap-sm px-md py-lg pr-20 md:flex-row md:items-baseline md:justify-between md:gap-xl md:px-xl md:pr-28">
          <p className="shrink-0 font-mono text-label-sm text-on-surface-variant">
            © {anio} {CONTACTO.nombre}. Todos los derechos reservados.
          </p>

          <p className="font-mono text-[11px] leading-relaxed text-on-surface-variant/70 md:max-w-[46rem] md:text-right">
            Disponibilidad sujeta a confirmación. Las marcas de vehículos mencionadas pertenecen a
            sus respectivos titulares y se citan únicamente con fines de compatibilidad.
          </p>
        </div>
      </div>
    </footer>
  );
}
