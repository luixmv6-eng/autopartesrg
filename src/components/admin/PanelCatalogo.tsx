"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { LABEL_CATEGORIA, type Opcion } from "@/lib/taxonomia";
import { rangoAniosLegible } from "@/lib/utils";
import type { Producto } from "@/lib/types";
import { FormularioProducto } from "./FormularioProducto";

/**
 * Panel del catálogo: listado, alta, edición y baja.
 *
 * El listado se pide siempre al servidor, que a su vez lo lee del repositorio.
 * No se reutiliza el `productos.json` que viene compilado con el sitio: ese es
 * la foto del último despliegue, y si alguien editó después mostraría datos
 * viejos y las escrituras chocarían.
 *
 * Un detalle que conviene explicar a quien use esto: al guardar, el cambio va
 * al repositorio, y el sitio público tarda uno o dos minutos en reconstruirse.
 * Es la contrapartida de no tener base de datos, y se avisa en pantalla para
 * que nadie crea que no funcionó.
 */

interface Props {
  /** Catálogo leído en el servidor: llega ya pintado, sin parpadeo de carga. */
  productosIniciales: Producto[];
  errorInicial: string | null;
  /** Los datos viven dentro de la carpeta del proyecto: un despliegue los borraría. */
  datosEnRiesgo: boolean;
  /** Dónde están guardados. Solo se envía cuando hay que avisar. */
  rutaDatos: string | null;
  /** En desarrollo el aviso es una nota; en producción, una alarma. */
  esDesarrollo: boolean;
  /** Marcas de vehículo vivas, ampliables desde el formulario. */
  marcasIniciales: Opcion<string>[];
}

type Vista = { modo: "lista" } | { modo: "editar"; producto: Producto | null };

const normalizar = (valor: string) =>
  valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

