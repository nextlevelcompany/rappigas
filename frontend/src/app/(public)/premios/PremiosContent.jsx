'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Flame,
  Gift,
  Sparkles,
  Trophy,
  ShieldCheck,
  Scale,
  Coins,
  Ticket,
  Truck,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Crown,
  Phone,
  RefreshCw,
  Award,
  Zap,
  Check,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

// 4 Pasos del programa de fidelidad con imágenes reales
const PASOS_PREMIOS = [
  {
    paso: '1',
    titulo: 'Pide tu Balón de Gas',
    descripcion: 'Pide tu balón de 10kg, 15kg o 45kg por web o WhatsApp. Cada pedido suma puntos automáticos vinculados a tu número celular.',
    imagen: '/products/balon-10kg-premium.png',
    badge: 'Paso 1 • Pedido Express',
    color: 'from-orange-500 to-amber-500',
  },
  {
    paso: '2',
    titulo: 'Pesaje en Balanza Digital',
    descripcion: 'El repartidor pesa el cilindro frente a ti en balanza digital. Al confirmar la entrega del gas neto, los puntos se acreditan al instante.',
    imagen: '/assets/img/about/about2-img3.png',
    badge: 'Paso 2 • Peso Exacto',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    paso: '3',
    titulo: 'Elige tu Premio Favorito',
    descripcion: 'Canjea vales de descuento de S/ 10 y S/ 20, balones de gas gratis o electrohogar (freidoras de aire, licuadoras, ollas a presión).',
    imagen: '/assets/img/hero/premios_rappigas.png',
    badge: 'Paso 3 • Sin Sorteos',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    paso: '4',
    titulo: 'Delivery Gratis en tu Puerta',
    descripcion: 'Coordinamos la entrega de tu premio directo a tu domicilio junto a tu siguiente compra de gas o con despacho programado sin costo.',
    imagen: '/assets/img/others/solution-img1.png',
    badge: 'Paso 4 • Entrega S/ 0',
    color: 'from-emerald-600 to-teal-600',
  },
];

// Cilindros y puntos otorgados
const TABLA_PUNTOS_CILINDROS = [
  {
    id: 'rosca-10kg',
    nombre: 'Balón 10kg Rosca Tradicional',
    detalle: 'Válvula universal • Pesaje en puerta',
    puntos: '+50 PTS',
    imagen: '/products/balon-10kg-rosca.png',
  },
  {
    id: 'clickon-10kg',
    nombre: 'Balón 10kg Premium (Click-On)',
    detalle: 'Acople rápido • Máxima seguridad antifuga',
    puntos: '+60 PTS',
    imagen: '/products/balon-10kg-premium.png',
    destacado: true,
  },
  {
    id: 'comercial-15kg',
    nombre: 'Balón Comercial 15kg',
    detalle: 'Restaurantes, chifas y alta demanda',
    puntos: '+80 PTS',
    imagen: '/products/balon-15kg-premium.png',
  },
  {
    id: 'industrial-45kg',
    nombre: 'Balón Industrial 45kg GLP',
    detalle: 'Baterías industriales y panaderías',
    puntos: '+150 PTS',
    imagen: '/products/balon-45kg-industrial.png',
  },
];

// Niveles de socio
const NIVELES_SOCIO = [
  {
    icono: '🥉',
    nombre: 'Socio Bronce',
    rango: '0 a 300 puntos',
    beneficio: 'Acceso a vales de descuento de S/ 5 y S/ 10 para tu balón de gas.',
    colorTag: 'text-amber-800 bg-amber-50',
  },
  {
    icono: '🥈',
    nombre: 'Socio Plata',
    rango: '301 a 800 puntos',
    beneficio: 'Doble puntaje en fechas especiales y canje de menaje de cocina.',
    colorTag: 'text-slate-800 bg-slate-100',
  },
  {
    icono: '🥇',
    nombre: 'Socio Oro',
    rango: '801 a 1,500 puntos',
    beneficio: 'Balones de 10kg 100% gratis y delivery express prioritario.',
    colorTag: 'text-amber-900 bg-amber-100',
    destacado: true,
  },
  {
    icono: '💎',
    nombre: 'Socio Diamante',
    rango: '+1,500 puntos',
    beneficio: 'Electrodomésticos premium (freidoras de aire, licuadoras) y atención VIP.',
    colorTag: 'text-purple-900 bg-purple-100',
  },
];

