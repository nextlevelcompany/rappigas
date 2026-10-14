import { peticionHttp } from "./cliente-http";

export interface UsuarioDetalle {
  publicId: string;
  email: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  rol: "CLIENTE" | "EMPRESA" | "REPARTIDOR" | "ADMIN";
  estado: "ACTIVO" | "INACTIVO" | "BANEADO";
  createdAt: string;
}

export const usuariosApi = {
  listarUsuariosAdmin: async (rol?: string): Promise<UsuarioDetalle[]> => {
    const query = rol ? `?rol=${rol}` : "";
    return peticionHttp<UsuarioDetalle[]>(`/admin/usuarios${query}`);
  },
};
