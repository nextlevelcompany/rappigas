function obtenerApiUrl(): string {
  if (typeof window !== "undefined") {
    return "/api/v1";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
}

interface OpcionesPeticion extends RequestInit {
  datos?: unknown;
}

export class ErrorApi extends Error {
  status: number;
  detalles?: string[];

  constructor(mensaje: string, status: number, detalles?: string[]) {
    super(mensaje);
    this.name = "ErrorApi";
    this.status = status;
    this.detalles = detalles;
  }
}

export async function peticionHttp<T>(
  endpoint: string,
  opciones: OpcionesPeticion = {}
): Promise<T> {
  const { datos, headers, ...restoOpciones } = opciones;

  const url = `${obtenerApiUrl()}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const encabezados = new Headers(headers);
  if (!encabezados.has("Content-Type") && !(datos instanceof FormData)) {
    encabezados.set("Content-Type", "application/json");
  }

  // Adjuntar token de autenticación si existe en el navegador
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("pidegas_access_token");
    if (token && !encabezados.has("Authorization")) {
      encabezados.set("Authorization", `Bearer ${token}`);
    }
  }

  const respuesta = await fetch(url, {
    ...restoOpciones,
    headers: encabezados,
    body: datos
      ? datos instanceof FormData
        ? datos
        : JSON.stringify(datos)
      : undefined,
  });

  if (!respuesta.ok) {
    let errorMensaje = `Error ${respuesta.status}: Solicitud fallida`;
    let detalles: string[] | undefined;

    try {
      const errorJson = await respuesta.json();
      if (errorJson.mensaje) {
        errorMensaje = errorJson.mensaje;
      }
      if (errorJson.detalles && Array.isArray(errorJson.detalles)) {
        detalles = errorJson.detalles;
      }
    } catch {
      // Usar mensaje por defecto si la respuesta no es JSON
    }

    throw new ErrorApi(errorMensaje, respuesta.status, detalles);
  }

  if (respuesta.status === 204) {
    return {} as T;
  }

  return respuesta.json();
}
