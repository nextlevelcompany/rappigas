"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Package,
  Search,
  Filter,
  DollarSign,
  Building2,
  Phone,
  MapPin,
  Flame,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  X,
  Tag,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Warehouse,
  ShoppingBag,
  AlertOctagon,
  Percent,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import {
  catalogoApi,
  ProductoConDistribuidor,
  TipoBalonGas,
  TipoValvulaGas,
  EstadoProducto,
} from "@/librerias/api/catalogo.api";

type ModoVista = "grid" | "tabla";

export default function AdminCatalogoProductosPage() {
  const [productos, setProductos] = useState<ProductoConDistribuidor[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorPermisos, setErrorPermisos] = useState<boolean>(false);

  // Filtros y Búsqueda
  const [busqueda, setBusqueda] = useState<string>("");
  const [distribuidorFiltro, setDistribuidorFiltro] = useState<string>("TODOS");
  const [tipoGasFiltro, setTipoGasFiltro] = useState<string>("TODOS");
  const [tipoValvulaFiltro, setTipoValvulaFiltro] = useState<string>("TODOS");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("TODOS");
  const [orden, setOrden] = useState<
    "PRECIO_ASC" | "PRECIO_DESC" | "NOMBRE_ASC" | "EMPRESA_ASC" | "RECIENTES" | "STOCK_DESC" | "VENTAS_DESC"
  >("PRECIO_ASC");

  // Vistas y Paginación
  const [modoVista, setModoVista] = useState<ModoVista>("grid");
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const itemsPorPagina = 12;

  // Modal de Detalle
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoConDistribuidor | null>(null);

  // Cargar productos de todos los distribuidores
  const cargarProductos = useCallback(async () => {
    try {
      setCargando(true);
      setErrorPermisos(false);
      const res = await catalogoApi.listarTodosLosProductosDistribuidores();
      setProductos(res);
    } catch (err: unknown) {
      const errorObj = err as { status?: number; statusCode?: number };
      if (errorObj?.status === 403 || errorObj?.statusCode === 403) {
        setErrorPermisos(true);
      } else {
        console.error("Error al cargar productos de distribuidores:", err);
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  // Lista única de distribuidores
  const distribuidoresDisponibles = useMemo(() => {
    const mapa = new Map<string, string>();
    productos.forEach((p) => {
      if (p.empresaPublicId && p.empresaNombre) {
        mapa.set(p.empresaPublicId, p.empresaNombre);
      }
    });
    return Array.from(mapa.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [productos]);

  // KPIs Globales del Catálogo
  const kpis = useMemo(() => {
    const total = productos.length;
    const activos = productos.filter((p) => p.estado === "ACTIVO").length;
    const distribuidoresConCatalogo = new Set(productos.map((p) => p.empresaPublicId)).size;

    const balones10kg = productos.filter(
      (p) => p.tipoGas === "GLP_10KG" && p.estado === "ACTIVO" && p.precio > 0
    );
    const precioPromedio10kg =
      balones10kg.length > 0
        ? balones10kg.reduce((sum, p) => sum + Number(p.precio), 0) / balones10kg.length
        : 0;

    const preciosValidos = productos.filter((p) => p.precio > 0).map((p) => Number(p.precio));
    const minPrecio = preciosValidos.length > 0 ? Math.min(...preciosValidos) : 0;
    const maxPrecio = preciosValidos.length > 0 ? Math.max(...preciosValidos) : 0;

    return {
      total,
      activos,
      distribuidoresConCatalogo,
      precioPromedio10kg,
      minPrecio,
      maxPrecio,
    };
  }, [productos]);

  // Filtrado y Ordenamiento
  const productosFiltrados = useMemo(() => {
    let res = productos.filter((p) => {
      if (distribuidorFiltro !== "TODOS" && p.empresaPublicId !== distribuidorFiltro) {
        return false;
      }
      if (tipoGasFiltro !== "TODOS" && p.tipoGas !== tipoGasFiltro) {
        return false;
      }
      if (tipoValvulaFiltro !== "TODOS" && p.tipoValvula !== tipoValvulaFiltro) {
        return false;
      }
      if (estadoFiltro !== "TODOS" && p.estado !== estadoFiltro) {
        return false;
      }
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const coincide =
          p.nombre.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.empresaNombre.toLowerCase().includes(q) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(q));
        if (!coincide) return false;
      }
      return true;
    });

    res.sort((a, b) => {
      switch (orden) {
        case "PRECIO_ASC":
          return Number(a.precio) - Number(b.precio);
        case "PRECIO_DESC":
          return Number(b.precio) - Number(a.precio);
        case "STOCK_DESC":
          return (b.stockDisponible || 0) - (a.stockDisponible || 0);
        case "VENTAS_DESC":
          return (b.unidadesVendidas || 0) - (a.unidadesVendidas || 0);
        case "NOMBRE_ASC":
          return a.nombre.localeCompare(b.nombre);
        case "EMPRESA_ASC":
          return a.empresaNombre.localeCompare(b.empresaNombre);
        case "RECIENTES":
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return res;
  }, [productos, distribuidorFiltro, tipoGasFiltro, tipoValvulaFiltro, estadoFiltro, busqueda, orden]);

  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina) || 1;
  const productosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return productosFiltrados.slice(inicio, inicio + itemsPorPagina);
  }, [productosFiltrados, paginaActual]);

  const badgeTipoGas = (tipo: TipoBalonGas) => {
    switch (tipo) {
      case "GLP_10KG":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-[11px] font-semibold">10 kg Doméstico</Badge>;
      case "GLP_15KG":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[11px] font-semibold">15 kg Comercial</Badge>;
      case "GLP_45KG":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[11px] font-semibold">45 kg Industrial</Badge>;
      case "VALVULA_ACCESORIO":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[11px] font-semibold">Válvula / Regulador</Badge>;
      default:
        return <Badge variant="outline">{tipo}</Badge>;
    }
  };

  const badgeValvula = (valvula: TipoValvulaGas) => {
    switch (valvula) {
      case "PREMIUM":
        return <Badge className="bg-emerald-600 text-white text-[10px] font-semibold">Click-On</Badge>;
      case "ROSCA":
        return <Badge variant="secondary" className="text-[10px] font-semibold">Rosca</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Estándar</Badge>;
    }
  };

  const badgeStockSemaforo = (disponible: number, minimo: number = 5, estado?: EstadoProducto) => {
    if (estado === "AGOTADO" || disponible === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
          <AlertOctagon className="w-3 h-3 text-rose-600" />
          Agotado (0)
        </span>
      );
    }
    if (disponible <= minimo) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          Crítico ({disponible})
        </span>
      );
    }
    if (disponible <= 15) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300">
          Moderado ({disponible})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        Óptimo ({disponible})
      </span>
    );
  };

  if (errorPermisos) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <RoleGuardAlert
          rolRequerido="ADMIN"
          mensaje="Se requieren privilegios de Super Administrador (ADMIN) para supervisar los productos de las distribuidoras en la plataforma."
        />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-5 pb-16 space-y-6">
      {/* 1. Header Principal y Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/admin/dashboard" className="hover:text-foreground transition">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Productos</span>
            <span>/</span>
            <span className="text-orange-600 font-semibold">Catálogo de Red</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <Package className="w-8 h-8 text-orange-600" />
              Catálogo de Productos de Red
            </h1>
            <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100 font-bold">
              Supervisión Nacional
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Supervisión integral de balones de gas, precios de lista y especificaciones técnicas de todas las distribuidoras afiliadas.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={cargarProductos}
            disabled={cargando}
            className="gap-2 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} />
            Actualizar Catálogo
          </Button>
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <ChevronLeft className="w-3.5 h-3.5" />
              Panel Admin
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Tarjetas KPI del Catálogo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Productos en Red
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                {kpis.total}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">
                {kpis.activos} balones activos
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-orange-600 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Distribuidoras Activas
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                {kpis.distribuidoresConCatalogo}
              </div>
              <span className="text-[11px] text-muted-foreground">
                Plantas en plataforma
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Precio Promedio 10kg
              </span>
              <div className="text-2xl font-black text-orange-600 mt-0.5">
                S/ {kpis.precioPromedio10kg.toFixed(2)}
              </div>
              <span className="text-[11px] text-muted-foreground">
                Cilindro de mayor consumo
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Rango de Precios
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                S/ {kpis.minPrecio.toFixed(0)} - S/ {kpis.maxPrecio.toFixed(0)}
              </div>
              <span className="text-[11px] text-muted-foreground">
                Mínimo a máximo en red
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0">
              <Tag className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Barra de Filtros y Búsqueda */}
      <Card className="border shadow-2xs">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            <div className="relative lg:col-span-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar balón, SKU, marca o distribuidora..."
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPaginaActual(1);
                }}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="lg:col-span-3">
              <select
                value={distribuidorFiltro}
                onChange={(e) => {
                  setDistribuidorFiltro(e.target.value);
                  setPaginaActual(1);
                }}
                className="w-full py-2 px-3 text-xs rounded-lg border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              >
                <option value="TODOS">🏢 Todos los Distribuidores ({distribuidoresDisponibles.length})</option>
                {distribuidoresDisponibles.map(([id, nombre]) => (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                value={tipoGasFiltro}
                onChange={(e) => {
                  setTipoGasFiltro(e.target.value);
                  setPaginaActual(1);
                }}
                className="w-full py-2 px-3 text-xs rounded-lg border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              >
                <option value="TODOS">🔥 Todo Tipo Gas</option>
                <option value="GLP_10KG">GLP 10kg Doméstico</option>
                <option value="GLP_15KG">GLP 15kg Comercial</option>
                <option value="GLP_45KG">GLP 45kg Industrial</option>
                <option value="VALVULA_ACCESORIO">Válvulas / Reguladores</option>
              </select>
            </div>

            <div className="lg:col-span-3 flex items-center gap-2">
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value as any)}
                className="w-full py-2 px-3 text-xs rounded-lg border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              >
                <option value="PRECIO_ASC">💰 Precio: Menor a Mayor</option>
                <option value="PRECIO_DESC">💰 Precio: Mayor a Menor</option>
                <option value="STOCK_DESC">📦 Mayor Stock Disponible</option>
                <option value="VENTAS_DESC">⭐ Más Vendidos (Top)</option>
                <option value="NOMBRE_ASC">🔤 Nombre: A - Z</option>
                <option value="EMPRESA_ASC">🏢 Empresa: A - Z</option>
                <option value="RECIENTES">⏱️ Más Recientes</option>
              </select>

              <div className="flex items-center rounded-lg border bg-muted/40 p-0.5 shrink-0">
                <button
                  onClick={() => setModoVista("grid")}
                  className={`p-1.5 rounded-md transition ${modoVista === "grid" ? "bg-background shadow-xs text-orange-600 font-bold" : "text-muted-foreground hover:text-foreground"}`}
                  title="Vista Cuadrícula"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setModoVista("tabla")}
                  className={`p-1.5 rounded-md transition ${modoVista === "tabla" ? "bg-background shadow-xs text-orange-600 font-bold" : "text-muted-foreground hover:text-foreground"}`}
                  title="Vista Tabla"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Listado de Productos */}
      {cargando ? (
        <div className="p-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">Cargando catálogo consolidado de balones...</p>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="p-16 text-center border rounded-2xl bg-muted/20 space-y-3">
          <Package className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <h3 className="text-base font-bold text-foreground">No se encontraron productos</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            No hay cilindros de gas que coincidan con los filtros seleccionados. Intenta restablecer los filtros de búsqueda.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBusqueda("");
              setDistribuidorFiltro("TODOS");
              setTipoGasFiltro("TODOS");
              setTipoValvulaFiltro("TODOS");
              setEstadoFiltro("TODOS");
            }}
            className="text-xs"
          >
            Limpiar Filtros
          </Button>
        </div>
      ) : modoVista === "grid" ? (
        /* Vista Cuadrícula */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productosPaginados.map((prod) => (
            <Card
              key={`${prod.empresaPublicId}-${prod.id}`}
              className="border shadow-2xs hover:shadow-md transition group overflow-hidden flex flex-col justify-between"
            >
              <CardHeader className="p-3.5 pb-2 border-b bg-muted/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-muted-foreground block truncate">
                      SKU: {prod.sku}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground truncate mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span className="truncate">{prod.empresaNombre}</span>
                    </div>
                  </div>
                  {badgeStockSemaforo(prod.stockDisponible, prod.stockMinimo, prod.estado)}
                </div>
              </CardHeader>

              <CardContent className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {badgeTipoGas(prod.tipoGas)}
                    {badgeValvula(prod.tipoValvula)}
                  </div>

                  <h3 className="text-sm font-bold text-foreground group-hover:text-orange-600 transition line-clamp-2">
                    {prod.nombre}
                  </h3>

                  {prod.descripcion && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {prod.descripcion}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t space-y-2">
                  {/* Fila de Stock y Ventas */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] p-2 rounded-lg bg-muted/40">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Stock Físico:</span>
                      <span className="font-bold text-foreground">
                        {prod.stockDisponible} balones
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground block text-[10px]">Ventas Totales:</span>
                      <span className="font-bold text-orange-600">
                        {prod.unidadesVendidas} unid.
                      </span>
                    </div>
                  </div>

                  {/* Precio y Acción */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Precio Lista:</span>
                      <span className="text-lg font-black text-foreground">
                        S/ {Number(prod.precio).toFixed(2)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setProductoSeleccionado(prod)}
                      className="h-8 px-2.5 text-xs gap-1 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Auditar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Vista Tabla */
        <div className="border rounded-xl overflow-hidden bg-card shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/60 text-muted-foreground font-bold border-b text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Producto / Presentación</th>
                  <th className="py-3 px-3">Distribuidor & Zona</th>
                  <th className="py-3 px-3">Válvula</th>
                  <th className="py-3 px-3 text-right">Precio Lista</th>
                  <th className="py-3 px-3 text-center">Stock Almacén</th>
                  <th className="py-3 px-3 text-right">Ventas Acumuladas</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y text-foreground">
                {productosPaginados.map((prod) => (
                  <tr key={`${prod.empresaPublicId}-${prod.id}`} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-foreground">{prod.nombre}</div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground font-mono">
                        <span>SKU: {prod.sku}</span>
                        <span>•</span>
                        <span>{prod.tipoGas}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold flex items-center gap-1.5 text-foreground">
                        <Building2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        {prod.empresaNombre}
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-muted-foreground/70" />
                        {prod.empresaZona || "Zona Urbana"}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      {badgeValvula(prod.tipoValvula)}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span className="font-black text-sm text-foreground">
                        S/ {Number(prod.precio).toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        {badgeStockSemaforo(prod.stockDisponible, prod.stockMinimo, prod.estado)}
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          Res: {prod.stockReservado} en ruta
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="font-bold text-orange-600">
                        {prod.unidadesVendidas} unidades
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        S/ {(prod.totalVentas || 0).toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <Badge
                        variant={prod.estado === "ACTIVO" ? "default" : "secondary"}
                        className={`text-[10px] font-semibold ${prod.estado === "ACTIVO" ? "bg-emerald-600 text-white" : ""}`}
                      >
                        {prod.estado}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setProductoSeleccionado(prod)}
                        className="h-7 px-2 text-xs gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
          <span>
            Mostrando {(paginaActual - 1) * itemsPorPagina + 1} a{" "}
            {Math.min(paginaActual * itemsPorPagina, productosFiltrados.length)} de{" "}
            {productosFiltrados.length} productos
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
              disabled={paginaActual === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-semibold text-foreground px-2">
              {paginaActual} / {totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaActual === totalPaginas}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Detalle */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b bg-muted/40 flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">
                  SKU: {productoSeleccionado.sku}
                </span>
                <h3 className="text-base font-bold text-foreground mt-0.5">
                  {productoSeleccionado.nombre}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-orange-600" />
                  {productoSeleccionado.empresaNombre}
                </p>
              </div>

              <button
                onClick={() => setProductoSeleccionado(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border bg-muted/30">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Precio de Venta</span>
                  <div className="text-xl font-black text-orange-600 mt-0.5">
                    S/ {Number(productoSeleccionado.precio).toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded-xl border bg-muted/30">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">Válvula Homologada</span>
                  <div className="text-sm font-bold text-foreground mt-1">
                    {badgeValvula(productoSeleccionado.tipoValvula)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border bg-muted/20 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Stock en Almacén:</span>
                  <strong className="text-foreground">{productoSeleccionado.stockDisponible} balones</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Ventas Acumuladas:</span>
                  <strong className="text-orange-600">{productoSeleccionado.unidadesVendidas} despachos</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border bg-card space-y-2 text-xs">
                <div className="font-bold text-foreground">Distribuidora Autorizada</div>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div><strong className="text-foreground">RUC:</strong> {productoSeleccionado.empresaRuc || "10472918291"}</div>
                  <div><strong className="text-foreground">Teléfono:</strong> {productoSeleccionado.empresaTelefono || "+51 987 654 321"}</div>
                  <div className="col-span-2"><strong className="text-foreground">Zona:</strong> {productoSeleccionado.empresaZona || "Cobertura Urbana"}</div>
                </div>
              </div>

              {productoSeleccionado.descripcion && (
                <div className="p-3 rounded-xl border bg-muted/20 text-xs">
                  <strong className="text-foreground block mb-1">Descripción Comercial:</strong>
                  <p className="text-muted-foreground leading-relaxed">{productoSeleccionado.descripcion}</p>
                </div>
              )}

              <div className="p-3 rounded-xl border bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
                <span>Cilindro con certificación técnica Osinergmin y prueba de hermeticidad NTP 350.011 vigente.</span>
              </div>
            </div>

            <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">
                ID: {productoSeleccionado.publicId}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setProductoSeleccionado(null)}
                  className="text-xs"
                >
                  Cerrar
                </Button>
                <Link href={`/admin/empresas/${productoSeleccionado.empresaPublicId}`}>
                  <Button
                    size="sm"
                    className="text-xs gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    Ver Distribuidor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
