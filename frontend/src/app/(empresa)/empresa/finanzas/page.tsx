"use client";

import { useEffect, useState, useMemo } from "react";
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
  ShieldCheck,
  FileSpreadsheet,
  Printer,
  Receipt,
  Coins,
  ArrowRight,
  QrCode,
  Landmark,
  Copy,
  Clock,
  AlertTriangle,
  Upload,
  Calendar,
  Check,
  ChevronRight,
  ExternalLink,
  Zap,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  Info,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import { empresasApi, EmpresaDetalle } from "@/librerias/api/empresas.api";
import {
  obtenerEsquemaEmpresa,
  CUENTAS_BANCARIAS_RAPPIGAS,
  YAPE_PLIN_RAPPIGAS,
  listarPagosComisiones,
  registrarPagoComision,
  PagoComisionReportado,
  obtenerBilleteraEmpresa,
  guardarBilleteraEmpresa,
  recargarBilletera,
  descontarComisionBilletera,
  BilleteraEmpresa,
  SemaforoSaldos,
} from "@/librerias/comisiones";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function FinanzasEmpresaPage() {
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [pagos, setPagos] = useState<PagoDetalle[]>([]);
  const [liquidaciones, setLiquidaciones] = useState<Liquidacion[]>([]);
  const [miEmpresa, setMiEmpresa] = useState<EmpresaDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);

  // Esquema de comisión asignado
  const [esquemaComision, setEsquemaComision] = useState({
    tipo: "FIJA" as "FIJA" | "PORCENTUAL",
    tarifaFija: 1.20,
    tasaPorcentual: 3.0,
    estadoPago: "AL_DIA" as "AL_DIA" | "PENDIENTE" | "OBSERVADO",
  });

  // Billetera y Monedero Prepago
  const [billetera, setBilletera] = useState<BilleteraEmpresa>(obtenerBilleteraEmpresa());

  // Modal para Recargar / Pagar Comisiones a RappiGas
  const [modalPagarComision, setModalPagarComision] = useState(false);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<"YAPE" | "BANCO" | "PASARELA">("YAPE");
  const [bancoSeleccionado, setBancoSeleccionado] = useState<string>(CUENTAS_BANCARIAS_RAPPIGAS[0].banco);
  const [nroOperacion, setNroOperacion] = useState("");
  const [montoRecarga, setMontoRecarga] = useState("50.00");
  const [enviandoPago, setEnviandoPago] = useState(false);
  const [copiadoCampo, setCopiadoCampo] = useState<string | null>(null);

  // Historial de pagos reportados a RappiGas
  const [pagosReportados, setPagosReportados] = useState<PagoComisionReportado[]>([]);

  const copiarTexto = (texto: string, label: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoCampo(label);
    toast.success(`${label} copiado al portapapeles`);
    setTimeout(() => setCopiadoCampo(null), 2500);
  };

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
      setMiEmpresa(empData);

      // Cargar esquema configurado para esta distribuidora
      const esquema = obtenerEsquemaEmpresa(empData?.publicId);
      setEsquemaComision(esquema);

      // Cargar billetera
      const b = obtenerBilleteraEmpresa(empData?.publicId);
      setBilletera(b);

      // Cargar historial de pagos de comisiones reportados
      const reportes = listarPagosComisiones(empData?.publicId);
      setPagosReportados(reportes);
    } catch {
      // Ignorar errores no controlados
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Totales de Ventas Directas
  const totalVentasCobradas = resumen?.totalVentasAprobadas ?? 7680.0;
  const totalPedidos = resumen?.pedidosPagados ?? 160;

  const handleAbrirModalRecarga = (montoSugerido?: string) => {
    if (montoSugerido) {
      setMontoRecarga(montoSugerido);
    }
    setModalPagarComision(true);
  };

  const handleConfirmarRecarga = () => {
    const montoNum = parseFloat(montoRecarga);
    if (isNaN(montoNum) || montoNum <= 0) {
      toast.error("Por favor ingresa un monto válido a recargar");
      return;
    }
    if (metodoPagoSeleccionado !== "PASARELA" && (!nroOperacion || nroOperacion.trim().length < 4)) {
      toast.error("Por favor ingresa el número de operación bancaria o referencia de Yape");
      return;
    }

    setEnviandoPago(true);

    setTimeout(() => {
      const idEmp = miEmpresa?.publicId || "demo-empresa";
      const opGenerada = nroOperacion.trim() || `OP-${Math.floor(100000 + Math.random() * 900000)}`;

      if (metodoPagoSeleccionado === "PASARELA") {
        // Recarga online inmediata
        const bActualizada = recargarBilletera(idEmp, montoNum, `Recarga Online Inmediata (${opGenerada})`);
        setBilletera(bActualizada);
        toast.success(`¡Recarga exitosa! Se abonaron S/ ${montoNum.toFixed(2)} a tu saldo de comisiones.`);
      } else {
        // Reporte por transferencia o Yape (acredita saldo de inmediato en modo demo, o reporta para admin)
        const bActualizada = recargarBilletera(
          idEmp,
          montoNum,
          metodoPagoSeleccionado === "YAPE" ? `Yape (Op: ${opGenerada})` : `Transferencia ${bancoSeleccionado.split(" ")[0]} (Op: ${opGenerada})`
        );
        setBilletera(bActualizada);

        const nuevoPago: PagoComisionReportado = {
          id: `pago-${Date.now()}`,
          empresaPublicId: idEmp,
          nombreEmpresa: miEmpresa?.nombreComercial || "Mi Distribuidora",
          monto: montoNum,
          metodo:
            metodoPagoSeleccionado === "YAPE"
              ? "YAPE_PLIN"
              : bancoSeleccionado.includes("BCP")
              ? "TRANSFERENCIA_BCP"
              : bancoSeleccionado.includes("BBVA")
              ? "TRANSFERENCIA_BBVA"
              : "TRANSFERENCIA_INTERBANK",
          numeroOperacion: opGenerada,
          fechaReporte: new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
          periodoLiquidado: "Recarga de Saldo Billetera",
          estado: "APROBADO",
          observacionAdmin: "Recarga acreditada a saldo disponible",
        };

        registrarPagoComision(nuevoPago);
        setPagosReportados((prev) => [nuevoPago, ...prev]);
        toast.success(`¡Recarga registrada! Saldo acreditado: S/ ${montoNum.toFixed(2)}.`);
      }

      setEnviandoPago(false);
      setModalPagarComision(false);
      setNroOperacion("");
    }, 600);
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

  return (
    <div className="w-full py-4 px-3 sm:px-6 space-y-4 text-xs">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="EMPRESA"
          mensaje={errorPermisos}
          onExito={cargarDatos}
        />
      )}

      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border rounded-xl p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Finanzas y Billetera de Comisiones
              </h1>
              <Badge variant="outline" className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Cobro Directo 100%
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Tus clientes te pagan directamente a ti (en efectivo, Yape o POS propio). Las comisiones se descuentan automáticamente de tu saldo prepago por cada pedido entregado.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            onClick={cargarDatos}
            disabled={cargando}
            className="inline-flex items-center gap-1.5 px-3 h-8 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} />
            Actualizar
          </button>
          <button
            onClick={handleExportarCsv}
            disabled={exportando || cargando}
            className="inline-flex items-center gap-1.5 px-3 h-8 text-xs font-medium text-foreground bg-card border rounded-lg hover:bg-muted transition shadow-2xs"
            title="Exportar reporte de ventas y comisiones a Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            {exportando ? "Descargando..." : "Exportar Excel"}
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 h-8 text-xs font-medium text-foreground bg-card border rounded-lg hover:bg-muted transition shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-muted-foreground" />
            PDF
          </button>
          <button
            onClick={() => handleAbrirModalRecarga("50.00")}
            className="inline-flex items-center gap-1.5 px-3.5 h-8 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5" />
            Recargar Saldo
          </button>
        </div>
      </div>

      {mensaje && (
        <div className={`p-3 rounded-xl text-xs flex items-center justify-between shadow-2xs ${
          mensaje.includes("Error") ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
        }`}>
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{mensaje}</span>
          </div>
          <button onClick={() => setMensaje(null)} className="text-white hover:text-white/80 font-bold ml-4">✕</button>
        </div>
      )}

      {/* TARJETA DESTACADA: MONEDERO / BILLETERA DE COMISIONES CON SEMÁFORO */}
      <div className={`p-5 rounded-2xl border transition shadow-sm ${
        billetera.estadoSemaforo === "VERDE"
          ? "bg-gradient-to-br from-card via-card to-emerald-500/5 border-emerald-500/30"
          : billetera.estadoSemaforo === "AMARILLO"
          ? "bg-gradient-to-br from-card via-card to-amber-500/5 border-amber-500/40"
          : billetera.estadoSemaforo === "GRACIA"
          ? "bg-gradient-to-br from-card via-card to-orange-500/5 border-orange-500/40"
          : "bg-gradient-to-br from-card via-card to-red-500/5 border-red-500/40"
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Lado Izquierdo: Saldo e Indicador del Semáforo */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Billetera de Comisiones (Monedero Prepago)
              </span>
              <Badge variant="outline" className={`text-xs font-bold gap-1 px-2.5 py-0.5 rounded-full ${
                billetera.estadoSemaforo === "VERDE"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                  : billetera.estadoSemaforo === "AMARILLO"
                  ? "bg-amber-500/10 text-amber-600 border-amber-200"
                  : billetera.estadoSemaforo === "GRACIA"
                  ? "bg-orange-500/10 text-orange-600 border-orange-200"
                  : "bg-red-500/10 text-red-600 border-red-200"
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  billetera.estadoSemaforo === "VERDE"
                    ? "bg-emerald-500 animate-pulse"
                    : billetera.estadoSemaforo === "AMARILLO"
                    ? "bg-amber-500"
                    : billetera.estadoSemaforo === "GRACIA"
                    ? "bg-orange-500"
                    : "bg-red-500"
                }`} />
                {billetera.estadoSemaforo === "VERDE" && "🟢 Saldo Óptimo (Habilitado)"}
                {billetera.estadoSemaforo === "AMARILLO" && "🟡 Saldo Bajo (Recarga Recomendada)"}
                {billetera.estadoSemaforo === "GRACIA" && "🟠 En Período de Gracia (Tolerancia Activa)"}
                {billetera.estadoSemaforo === "PAUSADO" && "🔴 Recepción Pausada (Recarga Requerida)"}
              </Badge>
            </div>

            <div className="flex items-baseline gap-3">
              <span className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                billetera.saldoActual >= 15
                  ? "text-foreground"
                  : billetera.saldoActual > 0
                  ? "text-amber-600"
                  : billetera.saldoActual >= billetera.limiteGracia
                  ? "text-orange-600"
                  : "text-red-600"
              }`}>
                S/ {billetera.saldoActual.toFixed(2)}
              </span>
              <span className="text-xs text-muted-foreground">
                saldo disponible para cubrir comisiones
              </span>
            </div>

            <p className="text-xs text-muted-foreground max-w-xl">
              {billetera.estadoSemaforo === "VERDE" && (
                <>Tu cuenta tiene saldo suficiente para recibir aproximadamente <strong>{Math.floor(billetera.saldoActual / 1.20)} pedidos</strong> adicionales antes de necesitar recarga.</>
              )}
              {billetera.estadoSemaforo === "AMARILLO" && (
                <>Te quedan menos de S/ 15.00 en tu saldo. Te sugerimos recargar para evitar caer en período de gracia.</>
              )}
              {billetera.estadoSemaforo === "GRACIA" && (
                <>Has ingresado a tu límite de tolerancia negativa (hasta S/ {billetera.limiteGracia.toFixed(2)}). Puedes seguir despachando pedidos en curso, pero debes recargar hoy.</>
              )}
              {billetera.estadoSemaforo === "PAUSADO" && (
                <>Has agotado tu margen de gracia. La recepción de pedidos se reanudará automáticamente en cuanto registres una recarga.</>
              )}
            </p>
          </div>

          {/* Lado Derecho: Acceso Rápido de Recargas */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 flex flex-col gap-2.5 shrink-0 sm:min-w-[320px]">
            <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-orange-600" />
              Recarga Rápida de Saldo:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleAbrirModalRecarga("30.00")}
                className="py-1.5 px-2 rounded-lg border bg-card hover:bg-orange-50 hover:border-orange-500/40 text-foreground transition text-center font-bold text-xs shadow-2xs"
              >
                + S/ 30
                <span className="block text-[9px] font-normal text-muted-foreground">~25 pedidos</span>
              </button>
              <button
                type="button"
                onClick={() => handleAbrirModalRecarga("50.00")}
                className="py-1.5 px-2 rounded-lg border bg-card hover:bg-orange-50 hover:border-orange-500/40 text-foreground transition text-center font-bold text-xs shadow-2xs border-orange-500/30"
              >
                + S/ 50
                <span className="block text-[9px] font-normal text-muted-foreground">~42 pedidos</span>
              </button>
              <button
                type="button"
                onClick={() => handleAbrirModalRecarga("100.00")}
                className="py-1.5 px-2 rounded-lg border bg-card hover:bg-orange-50 hover:border-orange-500/40 text-foreground transition text-center font-bold text-xs shadow-2xs"
              >
                + S/ 100
                <span className="block text-[9px] font-normal text-muted-foreground">~83 pedidos</span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleAbrirModalRecarga()}
              className="w-full py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              Recargar Otro Monto con Yape o Banco
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Métricas Financieras Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Ventas Cobradas Directamente */}
        <div className="p-3.5 rounded-xl border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Ventas Cobradas en Mano / Cuentas
            </span>
            <p className="text-xl font-black leading-tight mt-1 text-foreground font-mono">
              S/ {totalVentasCobradas.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {totalPedidos} pedidos entregados
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* 2. Tarifa de Comisión Aplicada */}
        <div className="p-3.5 rounded-xl border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Esquema de Comisión
            </span>
            <p className="text-lg font-black leading-tight mt-1 text-foreground font-mono">
              {esquemaComision.tipo === "FIJA"
                ? `S/ ${esquemaComision.tarifaFija.toFixed(2)} Fijo`
                : `${esquemaComision.tasaPorcentual.toFixed(1)}%`}
            </p>
            <span className="text-[10px] text-muted-foreground">
              Descontado por balón/pedido
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Coins className="w-4 h-4" />
          </div>
        </div>

        {/* 3. Margen de Tolerancia / Gracia */}
        <div className="p-3.5 rounded-xl border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Límite de Gracia
            </span>
            <p className="text-lg font-black leading-tight mt-1 text-orange-600 font-mono">
              Hasta S/ {Math.abs(billetera.limiteGracia).toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">
              Tolerancia antes de pausar
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        {/* 4. Total Histórico Recargado */}
        <div className="p-3.5 rounded-xl border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-muted-foreground block">
              Total Recargado Acumulado
            </span>
            <p className="text-lg font-black leading-tight mt-1 text-emerald-600 font-mono">
              S/ {billetera.totalRecargadoHistorico.toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {billetera.movimientos.filter((m) => m.tipo === "RECARGA" || m.tipo === "BONO_BIENVENIDA").length} recargas registradas
            </span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Historial de Movimientos de la Billetera Prepago */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-orange-600" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Movimientos de la Billetera (Recargas y Descuentos por Pedido)
              </h2>
              <p className="text-[10px] text-muted-foreground">
                Auditoría en tiempo real de cada ingreso de saldo y deducción de comisión por reparto
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            {billetera.movimientos.length} movimientos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 text-muted-foreground text-[11px] font-bold uppercase tracking-wider border-b">
              <tr>
                <th className="px-4 py-2.5">Fecha y Hora</th>
                <th className="px-4 py-2.5">Concepto / Detalle</th>
                <th className="px-4 py-2.5">Tipo</th>
                <th className="px-4 py-2.5 text-right">Monto</th>
                <th className="px-4 py-2.5 text-right">Saldo Posterior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {billetera.movimientos.map((mov) => (
                <tr key={mov.id} className="hover:bg-muted/30 transition">
                  <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{mov.fecha}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    {mov.referencia}
                  </td>
                  <td className="px-4 py-2.5">
                    {mov.tipo === "BONO_BIENVENIDA" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-600 border border-purple-500/20">
                        <Sparkles className="w-3 h-3" /> Bono de Bienvenida
                      </span>
                    )}
                    {mov.tipo === "RECARGA" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <ArrowDownLeft className="w-3 h-3" /> Recarga de Saldo
                      </span>
                    )}
                    {mov.tipo === "DESCUENTO_PEDIDO" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-muted-foreground border">
                        <ArrowUpRight className="w-3 h-3" /> Comisión por Pedido
                      </span>
                    )}
                  </td>
                  <td className={`px-4 py-2.5 text-right font-mono font-bold ${
                    mov.monto > 0 ? "text-emerald-600" : "text-orange-600"
                  }`}>
                    {mov.monto > 0 ? `+ S/ ${mov.monto.toFixed(2)}` : `- S/ ${Math.abs(mov.monto).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-foreground">
                    S/ {mov.saldoPosterior.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historial de Ventas Directas por Pedido */}
      <div className="bg-card text-card-foreground rounded-xl border shadow-2xs overflow-hidden">
        <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Ventas Directas Cobradas al Cliente
              </h2>
              <p className="text-[10px] text-muted-foreground">
                Pagos en efectivo contraentrega o con tu propio Yape/POS
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            {totalPedidos} despachos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/50 text-muted-foreground text-[11px] font-bold uppercase tracking-wider border-b">
              <tr>
                <th className="px-4 py-2.5">Fecha</th>
                <th className="px-4 py-2.5">Código Pedido</th>
                <th className="px-4 py-2.5">Método de Cobro en Mano</th>
                <th className="px-4 py-2.5">Total Venta Cobrado</th>
                <th className="px-4 py-2.5">Comisión Descontada</th>
                <th className="px-4 py-2.5 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { id: "1", fecha: "Hoy, 15:30", codigo: "#PG-892110", metodo: "Efectivo Contraentrega", venta: 48.00 },
                { id: "2", fecha: "Hoy, 14:15", codigo: "#PG-892109", metodo: "Yape Directo Distribuidor", venta: 48.50 },
                { id: "3", fecha: "Hoy, 12:40", codigo: "#PG-892108", metodo: "POS Directo Distribuidor", venta: 96.00 },
                { id: "4", fecha: "Ayer, 18:20", codigo: "#PG-892107", metodo: "Efectivo Contraentrega", venta: 48.00 },
                { id: "5", fecha: "Ayer, 16:05", codigo: "#PG-892106", metodo: "Plin Directo Distribuidor", venta: 48.00 },
              ].map((item) => {
                const comisionMonto =
                  esquemaComision.tipo === "FIJA"
                    ? esquemaComision.tarifaFija
                    : (item.venta * esquemaComision.tasaPorcentual) / 100;

                return (
                  <tr key={item.id} className="hover:bg-muted/30 transition">
                    <td className="px-4 py-2.5 text-muted-foreground">{item.fecha}</td>
                    <td className="px-4 py-2.5 font-mono font-medium text-foreground">{item.codigo}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-foreground">
                        {item.metodo}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono font-bold text-foreground">
                      S/ {item.venta.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 font-mono font-bold text-orange-600">
                      - S/ {comisionMonto.toFixed(2)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Entregado
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Recargar Saldo de Billetera */}
      <Dialog open={modalPagarComision} onOpenChange={setModalPagarComision}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Zap className="w-5 h-5 text-orange-600" />
              Recargar Saldo de Billetera RappiGas
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Elige tu canal preferido para recargar saldo. Cada pedido completado descontará su comisión de este saldo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Monto actual y sugerido */}
            <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 block">
                  Saldo Actual en Billetera:
                </span>
                <span className="text-xs text-muted-foreground">
                  Límite de gracia permitido: S/ {billetera.limiteGracia.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-orange-600 font-mono">
                  S/ {billetera.saldoActual.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Selector de Método de Recarga */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMetodoPagoSeleccionado("YAPE")}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col items-center justify-center gap-1 text-center ${
                  metodoPagoSeleccionado === "YAPE"
                    ? "border-purple-500 bg-purple-50/60 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 font-bold shadow-2xs"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <QrCode className="w-4 h-4 text-purple-600" />
                <span className="text-xs">Yape / Plin</span>
                <span className="text-[10px] text-muted-foreground">Recomendado</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPagoSeleccionado("BANCO")}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col items-center justify-center gap-1 text-center ${
                  metodoPagoSeleccionado === "BANCO"
                    ? "border-orange-500 bg-orange-50/60 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 font-bold shadow-2xs"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <Landmark className="w-4 h-4" />
                <span className="text-xs">Transferencia</span>
                <span className="text-[10px] text-muted-foreground">BCP / BBVA / Interbank</span>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPagoSeleccionado("PASARELA")}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col items-center justify-center gap-1 text-center ${
                  metodoPagoSeleccionado === "PASARELA"
                    ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-bold shadow-2xs"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span className="text-xs">Recarga Online</span>
                <span className="text-[10px] text-muted-foreground">Tarjeta / CIP Inmediato</span>
              </button>
            </div>

            {/* Yape / Plin */}
            {metodoPagoSeleccionado === "YAPE" && (
              <div className="p-4 rounded-xl border bg-purple-500/5 space-y-3 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Yape / Plin a RappiGas Perú SAC</p>
                  <p className="text-[11px] text-muted-foreground">Envía el monto a recargar al número corporativo oficial:</p>
                </div>
                <div className="inline-flex items-center gap-2 p-2 px-3 rounded-lg bg-card border font-mono font-bold text-base text-purple-700 dark:text-purple-400">
                  <span>{YAPE_PLIN_RAPPIGAS.numero}</span>
                  <button
                    type="button"
                    onClick={() => copiarTexto(YAPE_PLIN_RAPPIGAS.numero.replace(/\s/g, ""), "Celular Yape")}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition"
                  >
                    {copiadoCampo === "Celular Yape" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Titular: <strong className="text-foreground">{YAPE_PLIN_RAPPIGAS.titular}</strong>
                </p>
              </div>
            )}

            {/* Bancos */}
            {metodoPagoSeleccionado === "BANCO" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  {CUENTAS_BANCARIAS_RAPPIGAS.map((c) => (
                    <button
                      key={c.banco}
                      type="button"
                      onClick={() => setBancoSeleccionado(c.banco)}
                      className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-semibold transition ${
                        bancoSeleccionado === c.banco
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {c.banco.split(" ")[0]}
                    </button>
                  ))}
                </div>

                {(() => {
                  const cuenta = CUENTAS_BANCARIAS_RAPPIGAS.find((c) => c.banco === bancoSeleccionado) || CUENTAS_BANCARIAS_RAPPIGAS[0];
                  return (
                    <div className="p-3.5 rounded-xl border bg-muted/20 space-y-2.5">
                      <div>
                        <p className="text-xs font-bold text-foreground">{cuenta.banco}</p>
                        <p className="text-[11px] text-muted-foreground">{cuenta.tipoCuenta} ({cuenta.moneda})</p>
                        <p className="text-[11px] text-foreground font-medium mt-0.5">
                          Titular: <span className="font-bold">{cuenta.titular}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t">
                        <div className="p-2 rounded-lg bg-card border flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-muted-foreground block">N° de Cuenta:</span>
                            <span className="font-mono font-bold text-xs text-foreground">{cuenta.numeroCuenta}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copiarTexto(cuenta.numeroCuenta, "N° de Cuenta")}
                            className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition"
                          >
                            {copiadoCampo === "N° de Cuenta" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div className="p-2 rounded-lg bg-card border flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-muted-foreground block">Código Interbancario (CCI):</span>
                            <span className="font-mono font-bold text-xs text-foreground">{cuenta.cci}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => copiarTexto(cuenta.cci, "CCI")}
                            className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition"
                          >
                            {copiadoCampo === "CCI" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Pasarela */}
            {metodoPagoSeleccionado === "PASARELA" && (
              <div className="p-4 rounded-xl border bg-emerald-500/5 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Acreditación Instantánea 24/7 sin revisión</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  El saldo se abona en 3 segundos a tu billetera para seguir recibiendo pedidos sin pausas.
                </p>
              </div>
            )}

            {/* Formulario */}
            <div className="space-y-3 pt-2 border-t">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-foreground block mb-1">
                    Monto a Recargar (Soles):
                  </label>
                  <Input
                    type="number"
                    step="5"
                    value={montoRecarga}
                    onChange={(e) => setMontoRecarga(e.target.value)}
                    className="h-8 text-xs font-mono font-bold"
                    placeholder="50.00"
                  />
                </div>

                {metodoPagoSeleccionado !== "PASARELA" && (
                  <div>
                    <label className="text-[11px] font-semibold text-foreground block mb-1">
                      N° de Operación Bancaria / Voucher:
                    </label>
                    <Input
                      type="text"
                      value={nroOperacion}
                      onChange={(e) => setNroOperacion(e.target.value)}
                      className="h-8 text-xs font-mono"
                      placeholder="Ej: 0849201"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
            <button
              type="button"
              onClick={() => setModalPagarComision(false)}
              className="px-3 h-8 text-xs font-medium text-muted-foreground hover:text-foreground rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={enviandoPago}
              onClick={handleConfirmarRecarga}
              className="inline-flex items-center gap-1.5 px-4 h-8 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition shadow-2xs"
            >
              {enviandoPago ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Acreditando Saldo...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Confirmar Recarga de Saldo
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
