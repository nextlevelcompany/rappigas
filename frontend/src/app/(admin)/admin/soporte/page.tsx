"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  soporteAdminApi,
  TicketDetalle,
  ResumenSoporte,
  EstadoTicket,
} from "@/librerias/api/soporte.api";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  Search,
  RefreshCw,
  MessageSquare,
  Building,
  User,
  Paperclip,
  Send,
  ExternalLink,
  CheckCircle2,
  X,
  Scale,
} from "lucide-react";

export default function AdminSoportePage() {
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

  // Mediación activa
  const [ticketSeleccionado, setTicketSeleccionado] = useState<TicketDetalle | null>(null);
  const [mensajeMediacion, setMensajeMediacion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorPermisos(null);
    try {
      const [ticketsData, metricasData] = await Promise.all([
        soporteAdminApi.listarTickets().catch((err: any) => {
          if (err?.status === 403 || err?.message?.includes("permisos")) {
            setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Administrador de Plataforma (ADMIN).");
          }
          return [];
        }),
        soporteAdminApi.obtenerMetricas().catch(() => ({
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
      const completo = await soporteAdminApi.obtenerTicket(ticket.publicId);
      setTicketSeleccionado(completo);
    } catch {
      setTicketSeleccionado(ticket);
    }
  };

  const handleEnviarMediacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSeleccionado || !mensajeMediacion.trim()) return;

    try {
      setEnviando(true);
      const actualizado = await soporteAdminApi.responderTicket(
        ticketSeleccionado.publicId,
        `[DICTAMEN PLATAFORMA PIDEGAS]: ${mensajeMediacion.trim()}`
      );
      setTicketSeleccionado(actualizado);
      setTickets((prev) =>
        prev.map((t) => (t.publicId === actualizado.publicId ? actualizado : t))
      );
      setMensajeMediacion("");
    } catch (err: any) {
      alert(err.message || "Error al registrar mediación");
    } finally {
      setEnviando(false);
    }
  };

  const handleCambiarEstado = async (nuevoEstado: EstadoTicket) => {
    if (!ticketSeleccionado) return;
    try {
      setCambiandoEstado(true);
      const actualizado = await soporteAdminApi.cambiarEstado(
        ticketSeleccionado.publicId,
        nuevoEstado
      );
      setTicketSeleccionado(actualizado);
      setTickets((prev) =>
        prev.map((t) => (t.publicId === actualizado.publicId ? actualizado : t))
      );
      soporteAdminApi.obtenerMetricas().then(setMetricas).catch(() => {});
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
      (t.nombreEmpresa && t.nombreEmpresa.toLowerCase().includes(busqueda.toLowerCase())) ||
      t.publicId.toLowerCase().includes(busqueda.toLowerCase());
    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="w-full py-3 px-3 sm:px-6 space-y-3 text-xs">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="ADMIN"
          mensaje={errorPermisos}
          onExito={cargarDatos}
        />
      )}

      {/* Cabecera Compacta */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Supervisión Global de Soporte y Disputas
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                Mediación PQRS
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Monitorea el cumplimiento de calidad, resolución de reclamos entre clientes y distribuidoras afiliadas.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={cargarDatos}
          disabled={cargando}
          className="h-7 px-2.5 text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3 h-3 ${cargando ? "animate-spin" : ""}`} />
          <span>Actualizar</span>
        </Button>
      </div>

      {/* KPIs Globales Compactos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Abiertos Global</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-amber-600">{metricas.abiertos}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Sin primera atención</p>
          </div>
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">En Proceso</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-purple-600">{metricas.enProceso}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">En revisión distribuidoras</p>
          </div>
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Resueltos Global</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-emerald-600">{metricas.resueltos}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Garantías cumplidas</p>
          </div>
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Total Tickets</p>
            <p className="text-lg font-bold leading-tight mt-0.5">{metricas.total}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Auditoría multi-empresa</p>
          </div>
        </div>
      </div>

      {/* Layout de Auditoría */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`${ticketSeleccionado ? "lg:col-span-5" : "lg:col-span-12"} space-y-3`}>
          {/* Barra de Filtros */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex gap-1.5 overflow-x-auto w-full">
              {(["TODOS", "ABIERTO", "EN_PROCESO", "RESUELTO", "CERRADO"] as const).map((est) => (
                <button
                  key={est}
                  onClick={() => setFiltroEstado(est)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    filtroEstado === est
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {est === "TODOS" ? "Todos" : est}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          {ticketsFiltrados.length === 0 ? (
            <div className="p-12 text-center text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              No hay tickets que coincidan con la búsqueda.
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
                      ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-400 shadow-sm"
                      : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span className="font-mono text-[11px]">#TK-{t.publicId.substring(0, 8)}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.prioridad === "URGENTE"
                            ? "bg-red-100 text-red-700"
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
                    <span className="flex items-center gap-1 truncate max-w-[180px]">
                      <Building className="w-3 h-3 text-amber-600 shrink-0" />{" "}
                      {t.nombreEmpresa || "Sin empresa asignada"}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] shrink-0">
                      <MessageSquare className="w-3 h-3" /> {t.totalMensajes}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Panel de Mediación y Supervisión */}
        {ticketSeleccionado && (
          <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-[650px] overflow-hidden">
            {/* Header del Ticket con Acciones Administrativas */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">
                    #TK-{ticketSeleccionado.publicId.substring(0, 8)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                    {ticketSeleccionado.estado}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                  {ticketSeleccionado.asunto}
                </h3>
                <p className="text-xs text-gray-500">
                  Distribuidora: <strong>{ticketSeleccionado.nombreEmpresa || "Plataforma"}</strong> | Cliente:{" "}
                  <strong>{ticketSeleccionado.usuarioNombre}</strong>
                </p>
              </div>

              {/* Dictamen oficial del Admin */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCambiarEstado("RESUELTO")}
                  disabled={cambiandoEstado}
                  className="px-2.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                >
                  Dictaminar Resuelto
                </button>
                <button
                  onClick={() => handleCambiarEstado("CERRADO")}
                  disabled={cambiandoEstado}
                  className="px-2.5 py-1.5 text-xs font-bold bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => setTicketSeleccionado(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Hilo de Auditoría */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-muted/20">
              {ticketSeleccionado.mensajes?.map((m) => {
                const esAdmin = m.rolRemitente === "ADMIN";
                const esEmpresa = m.rolRemitente === "EMPRESA";

                return (
                  <div key={m.id} className="flex flex-col items-start w-full">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1 px-1">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {m.nombreRemitente}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          esAdmin
                            ? "bg-amber-100 text-amber-800"
                            : esEmpresa
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {m.rolRemitente}
                      </span>
                      <span>• {new Date(m.createdAt).toLocaleTimeString()}</span>
                    </div>

                    <div
                      className={`w-full rounded-2xl p-3.5 text-xs shadow-sm leading-relaxed border ${
                        esAdmin
                          ? "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
                          : esEmpresa
                          ? "bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 text-gray-900 dark:text-white"
                          : "bg-white dark:bg-gray-700 border-gray-100 dark:border-gray-600 text-gray-900 dark:text-white"
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
                            className="underline font-semibold flex items-center gap-1 text-orange-600"
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

            {/* Formulario de Mediación Oficial */}
            <form
              onSubmit={handleEnviarMediacion}
              className="p-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-gray-800"
            >
              <input
                type="text"
                value={mensajeMediacion}
                onChange={(e) => setMensajeMediacion(e.target.value)}
                placeholder="Escribe un dictamen o instrucción oficial de plataforma..."
                className="flex-1 px-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-muted/40 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={enviando || !mensajeMediacion.trim()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {enviando ? "Enviando..." : "Mediar"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
