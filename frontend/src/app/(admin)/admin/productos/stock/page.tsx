"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Boxes,
  Package,
  Search,
  Filter,
  Building2,
  Phone,
  MapPin,
  RefreshCw,
  Eye,
  X,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Warehouse,
  ShoppingBag,
  BarChart3,
  ExternalLink,
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

export default function AdminStockProductosPage() {
  const [productos, setProductos] = useState<ProductoConDistribuidor[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorPermisos, setErrorPermisos] = useState<boolean>(false);

  // Filtros de Stock
  const [busqueda, setBusqueda] = useState<string>("");
  const [distribuidorFiltro, setDistribuidorFiltro] = useState<string>("TODOS");
  const [tipoGasFiltro, setTipoGasFiltro] = useState<string>("TODOS");
  const [nivelFiltro, setNivelFiltro] = useState<"TODOS" | "OPTIMO" | "MODERADO" | "CRITICO" | "AGOTADO">("TODOS");

  // Paginación
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const itemsPorPagina = 12;

  // Modal de Detalle
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoConDistribuidor | null>(null);

  // Cargar productos y stock
  const cargarStock = useCallback(async () => {
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
        console.error("Error al cargar stock de distribuidores:", err);
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarStock();
  }, [cargarStock]);

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

  // KPIs de Stock
  const kpis = useMemo(() => {
    const stockTotal = productos.reduce((sum, p) => sum + (p.stockDisponible || 0), 0);
    const reservadoTotal = productos.reduce((sum, p) => sum + (p.stockReservado || 0), 0);
    const stockBajoCount = productos.filter((p) => (p.stockDisponible || 0) <= (p.stockMinimo || 5) && (p.stockDisponible || 0) > 0).length;
    const agotadosCount = productos.filter((p) => (p.stockDisponible || 0) === 0 || p.estado === "AGOTADO").length;

    return {
      stockTotal,
      reservadoTotal,
      stockBajoCount,
      agotadosCount,
    };
  }, [productos]);

  // Filtrado de Stock
  const productosFiltrados = useMemo(() => {
    let res = productos.filter((p) => {
      if (distribuidorFiltro !== "TODOS" && p.empresaPublicId !== distribuidorFiltro) {
        return false;
      }
      if (tipoGasFiltro !== "TODOS" && p.tipoGas !== tipoGasFiltro) {
        return false;
      }

      const stock = p.stockDisponible || 0;
      const min = p.stockMinimo || 5;
      if (nivelFiltro === "AGOTADO" && stock > 0 && p.estado !== "AGOTADO") return false;
      if (nivelFiltro === "CRITICO" && (stock > min || stock === 0)) return false;
      if (nivelFiltro === "MODERADO" && (stock <= min || stock > 15)) return false;
      if (nivelFiltro === "OPTIMO" && stock <= 15) return false;

      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const coincide =
          p.nombre.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.empresaNombre.toLowerCase().includes(q) ||
          p.almacenNombre.toLowerCase().includes(q);
        if (!coincide) return false;
      }
      return true;
    });

    res.sort((a, b) => (a.stockDisponible || 0) - (b.stockDisponible || 0));
    return res;
  }, [productos, distribuidorFiltro, tipoGasFiltro, nivelFiltro, busqueda]);

  // Paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina) || 1;
  const productosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    return productosFiltrados.slice(inicio, inicio + itemsPorPagina);
  }, [productosFiltrados, paginaActual]);

  const badgeStockSemaforo = (disponible: number, minimo: number = 5, estado?: EstadoProducto) => {
    if (estado === "AGOTADO" || disponible === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
          <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
          Agotado (0)
        </span>
      );
    }
    if (disponible <= minimo) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Crítico ({disponible})
        </span>
      );
    }
    if (disponible <= 15) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300">
          Moderado ({disponible})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Óptimo ({disponible})
      </span>
    );
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

  if (errorPermisos) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <RoleGuardAlert
          rolRequerido="ADMIN"
          mensaje="Se requieren privilegios de Super Administrador (ADMIN) para supervisar el stock de las distribuidoras en la plataforma."
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
            <span className="text-orange-600 font-semibold">Stock y Abastecimiento</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <Boxes className="w-8 h-8 text-orange-600" />
              Stock y Abastecimiento de Red
            </h1>
            <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100 font-bold">
              Inventario de Plantas
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Auditoría en tiempo real del stock físico de cilindros de gas en plantas y depósitos de todos los distribuidores a nivel nacional.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={cargarStock}
            disabled={cargando}
            className="gap-2 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} />
            Actualizar Stock
          </Button>
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <ChevronLeft className="w-3.5 h-3.5" />
              Panel Admin
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. Tarjetas KPI de Stock */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Stock Total en Red
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                {kpis.stockTotal.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">
                Balones físicos disponibles
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0">
              <Warehouse className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Comprometidos en Ruta
              </span>
              <div className="text-2xl font-black text-blue-600 mt-0.5">
                {kpis.reservadoTotal.toLocaleString()}
              </div>
              <span className="text-[11px] text-muted-foreground">
                En camionetas de despacho
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Stock Crítico
              </span>
              <div className="text-2xl font-black text-amber-600 mt-0.5">
                {kpis.stockBajoCount}
              </div>
              <span className="text-[11px] text-amber-700 font-medium">
                ≤ 5 balones en planta
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Quiebres de Stock
              </span>
              <div className="text-2xl font-black text-rose-600 mt-0.5">
                {kpis.agotadosCount}
              </div>
              <span className="text-[11px] text-rose-600 font-medium">
                Balones agotados (0)
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-rose-600 shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Barra de Filtros */}
      <Card className="border shadow-2xs">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            <div className="relative lg:col-span-5">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar balón, SKU, almacén o distribuidora..."
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

            <div className="lg:col-span-4">
              <select
                value={distribuidorFiltro}
                onChange={(e) => {
                  setDistribuidorFiltro(e.target.value);
                  setPaginaActual(1);
                }}
                className="w-full py-2 px-3 text-xs rounded-lg border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-orange-500"
              >
                <option value="TODOS">🏢 Todas las Plantas ({distribuidoresDisponibles.length})</option>
                {distribuidoresDisponibles.map(([id, nombre]) => (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
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
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-orange-600" />
              Nivel de Stock:
            </span>
            <div className="flex flex-wrap gap-1">
              {(["TODOS", "OPTIMO", "MODERADO", "CRITICO", "AGOTADO"] as const).map((nivel) => (
                <button
                  key={nivel}
                  onClick={() => {
                    setNivelFiltro(nivel);
                    setPaginaActual(1);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    nivelFiltro === nivel
                      ? "bg-orange-600 text-white shadow-2xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {nivel === "TODOS" && "Todos los Niveles"}
                  {nivel === "OPTIMO" && "🟢 Óptimo (>15)"}
                  {nivel === "MODERADO" && "🟡 Moderado (6-15)"}
                  {nivel === "CRITICO" && "⚠️ Crítico (≤5)"}
                  {nivel === "AGOTADO" && "🔴 Agotado (0)"}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Tabla de Supervisión de Stock */}
      <div className="border rounded-xl overflow-hidden bg-card shadow-2xs">
        <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Boxes className="w-4 h-4 text-orange-600" />
              Inventario de Balones por Planta y Depósito
            </h3>
            <p className="text-xs text-muted-foreground">
              Supervisión de cilindros disponibles frente al umbral normativo NTP 350.011
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {productosFiltrados.length} cilindros monitoreados
          </Badge>
        </div>

        {cargando ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground font-medium">Cargando inventario físico de las distribuidoras...</p>
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Boxes className="w-12 h-12 text-muted-foreground/50 mx-auto" />
            <h3 className="text-base font-bold text-foreground">No se encontraron cilindros con este filtro</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Intenta restablecer el nivel de stock o la distribuidora seleccionada.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/60 text-muted-foreground font-bold border-b text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Distribuidora & Almacén</th>
                  <th className="py-3 px-3">Cilindro / Presentación</th>
                  <th className="py-3 px-3">Válvula</th>
                  <th className="py-3 px-3 text-center">Stock Físico</th>
                  <th className="py-3 px-3 text-center">Capacidad</th>
                  <th className="py-3 px-3 text-center">En Ruta</th>
                  <th className="py-3 px-3 text-center">Mínimo NTP</th>
                  <th className="py-3 px-3 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y text-foreground">
                {productosPaginados.map((prod) => {
                  const stock = prod.stockDisponible || 0;
                  const maxReferencia = 60;
                  const pct = Math.min(100, Math.round((stock / maxReferencia) * 100));

                  return (
                    <tr key={`stock-${prod.empresaPublicId}-${prod.id}`} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-foreground flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                          {prod.empresaNombre}
                        </div>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          {prod.almacenNombre}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-foreground">{prod.nombre}</div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          SKU: {prod.sku}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {badgeValvula(prod.tipoValvula)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="text-base font-black text-foreground">
                          {stock}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          balones
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center min-w-[120px]">
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              stock === 0
                                ? "bg-rose-500"
                                : stock <= 5
                                ? "bg-amber-500"
                                : stock <= 15
                                ? "bg-yellow-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.max(5, pct)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 block font-mono">
                          {pct}%
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-blue-600">
                          {prod.stockReservado}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          en camioneta
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="font-mono text-muted-foreground">
                          {prod.stockMinimo} unid.
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        {badgeStockSemaforo(prod.stockDisponible, prod.stockMinimo, prod.estado)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setProductoSeleccionado(prod)}
                          className="h-7 px-2.5 text-xs gap-1 hover:bg-orange-600 hover:text-white hover:border-orange-600"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Auditar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Paginación */}
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

      {/* Modal de Detalle de Stock */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
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
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Disponible Físico</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {productoSeleccionado.stockDisponible}
                  </div>
                  <span className="text-[10px] text-muted-foreground">balones</span>
                </div>

                <div className="p-3 rounded-xl border bg-blue-50/50 dark:bg-blue-950/20">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">En Ruta</span>
                  <div className="text-2xl font-black text-blue-600 mt-1">
                    {productoSeleccionado.stockReservado}
                  </div>
                  <span className="text-[10px] text-muted-foreground">en camioneta</span>
                </div>

                <div className="p-3 rounded-xl border bg-amber-50/50 dark:bg-amber-950/20">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Mínimo Alerta</span>
                  <div className="text-2xl font-black text-amber-600 mt-1">
                    {productoSeleccionado.stockMinimo}
                  </div>
                  <span className="text-[10px] text-muted-foreground">umbral Osinergmin</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border bg-card space-y-2 text-xs">
                <div className="font-bold text-foreground flex items-center gap-1.5">
                  <Warehouse className="w-4 h-4 text-orange-600" />
                  Depósito y Almacén Asignado
                </div>
                <p className="text-muted-foreground">{productoSeleccionado.almacenNombre}</p>
                <div className="pt-2 border-t flex items-center justify-between text-muted-foreground">
                  <span>Estado de Abastecimiento:</span>
                  <strong className="text-foreground">
                    {productoSeleccionado.stockDisponible > productoSeleccionado.stockMinimo
                      ? "Abastecimiento Normal"
                      : productoSeleccionado.stockDisponible === 0
                      ? "Quiebre de Inventario"
                      : "Reposición Requerida"}
                  </strong>
                </div>
              </div>

              <div className="p-3 rounded-xl border bg-muted/20 text-xs text-muted-foreground space-y-1.5">
                <div className="font-semibold text-foreground">Contacto de Distribuidora para Reorden:</div>
                <div><strong className="text-foreground">RUC:</strong> {productoSeleccionado.empresaRuc || "10472918291"}</div>
                <div><strong className="text-foreground">Teléfono Planta:</strong> {productoSeleccionado.empresaTelefono || "+51 987 654 321"}</div>
                <div><strong className="text-foreground">Zona:</strong> {productoSeleccionado.empresaZona || "Urbana"}</div>
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
