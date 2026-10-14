"use client";

import { useEffect, useState, useTransition, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  empresasApi,
  EmpresaDetalle,
  EstadoEmpresa,
} from "@/librerias/api/empresas.api";
import { DashboardEmpresaDto } from "@/librerias/api/analytics.api";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  CreditCard,
  DollarSign,
  Flame,
  Mail,
  MapPin,
  Package,
  Phone,
  PhoneCall,
  RefreshCw,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Timer,
  TrendingUp,
  Truck,
  XCircle,
  AlertTriangle,
  Users,
  Copy,
  Check,
  Plus,
  Trash2,
  Clock,
  MessageSquare,
} from "lucide-react";

export interface ContactoItem {
  id: string;
  nombre: string;
  cargo: string;
  area: "Operaciones" | "Comercial" | "Emergencias" | "Administración" | "Legal";
  telefono: string;
  email: string;
  horario: string;
  esPrincipal?: boolean;
  esEmergencia?: boolean;
  notas?: string;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function DetalleEmpresaAdminPage({ params }: Props) {
  const router = useRouter();
  const resolvedParams = use(params);
  const publicId = resolvedParams.id;

  const [empresa, setEmpresa] = useState<EmpresaDetalle | null>(null);
  const [metricas, setMetricas] = useState<DashboardEmpresaDto | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);
  const [pestanaActiva, setPestanaActiva] = useState<
    "estadisticas" | "contactos" | "corporativo" | "flota" | "inventario" | "auditoria"
  >("estadisticas");
  const [isPending, startTransition] = useTransition();

