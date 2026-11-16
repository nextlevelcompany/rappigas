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
  Coins,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  ArrowUpDown,
  Sparkles,
  CheckCircle2,
  Sliders,
  Receipt,
  QrCode,
  Banknote,
} from "lucide-react";
import { MetodoPago } from "@/librerias/api/finanzas.api";
import {
  obtenerMetodosPagoDistribuidor,
  guardarMetodosPagoDistribuidor,
} from "@/librerias/carrito-gas";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function MiEmpresaPage() {
  const { usuario } = useAuthStore();
  const [empresa, setEmpresa] = useState<EmpresaDetalle | null>(null);
  const [metricas, setMetricas] = useState<DashboardEmpresaDto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);
  const [tab, setTab] = useState<"estadisticas" | "contactos" | "datos" | "accesos" | "plan">("estadisticas");
  const [textoCopiado, setTextoCopiado] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [esquemaComision, setEsquemaComision] = useState<{
    tipo: "FIJA" | "PORCENTUAL";
    tarifaFija: number;
    tasaPorcentual: number;
    estadoPago: "AL_DIA" | "PENDIENTE" | "OBSERVADO";
  }>({
    tipo: "FIJA",
    tarifaFija: 1.20,
    tasaPorcentual: 3.0,
    estadoPago: "AL_DIA",
  });
  const [modalSolicitudPlan, setModalSolicitudPlan] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [tipoDeseado, setTipoDeseado] = useState<"FIJA" | "PORCENTUAL">("PORCENTUAL");
  const [motivoCambio, setMotivoCambio] = useState("");
  const [metodosPagoEmpresa, setMetodosPagoEmpresa] = useState<MetodoPago[]>(["EFECTIVO", "YAPE"]);

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
        setMetodosPagoEmpresa(obtenerMetodosPagoDistribuidor(empRes.value));

        if (typeof window !== "undefined") {
          let configEncontrada = null;
          if (empRes.value.publicId) {
            const raw = localStorage.getItem(`empresa_comision_${empRes.value.publicId}`);
            if (raw) {
              try { configEncontrada = JSON.parse(raw); } catch {}
            }
          }
          if (!configEncontrada) {
            const rawGlobal = localStorage.getItem("empresa_comision_activa");
            if (rawGlobal) {
              try { configEncontrada = JSON.parse(rawGlobal); } catch {}
            }
          }
          if (configEncontrada) {
            setEsquemaComision({
              tipo: configEncontrada.tipo || "FIJA",
              tarifaFija: configEncontrada.tarifaFija || 1.20,
              tasaPorcentual: configEncontrada.tasaPorcentual || 3.0,
              estadoPago: configEncontrada.estadoPago || "AL_DIA",
            });
            setTipoDeseado(configEncontrada.tipo === "FIJA" ? "PORCENTUAL" : "FIJA");
          }
        }
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

  const handleToggleMetodoPago = (metodo: MetodoPago) => {
    setMetodosPagoEmpresa((prev) => {
      let nuevo: MetodoPago[];
      if (prev.includes(metodo)) {
        if (prev.length === 1) {
          toast.error("Debes mantener habilitado al menos un método de pago.");
          return prev;
        }
        nuevo = prev.filter((m) => m !== metodo);
      } else {
        nuevo = [...prev, metodo];
      }
      const clave = empresa?.publicId || empresa?.ruc || empresa?.nombreComercial;
      if (clave) {
        guardarMetodosPagoDistribuidor(clave, nuevo);
      }
      toast.success("Métodos de pago del distribuidor actualizados.");
      return nuevo;
    });
  };

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
    <div className="w-full py-3 px-3 sm:px-6 space-y-3 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border rounded-lg p-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
            {empresa?.nombreComercial ? empresa.nombreComercial.charAt(0).toUpperCase() : "D"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                {empresa?.nombreComercial || "Mi Distribuidora"}
              </h1>
              {empresa?.estado === "APROBADA" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3" />
                  Aprobada
                </span>
              )}
              {empresa?.estado === "PENDIENTE" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <Timer className="w-3 h-3" />
                  En Revisión
                </span>
              )}
              {empresa?.estado === "SUSPENDIDA" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                  <XCircle className="w-3 h-3" />
                  Suspendida
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-600 border border-orange-500/20">
                <Coins className="w-3 h-3" />
                {esquemaComision.tipo === "FIJA"
                  ? `Comisión Fija: S/ ${esquemaComision.tarifaFija.toFixed(2)} / pedido`
                  : `Comisión: ${esquemaComision.tasaPorcentual.toFixed(1)}%`}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {empresa?.razonSocial || "Razón Social no registrada"} &bull; RUC: {empresa?.ruc} &bull; Tenant #{usuario?.tenantId || empresa?.id || "1"}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={cargarDatos} disabled={cargando} className="h-7 px-2.5 text-xs gap-1">
          <RefreshCw className={`w-3 h-3 ${cargando ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      {/* Alerta de Feedback */}
      {mensaje && (
        <div
          className={`p-2.5 px-3 rounded-lg flex items-center justify-between text-xs shadow-2xs ${
            mensaje.tipo === "exito"
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
          }`}
        >
          <span className="font-medium">{mensaje.texto}</span>
          <button onClick={() => setMensaje(null)} className="text-white hover:text-white/80 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* KPIs Rápidos de la Distribuidora */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground">Ventas del Mes</span>
            <p className="text-lg font-bold leading-tight mt-0.5 text-foreground">
              S/ {(metricas?.ventasMes ?? 0).toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Hoy: S/ {(metricas?.ventasHoy ?? 0).toFixed(2)}</span>
          </div>
          <DollarSign className="w-4 h-4 text-orange-500/70 shrink-0" />
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground">Despachos Totales</span>
            <p className="text-lg font-bold leading-tight mt-0.5 text-foreground">
              {metricas?.totalPedidosMes ?? 0}
            </p>
            <span className="text-[10px] text-muted-foreground">Entregados: {metricas?.pedidosEntregados ?? 0}</span>
          </div>
          <ShoppingBag className="w-4 h-4 text-blue-500/70 shrink-0" />
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground">Ticket Promedio</span>
            <p className="text-lg font-bold leading-tight mt-0.5 text-emerald-600">
              S/ {(metricas?.ticketPromedio ?? 0).toFixed(2)}
            </p>
            <span className="text-[10px] text-muted-foreground">Por balón</span>
          </div>
          <TrendingUp className="w-4 h-4 text-emerald-500/70 shrink-0" />
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground">Flota Asignada</span>
            <p className="text-lg font-bold leading-tight mt-0.5 text-foreground">
              {metricas?.repartidoresActivos ?? 0}
            </p>
            <span className="text-[10px] text-muted-foreground">Repartidores activos</span>
          </div>
          <Truck className="w-4 h-4 text-amber-500/70 shrink-0" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto gap-1 text-xs pb-1">
        <button
          onClick={() => setTab("estadisticas")}
          className={`h-7 px-2.5 flex items-center gap-1.5 rounded-md transition whitespace-nowrap ${
            tab === "estadisticas"
              ? "bg-orange-600 text-white shadow-2xs font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Estadísticas & Ventas
        </button>

        <button
          onClick={() => setTab("plan")}
          className={`h-7 px-2.5 flex items-center gap-1.5 rounded-md transition whitespace-nowrap ${
            tab === "plan"
              ? "bg-orange-600 text-white shadow-2xs font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          Plan y Comisiones
        </button>

        <button
          onClick={() => setTab("contactos")}
          className={`h-7 px-2.5 flex items-center gap-1.5 rounded-md transition whitespace-nowrap ${
            tab === "contactos"
              ? "bg-orange-600 text-white shadow-2xs font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          Directorio & Contactos
        </button>

        <button
          onClick={() => setTab("datos")}
          className={`h-7 px-2.5 flex items-center gap-1.5 rounded-md transition whitespace-nowrap ${
            tab === "datos"
              ? "bg-orange-600 text-white shadow-2xs font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Datos Comerciales & Fiscales
        </button>

        <button
          onClick={() => setTab("accesos")}
          className={`h-7 px-2.5 flex items-center gap-1.5 rounded-md transition whitespace-nowrap ${
            tab === "accesos"
              ? "bg-orange-600 text-white shadow-2xs font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <ExternalLink className="w-3.5 h-3.5" />
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

          {/* Configuración de Métodos de Pago Aceptados por el Distribuidor */}
          <div className="pt-4 border-t dark:border-neutral-800 space-y-3">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
                <CreditCard className="w-4 h-4 text-orange-500" />
                Métodos de Pago Habilitados para tus Clientes
              </h3>
              <p className="text-xs text-neutral-500">
                Solo los métodos que actives aquí aparecerán en la tienda y checkout cuando un cliente seleccione tu distribuidora.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* YAPE */}
              <button
                type="button"
                onClick={() => handleToggleMetodoPago("YAPE")}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                  metodosPagoEmpresa.includes("YAPE")
                    ? "border-purple-500 bg-purple-50/60 dark:bg-purple-950/40 ring-1 ring-purple-400"
                    : "border-slate-200 dark:border-neutral-700 bg-card opacity-60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-neutral-900 dark:text-white">Yape</span>
                    <span className="text-[10px] text-neutral-500 block">Billetera BCP</span>
                  </div>
                </div>
                <Badge variant={metodosPagoEmpresa.includes("YAPE") ? "default" : "outline"} className={metodosPagoEmpresa.includes("YAPE") ? "bg-purple-600 text-white" : ""}>
                  {metodosPagoEmpresa.includes("YAPE") ? "Activo" : "Inactivo"}
                </Badge>
              </button>

              {/* EFECTIVO */}
              <button
                type="button"
                onClick={() => handleToggleMetodoPago("EFECTIVO")}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                  metodosPagoEmpresa.includes("EFECTIVO")
                    ? "border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 ring-1 ring-amber-400"
                    : "border-slate-200 dark:border-neutral-700 bg-card opacity-60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-neutral-900 dark:text-white">Efectivo</span>
                    <span className="text-[10px] text-neutral-500 block">Contra entrega</span>
                  </div>
                </div>
                <Badge variant={metodosPagoEmpresa.includes("EFECTIVO") ? "default" : "outline"} className={metodosPagoEmpresa.includes("EFECTIVO") ? "bg-amber-600 text-white" : ""}>
                  {metodosPagoEmpresa.includes("EFECTIVO") ? "Activo" : "Inactivo"}
                </Badge>
              </button>

              {/* PLIN */}
              <button
                type="button"
                onClick={() => handleToggleMetodoPago("PLIN")}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                  metodosPagoEmpresa.includes("PLIN")
                    ? "border-cyan-500 bg-cyan-50/60 dark:bg-cyan-950/40 ring-1 ring-cyan-400"
                    : "border-slate-200 dark:border-neutral-700 bg-card opacity-60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0 font-black text-xs">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-neutral-900 dark:text-white">Plin</span>
                    <span className="text-[10px] text-neutral-500 block">Pago celular</span>
                  </div>
                </div>
                <Badge variant={metodosPagoEmpresa.includes("PLIN") ? "default" : "outline"} className={metodosPagoEmpresa.includes("PLIN") ? "bg-cyan-600 text-white" : ""}>
                  {metodosPagoEmpresa.includes("PLIN") ? "Activo" : "Inactivo"}
                </Badge>
              </button>

              {/* TARJETA POS */}
              <button
                type="button"
                onClick={() => handleToggleMetodoPago("TARJETA")}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-2 ${
                  metodosPagoEmpresa.includes("TARJETA")
                    ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 ring-1 ring-blue-400"
                    : "border-slate-200 dark:border-neutral-700 bg-card opacity-60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-neutral-900 dark:text-white">Tarjeta POS</span>
                    <span className="text-[10px] text-neutral-500 block">POS inalámbrico</span>
                  </div>
                </div>
                <Badge variant={metodosPagoEmpresa.includes("TARJETA") ? "default" : "outline"} className={metodosPagoEmpresa.includes("TARJETA") ? "bg-blue-600 text-white" : ""}>
                  {metodosPagoEmpresa.includes("TARJETA") ? "Activo" : "Inactivo"}
                </Badge>
              </button>
            </div>
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

      {/* Tab 4: Plan y Comisiones */}
      {tab === "plan" && (
        <div className="space-y-4">
          {/* Card Principal: Modalidad Activa */}
          <Card className="border-orange-500/30 bg-linear-to-br from-card via-card to-orange-500/5 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Plan Pay-Per-Order (Sin Costo de Membresía)
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                      {esquemaComision.estadoPago === "AL_DIA" ? "Facturación Al Día" : "Estado: " + esquemaComision.estadoPago}
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                    <Coins className="w-5 h-5 text-orange-500" />
                    Esquema Comercial y Comisión Activa
                  </CardTitle>
                  <CardDescription className="text-xs">
                    En RappiGas no cobramos suscripciones mensuales fijas. Tu distribuidora solo abona una tarifa por pedido entregado con éxito.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => setModalSolicitudPlan(true)}
                    className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5 h-8 text-xs font-semibold"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Cambiar Modalidad
                  </Button>
                  <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                    <Link href="/empresa/finanzas">
                      <Receipt className="w-3.5 h-3.5" />
                      Ver Finanzas
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-lg border bg-background/80 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium">Modalidad Contratada</span>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      {esquemaComision.tipo === "FIJA" ? "Comisión Fija" : "Comisión Porcentual"}
                    </p>
                  </div>
                  <span className="text-[10px] text-orange-600 font-semibold mt-2">
                    {esquemaComision.tipo === "FIJA"
                      ? `S/ ${esquemaComision.tarifaFija.toFixed(2)} por pedido completado`
                      : `${esquemaComision.tasaPorcentual.toFixed(1)}% sobre valor del pedido`}
                  </span>
                </div>

                <div className="p-3 rounded-lg border bg-background/80 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium">Membresía Mensual</span>
                    <p className="text-base font-bold text-emerald-600 mt-0.5">S/ 0.00 / mes</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-2">
                    Acceso ilimitado a plataforma sin costos fijos
                  </span>
                </div>

                <div className="p-3 rounded-lg border bg-background/80 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium">Ciclo de Liquidación</span>
                    <p className="text-base font-bold text-foreground mt-0.5">Quincenal</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-2">
                    Días 15 y fin de mes directamente a tu cuenta
                  </span>
                </div>

                <div className="p-3 rounded-lg border bg-background/80 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium">Canal de Cobro</span>
                    <p className="text-base font-bold text-foreground mt-0.5">Automático</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-2">
                    Se deduce del consolidado en el módulo Finanzas
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comparativa de Modalidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Modalidad Fija */}
            <div
              className={`rounded-xl border p-4 transition-all relative ${
                esquemaComision.tipo === "FIJA"
                  ? "border-orange-500 bg-orange-500/5 shadow-xs ring-1 ring-orange-500/30"
                  : "border-border bg-card hover:border-border/80"
              }`}
            >
              {esquemaComision.tipo === "FIJA" && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white shadow-2xs">
                  <Check className="w-3 h-3" />
                  Activa Actualmente
                </span>
              )}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
                  S/
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Comisión Fija Única</h3>
                  <span className="text-[10px] text-muted-foreground">Por cada balón o pedido entregado</span>
                </div>
              </div>

              <div className="my-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-foreground">S/ {esquemaComision.tarifaFija.toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">/ pedido</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Monto plano sin importar si el pedido es de S/ 40, S/ 60 o S/ 180.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t text-[11px]">
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Ideal para balones de 15kg, 45kg o pedidos de mayor ticket</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Costo operativo 100% predecible en cada despacho</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Si sube el precio de mercado del GLP, tu comisión no sube</span>
                </div>
              </div>

              {esquemaComision.tipo !== "FIJA" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTipoDeseado("FIJA");
                    setModalSolicitudPlan(true);
                  }}
                  className="w-full mt-4 h-7 text-xs"
                >
                  Solicitar cambio a Comisión Fija
                </Button>
              )}
            </div>

            {/* Modalidad Porcentual */}
            <div
              className={`rounded-xl border p-4 transition-all relative ${
                esquemaComision.tipo === "PORCENTUAL"
                  ? "border-orange-500 bg-orange-500/5 shadow-xs ring-1 ring-orange-500/30"
                  : "border-border bg-card hover:border-border/80"
              }`}
            >
              {esquemaComision.tipo === "PORCENTUAL" && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white shadow-2xs">
                  <Check className="w-3 h-3" />
                  Activa Actualmente
                </span>
              )}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  %
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Comisión Porcentual</h3>
                  <span className="text-[10px] text-muted-foreground">Proporcional al subtotal vendido</span>
                </div>
              </div>

              <div className="my-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-foreground">{esquemaComision.tasaPorcentual.toFixed(1)}%</span>
                  <span className="text-xs text-muted-foreground">de la venta</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Por ejemplo: en un balón de S/ 45.00 abonas solo S/ {(45 * (esquemaComision.tasaPorcentual / 100)).toFixed(2)}.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t text-[11px]">
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Ideal para distribuidores con alta rotación de balones pequeños (5kg o 10kg)</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Si aplicas descuentos o promociones al cliente, tu comisión baja proporcionalmente</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Menor impacto en ventas de valor unitario bajo</span>
                </div>
              </div>

              {esquemaComision.tipo !== "PORCENTUAL" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTipoDeseado("PORCENTUAL");
                    setModalSolicitudPlan(true);
                  }}
                  className="w-full mt-4 h-7 text-xs"
                >
                  Solicitar cambio a Comisión Porcentual
                </Button>
              )}
            </div>
          </div>

          {/* Capacidades y Beneficios Incluidos */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Capacidades de Plataforma Incluidas en tu Cuenta
              </CardTitle>
              <CardDescription className="text-xs">
                Todas las herramientas operativas están habilitadas sin costo adicional bajo cualquier modalidad.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-lg border bg-muted/30 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Despacho y Asignación Kanban</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Recepción automática de pedidos por WhatsApp y Web con asignación inmediata al repartidor más cercano.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border bg-muted/30 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Flota y Repartidores Ilimitados</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Registra tantos choferes y unidades de transporte (motos furgón, camionetas) como requiera tu operación.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border bg-muted/30 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Control de Kardex e Inventario</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Seguimiento en tiempo real de balones llenos, vacíos prestados y en ruta con registro de válvulas Click-On.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border bg-muted/30 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Zonas de Cobertura Georreferenciadas</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Configuración de polígonos por distrito, tiempos de entrega estimados y límites de atención.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border bg-muted/30 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Finanzas y Descarga Contable</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Detalle transparente de cada comisión descontada con exportación directa a Excel/CSV para tu contador.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border bg-muted/30 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Soporte Operativo RappiGas</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Canal directo de asistencia técnica y resolución de incidencias en entregas los 7 días de la semana.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal para Solicitar Cambio de Modalidad de Comisión */}
      <Dialog open={modalSolicitudPlan} onOpenChange={setModalSolicitudPlan}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Coins className="w-5 h-5 text-orange-500" />
              Solicitar Cambio de Modalidad de Comisión
            </DialogTitle>
            <DialogDescription className="text-xs">
              Elige la modalidad que prefieres aplicar a tu cuenta de distribuidora. El cambio se registrará y sincronizará en tus próximas liquidaciones.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <label className="font-semibold text-foreground block">
                Selecciona la Modalidad Deseada:
              </label>

              <div
                onClick={() => setTipoDeseado("FIJA")}
                className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                  tipoDeseado === "FIJA"
                    ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/30"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div>
                  <p className="font-bold text-foreground">Comisión Fija (S/ {esquemaComision.tarifaFija.toFixed(2)} por pedido)</p>
                  <p className="text-[11px] text-muted-foreground">Tarifa plana por cada entrega, independiente del monto total del balón.</p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    tipoDeseado === "FIJA" ? "border-orange-500 bg-orange-500" : "border-muted-foreground"
                  }`}
                >
                  {tipoDeseado === "FIJA" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>

              <div
                onClick={() => setTipoDeseado("PORCENTUAL")}
                className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                  tipoDeseado === "PORCENTUAL"
                    ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/30"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div>
                  <p className="font-bold text-foreground">Comisión Porcentual ({esquemaComision.tasaPorcentual.toFixed(1)}% sobre venta)</p>
                  <p className="text-[11px] text-muted-foreground">Porcentaje proporcional sobre el monto facturado en cada pedido.</p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    tipoDeseado === "PORCENTUAL" ? "border-orange-500 bg-orange-500" : "border-muted-foreground"
                  }`}
                >
                  {tipoDeseado === "PORCENTUAL" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground block">
                Motivo del cambio o notas (opcional):
              </label>
              <textarea
                value={motivoCambio}
                onChange={(e) => setMotivoCambio(e.target.value)}
                placeholder="Ej. Cambio de estrategia comercial, mayor volumen de balones industriales, etc."
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-muted/50 border text-[11px] text-muted-foreground flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <span>
                Recuerda que en RappiGas puedes alternar entre ambas modalidades según la estacionalidad de tu negocio sin ningún tipo de penalidad.
              </span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalSolicitudPlan(false)}
              className="text-xs h-8"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const nuevoEsquema = {
                  ...esquemaComision,
                  tipo: tipoDeseado,
                };
                setEsquemaComision(nuevoEsquema);

                if (typeof window !== "undefined") {
                  if (empresa?.publicId) {
                    localStorage.setItem(`empresa_comision_${empresa.publicId}`, JSON.stringify(nuevoEsquema));
                  }
                  localStorage.setItem("empresa_comision_activa", JSON.stringify(nuevoEsquema));
                }

                setModalSolicitudPlan(false);
                setMensaje({
                  tipo: "exito",
                  texto: `Modalidad actualizada exitosamente a ${
                    tipoDeseado === "FIJA"
                      ? `Comisión Fija S/ ${esquemaComision.tarifaFija.toFixed(2)} / pedido`
                      : `Comisión Porcentual ${esquemaComision.tasaPorcentual.toFixed(1)}%`
                  }. Se aplicará en tus próximas liquidaciones.`,
                });
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white text-xs h-8"
            >
              Confirmar Cambio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
