"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  fidelizacionApi,
  BilleteraPuntos,
} from "@/librerias/api/fidelizacion.api";
import {
  PREMIOS_ZETA_PREMIA,
  CATEGORIAS_CONFIG,
  CATEGORIAS_CONFIG_DEFAULT,
  CategoriaPremio,
  PremioCanje,
  obtenerCatalogoPremios,
  obtenerCategorias,
} from "@/app/(cliente)/cliente/canjes/premios-data";
import {
  agregarAlCarritoCanjes,
  obtenerCarritoCanjes,
} from "@/app/(cliente)/cliente/canjes/carrito-canjes";
import { CarritoCanjesDrawer } from "@/app/(cliente)/cliente/canjes/carrito-drawer";
import {
  Gift,
  Sparkles,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  Grid3X3,
  List,
  Check,
  Award,
  RefreshCw,
  Ticket,
  ChevronRight,
  ChevronLeft,
  X,
  Copy,
  Info,
  LogIn,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  Star,
  Tag,
} from "lucide-react";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import { useAuthStore } from "@/store/auth-store";

type ModoVista = "grid3" | "grid4" | "lista";
type RangoPuntos = "TODOS" | "HASTA_100" | "101_250" | "251_500" | "MAS_500";
type OrdenOpcion = "PUNTOS_ASC" | "PUNTOS_DESC" | "NOMBRE_ASC" | "VALOR_DESC";

interface CatalogoCanjesContentProps {
  modo?: "publico" | "cliente";
}

