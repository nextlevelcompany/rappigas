import { peticionHttp } from "./cliente-http";

export type TipoEventoAuditoria =
  | "INICIO_SESION_EXITOSO"
  | "INICIO_SESION_FALLIDO"
  | "REGISTRO_CLIENTE"
  | "REGISTRO_EMPRESA"
  | "CAMBIO_ESTADO_EMPRESA"
  | "CREACION_PEDIDO"
  | "CAMBIO_ESTADO_PEDIDO"
  | "PAGO_PROCESADO"
  | "LIQUIDACION_GENERADA"
  | "TICKET_CREADO"
  | "TICKET_CERRADO";

export interface RegistroAuditoriaDto {
  publicId: string;
  usuarioId: number | null;
  tenantId: number | null;
  tipoEvento: TipoEventoAuditoria;
  descripcion: string;
  ipOrigen: string | null;
  userAgent: string | null;
  detallesJson: string | null;
  createdAt: string;
}

export const auditoriaApi = {
  listarEventos: async (): Promise<RegistroAuditoriaDto[]> => {
    return await peticionHttp<RegistroAuditoriaDto[]>("/admin/auditoria");
  },
};
