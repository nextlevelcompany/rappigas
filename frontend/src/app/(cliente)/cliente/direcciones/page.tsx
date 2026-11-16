"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  MapPin,
  Home,
  Briefcase,
  Building,
  Star,
  Bookmark,
  Plus,
  Edit3,
  Trash2,
  Check,
  Navigation,
  ShieldCheck,
  ArrowRight,
  Phone,
  Flame,
  ShoppingBag,
  X,
  Compass,
  Search,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth-store";
import {
  obtenerMisDirecciones,
  agregarDireccionCliente,
  actualizarDireccionCliente,
  eliminarDireccionCliente,
  establecerDireccionPredeterminada,
  guardarDireccionGas,
  DireccionClienteGuardada,
} from "@/librerias/carrito-gas";

// Import dinámico de Selector de Ubicación en Mapa con SSR desactivado
const SelectorUbicacionMapa = dynamic(
  () =>
    import("@/components/mapa/selector-ubicacion-mapa").then(
      (mod) => mod.SelectorUbicacionMapa
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-48 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 animate-pulse border border-slate-200">
        <MapPin className="w-6 h-6 text-orange-500 animate-bounce mb-1" />
        <span className="text-xs font-bold text-slate-700">
          Cargando mapa interactivo...
        </span>
      </div>
    ),
  }
);

