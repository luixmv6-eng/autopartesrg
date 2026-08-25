"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { type Opcion } from "@/lib/taxonomia";
import { generarId } from "@/lib/admin/esquema";
import type { Producto } from "@/lib/types";

interface Props {
  /** El repuesto a editar, o `null` para crear uno nuevo. */
  producto: Producto | null;
  /** Marcas disponibles al abrir el formulario. */
  marcas: Opcion<string>[];
  /** Avisa al panel de que la lista de marcas cambió, para refrescarla. */
  onMarcasCambiadas: (marcas: Opcion<string>[]) => void;
  onCancelar: () => void;
  onGuardado: (mensaje: string) => void;
}

/** Valor centinela del `<select>` que abre el campo de marca nueva. */
const NUEVA_MARCA = "__nueva__";

/** Estado del formulario: todo texto, porque eso es lo que hay en un `<input>`. */
interface Campos {
  nombre: string;
  descripcion: string;
  marca: string;
  modelos: string;
  anioDesde: string;
  anioHasta: string;
  oem: string;
  imagen: string;
  destacado: boolean;
}

const vacio: Campos = {
  nombre: "",
  descripcion: "",
  marca: "",
  modelos: "",
  anioDesde: "",
  anioHasta: "",
  oem: "",
  imagen: "",
  destacado: false,
};

function desde(producto: Producto | null): Campos {
  if (!producto) return vacio;
  return {
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    marca: producto.marca,
    modelos: producto.modelos.join(", "),
    anioDesde: String(producto.anioDesde),
    anioHasta: String(producto.anioHasta),
    oem: producto.oem ?? "",
    imagen: producto.imagen,
    destacado: producto.destacado ?? false,
  };
}

