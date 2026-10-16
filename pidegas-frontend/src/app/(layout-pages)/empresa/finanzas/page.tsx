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
} from "lucide-react";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";

export default function FinanzasEmpresaPage() {
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [pagos, setPagos] = useState<PagoDetalle[]>([]);
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [liquidando, setLiquidando] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    setErrorPermisos(null);
    try {
      const [resData, pagosData, liqData] = await Promise.all([
        finanzasApi.obtenerResumen().catch((err: any) => {
          if (err?.status === 403 || err?.message?.includes("permisos")) {
            setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Distribuidora (EMPRESA).");
          }
          return null;
        }),
        finanzasApi.listarPagos().catch(() => []),
        finanzasApi.listarLiquidaciones().catch(() => []),
      ]);
      setResumen(resData);
      setPagos(pagosData);
      setLiquidaciones(liqData);
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
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">PIDEGAS PERÚ</h1>
            <p className="text-xs text-slate-600">Estado de Cuenta y Liquidaciones de Distribuidora</p>
          </div>
          <div className="text-right text-xs text-slate-600">
            <p>Fecha de emisión: {new Date().toLocaleString("es-PE")}</p>
            <p>Moneda: Soles (PEN - S/)</p>
          </div>
        </div>
      </div>

      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-emerald-600" />
            Finanzas y Liquidaciones de Distribuidora
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Control de ingresos por ventas de balones de gas, comisiones de marketplace y liquidaciones bancarias.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            onClick={cargarDatos}
            disabled={cargando}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
            Actualizar
          </button>
          <button
            onClick={handleExportarCsv}
            disabled={exportando || cargando}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
            title="Exportar reporte completo compatible con Microsoft Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            {exportando ? "Descargando..." : "Exportar Excel"}
          </button>
          <button
            onClick={handleImprimirPdf}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
            title="Imprimir o guardar en PDF"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Imprimir PDF
          </button>
          <button
            onClick={handleSolicitarLiquidacion}
            disabled={liquidando || (resumen?.totalPorLiquidar ?? 0) <= 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
          >
            <Wallet className="w-4 h-4" />
            {liquidando ? "Liquidando..." : "Liquidar Saldo"}
          </button>
        </div>
      </div>

      {mensaje && (
        <div className={`p-4 rounded-lg text-sm flex items-center gap-2 ${
          mensaje.includes("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
        }`}>
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <span>{mensaje}</span>
        </div>
      )}

      {/* Tarjetas de Métricas Financieras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Ventas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ventas Cobradas
            </span>
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              S/ {(resumen?.totalVentasAprobadas ?? 0).toFixed(2)}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {resumen?.pedidosPagados ?? 0} pedidos pagados
            </p>
          </div>
        </div>

        {/* Comisiones PideGas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Comisión PideGas (5%)
            </span>
            <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Percent className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              S/ {(resumen?.totalComisiones ?? 0).toFixed(2)}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              S/ {(resumen?.comisionesPendientes ?? 0).toFixed(2)} pendientes
            </p>
          </div>
        </div>

        {/* Saldo Neto por Liquidar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Saldo Disponible
            </span>
            <span className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Wallet className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-600">
              S/ {(resumen?.totalPorLiquidar ?? 0).toFixed(2)}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Neto a transferir a cuenta bancaria
            </p>
          </div>
        </div>

        {/* Facturación y SUNAT */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Comprobantes CPE
            </span>
            <span className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <Building className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              100% Electrónico
            </span>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sincronizado SUNAT
            </p>
          </div>
        </div>
      </div>

      {/* Historial de Pagos y Transacciones */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Transacciones de Pago Registradas
            </h2>
            <p className="text-xs text-slate-500">
              Pagos procesados vía Yape, Plin, Tarjeta o Contra Entrega
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {pagos.length} transacciones
          </span>
        </div>

        {pagos.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <CreditCard className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">No hay transacciones registradas aún.</p>
            <p className="text-xs text-slate-400">Los pagos de pedidos de gas aparecerán aquí.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Fecha</th>
                  <th className="px-6 py-3">Pedido</th>
                  <th className="px-6 py-3">Método</th>
                  <th className="px-6 py-3">Monto</th>
                  <th className="px-6 py-3">Referencia Pasarela</th>
                  <th className="px-6 py-3">Cód. Autorización</th>
                  <th className="px-6 py-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pagos.map((p) => (
                  <tr key={p.publicId} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-3 text-xs text-slate-500">
                      {new Date(p.createdAt).toLocaleString("es-PE")}
                    </td>
                    <td className="px-6 py-3 font-mono font-medium text-slate-800">
                      #PG-{p.pedidoPublicId ? p.pedidoPublicId.substring(0, 8) : "N/A"}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        p.metodoPago === "YAPE" ? "bg-purple-100 text-purple-800" :
                        p.metodoPago === "PLIN" ? "bg-cyan-100 text-cyan-800" :
                        p.metodoPago === "TARJETA" ? "bg-blue-100 text-blue-800" :
                        "bg-amber-100 text-amber-800"
                      }`}>
                        {p.metodoPago}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-900">
                      S/ {Number(p.monto).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-slate-600">
                      {p.referenciaTransaccion || "—"}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-slate-600">
                      {p.codigoAutorizacion || "—"}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        p.estado === "APROBADO" ? "bg-emerald-100 text-emerald-800" :
                        p.estado === "PENDIENTE" ? "bg-amber-100 text-amber-800" :
                        "bg-red-100 text-red-800"
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600" />
              Historial de Liquidaciones Bancarias
            </h2>
            <p className="text-xs text-slate-500">
              Transferencias emitidas a la cuenta de la distribuidora
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {liquidaciones.length} liquidaciones
          </span>
        </div>

        {liquidaciones.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <Building className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">No hay liquidaciones generadas todavía.</p>
            <p className="text-xs text-slate-400">
              Cuando tengas saldo por ventas acumuladas, presiona "Liquidar Saldo".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Fecha Emisión</th>
                  <th className="px-6 py-3">Período</th>
                  <th className="px-6 py-3">Total Ventas</th>
                  <th className="px-6 py-3">Comisión Retenida</th>
                  <th className="px-6 py-3">Monto Liquidado</th>
                  <th className="px-6 py-3">Referencia Bancaria</th>
                  <th className="px-6 py-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liquidaciones.map((l) => (
                  <tr key={l.publicId} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-3 text-xs text-slate-500">
                      {new Date(l.createdAt).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-600">
                      {new Date(l.periodoInicio).toLocaleDateString("es-PE")} al{" "}
                      {new Date(l.periodoFin).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-6 py-3 font-medium text-slate-800">
                      S/ {Number(l.totalVentas).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 text-red-600 font-medium">
                      - S/ {Number(l.totalComisiones).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 font-bold text-emerald-700 text-base">
                      S/ {Number(l.totalALiquidar).toFixed(2)}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-slate-600">
                      {l.referenciaBancaria}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
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
