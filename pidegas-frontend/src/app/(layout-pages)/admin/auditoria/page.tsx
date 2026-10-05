"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import { auditoriaApi, RegistroAuditoriaDto, TipoEventoAuditoria } from "@/librerias/api/auditoria.api";
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Lock,
  UserCheck,
  AlertTriangle,
  FileText,
  Clock,
  Globe,
  Database,
} from "lucide-react";

export default function AdminAuditoriaPage() {
  const [eventos, setEventos] = useState<RegistroAuditoriaDto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorPermisos, setErrorPermisos] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState<string>("");

  const cargarEventos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorPermisos(false);
      const res = await auditoriaApi.listarEventos();
      setEventos(res || []);
    } catch (err: unknown) {
      const errorObj = err as { status?: number; statusCode?: number };
      if (errorObj?.status === 403 || errorObj?.statusCode === 403) {
        setErrorPermisos(true);
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarEventos();
  }, [cargarEventos]);

  if (errorPermisos) {
    return (
      <div className="p-6">
        <RoleGuardAlert
          rolRequerido="ADMIN"
          mensaje="Acceso restringido únicamente a Oficiales de Cumplimiento y Super Administradores de PideGas."
          onExito={cargarEventos}
        />
      </div>
    );
  }

  const eventosFiltrados = eventos.filter((ev) => {
    const coincideTipo = filtroTipo === "TODOS" || ev.tipoEvento === filtroTipo;
    const termino = busqueda.toLowerCase().trim();
    const coincideBusqueda =
      termino === "" ||
      ev.descripcion?.toLowerCase().includes(termino) ||
      ev.ipOrigen?.toLowerCase().includes(termino) ||
      (ev.usuarioId && String(ev.usuarioId).includes(termino)) ||
      (ev.tenantId && String(ev.tenantId).includes(termino));
    return coincideTipo && coincideBusqueda;
  });

  const formatearFecha = (fechaStr: string) => {
    try {
      const d = new Date(fechaStr);
      return new Intl.DateTimeFormat("es-PE", {
        dateStyle: "short",
        timeStyle: "medium",
      }).format(d);
    } catch {
      return fechaStr;
    }
  };

  const badgeColorPorTipo = (tipo: TipoEventoAuditoria) => {
    switch (tipo) {
      case "INICIO_SESION_EXITOSO":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300";
      case "INICIO_SESION_FALLIDO":
        return "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300";
      case "REGISTRO_CLIENTE":
      case "REGISTRO_EMPRESA":
        return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300";
      case "CAMBIO_ESTADO_EMPRESA":
      case "CAMBIO_ESTADO_PEDIDO":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300";
      case "CREACION_PEDIDO":
        return "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950 dark:text-orange-300";
      case "PAGO_PROCESADO":
      case "LIQUIDACION_GENERADA":
        return "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300";
      case "TICKET_CREADO":
      case "TICKET_CERRADO":
        return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Auditoría y Trazabilidad Forense
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registro cronológico inmutable de accesos, autenticaciones, movimientos financieros y cambios de estado.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={cargarEventos}
          disabled={cargando}
          className="flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
          Actualizar Registros
        </Button>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Eventos Registrados</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">{eventos.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Inicios Exitosos</p>
              <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                {eventos.filter((e) => e.tipoEvento === "INICIO_SESION_EXITOSO").length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Intentos Fallidos</p>
              <h3 className="text-xl font-bold text-rose-700 dark:text-rose-400">
                {eventos.filter((e) => e.tipoEvento === "INICIO_SESION_FALLIDO").length}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Políticas Rate Limit</p>
              <h3 className="text-xl font-bold text-purple-700 dark:text-purple-400">Activo (15r/m)</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros de Búsqueda */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por IP, usuario ID o descripción..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                aria-label="Filtrar por tipo de evento"
                className="w-full md:w-auto text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
              >
                <option value="TODOS">Todos los tipos de evento</option>
                <option value="INICIO_SESION_EXITOSO">Inicio de sesión exitoso</option>
                <option value="INICIO_SESION_FALLIDO">Inicio de sesión fallido</option>
                <option value="REGISTRO_CLIENTE">Registro de cliente</option>
                <option value="REGISTRO_EMPRESA">Registro de distribuidora</option>
                <option value="CAMBIO_ESTADO_EMPRESA">Cambio estado distribuidora</option>
                <option value="CREACION_PEDIDO">Creación de pedido</option>
                <option value="CAMBIO_ESTADO_PEDIDO">Cambio estado pedido</option>
                <option value="PAGO_PROCESADO">Pago procesado</option>
                <option value="LIQUIDACION_GENERADA">Liquidación generada</option>
                <option value="TICKET_CREADO">Ticket soporte creado</option>
                <option value="TICKET_CERRADO">Ticket soporte cerrado</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Registros de Auditoría */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
            <span>Bitácora de Seguridad del Sistema</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              Mostrando {eventosFiltrados.length} de {eventos.length} eventos
            </span>
          </CardTitle>
          <CardDescription>
            Trazabilidad completa con aislamiento por Tenant y sellado de tiempo UTC.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {cargando ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
              Cargando bitácora de auditoría forense...
            </div>
          ) : eventosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-slate-500 dark:text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 text-slate-400" />
              <p className="font-medium">No se encontraron eventos con los filtros seleccionados.</p>
              <p className="text-xs mt-1">Los eventos se registran automáticamente ante acciones en la plataforma.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Tipo Evento</th>
                    <th className="py-3 px-4">Descripción Forense</th>
                    <th className="py-3 px-4">Usuario / Tenant</th>
                    <th className="py-3 px-4">IP Origen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {eventosFiltrados.map((ev) => (
                    <tr key={ev.publicId} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/30 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 font-mono flex items-center gap-1.5 pt-4">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {formatearFecha(ev.createdAt)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-[11px] font-medium px-2 py-0.5 border ${badgeColorPorTipo(ev.tipoEvento)}`}
                        >
                          {ev.tipoEvento}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-800 dark:text-slate-200 max-w-md truncate">
                        {ev.descripcion}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        {ev.usuarioId ? (
                          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">
                            U#{ev.usuarioId}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Anónimo</span>
                        )}
                        {ev.tenantId && (
                          <span className="ml-1.5 font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                            T#{ev.tenantId}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 font-mono">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{ev.ipOrigen || "127.0.0.1"}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