export default function MisDireccionesClientePage() {
  const { usuario } = useAuthStore();
  const [direcciones, setDirecciones] = useState<DireccionClienteGuardada[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mostrarMapaModal, setMostrarMapaModal] = useState(false);
  const [direccionEnEdicion, setDireccionEnEdicion] = useState<DireccionClienteGuardada | null>(null);

  // Filtros y búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODAS");

  // Dirección enfocada en el panel de mapa lateral
  const [direccionEnfocadaId, setDireccionEnfocadaId] = useState<string | null>(null);

  // Campos de formulario modal
  const [etiqueta, setEtiqueta] = useState("Casa");
  const [tipoIcono, setTipoIcono] = useState<"casa" | "trabajo" | "departamento" | "familiar" | "otro">("casa");
  const [direccionExacta, setDireccionExacta] = useState("");
  const [distrito, setDistrito] = useState("Los Olivos");
  const [ciudad, setCiudad] = useState("Lima");
  const [departamento, setDepartamento] = useState("Lima");
  const [referencia, setReferencia] = useState("");
  const [telefono, setTelefono] = useState("");
  const [esPredeterminada, setEsPredeterminada] = useState(false);
  const [latitud, setLatitud] = useState<number>(-11.9912);
  const [longitud, setLongitud] = useState<number>(-77.0711);

  useEffect(() => {
    cargarDirecciones();
    const handleSync = () => cargarDirecciones();
    window.addEventListener("mis_direcciones_actualizadas", handleSync);
    return () => window.removeEventListener("mis_direcciones_actualizadas", handleSync);
  }, [usuario?.publicId]);

  const cargarDirecciones = () => {
    const data = obtenerMisDirecciones(usuario?.publicId);
    setDirecciones(data);
    if (!direccionEnfocadaId && data.length > 0) {
      const pred = data.find((d) => d.esPredeterminada) || data[0];
      setDireccionEnfocadaId(pred.id);
    }
  };

  const handleAbrirCrear = () => {
    setDireccionEnEdicion(null);
    setEtiqueta("Mi Casa");
    setTipoIcono("casa");
    setDireccionExacta("");
    setDistrito("Los Olivos");
    setCiudad("Lima");
    setDepartamento("Lima");
    setReferencia("");
    setTelefono("");
    setEsPredeterminada(direcciones.length === 0);
    setLatitud(-11.9912);
    setLongitud(-77.0711);
    setMostrarMapaModal(false);
    setModalAbierto(true);
  };

  const handleAbrirEditar = (dir: DireccionClienteGuardada) => {
    setDireccionEnEdicion(dir);
    setEtiqueta(dir.etiqueta);
    setTipoIcono(dir.tipoIcono);
    setDireccionExacta(dir.direccionExacta);
    setDistrito(dir.distrito);
    setCiudad(dir.ciudad);
    setDepartamento(dir.departamento);
    setReferencia(dir.referencia || "");
    setTelefono(dir.telefono || "");
    setEsPredeterminada(dir.esPredeterminada);
    setLatitud(dir.latitud);
    setLongitud(dir.longitud);
    setMostrarMapaModal(false);
    setModalAbierto(true);
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!etiqueta.trim()) {
      toast.error("Por favor ingresa un nombre para identificar la dirección");
      return;
    }
    if (!direccionExacta.trim()) {
      toast.error("Por favor ingresa la calle, avenida y número exacto");
      return;
    }
    if (!distrito.trim()) {
      toast.error("Por favor ingresa el distrito");
      return;
    }

    if (direccionEnEdicion) {
      actualizarDireccionCliente(
        direccionEnEdicion.id,
        {
          etiqueta: etiqueta.trim(),
          tipoIcono,
          direccionExacta: direccionExacta.trim(),
          distrito: distrito.trim(),
          ciudad: ciudad.trim() || "Lima",
          departamento: departamento.trim() || "Lima",
          referencia: referencia.trim(),
          telefono: telefono.trim(),
          esPredeterminada,
          latitud,
          longitud,
        },
        usuario?.publicId
      );
      toast.success(`Dirección "${etiqueta}" actualizada`);
    } else {
      const nueva = agregarDireccionCliente(
        {
          etiqueta: etiqueta.trim(),
          tipoIcono,
          direccionExacta: direccionExacta.trim(),
          distrito: distrito.trim(),
          ciudad: ciudad.trim() || "Lima",
          departamento: departamento.trim() || "Lima",
          referencia: referencia.trim(),
          telefono: telefono.trim(),
          esPredeterminada,
          latitud,
          longitud,
        },
        usuario?.publicId
      );
      setDireccionEnfocadaId(nueva.id);
      toast.success(`¡Dirección "${etiqueta}" guardada exitosamente!`);
    }

    cargarDirecciones();
    setModalAbierto(false);
  };

  const handleEliminar = (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar la dirección "${nombre}"?`)) {
      eliminarDireccionCliente(id, usuario?.publicId);
      cargarDirecciones();
      toast.success(`Dirección "${nombre}" eliminada`);
    }
  };

  const handleHacerPredeterminada = (id: string, nombre: string) => {
    establecerDireccionPredeterminada(id, usuario?.publicId);
    cargarDirecciones();
    toast.success(`"${nombre}" es ahora tu dirección predeterminada`);
  };

  const handlePedirEnEstaDireccion = (dir: DireccionClienteGuardada) => {
    guardarDireccionGas({
      direccionExacta: dir.direccionExacta,
      distrito: dir.distrito,
      ciudad: dir.ciudad,
      departamento: dir.departamento,
      referencia: dir.referencia,
      latitud: dir.latitud,
      longitud: dir.longitud,
      telefono: dir.telefono || "977665554",
      notas: `Entrega a ${dir.etiqueta}`,
    });
    toast.success(`Ubicación seleccionada: ${dir.etiqueta}. Redirigiendo a tienda...`);
  };

  const handleDetectarGps = () => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta GPS");
      return;
    }
    toast.info("Detectando GPS...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setLatitud(lat);
        setLongitud(lng);
        toast.success(`¡GPS detectado! (${lat}, ${lng})`);
      },
      (err) => {
        toast.error("Error GPS: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const renderIcono = (tipo: string, className = "w-4 h-4") => {
    switch (tipo) {
      case "casa":
        return <Home className={className} />;
      case "trabajo":
        return <Briefcase className={className} />;
      case "departamento":
        return <Building className={className} />;
      case "familiar":
        return <Star className={className} />;
      default:
        return <Bookmark className={className} />;
    }
  };

  // Filtrado de direcciones
  const direccionesFiltradas = useMemo(() => {
    return direcciones.filter((d) => {
      const matchBusqueda =
        d.etiqueta.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.direccionExacta.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.distrito.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.referencia.toLowerCase().includes(busqueda.toLowerCase());

      const matchTipo =
        filtroTipo === "TODAS" || d.tipoIcono.toUpperCase() === filtroTipo.toUpperCase();

      return matchBusqueda && matchTipo;
    });
  }, [direcciones, busqueda, filtroTipo]);

  const direccionPredeterminada = direcciones.find((d) => d.esPredeterminada) || direcciones[0];
  const direccionEnfocada =
    direcciones.find((d) => d.id === direccionEnfocadaId) || direccionPredeterminada;

  return (
    <div className="w-full px-3 sm:px-5 py-2.5 space-y-2.5 text-xs text-slate-800">
      {/* 1. Barra Superior Compacta */}
      <div className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-xl px-3.5 py-2 text-white shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-amber-200" />
          </div>
          <div className="min-w-0 leading-tight">
            <h1 className="text-xs sm:text-sm font-black tracking-tight leading-none truncate">
              RappiGas • Mis Direcciones de Entrega
            </h1>
            <p className="text-[10px] text-orange-100 hidden sm:block mt-0.5">
              Gestiona tus domicilios habituales para entrega express sin rellenar datos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link href="/cliente/tienda">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2.5 text-[11px] bg-white/10 hover:bg-white/20 text-white border-white/40 font-bold rounded-lg shadow-2xs gap-1 cursor-pointer"
            >
              <ShoppingBag className="w-3 h-3 text-amber-200" />
              <span>Tienda</span>
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={handleAbrirCrear}
            className="h-7 px-3 text-[11px] bg-white hover:bg-orange-50 text-orange-700 font-black rounded-lg shadow-sm border border-white/80 gap-1 cursor-pointer transition hover:scale-102"
          >
            <Plus className="w-3.5 h-3.5 text-orange-600 stroke-[3]" />
            <span>+ Nueva Dirección</span>
          </Button>
        </div>
      </div>

      {/* 2. Métricas Compactas en 1 Fila */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-white rounded-xl border border-slate-200/90 px-3 py-1.5 shadow-2xs flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Bookmark className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 leading-tight">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
              Registradas
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">
              {direcciones.length} dirección{direcciones.length === 1 ? "" : "es"}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 px-3 py-1.5 shadow-2xs flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          </div>
          <div className="min-w-0 leading-tight">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
              Predeterminada
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">
              {direccionPredeterminada ? `${direccionPredeterminada.etiqueta} (${direccionPredeterminada.distrito})` : "Sin definir"}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 px-3 py-1.5 shadow-2xs flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 leading-tight">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
              Cobertura
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">
              Lima y Callao Express
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 px-3 py-1.5 shadow-2xs flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0 leading-tight">
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">
              Despacho Express
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-900 truncate block">
              25 - 35 minutos
            </span>
          </div>
        </div>
      </div>

      {/* 3. Disposición Dividida Compacta (Listado + Mapa) */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Columna Izquierda: Tarjetas y Búsqueda (8 Columnas) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-2.5 min-w-0">
          {/* Barra de Filtro y Búsqueda Compacta */}
          <div className="bg-white rounded-xl border border-slate-200/90 p-1.5 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-1.5">
            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por calle, distrito o referencia..."
                className="w-full pl-8 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Píldoras de Filtro Rápido */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none shrink-0">
              {[
                { id: "TODAS", label: "Todas" },
                { id: "CASA", label: "Casas" },
                { id: "TRABAJO", label: "Trabajo" },
                { id: "DEPARTAMENTO", label: "Deptos" },
                { id: "FAMILIAR", label: "Familiar" },
              ].map((tab) => {
                const activo = filtroTipo === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFiltroTipo(tab.id)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                      activo
                        ? "bg-orange-500 text-white border-orange-600 shadow-2xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid de Tarjetas de Direcciones */}
          {direccionesFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-800">
                {busqueda ? "Sin coincidencias" : "Sin direcciones guardadas"}
              </h3>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                {busqueda
                  ? "Prueba buscando con otro término."
                  : "Agrega tu primera dirección para pedir balones con 1 clic."}
              </p>
              {busqueda ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setBusqueda("");
                    setFiltroTipo("TODAS");
                  }}
                  className="rounded-lg h-7 text-xs font-bold"
                >
                  Limpiar búsqueda
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleAbrirCrear}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-lg h-7 px-3"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Agregar dirección
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {direccionesFiltradas.map((dir) => {
                const esEnfocada = direccionEnfocada?.id === dir.id;
                return (
                  <div
                    key={dir.id}
                    onClick={() => setDireccionEnfocadaId(dir.id)}
                    className={`bg-white rounded-2xl border p-3 shadow-2xs transition hover:shadow-xs flex flex-col justify-between gap-2 cursor-pointer ${
                      dir.esPredeterminada
                        ? "border-amber-300 ring-1 ring-amber-200 bg-amber-50/20"
                        : esEnfocada
                        ? "border-orange-400 ring-1 ring-orange-200"
                        : "border-slate-200/90 hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      {/* Fila Superior: Icono, Etiqueta y Acciones */}
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            dir.esPredeterminada
                              ? "bg-amber-500 text-white"
                              : "bg-orange-100 text-orange-600"
                          }`}>
                            {renderIcono(dir.tipoIcono, "w-3.5 h-3.5")}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1 flex-wrap leading-none">
                              <h3 className="font-black text-xs text-slate-900 truncate">
                                {dir.etiqueta}
                              </h3>
                              {dir.esPredeterminada && (
                                <span className="inline-flex items-center text-[9px] font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-1 py-0.2 rounded">
                                  ★ Predeterminada
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-bold text-orange-600 block truncate mt-0.5">
                              {dir.distrito}, {dir.ciudad}
                            </span>
                          </div>
                        </div>

                        {/* Botones de acción rápida */}
                        <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleAbrirEditar(dir)}
                            className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition cursor-pointer"
                            title="Editar dirección"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEliminar(dir.id, dir.etiqueta)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition cursor-pointer"
                            title="Eliminar dirección"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Dirección Exacta */}
                      <p className="font-bold text-slate-800 text-xs truncate">
                        {dir.direccionExacta}
                      </p>

                      {/* Referencia compacta */}
                      {dir.referencia && (
                        <p className="text-[10px] text-slate-500 italic bg-slate-50 px-2 py-0.5 rounded border border-slate-100 truncate">
                          Ref: {dir.referencia}
                        </p>
                      )}

                      {/* Teléfono y GPS */}
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
                        {dir.telefono ? (
                          <span className="flex items-center gap-1 text-slate-600 font-semibold truncate">
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            {dir.telefono}
                          </span>
                        ) : (
                          <span>Sin teléfono</span>
                        )}
                        <span className="font-mono">
                          GPS: {dir.latitud.toFixed(3)}, {dir.longitud.toFixed(3)}
                        </span>
                      </div>
                    </div>

                    {/* Acciones Inferiores */}
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]" onClick={(e) => e.stopPropagation()}>
                      <div>
                        {!dir.esPredeterminada && (
                          <button
                            type="button"
                            onClick={() => handleHacerPredeterminada(dir.id, dir.etiqueta)}
                            className="text-[10px] font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Star className="w-3 h-3 text-amber-500" />
                            <span>Predeterminada</span>
                          </button>
                        )}
                      </div>

                      <Link href="/cliente/tienda">
                        <button
                          type="button"
                          onClick={() => handlePedirEnEstaDireccion(dir)}
                          className="inline-flex items-center gap-1 h-6 px-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-black text-[11px] shadow-2xs hover:scale-102 transition cursor-pointer"
                        >
                          <Flame className="w-3 h-3 text-amber-300" />
                          <span>Pedir Gas</span>
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Columna Derecha: Panel de Mapa Compacto (4-5 Columnas) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-2 lg:sticky lg:top-20">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-xs leading-none">
                    Ubicación en el Mapa
                  </h3>
                  <span className="text-[9px] text-slate-400">
                    {direccionEnfocada?.etiqueta || "Dirección Seleccionada"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDetectarGps}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold text-[10px] transition cursor-pointer"
                title="Detectar por GPS actual"
              >
                <Navigation className="w-2.5 h-2.5 text-blue-600" />
                <span>GPS</span>
              </button>
            </div>

            {/* Vista Interactiva del Mapa de Cobertura */}
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-inner h-[210px]">
              <SelectorUbicacionMapa
                latitudInicial={direccionEnfocada?.latitud || latitud}
                longitudInicial={direccionEnfocada?.longitud || longitud}
                distritoNombre={direccionEnfocada?.distrito || distrito}
                departamentoNombre={direccionEnfocada?.departamento || departamento}
                direccionActual={direccionEnfocada?.direccionExacta || direccionExacta}
                onUbicacionSeleccionada={(coords) => {
                  toast.success(`Coordenadas: (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`);
                }}
              />
            </div>

            {/* Tarjeta de Información de la Dirección Enfocada */}
            {direccionEnfocada && (
              <div className="p-2 bg-orange-50/70 border border-orange-200/90 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs leading-tight">
                  <span className="font-extrabold text-orange-950 flex items-center gap-1">
                    {renderIcono(direccionEnfocada.tipoIcono, "w-3 h-3 text-orange-600")}
                    <span>{direccionEnfocada.etiqueta}</span>
                  </span>
                  {direccionEnfocada.esPredeterminada && (
                    <span className="text-[8px] font-bold text-amber-800 bg-amber-200/70 px-1.5 py-0.2 rounded">
                      ★ Predeterminada
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold text-slate-900 truncate">
                  {direccionEnfocada.direccionExacta}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {direccionEnfocada.distrito}, {direccionEnfocada.ciudad}
                </p>

                <div className="pt-1.5 border-t border-orange-200 flex items-center justify-between gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleAbrirEditar(direccionEnfocada)}
                    className="font-bold text-orange-700 hover:underline cursor-pointer"
                  >
                    Editar
                  </button>
                  <Link href="/cliente/tienda">
                    <button
                      type="button"
                      onClick={() => handlePedirEnEstaDireccion(direccionEnfocada)}
                      className="inline-flex items-center gap-1 h-5.5 px-2 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] shadow-2xs"
                    >
                      <Flame className="w-2.5 h-2.5 text-amber-300" />
                      <span>Pedir aquí</span>
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Garantía de Servicio y Balanza Digital */}
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-[10px] text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="leading-tight text-[10px]">
                Entrega con <strong>balanza digital contrastada</strong> y precinto Osinergmin intacto.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Crear o Editar Dirección */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 via-amber-50 to-white">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-xs">
                  <Bookmark className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                    {direccionEnEdicion ? "Editar Dirección Guardada" : "Nueva Dirección"}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Datos de destino para despacho express
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="p-3.5 overflow-y-auto space-y-3 flex-1 text-xs">
              {/* Tipo de Lugar */}
              <div className="space-y-1">
                <label className="font-extrabold text-[11px] text-slate-700 block">Tipo de lugar:</label>
                <div className="grid grid-cols-5 gap-1">
                  {(
                    [
                      { tipo: "casa", label: "Casa", icon: Home },
                      { tipo: "trabajo", label: "Trabajo", icon: Briefcase },
                      { tipo: "departamento", label: "Depto", icon: Building },
                      { tipo: "familiar", label: "Familiar", icon: Star },
                      { tipo: "otro", label: "Otro", icon: Bookmark },
                    ] as const
                  ).map((item) => {
                    const IconComp = item.icon;
                    const activo = tipoIcono === item.tipo;
                    return (
                      <button
                        key={item.tipo}
                        type="button"
                        onClick={() => {
                          setTipoIcono(item.tipo);
                          if (!direccionEnEdicion && (!etiqueta || etiqueta === "Casa" || etiqueta === "Trabajo")) {
                            setEtiqueta(item.label);
                          }
                        }}
                        className={`flex flex-col items-center justify-center p-1.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                          activo
                            ? "bg-orange-50 border-orange-500 text-orange-700 shadow-2xs"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600"
                        }`}
                      >
                        <IconComp className="w-3.5 h-3.5 mb-0.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nombre / Identificador */}
              <div className="space-y-0.5">
                <label className="font-extrabold text-[11px] text-slate-700 block">
                  Nombre o Etiqueta:
                </label>
                <input
                  type="text"
                  value={etiqueta}
                  onChange={(e) => setEtiqueta(e.target.value)}
                  placeholder="Ej: Casa Principal, Oficina Surco..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Dirección Exacta */}
              <div className="space-y-0.5">
                <label className="font-extrabold text-[11px] text-slate-700 block">
                  Calle, Avenida o Jr. y N°:
                </label>
                <input
                  type="text"
                  value={direccionExacta}
                  onChange={(e) => setDireccionExacta(e.target.value)}
                  placeholder="Ej: Av. Antúnez de Mayolo 1234..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Distrito, Ciudad y Dpto */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="space-y-0.5">
                  <label className="font-bold text-[9px] uppercase text-slate-400 block">Distrito:</label>
                  <input
                    type="text"
                    value={distrito}
                    onChange={(e) => setDistrito(e.target.value)}
                    placeholder="Distrito..."
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="font-bold text-[9px] uppercase text-slate-400 block">Ciudad:</label>
                  <input
                    type="text"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    placeholder="Ciudad..."
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="font-bold text-[9px] uppercase text-slate-400 block">Dpto:</label>
                  <input
                    type="text"
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    placeholder="Departamento..."
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Referencia y Teléfono */}
              <div className="space-y-0.5">
                <label className="font-extrabold text-[11px] text-slate-700 block">
                  Referencia de entrega:
                </label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ej: Timbre blanco, reja verde, piso 2..."
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-0.5">
                <label className="font-extrabold text-[11px] text-slate-700 block">
                  Teléfono de contacto:
                </label>
                <input
                  type="text"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: 977665554"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* GPS y Selector de Mapa */}
              <div className="bg-slate-50 rounded-xl p-2 border border-slate-200 flex items-center justify-between gap-1.5">
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">GPS:</span>
                  <span className="font-mono text-[11px] text-slate-700 font-bold">
                    {latitud.toFixed(4)}, {longitud.toFixed(4)}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleDetectarGps}
                    className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Navigation className="w-2.5 h-2.5 text-blue-600" />
                    <span>Detectar GPS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarMapaModal(!mostrarMapaModal)}
                    className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                  >
                    <Compass className="w-2.5 h-2.5 text-orange-600" />
                    <span>{mostrarMapaModal ? "Ocultar" : "Mapa"}</span>
                  </button>
                </div>
              </div>

              {/* Mapa embebido si se expande */}
              {mostrarMapaModal && (
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-inner h-52">
                  <SelectorUbicacionMapa
                    latitudInicial={latitud}
                    longitudInicial={longitud}
                    distritoNombre={distrito}
                    departamentoNombre={departamento}
                    direccionActual={direccionExacta}
                    onUbicacionSeleccionada={(coords) => {
                      setLatitud(coords.lat);
                      setLongitud(coords.lng);
                      if (coords.direccionSugerida && !direccionExacta) {
                        setDireccionExacta(coords.direccionSugerida);
                      }
                      toast.success("Ubicación fijada en el mapa");
                    }}
                  />
                </div>
              )}

              {/* Checkbox Predeterminada */}
              <label className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/70 border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={esPredeterminada}
                  onChange={(e) => setEsPredeterminada(e.target.checked)}
                  className="w-3.5 h-3.5 text-orange-600 rounded border-amber-300 focus:ring-orange-500"
                />
                <span className="font-bold text-[11px] text-amber-950">
                  Establecer como mi dirección predeterminada
                </span>
              </label>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-xs transition cursor-pointer"
                >
                  {direccionEnEdicion ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
