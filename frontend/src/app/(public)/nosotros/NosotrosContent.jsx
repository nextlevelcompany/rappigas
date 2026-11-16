'use client';

import React from 'react';
import Link from 'next/link';
import {
  Flame,
  ShieldCheck,
  Scale,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Phone,
  Sparkles,
  Building2,
  HelpCircle,
  Award,
  Zap,
  Gift,
  CreditCard,
} from 'lucide-react';

// Métricas de impacto y trayectoria
const METRICAS_NOSOTROS = [
  {
    valor: '+10 Años',
    label: 'Trayectoria y Respaldo',
    detalle: 'Experiencia técnica en GLP doméstico e industrial',
    icono: Award,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    borde: 'border-orange-100',
  },
  {
    valor: '100% Pesado',
    label: 'Balanza Digital en Puerta',
    detalle: 'Pesaje verificado delante del cliente antes de pagar',
    icono: Scale,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    borde: 'border-emerald-100',
  },
  {
    valor: '38 Plantas',
    label: 'Distribuidores en Red',
    detalle: 'Red nacional autorizada y fiscalizada por Osinergmin',
    icono: Building2,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    borde: 'border-blue-100',
  },
  {
    valor: '< 35 min',
    label: 'Delivery Express',
    detalle: 'Despacho prioritario con flota propia geolocalizada',
    icono: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    borde: 'border-amber-100',
  },
];

