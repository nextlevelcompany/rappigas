export interface EsquemaComisionEmpresa {
  tipo: "FIJA" | "PORCENTUAL";
  tarifaFija: number;
  tasaPorcentual: number;
  estadoPago: "AL_DIA" | "PENDIENTE" | "OBSERVADO";
}

export interface CuentaBancariaRappiGas {
  banco: string;
  tipoCuenta: string;
  moneda: string;
  numeroCuenta: string;
  cci: string;
  titular: string;
  icono: string;
}

export const CUENTAS_BANCARIAS_RAPPIGAS: CuentaBancariaRappiGas[] = [
  {
    banco: "BCP (Banco de Crédito del Perú)",
    tipoCuenta: "Cuenta Corriente Soles",
    moneda: "PEN (S/)",
    numeroCuenta: "194-98451230-0-45",
    cci: "002-194009845123004590",
    titular: "RAPPIGAS TECNOLOGÍA DEL PERÚ S.A.C.",
    icono: "bcp",
  },
  {
    banco: "BBVA Perú",
    tipoCuenta: "Cuenta Corriente Soles",
    moneda: "PEN (S/)",
    numeroCuenta: "0011-0352-0100045892",
    cci: "011-352-000100045892-74",
    titular: "RAPPIGAS TECNOLOGÍA DEL PERÚ S.A.C.",
    icono: "bbva",
  },
  {
    banco: "Interbank",
    tipoCuenta: "Cuenta Corriente Soles",
    moneda: "PEN (S/)",
    numeroCuenta: "200-3001859423",
    cci: "003-200-003001859423-38",
    titular: "RAPPIGAS TECNOLOGÍA DEL PERÚ S.A.C.",
    icono: "interbank",
  },
];

export const YAPE_PLIN_RAPPIGAS = {
  numero: "987 654 321",
  titular: "RAPPIGAS PERU SAC",
  qrUrl: "/images/qr-yape-rappigas.png",
};

export interface PagoComisionReportado {
  id: string;
  empresaPublicId: string;
  nombreEmpresa: string;
  monto: number;
  metodo: "TRANSFERENCIA_BCP" | "TRANSFERENCIA_BBVA" | "TRANSFERENCIA_INTERBANK" | "YAPE_PLIN" | "PAGO_ONLINE_PASARELA";
  numeroOperacion: string;
  fechaReporte: string;
  periodoLiquidado: string;
  comprobanteUrl?: string;
  estado: "PENDIENTE_REVISION" | "APROBADO" | "RECHAZADO";
  observacionAdmin?: string;
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

export function listarPagosComisiones(empresaPublicId?: string): PagoComisionReportado[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("rappigas_pagos_comisiones");
    if (!raw) return [];
    const list: PagoComisionReportado[] = JSON.parse(raw);
    if (empresaPublicId) {
      return list.filter((p) => p.empresaPublicId === empresaPublicId);
    }
    return list;
  } catch {
    return [];
  }
}

export function registrarPagoComision(pago: PagoComisionReportado): void {
  if (typeof window === "undefined") return;
  try {
    const actuales = listarPagosComisiones();
    const actualizados = [pago, ...actuales];
    localStorage.setItem("rappigas_pagos_comisiones", JSON.stringify(actualizados));
  } catch {}
}

export type SemaforoSaldos = "VERDE" | "AMARILLO" | "GRACIA" | "PAUSADO";

export interface MovimientoBilletera {
  id: string;
  fecha: string;
  tipo: "RECARGA" | "DESCUENTO_PEDIDO" | "BONO_BIENVENIDA" | "AJUSTE_ADMIN";
  monto: number;
  saldoPosterior: number;
  referencia: string;
}

export interface BilleteraEmpresa {
  empresaPublicId: string;
  saldoActual: number;
  limiteGracia: number;
  bonoBienvenidaAplicado: boolean;
  estadoSemaforo: SemaforoSaldos;
  pedidosDescontados: number;
  totalRecargadoHistorico: number;
  movimientos: MovimientoBilletera[];
}

export function calcularSemaforo(saldo: number, limiteGracia = -20): SemaforoSaldos {
  if (saldo >= 15) return "VERDE";
  if (saldo > 0) return "AMARILLO";
  if (saldo >= limiteGracia) return "GRACIA";
  return "PAUSADO";
}

