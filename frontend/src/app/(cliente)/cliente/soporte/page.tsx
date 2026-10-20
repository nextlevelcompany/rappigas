"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  soporteClienteApi,
  archivosApi,
  TicketDetalle,
  PrioridadTicket,
  CrearTicketPayload,
} from "@/librerias/api/soporte.api";
import { pedidosApi, PedidoDetalle } from "@/librerias/api/pedidos.api";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import {
  LifeBuoy,
  Plus,
  Flame,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Paperclip,
  Send,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  X,
  FileText,
  Phone,
  MessageCircle,
  Shield,
  HelpCircle,
  Truck,
  Sparkles,
} from "lucide-react";

type FiltroTicket = "TODOS" | "ABIERTOS" | "EN_PROCESO" | "RESUELTOS";

export default function ClienteSoportePage() {
  const [tickets, setTickets] = useState<TicketDetalle[]>([]);
  const [pedidos, setPedidos] = useState<PedidoDetalle[]>([]);
  const [filtro, setFiltro] = useState<FiltroTicket>("TODOS");
  const [cargando, setCargando] = useState(true);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);

  // Modales
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [ticketActivo, setTicketActivo] = useState<TicketDetalle | null>(null);

  // Formulario Nuevo Ticket
  const [nuevoAsunto, setNuevoAsunto] = useState("");
  const [nuevoPrioridad, setNuevoPrioridad] = useState<PrioridadTicket>("MEDIA");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<string>("");
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [adjuntoUrl, setAdjuntoUrl] = useState<string>("");
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Respuesta en hilo activo
  const [mensajeRespuesta, setMensajeRespuesta] = useState("");
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorPermisos(null);
    try {
      const [ticketsData, pedidosData] = await Promise.all([
        soporteClienteApi.listarMisTickets().catch((err: any) => {
          if (err?.status === 403 || err?.message?.includes("permisos")) {
            setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Cliente Hogar (CLIENTE).");
          }
          return [];
        }),
        pedidosApi.listarMisPedidos(0, 30).catch(() => ({ content: [] })),
      ]);
      setTickets(ticketsData);
      setPedidos(pedidosData.content || []);
    } catch {
      // Ignorar errores no controlados
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleSubirArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSubiendoArchivo(true);
      const res = await archivosApi.subirArchivo(file);
      setAdjuntoUrl(res.url);
    } catch {
      alert("Error al subir archivo de evidencia.");
    } finally {
      setSubiendoArchivo(false);
    }
  };

  const handleCrearTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoAsunto.trim() || !nuevoMensaje.trim()) return;

    try {
      setEnviando(true);
      const payload: CrearTicketPayload = {
        asunto: nuevoAsunto.trim(),
        prioridad: nuevoPrioridad,
        pedidoPublicId: pedidoSeleccionado || undefined,
        mensajeInicial: nuevoMensaje.trim(),
        adjuntoUrl: adjuntoUrl || undefined,
      };

      const creado = await soporteClienteApi.crearTicket(payload);
      setTickets((prev) => [creado, ...prev]);
      setMostrarModalNuevo(false);
      setNuevoAsunto("");
      setNuevoMensaje("");
      setAdjuntoUrl("");
      setPedidoSeleccionado("");
      setTicketActivo(creado);
    } catch (err: any) {
      alert(err.message || "Error al crear ticket de soporte");
    } finally {
      setEnviando(false);
    }
  };

  const handleEnviarRespuesta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketActivo || !mensajeRespuesta.trim()) return;

    try {
      setEnviandoRespuesta(true);
      const actualizado = await soporteClienteApi.responderTicket(
        ticketActivo.publicId,
        mensajeRespuesta.trim()
      );
      setTicketActivo(actualizado);
      setTickets((prev) =>
        prev.map((t) => (t.publicId === actualizado.publicId ? actualizado : t))
      );
      setMensajeRespuesta("");
    } catch (err: any) {
      alert(err.message || "Error al enviar mensaje");
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  const abrirDetalle = async (ticket: TicketDetalle) => {
    try {
      const completo = await soporteClienteApi.obtenerTicket(ticket.publicId);
      setTicketActivo(completo);
    } catch {
      setTicketActivo(ticket);
    }
  };

  // Estadísticas de Soporte
  const stats = useMemo(() => {
    const total = tickets.length;
    const abiertos = tickets.filter(
      (t) => t.estado === "ABIERTO" || t.estado === "EN_PROCESO"
    ).length;
    const resueltos = tickets.filter((t) => t.estado === "RESUELTO").length;
    const urgentes = tickets.filter(
      (t) => t.prioridad === "URGENTE" && t.estado !== "RESUELTO"
    ).length;

    return { total, abiertos, resueltos, urgentes };
  }, [tickets]);

  // Filtrado de Tickets
  const ticketsFiltrados = useMemo(() => {
    return tickets.filter((t) => {
      if (filtro === "ABIERTOS") return t.estado === "ABIERTO";
      if (filtro === "EN_PROCESO") return t.estado === "EN_PROCESO";
      if (filtro === "RESUELTOS") return t.estado === "RESUELTO";
      return true;
    });
  }, [tickets, filtro]);

  const getBadgeEstado = (estado: string) => {
    switch (estado) {
      case "ABIERTO":
        return {
          label: "Abierto",
          cls: "bg-amber-50 text-amber-800 border-amber-300",
          dot: "bg-amber-500",
        };
      case "EN_PROCESO":
        return {
          label: "En Proceso",
          cls: "bg-purple-100 text-purple-900 border-purple-300 font-bold",
          dot: "bg-purple-600 animate-pulse",
        };
      case "RESUELTO":
        return {
          label: "Resuelto",
          cls: "bg-emerald-50 text-emerald-800 border-emerald-300",
          dot: "bg-emerald-500",
        };
      default:
        return {
          label: "Cerrado",
          cls: "bg-slate-100 text-slate-600 border-slate-300",
          dot: "bg-slate-400",
        };
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 py-4 space-y-4 text-xs text-slate-800">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="CLIENTE"
          mensaje={errorPermisos}
          onExito={cargarDatos}
        />
      )}

      {/* =========================================================================
          CABECERA OFICIAL RAPPIGAS • CENTRO DE SOPORTE Y RECLAMOS
      ========================================================================= */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-xl px-4 py-2.5 text-white shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <LifeBuoy className="w-4 h-4 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xs sm:text-sm font-black tracking-tight leading-none">
                RappiGas • Soporte y Libro de Reclamaciones
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                Osinergmin Garantizado
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-white/25 text-white">
                <Clock className="w-3 h-3 text-amber-200" />
                Atención Activa 24/7
              </span>
            </div>
            <p className="text-[10px] text-orange-100 hidden sm:block mt-0.5">
              Resolución ágil de incidencias de balones, válvulas, pesaje digital o reportes de entrega
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold">
          <button
            type="button"
            onClick={cargarDatos}
            disabled={cargando}
            className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition cursor-pointer"
            title="Actualizar tickets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setMostrarModalNuevo(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-orange-600 hover:bg-orange-50 font-black rounded-lg text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Reclamo</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TARJETAS KPI / ESTADÍSTICAS ESTILO PEDIR (4 TARJETAS CON SOMBRA Y BORDES)
      ========================================================================= */}
      <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Solicitudes */}
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
              Total Solicitudes
            </span>
            <span className="text-2xl font-black text-[#03246b] block leading-tight font-mono">
              {stats.total}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              {stats.resueltos} resueltos • {stats.abiertos} activos
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#03246b] flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
            <FileText className="w-5 h-5" />
          </div>
        </button>

        {/* KPI 2: En Proceso */}
        <button
          type="button"
          onClick={() => setFiltro("EN_PROCESO")}
          className={`bg-white rounded-2xl border p-4 text-left transition shadow-xs hover:shadow-md flex items-center justify-between cursor-pointer ${
            filtro === "EN_PROCESO"
              ? "border-purple-600 ring-2 ring-purple-100 bg-purple-50/20"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              En Atención
              {stats.abiertos > 0 && (
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping inline-block" />
              )}
            </span>
            <span className="text-2xl font-black text-purple-700 block leading-tight font-mono">
              {stats.abiertos}
            </span>
            <span className="text-[11px] text-purple-600 font-semibold block truncate">
              {stats.abiertos > 0 ? "Respuesta en curso" : "Sin casos pendientes"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
        </button>

        {/* KPI 3: Casos Urgentes */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Prioridad Urgente
            </span>
            <span className="text-2xl font-black text-red-600 block leading-tight font-mono">
              {stats.urgentes}
            </span>
            <span className="text-[11px] text-red-600 font-semibold block truncate">
              {stats.urgentes > 0 ? "Atención prioritaria activa" : "Sin urgencias reportadas"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200 shadow-2xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Casos Resueltos */}
        <button
          type="button"
          onClick={() => setFiltro("RESUELTOS")}
          className={`bg-white rounded-2xl border p-4 text-left transition shadow-xs hover:shadow-md flex items-center justify-between cursor-pointer ${
            filtro === "RESUELTOS"
              ? "border-emerald-600 ring-2 ring-emerald-100 bg-emerald-50/20"
              : "border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Casos Resueltos
            </span>
            <span className="text-2xl font-black text-emerald-700 block leading-tight font-mono">
              {stats.resueltos}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold block truncate">
              100% conformidad de servicio
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </button>
      </div>

      {/* =========================================================================
          BANNER DE EMERGENCIA & ATENCIÓN DIRECTA ESTILO /PEDIR
      ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-orange-50/60 to-amber-50/60 border border-orange-200 text-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-black text-sm text-[#03246b]">
              ¿Detectas olor a gas o una fuga en la válvula reguladora?
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Cierra inmediatamente la perilla de paso, ventila el ambiente sin accionar interruptores eléctricos y comunícate de inmediato con nuestra central de urgencias.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
          <a
            href="https://wa.me/51922767224?text=%C2%A1Hola!%20Reporto%20una%20urgencia%20con%20mi%20bal%C3%B3n%20de%20gas%20en%20RappiGas."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Urgencias</span>
          </a>
          <a
            href="tel:080012345"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#03246b] hover:bg-[#021b52] text-white font-bold rounded-xl text-xs shadow-xs transition"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Llamar Central</span>
          </a>
        </div>
      </div>

      {/* =========================================================================
          VISTA DIVIDIDA: LISTADO DE INCIDENCIAS + HILO DE CHAT
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Columna Izquierda: Listado de Tickets */}
        <div className={`${ticketActivo ? "lg:col-span-5" : "lg:col-span-12"} space-y-3`}>
          {/* Barra de Filtros */}
          <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-xs font-bold">
              <button
                type="button"
                onClick={() => setFiltro("TODOS")}
                className={`px-3 py-1 rounded-xl transition cursor-pointer text-xs ${
                  filtro === "TODOS"
                    ? "bg-[#03246b] text-white shadow-xs font-black"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold"
                }`}
              >
                Todos ({stats.total})
              </button>
              <button
                type="button"
                onClick={() => setFiltro("ABIERTOS")}
                className={`px-3 py-1 rounded-xl transition cursor-pointer text-xs ${
                  filtro === "ABIERTOS"
                    ? "bg-amber-600 text-white shadow-xs font-black"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 font-bold"
                }`}
              >
                Abiertos ({tickets.filter((t) => t.estado === "ABIERTO").length})
              </button>
              <button
                type="button"
                onClick={() => setFiltro("EN_PROCESO")}
                className={`px-3 py-1 rounded-xl transition cursor-pointer text-xs ${
                  filtro === "EN_PROCESO"
                    ? "bg-purple-600 text-white shadow-xs font-black"
                    : "bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 font-bold"
                }`}
              >
                En Proceso ({tickets.filter((t) => t.estado === "EN_PROCESO").length})
              </button>
              <button
                type="button"
                onClick={() => setFiltro("RESUELTOS")}
                className={`px-3 py-1 rounded-xl transition cursor-pointer text-xs ${
                  filtro === "RESUELTOS"
                    ? "bg-emerald-600 text-white shadow-xs font-black"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold"
                }`}
              >
                Resueltos ({stats.resueltos})
              </button>
            </div>
          </div>

          {cargando ? (
            <div className="p-10 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-2 shadow-xs">
              <RefreshCw className="w-5 h-5 text-orange-600 animate-spin" />
              <span className="font-semibold text-slate-600">Cargando incidencias y reclamos...</span>
            </div>
          ) : ticketsFiltrados.length === 0 ? (
            <div className="p-10 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 space-y-2 shadow-xs">
              <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="font-black text-sm text-[#03246b]">Sin incidencias en esta categoría</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {filtro === "TODOS"
                  ? "Todos tus despachos y cilindros de gas se encuentran conformes sin reportes."
                  : "No hay tickets con este estado actualmente."}
              </p>
            </div>
          ) : (
            ticketsFiltrados.map((t) => {
              const seleccionado = ticketActivo?.publicId === t.publicId;
              const badge = getBadgeEstado(t.estado);

              return (
                <div
                  key={t.publicId}
                  onClick={() => abrirDetalle(t)}
                  className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                    seleccionado
                      ? "bg-orange-50/40 border-orange-500 shadow-md ring-2 ring-orange-100"
                      : "bg-white border-slate-200 hover:border-orange-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-[#03246b]">
                      #TK-{t.publicId.substring(0, 8).toUpperCase()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          t.prioridad === "URGENTE"
                            ? "bg-red-100 text-red-700 border border-red-200 font-black animate-pulse"
                            : t.prioridad === "ALTA"
                            ? "bg-orange-100 text-orange-800 border border-orange-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {t.prioridad}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.cls}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs sm:text-sm font-black text-slate-900 mt-2 line-clamp-1">
                    {t.asunto}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                      {t.nombreEmpresa || "Atención Central RappiGas"}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      <MessageSquare className="w-3 h-3 text-orange-600" /> {t.totalMensajes || 1}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Columna Derecha: Hilo de Conversación del Ticket */}
        {ticketActivo && (
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[650px] overflow-hidden">
            {/* Header del Ticket */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#03246b]">
                    #TK-{ticketActivo.publicId.substring(0, 8).toUpperCase()}
                  </span>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-black border ${
                      getBadgeEstado(ticketActivo.estado).cls
                    }`}
                  >
                    {ticketActivo.estado}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      ticketActivo.prioridad === "URGENTE"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {ticketActivo.prioridad}
                  </span>
                </div>
                <h3 className="text-sm font-black text-slate-900">
                  {ticketActivo.asunto}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Distribuidora: <strong className="text-slate-800">{ticketActivo.nombreEmpresa || "Soporte Central"}</strong>
                </p>
              </div>

              <button
                onClick={() => setTicketActivo(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
                title="Cerrar hilo de conversación"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mensajes del Hilo */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40">
              {ticketActivo.mensajes?.map((m) => {
                const esCliente = m.esMio;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${esCliente ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1 px-1">
                      <span className="font-bold text-slate-700">
                        {m.nombreRemitente}
                      </span>
                      <span>• {m.rolRemitente}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-xs leading-relaxed ${
                        esCliente
                          ? "bg-[#03246b] text-white rounded-br-none"
                          : "bg-white text-slate-800 rounded-bl-none border border-slate-200"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.mensaje}</p>

                      {m.adjuntoUrl && (
                        <div className="mt-2 pt-2 border-t border-white/20 flex items-center gap-2">
                          <Paperclip className="w-3.5 h-3.5" />
                          <a
                            href={m.adjuntoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline font-bold text-[11px] flex items-center gap-1 hover:text-amber-200"
                          >
                            Ver foto de evidencia adjunta <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Formulario de Respuesta */}
            <form
              onSubmit={handleEnviarRespuesta}
              className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white"
            >
              <input
                type="text"
                value={mensajeRespuesta}
                onChange={(e) => setMensajeRespuesta(e.target.value)}
                placeholder="Escribe tu mensaje o respuesta a la distribuidora..."
                className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500 transition"
              />
              <button
                type="submit"
                disabled={enviandoRespuesta || !mensajeRespuesta.trim()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{enviandoRespuesta ? "Enviando..." : "Responder"}</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL NUEVO TICKET / RECLAMO ESTILO /PEDIR
      ========================================================================= */}
      {mostrarModalNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-orange-600" />
                <h3 className="font-black text-sm text-[#03246b]">
                  Registrar Incidencia o Reclamo de Balón
                </h3>
              </div>
              <button
                onClick={() => setMostrarModalNuevo(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearTicket} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700">
                  Motivo o Asunto del Reclamo *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoAsunto}
                  onChange={(e) => setNuevoAsunto(e.target.value)}
                  placeholder="Ej: Fuga leve en válvula reguladora / Balón con precinto dañado"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1 text-slate-700">
                    Prioridad de Atención
                  </label>
                  <select
                    value={nuevoPrioridad}
                    onChange={(e) => setNuevoPrioridad(e.target.value as PrioridadTicket)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500 transition"
                  >
                    <option value="BAJA">Baja (Consulta general)</option>
                    <option value="MEDIA">Media (Revisión ordinaria)</option>
                    <option value="ALTA">Alta (Retraso o comprobante)</option>
                    <option value="URGENTE">Urgente (Fuga o olor a gas)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1 text-slate-700">
                    Pedido Asociado (Opcional)
                  </label>
                  <select
                    value={pedidoSeleccionado}
                    onChange={(e) => setPedidoSeleccionado(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500 transition"
                  >
                    <option value="">Sin pedido / General</option>
                    {pedidos.map((p) => (
                      <option key={p.publicId} value={p.publicId}>
                        #PG-{p.publicId.substring(0, 8).toUpperCase()} ({p.nombreEmpresa})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700">
                  Descripción Detallada del Problema *
                </label>
                <textarea
                  required
                  rows={4}
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  placeholder="Detalla qué ocurrió (ej: olor a gas, código de seguridad no aceptado, válvula defectuosa, balanza no calibrada)..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700">
                  Foto de Evidencia (Balón, válvula o precinto)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleSubirArchivo}
                    className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                  />
                  {subiendoArchivo && <span className="text-orange-600 font-bold animate-pulse">Subiendo...</span>}
                </div>
                {adjuntoUrl && (
                  <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Evidencia cargada exitosamente
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMostrarModalNuevo(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando || subiendoArchivo}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {enviando ? "Registrando..." : "Enviar Incidencia"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
