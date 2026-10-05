import { peticionHttp } from "./cliente-http";

export type MetodoPago = "EFECTIVO" | "YAPE" | "PLIN" | "TARJETA";
export type EstadoTransaccionPago = "PENDIENTE" | "APROBADO" | "RECHAZADO" | "REEMBOLSADO";
export type EstadoLiquidacion = "PENDIENTE" | "PAGADA";

export interface PagoDetalle {
  publicId: string;
  pedidoPublicId: string;
  tenantId: number;
  monto: number;
  metodoPago: MetodoPago;
  estado: EstadoTransaccionPago;
  referenciaTransaccion: string;
  codigoAutorizacion: string;
  createdAt: string;
}

export interface ResumenFinanciero {
  totalVentasAprobadas: number;
  totalComisiones: number;
  comisionesPendientes: number;
  totalPorLiquidar: number;
  pedidosPagados: number;
  ultimosPagos: PagoDetalle[];
}

export interface Liquidacion {
  publicId: string;
  periodoInicio: string;
  periodoFin: string;
  totalVentas: number;
  totalComisiones: number;
  totalALiquidar: number;
  estado: EstadoLiquidacion;
  referenciaBancaria: string;
  fechaPago?: string;
  createdAt: string;
}

export interface ProcesarPagoPayload {
  pedidoPublicId: string;
  metodoPago: MetodoPago;
  telefonoYapePlin?: string;
  tokenTarjeta?: string;
  nombreTitular?: string;
}

export interface ResultadoProcesamientoPago {
  exitoso: boolean;
  referenciaTransaccion?: string;
  codigoAutorizacion?: string;
  mensaje: string;
  metadata?: string;
}

export const finanzasApi = {
  // Distribuidora: Resumen financiero y transacciones
  obtenerResumen(): Promise<ResumenFinanciero> {
    return peticionHttp<ResumenFinanciero>("/empresa/finanzas/resumen");
  },

  listarPagos(): Promise<PagoDetalle[]> {
    return peticionHttp<PagoDetalle[]>("/empresa/finanzas/pagos");
  },

  listarLiquidaciones(): Promise<Liquidacion[]> {
    return peticionHttp<Liquidacion[]>("/empresa/finanzas/liquidaciones");
  },

  generarLiquidacion(payload?: { periodoInicio?: string; periodoFin?: string }): Promise<Liquidacion> {
    return peticionHttp<Liquidacion>("/empresa/finanzas/liquidaciones", {
      method: "POST",
      body: JSON.stringify(payload || {}),
    });
  },

  // Cliente: Procesar pago con pasarela
  procesarPagoCliente(payload: ProcesarPagoPayload): Promise<ResultadoProcesamientoPago> {
    return peticionHttp<ResultadoProcesamientoPago>("/clientes/pagos/procesar", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Exportación a CSV / Excel de reporte financiero
  async descargarReporteCsv(): Promise<void> {
    const token = typeof window !== "undefined" ? localStorage.getItem("pidegas_access_token") : null;
    const res = await fetch("http://localhost:8080/api/v1/empresa/finanzas/exportar/csv", {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      throw new Error(`Error ${res.status}: No se pudo descargar el reporte`);
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_financiero_pidegas_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },
};
