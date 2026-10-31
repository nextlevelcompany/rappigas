"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Gift,
  Flame,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Truck,
  Phone,
  CheckCircle2,
  X,
  LogIn,
  ArrowRight,
  Scale,
  Award,
  Layers,
} from "lucide-react";
import {
  PREMIOS_ZETA_PREMIA,
  CATEGORIAS_CONFIG_DEFAULT,
  PremioCanje,
  CategoriaPremio,
} from "@/app/(cliente)/cliente/canjes/premios-data";
import { useAuthStore } from "@/store/auth-store";

type OrdenOpcion = "PUNTOS_ASC" | "PUNTOS_DESC" | "NOMBRE_ASC" | "VALOR_DESC";
type RangoPuntos = "TODOS" | "HASTA_100" | "101_250" | "251_500" | "MAS_500";

const ITEMS_POR_PAGINA = 12;

export default function CatalogoPublicoModerno() {
  const { estaAutenticado, usuario } = useAuthStore();

  // Estados de Filtros
  const [busqueda, setBusqueda] = useState<string>("");
  const [categoriaSel, setCategoriaSel] = useState<string>("TODOS");
  const [rangoPuntos, setRangoPuntos] = useState<RangoPuntos>("TODOS");
  const [orden, setOrden] = useState<OrdenOpcion>("PUNTOS_ASC");
  const [paginaActual, setPaginaActual] = useState<number>(1);

  // Modales
  const [premioDetalle, setPremioDetalle] = useState<PremioCanje | null>(null);
  const [premioCanjear, setPremioCanjear] = useState<PremioCanje | null>(null);

  // Filtrado y Ordenamiento
  const premiosFiltrados = useMemo(() => {
    return PREMIOS_ZETA_PREMIA.filter((premio) => {
      // Filtro de Categoría
      if (categoriaSel !== "TODOS" && premio.categoria !== categoriaSel) {
        return false;
      }

      // Filtro de Búsqueda de texto
      if (busqueda.trim()) {
        const query = busqueda.toLowerCase().trim();
        const coincideNombre = premio.nombre.toLowerCase().includes(query);
        const coincideDesc = premio.descripcion.toLowerCase().includes(query);
        const coincideMarca = premio.marca.toLowerCase().includes(query);
        if (!coincideNombre && !coincideDesc && !coincideMarca) return false;
      }

      // Filtro de Rango de Puntos
      if (rangoPuntos === "HASTA_100" && premio.puntos > 100) return false;
      if (
        rangoPuntos === "101_250" &&
        (premio.puntos <= 100 || premio.puntos > 250)
      )
        return false;
      if (
        rangoPuntos === "251_500" &&
        (premio.puntos <= 250 || premio.puntos > 500)
      )
        return false;
      if (rangoPuntos === "MAS_500" && premio.puntos <= 500) return false;

      return true;
    }).sort((a, b) => {
      if (orden === "PUNTOS_ASC") return a.puntos - b.puntos;
      if (orden === "PUNTOS_DESC") return b.puntos - a.puntos;
      if (orden === "NOMBRE_ASC") return a.nombre.localeCompare(b.nombre);
      if (orden === "VALOR_DESC") return b.valorSoles - a.valorSoles;
      return 0;
    });
  }, [busqueda, categoriaSel, rangoPuntos, orden]);

  // Paginación
  const totalPaginas = Math.ceil(premiosFiltrados.length / ITEMS_POR_PAGINA);
  const premiosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
    return premiosFiltrados.slice(inicio, inicio + ITEMS_POR_PAGINA);
  }, [premiosFiltrados, paginaActual]);

  const handleCambiarCategoria = (catId: string) => {
    setCategoriaSel(catId);
    setPaginaActual(1);
  };

  const handleLimpiarFiltros = () => {
    setBusqueda("");
    setCategoriaSel("TODOS");
    setRangoPuntos("TODOS");
    setOrden("PUNTOS_ASC");
    setPaginaActual(1);
  };

  return (
    <div className="catalogo-publico-moderno bg-slate-50 text-slate-800 font-sans">
      {/* =========================================================================
          HERO BANNER ELEGANTE RAPPIGAS
      ========================================================================= */}
      <section
        className="pb-10 bg-gradient-to-b from-[#f1f5f9] via-slate-100 to-slate-50 border-b border-slate-200/80 relative overflow-hidden"
        style={{ paddingTop: "175px" }}
      >
        {/* Formas suaves de fondo */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container max-w-[1320px] mx-auto px-4 text-center relative z-10 space-y-4">
          {/* Breadcrumb superior */}
          <nav className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-white shadow-2xs border border-slate-200/80 text-slate-500">
            <Link
              href="/"
              className="hover:text-[#FF5722] transition flex items-center gap-1 text-slate-600 font-medium"
            >
              <i className="bi bi-house-door text-orange-500"></i> Inicio
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              href="/premios"
              className="hover:text-[#FF5722] transition text-slate-600 font-medium"
            >
              Club de Premios
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-[#FF5722] font-black">Catálogo de Canjes</span>
          </nav>

          <div className="space-y-3 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0b1538] tracking-tight leading-tight m-0">
              Catálogo Oficial de Premios{" "}
              <span className="text-[#FF5722]">RappiPuntos</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto m-0">
              Por cada balón de gas que compras acumulas{" "}
              <strong className="text-slate-900 font-extrabold">50 puntos automáticos</strong>.
              Explora más de 100 premios canjeables para tu cocina y hogar con{" "}
              <strong className="text-slate-900 font-extrabold">delivery 100% gratuito</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BARRA DE 3 BENEFICIOS CLAVE
      ========================================================================= */}
      <div className="bg-white border-b border-slate-200 py-5 shadow-xs">
        <div className="container max-w-[1320px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-orange-50/70 border border-orange-100">
              <div className="w-11 h-11 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                  1 Balón de Gas = +50 Pts
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Suma puntos directos a tu celular en cada compra.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-blue-50/70 border border-blue-100">
              <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                  Peso Exacto Verificado
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Balanza digital en tu puerta antes de pagar.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <div className="w-11 h-11 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                  Delivery Gratis a tu Puerta
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Entregamos tus canjes en 25 a 35 minutos sin costo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONTENEDOR PRINCIPAL DEL CATÁLOGO
      ========================================================================= */}
      <div className="container max-w-[1320px] mx-auto px-4 py-8">
        {/* BARRA SUPERIOR DE FILTRADO, BÚSQUEDA Y ORDENAMIENTO */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Buscador de Premios */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                placeholder="Buscar por licuadora, sartén, balón, vale..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all placeholder:text-slate-400"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Controles de Rango de Puntos y Orden */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Puntos:</span>
                <select
                  value={rangoPuntos}
                  onChange={(e) => {
                    setRangoPuntos(e.target.value as RangoPuntos);
                    setPaginaActual(1);
                  }}
                  className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                >
                  <option value="TODOS">Todos los rangos</option>
                  <option value="HASTA_100">Hasta 100 PTS</option>
                  <option value="101_250">101 a 250 PTS</option>
                  <option value="251_500">251 a 500 PTS</option>
                  <option value="MAS_500">Más de 500 PTS</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Ordenar:</span>
                <select
                  value={orden}
                  onChange={(e) => setOrden(e.target.value as OrdenOpcion)}
                  className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                >
                  <option value="PUNTOS_ASC">Menor a mayor puntaje</option>
                  <option value="PUNTOS_DESC">Mayor a menor puntaje</option>
                  <option value="NOMBRE_ASC">Nombre (A - Z)</option>
                  <option value="VALOR_DESC">Mayor valor comercial</option>
                </select>
              </div>

              {(busqueda ||
                categoriaSel !== "TODOS" ||
                rangoPuntos !== "TODOS") && (
                <button
                  type="button"
                  onClick={handleLimpiarFiltros}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 underline cursor-pointer ml-1"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Selector de Categorías Horizontal con Iconos */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIAS_CONFIG_DEFAULT.map((cat) => {
              const activa = categoriaSel === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCambiarCategoria(cat.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    activa
                      ? "bg-[#FF5722] text-white border-[#FF5722] shadow-sm shadow-orange-500/30"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <span className="text-sm">{cat.icono}</span>
                  <span>{cat.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTADOR DE RESULTADOS */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
          <span>
            Mostrando <strong>{premiosFiltrados.length}</strong> de{" "}
            <strong>{PREMIOS_ZETA_PREMIA.length}</strong> premios disponibles
          </span>
          {totalPaginas > 1 && (
            <span>
              Página <strong>{paginaActual}</strong> de {totalPaginas}
            </span>
          )}
        </div>

        {/* =========================================================================
            GRILLA MODERNA DE PREMIOS (3 COLUMNAS RESPONSIVE)
        ========================================================================= */}
        {premiosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-2xl">
              🔍
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No encontramos premios con esos criterios
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Intenta cambiar la categoría, relajar el rango de puntos o borrar
              la búsqueda para ver todos los premios del catálogo.
            </p>
            <button
              type="button"
              onClick={handleLimpiarFiltros}
              className="px-5 py-2.5 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold text-xs transition cursor-pointer shadow-sm"
            >
              Restablecer todos los filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiosPaginados.map((premio) => (
              <div
                key={premio.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Cabecera de Tarjeta: Marca y Valor referencial */}
                <div className="p-5 pb-3 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {premio.marca}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      Valor: S/ {premio.valorSoles.toFixed(2)}
                    </span>
                  </div>

                  {/* Imagen del Producto con Fondo Suave */}
                  <div
                    onClick={() => setPremioDetalle(premio)}
                    className="w-full h-48 bg-gradient-to-b from-slate-50 to-slate-100/70 rounded-xl p-4 flex items-center justify-center border border-slate-100 overflow-hidden relative cursor-pointer"
                  >
                    <img
                      src={premio.imagen}
                      alt={premio.nombre}
                      className="max-h-full max-w-full object-contain drop-shadow-md group-hover:scale-108 transition-transform duration-300 ease-out"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/products/balon-10kg-premium.svg";
                      }}
                    />
                  </div>

                  {/* Título y Descripción */}
                  <div>
                    <h3
                      onClick={() => setPremioDetalle(premio)}
                      className="font-black text-sm text-[#0b1538] hover:text-[#FF5722] transition-colors cursor-pointer line-clamp-1 leading-snug"
                      title={premio.nombre}
                    >
                      {premio.nombre}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                      {premio.descripcion}
                    </p>
                  </div>
                </div>

                {/* Pie de Tarjeta: Puntos y Botones de Acción */}
                <div className="p-4 bg-gradient-to-b from-slate-50/80 to-slate-100/60 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block leading-none">
                        Costo de Canje:
                      </span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-black text-[#FF5722] font-mono leading-none">
                          {premio.puntos}
                        </span>
                        <span className="text-[11px] font-black text-orange-500 tracking-wider">
                          PTS
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200/90 shadow-2xs">
                      Equiv. S/ {premio.valorSoles.toFixed(2)}
                    </span>
                  </div>

                  {/* Botones: Ver Detalle y Canjear */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setPremioDetalle(premio)}
                      className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs transition-all text-center shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                    >
                      Ver Detalle
                    </button>
                    <button
                      type="button"
                      onClick={() => setPremioCanjear(premio)}
                      className="flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md active:scale-95 cursor-pointer bg-gradient-to-r from-[#FF5722] to-[#D84315] hover:from-[#F4511E] hover:to-[#BF360C] text-white shadow-orange-500/20"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>Canjear</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =========================================================================
            BARRA DE PAGINACIÓN LIMPIA
        ========================================================================= */}
        {totalPaginas > 1 && (
          <div className="mt-8 bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">
              Página <strong>{paginaActual}</strong> de {totalPaginas}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                disabled={paginaActual === 1}
                className={`p-2 rounded-lg border transition ${
                  paginaActual === 1
                    ? "border-slate-200 text-slate-300 cursor-not-allowed"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                }`}
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => {
                const activo = num === paginaActual;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPaginaActual(num)}
                    className={`w-8 h-8 rounded-lg font-bold transition text-xs cursor-pointer ${
                      activo
                        ? "bg-[#FF5722] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() =>
                  setPaginaActual((p) => Math.min(totalPaginas, p + 1))
                }
                disabled={paginaActual === totalPaginas}
                className={`p-2 rounded-lg border transition ${
                  paginaActual === totalPaginas
                    ? "border-slate-200 text-slate-300 cursor-not-allowed"
                    : "border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                }`}
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            BANNER INFORMATIVO INFERIOR: CÓMO FUNCIONA EL CLUB
        ========================================================================= */}
        <div className="mt-12 bg-gradient-to-r from-[#0b1538] to-[#1e293b] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#FF5722]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 font-bold text-xs border border-orange-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Club de Premios RappiGas
            </span>

            <h2 className="text-2xl sm:text-3xl font-black leading-tight text-white m-0">
              ¿Cómo canjear tus premios en RappiGas?
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed m-0">
              Es muy fácil. Por cada balón de gas de 10kg, 15kg o 45kg que pidas
              para tu hogar o negocio, acumulas <strong>50 puntos</strong> en tu
              billetera digital asociada a tu número telefónico. Canjea tus
              premios en cualquier momento y te los entregamos con delivery gratis.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                <span className="text-orange-400 font-mono font-black text-lg block mb-1">
                  Paso 1
                </span>
                <h5 className="font-bold text-sm text-white mb-1">
                  Pide tu Gas
                </h5>
                <p className="text-xs text-slate-300">
                  Llama al 977 665 554 o solicita desde la web con balanza digital.
                </p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                <span className="text-orange-400 font-mono font-black text-lg block mb-1">
                  Paso 2
                </span>
                <h5 className="font-bold text-white text-sm mb-1">
                  Acumula 50 Pts
                </h5>
                <p className="text-xs text-slate-300">
                  Cada balón entregado suma puntos automáticamente a tu cuenta.
                </p>
              </div>

              <div className="bg-white/10 rounded-xl p-4 border border-white/10">
                <span className="text-orange-400 font-mono font-black text-lg block mb-1">
                  Paso 3
                </span>
                <h5 className="font-bold text-white text-sm mb-1">
                  Canjea Premios
                </h5>
                <p className="text-xs text-slate-300">
                  Elige tu premio del catálogo y recíbelo en tu puerta gratis.
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <a
                href="tel:977665554"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-black text-xs shadow-md transition cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Pedir Gas Ahora: 977 665 554</span>
              </a>

              <Link
                href="/login?redirect=/premios/catalogo"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Consultar Mi Saldo de Puntos</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL DE DETALLE DEL PREMIO
      ========================================================================= */}
      {premioDetalle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#FF5722] text-white">
                  {premioDetalle.marca}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {premioDetalle.categoria}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPremioDetalle(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="w-full h-56 bg-slate-50 rounded-2xl p-4 flex items-center justify-center border border-slate-100">
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

              <div>
                <h3 className="font-black text-lg text-[#0b1538]">
                  {premioDetalle.nombre}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {premioDetalle.descripcion}
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-orange-600 block">
                    Costo en RappiPuntos
                  </span>
                  <span className="text-2xl font-black text-[#FF5722] font-mono">
                    {premioDetalle.puntos} PTS
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Valor Comercial
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    S/ {premioDetalle.valorSoles.toFixed(2)}
                  </span>
                </div>
              </div>

              {premioDetalle.especificaciones && (
                <div className="space-y-1.5 pt-1">
                  <h5 className="text-xs font-bold text-slate-700">
                    Especificaciones técnicas:
                  </h5>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {premioDetalle.especificaciones.map((esp, i) => (
                      <div
                        key={i}
                        className="p-2 bg-slate-50 rounded-lg border border-slate-100"
                      >
                        <span className="font-semibold text-slate-500 block text-[10px]">
                          {esp.clave}:
                        </span>
                        <span className="font-bold text-slate-800">
                          {esp.valor}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPremioDetalle(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = premioDetalle;
                  setPremioDetalle(null);
                  setPremioCanjear(p);
                }}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-[#D84315] hover:from-[#F4511E] hover:to-[#BF360C] text-white font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Gift className="w-4 h-4" />
                <span>Canjear Este Premio</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL DE CANJEAR PREMIO (LOGIN O LLAMADA DIRECTA)
      ========================================================================= */}
      {premioCanjear && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-[#FF5722] to-[#D84315] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-amber-200" />
                <h4 className="font-bold text-sm text-white m-0">
                  Canjear Premio RappiGas
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPremioCanjear(null)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 bg-orange-50 rounded-2xl border border-orange-100">
                <div className="w-14 h-14 bg-white rounded-xl p-2 flex items-center justify-center border border-orange-200 shrink-0">
                  <img
                    src={premioCanjear.imagen}
                    alt={premioCanjear.nombre}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/products/balon-10kg-premium.svg";
                    }}
                  />
                </div>
                <div>
                  <h4 className="font-black text-xs text-slate-900 line-clamp-1">
                    {premioCanjear.nombre}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-black text-[#FF5722] font-mono">
                      {premioCanjear.puntos} PTS
                    </span>
                    <span className="text-[10px] text-slate-500">
                      (Equiv. S/ {premioCanjear.valorSoles.toFixed(2)})
                    </span>
                  </div>
                </div>
              </div>

              {estaAutenticado ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Estás identificado como{" "}
                    <strong>{usuario?.nombres || "Cliente"}</strong>. Puedes
                    confirmar tu canje directamente en tu panel privado de
                    cliente con tu saldo actual de puntos.
                  </p>
                  <Link
                    href={`/cliente/canjes?premio=${premioCanjear.id}`}
                    className="w-full py-3 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Ir a Mi Panel de Canjes</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Para canjear este premio, inicia sesión con tu número
                    registrado o solicita tu balón de gas para acumular puntos hoy
                    mismo:
                  </p>

                  <div className="space-y-2">
                    <Link
                      href={`/login?redirect=/cliente/canjes`}
                      className="w-full py-3 rounded-xl bg-[#FF5722] hover:bg-[#E64A19] text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Iniciar Sesión para Canjear</span>
                    </Link>

                    <a
                      href="tel:977665554"
                      className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                    >
                      <Phone className="w-4 h-4 text-orange-600" />
                      <span>Pedir Gas y Consultar por Teléfono: 977 665 554</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
