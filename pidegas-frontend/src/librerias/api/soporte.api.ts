import { peticionHttp } from "./cliente-http";

export type EstadoTicket = "ABIERTO" | "EN_PROCESO" | "RESUELTO" | "CERRADO";
export type PrioridadTicket = "BAJA" | "MEDIA" | "ALTA" | "URGENTE";

export interface MensajeTicketDetalle {
  id: number;
  remitentePublicId: string;
  nombreRemitente: string;
  rolRemitente: string;
  esMio: boolean;
  mensaje: string;
  adjuntoUrl?: string;
  createdAt: string;
}

export interface TicketDetalle {
  publicId: string;
  asunto: string;
  estado: EstadoTicket;
  prioridad: PrioridadTicket;
  pedidoPublicId?: string;
  usuarioNombre: string;
  usuarioEmail: string;
  usuarioRol: string;
  tenantId?: number;
  nombreEmpresa?: string;
  createdAt: string;
  updatedAt: string;
  totalMensajes: number;
  mensajes: MensajeTicketDetalle[];
}

export interface CrearTicketPayload {
  asunto: string;
  prioridad?: PrioridadTicket;
  pedidoPublicId?: string;
  mensajeInicial: string;
  adjuntoUrl?: string;
}

export interface ResumenSoporte {
  abiertos: number;
  enProceso: number;
  resueltos: number;
  cerrados: number;
  total: number;
}

export const soporteClienteApi = {
  crearTicket: async (payload: CrearTicketPayload): Promise<TicketDetalle> => {
    return peticionHttp<TicketDetalle>("/clientes/soporte", {
      method: "POST",
      datos: payload,
    });
  },

  listarMisTickets: async (): Promise<TicketDetalle[]> => {
    return peticionHttp<TicketDetalle[]>("/clientes/soporte", {
      method: "GET",
    });
  },

  obtenerTicket: async (publicId: string): Promise<TicketDetalle> => {
    return peticionHttp<TicketDetalle>(`/clientes/soporte/${publicId}`, {
      method: "GET",
    });
  },

  responderTicket: async (
    publicId: string,
    mensaje: string,
    adjuntoUrl?: string
  ): Promise<TicketDetalle> => {
    return peticionHttp<TicketDetalle>(`/clientes/soporte/${publicId}/mensajes`, {
      method: "POST",
      datos: { mensaje, adjuntoUrl },
    });
  },
};

export const soporteEmpresaApi = {
  listarTickets: async (): Promise<TicketDetalle[]> => {
    return peticionHttp<TicketDetalle[]>("/empresa/soporte", {
      method: "GET",
    });
  },

  obtenerMetricas: async (): Promise<ResumenSoporte> => {
    return peticionHttp<ResumenSoporte>("/empresa/soporte/resumen", {
      method: "GET",
    });
  },

  obtenerTicket: async (publicId: string): Promise<TicketDetalle> => {
    return peticionHttp<TicketDetalle>(`/empresa/soporte/${publicId}`, {
      method: "GET",
    });
  },

  responderTicket: async (
    publicId: string,
    mensaje: string,
    adjuntoUrl?: string
  ): Promise<TicketDetalle> => {
    return peticionHttp<TicketDetalle>(`/empresa/soporte/${publicId}/mensajes`, {
      method: "POST",
      datos: { mensaje, adjuntoUrl },
    });
  },

  cambiarEstado: async (
    publicId: string,
    estado: EstadoTicket
  ): Promise<TicketDetalle> => {
    return peticionHttp<TicketDetalle>(`/empresa/soporte/${publicId}/estado`, {
      method: "PATCH",
      datos: { estado },
    });
  },
};

export const soporteAdminApi = {
  listarTickets: async (): Promise<TicketDetalle[]> => {
    return peticionHttp<TicketDetalle[]>("/admin/soporte", {
      method: "GET",
    });
  },

  obtenerMetricas: async (): Promise<ResumenSoporte> => {
    return peticionHttp<ResumenSoporte>("/admin/soporte/resumen", {
      method: "GET",
    });
  },

  obtenerTicket: async (publicId: string): Promise<TicketDetalle> => {
    return peticionHttp<TicketDetalle>(`/admin/soporte/${publicId}`, {
      method: "GET",
    });
  },

  responderTicket: async (
    publicId: string,
    mensaje: string,
    adjuntoUrl?: string
  ): Promise<TicketDetalle> => {
    return peticionHttp<TicketDetalle>(`/admin/soporte/${publicId}/mensajes`, {
      method: "POST",
      datos: { mensaje, adjuntoUrl },
    });
  },

  cambiarEstado: async (
    publicId: string,
    estado: EstadoTicket
  ): Promise<TicketDetalle> => {
    return peticionHttp<TicketDetalle>(`/admin/soporte/${publicId}/estado`, {
      method: "PATCH",
      datos: { estado },
    });
  },
};

export const archivosApi = {
  subirArchivo: async (archivo: File): Promise<{ url: string; nombreArchivo: string }> => {
    const formData = new FormData();
    formData.append("archivo", archivo);

    return peticionHttp<{ url: string; nombreArchivo: string }>("/archivos/subir", {
      method: "POST",
      datos: formData,
    });
  },
};
