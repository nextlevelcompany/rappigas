"use client";

import React, { useEffect, useState, useRef, useTransition } from "react";
import {
  catalogoApi,
  ProductoDetalle,
  CrearProductoPayload,
  TipoBalonGas,
  TipoValvulaGas,
  EstadoProducto,
} from "@/librerias/api/catalogo.api";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Flame,
} from "@boxicons/react";
import {
  Plus,
  Tag,
  Edit3,
  DollarSign,
  PackageCheck,
  AlertTriangle,
  LayoutGrid,
  List as ListIcon,
  Image as ImageIcon,
  Check,
  Upload,
  CloudUpload,
  Loader2,
  ExternalLink,
  Link2,
} from "lucide-react";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";

// Catálogo de ilustraciones y fotos oficiales para balones de gas y accesorios
export const IMAGENES_CATALOGO = [
  {
    id: "10kg-premium",
    titulo: "10kg Click-On Premium",
    url: "/products/balon-10kg-premium.svg",
    tipoGas: "GLP_10KG" as TipoBalonGas,
    tipoValvula: "PREMIUM" as TipoValvulaGas,
  },
  {
    id: "10kg-rosca",
    titulo: "10kg Rosca Tradicional",
    url: "/products/balon-10kg-rosca.svg",
    tipoGas: "GLP_10KG" as TipoBalonGas,
    tipoValvula: "ROSCA" as TipoValvulaGas,
  },
  {
    id: "15kg-premium",
    titulo: "15kg Comercial / Familiar",
    url: "/products/balon-15kg-premium.svg",
    tipoGas: "GLP_15KG" as TipoBalonGas,
    tipoValvula: "PREMIUM" as TipoValvulaGas,
  },
  {
    id: "45kg-industrial",
    titulo: "45kg Industrial Alto Consumo",
    url: "/products/balon-45kg-industrial.svg",
    tipoGas: "GLP_45KG" as TipoBalonGas,
    tipoValvula: "ROSCA" as TipoValvulaGas,
  },
  {
    id: "regulador-manometro",
    titulo: "Regulador con Manómetro",
    url: "/products/regulador-manometro.svg",
    tipoGas: "VALVULA_ACCESORIO" as TipoBalonGas,
    tipoValvula: "PREMIUM" as TipoValvulaGas,
  },
];

// Limpieza de posibles residuos de tildes dañadas
function sanitizarTexto(texto?: string): string {
  if (!texto) return "";
  return texto
    .replace(/Bal\?\?n/gi, "Balón")
    .replace(/bal\?\?n/gi, "balón")
    .replace(/v\?\?lvula/gi, "válvula")
    .replace(/V\?\?lvula/gi, "Válvula")
    .replace(/dom\?\?stico/gi, "doméstico")
    .replace(/garant\?\?a/gi, "garantía")
    .replace(/est\?\?ndar/gi, "estándar")
    .replace(/man\?\?metro/gi, "manómetro")
    .replace(/conexi\?\?n/gi, "conexión");
}

