"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Cart,
} from "@boxicons/react";
import {
  Flame,
  Gift,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ExternalLink,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ItemCarritoGas,
  obtenerCarritoGas,
  actualizarCantidadCarritoGas,
  eliminarDelCarritoGas,
  vaciarCarritoGas,
  obtenerImagenProductoGas,
} from "@/librerias/carrito-gas";

import {
  ItemCarritoCanje,
  obtenerCarritoCanjes,
  actualizarCantidadCarritoCanjes,
  eliminarDelCarritoCanjes,
  vaciarCarritoCanjes,
} from "@/app/(cliente)/cliente/canjes/carrito-canjes";

export function CartDropdown() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"gas" | "canjes">("gas");
  const [gasItems, setGasItems] = useState<ItemCarritoGas[]>([]);
  const [canjesItems, setCanjesItems] = useState<ItemCarritoCanje[]>([]);

  // Cargar estado inicial y sincronizar con eventos globales
  const sincronizarCarritos = () => {
    const gas = obtenerCarritoGas();
    const canjes = obtenerCarritoCanjes();
    setGasItems(gas);
    setCanjesItems(canjes);
  };

  useEffect(() => {
    sincronizarCarritos();

    const handleGasSync = () => setGasItems(obtenerCarritoGas());
    const handleCanjesSync = () => setCanjesItems(obtenerCarritoCanjes());
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "rappigas_carrito_gas" || e.key === "rappigas_carrito_canjes") {
        sincronizarCarritos();
      }
    };

    window.addEventListener("carrito_gas_actualizado", handleGasSync);
    window.addEventListener("carrito_canjes_actualizado", handleCanjesSync);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("carrito_gas_actualizado", handleGasSync);
      window.removeEventListener("carrito_canjes_actualizado", handleCanjesSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Totales
  const totalGasCount = useMemo(
    () => gasItems.reduce((acc, item) => acc + item.cantidad, 0),
    [gasItems]
  );
  const totalGasSoles = useMemo(
    () => gasItems.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0),
    [gasItems]
  );

  const totalCanjesCount = useMemo(
    () => canjesItems.reduce((acc, item) => acc + item.cantidad, 0),
    [canjesItems]
  );
  const totalPuntosCanjes = useMemo(
    () => canjesItems.reduce((acc, item) => acc + item.premio.puntos * item.cantidad, 0),
    [canjesItems]
  );

  const totalGlobalItems = totalGasCount + totalCanjesCount;

  // Ajustar pestaña si una está vacía pero la otra tiene items
  useEffect(() => {
    if (gasItems.length === 0 && canjesItems.length > 0) {
      setActiveTab("canjes");
    } else if (canjesItems.length === 0 && gasItems.length > 0) {
      setActiveTab("gas");
    }
  }, [gasItems.length, canjesItems.length]);

  // Acciones Balones Gas
  const handleModificarGas = (e: React.MouseEvent, publicId: string, delta: number) => {
    e.stopPropagation();
    e.preventDefault();
    const actualizado = actualizarCantidadCarritoGas(publicId, delta);
    setGasItems(actualizado);
  };

  const handleEliminarGas = (e: React.MouseEvent, publicId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const actualizado = eliminarDelCarritoGas(publicId);
    setGasItems(actualizado);
  };

  const handleVaciarGas = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    vaciarCarritoGas();
    setGasItems([]);
  };

  const handleIrTiendaGas = () => {
    setOpen(false);
    router.push("/cliente/tienda");
  };

  const handleIrACarritoGas = () => {
    setOpen(false);
    router.push("/cliente/carrito");
  };

  const handleIrACheckoutGas = () => {
    setOpen(false);
    router.push("/cliente/checkout");
  };

  // Acciones Premios Canjes
  const handleModificarCanjes = (e: React.MouseEvent, premioId: string, nuevaCant: number) => {
    e.stopPropagation();
    e.preventDefault();
    const actualizado = actualizarCantidadCarritoCanjes(premioId, nuevaCant);
    setCanjesItems(actualizado);
  };

  const handleEliminarCanjes = (e: React.MouseEvent, premioId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const actualizado = eliminarDelCarritoCanjes(premioId);
    setCanjesItems(actualizado);
  };

  const handleVaciarCanjes = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    vaciarCarritoCanjes();
    setCanjesItems([]);
  };

  const handleConfirmarCanjes = () => {
    setOpen(false);
    router.push("/cliente/canjes/checkout");
  };

  const handleIrAHistorialCanjes = () => {
    setOpen(false);
    router.push("/cliente/canjes/historial");
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div id="header-cart-trigger" className="relative flex cursor-pointer">
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-full flex items-center justify-center shrink-0 hover:bg-orange-50 hover:text-orange-600 transition"
            title="Carrito de Compras y Premios RappiGas"
          >
            <Cart className="size-5 block shrink-0" />
          </Button>

          {totalGlobalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-orange-600 text-white text-[10px] font-black leading-none whitespace-nowrap shadow-md border-2 border-background animate-in zoom-in-50">
              {totalGlobalItems > 99 ? "99+" : totalGlobalItems}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[370px] sm:w-[410px] rounded-2xl p-0 overflow-hidden shadow-2xl border border-slate-200 bg-white text-slate-800"
      >
        {/* Cabecera RappiGas */}
        <div className="bg-gradient-to-r from-slate-900 via-navy-950 to-slate-900 text-white px-4 py-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-tight leading-none text-white">
                  Mi Carrito RappiGas
                </h3>
                <span className="text-[10px] text-slate-300 font-medium">
                  {totalGlobalItems === 0
                    ? "Sin productos seleccionados"
                    : `${totalGlobalItems} artículo${totalGlobalItems > 1 ? "s" : ""} en total`}
                </span>
              </div>
            </div>

            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-orange-600/20 text-orange-400 border border-orange-500/30">
              {totalGasCount} Gas • {totalCanjesCount} Canjes
            </span>
          </div>

          {/* Selector de pestañas */}
          <div className="grid grid-cols-2 gap-1.5 mt-2.5 bg-slate-800/80 p-1 rounded-xl">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("gas");
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "gas"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Balones de Gas</span>
              {totalGasCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    activeTab === "gas" ? "bg-white text-orange-600" : "bg-slate-700 text-white"
                  }`}
                >
                  {totalGasCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("canjes");
              }}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === "canjes"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "text-slate-300 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-pink-300" />
              <span>Premios Canje</span>
              {totalCanjesCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    activeTab === "canjes" ? "bg-white text-orange-600" : "bg-slate-700 text-white"
                  }`}
                >
                  {totalCanjesCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ================= CONTENIDO PESTAÑA: BALONES DE GAS ================= */}
        {activeTab === "gas" && (
          <div>
            {gasItems.length === 0 ? (
              <div className="py-8 px-5 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-2.5 text-orange-500 shadow-xs">
                  <Flame className="w-7 h-7" />
                </div>
                <h4 className="text-xs font-black text-slate-900 mb-1">
                  Tu carrito de gas está vacío
                </h4>
                <p className="text-[11px] text-slate-500 max-w-[260px] mb-4">
                  Pide tu balón de gas GLP de 10kg, 15kg o 45kg y recíbelo express en tu domicilio.
                </p>
                <Button
                  onClick={handleIrTiendaGas}
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-sm px-4 gap-1.5 cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Pedir Balón de Gas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <div>
                {/* Distribuidora banner si existe */}
                {gasItems[0]?.empresaNombre && (
                  <div className="bg-orange-50/70 border-b border-orange-100 px-4 py-1.5 text-[11px] text-orange-800 font-bold flex items-center justify-between">
                    <span className="truncate">🏢 {gasItems[0].empresaNombre}</span>
                    <button
                      type="button"
                      onClick={handleVaciarGas}
                      className="text-[10px] font-semibold text-slate-500 hover:text-red-600 cursor-pointer underline"
                    >
                      Vaciar
                    </button>
                  </div>
                )}

                {/* Lista de productos de gas */}
                <ScrollArea className="max-h-[280px]">
                  <div className="divide-y divide-slate-100 p-2 space-y-1">
                    {gasItems.map((item) => {
                      const imgUrl = obtenerImagenProductoGas(item.producto);
                      const subtotalItem = item.producto.precio * item.cantidad;

                      return (
                        <div
                          key={item.producto.publicId}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50/80 transition"
                        >
                          {/* Miniatura imagen */}
                          <div className="w-12 h-12 rounded-xl bg-orange-50/50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                            <img
                              src={imgUrl}
                              alt={item.producto.nombre}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  "/products/balon-10kg-premium.svg";
                              }}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 truncate leading-tight">
                              {item.producto.nombre}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              S/ {item.producto.precio.toFixed(2)} c/u
                            </p>

                            {/* Controles de cantidad */}
                            <div className="flex items-center gap-1.5 mt-1">
                              <button
                                type="button"
                                onClick={(e) =>
                                  handleModificarGas(e, item.producto.publicId, -1)
                                }
                                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition"
                                title="Disminuir"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-black text-xs text-slate-800 w-5 text-center">
                                {item.cantidad}
                              </span>
                              <button
                                type="button"
                                onClick={(e) =>
                                  handleModificarGas(e, item.producto.publicId, 1)
                                }
                                className="w-6 h-6 rounded-md bg-orange-100 hover:bg-orange-200 text-orange-700 flex items-center justify-center cursor-pointer transition"
                                title="Aumentar"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Subtotal y Eliminar */}
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-xs font-black text-slate-900 font-mono">
                              S/ {subtotalItem.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleEliminarGas(e, item.producto.publicId)}
                              className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Quitar del carrito"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Footer Gas */}
                <div className="border-t border-slate-100 p-3 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-semibold">Subtotal Balones:</span>
                    <span className="text-sm font-black text-orange-600 font-mono">
                      S/ {totalGasSoles.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleIrACarritoGas}
                      className="w-full h-9 rounded-xl border-slate-300 hover:bg-orange-50 text-slate-700 hover:text-orange-700 font-bold text-xs cursor-pointer"
                    >
                      <span>Ver Carrito</span>
                    </Button>
                    <Button
                      onClick={handleIrACheckoutGas}
                      className="w-full h-9 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black text-xs shadow-md gap-1 cursor-pointer"
                    >
                      <span>Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= CONTENIDO PESTAÑA: PREMIOS CANJE ================= */}
        {activeTab === "canjes" && (
          <div>
            {canjesItems.length === 0 ? (
              <div className="py-8 px-5 text-center flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-2.5 text-amber-600 shadow-xs">
                  <Gift className="w-7 h-7" />
                </div>
                <h4 className="text-xs font-black text-slate-900 mb-1">
                  Tu carrito de canjes está vacío
                </h4>
                <p className="text-[11px] text-slate-500 max-w-[260px] mb-4">
                  Canjea tus puntos acumulados por balones gratis, vales de descuento y electrohogar.
                </p>
                <Button
                  onClick={() => {
                    setOpen(false);
                    router.push("/cliente/canjes");
                  }}
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-sm px-4 gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explorar Premios</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <div>
                <div className="bg-amber-50/70 border-b border-amber-100 px-4 py-1.5 text-[11px] text-amber-900 font-bold flex items-center justify-between">
                  <span>🎁 Premios seleccionados para canjear</span>
                  <button
                    type="button"
                    onClick={handleVaciarCanjes}
                    className="text-[10px] font-semibold text-slate-500 hover:text-red-600 cursor-pointer underline"
                  >
                    Vaciar
                  </button>
                </div>

                {/* Lista de premios */}
                <ScrollArea className="max-h-[280px]">
                  <div className="divide-y divide-slate-100 p-2 space-y-1">
                    {canjesItems.map((item) => {
                      const totalPuntosItem = item.premio.puntos * item.cantidad;

                      return (
                        <div
                          key={item.premio.id}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50/80 transition"
                        >
                          {/* Miniatura imagen */}
                          <div className="w-12 h-12 rounded-xl bg-amber-50/50 border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={item.premio.imagen}
                              alt={item.premio.nombre}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src =
                                  "/products/balon-10kg-premium.svg";
                              }}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
                                {item.premio.marca}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 truncate leading-tight mt-0.5">
                              {item.premio.nombre}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {item.premio.puntos.toLocaleString()} pts c/u
                            </p>

                            {/* Controles cantidad */}
                            <div className="flex items-center gap-1.5 mt-1">
                              <button
                                type="button"
                                onClick={(e) =>
                                  handleModificarCanjes(e, item.premio.id, item.cantidad - 1)
                                }
                                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer transition"
                                title="Disminuir"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-black text-xs text-slate-800 w-5 text-center">
                                {item.cantidad}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  const stockMax = item.premio.stock ?? 999;
                                  if (item.cantidad < stockMax) {
                                    handleModificarCanjes(e, item.premio.id, item.cantidad + 1);
                                  }
                                }}
                                disabled={
                                  item.premio.stock !== undefined &&
                                  item.cantidad >= item.premio.stock
                                }
                                className="w-6 h-6 rounded-md bg-amber-100 hover:bg-amber-200 disabled:opacity-40 text-amber-800 flex items-center justify-center cursor-pointer transition"
                                title="Aumentar"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Puntos y Eliminar */}
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-xs font-black text-amber-700 font-mono">
                              {totalPuntosItem.toLocaleString()} pts
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleEliminarCanjes(e, item.premio.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Quitar del carrito"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                {/* Footer Canjes */}
                <div className="border-t border-slate-100 p-3 bg-slate-50/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-semibold">Total Puntos:</span>
                    <span className="text-sm font-black text-amber-600 font-mono">
                      {totalPuntosCanjes.toLocaleString()} PTS
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={handleIrAHistorialCanjes}
                      className="w-full h-9 rounded-xl border-slate-300 hover:bg-amber-50 text-slate-700 hover:text-amber-800 font-bold text-xs cursor-pointer"
                    >
                      <span>Mis Canjes</span>
                    </Button>
                    <Button
                      onClick={handleConfirmarCanjes}
                      className="w-full h-9 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black text-xs shadow-md gap-1 cursor-pointer"
                    >
                      <span>Checkout</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
