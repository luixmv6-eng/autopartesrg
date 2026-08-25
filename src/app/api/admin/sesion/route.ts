import {
  COOKIE_SESION,
  anotarFallo,
  bloqueado,
  cookieBorrada,
  contrasenaValida,
  crearSesion,
  limpiarIntentos,
  opcionesCookie,
} from "@/lib/admin/sesion";

/**
 * Entrar y salir del panel.
 *
 * `POST` comprueba la contraseña y deja la cookie de sesión. `DELETE` la borra.
 *
 * Nunca se distingue en la respuesta entre "no hay contraseña configurada" y
 * "la contraseña es incorrecta": las dos devuelven el mismo mensaje. Decir cuál
 * de las dos es le ahorraría trabajo a quien esté probando.
 */

/** De dónde viene la petición, para el freno de intentos. */
function direccionIp(request: Request): string {
  const reenviada = request.headers.get("x-forwarded-for");
  if (reenviada) return reenviada.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "desconocida";
}

export async function POST(request: Request) {
  const ip = direccionIp(request);

  if (bloqueado(ip)) {
    return Response.json(
      { error: "Demasiados intentos fallidos. Espera 15 minutos e inténtalo de nuevo." },
      { status: 429 }
    );
  }

  let contrasena = "";
  try {
    const cuerpo = (await request.json()) as { contrasena?: unknown };
    contrasena = typeof cuerpo.contrasena === "string" ? cuerpo.contrasena : "";
  } catch {
    return Response.json({ error: "Petición mal formada." }, { status: 400 });
  }

  if (!contrasena) {
    return Response.json({ error: "Escribe la contraseña." }, { status: 400 });
  }

  if (!(await contrasenaValida(contrasena))) {
    anotarFallo(ip);
    return Response.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  let cookie: string;
  try {
    cookie = `${COOKIE_SESION}=${crearSesion()}; ${opcionesCookie()}`;
  } catch {
    // Falta ADMIN_SESSION_SECRET. Es un fallo de configuración del servidor, no
    // del usuario, y conviene que se distinga para poder arreglarlo.
    return Response.json(
      { error: "El panel no está configurado del todo: falta ADMIN_SESSION_SECRET." },
      { status: 500 }
    );
  }

  limpiarIntentos(ip);
  return Response.json({ ok: true }, { headers: { "Set-Cookie": cookie } });
}

export async function DELETE() {
  return Response.json({ ok: true }, { headers: { "Set-Cookie": cookieBorrada() } });
}
