'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Flame,
  Scale,
  Building2,
  ArrowRight,
  Send,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

// Canales oficiales de atención
const CANALES_ATENCION = [
  {
    titulo: 'Central Telefónica Directa',
    subtitulo: 'Despacho express a domicilio con balanza digital',
    dato: '977 665 554',
    href: 'tel:977665554',
    accion: 'Llamar Ahora',
    icono: Phone,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200/80',
    badge: 'Atención Inmediata',
    badgeBg: 'bg-orange-100 text-orange-800',
  },
  {
    titulo: 'WhatsApp Oficial 24/7',
    subtitulo: 'Envía tu ubicación GPS para entrega en < 35 min',
    dato: '+51 977 665 554',
    href: 'https://wa.me/51977665554?text=Hola%20RappiGas,%20deseo%20pedir%20un%20balón%20de%20gas%20con%20balanza%20digital',
    accion: 'Chatear por WhatsApp',
    icono: MessageCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200/80',
    badge: 'Respuesta < 1 min',
    badgeBg: 'bg-emerald-100 text-emerald-800',
  },
  {
    titulo: 'Correo de Soporte y Empresas',
    subtitulo: 'Facturación electrónica, contratos y cotizaciones',
    dato: 'contacto@rappigas.pe',
    href: 'mailto:contacto@rappigas.pe',
    accion: 'Enviar Correo',
    icono: Mail,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200/80',
    badge: 'Atención Corporativa',
    badgeBg: 'bg-blue-100 text-blue-800',
  },
  {
    titulo: 'Fiscalización & Registro SCOP',
    subtitulo: 'Empresa formal autorizada por Osinergmin',
    dato: 'RUC 20609876543',
    href: '#fiscalizacion',
    accion: 'RappiGas Perú S.A.C.',
    icono: Building2,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    badge: 'Osinergmin Habilitado',
    badgeBg: 'bg-slate-200 text-slate-800',
  },
];

// Protocolo ante emergencia de gas
const PROTOCOLO_EMERGENCIA = [
  {
    paso: '1',
    titulo: 'No enciendas chispas ni fuego',
    detalle: 'Evita accionar interruptores de luz, timbres, encendedores o artefactos eléctricos.',
  },
  {
    paso: '2',
    titulo: 'Cierra la válvula del balón',
    detalle: 'Gira la perilla a posición cerrada (en Premium Click-On levanta la pestaña de seguridad).',
  },
  {
    paso: '3',
    titulo: 'Ventila el ambiente',
    detalle: 'Abre puertas y ventanas de par en par para permitir que el gas se disipe rápidamente.',
  },
  {
    paso: '4',
    titulo: 'Comunícate de inmediato',
    detalle: 'Llámanos a nuestra central 977 665 554 o a la Central de Bomberos del Perú (116).',
  },
];

