import { peticionHttp } from "./cliente-http";

export interface UbigeoItem {
  id: number;
  codigoInei: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

export const ubigeoApi = {
  listarDepartamentos: async (): Promise<string[]> => {
    return peticionHttp<string[]>("/publico/ubigeo/departamentos");
  },

  listarProvincias: async (departamento: string): Promise<string[]> => {
    return peticionHttp<string[]>(
      `/publico/ubigeo/provincias?departamento=${encodeURIComponent(departamento)}`
    );
  },

  listarDistritos: async (
    departamento: string,
    provincia: string
  ): Promise<UbigeoItem[]> => {
    return peticionHttp<UbigeoItem[]>(
      `/publico/ubigeo/distritos?departamento=${encodeURIComponent(
        departamento
      )}&provincia=${encodeURIComponent(provincia)}`
    );
  },

  buscarPorCodigoInei: async (codigoInei: string): Promise<UbigeoItem> => {
    return peticionHttp<UbigeoItem>(`/publico/ubigeo/${codigoInei}`);
  },
};