export default function CatalogoCanjesContent({
  modo = "publico",
}: CatalogoCanjesContentProps) {
  const router = useRouter();
  const { estaAutenticado, usuario } = useAuthStore();

  const [billetera, setBilletera] = useState<BilleteraPuntos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);

  // Estados de Visualización - Por defecto 3 columnas limpio y ordenado
  const [modoVista, setModoVista] = useState<ModoVista>("grid3");
  const [mostrarFiltros, setMostrarFiltros] = useState<boolean>(true);

  // Estados de Filtros
  const [busqueda, setBusqueda] = useState<string>("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("TODOS");
  const [rangoPuntos, setRangoPuntos] = useState<RangoPuntos>("TODOS");
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<string>("TODAS");
  const [soloAlcanzables, setSoloAlcanzables] = useState<boolean>(false);
  const [orden, setOrden] = useState<OrdenOpcion>("PUNTOS_ASC");

  // Paginación
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const itemsPorPagina = 24;

  // Modal de Canje Exitoso
  const [canjeExitoso, setCanjeExitoso] = useState<{
    premio: PremioCanje;
    codigoCupon: string;
  } | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Modal de Detalle Rápido
  const [premioDetalle, setPremioDetalle] = useState<PremioCanje | null>(null);

  // Modal de Autenticación Requerida (para visitantes públicos)
  const [mostrarModalAuth, setMostrarModalAuth] = useState(false);
  const [premioPendienteAuth, setPremioPendienteAuth] = useState<PremioCanje | null>(null);

  // Carrito de Canjes
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [cantCarrito, setCantCarrito] = useState(0);
  const [totalPuntosCarrito, setTotalPuntosCarrito] = useState(0);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorPermisos(null);
      const b = await fidelizacionApi.obtenerBilletera().catch((err: any) => {
        if (modo === "cliente") {
          if (err?.status === 403 || err?.message?.includes("permisos")) {
            setErrorPermisos(
              "Acceso restringido: Esta vista requiere permisos de Cliente Hogar (CLIENTE)."
            );
          }
        }
        return null;
      });
      setBilletera(b);
    } catch {
      // Ignorar errores en modo público
    } finally {
      setCargando(false);
    }
  }, [modo]);

  const [catalogoPremios, setCatalogoPremios] = useState<PremioCanje[]>(PREMIOS_ZETA_PREMIA);
  const [categorias, setCategorias] = useState<CategoriaPremio[]>(CATEGORIAS_CONFIG_DEFAULT);

  useEffect(() => {
    cargarDatos();
    setCatalogoPremios(obtenerCatalogoPremios());
    setCategorias(obtenerCategorias());

    const handleSync = () => {
      setCatalogoPremios(obtenerCatalogoPremios());
    };
    const handleCategoriasSync = () => {
      setCategorias(obtenerCategorias());
    };
    const handleCarritoSync = () => {
      const itms = obtenerCarritoCanjes();
      setCantCarrito(itms.reduce((acc, it) => acc + it.cantidad, 0));
      setTotalPuntosCarrito(
        itms.reduce((acc, it) => acc + it.premio.puntos * it.cantidad, 0)
      );
    };

    handleCarritoSync();

    const handleAbrirDrawer = () => {
      setCarritoAbierto(true);
    };

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("abrir") === "carrito") {
        setCarritoAbierto(true);
      }
    }

    window.addEventListener("catalogo_premios_actualizado", handleSync);
    window.addEventListener("catalogo_categorias_actualizado", handleCategoriasSync);
    window.addEventListener("carrito_canjes_actualizado", handleCarritoSync);
    window.addEventListener("abrir_drawer_canjes", handleAbrirDrawer);

    return () => {
      window.removeEventListener("catalogo_premios_actualizado", handleSync);
      window.removeEventListener("catalogo_categorias_actualizado", handleCategoriasSync);
      window.removeEventListener("carrito_canjes_actualizado", handleCarritoSync);
      window.removeEventListener("abrir_drawer_canjes", handleAbrirDrawer);
    };
  }, [cargarDatos]);

  const saldo = billetera?.saldoPuntos ?? 0;
  const nivel = saldo >= 300 ? "Oro" : saldo >= 100 ? "Plata" : "Bronce";
  const esClienteAutenticado = estaAutenticado && usuario?.rol === "CLIENTE";

  const marcasDisponibles = useMemo(() => {
    const setMarcas = new Set<string>();
    catalogoPremios.forEach((p) => {
      if (p.marca) setMarcas.add(p.marca);
    });
    return Array.from(setMarcas).sort();
  }, [catalogoPremios]);

  const premiosFiltrados = useMemo(() => {
    let res = catalogoPremios.filter((p) => {
      if (categoriaSeleccionada !== "TODOS" && p.categoria !== categoriaSeleccionada) {
        return false;
      }

      if (marcaSeleccionada !== "TODAS" && p.marca !== marcaSeleccionada) {
        return false;
      }

      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const coincide =
          p.nombre.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q) ||
          p.categoria.toLowerCase().includes(q) ||
          p.codigoCupon.toLowerCase().includes(q);
        if (!coincide) return false;
      }

      if (rangoPuntos === "HASTA_100" && p.puntos > 100) return false;
      if (rangoPuntos === "101_250" && (p.puntos <= 100 || p.puntos > 250)) return false;
      if (rangoPuntos === "251_500" && (p.puntos <= 250 || p.puntos > 500)) return false;
      if (rangoPuntos === "MAS_500" && p.puntos <= 500) return false;

      if (soloAlcanzables && esClienteAutenticado && saldo < p.puntos) return false;

      return true;
    });

    res = [...res].sort((a, b) => {
      if (orden === "PUNTOS_ASC") return a.puntos - b.puntos;
      if (orden === "PUNTOS_DESC") return b.puntos - a.puntos;
      if (orden === "NOMBRE_ASC") return a.nombre.localeCompare(b.nombre);
      if (orden === "VALOR_DESC") return b.valorSoles - a.valorSoles;
      return 0;
    });

    return res;
  }, [
    busqueda,
    categoriaSeleccionada,
    marcaSeleccionada,
    rangoPuntos,
    soloAlcanzables,
    orden,
    saldo,
    catalogoPremios,
    esClienteAutenticado,
  ]);

  const totalPaginas = Math.ceil(premiosFiltrados.length / itemsPorPagina) || 1;
  const premiosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return premiosFiltrados.slice(inicio, inicio + itemsPorPagina);
  }, [premiosFiltrados, paginaActual, itemsPorPagina]);

  const totalAlcanzables = useMemo(() => {
    return catalogoPremios.filter((p) => saldo >= p.puntos).length;
  }, [catalogoPremios, saldo]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, categoriaSeleccionada, marcaSeleccionada, rangoPuntos, soloAlcanzables, orden]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoriaSeleccionada("TODOS");
    setRangoPuntos("TODOS");
    setMarcaSeleccionada("TODAS");
    setSoloAlcanzables(false);
    setOrden("PUNTOS_ASC");
  };

  const handleCanjear = (premio: PremioCanje) => {
    if (modo === "publico" && !esClienteAutenticado) {
      setPremioPendienteAuth(premio);
      setMostrarModalAuth(true);
      return;
    }
    agregarAlCarritoCanjes(premio, 1);
    setCarritoAbierto(true);
  };

  const handleVerDetalle = (premio: PremioCanje) => {
    if (modo === "cliente") {
      router.push(`/cliente/canjes/${premio.id}`);
    } else {
      setPremioDetalle(premio);
    }
  };

  const handleCopiarCodigo = () => {
    if (!canjeExitoso) return;
    navigator.clipboard.writeText(canjeExitoso.codigoCupon);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="catalogo-canjes-root w-full space-y-4 text-xs text-slate-800">
      {/* ALERTA DE PERMISOS SOLO EN MODO CLIENTE */}
      {modo === "cliente" && errorPermisos && (
        <RoleGuardAlert
          rolRequerido="CLIENTE"
          mensaje={errorPermisos}
          onExito={cargarDatos}
        />
      )}

      {/* BANNER DE CANJE EXITOSO / CUPÓN GENERADO */}
      {canjeExitoso && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 sm:p-5 shadow-md space-y-3 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  ¡Canje Exitoso de Puntos!
                </span>
                <h3 className="text-sm sm:text-base font-black text-emerald-950 mt-0.5 m-0">
                  {canjeExitoso.premio.nombre}
                </h3>
              </div>
            </div>

            <button
              onClick={() => setCanjeExitoso(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold p-1 cursor-pointer text-base"
            >
              ✕
            </button>
          </div>

          <div className="bg-white rounded-xl p-3 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-slate-500 m-0">
                Tu Código de Descuento para la Tienda:
              </p>
              <p className="text-xs text-slate-600 m-0">
                Ingresa este código en tu pedido para aplicar los{" "}
                <strong>S/ {canjeExitoso.premio.valorSoles.toFixed(2)}</strong> de descuento.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 bg-orange-50 border border-orange-400 rounded-lg text-sm font-mono font-black text-orange-600 tracking-wider">
                {canjeExitoso.codigoCupon}
              </span>
              <button
                type="button"
                onClick={handleCopiarCodigo}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1"
              >
                {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiado ? "Copiado" : "Copiar"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          ENCABEZADO ELEGANTE OFICIAL RAPPIGAS • COMPACTO
      ========================================================================= */}
      {/* CABECERA OFICIAL RAPPIGAS • CATÁLOGO DE PREMIOS ESTILO ZETA PREMIA */}
      <div className="catalogo-banner bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-xl p-3 sm:py-3 sm:px-4 text-white shadow-md flex flex-wrap items-center justify-between gap-3 relative overflow-hidden mb-3">
        {/* Brillos sutiles decorativos de fondo */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-12 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner border border-white/30">
            <Gift className="w-5 h-5 text-amber-200" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-black tracking-tight leading-tight text-white m-0">
                RappiGas • Catálogo Oficial de Canjes
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs border border-white/25">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                100 Premios Disponibles
              </span>
              {esClienteAutenticado && (
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-white/25 text-white border border-white/25">
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  Nivel {nivel}
                </span>
              )}
            </div>
            <p className="text-[11px] text-orange-100 hidden sm:block m-0 font-medium max-w-2xl">
              Canjea tus puntos acumulados por electrohogar, menaje, balones gratis y vales de descuento con entrega a domicilio.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold flex-wrap relative z-10">
          {esClienteAutenticado ? (
            <>
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300 text-amber-950 px-3 py-1.5 rounded-lg shadow-sm border border-white/80 font-black shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-900 fill-amber-900 animate-pulse shrink-0" />
                <div className="flex items-center gap-1 leading-none">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-900">Tu Saldo:</span>
                  <span className="text-xs font-black text-amber-950 bg-white/85 px-1.5 py-0.5 rounded shadow-2xs font-mono">
                    {Number(saldo).toLocaleString()} PTS
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={cargarDatos}
                disabled={cargando}
                className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition cursor-pointer border border-white/20"
                title="Actualizar saldo de puntos"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} />
              </button>

              <Link
                href="/cliente/canjes/historial"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg text-xs transition cursor-pointer border border-white/25"
                title="Ver mis canjes realizados y su estado de entrega"
              >
                <Truck className="w-3.5 h-3.5 text-amber-200" />
                <span>Mis Canjes</span>
              </Link>

              <Link
                href="/cliente/puntos"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-orange-600 hover:bg-orange-50 font-black rounded-lg text-xs shadow-sm transition cursor-pointer"
              >
                <span>Historial Puntos</span>
              </Link>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-lg text-white font-bold text-xs border border-white/25 backdrop-blur-xs">
                <Flame className="w-3.5 h-3.5 text-amber-200" />
                <span>1 Balón = 50 PTS</span>
              </div>
              <Link
                href="/login?redirect=/premios/catalogo"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white text-orange-600 hover:bg-orange-50 font-black rounded-lg text-xs shadow-md transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar Sesión</span>
              </Link>
            </>
          )}

          {/* Botón Carrito de Canjes */}
          <button
            type="button"
            onClick={() => setCarritoAbierto(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-700/80 hover:bg-orange-700 text-white font-black rounded-lg text-xs shadow-md transition cursor-pointer border border-white/30"
            title="Abrir carrito de canjes para confirmar todo"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Carrito ({cantCarrito})</span>
            {totalPuntosCarrito > 0 && (
              <span className="font-mono text-[10px] bg-white/25 px-1.5 py-0.5 rounded font-bold">
                {totalPuntosCarrito} pts
              </span>
            )}
          </button>
        </div>
      </div>

      {/* BARRA DE CONTROL: TOGGLE FILTROS + CONTADOR + SELECTOR DE VISTA (FIJA / STICKY EN TODO EL CATÁLOGO) */}
      <div className="catalogo-control-bar sticky top-[86px] sm:top-[88px] z-30 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200/90 py-2 px-3 sm:px-4 shadow-sm flex flex-wrap items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMostrarFiltros((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border shadow-2xs ${
              mostrarFiltros
                ? "bg-[#03246b] text-white border-[#03246b] hover:bg-[#021b52]"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            }`}
            title={mostrarFiltros ? "Ocultar panel de filtros lateral" : "Mostrar panel de filtros lateral"}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span>{mostrarFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}</span>
          </button>

          <span className="text-slate-500 font-medium text-[11px] sm:text-xs">
            Mostrando <strong className="text-slate-800 font-bold">{premiosFiltrados.length}</strong> de {PREMIOS_ZETA_PREMIA.length} premios
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 hidden sm:inline font-medium text-[11px]">Ordenar:</span>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as OrdenOpcion)}
              className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-hidden focus:border-orange-500"
            >
              <option value="PUNTOS_ASC">Menor a mayor puntaje</option>
              <option value="PUNTOS_DESC">Mayor a menor puntaje</option>
              <option value="NOMBRE_ASC">Nombre (A - Z)</option>
              <option value="VALOR_DESC">Mayor valor en soles</option>
            </select>
          </div>

          <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setModoVista("grid3")}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                modoVista === "grid3"
                  ? "bg-white text-orange-600 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Ver en 3 columnas"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setModoVista("grid4")}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                modoVista === "grid4"
                  ? "bg-white text-orange-600 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Ver en 4 columnas"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setModoVista("lista")}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                modoVista === "lista"
                  ? "bg-white text-orange-600 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Ver en formato lista"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONTENEDOR PRINCIPAL: PANEL LATERAL DE FILTROS + CATÁLOGO DE PRODUCTOS
      ========================================================================= */}
      <div className="flex flex-col lg:!flex-row items-start gap-5">
        {/* PANEL LATERAL DE FILTROS (STICKY AL BAJAR EL CATÁLOGO) */}
        {mostrarFiltros && (
          <aside className="catalogo-aside-sidebar w-full lg:!w-72 lg:!min-w-[18rem] lg:!max-w-[18rem] shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5 flex flex-col gap-4 lg:sticky lg:top-[145px] lg:self-start lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full transition-all duration-200 animate-in fade-in duration-150">
            {/* Cabecera del Filtro con botón para cerrar/ocultar */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-black text-xs text-[#03246b] flex items-center gap-1.5 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-orange-600" /> Filtros de Canje
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-800 hover:underline cursor-pointer mr-1"
                >
                  Limpiar todo
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFiltros(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  title="Ocultar filtros"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Buscador de Premios */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Buscar Premio
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ej: Licuadora, sartén, vale..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  style={{ paddingLeft: "36px" }}
                  className="w-full pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:border-orange-500 transition"
                />
                {busqueda && (
                  <button
                    type="button"
                    onClick={() => setBusqueda("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filtro por Categorías */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Categorías
              </label>
              <div className="space-y-1">
                {categorias.map((cat) => {
                  const activo = categoriaSeleccionada === cat.id;
                  const cantidad =
                    cat.id === "TODOS"
                      ? catalogoPremios.length
                      : catalogoPremios.filter((p) => p.categoria === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoriaSeleccionada(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition cursor-pointer text-xs ${
                        activo
                          ? "bg-[#03246b] text-white font-black shadow-xs"
                          : "text-slate-700 hover:bg-slate-100 font-semibold"
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span className="text-sm shrink-0">{cat.icono}</span>
                        <span className="truncate">{cat.nombre}</span>
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${
                          activo
                            ? "bg-white/20 text-white font-bold"
                            : "bg-slate-100 text-slate-500 font-medium"
                        }`}
                      >
                        {cantidad}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* CATÁLOGO DE PRODUCTOS / PREMIOS */}
        <div className="catalogo-products-column flex-1 w-full lg:!w-auto space-y-4 min-w-0">
          {premiosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 space-y-2 shadow-xs">
              <Award className="w-12 h-12 text-orange-400 mx-auto" />
              <h4 className="font-black text-sm text-slate-900 m-0">No se encontraron productos</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto m-0">
                No hay productos que coincidan con tus filtros actuales. Intenta ampliando el rango o limpiando la búsqueda.
              </p>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition mt-2 cursor-pointer shadow-xs"
              >
                Restablecer todos los filtros
              </button>
            </div>
          ) : modoVista === "lista" ? (
            /* =========================================================================
                VISTA EN FORMATO LISTA
            ========================================================================= */
            <div className="space-y-2.5">
              {premiosPaginados.map((premio) => {
                const alcanza = esClienteAutenticado ? saldo >= premio.puntos : false;

                return (
                  <div
                    key={premio.id}
                    className={`bg-white rounded-2xl border p-3 sm:p-4 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row items-center justify-between gap-3 ${
                      alcanza ? "border-emerald-300 ring-1 ring-emerald-100" : "border-slate-200"
                    }`}
                  >
                    <div
                      onClick={() => handleVerDetalle(premio)}
                      className="flex items-center gap-3.5 min-w-0 flex-1 w-full sm:w-auto cursor-pointer group"
                    >
                      <div className="w-20 h-20 bg-slate-50 rounded-xl p-2 flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-105 transition-transform duration-200">
                        <img
                          src={premio.imagen}
                          alt={premio.nombre}
                          className="w-full h-full object-contain filter drop-shadow-xs"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/products/balon-10kg-premium.svg";
                          }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {premio.marca}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            Equiv. S/ {premio.valorSoles.toFixed(2)}
                          </span>
                        </div>
                        <div className="catalog-h3 font-black text-xs sm:text-sm text-[#0F2137] truncate mt-1 group-hover:text-orange-600 transition m-0">
                          {premio.nombre}
                        </div>
                        <div className="catalog-desc text-[11px] text-slate-500 line-clamp-1 mt-0.5 m-0">
                          {premio.descripcion}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-orange-600 font-mono">
                            {premio.puntos}
                          </span>
                          <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">
                            PTS
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400">
                          Valor S/ {premio.valorSoles.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => handleVerDetalle(premio)}
                          className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition text-center shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                        >
                          Ver Detalle
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCanjear(premio)}
                          className="flex-1 py-2 px-3 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md hover:shadow-orange-500/25 cursor-pointer bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white active:scale-95"
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>Canjear</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* =========================================================================
                VISTA EN FORMATO GRID (3 COLUMNAS O 4 COLUMNAS)
            ========================================================================= */
            <div
              className={`grid gap-4 sm:gap-5 ${
                modoVista === "grid4"
                  ? mostrarFiltros
                    ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                  : mostrarFiltros
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              }`}
            >
              {premiosPaginados.map((premio) => {
                const alcanza = esClienteAutenticado ? saldo >= premio.puntos : false;
                const porcentaje = esClienteAutenticado
                  ? Math.min(100, Math.round((saldo / premio.puntos) * 100))
                  : 0;

                return (
                  <div
                    key={premio.id}
                    className={`catalogo-product-card bg-white rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden group ${
                      alcanza
                        ? "border-emerald-300 ring-2 ring-emerald-100/80"
                        : "border-slate-200/90 hover:border-orange-300/80"
                    }`}
                  >
                    {/* Cabecera del Premio - Clic hacia Detalle Individual */}
                    <div
                      onClick={() => handleVerDetalle(premio)}
                      className="p-4 sm:p-5 space-y-3 block cursor-pointer group flex-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs">
                          {premio.marca}
                        </span>

                        <span className="text-[11px] font-bold text-slate-400">
                          S/ {premio.valorSoles.toFixed(2)}
                        </span>
                      </div>

                      {/* Imagen del Producto */}
                      <div className="w-full h-44 sm:h-48 bg-gradient-to-b from-slate-50 to-slate-100/70 rounded-xl p-4 flex items-center justify-center border border-slate-100/90 overflow-hidden relative shadow-inner">
                        <img
                          src={premio.imagen}
                          alt={premio.nombre}
                          className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-108 transition-transform duration-300 ease-out"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/products/balon-10kg-premium.svg";
                          }}
                        />
                      </div>

                      {/* Nombre y Descripción */}
                      <div className="pt-0.5">
                        <h3
                          className="card-title font-black text-sm text-[#03246b] line-clamp-1 group-hover:text-orange-600 transition-colors"
                          title={premio.nombre}
                        >
                          {premio.nombre}
                        </h3>
                        <p className="card-desc text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                          {premio.descripcion}
                        </p>
                      </div>
                    </div>

                    {/* Pie con Costo, Ver Detalle y Botón de Canje */}
                    <div className="p-4 bg-gradient-to-b from-slate-50/80 to-slate-100/50 border-t border-slate-100/90 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block leading-none">
                            Costo:
                          </span>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-lg sm:text-xl font-black text-orange-600 font-mono tracking-tight leading-none">
                              {premio.puntos}
                            </span>
                            <span className="text-[11px] font-black text-orange-500 tracking-wider">
                              PTS
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-[11px] font-extrabold px-2.5 py-1 rounded-md border shadow-2xs ${
                              esClienteAutenticado
                                ? alcanza
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-slate-200 text-slate-600 border-slate-300"
                                : "bg-amber-50 text-amber-900 border-amber-200/90 shadow-2xs"
                            }`}
                          >
                            {esClienteAutenticado
                              ? alcanza
                                ? "¡Alcanza!"
                                : `Faltan ${premio.puntos - saldo} pts`
                              : `Equiv. S/ ${premio.valorSoles.toFixed(2)}`}
                          </span>
                        </div>
                      </div>

                      {/* Barra de progreso si es cliente autenticado */}
                      {esClienteAutenticado && (
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${porcentaje}%` }}
                            className={`h-full rounded-full transition-all duration-300 ${
                              alcanza ? "bg-emerald-500" : "bg-orange-500"
                            }`}
                          />
                        </div>
                      )}

                      {/* Botones: Ver Detalle y Canjear con esquinas ligeramente redondeadas */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleVerDetalle(premio)}
                          className="flex-1 py-2.5 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs transition-all text-center shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                        >
                          Ver Detalle
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCanjear(premio)}
                          disabled={esClienteAutenticado && !alcanza}
                          className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md active:scale-95 cursor-pointer ${
                            !esClienteAutenticado || alcanza
                              ? "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-orange-500/20"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>
                            {esClienteAutenticado
                              ? alcanza
                                ? "Canjear"
                                : "Faltan pts"
                              : "Canjear"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* =========================================================================
              BARRA DE PAGINACIÓN DE PREMIOS
          ========================================================================= */}
          {totalPaginas > 1 && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-medium">
                Página <strong>{paginaActual}</strong> de {totalPaginas}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer flex items-center justify-center"
                  title="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => {
                  if (
                    num === 1 ||
                    num === totalPaginas ||
                    Math.abs(num - paginaActual) <= 1
                  ) {
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setPaginaActual(num)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                          num === paginaActual
                            ? "bg-[#03246b] text-white shadow-2xs font-black"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {num}
                      </button>
                    );
                  }
                  if (num === 2 && paginaActual > 3) {
                    return (
                      <span key={num} className="px-1 text-slate-400">
                        ...
                      </span>
                    );
                  }
                  if (num === totalPaginas - 1 && paginaActual < totalPaginas - 2) {
                    return (
                      <span key={num} className="px-1 text-slate-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  type="button"
                  onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer flex items-center justify-center"
                  title="Página siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          DRAWER DEL CARRITO DE CANJES
      ========================================================================= */}
      <CarritoCanjesDrawer
        abierto={carritoAbierto}
        onCerrar={() => setCarritoAbierto(false)}
        saldoPuntos={saldo}
      />

      {/* =========================================================================
          MODAL DE DETALLE RÁPIDO DEL PREMIO (PARA VISTAS PÚBLICAS)
      ========================================================================= */}
      {premioDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="relative p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                  {premioDetalle.categoria}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Marca: <strong>{premioDetalle.marca}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPremioDetalle(null)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer shadow-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="w-full h-56 bg-slate-50/70 rounded-2xl p-4 flex items-center justify-center border border-slate-100">
                <img
                  src={premioDetalle.imagen}
                  alt={premioDetalle.nombre}
                  className="max-h-full max-w-full object-contain filter drop-shadow-md"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/products/balon-10kg-premium.svg";
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-slate-900 leading-snug">
                  {premioDetalle.nombre}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {premioDetalle.descripcion}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <div className="bg-orange-50/80 border border-orange-200 p-3.5 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                    Puntos Requeridos
                  </span>
                  <span className="text-xl font-black text-orange-700 font-mono block">
                    {premioDetalle.puntos} PTS
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Valor en Tienda
                  </span>
                  <span className="text-xl font-black text-slate-800 font-mono block">
                    S/ {premioDetalle.valorSoles.toFixed(2)}
                  </span>
                </div>
              </div>

              {premioDetalle.especificaciones && premioDetalle.especificaciones.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700">
                    Especificaciones técnicas:
                  </h4>
                  <div className="text-xs text-slate-600 space-y-1.5">
                    {premioDetalle.especificaciones.map((esp, i) => (
                      <div key={i} className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="font-semibold text-slate-500">{esp.clave}:</span>
                        <span className="text-slate-800 font-medium">{esp.valor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPremioDetalle(null)}
                className="flex-1 py-2.5 px-4 rounded-lg border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-100 transition cursor-pointer shadow-2xs active:scale-95"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = premioDetalle;
                  setPremioDetalle(null);
                  handleCanjear(p);
                }}
                className="flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Gift className="w-4 h-4" />
                <span>Canjear Premio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL DE AUTENTICACIÓN REQUERIDA (INVITACIÓN A INICIAR SESIÓN / REGISTRO)
      ========================================================================= */}
      {mostrarModalAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-inner">
                <Gift className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 m-0">
                  ¡Canjea este premio con tus Puntos!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed m-0">
                  Para canjear <strong>{premioPendienteAuth?.nombre}</strong> ({premioPendienteAuth?.puntos} PTS), inicia sesión con tu número de teléfono registrado o regístrate en RappiGas.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>¿Cómo acumulo puntos en RappiGas?</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed m-0">
                  Cada balón de gas que compras acumula <strong>50 puntos automáticamente</strong> con tu número de teléfono. ¡Sin sorteos, canjes 100% garantizados!
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/login?redirect=/premios/catalogo"
                  className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Iniciar Sesión con mi Celular</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    if (premioPendienteAuth) {
                      agregarAlCarritoCanjes(premioPendienteAuth, 1);
                    }
                    setMostrarModalAuth(false);
                    setCarritoAbierto(true);
                  }}
                  className="w-full py-2 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition cursor-pointer shadow-2xs active:scale-95"
                >
                  Agregar al Carrito de Canjes de todas formas
                </button>

                <button
                  type="button"
                  onClick={() => setMostrarModalAuth(false)}
                  className="w-full py-2 text-slate-400 hover:text-slate-600 font-medium text-xs transition cursor-pointer"
                >
                  Continuar explorando el catálogo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
