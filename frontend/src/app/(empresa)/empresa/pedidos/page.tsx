"use client";

import React, { useEffect, useState, useTransition, useCallback, useMemo } from "react";
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
import { Button } from "@/components/ui/button";
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
  List as ListIcon,
  UserCheck,
  Bike,
  Eye,
  Calendar,
  MessageCircle,
  Sparkles,
  Filter,
  Navigation,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Hash,
  User,
  Printer,
  X,
  Volume2,
  GripVertical,
} from "lucide-react";

// Función para emitir sonido melódico sintetizado de nuevo pedido
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

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.45);
  } catch {
    // Silencio si autoplay está bloqueado por el navegador
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

  // Modo de vista: LISTA por defecto (o KANBAN / CUADRICULA)
  const [modoVista, setModoVista] = useState<"LISTA" | "KANBAN" | "CUADRICULA">("LISTA");
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | "TODOS">("TODOS");
  const [filtroMetodo, setFiltroMetodo] = useState<string>("TODOS");
  const [filtroRepartidor, setFiltroRepartidor] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [wsConectado, setWsConectado] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [alertaReciente, setAlertaReciente] = useState<string | null>(null);

  // Estado de Drag & Drop para Tablero Kanban
  const [pedidoArrastrado, setPedidoArrastrado] = useState<PedidoDetalle | null>(null);
  const [columnaDestinoHover, setColumnaDestinoHover] = useState<EstadoPedido | null>(null);

  // Modales
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoDetalle | null>(null);
  const [pedidoParaEntregar, setPedidoParaEntregar] = useState<PedidoDetalle | null>(null);
  const [pedidoParaAsignar, setPedidoParaAsignar] = useState<PedidoDetalle | null>(null);
  const [codigoConfirmacionInput, setCodigoConfirmacionInput] = useState("");
  const [errorEntrega, setErrorEntrega] = useState<string | null>(null);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);

  // Cargar preferencia de vista guardada
  useEffect(() => {
    try {
      const guardada = localStorage.getItem("pidegas_empresa_pedidos_vista");
      if (guardada === "KANBAN" || guardada === "LISTA" || guardada === "CUADRICULA") {
        setModoVista(guardada);
      }
    } catch {
      // Ignorar error de localStorage
    }
  }, []);

  const cambiarModoVista = (nuevoModo: "LISTA" | "KANBAN" | "CUADRICULA") => {
    setModoVista(nuevoModo);
    try {
      localStorage.setItem("pidegas_empresa_pedidos_vista", nuevoModo);
    } catch {
      // Ignorar error de localStorage
    }
  };

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorPermisos(null);
      const [resPedidos, resMetricas, resRepartidores] = await Promise.all([
        pedidosApi.listarPedidosEmpresa(
          undefined,
          0,
          200
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
      // Ignorar para evitar overlay
    } finally {
      setCargando(false);
    }
  }, []);

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
            `¡Nuevo Pedido #${evento.pedido.publicId.substring(0, 8).toUpperCase()} de ${evento.pedido.nombreCliente}!`
          );

          setPedidos((prev) => [evento.pedido, ...prev.filter((p) => p.publicId !== evento.pedido.publicId)]);
          setMetricas((prev) => ({
            ...prev,
            pendientes: prev.pendientes + 1,
            total: prev.total + 1,
          }));

          setTimeout(() => setAlertaReciente(null), 8000);
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
    if (isPending) return;
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
        if (
          errorMsg.includes("Row was updated") ||
          errorMsg.includes("another transaction") ||
          errorMsg.includes("Concurrencia") ||
          errorMsg.includes("concurrencia") ||
          errorMsg.includes("409")
        ) {
          await cargarDatos();
          setErrorEntrega("El pedido se sincronizó con el servidor tras una actualización simultánea.");
        } else {
          setErrorEntrega(errorMsg);
        }
      }
    });
  };

  const handleAsignarChofer = (repartidorPublicId: string) => {
    if (!pedidoParaAsignar || isPending) return;
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
        const errorMsg = err instanceof Error ? err.message : "Error al asignar chofer";
        if (
          errorMsg.includes("Row was updated") ||
          errorMsg.includes("another transaction") ||
          errorMsg.includes("Concurrencia") ||
          errorMsg.includes("concurrencia") ||
          errorMsg.includes("409")
        ) {
          await cargarDatos();
          setPedidoParaAsignar(null);
        } else {
          alert(errorMsg);
        }
      }
    });
  };

  // Manejo de Drag and Drop (Jalar y Soltar entre Columnas Kanban)
  const handleDragStart = (e: React.DragEvent, pedido: PedidoDetalle) => {
    e.dataTransfer.setData("text/plain", pedido.publicId);
    e.dataTransfer.effectAllowed = "move";
    setPedidoArrastrado(pedido);
  };

  const handleDragOverColumna = (e: React.DragEvent, estadoColumna: EstadoPedido) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (columnaDestinoHover !== estadoColumna) {
      setColumnaDestinoHover(estadoColumna);
    }
  };

  const handleDragLeaveColumna = (e: React.DragEvent, estadoColumna: EstadoPedido) => {
    // Si sale de la columna actual
    if (columnaDestinoHover === estadoColumna) {
      setColumnaDestinoHover(null);
    }
  };

  const handleDropSobreColumna = (e: React.DragEvent, nuevoEstado: EstadoPedido) => {
    e.preventDefault();
    setColumnaDestinoHover(null);
    const idPedido = e.dataTransfer.getData("text/plain") || pedidoArrastrado?.publicId;
    if (!idPedido) return;

    const pedido = pedidos.find((p) => p.publicId === idPedido);
    if (!pedido || pedido.estado === nuevoEstado) return;

    // Si se arrastra a ASIGNADO, abrimos el modal de asignación de chofer
    if (nuevoEstado === "ASIGNADO") {
      setPedidoParaAsignar(pedido);
      return;
    }

    // Si se arrastra a ENTREGADO, abrimos el modal de validación OTP
    if (nuevoEstado === "ENTREGADO") {
      setPedidoParaEntregar(pedido);
      setCodigoConfirmacionInput("");
      setErrorEntrega(null);
      return;
    }

    // Para transiciones directas (CONFIRMADO, EN_CAMINO, PENDIENTE, etc.)
    cambiarEstado(pedido.publicId, nuevoEstado);
    setPedidoArrastrado(null);
  };

  // Filtrado reactivo completo
  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      if (filtroEstado !== "TODOS" && modoVista !== "KANBAN" && p.estado !== filtroEstado) {
        return false;
      }
      if (filtroMetodo !== "TODOS" && p.metodoPago !== filtroMetodo) {
        return false;
      }
      if (filtroRepartidor === "SIN_ASIGNAR" && (p.repartidorPublicId || p.nombreRepartidor)) {
        return false;
      }
      if (
        filtroRepartidor !== "TODOS" &&
        filtroRepartidor !== "SIN_ASIGNAR" &&
        p.repartidorPublicId !== filtroRepartidor
      ) {
        return false;
      }
      if (busqueda.trim() === "") return true;
      const q = busqueda.toLowerCase().trim();
      return (
        (p.nombreCliente && p.nombreCliente.toLowerCase().includes(q)) ||
        (p.direccionEntrega && p.direccionEntrega.toLowerCase().includes(q)) ||
        (p.publicId && p.publicId.toLowerCase().includes(q)) ||
        (p.nombreRepartidor && p.nombreRepartidor.toLowerCase().includes(q)) ||
        (p.telefonoCliente && p.telefonoCliente.includes(q)) ||
        p.items?.some((it) => it.nombreProducto?.toLowerCase().includes(q))
      );
    });
  }, [pedidos, modoVista, filtroEstado, filtroMetodo, filtroRepartidor, busqueda]);

  const hayFiltrosActivos =
    filtroEstado !== "TODOS" ||
    filtroMetodo !== "TODOS" ||
    filtroRepartidor !== "TODOS" ||
    busqueda.trim() !== "";

  const limpiarFiltros = () => {
    setFiltroEstado("TODOS");
    setFiltroMetodo("TODOS");
    setFiltroRepartidor("TODOS");
    setBusqueda("");
  };

  // Sumas de montos (precios) y conteos agrupados por columna Kanban
  const totalesPorColumna = useMemo(() => {
    const sumas: Record<EstadoPedido, { cantidad: number; totalMonto: number }> = {
      PENDIENTE: { cantidad: 0, totalMonto: 0 },
      CONFIRMADO: { cantidad: 0, totalMonto: 0 },
      ASIGNADO: { cantidad: 0, totalMonto: 0 },
      EN_CAMINO: { cantidad: 0, totalMonto: 0 },
      ENTREGADO: { cantidad: 0, totalMonto: 0 },
      CANCELADO: { cantidad: 0, totalMonto: 0 },
    };

    pedidosFiltrados.forEach((p) => {
      if (sumas[p.estado]) {
        sumas[p.estado].cantidad += 1;
        sumas[p.estado].totalMonto += Number(p.total) || 0;
      }
    });

    return sumas;
  }, [pedidosFiltrados]);

  const getBadgeEstado = (estado: EstadoPedido, compacto = false) => {
    switch (estado) {
      case "PENDIENTE":
        return (
          <span className={`inline-flex items-center gap-1 font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700 ${compacto ? "px-1.5 py-0.2 rounded text-[10px]" : "px-2 py-0.5 rounded-md text-xs"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            Pendiente
          </span>
        );
      case "CONFIRMADO":
        return (
          <span className={`inline-flex items-center gap-1 font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-700 ${compacto ? "px-1.5 py-0.2 rounded text-[10px]" : "px-2 py-0.5 rounded-md text-xs"}`}>
            <Package className={compacto ? "w-3 h-3" : "w-3.5 h-3.5"} />
            Confirmado
          </span>
        );
      case "ASIGNADO":
        return (
          <span className={`inline-flex items-center gap-1 font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 ${compacto ? "px-1.5 py-0.2 rounded text-[10px]" : "px-2 py-0.5 rounded-md text-xs"}`}>
            <UserCheck className={compacto ? "w-3 h-3" : "w-3.5 h-3.5"} />
            {compacto ? "Asignado" : "Chofer Asignado"}
          </span>
        );
      case "EN_CAMINO":
        return (
          <span className={`inline-flex items-center gap-1 font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-300 dark:border-purple-700 ${compacto ? "px-1.5 py-0.2 rounded text-[10px]" : "px-2 py-0.5 rounded-md text-xs"}`}>
            <Truck className={`${compacto ? "w-3 h-3" : "w-3.5 h-3.5"} animate-pulse`} />
            {compacto ? "En Ruta" : "En Camino (GPS)"}
          </span>
        );
      case "ENTREGADO":
        return (
          <span className={`inline-flex items-center gap-1 font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 ${compacto ? "px-1.5 py-0.2 rounded text-[10px]" : "px-2 py-0.5 rounded-md text-xs"}`}>
            <CheckCircle className={compacto ? "w-3 h-3" : "w-3.5 h-3.5"} />
            Entregado
          </span>
        );
      case "CANCELADO":
        return (
          <span className={`inline-flex items-center gap-1 font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-700 ${compacto ? "px-1.5 py-0.2 rounded text-[10px]" : "px-2 py-0.5 rounded-md text-xs"}`}>
            <XCircle className={compacto ? "w-3 h-3" : "w-3.5 h-3.5"} />
            Cancelado
          </span>
        );
    }
  };

  const getBadgePago = (metodo: string, compacto = false) => {
    switch (metodo) {
      case "EFECTIVO":
        return (
          <span className={`inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap ${compacto ? "px-1.5 py-0.2 rounded text-[10px]" : "px-2 py-0.5 rounded-md text-[11px]"}`}>
            <Banknote className={compacto ? "w-3 h-3" : "w-3.5 h-3.5"} /> Efectivo
          </span>
        );
      case "YAPE":
      case "PLIN":
        return (
          <span className={`inline-flex items-center gap-1 font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 whitespace-nowrap ${compacto ? "px-1.5 py-0.2 rounded text-[10px]" : "px-2 py-0.5 rounded-md text-[11px]"}`}>
            <QrCode className={compacto ? "w-3 h-3" : "w-3.5 h-3.5"} /> {metodo}
          </span>
        );
      case "TARJETA":
        return (
          <span className={`inline-flex items-center gap-1 font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 whitespace-nowrap ${compacto ? "px-1.5 py-0.2 rounded text-[10px]" : "px-2 py-0.5 rounded-md text-[11px]"}`}>
            <CreditCard className={compacto ? "w-3 h-3" : "w-3.5 h-3.5"} /> {compacto ? "POS" : "Tarjeta POS"}
          </span>
        );
      default:
        return (
          <span className={`${compacto ? "text-[10px]" : "text-[11px]"} text-neutral-500 font-medium`}>
            {metodo}
          </span>
        );
    }
  };

  // Helper para renderizar un botón compacto solo con icono y tooltip emergente al hover
  const renderBotonAccionCompacto = (
    onClick: () => void,
    icon: React.ReactNode,
    tooltip: string,
    colorClasses: string,
    disabled = false
  ) => (
    <div className="relative group/btn inline-flex">
      <button
        onClick={onClick}
        disabled={disabled}
        title={tooltip}
        aria-label={tooltip}
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all duration-150 shadow-xs hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${colorClasses}`}
      >
        {icon}
      </button>
      {/* Tooltip emergente que se muestra al pasar el cursor */}
      <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover/btn:flex flex-col items-center z-50 pointer-events-none">
        <span className="px-2 py-1 bg-neutral-900 dark:bg-neutral-800 text-white text-[10px] font-bold rounded-md shadow-xl whitespace-nowrap border border-neutral-700/50">
          {tooltip}
        </span>
        <span className="w-1.5 h-1 border-x-4 border-t-4 border-transparent border-t-neutral-900 dark:border-t-neutral-800 -mt-[1px] mr-3 self-end" />
      </div>
    </div>
  );

  // Botones de acción ultra compactos para la tabla del Modo Lista (SOLO ICONOS CON TOOLTIP)
  const renderBotonesAccionTabla = (pedido: PedidoDetalle) => (
    <div className="flex items-center justify-end gap-1.5">
      {pedido.estado === "PENDIENTE" && (
        <>
          {renderBotonAccionCompacto(
            () => cambiarEstado(pedido.publicId, "CONFIRMADO"),
            <CheckCircle className="w-3.5 h-3.5" />,
            "Confirmar Pedido",
            "bg-blue-600 hover:bg-blue-700 text-white",
            isPending
          )}
          {renderBotonAccionCompacto(
            () => setPedidoParaAsignar(pedido),
            <UserCheck className="w-3.5 h-3.5" />,
            "Asignar Chofer de Reparto",
            "bg-indigo-600 hover:bg-indigo-700 text-white"
          )}
        </>
      )}

      {pedido.estado === "CONFIRMADO" && (
        <>
          {renderBotonAccionCompacto(
            () => setPedidoParaAsignar(pedido),
            <UserCheck className="w-3.5 h-3.5" />,
            "Asignar Chofer de Reparto",
            "bg-indigo-600 hover:bg-indigo-700 text-white"
          )}
          {renderBotonAccionCompacto(
            () => cambiarEstado(pedido.publicId, "EN_CAMINO"),
            <Truck className="w-3.5 h-3.5" />,
            "Despachar e Iniciar Ruta",
            "bg-purple-600 hover:bg-purple-700 text-white",
            isPending
          )}
        </>
      )}

      {pedido.estado === "ASIGNADO" && (
        renderBotonAccionCompacto(
          () => cambiarEstado(pedido.publicId, "EN_CAMINO"),
          <Truck className="w-3.5 h-3.5" />,
          "Iniciar Ruta (En Camino)",
          "bg-purple-600 hover:bg-purple-700 text-white",
          isPending
        )
      )}

      {pedido.estado === "EN_CAMINO" && (
        renderBotonAccionCompacto(
          () => {
            setPedidoParaEntregar(pedido);
            setCodigoConfirmacionInput("");
            setErrorEntrega(null);
          },
          <ShieldCheck className="w-3.5 h-3.5" />,
          "Validar Código OTP (Entregar)",
          "bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse"
        )
      )}

      {renderBotonAccionCompacto(
        () => setPedidoSeleccionado(pedido),
        <Eye className="w-3.5 h-3.5" />,
        "Ver Detalle / Comprobante",
        "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
      )}
    </div>
  );

  // Botones de acción contextuales según el estado del pedido (para tarjetas Kanban/Cuadrícula)
  const renderBotonesAccion = (pedido: PedidoDetalle, compacto = false) => (
    <div className="flex flex-wrap items-center gap-1.5">
      {pedido.estado === "PENDIENTE" && (
        <>
          <button
            onClick={() => cambiarEstado(pedido.publicId, "CONFIRMADO")}
            disabled={isPending}
            className="py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs hover:scale-[1.02] active:scale-[0.98]"
            title="Confirmar pedido para despacho"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Confirmar</span>
          </button>
          <button
            onClick={() => setPedidoParaAsignar(pedido)}
            className="py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs hover:scale-[1.02] active:scale-[0.98]"
            title="Asignar repartidor"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Chofer</span>
          </button>
        </>
      )}

      {pedido.estado === "CONFIRMADO" && (
        <>
          <button
            onClick={() => setPedidoParaAsignar(pedido)}
            className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Asignar Chofer</span>
          </button>
          <button
            onClick={() => cambiarEstado(pedido.publicId, "EN_CAMINO")}
            disabled={isPending}
            className="py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs hover:scale-[1.02] active:scale-[0.98]"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Despachar</span>
          </button>
        </>
      )}

      {pedido.estado === "ASIGNADO" && (
        <button
          onClick={() => cambiarEstado(pedido.publicId, "EN_CAMINO")}
          disabled={isPending}
          className="py-1.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs hover:scale-[1.02] active:scale-[0.98]"
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Iniciar Ruta</span>
        </button>
      )}

      {pedido.estado === "EN_CAMINO" && (
        <button
          onClick={() => {
            setPedidoParaEntregar(pedido);
            setCodigoConfirmacionInput("");
            setErrorEntrega(null);
          }}
          className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs animate-pulse hover:scale-[1.02] active:scale-[0.98]"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Validar OTP</span>
        </button>
      )}

      <button
        onClick={() => setPedidoSeleccionado(pedido)}
        className="py-1.5 px-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
        title="Ver detalle completo"
      >
        <Eye className="w-3.5 h-3.5" />
        <span className={compacto ? "hidden" : "inline"}>Detalle</span>
      </button>
    </div>
  );

  // Render Tarjeta para Tablero Kanban y Modo Cuadrícula (estilo ultra compacto y arrastrable)
  const renderTarjetaPedido = (pedido: PedidoDetalle) => {
    const totalMonto = Number(pedido.total) || 0;
    const tiempo = pedido.createdAt
      ? new Date(pedido.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "--:--";

    const estaSiendoArrastrado = pedidoArrastrado?.publicId === pedido.publicId;

    return (
      <div
        key={pedido.publicId}
        draggable
        onDragStart={(e) => handleDragStart(e, pedido)}
        onDragEnd={() => setPedidoArrastrado(null)}
        className={`p-2.5 rounded-lg border bg-card text-card-foreground transition-all duration-150 flex flex-col justify-between shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing group/card select-none ${
          estaSiendoArrastrado ? "opacity-40 scale-[0.98] border-orange-500 ring-2 ring-orange-500/30" : ""
        } ${
          pedido.estado === "PENDIENTE"
            ? "border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-b from-amber-50/20 to-card"
            : pedido.estado === "EN_CAMINO"
            ? "border-purple-300/80 dark:border-purple-700/60 bg-gradient-to-b from-purple-50/20 to-card"
            : pedido.estado === "ENTREGADO"
            ? "border-emerald-200/80 dark:border-emerald-800/60"
            : "border-neutral-200 dark:border-neutral-800"
        }`}
      >
        <div className="space-y-1.5 min-w-0">
          {/* Cabecera Tarjeta: ID y Estado */}
          <div className="flex items-center justify-between border-b pb-1 dark:border-neutral-800/80 gap-1">
            <div className="flex items-center gap-1 min-w-0 truncate">
              <span className="text-neutral-400 group-hover/card:text-neutral-700 dark:group-hover/card:text-neutral-200 cursor-grab shrink-0">
                <GripVertical className="w-3 h-3" />
              </span>
              <span className="p-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-600 shrink-0">
                <Flame className="w-3 h-3" />
              </span>
              <span className="text-[11px] font-mono font-black text-neutral-900 dark:text-white truncate">
                #PG-{(pedido.publicId || "").substring(0, 8).toUpperCase()}
              </span>
              <span className="text-[9px] text-neutral-400 font-medium shrink-0">
                {tiempo}
              </span>
            </div>
            <div className="shrink-0">{getBadgeEstado(pedido.estado, true)}</div>
          </div>

          {/* Datos del Cliente y Ubicación */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1 min-w-0">
                <User className="w-3 h-3 text-neutral-400 shrink-0" />
                <h4 className="text-[11px] font-bold text-neutral-900 dark:text-white truncate">
                  {pedido.nombreCliente || "Cliente General"}
                </h4>
              </div>
              {pedido.telefonoCliente && (
                <a
                  href={`tel:${pedido.telefonoCliente}`}
                  className="inline-flex items-center gap-0.5 text-[9px] px-1 py-0.2 rounded bg-orange-50 text-orange-600 dark:bg-orange-950/40 font-bold hover:bg-orange-100 transition shrink-0"
                  title="Llamar"
                >
                  <Phone className="w-2.5 h-2.5" />
                  {pedido.telefonoCliente}
                </a>
              )}
            </div>

            <div className="flex items-start gap-1 text-[11px] text-neutral-600 dark:text-neutral-300">
              <MapPin className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="line-clamp-1 leading-snug">
                  {pedido.direccionEntrega || "Sin dirección"}
                </span>
                {pedido.referenciaDireccion && (
                  <span className="text-[9px] text-neutral-400 block line-clamp-1 italic">
                    Ref: {pedido.referenciaDireccion}
                  </span>
                )}
              </div>
            </div>

            {/* Repartidor asignado */}
            {pedido.nombreRepartidor ? (
              <div className="flex items-center justify-between p-1 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 rounded text-[10px] font-semibold border border-indigo-200/80 dark:border-indigo-800">
                <div className="flex items-center gap-1 truncate">
                  <Bike className="w-3 h-3 text-indigo-600 shrink-0" />
                  <span className="truncate">
                    {pedido.nombreRepartidor} {pedido.vehiculoPlaca ? `(${pedido.vehiculoPlaca})` : ""}
                  </span>
                </div>
                <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-indigo-200/80 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 shrink-0 ml-1">
                  En Ruta
                </span>
              </div>
            ) : (
              <button
                onClick={() => setPedidoParaAsignar(pedido)}
                className="w-full py-0.5 px-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-bold flex items-center justify-center gap-1 border border-dashed border-indigo-300 dark:border-indigo-700 transition"
              >
                <UserCheck className="w-3 h-3" />
                <span>+ Chofer</span>
              </button>
            )}
          </div>

          {/* Desglose de Balones */}
          <div className="bg-neutral-50/80 dark:bg-neutral-900/60 p-1.5 rounded text-[10px] space-y-0.5 border dark:border-neutral-800/80">
            {(pedido.items || []).length > 0 ? (
              pedido.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center text-neutral-800 dark:text-neutral-200">
                  <span className="truncate pr-1 flex items-center gap-1">
                    <span className="px-1 py-0.2 rounded bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 font-bold text-[9px]">
                      {it.cantidad}x
                    </span>
                    <span className="truncate">{it.nombreProducto}</span>
                  </span>
                  <span className="font-bold shrink-0 font-mono">
                    S/ {(it.subtotal || 0).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-[10px] text-neutral-500">1x Balón GLP 10kg</div>
            )}
          </div>

          {/* Método de pago y Total */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <div>{getBadgePago(pedido.metodoPago, true)}</div>
            <div className="text-right flex items-baseline gap-1">
              <span className="text-[9px] text-neutral-400 uppercase font-semibold">Total:</span>
              <span className="text-xs font-black text-neutral-900 dark:text-white font-mono">
                S/ {totalMonto.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Botones de Acción Compactos con Tooltips */}
        <div className="mt-2 pt-1.5 border-t dark:border-neutral-800/80 flex items-center justify-between">
          <div className="text-[9px] text-neutral-400 font-medium">Acciones:</div>
          {renderBotonesAccionTabla(pedido)}
        </div>
      </div>
    );
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

      {/* Alerta flotante de nuevo pedido recibido por WebSocket */}
      {alertaReciente && (
        <div className="py-2 px-3 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 text-white rounded-lg shadow-md flex items-center justify-between border border-white/20 text-xs">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-yellow-200 animate-pulse shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wide mr-1.5">¡Nuevo Pedido!</span>
              <span className="font-medium text-white/95">{alertaReciente}</span>
            </div>
          </div>
          <button
            onClick={() => setAlertaReciente(null)}
            className="p-1 hover:bg-white/20 rounded transition text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Principal de Despacho & Selector de Vistas Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Despacho en Vivo de Pedidos
              </h1>
              {wsConectado ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  En Línea
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Reconectando
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Panel central de asignación de choferes, monitoreo de rutas GLP y confirmación OTP.
            </p>
          </div>
        </div>

        {/* SELECTOR DE VISTAS (MODO LISTA, KANBAN Y CUADRÍCULA) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center border rounded-md p-0.5 bg-muted/20">
            <button
              onClick={() => cambiarModoVista("LISTA")}
              title="Modo Lista (Tabla)"
              className={`h-7 px-2.5 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
                modoVista === "LISTA"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>Lista</span>
            </button>

            <button
              onClick={() => cambiarModoVista("KANBAN")}
              title="Modo Tablero Kanban"
              className={`h-7 px-2.5 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
                modoVista === "KANBAN"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>

            <button
              onClick={() => cambiarModoVista("CUADRICULA")}
              title="Modo Cuadrícula"
              className={`h-7 px-2.5 rounded text-xs font-semibold flex items-center gap-1.5 transition ${
                modoVista === "CUADRICULA"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cuadrícula</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={cargarDatos}
            disabled={cargando}
            className="h-7 px-2.5 text-xs gap-1.5"
            title="Refrescar pedidos"
          >
            <RefreshCw className={`w-3 h-3 ${cargando ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards de Métricas Operativas Homogéneas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* KPI 1: Total */}
        <div
          onClick={() => setFiltroEstado("TODOS")}
          className={`p-2.5 px-3 rounded-lg border transition cursor-pointer hover:shadow-xs flex items-center justify-between ${
            filtroEstado === "TODOS"
              ? "bg-orange-50/50 border-orange-500 ring-2 ring-orange-500/20 dark:bg-orange-950/20"
              : "bg-card text-card-foreground shadow-2xs"
          }`}
        >
          <div>
            <span className="text-[11px] font-medium text-muted-foreground block">Total Pedidos</span>
            <span className="text-lg font-bold text-foreground font-mono mt-0.5 block">
              {metricas.total}
            </span>
          </div>
          <div className="w-7 h-7 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0">
            <Package className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* KPI 2: Pendientes */}
        <div
          onClick={() => setFiltroEstado("PENDIENTE")}
          className={`p-2.5 px-3 rounded-lg border transition cursor-pointer hover:shadow-xs flex items-center justify-between ${
            filtroEstado === "PENDIENTE"
              ? "bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/20 dark:bg-amber-950/30"
              : "bg-card text-card-foreground shadow-2xs"
          }`}
        >
          <div>
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 block">Pendientes</span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
              {metricas.pendientes}
            </span>
          </div>
          <div className="w-7 h-7 rounded-md bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5 animate-spin" />
          </div>
        </div>

        {/* KPI 3: Confirmados */}
        <div
          onClick={() => setFiltroEstado("CONFIRMADO")}
          className={`p-2.5 px-3 rounded-lg border transition cursor-pointer hover:shadow-xs flex items-center justify-between ${
            filtroEstado === "CONFIRMADO"
              ? "bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 dark:bg-blue-950/30"
              : "bg-card text-card-foreground shadow-2xs"
          }`}
        >
          <div>
            <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 block">Confirmados</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono mt-0.5 block">
              {metricas.confirmados}
            </span>
          </div>
          <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* KPI 4: En Camino */}
        <div
          onClick={() => setFiltroEstado("EN_CAMINO")}
          className={`p-2.5 px-3 rounded-lg border transition cursor-pointer hover:shadow-xs flex items-center justify-between ${
            filtroEstado === "EN_CAMINO"
              ? "bg-purple-50/60 border-purple-500 ring-2 ring-purple-500/20 dark:bg-purple-950/30"
              : "bg-card text-card-foreground shadow-2xs"
          }`}
        >
          <div>
            <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400 block">En Camino</span>
            <span className="text-lg font-bold text-purple-600 dark:text-purple-400 font-mono mt-0.5 block">
              {metricas.enCamino}
            </span>
          </div>
          <div className="w-7 h-7 rounded-md bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Truck className="w-3.5 h-3.5 animate-pulse" />
          </div>
        </div>

        {/* KPI 5: Entregados */}
        <div
          onClick={() => setFiltroEstado("ENTREGADO")}
          className={`p-2.5 px-3 rounded-lg border transition cursor-pointer hover:shadow-xs flex items-center justify-between ${
            filtroEstado === "ENTREGADO"
              ? "bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 dark:bg-emerald-950/30"
              : "bg-card text-card-foreground shadow-2xs"
          }`}
        >
          <div>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 block">Entregados</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
              {metricas.entregados}
            </span>
          </div>
          <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* KPI 6: Cancelados */}
        <div
          onClick={() => setFiltroEstado("CANCELADO")}
          className={`p-2.5 px-3 rounded-lg border transition cursor-pointer hover:shadow-xs flex items-center justify-between ${
            filtroEstado === "CANCELADO"
              ? "bg-rose-50/60 border-rose-500 ring-2 ring-rose-500/20 dark:bg-rose-950/30"
              : "bg-card text-card-foreground shadow-2xs"
          }`}
        >
          <div>
            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 block">Cancelados</span>
            <span className="text-lg font-bold text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
              {metricas.cancelados}
            </span>
          </div>
          <div className="w-7 h-7 rounded-md bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 flex items-center justify-center shrink-0">
            <XCircle className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros Unificada y de Alta Densidad */}
      <div className="bg-card border rounded-lg p-2.5 shadow-2xs space-y-2">
        {/* Fila 1: Pills de Estado Compactas y Contador de Resultados */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
          {/* Pills de Estado con Contadores */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-0.5 sm:pb-0">
            {(
              [
                { id: "TODOS", label: "Todos", count: pedidos.length },
                { id: "PENDIENTE", label: "Pendientes", count: metricas.pendientes },
                { id: "CONFIRMADO", label: "Confirmados", count: metricas.confirmados },
                { id: "ASIGNADO", label: "Asignados", count: pedidos.filter((p) => p.estado === "ASIGNADO").length },
                { id: "EN_CAMINO", label: "En Camino", count: metricas.enCamino },
                { id: "ENTREGADO", label: "Entregados", count: metricas.entregados },
                { id: "CANCELADO", label: "Cancelados", count: metricas.cancelados },
              ] as const
            ).map((est) => (
              <button
                key={est.id}
                onClick={() => setFiltroEstado(est.id)}
                className={`h-6 px-2 rounded text-[11px] font-semibold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                  filtroEstado === est.id
                    ? "bg-orange-600 text-white shadow-2xs"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{est.label}</span>
                <span
                  className={`text-[10px] px-1 rounded-xs font-mono font-bold ${
                    filtroEstado === est.id
                      ? "bg-white/20 text-white"
                      : "bg-background/80 text-foreground"
                  }`}
                >
                  {est.count}
                </span>
              </button>
            ))}
          </div>

          {/* Contador de pedidos filtrados y botón limpiar */}
          <div className="flex items-center gap-2 text-muted-foreground text-[11px]">
            <span>
              Mostrando <strong className="text-foreground font-mono">{pedidosFiltrados.length}</strong> de{" "}
              <span className="font-mono">{pedidos.length}</span> pedidos
            </span>
            {hayFiltrosActivos && (
              <Button
                variant="ghost"
                size="sm"
                onClick={limpiarFiltros}
                className="h-6 px-1.5 text-[11px] text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/40 gap-1 font-semibold"
              >
                <X className="w-3 h-3" />
                <span>Limpiar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Fila 2: Selectores Rápidos y Buscador en una Sola Línea */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Filtro por Repartidor / Chofer */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground shrink-0">
            <Bike className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={filtroRepartidor}
              onChange={(e) => setFiltroRepartidor(e.target.value)}
              className="h-7 px-2 text-xs rounded-md border bg-background text-foreground font-medium outline-hidden cursor-pointer"
            >
              <option value="TODOS">Todos los Repartidores</option>
              <option value="SIN_ASIGNAR">⚠️ Sin Asignar (Pendientes)</option>
              {repartidores.map((rep) => (
                <option key={rep.publicId} value={rep.publicId}>
                  🛵 {rep.nombres} {rep.apellidos} {rep.vehiculoPlaca ? `(${rep.vehiculoPlaca})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Método de Pago */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground shrink-0">
            <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={filtroMetodo}
              onChange={(e) => setFiltroMetodo(e.target.value)}
              className="h-7 px-2 text-xs rounded-md border bg-background text-foreground font-medium outline-hidden cursor-pointer"
            >
              <option value="TODOS">Todos los Métodos</option>
              <option value="EFECTIVO">💵 Efectivo</option>
              <option value="YAPE">📱 Yape</option>
              <option value="PLIN">📱 Plin</option>
              <option value="TARJETA">💳 Tarjeta POS</option>
            </select>
          </div>

          {/* Buscador inteligente */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente, chofer, dirección, #PG..."
              className="w-full h-7 pl-8 pr-7 text-xs rounded-md border bg-background text-foreground placeholder:text-muted-foreground outline-hidden focus:ring-1 focus:ring-orange-500"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* RENDERIZADO PRINCIPAL SEGÚN EL MODO DE VISTA */}
      {cargando ? (
        <div className="py-24 text-center text-neutral-500 flex flex-col items-center justify-center gap-3 bg-card rounded-xl border shadow-xs">
          <RefreshCw className="size-8 animate-spin text-orange-500" />
          <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
            Sincronizando despacho en vivo...
          </span>
          <p className="text-xs text-neutral-400">Consultando pedidos con el servidor de la distribuidora</p>
        </div>
      ) : modoVista === "LISTA" ? (
        /* =========================================================================
           1. MODO LISTA / TABLA PROFESIONAL (rounded-xl)
        ========================================================================= */
        <div className="bg-card text-card-foreground border rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListIcon className="w-4 h-4 text-orange-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                Lista General de Pedidos ({pedidosFiltrados.length})
              </h3>
            </div>
            <span className="text-xs text-neutral-400">
              Haz clic en cualquier pedido para ver el detalle y comprobante
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-neutral-100/60 dark:bg-neutral-900/80 text-neutral-500 text-[11px] font-bold uppercase tracking-wider border-b dark:border-neutral-800">
                <tr>
                  <th className="py-3 px-4">Código / Hora</th>
                  <th className="py-3 px-4">Cliente Solicitante</th>
                  <th className="py-3 px-4">Dirección de Entrega</th>
                  <th className="py-3 px-4">Balones GLP</th>
                  <th className="py-3 px-4">Chofer Asignado</th>
                  <th className="py-3 px-4">Método Cobro</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acción Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80 dark:divide-neutral-800">
                {pedidosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-20 text-center text-neutral-500">
                      <Package className="size-10 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
                      <p className="font-bold text-neutral-700 dark:text-neutral-300 text-sm">
                        No hay pedidos para mostrar
                      </p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {busqueda || filtroEstado !== "TODOS" || filtroMetodo !== "TODOS"
                          ? "Intenta modificando los filtros de búsqueda aplicados."
                          : "Los nuevos pedidos de clientes se reflejarán automáticamente en tiempo real."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  pedidosFiltrados.map((pedido) => {
                    const tiempo = pedido.createdAt
                      ? new Date(pedido.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "--:--";

                    return (
                      <tr
                        key={pedido.publicId}
                        onClick={() => setPedidoSeleccionado(pedido)}
                        className="hover:bg-neutral-50/80 dark:hover:bg-neutral-900/50 transition cursor-pointer group"
                      >
                        {/* Código y Fecha */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1">
                              <span className="text-orange-600 font-black">#</span>
                              <span>{(pedido.publicId || "").substring(0, 8).toUpperCase()}</span>
                            </span>
                            <span className="text-[10px] text-neutral-400 mt-0.5">
                              {tiempo}
                            </span>
                          </div>
                        </td>

                        {/* Cliente */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-neutral-900 dark:text-white">
                              {pedido.nombreCliente || "Cliente General"}
                            </span>
                            {pedido.telefonoCliente && (
                              <a
                                href={`tel:${pedido.telefonoCliente}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-[11px] text-orange-600 font-semibold hover:underline mt-0.5"
                              >
                                <Phone className="w-3 h-3" />
                                {pedido.telefonoCliente}
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Dirección */}
                        <td className="py-3 px-4 max-w-xs">
                          <div className="flex items-start gap-1.5 text-xs text-neutral-600 dark:text-neutral-300">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="line-clamp-2 leading-tight">
                                {pedido.direccionEntrega || "Sin dirección"}
                              </span>
                              {pedido.referenciaDireccion && (
                                <span className="text-[10px] text-neutral-400 block line-clamp-1 italic">
                                  Ref: {pedido.referenciaDireccion}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Balones GLP */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 text-xs">
                            {(pedido.items || []).length > 0 ? (
                              pedido.items.map((it, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                                  <span className="px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 font-bold text-[10px]">
                                    {it.cantidad}x
                                  </span>
                                  <span className="truncate max-w-[150px]">{it.nombreProducto}</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-neutral-400">1x Balón Gas GLP</span>
                            )}
                          </div>
                        </td>

                        {/* Chofer asignado */}
                        <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {pedido.nombreRepartidor ? (
                            <div className="flex items-center gap-1.5 p-1.5 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 rounded-md text-xs font-semibold border border-indigo-200/80 dark:border-indigo-800">
                              <Bike className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span>
                                {pedido.nombreRepartidor} {pedido.vehiculoPlaca ? `(${pedido.vehiculoPlaca})` : ""}
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => setPedidoParaAsignar(pedido)}
                              className="px-2.5 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 rounded-md flex items-center gap-1 border border-dashed border-indigo-300 dark:border-indigo-700 transition"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Asignar chofer
                            </button>
                          )}
                        </td>

                        {/* Método de Pago */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {getBadgePago(pedido.metodoPago)}
                        </td>

                        {/* Total */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span className="text-sm font-black text-neutral-900 dark:text-white font-mono">
                            S/ {(pedido.total || 0).toFixed(2)}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {getBadgeEstado(pedido.estado)}
                        </td>

                        {/* Acciones */}
                        <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end">
                            {renderBotonesAccionTabla(pedido)}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : modoVista === "KANBAN" ? (
        /* =========================================================================
           2. MODO TABLERO KANBAN ADAPTATIVO CON DRAG & DROP Y SUMA DE PRECIOS
        ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-2.5 items-start">
          {/* Columna 1: Pendientes */}
          <div
            onDragOver={(e) => handleDragOverColumna(e, "PENDIENTE")}
            onDragLeave={(e) => handleDragLeaveColumna(e, "PENDIENTE")}
            onDrop={(e) => handleDropSobreColumna(e, "PENDIENTE")}
            className={`p-2.5 rounded-lg border space-y-2 shadow-xs min-w-0 transition-colors ${
              columnaDestinoHover === "PENDIENTE"
                ? "bg-amber-100/90 dark:bg-amber-950/60 border-amber-500 ring-2 ring-amber-500/40"
                : "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/90 dark:border-amber-900/60"
            }`}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-amber-200/80 dark:border-amber-900/60">
              <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 truncate">
                <Clock className="w-3.5 h-3.5 animate-spin text-amber-600 shrink-0" />
                <span className="truncate">1. Pendientes</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 dark:bg-amber-900/90 dark:text-amber-200 font-mono shadow-xs">
                  {totalesPorColumna.PENDIENTE.cantidad}
                </span>
              </div>
            </div>

            {/* Sumatoria de Precios de la Columna */}
            <div className="flex items-center justify-between px-1 text-[10px] text-amber-900/80 dark:text-amber-300/90 font-medium bg-amber-100/50 dark:bg-amber-950/40 rounded py-0.5 border border-amber-200/50 dark:border-amber-900/40">
              <span>Subtotal:</span>
              <span className="font-mono font-black">
                S/ {totalesPorColumna.PENDIENTE.totalMonto.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2 min-h-[90px]">
              {pedidosFiltrados.filter((p) => p.estado === "PENDIENTE").length === 0 ? (
                <div className="py-6 text-center text-[11px] text-neutral-400 border border-dashed border-neutral-300/80 dark:border-neutral-800 rounded">
                  Arrastra aquí
                </div>
              ) : (
                pedidosFiltrados
                  .filter((p) => p.estado === "PENDIENTE")
                  .map(renderTarjetaPedido)
              )}
            </div>
          </div>

          {/* Columna 2: Confirmados */}
          <div
            onDragOver={(e) => handleDragOverColumna(e, "CONFIRMADO")}
            onDragLeave={(e) => handleDragLeaveColumna(e, "CONFIRMADO")}
            onDrop={(e) => handleDropSobreColumna(e, "CONFIRMADO")}
            className={`p-2.5 rounded-lg border space-y-2 shadow-xs min-w-0 transition-colors ${
              columnaDestinoHover === "CONFIRMADO"
                ? "bg-blue-100/90 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/40"
                : "bg-blue-50/40 dark:bg-blue-950/20 border-blue-200/90 dark:border-blue-900/60"
            }`}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-blue-200/80 dark:border-blue-900/60">
              <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-blue-800 dark:text-blue-300 truncate">
                <Package className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">2. Confirmados</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-blue-200 text-blue-950 dark:bg-blue-900/90 dark:text-blue-200 font-mono shadow-xs">
                  {totalesPorColumna.CONFIRMADO.cantidad}
                </span>
              </div>
            </div>

            {/* Sumatoria de Precios de la Columna */}
            <div className="flex items-center justify-between px-1 text-[10px] text-blue-900/80 dark:text-blue-300/90 font-medium bg-blue-100/50 dark:bg-blue-950/40 rounded py-0.5 border border-blue-200/50 dark:border-blue-900/40">
              <span>Subtotal:</span>
              <span className="font-mono font-black">
                S/ {totalesPorColumna.CONFIRMADO.totalMonto.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2 min-h-[90px]">
              {pedidosFiltrados.filter((p) => p.estado === "CONFIRMADO").length === 0 ? (
                <div className="py-6 text-center text-[11px] text-neutral-400 border border-dashed border-neutral-300/80 dark:border-neutral-800 rounded">
                  Arrastra aquí
                </div>
              ) : (
                pedidosFiltrados
                  .filter((p) => p.estado === "CONFIRMADO")
                  .map(renderTarjetaPedido)
              )}
            </div>
          </div>

          {/* Columna 3: Asignados */}
          <div
            onDragOver={(e) => handleDragOverColumna(e, "ASIGNADO")}
            onDragLeave={(e) => handleDragLeaveColumna(e, "ASIGNADO")}
            onDrop={(e) => handleDropSobreColumna(e, "ASIGNADO")}
            className={`p-2.5 rounded-lg border space-y-2 shadow-xs min-w-0 transition-colors ${
              columnaDestinoHover === "ASIGNADO"
                ? "bg-indigo-100/90 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/40"
                : "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/90 dark:border-indigo-900/60"
            }`}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-indigo-200/80 dark:border-indigo-900/60">
              <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-indigo-800 dark:text-indigo-300 truncate">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">3. Asignados</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-indigo-200 text-indigo-950 dark:bg-indigo-900/90 dark:text-indigo-200 font-mono shadow-xs">
                  {totalesPorColumna.ASIGNADO.cantidad}
                </span>
              </div>
            </div>

            {/* Sumatoria de Precios de la Columna */}
            <div className="flex items-center justify-between px-1 text-[10px] text-indigo-900/80 dark:text-indigo-300/90 font-medium bg-indigo-100/50 dark:bg-indigo-950/40 rounded py-0.5 border border-indigo-200/50 dark:border-indigo-900/40">
              <span>Subtotal:</span>
              <span className="font-mono font-black">
                S/ {totalesPorColumna.ASIGNADO.totalMonto.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2 min-h-[90px]">
              {pedidosFiltrados.filter((p) => p.estado === "ASIGNADO").length === 0 ? (
                <div className="py-6 text-center text-[11px] text-neutral-400 border border-dashed border-neutral-300/80 dark:border-neutral-800 rounded">
                  Arrastra aquí
                </div>
              ) : (
                pedidosFiltrados
                  .filter((p) => p.estado === "ASIGNADO")
                  .map(renderTarjetaPedido)
              )}
            </div>
          </div>

          {/* Columna 4: En Camino */}
          <div
            onDragOver={(e) => handleDragOverColumna(e, "EN_CAMINO")}
            onDragLeave={(e) => handleDragLeaveColumna(e, "EN_CAMINO")}
            onDrop={(e) => handleDropSobreColumna(e, "EN_CAMINO")}
            className={`p-2.5 rounded-lg border space-y-2 shadow-xs min-w-0 transition-colors ${
              columnaDestinoHover === "EN_CAMINO"
                ? "bg-purple-100/90 dark:bg-purple-950/60 border-purple-500 ring-2 ring-purple-500/40"
                : "bg-purple-50/40 dark:bg-purple-950/20 border-purple-200/90 dark:border-purple-900/60"
            }`}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-purple-200/80 dark:border-purple-900/60">
              <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-purple-800 dark:text-purple-300 truncate">
                <Truck className="w-3.5 h-3.5 animate-pulse text-purple-600 shrink-0" />
                <span className="truncate">4. En Camino</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-purple-200 text-purple-950 dark:bg-purple-900/90 dark:text-purple-200 font-mono shadow-xs">
                  {totalesPorColumna.EN_CAMINO.cantidad}
                </span>
              </div>
            </div>

            {/* Sumatoria de Precios de la Columna */}
            <div className="flex items-center justify-between px-1 text-[10px] text-purple-900/80 dark:text-purple-300/90 font-medium bg-purple-100/50 dark:bg-purple-950/40 rounded py-0.5 border border-purple-200/50 dark:border-purple-900/40">
              <span>Subtotal:</span>
              <span className="font-mono font-black">
                S/ {totalesPorColumna.EN_CAMINO.totalMonto.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2 min-h-[90px]">
              {pedidosFiltrados.filter((p) => p.estado === "EN_CAMINO").length === 0 ? (
                <div className="py-6 text-center text-[11px] text-neutral-400 border border-dashed border-neutral-300/80 dark:border-neutral-800 rounded">
                  Arrastra aquí
                </div>
              ) : (
                pedidosFiltrados
                  .filter((p) => p.estado === "EN_CAMINO")
                  .map(renderTarjetaPedido)
              )}
            </div>
          </div>

          {/* Columna 5: Entregados */}
          <div
            onDragOver={(e) => handleDragOverColumna(e, "ENTREGADO")}
            onDragLeave={(e) => handleDragLeaveColumna(e, "ENTREGADO")}
            onDrop={(e) => handleDropSobreColumna(e, "ENTREGADO")}
            className={`p-2.5 rounded-lg border space-y-2 shadow-xs min-w-0 transition-colors ${
              columnaDestinoHover === "ENTREGADO"
                ? "bg-emerald-100/90 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40"
                : "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/90 dark:border-emerald-900/60"
            }`}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200/80 dark:border-emerald-900/60">
              <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 truncate">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">5. Entregados</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-emerald-200 text-emerald-950 dark:bg-emerald-900/90 dark:text-emerald-200 font-mono shadow-xs">
                  {totalesPorColumna.ENTREGADO.cantidad}
                </span>
              </div>
            </div>

            {/* Sumatoria de Precios de la Columna */}
            <div className="flex items-center justify-between px-1 text-[10px] text-emerald-900/80 dark:text-emerald-300/90 font-medium bg-emerald-100/50 dark:bg-emerald-950/40 rounded py-0.5 border border-emerald-200/50 dark:border-emerald-900/40">
              <span>Subtotal:</span>
              <span className="font-mono font-black">
                S/ {totalesPorColumna.ENTREGADO.totalMonto.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2 min-h-[90px]">
              {pedidosFiltrados.filter((p) => p.estado === "ENTREGADO").length === 0 ? (
                <div className="py-6 text-center text-[11px] text-neutral-400 border border-dashed border-neutral-300/80 dark:border-neutral-800 rounded">
                  Arrastra aquí
                </div>
              ) : (
                pedidosFiltrados
                  .filter((p) => p.estado === "ENTREGADO")
                  .map(renderTarjetaPedido)
              )}
            </div>
          </div>
        </div>
      ) : (
        /* =========================================================================
           3. MODO CUADRÍCULA DE TARJETAS (rounded-xl)
        ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pedidosFiltrados.length === 0 ? (
            <div className="col-span-full py-20 text-center text-neutral-500 border border-dashed rounded-xl bg-neutral-50/50 dark:bg-neutral-900/20">
              <Package className="size-10 mx-auto text-neutral-400 mb-2 opacity-50" />
              <p className="font-bold text-neutral-700 dark:text-neutral-300 text-sm">
                No hay pedidos registrados con los filtros seleccionados
              </p>
            </div>
          ) : (
            pedidosFiltrados.map(renderTarjetaPedido)
          )}
        </div>
      )}

      {/* MODAL ASIGNAR REPARTIDOR DE FLOTA (rounded-xl) */}
      {pedidoParaAsignar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600">
                  <Bike className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Asignar Chofer de Reparto
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono">
                    Pedido #PG-{(pedidoParaAsignar.publicId || "").substring(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPedidoParaAsignar(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Selecciona el repartidor activo y la unidad que se encargará de despachar estos balones al cliente:
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {repartidores.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-400 border border-dashed rounded-lg">
                  No hay repartidores registrados en tu flota actualmente.
                </div>
              ) : (
                repartidores.map((rep) => (
                  <div
                    key={rep.publicId}
                    onClick={() => !isPending && handleAsignarChofer(rep.publicId)}
                    className={`p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 transition flex items-center justify-between group ${
                      isPending
                        ? "opacity-50 pointer-events-none cursor-not-allowed"
                        : "hover:border-orange-500 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-md bg-orange-50 text-orange-600 dark:bg-orange-950/40 group-hover:scale-105 transition-transform">
                        <Bike className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-orange-600 transition-colors">
                          {rep.nombres} {rep.apellidos}
                        </h4>
                        <p className="text-[11px] text-neutral-400">
                          {rep.vehiculoPlaca ? `Unidad Placa: ${rep.vehiculoPlaca}` : "Moto / Furgón"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                        rep.estado === "DISPONIBLE"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                      }`}
                    >
                      {rep.estado}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t dark:border-neutral-800">
              {isPending ? (
                <span className="text-xs text-orange-600 font-semibold flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Asignando chofer...
                </span>
              ) : (
                <span />
              )}
              <button
                onClick={() => !isPending && setPedidoParaAsignar(null)}
                disabled={isPending}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-xs font-bold rounded-lg transition disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE COMPLETO DEL PEDIDO (rounded-xl) */}
      {pedidoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-xl border max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Detalle de Despacho
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono">
                    #PG-{(pedidoSeleccionado.publicId || "").substring(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPedidoSeleccionado(null)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-lg space-y-1 border dark:border-neutral-800">
                <span className="font-bold text-neutral-500 uppercase text-[10px]">Cliente Solicitante:</span>
                <p className="text-neutral-900 dark:text-white font-bold text-sm">
                  {pedidoSeleccionado.nombreCliente || "Cliente General"}
                </p>
                <p className="text-neutral-500">Teléfono: {pedidoSeleccionado.telefonoCliente || "-"}</p>
                <p className="text-neutral-500">Email: {pedidoSeleccionado.emailCliente || "-"}</p>
              </div>

              {pedidoSeleccionado.nombreRepartidor && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg space-y-1">
                  <span className="font-bold text-indigo-900 dark:text-indigo-300 uppercase text-[10px]">
                    Chofer de Reparto Asignado:
                  </span>
                  <p className="text-neutral-900 dark:text-white font-bold">
                    {pedidoSeleccionado.nombreRepartidor}
                  </p>
                  <p className="text-indigo-600 dark:text-indigo-400 font-mono">
                    Unidad / Placa: {pedidoSeleccionado.vehiculoPlaca || "Moto Furgón GLP"}
                  </p>
                </div>
              )}

              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-lg space-y-1.5 border dark:border-neutral-800">
                <span className="font-bold text-neutral-500 uppercase text-[10px]">Dirección y Coordenadas GPS:</span>
                <p className="text-neutral-900 dark:text-white font-medium">
                  {pedidoSeleccionado.direccionEntrega || "Sin dirección"}
                </p>
                {pedidoSeleccionado.referenciaDireccion && (
                  <p className="text-neutral-400 text-[11px] italic">
                    Ref: {pedidoSeleccionado.referenciaDireccion}
                  </p>
                )}
                {pedidoSeleccionado.latitud && (
                  <a
                    href={`https://maps.google.com/?q=${pedidoSeleccionado.latitud},${pedidoSeleccionado.longitud}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-orange-600 font-bold mt-1 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir en Google Maps ({pedidoSeleccionado.latitud.toFixed(4)}, {pedidoSeleccionado.longitud?.toFixed(4)})
                  </a>
                )}
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/60 rounded-lg space-y-2 border dark:border-neutral-800">
                <span className="font-bold text-neutral-500 uppercase text-[10px]">Balones del Pedido:</span>
                <div className="space-y-1.5">
                  {(pedidoSeleccionado.items || []).map((it, idx) => (
                    <div key={idx} className="flex justify-between text-neutral-800 dark:text-neutral-200">
                      <span>
                        <strong className="text-orange-600 font-bold">{it.cantidad}x</strong> {it.nombreProducto}
                      </span>
                      <span className="font-bold font-mono">S/ {(it.subtotal || 0).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 flex justify-between font-black text-sm text-neutral-900 dark:text-white">
                    <span>Total a Cobrar:</span>
                    <span className="text-orange-600 font-mono">S/ {(pedidoSeleccionado.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {pedidoSeleccionado.codigoConfirmacion && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">
                      Código de Seguridad OTP:
                    </span>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      El cliente dictará este código al chofer al recibir los balones
                    </p>
                  </div>
                  <span className="text-2xl font-mono font-black tracking-widest text-emerald-700 dark:text-emerald-300">
                    {pedidoSeleccionado.codigoConfirmacion}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t dark:border-neutral-800">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 border rounded-lg text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-neutral-600" />
                <span>Imprimir Ticket</span>
              </button>
              <button
                onClick={() => setPedidoSeleccionado(null)}
                className="px-4 py-2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-lg text-xs font-bold transition hover:opacity-90"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VALIDAR ENTREGA CON CÓDIGO OTP (rounded-xl) */}
      {pedidoParaEntregar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground rounded-xl max-w-md w-full p-5 space-y-4 shadow-xl border animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/60 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                  Validar Entrega con Código OTP
                </h3>
                <p className="text-xs text-neutral-400 font-mono">
                  #PG-{(pedidoParaEntregar.publicId || "").substring(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                Código de 6 Dígitos del Cliente:
              </label>
              <input
                type="text"
                maxLength={6}
                value={codigoConfirmacionInput}
                onChange={(e) => setCodigoConfirmacionInput(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                autoFocus
                className="w-full text-center text-3xl font-mono font-black tracking-widest py-2.5 px-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              />
              <p className="text-[11px] text-neutral-400 text-center">
                Ingresa el código que el cliente recibió en su aplicación o WhatsApp al momento de la entrega física del balón.
              </p>
            </div>

            {errorEntrega && (
              <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded-lg flex items-center gap-2 border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorEntrega}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPedidoParaEntregar(null)}
                className="flex-1 py-2 px-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-xs font-bold rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  cambiarEstado(pedidoParaEntregar.publicId, "ENTREGADO", codigoConfirmacionInput)
                }
                disabled={isPending || codigoConfirmacionInput.length < 6}
                className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg disabled:opacity-50 transition shadow-xs"
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
