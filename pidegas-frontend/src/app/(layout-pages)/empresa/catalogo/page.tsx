"use client";

import React, { useEffect, useState, useTransition } from "react";
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
import { Plus, Tag, Edit3, DollarSign, PackageCheck, AlertTriangle } from "lucide-react";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";

export default function CatalogoBalonesPage() {
  const [productos, setProductos] = useState<ProductoDetalle[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoProducto | "TODOS">("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modales
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState<ProductoDetalle | null>(null);

  // Formulario Nuevo
  const [nuevoForm, setNuevoForm] = useState<CrearProductoPayload>({
    sku: "",
    nombre: "",
    descripcion: "",
    tipoGas: "GLP_10KG",
    tipoValvula: "PREMIUM",
    precio: 50.0,
    imagenUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300",
  });

  // Formulario Edición Rápida
  const [editPrecio, setEditPrecio] = useState<number>(0);
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
          imagenUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300",
        });
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
    setEditPrecio(p.precio);
    setEditEstado(p.estado);
  };

  const handleActualizarProducto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoEnEdicion) return;

    startTransition(async () => {
      try {
        const actualizado = await catalogoApi.actualizarProducto(
          productoEnEdicion.publicId,
          {
            precio: editPrecio,
            estado: editEstado,
          }
        );
        setProductos((prev) =>
          prev.map((p) => (p.publicId === actualizado.publicId ? actualizado : p))
        );
        setProductoEnEdicion(null);
        setMensaje({
          tipo: "exito",
          texto: `Precio de "${actualizado.nombre}" actualizado a S/ ${actualizado.precio.toFixed(2)}.`,
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
      p.sku.toLowerCase().includes(busqueda.toLowerCase());
    return coincideEstado && coincideBusqueda;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
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
            Administra los tipos de balones de cocina (10kg, 15kg, 45kg), válvulas y tarifas vigentes para tus clientes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMostrarModalNuevo(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition shadow-sm"
          >
            <Plus className="size-4" />
            Nuevo Balón de Gas
          </button>
          <button
            onClick={cargarProductos}
            disabled={cargando || isPending}
            className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition"
          >
            <RefreshCw className={`size-4 ${cargando ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {mensaje && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
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
        <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">Total Balones</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950">
              <PackageCheck className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2">{total}</div>
          <p className="text-xs text-neutral-400 mt-1">Registrados en catálogo</p>
        </div>

        <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">En Venta (Activos)</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
              <CheckCircle className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 text-emerald-600">{activos}</div>
          <p className="text-xs text-neutral-400 mt-1">Disponibles para pedidos</p>
        </div>

        <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-500">Agotados / Pausados</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950">
              <AlertTriangle className="size-5" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 text-amber-600">{agotados}</div>
          <p className="text-xs text-neutral-400 mt-1">Sin stock temporal</p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(["TODOS", "ACTIVO", "AGOTADO", "INACTIVO"] as const).map((est) => (
            <button
              key={est}
              onClick={() => setFiltroEstado(est)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filtroEstado === est
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              }`}
            >
              {est === "TODOS" ? "Todos" : est.charAt(0) + est.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Lista / Grid de Balones de Gas de Cocina */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cargando ? (
          <div className="col-span-full py-12 text-center text-neutral-500">
            Cargando catálogo de balones de gas...
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="col-span-full py-12 text-center text-neutral-500">
            No se encontraron balones de gas con los filtros seleccionados.
          </div>
        ) : (
          productosFiltrados.map((p) => (
            <div
              key={p.publicId}
              className="bg-card text-card-foreground border rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-orange-500/50 transition group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-3 rounded-xl bg-orange-500/10 text-orange-600">
                    <Flame className="size-6" />
                  </div>
                  <div>
                    {p.estado === "ACTIVO" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <span className="size-1.5 rounded-full bg-emerald-500"></span>
                        Disponible
                      </span>
                    )}
                    {p.estado === "AGOTADO" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        <span className="size-1.5 rounded-full bg-amber-500"></span>
                        Agotado
                      </span>
                    )}
                    {p.estado === "INACTIVO" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
                        Pausado
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                    SKU: {p.sku}
                  </div>
                  <h3 className="font-bold text-base mt-0.5 text-neutral-900 dark:text-white">
                    {p.nombre}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                    {p.descripcion || "Balón de gas de cocina para uso doméstico y comercial."}
                  </p>
                </div>

                {/* Especificaciones */}
                <div className="pt-2 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium">
                    {p.tipoGasDescripcion || p.tipoGas}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 font-medium">
                    {p.tipoValvulaDescripcion || p.tipoValvula}
                  </span>
                </div>
              </div>

              {/* Precio y Acciones */}
              <div className="pt-4 mt-4 border-t dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-neutral-400 block">Precio al Público</span>
                  <span className="text-2xl font-black text-neutral-900 dark:text-white">
                    S/ {p.precio.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => abrirModalEdicion(p)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition"
                  >
                    <Edit3 className="size-3.5" />
                    Editar
                  </button>
                  {p.estado === "ACTIVO" && (
                    <button
                      onClick={() => handleDesactivar(p.publicId, p.nombre)}
                      disabled={isPending}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                      title="Desactivar producto"
                    >
                      <XCircle className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Registrar Nuevo Balón */}
      {mostrarModalNuevo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">Nuevo Balón de Gas de Cocina</h3>
                <p className="text-xs text-neutral-500">
                  Agrega un nuevo producto o recarga a tu catálogo de venta.
                </p>
              </div>
              <button
                onClick={() => setMostrarModalNuevo(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearProducto} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Código SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. BALON-10KG-01"
                    value={nuevoForm.sku}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, sku: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-background font-mono dark:border-neutral-700 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Precio en Soles (S/) *</label>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    required
                    placeholder="52.00"
                    value={nuevoForm.precio}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, precio: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-background font-mono dark:border-neutral-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Nombre Comercial *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Balón de Gas de Cocina 10kg Premium"
                  value={nuevoForm.nombre}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Capacidad / Tipo *</label>
                  <select
                    value={nuevoForm.tipoGas}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, tipoGas: e.target.value as TipoBalonGas })}
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700"
                  >
                    <option value="GLP_10KG">Balón 10kg (Doméstico)</option>
                    <option value="GLP_15KG">Balón 15kg (Familiar)</option>
                    <option value="GLP_45KG">Balón 45kg (Comercial)</option>
                    <option value="VALVULA_ACCESORIO">Válvula / Accesorio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Tipo de Válvula *</label>
                  <select
                    value={nuevoForm.tipoValvula}
                    onChange={(e) => setNuevoForm({ ...nuevoForm, tipoValvula: e.target.value as TipoValvulaGas })}
                    className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700"
                  >
                    <option value="PREMIUM">Premium Click-On</option>
                    <option value="ROSCA">Tradicional de Rosca</option>
                    <option value="NINGUNA">Sin Válvula</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre precinto de seguridad, garantía de peso, etc."
                  value={nuevoForm.descripcion}
                  onChange={(e) => setNuevoForm({ ...nuevoForm, descripcion: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setMostrarModalNuevo(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isPending ? "Guardando..." : "Registrar Balón"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Precio y Stock */}
      {productoEnEdicion && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold">Modificar Precio / Stock</h3>
                <p className="text-xs text-neutral-500 font-mono">
                  {productoEnEdicion.nombre}
                </p>
              </div>
              <button
                onClick={() => setProductoEnEdicion(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleActualizarProducto} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium mb-1">Precio al Público (S/)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-neutral-400">S/</span>
                  <input
                    type="number"
                    step="0.10"
                    min="0"
                    required
                    value={editPrecio}
                    onChange={(e) => setEditPrecio(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 text-lg font-bold rounded-lg border bg-background dark:border-neutral-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Disponibilidad</label>
                <select
                  value={editEstado}
                  onChange={(e) => setEditEstado(e.target.value as EstadoProducto)}
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700"
                >
                  <option value="ACTIVO">Disponible para Pedidos (Activo)</option>
                  <option value="AGOTADO">Agotado Temporalmente</option>
                  <option value="INACTIVO">Pausado / Inactivo</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setProductoEnEdicion(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                >
                  {isPending ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
