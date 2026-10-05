import { peticionHttp } from "./cliente-http";
import { PedidoDetalle, PaginaPedidos } from "./pedidos.api";

export type EstadoVehiculo = "ACTIVO" | "MANTENIMIENTO" | "INACTIVO";
export type TipoVehiculo = "MOTO_FURGON" | "CAMIONETA" | "CAMION_GLP";
export type EstadoRepartidor = "DISPONIBLE" | "EN_RUTA" | "DESCONECTADO" | "SUSPENDIDO";

export interface VehiculoDetalle {
  publicId: string;
  tenantId: number;
  placa: string;
  marca?: string;
  modelo?: string;
  tipoVehiculo: TipoVehiculo;
  capacidadBalones: number;
  estado: EstadoVehiculo;
  createdAt: string;
}

export interface CrearVehiculoPayload {
  placa: string;
  marca?: string;
  modelo?: string;
  tipoVehiculo: TipoVehiculo;
  capacidadBalones: number;
}

export interface RepartidorDetalle {
  publicId: string;
  tenantId: number;
  usuarioPublicId: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  licenciaConducir?: string;
  vehiculoPublicId?: string;
  vehiculoPlaca?: string;
  vehiculoTipo?: TipoVehiculo;
  estado: EstadoRepartidor;
  latitudActual?: number;
  longitudActual?: number;
  ultimaActualizacionGps?: string;
  createdAt: string;
}

export interface RegistrarRepartidorPayload {
  email: string;
  licenciaConducir?: string;
  vehiculoPublicId?: string;
}

export interface ActualizarUbicacionGpsPayload {
  latitud: number;
  longitud: number;
  pedidoPublicId?: string;
}

export const flotaApi = {
  // Vehículos (Distribuidora)
  listarVehiculos(): Promise<VehiculoDetalle[]> {
    return peticionHttp<VehiculoDetalle[]>("/flota/vehiculos");
  },

  crearVehiculo(datos: CrearVehiculoPayload): Promise<VehiculoDetalle> {
    return peticionHttp<VehiculoDetalle>("/flota/vehiculos", {
      method: "POST",
      datos,
    });
  },

  // Repartidores (Distribuidora)
  listarRepartidores(): Promise<RepartidorDetalle[]> {
    return peticionHttp<RepartidorDetalle[]>("/flota/repartidores");
  },

  registrarRepartidor(datos: RegistrarRepartidorPayload): Promise<RepartidorDetalle> {
    return peticionHttp<RepartidorDetalle>("/flota/repartidores", {
      method: "POST",
      datos,
    });
  },

  asignarRepartidorAPedido(pedidoPublicId: string, repartidorPublicId: string): Promise<PedidoDetalle> {
    return peticionHttp<PedidoDetalle>(`/pedidos/${pedidoPublicId}/asignar-repartidor`, {
      method: "PATCH",
      datos: { repartidorPublicId },
    });
  },

  // Operaciones del Repartidor (Móvil / En Ruta)
  listarMisPedidosAsignados(page = 0, size = 20): Promise<PaginaPedidos> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString());
    return peticionHttp<PaginaPedidos>(`/repartidores/pedidos/asignados?${params.toString()}`);
  },

  iniciarRuta(pedidoPublicId: string): Promise<PedidoDetalle> {
    return peticionHttp<PedidoDetalle>(`/repartidores/pedidos/${pedidoPublicId}/iniciar-ruta`, {
      method: "PATCH",
    });
  },

  confirmarEntrega(pedidoPublicId: string, codigoConfirmacion: string): Promise<PedidoDetalle> {
    return peticionHttp<PedidoDetalle>(`/repartidores/pedidos/${pedidoPublicId}/entregar`, {
      method: "PATCH",
      datos: { codigoConfirmacion },
    });
  },

  actualizarGps(latitud: number, longitud: number, pedidoPublicId?: string): Promise<void> {
    return peticionHttp<void>("/repartidores/ubicacion", {
      method: "POST",
      datos: { latitud, longitud, pedidoPublicId },
    });
  },
};
