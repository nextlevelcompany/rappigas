"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Gift,
  MapPin,
  Truck,
  Phone,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  ShoppingBag,
  AlertCircle,
  Copy,
  Check,
  Building2,
  User,
  FileText,
  Ticket,
  Loader2,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ItemCarritoCanje,
  obtenerCarritoCanjes,
  actualizarCantidadCarritoCanjes,
  eliminarDelCarritoCanjes,
  vaciarCarritoCanjes,
  registrarNuevosCanjes,
  CanjePedidoCliente,
  obtenerSaldoPuntosOverride,
  guardarSaldoPuntosOverride,
} from "../carrito-canjes";
import {
  obtenerDireccionGas,
  guardarDireccionGas,
  obtenerEmpresaSeleccionada,
} from "@/librerias/carrito-gas";
import { fidelizacionApi, BilleteraPuntos } from "@/librerias/api/fidelizacion.api";
import { useAuthStore } from "@/store/auth-store";

export default function CanjesCheckoutPage() {
  const router = useRouter();
  const { usuario } = useAuthStore();
  const [isPending, startTransition] = useTransition();

  const [items, setItems] = useState<ItemCarritoCanje[]>([]);
  const [billetera, setBilletera] = useState<BilleteraPuntos | null>(null);
  const [saldoLocal, setSaldoLocal] = useState<number>(1250);

  // Formulario de despacho
  const [nombreTitular, setNombreTitular] = useState("Juan Carlos Pérez Gómez");
  const [documentoDni, setDocumentoDni] = useState("45892147");
  const [telefono, setTelefono] = useState("987654321");
  const [direccionExacta, setDireccionExacta] = useState("Av. Antúnez de Mayolo 1234");
  const [distrito, setDistrito] = useState("Los Olivos");
  const [ciudad, setCiudad] = useState("Lima");
  const [referencia, setReferencia] = useState("A 2 cuadras de la municipalidad");
  const [notas, setNotas] = useState("Canje fidelidad. Verificar precinto y garantía.");
  const [distribuidorAsignado, setDistribuidorAsignado] = useState("Almacén Central RappiGas Lima Norte");

  // Estado de éxito
  const [canjeExitoso, setCanjeExitoso] = useState<{
    idMaster: string;
    canjes: CanjePedidoCliente[];
    totalPuntos: number;
    nuevoSaldo: number;
  } | null>(null);
  const [copiadoIdx, setCopiadoIdx] = useState<number | null>(null);
  const [errorCanje, setErrorCanje] = useState<string | null>(null);

  // Cargar datos iniciales
  useEffect(() => {
    setItems(obtenerCarritoCanjes());

    const dirGuardada = obtenerDireccionGas();
    if (dirGuardada) {
      if (dirGuardada.direccionExacta) setDireccionExacta(dirGuardada.direccionExacta);
      if (dirGuardada.distrito) setDistrito(dirGuardada.distrito);
      if (dirGuardada.ciudad) setCiudad(dirGuardada.ciudad);
      if (dirGuardada.referencia) setReferencia(dirGuardada.referencia);
      if (dirGuardada.telefono) setTelefono(dirGuardada.telefono);
    }

    const empGuardada = obtenerEmpresaSeleccionada();
    if (empGuardada) {
      setDistribuidorAsignado(empGuardada.nombreComercial || empGuardada.razonSocial || "Distribuidora Oficial RappiGas");
    }

    if (usuario) {
      if (usuario.nombres) {
        setNombreTitular(`${usuario.nombres} ${usuario.apellidos || ""}`.trim());
      }
    }

    // Saldo de puntos
    fidelizacionApi.obtenerBilletera().then((b) => {
      setBilletera(b);
      const override = obtenerSaldoPuntosOverride();
      setSaldoLocal(override !== null ? override : b?.saldoPuntos ?? 1250);
    }).catch(() => {
      const override = obtenerSaldoPuntosOverride();
      setSaldoLocal(override !== null ? override : 1250);
    });

    const handleSync = () => {
      setItems(obtenerCarritoCanjes());
    };
    window.addEventListener("carrito_canjes_actualizado", handleSync);
    return () => window.removeEventListener("carrito_canjes_actualizado", handleSync);
  }, [usuario]);

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

  const alcanzanPuntos = saldoLocal >= totalPuntos;
  const saldoRestante = saldoLocal - totalPuntos;
  const puntosFaltantes = Math.max(0, totalPuntos - saldoLocal);

  // Modificar cantidad
  const handleModificarCantidad = (premioId: string, nuevaCant: number) => {
    const act = actualizarCantidadCarritoCanjes(premioId, nuevaCant);
    setItems(act);
  };

  // Eliminar
  const handleEliminarItem = (premioId: string) => {
    const act = eliminarDelCarritoCanjes(premioId);
    setItems(act);
  };

  // Copiar cupón
  const handleCopiarCupon = (codigo: string, idx: number) => {
    navigator.clipboard.writeText(codigo);
    setCopiadoIdx(idx);
    setTimeout(() => setCopiadoIdx(null), 2500);
  };

  // Confirmar Canje
  const handleConfirmarCanje = () => {
    if (items.length === 0) {
      setErrorCanje("No tienes premios seleccionados en tu carrito.");
      return;
    }
    if (!alcanzanPuntos) {
      setErrorCanje(`Puntos insuficientes. Te faltan ${puntosFaltantes.toLocaleString()} puntos para completar este canje.`);
      return;
    }
    if (!direccionExacta.trim()) {
      setErrorCanje("Por favor ingresa la dirección de entrega.");
      return;
    }
    if (!telefono.trim()) {
      setErrorCanje("Por favor ingresa un teléfono de contacto.");
      return;
    }

    startTransition(() => {
      setErrorCanje(null);
      const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
      const idMaster = `CNJ-${Date.now().toString().slice(-6)}`;

      const nuevosCanjes: CanjePedidoCliente[] = items.map((it, idx) => {
        const codigoCupon = `${it.premio.codigoCupon || "PREMIO"}-${Math.floor(1000 + Math.random() * 9000)}`;
        return {
          id: `${idMaster}-${idx + 1}`,
          codigoCupon,
          fecha: timestamp,
          cliente: {
            nombre: nombreTitular,
            documento: documentoDni,
            telefono: telefono,
            distrito: distrito,
            direccion: `${direccionExacta}, ${distrito}, ${ciudad}`,
            email: usuario?.email || "cliente@pidegas.pe",
          },
          premio: {
            id: it.premio.id,
            nombre: it.premio.nombre,
            categoria: it.premio.categoria,
            marca: it.premio.marca,
            imagen: it.premio.imagen,
            puntos: it.premio.puntos * it.cantidad,
            valorSoles: it.premio.valorSoles * it.cantidad,
          },
          estado: "EN_CURSO",
          distribuidorAsignado: distribuidorAsignado,
          repartidor: "Repartidor Express #03 (Asignado)",
          fechaEntregaEstimada: "Entre 24 y 48 horas hábiles",
          observaciones: `${notas} (Cantidad: ${it.cantidad} unidad/es)`,
        };
      });

      // Registrar canjes
      registrarNuevosCanjes(nuevosCanjes);

      // Descontar saldo de puntos
      const nuevoSaldo = Math.max(0, saldoLocal - totalPuntos);
      guardarSaldoPuntosOverride(nuevoSaldo);
      setSaldoLocal(nuevoSaldo);

      // Guardar dirección para futuros pedidos
      guardarDireccionGas({
        direccionExacta,
        distrito,
        ciudad,
        departamento: ciudad,
        referencia,
        telefono,
        notas,
        latitud: -11.9912,
        longitud: -77.0711,
      });

      // Vaciar carrito
      vaciarCarritoCanjes();
      setItems([]);

      setCanjeExitoso({
        idMaster,
        canjes: nuevosCanjes,
        totalPuntos,
        nuevoSaldo,
      });
    });
  };

  // PANTALLA DE ÉXITO
  if (canjeExitoso) {
    return (
      <div className="w-full max-w-3xl mx-auto py-8 px-4 text-slate-800 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-sm animate-in zoom-in-75">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ✓ ¡Canje Confirmado con Éxito!
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
              Tus premios han sido solicitados
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
              Se han descontado <strong>{canjeExitoso.totalPuntos.toLocaleString()} PTS</strong> de tu saldo de fidelidad. Tu nuevo saldo disponible es de <strong>{canjeExitoso.nuevoSaldo.toLocaleString()} PTS</strong>.
            </p>
          </div>

          {/* Cupones y Premios Generados */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 sm:p-5 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-xs font-black text-slate-700 uppercase">
                Premios y Vales Canjeados ({canjeExitoso.canjes.length})
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                Orden #{canjeExitoso.idMaster}
              </span>
            </div>

            <div className="divide-y divide-slate-200/60">
              {canjeExitoso.canjes.map((canje, idx) => (
                <div key={canje.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-1">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={canje.premio.imagen}
                        alt={canje.premio.nombre}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-1.5 py-0.2 rounded">
                        {canje.premio.marca}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                        {canje.premio.nombre}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {canje.premio.puntos.toLocaleString()} PTS • Estado: <strong className="text-blue-700">En Curso</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-mono font-bold text-xs text-slate-800">
                      {canje.codigoCupon}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopiarCupon(canje.codigoCupon, idx)}
                      className="p-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 transition cursor-pointer"
                      title="Copiar cupón"
                    >
                      {copiadoIdx === idx ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <span className="text-slate-500">
                🏢 Despachado por: <strong>{distribuidorAsignado}</strong>
              </span>
              <span className="text-slate-500">
                📍 Entrega en: <strong>{direccionExacta}, {distrito}</strong>
              </span>
            </div>
          </div>

          {/* Botones de acción post-checkout */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/cliente/canjes/historial" className="w-full sm:w-auto">
              <Button className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs sm:text-sm rounded-xl h-11 px-6 shadow-md gap-2 cursor-pointer">
                <FileText className="w-4 h-4" />
                <span>Ver Detalle y Estado en Mis Canjes</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/cliente/canjes" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full font-bold text-xs sm:text-sm rounded-xl h-11 px-5 border-slate-300"
              >
                <span>Volver al Catálogo de Premios</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // SI EL CARRITO ESTÁ VACÍO
  if (items.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <Gift className="w-8 h-8" />
        </div>
        <h2 className="text-base font-black text-slate-900">
          No tienes premios en el carrito de canjes
        </h2>
        <p className="text-xs text-slate-500">
          Explora el catálogo de fidelidad y agrega balones gratis, vales o electrohogar para canjear tus puntos.
        </p>
        <Link href="/cliente/canjes">
          <Button className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-sm px-5 h-10 gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explorar Catálogo de Premios</span>
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
              <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Paso 2 de 2
              </span>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                Checkout de Canjes • Zeta Premia
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirma los datos de entrega y valida el descuento de puntos para solicitar tus premios.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <Link
              href="/cliente/canjes"
              className="flex items-center gap-1.5 text-slate-500 hover:text-amber-600 transition"
            >
              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-black">
                1
              </span>
              <span>Premios</span>
            </Link>
            <span className="text-slate-300">───</span>
            <div className="flex items-center gap-1.5 text-amber-700">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                2
              </span>
              <span>Datos & Confirmación</span>
            </div>
            <span className="text-slate-300">───</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                ✓
              </span>
              <span>Confirmado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cuadrícula de 2 columnas a todo el ancho */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* COLUMNA IZQUIERDA: Saldo y Formulario de Entrega */}
        <div className="lg:col-span-8 xl:col-span-8 2xl:col-span-9 space-y-5">
          {/* Card de Validación de Saldo de Puntos */}
          <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent rounded-2xl border border-amber-200 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                    Billetera de Puntos RappiGas
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xl font-black text-slate-900 font-mono">
                      {saldoLocal.toLocaleString()} PTS
                    </span>
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      Disponibles
                    </span>
                  </div>
                </div>
              </div>

              {/* Comparativa */}
              <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-amber-200/80 text-xs">
                <div className="text-center">
                  <span className="text-slate-500 block text-[10px] font-semibold">A Canjear:</span>
                  <span className="font-mono font-black text-amber-700 text-sm">
                    {totalPuntos.toLocaleString()} PTS
                  </span>
                </div>
                <span className="text-slate-300">→</span>
                <div className="text-center">
                  <span className="text-slate-500 block text-[10px] font-semibold">Saldo Final:</span>
                  <span className={`font-mono font-black text-sm ${alcanzanPuntos ? "text-emerald-700" : "text-red-600"}`}>
                    {saldoRestante.toLocaleString()} PTS
                  </span>
                </div>
              </div>
            </div>

            {!alcanzanPuntos && (
              <div className="mt-3.5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  No cuentas con suficientes puntos para este canje. Te faltan <strong>{puntosFaltantes.toLocaleString()} puntos</strong>. Puedes ajustar las cantidades en el resumen lateral.
                </span>
              </div>
            )}
          </div>

          {/* Formulario de Despacho del Premio */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900">
                    Datos del Destinatario y Lugar de Entrega
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Indica quién recibirá el premio y la dirección de despacho
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nombre Completo del Titular / Receptor *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={nombreTitular}
                    onChange={(e) => setNombreTitular(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  DNI / Documento de Identidad *
                </label>
                <input
                  type="text"
                  value={documentoDni}
                  onChange={(e) => setDocumentoDni(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  Dirección Exacta de Entrega (Calle, Jr., Av. y Número) *
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
                  onChange={(e) => setDistrito(e.target.value)}
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
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">
                  Referencia de Ubicación
                </label>
                <input
                  type="text"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                  placeholder="Ej: A 2 cuadras de la municipalidad, rejas blancas"
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
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Instrucciones Especiales / Notas
                </label>
                <input
                  type="text"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej: Dejar en conserjería o llamar antes de entregar"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Distribuidora / Logística de Entrega */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                  Despacho Oficial de Premios
                </span>
                <h3 className="text-xs sm:text-sm font-black text-slate-900">
                  {distribuidorAsignado}
                </h3>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Tiempo estimado de entrega: <strong>24 a 48 horas hábiles</strong></span>
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" />
              Envío Gratis
            </span>
          </div>
        </div>

        {/* COLUMNA DERECHA: Resumen de Premios y Botón Confirmar */}
        <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 space-y-4 lg:sticky lg:top-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                Resumen del Canje
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {totalArticulos} {totalArticulos === 1 ? "premio" : "premios"}
              </span>
            </div>

            {/* Listado de Premios */}
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 divide-y divide-slate-100">
              {items.map((item) => {
                const subtotalItem = item.premio.puntos * item.cantidad;

                return (
                  <div key={item.premio.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-amber-50/50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                        <img
                          src={item.premio.imagen}
                          alt={item.premio.nombre}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.premio.nombre}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {item.cantidad} × {item.premio.puntos.toLocaleString()} pts
                        </span>

                        {/* Controles de cantidad */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <button
                            type="button"
                            onClick={() => handleModificarCantidad(item.premio.id, item.cantidad - 1)}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="font-mono font-bold text-xs w-4 text-center">
                            {item.cantidad}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleModificarCantidad(item.premio.id, item.cantidad + 1)}
                            className="w-5 h-5 rounded bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-black text-amber-800 font-mono">
                        {subtotalItem.toLocaleString()} pts
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEliminarItem(item.premio.id)}
                        className="text-slate-400 hover:text-red-600 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totales */}
            <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Total Puntos Requeridos:</span>
                <span className="font-mono font-black text-amber-800 text-sm">
                  {totalPuntos.toLocaleString()} PTS
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Valor Comercial Estimado:</span>
                <span className="font-mono font-bold text-slate-700">
                  S/ {totalValorSoles.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Costo de Despacho:</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  GRATIS
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-sm font-black text-slate-900 block leading-tight">
                    Puntos a Descontar
                  </span>
                  <span className="text-[10px] text-slate-400">100% canjeado con fidelidad</span>
                </div>
                <span className="text-xl font-black text-amber-700 font-mono">
                  {totalPuntos.toLocaleString()} pts
                </span>
              </div>
            </div>

            {/* Error si ocurre */}
            {errorCanje && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[11px] font-bold text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{errorCanje}</span>
              </div>
            )}

            {/* Botón de confirmación */}
            <div className="space-y-2 pt-2">
              <Button
                type="button"
                onClick={handleConfirmarCanje}
                disabled={isPending || items.length === 0 || !alcanzanPuntos}
                size="lg"
                className={`w-full font-black text-xs sm:text-sm rounded-xl h-12 shadow-lg gap-2 cursor-pointer transition ${
                  !alcanzanPuntos
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                }`}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirmando Canje...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Confirmar Canje y Descontar Puntos</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>

              <Link href="/cliente/canjes" className="block w-full text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs font-bold text-slate-500 hover:text-amber-700 gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Seguir viendo premios</span>
                </Button>
              </Link>
            </div>

            {/* Sellos de garantía */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-3 text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Garantía Sellada
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-amber-500" />
                Envío Certificado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
