"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/publico/public-navbar";
import { PublicFooter } from "@/components/publico/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  ShieldCheck,
  Truck,
  Scale,
  CreditCard,
  QrCode,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  Store,
  PhoneCall,
  Lock,
  ThumbsUp,
} from "lucide-react";

export default function HomePage() {
  const [balonSeleccionado, setBalonSeleccionado] = useState<string>("10KG");
  const [valvulaSeleccionada, setValvulaSeleccionada] = useState<string>("PREMIUM");
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<string>("Los Olivos");

  const DISTRITOS_COBERTURA = [
    { nombre: "Los Olivos", tiempo: "25-35 min", distribuidoras: 8, estado: "Disponible" },
    { nombre: "San Martín de Porres", tiempo: "30-40 min", distribuidoras: 11, estado: "Disponible" },
    { nombre: "Comas", tiempo: "25-35 min", distribuidoras: 7, estado: "Disponible" },
    { nombre: "Independencia", tiempo: "30-45 min", distribuidoras: 5, estado: "Disponible" },
    { nombre: "Miraflores", tiempo: "20-30 min", distribuidoras: 6, estado: "Disponible" },
    { nombre: "San Isidro", tiempo: "20-30 min", distribuidoras: 5, estado: "Disponible" },
    { nombre: "Santiago de Surco", tiempo: "25-40 min", distribuidoras: 9, estado: "Disponible" },
    { nombre: "Callao Cercado", tiempo: "30-45 min", distribuidoras: 6, estado: "Disponible" },
    { nombre: "San Miguel / Pueblo Libre", tiempo: "25-35 min", distribuidoras: 7, estado: "Disponible" },
  ];

  const infoDistrito = DISTRITOS_COBERTURA.find((d) => d.nombre === distritoSeleccionado) || DISTRITOS_COBERTURA[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      <PublicNavbar />

      <main className="flex-1 pt-20">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-800/80 bg-linear-to-b from-slate-950 via-slate-900 to-slate-950">
          {/* Luces de fondo ambientales */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-orange-600/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Columna Izquierda: Mensaje & Propuesta de Valor */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-950/80 border border-orange-500/40 text-orange-400 text-xs font-semibold shadow-inner">
                  <ShieldCheck className="w-4 h-4 text-orange-400" />
                  <span>Distribución 100% Formal y Fiscalizada por OSINERGMIN</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                  El gas de tu cocina en minutos, con{" "}
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 via-amber-400 to-orange-500">
                    peso exacto y máxima seguridad
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  Pide balones de gas de cocina de 10kg, 15kg o 45kg con balanza digital en puerta, precinto intacto de planta y pago fácil con Yape, Plin o Tarjeta.
                </p>

                {/* Badges de Beneficios Rápidos */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
                    <Scale className="w-4 h-4 text-amber-400" />
                    <span>Pesaje verificado en tu presencia</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Válvula Click-On autobloqueante</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
                    <QrCode className="w-4 h-4 text-blue-400" />
                    <span>Confirmación PIN seguro</span>
                  </div>
                </div>

                {/* Acciones del Hero */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Button
                    size="lg"
                    asChild
                    className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 text-white font-bold text-base px-8 h-13 shadow-xl shadow-orange-600/30 transition-all hover:scale-[1.02]"
                  >
                    <Link href="/cliente/tienda">
                      <Flame className="w-5 h-5 mr-2" />
                      Pedir Gas al Instante
                    </Link>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-base font-semibold h-13"
                  >
                    <Link href="/productos">
                      Ver Catálogo y Tarifas
                      <ArrowRight className="w-4 h-4 ml-2 text-slate-400" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Columna Derecha: Tarjeta Interactiva de Pedido Rápido */}
              <div className="lg:col-span-5">
                <Card className="bg-slate-900/90 border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-orange-500 to-amber-400" />
                  
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <Flame className="w-5 h-5 text-orange-500" />
                          Cotizador Rápido de Balón
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Tarifa estimada para entrega inmediata a domicilio
                        </p>
                      </div>
                      <Badge className="bg-emerald-950 text-emerald-300 border-emerald-800 text-[11px] font-bold">
                        Stock Activo
                      </Badge>
                    </div>

                    {/* Selector de Capacidad */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        1. Capacidad del Balón
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "10KG", label: "10 KG", desc: "Doméstico", precio: "S/ 48.00" },
                          { id: "15KG", label: "15 KG", desc: "Familiar", precio: "S/ 72.00" },
                          { id: "45KG", label: "45 KG", desc: "Comercial", precio: "S/ 215.00" },
                        ].map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setBalonSeleccionado(b.id)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              balonSeleccionado === b.id
                                ? "border-orange-500 bg-orange-950/40 text-white shadow-md shadow-orange-500/10"
                                : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                            }`}
                          >
                            <span className="block text-sm font-bold text-white">{b.label}</span>
                            <span className="block text-[11px] text-slate-400">{b.desc}</span>
                            <span className="block text-xs font-semibold text-orange-400 mt-1">{b.precio}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Selector de Válvula */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        2. Tipo de Válvula de tu Cocina
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setValvulaSeleccionada("PREMIUM")}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            valvulaSeleccionada === "PREMIUM"
                              ? "border-orange-500 bg-orange-950/40 text-white shadow-md shadow-orange-500/10"
                              : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">Click-On (Premium)</span>
                            <Badge className="bg-amber-500/20 text-amber-300 border-none text-[9px] px-1 py-0 font-bold">
                              Recomendada
                            </Badge>
                          </div>
                          <span className="block text-[11px] text-slate-400 mt-0.5">
                            Acople rápido con autobloqueo de fuga
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setValvulaSeleccionada("ROSCA")}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            valvulaSeleccionada === "ROSCA"
                              ? "border-orange-500 bg-orange-950/40 text-white shadow-md shadow-orange-500/10"
                              : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          <span className="block text-xs font-bold text-white">Rosca Tradicional</span>
                          <span className="block text-[11px] text-slate-400 mt-0.5">
                            Conexión manual estándar a perilla
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Resumen & Botón de Pedido */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Tiempo estimado de llegada:</span>
                        <span className="font-semibold text-emerald-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> 25 a 35 minutos
                        </span>
                      </div>

                      <Button
                        asChild
                        className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold h-12 text-sm shadow-lg shadow-orange-600/30"
                      >
                        <Link href="/cliente/tienda">
                          Solicitar Balón {balonSeleccionado} Ahora
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                      
                      <p className="text-[11px] text-center text-slate-500">
                        Aceptamos Yape, Plin, Tarjeta Débito/Crédito y Efectivo al recibir.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </section>

        {/* SECCIÓN COBERTURA Y DISTRIBUIDORAS CERCANAS */}
        <section className="py-16 bg-slate-900/60 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
              <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-semibold">
                Cobertura Inmediata
              </Badge>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                ¿Dónde comprar gas? Encuentra tu distribuidora más cercana
              </h2>
              <p className="text-sm text-slate-400">
                PideGas conecta tu domicilio con camiones y distribuidoras formales con inventario certificado y despacho en tiempo real.
              </p>
            </div>

            {/* Selector de Distrito y Tarjeta de Cobertura */}
            <div className="max-w-4xl mx-auto bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-950 text-orange-400 flex items-center justify-center shrink-0 border border-orange-800/60">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Selecciona tu distrito:</h3>
                    <p className="text-xs text-slate-400">Consulta tiempos de entrega y camiones disponibles</p>
                  </div>
                </div>

                <select
                  value={distritoSeleccionado}
                  onChange={(e) => setDistritoSeleccionado(e.target.value)}
                  className="w-full sm:w-64 text-sm bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {DISTRITOS_COBERTURA.map((d) => (
                    <option key={d.nombre} value={d.nombre}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-center sm:text-left">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Distrito Seleccionado</p>
                  <p className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    {infoDistrito.nombre}
                  </p>
                  <span className="inline-block text-[11px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    {infoDistrito.estado}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Tiempo Promedio</p>
                  <p className="text-lg font-bold text-amber-400 flex items-center justify-center sm:justify-start gap-1.5">
                    <Clock className="w-4 h-4" />
                    {infoDistrito.tiempo}
                  </p>
                  <p className="text-xs text-slate-400">Despacho con repartidor asignado</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Distribuidoras Aliadas</p>
                  <p className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                    <Truck className="w-4 h-4 text-blue-400" />
                    {infoDistrito.distribuidoras} unidades en ruta
                  </p>
                  <p className="text-xs text-slate-400">Balones inspeccionados y sellados</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-400 text-center sm:text-left">
                  ¿Vives en una zona no listada? Seguimos expandiendo nuestra red semanalmente a todo Lima y Callao.
                </p>
                <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-500 text-white font-bold shrink-0">
                  <Link href="/cliente/tienda">
                    Pedir Balón en {distritoSeleccionado}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA EN 3 PASOS */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold">
              Proceso Transparente
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Pedir gas nunca fue tan fácil y seguro
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">
              Diseñado para amas de casa, negocios gastronómicos y familias que exigen peso cabal y puntualidad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Paso 1 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-4 hover:border-slate-700 transition">
              <div className="w-14 h-14 rounded-2xl bg-orange-600/20 text-orange-400 flex items-center justify-center font-black text-2xl border border-orange-500/30">
                1
              </div>
              <h3 className="text-xl font-bold text-white">Elige tu Balón y Válvula</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Selecciona entre 10kg, 15kg o 45kg y especifica tu tipo de válvula (Click-On o Rosca). Puedes aplicar cupones de descuento y acumular puntos de fidelidad.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-4 hover:border-slate-700 transition">
              <div className="w-14 h-14 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-black text-2xl border border-amber-500/30">
                2
              </div>
              <h3 className="text-xl font-bold text-white">Despacho con Pesaje en Puerta</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                El repartidor llega a tu puerta con el balón precintado. Si lo solicitas, verificamos el peso neto en balanza calibrada para garantizar que recibes lo que pagas.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-4 hover:border-slate-700 transition">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-black text-2xl border border-emerald-500/30">
                3
              </div>
              <h3 className="text-xl font-bold text-white">Pago Digital y PIN Seguro</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Pagas cómodamente con Yape, Plin, Tarjeta o Efectivo. Confirmas la entrega mediante un código PIN único de 4 dígitos para tu total tranquilidad.
              </p>
            </div>
          </div>
        </section>

        {/* BENEFICIOS Y SEGURIDAD NORMATIVA */}
        <section className="py-20 bg-slate-900/40 border-y border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                  Compromiso con tu Seguridad
                </Badge>
                
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  Tolerancia cero con el gas adulterado y cilindros peligrosos
                </h2>

                <p className="text-slate-300 text-sm leading-relaxed">
                  En el mercado informal abundan balones con corrosión oculta, válvulas defectuosas y pesos incompletos. En PideGas, cada distribuidora afiliada cumple con protocolos estrictos:
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-800">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Precinto de Planta Inviolable</h4>
                      <p className="text-xs text-slate-400">Garantía de que el cilindro proviene directamente de plantas envasadoras autorizadas.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-800">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Inspección de Tara y Fuga con Detector</h4>
                      <p className="text-xs text-slate-400">Verificamos el peso del cilindro vacío (tara) y realizamos prueba rápida de hermeticidad.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-800">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Repartidores Capacitados en Balones de Cocina</h4>
                      <p className="text-xs text-slate-400">Personal entrenado en manipulación segura y correcta instalación de reguladores.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button asChild className="bg-orange-600 hover:bg-orange-500 text-white font-bold">
                    <Link href="/nosotros">
                      Conocer Más Sobre Nuestro Compromiso
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Tarjetas Visuales de Atributos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-slate-950 border-slate-800 p-6 space-y-3">
                  <Scale className="w-8 h-8 text-amber-400" />
                  <h3 className="font-bold text-white text-base">Peso Exacto</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Pesamos tu balón con balanza digital calibrada. Si le falta gas, te cambiamos el cilindro sin costo.
                  </p>
                </Card>

                <Card className="bg-slate-950 border-slate-800 p-6 space-y-3">
                  <CreditCard className="w-8 h-8 text-emerald-400" />
                  <h3 className="font-bold text-white text-base">Yape, Plin y Tarjetas</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Olvídate de buscar sencillo o cambio. Todos nuestros repartidores aceptan pagos digitales en tu puerta.
                  </p>
                </Card>

                <Card className="bg-slate-950 border-slate-800 p-6 space-y-3">
                  <Sparkles className="w-8 h-8 text-blue-400" />
                  <h3 className="font-bold text-white text-base">Puntos de Recompensa</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Cada compra acumula puntos en tu billetera digital PideGas, canjeables por soles de descuento en tus próximos pedidos.
                  </p>
                </Card>

                <Card className="bg-slate-950 border-slate-800 p-6 space-y-3">
                  <ShieldCheck className="w-8 h-8 text-orange-400" />
                  <h3 className="font-bold text-white text-base">Garantía Total</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Canal directo de soporte e incidencias para reemplazar cualquier válvula o balón ante el menor inconveniente.
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* SECCIÓN B2B: PARA DISTRIBUIDORAS Y DUEÑOS DE NEGOCIO */}
        <section className="py-20 relative overflow-hidden bg-linear-to-b from-slate-950 to-orange-950/20 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-linear-to-r from-orange-900/50 via-slate-900 to-slate-950 border border-orange-500/30 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
              <div className="max-w-3xl space-y-6 relative z-10">
                <Badge className="bg-orange-500 text-white font-bold text-xs uppercase tracking-wider">
                  Para Dueños de Negocio
                </Badge>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  ¿Tienes una distribuidora de gas o camión de reparto?
                </h2>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                  Únete a la red PideGas y recibe pedidos geolocalizados de clientes en tu distrito. Obtén un panel de control completo con tablero Kanban en tiempo real, gestión de inventario, flota de choferes y conciliación automática de pagos.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 pt-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>Control de Kardex: Balones llenos vs vacíos prestados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>Telemetría GPS y confirmación con código PIN</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>Reportes financieros y exportación a Excel / PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>Liquidaciones bancarias transparentes (comisión 5%)</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                  <Button
                    size="lg"
                    asChild
                    className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 text-white font-bold text-base px-8 h-13 shadow-xl shadow-orange-600/30"
                  >
                    <Link href="/auth/registro-empresa">
                      <Store className="w-5 h-5 mr-2" />
                      Afiliar mi Distribuidora Ahora
                    </Link>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-base"
                  >
                    <Link href="/contacto">
                      Contactar con Asesor Comercial
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PREGUNTAS FRECUENTES (FAQ) */}
        <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <Badge className="bg-slate-800 text-slate-300 text-xs font-semibold">
              Preguntas Frecuentes
            </Badge>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Resolvemos tus dudas sobre el servicio
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "¿Qué diferencia hay entre la válvula Click-On y la válvula a Rosca?",
                a: "La válvula Click-On (Premium) cuenta con un mecanismo de acople rápido que se conecta a presión y dispone de autobloqueo térmico automático en caso de fuga o corte de manguera. La válvula a Rosca es la tradicional que se enrosca con perilla manual.",
              },
              {
                q: "¿Cómo sé si el balón contiene los kilogramos exactos de gas?",
                a: "Nuestros repartidores cuentan con balanzas certificadas. Puedes solicitarle el pesaje en puerta antes de recibir el cilindro: el peso total debe ser igual al peso de la tara grabada en el collarín del balón más los 10kg, 15kg o 45kg de gas neto.",
              },
              {
                q: "¿Qué medios de pago puedo utilizar?",
                a: "Puedes abonar con Yape o Plin escaneando el código QR del repartidor, con tarjeta de débito o crédito mediante POS móvil, o en efectivo contra entrega.",
              },
              {
                q: "¿Qué debo hacer si sospecho de una fuga de gas en mi cocina?",
                a: "Cierra de inmediato la perilla del regulador de gas, ventila el ambiente abriendo puertas y ventanas, no enciendas luces ni fósforos, y llámanos a nuestra línea de emergencia o al 116 de los Bomberos del Perú.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-2">
                <h4 className="font-bold text-white text-base flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-orange-400 shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 pl-6 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}