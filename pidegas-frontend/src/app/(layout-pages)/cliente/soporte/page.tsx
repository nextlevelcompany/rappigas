"use client";

import React, { useEffect, useState, useCallback } from "react";
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
} from "lucide-react";

export default function ClienteSoportePage() {
  const [tickets, setTickets] = useState<TicketDetalle[]>([]);
  const [pedidos, setPedidos] = useState<PedidoDetalle[]>([]);
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
        pedidosApi.listarMisPedidos(0, 20).catch(() => ({ content: [] })),
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="CLIENTE"
          mensaje={errorPermisos}
          onExito={cargarDatos}
        />
      )}

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-orange-500/10 text-orange-600 border border-orange-500/20 flex items-center gap-1">
              <LifeBuoy className="w-3.5 h-3.5" /> Garantía y Seguridad de tu Balón
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mt-1">
            Centro de Ayuda, Reclamos y Soporte
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Reporta cualquier incidencia con tu balón de cocina, fugas en válvulas reguladoras o consultas de despacho.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={cargarDatos}
            disabled={cargando}
            className="p-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setMostrarModalNuevo(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Nuevo Reclamo o Consulta
          </button>
        </div>
      </div>

      {/* Listado y Vista Dividida */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Listado de Tickets */}
        <div className={`${ticketActivo ? "lg:col-span-5" : "lg:col-span-12"} space-y-3`}>
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Mis Solicitudes ({tickets.length})
            </h3>
          </div>

          {cargando ? (
            <div className="p-12 text-center text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
              Cargando historial de tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="font-semibold text-gray-900 dark:text-white">Sin incidencias registradas</h4>
              <p className="text-xs text-gray-500">
                Todos tus balones y servicios de gas se encuentran conformes.
              </p>
            </div>
          ) : (
            tickets.map((t) => {
              const seleccionado = ticketActivo?.publicId === t.publicId;
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
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-mono text-gray-400">
                      #TK-{t.publicId.substring(0, 8)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.prioridad === "URGENTE"
                            ? "bg-red-100 text-red-700 border border-red-200"
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
                    <span>{t.nombreEmpresa || "Atención Central PideGas"}</span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <MessageSquare className="w-3 h-3" /> {t.totalMensajes}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Columna Derecha: Hilo de Conversación del Ticket */}
        {ticketActivo && (
          <div className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-[650px] overflow-hidden">
            {/* Header del Ticket */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-400">
                    #TK-{ticketActivo.publicId.substring(0, 8)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-bold bg-orange-100 text-orange-800">
                    {ticketActivo.estado}
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                  {ticketActivo.asunto}
                </h3>
                <p className="text-xs text-gray-500">
                  Distribuidora: <strong>{ticketActivo.nombreEmpresa || "Soporte Central"}</strong>
                </p>
              </div>

              <button
                onClick={() => setTicketActivo(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mensajes del Hilo */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-muted/20">
              {ticketActivo.mensajes?.map((m) => {
                const esCliente = m.esMio;
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${esCliente ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1 px-1">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {m.nombreRemitente}
                      </span>
                      <span>• {m.rolRemitente}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-sm leading-relaxed ${
                        esCliente
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

            {/* Formulario de Respuesta */}
            <form
              onSubmit={handleEnviarRespuesta}
              className="p-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-gray-800"
            >
              <input
                type="text"
                value={mensajeRespuesta}
                onChange={(e) => setMensajeRespuesta(e.target.value)}
                placeholder="Escribe tu mensaje a la distribuidora..."
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

      {/* Modal Nuevo Ticket */}
      {mostrarModalNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  Registrar Incidencia / Reclamo de Balón
                </h3>
              </div>
              <button
                onClick={() => setMostrarModalNuevo(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Motivo o Asunto del Reclamo *
                </label>
                <input
                  type="text"
                  required
                  value={nuevoAsunto}
                  onChange={(e) => setNuevoAsunto(e.target.value)}
                  placeholder="Ej: Fuga leve en válvula reguladora / Balón con precinto dañado"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    Prioridad de Atención
                  </label>
                  <select
                    value={nuevoPrioridad}
                    onChange={(e) => setNuevoPrioridad(e.target.value as PrioridadTicket)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  >
                    <option value="BAJA">Baja (Consulta general)</option>
                    <option value="MEDIA">Media (Revisión ordinaria)</option>
                    <option value="ALTA">Alta (Retraso o comprobante)</option>
                    <option value="URGENTE">Urgente (Fuga o olor a gas)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    Pedido Asociado (Opcional)
                  </label>
                  <select
                    value={pedidoSeleccionado}
                    onChange={(e) => setPedidoSeleccionado(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  >
                    <option value="">Sin pedido / General</option>
                    {pedidos.map((p) => (
                      <option key={p.publicId} value={p.publicId}>
                        #PG-{p.publicId.substring(0, 8)} ({p.nombreEmpresa})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Descripción Detallada del Problema *
                </label>
                <textarea
                  required
                  rows={4}
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  placeholder="Detalla qué ocurrió (ej: olor a gas, código de seguridad no aceptado, válvula defectuosa)..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Foto de Evidencia (Balón, válvula o precinto)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleSubirArchivo}
                    className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                  {subiendoArchivo && <span className="text-orange-600 font-semibold animate-pulse">Subiendo...</span>}
                </div>
                {adjuntoUrl && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Evidencia cargada exitosamente
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setMostrarModalNuevo(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando || subiendoArchivo}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50"
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
