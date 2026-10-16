"use client";

import { useEffect, useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Wallet,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  Search,
  Calendar,
  Filter,
  User,
  Truck,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  X,
  ExternalLink,
} from "lucide-react";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import { pedidosApi, PedidoDetalle } from "@/librerias/api/pedidos.api";
import { finanzasApi, ResumenFinanciero, PagoDetalle } from "@/librerias/api/finanzas.api";

export default function RegistroVentasPage() {
  const [pedidosEntregados, setPedidosEntregados] = useState<PedidoDetalle[]>([]);
  const [resumenFinanciero, setResumenFinanciero] = useState<ResumenFinanciero | null>(null);
  const [pagosTransacciones, setPagosTransacciones] = useState<PagoDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState<string>("TODOS");
  const [filtroPeriodo, setFiltroPeriodo] = useState<"todos" | "hoy" | "7dias" | "30dias">("todos");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoDetalle | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    setErrorPermisos(null);
    try {
      const [pedidosResp, resumenResp, pagosResp] = await Promise.all([
        pedidosApi.listarPedidosEmpresa("ENTREGADO", 0, 150).catch((err: any) => {
          if (err?.status === 403 || err?.message?.includes("permisos")) {
            setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Distribuidora (EMPRESA).");
          }
          return { content: [] };
        }),
        finanzasApi.obtenerResumen().catch(() => null),
        finanzasApi.listarPagos().catch(() => []),
      ]);

      setPedidosEntregados(pedidosResp?.content || []);
      setResumenFinanciero(resumenResp);
      setPagosTransacciones(pagosResp || []);
    } catch {
      // Ignorar errores no controlados
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Filtrado reactivo de ventas
  const ventasFiltradas = useMemo(() => {
    const ahora = new Date();
    const hoyInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).getTime();
    const sieteDiasAtras = hoyInicio - 7 * 24 * 60 * 60 * 1000;
    const treintaDiasAtras = hoyInicio - 30 * 24 * 60 * 60 * 1000;

    return pedidosEntregados.filter((p) => {
      // Filtro de método
      if (filtroMetodo !== "TODOS" && p.metodoPago !== filtroMetodo) {
        return false;
      }

      // Filtro de fecha
      const fechaPedido = new Date(p.fechaEntrega || p.createdAt).getTime();
      if (filtroPeriodo === "hoy" && fechaPedido < hoyInicio) return false;
      if (filtroPeriodo === "7dias" && fechaPedido < sieteDiasAtras) return false;
      if (filtroPeriodo === "30dias" && fechaPedido < treintaDiasAtras) return false;

      // Filtro de búsqueda
      if (busqueda.trim() !== "") {
        const query = busqueda.toLowerCase();
        const coincideId = p.publicId.toLowerCase().includes(query);
        const coincideCliente = p.nombreCliente?.toLowerCase().includes(query) ?? false;
        const coincideDireccion = p.direccionEntrega?.toLowerCase().includes(query) ?? false;
        const coincideRepartidor = p.nombreRepartidor?.toLowerCase().includes(query) ?? false;
        const coincideItems = p.items?.some((i) => i.nombreProducto?.toLowerCase().includes(query)) ?? false;
        if (!coincideId && !coincideCliente && !coincideDireccion && !coincideRepartidor && !coincideItems) {
          return false;
        }
      }

      return true;
    });
  }, [pedidosEntregados, filtroMetodo, filtroPeriodo, busqueda]);

  // Totales calculados de ventas entregadas
  const kpis = useMemo(() => {
    let totalCobrado = 0;
    let totalEfectivo = 0;
    let totalDigital = 0;
    let balonesVendidos = 0;

    ventasFiltradas.forEach((v) => {
      const monto = Number(v.total) || 0;
      totalCobrado += monto;
      if (v.metodoPago === "EFECTIVO") {
        totalEfectivo += monto;
      } else {
        totalDigital += monto;
      }
      const cantItems = v.items?.reduce((acc, it) => acc + (it.cantidad || 0), 0) || 1;
      balonesVendidos += cantItems;
    });

    const comisionTotal = totalCobrado * 0.05;
    const netoDistribuidor = totalCobrado - comisionTotal;

    return {
      totalCobrado,
      totalEfectivo,
      totalDigital,
      comisionTotal,
      netoDistribuidor,
      cantidadVentas: ventasFiltradas.length,
      balonesVendidos,
    };
  }, [ventasFiltradas]);

  const handleExportarCsv = () => {
    if (ventasFiltradas.length === 0) {
      alert("No hay ventas para exportar con los filtros seleccionados.");
      return;
    }

    const headers = [
      "ID Pedido",
      "Fecha Entrega",
      "Cliente",
      "Telefono",
      "Dirección",
      "Repartidor",
      "Método de Pago",
      "Productos / Balones",
      "Subtotal (S/)",
      "Descuento (S/)",
      "Total Venta (S/)",
      "Comisión Plataforma 5% (S/)",
      "Neto Distribuidora (S/)",
      "Estado Pago",
    ];

    const rows = ventasFiltradas.map((v) => {
      const prods = (v.items || [])
        .map((i) => `${i.cantidad}x ${i.nombreProducto || i.sku}`)
        .join(" | ");
      const subtotal = Number(v.subtotal || v.total).toFixed(2);
      const desc = Number(v.descuento || 0).toFixed(2);
      const total = Number(v.total).toFixed(2);
      const comision = (Number(v.total) * 0.05).toFixed(2);
      const neto = (Number(v.total) * 0.95).toFixed(2);
      const fecha = v.fechaEntrega
        ? new Date(v.fechaEntrega).toLocaleString("es-PE")
        : new Date(v.createdAt).toLocaleString("es-PE");

      return [
        `#${v.publicId.slice(0, 8)}`,
        `"${fecha}"`,
        `"${v.nombreCliente || "Cliente General"}"`,
        `"${v.telefonoCliente || "-"}"`,
        `"${v.direccionEntrega?.replace(/"/g, '""') || "-"}"`,
        `"${v.nombreRepartidor || "Sin asignar"}"`,
        `"${v.metodoPago}"`,
        `"${prods.replace(/"/g, '""')}"`,
        subtotal,
        desc,
        total,
        comision,
        neto,
        `"${v.estadoPago}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `registro_ventas_pidegas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatearMoneda = (monto: number) => {
    return `S/ ${monto.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getMetodoIcono = (metodo: string) => {
    switch (metodo) {
      case "EFECTIVO":
        return <Banknote className="w-3.5 h-3.5" />;
      case "YAPE":
      case "PLIN":
        return <QrCode className="w-3.5 h-3.5" />;
      default:
        return <CreditCard className="w-3.5 h-3.5" />;
    }
  };

  const getMetodoBadgeClass = (metodo: string) => {
    switch (metodo) {
      case "EFECTIVO":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
      case "YAPE":
        return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800";
      case "PLIN":
        return "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800";
      case "TARJETA":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800";
      default:
        return "bg-neutral-100 text-neutral-700 border-neutral-300";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="EMPRESA"
          mensaje={errorPermisos}
        />
      )}

      {/* Header & Acciones Rápidas */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-950/50 text-orange-600 rounded-xl">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                Registro Contable de Ventas
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Trazabilidad y liquidación de pedidos efectivamente entregados y cobrados.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={cargarDatos}
            disabled={cargando}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition disabled:opacity-50"
            title="Refrescar datos de ventas"
          >
            <RefreshCw className={`w-4 h-4 text-neutral-600 ${cargando ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          <button
            onClick={handleExportarCsv}
            disabled={ventasFiltradas.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border bg-card hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl transition print:hidden"
            title="Imprimir reporte contable"
          >
            <Printer className="w-4 h-4 text-neutral-600" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>
        </div>
      </div>

      {/* Métricas Contables / KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Ventas Totales */}
        <div className="p-5 rounded-2xl bg-card border shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Ventas Totales
            </span>
            <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-neutral-900 dark:text-white">
              {formatearMoneda(kpis.totalCobrado)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300">
                {kpis.cantidadVentas} pedidos
              </span>
              <span className="text-xs text-neutral-400">
                • {kpis.balonesVendidos} balones
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Cobros en Efectivo */}
        <div className="p-5 rounded-2xl bg-card border shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Cobro en Efectivo
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatearMoneda(kpis.totalEfectivo)}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Recaudado por choferes en ruta
            </p>
          </div>
        </div>

        {/* KPI 3: Cobros Digitales */}
        <div className="p-5 rounded-2xl bg-card border shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Cobro Digital (Yape/Plin)
            </span>
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
              {formatearMoneda(kpis.totalDigital)}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Transferencias y pasarela
            </p>
          </div>
        </div>

        {/* KPI 4: Comisión Plataforma 5% */}
        <div className="p-5 rounded-2xl bg-card border shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Comisión PideGas (5%)
            </span>
            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-neutral-700 dark:text-neutral-300">
              {formatearMoneda(kpis.comisionTotal)}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Deducción por servicio
            </p>
          </div>
        </div>

        {/* KPI 5: Neto Distribuidora */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Neto Distribuidora
            </span>
            <div className="p-2 rounded-xl bg-emerald-500 text-white">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-neutral-900 dark:text-white">
              {formatearMoneda(kpis.netoDistribuidor)}
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              95% Ganancia efectiva
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="p-4 rounded-2xl bg-card border flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente, pedido, chofer o dirección..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-50 dark:bg-neutral-900 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Método de Pago */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <span>Método:</span>
            <select
              value={filtroMetodo}
              onChange={(e) => setFiltroMetodo(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              <option value="TODOS">Todos los métodos</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="YAPE">Yape</option>
              <option value="PLIN">Plin</option>
              <option value="TARJETA">Tarjeta</option>
            </select>
          </div>

          {/* Selector de Período */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>Período:</span>
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
            >
              <option value="todos">Todo el historial</option>
              <option value="hoy">Hoy</option>
              <option value="7dias">Últimos 7 días</option>
              <option value="30dias">Últimos 30 días</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla Contable de Ventas Entregadas */}
      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-neutral-50/60 dark:bg-neutral-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Ventas Efectivas y Balones Entregados ({ventasFiltradas.length})
            </h3>
          </div>
          <span className="text-xs text-neutral-500">
            Todos los pedidos con entrega confirmada pasan automáticamente a este registro contable
          </span>
        </div>

        {cargando ? (
          <div className="py-16 flex flex-col items-center justify-center text-center">
            <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mb-3" />
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Cargando libro contable de ventas...
            </p>
          </div>
        ) : ventasFiltradas.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="p-4 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 mb-3">
              <Receipt className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-neutral-800 dark:text-neutral-200">
              No se encontraron ventas entregadas
            </h4>
            <p className="text-xs text-neutral-500 max-w-sm mt-1">
              {busqueda || filtroMetodo !== "TODOS" || filtroPeriodo !== "todos"
                ? "Prueba cambiando o limpiando los filtros de búsqueda."
                : "Una vez que un repartidor entregue un pedido y valide el código OTP, la venta aparecerá contabilizada aquí de inmediato."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b bg-neutral-50/40 dark:bg-neutral-900/40 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3 px-4">ID / Comprobante</th>
                  <th className="py-3 px-4">Fecha & Hora</th>
                  <th className="py-3 px-4">Cliente & Dirección</th>
                  <th className="py-3 px-4">Chofer Repartidor</th>
                  <th className="py-3 px-4">Balones Entregados</th>
                  <th className="py-3 px-4">Método de Pago</th>
                  <th className="py-3 px-4 text-right">Total Venta</th>
                  <th className="py-3 px-4 text-right">Comisión 5%</th>
                  <th className="py-3 px-4 text-right">Neto Empresa</th>
                  <th className="py-3 px-4 text-center">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {ventasFiltradas.map((pedido) => {
                  const montoTotal = Number(pedido.total) || 0;
                  const comision = montoTotal * 0.05;
                  const neto = montoTotal - comision;
                  const fecha = pedido.fechaEntrega
                    ? new Date(pedido.fechaEntrega)
                    : new Date(pedido.createdAt);

                  return (
                    <tr
                      key={pedido.publicId}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-900/50 transition cursor-pointer group"
                      onClick={() => setPedidoSeleccionado(pedido)}
                    >
                      {/* ID / Comprobante */}
                      <td className="py-3 px-4 font-mono font-medium text-neutral-900 dark:text-white">
                        <div className="flex items-center gap-1.5">
                          <span className="text-orange-600 font-bold">#</span>
                          <span>{pedido.publicId.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase block mt-0.5">
                          ✓ COBRADO
                        </span>
                      </td>

                      {/* Fecha y Hora */}
                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300">
                        <div className="font-semibold text-neutral-900 dark:text-white">
                          {fecha.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      {/* Cliente y Dirección */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-1">
                          <User className="w-3 h-3 text-neutral-400" />
                          <span>{pedido.nombreCliente || "Cliente General"}</span>
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate max-w-xs" title={pedido.direccionEntrega}>
                          {pedido.direccionEntrega}
                        </div>
                      </td>

                      {/* Chofer Repartidor */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
                          <Truck className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{pedido.nombreRepartidor || "Repartidor de Flota"}</span>
                        </div>
                        {pedido.vehiculoPlaca && (
                          <span className="text-[10px] font-mono text-neutral-400 block">
                            Placa: {pedido.vehiculoPlaca}
                          </span>
                        )}
                      </td>

                      {/* Balones Entregados */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5 max-w-xs">
                          {pedido.items && pedido.items.length > 0 ? (
                            pedido.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-neutral-800 dark:text-neutral-200">
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-orange-100 dark:bg-orange-950 text-[10px] font-bold text-orange-600">
                                  {item.cantidad}
                                </span>
                                <span className="font-medium truncate">{item.nombreProducto}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-neutral-400">1x Balón GLP 10kg</span>
                          )}
                        </div>
                      </td>

                      {/* Método de Pago */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getMetodoBadgeClass(
                            pedido.metodoPago
                          )}`}
                        >
                          {getMetodoIcono(pedido.metodoPago)}
                          {pedido.metodoPago}
                        </span>
                      </td>

                      {/* Total Venta */}
                      <td className="py-3 px-4 text-right font-black text-sm text-neutral-900 dark:text-white">
                        {formatearMoneda(montoTotal)}
                      </td>

                      {/* Comisión 5% */}
                      <td className="py-3 px-4 text-right font-medium text-neutral-500">
                        -{formatearMoneda(comision)}
                      </td>

                      {/* Neto Empresa */}
                      <td className="py-3 px-4 text-right font-black text-sm text-emerald-600 dark:text-emerald-400">
                        {formatearMoneda(neto)}
                      </td>

                      {/* Botón Ver */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPedidoSeleccionado(pedido);
                          }}
                          className="p-1.5 text-neutral-400 group-hover:text-orange-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition"
                          title="Ver recibo contable completo"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t bg-neutral-50/80 dark:bg-neutral-900/80 font-bold text-xs">
                <tr>
                  <td colSpan={6} className="py-3 px-4 text-right uppercase tracking-wider text-neutral-500">
                    Totales Contabilizados ({ventasFiltradas.length} Ventas):
                  </td>
                  <td className="py-3 px-4 text-right font-black text-neutral-900 dark:text-white text-sm">
                    {formatearMoneda(kpis.totalCobrado)}
                  </td>
                  <td className="py-3 px-4 text-right text-neutral-500">
                    -{formatearMoneda(kpis.comisionTotal)}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-emerald-600 text-sm">
                    {formatearMoneda(kpis.netoDistribuidor)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modal / Comprobante de Venta Detallado */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-lg rounded-3xl border shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setPedidoSeleccionado(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Encabezado Comprobante */}
            <div className="text-center pb-4 border-b border-dashed">
              <div className="inline-flex p-3 rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-950/60 mb-2">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                Comprobante de Venta Entregada
              </h3>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                PEDIDO #{pedidoSeleccionado.publicId.toUpperCase()}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cobro Liquidado y Entregado</span>
              </div>
            </div>

            {/* Datos del Cliente y Despacho */}
            <div className="py-4 space-y-3 text-xs border-b border-dashed">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-400 font-medium">Cliente:</span>
                  <p className="font-bold text-neutral-900 dark:text-white mt-0.5">
                    {pedidoSeleccionado.nombreCliente}
                  </p>
                  <p className="text-neutral-500">{pedidoSeleccionado.telefonoCliente || "-"}</p>
                </div>
                <div>
                  <span className="text-neutral-400 font-medium">Repartidor Asignado:</span>
                  <p className="font-bold text-neutral-900 dark:text-white mt-0.5">
                    {pedidoSeleccionado.nombreRepartidor || "Repartidor de Flota"}
                  </p>
                  <p className="text-neutral-500">{pedidoSeleccionado.telefonoRepartidor || "-"}</p>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 font-medium">Dirección de Entrega:</span>
                <p className="font-medium text-neutral-800 dark:text-neutral-200 mt-0.5">
                  {pedidoSeleccionado.direccionEntrega}
                </p>
                {pedidoSeleccionado.referenciaDireccion && (
                  <p className="text-[11px] text-neutral-400 italic">
                    Ref: {pedidoSeleccionado.referenciaDireccion}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-neutral-400 font-medium">Fecha y Hora Entrega:</span>
                  <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {pedidoSeleccionado.fechaEntrega
                      ? new Date(pedidoSeleccionado.fechaEntrega).toLocaleString("es-PE")
                      : new Date(pedidoSeleccionado.createdAt).toLocaleString("es-PE")}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-400 font-medium">Método de Cobro:</span>
                  <p className="font-bold text-neutral-900 dark:text-white">
                    {pedidoSeleccionado.metodoPago}
                  </p>
                </div>
              </div>
            </div>

            {/* Desglose de Balones */}
            <div className="py-4 border-b border-dashed">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Productos Entregados
              </h4>
              <div className="space-y-2">
                {pedidoSeleccionado.items && pedidoSeleccionado.items.length > 0 ? (
                  pedidoSeleccionado.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-orange-600">{item.cantidad}x</span>
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">
                          {item.nombreProducto}
                        </span>
                      </div>
                      <span className="font-bold text-neutral-900 dark:text-white">
                        {formatearMoneda(Number(item.subtotal || item.precioUnitario * item.cantidad))}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <span>1x Balón GLP 10kg</span>
                    <span>{formatearMoneda(Number(pedidoSeleccionado.total))}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Totales y Liquidación Contable */}
            <div className="pt-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Subtotal Venta:</span>
                <span>{formatearMoneda(Number(pedidoSeleccionado.subtotal || pedidoSeleccionado.total))}</span>
              </div>
              {Number(pedidoSeleccionado.descuento || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Descuento Promoción:</span>
                  <span>-{formatearMoneda(Number(pedidoSeleccionado.descuento))}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-900 dark:text-white font-bold text-sm pt-1 border-t">
                <span>Total Cobrado:</span>
                <span>{formatearMoneda(Number(pedidoSeleccionado.total))}</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Comisión Plataforma PideGas (5%):</span>
                <span>-{formatearMoneda(Number(pedidoSeleccionado.total) * 0.05)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-black text-base pt-1 border-t">
                <span>Neto para Distribuidora:</span>
                <span>{formatearMoneda(Number(pedidoSeleccionado.total) * 0.95)}</span>
              </div>
            </div>

            {/* Botón Cerrar */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setPedidoSeleccionado(null)}
                className="px-5 py-2 text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 rounded-xl transition"
              >
                Cerrar Comprobante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
