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
  Key,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Coins,
  ArrowUpDown,
  Sliders,
  CheckCircle2,
  Percent,
  Receipt,
} from "lucide-react";
import {
  obtenerEsquemaEmpresa,
  guardarEsquemaEmpresa,
  EsquemaComisionEmpresa,
  formatearComisionTexto,
  ESQUEMA_DEFAULT,
  obtenerBilleteraEmpresa,
  recargarBilletera,
  BilleteraEmpresa,
} from "@/librerias/comisiones";

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
    "estadisticas" | "comisiones" | "contactos" | "corporativo" | "flota" | "inventario" | "auditoria"
  >("estadisticas");
  const [isPending, startTransition] = useTransition();

  // Gestión de Comisiones y Billetera
  const [esquemaComision, setEsquemaComision] = useState<EsquemaComisionEmpresa>(ESQUEMA_DEFAULT);
  const [billetera, setBilletera] = useState<BilleteraEmpresa | null>(null);
  const [modalEditarComision, setModalEditarComision] = useState(false);
  const [tipoComisionEdit, setTipoComisionEdit] = useState<"FIJA" | "PORCENTUAL">("FIJA");
  const [tarifaFijaEdit, setTarifaFijaEdit] = useState(1.20);
  const [tasaPorcentualEdit, setTasaPorcentualEdit] = useState(3.0);
  const [estadoPagoEdit, setEstadoPagoEdit] = useState<"AL_DIA" | "PENDIENTE" | "OBSERVADO">("AL_DIA");
  const [montoRecargaAdmin, setMontoRecargaAdmin] = useState<string>("");

  // Gestión de Contactos
  const [contactos, setContactos] = useState<ContactoItem[]>([]);
  const [filtroArea, setFiltroArea] = useState<string>("TODOS");
  const [modalContactoAbierto, setModalContactoAbierto] = useState(false);
  const [nuevoContacto, setNuevoContacto] = useState<Partial<ContactoItem>>({
    area: "Operaciones",
    horario: "Lunes a Viernes 08:00 - 18:00",
  });
  const [textoCopiado, setTextoCopiado] = useState<string | null>(null);

  // Gestión de Contraseña por Super Admin
  const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  const handleGuardarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresa) return;

    if (!nuevaPassword || nuevaPassword.length < 6) {
      alert("La nueva contraseña debe tener un mínimo de 6 caracteres.");
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      alert("Las contraseñas no coinciden. Por favor verifique.");
      return;
    }

    try {
      setGuardandoPassword(true);
      await empresasApi.cambiarPasswordEmpresaAdmin(empresa.publicId, nuevaPassword);
      setMensaje({
        tipo: "exito",
        texto: `Contraseña de acceso actualizada exitosamente para la distribuidora ${empresa.nombreComercial}.`,
      });
      setModalPasswordAbierto(false);
      setNuevaPassword("");
      setConfirmarPassword("");
    } catch (err: any) {
      alert(err.message || "Error al cambiar la contraseña");
    } finally {
      setGuardandoPassword(false);
    }
  };

  const generarPasswordSegura = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
    let pass = "";
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNuevaPassword(pass);
    setConfirmarPassword(pass);
    setMostrarPassword(true);
  };

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

      // Cargar esquema de comisiones y billetera de esta distribuidora
      const esq = obtenerEsquemaEmpresa(publicId);
      setEsquemaComision(esq);
      setTipoComisionEdit(esq.tipo);
      setTarifaFijaEdit(esq.tarifaFija);
      setTasaPorcentualEdit(esq.tasaPorcentual);
      setEstadoPagoEdit(esq.estadoPago);
      setBilletera(obtenerBilleteraEmpresa(publicId));
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

  const comisionAcumulada = esquemaComision.tipo === "FIJA"
    ? (metricas?.totalPedidosMes ?? 0) * esquemaComision.tarifaFija
    : (metricas?.ventasMes ?? 0) * (esquemaComision.tasaPorcentual / 100);

  return (
    <div className="w-full py-4 px-3 sm:px-6 space-y-3.5 text-xs">
      {/* 1. Barra de Navegación y Acciones Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-0.5">
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/admin/empresas"
            className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground hover:text-orange-600 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Distribuidoras</span>
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="font-semibold text-foreground truncate max-w-[220px]">
            {empresa.nombreComercial}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border">
            RUC: {empresa.ruc}
          </span>
        </div>

        {/* Acciones Administrativas Super Admin */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={cargarDatos}
            disabled={cargando}
            className="h-7 px-2.5 text-xs gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${cargando ? "animate-spin" : ""}`} />
            Actualizar
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setTipoComisionEdit(esquemaComision.tipo);
              setTarifaFijaEdit(esquemaComision.tarifaFija);
              setTasaPorcentualEdit(esquemaComision.tasaPorcentual);
              setEstadoPagoEdit(esquemaComision.estadoPago);
              setModalEditarComision(true);
            }}
            className="h-7 px-2.5 text-xs border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 gap-1 shadow-2xs"
          >
            <Coins className="w-3 h-3 text-orange-600" />
            <span>Editar Comisión</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setModalPasswordAbierto(true);
              setNuevaPassword("");
              setConfirmarPassword("");
              setMostrarPassword(false);
            }}
            className="h-7 px-2.5 text-xs border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 gap-1 shadow-2xs"
          >
            <Key className="w-3 h-3 text-amber-600" />
            <span>Cambiar Clave</span>
          </Button>

          {empresa.estado === "PENDIENTE" && (
            <>
              <Button
                size="sm"
                onClick={() => handleCambiarEstado("APROBADA", "Aprobación formal por Super Admin")}
                disabled={isPending}
                className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-semibold"
              >
                <CheckCircle className="w-3 h-3" />
                Aprobar
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleCambiarEstado("RECHAZADA", "Documentación no conforme")}
                disabled={isPending}
                className="h-7 px-2.5 text-xs gap-1"
              >
                <XCircle className="w-3 h-3" />
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
              className="h-7 px-2.5 text-xs gap-1"
            >
              <XCircle className="w-3 h-3" />
              Suspender
            </Button>
          )}

          {empresa.estado === "SUSPENDIDA" && (
            <Button
              size="sm"
              onClick={() => handleCambiarEstado("APROBADA", "Reactivación por Super Admin")}
              disabled={isPending}
              className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 font-semibold"
            >
              <CheckCircle className="w-3 h-3" />
              Reactivar
            </Button>
          )}
        </div>
      </div>

      {/* Alerta de Notificación */}
      {mensaje && (
        <div
          className={`py-2 px-3 rounded-lg flex items-center justify-between text-xs shadow-2xs border ${
            mensaje.tipo === "exito"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <span>{mensaje.texto}</span>
          <button
            onClick={() => setMensaje(null)}
            className="text-xs font-bold hover:underline ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Tarjeta Perfil Hero de la Distribuidora */}
      <div className="bg-card text-card-foreground border rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
              {empresa.nombreComercial.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-foreground truncate">
                  {empresa.nombreComercial}
                </h1>
                {getBadgeEstado(empresa.estado)}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 border border-orange-500/20 shadow-2xs">
                  <Coins className="w-3 h-3" />
                  {formatearComisionTexto(esquemaComision)} {esquemaComision.tipo === "FIJA" ? "/ pedido" : "sobre venta"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-muted text-muted-foreground border">
                  Tenant #{empresa.id || "1"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                <strong className="text-foreground font-semibold">{empresa.razonSocial || "Razón social no registrada"}</strong> &bull; RUC: {empresa.ruc}
              </p>
            </div>
          </div>

          {/* Botones de Comunicación Inmediata */}
          <div className="flex items-center gap-2 shrink-0">
            {empresa.telefono && (
              <>
                <a
                  href={obtenerEnlaceWhatsApp(empresa.telefono, empresa.nombreComercial)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`tel:${empresa.telefono}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border bg-background hover:bg-muted text-foreground transition"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{empresa.telefono}</span>
                </a>
              </>
            )}
            {empresa.emailContacto && (
              <a
                href={`mailto:${empresa.emailContacto}`}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border bg-background hover:bg-muted text-foreground transition"
                title={empresa.emailContacto}
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Correo</span>
              </a>
            )}
          </div>
        </div>

        {/* Metadatos y Datos Rápidos en Fila */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t text-[11px]">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-muted-foreground shrink-0">Dirección:</span>
            <span className="font-medium text-foreground truncate" title={empresa.direccionFiscal || "Sin dirección"}>
              {empresa.direccionFiscal || "Sin dirección registrada"}
            </span>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="text-muted-foreground shrink-0">Titular Admin:</span>
            <span className="font-semibold text-foreground truncate" title={empresa.adminNombre || empresa.adminEmail}>
              {empresa.adminNombre || empresa.adminEmail || "No asignado"}
            </span>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="text-muted-foreground shrink-0">Afiliación:</span>
            <span className="font-medium text-foreground">
              {new Date(empresa.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>

          <div className="flex items-center gap-2 min-w-0 justify-between sm:justify-start">
            <span className="text-muted-foreground shrink-0">Liquidación:</span>
            <span className="font-semibold text-orange-600 bg-orange-500/10 px-1.5 py-0.2 rounded border border-orange-500/20">
              Quincenal (Día 15 / Fin)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Fila de 5 KPIs Principales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
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
            <span className="text-[11px] font-medium text-muted-foreground">Comisión RappiGas</span>
            <p className="text-lg font-bold leading-tight mt-0.5 text-orange-600">
              {formatearComisionTexto(esquemaComision)}
            </p>
            <span className="text-[10px] text-muted-foreground">Acum: S/ {comisionAcumulada.toFixed(2)}</span>
          </div>
          <Coins className="w-4 h-4 text-orange-500/70 shrink-0" />
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground">Flota en Ruta</span>
            <p className="text-lg font-bold leading-tight mt-0.5 text-foreground">
              {metricas?.repartidoresActivos ?? 0}
            </p>
            <span className="text-[10px] text-muted-foreground">Choferes activos</span>
          </div>
          <Truck className="w-4 h-4 text-emerald-500/70 shrink-0" />
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <span className="text-[11px] font-medium text-muted-foreground">Canales Oficiales</span>
            <p className="text-lg font-bold leading-tight mt-0.5 text-foreground">
              {contactos.length}
            </p>
            <span className="text-[10px] text-muted-foreground">Directorio activo</span>
          </div>
          <PhoneCall className="w-4 h-4 text-indigo-500/70 shrink-0" />
        </div>
      </div>

      {/* 4. Selector de Pestañas Moderno */}
      <div className="flex border-b overflow-x-auto gap-1 text-xs pb-1">
        <button
          onClick={() => setPestanaActiva("estadisticas")}
          className={`h-7 px-2.5 flex items-center gap-1.5 rounded-md transition whitespace-nowrap ${
            pestanaActiva === "estadisticas"
              ? "bg-orange-600 text-white shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Estadísticas & Ventas
        </button>

        <button
          onClick={() => setPestanaActiva("comisiones")}
          className={`h-7 px-2.5 flex items-center gap-1.5 rounded-md transition whitespace-nowrap ${
            pestanaActiva === "comisiones"
              ? "bg-orange-600 text-white shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          Plan y Comisión
          <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            pestanaActiva === "comisiones"
              ? "bg-white/20 text-white"
              : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
          }`}>
            {formatearComisionTexto(esquemaComision)}
          </span>
        </button>

        <button
          onClick={() => setPestanaActiva("contactos")}
          className={`h-7 px-2.5 flex items-center gap-1.5 rounded-md transition whitespace-nowrap ${
            pestanaActiva === "contactos"
              ? "bg-orange-600 text-white shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          Directorio de Contactos
          <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            pestanaActiva === "contactos"
              ? "bg-white/20 text-white"
              : "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300"
          }`}>
            {contactos.length}
          </span>
        </button>

        <button
          onClick={() => setPestanaActiva("corporativo")}
          className={`h-7 px-2.5 flex items-center gap-1.5 rounded-md transition whitespace-nowrap ${
            pestanaActiva === "corporativo"
              ? "bg-orange-600 text-white shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          Datos Corporativos & SUNAT
        </button>

        <button
          onClick={() => setPestanaActiva("flota")}
          className={`h-7 px-2.5 flex items-center gap-1.5 rounded-md transition whitespace-nowrap ${
            pestanaActiva === "flota"
              ? "bg-orange-600 text-white shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          Flota y Reparto
        </button>

        <button
          onClick={() => setPestanaActiva("inventario")}
          className={`h-7 px-2.5 flex items-center gap-1.5 rounded-md transition whitespace-nowrap ${
            pestanaActiva === "inventario"
              ? "bg-orange-600 text-white shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Inventario de Balones
        </button>

        <button
          onClick={() => setPestanaActiva("auditoria")}
          className={`h-7 px-2.5 flex items-center gap-1.5 rounded-md transition whitespace-nowrap ${
            pestanaActiva === "auditoria"
              ? "bg-orange-600 text-white shadow-2xs font-semibold"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Seguridad & Normativa
        </button>
      </div>

      {/* Contenido de Pestaña: Plan y Comisión */}
      {pestanaActiva === "comisiones" && (
        <div className="space-y-4">
          {/* Tarjeta Resumen Principal */}
          <Card className="border-orange-500/30 bg-linear-to-br from-card via-card to-orange-500/5 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Modelo Pay-Per-Order (Sin Costo de Membresía Fija)
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        esquemaComision.estadoPago === "AL_DIA"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : esquemaComision.estadoPago === "PENDIENTE"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                      }`}
                    >
                      {esquemaComision.estadoPago === "AL_DIA"
                        ? "Estado: Al Día"
                        : esquemaComision.estadoPago === "PENDIENTE"
                        ? "Estado: Pago Pendiente"
                        : "Estado: Observado"}
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                    <Coins className="w-5 h-5 text-orange-500" />
                    Esquema Comercial y Comisión Pactada
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Distribuidora {empresa.nombreComercial}. RappiGas no cobra suscripciones mensuales; únicamente se liquida la comisión por pedido entregado según la modalidad asignada.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => {
                      setTipoComisionEdit(esquemaComision.tipo);
                      setTarifaFijaEdit(esquemaComision.tarifaFija);
                      setTasaPorcentualEdit(esquemaComision.tasaPorcentual);
                      setEstadoPagoEdit(esquemaComision.estadoPago);
                      setModalEditarComision(true);
                    }}
                    className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5 h-8 text-xs font-semibold"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Modificar Comisión
                  </Button>
                  <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                    <Link href="/admin/suscripciones">
                      <Receipt className="w-3.5 h-3.5" />
                      Ver Ledger Global
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-lg border bg-background/80 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium">Modalidad Asignada</span>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      {esquemaComision.tipo === "FIJA" ? "Comisión Fija Única" : "Comisión Porcentual"}
                    </p>
                  </div>
                  <span className="text-[11px] text-orange-600 font-bold mt-2">
                    {esquemaComision.tipo === "FIJA"
                      ? `S/ ${esquemaComision.tarifaFija.toFixed(2)} por pedido`
                      : `${esquemaComision.tasaPorcentual.toFixed(1)}% sobre valor vendido`}
                  </span>
                </div>

                <div className="p-3 rounded-lg border bg-background/80 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium">Membresía Mensual</span>
                    <p className="text-base font-bold text-emerald-600 mt-0.5">S/ 0.00 / mes</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-2">
                    Sin costo de acceso al software
                  </span>
                </div>

                <div className="p-3 rounded-lg border bg-background/80 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium">Ciclo de Liquidación</span>
                    <p className="text-base font-bold text-foreground mt-0.5">Quincenal</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-2">
                    Corte automático los días 15 y 30/31
                  </span>
                </div>

                <div className="p-3 rounded-lg border bg-background/80 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium">Estado de Cuenta</span>
                    <p className="text-base font-bold text-foreground mt-0.5">
                      {esquemaComision.estadoPago === "AL_DIA" ? "Al Día" : esquemaComision.estadoPago}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-2">
                    {esquemaComision.estadoPago === "AL_DIA"
                      ? "Sin retenciones administrativas"
                      : "Sujeto a verificación financiera"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balance y Simulación Financiera del Mes Actual */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border bg-card text-card-foreground shadow-2xs space-y-1">
              <span className="text-[11px] text-muted-foreground font-medium">Ventas Facturadas (Mes)</span>
              <p className="text-lg font-black text-foreground">
                S/ {(metricas?.ventasMes ?? 0).toFixed(2)}
              </p>
              <span className="text-[10px] text-muted-foreground">Subtotal bruto despachado</span>
            </div>

            <div className="p-3 rounded-xl border bg-card text-card-foreground shadow-2xs space-y-1">
              <span className="text-[11px] text-muted-foreground font-medium">Despachos Entregados</span>
              <p className="text-lg font-black text-foreground">
                {metricas?.totalPedidosMes ?? 0} pedidos
              </p>
              <span className="text-[10px] text-muted-foreground">Base de cálculo operativa</span>
            </div>

            <div className="p-3 rounded-xl border bg-orange-500/10 border-orange-500/30 text-card-foreground shadow-2xs space-y-1">
              <span className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold">
                Comisión RappiGas Acumulada
              </span>
              <p className="text-lg font-black text-orange-600 dark:text-orange-400">
                S/ {(
                  esquemaComision.tipo === "FIJA"
                    ? (metricas?.totalPedidosMes ?? 0) * esquemaComision.tarifaFija
                    : (metricas?.ventasMes ?? 0) * (esquemaComision.tasaPorcentual / 100)
                ).toFixed(2)}
              </p>
              <span className="text-[10px] text-muted-foreground">
                Calculada con {formatearComisionTexto(esquemaComision)}
              </span>
            </div>

            <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/30 text-card-foreground shadow-2xs space-y-1">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Billetera / Saldo Disponible
              </span>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                S/ {(billetera?.saldoActual ?? 38.8).toFixed(2)}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-bold bg-card">
                  {(billetera?.saldoActual ?? 38.8) >= 15
                    ? "🟢 Óptimo"
                    : (billetera?.saldoActual ?? 38.8) > 0
                    ? "🟡 Alerta"
                    : (billetera?.saldoActual ?? 38.8) >= -20
                    ? "🟠 En Gracia"
                    : "🔴 Pausado"}
                </Badge>
                <span className="text-[10px] text-muted-foreground">Límite: S/ -20.00</span>
              </div>
            </div>
          </div>

          {/* Tabla de Auditoría de Movimientos de la Billetera */}
          {billetera && (
            <Card className="border border-border bg-card shadow-2xs overflow-hidden">
              <CardHeader className="py-2.5 px-4 border-b bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-orange-600" />
                    <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Auditoría de Billetera (Recargas y Deducciones por Pedido)
                    </CardTitle>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {billetera.movimientos.length} movimientos
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-muted/40 text-muted-foreground text-[10px] font-bold uppercase tracking-wider border-b">
                      <tr>
                        <th className="px-4 py-2">Fecha</th>
                        <th className="px-4 py-2">Concepto</th>
                        <th className="px-4 py-2 text-right">Monto</th>
                        <th className="px-4 py-2 text-right">Saldo Posterior</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {billetera.movimientos.map((m) => (
                        <tr key={m.id} className="hover:bg-muted/20 transition">
                          <td className="px-4 py-2 text-muted-foreground">{m.fecha}</td>
                          <td className="px-4 py-2 font-medium text-foreground">{m.referencia}</td>
                          <td className={`px-4 py-2 text-right font-mono font-bold ${
                            m.monto > 0 ? "text-emerald-600" : "text-orange-600"
                          }`}>
                            {m.monto > 0 ? `+ S/ ${m.monto.toFixed(2)}` : `- S/ ${Math.abs(m.monto).toFixed(2)}`}
                          </td>
                          <td className="px-4 py-2 text-right font-mono text-foreground font-semibold">
                            S/ {m.saldoPosterior.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparativa de Modalidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Modalidad Fija */}
            <div
              className={`rounded-xl border p-4 transition-all relative ${
                esquemaComision.tipo === "FIJA"
                  ? "border-orange-500 bg-orange-500/5 shadow-xs ring-1 ring-orange-500/30"
                  : "border-border bg-card"
              }`}
            >
              {esquemaComision.tipo === "FIJA" && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white shadow-2xs">
                  <Check className="w-3 h-3" />
                  Modalidad Activa
                </span>
              )}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold">
                  S/
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Comisión Fija Única</h3>
                  <span className="text-[10px] text-muted-foreground">Tarifa plana por pedido o balón</span>
                </div>
              </div>

              <div className="my-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-foreground">
                    S/ {esquemaComision.tarifaFija.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">/ pedido</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Mismo costo por balón sin importar si es de 10kg, 15kg o 45kg industrial.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t text-[11px]">
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Costos operativos fijos y 100% predecibles por despacho</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Si sube el valor del gas GLP, la comisión para RappiGas se mantiene fija</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Recomendado para distribuidores con alto volumen y balones grandes</span>
                </div>
              </div>

              {esquemaComision.tipo !== "FIJA" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTipoComisionEdit("FIJA");
                    setTarifaFijaEdit(1.20);
                    setModalEditarComision(true);
                  }}
                  className="w-full mt-4 h-7 text-xs"
                >
                  Asignar Comisión Fija a esta Distribuidora
                </Button>
              )}
            </div>

            {/* Modalidad Porcentual */}
            <div
              className={`rounded-xl border p-4 transition-all relative ${
                esquemaComision.tipo === "PORCENTUAL"
                  ? "border-orange-500 bg-orange-500/5 shadow-xs ring-1 ring-orange-500/30"
                  : "border-border bg-card"
              }`}
            >
              {esquemaComision.tipo === "PORCENTUAL" && (
                <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white shadow-2xs">
                  <Check className="w-3 h-3" />
                  Modalidad Activa
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
                  <span className="text-2xl font-black text-foreground">
                    {esquemaComision.tasaPorcentual.toFixed(1)}%
                  </span>
                  <span className="text-xs text-muted-foreground">de la venta bruta</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  En un pedido de S/ 45.00 la comisión es de S/ {(45 * (esquemaComision.tasaPorcentual / 100)).toFixed(2)}.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t text-[11px]">
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Proporcional al ticket de venta del distribuidor</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Cero riesgo en períodos de baja demanda o balones económicos</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Recomendado para operaciones locales con balones de 5kg o 10kg</span>
                </div>
              </div>

              {esquemaComision.tipo !== "PORCENTUAL" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTipoComisionEdit("PORCENTUAL");
                    setTasaPorcentualEdit(3.0);
                    setModalEditarComision(true);
                  }}
                  className="w-full mt-4 h-7 text-xs"
                >
                  Asignar Comisión Porcentual a esta Distribuidora
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

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
        <div className="space-y-4">
          <Card className="shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <Users className="w-4 h-4 text-orange-600" />
                  Directorio Oficial de Personal & Responsables
                </CardTitle>
                <CardDescription className="text-xs">
                  Contactos directos para coordinación de operaciones, emergencias 24/7, facturación y representación legal.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Filtro por Área */}
                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg text-xs">
                  {["TODOS", "Operaciones", "Emergencias", "Legal", "Administración"].map((area) => (
                    <button
                      key={area}
                      onClick={() => setFiltroArea(area)}
                      className={`px-2 py-1 rounded-md transition text-xs ${
                        filtroArea === area
                          ? "bg-background text-orange-600 font-bold shadow-2xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>

                <Button
                  size="sm"
                  onClick={() => setModalContactoAbierto(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white gap-1 h-7 text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar Contacto
                </Button>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-600" />
                Datos Registrales y Fiscales (SUNAT)
              </CardTitle>
              <CardDescription className="text-xs">
                Acreditación tributaria formal de la distribuidora
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground font-medium">RUC:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                  <span>{empresa.ruc}</span>
                  <button
                    onClick={() => copiarAlPortapapeles(empresa.ruc, "RUC")}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition"
                    title="Copiar RUC"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Nombre Comercial:</span>
                <span className="font-bold text-foreground text-right">{empresa.nombreComercial}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Razón Social:</span>
                <span className="font-semibold text-foreground text-right max-w-[260px] truncate" title={empresa.razonSocial || "—"}>
                  {empresa.razonSocial || "—"}
                </span>
              </div>

              <div className="flex items-start justify-between py-1 border-b border-border/60 gap-2">
                <span className="text-muted-foreground font-medium shrink-0">Dirección Fiscal:</span>
                <div className="flex items-center gap-1.5 text-right max-w-xs">
                  <span className="text-foreground text-right">{empresa.direccionFiscal || "—"}</span>
                  {empresa.direccionFiscal && (
                    <button
                      onClick={() => copiarAlPortapapeles(empresa.direccionFiscal || "", "Dirección Fiscal")}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition shrink-0"
                      title="Copiar dirección"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground font-medium">Estado de Afiliación:</span>
                {getBadgeEstado(empresa.estado)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  Resumen de Contacto Oficial
                </CardTitle>
                <CardDescription className="text-xs">
                  Titular acreditado y canales directos
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPestanaActiva("contactos")}
                className="h-7 text-xs text-orange-600 gap-1"
              >
                Directorio &rarr;
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 pt-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Representante Legal / Titular:</span>
                <span className="font-bold text-foreground">{empresa.adminNombre || "Administrador Titular"}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Email Corporativo:</span>
                <div className="flex items-center gap-1.5 font-medium text-orange-600">
                  <a href={`mailto:${empresa.emailContacto}`} className="hover:underline">
                    {empresa.emailContacto}
                  </a>
                  <button
                    onClick={() => copiarAlPortapapeles(empresa.emailContacto, "Email")}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition"
                    title="Copiar email"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Teléfono / WhatsApp:</span>
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <span>{empresa.telefono || "—"}</span>
                  {empresa.telefono && (
                    <button
                      onClick={() => copiarAlPortapapeles(empresa.telefono || "", "Teléfono")}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition"
                      title="Copiar teléfono"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/60">
                <span className="text-muted-foreground font-medium">Fecha de Afiliación:</span>
                <span className="text-foreground">{new Date(empresa.createdAt).toLocaleString("es-PE")}</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground font-medium">ID Interno (UUID):</span>
                <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                  <span className="truncate max-w-[200px]" title={empresa.publicId}>{empresa.publicId}</span>
                  <button
                    onClick={() => copiarAlPortapapeles(empresa.publicId, "UUID")}
                    className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition"
                    title="Copiar UUID"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contenido de Pestaña 4: Flota y Reparto */}
      {pestanaActiva === "flota" && (
        <Card className="shadow-xs">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Truck className="w-4 h-4 text-orange-600" />
              Unidades y Logística de Reparto
            </CardTitle>
            <CardDescription className="text-xs">
              Capacidad de distribución georreferenciada de balones de gas a domicilio
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border bg-muted/30 text-center space-y-1">
                <Truck className="w-5 h-5 text-orange-600 mx-auto" />
                <div className="text-xl font-bold text-foreground">{metricas?.repartidoresActivos ?? 0}</div>
                <p className="text-[11px] text-muted-foreground font-medium">Choferes Asignados</p>
              </div>

              <div className="p-3.5 rounded-xl border bg-muted/30 text-center space-y-1">
                <Scale className="w-5 h-5 text-amber-600 mx-auto" />
                <div className="text-xl font-bold text-foreground">100%</div>
                <p className="text-[11px] text-muted-foreground font-medium">Balanzas Calibradas</p>
              </div>

              <div className="p-3.5 rounded-xl border bg-muted/30 text-center space-y-1">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto" />
                <div className="text-xl font-bold text-foreground">Autobloqueo</div>
                <p className="text-[11px] text-muted-foreground font-medium">Válvula Click-On</p>
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground leading-relaxed border">
              <strong className="text-foreground">Supervisión de Flota:</strong> Todas las unidades de reparto afiliadas a esta distribuidora están obligadas a portar balanzas digitales certificadas para verificación de tara y contenido de gas frente al cliente.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido de Pestaña 5: Inventario de Balones */}
      {pestanaActiva === "inventario" && (
        <Card className="shadow-xs">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Package className="w-4 h-4 text-orange-600" />
              Control de Inventario y Cilindros de Gas
            </CardTitle>
            <CardDescription className="text-xs">
              Estado de almacén y balones de cocina en stock operativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border bg-muted/30 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-muted-foreground font-semibold">Balones en Alerta Baja</div>
                  <div className="text-xl font-bold text-amber-600 mt-0.5">
                    {metricas?.balonesStockBajo ?? 0}
                  </div>
                </div>
                <Package className="w-7 h-7 text-amber-500 opacity-80" />
              </div>

              <div className="p-4 rounded-xl border bg-muted/30 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-muted-foreground font-semibold">Garantía de Cilindro Seguro</div>
                  <div className="text-sm font-bold text-emerald-600 mt-0.5">NTP 350.011 Vigente</div>
                </div>
                <ShieldCheck className="w-7 h-7 text-emerald-500 opacity-80" />
              </div>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground leading-relaxed border">
              <strong className="text-foreground">Trazabilidad de Balones:</strong> Cada cilindro distribuido cuenta con inspección de sellado, pesaje en balanza calibrada y verificación de válvula reguladora para evitar fugas.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido de Pestaña 6: Auditoría y Legal */}
      {pestanaActiva === "auditoria" && (
        <Card className="shadow-xs">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              Auditoría y Cumplimiento Normativo
            </CardTitle>
            <CardDescription className="text-xs">Historial de verificaciones y registro legal de la distribuidora</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 text-xs text-muted-foreground">
            <div className="p-3.5 rounded-xl border bg-muted/30 space-y-1.5">
              <div className="font-bold text-foreground text-sm">
                Registro Osinergmin & SUNAT
              </div>
              <p>
                La empresa <strong className="text-foreground">{empresa.nombreComercial}</strong> con RUC <strong className="text-foreground font-mono">{empresa.ruc}</strong> cumple con los requisitos para la comercialización de balones de gas doméstico e industrial según la norma vigente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border space-y-1 bg-card">
                <span className="font-semibold text-foreground">Pesaje Obligatorio:</span>
                <p>Las unidades portan balanzas electrónicas para verificar el peso exacto del gas frente al usuario.</p>
              </div>
              <div className="p-3.5 rounded-xl border space-y-1 bg-card">
                <span className="font-semibold text-foreground">Sello de Seguridad:</span>
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

      {/* Modal Cambiar Contraseña Super Admin */}
      {modalPasswordAbierto && empresa && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b pb-4 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Cambiar Contraseña de Acceso
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {empresa.nombreComercial}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalPasswordAbierto(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-900 p-3.5 rounded-2xl text-xs space-y-1.5 border border-neutral-200/80 dark:border-neutral-800">
              <div className="flex justify-between">
                <span className="text-neutral-500">RUC:</span>
                <span className="font-mono font-semibold">{empresa.ruc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Usuario Administrador:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate max-w-[220px]">
                  {empresa.adminEmail || empresa.emailContacto}
                </span>
              </div>
              {empresa.adminNombre && (
                <div className="flex justify-between">
                  <span className="text-neutral-500">Titular:</span>
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    {empresa.adminNombre}
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleGuardarPassword} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Nueva Contraseña *
                  </label>
                  <button
                    type="button"
                    onClick={generarPasswordSegura}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generar segura
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={mostrarPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={nuevaPassword}
                    onChange={(e) => setNuevaPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600"
                  >
                    {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  type={mostrarPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Repita la contraseña"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t dark:border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalPasswordAbierto(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={guardandoPassword}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{guardandoPassword ? "Guardando..." : "Actualizar Contraseña"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Comisión Super Admin */}
      {modalEditarComision && empresa && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b pb-3 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                  <Coins className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    Configurar Esquema de Comisión
                  </h3>
                  <p className="text-xs text-neutral-500 truncate max-w-[220px]">
                    {empresa.nombreComercial}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalEditarComision(false)}
                className="text-neutral-400 hover:text-neutral-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Selector de Tipo de Comisión */}
              <div className="space-y-2">
                <label className="font-semibold text-foreground block">
                  Tipo de Cobro de Comisión:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setTipoComisionEdit("FIJA")}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between gap-1.5 ${
                      tipoComisionEdit === "FIJA"
                        ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/30"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">Comisión Fija</span>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          tipoComisionEdit === "FIJA" ? "border-orange-500 bg-orange-500" : "border-muted-foreground"
                        }`}
                      >
                        {tipoComisionEdit === "FIJA" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Monto fijo por pedido</span>
                  </div>

                  <div
                    onClick={() => setTipoComisionEdit("PORCENTUAL")}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between gap-1.5 ${
                      tipoComisionEdit === "PORCENTUAL"
                        ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/30"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">Porcentual</span>
                      <div
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          tipoComisionEdit === "PORCENTUAL" ? "border-orange-500 bg-orange-500" : "border-muted-foreground"
                        }`}
                      >
                        {tipoComisionEdit === "PORCENTUAL" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">% sobre ventas brutas</span>
                  </div>
                </div>
              </div>

              {/* Input de Valor según tipo */}
              {tipoComisionEdit === "FIJA" ? (
                <div className="space-y-1">
                  <label className="font-semibold text-foreground block">
                    Tarifa Fija por Pedido Entregado (Soles S/):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-bold text-muted-foreground">S/</span>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      value={tarifaFijaEdit}
                      onChange={(e) => setTarifaFijaEdit(parseFloat(e.target.value) || 0)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border bg-background font-mono font-bold focus:ring-2 focus:ring-orange-500 outline-hidden"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Tarifa estándar recomendada: S/ 1.20 por cada balón despachado
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-semibold text-foreground block">
                    Tasa Porcentual sobre la Venta (%):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="30"
                      value={tasaPorcentualEdit}
                      onChange={(e) => setTasaPorcentualEdit(parseFloat(e.target.value) || 0)}
                      className="w-full pl-3 pr-8 py-2 text-xs rounded-xl border bg-background font-mono font-bold focus:ring-2 focus:ring-orange-500 outline-hidden"
                    />
                    <span className="absolute right-3 top-2 font-bold text-muted-foreground">%</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Tasa estándar recomendada: 3.0% sobre el subtotal del pedido
                  </span>
                </div>
              )}

              {/* Estado de Pago */}
              <div className="space-y-1">
                <label className="font-semibold text-foreground block">
                  Estado de Facturación de Comisiones:
                </label>
                <select
                  value={estadoPagoEdit}
                  onChange={(e) => setEstadoPagoEdit(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border bg-background font-medium focus:ring-2 focus:ring-orange-500 outline-hidden"
                >
                  <option value="AL_DIA">Al Día (Sin observaciones)</option>
                  <option value="PENDIENTE">Pendiente (Liquidación en curso)</option>
                  <option value="OBSERVADO">Observado (Retención por aclarar)</option>
                </select>
              </div>

              {/* Saldo de Billetera y Abono Manual */}
              <div className="p-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">Saldo Actual en Billetera:</span>
                  <span className="font-mono font-black text-sm text-orange-600">
                    S/ {(billetera?.saldoActual ?? 38.8).toFixed(2)}
                  </span>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                    Abonar Saldo Manualmente (S/):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="5"
                      min="0"
                      value={montoRecargaAdmin}
                      onChange={(e) => setMontoRecargaAdmin(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border bg-background font-mono font-bold focus:ring-2 focus:ring-orange-500 outline-hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMontoRecargaAdmin("50.00")}
                      className="h-7 text-xs font-bold shrink-0"
                    >
                      +50
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMontoRecargaAdmin("100.00")}
                      className="h-7 text-xs font-bold shrink-0"
                    >
                      +100
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-muted/50 border text-[11px] text-muted-foreground flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Al guardar, este esquema y saldo se sincronizarán automáticamente con el panel del distribuidor y con las liquidaciones en Finanzas.
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t dark:border-neutral-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalEditarComision(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const nuevoEsquema: EsquemaComisionEmpresa = {
                    tipo: tipoComisionEdit,
                    tarifaFija: tarifaFijaEdit,
                    tasaPorcentual: tasaPorcentualEdit,
                    estadoPago: estadoPagoEdit,
                  };
                  setEsquemaComision(nuevoEsquema);
                  guardarEsquemaEmpresa(publicId, nuevoEsquema);

                  if (montoRecargaAdmin && parseFloat(montoRecargaAdmin) > 0) {
                    const bAct = recargarBilletera(
                      publicId,
                      parseFloat(montoRecargaAdmin),
                      "Abono / Recarga por Super Admin",
                      "AJUSTE_ADMIN"
                    );
                    setBilletera(bAct);
                    setMontoRecargaAdmin("");
                  }

                  setModalEditarComision(false);
                  setMensaje({
                    tipo: "exito",
                    texto: `Esquema de comisiones y saldo actualizados exitosamente para ${empresa.nombreComercial}.`,
                  });
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
              >
                Guardar Comisión y Saldo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
