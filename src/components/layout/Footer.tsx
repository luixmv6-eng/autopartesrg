import { Logo } from "./Logo";
import { IconoRed } from "./IconoRed";
import { Icon, type IconName } from "@/components/ui/Icon";
import { CONTACTO } from "@/lib/contacto";
import { MENSAJE_GENERICO, enlaceWhatsApp } from "@/lib/whatsapp";
import { MARCAS_INICIALES } from "@/lib/taxonomia";

const NAVEGACION = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#catalogo", label: "Catálogo" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/nosotros?s=vision#vision", label: "Visión" },
  { href: "/nosotros?s=mision#mision", label: "Misión" },
  { href: "/nosotros?s=sobre-nosotros#sobre-nosotros", label: "Historia" },
  { href: "/nosotros?s=garantias#garantias", label: "Garantías" },
  { href: "/nosotros?s=envios#envios", label: "Envíos" },
];

/**
 * Marcas de mayor rotación, como atajos al catálogo ya filtrado.
 *
 * Antes eran categorías, pero dejaron de ser un filtro del catálogo: un enlace
 * a `/?cat=frenos` habría llevado a una portada sin filtrar, que es peor que no
 * ofrecerlo. Se toman de la lista de arranque y no del archivo de marcas vivas
 * a propósito: el pie aparece en todas las páginas y no merece una lectura de
 * disco por visita para seis enlaces que no cambian.
 */
const ATAJOS = MARCAS_INICIALES.filter((m) =>
  ["chevrolet", "toyota", "nissan", "suzuki", "kia", "ford"].includes(m.id)
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
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-on-panel-suave">
          {etiqueta}
        </span>
        <span className="text-label-technical text-on-panel">{children}</span>
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
        className="mb-md font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary"
      >
        {titulo}
      </h2>
      <ul className="space-y-1">
        {enlaces.map((e) => (
          <li key={`${e.href}-${e.label}`}>
            {/*
             * 32px de alto basta con ratón, pero se queda corto para el dedo.
             * El criterio es el tipo de puntero y no la anchura de pantalla:
             * un portátil táctil necesita el objetivo grande aunque tenga
             * 1440px de ancho, y un móvil apaisado también.
             */}
            <a
              href={e.href}
              className="group inline-flex h-8 items-center gap-1.5 text-label-technical text-on-panel-suave transition-colors pointer-coarse:h-11 hover:text-primary"
            >
              {/* Escala en lugar de anchura: animar `width` recalcula el layout en cada
                  hover, y son doce enlaces. Con `scale-x` y origen a la izquierda
                  el trazo crece igual pero solo compone. */}
              <span className="h-px w-3 origin-left scale-x-0 bg-primary transition-transform duration-[var(--dur-rapida)] motion-safe:group-hover:scale-x-100" />
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
      className="relative mt-auto w-full border-t border-panel-borde bg-surface-container-lowest text-on-panel-suave"
    >
      {/* Filo superior: cierra la página con el mismo recurso que abre el hero */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
      />

      <div className="contenedor py-xl">
        <div className="grid grid-cols-1 gap-xl sm:grid-cols-2 lg:grid-cols-[1.5fr_0.9fr_0.9fr_1.3fr] lg:gap-lg 2xl:gap-xl">
          {/* Identidad y llamada a la acción */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo className="mb-md h-[7.5rem] sm:h-40" />
            <p className="mb-lg max-w-[52ch] text-label-technical leading-relaxed text-on-panel-suave">
              Catálogo digital de repuestos con compatibilidad verificada por marca, modelo y año.
              Cotiza por WhatsApp y te confirmamos disponibilidad el mismo día.
            </p>

            <a
              href={enlaceWhatsApp(MENSAJE_GENERICO)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-sm rounded-lg bg-wa px-md font-mono text-label-technical uppercase tracking-[0.08em] text-on-wa shadow-e1 transition-[translate,box-shadow] duration-200 motion-safe:hover:-translate-y-px hover:shadow-e2"
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
                    aria-label={`Autopartes ERG en ${red.nombre}`}
                    className="grid size-11 place-items-center rounded-lg border border-panel-borde text-on-panel-suave transition-[color,border-color,background-color,translate] duration-200 motion-safe:hover:-translate-y-px hover:border-primary hover:bg-panel hover:text-primary"
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
            enlaces={ATAJOS.map((m) => ({ href: `/?marca=${m.id}#catalogo`, label: m.label }))}
          />

          {/* Contacto */}
          <div>
            <h2 className="mb-md font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
              Contacto
            </h2>
            <ul className="space-y-md">
              {/* Teléfono y correo son los dos enlaces que más se pulsan desde
                  el móvil, y eran los más pequeños: 18px de alto, el del texto
                  suelto. Con puntero grueso pasan a 44. */}
              <Dato icono="call" etiqueta="Teléfono">
                <a
                  href={`tel:${CONTACTO.telefono.replace(/[^\d+]/g, "")}`}
                  className="tabular inline-flex items-center break-all font-mono transition-colors pointer-coarse:min-h-11 hover:text-primary"
                >
                  {CONTACTO.telefono}
                </a>
              </Dato>
              <Dato icono="mail" etiqueta="Correo">
                <a
                  href={`mailto:${CONTACTO.correo}`}
                  className="inline-flex items-center break-all font-mono transition-colors pointer-coarse:min-h-11 hover:text-primary"
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
       * Cierre: copyright y aviso de compatibilidad en una sola franja.
       *
       * El relleno derecho reserva el hueco del botón flotante de WhatsApp,
       * que si no se superpone al texto. Se calcula a partir del tamaño real
       * del botón en vez de dos números fijos que había que reajustar a mano
       * cada vez que cambiaba.
       */}
      <div className="border-t border-panel-borde bg-panel">
        <div
          className="contenedor flex flex-col gap-sm py-lg md:flex-row md:items-baseline md:justify-between md:gap-xl"
          style={{ paddingInlineEnd: "calc(var(--tamano-fab) + var(--gutter) * 2)" }}
        >
          <p className="shrink-0 font-mono text-label-sm text-on-panel-suave">
            © {anio} {CONTACTO.nombre}. Todos los derechos reservados.
          </p>

          <p className="font-mono text-[11px] leading-relaxed text-on-panel-suave md:max-w-[80ch] md:text-right">
            Disponibilidad sujeta a confirmación. Las marcas de vehículos mencionadas pertenecen a
            sus respectivos titulares y se citan únicamente con fines de compatibilidad.
          </p>
        </div>
      </div>
    </footer>
  );
}