// Preguntas frecuentes
const FAQS_PREMIOS = [
  {
    q: '¿Cómo acumulo puntos en RappiGas?',
    a: 'Por cada compra de gas que realizas en la plataforma o por WhatsApp, acumulas puntos de forma automática vinculados a tu número de celular una vez que el repartidor entrega el balón y verifica el peso con la balanza digital.',
  },
  {
    q: '¿Los puntos tienen fecha de caducidad?',
    a: 'Tus puntos no vencen mientras realices al menos un pedido de gas cada 6 meses. ¡Tu saldo se mantiene activo para que puedas juntar y canjear premios grandes!',
  },
  {
    q: '¿El delivery del premio tiene algún costo?',
    a: 'No. La entrega de cualquier premio o vale de descuento es 100% gratuita. Se coordina directamente a tu domicilio junto a tu siguiente compra de gas o con despacho programado.',
  },
  {
    q: '¿Puedo canjear más de un premio a la vez?',
    a: 'Sí, puedes canjear tantos premios como tu saldo de puntos acumulados te permita. Cada canje genera un código único de confirmación.',
  },
];

export default function PremiosContent() {
  const { estaAutenticado, usuario, cargarSesionDesdeStorage } = useAuthStore();

  const [telefonoConsulta, setTelefonoConsulta] = useState('');
  const [resultadoConsulta, setResultadoConsulta] = useState(null);
  const [consultandoPuntos, setConsultandoPuntos] = useState(false);

  useEffect(() => {
    cargarSesionDesdeStorage();
  }, [cargarSesionDesdeStorage]);

  const handleConsultarPuntos = (e) => {
    e.preventDefault();
    const tel = telefonoConsulta.trim().replace(/\s+/g, '');
    if (tel.length < 9) {
      alert('Ingresa un número de celular válido de 9 dígitos.');
      return;
    }

    setConsultandoPuntos(true);
    setTimeout(() => {
      setResultadoConsulta({
        nombre: 'Cliente RappiGas',
        puntos: 280,
        nivel: 'Socio Plata',
      });
      setConsultandoPuntos(false);
    }, 600);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[85px] md:pt-[105px] pb-16 space-y-16 font-sans bg-white min-h-screen">
      {/* --------------------------------------------------------------------- */}
      {/* 1. HERO BANNER PRINCIPAL CON IMAGEN OFICIAL DE PREMIOS               */}
      {/* --------------------------------------------------------------------- */}
      <section className="pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-8 border-b border-slate-100">
          {/* Columna Izquierda: Información del Programa */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-black uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
              <span>RappiGas • Club Oficial de Premios & Rappipuntos</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Pide tu Balón de Gas, <span className="text-orange-600">Acumula Puntos</span> y Canjea Premios Gratis
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
              En RappiGas premiamos tu preferencia en cada recarga. Cada balón entregado con pesaje en balanza digital
              suma puntos directos a tu celular: canjea vales de descuento, gas gratis, ollas, freidoras de aire y
              electrodomésticos sin sorteos.
            </p>

            {/* Píldoras de Ventajas Rápidas */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-800 text-xs font-bold border border-orange-200">
                <Coins className="w-4 h-4 text-orange-600" />
                <span>1 Balón = <strong>+50 a +150 Pts</strong></span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span>Canje Directo sin Sorteos</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-bold border border-emerald-200">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Delivery de Premios 100% Gratis</span>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/productos"
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm"
              >
                <Flame className="w-4 h-4" />
                <span>Pedir Balón y Sumar Puntos</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Imagen Oficial de Premios */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              <img
                src="/assets/img/hero/premios_rappigas.png"
                alt="Catálogo oficial de premios RappiGas electrodomésticos y balones"
                className="w-full h-auto object-contain hover:scale-102 transition-transform duration-300 drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 2. CÓMO FUNCIONA EL CLUB DE PREMIOS (4 PASOS CON IMÁGENES REALES)    */}
      {/* --------------------------------------------------------------------- */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Sistema Transparente de Fidelidad</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ¿Cómo Funciona el Club Rappipuntos?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Acumular y canjear es muy fácil. Conoce los 4 pasos para disfrutar de todos los premios disponibles.
          </p>
        </div>

        {/* Grilla Abierta de los 4 Pasos con Imágenes Reales (Sin recuadros pesados) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PASOS_PREMIOS.map((item, idx) => (
            <div key={idx} className="space-y-3 group flex flex-col justify-between">
              <div className="space-y-3">
                {/* Imagen del Paso */}
                <div className="w-full h-44 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-3 relative shadow-xs">
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black uppercase tracking-wider">
                    {item.badge}
                  </span>
                  <img
                    src={item.imagen}
                    alt={item.titulo}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      {item.paso}
                    </span>
                    <h3 className="font-black text-sm text-slate-900">
                      {item.titulo}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-8">
                    {item.descripcion}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 3. TABLA DE PUNTOS POR CILINDRO & NIVELES DE SOCIO                    */}
      {/* --------------------------------------------------------------------- */}
      <section className="pt-6 border-t border-slate-100 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Columna Izquierda: Cilindros que Suman Puntos */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black uppercase tracking-wider">
                <Coins className="w-3.5 h-3.5 text-orange-600" />
                <span>Puntos por Cilindro</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                ¿Cuántos Puntos Suma Cada Balón?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Los puntos se acreditan inmediatamente a tu número telefónico tras verificar el pesaje en puerta.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {TABLA_PUNTOS_CILINDROS.map((cilindro) => (
                <div
                  key={cilindro.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-14 bg-white rounded-xl p-1 flex items-center justify-center shrink-0 shadow-2xs">
                      <img
                        src={cilindro.imagen}
                        alt={cilindro.nombre}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-xs sm:text-sm text-slate-900 truncate">
                        {cilindro.nombre}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {cilindro.detalle}
                      </p>
                    </div>
                  </div>

                  <span className="font-black text-orange-600 font-mono text-xs sm:text-sm bg-orange-100/70 px-3 py-1 rounded-xl shrink-0">
                    {cilindro.puntos}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Niveles de Socio */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>Escala de Beneficios</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Niveles del Club Rappipuntos
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                A más compras acumuladas en los últimos 6 meses, mayores beneficios y premios exclusivos desbloqueas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {NIVELES_SOCIO.map((nivel, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                      <span>{nivel.icono}</span>
                      <span>{nivel.nombre}</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 font-mono">
                      {nivel.rango}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {nivel.beneficio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 4. CONSULTA DE SALDO EN VIVO (DISEÑO LIMPIO Y DIRECTO)                */}
      {/* --------------------------------------------------------------------- */}
      <section className="pt-4 border-t border-slate-100">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          {estaAutenticado && usuario ? (
            <div className="flex items-center justify-between w-full flex-wrap gap-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Crown className="w-4 h-4" />
                  <span>Sesión Activa</span>
                </span>
                <h3 className="text-xl font-black text-white">
                  ¡Hola, {usuario.nombres}! Tu cuenta suma puntos en cada pedido
                </h3>
                <p className="text-xs text-slate-300">
                  Consulta tus canjes disponibles o solicita tu próximo balón de gas a domicilio.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/cliente/canjes"
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Gift className="w-4 h-4" />
                  <span>Ver Mis Canjes</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-6">
              <div className="space-y-1 text-center lg:text-left">
                <span className="text-xs font-bold text-amber-400 flex items-center justify-center lg:justify-start gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Consulta Rápida de Saldo</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  ¿Cuántos puntos tienes con tu número de celular?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  Ingresa tu teléfono celular para verificar tu puntaje acumulado en segundos sin contraseña.
                </p>
              </div>

              <form onSubmit={handleConsultarPuntos} className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    maxLength={9}
                    value={telefonoConsulta}
                    onChange={(e) => setTelefonoConsulta(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ej. 977665554"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-mono rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:outline-hidden focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={consultandoPuntos || telefonoConsulta.length < 9}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {consultandoPuntos ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
                  <span>Consultar Puntos</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Resultado de Consulta si existe */}
        {resultadoConsulta && (
          <div className="p-4 mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-slate-900">
                  Línea {telefonoConsulta} tiene <strong className="text-emerald-700 font-mono text-sm">+{resultadoConsulta.puntos} PUNTOS</strong>
                </p>
                <span className="text-[11px] text-slate-600">
                  Nivel actual: <strong>{resultadoConsulta.nivel}</strong> • Tienes puntos listos para canjear vales y premios.
                </span>
              </div>
            </div>

            <Link
              href="/auth/login?redirect=/cliente/canjes"
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <span>Canjear Ahora</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 5. PREGUNTAS FRECUENTES (FAQ)                                         */}
      {/* --------------------------------------------------------------------- */}
      <section className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-black text-slate-900">
            Preguntas Frecuentes sobre los Rappipuntos
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS_PREMIOS.map((faq, idx) => (
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
      {/* 6. BANNER FINAL DE LLAMADO A LA ACCIÓN (CTA)                          */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1 text-amber-200 text-xs font-black uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>Pide Gas con Balanza Digital en tu Puerta</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            ¿Listo para sumar tus primeros puntos?
          </h3>
          <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
            Pide tu balón de gas ahora mismo. Llegamos en 20 a 35 minutos con balanza digital en puerta y delivery 100% gratis.
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
        </div>
      </div>
    </div>
  );
}