export default function CatalogoBalonesPage() {
  const [productos, setProductos] = useState<ProductoDetalle[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoProducto | "TODOS">("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [vistaModo, setVistaModo] = useState<"cuadricula" | "lista">("cuadricula");
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modales
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState<ProductoDetalle | null>(null);

  // Estados de subida de imagen para modal de Edición
  const [editTabImagen, setEditTabImagen] = useState<"subir" | "catalogo" | "url">("subir");
  const [subiendoImagenEdit, setSubiendoImagenEdit] = useState(false);
  const [subidaExitosaEdit, setSubidaExitosaEdit] = useState<string | null>(null);
  const inputSubirRefEdit = useRef<HTMLInputElement>(null);

  // Estados de subida de imagen para modal Nuevo
  const [nuevoTabImagen, setNuevoTabImagen] = useState<"subir" | "catalogo" | "url">("catalogo");
  const [subiendoImagenNuevo, setSubiendoImagenNuevo] = useState(false);
  const [subidaExitosaNuevo, setSubidaExitosaNuevo] = useState<string | null>(null);
  const inputSubirRefNuevo = useRef<HTMLInputElement>(null);

  // Formulario Nuevo
  const [nuevoForm, setNuevoForm] = useState<CrearProductoPayload>({
    sku: "",
    nombre: "",
    descripcion: "",
    tipoGas: "GLP_10KG",
    tipoValvula: "PREMIUM",
    precio: 50.0,
    imagenUrl: "/products/balon-10kg-premium.svg",
  });

  // Formulario Edición Completa
  const [editNombre, setEditNombre] = useState<string>("");
  const [editDescripcion, setEditDescripcion] = useState<string>("");
  const [editTipoGas, setEditTipoGas] = useState<TipoBalonGas>("GLP_10KG");
  const [editTipoValvula, setEditTipoValvula] = useState<TipoValvulaGas>("PREMIUM");
  const [editPrecio, setEditPrecio] = useState<number>(0);
  const [editImagenUrl, setEditImagenUrl] = useState<string>("");
  const [editEstado, setEditEstado] = useState<EstadoProducto>("ACTIVO");

  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      setErrorPermisos(null);
      const res = await catalogoApi.listarMisProductos();
      setProductos(res);
    } catch (err: any) {
      if (err?.status === 403 || err?.message?.includes("permisos")) {
        setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Distribuidora (EMPRESA).");
      } else {
        setMensaje({
          tipo: "error",
          texto: err.message || "Error al cargar el catálogo de balones de gas",
        });
      }
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Función para procesar y subir archivo de imagen al servidor
  const procesarSubidaArchivo = async (
    archivo: File,
    onSuccess: (url: string) => void,
    setSubiendo: (v: boolean) => void,
    setExitoMsg: (msg: string | null) => void
  ) => {
    if (!archivo) return;

    // Validación básica de tipo de archivo
    if (!archivo.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP o SVG).");
      return;
    }

    // Validación de tamaño (máximo 5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      alert("La imagen no debe exceder los 5MB de tamaño.");
      return;
    }

    setSubiendo(true);
    setExitoMsg(null);

    try {
      // Intentar subir mediante el endpoint /api/v1/archivos/subir
      const urlFinal = await catalogoApi.subirImagen(archivo);
      onSuccess(urlFinal);
      setExitoMsg(`Imagen "${archivo.name}" subida exitosamente.`);
    } catch (err: any) {
      console.warn("Fallo subida al servidor, usando fallback local Base64/ObjectURL:", err);
      // Fallback robusto en base64 para que el usuario nunca quede bloqueado
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onSuccess(dataUrl);
        setExitoMsg(`Imagen "${archivo.name}" cargada localmente.`);
      };
      reader.readAsDataURL(archivo);
    } finally {
      setSubiendo(false);
    }
  };

  const handleCrearProducto = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const creado = await catalogoApi.crearProducto(nuevoForm);
        setProductos((prev) => [creado, ...prev]);
        setMostrarModalNuevo(false);
        setNuevoForm({
          sku: "",
          nombre: "",
          descripcion: "",
          tipoGas: "GLP_10KG",
          tipoValvula: "PREMIUM",
          precio: 50.0,
          imagenUrl: "/products/balon-10kg-premium.svg",
        });
        setSubidaExitosaNuevo(null);
        setMensaje({
          tipo: "exito",
          texto: `Balón de gas "${creado.nombre}" agregado exitosamente al catálogo.`,
        });
      } catch (err: any) {
        setMensaje({
          tipo: "error",
          texto: err.message || "Error al registrar el producto",
        });
      }
    });
  };

  const abrirModalEdicion = (p: ProductoDetalle) => {
    setProductoEnEdicion(p);
    setEditNombre(sanitizarTexto(p.nombre));
    setEditDescripcion(sanitizarTexto(p.descripcion || ""));
    setEditTipoGas(p.tipoGas);
    setEditTipoValvula(p.tipoValvula);
    setEditPrecio(p.precio);
    setEditImagenUrl(p.imagenUrl || "/products/balon-10kg-premium.svg");
    setEditEstado(p.estado);
    setSubidaExitosaEdit(null);

    // Si la imagen actual es una de las predefinidas, iniciar en esa pestaña
    const esPredefinida = IMAGENES_CATALOGO.some((item) => item.url === p.imagenUrl);
    setEditTabImagen(esPredefinida ? "catalogo" : "subir");
  };

  const handleActualizarProducto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoEnEdicion) return;

    startTransition(async () => {
      try {
        const actualizado = await catalogoApi.actualizarProducto(
          productoEnEdicion.publicId,
          {
            nombre: editNombre,
            descripcion: editDescripcion,
            tipoGas: editTipoGas,
            tipoValvula: editTipoValvula,
            precio: editPrecio,
            imagenUrl: editImagenUrl,
            estado: editEstado,
          }
        );
        setProductos((prev) =>
          prev.map((p) => (p.publicId === actualizado.publicId ? actualizado : p))
        );
        setProductoEnEdicion(null);
        setSubidaExitosaEdit(null);
        setMensaje({
          tipo: "exito",
          texto: `Producto "${actualizado.nombre}" actualizado correctamente.`,
        });
      } catch (err: any) {
        setMensaje({
          tipo: "error",
          texto: err.message || "Error al actualizar el producto",
        });
      }
    });
  };

  const handleDesactivar = (publicId: string, nombre: string) => {
    if (!confirm(`¿Desea dar de baja el producto "${nombre}" del catálogo?`)) return;

    startTransition(async () => {
      try {
        await catalogoApi.eliminarProducto(publicId);
        setProductos((prev) =>
          prev.map((p) => (p.publicId === publicId ? { ...p, estado: "INACTIVO" } : p))
        );
        setMensaje({
          tipo: "exito",
          texto: `Producto "${nombre}" desactivado.`,
        });
      } catch (err: any) {
        setMensaje({
          tipo: "error",
          texto: err.message || "Error al desactivar el producto",
        });
      }
    });
  };

  // Métricas
  const total = productos.length;
  const activos = productos.filter((p) => p.estado === "ACTIVO").length;
  const agotados = productos.filter((p) => p.estado === "AGOTADO").length;

  // Filtrado
  const productosFiltrados = productos.filter((p) => {
    const coincideEstado = filtroEstado === "TODOS" ? true : p.estado === filtroEstado;
    const coincideBusqueda =
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sku.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="EMPRESA"
          mensaje={errorPermisos}
          onExito={cargarProductos}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-orange-500/10 text-orange-600 border border-orange-500/20 flex items-center gap-1">
              <Flame className="size-3.5" /> Balones de Gas de Cocina
            </span>
            <span className="text-xs text-neutral-500 font-mono">Moneda: Soles (S/)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
            Catálogo y Precios de Balones de Gas
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Administra tus balones (10kg, 15kg, 45kg), válvulas, fotos reales o ilustraciones y tarifas vigentes para tus clientes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMostrarModalNuevo(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition shadow-sm"
          >
            <Plus className="size-4" />
            Nuevo Balón de Gas
          </button>
          <button
            onClick={cargarProductos}
            disabled={cargando || isPending}
            title="Refrescar catálogo"
            className="p-2.5 rounded-xl border bg-card hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 transition"
          >
            <RefreshCw className={`size-4 text-neutral-600 dark:text-neutral-300 ${cargando ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {mensaje && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
            mensaje.tipo === "exito"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <span>{mensaje.texto}</span>
          <button
            onClick={() => setMensaje(null)}
            className="text-xs font-bold hover:underline ml-4"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">Total Balones</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950">
              <PackageCheck className="size-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold mt-2 text-neutral-900 dark:text-white">{total}</div>
          <p className="text-xs text-neutral-400 mt-1">Registrados en tu catálogo</p>
        </div>

        <div className="p-5 rounded-2xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">En Venta (Activos)</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
              <CheckCircle className="size-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold mt-2 text-emerald-600">{activos}</div>
          <p className="text-xs text-neutral-400 mt-1">Disponibles para despachar</p>
        </div>

        <div className="p-5 rounded-2xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">Agotados / Pausados</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950">
              <AlertTriangle className="size-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold mt-2 text-amber-600">{agotados}</div>
          <p className="text-xs text-neutral-400 mt-1">Sin stock o fuera de rotación</p>
        </div>
      </div>

      {/* Barra de Controles: Filtros de Estado, Búsqueda y Selector Cuadrícula / Lista */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-2xl border shadow-sm">
        {/* Filtros de estado */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {(["TODOS", "ACTIVO", "AGOTADO", "INACTIVO"] as const).map((est) => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filtroEstado === est
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              {est === "TODOS" ? "Todos los Balones" : est === "ACTIVO" ? "Disponibles" : est === "AGOTADO" ? "Agotados" : "Pausados"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Buscador */}
          <div className="relative flex-1 md:w-72">
            <input
              type="text"
              placeholder="Buscar por balón o SKU..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
          </div>

          {/* Selector de Modo de Vista (Cuadrícula / Lista) */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <button
              onClick={() => setVistaModo("cuadricula")}
              title="Modo Cuadrícula"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                vistaModo === "cuadricula"
                  ? "bg-white dark:bg-neutral-900 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <LayoutGrid className="size-4" />
              <span className="hidden sm:inline">Cuadrícula</span>
            </button>
            <button
              onClick={() => setVistaModo("lista")}
              title="Modo Lista"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                vistaModo === "lista"
                  ? "bg-white dark:bg-neutral-900 text-orange-600 dark:text-orange-400 shadow-xs"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              <ListIcon className="size-4" />
              <span className="hidden sm:inline">Lista</span>
            </button>
          </div>
        </div>
      </div>

      {/* RENDERIZADO DEL CATÁLOGO */}
      {cargando ? (
        <div className="py-20 text-center text-neutral-500 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="size-8 animate-spin text-orange-500" />
          <span className="text-sm font-medium">Cargando catálogo de balones de gas...</span>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="py-16 text-center text-neutral-500 border border-dashed rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/20">
          <Flame className="size-10 mx-auto text-neutral-400 mb-2 opacity-50" />
          <p className="font-semibold text-neutral-700 dark:text-neutral-300">
            No se encontraron balones de gas con los filtros seleccionados
          </p>
          <p className="text-xs text-neutral-400 mt-1">Prueba cambiando el término de búsqueda o el estado.</p>
        </div>
      ) : vistaModo === "cuadricula" ? (
        /* VISTA EN MODO CUADRÍCULA */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productosFiltrados.map((p) => {
            const imgUrl = p.imagenUrl || "/products/balon-10kg-premium.svg";
            return (
              <div
                key={p.publicId}
                className="bg-card text-card-foreground border rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-orange-500/50 transition-all flex flex-col justify-between group"
              >
                {/* Cabecera & Imagen del Balón */}
                <div className="relative bg-gradient-to-b from-neutral-50/80 to-neutral-100/50 dark:from-neutral-900/60 dark:to-neutral-900/20 p-4 border-b dark:border-neutral-800">
                  {/* Badges superiores: SKU y Estado */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono font-bold text-neutral-500 bg-white/90 dark:bg-neutral-800/90 px-2 py-0.5 rounded-md border dark:border-neutral-700 shadow-2xs">
                      {p.sku}
                    </span>

                    {p.estado === "ACTIVO" && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Disponible
                      </span>
                    )}
                    {p.estado === "AGOTADO" && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <span className="size-1.5 rounded-full bg-amber-500"></span>
                        Agotado
                      </span>
                    )}
                    {p.estado === "INACTIVO" && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                        Pausado
                      </span>
                    )}
                  </div>

                  {/* Contenedor Limpio y Centrado de Imagen del Balón (sin elementos encima) */}
                  <div className="w-full h-44 flex items-center justify-center p-2 relative overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={p.nombre}
                      className="max-h-40 w-auto max-w-full object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                      }}
                    />
                  </div>
                </div>

                {/* Detalles del Producto */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900">
                        {p.tipoGasDescripcion || p.tipoGas.replace("_", " ")}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                        {p.tipoValvulaDescripcion || p.tipoValvula}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-neutral-900 dark:text-white line-clamp-2 leading-snug">
                      {sanitizarTexto(p.nombre)}
                    </h3>

                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                      {sanitizarTexto(p.descripcion) || "Balón de gas GLP de alta seguridad para cocinas domésticas y negocios."}
                    </p>
                  </div>

                  {/* Precio y Botones de Acción */}
                  <div className="pt-3 border-t dark:border-neutral-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-neutral-400 font-medium block">Precio al Público</span>
                      <span className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
                        S/ {p.precio.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => abrirModalEdicion(p)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:hover:bg-orange-900/60 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800 transition shadow-xs"
                      >
                        <Edit3 className="size-3.5" />
                        Editar
                      </button>
                      {p.estado === "ACTIVO" && (
                        <button
                          onClick={() => handleDesactivar(p.publicId, p.nombre)}
                          disabled={isPending}
                          className="p-2 rounded-xl text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                          title="Dar de baja producto"
                        >
                          <XCircle className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VISTA EN MODO LISTA / TABLA */
        <div className="bg-card text-card-foreground border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 dark:bg-neutral-900/80 text-neutral-500 text-xs uppercase tracking-wider border-b dark:border-neutral-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Balón / Producto</th>
                  <th className="py-3.5 px-4 font-semibold">SKU</th>
                  <th className="py-3.5 px-4 font-semibold">Especificaciones</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Precio Unitario</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Disponibilidad</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {productosFiltrados.map((p) => {
                  const imgUrl = p.imagenUrl || "/products/balon-10kg-premium.svg";
                  return (
                    <tr
                      key={p.publicId}
                      className="hover:bg-neutral-50/80 dark:hover:bg-neutral-900/40 transition group"
                    >
                      {/* Producto con Miniatura e Imagen */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3.5">
                          <div className="relative size-14 rounded-xl border bg-neutral-50 dark:bg-neutral-900/80 p-1 flex items-center justify-center shrink-0">
                            <img
                              src={imgUrl}
                              alt={p.nombre}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                              }}
                            />
                            <button
                              onClick={() => abrirModalEdicion(p)}
                              title="Subir foto o cambiar imagen"
                              className="absolute inset-0 bg-black/50 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                            >
                              <Upload className="size-4" />
                            </button>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                              {sanitizarTexto(p.nombre)}
                            </h4>
                            <p className="text-xs text-neutral-500 line-clamp-1 mt-0.5">
                              {sanitizarTexto(p.descripcion) || "Balón de gas GLP de alta seguridad"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-neutral-500">
                        {p.sku}
                      </td>

                      {/* Especificaciones */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="font-semibold text-orange-600 dark:text-orange-400">
                            {p.tipoGasDescripcion || p.tipoGas.replace("_", " ")}
                          </span>
                          <span className="text-neutral-500 text-[11px]">
                            Válvula: {p.tipoValvulaDescripcion || p.tipoValvula}
                          </span>
                        </div>
                      </td>

                      {/* Precio */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-base font-extrabold text-neutral-900 dark:text-white font-mono">
                          S/ {p.precio.toFixed(2)}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4 text-center">
                        {p.estado === "ACTIVO" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            <span className="size-1.5 rounded-full bg-emerald-500"></span>
                            Disponible
                          </span>
                        )}
                        {p.estado === "AGOTADO" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                            <span className="size-1.5 rounded-full bg-amber-500"></span>
                            Agotado
                          </span>
                        )}
                        {p.estado === "INACTIVO" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                            Pausado
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => abrirModalEdicion(p)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:hover:bg-orange-900/60 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800 transition"
                          >
                            <Edit3 className="size-3.5" />
                            Editar
                          </button>
                          {p.estado === "ACTIVO" && (
                            <button
                              onClick={() => handleDesactivar(p.publicId, p.nombre)}
                              disabled={isPending}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                              title="Pausar / Desactivar"
                            >
                              <XCircle className="size-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL EDITAR BALÓN Y SUBIR IMAGEN */}
      {productoEnEdicion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card text-card-foreground border rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8">
            <div className="flex justify-between items-start border-b pb-4 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
                  <Flame className="size-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Editar Balón de Gas / Producto
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    SKU: {productoEnEdicion.sku}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProductoEnEdicion(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1.5 rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleActualizarProducto} className="space-y-5 text-sm">
              {/* SECCIÓN IMAGEN: SUBIR FOTO, CATÁLOGO O URL */}
              <div className="space-y-3 bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-2xl border dark:border-neutral-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                    <ImageIcon className="size-4 text-orange-600" />
                    Foto / Imagen del Balón
                  </label>

                  {/* Pestañas de modo de imagen */}
                  <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 p-1 rounded-xl border dark:border-neutral-700 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setEditTabImagen("subir")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition ${
                        editTabImagen === "subir"
                          ? "bg-orange-600 text-white shadow-xs"
                          : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                      }`}
                    >
                      <Upload className="size-3.5" />
                      <span>Subir Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditTabImagen("catalogo")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition ${
                        editTabImagen === "catalogo"
                          ? "bg-orange-600 text-white shadow-xs"
                          : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                      }`}
                    >
                      <Flame className="size-3.5" />
                      <span>Ilustraciones</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditTabImagen("url")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition ${
                        editTabImagen === "url"
                          ? "bg-orange-600 text-white shadow-xs"
                          : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                      }`}
                    >
                      <Link2 className="size-3.5" />
                      <span>URL</span>
                    </button>
                  </div>
                </div>

                {/* Vista Previa Actual y Contenido según pestaña */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Vista Previa de la Imagen */}
                  <div className="relative size-28 rounded-2xl border-2 border-dashed border-orange-300 dark:border-orange-800 bg-white dark:bg-neutral-800 p-2 flex items-center justify-center shrink-0 shadow-xs">
                    {subiendoImagenEdit ? (
                      <div className="flex flex-col items-center justify-center gap-1 text-orange-600">
                        <Loader2 className="size-6 animate-spin" />
                        <span className="text-[10px] font-bold">Subiendo...</span>
                      </div>
                    ) : editImagenUrl ? (
                      <img
                        src={editImagenUrl}
                        alt="Vista previa"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                        }}
                      />
                    ) : (
                      <div className="text-center text-neutral-400 text-xs">Sin foto</div>
                    )}
                    <span className="absolute -bottom-2 px-2 py-0.5 rounded-full bg-neutral-900 text-white text-[9px] font-bold tracking-wider uppercase">
                      Preview
                    </span>
                  </div>

                  {/* Panel Interactivo según Modo */}
                  <div className="flex-1 w-full">
                    {/* MODO 1: SUBIR ARCHIVO DESDE LA COMPUTADORA */}
                    {editTabImagen === "subir" && (
                      <div className="space-y-2">
                        <input
                          type="file"
                          ref={inputSubirRefEdit}
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              procesarSubidaArchivo(
                                file,
                                (url) => setEditImagenUrl(url),
                                setSubiendoImagenEdit,
                                setSubidaExitosaEdit
                              );
                            }
                          }}
                        />

                        <div
                          onClick={() => inputSubirRefEdit.current?.click()}
                          className="border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition group flex flex-col items-center justify-center gap-1"
                        >
                          <CloudUpload className="size-7 text-neutral-400 group-hover:text-orange-600 group-hover:scale-110 transition" />
                          <p className="text-xs font-bold text-neutral-700 dark:text-neutral-200">
                            Haz clic aquí para seleccionar una foto de tu balón
                          </p>
                          <p className="text-[11px] text-neutral-400">
                            Formatos soportados: PNG, JPG, JPEG, WEBP o SVG (máx. 5MB)
                          </p>
                        </div>

                        {subidaExitosaEdit && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <Check className="size-4 stroke-[3]" />
                            <span>{subidaExitosaEdit}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* MODO 2: CATÁLOGO DE ILUSTRACIONES */}
                    {editTabImagen === "catalogo" && (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {IMAGENES_CATALOGO.map((item) => {
                          const isSelected = editImagenUrl === item.url;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setEditImagenUrl(item.url);
                                setEditTipoGas(item.tipoGas);
                                setEditTipoValvula(item.tipoValvula);
                                setSubidaExitosaEdit(null);
                              }}
                              className={`flex flex-col items-center p-2 rounded-xl border text-center transition relative ${
                                isSelected
                                  ? "bg-white dark:bg-neutral-800 border-orange-500 shadow-md ring-2 ring-orange-500/20"
                                  : "bg-white/60 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 hover:border-orange-300"
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute top-1 right-1 bg-orange-600 text-white rounded-full p-0.5">
                                  <Check className="size-2.5 stroke-[3]" />
                                </div>
                              )}
                              <div className="h-10 w-full flex items-center justify-center mb-1">
                                <img
                                  src={item.url}
                                  alt={item.titulo}
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>
                              <span className="text-[9px] font-bold text-neutral-700 dark:text-neutral-300 line-clamp-1">
                                {item.titulo}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* MODO 3: URL DIRECTA */}
                    {editTabImagen === "url" && (
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-neutral-500">
                          Ingresa enlace o URL pública de la imagen:
                        </label>
                        <input
                          type="text"
                          placeholder="https://servidor.com/mi-balon.png"
                          value={editImagenUrl}
                          onChange={(e) => {
                            setEditImagenUrl(e.target.value);
                            setSubidaExitosaEdit(null);
                          }}
                          className="w-full px-3 py-2 text-xs rounded-xl border bg-background font-mono dark:border-neutral-700"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECCIÓN DATOS DEL PRODUCTO */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Nombre Comercial *</label>
                  <input
                    type="text"
                    required
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background dark:border-neutral-700 font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">Capacidad / Tipo</label>
                    <select
                      value={editTipoGas}
                      onChange={(e) => setEditTipoGas(e.target.value as TipoBalonGas)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background dark:border-neutral-700"
                    >
                      <option value="GLP_10KG">Balón 10kg (Doméstico)</option>
                      <option value="GLP_15KG">Balón 15kg (Familiar)</option>
                      <option value="GLP_45KG">Balón 45kg (Industrial)</option>
                      <option value="VALVULA_ACCESORIO">Válvula / Accesorio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Tipo de Válvula</label>
                    <select
                      value={editTipoValvula}
                      onChange={(e) => setEditTipoValvula(e.target.value as TipoValvulaGas)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background dark:border-neutral-700"
                    >
                      <option value="PREMIUM">Premium Click-On</option>
                      <option value="ROSCA">Tradicional de Rosca</option>
                      <option value="NINGUNA">Sin Válvula</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Descripción y Garantía</label>
                  <textarea
                    rows={2}
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                    placeholder="Detalles sobre precinto de seguridad, garantía de peso exacto..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border bg-background dark:border-neutral-700 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold mb-1">Precio de Venta al Público (S/)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-neutral-400">S/</span>
                      <input
                        type="number"
                        step="0.10"
                        min="0"
                        required
                        value={editPrecio}
                        onChange={(e) => setEditPrecio(parseFloat(e.target.value) || 0)}
                        className="w-full pl-9 pr-3 py-2 text-base font-extrabold rounded-xl border bg-background dark:border-neutral-700 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Estado de Disponibilidad</label>
                    <select
                      value={editEstado}
                      onChange={(e) => setEditEstado(e.target.value as EstadoProducto)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background dark:border-neutral-700 font-medium"
                    >
                      <option value="ACTIVO">Disponible para Pedidos (Activo)</option>
                      <option value="AGOTADO">Agotado Temporalmente</option>
                      <option value="INACTIVO">Pausado / Inactivo</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-4 flex justify-end gap-2.5 border-t dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setProductoEnEdicion(null)}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || subiendoImagenEdit}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition shadow-sm flex items-center gap-1.5"
                >
                  {isPending ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR NUEVO BALÓN */}
      {mostrarModalNuevo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card text-card-foreground border rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8">
            <div className="flex justify-between items-start border-b pb-4 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
                  <Plus className="size-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Registrar Nuevo Balón de Gas
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Agrega un nuevo producto o recarga a tu catálogo de venta para tus clientes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMostrarModalNuevo(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1.5 rounded-lg text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearProducto} className="space-y-5 text-sm">
              {/* Selección / Subida de Imagen para Nuevo Producto */}
              <div className="space-y-3 bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-2xl border dark:border-neutral-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                    <ImageIcon className="size-4 text-orange-600" />
                    Foto / Imagen del Balón
                  </label>

                  {/* Pestañas de modo de imagen */}
                  <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 p-1 rounded-xl border dark:border-neutral-700 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setNuevoTabImagen("catalogo")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition ${
                        nuevoTabImagen === "catalogo"
                          ? "bg-orange-600 text-white shadow-xs"
                          : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                      }`}
                    >
                      <Flame className="size-3.5" />
                      <span>Ilustraciones</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNuevoTabImagen("subir")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition ${
                        nuevoTabImagen === "subir"
                          ? "bg-orange-600 text-white shadow-xs"
                          : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                      }`}
                    >
                      <Upload className="size-3.5" />
                      <span>Subir Foto</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNuevoTabImagen("url")}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition ${
                        nuevoTabImagen === "url"
                          ? "bg-orange-600 text-white shadow-xs"
                          : "text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                      }`}
                    >
                      <Link2 className="size-3.5" />
                      <span>URL</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Vista Previa de la Imagen */}
                  <div className="relative size-24 rounded-2xl border-2 border-dashed border-orange-300 dark:border-orange-800 bg-white dark:bg-neutral-800 p-2 flex items-center justify-center shrink-0 shadow-xs">
                    {subiendoImagenNuevo ? (
                      <div className="flex flex-col items-center justify-center gap-1 text-orange-600">
                        <Loader2 className="size-6 animate-spin" />
                        <span className="text-[10px] font-bold">Subiendo...</span>
                      </div>
                    ) : nuevoForm.imagenUrl ? (
                      <img
                        src={nuevoForm.imagenUrl}
                        alt="Vista previa"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                        }}
                      />
                    ) : (
                      <div className="text-center text-neutral-400 text-xs">Sin foto</div>
                    )}
                  </div>

                  {/* Selector o Input según pestaña */}
                  <div className="flex-1 w-full">
                    {nuevoTabImagen === "catalogo" && (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {IMAGENES_CATALOGO.map((item) => {
                          const isSelected = nuevoForm.imagenUrl === item.url;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setNuevoForm({
                                  ...nuevoForm,
                                  imagenUrl: item.url,
                                  tipoGas: item.tipoGas,
                                  tipoValvula: item.tipoValvula,
                                });
                                setSubidaExitosaNuevo(null);
                              }}
                              className={`flex flex-col items-center p-2 rounded-xl border text-center transition relative ${
                                isSelected
                                  ? "bg-white dark:bg-neutral-800 border-orange-500 shadow-md ring-2 ring-orange-500/20"
                                  : "bg-white/60 dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 hover:border-orange-300"
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute top-1 right-1 bg-orange-600 text-white rounded-full p-0.5">
                                  <Check className="size-2.5 stroke-[3]" />
                                </div>
                              )}
                              <div className="h-10 w-full flex items-center justify-center mb-1">
                                <img
                                  src={item.url}
                                  alt={item.titulo}
                                  className="max-h-full max-w-full object-contain"
                                />
                              </div>
                              <span className="text-[9px] font-bold text-neutral-700 dark:text-neutral-300 line-clamp-1">
                                {item.titulo}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {nuevoTabImagen === "subir" && (
                      <div className="space-y-2">
                        <input
                          type="file"
                          ref={inputSubirRefNuevo}
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              procesarSubidaArchivo(
                                file,
                                (url) => setNuevoForm({ ...nuevoForm, imagenUrl: url }),
                                setSubiendoImagenNuevo,
                                setSubidaExitosaNuevo
                              );
                            }
                          }}
                        />

                        <div
                          onClick={() => inputSubirRefNuevo.current?.click()}
                          className="border-2 border-dashed rounded-xl p-3 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-950/20 transition flex flex-col items-center justify-center gap-1"
                        >
                          <CloudUpload className="size-6 text-neutral-400" />
                          <p className="text-xs font-bold text-neutral-700 dark:text-neutral-200">
                            Haz clic aquí para seleccionar foto desde tu PC
                          </p>
                        </div>

                        {subidaExitosaNuevo && (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <Check className="size-4 stroke-[3]" />
                            <span>{subidaExitosaNuevo}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {nuevoTabImagen === "url" && (
                      <div className="space-y-1">
                        <input
                          type="text"
                          placeholder="https://... o /products/..."
                          value={nuevoForm.imagenUrl}
                          onChange={(e) => setNuevoForm({ ...nuevoForm, imagenUrl: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border bg-background font-mono dark:border-neutral-700"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Formulario campos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Código SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. BALON-10KG-01"
                    value={nuevoForm.sku}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, sku: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background font-mono dark:border-neutral-700 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Precio en Soles (S/) *</label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    required
                    placeholder="52.00"
                    value={nuevoForm.precio}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, precio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background font-mono dark:border-neutral-700 font-extrabold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Nombre Comercial *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Balón de Gas de Cocina 10kg Premium (Válvula Click-On)"
                  value={nuevoForm.nombre}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, nombre: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background dark:border-neutral-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Capacidad / Tipo *</label>
                  <select
                    value={nuevoForm.tipoGas}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, tipoGas: e.target.value as TipoBalonGas })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background dark:border-neutral-700"
                  >
                    <option value="GLP_10KG">Balón 10kg (Doméstico)</option>
                    <option value="GLP_15KG">Balón 15kg (Familiar)</option>
                    <option value="GLP_45KG">Balón 45kg (Industrial)</option>
                    <option value="VALVULA_ACCESORIO">Válvula / Accesorio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Tipo de Válvula *</label>
                  <select
                    value={nuevoForm.tipoValvula}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, tipoValvula: e.target.value as TipoValvulaGas })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border bg-background dark:border-neutral-700"
                  >
                    <option value="PREMIUM">Premium Click-On</option>
                    <option value="ROSCA">Tradicional de Rosca</option>
                    <option value="NINGUNA">Sin Válvula</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">Descripción y Características</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre precinto de seguridad Osinergmin, peso exacto comprobable..."
                  value={nuevoForm.descripcion}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, descripcion: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border bg-background dark:border-neutral-700"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setMostrarModalNuevo(false)}
                  className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || subiendoImagenNuevo}
                  className="px-6 py-2.5 text-xs font-bold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition shadow-sm"
                >
                  {isPending ? "Guardando..." : "Registrar Balón"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
