"use client";

import React, { useEffect, useState, useTransition, useCallback } from "react";
import {
  pedidosApi,
  PedidoDetalle,
  CrearPedidoDto,
  MetodoPago,
} from "@/librerias/api/pedidos.api";
import { empresasApi, EmpresaDetalle } from "@/librerias/api/empresas.api";
import { catalogoApi, ProductoDetalle } from "@/librerias/api/catalogo.api";
import { pedidosSocket, EventoPedidoSocket } from "@/librerias/websocket/pedidos-socket";
import {
  Flame,
  Plus,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Phone,
  AlertTriangle,
  QrCode,
  CreditCard,
  Banknote,
  Minus,
} from "lucide-react";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";

export default function MisPedidosClientePage() {
  const [pedidos, setPedidos] = useState<PedidoDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Modal Nuevo Pedido
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [empresasDisponibles, setEmpresasDisponibles] = useState<EmpresaDetalle[]>([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<string>("");
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoDetalle[]>([]);
  const [carrito, setCarrito] = useState<{ [productoId: string]: number }>({});

  const [direccion, setDireccion] = useState("Av. Antúnez de Mayolo 1234, Los Olivos");
  const [referencia, setReferencia] = useState("A 2 cuadras de la municipalidad, frente a la panadería");
  const [latitud, setLatitud] = useState(-11.9900);
  const [longitud, setLongitud] = useState(-77.0700);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("YAPE");
  const [notas, setNotas] = useState("Balón para cocina de 4 hornillas, por favor traer cambio.");
  const [errorPedido, setErrorPedido] = useState<string | null>(null);
  const [exitoPedido, setExitoPedido] = useState<PedidoDetalle | null>(null);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);

  const cargarMisPedidos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorPermisos(null);
      const res = await pedidosApi.listarMisPedidos(0, 30);
      setPedidos(res.content || []);
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.includes("permisos")) {
        setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Cliente Hogar (CLIENTE).");
      }
      setPedidos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarMisPedidos();
  }, [cargarMisPedidos]);

  // Cargar empresas para el modal de nuevo pedido
  useEffect(() => {
    if (mostrarModalNuevo) {
      empresasApi.listarEmpresasPublicas().then((emps) => {
        setEmpresasDisponibles(emps);
        if (emps.length > 0 && !empresaSeleccionada) {
          setEmpresaSeleccionada(emps[0].publicId);
        }
      }).catch(() => {});
    }
  }, [mostrarModalNuevo, empresaSeleccionada]);

  // Cargar catálogo de la empresa seleccionada
  useEffect(() => {
    if (empresaSeleccionada) {
      catalogoApi.listarProductosPublicos(empresaSeleccionada).then((prods) => {
        setProductosDisponibles(prods.filter((p) => p.estado === "ACTIVO"));
        // Seleccionar 1er producto por defecto
        if (prods.length > 0) {
          setCarrito({ [prods[0].publicId]: 1 });
        }
      }).catch(() => {});
    }
  }, [empresaSeleccionada]);

  // Escuchar actualizaciones por WebSocket para pedidos activos
  useEffect(() => {
    pedidosSocket.iniciar();

    const pedidosActivos = pedidos.filter(
      (p) => p.estado === "PENDIENTE" || p.estado === "CONFIRMADO" || p.estado === "EN_CAMINO"
    );

    const cleanupFns = pedidosActivos.map((p) =>
      pedidosSocket.suscribirPedido(p.publicId, (evento: EventoPedidoSocket) => {
        setPedidos((prev) =>
          prev.map((item) => (item.publicId === evento.pedido.publicId ? evento.pedido : item))
        );
      })
    );

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [pedidos]);

  const modificarCantidad = (productoId: string, delta: number) => {
    setCarrito((prev) => {
      const actual = prev[productoId] || 0;
      const nueva = actual + delta;
      if (nueva <= 0) {
        const copia = { ...prev };
        delete copia[productoId];
        return copia;
      }
      return { ...prev, [productoId]: nueva };
    });
  };

  const calcularTotalCarrito = () => {
    return Object.entries(carrito).reduce((total, [prodId, cant]) => {
      const prod = productosDisponibles.find((p) => p.publicId === prodId);
      return total + (prod ? prod.precio * cant : 0);
    }, 0);
  };

  const handleCrearPedido = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPedido(null);

    const items = Object.entries(carrito).map(([prodId, cant]) => ({
      productoPublicId: prodId,
      cantidad: cant,
    }));

    if (items.length === 0) {
      setErrorPedido("Selecciona al menos un balón de gas para tu pedido.");
      return;
    }

    const payload: CrearPedidoDto = {
      empresaPublicId: empresaSeleccionada,
      latitud,
      longitud,
      direccionEntrega: direccion,
      referenciaDireccion: referencia,
      notasCliente: notas,
      metodoPago,
      items,
    };

    startTransition(async () => {
      try {
        const nuevo = await pedidosApi.crearPedido(payload);
        setExitoPedido(nuevo);
        setPedidos((prev) => [nuevo, ...prev]);
        setMostrarModalNuevo(false);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Error al procesar el pedido";
        setErrorPedido(msg);
      }
    });
  };

  const handleCancelarPedido = (publicId: string) => {
    if (!confirm("¿Seguro que deseas cancelar este pedido?")) return;
    startTransition(async () => {
      try {
        const actualizado = await pedidosApi.cancelarMiPedido(publicId);
        setPedidos((prev) =>
          prev.map((p) => (p.publicId === actualizado.publicId ? actualizado : p))
        );
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : "Error al cancelar el pedido");
      }
    });
  };

  const getPasoProgreso = (estado: string) => {
    switch (estado) {
      case "PENDIENTE":
        return 1;
      case "CONFIRMADO":
        return 2;
      case "ASIGNADO":
        return 2.5;
      case "EN_CAMINO":
        return 3;
      case "ENTREGADO":
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="CLIENTE"
          mensaje={errorPermisos}
          onExito={cargarMisPedidos}
        />
      )}

      {/* Banner de Éxito de Pedido */}
      {exitoPedido && (
        <div className="p-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">¡Pedido Creado con Éxito!</h3>
              <p className="text-xs text-white/90">
                La distribuidora <strong className="underline">{exitoPedido.nombreEmpresa}</strong> ha recibido tu pedido y lo está preparando.
              </p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-center">
            <span className="text-[11px] block uppercase font-semibold text-white/80">Código de Seguridad</span>
            <span className="text-xl font-mono font-black tracking-widest">{exitoPedido.codigoConfirmacion}</span>
          </div>
          <button
            onClick={() => setExitoPedido(null)}
            className="text-white hover:text-gray-200 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mis Pedidos de Gas de Cocina
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              Gas Doméstico
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Seguimiento en vivo, código de confirmación de entrega e historial de compras.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={cargarMisPedidos}
            disabled={cargando}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
            Actualizar
          </button>

          <button
            onClick={() => {
              setMostrarModalNuevo(true);
              setErrorPedido(null);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Pedir Balón de Gas
          </button>
        </div>
      </div>

      {/* Listado de Pedidos */}
      {cargando ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mb-2" />
          <p className="text-sm text-gray-500">Cargando tus pedidos...</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
          <Flame className="w-14 h-14 text-orange-400 mb-3 animate-pulse" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Aún no has realizado pedidos de gas
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">
            Solicita tu balón de gas de 10kg, 15kg o 45kg y recíbelo en minutos con entrega segura en tu domicilio.
          </p>
          <button
            onClick={() => setMostrarModalNuevo(true)}
            className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            Solicitar Balón de Gas Ahora
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => {
            const paso = getPasoProgreso(pedido.estado);
            return (
              <div
                key={pedido.publicId}
                className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4"
              >
                {/* Cabecera del Pedido */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                        #PG-{pedido.publicId.substring(0, 8)}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          pedido.estado === "PENDIENTE"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            : pedido.estado === "CONFIRMADO"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            : pedido.estado === "ASIGNADO"
                            ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
                            : pedido.estado === "EN_CAMINO"
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 animate-pulse"
                            : pedido.estado === "ENTREGADO"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {pedido.estado.replace("_", " ")}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(pedido.createdAt).toLocaleDateString()} a las{" "}
                        {new Date(pedido.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-orange-600 font-semibold mt-0.5">
                      Distribuidora: {pedido.nombreEmpresa}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      Total: S/ {pedido.total.toFixed(2)}
                    </span>
                    {pedido.estado === "PENDIENTE" && (
                      <button
                        onClick={() => handleCancelarPedido(pedido.publicId)}
                        disabled={isPending}
                        className="text-xs text-red-600 hover:underline font-semibold"
                      >
                        Cancelar Pedido
                      </button>
                    )}
                  </div>
                </div>

                {/* Barra de Progreso y Estados */}
                {pedido.estado !== "CANCELADO" ? (
                  <div className="space-y-2 py-2">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className={`font-semibold ${paso >= 1 ? "text-orange-600" : "text-gray-400"}`}>
                        1. Pedido Recibido
                      </div>
                      <div className={`font-semibold ${paso >= 2 ? "text-blue-600" : "text-gray-400"}`}>
                        2. {pedido.estado === "ASIGNADO" ? "Repartidor Asignado" : "Confirmado"}
                      </div>
                      <div className={`font-semibold ${paso >= 3 ? "text-purple-600" : "text-gray-400"}`}>
                        3. En Camino
                      </div>
                      <div className={`font-semibold ${paso >= 4 ? "text-green-600" : "text-gray-400"}`}>
                        4. Entregado
                      </div>
                    </div>
                    {/* Barra visual */}
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          paso === 1
                            ? "w-1/4 bg-amber-500"
                            : paso === 2
                            ? "w-2/4 bg-blue-500"
                            : paso === 2.5
                            ? "w-3/5 bg-indigo-500"
                            : paso === 3
                            ? "w-3/4 bg-purple-500 animate-pulse"
                            : "w-full bg-emerald-500"
                        }`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span>Este pedido fue cancelado.</span>
                  </div>
                )}

                {/* Tarjeta de Repartidor Asignado / En Ruta */}
                {(pedido.nombreRepartidor || pedido.estado === "ASIGNADO" || pedido.estado === "EN_CAMINO") && (
                  <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg shrink-0 shadow-sm">
                        🛵
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                            Repartidor: {pedido.nombreRepartidor || "Asignado"}
                          </span>
                          {pedido.vehiculoPlaca && (
                            <span className="px-2 py-0.5 bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200 font-mono text-[10px] font-bold rounded">
                              Placa: {pedido.vehiculoPlaca}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                          {pedido.estado === "EN_CAMINO" ? (
                            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                              En camino a tu dirección con tu balón de gas
                            </span>
                          ) : (
                            "Preparando y cargando el balón de gas en la unidad"
                          )}
                        </p>
                      </div>
                    </div>
                    {pedido.telefonoRepartidor && (
                      <a
                        href={`tel:${pedido.telefonoRepartidor}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm self-start sm:self-auto transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Llamar ({pedido.telefonoRepartidor})
                      </a>
                    )}
                  </div>
                )}

                {/* Código de Confirmación de Seguridad y Detalles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-1.5 text-gray-700 dark:text-gray-300">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">{pedido.direccionEntrega}</span>
                        {pedido.referenciaDireccion && (
                          <span className="text-gray-400 block text-[11px]">
                            Ref: {pedido.referenciaDireccion}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="font-semibold text-gray-500 text-[11px] uppercase">
                        Balones de Gas:
                      </span>
                      {pedido.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-gray-800 dark:text-gray-200">
                          <span>
                            {it.cantidad}x {it.nombreProducto}
                          </span>
                          <span className="font-semibold">S/ {it.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tarjeta Destacada del Código de Entrega */}
                  {pedido.estado !== "CANCELADO" && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-2xl flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-900 dark:text-orange-200 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-orange-600" />
                          Código de Confirmación de Entrega
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            pedido.estado === "ENTREGADO"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-200 text-orange-900"
                          }`}
                        >
                          {pedido.estado === "ENTREGADO" ? "CANJEADO" : "PENDIENTE DE ENTREGA"}
                        </span>
                      </div>

                      <div className="my-2 text-center">
                        <span className="text-3xl font-mono font-black tracking-widest text-orange-600 dark:text-orange-400">
                          {pedido.codigoConfirmacion}
                        </span>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                          Dicta este código al repartidor únicamente cuando recibas tu balón de gas.
                        </p>
                      </div>

                      <div className="text-[11px] text-gray-600 dark:text-gray-400 flex items-center justify-between border-t border-orange-200/60 dark:border-orange-900/60 pt-2">
                        <span>Pago: <strong>{pedido.metodoPago}</strong></span>
                        <span>Estado: <strong>{pedido.estadoPago}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Hacer Nuevo Pedido */}
      {mostrarModalNuevo && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Solicitar Balón de Gas de Cocina
                </h3>
              </div>
              <button
                onClick={() => setMostrarModalNuevo(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearPedido} className="space-y-4">
              {/* Distribuidora */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Distribuidora Autorizada
                </label>
                <select
                  value={empresaSeleccionada}
                  onChange={(e) => setEmpresaSeleccionada(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                >
                  {empresasDisponibles.map((emp) => (
                    <option key={emp.publicId} value={emp.publicId}>
                      {emp.nombreComercial} - RUC {emp.ruc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Catálogo de Productos y Selector de Cantidad */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Selecciona tus Balones de Gas
                </label>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {productosDisponibles.map((prod) => {
                    const cant = carrito[prod.publicId] || 0;
                    return (
                      <div
                        key={prod.publicId}
                        className={`p-3 rounded-xl border flex items-center justify-between transition ${
                          cant > 0
                            ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div>
                          <h5 className="text-xs font-bold text-gray-900 dark:text-white">
                            {prod.nombre}
                          </h5>
                          <p className="text-[11px] text-gray-500">
                            Válvula: {prod.tipoValvula} • S/ {prod.precio.toFixed(2)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => modificarCantidad(prod.publicId, -1)}
                            className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 flex items-center justify-center text-xs font-bold"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold">{cant}</span>
                          <button
                            type="button"
                            onClick={() => modificarCantidad(prod.publicId, 1)}
                            className="w-7 h-7 rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center text-xs font-bold"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Carrito */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Total a Pagar:</span>
                <span className="text-lg font-bold text-orange-600">
                  S/ {calcularTotalCarrito().toFixed(2)}
                </span>
              </div>

              {/* Dirección y Coordenadas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Dirección de Entrega
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    required
                    placeholder="Av. Principal 123"
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Referencia
                  </label>
                  <input
                    type="text"
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Cerca a parque / timbre azul"
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Latitud GPS
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitud}
                    onChange={(e) => setLatitud(parseFloat(e.target.value))}
                    required
                    className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Longitud GPS
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitud}
                    onChange={(e) => setLongitud(parseFloat(e.target.value))}
                    required
                    className="w-full p-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>

              {/* Método de Pago */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Método de Pago
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["YAPE", "PLIN", "EFECTIVO", "TARJETA"] as const).map((met) => (
                    <button
                      key={met}
                      type="button"
                      onClick={() => setMetodoPago(met)}
                      className={`p-2.5 rounded-xl text-xs font-semibold border flex flex-col items-center justify-center gap-1 transition ${
                        metodoPago === met
                          ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/40"
                          : "border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {met === "YAPE" || met === "PLIN" ? (
                        <QrCode className="w-4 h-4 text-purple-600" />
                      ) : met === "TARJETA" ? (
                        <CreditCard className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Banknote className="w-4 h-4 text-emerald-600" />
                      )}
                      <span>{met}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notas para el repartidor */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Notas Adicionales
                </label>
                <input
                  type="text"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Instrucciones para el repartidor..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                />
              </div>

              {errorPedido && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorPedido}</span>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setMostrarModalNuevo(false)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || calcularTotalCarrito() === 0}
                  className="flex-1 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Flame className="w-4 h-4" />
                  Confirmar y Pedir Gas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
