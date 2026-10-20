"use client";

import React, { useEffect, useState, useTransition, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  pedidosApi,
  PedidoDetalle,
} from "@/librerias/api/pedidos.api";
import { pedidosSocket, EventoPedidoSocket } from "@/librerias/websocket/pedidos-socket";
import {
  Flame,
  Plus,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Phone,
  Search,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  CreditCard,
  Truck,
  Clock,
  TrendingUp,
  Store,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Scale,
  Shield,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";

type FiltroEstado = "TODOS" | "ACTIVOS" | "ENTREGADOS" | "CANCELADOS";

export default function MisPedidosClientePage() {
  const [pedidos, setPedidos] = useState<PedidoDetalle[]>([]);
  const [filtro, setFiltro] = useState<FiltroEstado>("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);

  // Estado para previsualización flotante por encima de todo
  const [previewImagen, setPreviewImagen] = useState<{
    src: string;
    nombre: string;
    subtitulo?: string;
    x: number;
    y: number;
  } | null>(null);

  const mostrarPreview = (
    e: React.MouseEvent<HTMLElement>,
    src: string,
    nombre: string,
    subtitulo?: string
  ) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const anchoPopup = 200;
    const espacioDerecha = window.innerWidth - rect.right;
    let x = rect.right + 12;
    if (espacioDerecha < anchoPopup + 24) {
      x = Math.max(12, rect.left - anchoPopup - 12);
    }
    let y = Math.max(120, Math.min(window.innerHeight - 130, rect.top + rect.height / 2));
    setPreviewImagen({ src, nombre, subtitulo, x, y });
  };

  const ocultarPreview = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setPreviewImagen(null);
  };

  const cargarMisPedidos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorPermisos(null);
      const res = await pedidosApi.listarMisPedidos(0, 50);
      setPedidos(res.content || []);
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.includes("permisos")) {
        setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Cliente Hogar (CLIENTE).");
      }
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarMisPedidos();
  }, [cargarMisPedidos]);

  // Suscripción WebSocket para actualizaciones en vivo
  useEffect(() => {
    pedidosSocket.iniciar();

    const pedidosActivos = pedidos.filter(
      (p) =>
        p.estado === "PENDIENTE" ||
        p.estado === "CONFIRMADO" ||
        p.estado === "ASIGNADO" ||
        p.estado === "EN_CAMINO"
    );

    const cleanupFns = pedidosActivos.map((p) =>
      pedidosSocket.suscribirPedido(p.publicId, (evento: EventoPedidoSocket) => {
        setPedidos((prev) =>
          prev.map((item) => (item.publicId === evento.pedido.publicId ? evento.pedido : item))
        );
      })
    );

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [pedidos]);

  const handleCancelarPedido = (publicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Seguro que deseas cancelar este pedido?")) return;
    startTransition(async () => {
      try {
        const actualizado = await pedidosApi.cancelarMiPedido(publicId);
        setPedidos((prev) =>
          prev.map((p) => (p.publicId === actualizado.publicId ? actualizado : p))
        );
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Error al cancelar el pedido");
      }
    });
  };

  // Cuadros Informativos y Estadísticas Dinámicas
  const estadisticas = useMemo(() => {
    const total = pedidos.length;
    const activos = pedidos.filter((p) =>
      ["PENDIENTE", "CONFIRMADO", "ASIGNADO", "EN_CAMINO"].includes(p.estado)
    ).length;
    const entregados = pedidos.filter((p) => p.estado === "ENTREGADO").length;
    const cancelados = pedidos.filter((p) => p.estado === "CANCELADO").length;

    // Gasto total (solo pedidos no cancelados)
    const gasto = pedidos
      .filter((p) => p.estado !== "CANCELADO")
      .reduce((acc, p) => acc + Number(p.total || 0), 0);

    // Total de balones solicitados
    const balones = pedidos
      .filter((p) => p.estado !== "CANCELADO")
      .reduce((acc, p) => acc + (p.items?.reduce((sum, it) => sum + (it.cantidad || 0), 0) || 0), 0);

    // Distribuidora más frecuente
    const conteoEmpresas: { [key: string]: { nombre: string; count: number } } = {};
    pedidos.forEach((p) => {
      if (p.nombreEmpresa && p.estado !== "CANCELADO") {
        if (!conteoEmpresas[p.nombreEmpresa]) {
          conteoEmpresas[p.nombreEmpresa] = { nombre: p.nombreEmpresa, count: 0 };
        }
        conteoEmpresas[p.nombreEmpresa].count += 1;
      }
    });

    const empresasOrdenadas = Object.values(conteoEmpresas).sort((a, b) => b.count - a.count);
    const favorita = empresasOrdenadas.length > 0 ? empresasOrdenadas[0] : null;

    return {
      total,
      activos,
      entregados,
      cancelados,
      gasto,
      balones,
      favorita: favorita ? favorita.nombre : "Sin registrar",
      favoritaConteo: favorita ? favorita.count : 0,
    };
  }, [pedidos]);

  // Función para resolver la imagen oficial del producto o balón
  const obtenerImagenItem = (item: {
    imagenUrl?: string;
    tipoGas?: string;
    tipoValvula?: string;
    nombreProducto?: string;
  }): string => {
    if (item.imagenUrl && item.imagenUrl.trim() !== "") {
      const url = item.imagenUrl.trim();
      if (url.startsWith("/api/v1/archivos/ver/")) {
        return `http://localhost:8080${url}`;
      }
      return url;
    }
    const nombre = (item.nombreProducto || "").toLowerCase();
    const tipoGas = (item.tipoGas || "").toUpperCase();
    const tipoValvula = (item.tipoValvula || "").toUpperCase();

    if (tipoGas === "GLP_45KG" || nombre.includes("45kg") || nombre.includes("45 kg")) {
      return "/products/balon-45kg-industrial.svg";
    }
    if (tipoGas === "GLP_15KG" || nombre.includes("15kg") || nombre.includes("15 kg")) {
      return "/products/balon-15kg-premium.svg";
    }
    if (tipoValvula === "ROSCA" || nombre.includes("rosca")) {
      return "/products/balon-10kg-rosca.svg";
    }
    if (
      tipoGas === "VALVULA_ACCESORIO" ||
      nombre.includes("regulador") ||
      nombre.includes("valvula") ||
      nombre.includes("válvula")
    ) {
      return "/products/regulador-manometro.svg";
    }
    return "/products/balon-10kg-premium.svg";
  };

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((p) => {
      if (filtro === "ACTIVOS") {
        const activos = ["PENDIENTE", "CONFIRMADO", "ASIGNADO", "EN_CAMINO"];
        if (!activos.includes(p.estado)) return false;
      } else if (filtro === "ENTREGADOS") {
        if (p.estado !== "ENTREGADO") return false;
      } else if (filtro === "CANCELADOS") {
        if (p.estado !== "CANCELADO") return false;
      }

      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const coincideCod = p.publicId.toLowerCase().includes(q);
        const coincideEmp = p.nombreEmpresa?.toLowerCase().includes(q);
        const coincideProd = p.items?.some((it) => it.nombreProducto?.toLowerCase().includes(q));
        const coincidePin = p.codigoConfirmacion?.includes(q);
        if (!coincideCod && !coincideEmp && !coincideProd && !coincidePin) return false;
      }

      return true;
    });
  }, [pedidos, filtro, busqueda]);

  const getPasoProgreso = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return 1;
      case "CONFIRMADO":
        return 2;
      case "ASIGNADO":
        return 2.5;
      case "EN_CAMINO":
        return 3;
      case "ENTREGADO":
        return 4;
      default:
        return 0;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return {
          label: "Pendiente",
          sublabel: "Esperando distribuidora",
          cls: "bg-amber-50 text-amber-800 border-amber-300",
          dot: "bg-amber-500",
        };
      case "CONFIRMADO":
        return {
          label: "Confirmado",
          sublabel: "Pedido aceptado",
          cls: "bg-blue-50 text-blue-800 border-blue-300",
          dot: "bg-blue-500",
        };
      case "ASIGNADO":
        return {
          label: "Asignado",
          sublabel: "Repartidor asignado",
          cls: "bg-indigo-50 text-indigo-800 border-indigo-300",
          dot: "bg-indigo-500",
        };
      case "EN_CAMINO":
        return {
          label: "En Camino",
          sublabel: "En reparto a tu puerta",
          cls: "bg-purple-100 text-purple-900 border-purple-300 font-extrabold shadow-2xs",
          dot: "bg-purple-600 animate-ping",
        };
      case "ENTREGADO":
        return {
          label: "Entregado",
          sublabel: "Entregado con éxito",
          cls: "bg-emerald-50 text-emerald-800 border-emerald-300",
          dot: "bg-emerald-500",
        };
      case "CANCELADO":
      default:
        return {
          label: "Cancelado",
          sublabel: "Pedido anulado",
          cls: "bg-slate-100 text-slate-600 border-slate-300",
          dot: "bg-slate-400",
        };
    }
  };

  const getEnlaceWhatsApp = (telefono: string, codigoPedido: string) => {
    const tel = telefono.replace(/\D/g, "");
    const numeroFinal = tel.length === 9 ? `51${tel}` : tel;
    const msg = encodeURIComponent(
      `¡Hola! Quisiera consultar sobre el estado de mi pedido de gas #${codigoPedido.substring(0, 8).toUpperCase()} en RappiGas.`
    );
    return `https://wa.me/${numeroFinal}?text=${msg}`;
  };

  return (
    <div className="w-full px-3 sm:px-6 py-4 space-y-4 text-xs text-slate-800">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="CLIENTE"
          mensaje={errorPermisos}
          onExito={cargarMisPedidos}
        />
      )}

      {/* =========================================================================
          BARRA SUPERIOR COMPACTA OFICIAL: RAPPIGAS TIENDA OFICIAL
      ========================================================================= */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-xl px-4 py-2.5 text-white shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xs sm:text-sm font-black tracking-tight leading-none">
                RappiGas • Tienda Oficial
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                Osinergmin Garantizado
              </span>
              {estadisticas.activos > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  {estadisticas.activos} en camino
                </span>
              )}
            </div>
            <p className="text-[10px] text-orange-100 hidden sm:block mt-0.5">
              Balones certificados con entrega express a tu puerta
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span className="flex items-center gap-1 bg-black/20 border border-white/20 px-2.5 py-1 rounded-lg text-[10px] text-white">
            <span>📦</span>
            <span>{estadisticas.total} {estadisticas.total === 1 ? "pedido" : "pedidos"}</span>
          </span>

          <button
            type="button"
            onClick={cargarMisPedidos}
            disabled={cargando}
            className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition cursor-pointer"
            title="Actualizar listado"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/cliente/tienda"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-orange-600 hover:bg-orange-50 font-black rounded-lg text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pedir Balón</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          TARJETAS KPI / ESTADÍSTICAS ESTILO PEDIR (4 TARJETAS CON SOMBRA Y BORDES)
      ========================================================================= */}
      <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Pedidos */}
        <button
          type="button"
          onClick={() => setFiltro("TODOS")}
          className={`bg-white rounded-2xl border p-4 text-left transition shadow-xs hover:shadow-md flex items-center justify-between cursor-pointer ${
            filtro === "TODOS"
              ? "border-[#03246b] ring-2 ring-blue-100 bg-blue-50/20"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Pedidos
            </span>
            <span className="text-2xl font-black text-[#03246b] block leading-tight">
              {estadisticas.total}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              {estadisticas.entregados} entregados • {estadisticas.cancelados} cancelados
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#03246b] flex items-center justify-center shrink-0 border border-blue-100">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </button>

        {/* KPI 2: Pedidos Activos / En Curso */}
        <button
          type="button"
          onClick={() => setFiltro("ACTIVOS")}
          className={`bg-white rounded-2xl border p-4 text-left transition shadow-xs hover:shadow-md flex items-center justify-between cursor-pointer ${
            filtro === "ACTIVOS"
              ? "border-purple-600 ring-2 ring-purple-100 bg-purple-50/20"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              En Curso
              {estadisticas.activos > 0 && (
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping inline-block" />
              )}
            </span>
            <span className="text-2xl font-black text-purple-700 block leading-tight">
              {estadisticas.activos}
            </span>
            <span className="text-[11px] text-purple-700 font-semibold block truncate">
              {estadisticas.activos > 0 ? "⚡ Seguimiento en vivo" : "Sin pedidos activos"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Truck className="w-5 h-5" />
          </div>
        </button>

        {/* KPI 3: Inversión en Gas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Inversión en Gas
            </span>
            <span className="text-2xl font-black text-emerald-700 block leading-tight">
              S/ {estadisticas.gasto.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              {estadisticas.balones} {estadisticas.balones === 1 ? "balón adquirido" : "balones adquiridos"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Distribuidora Habitual */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Distribuidora Habitual
            </span>
            <span className="text-xs font-bold text-[#03246b] block truncate" title={estadisticas.favorita}>
              {estadisticas.favorita}
            </span>
            <span className="text-[11px] text-orange-600 font-semibold block truncate">
              {estadisticas.favoritaConteo > 0
                ? `${estadisticas.favoritaConteo} compras completadas`
                : "Aún sin compras"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
            <Store className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          BARRA DE FILTROS ESTILO PEDIR: PILLS CON #03246b Y BUSCADOR
      ========================================================================= */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Pills de Filtrado estilo /pedir */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs font-bold scrollbar-none">
          <button
            type="button"
            onClick={() => setFiltro("TODOS")}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer text-xs ${
              filtro === "TODOS"
                ? "bg-[#03246b] text-white shadow-xs font-black"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold"
            }`}
          >
            Todos ({estadisticas.total})
          </button>
          <button
            type="button"
            onClick={() => setFiltro("ACTIVOS")}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5 ${
              filtro === "ACTIVOS"
                ? "bg-purple-600 text-white shadow-xs font-black"
                : "bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 font-bold"
            }`}
          >
            {estadisticas.activos > 0 && <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />}
            ⚡ En Curso ({estadisticas.activos})
          </button>
          <button
            type="button"
            onClick={() => setFiltro("ENTREGADOS")}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer text-xs ${
              filtro === "ENTREGADOS"
                ? "bg-emerald-600 text-white shadow-xs font-black"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold"
            }`}
          >
            ✓ Entregados ({estadisticas.entregados})
          </button>
          {estadisticas.cancelados > 0 && (
            <button
              type="button"
              onClick={() => setFiltro("CANCELADOS")}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer text-xs ${
                filtro === "CANCELADOS"
                  ? "bg-slate-700 text-white shadow-xs font-black"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold"
              }`}
            >
              Cancelados ({estadisticas.cancelados})
            </button>
          )}
        </div>

        {/* Buscador de Pedidos */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, distribuidora o balón..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500 transition shadow-2xs font-medium"
          />
        </div>
      </div>

      {/* =========================================================================
          CABECERA DE TABLA DISTRIBUIDA (Desktop)
      ========================================================================= */}
      <div className="hidden lg:grid grid-cols-12 gap-3 px-5 py-2.5 text-[10px] font-black text-[#03246b] uppercase tracking-wider bg-slate-100/80 rounded-xl border border-slate-200/80">
        <div className="col-span-2">Código & Fecha</div>
        <div className="col-span-2">Distribuidora & Destino</div>
        <div className="col-span-2">Balones Solicitados</div>
        <div className="col-span-1 text-right">Total</div>
        <div className="col-span-3">Estado del Pedido</div>
        <div className="col-span-1 text-center">Código PIN</div>
        <div className="col-span-1 text-right">Detalles</div>
      </div>

      {/* =========================================================================
          LISTADO DE PEDIDOS COMPACTO A TODO EL ANCHO
      ========================================================================= */}
      {cargando ? (
        <div className="w-full flex items-center justify-center p-12 bg-white rounded-3xl border border-slate-200 text-slate-400 gap-3 shadow-xs">
          <RefreshCw className="w-5 h-5 text-orange-600 animate-spin" />
          <span className="text-xs font-bold text-slate-600">Cargando tus pedidos de gas...</span>
        </div>
      ) : pedidosFiltrados.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mx-auto border border-orange-100">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[#03246b]">No se encontraron pedidos</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              {busqueda
                ? "No hay pedidos que coincidan con tu búsqueda. Intenta con otro término."
                : "Aún no tienes pedidos registrados en esta categoría. Puedes pedir tu balón de gas con balanza digital a domicilio."}
            </p>
          </div>
          <Link
            href="/cliente/tienda"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-2xl shadow-md transition mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Explorar Tienda y Pedir</span>
          </Link>
        </div>
      ) : (
        <div className="w-full space-y-2.5">
          {pedidosFiltrados.map((pedido) => {
            const isExpanded = expandedId === pedido.publicId;
            const paso = getPasoProgreso(pedido.estado);
            const esCancelado = pedido.estado === "CANCELADO";
            const badge = getEstadoBadge(pedido.estado);

            const productosResumen = pedido.items
              ? pedido.items.map((i) => `${i.cantidad}x ${i.nombreProducto}`).join(", ")
              : "Sin productos";

            return (
              <div
                key={pedido.publicId}
                className={`w-full bg-white rounded-2xl border transition shadow-xs overflow-hidden ${
                  pedido.estado === "EN_CAMINO"
                    ? "border-purple-300 ring-2 ring-purple-100 shadow-md"
                    : isExpanded
                    ? "border-orange-400 ring-1 ring-orange-100 shadow-md"
                    : "border-slate-200 hover:border-orange-300 hover:shadow-md"
                }`}
              >
                {/* FILA PRINCIPAL DISTRIBUIDA (GRID 12 COLUMNAS EN DESKTOP) */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : pedido.publicId)}
                  className="w-full px-4 sm:px-5 py-3 grid grid-cols-1 lg:grid-cols-12 items-center gap-2 lg:gap-3 cursor-pointer hover:bg-slate-50/70 select-none text-xs transition"
                >
                  {/* Col 1-2: Código & Fecha */}
                  <div className="lg:col-span-2 flex flex-col justify-center min-w-0">
                    <div className="flex items-center justify-between lg:justify-start gap-2">
                      <span className="font-mono font-bold text-[#03246b] text-xs">
                        #PG-{pedido.publicId.substring(0, 8).toUpperCase()}
                      </span>
                      {/* Badge móvil visible solo en celulares */}
                      <span
                        className={`lg:hidden inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${badge.cls}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      {new Date(pedido.createdAt).toLocaleDateString([], { day: "2-digit", month: "2-digit" })}{" "}
                      {new Date(pedido.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  {/* Col 3-4: Distribuidora & Dirección */}
                  <div className="lg:col-span-2 flex flex-col justify-center min-w-0">
                    <span className="font-bold text-[#03246b] text-xs truncate" title={pedido.nombreEmpresa}>
                      {pedido.nombreEmpresa}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate flex items-center gap-1" title={pedido.direccionEntrega}>
                      <MapPin className="w-2.5 h-2.5 text-orange-600 shrink-0" />
                      <span className="truncate">{pedido.direccionEntrega}</span>
                    </span>
                  </div>

                  {/* Col 5-6: Balones Solicitados con Foto */}
                  <div className="lg:col-span-2 flex items-center gap-2 text-slate-700 min-w-0">
                    {pedido.items && pedido.items.length > 0 && (
                      <div
                        onMouseEnter={(e) =>
                          mostrarPreview(
                            e,
                            obtenerImagenItem(pedido.items[0]),
                            pedido.items[0].nombreProducto,
                            `${pedido.items[0].cantidad} ${pedido.items[0].cantidad === 1 ? "unidad" : "unidades"}`
                          )
                        }
                        onMouseLeave={ocultarPreview}
                        className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center shrink-0 shadow-2xs hover:border-orange-500 hover:scale-110 transition cursor-pointer"
                      >
                        <img
                          src={obtenerImagenItem(pedido.items[0])}
                          alt={pedido.items[0].nombreProducto}
                          className="w-full h-full object-contain pointer-events-none"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                          }}
                        />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <span
                        className="text-[11px] block truncate font-bold text-slate-800 hover:text-orange-600 transition"
                        title={productosResumen}
                      >
                        {productosResumen}
                      </span>
                      {pedido.items && pedido.items.length > 1 && (
                        <span className="text-[9px] font-bold text-orange-600 block">
                          +{pedido.items.length - 1} otro producto
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Col 7: Total & Pago */}
                  <div className="lg:col-span-1 flex lg:flex-col items-center lg:items-end justify-between lg:justify-center">
                    <span className="font-black text-slate-900 text-xs">
                      S/ {Number(pedido.total).toFixed(2)}
                    </span>
                    <span className="text-[9px] font-bold text-orange-600 uppercase">
                      {pedido.metodoPago}
                    </span>
                  </div>

                  {/* Col 8-10: COLUMNA DE ESTADO DEL PEDIDO (NUEVA COLUMNA DESTACADA) */}
                  <div className="lg:col-span-3 hidden lg:flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border shrink-0 ${badge.cls}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium truncate" title={badge.sublabel}>
                      {badge.sublabel}
                    </span>
                  </div>

                  {/* Col 11: PIN de Entrega */}
                  <div className="lg:col-span-1 flex items-center justify-center">
                    {!esCancelado && pedido.codigoConfirmacion ? (
                      <div
                        className="inline-flex items-center gap-1 bg-amber-50 border border-amber-300 text-amber-900 px-2 py-0.5 rounded-lg text-[11px] font-mono font-black shadow-2xs"
                        title="Dictar al repartidor en la puerta"
                      >
                        <ShieldCheck className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{pedido.codigoConfirmacion}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-xs">-</span>
                    )}
                  </div>

                  {/* Col 12: Acciones & Chevron */}
                  <div className="lg:col-span-1 flex items-center justify-end gap-2">
                    {pedido.estado === "PENDIENTE" && (
                      <button
                        type="button"
                        onClick={(e) => handleCancelarPedido(pedido.publicId, e)}
                        disabled={isPending}
                        className="text-[10px] text-red-600 hover:text-red-800 font-bold px-2 py-0.5 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                    )}

                    <div className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-orange-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                {/* =====================================================================
                    PANEL EXPANDIBLE ESTILO PEDIR (PASO A PASO Y 4 BLOQUES)
                ===================================================================== */}
                {isExpanded && (
                  <div className="w-full px-4 sm:px-6 py-4 bg-slate-50/80 border-t border-slate-200/80 text-xs space-y-4 animate-in fade-in duration-150">
                    {/* Stepper de Progreso idéntico al de /pedir */}
                    {!esCancelado && (
                      <div className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                        <div className="flex items-center justify-between gap-1 overflow-x-auto py-1 text-xs">
                          <div className={`flex items-center gap-2 font-bold ${paso >= 1 ? "text-orange-600" : "text-slate-400"}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                              paso >= 1 ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-600"
                            }`}>
                              1
                            </span>
                            <span>1. Recibido</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                          <div className={`flex items-center gap-2 font-bold ${paso >= 2 ? "text-[#03246b]" : "text-slate-400"}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                              paso >= 2 ? "bg-[#03246b] text-white" : "bg-slate-200 text-slate-600"
                            }`}>
                              2
                            </span>
                            <span>2. {pedido.estado === "ASIGNADO" ? "Repartidor Asignado" : "Confirmado"}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                          <div className={`flex items-center gap-2 font-bold ${paso >= 3 ? "text-purple-600" : "text-slate-400"}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                              paso >= 3 ? "bg-purple-600 text-white animate-pulse" : "bg-slate-200 text-slate-600"
                            }`}>
                              3
                            </span>
                            <span>3. En Camino</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                          <div className={`flex items-center gap-2 font-bold ${paso === 4 ? "text-emerald-600" : "text-slate-400"}`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                              paso === 4 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                            }`}>
                              4
                            </span>
                            <span>4. Entregado</span>
                          </div>
                        </div>

                        {/* Barra de Progreso lineal */}
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2.5">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              paso === 1
                                ? "w-1/4 bg-amber-500"
                                : paso === 2
                                ? "w-2/4 bg-[#03246b]"
                                : paso === 2.5
                                ? "w-3/5 bg-indigo-600"
                                : paso === 3
                                ? "w-3/4 bg-purple-600 animate-pulse"
                                : "w-full bg-emerald-600"
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Grid de 4 Bloques Balanceados */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {/* Bloque 1: Ubicación de Entrega */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
                        <div>
                          <span className="font-bold text-[#03246b] flex items-center gap-1.5 text-xs mb-1.5">
                            <MapPin className="w-3.5 h-3.5 text-orange-600" /> Dirección de Entrega
                          </span>
                          <p className="text-slate-800 font-semibold text-xs leading-snug">
                            {pedido.direccionEntrega}
                          </p>
                          {pedido.referenciaDireccion && (
                            <p className="text-slate-500 text-[11px] mt-1">
                              Ref: {pedido.referenciaDireccion}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center gap-1">
                          <Scale className="w-3 h-3 text-orange-600" />
                          <span>Entrega con Balanza Digital Contrastada</span>
                        </div>
                      </div>

                      {/* Bloque 2: Repartidor Asignado */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
                        <div>
                          <span className="font-bold text-[#03246b] flex items-center gap-1.5 text-xs mb-1.5">
                            <Truck className="w-3.5 h-3.5 text-blue-600" /> Repartidor y Soporte
                          </span>
                          {pedido.nombreRepartidor || pedido.estado === "EN_CAMINO" ? (
                            <div className="space-y-1.5">
                              <p className="font-bold text-slate-900 text-xs">
                                {pedido.nombreRepartidor || "Repartidor en ruta express"}
                              </p>
                              {pedido.vehiculoPlaca && (
                                <p className="text-[11px] text-slate-500 font-mono">
                                  Placa: <strong className="text-slate-800">{pedido.vehiculoPlaca}</strong>
                                </p>
                              )}
                              <div className="flex items-center gap-2 flex-wrap pt-1">
                                {pedido.telefonoRepartidor && (
                                  <a
                                    href={`tel:${pedido.telefonoRepartidor}`}
                                    className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-bold bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-xl transition"
                                  >
                                    <Phone className="w-3 h-3" />
                                    Llamar
                                  </a>
                                )}
                                <a
                                  href={getEnlaceWhatsApp(
                                    pedido.telefonoRepartidor || pedido.telefonoEmpresa || "922767224",
                                    pedido.publicId
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl transition"
                                >
                                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                                  WhatsApp
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-slate-400 text-xs italic">
                                Pendiente de asignación por {pedido.nombreEmpresa}
                              </p>
                              <a
                                href={getEnlaceWhatsApp(pedido.telefonoEmpresa || "922767224", pedido.publicId)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl transition"
                              >
                                <MessageCircle className="w-3 h-3 text-emerald-600" />
                                Consultar Distribuidora
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bloque 3: Desglose de Productos con Fotos */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                        <span className="font-bold text-[#03246b] flex items-center gap-1.5 text-xs">
                          <ShoppingBag className="w-3.5 h-3.5 text-orange-600" /> Balones Comprados
                        </span>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {pedido.items.map((it, idx) => {
                            const imgSrc = obtenerImagenItem(it);
                            return (
                              <div
                                key={idx}
                                className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-orange-50/30 transition"
                              >
                                {/* Foto del balón miniatura con popup de zoom */}
                                <div
                                  onMouseEnter={(e) =>
                                    mostrarPreview(
                                      e,
                                      imgSrc,
                                      it.nombreProducto,
                                      `${it.cantidad} ${it.cantidad === 1 ? "balón" : "balones"} • S/ ${Number(it.precioUnitario).toFixed(2)} c/u`
                                    )
                                  }
                                  onMouseLeave={ocultarPreview}
                                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs hover:border-orange-500 hover:scale-110 transition cursor-pointer"
                                >
                                  <img
                                    src={imgSrc}
                                    alt={it.nombreProducto}
                                    className="w-full h-full object-contain pointer-events-none"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src =
                                        "/products/balon-10kg-premium.svg";
                                    }}
                                  />
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-slate-900 text-[11px] truncate leading-tight">
                                    {it.nombreProducto}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                    <span className="font-bold text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded-md border border-orange-200">
                                      {it.cantidad} {it.cantidad === 1 ? "balón" : "balones"}
                                    </span>{" "}
                                    • S/ {Number(it.precioUnitario).toFixed(2)}
                                  </p>
                                </div>

                                <span className="font-black text-slate-900 text-xs shrink-0 ml-1">
                                  S/ {Number(it.subtotal).toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Bloque 4: Pago & PIN de Entrega */}
                      <div className="bg-linear-to-br from-amber-50/70 to-orange-50/70 p-4 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#03246b] flex items-center gap-1.5 text-xs">
                            <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Método de Pago
                          </span>
                          <span
                            className={`font-bold text-[10px] ${
                              pedido.estadoPago === "PAGADO" ? "text-emerald-700" : "text-amber-700"
                            }`}
                          >
                            ● {pedido.metodoPago} ({pedido.estadoPago})
                          </span>
                        </div>

                        {!esCancelado && pedido.codigoConfirmacion && (
                          <div className="bg-white/90 border border-amber-300 rounded-xl p-2.5 text-center shadow-xs">
                            <span className="text-[9px] uppercase tracking-wider font-black text-amber-800 block">
                              Código para recibir balón
                            </span>
                            <span className="text-xl font-mono font-black text-amber-900 tracking-widest my-0.5 block">
                              {pedido.codigoConfirmacion}
                            </span>
                            <span className="text-[9px] text-amber-700 block font-medium">
                              Dictar al repartidor al recibir tu balón
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          PREVIEW FLOTANTE POR ENCIMA DE TODO EL VIEWPORT (Z-INDEX 99999)
      ========================================================================= */}
      {previewImagen && (
        <div
          style={{
            left: `${previewImagen.x}px`,
            top: `${previewImagen.y}px`,
            transform: "translateY(-50%)",
          }}
          className="fixed z-[99999] pointer-events-none bg-white p-4 rounded-3xl shadow-2xl border-2 border-orange-500 w-52 flex flex-col items-center animate-in fade-in zoom-in-95 duration-100 drop-shadow-2xl"
        >
          <div className="w-36 h-36 bg-slate-50 rounded-2xl p-2 flex items-center justify-center border border-slate-100 mb-2 shadow-inner">
            <img
              src={previewImagen.src}
              alt={previewImagen.nombre}
              className="w-full h-full object-contain filter drop-shadow-lg"
            />
          </div>
          <span className="text-xs font-black text-[#03246b] text-center leading-snug">
            {previewImagen.nombre}
          </span>
          {previewImagen.subtitulo && (
            <span className="text-[10px] text-orange-700 font-bold bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 mt-1.5 shadow-2xs">
              {previewImagen.subtitulo}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
