import type { Metadata } from "next";
import { PanelCatalogo } from "@/components/admin/PanelCatalogo";
import {
  almacenEscribible,
  configuracionCompleta,
  datosDentroDelProyecto,
  directorioDatos,
  leerCatalogo,
  leerMarcas,
} from "@/lib/admin/almacen";
import { MARCAS_INICIALES, type Opcion } from "@/lib/taxonomia";
import type { Producto } from "@/lib/types";

/**
 * Panel de administración del catálogo.
 *
 * Quien llega sin sesión lo desvía `proxy.ts` a `/admin/entrar`; las rutas de
 * API que usa el panel vuelven a comprobarlo por su cuenta.
 *
 * El listado se lee **aquí, en el servidor**, y baja ya pintado en el primer
 * HTML. Antes lo pedía el cliente en un `useEffect`, lo que dejaba un parpadeo
 * de "Cargando…" en cada entrada y encadenaba dos renders para nada.
 */
export const metadata: Metadata = {
  title: "Panel del catálogo",
  robots: { index: false, follow: false, nocache: true },
};

/** Nunca estático: depende de la cookie de sesión y del estado del repositorio. */
export const dynamic = "force-dynamic";

export default async function PaginaAdmin() {
  let productos: Producto[] = [];
  let marcas: Opcion<string>[] = MARCAS_INICIALES;
  let errorInicial: string | null = null;

  if (!configuracionCompleta()) {
    errorInicial =
      "El panel no está configurado en este servidor. Faltan ADMIN_PASSWORD_HASH y ADMIN_SESSION_SECRET.";
  } else {
    try {
      [productos, marcas] = await Promise.all([leerCatalogo(), leerMarcas()]);
    } catch (error) {
      errorInicial =
        error instanceof Error ? error.message : "No se pudo leer el catálogo del servidor.";
    }

    /*
     * Disco de solo lectura.
     *
     * El sitio público se repliega solo y muestra el catálogo que viene con el
     * código, así que desde fuera todo parece normal. Aquí dentro no puede
     * parecerlo: sin este aviso el panel se vería lleno y en orden, la empresa
     * editaría un repuesto, y el guardado fallaría —o peor, parecería funcionar
     * hasta el siguiente arranque—. Vale más decirlo antes de que escriban nada.
     */
    if (!errorInicial && !(await almacenEscribible())) {
      errorInicial =
        "Este alojamiento no permite guardar cambios: su disco es de solo lectura. " +
        "El catálogo que ves es el que viene con el código y el sitio público funciona con " +
        "normalidad, pero nada de lo que edites aquí se conservará. El panel necesita un " +
        "servidor Node con disco propio, como Hostinger o un VPS, y la variable ADMIN_DATA_DIR " +
        "apuntando a una carpeta fuera del proyecto.";
    }
  }

  /*
   * Aviso de datos en riesgo. Se calcula en el servidor porque el navegador no
   * puede saber dónde está la carpeta, y se pasa ya resuelto para no filtrar
   * rutas del servidor más allá de lo que el propio administrador necesita ver.
   */
  /*
   * En desarrollo esto es lo normal —nadie despliega desde su computador— así
   * que se muestra como nota informativa. En producción sí es una alarma: ahí
   * significa que el próximo despliegue borrará el trabajo de la empresa.
   * Pintarlo siempre en rojo enseñaría a ignorarlo, que es justo lo contrario
   * de lo que se busca.
   */
  const datosEnRiesgo = datosDentroDelProyecto();
  const esDesarrollo = process.env.NODE_ENV !== "production";

  return (
    <PanelCatalogo
      productosIniciales={productos}
      errorInicial={errorInicial}
      datosEnRiesgo={datosEnRiesgo}
      marcasIniciales={marcas}
      rutaDatos={datosEnRiesgo ? directorioDatos() : null}
      esDesarrollo={esDesarrollo}
    />
  );
}
