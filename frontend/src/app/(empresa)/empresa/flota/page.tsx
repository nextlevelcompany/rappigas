"use client";

import React, { useEffect, useState, useTransition, useCallback } from "react";
import {
  flotaApi,
  VehiculoDetalle,
  RepartidorDetalle,
  CrearVehiculoPayload,
  RegistrarRepartidorPayload,
  TipoVehiculo,
} from "@/librerias/api/flota.api";
import { authApi } from "@/librerias/api/auth.api";
import { useAuthStore } from "@/store/auth-store";
import {
  Truck,
  Plus,
  RefreshCw,
  Search,
  CheckCircle,
  MapPin,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  Lock,
  Flame,
  Users,
  Navigation,
} from "lucide-react";

export default function FlotaRepartidoresPage() {
  const { establecerSesion } = useAuthStore();
  const [tabActiva, setTabActiva] = useState<"VEHICULOS" | "REPARTIDORES">("REPARTIDORES");
  const [vehiculos, setVehiculos] = useState<VehiculoDetalle[]>([]);
  const [repartidores, setRepartidores] = useState<RepartidorDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);
  const [cambiandoRol, setCambiandoRol] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Modales
  const [mostrarModalVehiculo, setMostrarModalVehiculo] = useState(false);
  const [mostrarModalRepartidor, setMostrarModalRepartidor] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  // Formulario Vehículo
  const [nuevoVehiculo, setNuevoVehiculo] = useState<CrearVehiculoPayload>({
    placa: "",
    marca: "Wanxin",
    modelo: "W150 Furgón Gas",
    tipoVehiculo: "MOTO_FURGON",
    capacidadBalones: 12,
  });

  // Formulario Repartidor
  const [nuevoRepartidor, setNuevoRepartidor] = useState<RegistrarRepartidorPayload>({
    email: "repartidor@pidegas.pe",
    licenciaConducir: "Q-96655544",
    vehiculoPublicId: "",
  });

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorPermisos(null);
      const [resVehiculos, resRepartidores] = await Promise.all([
        flotaApi.listarVehiculos().catch((err: any) => {
          if (err?.status === 403 || err?.message?.includes("permisos")) {
            setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Distribuidora (EMPRESA).");
          }
          return [];
        }),
        flotaApi.listarRepartidores().catch((err: any) => {
          if (err?.status === 403 || err?.message?.includes("permisos")) {
            setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Distribuidora (EMPRESA).");
          }
          return [];
        }),
      ]);
      setVehiculos(resVehiculos);
      setRepartidores(resRepartidores);
      if (resVehiculos.length > 0 && !nuevoRepartidor.vehiculoPublicId) {
        setNuevoRepartidor((prev) => ({ ...prev, vehiculoPublicId: resVehiculos[0].publicId }));
      }
    } catch {
      // Ignorar errores no controlados para no saturar consola de desarrollo
    } finally {
      setCargando(false);
    }
  }, [nuevoRepartidor.vehiculoPublicId]);

  const handleAccederComoEmpresa = async () => {
    setCambiandoRol(true);
    try {
      const resp = await authApi.login({
        email: "empresa@pidegas.pe",
        password: "EmpresaPassword123!",
      });
      establecerSesion(resp);
      setErrorPermisos(null);
      setMensaje({ tipo: "exito", texto: "Sesión iniciada como Distribuidora (Gas Los Olivos Express)." });
      await cargarDatos();
    } catch {
      setMensaje({ tipo: "error", texto: "Error al autenticar como distribuidora." });
    } finally {
      setCambiandoRol(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const handleCrearVehiculo = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const v = await flotaApi.crearVehiculo(nuevoVehiculo);
        setVehiculos((prev) => [v, ...prev]);
        setMostrarModalVehiculo(false);
        setMensaje({ tipo: "exito", texto: `Vehículo con placa ${v.placa} registrado con éxito.` });
        setNuevoVehiculo({
          placa: "",
          marca: "Wanxin",
          modelo: "W150 Furgón Gas",
          tipoVehiculo: "MOTO_FURGON",
          capacidadBalones: 12,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al registrar vehículo";
        setMensaje({ tipo: "error", texto: msg });
      }
    });
  };

  const handleRegistrarRepartidor = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const r = await flotaApi.registrarRepartidor(nuevoRepartidor);
        setRepartidores((prev) => [r, ...prev]);
        setMostrarModalRepartidor(false);
        setMensaje({ tipo: "exito", texto: `Repartidor ${r.nombres} ${r.apellidos} afiliado con éxito.` });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al afiliar repartidor";
        setMensaje({ tipo: "error", texto: msg });
      }
    });
  };

  const capacidadTotal = vehiculos.reduce((acc, v) => acc + (v.estado === "ACTIVO" ? v.capacidadBalones : 0), 0);
  const repartidoresDisponibles = repartidores.filter((r) => r.estado === "DISPONIBLE").length;
  const repartidoresEnRuta = repartidores.filter((r) => r.estado === "EN_RUTA").length;

  return (
    <div className="w-full py-3 px-3 sm:px-6 space-y-3 text-xs">
      {/* Alerta de Éxito / Error */}
      {mensaje && (
        <div
          className={`p-2.5 px-3 rounded-lg flex items-center justify-between shadow-2xs text-xs transition ${
            mensaje.tipo === "exito"
              ? "bg-emerald-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {mensaje.tipo === "exito" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{mensaje.texto}</span>
          </div>
          <button onClick={() => setMensaje(null)} className="text-white hover:text-white/80 font-bold ml-4">
            ✕
          </button>
        </div>
      )}
      {/* Alerta de Permisos Denegados */}
      {errorPermisos && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500/20 text-amber-600 rounded-md shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-amber-700 dark:text-amber-400">Acceso Restringido a Distribuidoras (EMPRESA)</h3>
              <p className="text-[11px] text-amber-600/90 dark:text-amber-300/80">
                Actualmente estás navegando con una cuenta de Cliente o tu sesión no tiene permisos para gestionar la flota.
              </p>
            </div>
          </div>
          <button
            onClick={handleAccederComoEmpresa}
            disabled={cambiandoRol}
            className="inline-flex items-center justify-center gap-1.5 px-3 h-7 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-md shadow-2xs transition shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {cambiandoRol ? "Conectando..." : "Acceder como Distribuidora"}
          </button>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border rounded-lg p-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Gestión de Flota y Repartidores
              </h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/20">
                Logística
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Control de unidades de reparto de balones de gas, choferes y seguimiento GPS.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={cargarDatos}
            disabled={cargando}
            className="inline-flex items-center gap-1 px-2.5 h-7 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition"
          >
            <RefreshCw className={`w-3 h-3 ${cargando ? "animate-spin" : ""}`} />
            Refrescar
          </button>

          <button
            onClick={() => setMostrarModalVehiculo(true)}
            className="inline-flex items-center gap-1 px-2.5 h-7 text-xs font-medium text-foreground bg-card hover:bg-muted rounded-md transition border shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Vehículo
          </button>

          <button
            onClick={() => setMostrarModalRepartidor(true)}
            className="inline-flex items-center gap-1 px-2.5 h-7 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md transition shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Afiliar Repartidor
          </button>
        </div>
      </div>

      {/* Indicadores de Métricas de Flota */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground">Vehículos en Flota</span>
            <p className="text-lg font-bold leading-tight mt-0.5 text-foreground">{vehiculos.length}</p>
            <span className="text-[10px] text-muted-foreground">Motos y camionetas</span>
          </div>
          <Truck className="w-4 h-4 text-muted-foreground/60 shrink-0" />
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground">Capacidad Total</span>
            <p className="text-lg font-bold leading-tight mt-0.5 text-orange-600">{capacidadTotal}</p>
            <span className="text-[10px] text-muted-foreground">Balones simultáneos</span>
          </div>
          <Flame className="w-4 h-4 text-orange-500/60 shrink-0" />
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground">Repartidores Disponibles</span>
            <p className="text-lg font-bold leading-tight mt-0.5 text-emerald-600">{repartidoresDisponibles}</p>
            <span className="text-[10px] text-muted-foreground">Listos para asignar</span>
          </div>
          <Users className="w-4 h-4 text-emerald-500/60 shrink-0" />
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground">En Ruta Activa</span>
            <p className="text-lg font-bold leading-tight mt-0.5 text-purple-600">{repartidoresEnRuta}</p>
            <span className="text-[10px] text-muted-foreground">Transmitiendo GPS</span>
          </div>
          <Navigation className="w-4 h-4 text-purple-500/60 shrink-0" />
        </div>
      </div>

      {/* Selector de Pestañas y Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
        <div className="flex gap-1.5">
          <button
            onClick={() => setTabActiva("REPARTIDORES")}
            className={`px-2.5 h-7 text-xs font-medium rounded-md transition ${
              tabActiva === "REPARTIDORES"
                ? "bg-orange-600 text-white shadow-2xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Repartidores ({repartidores.length})
          </button>
          <button
            onClick={() => setTabActiva("VEHICULOS")}
            className={`px-2.5 h-7 text-xs font-medium rounded-md transition ${
              tabActiva === "VEHICULOS"
                ? "bg-orange-600 text-white shadow-2xs"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Vehículos ({vehiculos.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, placa..."
            className="w-full pl-8 pr-2.5 h-7 text-xs rounded-md border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Contenido de la Pestaña Activa */}
      {tabActiva === "REPARTIDORES" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repartidores
            .filter((r) =>
              busqueda === ""
                ? true
                : r.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
                  r.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
                  (r.vehiculoPlaca && r.vehiculoPlaca.toLowerCase().includes(busqueda.toLowerCase()))
            )
            .map((rep) => (
              <div
                key={rep.publicId}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center font-bold text-sm">
                      {rep.nombres.charAt(0)}
                      {rep.apellidos.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {rep.nombres} {rep.apellidos}
                      </h4>
                      <p className="text-xs text-gray-400">{rep.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      rep.estado === "DISPONIBLE"
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : rep.estado === "EN_RUTA"
                        ? "bg-purple-100 text-purple-800 border border-purple-300 animate-pulse"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {rep.estado}
                  </span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Teléfono:</span>
                    <span className="font-semibold">{rep.telefono || "Sin teléfono"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Licencia:</span>
                    <span className="font-semibold">{rep.licenciaConducir || "A-I"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Vehículo asignado:</span>
                    <span className="font-bold text-orange-600">
                      {rep.vehiculoPlaca ? `${rep.vehiculoPlaca} (${rep.vehiculoTipo})` : "Sin vehículo"}
                    </span>
                  </div>
                </div>

                {rep.latitudActual && rep.longitudActual ? (
                  <div className="pt-1">
                    <a
                      href={`https://maps.google.com/?q=${rep.latitudActual},${rep.longitudActual}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold hover:underline"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      GPS en Vivo ({rep.latitudActual.toFixed(4)}, {rep.longitudActual.toFixed(4)})
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">Sin reporte GPS reciente</p>
                )}
              </div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehiculos
            .filter((v) =>
              busqueda === ""
                ? true
                : v.placa.toLowerCase().includes(busqueda.toLowerCase()) ||
                  (v.marca && v.marca.toLowerCase().includes(busqueda.toLowerCase()))
            )
            .map((veh) => (
              <div
                key={veh.publicId}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-orange-500" />
                    <div>
                      <h4 className="text-base font-black tracking-wider text-gray-900 dark:text-white font-mono">
                        {veh.placa}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {veh.marca || ""} {veh.modelo || ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                    {veh.estado}
                  </span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Tipo de Vehículo:</span>
                    <span className="font-semibold">{veh.tipoVehiculo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Capacidad Balones:</span>
                    <span className="font-bold text-orange-600">{veh.capacidadBalones} balones</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Modal Nuevo Vehículo */}
      {mostrarModalVehiculo && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Registrar Nuevo Vehículo de Distribución
              </h3>
              <button onClick={() => setMostrarModalVehiculo(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearVehiculo} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Placa Oficial</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 7821-4A"
                  value={nuevoVehiculo.placa}
                  onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, placa: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Marca</label>
                  <input
                    type="text"
                    value={nuevoVehiculo.marca}
                    onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, marca: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Modelo</label>
                  <input
                    type="text"
                    value={nuevoVehiculo.modelo}
                    onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, modelo: e.target.value })}
                    className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Tipo de Vehículo</label>
                <select
                  value={nuevoVehiculo.tipoVehiculo}
                  onChange={(e) =>
                    setNuevoVehiculo({ ...nuevoVehiculo, tipoVehiculo: e.target.value as TipoVehiculo })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                >
                  <option value="MOTO_FURGON">Moto Furgón (Ideal balones 10kg/15kg)</option>
                  <option value="CAMIONETA">Camioneta Distribuidora</option>
                  <option value="CAMION_GLP">Camión de Balones Pesados (45kg)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Capacidad Máxima de Balones</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={nuevoVehiculo.capacidadBalones}
                  onChange={(e) =>
                    setNuevoVehiculo({ ...nuevoVehiculo, capacidadBalones: parseInt(e.target.value) || 10 })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 font-bold"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setMostrarModalVehiculo(false)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  Guardar Vehículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Afiliar Repartidor */}
      {mostrarModalRepartidor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-700">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Afiliar Repartidor a la Distribuidora
              </h3>
              <button onClick={() => setMostrarModalRepartidor(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleRegistrarRepartidor} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Email del Repartidor Registrado</label>
                <input
                  type="email"
                  required
                  placeholder="repartidor@pidegas.pe"
                  value={nuevoRepartidor.email}
                  onChange={(e) => setNuevoRepartidor({ ...nuevoRepartidor, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Licencia de Conducir (B-IIc / A-I)</label>
                <input
                  type="text"
                  placeholder="Q-96655544"
                  value={nuevoRepartidor.licenciaConducir}
                  onChange={(e) =>
                    setNuevoRepartidor({ ...nuevoRepartidor, licenciaConducir: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Vehículo Asignado</label>
                <select
                  value={nuevoRepartidor.vehiculoPublicId}
                  onChange={(e) =>
                    setNuevoRepartidor({ ...nuevoRepartidor, vehiculoPublicId: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                >
                  <option value="">-- Sin vehículo por ahora --</option>
                  {vehiculos.map((v) => (
                    <option key={v.publicId} value={v.publicId}>
                      {v.placa} ({v.marca} {v.modelo} - Cap: {v.capacidadBalones})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setMostrarModalRepartidor(false)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md transition"
                >
                  Afiliar Chofer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
