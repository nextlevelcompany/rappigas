"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  fidelizacionApi,
  BilleteraPuntos,
  MovimientoPuntos,
} from "@/librerias/api/fidelizacion.api";
import {
  Award,
  Flame,
  Gift,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Clock,
  Plus,
  ShoppingBag,
  Scale,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";

export default function PuntosClientePage() {
  const [billetera, setBilletera] = useState<BilleteraPuntos | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoPuntos[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorPermisos(null);
      const [bill, movs] = await Promise.all([
        fidelizacionApi.obtenerBilletera().catch((err: any) => {
          if (err?.status === 403 || err?.message?.includes("permisos")) {
            setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Cliente Hogar (CLIENTE).");
          }
          return null;
        }),
        fidelizacionApi.obtenerMovimientos().catch(() => []),
      ]);
      setBilletera(bill);
      setMovimientos(movs);
    } catch {
      // Ignorar errores no controlados
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const saldo = billetera?.saldoPuntos ?? 0;
  const nivel = saldo >= 300 ? "Oro" : saldo >= 100 ? "Plata" : "Bronce";
  const ahorroEquivalente = (saldo / 10).toFixed(2);

  const stats = useMemo(() => {
    const totalAcumulados = movimientos
      .filter((m) => m.tipoMovimiento === "ACUMULACION")
      .reduce((acc, m) => acc + (m.puntos || 0), 0);

    const totalCanjeados = movimientos
      .filter((m) => m.tipoMovimiento === "CANJE")
      .reduce((acc, m) => acc + (m.puntos || 0), 0);

    const ahorroCanjeado = (totalCanjeados / 10).toFixed(2);

    return {
      totalAcumulados,
      totalCanjeados,
      ahorroCanjeado,
    };
  }, [movimientos]);

  return (
    <div className="w-full px-3 sm:px-6 py-4 space-y-4 text-xs text-slate-800">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="CLIENTE"
          mensaje={errorPermisos}
          onExito={cargarDatos}
        />
      )}

      {/* =========================================================================
          CABECERA OFICIAL RAPPIGAS • CLUB FIDELIDAD Y PUNTOS
      ========================================================================= */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-xl px-4 py-2.5 text-white shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xs sm:text-sm font-black tracking-tight leading-none">
                RappiGas • Club Fidelidad y Puntos
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/20">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                Osinergmin Garantizado
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-white/25 text-white">
                <Sparkles className="w-3 h-3 text-amber-200" />
                Socio Nivel {nivel}
              </span>
            </div>
            <p className="text-[10px] text-orange-100 hidden sm:block mt-0.5">
              Acumula puntos con cada balón y canjéalos por descuentos en soles a tu puerta
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold">
          {/* Badge Destacado de Puntos */}
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
            href="/cliente/tienda"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-orange-600 hover:bg-orange-50 font-black rounded-lg text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pedir Balón</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          TARJETAS KPI / ESTADÍSTICAS ESTILO PEDIR (4 TARJETAS CON SOMBRA Y BORDES)
      ========================================================================= */}
      <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Saldo Disponible */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Puntos Disponibles
            </span>
            <span className="text-2xl font-black text-[#03246b] block leading-tight font-mono">
              {Number(saldo).toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-700 font-bold block truncate">
              Equivale a S/ {ahorroEquivalente} de descuento
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs">
            <Sparkles className="w-5 h-5 fill-amber-500" />
          </div>
        </div>

        {/* KPI 2: Nivel de Socio */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Categoría de Socio
            </span>
            <span className="text-2xl font-black text-purple-700 block leading-tight">
              Nivel {nivel}
            </span>
            <span className="text-[11px] text-purple-600 font-semibold block truncate">
              {saldo >= 300
                ? "👑 Nivel Oro Máximo alcanzado"
                : `Faltan ${300 - saldo} pts para Nivel Oro`}
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200 shadow-2xs">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3: Puntos Acumulados Históricos */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Puntos Ganados
            </span>
            <span className="text-2xl font-black text-emerald-700 block leading-tight font-mono">
              +{Number(stats.totalAcumulados).toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              1 punto por cada S/ 5 en gas formal
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4: Ahorro Total Canjeado */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div className="space-y-1 min-w-0 pr-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Ahorro Canjeado
            </span>
            <span className="text-2xl font-black text-orange-600 block leading-tight font-mono">
              S/ {stats.ahorroCanjeado}
            </span>
            <span className="text-[11px] text-orange-600 font-semibold block truncate">
              {stats.totalCanjeados} puntos canjeados
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200 shadow-2xs">
            <Gift className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          TARJETA DE GARANTÍAS Y BENEFICIOS DEL CLUB ESTILO /PEDIR
      ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-br from-orange-50/60 to-amber-50/60 border border-orange-100 text-slate-700 shadow-xs space-y-3">
        <div className="flex items-center gap-2 font-black text-sm text-[#03246b]">
          <ShieldCheck className="w-4 h-4 text-orange-600" />
          <span>Garantías y Beneficios de tus Puntos RappiGas:</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="bg-white/80 p-3 rounded-xl border border-orange-200/60 space-y-1">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-black">
                1
              </span>
              Acumulación Automática
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Gana 1 punto por cada S/ 5 en cilindros de 10kg, 15kg o 45kg con cualquier distribuidora.
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-orange-200/60 space-y-1">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#03246b] text-white flex items-center justify-center text-[10px] font-black">
                2
              </span>
              Validación con Balanza Digital
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tus puntos se acreditan inmediatamente al recibir tu balón y confirmar tu código de entrega en puerta.
            </p>
          </div>

          <div className="bg-white/80 p-3 rounded-xl border border-orange-200/60 space-y-1">
            <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                3
              </span>
              Canje Directo en Soles
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Cada 10 puntos equivalen a S/ 1.00 de descuento directo aplicable en tu carrito de compra.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          HISTORIAL DE MOVIMIENTOS DE PUNTOS
      ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-0">
        <div className="p-3.5 px-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-orange-600" />
            <h3 className="font-black text-xs text-[#03246b]">
              Historial de Puntos Acumulados y Canjes
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
            {movimientos.length} transacciones registradas
          </span>
        </div>

        {cargando ? (
          <div className="p-10 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 text-orange-600 animate-spin" />
            <span className="font-semibold text-slate-600">Cargando movimientos de puntos...</span>
          </div>
        ) : movimientos.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs space-y-2">
            <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 mx-auto flex items-center justify-center border border-orange-100">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Aún no tienes movimientos de puntos</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5">
                ¡Pide tu primer balón de gas con entrega a domicilio y empieza a sumar puntos de inmediato!
              </p>
            </div>
            <Link
              href="/cliente/tienda"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs shadow-xs transition mt-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ir a la Tienda y Pedir</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-[#03246b] text-[10px] uppercase font-black tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-4 py-2.5">Fecha y Hora</th>
                  <th className="px-4 py-2.5">Tipo de Movimiento</th>
                  <th className="px-4 py-2.5 text-center">Puntos</th>
                  <th className="px-4 py-2.5 text-center">Saldo Resultante</th>
                  <th className="px-4 py-2.5">Detalle / Código de Pedido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {movimientos.map((m) => {
                  const esAcumulacion = m.tipoMovimiento === "ACUMULACION";
                  const esCanje = m.tipoMovimiento === "CANJE";

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-2.5 text-[11px] text-slate-500">
                        <span className="font-medium text-slate-800 block">
                          {new Date(m.createdAt).toLocaleDateString([], {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            esAcumulacion
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : esCanje
                              ? "bg-blue-50 text-[#03246b] border-blue-300"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {esAcumulacion && <ArrowDownLeft className="w-3 h-3 text-emerald-600" />}
                          {esCanje && <ArrowUpRight className="w-3 h-3 text-blue-600" />}
                          {m.tipoMovimiento}
                        </span>
                      </td>

                      <td className="px-4 py-2.5 text-center font-mono font-black text-xs">
                        <span className={esAcumulacion ? "text-emerald-600 font-extrabold" : "text-blue-700 font-extrabold"}>
                          {esAcumulacion ? `+${m.puntos} PTS` : `-${m.puntos} PTS`}
                        </span>
                      </td>

                      <td className="px-4 py-2.5 text-center font-mono text-slate-900 font-bold text-xs">
                        {m.saldoResultante} pts
                      </td>

                      <td className="px-4 py-2.5 text-[11px] text-slate-600 font-medium">
                        {m.pedidoPublicId ? (
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-[#03246b] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            #PG-{m.pedidoPublicId.substring(0, 8).toUpperCase()}
                          </span>
                        ) : (
                          m.motivo || "Transacción del Club RappiGas"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
