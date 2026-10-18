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
    <div className="w-full py-3 px-3 sm:px-6 space-y-3 text-xs">
      {/* Header Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Auditoría y Trazabilidad Forense
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                Inmutable
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Registro cronológico inmutable de accesos, autenticaciones, movimientos financieros y cambios de estado.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={cargarEventos}
          disabled={cargando}
          className="h-7 px-2.5 text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3 h-3 ${cargando ? "animate-spin" : ""}`} />
          <span>Actualizar</span>
        </Button>
      </div>

      {/* Métricas rápidas Ultracompactas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Total Registros</p>
            <p className="text-lg font-bold leading-tight mt-0.5">{eventos.length}</p>
          </div>
          <Database className="w-4 h-4 text-blue-500 opacity-80" />
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Inicios Exitosos</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-emerald-600">
              {eventos.filter((e) => e.tipoEvento === "INICIO_SESION_EXITOSO").length}
            </p>
          </div>
          <UserCheck className="w-4 h-4 text-emerald-500 opacity-80" />
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Intentos Fallidos</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-rose-600">
              {eventos.filter((e) => e.tipoEvento === "INICIO_SESION_FALLIDO").length}
            </p>
          </div>
          <AlertTriangle className="w-4 h-4 text-rose-500 opacity-80" />
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Rate Limiting</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-purple-600">Activo (15r/m)</p>
          </div>
          <Lock className="w-4 h-4 text-purple-500 opacity-80" />
        </div>
      </div>

      {/* Barra de Filtros Compacta */}
      <div className="p-2.5 rounded-lg border bg-card text-card-foreground shadow-2xs flex flex-col md:flex-row gap-2 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-muted-foreground" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por IP, usuario ID o descripción..."
            className="w-full pl-8 pr-3 h-7 text-xs border rounded-md bg-muted/30 focus:bg-background outline-hidden text-foreground"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            aria-label="Filtrar por tipo de evento"
            className="w-full md:w-auto h-7 text-xs border rounded-md bg-muted/40 px-2 text-foreground outline-hidden"
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

      {/* Tabla de Registros de Auditoría de Alta Densidad */}
      <div className="rounded-lg border bg-card shadow-2xs overflow-hidden">
        <div className="px-3 py-2 border-b bg-muted/30 flex items-center justify-between">
          <span className="font-semibold text-xs text-foreground">Bitácora Forense del Sistema</span>
          <span className="text-[11px] text-muted-foreground">
            {eventosFiltrados.length} de {eventos.length} registros
          </span>
        </div>

        <div>
          {cargando ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
              Cargando bitácora de auditoría forense...
            </div>
          ) : eventosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              <FileText className="w-7 h-7 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No se encontraron eventos con los filtros seleccionados.</p>
              <p className="text-[11px] mt-0.5">Los eventos se registran automáticamente ante acciones en la plataforma.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-3">Fecha y Hora</th>
                    <th className="py-2 px-3">Tipo Evento</th>
                    <th className="py-2 px-3">Descripción Forense</th>
                    <th className="py-2 px-3">Usuario / Tenant</th>
                    <th className="py-2 px-3">IP Origen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {eventosFiltrados.map((ev) => (
                    <tr key={ev.publicId} className="hover:bg-muted/30 transition-colors">
                      <td className="py-2 px-3 whitespace-nowrap text-muted-foreground font-mono">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span>{formatearFecha(ev.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold px-2 py-0.5 border ${badgeColorPorTipo(ev.tipoEvento)}`}
                        >
                          {ev.tipoEvento}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-foreground max-w-md truncate">
                        {ev.descripcion}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-muted-foreground">
                        {ev.usuarioId ? (
                          <span className="font-mono bg-muted px-1.5 py-0.2 rounded text-foreground text-[10px]">
                            U#{ev.usuarioId}
                          </span>
                        ) : (
                          <span className="italic text-[10px]">Anónimo</span>
                        )}
                        {ev.tenantId && (
                          <span className="ml-1.5 font-mono bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-800 text-[10px]">
                            T#{ev.tenantId}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-muted-foreground font-mono">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span>{ev.ipOrigen || "127.0.0.1"}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
