"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import { analyticsApi, DashboardEmpresaDto } from "@/librerias/api/analytics.api";
import {
  Flame,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Truck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  CreditCard,
  Package,
} from "lucide-react";

export default function EmpresaDashboardPage() {
  const [datos, setDatos] = useState<DashboardEmpresaDto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorPermisos, setErrorPermisos] = useState(false);

  const cargarDashboard = useCallback(async () => {
    try {
      setCargando(true);
      setErrorPermisos(false);
      const res = await analyticsApi.obtenerDashboardEmpresa();
      setDatos(res);
    } catch (err: unknown) {
      const errorObj = err as { status?: number; statusCode?: number };
      if (errorObj?.status === 403 || errorObj?.statusCode === 403) {
        setErrorPermisos(true);
      }
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  if (errorPermisos) {
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <RoleGuardAlert
          rolRequerido="EMPRESA"
          mensaje="Para ver el panel y analítica de tu distribuidora, debes iniciar sesión con una cuenta de Distribuidora."
          onExito={cargarDashboard}
        />
      </div>
    );
  }

  // Máximo para escala de gráfica de últimos 7 días
  const maxMontoDia = datos?.ventasPorDia && datos.ventasPorDia.length > 0
    ? Math.max(...datos.ventasPorDia.map((d) => d.monto), 100)
    : 100;

  const totalMetodos = datos?.pedidosPorMetodoPago
    ? Object.values(datos.pedidosPorMetodoPago).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
              <TrendingUp className="w-6 h-6" />
            </span>
            <h1 className="text-3xl font-bold tracking-tight">Panel de Control y Analítica</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Métricas operativas y de ventas de balones de gas GLP en tiempo real
          </p>
        </div>
        <Button
          variant="outline"
          onClick={cargarDashboard}
          disabled={cargando}
          className="self-start md:self-auto gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
          Actualizar Datos
        </Button>
      </div>

      {/* KPI Cards Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ventas Hoy */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ventas de Hoy</CardTitle>
            <DollarSign className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cargando ? "..." : `S/ ${(datos?.ventasHoy ?? 0).toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ingresos brutos acumulados hoy</p>
          </CardContent>
        </Card>

        {/* Ventas del Mes */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ventas del Mes</CardTitle>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cargando ? "..." : `S/ ${(datos?.ventasMes ?? 0).toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {datos?.totalPedidosMes ?? 0} pedidos totales en el mes
            </p>
          </CardContent>
        </Card>

        {/* Ticket Promedio */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Promedio</CardTitle>
            <ShoppingBag className="w-5 h-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cargando ? "..." : `S/ ${(datos?.ticketPromedio ?? 0).toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Por pedido completado</p>
          </CardContent>
        </Card>

        {/* Flota Activa */}
        <Card className="border-l-4 border-l-violet-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Repartidores Activos</CardTitle>
            <Truck className="w-5 h-5 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cargando ? "..." : datos?.repartidoresActivos ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Disponibles o en ruta en vivo</p>
          </CardContent>
        </Card>
      </div>

      {/* Estado Operativo Inmediato */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Despacho en Curso */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Despacho en Curso
            </CardTitle>
            <CardDescription>Estado de pedidos activos en distribución</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Pendientes de Aceptación
              </span>
              <Badge variant="outline" className="font-bold">
                {datos?.pedidosPendientes ?? 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                En Ruta / Repartidor Asignado
              </span>
              <Badge variant="outline" className="font-bold text-blue-600">
                {datos?.pedidosEnCamino ?? 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Entregados con Éxito
              </span>
              <Badge variant="outline" className="font-bold text-emerald-600">
                {datos?.pedidosEntregados ?? 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Alertas de Inventario de Gas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Inventario & Balones
            </CardTitle>
            <CardDescription>Control de stock crítico de balones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span>Balones con Stock Bajo</span>
              <Badge variant={datos?.balonesStockBajo ? "destructive" : "secondary"}>
                {datos?.balonesStockBajo ?? 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Balones Agotados (0 unid.)</span>
              <Badge variant={datos?.productosAgotados ? "destructive" : "secondary"}>
                {datos?.productosAgotados ?? 0}
              </Badge>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4 shrink-0 text-orange-500" />
              <span>
                {datos?.balonesStockBajo === 0 && datos?.productosAgotados === 0
                  ? "Nivel de abastecimiento óptimo en almacén central."
                  : "Se recomienda reabastecer stock desde la planta de GLP."}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Métodos de Pago */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              Métodos de Pago
            </CardTitle>
            <CardDescription>Preferencias de pago de tus clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {datos?.pedidosPorMetodoPago && Object.keys(datos.pedidosPorMetodoPago).length > 0 ? (
              Object.entries(datos.pedidosPorMetodoPago).map(([metodo, cant]) => {
                const pct = totalMetodos > 0 ? Math.round((cant / totalMetodos) * 100) : 0;
                return (
                  <div key={metodo} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span>{metodo}</span>
                      <span className="text-muted-foreground">
                        {cant} pedidos ({pct}%)
                      </span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">
                Aún no hay pedidos registrados para mostrar preferencias de pago.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Historial de Ventas 7 días y Balones más Vendidos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gráfico 7 Días */}
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Evolución de Ventas (Últimos 7 días)
            </CardTitle>
            <CardDescription>Total recaudado y volumen diario de balones entregados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-7 gap-2 items-end h-48 pb-6 border-b">
                {datos?.ventasPorDia.map((dia) => {
                  const alturaPct = maxMontoDia > 0 ? Math.min(Math.round((dia.monto / maxMontoDia) * 100), 100) : 0;
                  const labelDia = dia.dia.slice(5); // MM-dd
                  return (
                    <div key={dia.dia} className="flex flex-col items-center h-full justify-end group">
                      <div className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                        S/{dia.monto}
                      </div>
                      <div
                        className="w-full max-w-[36px] bg-orange-500 rounded-t-md transition-all hover:bg-orange-600"
                        style={{ height: `${Math.max(alturaPct, 6)}%` }}
                        title={`${dia.dia}: S/ ${dia.monto} (${dia.pedidos} pedidos)`}
                      />
                      <span className="text-[11px] text-muted-foreground font-mono mt-2">
                        {labelDia}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
                <span>Historial automatizado con corte a las 00:00 UTC</span>
                <span className="font-semibold text-foreground">
                  Pico semanal: S/ {maxMontoDia.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balones de Gas más Vendidos */}
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Balones de Cocina más Vendidos
            </CardTitle>
            <CardDescription>Demanda por tamaño y modelo de válvula GLP</CardDescription>
          </CardHeader>
          <CardContent>
            {datos?.ventasPorProducto && datos.ventasPorProducto.length > 0 ? (
              <div className="space-y-4">
                {datos.ventasPorProducto.map((p, idx) => (
                  <div key={p.sku} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold dark:bg-orange-950 dark:text-orange-400">
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold leading-tight">{p.nombreProducto}</p>
                        <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">S/ {p.totalVentas.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{p.unidadesVendidas} unidades</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Flame className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                <p>Aún no hay ventas registradas en este período.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
