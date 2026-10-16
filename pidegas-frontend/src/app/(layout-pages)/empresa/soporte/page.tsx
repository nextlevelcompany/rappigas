"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  soporteEmpresaApi,
  TicketDetalle,
  ResumenSoporte,
  EstadoTicket,
} from "@/librerias/api/soporte.api";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import {
  LifeBuoy,
  RefreshCw,
  Search,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Paperclip,
  Send,
  ExternalLink,
  ShieldCheck,
  CheckCheck,
  User,
  Flame,
  X,
} from "lucide-react";

export default function EmpresaSoportePage() {
  const [tickets, setTickets] = useState<TicketDetalle[]>([]);
  const [metricas, setMetricas] = useState<ResumenSoporte>({
    abiertos: 0,
    enProceso: 0,
    resueltos: 0,
    cerrados: 0,
    total: 0,
  });
  const [filtroEstado, setFiltroEstado] = useState<EstadoTicket | "TODOS">("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);

  // Ticket seleccionado para atender
  const [ticketSeleccionado, setTicketSeleccionado] = useState<TicketDetalle | null>(null);
  const [mensajeRespuesta, setMensajeRespuesta] = useState("");
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorPermisos(null);
    try {
      const [ticketsData, metricasData] = await Promise.all([
        soporteEmpresaApi.listarTickets().catch((err: any) => {
          if (err?.status === 403 || err?.message?.includes("permisos")) {
            setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Distribuidora (EMPRESA).");
          }
          return [];
        }),
        soporteEmpresaApi.obtenerMetricas().catch(() => ({
          abiertos: 0,
          enProceso: 0,
          resueltos: 0,
          cerrados: 0,
          total: 0,
        })),
      ]);
      setTickets(ticketsData);
      setMetricas(metricasData);
    } catch {
      // Ignorar errores no controlados
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const abrirDetalle = async (ticket: TicketDetalle) => {
    try {
      const completo = await soporteEmpresaApi.obtenerTicket(ticket.publicId);
      setTicketSeleccionado(completo);
    } catch {
      setTicketSeleccionado(ticket);
    }
  };

  const handleEnviarRespuesta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSeleccionado || !mensajeRespuesta.trim()) return;

    try {
      setEnviandoRespuesta(true);
      const actualizado = await soporteEmpresaApi.responderTicket(
        ticketSeleccionado.publicId,
        mensajeRespuesta.trim()
      );
      setTicketSeleccionado(actualizado);
      setTickets((prev) =>
        prev.map((t) => (t.publicId === actualizado.publicId ? actualizado : t))
      );
      setMensajeRespuesta("");
      // Refrescar métricas si el estado cambió a EN_PROCESO
      soporteEmpresaApi.obtenerMetricas().then(setMetricas).catch(() => {});
    } catch (err: any) {
      alert(err.message || "Error al enviar respuesta");
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado: EstadoTicket) => {
    if (!ticketSeleccionado) return;
    try {
      setCambiandoEstado(true);
      const actualizado = await soporteEmpresaApi.cambiarEstado(
        ticketSeleccionado.publicId,
        nuevoEstado
      );
      setTicketSeleccionado(actualizado);
      setTickets((prev) =>
        prev.map((t) => (t.publicId === actualizado.publicId ? actualizado : t))
      );
      soporteEmpresaApi.obtenerMetricas().then(setMetricas).catch(() => {});
    } catch (err: any) {
      alert(err.message || "Error al cambiar estado");
    } finally {
      setCambiandoEstado(false);
    }
  };

  const ticketsFiltrados = tickets.filter((t) => {
    const coincideEstado = filtroEstado === "TODOS" ? true : t.estado === filtroEstado;
    const coincideBusqueda =
      t.asunto.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.usuarioNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.publicId.toLowerCase().includes(busqueda.toLowerCase());
    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="EMPRESA"
          mensaje={errorPermisos}
          onExito={cargarDatos}
        />
      )}

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-orange-500/10 text-orange-600 border border-orange-500/20 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Atención al Cliente & Calidad de Balones
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mt-1">
            Bandeja de Incidencias, PQRS y Garantías
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Resuelve consultas de clientes sobre válvulas, tiempos de entrega y cambios de cilindros con fuga.
          </p>
        </div>

        <button
          onClick={cargarDatos}
          disabled={cargando}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <span className="text-xs text-amber-600 font-semibold">Tickets Abiertos</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{metricas.abiertos}</p>
          <span className="text-[11px] text-gray-400">Requieren primera respuesta</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <span className="text-xs text-purple-600 font-semibold">En Proceso</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{metricas.enProceso}</p>
          <span className="text-[11px] text-gray-400">Técnico en camino o revisión</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <span className="text-xs text-emerald-600 font-semibold">Resueltos</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{metricas.resueltos}</p>
          <span className="text-[11px] text-gray-400">Atención conforme</span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
          <span className="text-xs text-gray-500 font-semibold">Total Histórico</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{metricas.total}</p>
          <span className="text-[11px] text-gray-400">Registro de calidad</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-2">
          {(["TODOS", "ABIERTO", "EN_PROCESO", "RESUELTO", "CERRADO"] as const).map((est) => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filtroEstado === est
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100"
              }`}
            >
              {est === "TODOS" ? "Todos" : est}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por asunto, cliente..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          />
        </div>
      </div>

      {/* Layout de Bandeja y Hilo de Atención */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`${ticketSeleccionado ? "lg:col-span-5" : "lg:col-span-12"} space-y-3`}>
          {ticketsFiltrados.length === 0 ? (
            <div className="p-12 text-center text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              No hay tickets que coincidan con el filtro.
            </div>
          ) : (
            ticketsFiltrados.map((t) => {
              const seleccionado = ticketSeleccionado?.publicId === t.publicId;
              return (
                <div
                  key={t.publicId}
                  onClick={() => abrirDetalle(t)}
                  className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                    seleccionado
                      ? "bg-orange-50/50 dark:bg-orange-950/20 border-orange-400 shadow-sm"
                      : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-mono text-[11px]">#TK-{t.publicId.substring(0, 8)}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.prioridad === "URGENTE"
                            ? "bg-red-100 text-red-700 animate-pulse"
                            : t.prioridad === "ALTA"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {t.prioridad}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.estado === "ABIERTO"
                            ? "bg-amber-100 text-amber-700"
                            : t.estado === "EN_PROCESO"
                            ? "bg-purple-100 text-purple-700"
                            : t.estado === "RESUELTO"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {t.estado}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-1.5 line-clamp-1">
                    {t.asunto}
                  </h4>

                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-orange-500" /> {t.usuarioNombre}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <MessageSquare className="w-3 h-3" /> {t.totalMensajes}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Panel de Hilo de Conversación y Resolución */}
        {ticketSeleccionado && (
          <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-[650px] overflow-hidden">
            {/* Header con Acciones de Estado */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">
                    #TK-{ticketSeleccionado.publicId.substring(0, 8)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-bold bg-orange-100 text-orange-800">
                    {ticketSeleccionado.estado}
                  </span>
                  {ticketSeleccionado.pedidoPublicId && (
                    <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      Pedido: #PG-{ticketSeleccionado.pedidoPublicId.substring(0, 8)}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                  {ticketSeleccionado.asunto}
                </h3>
                <p className="text-xs text-gray-500">
                  Cliente: <strong>{ticketSeleccionado.usuarioNombre}</strong> ({ticketSeleccionado.usuarioEmail})
                </p>
              </div>

              {/* Botones de Cambio de Estado Rápido */}
              <div className="flex items-center gap-1.5 shrink-0">
                {ticketSeleccionado.estado !== "EN_PROCESO" && (
                  <button
                    onClick={() => handleCambiarEstado("EN_PROCESO")}
                    disabled={cambiandoEstado}
                    className="px-2.5 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                  >
                    En Proceso
                  </button>
                )}
                {ticketSeleccionado.estado !== "RESUELTO" && (
                  <button
                    onClick={() => handleCambiarEstado("RESUELTO")}
                    disabled={cambiandoEstado}
                    className="px-2.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                  >
                    Resolver
                  </button>
                )}
                <button
                  onClick={() => setTicketSeleccionado(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mensajes del Hilo */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-muted/20">
              {ticketSeleccionado.mensajes?.map((m) => {
                const esDistribuidor = m.esMio;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${esDistribuidor ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1 px-1">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {m.nombreRemitente}
                      </span>
                      <span>• {m.rolRemitente}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm leading-relaxed ${
                        esDistribuidor
                          ? "bg-orange-600 text-white rounded-br-none"
                          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border border-gray-100 dark:border-gray-600"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.mensaje}</p>

                      {m.adjuntoUrl && (
                        <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10 flex items-center gap-2">
                          <Paperclip className="w-3.5 h-3.5" />
                          <a
                            href={m.adjuntoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline font-semibold flex items-center gap-1"
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

            {/* Formulario de Respuesta de la Distribuidora */}
            <form
              onSubmit={handleEnviarRespuesta}
              className="p-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-gray-800"
            >
              <input
                type="text"
                value={mensajeRespuesta}
                onChange={(e) => setMensajeRespuesta(e.target.value)}
                placeholder="Escribe la respuesta o solución al cliente..."
                className="flex-1 px-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-muted/40 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                type="submit"
                disabled={enviandoRespuesta || !mensajeRespuesta.trim()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {enviandoRespuesta ? "Enviando..." : "Responder"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
