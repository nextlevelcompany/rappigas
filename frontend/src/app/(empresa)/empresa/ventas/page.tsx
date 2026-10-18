"use client";

import { useEffect, useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  Search,
  User,
  Truck,
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  X,
  Eye,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    link.setAttribute("download", `registro_ventas_rappigas_${new Date().toISOString().slice(0, 10)}.csv`);
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
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="w-full py-3 px-3 sm:px-6 space-y-3 text-xs">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="EMPRESA"
          mensaje={errorPermisos}
        />
      )}

      {/* Encabezado Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Registro de Ventas
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-900">
                Liquidación Contable
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Trazabilidad, recaudación y liquidación neta de pedidos entregados.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={cargarDatos}
            disabled={cargando}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${cargando ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportarCsv}
            disabled={ventasFiltradas.length === 0}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-7 px-2.5 text-xs gap-1.5 print:hidden"
          >
            <Printer className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Imprimir</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Ultracompactas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* KPI 1: Total Ventas */}
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground font-medium truncate">Total Ventas</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-foreground truncate">{formatearMoneda(kpis.totalCobrado)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{kpis.cantidadVentas} ped. • {kpis.balonesVendidos} balones</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* KPI 2: Cobro Efectivo */}
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground font-medium truncate">Cobro Efectivo</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-emerald-600 dark:text-emerald-400 truncate">{formatearMoneda(kpis.totalEfectivo)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Recaudado en ruta</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Banknote className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* KPI 3: Cobro Digital */}
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground font-medium truncate">Cobro Digital</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-purple-600 dark:text-purple-400 truncate">{formatearMoneda(kpis.totalDigital)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Yape / Plin / Tarjeta</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 flex items-center justify-center shrink-0">
            <QrCode className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* KPI 4: Comisión (5%) */}
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] text-muted-foreground font-medium truncate">Comisión (5%)</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-muted-foreground truncate">{formatearMoneda(kpis.comisionTotal)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Tarifa RappiGas</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0">
            <Percent className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* KPI 5: Neto Distribuidora */}
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between border-emerald-200 dark:border-emerald-800 bg-emerald-50/20">
          <div className="min-w-0">
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium truncate">Neto Distribuidora</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-foreground truncate">{formatearMoneda(kpis.netoDistribuidor)}</p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 truncate">95% Líquido</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda Compacta */}
      <div className="p-2 rounded-lg border bg-card shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        {/* Pestañas de Período */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setFiltroPeriodo("todos")}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              filtroPeriodo === "todos"
                ? "bg-foreground text-background shadow-2xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span>Todo</span>
            <span className="px-1 py-0.1 rounded text-[10px] bg-black/10 dark:bg-white/15">
              {pedidosEntregados.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroPeriodo("hoy")}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              filtroPeriodo === "hoy"
                ? "bg-orange-600 text-white shadow-2xs"
                : "text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40"
            }`}
          >
            <span>Hoy</span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroPeriodo("7dias")}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              filtroPeriodo === "7dias"
                ? "bg-orange-600 text-white shadow-2xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span>7 días</span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroPeriodo("30dias")}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              filtroPeriodo === "30dias"
                ? "bg-orange-600 text-white shadow-2xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span>30 días</span>
          </button>
        </div>

        {/* Filtro de Método + Búsqueda + Conteo */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={filtroMetodo}
            onChange={(e) => setFiltroMetodo(e.target.value)}
            className="h-7 px-2 text-xs rounded-md border bg-muted/40 text-foreground outline-hidden"
          >
            <option value="TODOS">Todos los Métodos</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="YAPE">Yape</option>
            <option value="PLIN">Plin</option>
            <option value="TARJETA">Tarjeta</option>
          </select>

          <div className="relative w-full sm:w-56 md:w-64">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2" />
            <Input
              type="text"
              placeholder="Buscar cliente, pedido, chofer..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-8 pr-7 h-7 text-xs bg-muted/30 focus:bg-background"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-2 top-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-[11px] text-muted-foreground whitespace-nowrap hidden sm:inline">
            <strong className="text-foreground">{ventasFiltradas.length}</strong>/{pedidosEntregados.length}
          </span>
        </div>
      </div>

      {/* Tabla Compacta de Alta Densidad */}
      <div className="rounded-lg border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/60 border-b text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2">Comprobante</th>
                <th className="px-3 py-2">Fecha & Hora</th>
                <th className="px-3 py-2">Cliente & Destino</th>
                <th className="px-3 py-2">Repartidor</th>
                <th className="px-3 py-2">Balones Entregados</th>
                <th className="px-3 py-2">Método de Pago</th>
                <th className="px-3 py-2 text-right">Total & Neto</th>
                <th className="px-3.5 py-2 text-right">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cargando ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-orange-600" />
                      <span className="text-xs">Cargando libro contable de ventas...</span>
                    </div>
                  </td>
                </tr>
              ) : ventasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                      <Receipt className="w-6 h-6 text-muted-foreground/50" />
                      <p className="text-xs font-semibold text-foreground">No se encontraron ventas entregadas</p>
                      <p className="text-[11px]">Prueba cambiando los filtros o el rango de fecha.</p>
                      {(busqueda || filtroMetodo !== "TODOS" || filtroPeriodo !== "todos") && (
                        <button
                          type="button"
                          onClick={() => {
                            setBusqueda("");
                            setFiltroMetodo("TODOS");
                            setFiltroPeriodo("todos");
                          }}
                          className="mt-1 text-xs text-orange-600 hover:underline font-medium"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                ventasFiltradas.map((pedido) => {
                  const montoTotal = Number(pedido.total) || 0;
                  const comision = montoTotal * 0.05;
                  const neto = montoTotal - comision;
                  const fecha = pedido.fechaEntrega
                    ? new Date(pedido.fechaEntrega)
                    : new Date(pedido.createdAt);

                  return (
                    <tr
                      key={pedido.publicId}
                      className="hover:bg-muted/40 transition group cursor-pointer"
                      onClick={() => setPedidoSeleccionado(pedido)}
                    >
                      {/* 1. Comprobante */}
                      <td className="px-3.5 py-2.5 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground">
                          <span className="text-orange-600 font-bold">#</span>
                          <span>{pedido.publicId.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase block mt-0.5">
                          ✓ COBRADO
                        </span>
                      </td>

                      {/* 2. Fecha y Hora */}
                      <td className="px-3 py-2.5 align-middle whitespace-nowrap">
                        <span className="font-semibold text-foreground block text-xs">
                          {fecha.toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "2-digit" })}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          {fecha.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>

                      {/* 3. Cliente y Dirección */}
                      <td className="px-3 py-2.5 align-middle">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="font-semibold text-foreground truncate max-w-xs text-xs" title={pedido.nombreCliente}>
                            {pedido.nombreCliente || "Cliente General"}
                          </span>
                        </div>
                        {pedido.direccionEntrega && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground truncate max-w-xs mt-0.5" title={pedido.direccionEntrega}>
                            <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{pedido.direccionEntrega}</span>
                          </div>
                        )}
                      </td>

                      {/* 4. Chofer Repartidor */}
                      <td className="px-3 py-2.5 align-middle">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Truck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium text-foreground truncate max-w-xs text-xs" title={pedido.nombreRepartidor}>
                            {pedido.nombreRepartidor || "Repartidor de Flota"}
                          </span>
                        </div>
                        {pedido.vehiculoPlaca && (
                          <span className="text-[10px] font-mono text-muted-foreground block mt-0.5">
                            Placa: {pedido.vehiculoPlaca}
                          </span>
                        )}
                      </td>

                      {/* 5. Balones Entregados */}
                      <td className="px-3 py-2.5 align-middle">
                        <div className="space-y-0.5 max-w-xs">
                          {pedido.items && pedido.items.length > 0 ? (
                            pedido.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-foreground text-xs">
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 text-[10px] font-bold shrink-0">
                                  {item.cantidad}
                                </span>
                                <span className="font-medium truncate text-[11px]">{item.nombreProducto}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-[11px]">1x Balón GLP 10kg</span>
                          )}
                        </div>
                      </td>

                      {/* 6. Método de Pago */}
                      <td className="px-3 py-2.5 align-middle whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getMetodoBadgeClass(
                            pedido.metodoPago
                          )}`}
                        >
                          {getMetodoIcono(pedido.metodoPago)}
                          <span>{pedido.metodoPago}</span>
                        </span>
                      </td>

                      {/* 7. Total & Neto */}
                      <td className="px-3 py-2.5 align-middle text-right whitespace-nowrap">
                        <span className="font-bold text-foreground block text-xs">
                          {formatearMoneda(montoTotal)}
                        </span>
                        <div className="flex items-center justify-end gap-1 text-[10px]">
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Neto: {formatearMoneda(neto)}
                          </span>
                          <span className="text-muted-foreground opacity-60">•</span>
                          <span className="text-muted-foreground">
                            -{formatearMoneda(comision)}
                          </span>
                        </div>
                      </td>

                      {/* 8. Botón Recibo */}
                      <td className="px-3.5 py-2 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setPedidoSeleccionado(pedido)}
                          className="h-7 w-7 rounded-md border border-input bg-background hover:bg-muted text-muted-foreground hover:text-foreground inline-flex items-center justify-center transition shadow-2xs cursor-pointer"
                          title="Ver Comprobante de Venta"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {ventasFiltradas.length > 0 && (
              <tfoot className="border-t bg-muted/40 font-semibold text-xs">
                <tr>
                  <td colSpan={6} className="py-2.5 px-3.5 text-right uppercase tracking-wider text-muted-foreground text-[10px]">
                    Totales Contabilizados ({ventasFiltradas.length} Ventas):
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <span className="font-bold text-foreground block text-xs">
                      {formatearMoneda(kpis.totalCobrado)}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                      Neto: {formatearMoneda(kpis.netoDistribuidor)}
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Modal / Comprobante de Venta Detallado */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-100">
          <div className="bg-card text-card-foreground border rounded-xl max-w-md w-full p-4 sm:p-5 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-100">
            {/* Header del Comprobante */}
            <div className="flex justify-between items-start border-b pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950 font-bold text-xs flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Comprobante de Entrega
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    PEDIDO #{pedidoSeleccionado.publicId.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPedidoSeleccionado(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Estado de Cobro */}
            <div className="flex items-center justify-between p-2 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cobro Liquidado & Balón Entregado</span>
              </div>
              <span className="font-mono text-[11px]">{pedidoSeleccionado.metodoPago}</span>
            </div>

            {/* Datos del Cliente y Despacho */}
            <div className="space-y-1.5 text-xs divide-y divide-border">
              <div className="pt-1.5 flex justify-between">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-semibold text-foreground text-right">{pedidoSeleccionado.nombreCliente}</span>
              </div>
              {pedidoSeleccionado.telefonoCliente && (
                <div className="pt-1.5 flex justify-between">
                  <span className="text-muted-foreground">Teléfono Cliente:</span>
                  <span className="font-mono text-foreground">{pedidoSeleccionado.telefonoCliente}</span>
                </div>
              )}
              <div className="pt-1.5 flex justify-between">
                <span className="text-muted-foreground">Dirección:</span>
                <span className="text-right text-foreground max-w-[220px] truncate" title={pedidoSeleccionado.direccionEntrega}>
                  {pedidoSeleccionado.direccionEntrega}
                </span>
              </div>
              <div className="pt-1.5 flex justify-between">
                <span className="text-muted-foreground">Repartidor / Chofer:</span>
                <span className="font-semibold text-foreground text-right">
                  {pedidoSeleccionado.nombreRepartidor || "Repartidor de Flota"}
                </span>
              </div>
              {pedidoSeleccionado.vehiculoPlaca && (
                <div className="pt-1.5 flex justify-between">
                  <span className="text-muted-foreground">Vehículo / Placa:</span>
                  <span className="font-mono text-foreground">{pedidoSeleccionado.vehiculoPlaca}</span>
                </div>
              )}
              <div className="pt-1.5 flex justify-between">
                <span className="text-muted-foreground">Fecha & Hora:</span>
                <span className="text-foreground">
                  {pedidoSeleccionado.fechaEntrega
                    ? new Date(pedidoSeleccionado.fechaEntrega).toLocaleString("es-PE")
                    : new Date(pedidoSeleccionado.createdAt).toLocaleString("es-PE")}
                </span>
              </div>
            </div>

            {/* Desglose de Balones */}
            <div className="pt-2 border-t space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                Productos Entregados
              </span>
              <div className="space-y-1">
                {pedidoSeleccionado.items && pedidoSeleccionado.items.length > 0 ? (
                  pedidoSeleccionado.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-muted/40">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-orange-600">{item.cantidad}x</span>
                        <span className="font-medium text-foreground">{item.nombreProducto}</span>
                      </div>
                      <span className="font-bold text-foreground">
                        {formatearMoneda(Number(item.subtotal || item.precioUnitario * item.cantidad))}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between text-xs py-1 px-2 rounded bg-muted/40">
                    <span>1x Balón GLP 10kg</span>
                    <span>{formatearMoneda(Number(pedidoSeleccionado.total))}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Totales y Liquidación Contable */}
            <div className="pt-2 border-t space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal Venta:</span>
                <span>{formatearMoneda(Number(pedidoSeleccionado.subtotal || pedidoSeleccionado.total))}</span>
              </div>
              {Number(pedidoSeleccionado.descuento || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Descuento Promoción:</span>
                  <span>-{formatearMoneda(Number(pedidoSeleccionado.descuento))}</span>
                </div>
              )}
              <div className="flex justify-between text-foreground font-bold text-xs pt-1 border-t">
                <span>Total Cobrado:</span>
                <span>{formatearMoneda(Number(pedidoSeleccionado.total))}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Comisión Plataforma RappiGas (5%):</span>
                <span>-{formatearMoneda(Number(pedidoSeleccionado.total) * 0.05)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold text-sm pt-1 border-t">
                <span>Neto para Distribuidora:</span>
                <span>{formatearMoneda(Number(pedidoSeleccionado.total) * 0.95)}</span>
              </div>
            </div>

            {/* Botón Cerrar */}
            <div className="pt-3 flex justify-end gap-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPedidoSeleccionado(null)}
                className="h-7 text-xs"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
