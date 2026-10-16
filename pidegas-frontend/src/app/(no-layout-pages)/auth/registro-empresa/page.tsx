"use client";

import React, { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  empresasApi,
  RegistroEmpresaPayload,
} from "@/librerias/api/empresas.api";
import {
  ubigeoApi,
  UbigeoItem,
} from "@/librerias/api/ubigeo.api";
import {
  Flame,
  Building2,
  MapPin,
  User,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  Scale,
  Truck,
  Package,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  FileText,
  HelpCircle,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  ChevronRight,
  Store,
  Layers,
  Award,
  Globe,
  UploadCloud,
  FileCheck,
  Headphones,
  MessageCircle,
  Calendar,
  ExternalLink,
  ChevronDown,
  Plus,
  Play,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

const SelectorUbicacionMapa = dynamic(
  () => import("@/components/mapa/selector-ubicacion-mapa").then((mod) => mod.SelectorUbicacionMapa),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 dark:bg-neutral-800 rounded-3xl border border-dashed border-slate-200 dark:border-neutral-700 animate-pulse">
        Cargando mapa interactivo...
      </div>
    ),
  }
);

const MARCAS_DISPONIBLES = [
  { id: "Solgas", nombre: "Solgas", color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900" },
  { id: "Zeta Gas", nombre: "Zeta Gas", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900" },
  { id: "Llamagas", nombre: "Llamagas", color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900" },
  { id: "Limagas", nombre: "Limagas", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900" },
  { id: "Costa Gas", nombre: "Costa Gas", color: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-900" },
  { id: "PetiGas", nombre: "PetiGas", color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900" },
  { id: "Multimarca", nombre: "Multimarca", color: "bg-neutral-100 text-neutral-700 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700" },
];

export default function RegistroEmpresaPage() {
  const router = useRouter();
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mostrarMapa, setMostrarMapa] = useState(false);

  // Form State
  const [form, setForm] = useState({
    // Paso 1: Empresa & SUNAT
    ruc: "",
    nombreComercial: "",
    razonSocial: "",
    telefono: "",
    emailContacto: "",
    tipoDistribuidora: "LOCAL_MENOR", // LOCAL_MENOR, MAYORISTA, PLANTA
    enlaceWebRedes: "",

    // Paso 2: Ubicación & Ubigeo & Capacidad
    departamento: "LIMA",
    provincia: "LIMA",
    distrito: "",
    codigoInei: "",
    direccionCalle: "",
    latitud: null as number | null,
    longitud: null as number | null,
    registroOsinergmin: "",
    unidadesFlota: "1 a 3 unidades",
    capacidadStock: "100 a 300 balones",
    tipoValvula: "AMBAS",
    marcasGas: ["Solgas", "Zeta Gas"],
    horaApertura: "07:00",
    horaCierre: "20:00",
    zonasCoberturaAdicionales: [] as string[],

    // Paso 3: Administrador Titular
    adminNombres: "",
    adminApellidos: "",
    adminDni: "",
    adminCargo: "ADMINISTRADOR",
    adminCelular: "",
    adminEmail: "",
    adminPassword: "",
    adminPasswordConfirm: "",
    archivoAdjuntoNombre: "",
    aceptaTerminos: false,
    declaraPesajeJusto: false,
  });

  // Ubigeo Lists
  const [departamentos, setDepartamentos] = useState<string[]>([]);
  const [provincias, setProvincias] = useState<string[]>([]);
  const [distritos, setDistritos] = useState<UbigeoItem[]>([]);
  const [cargandoUbigeo, setCargandoUbigeo] = useState(false);

  useEffect(() => {
    async function cargarDepartamentos() {
      try {
        const deps = await ubigeoApi.listarDepartamentos();
        setDepartamentos(deps);
        if (deps.includes("LIMA")) {
          cargarProvincias("LIMA");
        } else if (deps.length > 0) {
          cargarProvincias(deps[0]);
        }
      } catch (e) {
        console.warn("Usando fallback de departamentos:", e);
        setDepartamentos(["LIMA", "CALLAO", "AREQUIPA", "CUSCO", "LA LIBERTAD", "PIURA"]);
        cargarProvincias("LIMA");
      }
    }
    cargarDepartamentos();
  }, []);

  const cargarProvincias = async (dep: string) => {
    try {
      setCargandoUbigeo(true);
      const provs = await ubigeoApi.listarProvincias(dep);
      setProvincias(provs);
      const provSeleccionada = provs.length > 0 ? provs[0] : "";
      setForm((prev) => ({
        ...prev,
        departamento: dep,
        provincia: provSeleccionada,
        distrito: "",
        codigoInei: "",
      }));
      if (provSeleccionada) {
        cargarDistritos(dep, provSeleccionada);
      }
    } catch (e) {
      console.warn("Error cargando provincias:", e);
    } finally {
      setCargandoUbigeo(false);
    }
  };

  const cargarDistritos = async (dep: string, prov: string) => {
    try {
      setCargandoUbigeo(true);
      const dists = await ubigeoApi.listarDistritos(dep, prov);
      setDistritos(dists);
      if (dists.length > 0) {
        setForm((prev) => ({
          ...prev,
          distrito: dists[0].distrito,
          codigoInei: dists[0].codigoInei,
        }));
      }
    } catch (e) {
      console.warn("Error cargando distritos:", e);
    } finally {
      setCargandoUbigeo(false);
    }
  };

  const handleDepartamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dep = e.target.value;
    cargarProvincias(dep);
  };

  const handleProvinciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prov = e.target.value;
    setForm((prev) => ({ ...prev, provincia: prov }));
    cargarDistritos(form.departamento, prov);
  };

  const handleDistritoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distNombre = e.target.value;
    const encontrado = distritos.find((d) => d.distrito === distNombre);
    setForm((prev) => ({
      ...prev,
      distrito: distNombre,
      codigoInei: encontrado ? encontrado.codigoInei : "",
    }));
  };

  const toggleMarcaGas = (marca: string) => {
    setForm((prev) => {
      const existe = prev.marcasGas.includes(marca);
      const nuevas = existe
        ? prev.marcasGas.filter((m) => m !== marca)
        : [...prev.marcasGas, marca];
      return { ...prev, marcasGas: nuevas };
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, archivoAdjuntoNombre: file.name }));
    }
  };

  const validarPaso1 = () => {
    setError(null);
    if (!/^(10|20)\d{9}$/.test(form.ruc.trim())) {
      setError("El RUC debe tener 11 dígitos numéricos y comenzar con 10 o 20.");
      return false;
    }
    if (!form.nombreComercial.trim()) {
      setError("El nombre comercial de la distribuidora es obligatorio.");
      return false;
    }
    if (!form.telefono.trim()) {
      setError("El teléfono de recepción de pedidos es obligatorio.");
      return false;
    }
    if (!form.emailContacto.trim() || !form.emailContacto.includes("@")) {
      setError("Ingrese un correo comercial o de facturación válido.");
      return false;
    }
    return true;
  };

  const validarPaso2 = () => {
    setError(null);
    if (!form.departamento || !form.provincia || !form.distrito) {
      setError("Seleccione el Departamento, Provincia y Distrito (Ubigeo) donde opera.");
      return false;
    }
    if (!form.direccionCalle.trim()) {
      setError("Ingrese la dirección fiscal o sede del almacén de balones de gas.");
      return false;
    }
    if (form.marcasGas.length === 0) {
      setError("Seleccione al menos una marca de balones de gas comercializada.");
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.adminNombres.trim() || !form.adminApellidos.trim()) {
      setError("Ingrese el nombre y apellidos completos del administrador titular.");
      return;
    }
    if (!form.adminEmail.trim() || !form.adminEmail.includes("@")) {
      setError("Ingrese un correo de acceso válido para el administrador.");
      return;
    }
    if (form.adminPassword.length < 6) {
      setError("La contraseña debe tener un mínimo de 6 caracteres.");
      return;
    }
    if (form.adminPassword !== form.adminPasswordConfirm) {
      setError("Las contraseñas ingresadas no coinciden.");
      return;
    }
    if (!form.aceptaTerminos) {
      setError("Debe aceptar los Términos y Condiciones de la plataforma PideGas.");
      return;
    }
    if (!form.declaraPesajeJusto) {
      setError("Debe aceptar la Declaración Jurada de Pesaje Exacto con Balanza Calibrada.");
      return;
    }

    const partesDireccion: string[] = [form.direccionCalle.trim()];
    if (form.distrito) partesDireccion.push(form.distrito);
    if (form.provincia) partesDireccion.push(form.provincia);
    if (form.departamento) partesDireccion.push(form.departamento);
    if (form.codigoInei) partesDireccion.push(`(Ubigeo: ${form.codigoInei})`);
    if (form.registroOsinergmin.trim()) partesDireccion.push(`[DGH: ${form.registroOsinergmin.trim()}]`);
    if (form.latitud && form.longitud) partesDireccion.push(`[GPS: ${form.latitud}, ${form.longitud}]`);

    const marcasStr = form.marcasGas.join("/");
    const metaStr = `[Tipo: ${form.tipoDistribuidora} | Marcas: ${marcasStr} | Horario: ${form.horaApertura}-${form.horaCierre} | Cargo: ${form.adminCargo}]`;
    partesDireccion.push(metaStr);

    const payload: RegistroEmpresaPayload = {
      ruc: form.ruc.trim(),
      nombreComercial: form.nombreComercial.trim(),
      razonSocial: form.razonSocial.trim() || form.nombreComercial.trim(),
      telefono: form.telefono.trim(),
      emailContacto: form.emailContacto.trim().toLowerCase(),
      direccionFiscal: partesDireccion.join(", "),
      adminEmail: form.adminEmail.trim().toLowerCase(),
      adminPassword: form.adminPassword,
      adminNombres: form.adminNombres.trim(),
      adminApellidos: form.adminApellidos.trim(),
    };

    startTransition(async () => {
      try {
        await empresasApi.registrarEmpresa(payload);
        setExito(true);
      } catch (err: any) {
        setError(err.message || "Error al registrar la empresa en la plataforma.");
      }
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const rucValido = /^(10|20)\d{9}$/.test(form.ruc.trim());

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* ========================================================
          1. HEADER TOP UTILITY BAR (Estilo Mediplace index.html)
         ======================================================== */}
      <div className="bg-[#03246b] text-white text-xs py-2.5 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-white font-medium">
              <Phone className="w-3.5 h-3.5 text-orange-400" />
              Central de Afiliaciones: <strong className="text-orange-400 font-bold">+51 922 767 224</strong>
            </span>
            <span className="hidden md:inline-block text-blue-300/40">|</span>
            <span className="hidden md:flex items-center gap-1.5 text-slate-200">
              <Mail className="w-3.5 h-3.5 text-orange-400" />
              empresas@pidegas.pe
            </span>
            <span className="hidden lg:inline-block text-blue-300/40">|</span>
            <span className="hidden lg:flex items-center gap-1.5 text-slate-200">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              Lunes a Sábado 07:00 AM - 08:00 PM
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="#asesoria"
              className="hover:text-orange-400 text-slate-200 transition"
            >
              Asesoría de Operaciones
            </a>
            <span className="text-blue-300/40">|</span>
            <Link
              href="/auth/login"
              className="text-orange-400 font-bold hover:text-orange-300 transition flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              Acceso a Socios
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. NAVEGACIÓN PRINCIPAL (Estilo main-header de Mediplace)
         ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo PideGas Corporativo */}
          <Link href="/" className="flex items-center gap-3 group">
            <BrandLogo variant="dark" />
          </Link>

          {/* Menú de Enlaces Estilo Mediplace */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-[#03246b]">
            <Link href="/" className="hover:text-orange-600 transition">
              Inicio
            </Link>
            <a href="#beneficios" className="hover:text-orange-600 transition">
              Beneficios Red
            </a>
            <a href="#formulario" className="hover:text-orange-600 transition text-orange-600 font-bold">
              Afiliar Empresa
            </a>
            <a href="#asesoria" className="hover:text-orange-600 transition">
              Asesoría
            </a>
            <a href="#contacto" className="hover:text-orange-600 transition">
              Contacto
            </a>
          </nav>

          {/* Botones de Acción Estilo Mediplace thm-btn */}
          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="hidden sm:inline-flex items-center font-bold text-xs uppercase tracking-wider text-[#03246b] hover:text-orange-600 transition px-3 py-2"
            >
              Ingresar
            </Link>
            <button
              type="button"
              onClick={() => scrollToSection("formulario")}
              className="group relative inline-flex items-center gap-2.5 bg-[#03246b] hover:bg-orange-600 text-white rounded-full p-1 pr-4.5 font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-orange-600/20 cursor-pointer"
            >
              <span className="w-7 h-7 rounded-full bg-[#1c58d5] group-hover:bg-white text-white group-hover:text-orange-600 flex items-center justify-center transition-all duration-300 shrink-0">
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
              <span>Afiliar mi Empresa</span>
            </button>
          </div>
        </div>
      </header>


      {/* ========================================================
          4. SECCIÓN 1: ABOUT ONE (Adaptado fielmente de Mediplace index.html)
         ======================================================== */}
      <section id="beneficios" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Columna Izquierda: Composición de Imágenes Mediplace (about-one__left) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none pb-14 sm:pb-20 lg:pb-10">
              
              {/* Imagen 1 (about-one__img-one) */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-100 dark:border-neutral-800 aspect-4/5 w-full bg-slate-100 dark:bg-neutral-800">
                <Image
                  src="/mediplace/images/resources/about-one-img-1.jpg?v=2"
                  alt="Operaciones y distribución de gas PideGas"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              {/* Imagen 2 Superpuesta (about-one__img-two) */}
              <div className="absolute -bottom-6 -right-4 sm:-bottom-8 sm:-right-6 w-48 sm:w-60 aspect-4/3 rounded-3xl overflow-hidden shadow-2xl border-6 sm:border-8 border-white dark:border-neutral-900 bg-slate-200 dark:bg-neutral-800 z-10">
                <Image
                  src="/mediplace/images/resources/about-one-img-2.jpg?v=2"
                  alt="Pesaje exacto y balanza digital"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

              {/* Círculo Rotativo / Overlay Badge (about-one__circle-text) */}
              <div className="absolute top-1/2 -left-4 sm:-left-8 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center">
                <div className="relative w-36 h-36 rounded-full bg-orange-600 text-white shadow-2xl p-2 flex items-center justify-center border-4 border-white dark:border-neutral-900">
                  {/* Texto Curvado SVG con rotación continua */}
                  <svg className="w-full h-full animate-spin-slow pointer-events-none" viewBox="0 0 100 100">
                    <path
                      id="curvedCirclePath"
                      d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                      fill="none"
                    />
                    <text className="text-[9px] font-black uppercase tracking-[2.8px] fill-white">
                      <textPath href="#curvedCirclePath" startOffset="0%">
                        • PIDEGAS PERÚ • GAS DE COCINA •
                      </textPath>
                    </text>
                  </svg>

                  {/* Icono Central con acción interactiva */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
                    <button
                      type="button"
                      onClick={() => scrollToSection("formulario")}
                      className="w-12 h-12 rounded-full bg-[#03246b] hover:bg-white text-white hover:text-orange-600 flex items-center justify-center transition-all duration-300 shadow-md group cursor-pointer"
                      title="Comenzar Afiliación"
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Columna Derecha: Contenido Mediplace (about-one__right) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tagline estilo Mediplace (section-title__tagline-box) */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-orange-600 text-xs font-black uppercase tracking-widest bg-orange-50 dark:bg-orange-950/40 px-3.5 py-1.5 rounded-full border border-orange-200 dark:border-orange-900">
                <Store className="w-3.5 h-3.5 text-orange-600" />
                <span>Alianza Estratégica B2B</span>
              </div>

              {/* Título Principal Mediplace (section-title__title title-animation) */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#03246b] dark:text-white tracking-tight leading-[1.15]">
                Soluciones Avanzadas para <br />
                <span className="text-orange-600 underline decoration-orange-600/30 underline-offset-8">
                  Distribuidoras
                </span>{" "}
                de Gas de Cocina
              </h2>
            </div>

            {/* Párrafo descriptivo (about-one__text) */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-400 leading-relaxed font-normal">
              Incorpore sus locales comerciales, camiones y repartidores a la plataforma digital líder en el Perú. Optimice sus rutas de entrega, fiscalice el pesaje exacto frente a sus clientes y aumente su volumen de venta diario con tecnología de asignación automática por GPS.
            </p>

            {/* Bloque de Puntos y Experiencia juntos (about-one__points-and-experience-box) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center pt-2">
              
              {/* Lista de Puntos con Check (about-one__points-box) */}
              <ul className="sm:col-span-7 space-y-3.5 text-xs sm:text-sm font-bold text-[#03246b] dark:text-white">
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <span>Enrutamiento GPS Inteligente por geocercas</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <span>Balanzas digitales calibradas con tolerancia 0g</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <span>Facturación y boleta electrónica SUNAT al instante</span>
                </li>
              </ul>

              {/* Caja de Experiencia (about-one__experience-box) */}
              <div className="sm:col-span-5 bg-[#03246b] text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden flex items-center justify-between border border-blue-900">
                <div className="space-y-0.5 relative z-10">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-orange-400 leading-none">
                      +15
                    </span>
                    <span className="text-xs font-black uppercase text-slate-300">
                      Años
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white leading-tight pt-1">
                    De Experiencia
                  </div>
                  <p className="text-[10px] text-slate-300 font-normal">
                    Liderando distribución de gas de cocina
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-orange-400 flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* Segunda Fila de Puntos Destacados con Iconos Grandes (about-one__points-points-two-box) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:border-orange-500/40 hover:shadow-md transition group">
                <div className="w-14 h-14 rounded-2xl bg-[#03246b] group-hover:bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md transition">
                  <Truck className="w-7 h-7 text-orange-400 group-hover:text-white transition" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#03246b] dark:text-white">
                    Flota Monitoreada
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 leading-snug">
                    Despacho en 25 - 35 min con trazabilidad en vivo.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 hover:border-orange-500/40 hover:shadow-md transition group">
                <div className="w-14 h-14 rounded-2xl bg-[#03246b] group-hover:bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md transition">
                  <ShieldCheck className="w-7 h-7 text-orange-400 group-hover:text-white transition" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#03246b] dark:text-white">
                    Respaldo Legal DGH
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 leading-snug">
                    100% formal y fiscalizado según Osinergmin.
                  </p>
                </div>
              </div>
            </div>

            {/* Botón de Acción y Llamada Directa (about-one__btn-and-call-box) */}
            <div className="pt-3 flex flex-col sm:flex-row sm:items-center gap-6">
              <button
                type="button"
                onClick={() => scrollToSection("formulario")}
                className="group relative inline-flex items-center gap-3 bg-[#03246b] hover:bg-orange-600 text-white rounded-full p-2 pr-7 font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-orange-600/20 cursor-pointer"
              >
                <span className="w-9 h-9 rounded-full bg-[#1c58d5] group-hover:bg-white text-white group-hover:text-orange-600 flex items-center justify-center transition-all duration-300 shrink-0">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span>Comenzar Afiliación</span>
              </button>

              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 flex items-center justify-center border border-orange-200 dark:border-orange-900">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    ¿Consultas o Dudas?
                  </span>
                  <a
                    href="tel:51926131677"
                    className="font-black text-sm text-[#03246b] dark:text-white hover:text-orange-600 transition"
                  >
                    +51 926 131 677
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          5. SECCIÓN 2: FORMULARIO OFICIAL (Estilo Appointment Three de Mediplace index.html)
         ======================================================== */}
      <section id="formulario" className="py-20 bg-slate-50 dark:bg-neutral-900/50 border-y border-slate-200/80 dark:border-neutral-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-10">
          
          {/* Encabezado Centrado estilo Mediplace (section-title text-center) */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 text-orange-600 text-xs font-black uppercase tracking-widest bg-orange-50 px-3.5 py-1.5 rounded-full border border-orange-200">
              <Store className="w-3.5 h-3.5" />
              <span>Registro de Afiliación Inmediata</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#03246b] dark:text-white tracking-tight">
              Solicite la Afiliación de su <br />
              <span className="text-orange-600 underline decoration-orange-600/30 underline-offset-8">
                Empresa Distribuidora
              </span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed font-normal">
              Complete los datos en 3 sencillos pasos. Nuestros coordinadores de plataforma activarán su cuenta comercial y geocercas de reparto en menos de 24 horas.
            </p>
          </div>

          {/* Tarjeta del Formulario estilo Mediplace Appointment Form */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200/90 dark:border-neutral-800 shadow-xl p-7 sm:p-12 relative">
            {exito ? (
              /* PANTALLA DE ÉXITO */
              <div className="text-center py-10 space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shadow-lg shadow-emerald-500/20">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Registro Recibido con Éxito
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white">
                    ¡Solicitud de Afiliación Registrada!
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto leading-relaxed">
                    Hemos registrado los datos de <strong>{form.nombreComercial}</strong> con RUC <strong>{form.ruc}</strong>. Nuestro equipo comercial verificará la información y habilitará tu acceso en menos de 24 horas.
                  </p>
                </div>

                {/* Resumen de Datos Registrados */}
                <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 text-left text-xs space-y-2.5 max-w-md mx-auto border border-neutral-200 dark:border-neutral-700">
                  <div className="flex justify-between items-center py-1 border-b border-neutral-200 dark:border-neutral-700">
                    <span className="text-neutral-500">Jurisdicción de Reparto:</span>
                    <strong className="text-neutral-900 dark:text-white">
                      {form.distrito}, {form.provincia}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-neutral-200 dark:border-neutral-700">
                    <span className="text-neutral-500">Marcas Registradas:</span>
                    <strong className="text-neutral-900 dark:text-white">
                      {form.marcasGas.join(", ")}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-neutral-200 dark:border-neutral-700">
                    <span className="text-neutral-500">Horario de Operación:</span>
                    <strong className="text-neutral-900 dark:text-white">
                      {form.horaApertura} - {form.horaCierre}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-neutral-500">Tiempo Estimado de Activación:</span>
                    <strong className="text-orange-600 dark:text-orange-400">Menos de 24 horas</strong>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-lg shadow-orange-600/25 transition"
                  >
                    Ir al Inicio de Sesión
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/"
                    className="inline-flex items-center justify-center px-7 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  >
                    Volver a la Página Principal
                  </Link>
                </div>
              </div>
            ) : (
              /* FORMULARIO STEPPER LIMPIO & CORPORATIVO */
              <div className="space-y-6">
                {/* Stepper Tabs */}
                <div className="space-y-2 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-medium">Paso {paso} de 3</span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {paso === 1 ? "1. RUC & Datos Comerciales" : paso === 2 ? "2. Ubicación & Marcas" : "3. Cuenta de Administrador"}
                    </span>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: paso === 1 ? "33%" : paso === 2 ? "66%" : "100%" }}
                    />
                  </div>

                  {/* Pasos / Pestañas */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setPaso(1)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                        paso === 1
                          ? "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800"
                          : paso > 1
                          ? "bg-neutral-50 text-emerald-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-emerald-400"
                          : "text-neutral-400 hover:text-neutral-600"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-current text-white font-black shrink-0">
                        {paso > 1 ? "✓" : "1"}
                      </span>
                      <span className="truncate hidden sm:inline">1. RUC & Negocio</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => validarPaso1() && setPaso(2)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                        paso === 2
                          ? "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800"
                          : paso > 2
                          ? "bg-neutral-50 text-emerald-600 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-emerald-400"
                          : "text-neutral-400 hover:text-neutral-600"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-current text-white font-black shrink-0">
                        {paso > 2 ? "✓" : "2"}
                      </span>
                      <span className="truncate hidden sm:inline">2. Ubicación & Marcas</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => validarPaso1() && validarPaso2() && setPaso(3)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                        paso === 3
                          ? "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800"
                          : "text-neutral-400 hover:text-neutral-600"
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-current text-white font-black shrink-0">
                        3
                      </span>
                      <span className="truncate hidden sm:inline">3. Administrador</span>
                    </button>
                  </div>
                </div>

                {/* Banner de Error */}
                {error && (
                  <div className="p-3.5 rounded-2xl text-xs bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    <span className="font-medium leading-relaxed">{error}</span>
                  </div>
                )}

                {/* ========================================================
                    PASO 1: Empresa & SUNAT
                   ======================================================== */}
                {paso === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-orange-600" />
                        Datos Registrales y Modelo de Negocio
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Identificación tributaria y categoría de su distribuidora de balones
                      </p>
                    </div>

                    {/* Selector de Tipo de Distribuidora con Cards */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
                        Tipo de Distribuidora / Modelo de Negocio *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          {
                            id: "LOCAL_MENOR",
                            titulo: "Local de Venta Menor",
                            desc: "Venta barrial a hogares y pequeños negocios",
                            icon: Store,
                          },
                          {
                            id: "MAYORISTA",
                            titulo: "Distribuidor Mayorista",
                            desc: "Despacho por volumen a restaurantes e industrias",
                            icon: Layers,
                          },
                          {
                            id: "PLANTA",
                            titulo: "Planta / Envasadora",
                            desc: "Envasado y distribución primaria de gas",
                            icon: Building2,
                          },
                        ].map((tipo) => {
                          const Icono = tipo.icon;
                          const activo = form.tipoDistribuidora === tipo.id;
                          return (
                            <button
                              key={tipo.id}
                              type="button"
                              onClick={() => setForm((prev) => ({ ...prev, tipoDistribuidora: tipo.id }))}
                              className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                                activo
                                  ? "border-orange-500 bg-orange-500/10 dark:bg-orange-500/15 ring-2 ring-orange-500/20 shadow-xs"
                                  : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full mb-1">
                                <Icono className={`w-4 h-4 ${activo ? "text-orange-600" : "text-neutral-400"}`} />
                                {activo && <Check className="w-3.5 h-3.5 text-orange-600" />}
                              </div>
                              <div>
                                <div className={`text-xs font-bold ${activo ? "text-orange-950 dark:text-orange-200" : "text-neutral-800 dark:text-neutral-200"}`}>
                                  {tipo.titulo}
                                </div>
                                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-tight">
                                  {tipo.desc}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* RUC */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                            RUC (11 dígitos) *
                          </label>
                          {rucValido ? (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-200">
                              <Check className="w-3 h-3" /> Válido
                            </span>
                          ) : form.ruc.length > 0 ? (
                            <span className="text-[10px] text-amber-600 font-medium">
                              {form.ruc.length}/11 dígitos
                            </span>
                          ) : null}
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                            <FileText className="w-4 h-4" />
                          </div>
                          <input
                            name="ruc"
                            type="text"
                            maxLength={11}
                            required
                            placeholder="Ej. 20601234567"
                            value={form.ruc}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              setForm((prev) => ({ ...prev, ruc: val }));
                            }}
                            className={`w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border bg-neutral-50/50 dark:bg-neutral-900 font-mono transition focus:bg-white focus:outline-hidden focus:ring-2 ${
                              rucValido
                                ? "border-emerald-500 focus:ring-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                                : "border-neutral-200 dark:border-neutral-800 focus:ring-orange-500/20 focus:border-orange-500"
                            }`}
                          />
                        </div>
                      </div>

                      {/* Nombre Comercial */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Nombre Comercial del Negocio *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                            <Store className="w-4 h-4" />
                          </div>
                          <input
                            name="nombreComercial"
                            type="text"
                            required
                            placeholder="Ej. Solgas Express Los Olivos"
                            value={form.nombreComercial}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 transition focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {/* Razón Social */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Razón Social (Registrada en SUNAT)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <input
                            name="razonSocial"
                            type="text"
                            placeholder="Ej. Distribuidora Gas Norte S.A.C."
                            value={form.razonSocial}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 transition focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {/* Teléfono de Pedidos */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Teléfono de Pedidos / WhatsApp *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                            <Phone className="w-4 h-4" />
                          </div>
                          <input
                            name="telefono"
                            type="tel"
                            required
                            placeholder="Ej. 987 654 321"
                            value={form.telefono}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 transition focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* Correo Comercial */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Correo Comercial / Facturación *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                            <Mail className="w-4 h-4" />
                          </div>
                          <input
                            name="emailContacto"
                            type="email"
                            required
                            placeholder="ventas@tudistribuidora.pe"
                            value={form.emailContacto}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 transition focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                        </div>
                      </div>

                      {/* Enlace Web / Redes */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                            Página Web o Facebook
                          </label>
                          <span className="text-[10px] text-neutral-400">Opcional</span>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                            <Globe className="w-4 h-4" />
                          </div>
                          <input
                            name="enlaceWebRedes"
                            type="url"
                            placeholder="https://facebook.com/midistribuidora"
                            value={form.enlaceWebRedes}
                            onChange={handleChange}
                            className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 transition focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Navegación Paso 1 */}
                    <div className="pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
                      <Link
                        href="/auth/login"
                        className="text-xs font-semibold text-neutral-500 hover:text-orange-600 transition"
                      >
                        ¿Ya estás registrado? Inicia sesión
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          if (validarPaso1()) setPaso(2);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-md shadow-orange-600/20 active:scale-95"
                      >
                        Siguiente: Ubicación & Marcas
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ========================================================
                    PASO 2: Ubicación & Marcas
                   ======================================================== */}
                {paso === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-600" />
                        Ubicación del Almacén, Marcas y Capacidad
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Zonas de cobertura distrital y stock de balones comercializados
                      </p>
                    </div>

                    {/* Ubigeo Selector */}
                    <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-orange-600" />
                          Sede Principal del Almacén (Ubigeo INEI)
                        </span>
                        {form.codigoInei ? (
                          <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                            Ubigeo: {form.codigoInei}
                          </span>
                        ) : cargandoUbigeo ? (
                          <span className="text-[10px] text-neutral-400 animate-pulse">Cargando ubigeo...</span>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Departamento */}
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                            Departamento *
                          </label>
                          <select
                            value={form.departamento}
                            onChange={handleDepartamentoChange}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          >
                            {departamentos.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Provincia */}
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                            Provincia *
                          </label>
                          <select
                            value={form.provincia}
                            onChange={handleProvinciaChange}
                            disabled={provincias.length === 0}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-50"
                          >
                            {provincias.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Distrito */}
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                            Distrito Sede *
                          </label>
                          <select
                            value={form.distrito}
                            onChange={handleDistritoChange}
                            disabled={distritos.length === 0}
                            className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 font-bold text-orange-600 dark:text-orange-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-50"
                          >
                            {distritos.map((d) => (
                              <option key={d.codigoInei} value={d.distrito}>
                                {d.distrito}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Dirección Almacén & Selector en Mapa */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          Dirección del Almacén / Sede Principal *
                        </label>
                        <button
                          type="button"
                          onClick={() => setMostrarMapa(!mostrarMapa)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/60 dark:hover:bg-orange-950 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5 text-orange-600" />
                          <span>
                            {mostrarMapa
                              ? "Ocultar Mapa"
                              : form.latitud
                              ? "Modificar en Mapa"
                              : "📍 Colocar Ubicación en Mapa"}
                          </span>
                        </button>
                      </div>

                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <input
                          name="direccionCalle"
                          type="text"
                          required
                          placeholder="Ej. Av. Nicolás de Piérola 450 - Almacén Central"
                          value={form.direccionCalle}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 transition focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      {/* Notificación de Georreferenciación fijada en el mapa */}
                      {form.latitud && form.longitud && !mostrarMapa && (
                        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              <strong>Ubicación georreferenciada:</strong>{" "}
                              <span className="font-mono">{form.latitud}, {form.longitud}</span>
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setMostrarMapa(true)}
                            className="font-bold underline hover:text-emerald-900 dark:hover:text-emerald-200 text-[11px] cursor-pointer"
                          >
                            Ver en mapa
                          </button>
                        </div>
                      )}

                      {/* Selector Interactivo de Ubicación en Mapa Leaflet */}
                      {mostrarMapa && (
                        <div className="pt-2">
                          <SelectorUbicacionMapa
                            latitudInicial={form.latitud}
                            longitudInicial={form.longitud}
                            distritoNombre={form.distrito}
                            departamentoNombre={form.departamento}
                            direccionActual={form.direccionCalle}
                            onUbicacionSeleccionada={(coords) => {
                              setForm((prev) => ({
                                ...prev,
                                latitud: coords.lat,
                                longitud: coords.lng,
                                direccionCalle: prev.direccionCalle || coords.direccionSugerida || prev.direccionCalle,
                              }));
                              setMostrarMapa(false);
                            }}
                            onCerrar={() => setMostrarMapa(false)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Marcas de Balones */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-orange-600" />
                          Marcas de Balones Disponibles en Stock *
                        </label>
                        <span className="text-[10px] text-neutral-400">Selección múltiple</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {MARCAS_DISPONIBLES.map((marca) => {
                          const seleccionada = form.marcasGas.includes(marca.id);
                          return (
                            <button
                              key={marca.id}
                              type="button"
                              onClick={() => toggleMarcaGas(marca.id)}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                                seleccionada
                                  ? `${marca.color} border-current ring-2 ring-orange-500/20 shadow-xs`
                                  : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
                              }`}
                            >
                              {seleccionada ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-neutral-400" />}
                              {marca.nombre}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Horarios y DGH */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Hora de Apertura *
                        </label>
                        <input
                          name="horaApertura"
                          type="time"
                          value={form.horaApertura}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Hora de Cierre *
                        </label>
                        <input
                          name="horaCierre"
                          type="time"
                          value={form.horaCierre}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                            Código DGH
                          </label>
                          <span className="text-[10px] text-neutral-400">Opcional</span>
                        </div>
                        <input
                          name="registroOsinergmin"
                          type="text"
                          placeholder="DGH-45892"
                          value={form.registroOsinergmin}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Flota de Reparto */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Flota de Reparto
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {[
                          { valor: "1 a 3 unidades", label: "1 a 3 Unidades", sub: "Motos / Furgones barriales" },
                          { valor: "4 a 8 unidades", label: "4 a 8 Unidades", sub: "Cobertura distrital completa" },
                          { valor: "Más de 8 unidades", label: "+8 Unidades", sub: "Flota grande / Multizona" },
                        ].map((fl) => {
                          const activo = form.unidadesFlota === fl.valor;
                          return (
                            <button
                              key={fl.valor}
                              type="button"
                              onClick={() => setForm((prev) => ({ ...prev, unidadesFlota: fl.valor }))}
                              className={`p-3 rounded-xl border text-left transition ${
                                activo
                                  ? "border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20"
                                  : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{fl.label}</span>
                                {activo && <Check className="w-3.5 h-3.5 text-orange-600" />}
                              </div>
                              <span className="text-[10px] text-neutral-400 block mt-0.5">{fl.sub}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Navegación Paso 2 */}
                    <div className="pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={() => setPaso(1)}
                        className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Paso Anterior
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (validarPaso2()) setPaso(3);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition flex items-center gap-2 shadow-md shadow-orange-600/20 active:scale-95"
                      >
                        Siguiente: Cuenta de Administrador
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ========================================================
                    PASO 3: Administrador Titular
                   ======================================================== */}
                {paso === 3 && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                        <User className="w-4 h-4 text-orange-600" />
                        Cuenta del Titular y Validación Documental
                      </h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Credenciales para acceder al panel de administración de PideGas
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {/* Nombres */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Nombres del Titular *
                        </label>
                        <input
                          name="adminNombres"
                          type="text"
                          required
                          placeholder="Ej. Roberto"
                          value={form.adminNombres}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 transition focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      {/* Apellidos */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Apellidos del Titular *
                        </label>
                        <input
                          name="adminApellidos"
                          type="text"
                          required
                          placeholder="Ej. Gómez Silva"
                          value={form.adminApellidos}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 transition focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      {/* Cargo */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Cargo en la Distribuidora *
                        </label>
                        <select
                          name="adminCargo"
                          value={form.adminCargo}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        >
                          <option value="DUENO">Dueño / Propietario</option>
                          <option value="GERENTE">Gerente General</option>
                          <option value="ADMINISTRADOR">Administrador de Sede</option>
                          <option value="JEFE_DESPACHO">Jefe de Despacho y Flota</option>
                        </select>
                      </div>

                      {/* DNI */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          DNI del Titular (8 dígitos)
                        </label>
                        <input
                          name="adminDni"
                          type="text"
                          maxLength={8}
                          placeholder="8 dígitos DNI"
                          value={form.adminDni}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setForm((prev) => ({ ...prev, adminDni: val }));
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 font-mono transition focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      {/* Celular Directo */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Celular Personal Directo
                        </label>
                        <input
                          name="adminCelular"
                          type="tel"
                          placeholder="Ej. 988 777 666"
                          value={form.adminCelular}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 transition focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                        />
                      </div>

                      {/* Email de Login */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Correo de Acceso Principal *
                        </label>
                        <input
                          name="adminEmail"
                          type="email"
                          required
                          placeholder="admin@tudistribuidora.pe"
                          value={form.adminEmail}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 transition focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                      </div>

                      {/* Contraseña */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Contraseña de Acceso *
                        </label>
                        <div className="relative">
                          <input
                            name="adminPassword"
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Mínimo 6 caracteres"
                            value={form.adminPassword}
                            onChange={handleChange}
                            className="w-full px-3 pr-9 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 transition focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Confirmar Contraseña */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Confirmar Contraseña *
                        </label>
                        <div className="relative">
                          <input
                            name="adminPasswordConfirm"
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            placeholder="Repita la contraseña"
                            value={form.adminPasswordConfirm}
                            onChange={handleChange}
                            className={`w-full px-3 pr-9 py-2 text-xs rounded-xl border bg-neutral-50/50 dark:bg-neutral-900 transition focus:bg-white focus:outline-hidden focus:ring-2 ${
                              form.adminPasswordConfirm && form.adminPasswordConfirm !== form.adminPassword
                                ? "border-rose-500 focus:ring-rose-500/20"
                                : "border-neutral-200 dark:border-neutral-800 focus:ring-orange-500/20 focus:border-orange-500"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 transition"
                          >
                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Archivo RUC Opcional */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                            Ficha RUC o DGH
                          </label>
                          <span className="text-[10px] text-neutral-400">Opcional</span>
                        </div>
                        <label className="flex items-center gap-2 px-3 py-2 text-xs border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition">
                          <UploadCloud className="w-4 h-4 text-orange-600 shrink-0" />
                          <span className="truncate text-neutral-600 dark:text-neutral-400">
                            {form.archivoAdjuntoNombre || "Adjuntar archivo"}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Términos y Declaraciones */}
                    <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800 space-y-2.5 text-xs text-neutral-600 dark:text-neutral-400">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          name="aceptaTerminos"
                          type="checkbox"
                          checked={form.aceptaTerminos}
                          onChange={handleChange}
                          className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-orange-600 focus:ring-orange-500 accent-orange-600"
                        />
                        <span className="leading-snug">
                          Declaro que la información de <strong>{form.nombreComercial || "la distribuidora"}</strong> es verídica y acepto los{" "}
                          <Link href="/terminos-servicio" className="text-orange-600 hover:underline font-semibold" target="_blank">
                            Términos del Servicio
                          </Link>{" "}
                          y las{" "}
                          <Link href="/politica-privacidad" className="text-orange-600 hover:underline font-semibold" target="_blank">
                            Políticas de Privacidad
                          </Link>
                          .
                        </span>
                      </label>

                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          name="declaraPesajeJusto"
                          type="checkbox"
                          checked={form.declaraPesajeJusto}
                          onChange={handleChange}
                          className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-orange-600 focus:ring-orange-500 accent-orange-600"
                        />
                        <span className="leading-snug">
                          Me comprometo a que las unidades de reparto cuenten con <strong>balanza digital calibrada</strong> para realizar la comprobación de pesaje exacto frente al cliente.
                        </span>
                      </label>
                    </div>

                    {/* Navegación y Envío Final */}
                    <div className="pt-4 flex items-center justify-between border-t border-neutral-100 dark:border-neutral-800">
                      <button
                        type="button"
                        onClick={() => setPaso(2)}
                        disabled={isPending}
                        className="px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition flex items-center gap-1.5"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Paso Anterior
                      </button>

                      <button
                        type="submit"
                        disabled={isPending}
                        className="px-7 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs transition flex items-center gap-2 shadow-lg shadow-orange-600/30 active:scale-95 disabled:opacity-50"
                      >
                        {isPending ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Registrando Empresa...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Enviar Solicitud de Afiliación
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          6. SECCIÓN 3: BANNER CTA DE ASESORÍA (Estilo slogan-one de Mediplace)
         ======================================================== */}
      <section id="asesoria" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-[#021849] via-[#03246b] to-[#021849] text-white p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl border border-blue-900/60">
          {/* Formas y brillos decorativos estilo Mediplace */}
          <div className="absolute top-0 right-10 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-5">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-widest bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Asesoría Estratégica para Distribuidoras</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Agende una Asesoría de Operaciones con <br className="hidden sm:inline" />
              <span className="text-orange-400 underline decoration-orange-400/40 underline-offset-8">
                Nuestros Expertos
              </span>
            </h2>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
              Optimice las rutas de sus repartidores, reduzca mermas operativas y acelere el despacho en su zona con soporte tecnológico de nivel corporativo.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => scrollToSection("formulario")}
                className="group relative inline-flex items-center gap-3 bg-orange-600 hover:bg-orange-500 text-white rounded-full p-2.5 pr-8 font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-xl shadow-orange-600/30 cursor-pointer"
              >
                <span className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center group-hover:bg-white group-hover:text-orange-600 transition">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
                <span>Afiliar mi Empresa Ahora</span>
              </button>

              <a
                href="https://wa.me/51922767224?text=Hola%20PideGas!%20Deseo%20coordinar%20una%20asesor%C3%ADa%20para%20afiliar%20mi%20distribuidora."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full border-2 border-white/30 hover:border-white text-white font-bold text-xs uppercase tracking-wider transition backdrop-blur-xs bg-white/10 hover:bg-white/20"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Contactar por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. SECCIÓN 4: SOPORTE TÉCNICO Y CONTACTO (Estilo Mediplace)
         ======================================================== */}
      <section id="contacto" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-neutral-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Columna Izquierda: Tarjeta Corporativa Navy estilo Mediplace */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-[2rem] p-8 sm:p-10 bg-[#03246b] text-white shadow-2xl border border-blue-900 relative overflow-hidden space-y-6">
              
              {/* Círculo decorativo de fondo */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#1c58d5]/40 rounded-full blur-2xl pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-400/30 flex items-center justify-center">
                <Headphones className="w-7 h-7" />
              </div>

              <div className="space-y-2 relative z-10">
                <span className="text-xs uppercase font-extrabold tracking-widest text-orange-400">
                  Mesa de Ayuda Continua
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Soporte Especializado al Distribuidor
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  Contamos con un equipo de ingenieros y coordinadores zonales listos para resolver incidencias de reparto, sincronización de precios y asistencia en la app del chofer.
                </p>
              </div>

              <div className="pt-4 border-t border-blue-800/80 grid grid-cols-2 gap-4 text-xs relative z-10">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Tiempo de Respuesta</span>
                  <strong className="text-white text-sm">Menos de 5 min</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Canal Directo</span>
                  <strong className="text-emerald-400 text-sm">WhatsApp & Teléfono</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjetas de Información de Contacto */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-orange-600 text-xs font-black uppercase tracking-widest bg-orange-50 px-3.5 py-1.5 rounded-full border border-orange-200">
                <Phone className="w-3.5 h-3.5" />
                <span>¿Necesita Asistencia Inmediata?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#03246b] dark:text-white tracking-tight leading-tight">
                Contacte con Nuestro Soporte Técnico Especializado
              </h2>
              <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed font-normal">
                Comuníquese con nuestra central para recibir orientación en el proceso de afiliación, activación de geocercas o integración de balanzas digitales.
              </p>
            </div>

            {/* Listado de Contacto con Rounded Icon Boxes */}
            <div className="space-y-3.5">
              {/* Item 1: Área Comercial */}
              <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-orange-500/40 hover:shadow-md transition group">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 group-hover:bg-orange-600 group-hover:text-white flex items-center justify-center shrink-0 transition">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Área Comercial & Afiliaciones B2B
                  </span>
                  <a
                    href="tel:+51934861839"
                    className="text-base font-extrabold text-[#03246b] dark:text-white hover:text-orange-600 transition"
                  >
                    +51 934 861 839
                  </a>
                </div>
              </div>

              {/* Item 2: Soporte al Afiliado */}
              <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-blue-500/40 hover:shadow-md transition group">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 group-hover:bg-[#1c58d5] group-hover:text-white flex items-center justify-center shrink-0 transition">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Mesa de Ayuda al Afiliado & Chofer
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href="tel:+51922767224"
                      className="text-base font-extrabold text-[#03246b] dark:text-white hover:text-orange-600 transition"
                    >
                      +51 922 767 224
                    </a>
                    <span className="text-xs text-slate-400">/ central@pidegas.pe</span>
                  </div>
                </div>
              </div>

              {/* Item 3: Horarios de Atención */}
              <div className="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 hover:border-emerald-500/40 hover:shadow-md transition group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center shrink-0 transition">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Horario de Atención de Operaciones
                  </span>
                  <span className="text-sm font-bold text-[#03246b] dark:text-white">
                    Lunes a Domingo: 06:00 AM – 09:00 PM
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          8. FOOTER CORPORATIVO (Estilo site-footer de Mediplace)
         ======================================================== */}
      <footer className="bg-[#021849] text-white pt-16 pb-8 border-t border-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-blue-900/60">
            
            {/* Columna 1: Info y Logo */}
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <BrandLogo variant="light" />
              </Link>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Plataforma tecnológica peruana líder en despacho y distribución de gas de cocina con balanzas calibradas certificadas y monitoreo en tiempo real.
              </p>
              <div className="text-xs text-orange-400 font-bold">
                SCOP Registro Nº 20491-GLP
              </div>
            </div>

            {/* Columna 2: Enlaces Rápidos */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <Link href="/" className="hover:text-orange-400 transition">
                    Inicio
                  </Link>
                </li>
                <li>
                  <a href="#beneficios" className="hover:text-orange-400 transition">
                    Beneficios para Distribuidoras
                  </a>
                </li>
                <li>
                  <a href="#formulario" className="hover:text-orange-400 transition">
                    Solicitar Registro de Empresa
                  </a>
                </li>
                <li>
                  <Link href="/auth/login" className="hover:text-orange-400 transition">
                    Iniciar Sesión
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna 3: Seguridad & Regulación */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Seguridad & Regulación</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>Conforme a normativa Osinergmin</li>
                <li>Registro DGH de Hidrocarburos</li>
                <li>Balanza Calibrada NTP 350.011</li>
                <li>
                  <Link href="/libro-reclamaciones" className="hover:text-orange-400 transition">
                    Libro de Reclamaciones
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna 4: Galería de Despacho (Estilo Mediplace) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Galería de Despacho</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="relative h-16 rounded-xl overflow-hidden bg-blue-900 border border-blue-800">
                  <Image
                    src="/mediplace/images/resources/footer-widget-two-gallery-1-1.jpg"
                    alt="Despacho 1"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-16 rounded-xl overflow-hidden bg-blue-900 border border-blue-800">
                  <Image
                    src="/mediplace/images/resources/footer-widget-two-gallery-1-2.jpg"
                    alt="Despacho 2"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-16 rounded-xl overflow-hidden bg-blue-900 border border-blue-800">
                  <Image
                    src="/mediplace/images/resources/footer-widget-two-gallery-1-3.jpg"
                    alt="Despacho 3"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-16 rounded-xl overflow-hidden bg-blue-900 border border-blue-800">
                  <Image
                    src="/mediplace/images/resources/footer-widget-two-gallery-1-4.jpg"
                    alt="Despacho 4"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-16 rounded-xl overflow-hidden bg-blue-900 border border-blue-800">
                  <Image
                    src="/mediplace/images/resources/footer-widget-two-gallery-1-5.jpg"
                    alt="Despacho 5"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-16 rounded-xl overflow-hidden bg-blue-900 border border-blue-800">
                  <Image
                    src="/mediplace/images/resources/footer-widget-two-gallery-1-6.jpg"
                    alt="Despacho 6"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Subfooter */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} PideGas Perú S.A.C. Todos los derechos reservados.</p>
            <div className="flex items-center gap-4">
              <Link href="/terminos-servicio" className="hover:text-slate-300 transition">
                Términos del Servicio
              </Link>
              <span>•</span>
              <Link href="/politica-privacidad" className="hover:text-slate-300 transition">
                Políticas de Privacidad
              </Link>
            </div>
          </div>

        </div>
      </footer>

      {/* ========================================================
          9. BOTÓN FLOTANTE DE WHATSAPP (Idéntico a JoinChat en GYA)
         ======================================================== */}
      <a
        href="https://wa.me/51922767224?text=Hola%20PideGas!%20Necesito%20m%C3%A1s%20informaci%C3%B3n%20sobre%20la%20Afiliaci%C3%B3n%20de%20mi%20empresa%20distribuidora."
        target="_blank"
        rel="noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition duration-300 group"
      >
        <MessageCircle className="w-6 h-6 fill-white text-transparent" />
        <span className="text-xs font-bold hidden sm:inline-block pr-1">
          ¿Deseas afiliarte? Chatea con nosotros
        </span>
      </a>
    </div>
  );
}
