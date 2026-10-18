export interface EsquemaComisionEmpresa {
  tipo: "FIJA" | "PORCENTUAL";
  tarifaFija: number;
  tasaPorcentual: number;
  estadoPago: "AL_DIA" | "PENDIENTE" | "OBSERVADO";
}

export const ESQUEMA_DEFAULT: EsquemaComisionEmpresa = {
  tipo: "FIJA",
  tarifaFija: 1.20,
  tasaPorcentual: 3.0,
  estadoPago: "AL_DIA",
};

export function obtenerEsquemaEmpresa(publicId?: string): EsquemaComisionEmpresa {
  if (typeof window === "undefined" || !publicId) return ESQUEMA_DEFAULT;
  try {
    const raw = localStorage.getItem(`empresa_comision_${publicId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        tipo: parsed.tipo === "PORCENTUAL" ? "PORCENTUAL" : "FIJA",
        tarifaFija: typeof parsed.tarifaFija === "number" ? parsed.tarifaFija : 1.20,
        tasaPorcentual: typeof parsed.tasaPorcentual === "number" ? parsed.tasaPorcentual : 3.0,
        estadoPago: parsed.estadoPago || "AL_DIA",
      };
    }
    const rawGlobal = localStorage.getItem("empresa_comision_activa");
    if (rawGlobal) {
      const parsedGlobal = JSON.parse(rawGlobal);
      return {
        tipo: parsedGlobal.tipo === "PORCENTUAL" ? "PORCENTUAL" : "FIJA",
        tarifaFija: typeof parsedGlobal.tarifaFija === "number" ? parsedGlobal.tarifaFija : 1.20,
        tasaPorcentual: typeof parsedGlobal.tasaPorcentual === "number" ? parsedGlobal.tasaPorcentual : 3.0,
        estadoPago: parsedGlobal.estadoPago || "AL_DIA",
      };
    }
  } catch {}
  return ESQUEMA_DEFAULT;
}

export function guardarEsquemaEmpresa(publicId: string, esquema: EsquemaComisionEmpresa): void {
  if (typeof window === "undefined" || !publicId) return;
  try {
    localStorage.setItem(`empresa_comision_${publicId}`, JSON.stringify(esquema));
  } catch {}
}

export function formatearComisionTexto(esquema: EsquemaComisionEmpresa): string {
  if (esquema.tipo === "FIJA") {
    return `S/ ${esquema.tarifaFija.toFixed(2)} Fijo`;
  }
  return `${esquema.tasaPorcentual.toFixed(1)}%`;
}
