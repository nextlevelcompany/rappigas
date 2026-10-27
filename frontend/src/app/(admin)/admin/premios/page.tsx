"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Gift,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Package,
  Layers,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  ShoppingBag,
  Ticket,
  Flame,
  ArrowUpDown,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  TrendingDown,
  Boxes,
  Upload,
  Image as ImageIcon,
  Settings,
  Palette,
  Check,
  ListPlus,
  FileText,
  Tag,
  Info,
  Truck,
} from "lucide-react";
import {
  PremioCanje,
  CategoriaPremio,
  CATEGORIAS_CONFIG_DEFAULT,
  obtenerCategorias,
  guardarCategorias,
  agregarCategoria,
  actualizarCategoria,
  eliminarCategoria,
  restablecerCategorias,
  obtenerCatalogoPremios,
  guardarCatalogoPremios,
  agregarPremio,
  actualizarPremio,
  eliminarPremio,
  actualizarStockPremio,
  PREMIOS_ZETA_PREMIA,
} from "@/app/(cliente)/cliente/canjes/premios-data";

// Paletas de color disponibles para categorías personalizadas
const PALETAS_CATEGORIA = [
  { id: "orange", label: "Naranja", badgeCls: "bg-orange-50 text-orange-700 border-orange-200" },
  { id: "amber", label: "Ámbar / Oro", badgeCls: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "blue", label: "Azul Eléctrico", badgeCls: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "emerald", label: "Verde Esmeralda", badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "purple", label: "Púrpura", badgeCls: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "indigo", label: "Índigo / Violeta", badgeCls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "rose", label: "Rosa / Carmesí", badgeCls: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "slate", label: "Gris Grafito", badgeCls: "bg-slate-100 text-slate-700 border-slate-300" },
];

// Emojis sugeridos para categorías
const EMOJIS_SUGERIDOS = ["🎁", "🔥", "🍳", "🔌", "🏠", "📱", "🔧", "🧸", "🐾", "🎮", "🚴", "⚽", "🚗", "👕", "💡", "☕", "🌟", "🧴"];

// Imágenes predeterminadas sugeridas
const IMAGENES_PREDETERMINADAS = [
  { label: "Balón 10kg Premium", url: "/products/balon-10kg-premium.svg" },
  { label: "Balón 15kg Premium", url: "/products/balon-15kg-premium.svg" },
  { label: "Balón 45kg Industrial", url: "/products/balon-45kg-industrial.svg" },
  { label: "Regulador y Válvula", url: "/products/regulador-manometro.svg" },
  { label: "Electrohogar / Cocina", url: "/products/01.png" },
  { label: "Cuidado Personal", url: "/products/02.png" },
  { label: "Hogar y Menaje", url: "/products/03.png" },
  { label: "Termos y Accesorios", url: "/products/04.png" },
  { label: "Herramientas y Auto", url: "/products/05.png" },
];

