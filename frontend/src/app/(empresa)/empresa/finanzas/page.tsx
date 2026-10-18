"use client";

import { useEffect, useState } from "react";
import {
  finanzasApi,
  ResumenFinanciero,
  PagoDetalle,
  Liquidacion,
} from "@/librerias/api/finanzas.api";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Wallet,
  CreditCard,
  CheckCircle2,
  RefreshCw,
  Building,
  ArrowDownRight,
  ShieldCheck,
  FileSpreadsheet,
  Printer,
  Receipt,
  Coins,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import { empresasApi } from "@/librerias/api/empresas.api";

export default function FinanzasEmpresaPage() {
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [pagos, setPagos] = useState<PagoDetalle[]>([]);
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [liquidando, setLiquidando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);
  const [esquemaComision, setEsquemaComision] = useState<{
    tipo: "FIJA" | "PORCENTUAL";
    tarifaFija: number;
    tasaPorcentual: number;
    estadoPago: string;
  }>({
    tipo: "FIJA",
    tarifaFija: 1.20,
    tasaPorcentual: 3.0,
    estadoPago: "AL_DIA",
  });

  const cargarDatos = async () => {
    setCargando(true);
    setErrorPermisos(null);
    try {
      const [resData, pagosData, liqData, empData] = await Promise.all([
        finanzasApi.obtenerResumen().catch((err: any) => {
          if (err?.status === 403 || err?.message?.includes("permisos")) {
            setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Distribuidora (EMPRESA).");
          }
          return null;
        }),
        finanzasApi.listarPagos().catch(() => []),
        finanzasApi.listarLiquidaciones().catch(() => []),
        empresasApi.obtenerMiEmpresa().catch(() => null),
      ]);
      setResumen(resData);
      setPagos(pagosData);
      setLiquidaciones(liqData);

      // Cargar esquema configurado para esta distribuidora
      if (typeof window !== "undefined") {
        let configEncontrada = null;
        if (empData?.publicId) {
          const raw = localStorage.getItem(`empresa_comision_${empData.publicId}`);
          if (raw) {
            try { configEncontrada = JSON.parse(raw); } catch {}
          }
        }
        if (!configEncontrada) {
          const rawGlobal = localStorage.getItem("empresa_comision_activa");
          if (rawGlobal) {
            try { configEncontrada = JSON.parse(rawGlobal); } catch {}
          }
        }

        if (configEncontrada) {
          setEsquemaComision({
            tipo: configEncontrada.tipo || "FIJA",
            tarifaFija: configEncontrada.tarifaFija || 1.20,
            tasaPorcentual: configEncontrada.tasaPorcentual || 3.0,
            estadoPago: configEncontrada.estadoPago || "AL_DIA",
          });
        }
      }
    } catch {
      // Ignorar errores no controlados
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSolicitarLiquidacion = async () => {
    if (!confirm("¿Deseas generar la liquidación del saldo acumulado disponible?")) return;
    setLiquidando(true);
    setMensaje(null);
    try {
      await finanzasApi.generarLiquidacion();
      setMensaje("¡Liquidación generada y programada para abono exitosamente!");
      cargarDatos();
    } catch (err: any) {
      setMensaje("Error al procesar la liquidación: " + (err.message || "Error del servidor"));
    } finally {
      setLiquidando(false);
    }
  };

  const handleExportarCsv = async () => {
    try {
      setExportando(true);
      await finanzasApi.descargarReporteCsv();
      setMensaje("Reporte en formato CSV/Excel descargado correctamente.");
    } catch (err: unknown) {
      const e = err as Error;
      setMensaje("Error al exportar a Excel/CSV: " + e.message);
    } finally {
      setExportando(false);
    }
  };

  const handleImprimirPdf = () => {
    window.print();
  };

  return (
    <div className="w-full py-3 px-3 sm:px-6 space-y-3 text-xs">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="EMPRESA"
          mensaje={errorPermisos}
          onExito={cargarDatos}
        />
      )}

      {/* Membrete oficial visible solo al imprimir a PDF */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">PIDEGAS PERÚ</h1>
            <p className="text-xs text-slate-600">Estado de Cuenta y Liquidaciones de Distribuidora</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p>Fecha de emisión: {new Date().toLocaleString("es-PE")}</p>
            <p>Moneda: Soles (PEN - S/)</p>
          </div>
        </div>
      </div>

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border rounded-lg p-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Finanzas y Liquidaciones de Distribuidora
              </h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Liquidaciones
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Control de ingresos por ventas de balones de gas, comisiones y abonos bancarios.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 print:hidden">
          <button
            onClick={cargarDatos}
            disabled={cargando}
            className="inline-flex items-center gap-1 px-2.5 h-7 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition"
          >
            <RefreshCw className={`w-3 h-3 ${cargando ? "animate-spin" : ""}`} />
            Actualizar
          </button>
          <button
            onClick={handleExportarCsv}
            disabled={exportando || cargando}
            className="inline-flex items-center gap-1 px-2.5 h-7 text-xs font-medium text-foreground bg-card border rounded-md hover:bg-muted transition shadow-2xs"
            title="Exportar reporte completo compatible con Microsoft Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            {exportando ? "Descargando..." : "Exportar Excel"}
          </button>
          <button
            onClick={handleImprimirPdf}
            className="inline-flex items-center gap-1 px-2.5 h-7 text-xs font-medium text-foreground bg-card border rounded-md hover:bg-muted transition shadow-2xs"
            title="Imprimir o guardar en PDF"
          >
            <Printer className="w-3.5 h-3.5 text-muted-foreground" />
            PDF
          </button>
          <button
            onClick={handleSolicitarLiquidacion}
            disabled={liquidando || (resumen?.totalPorLiquidar ?? 0) <= 0}
            className="inline-flex items-center gap-1 px-2.5 h-7 text-xs font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50 transition shadow-2xs"
          >
            <Wallet className="w-3.5 h-3.5" />
            {liquidando ? "Liquidando..." : "Liquidar Saldo"}
          </button>
        </div>
      </div>

      {mensaje && (
        <div className={`p-2.5 px-3 rounded-lg text-xs flex items-center justify-between shadow-2xs ${
          mensaje.includes("Error") ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
        }`}>
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{mensaje}</span>
          </div>
          <button onClick={() => setMensaje(null)} className="text-white hover:text-white/80 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Tarjetas de Métricas Financieras */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Total Ventas */}
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block">Ventas Cobradas</span>
            <p className="text-lg font-bold leading-tight mt-0.5 text-foreground font-mono">
              S/ {(resumen?.totalVentasAprobadas ?? 0).toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">{resumen?.pedidosPagados ?? 0} pedidos pagados</span>
          </div>
          <div className="w-7 h-7 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Comisiones RappiGas */}
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground block">Comisión Plataforma</span>
              <Badge variant="outline" className={`text-[9px] px-1 py-0 font-bold ${
                esquemaComision.tipo === "FIJA"
                  ? "bg-blue-500/10 text-blue-600 border-blue-200"
                  : "bg-purple-500/10 text-purple-600 border-purple-200"
              }`}>
                {esquemaComision.tipo === "FIJA"
                  ? `S/ ${esquemaComision.tarifaFija.toFixed(2)} fijo`
                  : `${esquemaComision.tasaPorcentual.toFixed(1)}%`}
              </Badge>
            </div>
            <p className="text-lg font-bold leading-tight mt-0.5 text-foreground font-mono">
              S/ {(resumen?.totalComisiones ?? 0).toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">S/ {(resumen?.comisionesPendientes ?? 0).toFixed(2)} pendientes</span>
          </div>
          <div className="w-7 h-7 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Coins className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Saldo Neto por Liquidar */}
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block">Saldo Disponible</span>
            <p className="text-lg font-bold leading-tight mt-0.5 text-emerald-600 font-mono">
              S/ {(resumen?.totalPorLiquidar ?? 0).toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Neto transferible</span>
          </div>
          <div className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Wallet className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block">Ticket Promedio</span>
            <p className="text-lg font-bold leading-tight mt-0.5 text-foreground font-mono">
              S/ {((resumen?.pedidosPagados ?? 0) > 0 ? (resumen!.totalVentasAprobadas / resumen!.pedidosPagados) : 0).toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Promedio por pedido</span>
          </div>
          <div className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Receipt className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Banner Informativo de Esquema de Comisión Activo */}
      <div className="p-3 rounded-xl bg-card border border-border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-foreground">Esquema de Comisión Activo:</span>
              <Badge variant="outline" className={`text-xs font-bold ${
                esquemaComision.tipo === "FIJA"
                  ? "bg-blue-500/10 text-blue-600 border-blue-200"
                  : "bg-purple-500/10 text-purple-600 border-purple-200"
              }`}>
                {esquemaComision.tipo === "FIJA"
                  ? `Modalidad Fija: S/ ${esquemaComision.tarifaFija.toFixed(2)} por Balón / Pedido Entregado`
                  : `Modalidad Porcentual: ${esquemaComision.tasaPorcentual.toFixed(1)}% sobre Venta Real`}
              </Badge>
              <span className="text-[10px] text-muted-foreground hidden md:inline">• Liquidaciones automáticas quincenales</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              RappiGas únicamente deduce comisión por pedidos completados con éxito. No pagas membresías fijas mensuales ni cuotas de mantenimiento.
            </p>
          </div>
        </div>

        <Link
          href="/empresa/mi-empresa"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-semibold shrink-0"
        >
          <span>Ver Plan y Condiciones</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Historial de Pagos y Transacciones */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-2xs overflow-hidden">
        <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-orange-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Transacciones de Pago Registradas
            </h2>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            {pagos.length} transacciones
          </span>
        </div>

        {pagos.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <CreditCard className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-xs font-semibold text-foreground">No hay transacciones registradas aún.</p>
            <p className="text-[11px] text-muted-foreground">Los pagos de pedidos de gas aparecerán aquí.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/50 text-muted-foreground text-[11px] font-bold uppercase tracking-wider border-b">
                <tr>
                  <th className="px-3.5 py-2.5">Fecha</th>
                  <th className="px-3.5 py-2.5">Pedido</th>
                  <th className="px-3.5 py-2.5">Método</th>
                  <th className="px-3.5 py-2.5">Monto</th>
                  <th className="px-3.5 py-2.5">Referencia Pasarela</th>
                  <th className="px-3.5 py-2.5">Cód. Autorización</th>
                  <th className="px-3.5 py-2.5 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pagos.map((p) => (
                  <tr key={p.publicId} className="hover:bg-muted/30 transition">
                    <td className="px-3.5 py-2.5 text-muted-foreground">
                      {new Date(p.createdAt).toLocaleString("es-PE")}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono font-medium text-foreground">
                      #PG-{p.pedidoPublicId ? p.pedidoPublicId.substring(0, 8) : "N/A"}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.metodoPago === "YAPE" ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300" :
                        p.metodoPago === "PLIN" ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300" :
                        p.metodoPago === "TARJETA" ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" :
                        "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}>
                        {p.metodoPago}
                      </span>
                    </td>
                    <td className="px-3.5 py-2.5 font-mono font-bold text-foreground">
                      S/ {Number(p.monto).toFixed(2)}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-muted-foreground">
                      {p.referenciaTransaccion || "—"}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-muted-foreground">
                      {p.codigoAutorizacion || "—"}
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.estado === "APROBADO" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                        p.estado === "PENDIENTE" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                        "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                      }`}>
                        {p.estado === "APROBADO" && <CheckCircle2 className="w-3 h-3" />}
                        {p.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historial de Liquidaciones */}
      <div className="bg-card text-card-foreground rounded-lg border shadow-2xs overflow-hidden">
        <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Historial de Liquidaciones Bancarias
            </h2>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            {liquidaciones.length} liquidaciones
          </span>
        </div>

        {liquidaciones.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Building className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-xs font-semibold text-foreground">No hay liquidaciones generadas todavía.</p>
            <p className="text-[11px] text-muted-foreground">
              Cuando tengas saldo por ventas acumuladas, presiona "Liquidar Saldo".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/50 text-muted-foreground text-[11px] font-bold uppercase tracking-wider border-b">
                <tr>
                  <th className="px-3.5 py-2.5">Fecha Emisión</th>
                  <th className="px-3.5 py-2.5">Período</th>
                  <th className="px-3.5 py-2.5">Total Ventas</th>
                  <th className="px-3.5 py-2.5">Comisión Retenida</th>
                  <th className="px-3.5 py-2.5">Monto Liquidado</th>
                  <th className="px-3.5 py-2.5">Referencia Bancaria</th>
                  <th className="px-3.5 py-2.5 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {liquidaciones.map((l) => (
                  <tr key={l.publicId} className="hover:bg-muted/30 transition">
                    <td className="px-3.5 py-2.5 text-muted-foreground">
                      {new Date(l.createdAt).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-3.5 py-2.5 text-muted-foreground">
                      {new Date(l.periodoInicio).toLocaleDateString("es-PE")} al{" "}
                      {new Date(l.periodoFin).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono font-medium text-foreground">
                      S/ {Number(l.totalVentas).toFixed(2)}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-rose-600 font-medium">
                      - S/ {Number(l.totalComisiones).toFixed(2)}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono font-bold text-emerald-600 text-sm">
                      S/ {Number(l.totalALiquidar).toFixed(2)}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-[11px] text-muted-foreground">
                      {l.referenciaBancaria}
                    </td>
                    <td className="px-3.5 py-2.5 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {l.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
