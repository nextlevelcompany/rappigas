import { peticionHttp } from "./cliente-http";

export type TipoBalonGas =
  | "GLP_10KG"
  | "GLP_15KG"
  | "GLP_45KG"
  | "VALVULA_ACCESORIO";

export type TipoValvulaGas = "PREMIUM" | "ROSCA" | "NINGUNA";

export type EstadoProducto = "ACTIVO" | "AGOTADO" | "INACTIVO";

export interface ProductoDetalle {
  id: number;
  publicId: string;
  tenantId: number;
  sku: string;
  nombre: string;
  descripcion?: string;
  tipoGas: TipoBalonGas;
  tipoGasDescripcion?: string;
  tipoValvula: TipoValvulaGas;
  tipoValvulaDescripcion?: string;
  precio: number;
  imagenUrl?: string;
  estado: EstadoProducto;
  createdAt: string;
  updatedAt: string;
}

export interface CrearProductoPayload {
  sku: string;
  nombre: string;
  descripcion?: string;
  tipoGas: TipoBalonGas;
  tipoValvula: TipoValvulaGas;
  precio: number;
  imagenUrl?: string;
}

export interface ActualizarProductoPayload {
  nombre?: string;
  descripcion?: string;
  tipoGas?: TipoBalonGas;
  tipoValvula?: TipoValvulaGas;
  precio?: number;
  imagenUrl?: string;
  estado?: EstadoProducto;
}

export const catalogoApi = {
  // Empresa (Tenant): Listar balones de gas propios
  listarMisProductos: async (
    estado?: EstadoProducto
  ): Promise<ProductoDetalle[]> => {
    const params = estado ? `?estado=${estado}` : "";
    return peticionHttp<ProductoDetalle[]>(`/productos${params}`);
  },

  // Empresa: Obtener detalle por publicId
  obtenerMiProducto: async (publicId: string): Promise<ProductoDetalle> => {
    return peticionHttp<ProductoDetalle>(`/productos/${publicId}`);
  },

  // Empresa: Registrar nuevo balón de gas
  crearProducto: async (
    datos: CrearProductoPayload
  ): Promise<ProductoDetalle> => {
    return peticionHttp<ProductoDetalle>("/productos", {
      method: "POST",
      datos,
    });
  },

  // Empresa: Actualizar precio, stock o datos
  actualizarProducto: async (
    publicId: string,
    datos: ActualizarProductoPayload
  ): Promise<ProductoDetalle> => {
    return peticionHttp<ProductoDetalle>(`/productos/${publicId}`, {
      method: "PUT",
      datos,
    });
  },

  // Empresa: Desactivar producto
  eliminarProducto: async (publicId: string): Promise<void> => {
    return peticionHttp<void>(`/productos/${publicId}`, {
      method: "DELETE",
    });
  },

  // Público / Clientes: Catálogo de balones por distribuidora
  listarProductosPublicos: async (
    empresaPublicId: string
  ): Promise<ProductoDetalle[]> => {
    return peticionHttp<ProductoDetalle[]>(
      `/publico/empresas/${empresaPublicId}/productos?_t=${Date.now()}`,
      { cache: "no-store" }
    );
  },

  // Subir imagen física o comprobante al servidor
  subirImagen: async (archivo: File): Promise<string> => {
    const formData = new FormData();
    formData.append("archivo", archivo);

    const res = await peticionHttp<{ nombreArchivo: string; url: string; tamano: string }>(
      "/archivos/subir",
      {
        method: "POST",
        datos: formData,
      }
    );

    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:8080";
    return res.url.startsWith("http") ? res.url : `${baseUrl}${res.url}`;
  },
};

