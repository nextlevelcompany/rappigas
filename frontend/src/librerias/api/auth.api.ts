import { peticionHttp } from "./cliente-http";

export interface SolicitudLogin {
  email: string;
  password: string;
}

export interface SolicitudRegistroCliente {
  email: string;
  password: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
}

export interface RespuestaAutenticacion {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  publicId: string;
  email: string;
  nombres: string;
  apellidos: string;
  rol: "CLIENTE" | "EMPRESA" | "REPARTIDOR" | "ADMIN";
  tenantId?: number | null;
}

export interface UsuarioPerfil {
  publicId: string;
  email: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  rol: string;
  estado: string;
  createdAt: string;
}

export interface ActualizarPerfilDto {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  nuevaPassword?: string;
}

export const authApi = {
  login: async (datos: SolicitudLogin): Promise<RespuestaAutenticacion> => {
    return peticionHttp<RespuestaAutenticacion>("/auth/login", {
      method: "POST",
      datos,
    });
  },

  registroCliente: async (datos: SolicitudRegistroCliente): Promise<RespuestaAutenticacion> => {
    return peticionHttp<RespuestaAutenticacion>("/auth/registro-cliente", {
      method: "POST",
      datos,
    });
  },

  refrescarToken: async (refreshToken: string): Promise<RespuestaAutenticacion> => {
    return peticionHttp<RespuestaAutenticacion>("/auth/refresh", {
      method: "POST",
      datos: { refreshToken },
    });
  },

  obtenerPerfil: async (): Promise<UsuarioPerfil> => {
    return peticionHttp<UsuarioPerfil>("/auth/yo", {
      method: "GET",
    });
  },

  actualizarPerfil: async (datos: ActualizarPerfilDto): Promise<UsuarioPerfil> => {
    return peticionHttp<UsuarioPerfil>("/auth/yo", {
      method: "PUT",
      datos,
    });
  },
};
