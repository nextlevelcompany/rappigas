"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Tag,
  ShieldCheck,
  Check,
  Truck,
  AlertCircle,
  Sparkles,
  Building2,
  Gift,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ItemCarritoGas,
  obtenerCarritoGas,
  actualizarCantidadCarritoGas,
  eliminarDelCarritoGas,
  vaciarCarritoGas,
  obtenerImagenProductoGas,
  obtenerEmpresaSeleccionada,
  obtenerCuponGas,
  guardarCuponGas,
} from "@/librerias/carrito-gas";
import {
  fidelizacionApi,
  ResultadoValidacionCupon,
} from "@/librerias/api/fidelizacion.api";
import {
  obtenerCarritoCanjes,
  ItemCarritoCanje,
} from "../canjes/carrito-canjes";

export default function CarritoClientePage() {
  const router = useRouter();
  const [itemsGas, setItemsGas] = useState<ItemCarritoGas[]>([]);
  const [itemsCanjes, setItemsCanjes] = useState<ItemCarritoCanje[]>([]);
  const [empresa, setEmpresa] = useState<any>(null);

  // Cupones
  const [codigoCupon, setCodigoCupon] = useState("GASPRIMERO");
  const [cuponAplicado, setCuponAplicado] = useState<ResultadoValidacionCupon | null>(null);
  const [validandoCupon, setValidandoCupon] = useState(false);
  const [mensajeCupon, setMensajeCupon] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  // Cargar datos del carrito
  const recargarCarritos = () => {
    const gas = obtenerCarritoGas();
    const canjes = obtenerCarritoCanjes();
    const emp = obtenerEmpresaSeleccionada();
    const cup = obtenerCuponGas();
    setItemsGas(gas);
    setItemsCanjes(canjes);
    setEmpresa(emp);
    if (cup) setCuponAplicado(cup);
  };

  useEffect(() => {
    recargarCarritos();

    const handleSyncGas = () => {
      setItemsGas(obtenerCarritoGas());
      setEmpresa(obtenerEmpresaSeleccionada());
    };
    const handleSyncCanjes = () => setItemsCanjes(obtenerCarritoCanjes());

    window.addEventListener("carrito_gas_actualizado", handleSyncGas);
    window.addEventListener("carrito_canjes_actualizado", handleSyncCanjes);

    return () => {
      window.removeEventListener("carrito_gas_actualizado", handleSyncGas);
      window.removeEventListener("carrito_canjes_actualizado", handleSyncCanjes);
    };
  }, []);

  // Cálculos de totales
  const totalBalones = useMemo(
    () => itemsGas.reduce((acc, item) => acc + item.cantidad, 0),
    [itemsGas]
  );

  const subtotalGas = useMemo(
    () => itemsGas.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0),
    [itemsGas]
  );

  const costoEnvio = 0.0; // Despacho Gratis por inauguración / promocional
  const descuento = cuponAplicado?.valido ? cuponAplicado.descuento : 0.0;
  const totalPagar = Math.max(0, subtotalGas + costoEnvio - descuento);

  // Puntos de fidelidad que ganará con la compra (10 pts por cada S/ 10 de compra)
  const puntosGanados = Math.floor(totalPagar);

  // Modificar cantidad
  const handleModificarCantidad = (publicId: string, delta: number) => {
    const actualizado = actualizarCantidadCarritoGas(publicId, delta);
    setItemsGas(actualizado);
  };

  // Eliminar producto
  const handleEliminarProducto = (publicId: string) => {
    const actualizado = eliminarDelCarritoGas(publicId);
    setItemsGas(actualizado);
  };

  // Vaciar carrito
  const handleVaciar = () => {
    vaciarCarritoGas();
    setItemsGas([]);
    setCuponAplicado(null);
  };

  // Validar y aplicar cupón
  const handleAplicarCupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoCupon.trim()) return;

    setValidandoCupon(true);
    setMensajeCupon(null);
    try {
      const res = await fidelizacionApi.validarCupon(
        codigoCupon.trim().toUpperCase(),
        subtotalGas > 0 ? subtotalGas : 50.0,
        empresa?.publicId
      );
      if (res.valido) {
        setCuponAplicado(res);
        guardarCuponGas(res);
        setMensajeCupon({
          tipo: "exito",
          texto: `¡Cupón ${res.codigo} aplicado! Ahorras S/ ${res.descuento.toFixed(2)}`,
        });
      } else {
        setCuponAplicado(null);
        guardarCuponGas(null);
        setMensajeCupon({
          tipo: "error",
          texto: res.mensaje || "Cupón no válido para este pedido.",
        });
      }
    } catch (err: any) {
      setMensajeCupon({
        tipo: "error",
        texto: err.message || "Error al verificar cupón.",
      });
    } finally {
      setValidandoCupon(false);
    }
  };

  const handleRemoverCupon = () => {
    setCuponAplicado(null);
    guardarCuponGas(null);
    setMensajeCupon(null);
  };

  return (
    <div className="w-full py-4 px-3 sm:px-6 lg:px-8 space-y-5 text-slate-800">
      {/* Barra de progreso / Stepper del Checkout */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                Paso 1 de 2
              </span>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                Carrito de Compras • Balones de Gas
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Revisa los balones seleccionados antes de proceder a la dirección de entrega y pago.
            </p>
          </div>

          {/* Stepper visual */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <div className="flex items-center gap-1.5 text-orange-600">
              <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                1
              </span>
              <span>Carrito</span>
            </div>
            <span className="text-slate-300">───</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span>Entrega & Pago</span>
            </div>
            <span className="text-slate-300">───</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                ✓
              </span>
              <span>Confirmación</span>
            </div>
          </div>
        </div>
      </div>

      {/* Si el carrito está vacío */}
      {itemsGas.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center shadow-xs max-w-xl mx-auto flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-4 text-orange-600 shadow-sm">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-lg font-black text-slate-900 mb-1">
            Tu carrito de gas está vacío
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-6 leading-relaxed">
            Aún no has agregado ningún balón de gas GLP o accesorio a tu pedido. Selecciona tu distribuidora y recibe tu balón en la puerta de tu hogar.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href="/cliente/tienda">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs sm:text-sm rounded-xl px-5 h-11 shadow-md gap-2">
                <Flame className="w-4 h-4 text-amber-200" />
                <span>Explorar Tienda y Distribuidores</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/cliente/canjes">
              <Button
                variant="outline"
                className="font-bold text-xs sm:text-sm rounded-xl px-4 h-11 border-slate-300"
              >
                <Gift className="w-4 h-4 text-amber-600" />
                <span>Ver Premios de Fidelidad</span>
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        /* Cuadrícula de 2 columnas: Lista de items (izquierda) y Resumen (derecha) a todo el ancho */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
          {/* COLUMNA IZQUIERDA: Balones en el carrito */}
          <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 space-y-4">
            {/* Banner de Distribuidora Oficial */}
            <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">
                    Distribuidora Despachadora
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                    {empresa?.nombreComercial || itemsGas[0]?.empresaNombre || "Distribuidora Autorizada RappiGas"}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <Truck className="w-3.5 h-3.5" />
                  Despacho Inmediato
                </span>
                <Link href="/cliente/tienda">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold rounded-lg border-orange-300 hover:bg-orange-50 text-orange-700 h-8"
                  >
                    Cambiar
                  </Button>
                </Link>
              </div>
            </div>

            {/* Listado de Productos */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
              <div className="p-4 bg-slate-50/60 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-black text-slate-800">
                    Productos Seleccionados ({totalBalones} unidades)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleVaciar}
                  className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vaciar carrito</span>
                </button>
              </div>

              {itemsGas.map((item) => {
                const img = obtenerImagenProductoGas(item.producto);
                const subtotalItem = item.producto.precio * item.cantidad;

                return (
                  <div
                    key={item.producto.publicId}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:bg-slate-50/50"
                  >
                    {/* Imagen y datos */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-16 h-16 rounded-2xl bg-orange-50/60 border border-slate-200 p-1.5 flex items-center justify-center shrink-0">
                        <img
                          src={img}
                          alt={item.producto.nombre}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "/products/balon-10kg-premium.svg";
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">
                            {item.producto.tipoGas || "GLP"}
                          </span>
                          {item.producto.tipoValvula && item.producto.tipoValvula !== "NINGUNA" && (
                            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              Válvula {item.producto.tipoValvula}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-black text-slate-900 mt-1 truncate">
                          {item.producto.nombre}
                        </h3>
                        <p className="text-xs font-bold text-slate-500 font-mono mt-0.5">
                          S/ {item.producto.precio.toFixed(2)} por balón
                        </p>
                      </div>
                    </div>

                    {/* Controles de cantidad y subtotal */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
                      {/* Cantidad */}
                      <div className="flex items-center gap-2 bg-slate-100/90 rounded-xl p-1 border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleModificarCantidad(item.producto.publicId, -1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 flex items-center justify-center shadow-2xs font-bold transition cursor-pointer"
                          title="Disminuir"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center font-black text-xs text-slate-900">
                          {item.cantidad}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleModificarCantidad(item.producto.publicId, 1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 flex items-center justify-center shadow-2xs font-bold transition cursor-pointer"
                          title="Aumentar"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[80px]">
                        <span className="text-sm font-black text-slate-900 font-mono block">
                          S/ {subtotalItem.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400">Total item</span>
                      </div>

                      {/* Botón eliminar */}
                      <button
                        type="button"
                        onClick={() => handleEliminarProducto(item.producto.publicId)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Quitar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Aviso de Premios de Fidelidad si existen en canje */}
            {itemsCanjes.length > 0 && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-950">
                      Tienes {itemsCanjes.length} premio(s) en tu carrito de canjes
                    </h4>
                    <p className="text-[11px] text-amber-800">
                      Puedes coordinar la entrega conjunta de tus premios de fidelidad con este pedido.
                    </p>
                  </div>
                </div>
                <Link href="/cliente/canjes?abrir=carrito">
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-bold text-xs bg-white text-amber-900 border-amber-300 hover:bg-amber-100"
                  >
                    Ver Premios
                  </Button>
                </Link>
              </div>
            )}

            {/* Garantías de seguridad */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h5 className="text-[11px] font-black text-slate-800">Precinto Osinergmin</h5>
                  <p className="text-[10px] text-slate-500">100% balones sellados y certificados</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-orange-600 shrink-0" />
                <div>
                  <h5 className="text-[11px] font-black text-slate-800">Peso Exacto</h5>
                  <p className="text-[10px] text-slate-500">Pesaje verificado con balanza digital</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <h5 className="text-[11px] font-black text-slate-800">Entrega Rápida</h5>
                  <p className="text-[10px] text-slate-500">Repartidores motorizados express</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Resumen de Compra y Botón a Checkout */}
          <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 space-y-4 lg:sticky lg:top-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900">
                  Resumen de Compra
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  {totalBalones} {totalBalones === 1 ? "balón" : "balones"}
                </span>
              </div>

              {/* Formulario Cupón */}
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  ¿Tienes un cupón de descuento?
                </label>
                <form onSubmit={handleAplicarCupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={codigoCupon}
                      onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
                      placeholder="Ej: GASPRIMERO"
                      className="w-full pl-8 pr-2 py-1.5 text-xs font-mono font-bold uppercase rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={validandoCupon || !codigoCupon.trim()}
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg px-3 h-8"
                  >
                    {validandoCupon ? "..." : "Aplicar"}
                  </Button>
                </form>

                {mensajeCupon && (
                  <p
                    className={`text-[11px] font-bold mt-1.5 flex items-center gap-1 ${
                      mensajeCupon.tipo === "exito" ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {mensajeCupon.tipo === "exito" ? (
                      <Check className="w-3 h-3 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3 h-3 shrink-0" />
                    )}
                    <span>{mensajeCupon.texto}</span>
                  </p>
                )}

                {cuponAplicado && (
                  <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-800">
                      ✓ Cupón {cuponAplicado.codigo} activo (-S/ {cuponAplicado.descuento.toFixed(2)})
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoverCupon}
                      className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>

              {/* Desglose de Precios */}
              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal Balones:</span>
                  <span className="font-mono font-bold text-slate-800">
                    S/ {subtotalGas.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Despacho a Domicilio:</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    GRATIS
                  </span>
                </div>

                {descuento > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-bold">
                    <span>Descuento de Cupón:</span>
                    <span className="font-mono">- S/ {descuento.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-black text-slate-900 block leading-tight">
                      Total a Pagar
                    </span>
                    <span className="text-[10px] text-slate-400">Impuestos y entrega incluidos</span>
                  </div>
                  <span className="text-xl font-black text-orange-600 font-mono">
                    S/ {totalPagar.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Recompensa de Puntos */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl p-2.5 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[11px] font-bold text-amber-900">
                  Acumularás <strong className="text-orange-600">+{puntosGanados} Puntos RappiGas</strong> con esta compra.
                </span>
              </div>

              {/* Botón principal al Checkout */}
              <div className="space-y-2 pt-1">
                <Link href="/cliente/checkout" className="block w-full">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-sm rounded-xl h-12 shadow-lg gap-2 cursor-pointer"
                  >
                    <span>Proceder al Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link href="/cliente/tienda" className="block w-full text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs font-bold text-slate-600 hover:text-orange-600 gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Continuar comprando</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
