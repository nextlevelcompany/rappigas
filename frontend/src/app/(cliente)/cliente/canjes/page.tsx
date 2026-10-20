"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
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
} from "./premios-data";
import {
  Flame,
  Gift,
  Sparkles,
  ShoppingBag,
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
  Star,
  Ticket,
  ChevronRight,
  ChevronLeft,
  X,
  Copy,
  ChevronDown,
  ArrowUpDown,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";

type ModoVista = "grid3" | "grid4" | "lista";
type RangoPuntos = "TODOS" | "HASTA_100" | "101_250" | "251_500" | "MAS_500";
type OrdenOpcion = "PUNTOS_ASC" | "PUNTOS_DESC" | "NOMBRE_ASC" | "VALOR_DESC";

export default function TiendaCanjesPage() {
  const [billetera, setBilletera] = useState<BilleteraPuntos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);

  // Estados de Visualización
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
  const itemsPorPagina = modoVista === "grid4" ? 24 : 18;

  // Modal de Canje Exitoso
  const [canjeExitoso, setCanjeExitoso] = useState<{
    premio: PremioCanje;
    codigoCupon: string;
  } | null>(null);
  const [copiado, setCopiado] = useState(false);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorPermisos(null);
      const b = await fidelizacionApi.obtenerBilletera().catch((err: any) => {
        if (err?.status === 403 || err?.message?.includes("permisos")) {
          setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Cliente Hogar (CLIENTE).");
        }
        return null;
      });
      setBilletera(b);
    } catch {
      // Ignorar errores
    } finally {
      setCargando(false);
    }
  }, []);

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

    window.addEventListener("catalogo_premios_actualizado", handleSync);
    window.addEventListener("catalogo_categorias_actualizado", handleCategoriasSync);

    return () => {
      window.removeEventListener("catalogo_premios_actualizado", handleSync);
      window.removeEventListener("catalogo_categorias_actualizado", handleCategoriasSync);
    };
  }, [cargarDatos]);

  const saldo = billetera?.saldoPuntos ?? 0;
  const nivel = saldo >= 300 ? "Oro" : saldo >= 100 ? "Plata" : "Bronce";

  // Lista única de marcas para el selector
  const marcasDisponibles = useMemo(() => {
    const setMarcas = new Set<string>();
    catalogoPremios.forEach((p) => {
      if (p.marca) setMarcas.add(p.marca);
    });
    return Array.from(setMarcas).sort();
  }, [catalogoPremios]);

  // Filtrado y Ordenamiento de los productos
  const premiosFiltrados = useMemo(() => {
    let res = catalogoPremios.filter((p) => {
      // Filtro por texto
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const coincideNombre = p.nombre.toLowerCase().includes(q);
        const coincideMarca = p.marca.toLowerCase().includes(q);
        const coincideDesc = p.descripcion.toLowerCase().includes(q);
        if (!coincideNombre && !coincideMarca && !coincideDesc) return false;
      }

      // Filtro por categoría
      if (categoriaSeleccionada !== "TODOS" && p.categoria !== categoriaSeleccionada) {
        return false;
      }

      // Filtro por marca
      if (marcaSeleccionada !== "TODAS" && p.marca !== marcaSeleccionada) {
        return false;
      }

      // Filtro por rango de puntos
      if (rangoPuntos === "HASTA_100" && p.puntos > 100) return false;
      if (rangoPuntos === "101_250" && (p.puntos <= 100 || p.puntos > 250)) return false;
      if (rangoPuntos === "251_500" && (p.puntos <= 250 || p.puntos > 500)) return false;
      if (rangoPuntos === "MAS_500" && p.puntos <= 500) return false;

      // Filtro de alcanzables
      if (soloAlcanzables && saldo < p.puntos) return false;

      return true;
    });

    // Ordenamiento
    res = [...res].sort((a, b) => {
      if (orden === "PUNTOS_ASC") return a.puntos - b.puntos;
      if (orden === "PUNTOS_DESC") return b.puntos - a.puntos;
      if (orden === "NOMBRE_ASC") return a.nombre.localeCompare(b.nombre);
      if (orden === "VALOR_DESC") return b.valorSoles - a.valorSoles;
      return 0;
    });

    return res;
  }, [busqueda, categoriaSeleccionada, marcaSeleccionada, rangoPuntos, soloAlcanzables, orden, saldo]);

  // Paginación de resultados
  const totalPaginas = Math.ceil(premiosFiltrados.length / itemsPorPagina) || 1;
  const premiosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return premiosFiltrados.slice(inicio, inicio + itemsPorPagina);
  }, [premiosFiltrados, paginaActual, itemsPorPagina]);

  // Reset de página al cambiar filtros
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
    if (saldo < premio.puntos) {
      alert(`Necesitas ${premio.puntos} puntos para canjear este premio. Tu saldo actual es de ${saldo} pts.`);
      return;
    }

    const codigoGenerado = `${premio.codigoCupon}-${Math.floor(1000 + Math.random() * 9000)}`;
    setCanjeExitoso({
      premio,
      codigoCupon: codigoGenerado,
    });
  };

  const handleCopiarCodigo = () => {
    if (!canjeExitoso) return;
    navigator.clipboard.writeText(canjeExitoso.codigoCupon);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const totalAlcanzables = useMemo(() => {
    return PREMIOS_ZETA_PREMIA.filter((p) => saldo >= p.puntos).length;
  }, [saldo]);

  return (
    <div className="w-full px-3 sm:px-6 py-4 space-y-4 text-xs text-slate-800">
      {errorPermisos && (
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
                <h3 className="text-sm sm:text-base font-black text-emerald-950 mt-0.5">
                  {canjeExitoso.premio.nombre}
                </h3>
              </div>
            </div>

            <button
              onClick={() => setCanjeExitoso(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold p-1 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="bg-white rounded-xl p-3 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-[10px] uppercase font-bold text-slate-500">
                Tu Código de Descuento para la Tienda:
              </p>
              <p className="text-xs text-slate-600">
                Ingresa este código en tu pedido para aplicar los <strong>S/ {canjeExitoso.premio.valorSoles.toFixed(2)}</strong> de descuento.
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

          <div className="flex items-center justify-between gap-2 pt-1 text-xs">
            <span className="text-emerald-800">
              Puntos canjeados: <strong>{canjeExitoso.premio.puntos} PTS</strong>
            </span>
            <Link
              href="/cliente/tienda"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Ir a la Tienda a Usar Cupón</span>
            </Link>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECCIÓN SUPERIOR FIJA (STICKY): BANNER OFICIAL + CONTROLES DE FILTROS Y VISTA
      ========================================================================= */}
      <div className="sticky top-16 z-30 bg-muted/95 backdrop-blur-md pt-0.5 pb-1 space-y-2.5 transition-all">
        {/* CABECERA OFICIAL RAPPIGAS • CATÁLOGO DE PREMIOS ESTILO ZETA PREMIA */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-xl px-4 py-2 text-white shadow-xs flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xs sm:text-sm font-black tracking-tight leading-none">
                  RappiGas • Catálogo Oficial de Canjes
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20">
                  <ShieldCheck className="w-3 h-3 text-emerald-300" />
                  Catálogo Zeta Premia Style (100 Productos)
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-white/25 text-white">
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  Nivel {nivel}
                </span>
              </div>
              <p className="text-[10px] text-orange-100 hidden sm:block mt-0.5">
                Canjea tus puntos acumulados por electrohogar, menaje, balones gratis y vales de descuento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-semibold">
            {/* Badge Destacado de Puntos Disponibles */}
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300 text-amber-950 px-3 py-1 rounded-xl shadow-md border-2 border-white/70 font-black shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-900 fill-amber-900 animate-pulse shrink-0" />
              <div className="flex items-center gap-1 leading-none">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-900">Saldo:</span>
                <span className="text-xs font-black text-amber-950 bg-white/80 px-1.5 py-0.5 rounded shadow-2xs font-mono">
                  {Number(saldo).toLocaleString()} PTS
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={cargarDatos}
              disabled={cargando}
              className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition cursor-pointer"
              title="Actualizar saldo de puntos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} />
            </button>

            <Link
              href="/cliente/puntos"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-orange-600 hover:bg-orange-50 font-black rounded-lg text-xs shadow-xs transition cursor-pointer"
            >
              <span>Ver Historial de Puntos</span>
            </Link>
          </div>
        </div>

        {/* BARRA DE CONTROL: TOGGLE FILTROS + CONTADOR + SELECTOR DE VISTA */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
          {/* Botón para Mostrar / Ocultar Filtros + Contador */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMostrarFiltros((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border shadow-xs ${
                mostrarFiltros
                  ? "bg-[#03246b] text-white border-[#03246b] hover:bg-[#021b52]"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              }`}
              title={mostrarFiltros ? "Ocultar panel de filtros lateral" : "Mostrar panel de filtros lateral"}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
              <span>{mostrarFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}</span>
            </button>

            <span className="text-slate-500 font-semibold text-xs">
              Mostrando <strong className="text-slate-800">{premiosFiltrados.length}</strong> de {PREMIOS_ZETA_PREMIA.length} premios
            </span>
          </div>

          {/* Selector de Orden y Selector de Modo de Vista (3 cols / 4 cols / Lista) */}
          <div className="flex items-center gap-3">
            {/* Ordenar Por */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 hidden sm:inline font-medium">Ordenar:</span>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as OrdenOpcion)}
                className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 cursor-pointer focus:outline-hidden focus:border-orange-500"
              >
                <option value="PUNTOS_ASC">Menor a mayor puntaje</option>
                <option value="PUNTOS_DESC">Mayor a menor puntaje</option>
                <option value="NOMBRE_ASC">Nombre (A - Z)</option>
                <option value="VALOR_DESC">Mayor valor en soles</option>
              </select>
            </div>

            {/* Opciones de Vista: 3 cols / 4 cols / Lista */}
            <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setModoVista("grid3")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  modoVista === "grid3"
                    ? "bg-white text-orange-600 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Ver en 3 columnas"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setModoVista("grid4")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  modoVista === "grid4"
                    ? "bg-white text-orange-600 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Ver en 4 columnas"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setModoVista("lista")}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  modoVista === "lista"
                    ? "bg-white text-orange-600 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Ver en formato lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONTENEDOR PRINCIPAL: PANEL LATERAL FIJO / STICKY + CATÁLOGO DE PREMIOS
      ========================================================================= */}
      <div className="flex flex-col lg:flex-row items-start gap-5">
        {/* PANEL LATERAL DE FILTROS (STICKY AL BAJAR EL CATÁLOGO) */}
        {mostrarFiltros && (
          <aside className="w-full lg:w-72 shrink-0 bg-white rounded-3xl border border-slate-200 p-4 space-y-4 shadow-xs lg:sticky lg:top-[11.5rem] lg:self-start lg:max-h-[calc(100vh-12.5rem)] lg:overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full transition-all duration-200 animate-in fade-in duration-150">
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
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  title="Ocultar filtros"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          {/* Buscador de Premios */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500 block">
              Buscar Premio
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ej: Licuadora, sartén, vale..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-orange-500 transition"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Switch: Solo lo que me alcanza */}
          <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-950 select-none">
              <input
                type="checkbox"
                checked={soloAlcanzables}
                onChange={(e) => setSoloAlcanzables(e.target.checked)}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 cursor-pointer"
              />
              <div className="flex flex-col">
                <span>Solo lo que me alcanza</span>
                <span className="text-[10px] text-amber-700 font-medium">
                  {totalAlcanzables} premios con tus {saldo} pts
                </span>
              </div>
            </label>
          </div>

          {/* Filtro por Categorías */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-500 block">
              Categorías
            </label>
            <div className="space-y-1">
              {categorias.map((cat) => {
                const seleccionada = categoriaSeleccionada === cat.id;
                const conteo =
                  cat.id === "TODOS"
                    ? catalogoPremios.length
                    : catalogoPremios.filter((p) => p.categoria === cat.id).length;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoriaSeleccionada(cat.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition cursor-pointer text-xs ${
                      seleccionada
                        ? "bg-[#03246b] text-white font-black shadow-2xs"
                        : "text-slate-700 hover:bg-slate-100 font-semibold"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{cat.icono}</span>
                      <span className="truncate">{cat.nombre}</span>
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                        seleccionada ? "bg-white/20 text-white font-bold" : "bg-slate-100 text-slate-500 font-medium"
                      }`}
                    >
                      {conteo}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtro por Rango de Puntos Fijo */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase text-slate-500 block">
                Rango de Puntos
              </label>
              {rangoPuntos !== "TODOS" && (
                <button
                  type="button"
                  onClick={() => setRangoPuntos("TODOS")}
                  className="text-[10px] font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  Restablecer
                </button>
              )}
            </div>
            <div className="space-y-1 text-xs">
              {[
                {
                  id: "TODOS",
                  label: "Todos los puntajes",
                  desc: "Catálogo completo",
                  count: PREMIOS_ZETA_PREMIA.length,
                },
                {
                  id: "HASTA_100",
                  label: "Hasta 100 PTS",
                  desc: "Básicos y vales",
                  count: PREMIOS_ZETA_PREMIA.filter((p) => p.puntos <= 100).length,
                },
                {
                  id: "101_250",
                  label: "101 a 250 PTS",
                  desc: "Menaje y accesorios",
                  count: PREMIOS_ZETA_PREMIA.filter((p) => p.puntos > 100 && p.puntos <= 250).length,
                },
                {
                  id: "251_500",
                  label: "251 a 500 PTS",
                  desc: "Electrodomésticos",
                  count: PREMIOS_ZETA_PREMIA.filter((p) => p.puntos > 250 && p.puntos <= 500).length,
                },
                {
                  id: "MAS_500",
                  label: "Más de 500 PTS",
                  desc: "Balones & Premium",
                  count: PREMIOS_ZETA_PREMIA.filter((p) => p.puntos > 500).length,
                },
              ].map((r) => {
                const activo = rangoPuntos === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRangoPuntos(r.id as RangoPuntos)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition cursor-pointer text-xs ${
                      activo
                        ? "bg-orange-600 text-white font-bold shadow-2xs"
                        : "text-slate-600 hover:bg-slate-100 font-medium"
                    }`}
                  >
                    <div className="flex flex-col truncate">
                      <span className="truncate">{r.label}</span>
                      <span className={`text-[9px] ${activo ? "text-orange-100" : "text-slate-400"}`}>
                        {r.desc}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                        activo ? "bg-white/20 text-white font-bold" : "bg-slate-100 text-slate-500 font-medium"
                      }`}
                    >
                      {r.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtro por Marca */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <label className="text-[10px] font-bold uppercase text-slate-500 block">
              Marca / Fabricante
            </label>
            <select
              value={marcaSeleccionada}
              onChange={(e) => setMarcaSeleccionada(e.target.value)}
              className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 cursor-pointer focus:outline-hidden focus:border-orange-500"
            >
              <option value="TODAS">Todas las marcas ({marcasDisponibles.length})</option>
              {marcasDisponibles.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </aside>
        )}

        {/* CATÁLOGO DE PRODUCTOS / PREMIOS */}
        <div className="flex-1 w-full space-y-4 min-w-0">
          {premiosFiltrados.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200 space-y-2 shadow-xs">
              <Award className="w-12 h-12 text-orange-400 mx-auto" />
              <h4 className="font-black text-sm text-[#03246b]">No se encontraron premios</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                VISTA EN FORMATO LISTA HORIZONTAL
            ========================================================================= */
            <div className="space-y-2.5">
              {premiosPaginados.map((premio) => {
                const alcanza = saldo >= premio.puntos;
                const porcentaje = Math.min(100, Math.round((saldo / premio.puntos) * 100));

                return (
                  <div
                    key={premio.id}
                    className={`bg-white rounded-2xl border p-3 sm:p-4 shadow-xs hover:shadow-md transition flex flex-col sm:flex-row items-center justify-between gap-3 ${
                      alcanza ? "border-emerald-300 ring-1 ring-emerald-100" : "border-slate-200"
                    }`}
                  >
                    {/* Imagen y Datos Principales - Clic para ver Detalle */}
                    <Link
                      href={`/cliente/canjes/${premio.id}`}
                      className="flex items-center gap-3.5 min-w-0 flex-1 w-full sm:w-auto cursor-pointer group"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-xl p-2 flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-105 transition-transform duration-200">
                        <img
                          src={premio.imagen}
                          alt={premio.nombre}
                          className="w-full h-full object-contain filter drop-shadow-sm"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                          }}
                        />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.2 rounded-md border border-orange-200">
                            {premio.marca}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Valor aprox: <strong>S/ {premio.valorSoles.toFixed(2)}</strong>
                          </span>
                        </div>

                        <h3 className="font-black text-sm text-[#03246b] truncate group-hover:text-orange-600 transition">
                          {premio.nombre}
                        </h3>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {premio.descripcion}
                        </p>
                      </div>
                    </Link>

                    {/* Costo, Progreso y Botones */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 w-full sm:w-56 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <span className="text-base font-black text-orange-600 font-mono block leading-none">
                          {premio.puntos} PTS
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {alcanza ? "¡Puntos suficientes!" : `Faltan ${premio.puntos - saldo} pts`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 w-full">
                        <Link
                          href={`/cliente/canjes/${premio.id}`}
                          className="flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition text-center shadow-2xs"
                        >
                          Ver Detalle
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleCanjear(premio)}
                          disabled={!alcanza}
                          className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 shadow-xs cursor-pointer ${
                            alcanza
                              ? "bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>{alcanza ? "Canjear" : "Insuficiente"}</span>
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
              className={`grid gap-3.5 sm:gap-4 ${
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
                const alcanza = saldo >= premio.puntos;
                const porcentaje = Math.min(100, Math.round((saldo / premio.puntos) * 100));

                return (
                  <div
                    key={premio.id}
                    className={`bg-white rounded-3xl border transition shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden ${
                      alcanza
                        ? "border-emerald-300 ring-2 ring-emerald-100"
                        : "border-slate-200 hover:border-orange-300"
                    }`}
                  >
                    {/* Cabecera del Premio - Clic hacia Detalle Individual */}
                    <Link
                      href={`/cliente/canjes/${premio.id}`}
                      className="p-4 space-y-2.5 block cursor-pointer group flex-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {premio.marca}
                        </span>

                        <span className="text-[10px] font-bold text-slate-400">
                          S/ {premio.valorSoles.toFixed(2)}
                        </span>
                      </div>

                      {/* Imagen del Producto */}
                      <div className="w-full h-32 sm:h-36 bg-slate-50/80 rounded-2xl p-3 flex items-center justify-center border border-slate-100 overflow-hidden">
                        <img
                          src={premio.imagen}
                          alt={premio.nombre}
                          className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-108 transition-transform duration-300"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                          }}
                        />
                      </div>

                      {/* Nombre y Descripción */}
                      <div>
                        <h3 className="font-black text-xs sm:text-sm text-[#03246b] line-clamp-1 group-hover:text-orange-600 transition" title={premio.nombre}>
                          {premio.nombre}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {premio.descripcion}
                        </p>
                      </div>
                    </Link>

                    {/* Pie con Costo, Ver Detalle y Botón de Canje */}
                    <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">
                            Costo:
                          </span>
                          <span className="text-base font-black text-orange-600 font-mono">
                            {premio.puntos} PTS
                          </span>
                        </div>

                        <div className="text-right">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              alcanza
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {alcanza ? "¡Alcanza!" : `Faltan ${premio.puntos - saldo} pts`}
                          </span>
                        </div>
                      </div>

                      {/* Barra de progreso */}
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${porcentaje}%` }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            alcanza ? "bg-emerald-500" : "bg-orange-500"
                          }`}
                        />
                      </div>

                      {/* Botones: Ver Detalle y Canjear */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <Link
                          href={`/cliente/canjes/${premio.id}`}
                          className="flex-1 py-2 px-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] transition text-center shadow-2xs"
                        >
                          Ver Detalle
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleCanjear(premio)}
                          disabled={!alcanza}
                          className={`flex-1 py-2 px-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1 shadow-xs cursor-pointer ${
                            alcanza
                              ? "bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed"
                          }`}
                        >
                          <Gift className="w-3.5 h-3.5" />
                          <span>{alcanza ? "Canjear" : "Faltan pts"}</span>
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
            <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-medium">
                Página <strong>{paginaActual}</strong> de {totalPaginas}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                  title="Página anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => {
                  // Mostrar primera, última y cercanas
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
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                          num === paginaActual
                            ? "bg-[#03246b] text-white shadow-2xs"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {num}
                      </button>
                    );
                  }
                  if (num === 2 && paginaActual > 3) {
                    return <span key={num} className="px-1 text-slate-400">...</span>;
                  }
                  if (num === totalPaginas - 1 && paginaActual < totalPaginas - 2) {
                    return <span key={num} className="px-1 text-slate-400">...</span>;
                  }
                  return null;
                })}

                <button
                  type="button"
                  onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                  title="Página siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