export function PanelCatalogo({
  productosIniciales,
  errorInicial,
  datosEnRiesgo,
  rutaDatos,
  esDesarrollo,
  marcasIniciales,
}: Props) {
  const router = useRouter();
  const [marcas, setMarcas] = useState<Opcion<string>[]>(marcasIniciales);
  const etiquetaMarca = (id: string) => marcas.find((m) => m.id === id)?.label ?? id;
  const [productos, setProductos] = useState<Producto[]>(productosIniciales);
  const [error, setError] = useState<string | null>(errorInicial);
  const [aviso, setAviso] = useState<string | null>(null);
  const [vista, setVista] = useState<Vista>({ modo: "lista" });
  const [busqueda, setBusqueda] = useState("");
  const [borrando, setBorrando] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState<Producto | null>(null);

  /** Relee el catálogo tras guardar o borrar, para reflejar lo que quedó escrito. */
  const recargar = async () => {
    setError(null);
    try {
      const respuesta = await fetch("/api/admin/catalogo", { cache: "no-store" });
      const datos = (await respuesta.json()) as { productos?: Producto[]; error?: string };
      if (!respuesta.ok) {
        // Sesión caducada: devolver a la entrada en vez de dejar una pantalla rota.
        if (respuesta.status === 401) {
          router.push("/admin/entrar");
          return;
        }
        setError(datos.error ?? "No se pudo cargar el catálogo.");
        return;
      }
      setProductos(datos.productos ?? []);
    } catch {
      setError("No se pudo contactar con el servidor.");
    }
  };

  const filtrados = useMemo(() => {
    const termino = normalizar(busqueda.trim());
    const lista = termino
      ? productos.filter((p) =>
          normalizar([p.nombre, p.marca, ...p.modelos, p.oem ?? ""].join(" ")).includes(termino)
        )
      : productos;
    return [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [productos, busqueda]);

  const eliminar = async (producto: Producto) => {
    setBorrando(producto.id);
    setError(null);
    setConfirmando(null);
    try {
      const respuesta = await fetch("/api/admin/catalogo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: producto.id }),
      });
      const datos = (await respuesta.json()) as { error?: string; aviso?: string };
      if (!respuesta.ok) {
        setError(datos.error ?? "No se pudo eliminar.");
      } else {
        setAviso(datos.aviso ?? `"${producto.nombre}" se eliminó del catálogo.`);
        await recargar();
      }
    } catch {
      setError("No se pudo contactar con el servidor.");
    } finally {
      setBorrando(null);
    }
  };

  const salir = async () => {
    await fetch("/api/admin/sesion", { method: "DELETE" });
    // `refresh` descarta lo que el router tuviera guardado de la sesión anterior;
    // sin él, volver atrás enseñaría el panel ya cerrado.
    router.refresh();
    router.push("/admin/entrar");
  };

  if (vista.modo === "editar") {
    return (
      <div className="contenedor py-lg">
        <button
          type="button"
          onClick={() => setVista({ modo: "lista" })}
          className="mb-lg inline-flex items-center gap-xs font-mono text-label-technical text-primary hover:underline"
        >
          <Icon name="chevron_right" size={16} className="rotate-180" />
          Volver al listado
        </button>
        <div className="overflow-hidden rounded-xl border border-panel-borde bg-panel shadow-e1">
          <div className="bg-primary px-md py-md text-on-primary">
            <h1 className="flex items-center gap-sm text-headline-md font-bold tracking-[-0.01em]">
              <Icon name={vista.producto ? "edit" : "add"} size={20} />
              {vista.producto ? "Editar repuesto" : "Añadir un repuesto"}
            </h1>
            <p className="mt-xs truncate font-mono text-label-sm uppercase tracking-[0.12em] text-on-primary/70">
              {vista.producto ? vista.producto.nombre : "Nuevo en el catálogo"}
            </p>
          </div>
          <div className="p-md md:p-lg">
                <FormularioProducto
              producto={vista.producto}
              marcas={marcas}
              onMarcasCambiadas={setMarcas}
              onCancelar={() => setVista({ modo: "lista" })}
              onGuardado={async (mensaje) => {
                setAviso(mensaje);
                setVista({ modo: "lista" });
                await recargar();
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor py-lg">
      {/*
        * Banda en primario, la misma que encabeza el panel de filtros del
        * catálogo. Es lo que ata visualmente el administrador al resto del
        * sitio en vez de dejarlo como una pantalla suelta.
        */}
      <div className="mb-lg overflow-hidden rounded-xl border border-panel-borde bg-panel shadow-e1">
        <div className="flex flex-wrap items-center justify-between gap-md bg-primary px-md py-md text-on-primary">
          <div>
            <h1 className="flex items-center gap-sm text-headline-md font-bold tracking-[-0.01em]">
              <Icon name="build_circle" size={20} />
              Panel del catálogo
            </h1>
            <p className="mt-xs font-mono text-label-sm uppercase tracking-[0.12em] text-on-primary/70">
              {`${productos.length} ${productos.length === 1 ? "repuesto" : "repuestos"} publicados`}
            </p>
          </div>
          <Button variante="neutral" tamano="sm" onClick={salir}>
            <Icon name="logout" size={16} />
            Salir
          </Button>
        </div>

        <div className="flex flex-col gap-sm p-sm md:flex-row md:items-center md:p-md">
          <div className="flex min-w-0 flex-grow items-center rounded-lg border border-borde-campo bg-surface-container-lowest px-sm">
            <Icon name="search" size={20} className="mr-sm shrink-0 text-primary" />
            <label htmlFor="buscar-admin" className="sr-only">
              Buscar repuesto en el panel
            </label>
            <input
              id="buscar-admin"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, marca, modelo o número de parte"
              className="h-11 w-full min-w-0 border-none bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant"
            />
          </div>
          <Button
            className="shrink-0"
            onClick={() => setVista({ modo: "editar", producto: null })}
          >
            <Icon name="add" size={18} />
            Añadir repuesto
          </Button>
        </div>
      </div>

      {/*
        * Aviso de datos en riesgo. Es el fallo más caro posible en este montaje:
        * si la carpeta de datos está dentro del proyecto, el siguiente
        * despliegue borra todo lo que se haya editado, y nadie se entera hasta
        * que ya pasó. Por eso va arriba del todo y en rojo.
        */}
      {datosEnRiesgo &&
        (esDesarrollo ? (
          <p className="mb-md flex items-start gap-sm rounded-lg border border-outline-variant bg-surface-container-low p-md text-label-technical leading-relaxed text-on-surface-variant">
            <Icon name="history" size={18} className="mt-px shrink-0 text-primary" />
            <span>
              Estás en tu computador, así que el catálogo y las fotos se guardan en la carpeta{" "}
              <code className="font-mono">datos/</code> del proyecto. Es lo normal aquí. Al publicar
              en el servidor habrá que configurar{" "}
              <code className="font-mono">ADMIN_DATA_DIR</code> fuera del proyecto, y este aviso se
              volverá una advertencia en rojo hasta que se haga.
            </span>
          </p>
        ) : (
          <p
            role="alert"
            className="mb-md flex items-start gap-sm rounded-lg border border-error bg-error/10 p-md text-label-technical leading-relaxed text-on-surface"
          >
            <Icon name="warning" size={18} className="mt-px shrink-0 text-error" />
            <span>
              <strong>Los datos están guardados dentro de la carpeta del sitio.</strong> La próxima
              vez que se actualice el sitio se borrarán el catálogo y las fotos que edites aquí.
              Para evitarlo, configura la variable{" "}
              <code className="font-mono">ADMIN_DATA_DIR</code> con una ruta fuera del proyecto y
              reinicia la aplicación.
              {rutaDatos && (
                <>
                  {" "}
                  Ahora mismo apuntan a <code className="font-mono break-all">{rutaDatos}</code>.
                </>
              )}
            </span>
          </p>
        ))}

      {aviso && (
        <p
          role="status"
          className="mb-md flex items-start gap-sm rounded-lg border border-primary/40 bg-primary-fixed p-md text-label-technical text-on-primary-fixed"
        >
          <Icon name="check_circle" size={18} className="mt-px shrink-0 text-primary" />
          {aviso}
          <button
            type="button"
            onClick={() => setAviso(null)}
            className="ml-auto shrink-0 text-on-primary-fixed-variant hover:text-on-primary-fixed"
            aria-label="Cerrar aviso"
          >
            <Icon name="close" size={16} />
          </button>
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mb-md flex items-start gap-sm rounded-lg border border-error/40 bg-error/5 p-md text-label-technical leading-relaxed text-on-surface"
        >
          <Icon name="warning" size={18} className="mt-px shrink-0 text-error" />
          {error}
        </p>
      )}

      {filtrados.length === 0 ? (
        <p className="py-xl text-center text-body-md text-on-surface-variant">
          {busqueda ? "Ningún repuesto coincide con la búsqueda." : "El catálogo está vacío."}
        </p>
      ) : (
        <ul className="flex flex-col gap-sm">
          {filtrados.map((producto) => (
            <li
              key={producto.id}
              className="flex flex-wrap items-center gap-md rounded-lg border border-outline-variant bg-surface-container-lowest p-sm"
            >
              <div className="relative size-16 shrink-0 overflow-hidden rounded border border-outline-variant bg-surface-container-low">
                <Image
                  src={producto.imagen}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                  unoptimized
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-body-md font-semibold text-on-surface">
                  {producto.nombre}
                </p>
                <p className="truncate font-mono text-label-sm text-on-surface-variant">
                  {etiquetaMarca(producto.marca)} · {producto.modelos.join(", ")} ·{" "}
                  <span className="tabular">
                    {rangoAniosLegible(producto.anioDesde, producto.anioHasta)}
                  </span>
                </p>
                <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                  {producto.categoria ? LABEL_CATEGORIA[producto.categoria] : "Sin clasificar"}
                  {producto.destacado && " · destacado"}
                </p>
              </div>

              <div className="flex shrink-0 gap-xs">
                <Button
                  variante="outline"
                  tamano="sm"
                  onClick={() => setVista({ modo: "editar", producto })}
                >
                  <Icon name="edit" size={16} />
                  Editar
                </Button>
                <Button
                  variante="ghost"
                  tamano="sm"
                  onClick={() => setConfirmando(producto)}
                  disabled={borrando === producto.id}
                  className="text-error hover:bg-error/10"
                >
                  {borrando === producto.id ? (
                    <Icon name="refresh" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="delete" size={16} />
                  )}
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/*
       * Confirmación de borrado. No se usa `confirm()` del navegador porque en
       * móvil es fácil de descartar sin leer, y porque conviene decir aquí que
       * la foto también se borra.
       */}
      {confirmando && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-md">
          <div className="w-full max-w-[32rem] rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-e2">
            <h2 className="mb-sm text-headline-md text-on-surface">¿Eliminar este repuesto?</h2>
            <p className="mb-lg text-body-md leading-relaxed text-on-surface-variant">
              Se quitará <strong className="text-on-surface">{confirmando.nombre}</strong> del
              catálogo y se borrará su foto. Queda en el historial del repositorio, así que se puede
              recuperar, pero no desde este panel.
            </p>
            <div className="flex flex-wrap gap-sm">
              <Button variante="neutral" onClick={() => setConfirmando(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() => void eliminar(confirmando)}
                className="bg-error text-white hover:bg-error/90"
              >
                Sí, eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
