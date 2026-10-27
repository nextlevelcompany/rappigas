"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  Gift,
  Truck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  MapPin,
  Phone,
  FileText,
  Boxes,
} from "lucide-react";
import {
  ItemCarritoCanje,
  obtenerCarritoCanjes,
  guardarCarritoCanjes,
  actualizarCantidadCarritoCanjes,
  eliminarDelCarritoCanjes,
  vaciarCarritoCanjes,
} from "./carrito-canjes";

interface CarritoCanjesDrawerProps {
  abierto: boolean;
  onCerrar: () => void;
  saldoPuntos: number;
  onPuntosActualizados?: (nuevoSaldo: number) => void;
}

export function CarritoCanjesDrawer({
  abierto,
  onCerrar,
  saldoPuntos,
  onPuntosActualizados,
}: CarritoCanjesDrawerProps) {
  const [items, setItems] = useState<ItemCarritoCanje[]>([]);
  const [procesando, setProcesando] = useState(false);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<{
    idPedido: string;
    canjes: {
      nombre: string;
      codigoCupon: string;
      puntos: number;
      cantidad: number;
    }[];
    totalPuntos: number;
    direccion: string;
  } | null>(null);

  // Formulario de despacho
  const [direccion, setDireccion] = useState("Av. Las Palmeras 1245, Dpto 302, Los Olivos");
  const [telefono, setTelefono] = useState("987654321");
  const [notas, setNotas] = useState("Canje generado desde el catálogo Zeta Premia.");
  const [copiado, setCopiado] = useState(false);

  // Cargar items del carrito
  const cargarItems = () => {
    setItems(obtenerCarritoCanjes());
  };

  useEffect(() => {
    cargarItems();

    const handleSync = () => {
      cargarItems();
    };

    window.addEventListener("carrito_canjes_actualizado", handleSync);
    return () => window.removeEventListener("carrito_canjes_actualizado", handleSync);
  }, []);

  // Totales
  const totalPuntos = useMemo(() => {
    return items.reduce((acc, item) => acc + item.premio.puntos * item.cantidad, 0);
  }, [items]);

  const totalArticulos = useMemo(() => {
    return items.reduce((acc, item) => acc + item.cantidad, 0);
  }, [items]);

  const totalValorSoles = useMemo(() => {
    return items.reduce((acc, item) => acc + item.premio.valorSoles * item.cantidad, 0);
  }, [items]);

  const alcanzanPuntos = saldoPuntos >= totalPuntos;
  const saldoRestante = saldoPuntos - totalPuntos;
  const puntosFaltantes = Math.max(0, totalPuntos - saldoPuntos);

  // Cambiar cantidad
  const handleCambiarCantidad = (premioId: string, nueva: number) => {
    actualizarCantidadCarritoCanjes(premioId, nueva);
    setItems(obtenerCarritoCanjes());
  };

  // Eliminar
  const handleEliminarItem = (premioId: string) => {
    eliminarDelCarritoCanjes(premioId);
    setItems(obtenerCarritoCanjes());
  };

  // Confirmar todo el carrito
  const handleConfirmarTodo = () => {
    if (items.length === 0) return;
    if (!alcanzanPuntos) {
      alert(`Te faltan ${puntosFaltantes} puntos para confirmar todos estos canjes.`);
      return;
    }

    setProcesando(true);
    setTimeout(() => {
      const idMaster = `CNJ-${Date.now().toString().slice(-6)}`;
      const canjesGenerados = items.map((item) => {
        const codigo = `${item.premio.codigoCupon}-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
          id: `CNJ-${Date.now().toString().slice(-6)}-${item.premio.id}`,
          codigoCupon: codigo,
          fecha: new Date().toISOString().replace("T", " ").substring(0, 16),
          cliente: {
            nombre: "Cliente Titular RappiGas",
            documento: "45892147",
            telefono: telefono || "987654321",
            distrito: "Los Olivos",
            direccion: direccion || "Av. Las Palmeras 1245, Dpto 302",
          },
          premio: {
            id: item.premio.id,
            nombre: item.premio.nombre,
            categoria: item.premio.categoria,
            marca: item.premio.marca,
            imagen: item.premio.imagen,
            puntos: item.premio.puntos * item.cantidad,
            valorSoles: item.premio.valorSoles * item.cantidad,
          },
          estado: "EN_CURSO" as const,
          distribuidorAsignado: "Distribuidora Lima Norte (GasExpress)",
          repartidor: "Carlos Mendoza (Moto Torito #04)",
          fechaEntregaEstimada: "Hoy en transcurso de 24 horas",
          observaciones: `${notas} (Cantidad: ${item.cantidad} un)`,
        };
      });

      // Guardar pedidos en el panel administrativo
      try {
        const canjesActualesRaw = localStorage.getItem("rappigas_canjes_pedidos");
        const canjesActuales = canjesActualesRaw ? JSON.parse(canjesActualesRaw) : [];
        localStorage.setItem("rappigas_canjes_pedidos", JSON.stringify([...canjesGenerados, ...canjesActuales]));
        window.dispatchEvent(new Event("nuevo_canje_registrado"));
      } catch (err) {
        console.error("Error al registrar canjes:", err);
      }

      // Descontar puntos
      const nuevoSaldo = Math.max(0, saldoPuntos - totalPuntos);
      if (onPuntosActualizados) {
        onPuntosActualizados(nuevoSaldo);
      }

      // Resumen de éxito
      setPedidoConfirmado({
        idPedido: idMaster,
        canjes: items.map((it, idx) => ({
          nombre: it.premio.nombre,
          codigoCupon: canjesGenerados[idx].codigoCupon,
          puntos: it.premio.puntos * it.cantidad,
          cantidad: it.cantidad,
        })),
        totalPuntos,
        direccion,
      });

      // Limpiar carrito
      vaciarCarritoCanjes();
      setItems([]);
      setProcesando(false);
    }, 700);
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!procesando) {
            setPedidoConfirmado(null);
            onCerrar();
          }
        }}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 text-xs text-slate-800">
          {/* Cabecera del Carrito */}
          <div className="px-4 py-3 bg-[#03246b] text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-400/30">
                <ShoppingBag className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white">Carrito de Canjes</h3>
                <span className="text-[10px] text-slate-300">
                  {totalArticulos} {totalArticulos === 1 ? "artículo" : "artículos"} seleccionados
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setPedidoConfirmado(null);
                onCerrar();
              }}
              className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CUERPO DEL DRAWER */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {pedidoConfirmado ? (
              /* PANTALLA DE ÉXITO: CANJE CONFIRMADO */
              <div className="space-y-4 py-4 text-center animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-black text-[#03246b]">¡Canje Confirmado con Éxito!</h4>
                  <p className="text-[11px] text-slate-500">
                    Tu pedido <strong>#{pedidoConfirmado.idPedido}</strong> ya se encuentra <strong>En Curso</strong> para entrega.
                  </p>
                </div>

                {/* Resumen de Códigos de Cupón */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-left space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Premios y Códigos Generados:
                  </span>
                  {pedidoConfirmado.canjes.map((c, i) => (
                    <div key={i} className="p-2 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#03246b] text-[11px] truncate">{c.nombre}</span>
                        <span className="font-mono font-bold text-orange-600 text-[10px]">
                          {c.puntos} PTS
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-mono font-bold text-slate-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                          {c.codigoCupon}
                        </span>
                        <span className="text-slate-400">Cant: {c.cantidad}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-1 text-[11px]">
                  <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Despacho Programado</span>
                  </span>
                  <p className="text-emerald-700">
                    Dirección: <strong>{pedidoConfirmado.direccion}</strong>
                  </p>
                  <p className="text-[10px] text-emerald-600">
                    Puntos totales canjeados: <strong>{pedidoConfirmado.totalPuntos} PTS</strong>
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <Link
                    href="/cliente/canjes/historial"
                    onClick={() => {
                      setPedidoConfirmado(null);
                      onCerrar();
                    }}
                    className="block w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-xl text-xs transition cursor-pointer text-center shadow-xs"
                  >
                    Ver Detalle en Mis Canjes
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setPedidoConfirmado(null);
                      onCerrar();
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Continuar en la Tienda
                  </button>
                </div>
              </div>
            ) : items.length === 0 ? (
              /* CARRITO VACÍO */
              <div className="py-12 text-center space-y-3 text-slate-400">
                <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-400 flex items-center justify-center mx-auto">
                  <Gift className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-700 text-sm">Tu carrito de canjes está vacío</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Explora el catálogo Zeta Premia y agrega los artículos que deseas canjear con tus puntos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onCerrar}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explorar Premios</span>
                </button>
              </div>
            ) : (
              /* LISTADO DE ITEMS EN EL CARRITO */
              <>
                {/* Balance de Puntos */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-3 border border-orange-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        Tu Saldo Actual
                      </span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        {saldoPuntos.toLocaleString()} PTS
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-orange-600 block">
                        Puntos en Carrito
                      </span>
                      <span className="text-base font-black text-orange-600 font-mono">
                        {totalPuntos.toLocaleString()} PTS
                      </span>
                    </div>
                  </div>

                  {/* Estado de suficiencia */}
                  <div className="pt-1 border-t border-orange-200/60 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-600">Saldo Restante:</span>
                    <span
                      className={`font-mono font-black ${
                        alcanzanPuntos ? "text-emerald-700" : "text-rose-600"
                      }`}
                    >
                      {alcanzanPuntos
                        ? `${saldoRestante.toLocaleString()} PTS disponibles`
                        : `Te faltan ${puntosFaltantes.toLocaleString()} PTS`}
                    </span>
                  </div>
                </div>

                {/* Lista de Premios */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Artículos para Canjear
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("¿Vaciar todo el carrito de canjes?")) {
                          vaciarCarritoCanjes();
                          setItems([]);
                        }
                      }}
                      className="text-[10px] text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
                    >
                      Vaciar carrito
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                    {items.map((item) => (
                      <div
                        key={item.premio.id}
                        className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 hover:bg-slate-100/80 transition"
                      >
                        {/* Imagen */}
                        <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
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
                        <div className="min-w-0 flex-1">
                          <span
                            className="font-bold text-[#03246b] text-[11px] block truncate leading-tight"
                            title={item.premio.nombre}
                          >
                            {item.premio.nombre}
                          </span>
                          <span className="text-[9px] text-slate-400 block font-medium">
                            {item.premio.marca} • Ref: S/ {item.premio.valorSoles.toFixed(2)}
                          </span>
                          <span className="font-mono font-black text-orange-600 text-[10px] block mt-0.5">
                            {(item.premio.puntos * item.cantidad).toLocaleString()} PTS
                          </span>
                        </div>

                        {/* Cantidad [-] [num] [+] */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCambiarCantidad(item.premio.id, item.cantidad - 1)}
                            className="w-5 h-5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-black flex items-center justify-center text-[10px] cursor-pointer"
                          >
                            -
                          </button>
                          <span className="font-mono font-black text-slate-800 text-xs w-4 text-center">
                            {item.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCambiarCantidad(item.premio.id, item.cantidad + 1)}
                            className="w-5 h-5 rounded bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-black flex items-center justify-center text-[10px] cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Quitar */}
                        <button
                          type="button"
                          onClick={() => handleEliminarItem(item.premio.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                          title="Eliminar del carrito"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formulario de Despacho y Entrega */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Datos de Entrega para Despacho
                  </span>

                  <div className="space-y-1.5">
                    <div>
                      <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-orange-500" />
                        Dirección de Destino *
                      </label>
                      <input
                        type="text"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                        className="w-full text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500 font-medium"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <Phone className="w-2.5 h-2.5 text-orange-500" />
                          Teléfono de Contacto *
                        </label>
                        <input
                          type="text"
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value)}
                          className="w-full text-[11px] font-mono px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                          <FileText className="w-2.5 h-2.5 text-orange-500" />
                          Referencia / Notas
                        </label>
                        <input
                          type="text"
                          value={notas}
                          onChange={(e) => setNotas(e.target.value)}
                          placeholder="Ej: Dejar en recepción"
                          className="w-full text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alerta si no alcanzan puntos */}
                {!alcanzanPuntos && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Puntos Insuficientes en tu Billetera</p>
                      <p className="text-[10px] text-rose-600 mt-0.5">
                        Necesitas <strong>{totalPuntos} PTS</strong> y tienes{" "}
                        <strong>{saldoPuntos} PTS</strong>. Reduce cantidades o pide gas para ganar más puntos.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pie con Botón de Confirmación Todo */}
          {!pedidoConfirmado && items.length > 0 && (
            <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Total a canjear:</span>
                <span className="font-mono font-black text-base text-orange-600">
                  {totalPuntos.toLocaleString()} PTS
                </span>
              </div>

              <div className="space-y-1.5">
                <Link
                  href="/cliente/canjes/checkout"
                  onClick={onCerrar}
                  className="block w-full"
                >
                  <button
                    type="button"
                    disabled={!alcanzanPuntos || procesando}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                    <span>Proceder al Checkout de Canjes</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </Link>

                <button
                  type="button"
                  onClick={handleConfirmarTodo}
                  disabled={!alcanzanPuntos || procesando}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-bold text-[11px] rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Gift className={`w-3.5 h-3.5 ${procesando ? "animate-spin" : ""}`} />
                  <span>{procesando ? "Confirmando..." : "Canjear Directo Aquí"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
