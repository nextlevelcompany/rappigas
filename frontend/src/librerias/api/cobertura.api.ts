import { peticionHttp } from "./cliente-http";
import { EmpresaDetalle } from "./empresas.api";

export interface ZonaCoberturaDetalle {
  id: number;
  publicId: string;
  tenantId: number;
  nombre: string;
  activa: boolean;
  coordenadas: [number, number][]; // [lng, lat]
  createdAt: string;
  updatedAt: string;
}

export interface CrearZonaPayload {
  nombre: string;
  coordenadas: [number, number][];
}

export interface ActualizarZonaPayload {
  nombre?: string;
  activa?: boolean;
  coordenadas?: [number, number][];
}

export interface RespuestaVerificarCobertura {
  tieneCobertura: boolean;
  lat: number;
  lng: number;
  totalDistribuidoras: number;
  distribuidorasDisponibles: EmpresaDetalle[];
}

export const coberturaApi = {
  // Empresa: Listar zonas propias
  listarMisZonas: async (): Promise<ZonaCoberturaDetalle[]> => {
    return peticionHttp<ZonaCoberturaDetalle[]>("/cobertura/zonas");
  },

  // Empresa: Obtener detalle por publicId
  obtenerMiZona: async (publicId: string): Promise<ZonaCoberturaDetalle> => {
    return peticionHttp<ZonaCoberturaDetalle>(`/cobertura/zonas/${publicId}`);
  },

  // Empresa: Crear nueva zona poligonal
  crearZona: async (datos: CrearZonaPayload): Promise<ZonaCoberturaDetalle> => {
    return peticionHttp<ZonaCoberturaDetalle>("/cobertura/zonas", {
      method: "POST",
      datos,
    });
  },

  // Empresa: Actualizar zona
  actualizarZona: async (
    publicId: string,
    datos: ActualizarZonaPayload
  ): Promise<ZonaCoberturaDetalle> => {
    return peticionHttp<ZonaCoberturaDetalle>(`/cobertura/zonas/${publicId}`, {
      method: "PUT",
      datos,
    });
  },

  // Empresa: Eliminar / desactivar zona
  eliminarZona: async (publicId: string): Promise<void> => {
    return peticionHttp<void>(`/cobertura/zonas/${publicId}`, {
      method: "DELETE",
    });
  },

  // Público / Clientes: Verificación geoespacial ST_Covers
  verificarCobertura: async (
    lat: number,
    lng: number
  ): Promise<RespuestaVerificarCobertura> => {
    return peticionHttp<RespuestaVerificarCobertura>(
      "/publico/cobertura/verificar",
      {
        method: "POST",
        datos: { lat, lng },
      }
    );
  },
};
