"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Gift,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  X,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  Ticket,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  RefreshCw,
  ShoppingBag,
  MessageCircle,
  ChevronRight,
  Award,
  Wallet,
  Info,
  User,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CanjePedidoCliente,
  obtenerHistorialCanjes,
  STORAGE_KEY_CANJES_PEDIDOS,
  obtenerSaldoPuntosOverride,
} from "../carrito-canjes";
import { useAuthStore } from "@/store/auth-store";

// Datos de demostración iniciales
const CANJES_FALLBACK: CanjePedidoCliente[] = [
  {
    id: "CNJ-2026-084",
    codigoCupon: "VALE10GAS-4821",
    fecha: "2026-10-20 08:30",
    cliente: {
      nombre: "Juan Carlos Pérez Gómez",
      documento: "45892147",
      telefono: "987654321",
      distrito: "Los Olivos",
      direccion: "Av. Antúnez de Mayolo 1234, Los Olivos",
      email: "cliente@pidegas.pe",
    },
    premio: {
      id: "zp-01",
      nombre: "Vale de Descuento S/ 10.00 en Balón de Gas",
      categoria: "GAS_VALES",
      marca: "RappiGas",
      imagen: "/products/balon-10kg-premium.svg",
      puntos: 80,
      valorSoles: 10.0,
    },
    estado: "EN_CURSO",
    distribuidorAsignado: "Solgas Los Olivos",
    repartidor: "Carlos Mendoza (Moto Torito #04)",
    fechaEntregaEstimada: "Hoy en transcurso del día",
    observaciones: "Vale digital aplicable en compras de balones en tienda.",
  },
  {
    id: "CNJ-2026-082",
    codigoCupon: "RECORDANTIAD-3310",
    fecha: "2026-10-18 11:15",
    cliente: {
      nombre: "Juan Carlos Pérez Gómez",
      documento: "45892147",
      telefono: "987654321",
      distrito: "Los Olivos",
      direccion: "Av. Antúnez de Mayolo 1234, Los Olivos",
      email: "cliente@pidegas.pe",
    },
    premio: {
      id: "zp-16",
      nombre: "Sartén Record Antiadherente Granito 24cm Tapa Vidrio",
      categoria: "COCINA_MENAJE",
      marca: "Record",
      imagen: "/products/03.png",
      puntos: 220,
      valorSoles: 69.9,
    },
    estado: "ENTREGADO",
    distribuidorAsignado: "Almacén Central RappiGas Lima",
    repartidor: "Luis Ramos (Furgón #02)",
    fechaEntregaEstimada: "19 Oct 2026",
    fechaEntregaReal: "19 Oct 2026 15:30",
    observaciones: "Entregado a conformidad con precinto y empaque original.",
  },
];

type FiltroEstadoCanje = "TODOS" | "EN_CURSO" | "ENTREGADO" | "PENDIENTE";