export default function ContactoContent() {
  const [formData, setFormData] = useState({
    nombres: '',
    telefono: '',
    tipoConsulta: 'PEDIDO_GAS',
    departamento: 'LIMA',
    distrito: '',
    mensaje: '',
  });

  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviando(true);

    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
    }, 700);
  };

  const handleReset = () => {
    setEnviado(false);
    setFormData({
      nombres: '',
      telefono: '',
      tipoConsulta: 'PEDIDO_GAS',
      departamento: 'LIMA',
      distrito: '',
      mensaje: '',
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[85px] md:pt-[105px] pb-16 space-y-14 font-sans bg-white min-h-screen">
      {/* --------------------------------------------------------------------- */}
      {/* 1. SECCIÓN HERO / ENCABEZADO SIN RECUADROS ENVOLVENTES               */}
      {/* --------------------------------------------------------------------- */}
      <div className="space-y-6 pt-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-black uppercase tracking-wider">
              <Phone className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
              <span>RappiGas • Central de Pedidos & Atención 24/7</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Central de Contacto, Emergencias y Pedidos de Gas
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
              Atención prioritaria para hogares, restaurantes y comercios. Solicita tu balón de gas con{' '}
              <strong className="text-slate-900 font-semibold">balanza digital en tu puerta, delivery gratis en 25 a 35 min</strong> y
              soporte técnico certificado por Osinergmin.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:977665554"
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Llamar al 977 665 554</span>
            </a>
            <a
              href="https://wa.me/51977665554"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp 24/7</span>
            </a>
          </div>
        </div>

        {/* 4 Canales de Atención Directa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CANALES_ATENCION.map((canal, idx) => {
            const Icono = canal.icono;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:bg-white hover:border-orange-300 transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl ${canal.bg} flex items-center justify-center shrink-0`}>
                      <Icono className={`w-5 h-5 ${canal.color}`} />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${canal.badgeBg}`}>
                      {canal.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{canal.titulo}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{canal.subtitulo}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <a
                    href={canal.href}
                    target={canal.href.startsWith('http') ? '_blank' : undefined}
                    rel={canal.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-xs font-bold text-slate-900 hover:text-orange-600 transition flex items-center justify-between"
                  >
                    <span className="font-mono text-sm">{canal.dato}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. FORMULARIO DE CONTACTO / DESPACHO & INFORMACIÓN OPERATIVA          */}
      {/* --------------------------------------------------------------------- */}
      <section className="py-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Columna Izquierda: Información Operativa y Horarios */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-orange-600" />
                <span>Horarios y Cobertura Activa</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Siempre Listos para Despachar tu Balón
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Nuestra red cuenta con distribuidores autorizados en más de 25 departamentos del Perú. Tu pedido
                se asigna automáticamente a la planta o distribuidor certificado más cercano a tu dirección.
              </p>
            </div>

            {/* Tarjetas de Horarios y Soporte */}
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    Despacho de Balones a Domicilio
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    <strong>Lunes a Domingo:</strong> 6:00 a.m. a 11:00 p.m. (incluye feriados).
                  </p>
                  <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                    ✓ Tiempo promedio de entrega: 25 a 35 minutos
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    Pesaje con Balanza Digital en Puerta
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Cada unidad móvil cuenta con balanza digital calibrada para verificar el peso antes de pagar.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    Instalación de Cortesía y Prueba Antifugas
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Conexión segura de válvula (rosca o click-on) y prueba de llama azul 100% gratis.
                  </p>
                </div>
              </div>
            </div>

            {/* Enlace a Cobertura Nacional */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-amber-900">¿Deseas ver todas las plantas en el mapa?</p>
                <p className="text-[11px] text-amber-700">Explora la red nacional de cobertura con GPS interactivo.</p>
              </div>
              <Link
                href="/cobertura"
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0"
              >
                <span>Ver Mapa</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Columna Derecha: Formulario de Contacto */}
          <div className="lg:col-span-7 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900">
                Envíanos un Mensaje o Solicita tu Despacho
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Completa tus datos y un asesor te responderá por teléfono o WhatsApp en menos de 3 minutos.
              </p>
            </div>

            {enviado ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-emerald-950">
                    ¡Solicitud Recibida con Éxito!
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
                    Un asesor de RappiGas te contactará al <strong>+51 {formData.telefono || 'teléfono indicado'}</strong> para
                    coordinar tu despacho express con balanza digital.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Enviar Otro Mensaje</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nombres */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Nombres y Apellidos *
                    </label>
                    <input
                      type="text"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleChange}
                      placeholder="Ej: María Gonzales"
                      required
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Teléfono */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Teléfono de Contacto (WhatsApp) *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-xs font-bold text-slate-600 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl">
                        +51
                      </span>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="977 665 554"
                        maxLength={9}
                        required
                        className="w-full px-3 py-2 text-xs font-medium rounded-r-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tipo de Consulta */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Tipo de Solicitud *
                    </label>
                    <select
                      name="tipoConsulta"
                      value={formData.tipoConsulta}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="PEDIDO_GAS">🔥 Pedido de Balón a Domicilio (Balanza Digital)</option>
                      <option value="CANJE_PUNTOS">🎁 Consulta de Puntos / Canje de Premios</option>
                      <option value="COTIZACION_EMPRESA">🏢 Cotización Comercial / Restaurantes</option>
                      <option value="AFILIACION_DISTRIBUIDOR">🤝 Afiliación como Distribuidor de Gas</option>
                      <option value="SOPORTE_TECNICO">🔧 Soporte Técnico o Fuga de Gas</option>
                    </select>
                  </div>

                  {/* Distrito o Ciudad */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Distrito / Ciudad de Entrega *
                    </label>
                    <input
                      type="text"
                      name="distrito"
                      value={formData.distrito}
                      onChange={handleChange}
                      placeholder="Ej: Los Olivos, Barranca, Trujillo..."
                      required
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Mensaje o Dirección */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Dirección Exacta o Detalle del Pedido *
                  </label>
                  <textarea
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Indícanos tu dirección exacta, referencia de llegada o el tipo de balón que requieres (10kg Rosca, 10kg Premium Click-On, 15kg o 45kg)..."
                    required
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-black text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  <Send className="w-4 h-4" />
                  <span>{enviando ? 'Enviando Solicitud...' : 'Enviar Solicitud Inmediata'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 3. PROTOCOLO DE SEGURIDAD ANTE FUGAS DE GAS                          */}
      {/* --------------------------------------------------------------------- */}
      <section className="space-y-6 pt-4 border-t border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-black uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Seguridad & Prevención en el Hogar</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Protocolo Inmediato ante Olor o Sospecha de Fuga de Gas
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Tu seguridad y la de tu familia es nuestra máxima prioridad. Sigue estos 4 pasos inmediatos si percibes olor a gas en tu cocina:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROTOCOLO_EMERGENCIA.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/70 space-y-2 relative"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center">
                {item.paso}
              </div>
              <h3 className="text-sm font-black text-rose-950">
                {item.titulo}
              </h3>
              <p className="text-xs text-rose-900/80 leading-relaxed">
                {item.detalle}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------------------- */}
      {/* 4. BANNER FINAL DE LLAMADO A LA ACCIÓN (CTA)                          */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 text-white rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1 text-amber-200 text-xs font-black uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>Pide Gas con Balanza Digital en tu Puerta</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            ¿Se te acabó el gas? Pídelo en 30 segundos
          </h3>
          <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
            Llegamos en 20 a 35 minutos con balanza digital, delivery 100% gratis e instalación de cortesía.
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
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
