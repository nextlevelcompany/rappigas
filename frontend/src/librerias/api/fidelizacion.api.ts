import { peticionHttp } from "./cliente-http";

export type TipoMovimientoPuntos = "ACUMULACION" | "CANJE" | "AJUSTE";
export type TipoDescuento = "PORCENTAJE" | "MONTO_FIJO";

export interface BilleteraPuntos {
  id: number;
  clientePublicId: string;
  nombreCliente: string;
  saldoPuntos: number;
  updatedAt: string;
}

export interface MovimientoPuntos {
  id: number;
  tipoMovimiento: TipoMovimientoPuntos;
  puntos: number;
  saldoResultante: number;
  motivo?: string;
  pedidoPublicId?: string;
  createdAt: string;
}

export interface ResultadoValidacionCupon {
  valido: boolean;
  codigo: string;
  descuento: number;
  nuevoTotal: number;
  mensaje: string;
}

export interface CuponDetalle {
  publicId: string;
  tenantId?: number;
  codigo: string;
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  pedidoMinimo: number;
  usosMaximos?: number;
  usosActuales: number;
  validoDesde: string;
  validoHasta: string;
  activo: boolean;
}

export interface CrearCuponPayload {
  codigo: string;
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  pedidoMinimo?: number;
  usosMaximos?: number;
  validoDesde?: string;
  validoHasta?: string;
}

export const fidelizacionApi = {
  // Cliente: Billetera y Puntos
  obtenerBilletera(): Promise<BilleteraPuntos> {
    return peticionHttp<BilleteraPuntos>("/clientes/fidelizacion/billetera");
  },

  obtenerMovimientos(): Promise<MovimientoPuntos[]> {
    return peticionHttp<MovimientoPuntos[]>("/clientes/fidelizacion/movimientos");
  },

  validarCupon(codigo: string, subtotal: number, empresaPublicId?: string): Promise<ResultadoValidacionCupon> {
    return peticionHttp<ResultadoValidacionCupon>("/clientes/fidelizacion/validar-cupon", {
      method: "POST",
      datos: { codigo, subtotal, empresaPublicId },
    });
  },

  // Distribuidora: Promociones y Cupones
  listarCuponesEmpresa(): Promise<CuponDetalle[]> {
    return peticionHttp<CuponDetalle[]>("/empresa/promociones/cupones");
  },

  crearCupon(datos: CrearCuponPayload): Promise<CuponDetalle> {
    return peticionHttp<CuponDetalle>("/empresa/promociones/cupones", {
      method: "POST",
      datos,
    });
  },
};
