import { create } from "zustand";
import { RespuestaAutenticacion } from "@/librerias/api/auth.api";

interface EstadoAutenticacion {
  accessToken: string | null;
  refreshToken: string | null;
  usuario: {
    publicId: string;
    email: string;
    nombres: string;
    apellidos: string;
    rol: "CLIENTE" | "EMPRESA" | "REPARTIDOR" | "ADMIN";
    tenantId?: number | null;
  } | null;
  estaAutenticado: boolean;
  cargando: boolean;

  establecerSesion: (datos: RespuestaAutenticacion) => void;
  cerrarSesion: () => void;
  cargarSesionDesdeStorage: () => void;
}

const estadoInicial = {
  accessToken: null,
  refreshToken: null,
  usuario: null,
  estaAutenticado: false,
  cargando: true,
};

export const useAuthStore = create<EstadoAutenticacion>((set) => ({
  ...estadoInicial,

  establecerSesion: (datos: RespuestaAutenticacion) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pidegas_access_token", datos.accessToken);
      localStorage.setItem("pidegas_refresh_token", datos.refreshToken);
      localStorage.setItem("pidegas_usuario", JSON.stringify({
        publicId: datos.publicId,
        email: datos.email,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        rol: datos.rol,
        tenantId: datos.tenantId,
      }));
    }

    set({
      accessToken: datos.accessToken,
      refreshToken: datos.refreshToken,
      usuario: {
        publicId: datos.publicId,
        email: datos.email,
        nombres: datos.nombres,
        apellidos: datos.apellidos,
        rol: datos.rol,
        tenantId: datos.tenantId,
      },
      estaAutenticado: true,
      cargando: false,
    });
  },

  cerrarSesion: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pidegas_access_token");
      localStorage.removeItem("pidegas_refresh_token");
      localStorage.removeItem("pidegas_usuario");
    }

    set({
      accessToken: null,
      refreshToken: null,
      usuario: null,
      estaAutenticado: false,
      cargando: false,
    });
  },

  cargarSesionDesdeStorage: () => {
    if (typeof window === "undefined") {
      set({ cargando: false });
      return;
    }

    const token = localStorage.getItem("pidegas_access_token");
    const refresh = localStorage.getItem("pidegas_refresh_token");
    const usuarioStr = localStorage.getItem("pidegas_usuario");

    if (token && usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        set({
          accessToken: token,
          refreshToken: refresh,
          usuario,
          estaAutenticado: true,
          cargando: false,
        });
        return;
      } catch {
        // En caso de JSON corrupto, limpiar storage
        localStorage.removeItem("pidegas_usuario");
      }
    }

    set({ cargando: false });
  },
}));
