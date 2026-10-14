"use client";

import React, { useEffect, useState, useTransition, useCallback } from "react";
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
  Flame,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Sliders,
  CheckCircle,
  Package,
  Layers,
  History,
} from "lucide-react";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";

export default function InventarioEmpresaPage() {
  const [resumen, setResumen] = useState<ResumenInventario | null>(null);
  const [almacenes, setAlmacenes] = useState<AlmacenDetalle[]>([]);
  const [almacenSeleccionado, setAlmacenSeleccionado] = useState<string>("");
  const [stocks, setStocks] = useState<StockProductoDetalle[]>([]);
  const [kardex, setKardex] = useState<MovimientoStockDetalle[]>([]);
  const [catalogo, setCatalogo] = useState<ProductoDetalle[]>([]);

  const [tabActiva, setTabActiva] = useState<"stock" | "kardex">("stock");
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
      if (almId) {
        setAlmacenSeleccionado(almId);
        setMovAlmacenId(almId);
      }

      const [stockData, kardexData] = await Promise.all([
        inventarioApi.consultarStock(almId || undefined).catch(() => []),
        inventarioApi.obtenerKardex(0, 30).catch(() => ({ content: [] })),
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="EMPRESA"
          mensaje={errorPermisos}
          onExito={cargarDatos}
        />
      )}

      {/* Alertas */}
      {mensajeExito && (
        <div className="p-4 bg-emerald-500 text-white rounded-xl shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">{mensajeExito}</span>
          </div>
          <button onClick={() => setMensajeExito(null)} className="text-sm font-bold">✕</button>
        </div>
      )}

      {mensajeError && (
        <div className="p-4 bg-red-500 text-white rounded-xl shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-semibold">{mensajeError}</span>
          </div>
          <button onClick={() => setMensajeError(null)} className="text-sm font-bold">✕</button>
        </div>
      )}

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Inventario de Balones de Gas y Kardex
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Gas de Cocina
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Control de stock en tiempo real, almacenes de balones (10kg, 15kg, 45kg) y auditoría Kardex.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={cargarDatos}
            disabled={cargando}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
            Actualizar
          </button>

          <button
            onClick={() => setMostrarModalAlmacen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-xl transition"
          >
            <Warehouse className="w-4 h-4 text-orange-500" />
            Nuevo Almacén
          </button>

          <button
            onClick={() => {
              if (catalogo.length > 0 && !movProductoId) {
                setMovProductoId(catalogo[0].publicId);
              }
              setMostrarModalMovimiento(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Registrar Movimiento
          </button>
        </div>
      </div>

      {/* Tarjetas KPI de Inventario */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-600 shrink-0">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Balones Disponibles</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {resumen?.totalBalonesDisponibles ?? 0}{" "}
              <span className="text-xs font-normal text-gray-400">unidades</span>
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Balones Reservados</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {resumen?.totalBalonesReservados ?? 0}{" "}
              <span className="text-xs font-normal text-gray-400">en ruta</span>
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center text-purple-600 shrink-0">
            <Warehouse className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Almacenes / Depósitos</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {resumen?.almacenesActivos ?? almacenes.length}{" "}
              <span className="text-xs font-normal text-gray-400">activos</span>
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              (resumen?.productosBajoStock ?? 0) > 0
                ? "bg-red-100 dark:bg-red-950/30 text-red-600 animate-pulse"
                : "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600"
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Alertas Stock Mínimo</span>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              {resumen?.productosBajoStock ?? 0}{" "}
              <span className="text-xs font-normal text-gray-400">a reponer</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Barra de Filtro de Almacén y Pestañas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTabActiva("stock")}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
              tabActiva === "stock"
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            Stock Actual por Almacén
          </button>

          <button
            onClick={() => setTabActiva("kardex")}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
              tabActiva === "kardex"
                ? "bg-orange-600 text-white shadow-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            <History className="w-4 h-4" />
            Kardex de Movimientos
          </button>
        </div>

        {tabActiva === "stock" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Almacén:</span>
            <select
              value={almacenSeleccionado}
              onChange={(e) => setAlmacenSeleccionado(e.target.value)}
              className="text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="">Todos los almacenes</option>
              {almacenes.map((a) => (
                <option key={a.publicId} value={a.publicId}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Contenido Pestaña 1: STOCK ACTUAL */}
      {tabActiva === "stock" && (
        <div className="space-y-4">
          {cargando ? (
            <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-500">Cargando inventario de balones...</p>
            </div>
          ) : stocks.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <Boxes className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-bold text-gray-800 dark:text-gray-200">No hay balones en este almacén</h3>
              <p className="text-xs text-gray-500 mt-1">
                Registra un movimiento de entrada o inicializa el inventario para comenzar a despachar.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Balón de Gas de Cocina</th>
                      <th className="px-6 py-4">Almacén / Depósito</th>
                      <th className="px-6 py-4">Tipo & Válvula</th>
                      <th className="px-6 py-4 text-center">Disponible</th>
                      <th className="px-6 py-4 text-center">Mínimo</th>
                      <th className="px-6 py-4 text-center">Nivel Stock</th>
                      <th className="px-6 py-4 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {stocks.map((item) => {
                      const porcentaje = Math.min(
                        100,
                        Math.round((item.cantidadDisponible / Math.max(item.stockMinimo * 3, 1)) * 100)
                      );
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900 dark:text-white">
                              {item.nombreProducto}
                            </div>
                            <span className="text-[11px] font-mono text-gray-400">SKU: {item.sku}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                            {item.nombreAlmacen}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300">
                                {item.tipoGas.replace("_", " ")}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                                {item.tipoValvula}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-lg font-black text-gray-900 dark:text-white font-mono">
                              {item.cantidadDisponible}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center font-mono text-gray-500">
                            {item.stockMinimo}
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-28 mx-auto space-y-1">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    item.alertaBajoStock
                                      ? "bg-red-500 animate-pulse"
                                      : porcentaje < 40
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${porcentaje}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-gray-400 block text-center font-mono">
                                {item.cantidadDisponible} / {item.stockMinimo * 3} ref
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {item.alertaBajoStock ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                                Bajo Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                                <CheckCircle className="w-3 h-3" />
                                Óptimo
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contenido Pestaña 2: KARDEX */}
      {tabActiva === "kardex" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                Registro de Movimientos de Entrada, Salida y Ajuste (Kardex)
              </h3>
              <span className="text-xs text-gray-400">Últimos {kardex.length} registros</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3.5">Fecha & Hora</th>
                    <th className="px-6 py-3.5">Almacén</th>
                    <th className="px-6 py-3.5">Balón / Producto</th>
                    <th className="px-6 py-3.5">Tipo Movimiento</th>
                    <th className="px-6 py-3.5 text-center">Cantidad</th>
                    <th className="px-6 py-3.5">Motivo / Pedido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {kardex.map((mov) => (
                    <tr key={mov.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <td className="px-6 py-3.5 text-xs text-gray-500 font-mono">
                        {new Date(mov.createdAt).toLocaleDateString()} {" "}
                        {new Date(mov.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-3.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {mov.nombreAlmacen}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-bold text-gray-900 dark:text-white text-xs block">
                          {mov.nombreProducto}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">SKU: {mov.skuProducto}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            mov.tipoMovimiento === "ENTRADA" || mov.tipoMovimiento === "DEVOLUCION"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : mov.tipoMovimiento === "SALIDA_VENTA"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                          }`}
                        >
                          {mov.tipoMovimiento === "ENTRADA" && <ArrowDownLeft className="w-3 h-3" />}
                          {mov.tipoMovimiento === "SALIDA_VENTA" && <ArrowUpRight className="w-3 h-3" />}
                          {mov.tipoMovimiento === "AJUSTE" && <Sliders className="w-3 h-3" />}
                          {mov.tipoMovimiento.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center font-mono font-bold text-gray-900 dark:text-white">
                        {mov.tipoMovimiento === "SALIDA_VENTA" ? `-${mov.cantidad}` : `+${mov.cantidad}`}
                      </td>
                      <td className="px-6 py-3.5 text-xs text-gray-600 dark:text-gray-300">
                        {mov.motivo || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Almacén */}
      {mostrarModalAlmacen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-orange-500" />
                Registrar Nuevo Almacén / Depósito
              </h3>
              <button onClick={() => setMostrarModalAlmacen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearAlmacen} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Nombre del Almacén *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Depósito Secundario Pro"
                  value={nombreAlmacen}
                  onChange={(e) => setNombreAlmacen(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Dirección Física
                </label>
                <input
                  type="text"
                  placeholder="Ej: Av. Canta Callao Mz. B Lte. 12"
                  value={direccionAlmacen}
                  onChange={(e) => setDireccionAlmacen(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalAlmacen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isPending ? "Guardando..." : "Crear Almacén"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registrar Movimiento Kardex */}
      {mostrarModalMovimiento && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-orange-500" />
                Registrar Movimiento de Kardex
              </h3>
              <button onClick={() => setMostrarModalMovimiento(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleRegistrarMovimiento} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Almacén de Destino *
                  </label>
                  <select
                    required
                    value={movAlmacenId}
                    onChange={(e) => setMovAlmacenId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {almacenes.map((a) => (
                      <option key={a.publicId} value={a.publicId}>
                        {a.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Tipo de Movimiento *
                  </label>
                  <select
                    required
                    value={movTipo}
                    onChange={(e) => setMovTipo(e.target.value as TipoMovimientoStock)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="ENTRADA">ENTRADA (Llegada envasadora / proveedor)</option>
                    <option value="AJUSTE">AJUSTE (Conteo físico de inventario)</option>
                    <option value="DEVOLUCION">DEVOLUCIÓN (Garantía o cambio de balón)</option>
                    <option value="SALIDA_VENTA">SALIDA POR VENTA (Despacho manual)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Balón de Gas de Cocina *
                </label>
                <select
                  required
                  value={movProductoId}
                  onChange={(e) => setMovProductoId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  {catalogo.map((p) => (
                    <option key={p.publicId} value={p.publicId}>
                      {p.nombre} ({p.tipoGas} - {p.tipoValvula})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Cantidad de Balones *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={movCantidad}
                  onChange={(e) => setMovCantidad(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Motivo / Observaciones
                </label>
                <input
                  type="text"
                  placeholder="Ej: Recepción de camión cisterna Lote 420"
                  value={movMotivo}
                  onChange={(e) => setMovMotivo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalMovimiento(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isPending ? "Registrando..." : "Guardar Movimiento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
