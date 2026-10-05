import { peticionHttp } from "./cliente-http";

export type EstadoPedido =
  | "PENDIENTE"
  | "CONFIRMADO"
  | "ASIGNADO"
  | "EN_CAMINO"
  | "ENTREGADO"
  | "CANCELADO";

export type MetodoPago = "EFECTIVO" | "YAPE" | "PLIN" | "TARJETA";

export type EstadoPago = "PENDIENTE" | "PAGADO" | "REEMBOLSADO";

export interface ItemPedidoDto {
  productoPublicId: string;
  cantidad: number;
}

export interface CrearPedidoDto {
  empresaPublicId: string;
  latitud: number;
  longitud: number;
  direccionEntrega: string;
  referenciaDireccion?: string;
  notasCliente?: string;
  metodoPago: MetodoPago;
  items: ItemPedidoDto[];
}

export interface DetallePedidoItem {
  productoPublicId: string;
  sku: string;
  nombreProducto: string;
  tipoGas: string;
  tipoValvula: string;
  imagenUrl?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PedidoDetalle {
  publicId: string;
  tenantId: number;
  empresaPublicId: string;
  nombreEmpresa: string;
  telefonoEmpresa?: string;
  clientePublicId: string;
  nombreCliente: string;
  telefonoCliente?: string;
  emailCliente?: string;
  repartidorPublicId?: string;
  nombreRepartidor?: string;
  telefonoRepartidor?: string;
  vehiculoPlaca?: string;
  subtotal: number;
  descuento: number;
  total: number;
  estado: EstadoPedido;
  metodoPago: MetodoPago;
  estadoPago: EstadoPago;
  direccionEntrega: string;
  referenciaDireccion?: string;
  latitud: number;
  longitud: number;
  notasCliente?: string;
  codigoConfirmacion?: string;
  fechaEntrega?: string;
  createdAt: string;
  updatedAt: string;
  items: DetallePedidoItem[];
}

export interface PaginaPedidos {
  content: PedidoDetalle[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ResumenMetricasPedidos {
  pendientes: number;
  confirmados: number;
  enCamino: number;
  entregados: number;
  cancelados: number;
  total: number;
}

export interface ActualizarEstadoPedidoDto {
  nuevoEstado: EstadoPedido;
  codigoConfirmacion?: string;
  motivoCancelacion?: string;
}

export const pedidosApi = {
  // Endpoints para Distribuidora (EMPRESA / ADMIN)
  listarPedidosEmpresa(estado?: EstadoPedido, page = 0, size = 20): Promise<PaginaPedidos> {
    const params = new URLSearchParams();
    if (estado) params.append("estado", estado);
    params.append("page", page.toString());
    params.append("size", size.toString());
    return peticionHttp<PaginaPedidos>(`/pedidos?${params.toString()}`);
  },

  obtenerMetricas(): Promise<ResumenMetricasPedidos> {
    return peticionHttp<ResumenMetricasPedidos>("/pedidos/metricas");
  },

  obtenerPedidoEmpresa(publicId: string): Promise<PedidoDetalle> {
    return peticionHttp<PedidoDetalle>(`/pedidos/${publicId}`);
  },

  actualizarEstado(publicId: string, dto: ActualizarEstadoPedidoDto): Promise<PedidoDetalle> {
    return peticionHttp<PedidoDetalle>(`/pedidos/${publicId}/estado`, {
      method: "PATCH",
      datos: dto,
    });
  },

  // Endpoints para Clientes
  crearPedido(dto: CrearPedidoDto): Promise<PedidoDetalle> {
    return peticionHttp<PedidoDetalle>("/clientes/pedidos", {
      method: "POST",
      datos: dto,
    });
  },

  listarMisPedidos(page = 0, size = 20): Promise<PaginaPedidos> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", size.toString());
    return peticionHttp<PaginaPedidos>(`/clientes/pedidos?${params.toString()}`);
  },

  obtenerMiPedido(publicId: string): Promise<PedidoDetalle> {
    return peticionHttp<PedidoDetalle>(`/clientes/pedidos/${publicId}`);
  },

  cancelarMiPedido(publicId: string): Promise<PedidoDetalle> {
    return peticionHttp<PedidoDetalle>(`/clientes/pedidos/${publicId}/cancelar`, {
      method: "PATCH",
    });
  },
};