// Pilares de confianza
const PILARES_CONFIANZA = [
  {
    icono: Scale,
    titulo: '1. Pesaje Verificado en Balanza Digital',
    descripcion:
      'Erradicamos la duda del balón con gas incompleto. Cada repartidor lleva una balanza digital calibrada y pesa el cilindro frente a ti en tu puerta. Si el peso no coincide con la tara + contenido, no lo pagas.',
    destacado: 'Comprobación matemática: Peso Bruto - Tara = 10.0 kg exactos',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icono: ShieldCheck,
    titulo: '2. Cilindros y Plantas Oficiales Osinergmin',
    descripcion:
      'Trabajamos únicamente con distribuidores formales y plantas envasadoras certificadas por Osinergmin de las marcas líderes del país: Solgas, Zeta Gas, Primax Gas y Llamagas. Cero cilindros adulterados.',
    destacado: 'Sellos termoformados y precintos de seguridad intactos de fábrica',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icono: Flame,
    titulo: '3. Instalación de Cortesía y Prueba Cero Fugas',
    descripcion:
      'Nuestros técnicos verifican el estado de tu regulador (rosca o click-on Premium) y manguera de alta presión. Realizamos prueba de estanqueidad y comprobamos una combustión con llama azul perfecta.',
    destacado: 'Servicio 100% gratuito de conexión y revisión preventiva',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    icono: Zap,
    titulo: '4. Delivery 100% Gratis & Pago Contraentrega',
    descripcion:
      'Sin costos ocultos por subir a pisos altos ni cobros sorpresa de flete. Pagas recién cuando el balón está instalado y pesado a tu entera satisfacción, eligiendo Yape, Plin, POS o efectivo.',
    destacado: 'Precios justos con boleta o factura electrónica inmediata',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
];

// Marcas y sellos
const MARCAS_RED = [
  {
    nombre: 'Solgas',
    lema: 'Líder histórico del GLP en el Perú',
    norma: 'Osinergmin Reg. 001-GLP',
    color: 'border-orange-500/20 text-orange-700 bg-orange-50/40',
  },
  {
    nombre: 'Zeta Gas',
    lema: 'Válvula Premium Click-On y máxima seguridad',
    norma: 'Osinergmin Reg. 014-GLP',
    color: 'border-blue-500/20 text-blue-700 bg-blue-50/40',
  },
  {
    nombre: 'Primax Gas',
    lema: 'Alto poder calorífico y combustión ultra limpia',
    norma: 'Osinergmin Reg. 028-GLP',
    color: 'border-amber-500/20 text-amber-700 bg-amber-50/40',
  },
  {
    nombre: 'Llamagas',
    lema: 'Rendimiento eficiente para hogares y comercios',
    norma: 'Osinergmin Reg. 009-GLP',
    color: 'border-rose-500/20 text-rose-700 bg-rose-50/40',
  },
];

// FAQs sobre nosotros
const FAQS_NOSOTROS = [
  {
    q: '¿Cómo garantiza RappiGas que el balón trae los 10 kg de gas completos?',
    a: 'Cada cilindro de gas tiene estampada en su asa o base el peso del envase vacío (llamado "Tara", comúnmente entre 10.5 kg y 11.2 kg). Nuestro repartidor coloca el balón en la balanza digital frente a ti: el peso total debe ser la Tara + 10.0 kg exactos de gas. Si el peso no coincide, no pagas el producto.',
  },
  {
    q: '¿Quiénes entregan el gas a mi domicilio?',
    a: 'La entrega la realizan exclusivamente distribuidores y plantas autorizadas con registro vigente en Osinergmin. Cada distribuidor de nuestra red cuenta con RUC formal, unidades de reparto acondicionadas con extintor y personal capacitado en manejo seguro de GLP.',
  },
  {
    q: '¿Por qué el delivery y la instalación son 100% gratis?',
    a: 'Porque creemos en un servicio transparente sin letra chica. No cobramos extras por subir escaleras, por distancia dentro de la zona de cobertura ni por instalar tu regulador. El precio que ves en nuestro catálogo es el precio final que pagas contraentrega.',
  },
  {
    q: '¿Cómo funciona la garantía de seguridad y cambio inmediato?',
    a: 'Si un cilindro presenta alguna anomalía en su válvula o precinto, nuestro repartidor o el centro de atención al cliente coordina el reemplazo inmediato sin costo alguno en un plazo menor a 30 minutos.',
  },
];

export default function NosotrosContent() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[85px] md:pt-[105px] pb-16 space-y-14 font-sans bg-white min-h-screen">
      {/* --------------------------------------------------------------------- */}
      {/* 1. SECCIÓN HERO / ENCABEZADO SIN RECUADROS ENVOLVENTES               */}
      {/* --------------------------------------------------------------------- */}
      <div className="space-y-6 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-black uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
              <span>RappiGas • Historia, Confianza & Sellos Oficiales</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Revolucionando la Entrega de Gas de Cocina en el Perú
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              Nacimos para erradicar el gas con peso incompleto y la informalidad. Conectamos a las familias y
              negocios peruanos con plantas certificadas por Osinergmin mediante{' '}
              <strong className="text-slate-900 font-semibold">pesaje digital en puerta, delivery gratis y atención técnica garantizada</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/productos"
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Truck className="w-4 h-4" />
              <span>Pedir Balón Ahora</span>
            </Link>
            <a
              href="https://wa.me/51977665554"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* 4 Métricas Clave */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {METRICAS_NOSOTROS.map((item, idx) => {
            const Icono = item.icono;
            return (
              <div
                key={idx}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition"
              >
                <div className={`w-11 h-11 rounded-xl ${item.bg} ${item.borde} border flex items-center justify-center shrink-0`}>
                  <Icono className={`w-5 h-5 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                    {item.valor}
                  </div>
                  <div className="text-xs font-bold text-slate-700 truncate">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate hidden sm:block">
                    {item.detalle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. SECCIÓN TRAYECTORIA Y SERVICIO (IMÁGENES LIMPIAS SIN MARCOS)      */}
      {/* --------------------------------------------------------------------- */}
      <section className="py-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Mosaico de las 3 imágenes anteriores libres de recuadros gruesos */}
          <div className="lg:col-span-6 relative">
            <div className="relative min-h-[320px] sm:min-h-[440px] flex items-center justify-center">
              {/* Imagen 1 (Atención técnica - arriba a la izquierda) */}
              <div className="absolute top-0 left-0 w-36 sm:w-56 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg z-20 hover:scale-105 transition-transform duration-300">
                <img
                  src="/assets/img/about/about2-img1.png"
                  alt="Atención técnica de gas de cocina RappiGas"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Imagen 2 (Repartidor con balón - centro) */}
              <div className="w-44 sm:w-72 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl z-10 mx-auto">
                <img
                  src="/assets/img/about/about2-img2.png"
                  alt="Repartidor de gas entregando balón a domicilio con delivery gratis"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Imagen 3 (Pesaje en balanza digital - abajo a la derecha) */}
              <div className="absolute bottom-0 right-0 w-36 sm:w-56 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg z-20 hover:scale-105 transition-transform duration-300">
                <img
                  src="/assets/img/about/about2-img3.png"
                  alt="Pesaje en balanza digital y peso exacto en tu cocina"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Tarjeta Flotante: +10 Años de Experiencia */}
              <div className="absolute top-1 sm:top-3 right-1 sm:right-6 bg-slate-900 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-lg border border-amber-400/40 z-30 flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-3xl font-black text-amber-400 leading-none">
                  +10
                </span>
                <span className="text-[10px] sm:text-xs font-bold leading-tight text-slate-200">
                  Años de<br />Experiencia
                </span>
              </div>
            </div>
          </div>

          {/* Información del Servicio */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-orange-600" />
              <span>Nuestro Servicio Oficial</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              Tu balón de gas de cocina con <span className="text-orange-600">balanza digital, delivery gratis</span> y pago contraentrega
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              En RappiGas modernizamos la compra de gas de cocina para los hogares peruanos. Pide tu balón de 10 kg
              fácilmente desde nuestra web o WhatsApp, recíbelo en tu puerta con{' '}
              <strong className="text-slate-900 font-semibold">delivery 100% gratis en 25 a 35 minutos</strong> y
              comprueba el peso exacto en nuestra balanza digital frente a ti antes de pagar contraentrega (Yape, Plin,
              POS o efectivo). Además, acumulas puntos por cada pedido para canjear increíbles premios.
            </p>

            {/* Barras de Progreso e Indicadores */}
            <div className="space-y-3.5 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-800">
                  <span>Pesaje en Puerta con Balanza Digital (10 kg Exactos)</span>
                  <span className="text-emerald-600 font-mono">100%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-2 rounded-full w-full"></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-800">
                  <span>Delivery Gratis y Puntual a tu Domicilio (&lt; 35 min)</span>
                  <span className="text-orange-600 font-mono">98%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-orange-500 h-2 rounded-full w-[98%]"></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-800">
                  <span>Pagos Flexibles Contraentrega (Yape, Plin, POS o Efectivo)</span>
                  <span className="text-blue-600 font-mono">100%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full w-full"></div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <Link
                href="/productos"
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm"
              >
                <span>Pedir Balón Ahora</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <span className="text-xs text-slate-500 font-medium">
                Sin costo de envío adicional
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 3. SECCIÓN MISIÓN (IMAGEN LIMPIA SIN MARCOS NI CAJAS)                 */}
      {/* --------------------------------------------------------------------- */}
      <section className="py-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Contenido Misión */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-ping"></span>
              <span>Nuestra Misión</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              Gas de cocina honesto, peso completo y <span className="text-orange-600">delivery gratis</span> para tu hogar
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              Nuestra misión es asegurar que cada familia cocine con total tranquilidad. Eliminamos los cobros de
              envío y la duda del peso incompleto: cada balón de gas de cocina se pesa frente a tus ojos en{' '}
              <strong className="text-slate-900 font-semibold">balanza digital</strong> y pagas contraentrega
              únicamente cuando estás completamente conforme.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Delivery 100% Gratis
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Llevamos tu balón de gas directo a tu cocina sin ningún costo de envío adicional ni recargos por piso.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Puntos para Canjear Premios
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Suma puntos en cada compra para canjear por balones gratis, descuentos y premios para tu hogar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Imagen Misión (Familia cocinando limpia y natural) */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src="/assets/img/others/solution-img1.png"
                alt="Familia cocinando con balón de gas seguro RappiGas"
                className="w-full h-auto object-cover hover:scale-102 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 4. SECCIÓN VISIÓN (MOSAICO LIMPIO SIN MARCOS NI CAJAS)                */}
      {/* --------------------------------------------------------------------- */}
      <section className="py-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Mosaico de 3 fotos para Visión */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3">
            <div className="col-span-2 rounded-2xl overflow-hidden shadow-md">
              <img
                src="/assets/img/about/visiton-img1.png"
                alt="Aplicación móvil para pedir gas de cocina"
                className="w-full h-48 sm:h-56 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md">
              <img
                src="/assets/img/about/visiton-img2.png"
                alt="Instalación técnica gratuita y segura"
                className="w-full h-32 sm:h-40 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="rounded-xl overflow-hidden shadow-md">
              <img
                src="/assets/img/about/visiton-img3.png"
                alt="Control de balanza y llama azul"
                className="w-full h-32 sm:h-40 object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Contenido Visión */}
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              <span>Nuestra Visión</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              La plataforma digital líder en venta de <span className="text-orange-600">gas de cocina</span> en el Perú
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed">
              Aspiramos a ser el servicio indispensable en cada cocina peruana: la forma más práctica, rápida y confiable
              de pedir tu balón de gas con beneficios y recompensas reales en cada recarga.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Pagos Seguros Contraentrega
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tú eliges cómo pagar al recibir tu balón: Yape, Plin, tarjeta con POS inalámbrico o efectivo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Instalación y Válvulas Cero Fugas
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Conexión profesional sin costo con comprobación de llama azul limpia para el cuidado de tu familia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 5. NUESTROS 4 PILARES DE SEGURIDAD Y GARANTÍA                        */}
      {/* --------------------------------------------------------------------- */}
      <section className="space-y-6 pt-4 border-t border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
            <span>Nuestros Compromisos Irrenunciables</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Los 4 Pilares que Protegen tu Hogar y tu Bolsillo
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Cada pedido procesado por nuestra plataforma cumple con rigurosos controles de calidad y normativas de seguridad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PILARES_CONFIANZA.map((pilar, idx) => {
            const Icono = pilar.icono;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/70 bg-slate-50/40 hover:bg-slate-50 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl ${pilar.bgColor} flex items-center justify-center shrink-0`}>
                      <Icono className={`w-4 h-4 ${pilar.color}`} />
                    </div>
                    <h3 className="text-sm font-black text-slate-900">
                      {pilar.titulo}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {pilar.descripcion}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/50 flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{pilar.destacado}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 6. MARCAS OFICIALES Y PLANTAS AUTORIZADAS                            */}
      {/* --------------------------------------------------------------------- */}
      <section className="space-y-4 pt-4 border-t border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-orange-600" />
            <span>Marcas Oficiales en Red</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Trabajamos con las Plantas Líderes Certificadas del Perú
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
            Todos nuestros distribuidores asociados operan bajo estricta fiscalización técnica y ambiental de Osinergmin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MARCAS_RED.map((marca, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${marca.color} space-y-2 flex flex-col justify-between`}
            >
              <div>
                <h3 className="font-black text-sm text-slate-900">{marca.nombre}</h3>
                <p className="text-xs text-slate-600">{marca.lema}</p>
              </div>
              <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px] font-bold text-slate-700">
                <span>{marca.norma}</span>
                <span className="text-emerald-600 flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Activo
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 7. PREGUNTAS FRECUENTES SOBRE NOSOTROS (FAQ)                          */}
      {/* --------------------------------------------------------------------- */}
      <section className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-black text-slate-900">
            Preguntas Frecuentes sobre RappiGas y Nuestra Garantía
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS_NOSOTROS.map((faq, idx) => (
            <div key={idx} className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/60 space-y-1.5">
              <h3 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 8. BANNER FINAL DE LLAMADO A LA ACCIÓN (CTA)                          */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1 text-amber-200 text-xs font-black uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>Pide Gas con Balanza Digital en tu Puerta</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            ¿Listo para comprobar el peso exacto en tu cocina?
          </h3>
          <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
            Haz tu pedido ahora mismo. Llegamos en 20 a 35 minutos con balanza digital, delivery 100% gratis e instalación de cortesía.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/productos"
            className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-black text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <Truck className="w-4 h-4 text-orange-600" />
            <span>Pedir Balón de Gas Ahora</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://wa.me/51977665554"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
