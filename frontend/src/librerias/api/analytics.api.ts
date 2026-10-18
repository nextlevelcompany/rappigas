import { peticionHttp } from "./cliente-http";

export interface VentasDiaDto {
  dia: string;
  monto: number;
  pedidos: number;
}

export interface VentaProductoDto {
  nombreProducto: string;
  sku: string;
  unidadesVendidas: number;
  totalVentas: number;
}

export interface DashboardEmpresaDto {
  ventasHoy: number;
  ventasMes: number;
  totalPedidosMes: number;
  ticketPromedio: number;
  pedidosPendientes: number;
  pedidosEnCamino: number;
  pedidosEntregados: number;
  productosAgotados: number;
  balonesStockBajo: number;
  repartidoresActivos: number;
  ventasPorDia: VentasDiaDto[];
  pedidosPorMetodoPago: Record<string, number>;
  ventasPorProducto: VentaProductoDto[];
}

export interface DashboardAdminDto {
  volumenTransaccionadoTotal: number;
  comisionesTotalesPlataforma: number;
  totalEmpresas: number;
  empresasAprobadas: number;
  empresasPendientes: number;
  totalClientes: number;
  totalRepartidores: number;
  totalPedidosGlobal: number;
  tasaEntregaExitosa: number;
  ticketsAbiertos: number;
  ventasPorDiaGlobal: VentasDiaDto[];
  distribucionPorMetodoPago: Record<string, number>;
}

export const analyticsApi = {
  obtenerDashboardEmpresa: async (): Promise<DashboardEmpresaDto> => {
    return await peticionHttp<DashboardEmpresaDto>("/empresa/dashboard");
  },

  obtenerDashboardAdmin: async (): Promise<DashboardAdminDto> => {
    return await peticionHttp<DashboardAdminDto>("/admin/dashboard");
  },
};
