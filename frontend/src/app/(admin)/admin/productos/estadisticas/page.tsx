"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  BarChart3,
  Package,
  Boxes,
  DollarSign,
  Building2,
  Trophy,
  ShoppingBag,
  Percent,
  RefreshCw,
  Flame,
  ShieldCheck,
  ChevronLeft,
  ArrowUpRight,
  TrendingUp,
  Tag,
  Eye,
  X,
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
} from "@/librerias/api/catalogo.api";

export default function AdminEstadisticasProductosPage() {
  const [productos, setProductos] = useState<ProductoConDistribuidor[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorPermisos, setErrorPermisos] = useState<boolean>(false);

  // Filtros
  const [distribuidorFiltro, setDistribuidorFiltro] = useState<string>("TODOS");
  const [tipoGasFiltro, setTipoGasFiltro] = useState<string>("TODOS");

  // Modal de Detalle Comercial
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoConDistribuidor | null>(null);

  // Cargar datos
  const cargarDatos = useCallback(async () => {
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
        console.error("Error al cargar estadísticas de productos:", err);
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Distribuidores disponibles
  const distribuidoresDisponibles = useMemo(() => {
    const mapa = new Map<string, string>();
    productos.forEach((p) => {
      if (p.empresaPublicId && p.empresaNombre) {
        mapa.set(p.empresaPublicId, p.empresaNombre);
      }
    });
    return Array.from(mapa.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [productos]);

  // Productos filtrados según selector
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      if (distribuidorFiltro !== "TODOS" && p.empresaPublicId !== distribuidorFiltro) {
        return false;
      }
      if (tipoGasFiltro !== "TODOS" && p.tipoGas !== tipoGasFiltro) {
        return false;
      }
      return true;
    });
  }, [productos, distribuidorFiltro, tipoGasFiltro]);

  // KPIs Comerciales Generales
  const kpis = useMemo(() => {
    const totalVentas = productosFiltrados.reduce((sum, p) => sum + (p.totalVentas || 0), 0);
    const totalUnidades = productosFiltrados.reduce((sum, p) => sum + (p.unidadesVendidas || 0), 0);
    const comisiones = productosFiltrados.reduce((sum, p) => sum + (p.comisionGenerada || 0), 0);

    const ordenados = [...productosFiltrados].sort((a, b) => (b.unidadesVendidas || 0) - (a.unidadesVendidas || 0));
    const topProducto = ordenados.length > 0 ? ordenados[0] : null;

    const ticketPromedio = totalUnidades > 0 ? totalVentas / totalUnidades : 0;

    return {
      totalVentas,
      totalUnidades,
      comisiones,
      topProducto,
      ticketPromedio,
    };
  }, [productosFiltrados]);

  // Ranking Top 10 y Métricas por Categoría
  const analisis = useMemo(() => {
    const ranking = [...productosFiltrados].sort((a, b) => (b.unidadesVendidas || 0) - (a.unidadesVendidas || 0));
    const maxVentas = ranking.length > 0 ? (ranking[0].unidadesVendidas || 1) : 1;

    // Desglose por Tipo de Gas
    const porGas: Record<string, { label: string; unidades: number; total: number; color: string }> = {
      GLP_10KG: { label: "GLP 10kg Doméstico", unidades: 0, total: 0, color: "bg-orange-500" },
      GLP_15KG: { label: "GLP 15kg Comercial", unidades: 0, total: 0, color: "bg-amber-500" },
      GLP_45KG: { label: "GLP 45kg Industrial", unidades: 0, total: 0, color: "bg-red-500" },
      VALVULA_ACCESORIO: { label: "Válvulas y Reguladores", unidades: 0, total: 0, color: "bg-blue-500" },
    };

    // Desglose por Válvula
    const porValvula: Record<string, { label: string; unidades: number; total: number }> = {
      PREMIUM: { label: "Click-On Premium", unidades: 0, total: 0 },
      ROSCA: { label: "Rosca Tradicional", unidades: 0, total: 0 },
      NINGUNA: { label: "Accesorios / Ninguna", unidades: 0, total: 0 },
    };

    productosFiltrados.forEach((p) => {
      const g = porGas[p.tipoGas];
      if (g) {
        g.unidades += p.unidadesVendidas || 0;
        g.total += p.totalVentas || 0;
      }
      const v = porValvula[p.tipoValvula];
      if (v) {
        v.unidades += p.unidadesVendidas || 0;
        v.total += p.totalVentas || 0;
      }
    });

    return {
      ranking: ranking.slice(0, 10),
      maxVentas,
      porGas: Object.values(porGas),
      porValvula: Object.values(porValvula),
    };
  }, [productosFiltrados]);

  if (errorPermisos) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <RoleGuardAlert
          rolRequerido="ADMIN"
          mensaje="Se requieren privilegios de Super Administrador (ADMIN) para supervisar las estadísticas de ventas de productos en la plataforma."
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
            <span className="text-orange-600 font-semibold">Estadísticas y Ventas</span>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
              <BarChart3 className="w-8 h-8 text-orange-600" />
              Estadísticas y Ventas por Producto
            </h1>
            <Badge className="bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100 font-bold">
              Desempeño Comercial
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Análisis de rotación de balones, facturación bruta por producto, comisiones generadas para RappiGas y demanda por tipo de gas y válvula.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={cargarDatos}
            disabled={cargando}
            className="gap-2 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} />
            Actualizar Métricas
          </Button>
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <ChevronLeft className="w-3.5 h-3.5" />
              Panel Admin
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. Selector de Distribuidora y Tipo de Gas */}
      <Card className="border shadow-2xs">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-bold text-foreground">
              Segmentar Análisis Comercial:
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select
              value={distribuidorFiltro}
              onChange={(e) => setDistribuidorFiltro(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-lg border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-orange-500 w-full sm:w-72"
            >
              <option value="TODOS">🌐 Red Nacional Completa (Todos los Distribuidores)</option>
              {distribuidoresDisponibles.map(([id, nombre]) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>

            <select
              value={tipoGasFiltro}
              onChange={(e) => setTipoGasFiltro(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-lg border bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-orange-500"
            >
              <option value="TODOS">🔥 Toda Presentación</option>
              <option value="GLP_10KG">GLP 10kg Doméstico</option>
              <option value="GLP_15KG">GLP 15kg Comercial</option>
              <option value="GLP_45KG">GLP 45kg Industrial</option>
              <option value="VALVULA_ACCESORIO">Válvulas / Accesorios</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 4. Tarjetas KPI de Desempeño Comercial */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Facturación por Productos
              </span>
              <div className="text-2xl font-black text-orange-600 mt-0.5">
                S/ {kpis.totalVentas.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-muted-foreground">
                Ticket promedio: S/ {kpis.ticketPromedio.toFixed(2)}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-orange-600 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Cilindros Despachados
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                {kpis.totalUnidades.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">
                Balones entregados en plataforma
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Comisión RappiGas (5%)
              </span>
              <div className="text-2xl font-black text-foreground mt-0.5">
                S/ {kpis.comisiones.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </div>
              <span className="text-[11px] text-muted-foreground">
                Take-rate comercial sobre balones
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 shrink-0">
              <Percent className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Producto Estrella (#1)
              </span>
              <div className="text-sm font-black text-foreground truncate mt-0.5">
                {kpis.topProducto ? kpis.topProducto.nombre : "Sin datos"}
              </div>
              <span className="text-[11px] text-orange-600 font-bold">
                {kpis.topProducto?.unidadesVendidas} unidades despachadas
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Grilla: Ranking Top 10 y Comparativas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ranking Top 10 */}
        <Card className="lg:col-span-8 border shadow-2xs">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Ranking Top 10 Cilindros Más Vendidos
                </CardTitle>
                <CardDescription className="text-xs">
                  Productos con mayor volumen de pedidos y facturación acumulada
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-[11px]">
                Líderes de Mercado
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-4 divide-y">
            {cargando ? (
              <div className="p-12 text-center">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-600" />
              </div>
            ) : analisis.ranking.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground">
                No hay ventas registradas para este filtro.
              </div>
            ) : (
              analisis.ranking.map((p, idx) => {
                const pctRelativo = Math.round(((p.unidadesVendidas || 0) / analisis.maxVentas) * 100);

                return (
                  <div
                    key={`rank-${p.empresaPublicId}-${p.id}`}
                    className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span
                        className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                          idx === 0
                            ? "bg-amber-100 text-amber-800 border border-amber-300"
                            : idx === 1
                            ? "bg-slate-200 text-slate-800 border border-slate-300"
                            : idx === 2
                            ? "bg-orange-100 text-orange-800 border border-orange-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {idx + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-foreground truncate">
                          {p.nombre}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span className="font-semibold">{p.empresaNombre}</span>
                          <span>•</span>
                          <span className="font-mono">SKU: {p.sku}</span>
                        </div>

                        <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                          <div
                            className="bg-orange-500 h-full rounded-full transition-all"
                            style={{ width: `${pctRelativo}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-extrabold text-foreground">
                        {p.unidadesVendidas} unidades
                      </div>
                      <div className="text-xs font-bold text-orange-600 mt-0.5">
                        S/ {(p.totalVentas || 0).toFixed(2)}
                      </div>
                      <span className="text-[10px] text-muted-foreground block">
                        Comisión: S/ {(p.comisionGenerada || 0).toFixed(2)}
                      </span>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setProductoSeleccionado(p)}
                      className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-orange-600"
                      title="Ver Detalle Comercial"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Comparativa por Categoría y Válvula */}
        <div className="lg:col-span-4 space-y-6">
          {/* Desglose por Tipo de Gas */}
          <Card className="border shadow-2xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Flame className="w-4 h-4 text-orange-600" />
                Ventas por Peso de Cilindro
              </CardTitle>
              <CardDescription className="text-xs">
                Participación comercial de cada presentación
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              {analisis.porGas.map((g) => {
                const pct = kpis.totalVentas > 0
                  ? Math.round((g.total / kpis.totalVentas) * 100)
                  : 0;

                return (
                  <div key={g.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{g.label}</span>
                      <span className="font-mono text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-orange-600 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{g.unidades} balones vendidos</span>
                      <span className="font-semibold text-foreground">S/ {g.total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Comparativa por Tipo de Válvula */}
          <Card className="border shadow-2xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Demanda por Tipo de Válvula
              </CardTitle>
              <CardDescription className="text-xs">
                Click-On Premium vs. Rosca Tradicional
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {analisis.porValvula.map((v) => {
                const pct = kpis.totalUnidades > 0
                  ? Math.round((v.unidades / kpis.totalUnidades) * 100)
                  : 0;

                return (
                  <div key={v.label} className="p-2.5 rounded-lg border bg-muted/20 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{v.label}</span>
                      <span className="font-bold text-emerald-600">{pct}% de demanda</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground flex justify-between">
                      <span>{v.unidades} entregas</span>
                      <span>S/ {v.total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Detalle Comercial */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
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

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl border bg-orange-50/50 dark:bg-orange-950/20">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Unidades</span>
                  <div className="text-2xl font-black text-orange-600 mt-1">
                    {productoSeleccionado.unidadesVendidas}
                  </div>
                </div>

                <div className="p-3 rounded-xl border bg-muted/40">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Facturación</span>
                  <div className="text-lg font-black text-foreground mt-1">
                    S/ {(productoSeleccionado.totalVentas || 0).toFixed(2)}
                  </div>
                </div>

                <div className="p-3 rounded-xl border bg-blue-50/50 dark:bg-blue-950/20">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Comisión</span>
                  <div className="text-lg font-black text-blue-600 mt-1">
                    S/ {(productoSeleccionado.comisionGenerada || 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border bg-card space-y-1.5 text-xs text-muted-foreground">
                <div className="font-semibold text-foreground">Datos Comerciales:</div>
                <div><strong className="text-foreground">Precio Unitario:</strong> S/ {Number(productoSeleccionado.precio).toFixed(2)}</div>
                <div><strong className="text-foreground">Distribuidora:</strong> {productoSeleccionado.empresaNombre} ({productoSeleccionado.empresaRuc || "10472918291"})</div>
                <div><strong className="text-foreground">Zona:</strong> {productoSeleccionado.empresaZona || "Cobertura Urbana"}</div>
                <div><strong className="text-foreground">Stock Disponible:</strong> {productoSeleccionado.stockDisponible} balones en almacén</div>
              </div>
            </div>

            <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
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
      )}
    </div>
  );
}