export default function HistorialCanjesClientePage() {
  const { usuario } = useAuthStore();
  const [canjes, setCanjes] = useState<CanjePedidoCliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [puntosDisponibles, setPuntosDisponibles] = useState<number>(1450);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroEstadoCanje>("TODOS");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Copiado de Cupones
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  // Modal para detalle completo si se requiere
  const [canjeModal, setCanjeModal] = useState<CanjePedidoCliente | null>(null);

  const cargarHistorial = () => {
    setCargando(true);
    try {
      const override = obtenerSaldoPuntosOverride();
      if (override !== null) {
        setPuntosDisponibles(override);
      }

      const lista = obtenerHistorialCanjes();
      if (lista && lista.length > 0) {
        setCanjes(lista);
      } else {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_CANJES_PEDIDOS, JSON.stringify(CANJES_FALLBACK));
        }
        setCanjes(CANJES_FALLBACK);
      }
    } catch {
      setCanjes(CANJES_FALLBACK);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHistorial();

    const handleSync = () => cargarHistorial();
    window.addEventListener("nuevo_canje_registrado", handleSync);
    window.addEventListener("puntos_actualizados", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("nuevo_canje_registrado", handleSync);
      window.removeEventListener("puntos_actualizados", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Estadísticas calculadas
  const estadisticas = useMemo(() => {
    const total = canjes.length;
    const enCurso = canjes.filter((c) => c.estado === "EN_CURSO").length;
    const entregados = canjes.filter((c) => c.estado === "ENTREGADO").length;
    const pendientes = canjes.filter((c) => c.estado === "PENDIENTE").length;
    const totalPuntos = canjes.reduce((acc, c) => acc + (c.premio.puntos || 0), 0);

    return { total, enCurso, entregados, pendientes, totalPuntos };
  }, [canjes]);

  // Filtrado
  const canjesFiltrados = useMemo(() => {
    return canjes.filter((c) => {
      if (filtro === "EN_CURSO" && c.estado !== "EN_CURSO") return false;
      if (filtro === "ENTREGADO" && c.estado !== "ENTREGADO") return false;
      if (filtro === "PENDIENTE" && c.estado !== "PENDIENTE") return false;

      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const coincideId = c.id.toLowerCase().includes(q);
        const coincidePremio = c.premio.nombre.toLowerCase().includes(q);
        const coincideMarca = c.premio.marca.toLowerCase().includes(q);
        const coincideCupon = c.codigoCupon.toLowerCase().includes(q);
        const coincideDist = c.distribuidorAsignado.toLowerCase().includes(q);
        if (!coincideId && !coincidePremio && !coincideMarca && !coincideCupon && !coincideDist) {
          return false;
        }
      }

      return true;
    });
  }, [canjes, filtro, busqueda]);

  const handleCopiarCupon = (codigo: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(codigo);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2200);
  };

  const getPasoProgreso = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return 1;
      case "EN_CURSO":
        return 3;
      case "ENTREGADO":
        return 4;
      default:
        return 2;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "EN_CURSO":
        return {
          label: "En Reparto",
          sublabel: "En camino a tu puerta",
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
      case "PENDIENTE":
      default:
        return {
          label: "Pendiente",
          sublabel: "En preparación de almacén",
          cls: "bg-amber-50 text-amber-800 border-amber-300",
          dot: "bg-amber-500",
        };
    }
  };

  const getWhatsAppLink = (canje: CanjePedidoCliente) => {
    const msg = encodeURIComponent(
      `¡Hola! Quisiera consultar sobre el estado de mi canje de fidelidad #${canje.id} (${canje.premio.nombre}) en RappiGas.`
    );
    return `https://wa.me/51987654321?text=${msg}`;
  };

  return (
    <div className="w-full px-3 sm:px-6 py-4 space-y-4 text-xs text-slate-800">
      {/* =========================================================================
          BARRA SUPERIOR COMPACTA OFICIAL: RAPPIGAS FIDELIDAD & CANJES
      ========================================================================= */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-xl px-4 py-2.5 text-white shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xs sm:text-sm font-black tracking-tight leading-none">
                RappiGas • Historial de Canjes
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                Programa Zeta Premia
              </span>
              {estadisticas.enCurso > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white animate-pulse shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  {estadisticas.enCurso} en camino
                </span>
              )}
            </div>
            <p className="text-[10px] text-orange-100 hidden sm:block mt-0.5">
              Premios de fidelidad con entrega express a tu domicilio y vales digitales
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <span className="flex items-center gap-1 bg-black/20 border border-white/20 px-2.5 py-1 rounded-lg text-[10px] text-white">
            <span>🎁</span>
            <span>
              {estadisticas.total} {estadisticas.total === 1 ? "canje" : "canjes"}
            </span>
          </span>

          <span className="flex items-center gap-1 bg-amber-400/25 border border-amber-300/30 px-2.5 py-1 rounded-lg text-[10px] text-amber-100 font-mono font-bold">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>{puntosDisponibles.toLocaleString()} PTS</span>
          </span>

          <button
            type="button"
            onClick={cargarHistorial}
            disabled={cargando}
            className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition cursor-pointer"
            title="Actualizar listado"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/cliente/canjes"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-orange-600 hover:bg-orange-50 font-black rounded-lg text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Canjear Premio</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          TARJETAS KPI / ESTADÍSTICAS COMPACTAS (4 TARJETAS CON SOMBRA Y BORDES)
      ========================================================================= */}
      <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Canjes */}
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
              Total Canjes
            </span>
            <span className="text-2xl font-black text-[#03246b] block leading-tight">
              {estadisticas.total}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              {estadisticas.entregados} entregados • {estadisticas.enCurso} en reparto
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#03246b] flex items-center justify-center shrink-0 border border-blue-100">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </button>

        {/* KPI 2: Canjes en Curso / Reparto */}
        <button
          type="button"
          onClick={() => setFiltro("EN_CURSO")}
          className={`bg-white rounded-2xl border p-4 text-left transition shadow-xs hover:shadow-md flex items-center justify-between cursor-pointer ${
            filtro === "EN_CURSO"
              ? "border-purple-600 ring-2 ring-purple-100 bg-purple-50/20"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              En Curso
              {estadisticas.enCurso > 0 && (
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping inline-block" />
              )}
            </span>
            <span className="text-2xl font-black text-purple-700 block leading-tight">
              {estadisticas.enCurso}
            </span>
            <span className="text-[11px] text-purple-700 font-semibold block truncate">
              {estadisticas.enCurso > 0 ? "⚡ Seguimiento en vivo" : "Sin canjes activos"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Truck className="w-5 h-5" />
          </div>
        </button>

        {/* KPI 3: Canjes Entregados */}
        <button
          type="button"
          onClick={() => setFiltro("ENTREGADO")}
          className={`bg-white rounded-2xl border p-4 text-left transition shadow-xs hover:shadow-md flex items-center justify-between cursor-pointer ${
            filtro === "ENTREGADO"
              ? "border-emerald-600 ring-2 ring-emerald-100 bg-emerald-50/20"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Entregados
            </span>
            <span className="text-2xl font-black text-emerald-700 block leading-tight">
              {estadisticas.entregados}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              Completados a conformidad
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </button>

        {/* KPI 4: Puntos Canjeados */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Puntos Canjeados
            </span>
            <span className="text-2xl font-black text-amber-800 block leading-tight font-mono">
              {estadisticas.totalPuntos.toLocaleString()}
            </span>
            <span className="text-[11px] text-amber-700 font-semibold block truncate">
              Saldo: {puntosDisponibles.toLocaleString()} PTS libres
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          BARRA DE FILTROS: PILLS CON #03246b Y BUSCADOR
      ========================================================================= */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Pills de Filtrado */}
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
            onClick={() => setFiltro("EN_CURSO")}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5 ${
              filtro === "EN_CURSO"
                ? "bg-purple-600 text-white shadow-xs font-black"
                : "bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 font-bold"
            }`}
          >
            {estadisticas.enCurso > 0 && <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />}
            ⚡ En Reparto ({estadisticas.enCurso})
          </button>
          <button
            type="button"
            onClick={() => setFiltro("ENTREGADO")}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer text-xs ${
              filtro === "ENTREGADO"
                ? "bg-emerald-600 text-white shadow-xs font-black"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold"
            }`}
          >
            ✓ Entregados ({estadisticas.entregados})
          </button>
          {estadisticas.pendientes > 0 && (
            <button
              type="button"
              onClick={() => setFiltro("PENDIENTE")}
              className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer text-xs ${
                filtro === "PENDIENTE"
                  ? "bg-amber-600 text-white shadow-xs font-black"
                  : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 font-bold"
              }`}
            >
              Pendientes ({estadisticas.pendientes})
            </button>
          )}
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, premio o cupón..."
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
        <div className="col-span-3">Distribuidora & Destino</div>
        <div className="col-span-3">Premio Canjeado</div>
        <div className="col-span-1 text-center">Puntos</div>
        <div className="col-span-2">Cupón Digital</div>
        <div className="col-span-1 text-right">Detalle</div>
      </div>

      {/* =========================================================================
          LISTADO DE CANJES COMPACTO A TODO EL ANCHO (ACCORDION ESTILO PEDIDOS)
      ========================================================================= */}
      {cargando ? (
        <div className="w-full flex items-center justify-center p-12 bg-white rounded-3xl border border-slate-200 text-slate-400 gap-3 shadow-xs">
          <RefreshCw className="w-5 h-5 text-orange-600 animate-spin" />
          <span className="text-xs font-bold text-slate-600">Cargando tus canjes de fidelidad...</span>
        </div>
      ) : canjesFiltrados.length === 0 ? (
        <div className="w-full flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mx-auto border border-orange-100">
            <Gift className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[#03246b]">No se encontraron canjes</h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              {busqueda
                ? "No hay canjes que coincidan con tu búsqueda. Intenta con otro término."
                : "Aún no has canjeado premios con tus puntos. Acumula puntos con tus balones y canjea vales o productos."}
            </p>
          </div>
          <Link
            href="/cliente/canjes"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-2xl shadow-md transition mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Explorar Tienda de Premios</span>
          </Link>
        </div>
      ) : (
        <div className="w-full space-y-2.5">
          {canjesFiltrados.map((canje) => {
            const isExpanded = expandedId === canje.id;
            const paso = getPasoProgreso(canje.estado);
            const badge = getEstadoBadge(canje.estado);

            return (
              <div
                key={canje.id}
                className={`w-full bg-white rounded-2xl border transition shadow-xs overflow-hidden ${
                  canje.estado === "EN_CURSO"
                    ? "border-purple-300 ring-2 ring-purple-100 shadow-md"
                    : isExpanded
                    ? "border-orange-400 ring-1 ring-orange-100 shadow-md"
                    : "border-slate-200 hover:border-orange-300 hover:shadow-md"
                }`}
              >
                {/* FILA PRINCIPAL DISTRIBUIDA (GRID 12 COLUMNAS EN DESKTOP) */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : canje.id)}
                  className="w-full px-4 sm:px-5 py-3 grid grid-cols-1 lg:grid-cols-12 items-center gap-2 lg:gap-3 cursor-pointer hover:bg-slate-50/70 select-none text-xs transition"
                >
                  {/* Col 1-2: Código & Fecha */}
                  <div className="lg:col-span-2 flex flex-col justify-center min-w-0">
                    <div className="flex items-center justify-between lg:justify-start gap-2">
                      <span className="font-mono font-bold text-[#03246b] text-xs">
                        #{canje.id}
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
                      {canje.fecha}
                    </span>
                  </div>

                  {/* Col 3-5: Distribuidora & Dirección */}
                  <div className="lg:col-span-3 flex flex-col justify-center min-w-0">
                    <span className="font-bold text-[#03246b] text-xs truncate" title={canje.distribuidorAsignado}>
                      {canje.distribuidorAsignado}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate flex items-center gap-1" title={canje.cliente.direccion}>
                      <MapPin className="w-2.5 h-2.5 text-orange-600 shrink-0" />
                      <span className="truncate">{canje.cliente.direccion}</span>
                    </span>
                  </div>

                  {/* Col 6-8: Premio Canjeado con Foto */}
                  <div className="lg:col-span-3 flex items-center gap-2.5 text-slate-700 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center shrink-0 shadow-2xs">
                      <img
                        src={canje.premio.imagen}
                        alt={canje.premio.nombre}
                        className="w-full h-full object-contain pointer-events-none"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.2 rounded border border-orange-200">
                          {canje.premio.marca}
                        </span>
                        <span className="text-[9px] text-slate-400 truncate">
                          {canje.premio.categoria}
                        </span>
                      </div>
                      <span className="text-[11px] block truncate font-bold text-slate-800 hover:text-orange-600 transition mt-0.5">
                        {canje.premio.nombre}
                      </span>
                    </div>
                  </div>

                  {/* Col 9: Puntos */}
                  <div className="lg:col-span-1 flex lg:flex-col items-center lg:items-center justify-between lg:justify-center">
                    <span className="font-mono font-black text-amber-800 text-xs">
                      {canje.premio.puntos.toLocaleString()}
                    </span>
                    <span className="text-[9px] font-bold text-amber-700 uppercase">
                      PTS
                    </span>
                  </div>

                  {/* Col 10-11: Cupón Digital & Estado */}
                  <div className="lg:col-span-2 flex items-center justify-between lg:justify-start gap-2">
                    <div className="inline-flex items-center gap-1 bg-amber-50/80 border border-amber-300 text-amber-950 px-2 py-1 rounded-xl text-[11px] font-mono font-black shadow-2xs">
                      <Ticket className="w-3 h-3 text-orange-600 shrink-0" />
                      <span className="truncate max-w-[90px]">{canje.codigoCupon}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopiarCupon(canje.codigoCupon, canje.id, e)}
                        className="text-slate-400 hover:text-orange-600 transition p-0.5 cursor-pointer ml-0.5"
                        title="Copiar cupón"
                      >
                        {copiadoId === canje.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <span
                      className={`hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border shrink-0 ${badge.cls}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {/* Col 12: Chevron */}
                  <div className="lg:col-span-1 flex items-center justify-end gap-2">
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
                    {/* Stepper de Progreso idéntico al de /pedidos */}
                    <div className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between gap-1 overflow-x-auto py-1 text-xs">
                        <div className={`flex items-center gap-2 font-bold ${paso >= 1 ? "text-orange-600" : "text-slate-400"}`}>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                            paso >= 1 ? "bg-orange-600 text-white" : "bg-slate-200 text-slate-600"
                          }`}>
                            1
                          </span>
                          <span>1. Solicitud Recibida</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                        <div className={`flex items-center gap-2 font-bold ${paso >= 2 ? "text-[#03246b]" : "text-slate-400"}`}>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                            paso >= 2 ? "bg-[#03246b] text-white" : "bg-slate-200 text-slate-600"
                          }`}>
                            2
                          </span>
                          <span>2. Empacado en Almacén</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                        <div className={`flex items-center gap-2 font-bold ${paso >= 3 ? "text-purple-600" : "text-slate-400"}`}>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                            paso >= 3 ? "bg-purple-600 text-white animate-pulse" : "bg-slate-200 text-slate-600"
                          }`}>
                            3
                          </span>
                          <span>3. En Reparto</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                        <div className={`flex items-center gap-2 font-bold ${paso === 4 ? "text-emerald-600" : "text-slate-400"}`}>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                            paso === 4 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                          }`}>
                            4
                          </span>
                          <span>4. Entregado Conforme</span>
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
                              : paso === 3
                              ? "w-3/4 bg-purple-600 animate-pulse"
                              : "w-full bg-emerald-600"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Grid de 4 Bloques Balanceados */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {/* Bloque 1: Ubicación y Destinatario */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
                        <div>
                          <span className="font-bold text-[#03246b] flex items-center gap-1.5 text-xs mb-1.5">
                            <MapPin className="w-3.5 h-3.5 text-orange-600" /> Dirección de Entrega
                          </span>
                          <p className="text-slate-800 font-semibold text-xs leading-snug">
                            {canje.cliente.direccion}
                          </p>
                          <p className="text-slate-500 text-[11px] mt-1">
                            Destinatario: <strong className="text-slate-700">{canje.cliente.nombre}</strong>
                          </p>
                          <p className="text-slate-400 text-[10px]">
                            DNI: {canje.cliente.documento} • Tel: {canje.cliente.telefono}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Entrega Certificada RappiGas</span>
                        </div>
                      </div>

                      {/* Bloque 2: Repartidor y Soporte */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2">
                        <div>
                          <span className="font-bold text-[#03246b] flex items-center gap-1.5 text-xs mb-1.5">
                            <Truck className="w-3.5 h-3.5 text-blue-600" /> Distribuidor & Soporte
                          </span>
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900 text-xs">
                              {canje.distribuidorAsignado}
                            </p>
                            <p className="text-[11px] text-slate-600">
                              Repartidor: <strong className="text-blue-700">{canje.repartidor}</strong>
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Fecha estimada: {canje.fechaEntregaReal || canje.fechaEntregaEstimada}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                          <a
                            href={getWhatsAppLink(canje)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-xl transition cursor-pointer"
                          >
                            <MessageCircle className="w-3 h-3 text-emerald-600" />
                            Consultar WhatsApp
                          </a>
                        </div>
                      </div>

                      {/* Bloque 3: Detalle del Premio */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                        <span className="font-bold text-[#03246b] flex items-center gap-1.5 text-xs">
                          <Gift className="w-3.5 h-3.5 text-orange-600" /> Ficha del Premio
                        </span>

                        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                            <img
                              src={canje.premio.imagen}
                              alt={canje.premio.nombre}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                              }}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 text-[11px] leading-tight">
                              {canje.premio.nombre}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Valor ref: <strong className="text-slate-700">S/ {canje.premio.valorSoles.toFixed(2)}</strong>
                            </p>
                            <span className="font-mono font-black text-amber-800 text-[11px]">
                              {canje.premio.puntos.toLocaleString()} PTS
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bloque 4: Vale Digital / Cupón de Canje */}
                      <div className="bg-linear-to-br from-amber-50/70 to-orange-50/70 p-4 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between space-y-2">
                        <div>
                          <span className="font-bold text-[#03246b] flex items-center gap-1.5 text-xs">
                            <Ticket className="w-3.5 h-3.5 text-orange-600" /> Cupón Digital
                          </span>
                          <div className="font-mono font-black text-slate-900 text-sm mt-1 bg-white px-2 py-1 rounded-lg border border-amber-300 flex items-center justify-between">
                            <span>{canje.codigoCupon}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopiarCupon(canje.codigoCupon, canje.id, e)}
                              className="text-xs text-orange-600 hover:text-orange-700 font-bold cursor-pointer"
                            >
                              {copiadoId === canje.id ? "¡Copiado!" : "Copiar"}
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">
                            Muestra este código al repartidor en la entrega o en tienda.
                          </p>
                        </div>

                        {canje.observaciones && (
                          <div className="text-[10px] text-amber-900 bg-white/70 p-1.5 rounded-lg border border-amber-200/60">
                            <strong>Obs:</strong> {canje.observaciones}
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
    </div>
  );
}