/** Etiqueta + campo, con su error debajo. */
function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  children,
}: {
  id: string;
  etiqueta: string;
  error?: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-xs block text-label-technical font-semibold text-on-surface">
        {etiqueta}
      </label>
      {children}
      {ayuda && !error && <p className="mt-xs text-label-sm text-on-surface-variant">{ayuda}</p>}
      {error && (
        <p className="mt-xs text-label-sm font-semibold text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const claseCampo =
  "h-11 w-full rounded-lg border border-borde-campo bg-surface-container-lowest px-3 text-body-md text-on-surface outline-none transition-colors focus:border-primary";

export function FormularioProducto({
  producto,
  marcas,
  onMarcasCambiadas,
  onCancelar,
  onGuardado,
}: Props) {
  const [campos, setCampos] = useState<Campos>(() => desde(producto));
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const entradaArchivo = useRef<HTMLInputElement>(null);

  // Alta de marca en línea: se despliega al elegir la opción del desplegable.
  const [anadiendoMarca, setAnadiendoMarca] = useState(false);
  const [marcaNueva, setMarcaNueva] = useState("");
  const [guardandoMarca, setGuardandoMarca] = useState(false);

  const set = <C extends keyof Campos>(clave: C, valor: Campos[C]) =>
    setCampos((previo) => ({ ...previo, [clave]: valor }));

  /**
   * La foto se sube en cuanto se elige, no al guardar.
   *
   * Así quien edita ve enseguida si la imagen entró bien, en vez de descubrirlo
   * al final junto a los errores del resto del formulario. El nombre del archivo
   * sale del nombre del repuesto, así que hay que escribirlo antes.
   */
  const subirFoto = async (archivo: File) => {
    const id = generarId(campos.nombre);
    if (!id) {
      setErrores((e) => ({ ...e, imagen: "Escribe primero el nombre del repuesto." }));
      return;
    }

    setSubiendo(true);
    setErrores((e) => ({ ...e, imagen: "" }));

    const cuerpo = new FormData();
    cuerpo.append("archivo", archivo);
    cuerpo.append("id", id);

    try {
      const respuesta = await fetch("/api/admin/imagen", { method: "POST", body: cuerpo });
      const datos = (await respuesta.json()) as { imagen?: string; error?: string };
      if (!respuesta.ok || !datos.imagen) {
        setErrores((e) => ({ ...e, imagen: datos.error ?? "No se pudo subir la foto." }));
      } else {
        // La marca de tiempo evita que el navegador siga enseñando la foto
        // anterior desde su memoria cuando se reemplaza la de un repuesto.
        set("imagen", datos.imagen);
      }
    } catch {
      setErrores((e) => ({ ...e, imagen: "No se pudo contactar con el servidor." }));
    } finally {
      setSubiendo(false);
    }
  };

  /**
   * Crea la marca y la deja seleccionada.
   *
   * Se guarda al momento, sin esperar a que se envíe el repuesto: así el
   * desplegable queda con la marca puesta y, si algo falla al crear el producto,
   * la marca no se pierde y no hay que volver a escribirla.
   */
  const crearMarca = async () => {
    const nombre = marcaNueva.trim();
    if (!nombre) return;

    setGuardandoMarca(true);
    setErrores((e) => ({ ...e, marca: "" }));

    try {
      const respuesta = await fetch("/api/admin/marcas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      const datos = (await respuesta.json()) as {
        marca?: Opcion<string>;
        marcas?: Opcion<string>[];
        error?: string;
      };

      // El 409 (ya existe) no es un fallo desde el punto de vista de quien
      // escribe: la marca que quería está disponible, solo que ya estaba. Se
      // selecciona y se sigue.
      if (respuesta.ok || (respuesta.status === 409 && datos.marca)) {
        if (datos.marcas) onMarcasCambiadas(datos.marcas);
        if (datos.marca) set("marca", datos.marca.id);
        setAnadiendoMarca(false);
        setMarcaNueva("");
        if (respuesta.status === 409 && datos.error) {
          setErrores((e) => ({ ...e, marca: datos.error as string }));
        }
      } else {
        setErrores((e) => ({ ...e, marca: datos.error ?? "No se pudo añadir la marca." }));
      }
    } catch {
      setErrores((e) => ({ ...e, marca: "No se pudo contactar con el servidor." }));
    } finally {
      setGuardandoMarca(false);
    }
  };

  const guardar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    setGuardando(true);
    setErrores({});
    setErrorGeneral(null);

    try {
      const respuesta = await fetch("/api/admin/catalogo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          producto: {
            ...campos,
            modelos: campos.modelos,
            anioDesde: campos.anioDesde,
            anioHasta: campos.anioHasta,
            ...(producto ? { idOriginal: producto.id } : {}),
          },
        }),
      });
      const datos = (await respuesta.json()) as {
        error?: string;
        errores?: Record<string, string>;
        esNuevo?: boolean;
      };

      if (!respuesta.ok) {
        if (datos.errores) setErrores(datos.errores);
        setErrorGeneral(datos.error ?? "No se pudo guardar.");
        setGuardando(false);
        return;
      }

      onGuardado(
        datos.esNuevo
          ? `"${campos.nombre}" se añadió al catálogo.`
          : `"${campos.nombre}" se actualizó.`
      );
    } catch {
      setErrorGeneral("No se pudo contactar con el servidor.");
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={guardar} className="flex flex-col gap-lg">
      <div className="grid gap-md md:grid-cols-2">
        <div className="md:col-span-2">
          <Campo
            id="f-nombre"
            etiqueta="Nombre del repuesto"
            error={errores.nombre || errores.id}
            ayuda="Como aparecerá en el catálogo. También determina el nombre del archivo de la foto."
          >
            <input
              id="f-nombre"
              className={claseCampo}
              value={campos.nombre}
              onChange={(e) => set("nombre", e.target.value)}
              maxLength={140}
              required
            />
          </Campo>
        </div>

        <div className="md:col-span-2">
          <Campo
            id="f-descripcion"
            etiqueta="Descripción"
            error={errores.descripcion}
            ayuda="Qué incluye, de qué material es, cuándo se cambia. Dos o tres frases."
          >
            <textarea
              id="f-descripcion"
              rows={4}
              className="w-full rounded-lg border border-borde-campo bg-surface-container-lowest p-3 text-body-md leading-relaxed text-on-surface outline-none transition-colors focus:border-primary"
              value={campos.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              maxLength={700}
              required
            />
          </Campo>
        </div>

        <Campo
          id="f-marca"
          etiqueta="Marca del vehículo"
          error={errores.marca}
          ayuda={
            anadiendoMarca
              ? undefined
              : "¿No está en la lista? Elige «Añadir una marca nueva» al final."
          }
        >
          {anadiendoMarca ? (
            <div className="flex flex-wrap gap-sm">
              <input
                id="f-marca"
                className={`${claseCampo} min-w-0 flex-1`}
                value={marcaNueva}
                onChange={(e) => setMarcaNueva(e.target.value)}
                placeholder="Ej. Mitsubishi"
                maxLength={40}
                autoFocus
                onKeyDown={(e) => {
                  // Enter aquí crearía el repuesto entero sin querer.
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void crearMarca();
                  }
                }}
              />
              <Button
                type="button"
                variante="outline"
                onClick={() => void crearMarca()}
                disabled={guardandoMarca || !marcaNueva.trim()}
              >
                {guardandoMarca ? (
                  <Icon name="refresh" size={18} className="animate-spin" />
                ) : (
                  <Icon name="add" size={18} />
                )}
                Añadir
              </Button>
              <Button
                type="button"
                variante="neutral"
                onClick={() => {
                  setAnadiendoMarca(false);
                  setMarcaNueva("");
                }}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <select
              id="f-marca"
              className={claseCampo}
              value={campos.marca}
              onChange={(e) => {
                if (e.target.value === NUEVA_MARCA) {
                  setAnadiendoMarca(true);
                  return;
                }
                set("marca", e.target.value);
              }}
              required
            >
              <option value="">Elige una marca…</option>
              {marcas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
              <option value={NUEVA_MARCA}>+ Añadir una marca nueva…</option>
            </select>
          )}
        </Campo>

        <Campo
          id="f-modelos"
          etiqueta="Modelos compatibles"
          error={errores.modelos}
          ayuda="Separados por comas. Ej. Spark GT, Tracker, Sonic"
        >
          <input
            id="f-modelos"
            className={claseCampo}
            value={campos.modelos}
            onChange={(e) => set("modelos", e.target.value)}
            required
          />
        </Campo>

        <Campo id="f-anioDesde" etiqueta="Año desde" error={errores.anioDesde}>
          <input
            id="f-anioDesde"
            className={`${claseCampo} tabular`}
            inputMode="numeric"
            value={campos.anioDesde}
            onChange={(e) => set("anioDesde", e.target.value.replace(/\D/g, "").slice(0, 4))}
            required
          />
        </Campo>

        <Campo id="f-anioHasta" etiqueta="Año hasta" error={errores.anioHasta}>
          <input
            id="f-anioHasta"
            className={`${claseCampo} tabular`}
            inputMode="numeric"
            value={campos.anioHasta}
            onChange={(e) => set("anioHasta", e.target.value.replace(/\D/g, "").slice(0, 4))}
            required
          />
        </Campo>

        <Campo
          id="f-oem"
          etiqueta="Número de parte (opcional)"
          error={errores.oem}
          ayuda="Solo si viene impreso en la pieza o en la caja. Déjalo vacío antes que inventarlo."
        >
          <input
            id="f-oem"
            className={`${claseCampo} font-mono`}
            value={campos.oem}
            onChange={(e) => set("oem", e.target.value)}
            maxLength={40}
          />
        </Campo>
      </div>

      {/* Foto */}
      <div>
        <p className="mb-xs text-label-technical font-semibold text-on-surface">Foto del repuesto</p>
        <div className="flex flex-wrap items-start gap-md rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-md">
          <div className="relative size-32 shrink-0 overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
            {campos.imagen ? (
              <Image
                src={campos.imagen}
                alt=""
                fill
                sizes="128px"
                className="object-contain p-2"
                unoptimized
              />
            ) : (
              <span className="grid h-full place-items-center text-label-sm text-on-surface-variant">
                Sin foto
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <input
              ref={entradaArchivo}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const archivo = e.target.files?.[0];
                if (archivo) void subirFoto(archivo);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variante="outline"
              onClick={() => entradaArchivo.current?.click()}
              disabled={subiendo}
            >
              {subiendo ? (
                <>
                  <Icon name="refresh" size={18} className="animate-spin" />
                  Subiendo…
                </>
              ) : (
                <>
                  <Icon name="photo_camera" size={18} />
                  {campos.imagen ? "Cambiar foto" : "Subir foto"}
                </>
              )}
            </Button>
            <p className="mt-sm text-label-sm leading-relaxed text-on-surface-variant">
              JPG, PNG o WebP, hasta 4 MB. Cuadrada queda mejor. La foto se guarda con el nombre del
              repuesto, así que escríbelo antes.
            </p>
            {campos.imagen && (
              <p className="tabular mt-xs truncate font-mono text-label-sm text-on-surface-variant">
                {campos.imagen}
              </p>
            )}
            {errores.imagen && (
              <p className="mt-xs text-label-sm font-semibold text-error" role="alert">
                {errores.imagen}
              </p>
            )}
          </div>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-sm">
        <input
          type="checkbox"
          checked={campos.destacado}
          onChange={(e) => set("destacado", e.target.checked)}
          className="size-4 accent-[var(--color-primary)]"
        />
        <span className="text-body-md text-on-surface">
          Destacado — aparece primero en el catálogo
        </span>
      </label>

      {errorGeneral && (
        <p
          role="alert"
          className="flex items-start gap-sm rounded-lg border border-error/40 bg-error/5 p-md text-label-technical leading-relaxed text-on-surface"
        >
          <Icon name="warning" size={18} className="mt-px shrink-0 text-error" />
          {errorGeneral}
        </p>
      )}

      <div className="flex flex-wrap gap-sm border-t border-outline-variant pt-lg">
        <Button type="submit" tamano="lg" disabled={guardando || subiendo}>
          {guardando ? (
            <>
              <Icon name="refresh" size={20} className="animate-spin" />
              Guardando…
            </>
          ) : (
            <>
              <Icon name="check" size={20} />
              {producto ? "Guardar cambios" : "Añadir al catálogo"}
            </>
          )}
        </Button>
        <Button type="button" variante="neutral" tamano="lg" onClick={onCancelar}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