export const BONO_BIENVENIDA_MONTO = 30.0;

export function obtenerBilleteraEmpresa(publicId?: string): BilleteraEmpresa {
  const fallback: BilleteraEmpresa = {
    empresaPublicId: publicId || "demo-empresa",
    saldoActual: 38.80,
    limiteGracia: -20.0,
    bonoBienvenidaAplicado: true,
    estadoSemaforo: "VERDE",
    pedidosDescontados: 16,
    totalRecargadoHistorico: 50.0,
    movimientos: [
      {
        id: "mov-bono-inicial",
        fecha: "10 Oct 2026, 09:00",
        tipo: "BONO_BIENVENIDA",
        monto: 30.0,
        saldoPosterior: 30.0,
        referencia: "Bono de Bienvenida RappiGas (25 pedidos gratis)",
      },
      {
        id: "mov-recarga-1",
        fecha: "14 Oct 2026, 11:20",
        tipo: "RECARGA",
        monto: 20.0,
        saldoPosterior: 50.0,
        referencia: "Recarga por Yape (Op: 849201)",
      },
      {
        id: "mov-desc-reciente",
        fecha: "Hoy, 15:30",
        tipo: "DESCUENTO_PEDIDO",
        monto: -1.20,
        saldoPosterior: 38.80,
        referencia: "Comisión Pedido #PG-892110",
      },
    ],
  };

  if (typeof window === "undefined" || !publicId) return fallback;
  try {
    const raw = localStorage.getItem(`empresa_billetera_${publicId}`);
    if (raw) {
      const parsed: BilleteraEmpresa = JSON.parse(raw);
      parsed.estadoSemaforo = calcularSemaforo(parsed.saldoActual, parsed.limiteGracia);
      return parsed;
    }
  } catch {}
  return fallback;
}

export function guardarBilleteraEmpresa(publicId: string, billetera: BilleteraEmpresa): void {
  if (typeof window === "undefined" || !publicId) return;
  try {
    billetera.estadoSemaforo = calcularSemaforo(billetera.saldoActual, billetera.limiteGracia);
    localStorage.setItem(`empresa_billetera_${publicId}`, JSON.stringify(billetera));
  } catch {}
}

export function descontarComisionBilletera(
  publicId: string,
  montoComision: number,
  codigoPedido: string
): BilleteraEmpresa {
  const billetera = obtenerBilleteraEmpresa(publicId);
  const nuevoSaldo = Number((billetera.saldoActual - montoComision).toFixed(2));
  const nuevoMov: MovimientoBilletera = {
    id: `mov-${Date.now()}`,
    fecha: new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" }),
    tipo: "DESCUENTO_PEDIDO",
    monto: -montoComision,
    saldoPosterior: nuevoSaldo,
    referencia: `Comisión Pedido ${codigoPedido}`,
  };

  billetera.saldoActual = nuevoSaldo;
  billetera.pedidosDescontados += 1;
  billetera.estadoSemaforo = calcularSemaforo(nuevoSaldo, billetera.limiteGracia);
  billetera.movimientos = [nuevoMov, ...billetera.movimientos.slice(0, 49)];

  guardarBilleteraEmpresa(publicId, billetera);
  return billetera;
}

export function recargarBilletera(
  publicId: string,
  montoRecarga: number,
  referenciaPago: string,
  tipo: "RECARGA" | "BONO_BIENVENIDA" | "AJUSTE_ADMIN" = "RECARGA"
): BilleteraEmpresa {
  const billetera = obtenerBilleteraEmpresa(publicId);
  const nuevoSaldo = Number((billetera.saldoActual + montoRecarga).toFixed(2));
  const nuevoMov: MovimientoBilletera = {
    id: `mov-${Date.now()}`,
    fecha: new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
    tipo,
    monto: montoRecarga,
    saldoPosterior: nuevoSaldo,
    referencia: referenciaPago,
  };

  billetera.saldoActual = nuevoSaldo;
  billetera.totalRecargadoHistorico += montoRecarga;
  billetera.estadoSemaforo = calcularSemaforo(nuevoSaldo, billetera.limiteGracia);
  billetera.movimientos = [nuevoMov, ...billetera.movimientos.slice(0, 49)];

  guardarBilleteraEmpresa(publicId, billetera);
  return billetera;
}
