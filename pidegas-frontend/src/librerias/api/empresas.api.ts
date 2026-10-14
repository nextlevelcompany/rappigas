import { peticionHttp } from "./cliente-http";
import { DashboardEmpresaDto } from "./analytics.api";

export type EstadoEmpresa = "PENDIENTE" | "APROBADA" | "SUSPENDIDA" | "RECHAZADA";

export interface RegistroEmpresaPayload {
  ruc: string;
  nombreComercial: string;
  razonSocial?: string;
  telefono?: string;
  emailContacto: string;
  direccionFiscal?: string;
  adminEmail: string;
  adminPassword: string;
  adminNombres: string;
  adminApellidos: string;
}

export interface ActualizarEmpresaPayload {
  nombreComercial?: string;
  razonSocial?: string;
  telefono?: string;
  direccionFiscal?: string;
  logoUrl?: string;
}

export interface EmpresaDetalle {
  id: number;
  publicId: string;
  ruc: string;
  razonSocial?: string;
  nombreComercial: string;
  telefono?: string;
  emailContacto: string;
  direccionFiscal?: string;
  logoUrl?: string;
  estado: EstadoEmpresa;
  createdAt: string;
  updatedAt: string;
  adminNombre?: string;
  adminEmail?: string;
  adminTelefono?: string;
}

export const empresasApi = {
  // Público: Afiliación / Registro de nueva empresa
  registrarEmpresa: async (datos: RegistroEmpresaPayload): Promise<EmpresaDetalle> => {
    return peticionHttp<EmpresaDetalle>("/empresas/registro", {
      method: "POST",
      datos,
    });
  },

  // Empresa (Tenant autenticado): Obtener datos propios
  obtenerMiEmpresa: async (): Promise<EmpresaDetalle> => {
    return peticionHttp<EmpresaDetalle>("/empresas/mi-empresa");
  },

  // Empresa (Tenant autenticado): Actualizar datos propios
  actualizarMiEmpresa: async (datos: ActualizarEmpresaPayload): Promise<EmpresaDetalle> => {
    return peticionHttp<EmpresaDetalle>("/empresas/mi-empresa", {
      method: "PUT",
      datos,
    });
  },

  // Super Admin: Listar todas las empresas con filtro opcional de estado
  listarEmpresasAdmin: async (estado?: EstadoEmpresa): Promise<EmpresaDetalle[]> => {
    const params = estado ? `?estado=${estado}` : "";
    return peticionHttp<EmpresaDetalle[]>(`/admin/empresas${params}`);
  },

  // Super Admin: Obtener detalle por publicId
  obtenerEmpresaAdmin: async (publicId: string): Promise<EmpresaDetalle> => {
    return peticionHttp<EmpresaDetalle>(`/admin/empresas/${publicId}`);
  },

  // Super Admin: Obtener métricas y estadísticas de una distribuidora
  obtenerMetricasEmpresaAdmin: async (publicId: string): Promise<DashboardEmpresaDto> => {
    return peticionHttp<DashboardEmpresaDto>(`/admin/empresas/${publicId}/metricas`);
  },

  // Super Admin: Cambiar estado (Aprobar, Suspender, Rechazar)
  cambiarEstadoEmpresa: async (
    publicId: string,
    nuevoEstado: EstadoEmpresa,
    motivo?: string
  ): Promise<EmpresaDetalle> => {
    return peticionHttp<EmpresaDetalle>(`/admin/empresas/${publicId}/estado`, {
      method: "PATCH",
      datos: { nuevoEstado, motivo },
    });
  },

  // Público / Clientes: Directorio de empresas aprobadas
  listarEmpresasPublicas: async (): Promise<EmpresaDetalle[]> => {
    return peticionHttp<EmpresaDetalle[]>("/publico/empresas");
  },

  // Público / Clientes: Detalle de distribuidora
  obtenerEmpresaPublica: async (publicId: string): Promise<EmpresaDetalle> => {
    return peticionHttp<EmpresaDetalle>(`/publico/empresas/${publicId}`);
  },
};
