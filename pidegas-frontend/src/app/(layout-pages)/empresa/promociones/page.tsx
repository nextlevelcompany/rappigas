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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Mensajes */}
      {mensajeExito && (
        <div className="p-4 bg-emerald-500 text-white rounded-xl shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-semibold">{mensajeExito}</span>
          </div>
          <button onClick={() => setMensajeExito(null)}>✕</button>
        </div>
      )}

      {mensajeError && (
        <div className="p-4 bg-red-500 text-white rounded-xl shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-semibold">{mensajeError}</span>
          </div>
          <button onClick={() => setMensajeError(null)}>✕</button>
        </div>
      )}

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Promociones y Cupones de Descuento
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Campañas de Gas
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Crea códigos de descuento para tus clientes en compras de balones de cocina de 10kg, 15kg y 45kg.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={cargarCupones}
            disabled={cargando}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
            Actualizar
          </button>

          <button
            onClick={() => setMostrarModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Crear Cupón
          </button>
        </div>
      </div>

      {/* Listado de Cupones */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TicketPercent className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Cupones Activos de la Distribuidora
            </h3>
          </div>
          <span className="text-xs text-gray-400">{cupones.length} cupones</span>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-500" />
            Cargando cupones...
          </div>
        ) : cupones.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            <TicketPercent className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-gray-700 dark:text-gray-300">No hay cupones creados aún</p>
            <p className="text-xs text-gray-400 mt-1">
              Crea tu primer cupón para incentivar a tus clientes a pedir balones de gas en tu zona.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/40 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Código del Cupón</th>
                  <th className="px-6 py-4">Tipo Descuento</th>
                  <th className="px-6 py-4 text-center">Valor Descuento</th>
                  <th className="px-6 py-4 text-center">Pedido Mínimo</th>
                  <th className="px-6 py-4 text-center">Usos</th>
                  <th className="px-6 py-4">Vigencia</th>
                  <th className="px-6 py-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {cupones.map((c) => (
                  <tr key={c.publicId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base tracking-wider text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-3 py-1 rounded-xl border border-orange-200 dark:border-orange-800">
                          {c.codigo}
                        </span>
                        <button
                          onClick={() => copiarCodigo(c.codigo)}
                          title="Copiar código"
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                          {copiado === c.codigo ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                        {c.tipoDescuento === "PORCENTAJE" ? "Porcentaje (%)" : "Monto Fijo (S/)"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-900 dark:text-white font-mono">
                      {c.tipoDescuento === "PORCENTAJE" ? `${c.valorDescuento}%` : `S/ ${c.valorDescuento.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-gray-600 dark:text-gray-300">
                      S/ {c.pedidoMinimo.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center font-mono">
                      <span className="font-bold text-gray-900 dark:text-white">{c.usosActuales}</span>
                      <span className="text-gray-400"> / {c.usosMaximos ?? "∞"}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                      Hasta {new Date(c.validoHasta).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {c.activo ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
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
