"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  empresasApi,
  EmpresaDetalle,
  ActualizarEmpresaPayload,
} from "@/librerias/api/empresas.api";
import { analyticsApi, DashboardEmpresaDto } from "@/librerias/api/analytics.api";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  CheckCircle,
  CreditCard,
  DollarSign,
  Flame,
  Package,
  Phone,
  PhoneCall,
  RefreshCw,
  Save,
  ShoppingBag,
  Timer,
  TrendingUp,
  Truck,
  XCircle,
  MapPin,
  ExternalLink,
  Mail,
  Copy,
  Check,
  AlertTriangle,
  Users,
  Clock,
  MessageSquare,
} from "lucide-react";

export default function MiEmpresaPage() {
  const { usuario } = useAuthStore();
  const [empresa, setEmpresa] = useState<EmpresaDetalle | null>(null);
  const [metricas, setMetricas] = useState<DashboardEmpresaDto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);
  const [tab, setTab] = useState<"estadisticas" | "contactos" | "datos" | "accesos">("estadisticas");
  const [textoCopiado, setTextoCopiado] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<ActualizarEmpresaPayload>({
    nombreComercial: "",
    razonSocial: "",
    telefono: "",
    direccionFiscal: "",
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [empRes, metRes] = await Promise.allSettled([
        empresasApi.obtenerMiEmpresa(),
        analyticsApi.obtenerDashboardEmpresa(),
      ]);

      if (empRes.status === "fulfilled") {
        setEmpresa(empRes.value);
        setFormData({
          nombreComercial: empRes.value.nombreComercial || "",
          razonSocial: empRes.value.razonSocial || "",
          telefono: empRes.value.telefono || "",
          direccionFiscal: empRes.value.direccionFiscal || "",
        });
      }

      if (metRes.status === "fulfilled") {
        setMetricas(metRes.value);
      }
    } catch (err: any) {
      setMensaje({
        tipo: "error",
        texto: err.message || "Error al cargar los datos de la empresa.",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const actualizada = await empresasApi.actualizarMiEmpresa(formData);
        setEmpresa(actualizada);
        setMensaje({
          tipo: "exito",
          texto: "Perfil de distribuidora actualizado correctamente.",
        });
      } catch (err: any) {
        setMensaje({
          tipo: "error",
          texto: err.message || "Error al actualizar los datos de la empresa.",
        });
      }
    });
  };

  const copiarAlPortapapeles = (texto: string, etiqueta: string) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    setTextoCopiado(`${etiqueta} copiado`);
    setTimeout(() => setTextoCopiado(null), 2500);
  };

  const obtenerEnlaceWhatsApp = (telefono: string, nombreComercial: string) => {
    const limpio = (telefono || "").replace(/\D/g, "");
    const numFinal = limpio.length === 9 ? `51${limpio}` : limpio;
    const msg = encodeURIComponent(`Hola, me comunico con ${nombreComercial} desde la app PideGas.`);
    return `https://wa.me/${numFinal}?text=${msg}`;
  };

  if (cargando) {
    return (
      <div className="w-full py-16 px-6 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm text-muted-foreground">Cargando información y métricas de su distribuidora...</p>
      </div>
    );
  }

  const maxMontoDia = metricas?.ventasPorDia && metricas.ventasPorDia.length > 0
    ? Math.max(...metricas.ventasPorDia.map((d) => d.monto), 100)
    : 100;

  return (
    <div className="w-full py-6 px-6 space-y-6">
      {/* Header */}
      <div className="bg-card text-card-foreground border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
            {empresa?.nombreComercial ? empresa.nombreComercial.charAt(0).toUpperCase() : "D"}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {empresa?.nombreComercial || "Mi Distribuidora"}
              </h1>
              {empresa?.estado === "APROBADA" && (
                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Operativa y Aprobada
                </Badge>
              )}
              {empresa?.estado === "PENDIENTE" && (
                <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 font-semibold gap-1">
                  <Timer className="w-3.5 h-3.5" />
                  En Revisión Documentaria
                </Badge>
              )}
              {empresa?.estado === "SUSPENDIDA" && (
                <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 font-semibold gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  Cuenta Suspendida
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-500">
              {empresa?.razonSocial || "Razón Social no registrada"} &bull; RUC: {empresa?.ruc} &bull; Tenant #{usuario?.tenantId || empresa?.id || "1"}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={cargarDatos} disabled={cargando} className="gap-1.5 self-start md:self-auto">
          <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} />
          Actualizar Datos
        </Button>
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
          <button onClick={() => setMensaje(null)} className="text-xs font-bold hover:underline ml-4">
            ✕ Cerrar
          </button>
        </div>
      )}

      {/* KPIs Rápidos de la Distribuidora */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ventas del Mes
            </CardTitle>
            <DollarSign className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">
              S/ {(metricas?.ventasMes ?? 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Hoy: <span className="font-semibold text-emerald-600">S/ {(metricas?.ventasHoy ?? 0).toFixed(2)}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Despachos Totales
            </CardTitle>
            <ShoppingBag className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">
              {metricas?.totalPedidosMes ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Entregados: <span className="font-semibold text-blue-600">{metricas?.pedidosEntregados ?? 0}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ticket Promedio
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">
              S/ {(metricas?.ticketPromedio ?? 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Por balón entregado</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Flota Asignada
            </CardTitle>
            <Truck className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">
              {metricas?.repartidoresActivos ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Repartidores activos con GPS</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto gap-2 text-sm font-medium">
        <button
          onClick={() => setTab("estadisticas")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            tab === "estadisticas"
              ? "border-orange-500 text-orange-600 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Estadísticas & Ventas
        </button>

        <button
          onClick={() => setTab("contactos")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            tab === "contactos"
              ? "border-orange-500 text-orange-600 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          Directorio & Contactos
        </button>

        <button
          onClick={() => setTab("datos")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            tab === "datos"
              ? "border-orange-500 text-orange-600 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Datos Comerciales & Fiscales
        </button>

        <button
          onClick={() => setTab("accesos")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            tab === "accesos"
              ? "border-orange-500 text-orange-600 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <ExternalLink className="w-4 h-4" />
          Módulos Operativos
        </button>
      </div>

      {/* Tab 1: Estadísticas */}
      {tab === "estadisticas" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Gráfico 7 días */}
          <Card className="lg:col-span-7 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Ventas de los Últimos 7 Días
              </CardTitle>
              <CardDescription>Facturación diaria en balones de cocina</CardDescription>
            </CardHeader>
            <CardContent>
              {metricas?.ventasPorDia && metricas.ventasPorDia.length > 0 ? (
                <div className="h-44 flex items-end gap-2 sm:gap-4 pt-4 border-b pb-2">
                  {metricas.ventasPorDia.map((d) => {
                    const porcentaje = Math.round((d.monto / maxMontoDia) * 100);
                    return (
                      <div key={d.dia} className="flex-1 flex flex-col items-center gap-2 group relative">
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900 text-white text-[10px] py-1 px-1.5 rounded pointer-events-none whitespace-nowrap z-20">
                          S/ {d.monto.toFixed(2)} ({d.pedidos} peds)
                        </div>
                        <div className="w-full flex justify-center h-32 items-end">
                          <div
                            style={{ height: `${Math.max(porcentaje, 6)}%` }}
                            className="w-full max-w-[32px] bg-linear-to-t from-orange-600 to-amber-500 rounded-t-md hover:brightness-110 transition-all cursor-pointer shadow-sm"
                          />
                        </div>
                        <span className="text-[11px] font-medium text-muted-foreground truncate w-full text-center">
                          {d.dia}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-xs text-muted-foreground">
                  Aún no se registran pedidos en este período.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Demanda de Balones */}
          <Card className="lg:col-span-5 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-500" />
                Balones más Solicitados
              </CardTitle>
              <CardDescription>Top presentaciones de gas</CardDescription>
            </CardHeader>
            <CardContent>
              {metricas?.ventasPorProducto && metricas.ventasPorProducto.length > 0 ? (
                <div className="space-y-3">
                  {metricas.ventasPorProducto.map((p, idx) => (
                    <div key={p.sku} className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border text-xs">
                      <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                        #{idx + 1} {p.nombreProducto}
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{p.unidadesVendidas} un.</span>
                        <div className="text-orange-600 font-semibold">S/ {p.totalVentas.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No hay datos de ventas por producto.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Directorio & Canales de Contacto */}
      {tab === "contactos" && (
        <div className="space-y-6">
          {/* Canales de Contacto Rápido */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-emerald-500 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Central de Pedidos
                  </CardTitle>
                  <PhoneCall className="w-4 h-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-lg font-black text-neutral-900 dark:text-white">
                  {empresa?.telefono || "Sin registrar"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Línea principal visible para clientes en la aplicación móvil.
                </p>
                {empresa?.telefono && (
                  <div className="flex gap-2 pt-1">
                    <a
                      href={`tel:${empresa.telefono}`}
                      className="flex-1 text-center py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition"
                    >
                      Llamar
                    </a>
                    <a
                      href={obtenerEnlaceWhatsApp(empresa.telefono, empresa.nombreComercial || "Distribuidora")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                    >
                      WhatsApp
                    </a>
                    <button
                      onClick={() => copiarAlPortapapeles(empresa.telefono || "", "Teléfono")}
                      className="p-1.5 rounded-lg border hover:bg-neutral-100 text-neutral-600 transition"
                      title="Copiar teléfono"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-rose-500 shadow-sm bg-rose-50/20 dark:bg-rose-950/10">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-rose-600">
                    Emergencias & Fugas (24/7)
                  </CardTitle>
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-lg font-black text-rose-700 dark:text-rose-400">
                  {empresa?.telefono ? `${empresa.telefono}` : "Línea Roja 24/7"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Atención prioritaria y despacho urgente de soporte técnico.
                </p>
                {empresa?.telefono && (
                  <div className="pt-1">
                    <a
                      href={`tel:${empresa.telefono}`}
                      className="w-full text-center py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Llamar a Emergencias
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Email Corporativo
                  </CardTitle>
                  <Mail className="w-4 h-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm font-bold text-neutral-900 dark:text-white truncate" title={empresa?.emailContacto}>
                  {empresa?.emailContacto || "Sin registrar"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Comprobantes, facturas electrónicas y liquidaciones.
                </p>
                {empresa?.emailContacto && (
                  <div className="flex gap-2 pt-1">
                    <a
                      href={`mailto:${empresa.emailContacto}`}
                      className="flex-1 text-center py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition"
                    >
                      Redactar Email
                    </a>
                    <button
                      onClick={() => copiarAlPortapapeles(empresa?.emailContacto || "", "Correo")}
                      className="p-1.5 rounded-lg border hover:bg-neutral-100 text-neutral-600 transition"
                      title="Copiar correo"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Sede & Almacén
                  </CardTitle>
                  <MapPin className="w-4 h-4 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs font-medium text-neutral-900 dark:text-white line-clamp-2" title={empresa?.direccionFiscal}>
                  {empresa?.direccionFiscal || "Sin dirección fiscal registrada"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Punto de acopio y recarga autorizada de balones de gas.
                </p>
                {empresa?.direccionFiscal && (
                  <div className="pt-1">
                    <button
                      onClick={() => copiarAlPortapapeles(empresa?.direccionFiscal || "", "Dirección")}
                      className="w-full py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Dirección
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Directorio de Responsables */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" />
                Directorio Oficial de Personal y Responsables
              </CardTitle>
              <CardDescription>
                Contactos clave registrados para la operación ante la plataforma PideGas y los clientes finales.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contacto 1: Administrador */}
                <div className="p-5 rounded-2xl border bg-orange-50/10 dark:bg-orange-950/10 border-orange-200 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                      {usuario?.nombres ? usuario.nombres.charAt(0).toUpperCase() : "A"}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                        {usuario ? `${usuario.nombres} ${usuario.apellidos}` : "Administrador Titular"}
                        <Badge className="bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px]">
                          Titular
                        </Badge>
                      </div>
                      <div className="text-xs text-neutral-500">Representante Legal & Titular de Cuenta</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Teléfono:</span>
                      <span className="font-semibold">{empresa?.adminTelefono || empresa?.telefono || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Correo:</span>
                      <span className="font-medium text-orange-600">{usuario?.email || empresa?.emailContacto}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Disponibilidad:</span>
                      <span>Lunes a Viernes 08:00 - 18:00</span>
                    </div>
                  </div>
                </div>

                {/* Contacto 2: Despacho y Logística */}
                <div className="p-5 rounded-2xl border bg-card space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      D
                    </div>
                    <div>
                      <div className="font-bold text-sm text-neutral-900 dark:text-white">
                        Mesa de Despacho & Flota
                      </div>
                      <div className="text-xs text-neutral-500">Jefe de Operaciones y Enrutamiento</div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Teléfono:</span>
                      <span className="font-semibold">{empresa?.telefono || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Correo:</span>
                      <span className="font-medium text-orange-600">{empresa?.emailContacto}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Disponibilidad:</span>
                      <span>Lunes a Domingo 06:00 - 22:00</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Formulario de Datos */}
      {tab === "datos" && (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm space-y-5">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-500" />
            Configuración del Perfil Comercial
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Nombre Comercial *
              </label>
              <input
                type="text"
                required
                value={formData.nombreComercial}
                onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Razón Social (SUNAT)
              </label>
              <input
                type="text"
                value={formData.razonSocial}
                onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                Teléfono de Pedidos / WhatsApp
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="+51999888777"
                className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                RUC (Inmutable)
              </label>
              <input
                type="text"
                disabled
                value={empresa?.ruc || ""}
                className="w-full px-3 py-2 text-sm rounded-lg border bg-neutral-100 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Dirección Fiscal / Sede Central
            </label>
            <input
              type="text"
              value={formData.direccionFiscal}
              onChange={(e) => setFormData({ ...formData, direccionFiscal: e.target.value })}
              placeholder="Av. Principal 123, Distrito, Lima"
              className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="pt-4 border-t dark:border-neutral-800 flex justify-end">
            <Button type="submit" disabled={isPending} className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
              <Save className="w-4 h-4" />
              {isPending ? "Guardando cambios..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      )}

      {/* Tab 3: Módulos Operativos */}
      {tab === "accesos" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/empresa/pedidos" className="block">
            <Card className="hover:border-orange-500 hover:shadow-md transition p-5 space-y-2">
              <div className="p-3 w-fit rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base">Despacho en Vivo</h3>
              <p className="text-xs text-neutral-500">Gestión de pedidos Kanban, asignación de choferes y seguimiento GPS.</p>
            </Card>
          </Link>

          <Link href="/empresa/flota" className="block">
            <Card className="hover:border-orange-500 hover:shadow-md transition p-5 space-y-2">
              <div className="p-3 w-fit rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base">Flota y Repartidores</h3>
              <p className="text-xs text-neutral-500">Motos furgón, camionetas, choferes y verificación de balanzas calibradas.</p>
            </Card>
          </Link>

          <Link href="/empresa/inventario" className="block">
            <Card className="hover:border-orange-500 hover:shadow-md transition p-5 space-y-2">
              <div className="p-3 w-fit rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base">Inventario y Kardex</h3>
              <p className="text-xs text-neutral-500">Control de stock de balones 10kg, 15kg y 45kg en almacén central.</p>
            </Card>
          </Link>

          <Link href="/empresa/catalogo" className="block">
            <Card className="hover:border-orange-500 hover:shadow-md transition p-5 space-y-2">
              <div className="p-3 w-fit rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base">Catálogo de Productos</h3>
              <p className="text-xs text-neutral-500">Precios de balones, tipos de válvulas Click-On y accesorios.</p>
            </Card>
          </Link>

          <Link href="/empresa/cobertura" className="block">
            <Card className="hover:border-orange-500 hover:shadow-md transition p-5 space-y-2">
              <div className="p-3 w-fit rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base">Zonas de Cobertura</h3>
              <p className="text-xs text-neutral-500">Distritos y polígonos geográficos de atención y tiempo estimado.</p>
            </Card>
          </Link>

          <Link href="/empresa/finanzas" className="block">
            <Card className="hover:border-orange-500 hover:shadow-md transition p-5 space-y-2">
              <div className="p-3 w-fit rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base">Finanzas y Liquidaciones</h3>
              <p className="text-xs text-neutral-500">Historial de pagos, comisiones de plataforma y descargas contables.</p>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}
