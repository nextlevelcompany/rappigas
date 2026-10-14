"use client";

import React, { useEffect, useState, useTransition } from "react";
import { empresasApi, EmpresaDetalle } from "@/librerias/api/empresas.api";
import { catalogoApi, ProductoDetalle } from "@/librerias/api/catalogo.api";
import { pedidosApi, CrearPedidoDto, PedidoDetalle } from "@/librerias/api/pedidos.api";
import { fidelizacionApi, BilleteraPuntos, ResultadoValidacionCupon } from "@/librerias/api/fidelizacion.api";
import { finanzasApi, MetodoPago } from "@/librerias/api/finanzas.api";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/librerias/api/auth.api";
import {
  Flame,
  MapPin,
  Truck,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  Banknote,
  QrCode,
  Tag,
  Gift,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Phone,
  Navigation,
  Lock,
} from "lucide-react";

export default function TiendaClienteGasPage() {
  const { usuario, establecerSesion } = useAuthStore();
  const [empresas, setEmpresas] = useState<EmpresaDetalle[]>([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<EmpresaDetalle | null>(null);
  const [catalogo, setCatalogo] = useState<ProductoDetalle[]>([]);
  const [carrito, setCarrito] = useState<{ [productoId: string]: number }>({});
  const [billetera, setBilletera] = useState<BilleteraPuntos | null>(null);

  // Formulario Pedido
  const [direccion, setDireccion] = useState("Av. Antúnez de Mayolo 1234, Los Olivos, Lima");
  const [referencia, setReferencia] = useState("A 2 cuadras de la municipalidad, 2do piso");
  const [latitud, setLatitud] = useState(-11.9912);
  const [longitud, setLongitud] = useState(-77.0711);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("YAPE");
  const [telefonoYape, setTelefonoYape] = useState("977665554");
  const [notas, setNotas] = useState("Balón para cocina doméstica de 4 hornillas.");

  // Cupones
  const [codigoCupon, setCodigoCupon] = useState("GASPRIMERO");
  const [cuponAplicado, setCuponAplicado] = useState<ResultadoValidacionCupon | null>(null);
  const [validandoCupon, setValidandoCupon] = useState(false);
  const [errorCupon, setErrorCupon] = useState<string | null>(null);

  // Estados de proceso
  const [cargando, setCargando] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [pedidoConfirmado, setPedidoConfirmado] = useState<PedidoDetalle | null>(null);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setCargando(true);
    try {
      const emps = await empresasApi.listarEmpresasPublicas();
      setEmpresas(emps);
      if (emps.length > 0) {
        setEmpresaSeleccionada(emps[0]);
        const prods = await catalogoApi.listarProductosPublicos(emps[0].publicId);
        setCatalogo(prods.filter((p) => p.estado === "ACTIVO"));
        if (prods.length > 0) {
          setCarrito({ [prods[0].publicId]: 1 });
        }
      }

      // Si está autenticado como cliente, cargar billetera
      try {
        const b = await fidelizacionApi.obtenerBilletera();
        setBilletera(b);
      } catch {
        // No logueado o rol distinto
      }
    } catch {
      // Ignorar errores en carga inicial
    } finally {
      setCargando(false);
    }
  };

  const cambiarEmpresa = async (emp: EmpresaDetalle) => {
    setEmpresaSeleccionada(emp);
    setCarrito({});
    setCuponAplicado(null);
    try {
      const prods = await catalogoApi.listarProductosPublicos(emp.publicId);
      setCatalogo(prods.filter((p) => p.estado === "ACTIVO"));
      if (prods.length > 0) {
        setCarrito({ [prods[0].publicId]: 1 });
      }
    } catch {
      // Ignorar errores al cambiar empresa
    }
  };

  const modificarCantidad = (publicId: string, delta: number) => {
    setCarrito((prev) => {
      const actual = prev[publicId] || 0;
      const nuevo = Math.max(0, actual + delta);
      if (nuevo === 0) {
        const copia = { ...prev };
        delete copia[publicId];
        return copia;
      }
      return { ...prev, [publicId]: nuevo };
    });
  };

  const calcularSubtotal = () => {
    return Object.entries(carrito).reduce((total, [publicId, cant]) => {
      const prod = catalogo.find((p) => p.publicId === publicId);
      return total + (prod ? prod.precio * cant : 0);
    }, 0);
  };

  const subtotal = calcularSubtotal();
  const descuento = cuponAplicado?.valido ? cuponAplicado.descuento : 0;
  const totalPagar = Math.max(0, subtotal - descuento);

  const handleValidarCupon = async () => {
    if (!codigoCupon.trim()) return;
    setValidandoCupon(true);
    setErrorCupon(null);
    try {
      const res = await fidelizacionApi.validarCupon(
        codigoCupon.trim().toUpperCase(),
        subtotal > 0 ? subtotal : 50.0,
        empresaSeleccionada?.publicId
      );
      if (res.valido) {
        setCuponAplicado(res);
      } else {
        setErrorCupon(res.mensaje || "Cupón no válido.");
        setCuponAplicado(null);
      }
    } catch (err: any) {
      setErrorCupon("Error al validar cupón: " + (err.message || "Servicio no disponible"));
    } finally {
      setValidandoCupon(false);
    }
  };

  const handleConfirmarPedido = () => {
    if (Object.keys(carrito).length === 0) {
      setErrorEnvio("Debes seleccionar al menos un balón de gas para continuar.");
      return;
    }
    if (!empresaSeleccionada) {
      setErrorEnvio("Selecciona una distribuidora autorizada.");
      return;
    }

    startTransition(async () => {
      setErrorEnvio(null);
      try {
        // Asegurar sesión como cliente si no está autenticado
        if (!usuario || usuario.rol !== "CLIENTE") {
          const authRes = await authApi.login({
            email: "cliente@pidegas.pe",
            password: "ClientePassword123!",
          });
          establecerSesion(authRes);
        }

        const itemsPayload = Object.entries(carrito).map(([prodId, cant]) => ({
          productoPublicId: prodId,
          cantidad: cant,
        }));

        const payload: CrearPedidoDto = {
          empresaPublicId: empresaSeleccionada.publicId,
          direccionEntrega: direccion,
          referenciaDireccion: referencia,
          latitud: latitud,
          longitud: longitud,
          metodoPago: metodoPago,
          notasCliente: notas,
          items: itemsPayload,
        };

        const nuevoPed = await pedidosApi.crearPedido(payload);

        // Si es pago en línea (YAPE, PLIN, TARJETA), procesar pago inmediato
        if (metodoPago === "YAPE" || metodoPago === "PLIN" || metodoPago === "TARJETA") {
          try {
            await finanzasApi.procesarPagoCliente({
              pedidoPublicId: nuevoPed.publicId,
              metodoPago: metodoPago,
              telefonoYapePlin: telefonoYape,
              nombreTitular: "Juan Pérez",
            });
            nuevoPed.estadoPago = "PAGADO";
          } catch (pagoErr) {
            console.warn("Pago en línea diferido a contra entrega:", pagoErr);
          }
        }

        setPedidoConfirmado(nuevoPed);
        setCarrito({});
        setCuponAplicado(null);
      } catch (err: any) {
        setErrorEnvio(err.message || "Error al procesar el pedido. Intenta nuevamente.");
      }
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Banner Superior de Cobertura y Bienvenida */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-200 animate-pulse" />
            Marketplace Oficial de Balones de Gas de Cocina
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Pide tu Balón de Gas a Domicilio
          </h1>
          <p className="text-orange-100 text-sm sm:text-base">
            Distribuidoras certificadas por Osinergmin con válvulas seguras y entrega express en menos de 30 minutos.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-white/90">
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg">
              <MapPin className="w-4 h-4 text-amber-300" />
              Los Olivos, Lima
            </span>
            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              Garantía de Peso Exacto
            </span>
            {billetera && (
              <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg text-amber-200">
                <Gift className="w-4 h-4" />
                Tienes {billetera.saldoPuntos} Puntos de Gas
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Éxito cuando el pedido se confirma */}
      {pedidoConfirmado && (
        <div className="bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 animate-in fade-in duration-300">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  ¡Pedido Recibido con Éxito!
                </span>
                <h2 className="text-2xl font-black text-emerald-950">
                  Orden #PG-{pedidoConfirmado.publicId.substring(0, 8).toUpperCase()}
                </h2>
              </div>
            </div>
            <button
              onClick={() => setPedidoConfirmado(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold text-xl px-2"
            >
              ✕
            </button>
          </div>

          {/* Código de Seguridad de 6 dígitos */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Código de Confirmación de Entrega
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Entrega este código al repartidor al momento de recibir tu balón de gas:
              </p>
            </div>
            <div className="px-6 py-2.5 bg-orange-50 border-2 border-orange-500 rounded-2xl text-3xl font-mono font-black text-orange-600 tracking-widest shadow-inner">
              {pedidoConfirmado.codigoConfirmacion}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-emerald-900 font-medium">
            <div className="bg-emerald-100/60 p-3 rounded-xl">
              <span className="text-emerald-700 block">Distribuidora:</span>
              <strong className="text-sm">{empresaSeleccionada?.nombreComercial}</strong>
            </div>
            <div className="bg-emerald-100/60 p-3 rounded-xl">
              <span className="text-emerald-700 block">Total a Pagar:</span>
              <strong className="text-sm">S/ {Number(pedidoConfirmado.total).toFixed(2)} ({pedidoConfirmado.metodoPago})</strong>
            </div>
            <div className="bg-emerald-100/60 p-3 rounded-xl">
              <span className="text-emerald-700 block">Estado del Pago:</span>
              <strong className="text-sm text-emerald-700 uppercase">{pedidoConfirmado.estadoPago}</strong>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <a
              href="/cliente/pedidos"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              <Truck className="w-4 h-4" />
              Seguimiento de Mi Pedido en Vivo
            </a>
          </div>
        </div>
      )}

      {/* Grid Principal: Catálogo a la izquierda, Checkout a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Selección de Empresa y Balones de Gas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selector de Distribuidora con Cobertura */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-500" />
              Distribuidoras con Cobertura en tu Ubicación
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {empresas.map((emp) => {
                const seleccionada = empresaSeleccionada?.publicId === emp.publicId;
                return (
                  <button
                    key={emp.publicId}
                    type="button"
                    onClick={() => cambiarEmpresa(emp)}
                    className={`p-4 rounded-xl border text-left transition flex items-start gap-3 ${
                      seleccionada
                        ? "border-orange-500 bg-orange-50/50 shadow-sm ring-2 ring-orange-400/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold shrink-0">
                      <Flame className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-slate-900 truncate">
                          {emp.nombreComercial}
                        </h3>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Abierto
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{emp.direccionFiscal}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          20 - 35 min
                        </span>
                        <span className="flex items-center gap-1 font-bold text-amber-600">
                          ★ 4.9 (120+)
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catálogo de Balones de Gas */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-600" />
                Catálogo de Balones de Gas de Cocina
              </h2>
              <span className="text-xs text-slate-500">
                {catalogo.length} opciones disponibles
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {catalogo.map((prod) => {
                const cantidad = carrito[prod.publicId] || 0;
                return (
                  <div
                    key={prod.publicId}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shrink-0 border border-orange-200">
                        <Flame className="w-8 h-8 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-bold text-slate-900 text-sm leading-snug">
                            {prod.nombre}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {prod.descripcion}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {prod.tipoValvula}
                          </span>
                          <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                            {prod.tipoGas}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 block">Precio Unitario</span>
                        <span className="text-xl font-black text-slate-900">
                          S/ {Number(prod.precio).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {cantidad > 0 ? (
                          <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200">
                            <button
                              type="button"
                              onClick={() => modificarCantidad(prod.publicId, -1)}
                              className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center text-slate-700 hover:bg-slate-200 font-bold"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="font-bold text-sm w-5 text-center text-slate-900">
                              {cantidad}
                            </span>
                            <button
                              type="button"
                              onClick={() => modificarCantidad(prod.publicId, 1)}
                              className="w-7 h-7 rounded-lg bg-orange-600 text-white shadow-xs flex items-center justify-center hover:bg-orange-700 font-bold"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => modificarCantidad(prod.publicId, 1)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Checkout, Cupón, Pago y Confirmación */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
                Resumen del Pedido
              </h2>
              <span className="text-xs font-bold text-orange-600">
                {Object.values(carrito).reduce((a, b) => a + b, 0)} balones
              </span>
            </div>

            {/* Dirección de Entrega */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                Dirección de Entrega
              </label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Dirección exacta..."
                className="w-full text-xs p-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden"
              />
              <input
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Referencia (piso, depto, frente al parque)..."
                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-hidden text-slate-600"
              />
            </div>

            {/* Cupón Promocional */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-purple-600" />
                  Cupón Promocional
                </span>
                <span className="text-[10px] text-purple-600 font-semibold">Usa: GASPRIMERO</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codigoCupon}
                  onChange={(e) => setCodigoCupon(e.target.value)}
                  placeholder="Código cupón..."
                  className="flex-1 text-xs p-2 border border-slate-200 rounded-xl uppercase font-mono font-bold focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleValidarCupon}
                  disabled={validandoCupon}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50"
                >
                  {validandoCupon ? "..." : "Aplicar"}
                </button>
              </div>
              {errorCupon && <p className="text-[11px] text-red-600 font-medium">{errorCupon}</p>}
              {cuponAplicado && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                  <span>Cupón <strong>{cuponAplicado.codigo}</strong> aplicado</span>
                  <span className="font-bold text-emerald-700">- S/ {cuponAplicado.descuento.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Método de Pago */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block">
                Método de Pago
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setMetodoPago("YAPE")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition ${
                    metodoPago === "YAPE"
                      ? "border-purple-500 bg-purple-50 text-purple-900 ring-2 ring-purple-300"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <QrCode className="w-5 h-5 text-purple-600" />
                  Yape (QR)
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago("EFECTIVO")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition ${
                    metodoPago === "EFECTIVO"
                      ? "border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-300"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Banknote className="w-5 h-5 text-amber-600" />
                  Efectivo
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago("PLIN")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition ${
                    metodoPago === "PLIN"
                      ? "border-cyan-500 bg-cyan-50 text-cyan-900 ring-2 ring-cyan-300"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <Phone className="w-5 h-5 text-cyan-600" />
                  Plin
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago("TARJETA")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 font-semibold transition ${
                    metodoPago === "TARJETA"
                      ? "border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-300"
                      : "border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Tarjeta
                </button>
              </div>

              {metodoPago === "YAPE" && (
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-purple-900">Número de Yape:</p>
                  <p className="font-mono text-purple-700 font-bold text-sm">988-777-666 (Gas Los Olivos)</p>
                  <p className="text-[11px] text-purple-600">Simulación: Pago validado automáticamente.</p>
                </div>
              )}
            </div>

            {/* Totales */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              {descuento > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Descuento Promocional:</span>
                  <span>- S/ {descuento.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Envío a domicilio:</span>
                <span className="font-bold text-emerald-600 uppercase text-[10px]">Gratis</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Total a Pagar:</span>
                <span className="text-orange-600">S/ {totalPagar.toFixed(2)}</span>
              </div>
            </div>

            {errorEnvio && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorEnvio}</span>
              </div>
            )}

            {/* Botón de Confirmación Principal */}
            <button
              type="button"
              onClick={handleConfirmarPedido}
              disabled={isPending || subtotal <= 0}
              className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4" />
              {isPending ? "Confirmando pedido..." : `Confirmar y Pedir Gas (S/ ${totalPagar.toFixed(2)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
