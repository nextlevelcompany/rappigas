"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import { analyticsApi, DashboardAdminDto } from "@/librerias/api/analytics.api";
import {
  Building2,
  TrendingUp,
  DollarSign,
  Users,
  Truck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Flame,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [datos, setDatos] = useState<DashboardAdminDto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorPermisos, setErrorPermisos] = useState(false);

  const cargarDashboard = useCallback(async () => {
    try {
      setCargando(true);
      setErrorPermisos(false);
      const res = await analyticsApi.obtenerDashboardAdmin();
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
      <div className="w-full py-8 px-6">
        <RoleGuardAlert
          rolRequerido="ADMIN"
          mensaje="Para ver el panel de inteligencia de plataforma y GMV global, debes iniciar sesión como Super Administrador."
          onExito={cargarDashboard}
        />
      </div>
    );
  }

  const maxMontoGlobal = datos?.ventasPorDiaGlobal && datos.ventasPorDiaGlobal.length > 0
    ? Math.max(...datos.ventasPorDiaGlobal.map((d) => d.monto), 100)
    : 100;

  const totalMetodosGlobal = datos?.distribucionPorMetodoPago
    ? Object.values(datos.distribucionPorMetodoPago).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="w-full py-6 px-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-3xl font-bold tracking-tight">Super Admin - Inteligencia de Plataforma</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Supervisión global de PideGas: pedidos de gas de cocina, red de distribución y salud del ecosistema
          </p>
        </div>
        <Button
          variant="outline"
          onClick={cargarDashboard}
          disabled={cargando}
          className="self-start md:self-auto gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`} />
          Actualizar Plataforma
        </Button>
      </div>

      {/* KPI Cards Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV Bruto */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">GMV Transaccionado</CardTitle>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cargando ? "..." : `S/ ${(datos?.volumenTransaccionadoTotal ?? 0).toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Volumen bruto entregado en la plataforma
            </p>
          </CardContent>
        </Card>

        {/* Comisiones Plataforma */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Comisiones PideGas</CardTitle>
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {cargando ? "..." : `S/ ${(datos?.comisionesTotalesPlataforma ?? 0).toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              5% Take Rate sobre ventas completadas
            </p>
          </CardContent>
        </Card>

        {/* Red de Distribuidoras */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Distribuidoras de Gas</CardTitle>
            <Building2 className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cargando ? "..." : datos?.totalEmpresas ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {datos?.empresasAprobadas ?? 0} activas · {datos?.empresasPendientes ?? 0} pendientes
            </p>
          </CardContent>
        </Card>

        {/* Tasa de Entrega Exitosa */}
        <Card className="border-l-4 border-l-violet-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de Entrega</CardTitle>
            <CheckCircle2 className="w-5 h-5 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cargando ? "..." : `${(datos?.tasaEntregaExitosa ?? 100).toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              De pedidos no cancelados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Red & Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Red de Usuarios */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Comunidad y Red de Despacho
            </CardTitle>
            <CardDescription>Usuarios registrados en la red PideGas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                Clientes Finales (Hogares / Negocios)
              </span>
              <Badge variant="outline" className="font-bold">
                {datos?.totalClientes ?? 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-500" />
                Repartidores Afiliados
              </span>
              <Badge variant="outline" className="font-bold text-blue-600">
                {datos?.totalRepartidores ?? 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Total Pedidos Gestionados
              </span>
              <Badge variant="outline" className="font-bold text-orange-600">
                {datos?.totalPedidosGlobal ?? 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Métodos de Pago Global */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-500" />
              Distribución de Pagos Global
            </CardTitle>
            <CardDescription>Transacciones por método en toda la plataforma</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {datos?.distribucionPorMetodoPago && Object.keys(datos.distribucionPorMetodoPago).length > 0 ? (
              Object.entries(datos.distribucionPorMetodoPago).map(([metodo, cant]) => {
                const pct = totalMetodosGlobal > 0 ? Math.round((cant / totalMetodosGlobal) * 100) : 0;
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
                Sin transacciones registradas todavía.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Gestión de Soporte & Acciones */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Salud Operativa & PQRS
            </CardTitle>
            <CardDescription>Monitoreo y gobernanza regulatoria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/40">
              <span className="text-sm font-medium">Incidencias y PQRS Activas</span>
              <Badge variant={datos?.ticketsAbiertos ? "destructive" : "secondary"}>
                {datos?.ticketsAbiertos ?? 0} abiertos
              </Badge>
            </div>

            <div className="space-y-2 pt-2">
              <Link href="/admin/empresas" className="w-full block">
                <Button variant="outline" className="w-full justify-between text-xs">
                  <span>Revisar Distribuidoras de Gas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Link href="/admin/soporte" className="w-full block">
                <Button variant="outline" className="w-full justify-between text-xs">
                  <span>Mesa de Mediación PQRS</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historial Global de Transacciones (Últimos 7 días) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Curva Transaccional de la Plataforma (Últimos 7 días)
          </CardTitle>
          <CardDescription>Volumen bruto liquidado en toda la red de gas de cocina PideGas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-7 gap-2 items-end h-48 pb-6 border-b">
              {datos?.ventasPorDiaGlobal.map((dia) => {
                const alturaPct = maxMontoGlobal > 0 ? Math.min(Math.round((dia.monto / maxMontoGlobal) * 100), 100) : 0;
                const labelDia = dia.dia.slice(5);
                return (
                  <div key={dia.dia} className="flex flex-col items-center h-full justify-end group">
                    <div className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                      S/{dia.monto}
                    </div>
                    <div
                      className="w-full max-w-[48px] bg-emerald-500 rounded-t-md transition-all hover:bg-emerald-600"
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
              <span>Sincronización multi-tenant en tiempo real</span>
              <span className="font-semibold text-foreground">
                Pico de red: S/ {maxMontoGlobal.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
