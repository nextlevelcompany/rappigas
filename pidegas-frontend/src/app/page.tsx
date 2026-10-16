"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  Store,
  PhoneCall,
  Lock,
  ThumbsUp,
  Star,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Award,
  Zap,
  Percent,
  Calendar,
  AlertTriangle,
  UserCheck,
  BadgeCheck,
  Send,
  MessageCircle,
  Eye,
  Heart,
  Share2,
  Menu,
  X,
  FileText,
  Search,
  Navigation,
} from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";

export default function HomePage() {
  const router = useRouter();
  const [busquedaDireccion, setBusquedaDireccion] = useState("");

  // Estados para el Slider con Efecto y Fondos (main-slider de Mediplace index2.html)
  const [slideActivo, setSlideActivo] = useState(0);
  const [autoPlayPausado, setAutoPlayPausado] = useState(false);

  // Estados para selectores interactivos
  const [servicioActivo, setServicioActivo] = useState<number>(0);
  const [preguntaAbierta, setPreguntaAbierta] = useState<number | null>(0);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  // Slides del Hero Slider con imágenes de fondo de Mediplace
  const SLIDES_HERO = [
    {
      bg: "/mediplace/images/backgrounds/slider-1-1.jpg",
      tagline: "Distribución Autorizada • Código SCOP OSINERGMIN",
      tituloL1: "Pide tu Balón de Gas",
      tituloHighlight: "Peso Exacto",
      tituloL2: "en Balanza",
      conPillImg: true,
      descripcion:
        "Garantizamos que tu balón de gas llegue en 25 a 35 minutos con balanza digital contrastada en tu puerta. Llama azul de alta eficiencia y pago con Yape, Plin o Tarjeta.",
      imgPrincipal: "/mediplace/images/resources/main-slider-1-1.jpg",
      imgSecundaria: "/mediplace/images/resources/main-slider-1-2.jpg",
      clientesCount: "25k+",
      clientesTexto: "Hogares Felices",
      selloBadge: "Balanza Digital en Puerta",
    },
    {
      bg: "/mediplace/images/backgrounds/slider-1-2.jpg",
      tagline: "Válvulas Click-On con Seguro Térmico Automático",
      tituloL1: "Máxima Seguridad",
      tituloHighlight: "Cero Fugas",
      tituloL2: "en tu Cocina",
      conPillImg: false,
      descripcion:
        "Tecnología de acople rápido sin herramientas. Bloqueo térmico automático en caso de calor extremo o rotura accidental de manguera para proteger a tu familia.",
      imgPrincipal: "/mediplace/images/resources/main-slider-1-3.jpg",
      imgSecundaria: "/mediplace/images/resources/main-slider-1-4.jpg",
      clientesCount: "18k+",
      clientesTexto: "Familias Protegidas",
      selloBadge: "Autobloqueo Térmico",
    },
    {
      bg: "/mediplace/images/backgrounds/slider-1-3.jpg",
      tagline: "Despacho Express Inteligente por GPS",
      tituloL1: "Tu Balón en Casa",
      tituloHighlight: "en 30 Minutos",
      tituloL2: "Garantizados",
      conPillImg: false,
      descripcion:
        "Flota geolocalizada en tiempo real por cada distrito de Lima Metropolitana. Asignación inmediata al chofer más cercano con cilindro sellado y precinto oficial.",
      imgPrincipal: "/mediplace/images/resources/main-slider-1-5.jpg",
      imgSecundaria: "/mediplace/images/resources/main-slider-1-6.jpg",
      clientesCount: "30k+",
      clientesTexto: "Entregas Puntuales",
      selloBadge: "Despacho GPS en Vivo",
    },
  ];

  // Auto-play del slider cada 6 segundos
  useEffect(() => {
    if (autoPlayPausado) return;
    const intervalo = setInterval(() => {
      setSlideActivo((prev) => (prev + 1) % SLIDES_HERO.length);
    }, 6000);
    return () => clearInterval(intervalo);
  }, [autoPlayPausado, SLIDES_HERO.length]);

  const slideAnterior = () => {
    setSlideActivo((prev) => (prev === 0 ? SLIDES_HERO.length - 1 : prev - 1));
  };

  const slideSiguiente = () => {
    setSlideActivo((prev) => (prev + 1) % SLIDES_HERO.length);
  };

  // Lista de servicios interactivos (Services Two de Mediplace)
  const SERVICIOS = [
    {
      num: "01",
      titulo: "Balón Doméstico 10kg Premium (Click-On)",
      descripcion:
        "Válvula de acople rápido con seguro térmico antibloqueo. Balanza digital contrastada en tu puerta con precinto sellado de planta.",
      precio: "S/ 48.00",
      tara: "Tara: 10.2 kg | Peso Neto: 10.0 kg GLP",
      img: "/mediplace/images/services/services-2-1.jpg",
      badge: "Más Vendido",
    },
    {
      num: "02",
      titulo: "Balón Doméstico 10kg Rosca Tradicional",
      descripcion:
        "Cilindro estándar compatible con reguladores rosca tradicionales. Inspección técnica de fuga con detector ultrasónico sin costo adicional.",
      precio: "S/ 45.00",
      tara: "Tara: 10.5 kg | Peso Neto: 10.0 kg GLP",
      img: "/mediplace/images/services/services-2-2.jpg",
      badge: "Económico",
    },
    {
      num: "03",
      titulo: "Balón Comercial 15kg para Negocios",
      descripcion:
        "Diseñado para pollerías, chifas, restaurantes y panaderías con alta demanda. Mayor autonomía térmica y combustión 100% azul sin hollín.",
      precio: "S/ 72.00",
      tara: "Tara: 13.8 kg | Peso Neto: 15.0 kg GLP",
      img: "/mediplace/images/services/services-2-3.jpg",
      badge: "Comercial",
    },
    {
      num: "04",
      titulo: "Cilindro Industrial 45kg (Montacargas / Centrales)",
      descripcion:
        "Abastecimiento continuo para edificios residenciales multifamiliares y plantas industriales. Maniobra segura y prueba manométrica de presión.",
      precio: "S/ 205.00",
      tara: "Tara: 38.0 kg | Peso Neto: 45.0 kg GLP",
      img: "/mediplace/images/resources/main-slider-1-1.jpg",
      badge: "Industrial",
    },
    {
      num: "05",
      titulo: "Inspección Técnica de Fugas & Mantenimiento",
      descripcion:
        "Revisión completa de cocina, cambio de mangueras trenzadas y perillas reguladoras por técnicos certificados con código SCOP.",
      precio: "¡GRATIS!",
      tara: "Incluido sin costo con cada compra de balón",
      img: "/mediplace/images/resources/about-v2-img2.jpg",
      badge: "Cortesía",
    },
  ];

  // Productos destacados para la tienda (Shop One de Mediplace)
  const PRODUCTOS_TIENDA = [
    {
      id: "prod-1",
      nombre: "Balón 10kg Válvula Click-On",
      categoria: "Doméstico Seguro",
      precio: "S/ 48.00",
      precioAntes: "S/ 52.00",
      rating: "5.0",
      reviews: "1.4k",
      badge: "Más Vendido",
      img: "/mediplace/images/resources/shop-one-1-1.jpg",
    },
    {
      id: "prod-2",
      nombre: "Balón 10kg Rosca Tradicional",
      categoria: "Doméstico Estándar",
      precio: "S/ 45.00",
      precioAntes: "S/ 48.00",
      rating: "4.9",
      reviews: "980",
      badge: "Oferta Hoy",
      img: "/mediplace/images/resources/shop-one-1-2.jpg",
    },
    {
      id: "prod-3",
      nombre: "Regulador Premium con Manómetro",
      categoria: "Accesorio Certificado",
      precio: "S/ 38.00",
      precioAntes: "S/ 45.00",
      rating: "4.9",
      reviews: "540",
      badge: "Recomendado",
      img: "/mediplace/images/resources/shop-one-1-3.jpg",
    },
    {
      id: "prod-4",
      nombre: "Balón Comercial 15kg Alta Presión",
      categoria: "Restaurantes & Gastronomía",
      precio: "S/ 72.00",
      precioAntes: "S/ 78.00",
      rating: "5.0",
      reviews: "720",
      badge: "Alta Duración",
      img: "/mediplace/images/resources/shop-one-1-4.jpg",
    },
  ];

  // Equipo de técnicos y choferes (Team Two de Mediplace)
  const EQUIPO = [
    {
      nombre: "Carlos Mendoza Ramos",
      cargo: "Jefe Técnico de Seguridad SCOP",
      distrito: "Lima Metropolitana",
      calificacion: "4.98 ★ (1,850 entregas)",
      img: "/mediplace/images/team/team-2-1.jpg",
      especialidad: "Verificación de válvulas y hermeticidad",
    },
    {
      nombre: "Marcos Silva Alva",
      cargo: "Supervisor de Rutas & Despacho Express",
      distrito: "Zona Norte & Centro",
      calificacion: "4.95 ★ (2,120 entregas)",
      img: "/mediplace/images/team/team-2-2.jpg",
      especialidad: "Pesaje digital y calibración en puerta",
    },
    {
      nombre: "Daniel Quispe Huamán",
      cargo: "Especialista en GLP Industrial 45kg",
      distrito: "Zona Sur & Ate",
      calificacion: "4.99 ★ (940 instalaciones)",
      img: "/mediplace/images/team/team-2-3.jpg",
      especialidad: "Centrales de GLP y manifold de cocinas",
    },
  ];

  // Preguntas Frecuentes (FAQ One de Mediplace)
  const PREGUNTAS = [
    {
      q: "¿Cómo garantizan que el balón tiene los 10kg completos de gas?",
      a: "Nuestros repartidores llevan balanzas digitales calibradas con precinto del INACAL. Antes de entregártelo, colocan el balón en la balanza frente a ti: el peso bruto debe ser exactamente la tara grabada en el collarín del cilindro (ej. 10.2 kg) más los 10.0 kg netos de GLP.",
    },
    {
      q: "¿En cuánto tiempo llega mi pedido de gas a domicilio?",
      a: "El tiempo promedio de llegada es de 25 a 35 minutos. El sistema geolocaliza tu dirección y asigna automáticamente al repartidor formal de PideGas más cercano en tu distrito.",
    },
    {
      q: "¿Qué diferencia hay entre la válvula Click-On y la tradicional a Rosca?",
      a: "La válvula Click-On (Premium) utiliza un sistema de acople rápido que se conecta a presión con una sola mano y posee un sistema de seguridad que bloquea automáticamente el paso de gas si la manguera sufre rotura o calor extremo. La válvula a Rosca es la convencional de ajuste manual con perilla.",
    },
    {
      q: "¿Qué medios de pago aceptan en mi puerta?",
      a: "Aceptamos Yape, Plin, transferencias bancarias instantáneas, todas las tarjetas de crédito o débito (Visa, Mastercard, American Express mediante POS inalámbrico) y efectivo contra entrega.",
    },
    {
      q: "¿Los cilindros cuentan con autorización de OSINERGMIN?",
      a: "Sí, el 100% de nuestros cilindros proviene de plantas envasadoras autorizadas y fiscalizadas por OSINERGMIN, con código de registro SCOP visible y precinto termoencogible que certifica que no ha sido alterado.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-700 flex flex-col font-sans selection:bg-orange-600 selection:text-white">

      {/* =========================================================================
          1. TOP BAR SUPERIOR (Estilo main-menu-two__top de Mediplace)
      ========================================================================= */}
      <div className="bg-[#03246b] text-white text-xs py-2.5 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Bienvenida y Redes */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-orange-400 bg-orange-950/40 border border-orange-500/30 px-2.5 py-0.5 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Central de Despacho Activa
            </span>
            <p className="hidden sm:inline text-slate-200">
              ¿Te quedaste sin gas? Despacho rápido en 25 a 35 min
            </p>
          </div>

          {/* Horario y Teléfonos */}
          <div className="flex items-center gap-5 text-slate-200">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>Lun - Sáb: 06:30 - 21:30 | Dom: 07:30 - 19:30</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-orange-400" />
              <a href="tel:018007433" className="hover:text-orange-400 font-bold transition">
                (01) 800-PIDE
              </a>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <MessageCircle className="w-3.5 h-3.5" />
              <a
                href="https://wa.me/51999999999?text=Hola%20PideGas,%20deseo%20pedir%20un%20balon%20de%20gas"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                WhatsApp Oficial
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. HEADER PRINCIPAL Y NAVEGACIÓN (Estilo main-menu-two de Mediplace)
      ========================================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo Corporativo */}
            <Link href="/" className="flex items-center gap-3 group">
              <BrandLogo variant="dark" />
            </Link>

            {/* Menú de Navegación de Mediplace */}
            <nav className="hidden lg:flex items-center gap-8 font-semibold text-sm text-[#03246b]">
              <Link href="/" className="text-orange-600 font-bold hover:text-orange-600 transition">
                Inicio
              </Link>
              <a href="#seguridad" className="hover:text-orange-600 transition">
                Seguridad
              </a>
              <a href="#servicios" className="hover:text-orange-600 transition">
                Servicios
              </a>
              <a href="#tienda" className="hover:text-orange-600 transition">
                Tienda
              </a>
              <a href="#tarifas" className="hover:text-orange-600 transition">
                Tarifas
              </a>
              <a href="#pedido-express" className="hover:text-orange-600 transition">
                Pedidos
              </a>
              <a href="#faq" className="hover:text-orange-600 transition">
                Preguntas
              </a>
            </nav>

            {/* Botones de Acción: Carrito & thm-btn de Mediplace */}
            <div className="flex items-center gap-4">
              
              <Link
                href="/cliente/tienda"
                className="relative hidden sm:flex items-center justify-center w-11 h-11 rounded-full bg-slate-100 text-[#03246b] hover:bg-orange-50 hover:text-orange-600 transition"
                title="Ver carrito de compras"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  02
                </span>
              </Link>

              <Link
                href="/auth/login"
                className="hidden md:inline-flex items-center font-bold text-xs uppercase tracking-wider text-[#03246b] hover:text-orange-600 transition px-3 py-2"
              >
                Ingresar
              </Link>

              {/* Botón thm-btn estilizado y menos redondeado */}
              <Link
                href="/pedir"
                className="group relative inline-flex items-center gap-2.5 bg-[#03246b] hover:bg-orange-600 text-white rounded-xl p-1 pr-4.5 font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-orange-600/20"
              >
                <span className="w-7 h-7 rounded-lg bg-[#1c58d5] group-hover:bg-white text-white group-hover:text-orange-600 flex items-center justify-center transition-all duration-300 shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span className="whitespace-nowrap">Pedir Ahora</span>
              </Link>

              {/* Botón hamburguesa móvil */}
              <button
                onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
                className="lg:hidden p-2 rounded-xl text-[#03246b] hover:bg-slate-100"
              >
                {menuMovilAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Menú Móvil Desplegable */}
        {menuMovilAbierto && (
          <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3 font-semibold text-sm">
            <Link href="/" onClick={() => setMenuMovilAbierto(false)} className="block py-2 text-orange-600">
              Inicio
            </Link>
            <a href="#seguridad" onClick={() => setMenuMovilAbierto(false)} className="block py-2 text-[#03246b]">
              Seguridad
            </a>
            <a href="#servicios" onClick={() => setMenuMovilAbierto(false)} className="block py-2 text-[#03246b]">
              Servicios
            </a>
            <a href="#tienda" onClick={() => setMenuMovilAbierto(false)} className="block py-2 text-[#03246b]">
              Tienda
            </a>
            <a href="#tarifas" onClick={() => setMenuMovilAbierto(false)} className="block py-2 text-[#03246b]">
              Tarifas
            </a>
            <a href="#pedido-express" onClick={() => setMenuMovilAbierto(false)} className="block py-2 text-[#03246b]">
              Pedidos
            </a>
            <a href="#faq" onClick={() => setMenuMovilAbierto(false)} className="block py-2 text-[#03246b]">
              Preguntas
            </a>
            <div className="pt-2 border-t border-slate-100 flex gap-3">
              <Link href="/auth/login" className="w-1/2 py-2.5 text-center rounded-xl bg-slate-100 text-[#03246b] font-bold">
                Ingresar
              </Link>
              <Link href="/auth/registro-empresa" className="w-1/2 py-2.5 text-center rounded-xl bg-orange-600 text-white font-bold">
                Soy Empresa
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">

        {/* =========================================================================
            3. HERO SLIDER SECTION CON EFECTO E IMÁGENES DE FONDO (main-slider de Mediplace index2.html)
        ========================================================================= */}
        <section
          className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-[#021849] text-white min-h-[620px] lg:min-h-[720px] flex items-center"
          onMouseEnter={() => setAutoPlayPausado(true)}
          onMouseLeave={() => setAutoPlayPausado(false)}
        >
          
          {/* Imágenes de Fondo con Efecto Ken Burns Zoom de Mediplace */}
          {SLIDES_HERO.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                slideActivo === idx ? "opacity-100 z-1" : "opacity-0 pointer-events-none z-0"
              }`}
            >
              <div
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-7000 ease-out ${
                  slideActivo === idx ? "scale-110" : "scale-100"
                }`}
                style={{ backgroundImage: `url(${slide.bg})` }}
              />
              {/* Overlay Azul Marino Profundo (rgba(3, 36, 107, 0.88) de Mediplace) */}
              <div className="absolute inset-0 bg-[#021849]/90 mix-blend-multiply" />
              <div className="absolute inset-0 bg-linear-to-r from-[#021849] via-[#03246b]/85 to-transparent" />
            </div>
          ))}

          {/* Formas Geométricas Inclinadas de Mediplace (main-slider__shape-1 & shape-2) */}
          <div className="absolute -bottom-24 right-1/3 w-48 h-[600px] bg-blue-600/30 rotate-18 transform -skew-x-12 blur-sm pointer-events-none z-2" />
          <div className="absolute -top-24 right-1/4 w-36 h-[500px] bg-orange-500/20 rotate-18 transform -skew-x-12 blur-sm pointer-events-none z-2" />

          {/* Contenido Dinámico del Slide */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-4">
            
            {SLIDES_HERO.map((slide, idx) => {
              if (slideActivo !== idx) return null;
              return (
                <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center animate-fadeIn">
                  
                  {/* Columna Izquierda: Textos y CTA */}
                  <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                    
                    {/* Tagline Subtítulo estilo Mediplace */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-xs text-orange-400 text-xs font-bold uppercase tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-orange-400" />
                      <span>{slide.tagline}</span>
                    </div>

                    {/* Titular Principal con Elemento Inline (Pill Image como en index2.html) */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.12]">
                      {slide.tituloL1} <br />
                      {slide.conPillImg ? (
                        <>
                          con{" "}
                          <span className="inline-flex items-center align-middle mx-1 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full border border-white/30 shadow-sm">
                            <Image
                              src="/mediplace/images/resources/main-slider-title-img.jpg"
                              alt="Precinto de Calidad"
                              width={65}
                              height={32}
                              className="rounded-full object-cover"
                            />
                          </span>{" "}
                          <span className="text-orange-400 underline decoration-orange-400/50 underline-offset-8">
                            {slide.tituloHighlight}
                          </span>{" "}
                          {slide.tituloL2}
                        </>
                      ) : (
                        <>
                          con{" "}
                          <span className="text-orange-400 underline decoration-orange-400/50 underline-offset-8">
                            {slide.tituloHighlight}
                          </span>{" "}
                          {slide.tituloL2}
                        </>
                      )}
                    </h1>

                    {/* Párrafo descriptivo estilo Mediplace */}
                    <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                      {slide.descripcion}
                    </p>

                    {/* Botones de Acción del Slider */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                      <Link
                        href="/pedir"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-500 text-white rounded-full p-2 pr-8 font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-xl shadow-orange-600/30"
                      >
                        <span className="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center">
                          <ArrowRight className="w-5 h-5" />
                        </span>
                        <span>Pide tu Balón en Línea</span>
                      </Link>

                      <a
                        href="#tarifas"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-white/30 hover:border-white text-white px-7 py-3 rounded-full font-bold text-sm transition backdrop-blur-xs bg-white/5"
                      >
                        <Scale className="w-4 h-4 text-orange-400" />
                        <span>Ver Tarifas Oficiales</span>
                      </a>
                    </div>

                    {/* 3 Beneficios rápidos en pill */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs font-semibold text-slate-200">
                      <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                          <Scale className="w-4 h-4" />
                        </div>
                        <span>Pesaje en tu puerta (Tolerancia 0g)</span>
                      </div>

                      <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                        <span>Llegada en 25 - 35 minutos</span>
                      </div>

                      <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <span>Yape, Plin y todas las tarjetas</span>
                      </div>
                    </div>

                  </div>

                  {/* Columna Derecha: Composición de Imágenes estilo Mediplace */}
                  <div className="lg:col-span-5 relative">
                    <div className="relative mx-auto max-w-md lg:max-w-none">
                      
                      {/* Imagen Principal */}
                      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
                        <Image
                          src={slide.imgPrincipal}
                          alt="Servicio de gas formal"
                          width={520}
                          height={580}
                          unoptimized
                          className="w-full h-[460px] object-cover hover:scale-102 transition duration-500"
                          priority
                        />
                      </div>

                      {/* Segunda Imagen Superpuesta estilo Mediplace */}
                      <div className="absolute -bottom-8 -left-8 w-44 h-44 rounded-2xl overflow-hidden border-4 border-white shadow-2xl hidden sm:block">
                        <Image
                          src={slide.imgSecundaria}
                          alt="Control de calidad del balón"
                          width={180}
                          height={180}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Badge inferior de Balanza Digital Calibrada */}
                      <div className="absolute bottom-4 right-4 bg-[#03246b]/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl border border-blue-400/30 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                          <Scale className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase text-orange-400">Garantía Inacal</p>
                          <p className="text-xs font-black">{slide.selloBadge}</p>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              );
            })}

          </div>

          {/* Flechas de Navegación del Slider (Prev y Next) */}
          <button
            onClick={slideAnterior}
            aria-label="Slide anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-orange-600 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={slideSiguiente}
            aria-label="Slide siguiente"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-orange-600 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Paginación con Puntos e Indicadores de Mediplace */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
            {SLIDES_HERO.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSlideActivo(idx)}
                aria-label={`Ir al slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  slideActivo === idx
                    ? "w-8 h-3 bg-orange-500 shadow-md shadow-orange-500/50"
                    : "w-3 h-3 bg-white/40 hover:bg-white/80"
                }`}
              />
            ))}
          </div>

        </section>


        {/* =========================================================================
            4. ABOUT SECTION (Estilo about-two de Mediplace index2.html)
        ========================================================================= */}
        <section id="seguridad" className="py-20 lg:py-28 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
              
              {/* Columna Izquierda: Doble Imagen con Badges de Experiencia */}
              <div className="lg:col-span-5 relative">
                <div className="relative">
                  {/* Imagen 1 */}
                  <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-slate-50 max-w-sm">
                    <Image
                      src="/mediplace/images/resources/about-v2-img1.jpg"
                      alt="Instalación técnica de gas"
                      width={380}
                      height={440}
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  {/* Imagen 2 superpuesta */}
                  <div className="absolute -bottom-10 right-0 sm:-right-6 w-56 h-64 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                    <Image
                      src="/mediplace/images/resources/about-v2-img2.jpg"
                      alt="Control de calidad del balón"
                      width={240}
                      height={270}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Badge Flotante de Años de Experiencia (about-two__left-experience) */}
                  <div className="absolute top-6 -left-6 bg-[#03246b] text-white p-5 rounded-3xl shadow-2xl border-2 border-blue-900 text-center min-w-[120px]">
                    <span className="block text-4xl font-black text-orange-400 leading-none">
                      12+
                    </span>
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-200 mt-1">
                      Años de<br />Experiencia
                    </span>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Contenido y Pilares de Seguridad */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Tagline */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#03246b] text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  <span>Seguridad en tu Hogar</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-[#03246b] tracking-tight leading-tight">
                  Técnicos calificados y balanzas certificadas a tu{" "}
                  <span className="text-orange-600">Servicio</span>
                </h2>

                <p className="text-base text-slate-600 leading-relaxed">
                  En PideGas combatimos frontalmente el gas adulterado y el peso incompleto. Cada cilindro que sale de nuestra planta pasa por rigurosos controles hidrostáticos y es entregado por personal capacitado que conecta e inspecciona tu regulador sin costo adicional.
                </p>

                {/* 4 Puntos Destacados en Grid 2x2 (about-two__points-list) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8fbff] border border-blue-100 hover:border-blue-300 transition">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-orange-600 flex items-center justify-center shrink-0 border border-slate-100">
                      <Scale className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#03246b] text-sm">Pesaje en tu Presencia</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Balanza digital en puerta. Si le falta 1 solo gramo, te cambiamos el balón gratis.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8fbff] border border-blue-100 hover:border-blue-300 transition">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-[#03246b] flex items-center justify-center shrink-0 border border-slate-100">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#03246b] text-sm">Válvula Click-On Premium</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Bloqueo térmico automático que previene cualquier fuga ante altas temperaturas.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8fbff] border border-blue-100 hover:border-blue-300 transition">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-emerald-600 flex items-center justify-center shrink-0 border border-slate-100">
                      <Flame className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#03246b] text-sm">Llama Azul Eficiente</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        GLP refinado de alto poder calórico que no mancha tus ollas con hollín negro.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#f8fbff] border border-blue-100 hover:border-blue-300 transition">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-purple-600 flex items-center justify-center shrink-0 border border-slate-100">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#03246b] text-sm">Despacho en &lt; 35 Minutos</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Flota geolocalizada en tiempo real que llega puntual a tu puerta.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Ficha del Especialista / Supervisor Técnico (about-two__author-details) */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[#03246b] text-white rounded-2xl shadow-lg border border-blue-900">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/mediplace/images/resources/about-two-author-img-1.jpg"
                      alt="Supervisor Técnico PideGas"
                      width={52}
                      height={52}
                      className="rounded-full border-2 border-orange-400 object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white">Ing. Carlos Mendoza R.</h4>
                      <p className="text-xs text-orange-300 font-medium">Jefe de Seguridad & Registro SCOP</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-300 block">Línea Técnica Directa</span>
                    <a href="tel:018007433" className="text-sm font-black text-white hover:text-orange-400">
                      (01) 800-7433 (Opción 2)
                    </a>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>


        {/* =========================================================================
            5. SERVICES ROW (Estilo services-two de Mediplace index2.html)
        ========================================================================= */}
        <section id="servicios" className="py-20 lg:py-28 bg-[#f8fbff] border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 text-[#03246b] text-xs font-bold uppercase tracking-wider mb-2">
                  <Flame className="w-4 h-4 text-orange-600" />
                  <span>Nuestros Balones y Servicios</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#03246b] tracking-tight">
                  Descubre lo que te <span className="text-orange-600">Ofrecemos</span>
                </h2>
              </div>

              <Link
                href="/pedir"
                className="inline-flex items-center gap-3 bg-[#03246b] hover:bg-orange-600 text-white rounded-full p-1.5 pr-6 font-bold text-xs uppercase tracking-wider transition duration-300 self-start md:self-auto"
              >
                <span className="w-9 h-9 rounded-full bg-[#1c58d5] text-white flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </span>
                <span>Pedir Balón Ahora</span>
              </Link>
            </div>

            {/* Lista Interactiva estilo Mediplace Services Two */}
            <div className="space-y-4">
              {SERVICIOS.map((item, idx) => {
                const activo = servicioActivo === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setServicioActivo(idx)}
                    className={`cursor-pointer rounded-3xl p-6 sm:p-8 transition-all duration-300 border ${
                      activo
                        ? "bg-white shadow-xl border-orange-400 ring-2 ring-orange-400/20"
                        : "bg-white/70 hover:bg-white border-slate-200 shadow-xs"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      
                      {/* Número y Títulos */}
                      <div className="flex items-start gap-6">
                        <span className={`text-2xl sm:text-3xl font-black transition ${
                          activo ? "text-orange-600" : "text-slate-300"
                        }`}>
                          {item.num}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2.5">
                            <h3 className="text-lg sm:text-xl font-black text-[#03246b]">
                              {item.titulo}
                            </h3>
                            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                            {item.descripcion}
                          </p>
                          <p className="text-xs font-semibold text-slate-400 pt-1">
                            {item.tara}
                          </p>
                        </div>
                      </div>

                      {/* Precio y Botón */}
                      <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Tarifa Oficial</span>
                          <span className="text-2xl sm:text-3xl font-black text-[#03246b]">
                            {item.precio}
                          </span>
                        </div>

                        <Link
                          href="/pedir"
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition shrink-0 ${
                            activo
                              ? "bg-orange-600 text-white shadow-md shadow-orange-600/30 rotate-45"
                              : "bg-[#03246b] text-white hover:bg-orange-600"
                          }`}
                        >
                          <Plus className="w-5 h-5" />
                        </Link>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>


        {/* =========================================================================
            6. OPERACIONES Y HORARIOS (Estilo eye-care-center de Mediplace index2.html)
        ========================================================================= */}
        <section className="py-20 lg:py-28 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-14">
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#03246b] text-xs font-bold uppercase tracking-wider mb-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Cobertura y Horarios de Despacho</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#03246b] tracking-tight">
                  Estamos listos para <span className="text-orange-600">Atenderte Hoy</span>
                </h2>
              </div>
              <div className="lg:col-span-6">
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Monitoreamos nuestra red logística mediante geocercas satelitales en Lima Norte, Sur, Este y Centro. Cada pedido asigna de manera inteligente al camión o moto más próxima a tu manzana.
                </p>
              </div>
            </div>

            {/* 4 Cards de Operaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="p-7 rounded-3xl bg-[#f8fbff] border border-blue-100 hover:shadow-lg transition">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xs text-orange-600 flex items-center justify-center mb-5 border border-slate-100">
                  <MapPin className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-[#03246b] mb-2">Rutas por GPS</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Asignación automática a la unidad más cercana a tu puerta para entregas en 25 a 35 minutos.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-[#f8fbff] border border-blue-100 hover:shadow-lg transition">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xs text-[#03246b] flex items-center justify-center mb-5 border border-slate-100">
                  <Scale className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-[#03246b] mb-2">Balanzas Calibradas</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Equipos certificados periódicamente con precintos de inviolabilidad para garantizar peso íntegro.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-[#f8fbff] border border-blue-100 hover:shadow-lg transition">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xs text-emerald-600 flex items-center justify-center mb-5 border border-slate-100">
                  <QrCode className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-[#03246b] mb-2">Pago sin Contacto</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Escanea el QR de Yape o Plin del repartidor o pasa tu tarjeta de débito o crédito en el POS.
                </p>
              </div>

              {/* Horarios de Atención */}
              <div className="p-7 rounded-3xl bg-[#03246b] text-white shadow-xl border border-blue-900">
                <h4 className="text-base font-black text-orange-400 mb-4 uppercase tracking-wider text-xs">
                  Horarios de Atención
                </h4>
                <ul className="space-y-3 text-xs">
                  <li className="flex justify-between pb-2 border-b border-blue-800/80">
                    <span className="text-slate-300">Lunes a Sábado:</span>
                    <span className="font-bold text-white">06:30 - 21:30</span>
                  </li>
                  <li className="flex justify-between pb-2 border-b border-blue-800/80">
                    <span className="text-slate-300">Domingos:</span>
                    <span className="font-bold text-white">07:30 - 19:30</span>
                  </li>
                  <li className="flex justify-between pt-1">
                    <span className="text-slate-300">Feriados:</span>
                    <span className="font-bold text-emerald-400">Atención Normal</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </section>


        {/* =========================================================================
            7. TABLA DE TARIFAS TRANSPARENTES (Estilo pricing-two de Mediplace index2.html)
        ========================================================================= */}
        <section id="tarifas" className="py-20 lg:py-28 bg-[#f8fbff] border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center space-y-3 mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 text-[#03246b] text-xs font-bold uppercase tracking-wider">
                <Scale className="w-4 h-4 text-orange-600" />
                <span>Lista Oficial de Precios</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#03246b] tracking-tight">
                Tarifas de Planta <span className="text-orange-600">sin Sobrecostos</span>
              </h2>
              <p className="text-slate-500 text-sm">
                Precios transparentes y regulados con comprobante electrónico (Boleta o Factura).
              </p>
            </div>

            {/* Lista de Precios estilo pricing-two */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200">
              <ul className="divide-y divide-slate-100">
                {[
                  { desc: "Balón Doméstico 10kg Válvula Click-On (Premium Segura)", precio: "S/ 48.00", tag: "Recomendado" },
                  { desc: "Balón Doméstico 10kg Rosca Tradicional (Estándar)", precio: "S/ 45.00", tag: "Económico" },
                  { desc: "Balón Comercial 15kg para Restaurantes & Talleres", precio: "S/ 72.00", tag: "Comercial" },
                  { desc: "Cilindro Industrial 45kg para Centrales & Montacargas", precio: "S/ 205.00", tag: "Industrial" },
                  { desc: "Regulador Premium Click-On con Seguro Térmico", precio: "S/ 38.00", tag: "Accesorio" },
                  { desc: "Inspección de Fugas e Instalación en tu Cocina", precio: "S/ 0.00", tag: "¡Gratis!" },
                ].map((tarifa, i) => (
                  <li key={i} className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 px-3 rounded-2xl transition">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-sm text-[#03246b]">{tarifa.desc}</span>
                      <span className="hidden md:inline text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-[#03246b]">
                        {tarifa.tag}
                      </span>
                    </div>
                    <span className="text-lg sm:text-xl font-black text-orange-600 pl-9 sm:pl-0">
                      {tarifa.precio}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500 text-center sm:text-left">
                  ⚖️ Incluye entrega a domicilio y verificación de peso con balanza en mano.
                </p>
                <Link
                  href="/pedir"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#03246b] hover:bg-orange-600 text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Pedir Ahora al Precio Indicado</span>
                </Link>
              </div>
            </div>

          </div>
        </section>


        {/* =========================================================================
            8. CONTADORES DE IMPACTO (Estilo counter-one de Mediplace index2.html)
        ========================================================================= */}
        <section className="py-16 bg-[#03246b] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              
              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-orange-400 mx-auto flex items-center justify-center">
                  <Flame className="w-7 h-7" />
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                  50k<span className="text-orange-400">+</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">Balones Entregados</p>
              </div>

              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-orange-400 mx-auto flex items-center justify-center">
                  <MapPin className="w-7 h-7" />
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                  25<span className="text-orange-400">+</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">Distritos con Cobertura</p>
              </div>

              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-orange-400 mx-auto flex items-center justify-center">
                  <Clock className="w-7 h-7" />
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                  99.8<span className="text-orange-400">%</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">Llegadas a Tiempo (&lt;35m)</p>
              </div>

              <div className="space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-white/10 text-orange-400 mx-auto flex items-center justify-center">
                  <Scale className="w-7 h-7" />
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                  100<span className="text-orange-400">%</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">Balanzas Certificadas</p>
              </div>

            </div>
          </div>
        </section>


        {/* =========================================================================
            9. TIENDA Y PRODUCTOS DESTACADOS (Estilo shop-one de Mediplace index2.html)
        ========================================================================= */}
        <section id="tienda" className="py-20 lg:py-28 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center space-y-3 mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#03246b] text-xs font-bold uppercase tracking-wider">
                <ShoppingBag className="w-4 h-4 text-orange-600" />
                <span>Catálogo de Productos</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#03246b] tracking-tight">
                Los Más Pedidos por los <span className="text-orange-600">Hogares</span>
              </h2>
              <p className="text-slate-500 text-sm max-w-xl mx-auto">
                Selecciona tu balón de gas con entrega programada o express con solo un clic.
              </p>
            </div>

            {/* Grid 4 Columnas estilo shop-one */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {PRODUCTOS_TIENDA.map((prod) => (
                <div
                  key={prod.id}
                  className="group rounded-3xl bg-[#fbfdff] border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  {/* Imagen y Badge */}
                  <div className="relative h-60 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={prod.img}
                      alt={prod.nombre}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-orange-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                      {prod.badge}
                    </span>
                  </div>

                  {/* Detalles del Producto */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {prod.categoria}
                      </span>
                      <h3 className="font-black text-sm text-[#03246b] group-hover:text-orange-600 transition">
                        {prod.nombre}
                      </h3>
                      <div className="flex items-center gap-1 mt-1 text-amber-500 text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span className="font-bold text-slate-700">{prod.rating}</span>
                        <span className="text-slate-400 text-[10px]">({prod.reviews})</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400 line-through mr-1.5">{prod.precioAntes}</span>
                        <span className="text-lg font-black text-[#03246b]">{prod.precio}</span>
                      </div>
                      
                      <a
                        href="#pedido-express"
                        className="w-10 h-10 rounded-full bg-[#03246b] group-hover:bg-orange-600 text-white flex items-center justify-center transition shadow-md shadow-blue-900/10"
                        title="Pedir este producto"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>


        {/* =========================================================================
            10. EQUIPO TÉCNICO (Estilo team-two de Mediplace index2.html)
        ========================================================================= */}
        <section className="py-20 lg:py-28 bg-[#f8fbff] border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center space-y-3 mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 text-[#03246b] text-xs font-bold uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-orange-600" />
                <span>Nuestros Especialistas</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#03246b] tracking-tight">
                Equipo Certificado para tu <span className="text-orange-600">Tranquilidad</span>
              </h2>
              <p className="text-slate-500 text-sm max-w-xl mx-auto">
                Personal formal identificado con carnet y uniforme oficial de PideGas.
              </p>
            </div>

            {/* 3 Tarjetas de Especialistas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {EQUIPO.map((miembro, i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-72 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={miembro.img}
                      alt={miembro.nombre}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-bold text-[#03246b]">
                      {miembro.distrito}
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-2 text-center">
                    <p className="text-xs uppercase font-extrabold text-orange-600">{miembro.cargo}</p>
                    <h3 className="text-lg font-black text-[#03246b]">{miembro.nombre}</h3>
                    <p className="text-xs text-slate-500">{miembro.especialidad}</p>
                    <div className="pt-3 border-t border-slate-100 text-xs font-bold text-amber-600">
                      {miembro.calificacion}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>


        {/* =========================================================================
            11. BUSCADOR DE COBERTURA Y DISTRIBUIDORAS EN MAPA (Estilo Mediplace)
        ========================================================================= */}
        <section id="pedido-express" className="py-20 lg:py-28 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Columna Izquierda: Información de Cobertura */}
              <div className="lg:col-span-5 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#03246b] text-xs font-bold uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span>Cobertura Geoespacial en Vivo</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black text-[#03246b] tracking-tight leading-tight">
                  Encuentra tu Distribuidora de Gas en <span className="text-orange-600">tu Zona</span>
                </h2>

                <p className="text-slate-600 text-sm leading-relaxed">
                  Ingresa tu dirección o ubícate en el mapa interactivo. Te mostraremos las distribuidoras autorizadas por Osinergmin con balanza digital contrastada en tu puerta y despacho en 25 a 35 minutos.
                </p>

                <div className="space-y-2.5 text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Visualización en mapa y lista de distribuidores autorizados</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Balanza digital con pesaje exacto frente a ti (tolerancia 0g)</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Variedad de marcas: Solgas, Primax Gas, Llamagas y Zeta Gas</span>
                  </div>
                </div>

                {/* Llamada Directa */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#03246b] text-white">
                  <div className="w-12 h-12 rounded-full bg-orange-600 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-orange-400 block">Central Telefónica Gratuita</span>
                    <a href="tel:018007433" className="text-lg font-black text-white hover:text-orange-400 transition">
                      (01) 800-PIDE (7433)
                    </a>
                  </div>
                </div>

              </div>

              {/* Columna Derecha: Tarjeta Interactiva de Búsqueda y Cobertura */}
              <div className="lg:col-span-7">
                <div className="bg-[#f8fbff] rounded-3xl p-8 sm:p-10 border border-blue-100 shadow-xl space-y-6">
                  <div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 uppercase tracking-wider inline-block mb-2">
                      Nueva Plataforma de Pedidos
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-[#03246b]">
                      ¿A qué dirección llevamos tu balón de gas?
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Escribe tu calle o distrito para ver distribuidoras con balanzas digitales disponibles en tiempo real.
                    </p>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (busquedaDireccion.trim()) {
                        router.push(`/pedir?direccion=${encodeURIComponent(busquedaDireccion.trim())}`);
                      } else {
                        router.push("/pedir");
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <MapPin className="w-5 h-5 text-orange-600 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={busquedaDireccion}
                        onChange={(e) => setBusquedaDireccion(e.target.value)}
                        placeholder="Ej. Av. Antúnez de Mayolo 1240, Los Olivos"
                        className="w-full pl-12 pr-4 py-4 text-sm font-medium rounded-2xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-xs"
                      />
                    </div>

                    {/* Chips de distritos frecuentes */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-400 block uppercase">
                        O selecciona tu distrito en Lima:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "Los Olivos",
                          "San Martín de Porres",
                          "Comas",
                          "Independencia",
                          "San Miguel",
                          "Santiago de Surco",
                          "Miraflores",
                        ].map((dist) => (
                          <button
                            key={dist}
                            type="button"
                            onClick={() => setBusquedaDireccion(dist)}
                            className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                              busquedaDireccion === dist
                                ? "bg-orange-600 text-white shadow-xs"
                                : "bg-white hover:bg-slate-200 text-slate-700 border border-slate-200"
                            }`}
                          >
                            {dist}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="submit"
                        className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm uppercase tracking-wider transition shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Search className="w-4 h-4" />
                        <span>Ver Distribuidores en el Mapa</span>
                      </button>

                      <Link
                        href="/pedir"
                        className="w-full sm:w-auto py-4 px-6 rounded-2xl border border-slate-300 hover:bg-white text-slate-700 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 text-center"
                      >
                        <Navigation className="w-4 h-4 text-orange-600" />
                        <span>Usar GPS</span>
                      </Link>
                    </div>
                  </form>

                  <div className="pt-4 border-t border-blue-100/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Fiscalizado por Osinergmin
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-orange-600" />
                      Pesaje exacto en balanza digital
                    </span>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>


        {/* =========================================================================
            12. PREGUNTAS FRECUENTES (Estilo faq-one de Mediplace index2.html)
        ========================================================================= */}
        <section id="faq" className="py-20 lg:py-28 bg-[#f8fbff] border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center space-y-3 mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-blue-200 text-[#03246b] text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-orange-600" />
                <span>Resolvemos tus Dudas</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#03246b] tracking-tight">
                Preguntas Frecuentes sobre el <span className="text-orange-600">Servicio de Gas</span>
              </h2>
              <p className="text-slate-500 text-sm">
                Información transparente sobre el pesaje, entrega e instalación segura de tu balón.
              </p>
            </div>

            {/* Acordeón de FAQs de Mediplace */}
            <div className="space-y-3">
              {PREGUNTAS.map((item, idx) => {
                const abierta = preguntaAbierta === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition"
                  >
                    <button
                      onClick={() => setPreguntaAbierta(abierta ? null : idx)}
                      className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-[#03246b] hover:text-orange-600 transition"
                    >
                      <span>{item.q}</span>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-4 transition-transform ${
                        abierta ? "bg-orange-600 text-white rotate-45" : "bg-slate-100 text-slate-500"
                      }`}>
                        <Plus className="w-4 h-4" />
                      </span>
                    </button>

                    {abierta && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>


        {/* =========================================================================
            13. CINTILLO MARQUEE (Estilo sliding-text-one de Mediplace index2.html)
        ========================================================================= */}
        <div className="bg-[#03246b] text-white py-4 overflow-hidden border-y border-blue-900 shadow-inner">
          <div className="flex whitespace-nowrap animate-marquee">
            <span className="text-sm font-black uppercase tracking-wider mx-6">
              🔥 ¿TE QUEDASTE SIN GAS? • DESPACHO INMEDIATO EN 30 MIN
            </span>
            <span className="text-sm font-black uppercase tracking-wider mx-6 text-orange-400">
              ⚖️ BALANZA DIGITAL EN TU PUERTA CON TOLERANCIA 0g
            </span>
            <span className="text-sm font-black uppercase tracking-wider mx-6">
              🛡️ DISTRIBUCIÓN 100% FORMAL FISCALIZADA POR OSINERGMIN
            </span>
            <span className="text-sm font-black uppercase tracking-wider mx-6 text-orange-400">
              📱 PAGA CON YAPE, PLIN Y TODAS LAS TARJETAS
            </span>
            <span className="text-sm font-black uppercase tracking-wider mx-6">
              🔥 ¿TE QUEDASTE SIN GAS? • DESPACHO INMEDIATO EN 30 MIN
            </span>
            <span className="text-sm font-black uppercase tracking-wider mx-6 text-orange-400">
              ⚖️ BALANZA DIGITAL EN TU PUERTA CON TOLERANCIA 0g
            </span>
          </div>
        </div>

      </main>

      {/* =========================================================================
          14. FOOTER CORPORATIVO (Estilo site-footer-two de Mediplace index2.html)
      ========================================================================= */}
      <footer className="bg-[#021849] text-white pt-16 pb-8 border-t border-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-blue-900/60">
            
            {/* Columna 1: Info y Logo */}
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <BrandLogo variant="light" />
              </Link>
              <p className="text-xs text-slate-300 leading-relaxed">
                Distribución formal y segura de gas doméstico, comercial e industrial en todo Lima Metropolitana. Garantía de peso exacto y cilindros fiscalizados por OSINERGMIN.
              </p>
              <div className="text-xs text-orange-300 font-bold">
                SCOP Registro Nº 20491-GLP
              </div>
            </div>

            {/* Columna 2: Enlaces Rápidos */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><a href="#seguridad" className="hover:text-orange-400 transition">Seguridad</a></li>
                <li><a href="#servicios" className="hover:text-orange-400 transition">Servicios</a></li>
                <li><a href="#tienda" className="hover:text-orange-400 transition">Tienda</a></li>
                <li><a href="#tarifas" className="hover:text-orange-400 transition">Tarifas</a></li>
                <li><Link href="/auth/registro-empresa" className="hover:text-orange-400 transition">Afiliar Distribuidora</Link></li>
                <li><Link href="/auth/login" className="hover:text-orange-400 transition">Iniciar Sesión</Link></li>
              </ul>
            </div>

            {/* Columna 3: Legal & Emergencias */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Legal y Emergencias</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li><Link href="/libro-reclamaciones" className="hover:text-orange-400 transition">Libro de Reclamaciones</Link></li>
                <li><Link href="/terminos-servicio" className="hover:text-orange-400 transition">Términos del Servicio</Link></li>
                <li><Link href="/politica-privacidad" className="hover:text-orange-400 transition">Política de Privacidad</Link></li>
                <li className="pt-2 text-red-400 font-bold">
                  🚒 Emergencias de Fugas: Bomberos 116
                </li>
                <li className="text-amber-400 font-bold">
                  🛡️ OSINERGMIN: 0800-41411
                </li>
              </ul>
            </div>

            {/* Columna 4: Galería de Calidad (footer-widget-two__gallery) */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Galería de Despacho</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="relative h-16 rounded-xl overflow-hidden bg-blue-900">
                  <Image
                    src="/mediplace/images/resources/footer-widget-two-gallery-1-1.jpg"
                    alt="Galería 1"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-16 rounded-xl overflow-hidden bg-blue-900">
                  <Image
                    src="/mediplace/images/resources/footer-widget-two-gallery-1-2.jpg"
                    alt="Galería 2"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-16 rounded-xl overflow-hidden bg-blue-900">
                  <Image
                    src="/mediplace/images/resources/footer-widget-two-gallery-1-3.jpg"
                    alt="Galería 3"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-16 rounded-xl overflow-hidden bg-blue-900">
                  <Image
                    src="/mediplace/images/resources/footer-widget-two-gallery-1-4.jpg"
                    alt="Galería 4"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-16 rounded-xl overflow-hidden bg-blue-900">
                  <Image
                    src="/mediplace/images/resources/footer-widget-two-gallery-1-5.jpg"
                    alt="Galería 5"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-16 rounded-xl overflow-hidden bg-blue-900">
                  <Image
                    src="/mediplace/images/resources/footer-widget-two-gallery-1-6.jpg"
                    alt="Galería 6"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© 2026 PideGas Perú. Todos los derechos reservados.</p>
            <p>Plataforma autorizada de gas doméstico e industrial.</p>
          </div>

        </div>
      </footer>

    </div>
  );
}