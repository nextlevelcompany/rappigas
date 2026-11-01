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
  Package,
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
    <div className="w-full py-3 px-3 sm:px-6 space-y-3 text-xs">
      {/* Encabezado Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground tracking-tight">Super Admin - Inteligencia de Plataforma</h1>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-900">
                Global
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Supervisión global de RappiGas: pedidos, red de distribución y salud del ecosistema.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={cargarDashboard}
          disabled={cargando}
          className="h-7 px-2.5 text-xs gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3 h-3 ${cargando ? "animate-spin" : ""}`} />
          <span>Actualizar</span>
        </Button>
      </div>

      {/* KPI Cards Ultracompactas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* GMV Bruto */}
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">GMV Transaccionado</p>
            <p className="text-lg font-bold leading-tight mt-0.5">
              {cargando ? "..." : `S/ ${(datos?.volumenTransaccionadoTotal ?? 0).toFixed(2)}`}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Volumen bruto entregado</p>
          </div>
          <DollarSign className="w-4 h-4 text-emerald-500 opacity-80" />
        </div>

        {/* Comisiones Plataforma */}
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs border-l-4 border-l-orange-500 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Comisiones RappiGas</p>
            <p className="text-lg font-bold leading-tight mt-0.5 text-orange-600">
              {cargando ? "..." : `S/ ${(datos?.comisionesTotalesPlataforma ?? 0).toFixed(2)}`}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">5% Take Rate sobre ventas</p>
          </div>
          <TrendingUp className="w-4 h-4 text-orange-500 opacity-80" />
        </div>

        {/* Red de Distribuidoras */}
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs border-l-4 border-l-blue-500 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Distribuidoras de Gas</p>
            <p className="text-lg font-bold leading-tight mt-0.5">
              {cargando ? "..." : datos?.totalEmpresas ?? 0}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {datos?.empresasAprobadas ?? 0} activas · {datos?.empresasPendientes ?? 0} pend.
            </p>
          </div>
          <Building2 className="w-4 h-4 text-blue-500 opacity-80" />
        </div>

        {/* Tasa de Entrega Exitosa */}
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs border-l-4 border-l-violet-500 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Tasa de Entrega</p>
            <p className="text-lg font-bold leading-tight mt-0.5">
              {cargando ? "..." : `${(datos?.tasaEntregaExitosa ?? 100).toFixed(1)}%`}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Pedidos completados</p>
          </div>
          <CheckCircle2 className="w-4 h-4 text-violet-500 opacity-80" />
        </div>
      </div>

      {/* Métricas de Red & Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {/* Red de Usuarios */}
        <Card className="shadow-2xs">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span>Comunidad y Red de Despacho</span>
            </CardTitle>
            <CardDescription className="text-[10px] text-muted-foreground">Usuarios registrados en RappiGas</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                <span>Clientes Finales (Hogares)</span>
              </span>
              <Badge variant="outline" className="font-bold text-[10px] px-1.5 py-0.2">
                {datos?.totalClientes ?? 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Truck className="w-3.5 h-3.5 text-blue-500" />
                <span>Repartidores Afiliados</span>
              </span>
              <Badge variant="outline" className="font-bold text-[10px] px-1.5 py-0.2 text-blue-600">
                {datos?.totalRepartidores ?? 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span>Total Pedidos Gestionados</span>
              </span>
              <Badge variant="outline" className="font-bold text-[10px] px-1.5 py-0.2 text-orange-600">
                {datos?.totalPedidosGlobal ?? 0}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Métodos de Pago Global */}
        <Card className="shadow-2xs">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
              <span>Distribución de Pagos Global</span>
            </CardTitle>
            <CardDescription className="text-[10px] text-muted-foreground">Transacciones por método en toda la plataforma</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            {datos?.distribucionPorMetodoPago && Object.keys(datos.distribucionPorMetodoPago).length > 0 ? (
              Object.entries(datos.distribucionPorMetodoPago).map(([metodo, cant]) => {
                const pct = totalMetodosGlobal > 0 ? Math.round((cant / totalMetodosGlobal) * 100) : 0;
                return (
                  <div key={metodo} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
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
              <p className="text-[11px] text-muted-foreground py-3 text-center">
                Sin transacciones registradas todavía.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Gestión de Soporte & Acciones */}
        <Card className="shadow-2xs flex flex-col justify-between">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span>Salud Operativa & PQRS</span>
            </CardTitle>
            <CardDescription className="text-[10px] text-muted-foreground">Monitoreo y gobernanza regulatoria</CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2.5">
            <div className="flex justify-between items-center p-2 rounded-lg bg-muted/40">
              <span className="text-xs font-medium">Incidencias y PQRS Activas</span>
              <Badge variant={datos?.ticketsAbiertos ? "destructive" : "secondary"} className="text-[10px] px-1.5 py-0.2">
                {datos?.ticketsAbiertos ?? 0} abiertos
              </Badge>
            </div>

            <div className="space-y-1.5 pt-1">
              <Link href="/admin/empresas" className="w-full block">
                <Button variant="outline" size="sm" className="w-full justify-between h-7 px-2.5 text-xs">
                  <span>Revisar Distribuidoras</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                </Button>
              </Link>
              <Link href="/admin/soporte" className="w-full block">
                <Button variant="outline" size="sm" className="w-full justify-between h-7 px-2.5 text-xs">
                  <span>Mesa de Mediación PQRS</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historial Global de Transacciones (Últimos 7 días) */}
      <Card className="shadow-2xs">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
            <span>Curva Transaccional de la Plataforma (Últimos 7 días)</span>
          </CardTitle>
          <CardDescription className="text-[10px] text-muted-foreground">Volumen bruto liquidado en toda la red RappiGas</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-7 gap-2 items-end h-36 pb-3 border-b">
              {datos?.ventasPorDiaGlobal.map((dia) => {
                const alturaPct = maxMontoGlobal > 0 ? Math.min(Math.round((dia.monto / maxMontoGlobal) * 100), 100) : 0;
                const labelDia = dia.dia.slice(5);
                return (
                  <div key={dia.dia} className="flex flex-col items-center h-full justify-end group">
                    <div className="text-[9px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                      S/{dia.monto}
                    </div>
                    <div
                      className="w-full max-w-[40px] bg-emerald-500 rounded-t-sm transition-all hover:bg-emerald-600"
                      style={{ height: `${Math.max(alturaPct, 6)}%` }}
                      title={`${dia.dia}: S/ ${dia.monto} (${dia.pedidos} pedidos)`}
                    />
                    <span className="text-[10px] text-muted-foreground font-mono mt-1.5">
                      {labelDia}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between items-center text-[11px] text-muted-foreground">
              <span>Sincronización multi-tenant en tiempo real</span>
              <span className="font-semibold text-foreground">
                Pico de red: S/ {maxMontoGlobal.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acceso Rápido al Catálogo Global de Productos de Distribuidores */}
      <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-r from-orange-50/70 via-white to-amber-50/50 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Catálogo Global de Productos de la Red
              </h3>
              <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-[10px] font-bold">
                Módulo Independiente
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">
              Supervisa balones de gas (10kg, 15kg, 45kg), válvulas, especificaciones y precios actualizados por las distribuidoras en todo el Perú.
            </p>
          </div>
        </div>

        <Link href="/admin/productos" className="shrink-0 self-end sm:self-auto">
          <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer">
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
