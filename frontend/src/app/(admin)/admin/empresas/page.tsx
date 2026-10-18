"use client";

import React, { useEffect, useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  empresasApi,
  EmpresaDetalle,
  EstadoEmpresa,
} from "@/librerias/api/empresas.api";
import { useAuthStore } from "@/store/auth-store";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Key,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  MoreHorizontal,
  ArrowRight,
  Mail,
  Phone,
  MessageSquare,
  Copy,
  Check,
  Ban,
  RotateCcw,
  Plus,
  X,
  FileText,
  Calendar,
  Coins,
} from "lucide-react";
import {
  obtenerEsquemaEmpresa,
  formatearComisionTexto,
} from "@/librerias/comisiones";

export default function AdminEmpresasPage() {
  const router = useRouter();
  const { usuario } = useAuthStore();
  const [empresas, setEmpresas] = useState<EmpresaDetalle[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoEmpresa | "TODAS">("TODAS");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<EmpresaDetalle | null>(null);
  const [empresaCambioPassword, setEmpresaCambioPassword] = useState<EmpresaDetalle | null>(null);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [copiadoRuc, setCopiadoRuc] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const cargarEmpresas = async () => {
    try {
      setCargando(true);
      setErrorPermisos(null);
      const res = await empresasApi.listarEmpresasAdmin();
      setEmpresas(res);
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.includes("permisos")) {
        setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Administrador de Plataforma (ADMIN).");
      } else {
        setMensaje({
          tipo: "error",
          texto: err.message || "Error al cargar el listado de empresas",
        });
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const handleCambiarEstado = async (
    publicId: string,
    nuevoEstado: EstadoEmpresa,
    motivo: string
  ) => {
    startTransition(async () => {
      try {
        const actualizada = await empresasApi.cambiarEstadoEmpresa(
          publicId,
          nuevoEstado,
          motivo
        );
        setEmpresas((prev) =>
          prev.map((e) => (e.publicId === publicId ? actualizada : e))
        );
        if (empresaSeleccionada?.publicId === publicId) {
          setEmpresaSeleccionada(actualizada);
        }
        setMensaje({
          tipo: "exito",
          texto: `Distribuidora "${actualizada.nombreComercial}" actualizada a ${nuevoEstado}.`,
        });
      } catch (err: any) {
        setMensaje({
          tipo: "error",
          texto: err.message || "Error al cambiar el estado de la empresa",
        });
      }
    });
  };

  const handleGuardarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaCambioPassword) return;

    if (!nuevaPassword || nuevaPassword.length < 6) {
      alert("La nueva contraseña debe tener un mínimo de 6 caracteres.");
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      alert("Las contraseñas no coinciden. Por favor verifique.");
      return;
    }

    try {
      setGuardandoPassword(true);
      await empresasApi.cambiarPasswordEmpresaAdmin(
        empresaCambioPassword.publicId,
        nuevaPassword
      );
      setMensaje({
        tipo: "exito",
        texto: `Contraseña actualizada para ${empresaCambioPassword.nombreComercial}.`,
      });
      setEmpresaCambioPassword(null);
      setNuevaPassword("");
      setConfirmarPassword("");
    } catch (err: any) {
      alert(err.message || "Error al cambiar la contraseña");
    } finally {
      setGuardandoPassword(false);
    }
  };

  const generarPasswordSegura = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNuevaPassword(pass);
    setConfirmarPassword(pass);
    setMostrarPassword(true);
  };

  const copiarAlPortapapeles = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoRuc(id);
    setTimeout(() => setCopiadoRuc(null), 2000);
  };

  // Conteos
  const total = empresas.length;
  const pendientes = useMemo(() => empresas.filter((e) => e.estado === "PENDIENTE").length, [empresas]);
  const aprobadas = useMemo(() => empresas.filter((e) => e.estado === "APROBADA").length, [empresas]);
  const suspendidas = useMemo(() => empresas.filter((e) => e.estado === "SUSPENDIDA").length, [empresas]);
  const rechazadas = useMemo(() => empresas.filter((e) => e.estado === "RECHAZADA").length, [empresas]);

  // Filtrado
  const empresasFiltradas = useMemo(() => {
    return empresas.filter((e) => {
      const coincideEstado =
        filtroEstado === "TODAS" ? true : e.estado === filtroEstado;
      const q = busqueda.trim().toLowerCase();
      const coincideBusqueda =
        !q ||
        e.nombreComercial.toLowerCase().includes(q) ||
        e.ruc.includes(q) ||
        (e.razonSocial && e.razonSocial.toLowerCase().includes(q)) ||
        (e.emailContacto && e.emailContacto.toLowerCase().includes(q));
      return coincideEstado && coincideBusqueda;
    });
  }, [empresas, filtroEstado, busqueda]);

  const getBadgeEstado = (estado: EstadoEmpresa) => {
    switch (estado) {
      case "APROBADA":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Activa
          </span>
        );
      case "PENDIENTE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pendiente
          </span>
        );
      case "SUSPENDIDA":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Suspendida
          </span>
        );
      case "RECHAZADA":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-600 border border-neutral-300 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            Rechazada
          </span>
        );
    }
  };

  const getInitials = (nombre: string) => {
    if (!nombre) return "DG";
    const parts = nombre.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-full py-3 px-3 sm:px-6 space-y-3 text-xs">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="ADMIN"
          mensaje={errorPermisos}
          onExito={cargarEmpresas}
        />
      )}

      {/* Encabezado Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Distribuidoras de Gas
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-900">
                Multi-Tenant
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Aprobación, supervisión y administración de distribuidoras afiliadas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={cargarEmpresas}
            disabled={cargando || isPending}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${cargando ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </Button>

          <Button
            size="sm"
            asChild
            className="h-7 px-3 text-xs gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            <Link href="/auth/registro-empresa">
              <Plus className="w-3.5 h-3.5" />
              <span>Afiliar Distribuidora</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Alerta de Notificación Compacta */}
      {mensaje && (
        <div
          className={`py-2 px-3 rounded-lg flex items-center justify-between text-xs shadow-2xs border ${
            mensaje.tipo === "exito"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {mensaje.tipo === "exito" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{mensaje.texto}</span>
          </div>
          <button
            onClick={() => setMensaje(null)}
            className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards Ultracompactas (Tira Horizontal) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Total Empresas</p>
            <p className="text-lg font-bold leading-tight mt-0.5">{total}</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className={`p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between ${pendientes > 0 ? "border-amber-300 dark:border-amber-800 bg-amber-50/20" : ""}`}>
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Por Aprobar</p>
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400 leading-tight mt-0.5">{pendientes}</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Activas</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">{aprobadas}</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Suspendidas</p>
            <p className="text-lg font-bold text-rose-600 dark:text-rose-400 leading-tight mt-0.5">{suspendidas}</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center">
            <Ban className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda Compacta en 1 Sola Línea */}
      <div className="p-2 rounded-lg border bg-card shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        {/* Pestañas de Estado Compactas */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setFiltroEstado("TODAS")}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              filtroEstado === "TODAS"
                ? "bg-foreground text-background shadow-2xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span>Todas</span>
            <span className="px-1 py-0.1 rounded text-[10px] bg-black/10 dark:bg-white/15">
              {total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstado("PENDIENTE")}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              filtroEstado === "PENDIENTE"
                ? "bg-amber-600 text-white shadow-2xs"
                : "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            }`}
          >
            <span>Pendientes</span>
            <span className={`px-1 py-0.1 rounded text-[10px] ${filtroEstado === "PENDIENTE" ? "bg-white/20" : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"}`}>
              {pendientes}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstado("APROBADA")}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              filtroEstado === "APROBADA"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            }`}
          >
            <span>Activas</span>
            <span className={`px-1 py-0.1 rounded text-[10px] ${filtroEstado === "APROBADA" ? "bg-white/20" : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"}`}>
              {aprobadas}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroEstado("SUSPENDIDA")}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              filtroEstado === "SUSPENDIDA"
                ? "bg-rose-600 text-white shadow-2xs"
                : "text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            }`}
          >
            <span>Suspendidas</span>
            <span className={`px-1 py-0.1 rounded text-[10px] ${filtroEstado === "SUSPENDIDA" ? "bg-white/20" : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"}`}>
              {suspendidas}
            </span>
          </button>

          {rechazadas > 0 && (
            <button
              type="button"
              onClick={() => setFiltroEstado("RECHAZADA")}
              className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                filtroEstado === "RECHAZADA"
                  ? "bg-neutral-600 text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <span>Rechazadas</span>
              <span className="px-1 py-0.1 rounded text-[10px] bg-neutral-200 dark:bg-neutral-800">
                {rechazadas}
              </span>
            </button>
          )}
        </div>

        {/* Búsqueda y Conteo Compacto */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2" />
            <Input
              type="text"
              placeholder="Buscar RUC, nombre, contacto..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-8 pr-7 h-7 text-xs bg-muted/30 focus:bg-background"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-2 top-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap hidden sm:inline">
            <strong className="text-foreground">{empresasFiltradas.length}</strong>/{total}
          </span>
        </div>
      </div>

      {/* Tabla Compacta de Alta Densidad */}
      <div className="rounded-lg border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/60 border-b text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2">Distribuidora</th>
                <th className="px-3 py-2">RUC</th>
                <th className="px-3 py-2">Contacto</th>
                <th className="px-3 py-2">Comisión</th>
                <th className="px-3 py-2 text-center">Estado</th>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3.5 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cargando ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-orange-600" />
                      <span className="text-xs">Cargando distribuidoras...</span>
                    </div>
                  </td>
                </tr>
              ) : empresasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                      <Building2 className="w-6 h-6 text-muted-foreground/50" />
                      <p className="text-xs font-semibold text-foreground">No se encontraron resultados</p>
                      <p className="text-[11px]">Prueba con otros términos o limpia los filtros.</p>
                      {(busqueda || filtroEstado !== "TODAS") && (
                        <button
                          type="button"
                          onClick={() => {
                            setBusqueda("");
                            setFiltroEstado("TODAS");
                          }}
                          className="mt-1 text-xs text-orange-600 hover:underline font-medium"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                empresasFiltradas.map((emp) => (
                  <tr
                    key={emp.publicId}
                    className="hover:bg-muted/40 transition group"
                  >
                    {/* 1. Distribuidora Compacta */}
                    <td className="px-3.5 py-2.5 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-orange-200 dark:border-orange-900">
                          {getInitials(emp.nombreComercial)}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/empresas/${emp.publicId}`}
                            className="font-semibold text-foreground hover:text-orange-600 transition block truncate text-xs"
                            title={emp.nombreComercial}
                          >
                            {emp.nombreComercial}
                          </Link>
                          {emp.razonSocial && (
                            <p className="text-[10px] text-muted-foreground truncate max-w-sm lg:max-w-md" title={emp.razonSocial}>
                              {emp.razonSocial}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 2. RUC */}
                    <td className="px-3 py-2.5 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[11px] font-semibold text-foreground">
                          {emp.ruc}
                        </span>
                        <button
                          type="button"
                          onClick={() => copiarAlPortapapeles(emp.ruc, emp.publicId)}
                          className="p-0.5 rounded text-muted-foreground hover:text-foreground transition cursor-pointer"
                          title="Copiar RUC"
                        >
                          {copiadoRuc === emp.publicId ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-60 hover:opacity-100" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* 3. Contacto Compacto */}
                    <td className="px-3 py-2.5 align-middle">
                      <div className="flex flex-col gap-0.5">
                        <a
                          href={`mailto:${emp.emailContacto}`}
                          className="text-[11px] text-foreground hover:text-orange-600 transition truncate max-w-xs lg:max-w-sm"
                          title={emp.emailContacto}
                        >
                          {emp.emailContacto}
                        </a>

                        {emp.telefono ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {emp.telefono}
                            </span>
                            <a
                              href={`https://wa.me/${(emp.telefono || "").replace(/\D/g, "").length === 9 ? "51" + (emp.telefono || "").replace(/\D/g, "") : (emp.telefono || "").replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-1 py-0.1 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 transition"
                              title="WhatsApp"
                            >
                              WA
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </td>

                    {/* 4. Comisión */}
                    <td className="px-3 py-2.5 align-middle whitespace-nowrap">
                      {(() => {
                        const esq = obtenerEsquemaEmpresa(emp.publicId);
                        return (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/20">
                            <Coins className="w-3 h-3" />
                            {formatearComisionTexto(esq)}
                          </span>
                        );
                      })()}
                    </td>

                    {/* 5. Estado */}
                    <td className="px-3 py-2.5 align-middle text-center">
                      {getBadgeEstado(emp.estado)}
                    </td>

                    {/* 6. Fecha */}
                    <td className="px-3 py-2.5 align-middle whitespace-nowrap text-muted-foreground text-[11px]">
                      {new Date(emp.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "2-digit" })}
                    </td>

                    {/* 7. Acciones Compactas (Solo Iconos) */}
                    <td className="px-3 py-2 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {/* Botón Icono: Ficha / Estadísticas */}
                        <Link
                          href={`/admin/empresas/${emp.publicId}`}
                          className="h-7 w-7 rounded-md border border-input bg-background hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 dark:hover:bg-orange-950/40 flex items-center justify-center transition shadow-2xs text-muted-foreground"
                          title="Ver Estadísticas y Ficha Completa"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </Link>

                        {/* Botón Icono: Vista Rápida Modal */}
                        <button
                          type="button"
                          onClick={() => setEmpresaSeleccionada(emp)}
                          className="h-7 w-7 rounded-md border border-input bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition shadow-2xs cursor-pointer"
                          title="Vista Rápida de Datos"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Botón Icono: Clave / Contraseña */}
                        <button
                          type="button"
                          onClick={() => {
                            setEmpresaCambioPassword(emp);
                            setNuevaPassword("");
                            setConfirmarPassword("");
                            setMostrarPassword(false);
                          }}
                          className="h-7 w-7 rounded-md border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/30 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50 flex items-center justify-center transition shadow-2xs cursor-pointer"
                          title="Cambiar Contraseña"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        {/* Botones Icono de Estado */}
                        {emp.estado === "PENDIENTE" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleCambiarEstado(
                                  emp.publicId,
                                  "APROBADA",
                                  "Aprobado por Super Admin"
                                )
                              }
                              disabled={isPending}
                              className="h-7 w-7 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                              title="Aprobar Distribuidora"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleCambiarEstado(
                                  emp.publicId,
                                  "RECHAZADA",
                                  "Documentación rechazada"
                                )
                              }
                              disabled={isPending}
                              className="h-7 w-7 rounded-md border border-input bg-background hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition shadow-2xs cursor-pointer"
                              title="Rechazar Solicitud"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}

                        {emp.estado === "APROBADA" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCambiarEstado(
                                emp.publicId,
                                "SUSPENDIDA",
                                "Suspensión preventiva por Super Admin"
                              )
                            }
                            disabled={isPending}
                            className="h-7 w-7 rounded-md border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center justify-center transition shadow-2xs cursor-pointer"
                            title="Suspender Operaciones"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {emp.estado === "SUSPENDIDA" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCambiarEstado(
                                emp.publicId,
                                "APROBADA",
                                "Reactivación de operaciones por Super Admin"
                              )
                            }
                            disabled={isPending}
                            className="h-7 w-7 rounded-md border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 flex items-center justify-center transition shadow-2xs cursor-pointer"
                            title="Reactivar Distribuidora"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {emp.estado === "RECHAZADA" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleCambiarEstado(
                                emp.publicId,
                                "PENDIENTE",
                                "Reabrir evaluación por Super Admin"
                              )
                            }
                            disabled={isPending}
                            className="h-7 w-7 rounded-md border border-amber-200 dark:border-amber-900 bg-amber-50/60 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition shadow-2xs cursor-pointer"
                            title="Reabrir Evaluación"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalle Rápido Compacto */}
      {empresaSeleccionada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-card text-card-foreground border rounded-xl max-w-md w-full p-4 sm:p-5 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex justify-between items-start border-b pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950 font-bold text-xs flex items-center justify-center">
                  {getInitials(empresaSeleccionada.nombreComercial)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {empresaSeleccionada.nombreComercial}
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    ID: {empresaSeleccionada.publicId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEmpresaSeleccionada(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs divide-y divide-border">
              <div className="pt-1.5 flex justify-between">
                <span className="text-muted-foreground">RUC:</span>
                <span className="font-mono font-bold text-foreground">{empresaSeleccionada.ruc}</span>
              </div>
              <div className="pt-1.5 flex justify-between">
                <span className="text-muted-foreground">Razón Social:</span>
                <span className="font-medium text-foreground text-right max-w-[240px] truncate">
                  {empresaSeleccionada.razonSocial || "—"}
                </span>
              </div>
              <div className="pt-1.5 flex justify-between items-center">
                <span className="text-muted-foreground">Email:</span>
                <a href={`mailto:${empresaSeleccionada.emailContacto}`} className="text-orange-600 hover:underline font-medium">
                  {empresaSeleccionada.emailContacto}
                </a>
              </div>
              <div className="pt-1.5 flex justify-between items-center">
                <span className="text-muted-foreground">Teléfono:</span>
                <span className="font-mono">{empresaSeleccionada.telefono || "—"}</span>
              </div>
              <div className="pt-1.5 flex justify-between">
                <span className="text-muted-foreground">Dirección:</span>
                <span className="text-right text-foreground max-w-[240px] truncate">
                  {empresaSeleccionada.direccionFiscal || "—"}
                </span>
              </div>
              <div className="pt-1.5 flex justify-between items-center">
                <span className="text-muted-foreground">Estado:</span>
                {getBadgeEstado(empresaSeleccionada.estado)}
              </div>
              <div className="pt-1.5 flex justify-between items-center">
                <span className="text-muted-foreground">Comisión Plataforma:</span>
                {(() => {
                  const esq = obtenerEsquemaEmpresa(empresaSeleccionada.publicId);
                  return (
                    <span className="inline-flex items-center gap-1 font-semibold text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded text-[11px] border border-orange-500/20">
                      <Coins className="w-3 h-3" />
                      {formatearComisionTexto(esq)} ({esq.tipo === "FIJA" ? "Fijo por pedido" : "Sobre venta"})
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmpresaSeleccionada(null)}
                className="h-7 text-xs"
              >
                Cerrar
              </Button>
              <Button
                size="sm"
                asChild
                className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white gap-1"
              >
                <Link href={`/admin/empresas/${empresaSeleccionada.publicId}`}>
                  <span>Ver Ficha Completa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña Compacto */}
      {empresaCambioPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-card text-card-foreground border rounded-xl max-w-sm w-full p-4 sm:p-5 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex justify-between items-start border-b pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Cambiar Contraseña
                  </h3>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                    {empresaCambioPassword.nombreComercial}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmpresaCambioPassword(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-muted/40 p-2.5 rounded-lg text-[11px] space-y-1 border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">RUC:</span>
                <span className="font-mono font-semibold">{empresaCambioPassword.ruc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Admin:</span>
                <span className="font-semibold text-foreground truncate max-w-[180px]">
                  {empresaCambioPassword.adminEmail || empresaCambioPassword.emailContacto}
                </span>
              </div>
            </div>

            <form onSubmit={handleGuardarPassword} className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-foreground">
                    Nueva Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={generarPasswordSegura}
                    className="text-[10px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    Generar segura
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={mostrarPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    className="pr-8 h-8 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    {mostrarPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">
                  Confirmar Contraseña
                </label>
                <Input
                  type={mostrarPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Repita la contraseña"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEmpresaCambioPassword(null)}
                  className="h-7 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={guardandoPassword}
                  className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold gap-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>{guardandoPassword ? "Guardando..." : "Guardar"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
