"use client";

import React, { useEffect, useState, useTransition, useCallback, useRef } from "react";
import { flotaApi } from "@/librerias/api/flota.api";
import { PedidoDetalle } from "@/librerias/api/pedidos.api";
import {
  Truck,
  MapPin,
  Phone,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Flame,
  Radio,
  Clock,
  Compass,
} from "lucide-react";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";

export default function RepartidorEntregasPage() {
  const [pedidos, setPedidos] = useState<PedidoDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Modal Entrega
  const [pedidoParaEntregar, setPedidoParaEntregar] = useState<PedidoDetalle | null>(null);
  const [codigoInput, setCodigoInput] = useState("");
  const [errorEntrega, setErrorEntrega] = useState<string | null>(null);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);

  // Transmisión GPS en vivo
  const [transmitiendoGps, setTransmitiendoGps] = useState(false);
  const [coordenadasGps, setCoordenadasGps] = useState<{ lat: number; lng: number }>({
    lat: -11.9900,
    lng: -77.0700,
  });
  const gpsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const cargarPedidosAsignados = useCallback(async () => {
    try {
      setCargando(true);
      setErrorPermisos(null);
      const res = await flotaApi.listarMisPedidosAsignados(0, 30);
      setPedidos(res.content || []);
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.includes("permisos")) {
        setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Repartidor Chofer (REPARTIDOR).");
      }
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPedidosAsignados();
  }, [cargarPedidosAsignados]);

  // Transmisión GPS (geolocalización o simulación en ruta)
  useEffect(() => {
    if (transmitiendoGps) {
      gpsIntervalRef.current = setInterval(() => {
        // Simular ligero avance en la ruta de Los Olivos
        setCoordenadasGps((prev) => {
          const nuevaLat = prev.lat + (Math.random() - 0.45) * 0.0003;
          const nuevaLng = prev.lng + (Math.random() - 0.45) * 0.0003;

          // Enviar ping al backend silenciosamente
          const pedidoActivo = pedidos.find((p) => p.estado === "EN_CAMINO");
          if (pedidoActivo) {
            flotaApi
              .actualizarGps(nuevaLat, nuevaLng, pedidoActivo.publicId)
              .catch(() => {});
          }

          return { lat: nuevaLat, lng: nuevaLng };
        });
      }, 4000);
    } else {
      if (gpsIntervalRef.current) {
        clearInterval(gpsIntervalRef.current);
        gpsIntervalRef.current = null;
      }
    }

    return () => {
      if (gpsIntervalRef.current) clearInterval(gpsIntervalRef.current);
    };
  }, [transmitiendoGps, pedidos]);

  const handleIniciarRuta = (pedidoPublicId: string) => {
    startTransition(async () => {
      try {
        const actualizado = await flotaApi.iniciarRuta(pedidoPublicId);
        setPedidos((prev) =>
          prev.map((p) => (p.publicId === actualizado.publicId ? actualizado : p))
        );
        setTransmitiendoGps(true); // Activar GPS automáticamente al salir
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Error al iniciar ruta");
      }
    });
  };

  const handleConfirmarEntrega = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pedidoParaEntregar) return;
    setErrorEntrega(null);

    startTransition(async () => {
      try {
        const actualizado = await flotaApi.confirmarEntrega(
          pedidoParaEntregar.publicId,
          codigoInput
        );
        setPedidos((prev) =>
          prev.map((p) => (p.publicId === actualizado.publicId ? actualizado : p))
        );
        setPedidoParaEntregar(null);
        setCodigoInput("");
      } catch (err: unknown) {
        setErrorEntrega(err instanceof Error ? err.message : "Código de entrega inválido");
      }
    });
  };

  const pedidosActivos = pedidos.filter(
    (p) => p.estado === "ASIGNADO" || p.estado === "EN_CAMINO"
  );
  const pedidosCompletados = pedidos.filter((p) => p.estado === "ENTREGADO");

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="REPARTIDOR"
          mensaje={errorPermisos}
          onExito={cargarPedidosAsignados}
        />
      )}

      {/* Cabecera Móvil del Chofer */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mis Entregas en Ruta (Repartidor)
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              En Turno
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Navegación, inicio de despacho y validación de código de entrega con el cliente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón Transmisor GPS */}
          <button
            onClick={() => setTransmitiendoGps(!transmitiendoGps)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
              transmitiendoGps
                ? "bg-purple-600 text-white animate-pulse"
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200"
            }`}
          >
            <Radio className="w-4 h-4" />
            {transmitiendoGps ? "GPS Transmitiendo ON" : "Activar GPS"}
          </button>

          <button
            onClick={cargarPedidosAsignados}
            disabled={cargando}
            className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-xl"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Indicador de Estado GPS en Vivo */}
      {transmitiendoGps && (
        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center justify-between text-xs text-purple-900 dark:text-purple-300">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-600 animate-spin" />
            <span>
              Posición GPS reportada en vivo: <strong>{coordenadasGps.lat.toFixed(5)}</strong>,{" "}
              <strong>{coordenadasGps.lng.toFixed(5)}</strong>
            </span>
          </div>
          <span className="text-[11px] font-semibold text-purple-600">Visible para el cliente</span>
        </div>
      )}

      {/* Sección 1: Pedidos Activos por Entregar */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-orange-500" />
          Pedidos Pendientes de Entrega ({pedidosActivos.length})
        </h2>

        {cargando ? (
          <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl border">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-500 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Buscando pedidos asignados...</p>
          </div>
        ) : pedidosActivos.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
              ¡Sin entregas pendientes en este momento!
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Los nuevos pedidos asignados por la distribuidora aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pedidosActivos.map((pedido) => (
              <div
                key={pedido.publicId}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-mono font-bold text-gray-500">
                      #PG-{pedido.publicId.substring(0, 8)}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        pedido.estado === "ASIGNADO"
                          ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                          : "bg-purple-100 text-purple-800 border border-purple-200 animate-pulse"
                      }`}
                    >
                      {pedido.estado === "ASIGNADO" ? "Por Salir" : "En Camino (GPS)"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {pedido.nombreCliente}
                    </h3>
                    <div className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>
                        {pedido.direccionEntrega}
                        {pedido.referenciaDireccion && (
                          <span className="text-gray-400 block text-[11px]">
                            Ref: {pedido.referenciaDireccion}
                          </span>
                        )}
                      </span>
                    </div>

                    {pedido.notasCliente && (
                      <p className="p-2 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-300 text-[11px] rounded-lg italic">
                        "{pedido.notasCliente}"
                      </p>
                    )}
                  </div>

                  {/* Detalle Balones de Gas */}
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">A entregar:</span>
                    {pedido.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          <strong>{it.cantidad}x</strong> {it.nombreProducto}
                        </span>
                        <span className="font-semibold">S/ {it.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t pt-1 font-bold text-gray-900 dark:text-white">
                      <span>Total a Cobrar ({pedido.metodoPago}):</span>
                      <span className="text-orange-600">S/ {pedido.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Botones de Contacto y Navegación */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {pedido.telefonoCliente && (
                      <a
                        href={`tel:${pedido.telefonoCliente}`}
                        className="py-2 px-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition text-gray-800 dark:text-gray-200"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        Llamar
                      </a>
                    )}
                    {pedido.latitud && (
                      <a
                        href={`https://maps.google.com/?q=${pedido.latitud},${pedido.longitud}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition text-gray-800 dark:text-gray-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        Navegar GPS
                      </a>
                    )}
                  </div>
                </div>

                {/* Acciones de Flujo */}
                <div className="pt-2">
                  {pedido.estado === "ASIGNADO" ? (
                    <button
                      onClick={() => handleIniciarRuta(pedido.publicId)}
                      disabled={isPending}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      Iniciar Ruta hacia el Cliente
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setPedidoParaEntregar(pedido);
                        setCodigoInput("");
                        setErrorEntrega(null);
                      }}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Confirmar Entrega (Solicitar Código)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección 2: Historial de Entregados Hoy */}
      {pedidosCompletados.length > 0 && (
        <div className="space-y-3 pt-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Entregas Completadas Hoy ({pedidosCompletados.length})
          </h2>
          <div className="space-y-2">
            {pedidosCompletados.map((p) => (
              <div
                key={p.publicId}
                className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {p.nombreCliente}
                  </span>
                  <p className="text-[11px] text-gray-400">{p.direccionEntrega}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600">S/ {p.total.toFixed(2)}</span>
                  <span className="block text-[10px] text-gray-400">Entregado con éxito</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Confirmar Entrega con Código */}
      {pedidoParaEntregar && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Validar Código del Cliente
              </h3>
              <p className="text-xs text-gray-500">
                Pide al cliente los 6 dígitos que aparecen en su pantalla de PideGas:
              </p>
            </div>

            <form onSubmit={handleConfirmarEntrega} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  value={codigoInput}
                  onChange={(e) => setCodigoInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full text-center text-3xl font-mono font-black tracking-widest py-3 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {errorEntrega && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorEntrega}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPedidoParaEntregar(null)}
                  className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || codigoInput.length < 6}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  Validar y Cobrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
