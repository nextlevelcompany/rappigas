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
    <div className="w-full py-3 px-3 sm:px-6 space-y-3 text-xs">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="CLIENTE"
          mensaje={errorPermisos}
          onExito={cargarDatos}
        />
      )}

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border rounded-lg p-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Mis Puntos de Gas PideGas
              </h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/20">
                Club Fidelidad
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Acumula puntos en cada compra de balón de gas y canjéalos por descuentos exclusivos.
            </p>
          </div>
        </div>

        <button
          onClick={cargarDatos}
          disabled={cargando}
          className="inline-flex items-center gap-1 px-2.5 h-7 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3 h-3 ${cargando ? "animate-spin" : ""}`} />
          Actualizar Puntos
        </button>
      </div>

      {/* Tarjeta de Billetera y Nivel de Socio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Tarjeta Principal de Puntos */}
        <div className="md:col-span-2 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white p-4 sm:p-5 rounded-lg shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/80">
                Saldo Disponible
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-bold font-mono tracking-tight">
                  {saldo}
                </span>
                <span className="text-sm font-semibold text-white/90">Puntos</span>
              </div>
            </div>

            <div className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-md flex items-center gap-1 border border-white/30 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-yellow-200" />
              Nivel {nivel}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-[10px] text-white/80 block">Valor equivalente en soles:</span>
              <span className="text-base font-bold text-white">
                S/ {ahorroEquivalente}{" "}
                <span className="text-[10px] font-normal text-white/80">para tu próximo balón</span>
              </span>
            </div>

            <div className="text-[10px] text-white/90 bg-black/20 backdrop-blur-md px-2.5 py-1 rounded">
              1 punto por cada S/ 5 de compra de gas
            </div>
          </div>
        </div>

        {/* Tarjeta de Beneficios y Canje */}
        <div className="bg-card text-card-foreground p-4 rounded-lg border shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center mb-2">
              <Gift className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-foreground">¿Cómo usar tus puntos?</h3>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              Tus puntos se acreditan automáticamente cada vez que recibes tu balón de gas en tu domicilio y confirmas el código de entrega.
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t text-[11px]">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Descuento directo en tu pedido</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Válido con cualquier distribuidora</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Sin fecha de vencimiento inmediata</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Movimientos de Puntos */}
      <div className="bg-card rounded-lg border shadow-2xs overflow-hidden">
        <div className="p-2.5 px-3 border-b flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-orange-500" />
            <h3 className="font-semibold text-foreground text-xs">
              Historial de Puntos Acumulados y Canjes
            </h3>
          </div>
          <span className="text-[11px] text-muted-foreground">{movimientos.length} transacciones</span>
        </div>

        {cargando ? (
          <div className="p-8 text-center text-muted-foreground text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
            Cargando historial de puntos...
          </div>
        ) : movimientos.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs">
            <Award className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-semibold text-foreground">Aún no tienes movimientos de puntos</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              ¡Haz tu primer pedido de gas para comenzar a ganar puntos!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground text-[11px] uppercase font-semibold border-b">
                <tr>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2 text-center">Puntos</th>
                  <th className="px-3 py-2 text-center">Saldo</th>
                  <th className="px-3 py-2">Motivo / Pedido</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {movimientos.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/30 transition">
                    <td className="px-3 py-2 text-[11px] text-muted-foreground font-mono">
                      {new Date(m.createdAt).toLocaleDateString()} a las{" "}
                      {new Date(m.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          m.tipoMovimiento === "ACUMULACION"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : m.tipoMovimiento === "CANJE"
                            ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                            : "bg-muted text-muted-foreground border"
                        }`}
                      >
                        {m.tipoMovimiento === "ACUMULACION" && <ArrowDownLeft className="w-3 h-3" />}
                        {m.tipoMovimiento === "CANJE" && <ArrowUpRight className="w-3 h-3" />}
                        {m.tipoMovimiento}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center font-mono font-bold">
                      <span
                        className={
                          m.tipoMovimiento === "ACUMULACION"
                            ? "text-emerald-600"
                            : "text-blue-600"
                        }
                      >
                        {m.tipoMovimiento === "ACUMULACION" ? `+${m.puntos}` : `-${m.puntos}`}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-foreground font-medium">
                      {m.saldoResultante}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-muted-foreground">
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
