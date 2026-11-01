"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  fidelizacionApi,
  BilleteraPuntos,
} from "@/librerias/api/fidelizacion.api";
import {
  PREMIOS_ZETA_PREMIA,
  CATEGORIAS_CONFIG,
  PremioCanje,
  obtenerCatalogoPremios,
  obtenerCategorias,
} from "../premios-data";
import {
  agregarAlCarritoCanjes,
  obtenerCarritoCanjes,
} from "../carrito-canjes";
import { CarritoCanjesDrawer } from "../carrito-drawer";
import {
  ArrowLeft,
  Gift,
  Sparkles,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ShoppingBag,
  Ticket,
  ChevronRight,
  Flame,
  Award,
  RefreshCw,
  Clock,
  HelpCircle,
  FileText,
  Boxes,
} from "lucide-react";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";

export default function DetallePremioPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [billetera, setBilletera] = useState<BilleteraPuntos | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);

  // Modal de Canje Exitoso
  const [canjeExitoso, setCanjeExitoso] = useState<{
    premio: PremioCanje;
    codigoCupon: string;
  } | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [canjeando, setCanjeando] = useState(false);

  // Carrito de Canjes
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [cantCarrito, setCantCarrito] = useState(0);
  const [totalPuntosCarrito, setTotalPuntosCarrito] = useState(0);

  const [catalogo, setCatalogo] = useState<PremioCanje[]>(PREMIOS_ZETA_PREMIA);

  useEffect(() => {
    setCatalogo(obtenerCatalogoPremios());
    const handleSync = () => {
      setCatalogo(obtenerCatalogoPremios());
    };
    const handleCarritoSync = () => {
      const itms = obtenerCarritoCanjes();
      setCantCarrito(itms.reduce((acc, it) => acc + it.cantidad, 0));
      setTotalPuntosCarrito(itms.reduce((acc, it) => acc + it.premio.puntos * it.cantidad, 0));
    };

    handleCarritoSync();

    window.addEventListener("catalogo_premios_actualizado", handleSync);
    window.addEventListener("carrito_canjes_actualizado", handleCarritoSync);

    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === "rappigas_catalogo_premios") {
        setCatalogo(obtenerCatalogoPremios());
      }
    };
    window.addEventListener("storage", handleStorageSync);

    return () => {
      window.removeEventListener("catalogo_premios_actualizado", handleSync);
      window.removeEventListener("carrito_canjes_actualizado", handleCarritoSync);
      window.removeEventListener("storage", handleStorageSync);
    };
  }, []);

  // Buscar el premio por ID
  const premio = useMemo(() => {
    return catalogo.find((p) => p.id === id) || null;
  }, [catalogo, id]);

  // Categoría del premio
  const categoriaInfo = useMemo(() => {
    if (!premio) return null;
    const cats = typeof window !== "undefined" ? obtenerCategorias() : CATEGORIAS_CONFIG;
    return (
      cats.find((c) => c.id === premio.categoria) || {
        id: premio.categoria,
        nombre: premio.categoria,
        icono: "🎁",
        badgeCls: "bg-slate-100 text-slate-700",
      }
    );
  }, [premio]);

  // Premios recomendados / relacionados (misma categoría o puntos cercanos)
  const premiosRelacionados = useMemo(() => {
    if (!premio) return [];
    return catalogo.filter(
      (p) => p.id !== premio.id && (p.categoria === premio.categoria || Math.abs(p.puntos - premio.puntos) <= 150)
    ).slice(0, 4);
  }, [catalogo, premio]);

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

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const saldo = billetera?.saldoPuntos ?? 0;
  const nivel = saldo >= 300 ? "Oro" : saldo >= 100 ? "Plata" : "Bronce";

  const alcanza = premio ? saldo >= premio.puntos : false;
  const puntosFaltantes = premio ? Math.max(0, premio.puntos - saldo) : 0;
  const porcentajeProgreso = premio ? Math.min(100, Math.round((saldo / premio.puntos) * 100)) : 0;

  const handleCanjear = () => {
    if (!premio) return;
    // Agregar al carrito de canjes para confirmar todo junto
    agregarAlCarritoCanjes(premio, 1);
    setCarritoAbierto(true);
  };

  const handleCopiarCodigo = () => {
    if (!canjeExitoso) return;
    navigator.clipboard.writeText(canjeExitoso.codigoCupon);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // Si no existe el premio
  if (!premio) {
    return (
      <div className="w-full px-4 sm:px-8 py-12 max-w-4xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-sm">
          <Gift className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-[#03246b]">Premio no encontrado</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          El artículo seleccionado no existe o ya no forma parte del catálogo activo de canjes.
        </p>
        <Link
          href="/cliente/canjes"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#03246b] text-white font-bold rounded-xl text-xs hover:bg-opacity-90 transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo de Canjes</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full px-3 sm:px-6 py-4 space-y-5 text-xs text-slate-800">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="CLIENTE"
          mensaje={errorPermisos}
          onExito={cargarDatos}
        />
      )}

      {/* =========================================================================
          BARRA DE NAVEGACIÓN Y BREADCRUMBS
      ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Link
            href="/cliente/canjes"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Catálogo</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>/</span>
            <Link href="/cliente/canjes" className="hover:text-slate-700">
              Canjes
            </Link>
            <span>/</span>
            <span className="text-slate-600 font-semibold">{categoriaInfo?.nombre}</span>
            <span>/</span>
            <span className="text-[#03246b] font-bold truncate max-w-xs">{premio.nombre}</span>
          </nav>
        </div>

        {/* Saldo de Puntos del Cliente */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 px-3 py-1 rounded-xl shadow-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-amber-900 fill-amber-900" />
            <span className="text-[10px] uppercase font-extrabold text-amber-900">Tus Puntos:</span>
            <span className="text-xs font-black text-amber-950 bg-white/80 px-1.5 py-0.5 rounded font-mono">
              {Number(saldo).toLocaleString()} PTS
            </span>
          </div>

          <Link
            href="/cliente/puntos"
            className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:underline px-2"
          >
            Historial
          </Link>

          {/* Botón Carrito de Canjes */}
          <button
            type="button"
            onClick={() => setCarritoAbierto(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl text-xs transition cursor-pointer shadow-xs"
            title="Abrir carrito de canjes para confirmar todo"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Carrito ({cantCarrito})</span>
            {totalPuntosCarrito > 0 && (
              <span className="font-mono text-[10px] bg-white/20 px-1 py-0.2 rounded font-bold">
                {totalPuntosCarrito} pts
              </span>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          MODAL DE CANJE EXITOSO
      ========================================================================= */}
      {canjeExitoso && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-5 shadow-lg space-y-3 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  ¡Canje Realizado con Éxito!
                </span>
                <h3 className="text-base font-black text-emerald-950 mt-1">
                  {canjeExitoso.premio.nombre}
                </h3>
              </div>
            </div>

            <button
              onClick={() => setCanjeExitoso(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold p-1.5 rounded-lg hover:bg-emerald-100 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] uppercase font-bold text-slate-500">
                Código de Canje Generado:
              </p>
              <p className="text-xs text-slate-600">
                Ingresa este código en tu próximo pedido para hacer efectivo el premio valorizado en{" "}
                <strong>S/ {canjeExitoso.premio.valorSoles.toFixed(2)}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-4 py-2 bg-orange-50 border-2 border-orange-400 rounded-xl text-base font-mono font-black text-orange-600 tracking-wider shadow-2xs">
                {canjeExitoso.codigoCupon}
              </span>
              <button
                type="button"
                onClick={handleCopiarCodigo}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiado ? "Copiado" : "Copiar"}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <span className="text-emerald-800 font-medium">
              Puntos descontados: <strong className="font-mono">{canjeExitoso.premio.puntos} PTS</strong> • Saldo disponible:{" "}
              <strong className="font-mono">{saldo} PTS</strong>
            </span>
            <div className="flex items-center gap-2">
              <Link
                href="/cliente/tienda"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Usar en Pedido de Gas</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          CONTENEDOR PRINCIPAL: VISTA DE TIENDA / FICHA DE PRODUCTO INDIVIDUAL
      ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA: FOTO GRANDE DEL PRODUCTO + BENEFICIOS */}
        <div className="lg:col-span-6 space-y-4">
          {/* Card Principal de la Imagen */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col items-center justify-center min-h-[340px] sm:min-h-[420px]">
            {/* Badges superiores sobre la imagen */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
              {premio.destacado && (
                <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs border border-amber-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-white text-white" />
                  <span>⭐ TOP DESTACADO EN TIENDA</span>
                </span>
              )}
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 flex items-center gap-1">
                <span>{categoriaInfo?.icono}</span>
                <span>{categoriaInfo?.nombre}</span>
              </span>
              <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                {premio.marca}
              </span>
            </div>

            <div className="absolute top-4 right-4 z-10">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Stock Disponible ({premio.stock} un)</span>
              </span>
            </div>

            {/* Imagen Principal Grande con efecto tienda */}
            <div className="w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center p-4 group">
              <img
                src={premio.imagen}
                alt={premio.nombre}
                className="max-w-full max-h-full object-contain filter drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                }}
              />
            </div>

            {/* Sello de Garantía Inferior */}
            <div className="w-full pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Producto 100% Original Certificado</span>
              </span>
              <span className="font-mono text-slate-400">ID: {premio.id}</span>
            </div>
          </div>

          {/* Tarjetas de Beneficios / Confianza */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-1">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <h4 className="font-black text-xs text-[#03246b]">Entrega Directa</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Llega a tu puerta junto a tu próximo balón de gas sin recargo adicional.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-1">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="font-black text-xs text-[#03246b]">Garantía Oficial</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Respaldo de {premio.marca} y certificación de calidad Zeta Premia.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-1">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <h4 className="font-black text-xs text-[#03246b]">Canje Seguro</h4>
              <p className="text-[11px] text-slate-500 leading-snug">
                Tus puntos acumulados se descuentan de forma instantánea y transparente.
              </p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: INFORMACIÓN, PUNTOS, BARRA DE PROGRESO Y BOTÓN DE CANJE */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
            {/* Encabezado del Producto */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200">
                  {premio.marca}
                </span>
                <span className="text-xs text-slate-400">
                  Valor Comercial Referencial: <strong className="text-slate-700">S/ {premio.valorSoles.toFixed(2)}</strong>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[#03246b] leading-tight">
                {premio.nombre}
              </h1>

              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {premio.descripcion}
              </p>
            </div>

            {/* CAJA PRINCIPAL DE PUNTOS Y ESTADO DE CANJE */}
            <div className="bg-gradient-to-br from-slate-50 to-orange-50/50 rounded-2xl p-5 border border-orange-100 space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block leading-none">
                    Puntos Requeridos:
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl sm:text-4xl font-black text-orange-600 font-mono tracking-tight">
                      {premio.puntos.toLocaleString()}
                    </span>
                    <span className="text-base font-extrabold text-orange-700">PUNTOS</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 block">Tu saldo actual:</span>
                  <span className="text-base font-black text-slate-800 font-mono">
                    {Number(saldo).toLocaleString()} PTS
                  </span>
                </div>
              </div>

              {/* Barra de progreso de puntos */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className={alcanza ? "text-emerald-700" : "text-amber-700"}>
                    {alcanza ? "¡Puntos suficientes para canjear!" : `Te faltan ${puntosFaltantes} puntos`}
                  </span>
                  <span className="text-slate-500 font-mono">{porcentajeProgreso}%</span>
                </div>

                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${porcentajeProgreso}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      alcanza ? "bg-emerald-500" : "bg-gradient-to-r from-orange-500 to-amber-500"
                    }`}
                  />
                </div>
              </div>

              {/* Botón Principal de Acción de Canje */}
              <div className="pt-2">
                {alcanza ? (
                  <button
                    type="button"
                    onClick={handleCanjear}
                    className="w-full py-3.5 px-6 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-black text-sm tracking-wide transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer transform active:scale-98"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Agregar al Carrito para Confirmar ({premio.puntos} PTS)</span>
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      type="button"
                      disabled
                      className="w-full py-3 px-6 rounded-2xl bg-slate-200 text-slate-400 font-black text-xs cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-slate-400" />
                      <span>Puntos Insuficientes (Te faltan {puntosFaltantes} pts)</span>
                    </button>

                    <Link
                      href="/cliente/tienda"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#03246b] hover:bg-[#021b52] text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
                    >
                      <ShoppingBag className="w-4 h-4 text-orange-400" />
                      <span>Pedir Balón de Gas para Acumular Puntos</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Ficha Técnica y Especificaciones Rápidas */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="font-black text-xs uppercase tracking-wider text-[#03246b] flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-orange-600" />
                Especificaciones del Producto
              </h3>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Marca</span>
                  <span className="font-extrabold text-slate-800">{premio.marca}</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Categoría</span>
                  <span className="font-extrabold text-slate-800">{categoriaInfo?.nombre}</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Código Cupón</span>
                  <span className="font-extrabold text-orange-600 font-mono">{premio.codigoCupon}</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Modalidad</span>
                  <span className="font-extrabold text-slate-800">Canje por Puntos RappiGas</span>
                </div>

                {premio.especificaciones?.map((esp, idx) => (
                  <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{esp.clave}</span>
                    <span className="font-extrabold text-slate-800">{esp.valor}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Condiciones del Canje */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-[11px] text-slate-500">
              <h4 className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                Términos y Condiciones del Canje
              </h4>
              <ul className="list-disc pl-4 space-y-1 leading-relaxed">
                <li>El canje descuenta los puntos inmediatamente de tu billetera digital.</li>
                <li>Se genera un cupón canjeable válido por 30 días para tu próximo pedido de gas.</li>
                <li>El producto se entrega a la dirección de tu pedido sin costo de envío adicional.</li>
                <li>Sujeto a stock disponible a nivel nacional (Lima y Provincias).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECCIÓN: OTROS PREMIOS RECOMENDADOS (ESTILO TIENDA)
      ========================================================================= */}
      {premiosRelacionados.length > 0 && (
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-[#03246b] flex items-center gap-2">
                <Boxes className="w-4 h-4 text-orange-600" />
                <span>Otros Premios Relacionados</span>
              </h2>
              <p className="text-xs text-slate-500">
                Premios de la categoría {categoriaInfo?.nombre} o con puntajes similares
              </p>
            </div>

            <Link
              href="/cliente/canjes"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 hover:underline"
            >
              <span>Ver catálogo completo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {premiosRelacionados.map((rel) => {
              const relAlcanza = saldo >= rel.puntos;
              return (
                <Link
                  key={rel.id}
                  href={`/cliente/canjes/${rel.id}`}
                  className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-orange-400 transition flex flex-col justify-between group cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="w-full h-32 bg-slate-50 rounded-2xl p-2 flex items-center justify-center overflow-hidden">
                      <img
                        src={rel.imagen}
                        alt={rel.nombre}
                        className="max-h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                        }}
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{rel.marca}</span>
                      <h3 className="font-black text-xs text-[#03246b] line-clamp-2 group-hover:text-orange-600 transition">
                        {rel.nombre}
                      </h3>
                    </div>
                  </div>

                  <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-orange-600 font-mono block leading-none">
                        {rel.puntos} PTS
                      </span>
                      <span className="text-[10px] text-slate-400">S/ {rel.valorSoles.toFixed(2)}</span>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        relAlcanza ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {relAlcanza ? "¡Alcanza!" : "Ver detalle"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Drawer del Carrito de Canjes */}
      <CarritoCanjesDrawer
        abierto={carritoAbierto}
        onCerrar={() => setCarritoAbierto(false)}
        saldoPuntos={saldo}
        onPuntosActualizados={(nuevo) => {
          if (billetera) {
            setBilletera({ ...billetera, saldoPuntos: nuevo });
          }
        }}
      />
    </div>
  );
}
