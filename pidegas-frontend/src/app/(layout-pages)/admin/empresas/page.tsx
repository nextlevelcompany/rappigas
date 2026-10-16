"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  empresasApi,
  EmpresaDetalle,
  EstadoEmpresa,
} from "@/librerias/api/empresas.api";
import { useAuthStore } from "@/store/auth-store";
import {
  BuildingHouse,
  CheckCircle,
  XCircle,
  Timer,
  RefreshCw,
  Search,
} from "@boxicons/react";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import { Key, Lock, Eye, EyeOff, Sparkles, ShieldCheck } from "lucide-react";

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
          texto: `Distribuidora ${actualizada.nombreComercial} actualizada a ${nuevoEstado}.`,
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
        texto: `Contraseña actualizada exitosamente para la distribuidora ${empresaCambioPassword.nombreComercial}.`,
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

  // Métricas
  const total = empresas.length;
  const pendientes = empresas.filter((e) => e.estado === "PENDIENTE").length;
  const aprobadas = empresas.filter((e) => e.estado === "APROBADA").length;
  const suspendidas = empresas.filter((e) => e.estado === "SUSPENDIDA").length;

  // Filtrado
  const empresasFiltradas = empresas.filter((e) => {
    const coincideEstado =
      filtroEstado === "TODAS" ? true : e.estado === filtroEstado;
    const coincideBusqueda =
      e.nombreComercial.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.ruc.includes(busqueda) ||
      (e.razonSocial && e.razonSocial.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideEstado && coincideBusqueda;
  });

  const getBadgeEstado = (estado: EstadoEmpresa) => {
    switch (estado) {
      case "APROBADA":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Aprobada / Activa
          </span>
        );
      case "PENDIENTE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Pendiente Aprobación
          </span>
        );
      case "SUSPENDIDA":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Suspendida
          </span>
        );
      case "RECHAZADA":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-500"></span>
            Rechazada
          </span>
        );
    }
  };

  return (
    <div className="p-6 w-full space-y-6">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="ADMIN"
          mensaje={errorPermisos}
          onExito={cargarEmpresas}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
              Módulo Multi-Tenant
            </span>
            <span className="text-xs text-neutral-500">Super Admin</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
            Gestión de Distribuidoras de Gas
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Aprobación, supervisión y auditoría de empresas en la plataforma PideGas.
          </p>
        </div>
        <button
          onClick={cargarEmpresas}
          disabled={cargando || isPending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* Alertas */}
      {mensaje && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            mensaje.tipo === "exito"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <span>{mensaje.texto}</span>
          <button
            onClick={() => setMensaje(null)}
            className="text-xs font-bold hover:underline ml-4"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">Total Empresas</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950">
              <BuildingHouse className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2">{total}</div>
          <p className="text-xs text-neutral-400 mt-1">Registradas en sistema</p>
        </div>

        <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">Pendientes</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950">
              <Timer className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 text-amber-600">{pendientes}</div>
          <p className="text-xs text-neutral-400 mt-1">Requieren revisión</p>
        </div>

        <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">Aprobadas</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 text-emerald-600">{aprobadas}</div>
          <p className="text-xs text-neutral-400 mt-1">Operando activamente</p>
        </div>

        <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">Suspendidas</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 text-rose-600">{suspendidas}</div>
          <p className="text-xs text-neutral-400 mt-1">Acceso restringido</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(["TODAS", "PENDIENTE", "APROBADA", "SUSPENDIDA"] as const).map((est) => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filtroEstado === est
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              {est === "TODAS" ? "Todas" : est.charAt(0) + est.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por RUC, nombre o razón social..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Tabla de Distribuidoras */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900 border-b text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Empresa / Distribuidora</th>
                <th className="px-6 py-3.5">RUC</th>
                <th className="px-6 py-3.5">Contacto</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5">Fecha Registro</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {cargando ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    Cargando distribuidoras...
                  </td>
                </tr>
              ) : empresasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                    No se encontraron distribuidoras con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                empresasFiltradas.map((emp) => (
                  <tr
                    key={emp.publicId}
                    className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition cursor-pointer"
                    onClick={() => router.push(`/admin/empresas/${emp.publicId}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100 hover:text-orange-600 transition">
                        {emp.nombreComercial}
                      </div>
                      <div className="text-xs text-neutral-500">{emp.razonSocial || "—"}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{emp.ruc}</td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="text-xs text-neutral-900 dark:text-neutral-200">
                        <a href={`mailto:${emp.emailContacto}`} className="hover:text-orange-600 hover:underline">
                          {emp.emailContacto}
                        </a>
                      </div>
                      {emp.telefono ? (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <a href={`tel:${emp.telefono}`} className="text-xs text-neutral-500 hover:text-emerald-600 font-medium">
                            {emp.telefono}
                          </a>
                          <a
                            href={`https://wa.me/${(emp.telefono || "").replace(/\D/g, "").length === 9 ? "51" + (emp.telefono || "").replace(/\D/g, "") : (emp.telefono || "").replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold hover:bg-emerald-200 transition"
                          >
                            WhatsApp
                          </a>
                        </div>
                      ) : (
                        <div className="text-xs text-neutral-400">—</div>
                      )}
                    </td>
                    <td className="px-6 py-4">{getBadgeEstado(emp.estado)}</td>
                    <td className="px-6 py-4 text-xs text-neutral-500">
                      {new Date(emp.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/admin/empresas/${emp.publicId}`}
                        className="px-3 py-1 text-xs font-semibold rounded bg-orange-600 text-white hover:bg-orange-700 transition inline-block"
                      >
                        Ver Estadísticas & Ficha
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setEmpresaCambioPassword(emp);
                          setNuevaPassword("");
                          setConfirmarPassword("");
                          setMostrarPassword(false);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition inline-flex items-center gap-1"
                        title="Cambiar contraseña del administrador de la distribuidora"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>Clave</span>
                      </button>
                      {emp.estado === "PENDIENTE" && (
                        <>
                          <button
                            onClick={() =>
                              handleCambiarEstado(
                                emp.publicId,
                                "APROBADA",
                                "Aprobado por Super Admin"
                              )
                            }
                            disabled={isPending}
                            className="px-3 py-1 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 transition"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() =>
                              handleCambiarEstado(
                                emp.publicId,
                                "RECHAZADA",
                                "Documentación rechazada"
                              )
                            }
                            disabled={isPending}
                            className="px-3 py-1 text-xs font-semibold rounded bg-neutral-200 text-neutral-700 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 transition"
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                      {emp.estado === "APROBADA" && (
                        <button
                          onClick={() =>
                            handleCambiarEstado(
                              emp.publicId,
                              "SUSPENDIDA",
                              "Suspensión por Super Admin"
                            )
                          }
                          disabled={isPending}
                          className="px-3 py-1 text-xs font-semibold rounded bg-rose-600 text-white hover:bg-rose-700 transition"
                        >
                          Suspender
                        </button>
                      )}
                      {emp.estado === "SUSPENDIDA" && (
                        <button
                          onClick={() =>
                            handleCambiarEstado(
                              emp.publicId,
                              "APROBADA",
                              "Reactivada por Super Admin"
                            )
                          }
                          disabled={isPending}
                          className="px-3 py-1 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 transition"
                        >
                          Reactivar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalle de Distribuidora */}
      {empresaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">
                  {empresaSeleccionada.nombreComercial}
                </h3>
                <p className="text-xs text-neutral-500 font-mono">
                  UUID: {empresaSeleccionada.publicId}
                </p>
              </div>
              <button
                onClick={() => setEmpresaSeleccionada(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm divide-y dark:divide-neutral-800">
              <div className="pt-2 flex justify-between">
                <span className="text-neutral-500">RUC:</span>
                <span className="font-semibold">{empresaSeleccionada.ruc}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-neutral-500">Razón Social:</span>
                <span className="font-semibold text-right">
                  {empresaSeleccionada.razonSocial || "—"}
                </span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-neutral-500">Email Contacto:</span>
                <a href={`mailto:${empresaSeleccionada.emailContacto}`} className="text-orange-600 hover:underline font-medium">
                  {empresaSeleccionada.emailContacto}
                </a>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-neutral-500">Teléfono / WhatsApp:</span>
                <div className="flex items-center gap-2">
                  <a href={`tel:${empresaSeleccionada.telefono}`} className="font-semibold hover:underline">
                    {empresaSeleccionada.telefono || "—"}
                  </a>
                  {empresaSeleccionada.telefono && (
                    <a
                      href={`https://wa.me/${(empresaSeleccionada.telefono || "").replace(/\D/g, "").length === 9 ? "51" + (empresaSeleccionada.telefono || "").replace(/\D/g, "") : (empresaSeleccionada.telefono || "").replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded text-xs bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                    >
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-neutral-500">Dirección Fiscal:</span>
                <span className="text-right">
                  {empresaSeleccionada.direccionFiscal || "—"}
                </span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <span className="text-neutral-500">Estado Multi-Tenant:</span>
                {getBadgeEstado(empresaSeleccionada.estado)}
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-neutral-500">Fecha de Afiliación:</span>
                <span>
                  {new Date(empresaSeleccionada.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-2 border-t dark:border-neutral-800">
              <button
                onClick={() => setEmpresaSeleccionada(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition"
              >
                Cerrar
              </button>
              <Link
                href={`/admin/empresas/${empresaSeleccionada.publicId}`}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition"
              >
                Ver Ficha, Estadísticas & Contactos &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambiar Contraseña */}
      {empresaCambioPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b pb-4 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Cambiar Contraseña
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {empresaCambioPassword.nombreComercial}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEmpresaCambioPassword(null)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-900 p-3.5 rounded-2xl text-xs space-y-1.5 border border-neutral-200/80 dark:border-neutral-800">
              <div className="flex justify-between">
                <span className="text-neutral-500">RUC:</span>
                <span className="font-mono font-semibold">{empresaCambioPassword.ruc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Usuario Administrador:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[220px]">
                  {empresaCambioPassword.adminEmail || empresaCambioPassword.emailContacto}
                </span>
              </div>
              {empresaCambioPassword.adminNombre && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Titular:</span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {empresaCambioPassword.adminNombre}
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleGuardarPassword} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Nueva Contraseña *
                  </label>
                  <button
                    type="button"
                    onClick={generarPasswordSegura}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generar segura
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={mostrarPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                  >
                    {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  type={mostrarPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Repita la contraseña"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEmpresaCambioPassword(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoPassword}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{guardandoPassword ? "Guardando..." : "Actualizar Contraseña"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
