import { peticionHttp } from "./cliente-http";

export type TipoMovimientoStock = "ENTRADA" | "SALIDA_VENTA" | "AJUSTE" | "DEVOLUCION";

export interface AlmacenDetalle {
  publicId: string;
  tenantId: number;
  nombre: string;
  direccion?: string;
  activo: boolean;
  createdAt: string;
}

export interface CrearAlmacenPayload {
  nombre: string;
  direccion?: string;
}

export interface StockProductoDetalle {
  id: number;
  almacenPublicId: string;
  nombreAlmacen: string;
  productoPublicId: string;
  sku: string;
  nombreProducto: string;
  tipoGas: string;
  tipoValvula: string;
  cantidadDisponible: number;
  cantidadReservada: number;
  stockMinimo: number;
  alertaBajoStock: boolean;
}

export interface RegistrarMovimientoPayload {
  almacenPublicId: string;
  productoPublicId: string;
  tipoMovimiento: TipoMovimientoStock;
  cantidad: number;
  motivo?: string;
}

export interface MovimientoStockDetalle {
  id: number;
  nombreAlmacen: string;
  productoPublicId?: string;
  skuProducto: string;
  nombreProducto: string;
  tipoMovimiento: TipoMovimientoStock;
  cantidad: number;
  motivo?: string;
  pedidoPublicId?: string;
  createdAt: string;
}

export interface PaginaKardex {
  content: MovimientoStockDetalle[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ResumenInventario {
  totalBalonesDisponibles: number;
  totalBalonesReservados: number;
  almacenesActivos: number;
  productosBajoStock: number;
}

export const inventarioApi = {
  // Almacenes
  listarAlmacenes(): Promise<AlmacenDetalle[]> {
    return peticionHttp<AlmacenDetalle[]>("/inventario/almacenes");
  },

  crearAlmacen(datos: CrearAlmacenPayload): Promise<AlmacenDetalle> {
    return peticionHttp<AlmacenDetalle>("/inventario/almacenes", {
      method: "POST",
      datos,
    });
  },

  // Stock
  consultarStock(almacenPublicId?: string): Promise<StockProductoDetalle[]> {
    const url = almacenPublicId
      ? `/inventario/stock?almacenPublicId=${almacenPublicId}`
      : "/inventario/stock";
    return peticionHttp<StockProductoDetalle[]>(url);
  },

  // Movimientos y Kardex
  registrarMovimiento(datos: RegistrarMovimientoPayload): Promise<StockProductoDetalle> {
    return peticionHttp<StockProductoDetalle>("/inventario/movimientos", {
      method: "POST",
      datos,
    });
  },

  obtenerKardex(page = 0, size = 20): Promise<PaginaKardex> {
    return peticionHttp<PaginaKardex>(`/inventario/kardex?page=${page}&size=${size}`);
  },

  // Resumen
  obtenerResumen(): Promise<ResumenInventario> {
    return peticionHttp<ResumenInventario>("/inventario/resumen");
  },
};
