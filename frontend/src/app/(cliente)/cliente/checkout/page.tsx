"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  MapPin,
  Truck,
  Phone,
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShoppingBag,
  Sparkles,
  Navigation,
  AlertCircle,
  Loader2,
  Building2,
  Copy,
  Check,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ItemCarritoGas,
  obtenerCarritoGas,
  vaciarCarritoGas,
  obtenerImagenProductoGas,
  obtenerEmpresaSeleccionada,
  guardarEmpresaSeleccionada,
  obtenerCuponGas,
  obtenerDireccionGas,
  guardarDireccionGas,
  obtenerMetodosPagoDistribuidor,
} from "@/librerias/carrito-gas";
import {
  pedidosApi,
  CrearPedidoDto,
  PedidoDetalle,
  MetodoPago,
} from "@/librerias/api/pedidos.api";
import { empresasApi, EmpresaDetalle } from "@/librerias/api/empresas.api";
import { catalogoApi, ProductoDetalle } from "@/librerias/api/catalogo.api";
import { finanzasApi } from "@/librerias/api/finanzas.api";
import { UBIGEO_COORDENADAS_PERU } from "@/librerias/geo-utils";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/librerias/api/auth.api";

export default function CheckoutClientePage() {
  const router = useRouter();
  const { usuario, establecerSesion } = useAuthStore();
  const [isPending, startTransition] = useTransition();

  const [itemsGas, setItemsGas] = useState<ItemCarritoGas[]>([]);
  const [empresa, setEmpresa] = useState<EmpresaDetalle | null>(null);
  const [cupon, setCupon] = useState<any>(null);

  // Datos de entrega
  const [direccionExacta, setDireccionExacta] = useState("Av. Antúnez de Mayolo 1234");
  const [distrito, setDistrito] = useState("Los Olivos");
  const [ciudad, setCiudad] = useState("Lima");
  const [departamento, setDepartamento] = useState("Lima");
  const [referencia, setReferencia] = useState("A 2 cuadras de la municipalidad");
  const [telefono, setTelefono] = useState("987654321");
  const [notas, setNotas] = useState("Balón para cocina, verificar precinto intacto.");
  const [latitud, setLatitud] = useState(-11.9912);
  const [longitud, setLongitud] = useState(-77.0711);
  const [detectandoGps, setDetectandoGps] = useState(false);
  const [mensajeGps, setMensajeGps] = useState<string | null>(null);

  // Método de pago
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("YAPE");
  const [telefonoYape, setTelefonoYape] = useState("977665554");
  const [montoEfectivoPaga, setMontoEfectivoPaga] = useState("100");
  const [codigoOperacionYape, setCodigoOperacionYape] = useState("");
  const [copiadoNumero, setCopiadoNumero] = useState(false);

  // Estados de proceso
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [pedidoConfirmado, setPedidoConfirmado] = useState<PedidoDetalle | null>(null);

  // Métodos de pago configurados por la distribuidora seleccionada
  const metodosPagoDistribuidor = useMemo(() => {
    return obtenerMetodosPagoDistribuidor(empresa);
  }, [empresa]);

  useEffect(() => {
    if (metodosPagoDistribuidor.length > 0 && !metodosPagoDistribuidor.includes(metodoPago)) {
      setMetodoPago(metodosPagoDistribuidor[0]);
    }
  }, [metodosPagoDistribuidor, metodoPago]);

  // Cargar datos del carrito y preferencias guardadas
  useEffect(() => {
    const gas = obtenerCarritoGas();
    const emp = obtenerEmpresaSeleccionada();
    const cup = obtenerCuponGas();
    const dir = obtenerDireccionGas();

    setItemsGas(gas);
    setCupon(cup);

    // Priorizar la distribuidora del carrito para garantizar que el pedido salga exactamente acorde a los productos seleccionados
    if (gas.length > 0 && gas[0].empresaPublicId) {
      empresasApi.listarEmpresasPublicas().then((emps) => {
        const encontrada = emps.find((e) => e.publicId === gas[0].empresaPublicId);
        if (encontrada) {
          setEmpresa(encontrada);
          guardarEmpresaSeleccionada(encontrada);
        } else if (emp) {
          setEmpresa(emp);
        } else if (emps.length > 0) {
          setEmpresa(emps[0]);
        }
      });
    } else if (emp) {
      setEmpresa(emp);
    } else {
      empresasApi.listarEmpresasPublicas().then((emps) => {
        if (emps.length > 0) {
          setEmpresa(emps[0]);
        }
      });
    }

    if (dir) {
      setDireccionExacta(dir.direccionExacta);
      setDistrito(dir.distrito);
      setCiudad(dir.ciudad);
      setDepartamento(dir.departamento);
      setReferencia(dir.referencia);
      setTelefono(dir.telefono);
      setNotas(dir.notas);
      setLatitud(dir.latitud);
      setLongitud(dir.longitud);
    }
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

  const costoEnvio = 0.0;
  const descuento = cupon?.valido ? cupon.descuento : 0.0;
  const totalPagar = Math.max(0, subtotalGas + costoEnvio - descuento);

  // Geolocalización GPS
  const handleDetectarUbicacion = () => {
    if (!navigator.geolocation) {
      setMensajeGps("Tu navegador no soporta geolocalización.");
      return;
    }
    setDetectandoGps(true);
    setMensajeGps(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitud(pos.coords.latitude);
        setLongitud(pos.coords.longitude);
        setMensajeGps("✓ Ubicación GPS detectada con alta precisión.");
        setDetectandoGps(false);
      },
      (err) => {
        setDetectandoGps(false);
        setMensajeGps("No se pudo obtener el GPS: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleCambiarDistrito = (nuevoDistrito: string) => {
    setDistrito(nuevoDistrito);
    const norm = nuevoDistrito.trim().toLowerCase();
    const entry = Object.values(UBIGEO_COORDENADAS_PERU).find(
      (u) => u.nombre.toLowerCase().includes(norm) || norm.includes(u.nombre.toLowerCase())
    );
    if (entry) {
      setLatitud(entry.lat);
      setLongitud(entry.lng);
      setMensajeGps(`✓ Coordenadas vinculadas al distrito de ${entry.nombre}.`);
      setTimeout(() => setMensajeGps(null), 3500);
    }
  };

  // Copiar teléfono Yape
  const handleCopiarYape = () => {
    navigator.clipboard.writeText("977665554");
    setCopiadoNumero(true);
    setTimeout(() => setCopiadoNumero(false), 2000);
  };

  // Confirmar y realizar pedido
  const handleConfirmarPedido = () => {
    if (!empresa) {
      setErrorEnvio("No se ha identificado la distribuidora para el despacho.");
      return;
    }
    if (itemsGas.length === 0) {
      setErrorEnvio("Tu carrito no tiene balones de gas.");
      return;
    }
    if (!direccionExacta.trim()) {
      setErrorEnvio("Por favor ingresa tu dirección exacta de entrega.");
      return;
    }
    if (!telefono.trim()) {
      setErrorEnvio("Por favor ingresa un teléfono de contacto para el repartidor.");
      return;
    }

    startTransition(async () => {
      setErrorEnvio(null);
      try {
        // Asegurar sesión cliente si no está logueado
        if (!usuario || usuario.rol !== "CLIENTE") {
          const authRes = await authApi.login({
            email: "cliente@pidegas.pe",
            password: "ClientePassword123!",
          });
          establecerSesion(authRes);
        }

        const itemsPayload = itemsGas.map((item) => ({
          productoPublicId: item.producto.publicId,
          cantidad: item.cantidad,
        }));

        const direccionFinal = `${direccionExacta.trim()}, ${distrito.trim()}, ${ciudad.trim()}, ${departamento.trim()}`;

        const payload: CrearPedidoDto = {
          empresaPublicId: empresa.publicId,
          direccionEntrega: direccionFinal,
          referenciaDireccion: `${referencia.trim()} (Telf: ${telefono.trim()})`,
          latitud: latitud,
          longitud: longitud,
          metodoPago: metodoPago,
          notasCliente: notas,
          items: itemsPayload,
        };

        const nuevoPed = await pedidosApi.crearPedido(payload);

        // Procesar pago automático si es YAPE, PLIN o TARJETA
        if (metodoPago === "YAPE" || metodoPago === "PLIN" || metodoPago === "TARJETA") {
          try {
            await finanzasApi.procesarPagoCliente({
              pedidoPublicId: nuevoPed.publicId,
              metodoPago: metodoPago,
              telefonoYapePlin: telefonoYape,
              nombreTitular: "Cliente RappiGas",
            });
            nuevoPed.estadoPago = "PAGADO";
          } catch (pagoErr) {
            console.warn("Pago diferido o en proceso:", pagoErr);
          }
        }

        // Guardar dirección para futuros pedidos
        guardarDireccionGas({
          direccionExacta,
          distrito,
          ciudad,
          departamento,
          referencia,
          telefono,
          notas,
          latitud,
          longitud,
        });

        // Limpiar carrito global
        vaciarCarritoGas();
        setItemsGas([]);
        setPedidoConfirmado(nuevoPed);
      } catch (err: any) {
        setErrorEnvio(err.message || "Error al procesar el pedido. Intenta nuevamente.");
      }
    });
  };

  // PANTALLA DE ÉXITO TRAS COMPLETAR CHECKOUT
  if (pedidoConfirmado) {
    return (
      <div className="w-full max-w-2xl mx-auto py-8 px-4 text-slate-800">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-sm animate-in zoom-in-75">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ✓ ¡Pedido Confirmado con Éxito!
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
              Tu balón de gas está en camino
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              La distribuidora <strong className="text-slate-800">{pedidoConfirmado.nombreEmpresa}</strong> ha recibido tu pedido y está preparando el despacho express.
            </p>
          </div>

          {/* Tarjeta con detalles del pedido */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 text-left text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-slate-500 font-semibold">Código de Seguimiento:</span>
              <span className="font-mono font-black text-slate-900 text-sm">
                #{pedidoConfirmado.publicId.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-slate-500 font-semibold">Estado del Pedido:</span>
              <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {pedidoConfirmado.estado}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-slate-500 font-semibold">Dirección de Entrega:</span>
              <span className="font-bold text-slate-800 text-right max-w-[240px] truncate">
                {pedidoConfirmado.direccionEntrega}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-slate-500 font-semibold">Método de Pago:</span>
              <span className="font-bold text-slate-800">
                {pedidoConfirmado.metodoPago} ({pedidoConfirmado.estadoPago})
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-900 font-black text-sm">Total Pagado / A Pagar:</span>
              <span className="font-mono font-black text-orange-600 text-base">
                S/ {pedidoConfirmado.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botones de acción post-checkout */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/cliente/pedidos" className="w-full sm:w-auto">
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-xs sm:text-sm rounded-xl h-11 px-6 shadow-md gap-2">
                <Truck className="w-4 h-4" />
                <span>Ver Seguimiento en Mis Pedidos</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/cliente/tienda" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full font-bold text-xs sm:text-sm rounded-xl h-11 px-5 border-slate-300"
              >
                <span>Hacer otro pedido</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // SI EL CARRITO ESTÁ VACÍO Y NO HAY PEDIDO CONFIRMADO
  if (itemsGas.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-base font-black text-slate-900">
          No tienes balones para realizar checkout
        </h2>
        <p className="text-xs text-slate-500">
          Agrega al menos un balón de gas en la tienda para continuar con el pedido.
        </p>
        <Link href="/cliente/tienda">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl shadow-sm px-5 h-10">
            Ir a la Tienda de Gas
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full py-4 px-3 sm:px-6 lg:px-8 space-y-5 text-slate-800">
      {/* Barra de progreso / Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                Paso 2 de 2
              </span>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                Checkout • Despacho & Pago Seguro
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Completa tu dirección de entrega y confirma el método de pago para recibir tu balón.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <Link
              href="/cliente/carrito"
              className="flex items-center gap-1.5 text-slate-500 hover:text-orange-600 transition"
            >
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black">
                1
              </span>
              <span>Carrito</span>
            </Link>
            <span className="text-slate-300">───</span>
            <div className="flex items-center gap-1.5 text-orange-600">
              <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
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

      {/* Cuadrícula de 2 columnas: Formulario (izquierda) y Resumen (derecha) a todo el ancho */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* COLUMNA IZQUIERDA: Formulario de Despacho y Pago */}
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 space-y-5">
          {/* SECCIÓN 1: DIRECCIÓN DE ENTREGA */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">
                    Dirección de Entrega
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    ¿Dónde deseas recibir tu balón de gas?
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDetectarUbicacion}
                disabled={detectandoGps}
                className="text-xs font-bold text-orange-700 border-orange-300 hover:bg-orange-50 h-8 gap-1.5 cursor-pointer"
              >
                {detectandoGps ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Navigation className="w-3.5 h-3.5" />
                )}
                <span>{detectandoGps ? "Detectando..." : "GPS Actual"}</span>
              </Button>
            </div>

            {mensajeGps && (
              <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{mensajeGps}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  Dirección Exacta (Calle, Jr., Av. y Número) *
                </label>
                <input
                  type="text"
                  value={direccionExacta}
                  onChange={(e) => setDireccionExacta(e.target.value)}
                  placeholder="Ej: Av. Antúnez de Mayolo 1234, Dpto 302"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Distrito *
                </label>
                <input
                  type="text"
                  value={distrito}
                  onChange={(e) => handleCambiarDistrito(e.target.value)}
                  placeholder="Ej: Los Olivos"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ciudad / Provincia
                </label>
                <input
                  type="text"
                  value={ciudad}
                  onChange={(e) => setCiudad(e.target.value)}
                  placeholder="Ej: Lima"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  Referencia de Llegada
                </label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ej: Frente al parque, puerta verde con rejas"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Teléfono / WhatsApp de Contacto *
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="987654321"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Instrucciones para el Repartidor
                </label>
                <input
                  type="text"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej: Tocar timbre 2 veces, balón para cocina"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: DISTRIBUIDORA ASIGNADA */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">
                    Distribuidora Oficial RappiGas
                  </span>
                  <h3 className="text-sm font-black text-slate-900">
                    {empresa?.nombreComercial || itemsGas[0]?.empresaNombre || "Solgas Express"}
                  </h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-orange-600" />
                    <span>Tiempo estimado de despacho: <strong>25 - 40 min</strong></span>
                  </p>
                </div>
              </div>

              <Link href="/cliente/tienda">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-bold rounded-lg border-slate-300 hover:bg-slate-50 text-slate-700"
                >
                  Cambiar
                </Button>
              </Link>
            </div>
          </div>

          {/* SECCIÓN 3: MÉTODO DE PAGO */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                Método de Pago
              </h3>
              <p className="text-[11px] text-slate-400">
                Selecciona cómo deseas pagar tu pedido.
              </p>
            </div>

            {/* Grid de opciones de pago configuradas por el distribuidor */}
            <div
              className={`grid gap-2.5 ${
                metodosPagoDistribuidor.length === 1
                  ? "grid-cols-1"
                  : metodosPagoDistribuidor.length === 2
                  ? "grid-cols-2"
                  : metodosPagoDistribuidor.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-4"
              }`}
            >
              {metodosPagoDistribuidor.includes("YAPE") && (
                <button
                  type="button"
                  onClick={() => setMetodoPago("YAPE")}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    metodoPago === "YAPE"
                      ? "border-purple-600 bg-purple-50/50 ring-1 ring-purple-400"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    Y
                  </div>
                  <span className="text-xs font-black text-slate-800">Yape</span>
                  <span className="text-[10px] text-purple-700 font-bold">QR / Celular</span>
                </button>
              )}

              {metodosPagoDistribuidor.includes("PLIN") && (
                <button
                  type="button"
                  onClick={() => setMetodoPago("PLIN")}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    metodoPago === "PLIN"
                      ? "border-sky-600 bg-sky-50/50 ring-1 ring-sky-400"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center font-black text-xs shadow-xs">
                    P
                  </div>
                  <span className="text-xs font-black text-slate-800">Plin</span>
                  <span className="text-[10px] text-sky-700 font-bold">Sin comisión</span>
                </button>
              )}

              {metodosPagoDistribuidor.includes("EFECTIVO") && (
                <button
                  type="button"
                  onClick={() => setMetodoPago("EFECTIVO")}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    metodoPago === "EFECTIVO"
                      ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-400"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-800">Efectivo</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Contra Entrega</span>
                </button>
              )}

              {metodosPagoDistribuidor.includes("TARJETA") && (
                <button
                  type="button"
                  onClick={() => setMetodoPago("TARJETA")}
                  className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                    metodoPago === "TARJETA"
                      ? "border-orange-600 bg-orange-50/50 ring-1 ring-orange-400"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-xs">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black text-slate-800">POS Tarjeta</span>
                  <span className="text-[10px] text-orange-700 font-bold">Visa / Master</span>
                </button>
              )}
            </div>

            {/* Sub-paneles interactivos por método de pago */}
            {metodoPago === "YAPE" && (
              <div className="bg-purple-50/60 rounded-xl border border-purple-200 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[10px] font-black text-purple-700 uppercase">
                      Número Oficial RappiGas Yape
                    </span>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-base font-black text-purple-950 font-mono">
                        977 665 554
                      </span>
                      <button
                        type="button"
                        onClick={handleCopiarYape}
                        className="text-[11px] font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-2 py-0.5 rounded cursor-pointer transition flex items-center gap-1"
                      >
                        {copiadoNumero ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiadoNumero ? "¡Copiado!" : "Copiar"}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-purple-800">
                      Titular: <strong>RappiGas Perú S.A.C.</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-bold block">Monto a Yapear:</span>
                    <span className="text-lg font-black text-purple-900 font-mono">
                      S/ {totalPagar.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-200/60 text-xs">
                  <div>
                    <label className="font-bold text-purple-950 block mb-1">
                      Tu número de celular Yape:
                    </label>
                    <input
                      type="tel"
                      value={telefonoYape}
                      onChange={(e) => setTelefonoYape(e.target.value)}
                      placeholder="9XXXXXXXX"
                      className="w-full px-3 py-1.5 rounded-lg border border-purple-300 bg-white font-mono font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-purple-950 block mb-1">
                      Código de Operación (Opcional):
                    </label>
                    <input
                      type="text"
                      value={codigoOperacionYape}
                      onChange={(e) => setCodigoOperacionYape(e.target.value)}
                      placeholder="Ej: 123456"
                      className="w-full px-3 py-1.5 rounded-lg border border-purple-300 bg-white font-mono focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {metodoPago === "PLIN" && (
              <div className="bg-sky-50/60 rounded-xl border border-sky-200 p-4 space-y-2 text-xs">
                <span className="text-[10px] font-black text-sky-700 uppercase">
                  Paga con Plin (BBVA, Interbank, Scotiabank, BanBif)
                </span>
                <p className="text-sky-900 font-bold">
                  Transfiere S/ {totalPagar.toFixed(2)} al número <strong>977 665 554</strong> a nombre de <strong>RappiGas Perú</strong>.
                </p>
              </div>
            )}

            {metodoPago === "EFECTIVO" && (
              <div className="bg-emerald-50/60 rounded-xl border border-emerald-200 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950">
                    Pagas en efectivo al recibir tu balón de gas en tu domicilio.
                  </span>
                </div>
                <div>
                  <label className="font-bold text-emerald-900 block mb-1.5">
                    ¿Con cuánto vas a pagar? (Para que el repartidor lleve tu vuelto exacto):
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {["Exacto", "50", "100", "200"].map((opc) => (
                      <button
                        key={opc}
                        type="button"
                        onClick={() => setMontoEfectivoPaga(opc)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                          montoEfectivoPaga === opc
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                            : "bg-white text-emerald-950 border-emerald-300 hover:bg-emerald-100"
                        }`}
                      >
                        {opc === "Exacto" ? "Pago Exacto" : `S/ ${opc}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {metodoPago === "TARJETA" && (
              <div className="bg-orange-50/60 rounded-xl border border-orange-200 p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-orange-950 font-bold">
                  <CreditCard className="w-4 h-4 text-orange-600" />
                  <span>El repartidor llevará el terminal POS móvil inalámbrico a tu puerta.</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Aceptamos todas las tarjetas de débito y crédito: Visa, Mastercard, American Express, Diners Club y contactless.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Resumen de Compra y Botón Confirmar */}
        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 space-y-4 lg:sticky lg:top-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                Tu Pedido
              </h3>
              <Link
                href="/cliente/carrito"
                className="text-xs font-bold text-orange-600 hover:underline"
              >
                Editar carrito
              </Link>
            </div>

            {/* Lista condensada de items */}
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 divide-y divide-slate-100">
              {itemsGas.map((item) => {
                const img = obtenerImagenProductoGas(item.producto);
                return (
                  <div
                    key={item.producto.publicId}
                    className="flex items-center justify-between gap-2.5 pt-2 first:pt-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                        <img
                          src={img}
                          alt={item.producto.nombre}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.producto.nombre}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {item.cantidad} × S/ {item.producto.precio.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-black text-slate-900 font-mono shrink-0">
                      S/ {(item.producto.precio * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Totales */}
            <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal ({totalBalones} balones):</span>
                <span className="font-mono font-bold text-slate-800">
                  S/ {subtotalGas.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Envío Express a Domicilio:</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  GRATIS
                </span>
              </div>

              {descuento > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-bold">
                  <span>Descuento de Cupón ({cupon?.codigo}):</span>
                  <span className="font-mono">- S/ {descuento.toFixed(2)}</span>
                </div>
              )}

              <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-black text-slate-900 block leading-tight">
                    Total a Pagar
                  </span>
                  <span className="text-[10px] text-slate-400">IGV y entrega incluidos</span>
                </div>
                <span className="text-xl font-black text-orange-600 font-mono">
                  S/ {totalPagar.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Error si ocurre */}
            {errorEnvio && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[11px] font-bold text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorEnvio}</span>
              </div>
            )}

            {/* Botón de confirmación */}
            <div className="space-y-2 pt-2">
              <Button
                type="button"
                onClick={handleConfirmarPedido}
                disabled={isPending || itemsGas.length === 0}
                size="lg"
                className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-700 hover:to-amber-700 text-white font-black text-sm rounded-xl h-12 shadow-lg gap-2 cursor-pointer transition"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Procesando Pedido...</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4 text-amber-200" />
                    <span>Confirmar y Realizar Pedido</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <Link href="/cliente/carrito" className="block w-full text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs font-bold text-slate-500 hover:text-orange-600 gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver al Carrito</span>
                </Button>
              </Link>
            </div>

            {/* Sellos de confianza */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-3 text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Compra Protegida
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-orange-500" />
                Despacho Seguro
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
