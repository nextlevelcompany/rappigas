"use client";

import React, { useEffect, useState, useTransition, useCallback, useMemo } from "react";
import {
  inventarioApi,
  AlmacenDetalle,
  StockProductoDetalle,
  MovimientoStockDetalle,
  ResumenInventario,
  TipoMovimientoStock,
} from "@/librerias/api/inventario.api";
import { catalogoApi, ProductoDetalle } from "@/librerias/api/catalogo.api";
import {
  Boxes,
  Warehouse,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Sliders,
  CheckCircle2,
  Package,
  Layers,
  History,
  Search,
  X,
  XCircle,
} from "lucide-react";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function InventarioEmpresaPage() {
  const [resumen, setResumen] = useState<ResumenInventario | null>(null);
  const [almacenes, setAlmacenes] = useState<AlmacenDetalle[]>([]);
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState<string>("");
  const [stocks, setStocks] = useState<StockProductoDetalle[]>([]);
  const [kardex, setKardex] = useState<MovimientoStockDetalle[]>([]);
  const [catalogo, setCatalogo] = useState<ProductoDetalle[]>([]);

  const [tabActiva, setTabActiva] = useState<"stock" | "kardex">("stock");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Modal Nuevo Almacén
  const [mostrarModalAlmacen, setMostrarModalAlmacen] = useState(false);
  const [nombreAlmacen, setNombreAlmacen] = useState("");
  const [direccionAlmacen, setDireccionAlmacen] = useState("");

  // Modal Movimiento Kardex
  const [mostrarModalMovimiento, setMostrarModalMovimiento] = useState(false);
  const [movAlmacenId, setMovAlmacenId] = useState("");
  const [movProductoId, setMovProductoId] = useState("");
  const [movTipo, setMovTipo] = useState<TipoMovimientoStock>("ENTRADA");
  const [movCantidad, setMovCantidad] = useState(10);
  const [movMotivo, setMovMotivo] = useState("");

  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorPermisos(null);
      const [res, alms, prods] = await Promise.all([
        inventarioApi.obtenerResumen().catch((err: any) => {
          if (err?.status === 403 || err?.message?.includes("permisos")) {
            setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Distribuidora (EMPRESA).");
          }
          return null;
        }),
        inventarioApi.listarAlmacenes().catch(() => []),
        catalogoApi.listarMisProductos().catch(() => []),
      ]);

      setResumen(res);
      setAlmacenes(alms);
      setCatalogo(prods);

      const almId = almacenSeleccionado || (alms.length > 0 ? alms[0].publicId : "");
      if (almId && !almacenSeleccionado) {
        setAlmacenSeleccionado(almId);
        setMovAlmacenId(almId);
      }

      const [stockData, kardexData] = await Promise.all([
        inventarioApi.consultarStock(almId || undefined).catch(() => []),
        inventarioApi.obtenerKardex(0, 50).catch(() => ({ content: [] })),
      ]);

      setStocks(stockData);
      setKardex(kardexData.content || []);
    } catch {
      // Ignorar errores no controlados
    } finally {
      setCargando(false);
    }
  }, [almacenSeleccionado]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCrearAlmacen = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreAlmacen.trim()) return;

    startTransition(async () => {
      try {
        const nuevo = await inventarioApi.crearAlmacen({
          nombre: nombreAlmacen.trim(),
          direccion: direccionAlmacen.trim() || undefined,
        });
        setAlmacenes((prev) => [...prev, nuevo]);
        setNombreAlmacen("");
        setDireccionAlmacen("");
        setMostrarModalAlmacen(false);
        setMensajeExito(`Almacén '${nuevo.nombre}' creado con éxito.`);
        setTimeout(() => setMensajeExito(null), 4000);
      } catch (err: unknown) {
        setMensajeError(err instanceof Error ? err.message : "Error al crear almacén");
      }
    });
  };

  const handleRegistrarMovimiento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movAlmacenId || !movProductoId || movCantidad <= 0) return;

    startTransition(async () => {
      try {
        await inventarioApi.registrarMovimiento({
          almacenPublicId: movAlmacenId,
          productoPublicId: movProductoId,
          tipoMovimiento: movTipo,
          cantidad: movCantidad,
          motivo: movMotivo.trim() || undefined,
        });

        setMostrarModalMovimiento(false);
        setMensajeExito(`Movimiento de ${movTipo} registrado correctamente.`);
        setTimeout(() => setMensajeExito(null), 4000);
        cargarDatos();
      } catch (err: unknown) {
        setMensajeError(err instanceof Error ? err.message : "Error al registrar movimiento");
      }
    });
  };

  // Filtrado reactivo de stocks
  const stocksFiltrados = useMemo(() => {
    return stocks.filter((s) => {
      if (!busqueda.trim()) return true;
      const q = busqueda.toLowerCase().trim();
      return (
        s.nombreProducto.toLowerCase().includes(q) ||
        s.sku.toLowerCase().includes(q) ||
        s.nombreAlmacen.toLowerCase().includes(q) ||
        s.tipoGas.toLowerCase().includes(q)
      );
    });
  }, [stocks, busqueda]);

  // Filtrado reactivo de kardex
  const kardexFiltrado = useMemo(() => {
    return kardex.filter((k) => {
      if (!busqueda.trim()) return true;
      const q = busqueda.toLowerCase().trim();
      return (
        k.nombreProducto.toLowerCase().includes(q) ||
        k.skuProducto.toLowerCase().includes(q) ||
        k.nombreAlmacen.toLowerCase().includes(q) ||
        (k.motivo && k.motivo.toLowerCase().includes(q))
      );
    });
  }, [kardex, busqueda]);

  return (
    <div className="w-full py-3 px-3 sm:px-6 space-y-3 text-xs">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="EMPRESA"
          mensaje={errorPermisos}
          onExito={cargarDatos}
        />
      )}

      {/* Alertas */}
      {mensajeExito && (
        <div className="py-2 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900 rounded-lg shadow-2xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{mensajeExito}</span>
          </div>
          <button onClick={() => setMensajeExito(null)} className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {mensajeError && (
        <div className="py-2 px-3 bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900 rounded-lg shadow-2xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="font-semibold">{mensajeError}</span>
          </div>
          <button onClick={() => setMensajeError(null)} className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Cabecera Compacta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Warehouse className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Inventario de Balones de Gas
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-900">
                Stock & Kardex
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Control de existencias en almacenes, balones reservados en ruta y auditoría de movimientos.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
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
            onClick={() => setMostrarModalAlmacen(true)}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            <Warehouse className="w-3.5 h-3.5 text-orange-500" />
            <span>Nuevo Almacén</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (catalogo.length > 0 && !movProductoId) {
                setMovProductoId(catalogo[0].publicId);
              }
              setMostrarModalMovimiento(true);
            }}
            className="h-7 px-3 text-xs gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Movimiento</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas KPI de Inventario Ultracompactas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Balones Disponibles</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-emerald-600 dark:text-emerald-400">
              {resumen?.totalBalonesDisponibles ?? 0}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Listos para entrega</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Boxes className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Balones Reservados</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-blue-600 dark:text-blue-400">
              {resumen?.totalBalonesReservados ?? 0}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">En camión de ruta</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Package className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Almacenes / Sedes</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-purple-600 dark:text-purple-400">
              {resumen?.almacenesActivos ?? almacenes.length}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Puntos de acopio</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Warehouse className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className={`p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between ${
          (resumen?.productosBajoStock ?? 0) > 0 ? "border-amber-300 dark:border-amber-800 bg-amber-50/20" : ""
        }`}>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Alertas Bajo Stock</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-amber-600 dark:text-amber-400">
              {resumen?.productosBajoStock ?? 0}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {(resumen?.productosBajoStock ?? 0) > 0 ? "Requiere reposición" : "Nivel adecuado"}
            </p>
          </div>
          <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
            (resumen?.productosBajoStock ?? 0) > 0
              ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
              : "bg-muted text-muted-foreground"
          }`}>
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Barra de Controles: Pestañas de Vista y Filtro de Almacén */}
      <div className="p-2 rounded-lg border bg-card shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        {/* Pestañas de Vista */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTabActiva("stock")}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              tabActiva === "stock"
                ? "bg-foreground text-background shadow-2xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Stock Actual</span>
            <span className="px-1 py-0.1 rounded text-[10px] bg-black/10 dark:bg-white/15">
              {stocks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTabActiva("kardex")}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              tabActiva === "kardex"
                ? "bg-foreground text-background shadow-2xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Kardex de Movimientos</span>
            <span className="px-1 py-0.1 rounded text-[10px] bg-black/10 dark:bg-white/15">
              {kardex.length}
            </span>
          </button>
        </div>

        {/* Selector de Almacén + Búsqueda */}
        <div className="flex items-center gap-2 shrink-0">
          {tabActiva === "stock" && almacenes.length > 0 && (
            <select
              value={almacenSeleccionado}
              onChange={(e) => setAlmacenSeleccionado(e.target.value)}
              className="h-7 px-2 text-xs rounded-md border bg-muted/40 text-foreground outline-hidden max-w-[170px] truncate"
            >
              <option value="">Todos los almacenes</option>
              {almacenes.map((a) => (
                <option key={a.publicId} value={a.publicId}>
                  {a.nombre}
                </option>
              ))}
            </select>
          )}

          <div className="relative w-full sm:w-56 md:w-60">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2" />
            <Input
              type="text"
              placeholder="Buscar balón, SKU, almacén..."
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
        </div>
      </div>

      {/* PESTAÑA 1: STOCK ACTUAL */}
      {tabActiva === "stock" && (
        <div className="rounded-lg border bg-card shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/60 border-b text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-2">Balón de Gas</th>
                  <th className="px-3 py-2">Almacén / Depósito</th>
                  <th className="px-3 py-2">Especificaciones</th>
                  <th className="px-3 py-2 text-center">Disponible</th>
                  <th className="px-3 py-2 text-center">Mínimo</th>
                  <th className="px-3 py-2 text-center">Nivel de Stock</th>
                  <th className="px-3.5 py-2 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cargando ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-orange-600" />
                        <span className="text-xs">Cargando inventario de balones...</span>
                      </div>
                    </td>
                  </tr>
                ) : stocksFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center">
                      <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                        <Boxes className="w-6 h-6 text-muted-foreground/50" />
                        <p className="text-xs font-semibold text-foreground">No se encontraron balones de gas</p>
                        <p className="text-[11px]">
                          {busqueda
                            ? "Prueba con otros términos de búsqueda."
                            : "Registra un movimiento de entrada inicial para comenzar a despachar."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  stocksFiltrados.map((item) => {
                    const porcentaje = Math.min(
                      100,
                      Math.round((item.cantidadDisponible / Math.max(item.stockMinimo * 3, 1)) * 100)
                    );
                    return (
                      <tr key={item.id} className="hover:bg-muted/40 transition">
                        {/* 1. Producto */}
                        <td className="px-3.5 py-2.5 align-middle">
                          <span className="font-semibold text-foreground block text-xs">
                            {item.nombreProducto}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground block">
                            SKU: {item.sku}
                          </span>
                        </td>

                        {/* 2. Almacén */}
                        <td className="px-3 py-2.5 align-middle whitespace-nowrap text-muted-foreground font-medium">
                          {item.nombreAlmacen}
                        </td>

                        {/* 3. Tipo & Válvula */}
                        <td className="px-3 py-2.5 align-middle whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900">
                              {item.tipoGas.replace("_", " ")}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-muted text-muted-foreground border">
                              {item.tipoValvula}
                            </span>
                          </div>
                        </td>

                        {/* 4. Disponible */}
                        <td className="px-3 py-2.5 align-middle text-center whitespace-nowrap font-mono font-bold text-xs text-foreground">
                          {item.cantidadDisponible}
                        </td>

                        {/* 5. Mínimo */}
                        <td className="px-3 py-2.5 align-middle text-center whitespace-nowrap font-mono text-xs text-muted-foreground">
                          {item.stockMinimo}
                        </td>

                        {/* 6. Nivel de Stock (Barra Compacta) */}
                        <td className="px-3 py-2.5 align-middle">
                          <div className="w-24 mx-auto space-y-0.5">
                            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  item.alertaBajoStock
                                    ? "bg-rose-500 animate-pulse"
                                    : porcentaje < 40
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${porcentaje}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-muted-foreground block text-center font-mono">
                              {item.cantidadDisponible} / {item.stockMinimo * 3} ref
                            </span>
                          </div>
                        </td>

                        {/* 7. Estado */}
                        <td className="px-3.5 py-2.5 align-middle text-right whitespace-nowrap">
                          {item.alertaBajoStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              Bajo Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Óptimo
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: KARDEX */}
      {tabActiva === "kardex" && (
        <div className="rounded-lg border bg-card shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/60 border-b text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-2">Fecha & Hora</th>
                  <th className="px-3 py-2">Almacén</th>
                  <th className="px-3 py-2">Balón / Producto</th>
                  <th className="px-3 py-2">Tipo Movimiento</th>
                  <th className="px-3 py-2 text-center">Cantidad</th>
                  <th className="px-3.5 py-2">Motivo / Operación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cargando ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-orange-600" />
                        <span className="text-xs">Cargando kardex de movimientos...</span>
                      </div>
                    </td>
                  </tr>
                ) : kardexFiltrado.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                        <History className="w-6 h-6 text-muted-foreground/50" />
                        <p className="text-xs font-semibold text-foreground">No se encontraron movimientos registrados</p>
                        <p className="text-[11px]">Los ingresos, salidas y ajustes aparecerán registrados aquí.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  kardexFiltrado.map((mov) => (
                    <tr key={mov.id} className="hover:bg-muted/40 transition">
                      {/* Fecha y Hora */}
                      <td className="px-3.5 py-2.5 align-middle whitespace-nowrap">
                        <span className="font-semibold text-foreground block text-xs">
                          {new Date(mov.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "2-digit" })}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono block">
                          {new Date(mov.createdAt).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>

                      {/* Almacén */}
                      <td className="px-3 py-2.5 align-middle whitespace-nowrap text-muted-foreground font-medium">
                        {mov.nombreAlmacen}
                      </td>

                      {/* Producto */}
                      <td className="px-3 py-2.5 align-middle">
                        <span className="font-semibold text-foreground text-xs block truncate max-w-xs" title={mov.nombreProducto}>
                          {mov.nombreProducto}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono block">
                          SKU: {mov.skuProducto}
                        </span>
                      </td>

                      {/* Tipo de Movimiento */}
                      <td className="px-3 py-2.5 align-middle whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            mov.tipoMovimiento === "ENTRADA" || mov.tipoMovimiento === "DEVOLUCION"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                              : mov.tipoMovimiento === "SALIDA_VENTA"
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {mov.tipoMovimiento === "ENTRADA" && <ArrowDownLeft className="w-3 h-3" />}
                          {mov.tipoMovimiento === "SALIDA_VENTA" && <ArrowUpRight className="w-3 h-3" />}
                          {mov.tipoMovimiento === "AJUSTE" && <Sliders className="w-3 h-3" />}
                          {mov.tipoMovimiento.replace("_", " ")}
                        </span>
                      </td>

                      {/* Cantidad */}
                      <td className="px-3 py-2.5 align-middle text-center whitespace-nowrap font-mono font-bold text-xs">
                        <span
                          className={
                            mov.tipoMovimiento === "SALIDA_VENTA"
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }
                        >
                          {mov.tipoMovimiento === "SALIDA_VENTA" ? `-${mov.cantidad}` : `+${mov.cantidad}`}
                        </span>
                      </td>

                      {/* Motivo */}
                      <td className="px-3.5 py-2.5 align-middle text-muted-foreground text-xs truncate max-w-xs" title={mov.motivo || ""}>
                        {mov.motivo || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Nuevo Almacén */}
      {mostrarModalAlmacen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-100">
          <div className="bg-card text-card-foreground border rounded-xl max-w-md w-full p-4 sm:p-5 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-2.5 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950 font-bold text-xs flex items-center justify-center shrink-0">
                  <Warehouse className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Registrar Nuevo Almacén
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Sede o depósito de acopio para balones.
                  </p>
                </div>
              </div>
              <button onClick={() => setMostrarModalAlmacen(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCrearAlmacen} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">
                  Nombre del Almacén *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Ej: Depósito Norte Principal"
                  value={nombreAlmacen}
                  onChange={(e) => setNombreAlmacen(e.target.value)}
                  className="h-7 text-xs bg-background"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">
                  Dirección Física
                </label>
                <Input
                  type="text"
                  placeholder="Ej: Av. Canta Callao Mz. B Lte. 12"
                  value={direccionAlmacen}
                  onChange={(e) => setDireccionAlmacen(e.target.value)}
                  className="h-7 text-xs bg-background"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarModalAlmacen(false)}
                  className="h-7 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                >
                  {isPending ? "Guardando..." : "Crear Almacén"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Movimiento Kardex */}
      {mostrarModalMovimiento && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-100">
          <div className="bg-card text-card-foreground border rounded-xl max-w-md w-full p-4 sm:p-5 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-2.5 border-b">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950 font-bold text-xs flex items-center justify-center shrink-0">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Registrar Movimiento en Kardex
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Ingresos, ajustes físicos o mermas de balones.
                  </p>
                </div>
              </div>
              <button onClick={() => setMostrarModalMovimiento(false)} className="text-muted-foreground hover:text-foreground p-1 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegistrarMovimiento} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-foreground block mb-1">
                    Almacén *
                  </label>
                  <select
                    required
                    value={movAlmacenId}
                    onChange={(e) => setMovAlmacenId(e.target.value)}
                    className="w-full h-7 px-2 text-xs rounded-md border bg-background text-foreground outline-hidden"
                  >
                    {almacenes.map((a) => (
                      <option key={a.publicId} value={a.publicId}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-foreground block mb-1">
                    Tipo de Movimiento *
                  </label>
                  <select
                    required
                    value={movTipo}
                    onChange={(e) => setMovTipo(e.target.value as TipoMovimientoStock)}
                    className="w-full h-7 px-2 text-xs rounded-md border bg-background text-foreground outline-hidden font-medium"
                  >
                    <option value="ENTRADA">ENTRADA (Proveedor)</option>
                    <option value="AJUSTE">AJUSTE (Conteo físico)</option>
                    <option value="DEVOLUCION">DEVOLUCIÓN (Garantía)</option>
                    <option value="SALIDA_VENTA">SALIDA (Despacho manual)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">
                  Balón / Producto *
                </label>
                <select
                  required
                  value={movProductoId}
                  onChange={(e) => setMovProductoId(e.target.value)}
                  className="w-full h-7 px-2 text-xs rounded-md border bg-background text-foreground outline-hidden"
                >
                  {catalogo.map((p) => (
                    <option key={p.publicId} value={p.publicId}>
                      {p.nombre} ({p.tipoGas.replace("_", " ")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">
                  Cantidad de Balones *
                </label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={movCantidad}
                  onChange={(e) => setMovCantidad(parseInt(e.target.value) || 1)}
                  className="h-7 text-xs font-mono font-bold bg-background"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-foreground block mb-1">
                  Motivo / Observaciones
                </label>
                <Input
                  type="text"
                  placeholder="Ej: Recepción lote envasadora N° 410"
                  value={movMotivo}
                  onChange={(e) => setMovMotivo(e.target.value)}
                  className="h-7 text-xs bg-background"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarModalMovimiento(false)}
                  className="h-7 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                >
                  {isPending ? "Registrando..." : "Guardar Movimiento"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
