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
  Plus,
  Edit3,
  PackageCheck,
  AlertTriangle,
  LayoutGrid,
  List as ListIcon,
  Image as ImageIcon,
  Check,
  Upload,
  CloudUpload,
  Loader2,
  Link2,
  Flame,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  X,
  Trash2,
} from "lucide-react";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

    if (!archivo.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP o SVG).");
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      alert("La imagen no debe exceder los 5MB de tamaño.");
      return;
    }

    setSubiendo(true);
    setExitoMsg(null);

    try {
      const urlFinal = await catalogoApi.subirImagen(archivo);
      onSuccess(urlFinal);
      setExitoMsg(`Imagen "${archivo.name}" subida exitosamente.`);
    } catch (err: any) {
      console.warn("Fallo subida al servidor, usando fallback local Base64:", err);
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
    if (!confirm(`¿Desea cambiar el estado del producto "${nombre}"?`)) return;

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
  const agotados = productos.filter((p) => p.estado === "AGOTADO" || p.estado === "INACTIVO").length;

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
    <div className="w-full py-3 px-3 sm:px-6 space-y-3 text-xs">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="EMPRESA"
          mensaje={errorPermisos}
          onExito={cargarProductos}
        />
      )}

      {/* Header Compacto Estandarizado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Catálogo de Balones de Gas
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-900">
                Precios & Stock
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Administra tus balones (10kg, 15kg, 45kg), válvulas, ilustraciones y tarifas vigentes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={cargarProductos}
            disabled={cargando || isPending}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${cargando ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setMostrarModalNuevo(true)}
            className="h-7 px-3 text-xs gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Balón</span>
          </Button>
        </div>
      </div>

      {/* Alerta de Notificación Compacta */}
      {mensaje && (
        <div
          className={`py-2 px-3 rounded-lg flex items-center justify-between text-xs shadow-2xs border ${
            mensaje.tipo === "exito"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {mensaje.tipo === "exito" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{mensaje.texto}</span>
          </div>
          <button
            onClick={() => setMensaje(null)}
            className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards Ultracompactas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Total Catálogo</p>
            <p className="text-lg font-bold leading-tight mt-0.5">{total}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Balones registrados</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center shrink-0">
            <PackageCheck className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">En Venta (Activos)</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-emerald-600 dark:text-emerald-400">{activos}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Listos para pedido</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Agotados / Pausados</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-amber-600 dark:text-amber-400">{agotados}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Sin stock temporal</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Búsqueda y Toggle de Vista */}
      <div className="p-2 rounded-lg border bg-card shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        {/* Pestañas de estado */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {(["TODOS", "ACTIVO", "AGOTADO", "INACTIVO"] as const).map((est) => {
            const isSelected = filtroEstado === est;
            return (
              <button
                key={est}
                type="button"
                onClick={() => setFiltroEstado(est)}
                className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                  isSelected
                    ? "bg-foreground text-background shadow-2xs"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>
                  {est === "TODOS"
                    ? "Todos"
                    : est === "ACTIVO"
                    ? "Disponibles"
                    : est === "AGOTADO"
                    ? "Agotados"
                    : "Pausados"}
                </span>
                {est === "TODOS" && (
                  <span className="px-1 py-0.1 rounded text-[10px] bg-black/10 dark:bg-white/15">
                    {total}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Buscador + Toggle Vista + Conteo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-full sm:w-56 md:w-64">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2" />
            <Input
              type="text"
              placeholder="Buscar por balón o SKU..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-8 pr-7 h-7 text-xs bg-muted/30 focus:bg-background"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-2 top-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Toggle de Vista */}
          <div className="flex items-center border rounded-md p-0.5 bg-muted/20">
            <button
              onClick={() => setVistaModo("cuadricula")}
              className={`p-1 rounded transition ${
                vistaModo === "cuadricula"
                  ? "bg-background shadow-2xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Vista Cuadrícula"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setVistaModo("lista")}
              className={`p-1 rounded transition ${
                vistaModo === "lista"
                  ? "bg-background shadow-2xs text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Vista Tabla"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-[11px] text-muted-foreground whitespace-nowrap hidden sm:inline">
            <strong className="text-foreground">{productosFiltrados.length}</strong>/{total}
          </span>
        </div>
      </div>

      {/* RENDERIZADO DEL CATÁLOGO */}
      {cargando ? (
        <div className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-6 h-6 animate-spin text-orange-600" />
          <span className="text-xs font-medium">Cargando catálogo de balones de gas...</span>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg bg-card p-6">
          <Flame className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="font-semibold text-xs text-foreground">
            No se encontraron balones de gas con los filtros seleccionados
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Prueba cambiando el término de búsqueda o el estado.</p>
          {(busqueda || filtroEstado !== "TODOS") && (
            <button
              type="button"
              onClick={() => {
                setBusqueda("");
                setFiltroEstado("TODOS");
              }}
              className="mt-2 text-xs text-orange-600 hover:underline font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : vistaModo === "cuadricula" ? (
        /* VISTA 1: CUADRÍCULA COMPACTA */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {productosFiltrados.map((p) => {
            const imgUrl = p.imagenUrl || "/products/balon-10kg-premium.svg";
            return (
              <div
                key={p.publicId}
                className="bg-card text-card-foreground border rounded-lg overflow-hidden shadow-2xs hover:border-orange-300 dark:hover:border-orange-800 transition flex flex-col justify-between group"
              >
                {/* Cabecera & Imagen del Balón */}
                <div className="relative bg-muted/30 p-2.5 border-b">
                  {/* Badges superiores: SKU y Estado */}
                  <div className="flex items-center justify-between gap-1.5 mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground bg-background px-1.5 py-0.5 rounded border shadow-2xs">
                      {p.sku}
                    </span>

                    {p.estado === "ACTIVO" && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Disponible
                      </span>
                    )}
                    {p.estado === "AGOTADO" && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        Agotado
                      </span>
                    )}
                    {p.estado === "INACTIVO" && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border">
                        Pausado
                      </span>
                    )}
                  </div>

                  {/* Imagen */}
                  <div className="w-full h-32 flex items-center justify-center p-2 relative overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={p.nombre}
                      className="max-h-28 w-auto max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                      }}
                    />
                  </div>
                </div>

                {/* Detalles del Producto */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap gap-1">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900">
                        {p.tipoGasDescripcion || p.tipoGas.replace("_", " ")}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-muted text-muted-foreground border">
                        {p.tipoValvulaDescripcion || p.tipoValvula}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs text-foreground line-clamp-2 leading-tight" title={sanitizarTexto(p.nombre)}>
                      {sanitizarTexto(p.nombre)}
                    </h3>

                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                      {sanitizarTexto(p.descripcion) || "Balón de gas GLP de alta seguridad para cocinas domésticas y comercios."}
                    </p>
                  </div>

                  {/* Precio y Botones de Acción */}
                  <div className="pt-2 border-t flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-medium block">P. Venta</span>
                      <span className="text-base font-bold text-foreground font-mono">
                        S/ {p.precio.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => abrirModalEdicion(p)}
                        className="h-7 px-2 text-xs gap-1 border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Editar</span>
                      </Button>
                      {p.estado === "ACTIVO" && (
                        <button
                          type="button"
                          onClick={() => handleDesactivar(p.publicId, p.nombre)}
                          disabled={isPending}
                          className="h-7 w-7 rounded-md border border-input text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition cursor-pointer"
                          title="Dar de baja / pausar producto"
                        >
                          <XCircle className="w-3.5 h-3.5" />
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
        /* VISTA 2: TABLA COMPACTA DE ALTA DENSIDAD */
        <div className="rounded-lg border bg-card shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/60 border-b text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-3.5 py-2">Balón / Producto</th>
                  <th className="px-3 py-2">SKU</th>
                  <th className="px-3 py-2">Especificaciones</th>
                  <th className="px-3 py-2 text-right">Precio Unitario</th>
                  <th className="px-3 py-2 text-center">Disponibilidad</th>
                  <th className="px-3.5 py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {productosFiltrados.map((p) => {
                  const imgUrl = p.imagenUrl || "/products/balon-10kg-premium.svg";
                  return (
                    <tr
                      key={p.publicId}
                      className="hover:bg-muted/40 transition group"
                    >
                      {/* Producto con Miniatura e Imagen */}
                      <td className="px-3.5 py-2.5 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div className="size-10 rounded-md border bg-muted/30 p-1 flex items-center justify-center shrink-0">
                            <img
                              src={imgUrl}
                              alt={p.nombre}
                              className="max-h-full max-w-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-foreground text-xs block truncate max-w-xs" title={sanitizarTexto(p.nombre)}>
                              {sanitizarTexto(p.nombre)}
                            </span>
                            <p className="text-[10px] text-muted-foreground truncate max-w-xs" title={sanitizarTexto(p.descripcion)}>
                              {sanitizarTexto(p.descripcion) || "Balón de gas GLP de alta seguridad"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-3 py-2.5 align-middle whitespace-nowrap font-mono text-xs font-semibold text-muted-foreground">
                        {p.sku}
                      </td>

                      {/* Especificaciones */}
                      <td className="px-3 py-2.5 align-middle">
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span className="font-semibold text-orange-600 dark:text-orange-400">
                            {p.tipoGasDescripcion || p.tipoGas.replace("_", " ")}
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            Válvula: {p.tipoValvulaDescripcion || p.tipoValvula}
                          </span>
                        </div>
                      </td>

                      {/* Precio */}
                      <td className="px-3 py-2.5 align-middle text-right whitespace-nowrap">
                        <span className="text-xs font-bold text-foreground font-mono">
                          S/ {p.precio.toFixed(2)}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-3 py-2.5 align-middle text-center whitespace-nowrap">
                        {p.estado === "ACTIVO" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Disponible
                          </span>
                        )}
                        {p.estado === "AGOTADO" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Agotado
                          </span>
                        )}
                        {p.estado === "INACTIVO" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border">
                            Pausado
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-3.5 py-2 align-middle text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => abrirModalEdicion(p)}
                            className="h-7 px-2 text-xs gap-1 border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Editar</span>
                          </Button>
                          {p.estado === "ACTIVO" && (
                            <button
                              type="button"
                              onClick={() => handleDesactivar(p.publicId, p.nombre)}
                              disabled={isPending}
                              className="h-7 w-7 rounded-md border border-input text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-center transition shadow-2xs cursor-pointer"
                              title="Pausar / Desactivar"
                            >
                              <XCircle className="w-3.5 h-3.5" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 overflow-y-auto animate-in fade-in duration-100">
          <div className="bg-card text-card-foreground border rounded-xl max-w-lg w-full p-4 sm:p-5 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex justify-between items-start border-b pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950 font-bold text-xs flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Editar Balón de Gas
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    SKU: {productoEnEdicion.sku}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProductoEnEdicion(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleActualizarProducto} className="space-y-3 text-xs">
              {/* Sección Selección de Imagen */}
              <div className="p-3 rounded-lg bg-muted/30 border space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
                    Imagen del Balón
                  </label>

                  {/* Tabs */}
                  <div className="flex items-center gap-1 border rounded-md p-0.5 bg-background">
                    <button
                      type="button"
                      onClick={() => setEditTabImagen("subir")}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                        editTabImagen === "subir"
                          ? "bg-foreground text-background shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Subir
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditTabImagen("catalogo")}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                        editTabImagen === "catalogo"
                          ? "bg-foreground text-background shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Catálogo
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditTabImagen("url")}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                        editTabImagen === "url"
                          ? "bg-foreground text-background shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      URL
                    </button>
                  </div>
                </div>

                {/* Vista Previa y Selector */}
                <div className="flex gap-3 items-center">
                  <div className="size-20 rounded-lg border-2 border-dashed border-orange-300 dark:border-orange-800 bg-background p-1 flex items-center justify-center shrink-0">
                    {subiendoImagenEdit ? (
                      <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
                    ) : editImagenUrl ? (
                      <img
                        src={editImagenUrl}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                        }}
                      />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Sin foto</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {editTabImagen === "subir" && (
                      <div className="space-y-1">
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
                        <button
                          type="button"
                          onClick={() => inputSubirRefEdit.current?.click()}
                          className="w-full border-2 border-dashed rounded-lg p-2.5 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50/30 transition flex flex-col items-center justify-center gap-1"
                        >
                          <CloudUpload className="w-5 h-5 text-muted-foreground" />
                          <span className="text-[11px] font-semibold text-foreground">
                            Seleccionar foto desde tu dispositivo
                          </span>
                        </button>
                        {subidaExitosaEdit && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {subidaExitosaEdit}
                          </p>
                        )}
                      </div>
                    )}

                    {editTabImagen === "catalogo" && (
                      <div className="grid grid-cols-4 gap-1.5">
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
                              className={`p-1 rounded-md border text-center transition flex flex-col items-center justify-center ${
                                isSelected
                                  ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/40 ring-1 ring-orange-500"
                                  : "bg-background hover:border-orange-300"
                              }`}
                            >
                              <div className="h-7 w-full flex items-center justify-center">
                                <img src={item.url} alt={item.titulo} className="max-h-full max-w-full object-contain" />
                              </div>
                              <span className="text-[8px] font-semibold text-foreground truncate w-full mt-0.5">
                                {item.titulo.split(" ")[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {editTabImagen === "url" && (
                      <Input
                        type="text"
                        placeholder="https://servidor.com/balon.svg"
                        value={editImagenUrl}
                        onChange={(e) => setEditImagenUrl(e.target.value)}
                        className="h-7 text-xs bg-background font-mono"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Campos del Producto */}
              <div className="space-y-2">
                <div>
                  <label className="block text-[11px] font-bold mb-1 text-foreground">Nombre Comercial *</label>
                  <Input
                    type="text"
                    required
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="h-7 text-xs bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-foreground">Capacidad / Tipo</label>
                    <select
                      value={editTipoGas}
                      onChange={(e) => setEditTipoGas(e.target.value as TipoBalonGas)}
                      className="w-full h-7 px-2 text-xs rounded-md border bg-background text-foreground outline-hidden"
                    >
                      <option value="GLP_10KG">Balón 10kg (Doméstico)</option>
                      <option value="GLP_15KG">Balón 15kg (Familiar)</option>
                      <option value="GLP_45KG">Balón 45kg (Industrial)</option>
                      <option value="VALVULA_ACCESORIO">Válvula / Accesorio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-foreground">Válvula</label>
                    <select
                      value={editTipoValvula}
                      onChange={(e) => setEditTipoValvula(e.target.value as TipoValvulaGas)}
                      className="w-full h-7 px-2 text-xs rounded-md border bg-background text-foreground outline-hidden"
                    >
                      <option value="PREMIUM">Premium Click-On</option>
                      <option value="ROSCA">Tradicional Rosca</option>
                      <option value="NINGUNA">Sin Válvula</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-foreground">Precio al Público (S/) *</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1.5 text-xs font-bold text-muted-foreground">S/</span>
                      <Input
                        type="number"
                        step="0.10"
                        min="0"
                        required
                        value={editPrecio}
                        onChange={(e) => setEditPrecio(parseFloat(e.target.value) || 0)}
                        className="pl-7 h-7 text-xs font-mono font-bold bg-background"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold mb-1 text-foreground">Disponibilidad</label>
                    <select
                      value={editEstado}
                      onChange={(e) => setEditEstado(e.target.value as EstadoProducto)}
                      className="w-full h-7 px-2 text-xs rounded-md border bg-background text-foreground outline-hidden font-medium"
                    >
                      <option value="ACTIVO">Disponible (Activo)</option>
                      <option value="AGOTADO">Agotado Temporal</option>
                      <option value="INACTIVO">Pausado / Inactivo</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1 text-foreground">Descripción y Garantía</label>
                  <textarea
                    rows={2}
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                    placeholder="Precinto de seguridad, garantía de peso exacto..."
                    className="w-full p-2 text-xs rounded-md border bg-background text-foreground outline-hidden resize-none"
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className="pt-2 flex justify-end gap-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setProductoEnEdicion(null)}
                  className="h-7 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending || subiendoImagenEdit}
                  className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                >
                  {isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REGISTRAR NUEVO BALÓN */}
      {mostrarModalNuevo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 overflow-y-auto animate-in fade-in duration-100">
          <div className="bg-card text-card-foreground border rounded-xl max-w-lg w-full p-4 sm:p-5 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex justify-between items-start border-b pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950 font-bold text-xs flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Registrar Nuevo Balón de Gas
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Agrega un producto o capacidad a tu catálogo oficial de venta.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMostrarModalNuevo(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCrearProducto} className="space-y-3 text-xs">
              {/* Sección Selección de Imagen */}
              <div className="p-3 rounded-lg bg-muted/30 border space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-orange-600" />
                    Imagen del Balón
                  </label>

                  <div className="flex items-center gap-1 border rounded-md p-0.5 bg-background">
                    <button
                      type="button"
                      onClick={() => setNuevoTabImagen("catalogo")}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                        nuevoTabImagen === "catalogo"
                          ? "bg-foreground text-background shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Catálogo
                    </button>
                    <button
                      type="button"
                      onClick={() => setNuevoTabImagen("subir")}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                        nuevoTabImagen === "subir"
                          ? "bg-foreground text-background shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Subir
                    </button>
                    <button
                      type="button"
                      onClick={() => setNuevoTabImagen("url")}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                        nuevoTabImagen === "url"
                          ? "bg-foreground text-background shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      URL
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <div className="size-20 rounded-lg border-2 border-dashed border-orange-300 dark:border-orange-800 bg-background p-1 flex items-center justify-center shrink-0">
                    {subiendoImagenNuevo ? (
                      <Loader2 className="w-5 h-5 text-orange-600 animate-spin" />
                    ) : nuevoForm.imagenUrl ? (
                      <img
                        src={nuevoForm.imagenUrl}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                        }}
                      />
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Sin foto</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {nuevoTabImagen === "catalogo" && (
                      <div className="grid grid-cols-4 gap-1.5">
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
                              className={`p-1 rounded-md border text-center transition flex flex-col items-center justify-center ${
                                isSelected
                                  ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/40 ring-1 ring-orange-500"
                                  : "bg-background hover:border-orange-300"
                              }`}
                            >
                              <div className="h-7 w-full flex items-center justify-center">
                                <img src={item.url} alt={item.titulo} className="max-h-full max-w-full object-contain" />
                              </div>
                              <span className="text-[8px] font-semibold text-foreground truncate w-full mt-0.5">
                                {item.titulo.split(" ")[0]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {nuevoTabImagen === "subir" && (
                      <div className="space-y-1">
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
                        <button
                          type="button"
                          onClick={() => inputSubirRefNuevo.current?.click()}
                          className="w-full border-2 border-dashed rounded-lg p-2.5 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50/30 transition flex flex-col items-center justify-center gap-1"
                        >
                          <CloudUpload className="w-5 h-5 text-muted-foreground" />
                          <span className="text-[11px] font-semibold text-foreground">
                            Seleccionar foto desde tu PC
                          </span>
                        </button>
                        {subidaExitosaNuevo && (
                          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {subidaExitosaNuevo}
                          </p>
                        )}
                      </div>
                    )}

                    {nuevoTabImagen === "url" && (
                      <Input
                        type="text"
                        placeholder="https://servidor.com/balon.svg"
                        value={nuevoForm.imagenUrl}
                        onChange={(e) => setNuevoForm({ ...nuevoForm, imagenUrl: e.target.value })}
                        className="h-7 text-xs bg-background font-mono"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Formulario campos */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold mb-1 text-foreground">Código SKU *</label>
                  <Input
                    type="text"
                    required
                    placeholder="BALON-10KG-01"
                    value={nuevoForm.sku}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, sku: e.target.value.toUpperCase() })}
                    className="h-7 text-xs font-mono uppercase bg-background"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1 text-foreground">Precio en Soles (S/) *</label>
                  <Input
                    type="number"
                    step="0.10"
                    min="0"
                    required
                    placeholder="50.00"
                    value={nuevoForm.precio}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, precio: parseFloat(e.target.value) || 0 })}
                    className="h-7 text-xs font-mono font-bold bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1 text-foreground">Nombre Comercial *</label>
                <Input
                  type="text"
                  required
                  placeholder="Ej. Balón GLP 10kg Premium (Click-On)"
                  value={nuevoForm.nombre}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, nombre: e.target.value })}
                  className="h-7 text-xs bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold mb-1 text-foreground">Capacidad / Tipo *</label>
                  <select
                    value={nuevoForm.tipoGas}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, tipoGas: e.target.value as TipoBalonGas })}
                    className="w-full h-7 px-2 text-xs rounded-md border bg-background text-foreground outline-hidden"
                  >
                    <option value="GLP_10KG">Balón 10kg (Doméstico)</option>
                    <option value="GLP_15KG">Balón 15kg (Familiar)</option>
                    <option value="GLP_45KG">Balón 45kg (Industrial)</option>
                    <option value="VALVULA_ACCESORIO">Válvula / Accesorio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1 text-foreground">Válvula *</label>
                  <select
                    value={nuevoForm.tipoValvula}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, tipoValvula: e.target.value as TipoValvulaGas })}
                    className="w-full h-7 px-2 text-xs rounded-md border bg-background text-foreground outline-hidden"
                  >
                    <option value="PREMIUM">Premium Click-On</option>
                    <option value="ROSCA">Tradicional Rosca</option>
                    <option value="NINGUNA">Sin Válvula</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1 text-foreground">Descripción y Características</label>
                <textarea
                  rows={2}
                  placeholder="Precinto de seguridad Osinergmin, peso exacto garantizado..."
                  value={nuevoForm.descripcion}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, descripcion: e.target.value })}
                  className="w-full p-2 text-xs rounded-md border bg-background text-foreground outline-hidden resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarModalNuevo(false)}
                  className="h-7 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending || subiendoImagenNuevo}
                  className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                >
                  {isPending ? "Guardando..." : "Registrar Balón"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
