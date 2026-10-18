"use client";

import React, { useEffect, useState, useTransition, useCallback } from "react";
import {
  fidelizacionApi,
  CuponDetalle,
  TipoDescuento,
} from "@/librerias/api/fidelizacion.api";
import {
  TicketPercent,
  Plus,
  RefreshCw,
  Copy,
  CheckCircle,
  AlertTriangle,
  Flame,
  Calendar,
  Users,
  DollarSign,
} from "lucide-react";

export default function PromocionesEmpresaPage() {
  const [cupones, setCupones] = useState<CuponDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Modal Nuevo Cupón
  const [mostrarModal, setMostrarModal] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [tipoDescuento, setTipoDescuento] = useState<TipoDescuento>("MONTO_FIJO");
  const [valorDescuento, setValorDescuento] = useState(5);
  const [pedidoMinimo, setPedidoMinimo] = useState(50);
  const [usosMaximos, setUsosMaximos] = useState(100);

  const [copiado, setCopiado] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  const cargarCupones = useCallback(async () => {
    try {
      setCargando(true);
      const data = await fidelizacionApi.listarCuponesEmpresa();
      setCupones(data);
    } catch (err: unknown) {
      setMensajeError(err instanceof Error ? err.message : "Error al cargar cupones");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarCupones();
  }, [cargarCupones]);

  const handleCrearCupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim()) return;

    startTransition(async () => {
      try {
        const nuevo = await fidelizacionApi.crearCupon({
          codigo: codigo.trim().toUpperCase(),
          tipoDescuento,
          valorDescuento,
          pedidoMinimo,
          usosMaximos,
        });

        setCupones((prev) => [nuevo, ...prev]);
        setMostrarModal(false);
        setCodigo("");
        setMensajeExito(`Cupón '${nuevo.codigo}' creado exitosamente.`);
        setTimeout(() => setMensajeExito(null), 4000);
      } catch (err: unknown) {
        setMensajeError(err instanceof Error ? err.message : "Error al crear cupón");
      }
    });
  };

  const copiarCodigo = (cod: string) => {
    navigator.clipboard.writeText(cod);
    setCopiado(cod);
    setTimeout(() => setCopiado(null), 2000);
  };

  return (
    <div className="w-full py-3 px-3 sm:px-6 space-y-3 text-xs">
      {/* Mensajes */}
      {mensajeExito && (
        <div className="p-2.5 px-3 bg-emerald-600 text-white rounded-lg shadow-2xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{mensajeExito}</span>
          </div>
          <button onClick={() => setMensajeExito(null)} className="text-white hover:text-white/80 font-bold ml-4">✕</button>
        </div>
      )}

      {mensajeError && (
        <div className="p-2.5 px-3 bg-red-600 text-white rounded-lg shadow-2xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{mensajeError}</span>
          </div>
          <button onClick={() => setMensajeError(null)} className="text-white hover:text-white/80 font-bold ml-4">✕</button>
        </div>
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
                Promociones y Cupones de Descuento
              </h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/20">
                Fidelización
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Crea códigos de descuento para tus clientes en compras de balones de gas.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={cargarCupones}
            disabled={cargando}
            className="inline-flex items-center gap-1 px-2.5 h-7 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-md transition"
          >
            <RefreshCw className={`w-3 h-3 ${cargando ? "animate-spin" : ""}`} />
            Actualizar
          </button>

          <button
            onClick={() => setMostrarModal(true)}
            className="inline-flex items-center gap-1 px-2.5 h-7 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md shadow-2xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Crear Cupón
          </button>
        </div>
      </div>

      {/* Listado de Cupones */}
      <div className="bg-card rounded-lg border shadow-2xs overflow-hidden">
        <div className="p-2.5 px-3 border-b flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <TicketPercent className="w-4 h-4 text-orange-500" />
            <h3 className="font-semibold text-foreground text-xs">
              Cupones Registrados
            </h3>
          </div>
          <span className="text-[11px] text-muted-foreground">{cupones.length} cupones</span>
        </div>

        {cargando ? (
          <div className="p-8 text-center text-muted-foreground text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-500" />
            Cargando cupones...
          </div>
        ) : cupones.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs">
            <TicketPercent className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="font-semibold text-foreground">No hay cupones creados aún</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Crea tu primer cupón para incentivar a tus clientes a pedir balones de gas en tu zona.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground text-[11px] uppercase font-semibold border-b">
                <tr>
                  <th className="px-3 py-2">Código</th>
                  <th className="px-3 py-2">Tipo Descuento</th>
                  <th className="px-3 py-2 text-center">Valor</th>
                  <th className="px-3 py-2 text-center">Pedido Mínimo</th>
                  <th className="px-3 py-2 text-center">Usos</th>
                  <th className="px-3 py-2">Vigencia</th>
                  <th className="px-3 py-2 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cupones.map((c) => (
                  <tr key={c.publicId} className="hover:bg-muted/30 transition">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs tracking-wider text-orange-600 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                          {c.codigo}
                        </span>
                        <button
                          onClick={() => copiarCodigo(c.codigo)}
                          title="Copiar código"
                          className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted transition"
                        >
                          {copiado === c.codigo ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        {c.tipoDescuento === "PORCENTAJE" ? "Porcentaje (%)" : "Monto Fijo (S/)"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center font-bold text-foreground font-mono">
                      {c.tipoDescuento === "PORCENTAJE" ? `${c.valorDescuento}%` : `S/ ${c.valorDescuento.toFixed(2)}`}
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-muted-foreground">
                      S/ {c.pedidoMinimo.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-center font-mono">
                      <span className="font-bold text-foreground">{c.usosActuales}</span>
                      <span className="text-muted-foreground"> / {c.usosMaximos ?? "∞"}</span>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-muted-foreground font-mono">
                      Hasta {new Date(c.validoHasta).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {c.activo ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground border">
                          Inactivo
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Crear Cupón */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <TicketPercent className="w-5 h-5 text-orange-500" />
                Crear Cupón de Descuento
              </h3>
              <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearCupon} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                  Código del Cupón *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: GASPRIMERO, SOLGAS10"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono font-bold tracking-wider uppercase focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Tipo de Descuento
                  </label>
                  <select
                    value={tipoDescuento}
                    onChange={(e) => setTipoDescuento(e.target.value as TipoDescuento)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="MONTO_FIJO">Monto Fijo (S/)</option>
                    <option value="PORCENTAJE">Porcentaje (%)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Valor Descuento *
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={valorDescuento}
                    onChange={(e) => setValorDescuento(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Pedido Mínimo (S/)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={pedidoMinimo}
                    onChange={(e) => setPedidoMinimo(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
                    Límite de Usos
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={usosMaximos}
                    onChange={(e) => setUsosMaximos(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isPending ? "Guardando..." : "Crear Cupón"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