export default function AdminPremiosCanjesPage() {
  const [premios, setPremios] = useState<PremioCanje[]>([]);
  const [categorias, setCategorias] = useState<CategoriaPremio[]>(CATEGORIAS_CONFIG_DEFAULT);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [mostrarFiltros, setMostrarFiltros] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("TODOS");
  const [filtroStock, setFiltroStock] = useState<"TODOS" | "EN_STOCK" | "BAJO_STOCK" | "AGOTADO">("TODOS");
  const [orden, setOrden] = useState<"STOCK_ASC" | "STOCK_DESC" | "PUNTOS_ASC" | "PUNTOS_DESC" | "NOMBRE_ASC">("STOCK_ASC");

  const handleLimpiarFiltros = () => {
    setBusqueda("");
    setCategoriaSeleccionada("TODOS");
    setFiltroStock("TODOS");
    setOrden("STOCK_ASC");
  };

  const hayFiltrosActivos =
    busqueda.trim() !== "" ||
    categoriaSeleccionada !== "TODOS" ||
    filtroStock !== "TODOS" ||
    orden !== "STOCK_ASC";

  // Modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [premioEnEdicion, setPremioEnEdicion] = useState<PremioCanje | null>(null);
  const [modalCategoriasAbierto, setModalCategoriasAbierto] = useState(false);
  const [categoriaEnEdicion, setCategoriaEnEdicion] = useState<CategoriaPremio | null>(null);

  // Formulario de Categoría
  const [formCategoria, setFormCategoria] = useState<{
    id: string;
    nombre: string;
    icono: string;
    badgeCls: string;
    descripcion: string;
  }>({
    id: "",
    nombre: "",
    icono: "🎁",
    badgeCls: "bg-orange-50 text-orange-700 border-orange-200",
    descripcion: "",
  });

  // Formulario de Premio
  const [formData, setFormData] = useState<{
    nombre: string;
    categoria: string;
    marca: string;
    puntos: number;
    valorSoles: number;
    stock: number;
    imagen: string;
    descripcion: string;
    codigoCupon: string;
    destacado: boolean;
    especificaciones: { clave: string; valor: string }[];
  }>({
    nombre: "",
    categoria: "GAS_VALES",
    marca: "RappiGas",
    puntos: 100,
    valorSoles: 15.0,
    stock: 50,
    imagen: "/products/balon-10kg-premium.svg",
    descripcion: "",
    codigoCupon: "VALEGAS",
    destacado: false,
    especificaciones: [],
  });

  // Referencia para input de archivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal para ajuste rápido de stock
  const [ajusteStockId, setAjusteStockId] = useState<string | null>(null);
  const [nuevoStockInput, setNuevoStockInput] = useState<number>(0);

  // Cargar catálogo y categorías
  const cargarDatos = () => {
    setCargando(true);
    setPremios(obtenerCatalogoPremios());
    setCategorias(obtenerCategorias());
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();

    const handlePremiosActualizados = () => {
      setPremios(obtenerCatalogoPremios());
    };

    const handleCategoriasActualizadas = () => {
      setCategorias(obtenerCategorias());
    };

    window.addEventListener("catalogo_premios_actualizado", handlePremiosActualizados);
    window.addEventListener("catalogo_categorias_actualizado", handleCategoriasActualizadas);

    return () => {
      window.removeEventListener("catalogo_premios_actualizado", handlePremiosActualizados);
      window.removeEventListener("catalogo_categorias_actualizado", handleCategoriasActualizadas);
    };
  }, []);

  // KPIs
  const kpis = useMemo(() => {
    const total = premios.length;
    const stockTotal = premios.reduce((acc, p) => acc + p.stock, 0);
    const agotados = premios.filter((p) => p.stock === 0).length;
    const bajoStock = premios.filter((p) => p.stock > 0 && p.stock <= 10).length;
    const stockNormal = premios.filter((p) => p.stock > 10).length;

    return {
      total,
      stockTotal,
      agotados,
      bajoStock,
      stockNormal,
      totalCategorias: categorias.filter((c) => c.id !== "TODOS").length,
    };
  }, [premios, categorias]);

  // Lista filtrada
  const premiosFiltrados = useMemo(() => {
    return premios
      .filter((p) => {
        if (categoriaSeleccionada !== "TODOS" && p.categoria !== categoriaSeleccionada) {
          return false;
        }

        if (filtroStock === "EN_STOCK" && p.stock <= 10) return false;
        if (filtroStock === "BAJO_STOCK" && (p.stock === 0 || p.stock > 10)) return false;
        if (filtroStock === "AGOTADO" && p.stock > 0) return false;

        if (busqueda.trim()) {
          const q = busqueda.toLowerCase().trim();
          const coincideNom = p.nombre.toLowerCase().includes(q);
          const coincideMar = p.marca.toLowerCase().includes(q);
          const coincideCup = p.codigoCupon.toLowerCase().includes(q);
          const coincideDes = p.descripcion.toLowerCase().includes(q);
          if (!coincideNom && !coincideMar && !coincideCup && !coincideDes) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (orden === "STOCK_ASC") return a.stock - b.stock;
        if (orden === "STOCK_DESC") return b.stock - a.stock;
        if (orden === "PUNTOS_ASC") return a.puntos - b.puntos;
        if (orden === "PUNTOS_DESC") return b.puntos - a.puntos;
        if (orden === "NOMBRE_ASC") return a.nombre.localeCompare(b.nombre);
        return 0;
      });
  }, [premios, categoriaSeleccionada, filtroStock, busqueda, orden]);

  // =========================================================================
  // GESTIÓN DE PREMIOS (CREAR / EDITAR)
  // =========================================================================
  const handleAbrirCrear = () => {
    setPremioEnEdicion(null);
    const primeraCatValida = categorias.find((c) => c.id !== "TODOS")?.id || "GAS_VALES";
    setFormData({
      nombre: "",
      categoria: primeraCatValida,
      marca: "RappiGas",
      puntos: 250,
      valorSoles: 30.0,
      stock: 25,
      imagen: "/products/01.png",
      descripcion: "Nuevo premio oficial para canje de fidelidad RappiGas.",
      codigoCupon: "CANJEPREMIA",
      destacado: false,
      especificaciones: [
        { clave: "Garantía", valor: "12 meses oficial" },
        { clave: "Material", valor: "Alta durabilidad" },
      ],
    });
    setModalAbierto(true);
  };

  const handleAbrirEditar = (premio: PremioCanje) => {
    setPremioEnEdicion(premio);
    setFormData({
      nombre: premio.nombre,
      categoria: premio.categoria,
      marca: premio.marca,
      puntos: premio.puntos,
      valorSoles: premio.valorSoles,
      stock: premio.stock,
      imagen: premio.imagen,
      descripcion: premio.descripcion,
      codigoCupon: premio.codigoCupon,
      destacado: !!premio.destacado,
      especificaciones: premio.especificaciones || [
        { clave: "Garantía", valor: "12 meses oficial" },
      ],
    });
    setModalAbierto(true);
  };

  const handleGuardarPremio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      alert("Por favor ingresa el nombre del premio");
      return;
    }

    if (premioEnEdicion) {
      actualizarPremio(premioEnEdicion.id, formData);
    } else {
      agregarPremio(formData);
    }

    setModalAbierto(false);
    cargarDatos();
  };

  const handleEliminar = (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de quitar el premio "${nombre}" del catálogo de canjes?`)) {
      return;
    }
    eliminarPremio(id);
    cargarDatos();
  };

  // Subir imagen desde el dispositivo (FileReader Base64)
  const handleSubirImagenArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP, SVG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5MB de tamaño.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const resultado = event.target?.result as string;
      if (resultado) {
        setFormData((prev) => ({ ...prev, imagen: resultado }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Especificaciones técnicas (Ficha)
  const handleAgregarEspecificacion = () => {
    setFormData((prev) => ({
      ...prev,
      especificaciones: [...prev.especificaciones, { clave: "", valor: "" }],
    }));
  };

  const handleEditarEspecificacion = (index: number, campo: "clave" | "valor", valor: string) => {
    setFormData((prev) => {
      const nuevas = [...prev.especificaciones];
      nuevas[index] = { ...nuevas[index], [campo]: valor };
      return { ...prev, especificaciones: nuevas };
    });
  };

  const handleEliminarEspecificacion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      especificaciones: prev.especificaciones.filter((_, i) => i !== index),
    }));
  };

  // Cambio rápido de stock
  const handleCambioRapidoStock = (id: string, delta: number, stockActual: number) => {
    const nuevo = Math.max(0, stockActual + delta);
    actualizarStockPremio(id, nuevo);
    cargarDatos();
  };

  const handleGuardarStockManual = (id: string) => {
    actualizarStockPremio(id, Math.max(0, nuevoStockInput));
    setAjusteStockId(null);
    cargarDatos();
  };

  const handleRestablecerCatalogo = () => {
    if (confirm("¿Deseas restablecer el catálogo a los 100 productos oficiales de Zeta Premia?")) {
      guardarCatalogoPremios(PREMIOS_ZETA_PREMIA);
      cargarDatos();
    }
  };

  // =========================================================================
  // GESTIÓN DE CATEGORÍAS
  // =========================================================================
  const handleAbrirModalCategorias = () => {
    setCategoriaEnEdicion(null);
    setFormCategoria({
      id: "",
      nombre: "",
      icono: "🎁",
      badgeCls: "bg-orange-50 text-orange-700 border-orange-200",
      descripcion: "",
    });
    setModalCategoriasAbierto(true);
  };

  const handleEditarCategoriaModal = (cat: CategoriaPremio) => {
    setCategoriaEnEdicion(cat);
    setFormCategoria({
      id: cat.id,
      nombre: cat.nombre,
      icono: cat.icono,
      badgeCls: cat.badgeCls,
      descripcion: cat.descripcion || "",
    });
  };

  const handleGuardarCategoriaForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategoria.nombre.trim()) {
      alert("Por favor ingresa un nombre para la categoría.");
      return;
    }

    if (categoriaEnEdicion) {
      actualizarCategoria(categoriaEnEdicion.id, {
        nombre: formCategoria.nombre.trim(),
        icono: formCategoria.icono.trim() || "🎁",
        badgeCls: formCategoria.badgeCls,
        descripcion: formCategoria.descripcion,
      });
    } else {
      agregarCategoria({
        id: formCategoria.id.trim() || undefined,
        nombre: formCategoria.nombre.trim(),
        icono: formCategoria.icono.trim() || "🎁",
        badgeCls: formCategoria.badgeCls,
        descripcion: formCategoria.descripcion,
      });
    }

    setCategoriaEnEdicion(null);
    setFormCategoria({
      id: "",
      nombre: "",
      icono: "🎁",
      badgeCls: "bg-orange-50 text-orange-700 border-orange-200",
      descripcion: "",
    });
    setCategorias(obtenerCategorias());
  };

  const handleEliminarCategoriaForm = (id: string, nombre: string) => {
    if (id === "TODOS") {
      alert("La categoría 'Todos los Premios' es general del sistema y no puede eliminarse.");
      return;
    }

    const productosAsociados = premios.filter((p) => p.categoria === id);
    if (productosAsociados.length > 0) {
      if (!confirm(`La categoría "${nombre}" tiene ${productosAsociados.length} premios asignados. ¿Deseas eliminarla de todas formas? Los productos mantendrán su ID.`)) {
        return;
      }
    } else {
      if (!confirm(`¿Eliminar la categoría "${nombre}"?`)) return;
    }

    eliminarCategoria(id);
    setCategorias(obtenerCategorias());
    if (categoriaSeleccionada === id) {
      setCategoriaSeleccionada("TODOS");
    }
  };

  const handleRestablecerCategoriasDefault = () => {
    if (confirm("¿Deseas restablecer las 8 categorías predeterminadas del catálogo Zeta Premia?")) {
      restablecerCategorias();
      setCategorias(obtenerCategorias());
    }
  };

  return (
    <div className="w-full px-3 sm:px-5 py-3 space-y-3 text-xs text-slate-800">
      {/* =========================================================================
          CABECERA SUPER ADMIN: ADMINISTRACIÓN DE TIENDA Y CATEGORÍAS
      ========================================================================= */}
      <div className="bg-gradient-to-r from-[#03246b] via-[#021b52] to-[#03246b] rounded-xl px-4 py-3 text-white shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 backdrop-blur-xs flex items-center justify-center border border-orange-400/30 shadow-2xs shrink-0">
            <Gift className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-400/20 text-orange-300 border border-orange-300/30">
                Super Admin • Control de Catálogo
              </span>
              <span className="text-[10px] font-medium text-slate-300">
                Tienda de Canjes • Zeta Premia
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-white leading-tight">
              Administración de Premios, Categorías y Stock
            </h1>
            <p className="text-[11px] text-slate-300">
              Configura categorías, sube imágenes directas, modifica textos y controla existencias para usuarios.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Enlace a Canjes en Curso y Entregados */}
          <Link
            href="/admin/canjes"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold transition border border-amber-400/30 shadow-2xs"
            title="Ver canjes solicitados, en curso y entregados"
          >
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>Despacho Canjes</span>
          </Link>

          {/* Botón Configurar Categorías */}
          <button
            type="button"
            onClick={handleAbrirModalCategorias}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition cursor-pointer border border-white/20 shadow-2xs"
            title="Configurar y agregar nuevas categorías de canje"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-300" />
            <span>Configurar Categorías ({kpis.totalCategorias})</span>
          </button>

          {/* Botón Agregar Premio */}
          <button
            type="button"
            onClick={handleAbrirCrear}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xs shadow-2xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Premio</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          KPIS DE STOCK Y PREMIOS
      ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Premios en Catálogo
            </span>
            <span className="text-lg font-black text-[#03246b] font-mono block leading-tight">
              {kpis.total} <span className="text-[10px] font-bold text-slate-400">artículos</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              En {kpis.totalCategorias} categorías activas
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <Package className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Stock Total Almacén
            </span>
            <span className="text-lg font-black text-emerald-600 font-mono block leading-tight">
              {kpis.stockTotal.toLocaleString()} <span className="text-[10px] font-bold text-slate-400">unidades</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              Disponibles para canje en tienda
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Alertas de Agotados
            </span>
            <span className={`text-lg font-black font-mono block leading-tight ${kpis.agotados > 0 ? "text-rose-600" : "text-slate-600"}`}>
              {kpis.agotados} <span className="text-[10px] font-bold text-slate-400">agotados</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              {kpis.bajoStock} productos con bajo stock (≤10)
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Configuración
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <button
                type="button"
                onClick={handleAbrirModalCategorias}
                className="text-[10px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded border border-orange-200 cursor-pointer flex items-center gap-1"
              >
                <SlidersHorizontal className="w-2.5 h-2.5" />
                <span>Gestionar Categorías</span>
              </button>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Personaliza nombres e iconos
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          BARRA DE CONTROL SUPERIOR: BOTÓN OCULTAR/MOSTRAR FILTROS + CONTADOR
      ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 px-3 py-2 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {/* Botón para Ocultar o Mostrar Filtros a la Izquierda */}
          <button
            type="button"
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600" />
            <span>{mostrarFiltros ? "Ocultar Filtros" : "Mostrar Filtros"}</span>
            {hayFiltrosActivos && (
              <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" title="Filtros activos" />
            )}
          </button>

          <span className="text-slate-500 text-xs">
            Mostrando <strong className="text-slate-800 font-mono">{premiosFiltrados.length}</strong> de{" "}
            <strong className="font-mono">{premios.length}</strong> premios
          </span>

          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={handleLimpiarFiltros}
              className="text-[11px] text-orange-600 hover:text-orange-700 font-bold hover:underline cursor-pointer ml-1"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Orden rápido si los filtros están ocultos */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[10px] font-bold">ORDEN:</span>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as any)}
              className="text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-hidden focus:border-orange-500"
            >
              <option value="STOCK_ASC">Menor stock (urgentes primero)</option>
              <option value="STOCK_DESC">Mayor stock disponible</option>
              <option value="PUNTOS_ASC">Menor puntaje requerido</option>
              <option value="PUNTOS_DESC">Mayor puntaje requerido</option>
              <option value="NOMBRE_ASC">Nombre (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONTENEDOR PRINCIPAL: FILTROS A LA IZQUIERDA + TABLA AJUSTADA A PANTALLA
      ========================================================================= */}
      <div className="flex flex-col lg:flex-row gap-2.5 items-start w-full">
        {/* BARRA LATERAL IZQUIERDA DE FILTROS (STICKY Y ANCHO OPTIMIZADO) */}
        {mostrarFiltros && (
          <aside className="w-full lg:w-48 xl:w-52 shrink-0 lg:sticky lg:top-3 bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs space-y-2.5 self-start max-h-[calc(100vh-2rem)] overflow-y-auto">
            {/* Cabecera del Filtro */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-black text-[#03246b]">
                <Filter className="w-3.5 h-3.5 text-orange-600" />
                <span>Filtros</span>
              </div>
              {hayFiltrosActivos && (
                <button
                  type="button"
                  onClick={handleLimpiarFiltros}
                  className="text-[10px] text-orange-600 hover:text-orange-700 font-bold hover:underline cursor-pointer"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* 1. Buscar Premio */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-slate-500 block">
                Buscar Premio
              </label>
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Premio, marca..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full text-xs pl-7 pr-6 py-1 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500 font-medium"
                />
                {busqueda && (
                  <button
                    type="button"
                    onClick={() => setBusqueda("")}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Filtro por Stock */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-slate-500 block">
                STOCK:
              </label>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                {[
                  { id: "TODOS", label: "Todos", count: premios.length },
                  { id: "EN_STOCK", label: ">10 disp.", count: kpis.stockNormal },
                  { id: "BAJO_STOCK", label: "Bajo (≤10)", count: kpis.bajoStock },
                  { id: "AGOTADO", label: "Agotado", count: kpis.agotados },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setFiltroStock(st.id as any)}
                    className={`px-1.5 py-1 rounded text-[10px] font-bold transition cursor-pointer border text-left flex items-center justify-between ${
                      filtroStock === st.id
                        ? "bg-[#03246b] text-white border-[#03246b] shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="truncate">{st.label}</span>
                    <span className={`text-[8px] px-1 rounded font-mono ${filtroStock === st.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                      {st.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Ordenamiento */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-slate-500 block">
                ORDEN:
              </label>
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as any)}
                className="w-full text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-hidden focus:border-orange-500"
              >
                <option value="STOCK_ASC">Menor stock (urgentes)</option>
                <option value="STOCK_DESC">Mayor stock</option>
                <option value="PUNTOS_ASC">Menor puntaje</option>
                <option value="PUNTOS_DESC">Mayor puntaje</option>
                <option value="NOMBRE_ASC">Nombre (A - Z)</option>
              </select>
            </div>

            {/* 4. Categorías en Lista Vertical */}
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-bold uppercase text-slate-500 block">
                  CATEGORÍA:
                </label>
                <button
                  type="button"
                  onClick={handleAbrirModalCategorias}
                  className="text-[9px] text-orange-600 hover:text-orange-700 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                  title="Configurar y añadir categorías"
                >
                  <SlidersHorizontal className="w-2.5 h-2.5" />
                  <span>Configurar</span>
                </button>
              </div>

              <div className="space-y-1 max-h-64 overflow-y-auto pr-0.5">
                {categorias.map((cat) => {
                  const seleccionada = categoriaSeleccionada === cat.id;
                  const conteo =
                    cat.id === "TODOS"
                      ? premios.length
                      : premios.filter((p) => p.categoria === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoriaSeleccionada(cat.id)}
                      className={`w-full flex items-center justify-between px-2 py-1 rounded text-left transition cursor-pointer text-[11px] ${
                        seleccionada
                          ? "bg-[#03246b] text-white font-bold shadow-2xs"
                          : "text-slate-700 hover:bg-slate-100 font-medium"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="shrink-0">{cat.icono}</span>
                        <span className="truncate">{cat.nombre}</span>
                      </span>
                      <span
                        className={`text-[9px] px-1 rounded font-mono shrink-0 ${
                          seleccionada ? "bg-white/20 text-white font-bold" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {conteo}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* COLUMNA DERECHA: TABLA DE PREMIOS (100% AJUSTADA A PANTALLA) */}
        <main className="flex-1 min-w-0 w-full space-y-2 transition-all duration-200">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[9px] font-black text-[#03246b] uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2 px-2.5 w-[28%]">Premio / Imagen</th>
                    <th className="py-2 px-1.5 w-[15%]">Categoría</th>
                    <th className="py-2 px-1.5 w-[10%]">Marca</th>
                    <th className="py-2 px-2 text-right w-[14%]">Puntos / Valor</th>
                    <th className="py-2 px-1.5 text-center w-[15%]">Stock para Usuarios</th>
                    <th className="py-2 px-1.5 text-center w-[9%]">Cupón Base</th>
                    <th className="py-2 px-1.5 text-center w-[9%]">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {premiosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 space-y-1">
                        <Package className="w-7 h-7 text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-600 text-xs">No se encontraron premios con los filtros aplicados</p>
                        <p className="text-[10px] text-slate-400">Intenta con otro término o selecciona otra categoría.</p>
                      </td>
                    </tr>
                  ) : (
                    premiosFiltrados.map((premio) => {
                      const catConfig =
                        categorias.find((c) => c.id === premio.categoria) || {
                          id: premio.categoria,
                          nombre: premio.categoria,
                          icono: "🎁",
                          badgeCls: "bg-slate-100 text-slate-700 border-slate-300",
                        };

                      const badgeStock =
                        premio.stock === 0
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : premio.stock <= 10
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200";

                      const textoStock =
                        premio.stock === 0
                          ? "Agotado"
                          : premio.stock <= 10
                          ? `Bajo (${premio.stock})`
                          : `${premio.stock} disp.`;

                      const esImagenSubida = premio.imagen.startsWith("data:image");

                      return (
                        <tr key={premio.id} className="hover:bg-slate-50/90 transition">
                          {/* Premio / Imagen */}
                          <td className="py-1 px-2.5">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="relative w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={premio.imagen}
                                  alt={premio.nombre}
                                  className="w-full h-full object-contain p-0.5"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                                  }}
                                />
                                {esImagenSubida && (
                                  <span
                                    className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 rounded-full border border-white"
                                    title="Imagen subida personalizada"
                                  />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-[#03246b] block text-[11px] truncate leading-tight" title={premio.nombre}>
                                    {premio.nombre}
                                  </span>
                                  {premio.destacado && (
                                    <span className="text-[7px] font-black uppercase px-1 rounded bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                                      Top
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 block truncate leading-tight" title={premio.descripcion}>
                                  {premio.descripcion}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Categoría Dinámica */}
                          <td className="py-1 px-1.5">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border truncate max-w-full ${catConfig.badgeCls}`} title={catConfig.nombre}>
                              <span className="shrink-0">{catConfig.icono}</span>
                              <span className="truncate">{catConfig.nombre}</span>
                            </span>
                          </td>

                          {/* Marca */}
                          <td className="py-1 px-1.5 whitespace-nowrap">
                            <span className="font-bold text-slate-700 text-[10px] block truncate max-w-[85px]" title={premio.marca}>
                              {premio.marca}
                            </span>
                          </td>

                          {/* Puntos y Valor Soles */}
                          <td className="py-1 px-2 text-right whitespace-nowrap">
                            <div className="leading-tight">
                              <span className="text-[11px] font-black text-orange-600 font-mono block">
                                {premio.puntos.toLocaleString()} <span className="text-[9px] font-bold">PTS</span>
                              </span>
                              <span className="text-[9px] text-slate-400 font-mono font-medium block">
                                S/ {premio.valorSoles.toFixed(2)}
                              </span>
                            </div>
                          </td>

                          {/* Stock para Usuarios con Botones Rápidos */}
                          <td className="py-1 px-1.5 text-center whitespace-nowrap">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[8px] font-bold border ${badgeStock}`}>
                                {premio.stock === 0 ? <AlertTriangle className="w-2 h-2 text-rose-600" /> : <CheckCircle2 className="w-2 h-2 text-emerald-600" />}
                                <span>{textoStock}</span>
                              </span>

                              {/* Ajuste rápido [-] [ num ] [+] */}
                              <div className="flex items-center gap-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleCambioRapidoStock(premio.id, -1, premio.stock)}
                                  disabled={premio.stock <= 0}
                                  className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center transition disabled:opacity-40 cursor-pointer text-[9px]"
                                  title="Restar 1 al stock"
                                >
                                  -
                                </button>

                                {ajusteStockId === premio.id ? (
                                  <div className="flex items-center gap-0.5">
                                    <input
                                      type="number"
                                      min={0}
                                      value={nuevoStockInput}
                                      onChange={(e) => setNuevoStockInput(Math.max(0, parseInt(e.target.value) || 0))}
                                      className="w-10 text-center text-[9px] font-mono font-black border border-orange-400 rounded py-0.2"
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") handleGuardarStockManual(premio.id);
                                        if (e.key === "Escape") setAjusteStockId(null);
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleGuardarStockManual(premio.id)}
                                      className="p-0.5 bg-emerald-600 text-white rounded text-[8px] font-bold cursor-pointer"
                                    >
                                      ✓
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAjusteStockId(premio.id);
                                      setNuevoStockInput(premio.stock);
                                    }}
                                    className="px-1 py-0.2 bg-slate-50 hover:bg-white text-slate-800 font-mono font-black rounded border border-slate-200 text-[9px] cursor-pointer shadow-2xs"
                                    title="Clic para editar cantidad exacta"
                                  >
                                    {premio.stock} un
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleCambioRapidoStock(premio.id, 1, premio.stock)}
                                  className="w-4 h-4 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-black flex items-center justify-center transition cursor-pointer text-[9px]"
                                  title="Sumar 1 al stock"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Cupón Base */}
                          <td className="py-1 px-1.5 text-center whitespace-nowrap">
                            <span className="font-mono font-bold text-orange-600 bg-orange-50 px-1 py-0.5 rounded border border-orange-200 text-[9px] inline-block truncate max-w-[85px]" title={premio.codigoCupon}>
                              {premio.codigoCupon}
                            </span>
                          </td>

                          {/* Acciones */}
                          <td className="py-1 px-1.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-0.5">
                              <Link
                                href={`/cliente/canjes/${premio.id}`}
                                className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                                title="Ver en tienda"
                                target="_blank"
                              >
                                <Eye className="w-3 h-3" />
                              </Link>

                              <button
                                type="button"
                                onClick={() => handleAbrirEditar(premio)}
                                className="p-1 rounded text-blue-600 hover:bg-blue-50 border border-blue-200 transition cursor-pointer"
                                title="Editar premio"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleEliminar(premio.id, premio.nombre)}
                                className="p-1 rounded text-red-600 hover:bg-red-50 border border-red-200 transition cursor-pointer"
                                title="Eliminar premio"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pie de tabla compacto */}
            <div className="bg-slate-50 px-2.5 py-1.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
              <span>
                Mostrando <strong>{premiosFiltrados.length}</strong> de {premios.length} premios
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href="/cliente/canjes"
                  className="font-bold text-orange-600 hover:underline flex items-center gap-1"
                  target="_blank"
                >
                  <span>Ver Tienda de Clientes</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* =========================================================================
          MODAL: AGREGAR O EDITAR PREMIO (TEXTOS, SUBIDA DE IMÁGENES, DETALLES)
      ========================================================================= */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl space-y-3.5 border border-slate-200 max-h-[92vh] overflow-y-auto">
            {/* Cabecera del modal */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#03246b]">
                    {premioEnEdicion ? "Modificar Premio y Ficha Técnica" : "Agregar Nuevo Premio a la Tienda"}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {premioEnEdicion ? `ID: ${premioEnEdicion.id}` : "Personaliza textos, imágenes y parámetros de canje"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarPremio} className="space-y-3.5 text-xs">
              {/* SECCIÓN 1: TEXTOS PRINCIPALES DEL PRODUCTO */}
              <div className="space-y-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-[#03246b] font-bold text-xs pb-1 border-b border-slate-200">
                  <FileText className="w-3.5 h-3.5 text-orange-500" />
                  <span>Textos e Información Principal</span>
                </div>

                {/* Nombre / Título */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">
                    Nombre del Premio / Título Oficial *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Licuadora Oster 1.5L Motor Reversible con Vaso de Vidrio"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-orange-500"
                    required
                  />
                </div>

                {/* Categoría y Marca */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 block">
                      Categoría Asignada *
                    </label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-orange-500"
                    >
                      {categorias
                        .filter((c) => c.id !== "TODOS")
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.icono} {cat.nombre}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 block">
                      Marca / Fabricante *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Oster, Record, Imaco, Tramontina..."
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      className="w-full text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                {/* Descripción Detallada */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block">
                    Descripción del Premio (Visible en detalle y catálogo) *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe las ventajas, potencia, capacidad, materiales de fabricación y garantía..."
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-orange-500 leading-relaxed"
                    required
                  />
                </div>

                {/* Especificaciones Técnicas Dinámicas */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase text-slate-500 block">
                      Ficha Técnica / Especificaciones (Clave : Valor)
                    </label>
                    <button
                      type="button"
                      onClick={handleAgregarEspecificacion}
                      className="text-[10px] font-bold text-orange-600 hover:text-orange-700 bg-white px-2 py-0.5 rounded border border-orange-200 hover:bg-orange-50 cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>Agregar Fila</span>
                    </button>
                  </div>

                  {formData.especificaciones.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">
                      No hay especificaciones adicionales. Agrega filas como Garantía, Capacidad, Potencia, etc.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {formData.especificaciones.map((esp, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Ej: Garantía"
                            value={esp.clave}
                            onChange={(e) => handleEditarEspecificacion(idx, "clave", e.target.value)}
                            className="w-1/3 text-xs px-2.5 py-1 rounded-md border border-slate-200 bg-white font-medium"
                          />
                          <span className="text-slate-400">:</span>
                          <input
                            type="text"
                            placeholder="Ej: 12 meses oficial"
                            value={esp.valor}
                            onChange={(e) => handleEditarEspecificacion(idx, "valor", e.target.value)}
                            className="flex-1 text-xs px-2.5 py-1 rounded-md border border-slate-200 bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => handleEliminarEspecificacion(idx)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Eliminar fila"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECCIÓN 2: SUBIDA Y GESTIÓN DE IMÁGENES */}
              <div className="space-y-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-[#03246b] font-bold text-xs pb-1 border-b border-slate-200">
                  <ImageIcon className="w-3.5 h-3.5 text-orange-500" />
                  <span>Imagen del Producto (Subir o Seleccionar)</span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {/* Vista Previa */}
                  <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0 shadow-2xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.imagen}
                      alt="Vista previa"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                      }}
                    />
                  </div>

                  {/* Acciones de carga */}
                  <div className="space-y-2 flex-1 w-full">
                    {/* Botón de subida de archivo */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={handleSubirImagenArchivo}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Imagen desde mi Dispositivo</span>
                      </button>
                      <span className="text-[10px] text-slate-400">PNG, JPG, WEBP hasta 5MB</span>
                    </div>

                    {/* Input para URL o ruta directa */}
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold uppercase text-slate-500 block">
                        O ingresa URL directa de la imagen:
                      </label>
                      <input
                        type="text"
                        placeholder="https://... o /products/01.png"
                        value={formData.imagen}
                        onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                        className="w-full text-xs font-mono px-2.5 py-1 rounded-md border border-slate-200 bg-white"
                      />
                    </div>

                    {/* Presets rápidos */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      <span className="text-[9px] font-bold text-slate-400">Galería rápida:</span>
                      {IMAGENES_PREDETERMINADAS.slice(0, 5).map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setFormData({ ...formData, imagen: img.url })}
                          className={`text-[9px] px-1.5 py-0.5 rounded border transition cursor-pointer ${
                            formData.imagen === img.url
                              ? "bg-orange-600 text-white border-orange-600"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECCIÓN 3: PUNTOS, PRECIOS, STOCK Y CUPÓN */}
              <div className="space-y-2.5 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-[#03246b] font-bold text-xs pb-1 border-b border-slate-200">
                  <Ticket className="w-3.5 h-3.5 text-orange-500" />
                  <span>Puntos, Precios, Stock y Cupón</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Puntos Canje */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 block">
                      Puntos Canje *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.puntos}
                      onChange={(e) => setFormData({ ...formData, puntos: Math.max(1, parseInt(e.target.value) || 0) })}
                      className="w-full text-xs font-mono font-black px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-orange-500 text-orange-600"
                      required
                    />
                  </div>

                  {/* Valor en Soles */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 block">
                      Valor Soles (S/) *
                    </label>
                    <input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={formData.valorSoles}
                      onChange={(e) => setFormData({ ...formData, valorSoles: Math.max(0.1, parseFloat(e.target.value) || 0) })}
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-orange-500"
                      required
                    />
                  </div>

                  {/* Stock Disponible */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 block">
                      Stock Almacén *
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full text-xs font-mono font-black px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-orange-500 text-emerald-600"
                      required
                    />
                  </div>

                  {/* Código Cupón */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 block">
                      Cupón Base *
                    </label>
                    <input
                      type="text"
                      placeholder="CANJE10"
                      value={formData.codigoCupon}
                      onChange={(e) => setFormData({ ...formData, codigoCupon: e.target.value.toUpperCase() })}
                      className="w-full text-xs font-mono font-black px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-orange-500 text-[#03246b]"
                      required
                    />
                  </div>
                </div>

                {/* Destacado */}
                <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 text-[11px] block">Destacar Premio en Tienda</span>
                    <span className="text-[10px] text-slate-400">Aparecerá con distintivo especial y prioridad en búsquedas.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.destacado}
                      onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xs shadow-2xs transition cursor-pointer"
                >
                  {premioEnEdicion ? "Guardar Cambios de Premio" : "Publicar Premio en Catálogo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CONFIGURAR CATEGORÍAS (CREAR, EDITAR, ELIMINAR, COLORES)
      ========================================================================= */}
      {modalCategoriasAbierto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-5 shadow-2xl space-y-3.5 border border-slate-200 max-h-[92vh] overflow-y-auto">
            {/* Cabecera */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#03246b] text-white flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#03246b]">Configuración de Categorías</h3>
                  <p className="text-[10px] text-slate-400">
                    Administra las secciones del catálogo, nombres, iconos y estilos visuales
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalCategoriasAbierto(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formulario de Agregar / Editar Categoría */}
            <form onSubmit={handleGuardarCategoriaForm} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#03246b] text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-orange-500" />
                  <span>{categoriaEnEdicion ? `Editando: ${categoriaEnEdicion.nombre}` : "Agregar Nueva Categoría"}</span>
                </span>
                {categoriaEnEdicion && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategoriaEnEdicion(null);
                      setFormCategoria({
                        id: "",
                        nombre: "",
                        icono: "🎁",
                        badgeCls: "bg-orange-50 text-orange-700 border-orange-200",
                        descripcion: "",
                      });
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-800 font-bold underline cursor-pointer"
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Nombre de la Categoría */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-500 block">
                    Nombre de la Categoría *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Mascotas & Jardín, Camping..."
                    value={formCategoria.nombre}
                    onChange={(e) => setFormCategoria({ ...formCategoria, nombre: e.target.value })}
                    className="w-full text-xs font-bold px-2.5 py-1 rounded-lg border border-slate-200 bg-white"
                    required
                  />
                </div>

                {/* Ícono / Emoji */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase text-slate-500 block">
                    Ícono / Emoji *
                  </label>
                  <input
                    type="text"
                    placeholder="🎁"
                    value={formCategoria.icono}
                    onChange={(e) => setFormCategoria({ ...formCategoria, icono: e.target.value })}
                    className="w-full text-center text-sm px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold"
                    required
                  />
                </div>
              </div>

              {/* Emojis sugeridos */}
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[9px] font-bold text-slate-400">Sugeridos:</span>
                {EMOJIS_SUGERIDOS.map((em, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormCategoria({ ...formCategoria, icono: em })}
                    className="w-6 h-6 rounded bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-xs transition cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>

              {/* Selector de Color de Distintivo */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-500 block">
                  Estilo de Color / Distintivo
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {PALETAS_CATEGORIA.map((paleta) => {
                    const seleccionado = formCategoria.badgeCls === paleta.badgeCls;
                    return (
                      <button
                        key={paleta.id}
                        type="button"
                        onClick={() => setFormCategoria({ ...formCategoria, badgeCls: paleta.badgeCls })}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold border transition text-center cursor-pointer flex items-center justify-between ${paleta.badgeCls} ${
                          seleccionado ? "ring-2 ring-orange-500 font-black shadow-2xs" : "opacity-80 hover:opacity-100"
                        }`}
                      >
                        <span>{paleta.label}</span>
                        {seleccionado && <Check className="w-2.5 h-2.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#03246b] hover:bg-[#021b52] text-white font-bold rounded-lg text-xs shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{categoriaEnEdicion ? "Guardar Categoría" : "Crear y Publicar Categoría"}</span>
                </button>
              </div>
            </form>

            {/* Listado de Categorías Actuales */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Categorías Registradas en el Sistema ({categorias.length})
              </span>

              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                {categorias.map((cat) => {
                  const conteo =
                    cat.id === "TODOS"
                      ? premios.length
                      : premios.filter((p) => p.categoria === cat.id).length;

                  const esTodos = cat.id === "TODOS";

                  return (
                    <div
                      key={cat.id}
                      className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{cat.icono}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#03246b] text-xs truncate">{cat.nombre}</span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${cat.badgeCls}`}>
                              {cat.id}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            {conteo} premios asociados actualmente
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!esTodos && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleEditarCategoriaModal(cat)}
                              className="p-1 rounded text-blue-600 hover:bg-blue-50 border border-blue-200 transition cursor-pointer"
                              title="Editar nombre e icono"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEliminarCategoriaForm(cat.id, cat.nombre)}
                              className="p-1 rounded text-red-600 hover:bg-red-50 border border-red-200 transition cursor-pointer"
                              title="Eliminar categoría"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        {esTodos && (
                          <span className="text-[10px] text-slate-400 italic px-2">General</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cierre */}
            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalCategoriasAbierto(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
