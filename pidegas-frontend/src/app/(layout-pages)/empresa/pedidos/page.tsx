"use client";

import React, { useEffect, useState, useTransition, useCallback } from "react";
import {
  pedidosApi,
  PedidoDetalle,
  EstadoPedido,
  ResumenMetricasPedidos,
} from "@/librerias/api/pedidos.api";
import { flotaApi, RepartidorDetalle } from "@/librerias/api/flota.api";
import { pedidosSocket, EventoPedidoSocket } from "@/librerias/websocket/pedidos-socket";
import { useAuthStore } from "@/store/auth-store";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import {
  Flame,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  AlertCircle,
  Search,
  Phone,
  MapPin,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode,
  Package,
  LayoutGrid,
  Columns3,
  UserCheck,
  Bike,
} from "lucide-react";

// Función para emitir sonido melódico sintetizado sin dependencias externas
const reproducirAlertaNuevoPedido = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.4);
  } catch {
    // Silencio si autoplay no está permitido
  }
};

export default function DespachoPedidosPage() {
  const { usuario } = useAuthStore();
  const [pedidos, setPedidos] = useState<PedidoDetalle[]>([]);
  const [repartidores, setRepartidores] = useState<RepartidorDetalle[]>([]);
  const [metricas, setMetricas] = useState<ResumenMetricasPedidos>({
    pendientes: 0,
    confirmados: 0,
    enCamino: 0,
    entregados: 0,
    cancelados: 0,
    total: 0,
  });

  const [modoVista, setModoVista] = useState<"CUADRICULA" | "KANBAN">("KANBAN");
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | "TODOS">("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [wsConectado, setWsConectado] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [alertaReciente, setAlertaReciente] = useState<string | null>(null);

  // Modales
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoDetalle | null>(null);
  const [pedidoParaEntregar, setPedidoParaEntregar] = useState<PedidoDetalle | null>(null);
  const [pedidoParaAsignar, setPedidoParaAsignar] = useState<PedidoDetalle | null>(null);
  const [codigoConfirmacionInput, setCodigoConfirmacionInput] = useState("");
  const [errorEntrega, setErrorEntrega] = useState<string | null>(null);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorPermisos(null);
      const [resPedidos, resMetricas, resRepartidores] = await Promise.all([
        pedidosApi.listarPedidosEmpresa(
          filtroEstado === "TODOS" ? undefined : filtroEstado,
          0,
          50
        ).catch((err: any) => {
          if (err?.status === 403 || err?.message?.includes("permisos")) {
            setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Distribuidora (EMPRESA).");
          }
          return { content: [], totalElements: 0, totalPages: 0 };
        }),
        pedidosApi.obtenerMetricas().catch(() => ({
          pendientes: 0,
          confirmados: 0,
          enCamino: 0,
          entregados: 0,
          cancelados: 0,
          total: 0,
        })),
        flotaApi.listarRepartidores().catch(() => []),
      ]);
      setPedidos(resPedidos.content || []);
      setMetricas(resMetricas);
      setRepartidores(resRepartidores);
    } catch {
      // Ignorar para evitar el overlay de Turbopack
    } finally {
      setCargando(false);
    }
  }, [filtroEstado]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Conexión WebSockets en tiempo real
  useEffect(() => {
    pedidosSocket.iniciar((conectado) => {
      setWsConectado(conectado);
    });

    let desuscribir: (() => void) | undefined;
    if (usuario?.tenantId) {
      desuscribir = pedidosSocket.suscribirEmpresa(usuario.tenantId, (evento: EventoPedidoSocket) => {
        if (evento.tipoEvento === "NUEVO_PEDIDO") {
          reproducirAlertaNuevoPedido();
          setAlertaReciente(
            `¡Nuevo Pedido #${evento.pedido.publicId.substring(0, 8)} de ${evento.pedido.nombreCliente}!`
          );

          setPedidos((prev) => [evento.pedido, ...prev.filter((p) => p.publicId !== evento.pedido.publicId)]);
          setMetricas((prev) => ({
            ...prev,
            pendientes: prev.pendientes + 1,
            total: prev.total + 1,
          }));

          setTimeout(() => setAlertaReciente(null), 6000);
        } else if (evento.tipoEvento === "ESTADO_ACTUALIZADO") {
          setPedidos((prev) =>
            prev.map((p) => (p.publicId === evento.pedido.publicId ? evento.pedido : p))
          );
          pedidosApi.obtenerMetricas().then(setMetricas).catch(() => {});
        }
      });
    }

    return () => {
      if (desuscribir) desuscribir();
    };
  }, [usuario?.tenantId]);

  const cambiarEstado = (publicId: string, nuevoEstado: EstadoPedido, codigo?: string) => {
    startTransition(async () => {
      try {
        setErrorEntrega(null);
        const actualizado = await pedidosApi.actualizarEstado(publicId, {
          nuevoEstado,
          codigoConfirmacion: codigo,
        });

        setPedidos((prev) =>
          prev.map((p) => (p.publicId === actualizado.publicId ? actualizado : p))
        );
        if (pedidoSeleccionado?.publicId === actualizado.publicId) {
          setPedidoSeleccionado(actualizado);
        }
        setPedidoParaEntregar(null);
        setCodigoConfirmacionInput("");

        const resMetricas = await pedidosApi.obtenerMetricas();
        setMetricas(resMetricas);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : "Error al actualizar estado del pedido";
        setErrorEntrega(errorMsg);
      }
    });
  };

  const handleAsignarChofer = (repartidorPublicId: string) => {
    if (!pedidoParaAsignar) return;
    startTransition(async () => {
      try {
        const actualizado = await flotaApi.asignarRepartidorAPedido(
          pedidoParaAsignar.publicId,
          repartidorPublicId
        );
        setPedidos((prev) =>
          prev.map((p) => (p.publicId === actualizado.publicId ? actualizado : p))
        );
        setPedidoParaAsignar(null);
        const resMetricas = await pedidosApi.obtenerMetricas();
        setMetricas(resMetricas);
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Error al asignar chofer");
      }
    });
  };

  const pedidosFiltrados = pedidos.filter((p) => {
    if (busqueda.trim() === "") return true;
    const q = busqueda.toLowerCase();
    return (
      p.nombreCliente.toLowerCase().includes(q) ||
      p.direccionEntrega.toLowerCase().includes(q) ||
      p.publicId.toLowerCase().includes(q) ||
      (p.nombreRepartidor && p.nombreRepartidor.toLowerCase().includes(q)) ||
      (p.telefonoCliente && p.telefonoCliente.includes(q))
    );
  });

  const getBadgeEstado = (estado: EstadoPedido) => {
    switch (estado) {
      case "PENDIENTE":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-300">
            <Clock className="w-3 h-3 animate-spin" />
            Pendiente
          </span>
        );
      case "CONFIRMADO":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-300">
            <Package className="w-3 h-3" />
            Confirmado
          </span>
        );
      case "ASIGNADO":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400 border border-indigo-300">
            <UserCheck className="w-3 h-3" />
            Chofer Asignado
          </span>
        );
      case "EN_CAMINO":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-300">
            <Truck className="w-3 h-3 animate-pulse" />
            En Camino (GPS)
          </span>
        );
      case "ENTREGADO":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-300">
            <CheckCircle className="w-3 h-3" />
            Entregado
          </span>
        );
      case "CANCELADO":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-300">
            <XCircle className="w-3 h-3" />
            Cancelado
          </span>
        );
    }
  };

  const renderTarjetaPedido = (pedido: PedidoDetalle) => (
    <div
      key={pedido.publicId}
      className={`p-4 rounded-2xl border bg-white dark:bg-gray-800 transition flex flex-col justify-between shadow-sm hover:shadow-md ${
        pedido.estado === "PENDIENTE"
          ? "border-amber-300 dark:border-amber-800 ring-1 ring-amber-400/30"
          : pedido.estado === "EN_CAMINO"
          ? "border-purple-300 dark:border-purple-800"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      <div className="space-y-2.5">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
          <div>
            <span className="text-xs font-mono font-bold text-gray-500">
              #PG-{pedido.publicId.substring(0, 8)}
            </span>
            <p className="text-[10px] text-gray-400">
              {new Date(pedido.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div>{getBadgeEstado(pedido.estado)}</div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
              {pedido.nombreCliente}
            </h4>
            {pedido.telefonoCliente && (
              <a
                href={`tel:${pedido.telefonoCliente}`}
                className="inline-flex items-center gap-1 text-[11px] text-orange-600 font-semibold hover:underline"
              >
                <Phone className="w-3 h-3" />
                {pedido.telefonoCliente}
              </a>
            )}
          </div>

          <div className="flex items-start gap-1 text-xs text-gray-600 dark:text-gray-300">
            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-tight">
              {pedido.direccionEntrega}
              {pedido.referenciaDireccion && ` (${pedido.referenciaDireccion})`}
            </span>
          </div>

          {pedido.nombreRepartidor && (
            <div className="flex items-center gap-1.5 p-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 rounded-lg text-[11px] font-medium">
              <Bike className="w-3.5 h-3.5 text-blue-600" />
              <span>Chofer: {pedido.nombreRepartidor} {pedido.vehiculoPlaca ? `(${pedido.vehiculoPlaca})` : ""}</span>
            </div>
          )}
        </div>

        <div className="bg-orange-50/50 dark:bg-gray-700/30 p-2 rounded-xl text-xs space-y-0.5">
          {pedido.items.map((it, idx) => (
            <div key={idx} className="flex justify-between text-gray-800 dark:text-gray-200 text-[11px]">
              <span>
                <strong>{it.cantidad}x</strong> {it.nombreProducto}
              </span>
              <span className="font-semibold">S/ {it.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-[11px] text-gray-500">{pedido.metodoPago}</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            S/ {pedido.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-1.5">
        {pedido.estado === "PENDIENTE" && (
          <>
            <button
              onClick={() => cambiarEstado(pedido.publicId, "CONFIRMADO")}
              disabled={isPending}
              className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Confirmar
            </button>
            <button
              onClick={() => setPedidoParaAsignar(pedido)}
              className="py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3 h-3" />
              Asignar Chofer
            </button>
          </>
        )}

        {pedido.estado === "CONFIRMADO" && (
          <>
            <button
              onClick={() => setPedidoParaAsignar(pedido)}
              className="flex-1 py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3 h-3" />
              Asignar Chofer
            </button>
            <button
              onClick={() => cambiarEstado(pedido.publicId, "EN_CAMINO")}
              disabled={isPending}
              className="flex-1 py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
            >
              <Truck className="w-3 h-3" />
              Despachar
            </button>
          </>
        )}

        {pedido.estado === "ASIGNADO" && (
          <button
            onClick={() => cambiarEstado(pedido.publicId, "EN_CAMINO")}
            disabled={isPending}
            className="flex-1 py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
          >
            <Truck className="w-3 h-3" />
            Iniciar Ruta (En Camino)
          </button>
        )}

        {pedido.estado === "EN_CAMINO" && (
          <button
            onClick={() => {
              setPedidoParaEntregar(pedido);
              setCodigoConfirmacionInput("");
              setErrorEntrega(null);
            }}
            className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
          >
            <ShieldCheck className="w-3 h-3" />
            Entrega (Código)
          </button>
        )}

        <button
          onClick={() => setPedidoSeleccionado(pedido)}
          className="py-1 px-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs font-medium"
        >
          Detalle
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="EMPRESA"
          mensaje={errorPermisos}
          onExito={cargarDatos}
        />
      )}

      {/* Alerta flotante */}
      {alertaReciente && (
        <div className="p-4 bg-emerald-500 text-white rounded-xl shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <Flame className="w-6 h-6 text-yellow-300" />
            <span className="font-semibold">{alertaReciente}</span>
          </div>
          <button onClick={() => setAlertaReciente(null)} className="text-white font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Despacho en Vivo y Tablero Kanban
            </h1>
            {wsConectado ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                WebSocket En Vivo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Conectando...
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Flujo transaccional: asignación de choferes, seguimiento GPS y validación con código de seguridad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Alternador de vista */}
          <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
            <button
              onClick={() => setModoVista("KANBAN")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                modoVista === "KANBAN"
                  ? "bg-white dark:bg-gray-800 text-orange-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              Kanban
            </button>
            <button
              onClick={() => setModoVista("CUADRICULA")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                modoVista === "CUADRICULA"
                  ? "bg-white dark:bg-gray-800 text-orange-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Cuadrícula
            </button>
          </div>

          <button
            onClick={cargarDatos}
            disabled={cargando}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-xl transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="flex justify-end">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por cliente, chofer, dirección..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Vista Tablero Kanban */}
      {modoVista === "KANBAN" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {/* Columna 1: Pendientes */}
          <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3 min-w-[260px]">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Pendientes</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {pedidosFiltrados.filter((p) => p.estado === "PENDIENTE").length}
              </span>
            </div>
            <div className="space-y-3">
              {pedidosFiltrados
                .filter((p) => p.estado === "PENDIENTE")
                .map(renderTarjetaPedido)}
            </div>
          </div>

          {/* Columna 2: Confirmados */}
          <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3 min-w-[260px]">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 dark:text-blue-400">
                <Package className="w-4 h-4" />
                <span>Confirmados</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {pedidosFiltrados.filter((p) => p.estado === "CONFIRMADO").length}
              </span>
            </div>
            <div className="space-y-3">
              {pedidosFiltrados
                .filter((p) => p.estado === "CONFIRMADO")
                .map(renderTarjetaPedido)}
            </div>
          </div>

          {/* Columna 3: Asignados */}
          <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3 min-w-[260px]">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                <UserCheck className="w-4 h-4" />
                <span>Chofer Asignado</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                {pedidosFiltrados.filter((p) => p.estado === "ASIGNADO").length}
              </span>
            </div>
            <div className="space-y-3">
              {pedidosFiltrados
                .filter((p) => p.estado === "ASIGNADO")
                .map(renderTarjetaPedido)}
            </div>
          </div>

          {/* Columna 4: En Camino */}
          <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3 min-w-[260px]">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-400">
                <Truck className="w-4 h-4" />
                <span>En Camino (GPS)</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                {pedidosFiltrados.filter((p) => p.estado === "EN_CAMINO").length}
              </span>
            </div>
            <div className="space-y-3">
              {pedidosFiltrados
                .filter((p) => p.estado === "EN_CAMINO")
                .map(renderTarjetaPedido)}
            </div>
          </div>

          {/* Columna 5: Entregados */}
          <div className="bg-gray-50 dark:bg-gray-900/40 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3 min-w-[260px]">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span>Entregados</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {pedidosFiltrados.filter((p) => p.estado === "ENTREGADO").length}
              </span>
            </div>
            <div className="space-y-3">
              {pedidosFiltrados
                .filter((p) => p.estado === "ENTREGADO")
                .map(renderTarjetaPedido)}
            </div>
          </div>
        </div>
      ) : (
        /* Vista Cuadrícula Tradicional */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pedidosFiltrados.map(renderTarjetaPedido)}
        </div>
      )}

      {/* Modal Asignar Repartidor de Flota */}
      {pedidoParaAsignar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Asignar Chofer de Reparto
                </h3>
                <p className="text-xs text-gray-400">Pedido #{pedidoParaAsignar.publicId.substring(0, 8)}</p>
              </div>
              <button onClick={() => setPedidoParaAsignar(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Selecciona el repartidor activo y la unidad que se encargará del despacho de estos balones de gas:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {repartidores.map((rep) => (
                <div
                  key={rep.publicId}
                  onClick={() => handleAsignarChofer(rep.publicId)}
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-500 cursor-pointer transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <Bike className="w-5 h-5 text-orange-600" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                        {rep.nombres} {rep.apellidos}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        {rep.vehiculoPlaca ? `Placa: ${rep.vehiculoPlaca}` : "Sin placa"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      rep.estado === "DISPONIBLE"
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {rep.estado}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPedidoParaAsignar(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Completo */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Detalle del Pedido #{pedidoSeleccionado.publicId.substring(0, 8)}
              </h3>
              <button onClick={() => setPedidoSeleccionado(null)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl space-y-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Cliente:</span>
                <p className="text-gray-900 dark:text-white font-medium">{pedidoSeleccionado.nombreCliente}</p>
                <p className="text-gray-500">Tel: {pedidoSeleccionado.telefonoCliente || "-"}</p>
              </div>

              {pedidoSeleccionado.nombreRepartidor && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-xl space-y-1">
                  <span className="font-semibold text-indigo-900 dark:text-indigo-300">Chofer de Reparto Asignado:</span>
                  <p className="text-gray-900 dark:text-white font-medium">{pedidoSeleccionado.nombreRepartidor}</p>
                  <p className="text-indigo-600 font-mono">Unidad / Placa: {pedidoSeleccionado.vehiculoPlaca || "Moto Furgón"}</p>
                </div>
              )}

              <div className="p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl space-y-1">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Dirección y GPS:</span>
                <p className="text-gray-900 dark:text-white">{pedidoSeleccionado.direccionEntrega}</p>
                {pedidoSeleccionado.latitud && (
                  <a
                    href={`https://maps.google.com/?q=${pedidoSeleccionado.latitud},${pedidoSeleccionado.longitud}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-orange-600 font-semibold mt-1 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir en Google Maps ({pedidoSeleccionado.latitud.toFixed(4)}, {pedidoSeleccionado.longitud?.toFixed(4)})
                  </a>
                )}
              </div>

              {pedidoSeleccionado.codigoConfirmacion && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-emerald-800 dark:text-emerald-300">Código de Confirmación:</span>
                    <p className="text-[11px] text-emerald-600">El cliente debe dictarlo al chofer</p>
                  </div>
                  <span className="text-xl font-mono font-bold tracking-widest text-emerald-700">
                    {pedidoSeleccionado.codigoConfirmacion}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPedidoSeleccionado(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Entrega con Código */}
      {pedidoParaEntregar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3 text-emerald-600">
              <ShieldCheck className="w-7 h-7" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Validar y Confirmar Entrega
              </h3>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Código de Confirmación (6 dígitos)</label>
              <input
                type="text"
                maxLength={6}
                value={codigoConfirmacionInput}
                onChange={(e) => setCodigoConfirmacionInput(e.target.value.replace(/\D/g, ""))}
                placeholder="482910"
                className="w-full text-center text-2xl font-mono font-bold tracking-widest py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              />
            </div>

            {errorEntrega && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorEntrega}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPedidoParaEntregar(null)}
                className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  cambiarEstado(pedidoParaEntregar.publicId, "ENTREGADO", codigoConfirmacionInput)
                }
                disabled={isPending || codigoConfirmacionInput.length < 6}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl"
              >
                Confirmar Entrega
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
