"use client";

import React, { useEffect, useState, useCallback } from "react";
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
} from "lucide-react";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";

export default function PuntosClientePage() {
  const [billetera, setBilletera] = useState<BilleteraPuntos | null>(null);
  const [movimientos, setMovimientos] = useState<MovimientoPuntos[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="CLIENTE"
          mensaje={errorPermisos}
          onExito={cargarDatos}
        />
      )}

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mis Puntos de Gas PideGas
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Club Fidelidad
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Acumula puntos en cada compra de balón de gas de cocina y canjéalos por descuentos exclusivos.
          </p>
        </div>

        <button
          onClick={cargarDatos}
          disabled={cargando}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-xl transition"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
          Actualizar Puntos
        </button>
      </div>

      {/* Tarjeta de Billetera y Nivel de Socio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta Principal de Puntos */}
        <div className="md:col-span-2 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest font-bold text-white/80">
                Saldo Disponible
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight">
                  {saldo}
                </span>
                <span className="text-xl font-bold text-white/90">Puntos</span>
              </div>
            </div>

            <div className="px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-2xl flex items-center gap-1.5 border border-white/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-yellow-200" />
              Nivel {nivel}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-white/80 block">Valor equivalente en soles:</span>
              <span className="text-xl font-extrabold text-white">
                S/ {ahorroEquivalente}{" "}
                <span className="text-xs font-normal text-white/80">para tu próximo balón</span>
              </span>
            </div>

            <div className="text-xs text-white/90 bg-black/20 backdrop-blur-md px-4 py-2 rounded-xl">
              1 punto por cada S/ 5 de compra de gas
            </div>
          </div>
        </div>

        {/* Tarjeta de Beneficios y Canje */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center mb-4">
              <Gift className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">¿Cómo usar tus puntos?</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Tus puntos se acreditan automáticamente cada vez que recibes tu balón de gas en tu domicilio y confirmas el código de entrega.
            </p>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Descuento directo en tu pedido</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Válido con cualquier distribuidora</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Sin fecha de vencimiento inmediata</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Movimientos de Puntos */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Historial de Puntos Acumulados y Canjes
            </h3>
          </div>
          <span className="text-xs text-gray-400">{movimientos.length} transacciones</span>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
            Cargando historial de puntos...
          </div>
        ) : movimientos.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">Aún no tienes movimientos de puntos</p>
            <p className="text-xs text-gray-400 mt-1">
              ¡Haz tu primer pedido de gas de cocina para comenzar a ganar puntos!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Fecha</th>
                  <th className="px-6 py-3.5">Tipo de Movimiento</th>
                  <th className="px-6 py-3.5 text-center">Puntos</th>
                  <th className="px-6 py-3.5 text-center">Saldo Resultante</th>
                  <th className="px-6 py-3.5">Motivo / Pedido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {movimientos.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-6 py-3.5 text-xs text-gray-500 font-mono">
                      {new Date(m.createdAt).toLocaleDateString()} a las{" "}
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          m.tipoMovimiento === "ACUMULACION"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : m.tipoMovimiento === "CANJE"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {m.tipoMovimiento === "ACUMULACION" && <ArrowDownLeft className="w-3 h-3" />}
                        {m.tipoMovimiento === "CANJE" && <ArrowUpRight className="w-3 h-3" />}
                        {m.tipoMovimiento}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center font-mono font-bold">
                      <span
                        className={
                          m.tipoMovimiento === "ACUMULACION"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-blue-600 dark:text-blue-400"
                        }
                      >
                        {m.tipoMovimiento === "ACUMULACION" ? `+${m.puntos}` : `-${m.puntos}`}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center font-mono text-gray-700 dark:text-gray-300 font-semibold">
                      {m.saldoResultante}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-gray-600 dark:text-gray-300">
                      {m.motivo || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