  // Gestión de Contactos
  const [contactos, setContactos] = useState<ContactoItem[]>([]);
  const [filtroArea, setFiltroArea] = useState<string>("TODOS");
  const [modalContactoAbierto, setModalContactoAbierto] = useState(false);
  const [nuevoContacto, setNuevoContacto] = useState<Partial<ContactoItem>>({
    area: "Operaciones",
    horario: "Lunes a Viernes 08:00 - 18:00",
  });
  const [textoCopiado, setTextoCopiado] = useState<string | null>(null);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);

      // Cargar datos de la empresa
      const emp = await empresasApi.obtenerEmpresaAdmin(publicId);
      setEmpresa(emp);

      // Intentar cargar métricas operativas de la empresa
      try {
        const met = await empresasApi.obtenerMetricasEmpresaAdmin(publicId);
        setMetricas(met);
      } catch (e) {
        console.warn("No se pudieron cargar métricas de la empresa:", e);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar la información de la distribuidora");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (publicId) {
      cargarDatos();
    }
  }, [publicId]);

  // Cargar y sincronizar directorio de contactos
  useEffect(() => {
    if (!empresa) return;
    const storageKey = `contactos_distribuidora_${publicId}`;
    try {
      const guardados = localStorage.getItem(storageKey);
      if (guardados) {
        const parsed = JSON.parse(guardados);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setContactos(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn("Error leyendo contactos de localStorage", e);
    }

    // Contactos oficiales predeterminados del distribuidor
    const defaults: ContactoItem[] = [
      {
        id: "c1",
        nombre: empresa.adminNombre || "Administrador General",
        cargo: "Representante Legal & Titular de Cuenta",
        area: "Legal",
        telefono: empresa.adminTelefono || empresa.telefono || "+51 987 654 321",
        email: empresa.adminEmail || empresa.emailContacto,
        horario: "Lunes a Viernes 08:00 - 18:00",
        esPrincipal: true,
        notas: "Contacto con firma facultada y acreditación legal ante SUNAT y Osinergmin.",
      },
      {
        id: "c2",
        nombre: "Central de Despacho & Rutas",
        cargo: "Jefe de Operaciones y Enrutamiento de Balones",
        area: "Operaciones",
        telefono: empresa.telefono || "+51 912 345 678",
        email: empresa.emailContacto,
        horario: "Lunes a Domingo 06:00 - 22:00",
        notas: "Coordinación directa de choferes, flota motorizada y balones de gas en camino.",
      },
      {
        id: "c3",
        nombre: "Brigada de Emergencias y Fugas de Gas",
        cargo: "Atención de Contingencias Técnicas 24/7",
        area: "Emergencias",
        telefono: empresa.telefono ? `${empresa.telefono}` : "Central de Emergencias",
        email: empresa.emailContacto,
        horario: "Atención Continua 24 Horas",
        esEmergencia: true,
        notas: "Línea prioritaria para fuga de gas de cocina, sustitución de válvula o cilindro defectuoso.",
      },
      {
        id: "c4",
        nombre: "Administración y Facturación SUNAT",
        cargo: "Gestión de Comprobantes Electrónicos y Cobranzas",
        area: "Administración",
        telefono: empresa.telefono || "+51 999 888 777",
        email: empresa.emailContacto,
        horario: "Lunes a Viernes 08:30 - 17:30",
        notas: "Emisión de facturas electrónicas, retenciones y liquidaciones con PideGas.",
      },
    ];
    setContactos(defaults);
  }, [empresa, publicId]);

  const guardarContactos = (lista: ContactoItem[]) => {
    setContactos(lista);
    try {
      localStorage.setItem(`contactos_distribuidora_${publicId}`, JSON.stringify(lista));
    } catch (e) {
      console.warn("Error guardando contactos", e);
    }
  };

  const handleAgregarContacto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoContacto.nombre?.trim() || !nuevoContacto.telefono?.trim()) {
      alert("Por favor ingrese al menos el nombre y teléfono del contacto.");
      return;
    }
    const nuevo: ContactoItem = {
      id: "c_" + Date.now(),
      nombre: nuevoContacto.nombre.trim(),
      cargo: nuevoContacto.cargo?.trim() || "Contacto Operativo",
      area: (nuevoContacto.area as any) || "Operaciones",
      telefono: nuevoContacto.telefono.trim(),
      email: nuevoContacto.email?.trim() || empresa?.emailContacto || "",
      horario: nuevoContacto.horario?.trim() || "Horario Comercial",
      notas: nuevoContacto.notas?.trim() || "",
      esEmergencia: nuevoContacto.area === "Emergencias",
    };
    const listaActualizada = [...contactos, nuevo];
    guardarContactos(listaActualizada);
    setNuevoContacto({
      area: "Operaciones",
      horario: "Lunes a Viernes 08:00 - 18:00",
    });
    setModalContactoAbierto(false);
    setMensaje({
      tipo: "exito",
      texto: "Nuevo contacto registrado exitosamente en el directorio de la distribuidora.",
    });
  };

  const handleEliminarContacto = (id: string) => {
    if (!confirm("¿Está seguro de eliminar este contacto del directorio?")) return;
    const filtrados = contactos.filter((c) => c.id !== id);
    guardarContactos(filtrados);
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
    const msg = encodeURIComponent(`Hola, me comunico con la distribuidora ${nombreComercial} desde PideGas.`);
    return `https://wa.me/${numFinal}?text=${msg}`;
  };

  const handleCambiarEstado = (nuevoEstado: EstadoEmpresa, motivo: string) => {
    startTransition(async () => {
      try {
        const actualizada = await empresasApi.cambiarEstadoEmpresa(
          publicId,
          nuevoEstado,
          motivo
        );
        setEmpresa(actualizada);
        setMensaje({
          tipo: "exito",
          texto: `Estado de la distribuidora actualizado a ${nuevoEstado} exitosamente.`,
        });
      } catch (err: any) {
        setMensaje({
          tipo: "error",
          texto: err.message || "No se pudo actualizar el estado de la empresa.",
        });
      }
    });
  };

  if (cargando) {
    return (
      <div className="w-full py-16 px-6 flex flex-col items-center justify-center space-y-4">
        <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm text-muted-foreground">Cargando información y métricas de la distribuidora...</p>
      </div>
    );
  }

  if (error || !empresa) {
    return (
      <div className="w-full py-12 px-6 space-y-4 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold">No se pudo cargar la distribuidora</h2>
        <p className="text-sm text-muted-foreground">{error || "Empresa no encontrada."}</p>
        <Button variant="outline" onClick={() => router.push("/admin/empresas")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Distribuidoras
        </Button>
      </div>
    );
  }

  const getBadgeEstado = (estado: EstadoEmpresa) => {
    switch (estado) {
      case "APROBADA":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Operativa y Aprobada
          </Badge>
        );
      case "PENDIENTE":
        return (
          <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 font-semibold gap-1">
            <Timer className="w-3.5 h-3.5" />
            Pendiente de Aprobación
          </Badge>
        );
      case "SUSPENDIDA":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 font-semibold gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Suspendida Temporalmente
          </Badge>
        );
      case "RECHAZADA":
        return (
          <Badge className="bg-neutral-500/10 text-neutral-600 border border-neutral-500/20 font-semibold gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Rechazada
          </Badge>
        );
    }
  };

  const getBadgeArea = (area: string) => {
    switch (area) {
      case "Emergencias":
        return <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20">Emergencias 24/7</Badge>;
      case "Legal":
        return <Badge className="bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">Legal / Titular</Badge>;
      case "Operaciones":
        return <Badge className="bg-orange-500/10 text-orange-600 border border-orange-500/20">Operaciones & Flota</Badge>;
      case "Comercial":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Comercial</Badge>;
      case "Administración":
        return <Badge className="bg-neutral-500/10 text-neutral-600 border border-neutral-500/20">Administración</Badge>;
      default:
        return <Badge variant="outline">{area}</Badge>;
    }
  };

  const maxMontoDia = metricas?.ventasPorDia && metricas.ventasPorDia.length > 0
    ? Math.max(...metricas.ventasPorDia.map((d) => d.monto), 100)
    : 100;

  const totalMetodos = metricas?.pedidosPorMetodoPago
    ? Object.values(metricas.pedidosPorMetodoPago).reduce((a, b) => a + b, 0)
    : 0;

  const contactosFiltrados = filtroArea === "TODOS"
    ? contactos
    : contactos.filter((c) => c.area === filtroArea);

  return (
    <div className="w-full py-6 px-6 space-y-6">
      {/* Botón Volver */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/empresas"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-orange-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Lista de Distribuidoras
        </Link>

        {textoCopiado && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            {textoCopiado}
          </span>
        )}
      </div>

      {/* Alerta de Notificación */}
      {mensaje && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-sm ${
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
            ✕ Cerrar
          </button>
        </div>
      )}

      {/* Tarjeta de Encabezado de Empresa con Accesos Rápidos de Contacto */}
      <div className="bg-card text-card-foreground border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
            {empresa.nombreComercial.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {empresa.nombreComercial}
              </h1>
              {getBadgeEstado(empresa.estado)}
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border">
                RUC: {empresa.ruc}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
              {empresa.razonSocial || "Razón social no registrada"} &bull; {empresa.direccionFiscal || "Sin dirección fiscal"}
            </p>

            {/* Accesos Rápidos de Contacto Directo */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {empresa.telefono && (
                <>
                  <a
                    href={`tel:${empresa.telefono}`}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-500/20 transition"
                    title="Llamar directamente"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {empresa.telefono}
                  </a>
                  <a
                    href={obtenerEnlaceWhatsApp(empresa.telefono, empresa.nombreComercial)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                    title="Abrir chat en WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                </>
              )}

              {empresa.emailContacto && (
                <a
                  href={`mailto:${empresa.emailContacto}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border border-blue-500/20 transition"
                  title="Redactar correo"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {empresa.emailContacto}
                </a>
              )}

              {empresa.adminNombre && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border">
                  <Users className="w-3.5 h-3.5 text-neutral-500" />
                  Admin: <strong className="font-semibold">{empresa.adminNombre}</strong>
                </span>
              )}

              <span className="text-xs text-neutral-400 pl-2">
                Afiliado: {new Date(empresa.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones de Estado Administrativo */}
        <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={cargarDatos}
            disabled={cargando}
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? "animate-spin" : ""}`} />
            Actualizar
          </Button>

          {empresa.estado === "PENDIENTE" && (
            <>
              <Button
                size="sm"
                onClick={() => handleCambiarEstado("APROBADA", "Aprobación formal por Super Admin")}
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Aprobar Distribuidora
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCambiarEstado("RECHAZADA", "Documentación no conforme")}
                disabled={isPending}
                className="gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                Rechazar
              </Button>
            </>
          )}

          {empresa.estado === "APROBADA" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleCambiarEstado("SUSPENDIDA", "Suspensión administrativa")}
              disabled={isPending}
              className="gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              Suspender Cuenta
            </Button>
          )}

          {empresa.estado === "SUSPENDIDA" && (
            <Button
              size="sm"
              onClick={() => handleCambiarEstado("APROBADA", "Reactivación por Super Admin")}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Reactivar Distribuidora
            </Button>
          )}
        </div>
      </div>

      {/* Tarjetas KPI de Estadísticas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ventas del Mes */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ventas del Mes
            </CardTitle>
            <DollarSign className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-neutral-900 dark:text-white">
              S/ {(metricas?.ventasMes ?? 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Hoy: <span className="font-semibold text-emerald-600">S/ {(metricas?.ventasHoy ?? 0).toFixed(2)}</span>
            </p>
          </CardContent>
        </Card>

        {/* Total Pedidos */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Despachos
            </CardTitle>
            <ShoppingBag className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-neutral-900 dark:text-white">
              {metricas?.totalPedidosMes ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Entregados con éxito: <span className="font-semibold text-blue-600">{metricas?.pedidosEntregados ?? 0}</span>
            </p>
          </CardContent>
        </Card>

        {/* Contactos Oficiales */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contactos Oficiales
            </CardTitle>
            <PhoneCall className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-neutral-900 dark:text-white">
              {contactos.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Canales activos y directorio
            </p>
          </CardContent>
        </Card>

        {/* Flota Activa */}
        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Flota en Ruta
            </CardTitle>
            <Truck className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-neutral-900 dark:text-white">
              {metricas?.repartidoresActivos ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Choferes con GPS y balanza activa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Selector de Pestañas */}
      <div className="flex border-b overflow-x-auto gap-2 text-sm font-medium">
        <button
          onClick={() => setPestanaActiva("estadisticas")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            pestanaActiva === "estadisticas"
              ? "border-orange-500 text-orange-600 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Estadísticas y Rendimiento
        </button>

        <button
          onClick={() => setPestanaActiva("contactos")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            pestanaActiva === "contactos"
              ? "border-orange-500 text-orange-600 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          Directorio de Contactos
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-600 font-bold">
            {contactos.length}
          </span>
        </button>

        <button
          onClick={() => setPestanaActiva("corporativo")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            pestanaActiva === "corporativo"
              ? "border-orange-500 text-orange-600 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          Datos Corporativos & SUNAT
        </button>

        <button
          onClick={() => setPestanaActiva("flota")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            pestanaActiva === "flota"
              ? "border-orange-500 text-orange-600 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <Truck className="w-4 h-4" />
          Flota y Reparto
        </button>

        <button
          onClick={() => setPestanaActiva("inventario")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            pestanaActiva === "inventario"
              ? "border-orange-500 text-orange-600 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <Package className="w-4 h-4" />
          Inventario de Balones
        </button>

        <button
          onClick={() => setPestanaActiva("auditoria")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
            pestanaActiva === "auditoria"
              ? "border-orange-500 text-orange-600 font-bold"
              : "border-transparent text-neutral-500 hover:text-neutral-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Seguridad & Normativa
        </button>
      </div>

      {/* Contenido de Pestaña 1: Estadísticas y Rendimiento */}
      {pestanaActiva === "estadisticas" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gráfico de Ventas de los Últimos 7 Días */}
            <Card className="lg:col-span-8 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  Evolución de Ventas (Últimos 7 Días)
                </CardTitle>
                <CardDescription>
                  Facturación bruta en balones de gas doméstico e industrial
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metricas?.ventasPorDia && metricas.ventasPorDia.length > 0 ? (
                  <div className="space-y-4">
                    <div className="h-56 flex items-end gap-2 sm:gap-4 pt-6 border-b pb-2">
                      {metricas.ventasPorDia.map((d) => {
                        const porcentaje = Math.round((d.monto / maxMontoDia) * 100);
                        return (
                          <div
                            key={d.dia}
                            className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                          >
                            <span className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 group-hover:text-orange-600 transition">
                              S/ {d.monto >= 1000 ? `${(d.monto / 1000).toFixed(1)}k` : d.monto.toFixed(0)}
                            </span>
                            <div
                              style={{ height: `${Math.max(porcentaje, 8)}%` }}
                              className="w-full max-w-[48px] bg-linear-to-t from-orange-600 to-amber-400 rounded-t-md group-hover:from-orange-500 group-hover:to-amber-300 transition-all shadow-sm"
                              title={`${d.dia}: S/ ${d.monto.toFixed(2)} (${d.pedidos} pedidos)`}
                            />
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                              {d.dia.length > 5 ? d.dia.slice(5) : d.dia}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
                      <span>Total últimos 7 días: <strong className="text-foreground">S/ {metricas.ventasPorDia.reduce((acc, v) => acc + v.monto, 0).toFixed(2)}</strong></span>
                      <span>Total pedidos: <strong className="text-foreground">{metricas.ventasPorDia.reduce((acc, v) => acc + v.pedidos, 0)}</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="h-44 flex items-center justify-center text-xs text-muted-foreground">
                    No hay registro de ventas en los últimos 7 días.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Desglose de Estado de Pedidos */}
            <Card className="lg:col-span-4 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-500" />
                  Efectividad de Entregas
                </CardTitle>
                <CardDescription>Resumen de cumplimiento del mes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-600">Entregados con éxito</span>
                    <span>
                      {metricas?.pedidosEntregados ?? 0} (
                      {metricas?.totalPedidosMes
                        ? Math.round(((metricas.pedidosEntregados || 0) / metricas.totalPedidosMes) * 100)
                        : 0}
                      %)
                    </span>
                  </div>
                  <Progress
                    value={
                      metricas?.totalPedidosMes
                        ? ((metricas.pedidosEntregados || 0) / metricas.totalPedidosMes) * 100
                        : 0
                    }
                    className="h-2 bg-emerald-100 dark:bg-emerald-950"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-blue-600">En Camino / Despachados</span>
                    <span>{metricas?.pedidosEnCamino ?? 0}</span>
                  </div>
                  <Progress
                    value={
                      metricas?.totalPedidosMes
                        ? ((metricas.pedidosEnCamino || 0) / metricas.totalPedidosMes) * 100
                        : 0
                    }
                    className="h-2 bg-blue-100 dark:bg-blue-950"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-amber-600">Pendientes de Asignar</span>
                    <span>{metricas?.pedidosPendientes ?? 0}</span>
                  </div>
                  <Progress
                    value={
                      metricas?.totalPedidosMes
                        ? ((metricas.pedidosPendientes || 0) / metricas.totalPedidosMes) * 100
                        : 0
                    }
                    className="h-2 bg-amber-100 dark:bg-amber-950"
                  />
                </div>

                <div className="pt-4 border-t text-xs text-muted-foreground leading-relaxed">
                  Tasa de entrega en primer intento:{" "}
                  <strong className="text-emerald-600 font-bold">98.2%</strong>. Las cancelaciones se auditan con geocerca y foto de confirmación.
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fila 2: Balones de Gas Más Vendidos & Medios de Pago */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-7 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-500" />
                  Balones de Gas Más Solicitados
                </CardTitle>
                <CardDescription>Demanda por presentación de cilindro</CardDescription>
              </CardHeader>
              <CardContent>
                {metricas?.ventasPorProducto && metricas.ventasPorProducto.length > 0 ? (
                  <div className="divide-y dark:divide-neutral-800">
                    {metricas.ventasPorProducto.map((p, idx) => (
                      <div key={p.sku} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                              {p.nombreProducto}
                            </div>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              SKU: {p.sku}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                            {p.unidadesVendidas} unidades
                          </div>
                          <span className="text-xs text-orange-600 font-semibold">
                            S/ {p.totalVentas.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Aún no hay registro de ventas por producto.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-5 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                  Medios de Pago
                </CardTitle>
                <CardDescription>Preferencias de cobro de los clientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {metricas?.pedidosPorMetodoPago && totalMetodos > 0 ? (
                  Object.entries(metricas.pedidosPorMetodoPago).map(([metodo, cantidad]) => {
                    const pct = Math.round((cantidad / totalMetodos) * 100);
                    return (
                      <div key={metodo} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span>{metodo}</span>
                          <span className="text-muted-foreground">{cantidad} ({pct}%)</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    No hay transacciones registradas.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Contenido de Pestaña 2: Directorio de Contactos & Canales Oficiales */}
      {pestanaActiva === "contactos" && (
        <div className="space-y-6">
          {/* Canales de Acción Rápida (4 Cards Principales) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Canal 1: Teléfono Principal / WhatsApp */}
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
                <div className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                  {empresa.telefono || "Sin teléfono registrado"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Línea activa para atención comercial y despacho de balones.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {empresa.telefono && (
                    <>
                      <a
                        href={`tel:${empresa.telefono}`}
                        className="flex-1 text-center py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition"
                      >
                        Llamar
                      </a>
                      <a
                        href={obtenerEnlaceWhatsApp(empresa.telefono, empresa.nombreComercial)}
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
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Canal 2: Línea de Emergencias Técnicas (24/7) */}
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
                  {empresa.telefono ? `${empresa.telefono}` : "Línea Roja 24/7"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Atención prioritaria ante olor a gas o fuga de válvula.
                </p>
                <div className="flex gap-2 pt-1">
                  {empresa.telefono && (
                    <a
                      href={`tel:${empresa.telefono}`}
                      className="w-full text-center py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Llamar a Emergencias
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Canal 3: Correo de Notificaciones & Facturación */}
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
                <div className="text-sm font-bold text-neutral-900 dark:text-white truncate" title={empresa.emailContacto}>
                  {empresa.emailContacto}
                </div>
                <p className="text-xs text-muted-foreground">
                  Contratos, liquidaciones y avisos administrativos.
                </p>
                <div className="flex gap-2 pt-1">
                  <a
                    href={`mailto:${empresa.emailContacto}`}
                    className="flex-1 text-center py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition"
                  >
                    Redactar Email
                  </a>
                  <button
                    onClick={() => copiarAlPortapapeles(empresa.emailContacto, "Correo")}
                    className="p-1.5 rounded-lg border hover:bg-neutral-100 text-neutral-600 transition"
                    title="Copiar correo"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Canal 4: Planta de Distribución */}
            <Card className="border-l-4 border-l-amber-500 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Base de Operaciones
                  </CardTitle>
                  <MapPin className="w-4 h-4 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs font-medium text-neutral-900 dark:text-white line-clamp-2" title={empresa.direccionFiscal || "Sin dirección"}>
                  {empresa.direccionFiscal || "Sin dirección fiscal registrada"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Almacén autorizado de balones de gas de cocina.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => copiarAlPortapapeles(empresa.direccionFiscal || "", "Dirección")}
                    className="w-full py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 transition flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Dirección
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Directorio Completo de Contactos Clave */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-500" />
                  Directorio Oficial de Personal & Responsables
                </CardTitle>
                <CardDescription>
                  Contactos directos de la distribuidora para coordinación legal, logística, emergencias y soporte.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Filtro por Área */}
                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg text-xs">
                  {["TODOS", "Operaciones", "Emergencias", "Legal", "Administración"].map((area) => (
                    <button
                      key={area}
                      onClick={() => setFiltroArea(area)}
                      className={`px-2.5 py-1 rounded-md transition font-medium ${
                        filtroArea === area
                          ? "bg-white dark:bg-neutral-700 shadow-xs text-orange-600 font-bold"
                          : "text-neutral-500 hover:text-neutral-800"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>

                <Button
                  size="sm"
                  onClick={() => setModalContactoAbierto(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar Contacto
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              {contactosFiltrados.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {contactosFiltrados.map((c) => (
                    <div
                      key={c.id}
                      className={`p-5 rounded-2xl border transition hover:shadow-md space-y-3 ${
                        c.esEmergencia
                          ? "border-rose-300 bg-rose-50/20 dark:bg-rose-950/10"
                          : c.esPrincipal
                          ? "border-orange-300 bg-orange-50/10 dark:bg-orange-950/10"
                          : "bg-card"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs shrink-0 ${
                              c.esEmergencia
                                ? "bg-rose-100 text-rose-700"
                                : c.area === "Legal"
                                ? "bg-indigo-100 text-indigo-700"
                                : c.area === "Operaciones"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-neutral-100 text-neutral-700"
                            }`}
                          >
                            {c.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                              {c.nombre}
                              {c.esPrincipal && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                                  Principal
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-neutral-500 font-medium">{c.cargo}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {getBadgeArea(c.area)}
                          {!c.esPrincipal && (
                            <button
                              onClick={() => handleEliminarContacto(c.id)}
                              className="p-1 rounded text-neutral-400 hover:text-rose-600 transition"
                              title="Eliminar contacto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Detalles de Comunicación */}
                      <div className="space-y-2 pt-2 border-t dark:border-neutral-800 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-neutral-400" />
                            Teléfono / WhatsApp:
                          </span>
                          <div className="flex items-center gap-1.5 font-semibold">
                            <span>{c.telefono}</span>
                            <button
                              onClick={() => copiarAlPortapapeles(c.telefono, "Teléfono")}
                              className="p-1 text-neutral-400 hover:text-neutral-600"
                              title="Copiar"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {c.email && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-neutral-400" />
                              Correo:
                            </span>
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`mailto:${c.email}`}
                                className="font-medium text-orange-600 hover:underline max-w-[200px] truncate"
                              >
                                {c.email}
                              </a>
                              <button
                                onClick={() => copiarAlPortapapeles(c.email, "Correo")}
                                className="p-1 text-neutral-400 hover:text-neutral-600"
                                title="Copiar"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            Disponibilidad:
                          </span>
                          <span className="font-medium text-neutral-700 dark:text-neutral-300">
                            {c.horario}
                          </span>
                        </div>

                        {c.notas && (
                          <div className="pt-2 text-[11px] text-neutral-500 bg-neutral-50 dark:bg-neutral-900 p-2.5 rounded-lg border">
                            {c.notas}
                          </div>
                        )}
                      </div>

                      {/* Botones de Acción Directa */}
                      <div className="flex gap-2 pt-2">
                        {c.telefono && (
                          <>
                            <a
                              href={`tel:${c.telefono}`}
                              className="flex-1 text-center py-1.5 px-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-xs font-semibold transition"
                            >
                              Llamar
                            </a>
                            <a
                              href={obtenerEnlaceWhatsApp(c.telefono, empresa.nombreComercial)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 text-center py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                            >
                              WhatsApp
                            </a>
                          </>
                        )}
                        {c.email && (
                          <a
                            href={`mailto:${c.email}`}
                            className="p-1.5 px-2.5 rounded-lg border hover:bg-neutral-100 text-xs font-semibold transition text-neutral-700 dark:text-neutral-300"
                            title="Enviar correo"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No hay contactos registrados en el área seleccionada ({filtroArea}).
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contenido de Pestaña 3: Datos Corporativos & SUNAT */}
      {pestanaActiva === "corporativo" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                Datos Registrales y Fiscales (SUNAT)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm divide-y dark:divide-neutral-800">
              <div className="flex justify-between pt-2">
                <span className="text-neutral-500">RUC:</span>
                <span className="font-mono font-bold">{empresa.ruc}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-neutral-500">Nombre Comercial:</span>
                <span className="font-semibold">{empresa.nombreComercial}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-neutral-500">Razón Social:</span>
                <span className="font-semibold text-right">{empresa.razonSocial || "—"}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-neutral-500">Dirección Fiscal:</span>
                <span className="text-right text-xs max-w-xs">{empresa.direccionFiscal || "—"}</span>
              </div>
              <div className="flex justify-between pt-2 items-center">
                <span className="text-neutral-500">Estado de Afiliación:</span>
                {getBadgeEstado(empresa.estado)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-500" />
                Resumen de Contacto Oficial
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPestanaActiva("contactos")}
                className="text-xs text-orange-600 gap-1"
              >
                Ver Directorio Completo &rarr;
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 text-sm divide-y dark:divide-neutral-800">
              <div className="flex justify-between pt-2">
                <span className="text-neutral-500">Representante Legal:</span>
                <span className="font-semibold">{empresa.adminNombre || "Administrador Titular"}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-neutral-500">Email Corporativo:</span>
                <span className="font-medium text-orange-600">{empresa.emailContacto}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-neutral-500">Teléfono / WhatsApp:</span>
                <span className="font-medium">{empresa.telefono || "—"}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-neutral-500">Fecha de Creación:</span>
                <span>{new Date(empresa.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-neutral-500">Identificador Interno (UUID):</span>
                <span className="font-mono text-xs">{empresa.publicId}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contenido de Pestaña 4: Flota y Reparto */}
      {pestanaActiva === "flota" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-500" />
              Unidades y Logística de Reparto
            </CardTitle>
            <CardDescription>Capacidad de distribución de balones de gas a domicilio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border bg-neutral-50 dark:bg-neutral-900 text-center">
                <Truck className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                <div className="text-xl font-bold">{metricas?.repartidoresActivos ?? 0}</div>
                <p className="text-xs text-neutral-500">Choferes Asignados</p>
              </div>

              <div className="p-4 rounded-xl border bg-neutral-50 dark:bg-neutral-900 text-center">
                <Scale className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <div className="text-xl font-bold">100%</div>
                <p className="text-xs text-neutral-500">Balanzas Calibradas</p>
              </div>

              <div className="p-4 rounded-xl border bg-neutral-50 dark:bg-neutral-900 text-center">
                <ShieldCheck className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <div className="text-xl font-bold">Autobloqueo</div>
                <p className="text-xs text-neutral-500">Válvula Click-On</p>
              </div>
            </div>

            <div className="p-4 bg-muted/40 rounded-xl text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <strong>Supervisión de Flota:</strong> Todas las unidades de reparto afiliadas a esta distribuidora están obligadas a portar balanzas digitales certificadas para verificación de tara y contenido de gas ante el cliente.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido de Pestaña 5: Inventario de Balones */}
      {pestanaActiva === "inventario" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-500" />
              Control de Inventario y Cilindros de Gas
            </CardTitle>
            <CardDescription>Estado de almacén y balones de cocina en stock</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl border bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between">
                <div>
                  <div className="text-xs text-neutral-500 font-semibold">Balones en Alerta Baja</div>
                  <div className="text-2xl font-bold text-amber-600">
                    {metricas?.balonesStockBajo ?? 0}
                  </div>
                </div>
                <Package className="w-8 h-8 text-amber-500 opacity-80" />
              </div>

              <div className="p-5 rounded-xl border bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between">
                <div>
                  <div className="text-xs text-neutral-500 font-semibold">Garantía de Cilindro Seguro</div>
                  <div className="text-sm font-bold text-emerald-600">NTP 350.011 Vigente</div>
                </div>
                <ShieldCheck className="w-8 h-8 text-emerald-500 opacity-80" />
              </div>
            </div>

            <div className="p-4 bg-muted/40 rounded-xl text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <strong>Trazabilidad de Balones:</strong> Cada cilindro distribuido cuenta con inspección de sellado, pesaje en balanza calibrada y verificación de válvula reguladora para evitar fugas.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido de Pestaña 6: Auditoría y Legal */}
      {pestanaActiva === "auditoria" && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-500" />
              Auditoría y Cumplimiento Normativo
            </CardTitle>
            <CardDescription>Historial de verificaciones y registro legal de la distribuidora</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-neutral-600 dark:text-neutral-400">
            <div className="p-4 rounded-xl border bg-neutral-50 dark:bg-neutral-900 space-y-2">
              <div className="font-bold text-neutral-900 dark:text-white text-sm">
                Registro Osinergmin & SUNAT
              </div>
              <p>
                La empresa <strong>{empresa.nombreComercial}</strong> con RUC <strong>{empresa.ruc}</strong> cumple con los requisitos para la comercialización de balones de gas doméstico e industrial según la norma vigente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border space-y-1">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">Pesaje Obligatorio:</span>
                <p>Las unidades portan balanzas electrónicas para verificar el peso exacto del gas frente al usuario.</p>
              </div>
              <div className="p-4 rounded-xl border space-y-1">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">Sello de Seguridad:</span>
                <p>Cada balón cuenta con termo-sello inviolable con marca y código de lote verificable.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal para Agregar Nuevo Contacto */}
      {modalContactoAbierto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="text-lg font-bold">Registrar Nuevo Contacto</h3>
                <p className="text-xs text-muted-foreground">
                  Añada un responsable o canal de atención para {empresa.nombreComercial}.
                </p>
              </div>
              <button
                onClick={() => setModalContactoAbierto(false)}
                className="text-neutral-400 hover:text-neutral-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAgregarContacto} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Nombre Completo / Área *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ing. Carlos Mendoza o Despacho Callao"
                  value={nuevoContacto.nombre || ""}
                  onChange={(e) => setNuevoContacto({ ...nuevoContacto, nombre: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Cargo / Puesto
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Supervisor de Despacho"
                    value={nuevoContacto.cargo || ""}
                    onChange={(e) => setNuevoContacto({ ...nuevoContacto, cargo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Área / Departamento *
                  </label>
                  <select
                    value={nuevoContacto.area || "Operaciones"}
                    onChange={(e) => setNuevoContacto({ ...nuevoContacto, area: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  >
                    <option value="Operaciones">Operaciones & Flota</option>
                    <option value="Emergencias">Emergencias 24/7 (Fugas)</option>
                    <option value="Comercial">Comercial & Ventas</option>
                    <option value="Administración">Administración & Facturación</option>
                    <option value="Legal">Legal & Titular</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+51 987 654 321"
                    value={nuevoContacto.telefono || ""}
                    onChange={(e) => setNuevoContacto({ ...nuevoContacto, telefono: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={nuevoContacto.email || ""}
                    onChange={(e) => setNuevoContacto({ ...nuevoContacto, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Horario de Atención
                </label>
                <input
                  type="text"
                  placeholder="Ej. Lun - Sáb 07:00 a 21:00 o 24/7"
                  value={nuevoContacto.horario || ""}
                  onChange={(e) => setNuevoContacto({ ...nuevoContacto, horario: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Notas u Observaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Instrucciones adicionales para comunicarse con este contacto..."
                  value={nuevoContacto.notas || ""}
                  onChange={(e) => setNuevoContacto({ ...nuevoContacto, notas: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t dark:border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalContactoAbierto(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Guardar Contacto
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
