"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import {
  empresasApi,
  EmpresaDetalle,
} from "@/librerias/api/empresas.api";
import {
  usuariosApi,
  UsuarioDetalle,
} from "@/librerias/api/usuarios.api";
import {
  Building2,
  Calendar,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Download,
  Filter,
  Flame,
  LayoutGrid,
  List as ListIcon,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  PhoneCall,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

export type TipoContacto = "EMPRESA" | "CLIENTE" | "REPARTIDOR" | "EMERGENCIA" | "ADMIN";

export interface ContactoCRM {
  id: string;
  nombre: string;
  cargo: string;
  tipo: TipoContacto;
  entidad: string; // Nombre de empresa o "Cliente Particular"
  empresaPublicId?: string;
  telefono: string;
  email: string;
  direccion?: string;
  horario?: string;
  estado: string;
  esEmergencia?: boolean;
  notas?: string;
  origen: "API_EMPRESA" | "API_USUARIO" | "MANUAL";
}

export default function AdminContactosPage() {
  const [empresas, setEmpresas] = useState<EmpresaDetalle[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioDetalle[]>([]);
  const [contactosManuales, setContactosManuales] = useState<ContactoCRM[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorPermisos, setErrorPermisos] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);

  // Filtros & Búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>("TODAS");
  const [vista, setVista] = useState<"grid" | "tabla">("grid");

  // Feedback y Modales
  const [textoCopiado, setTextoCopiado] = useState<string | null>(null);
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [contactoSeleccionado, setContactoSeleccionado] = useState<ContactoCRM | null>(null);

  // Formulario nuevo contacto
  const [formNuevo, setFormNuevo] = useState<Partial<ContactoCRM>>({
    tipo: "EMPRESA",
    horario: "Lunes a Viernes 08:00 - 18:00",
    estado: "ACTIVO",
  });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setErrorPermisos(null);

      const [resEmpresas, resUsuarios] = await Promise.allSettled([
        empresasApi.listarEmpresasAdmin(),
        usuariosApi.listarUsuariosAdmin(),
      ]);

      if (resEmpresas.status === "fulfilled") {
        setEmpresas(resEmpresas.value);
      } else {
        const err: any = resEmpresas.reason;
        if (err?.status === 403 || err?.message?.includes("permisos")) {
          setErrorPermisos("Acceso restringido: Esta vista requiere permisos de Administrador de Plataforma (ADMIN).");
          return;
        }
      }

      if (resUsuarios.status === "fulfilled") {
        setUsuarios(resUsuarios.value);
      }

      // Cargar manuales de localStorage
      try {
        const manualesGuardados = localStorage.getItem("contactos_crm_manuales");
        if (manualesGuardados) {
          setContactosManuales(JSON.parse(manualesGuardados));
        }
      } catch (e) {
        console.warn("No se pudieron cargar contactos manuales", e);
      }
    } catch (err: any) {
      setMensaje({
        tipo: "error",
        texto: err.message || "Error al cargar el directorio de contactos",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Consolidar todos los contactos de empresas, clientes y manuales
  const listaContactos = useMemo<ContactoCRM[]>(() => {
    const res: ContactoCRM[] = [];

    // 1. Contactos de Empresas Distribuidoras
    empresas.forEach((emp) => {
      // Titular / Administrador de la empresa
      if (emp.adminNombre || emp.emailContacto) {
        res.push({
          id: `emp-adm-${emp.publicId}`,
          nombre: emp.adminNombre || "Administrador Titular",
          cargo: "Representante Legal & Titular de Distribuidora",
          tipo: "EMPRESA",
          entidad: emp.nombreComercial,
          empresaPublicId: emp.publicId,
          telefono: emp.adminTelefono || emp.telefono || "",
          email: emp.adminEmail || emp.emailContacto,
          direccion: emp.direccionFiscal,
          horario: "Lunes a Viernes 08:00 - 18:00",
          estado: emp.estado,
          origen: "API_EMPRESA",
          notas: `RUC: ${emp.ruc}. Razón Social: ${emp.razonSocial || emp.nombreComercial}.`,
        });
      }

      // Central de Despacho y Pedidos de la empresa
      if (emp.telefono) {
        res.push({
          id: `emp-pedidos-${emp.publicId}`,
          nombre: `Central de Pedidos - ${emp.nombreComercial}`,
          cargo: "Mesa de Operaciones & Despacho a Domicilio",
          tipo: "EMPRESA",
          entidad: emp.nombreComercial,
          empresaPublicId: emp.publicId,
          telefono: emp.telefono,
          email: emp.emailContacto,
          direccion: emp.direccionFiscal,
          horario: "Lunes a Domingo 06:00 - 22:00",
          estado: emp.estado,
          origen: "API_EMPRESA",
          notas: "Recepción de pedidos de balones de cocina y logística de rutas.",
        });

        // Línea 24/7 de Emergencias de la empresa
        res.push({
          id: `emp-emergencias-${emp.publicId}`,
          nombre: `Emergencias de Gas (24/7) - ${emp.nombreComercial}`,
          cargo: "Brigada de Fugas de Gas y Seguridad Técnica",
          tipo: "EMERGENCIA",
          entidad: emp.nombreComercial,
          empresaPublicId: emp.publicId,
          telefono: emp.telefono,
          email: emp.emailContacto,
          direccion: emp.direccionFiscal,
          horario: "Atención Continua 24 Horas",
          estado: emp.estado,
          esEmergencia: true,
          origen: "API_EMPRESA",
          notas: "Protocolo urgente ante olor a gas, sustitución de válvula Click-On o cilindro defectuoso.",
        });
      }
    });

    // 2. Contactos de Usuarios (Clientes y Repartidores)
    usuarios.forEach((usr) => {
      if (usr.rol === "CLIENTE") {
        res.push({
          id: `usr-${usr.publicId}`,
          nombre: `${usr.nombres} ${usr.apellidos}`.trim(),
          cargo: "Cliente Residencial / Comercial",
          tipo: "CLIENTE",
          entidad: "Cliente Final PideGas",
          telefono: usr.telefono || "",
          email: usr.email,
          horario: "Contacto Diurno",
          estado: usr.estado,
          origen: "API_USUARIO",
          notas: `Registrado en plataforma desde ${new Date(usr.createdAt).toLocaleDateString()}.`,
        });
      } else if (usr.rol === "REPARTIDOR") {
        res.push({
          id: `usr-${usr.publicId}`,
          nombre: `${usr.nombres} ${usr.apellidos}`.trim(),
          cargo: "Chofer de Reparto / Enrutamiento",
          tipo: "REPARTIDOR",
          entidad: "Flota de Reparto",
          telefono: usr.telefono || "",
          email: usr.email,
          horario: "En Ruta según turno",
          estado: usr.estado,
          origen: "API_USUARIO",
          notas: "Conductor con balanza electrónica calibrada y geolocalización GPS.",
        });
      } else if (usr.rol === "ADMIN") {
        res.push({
          id: `usr-${usr.publicId}`,
          nombre: `${usr.nombres} ${usr.apellidos}`.trim(),
          cargo: "Super Administrador de Plataforma",
          tipo: "ADMIN",
          entidad: "PideGas Global",
          telefono: usr.telefono || "",
          email: usr.email,
          horario: "24/7 Soporte Nivel 3",
          estado: usr.estado,
          origen: "API_USUARIO",
          notas: "Equipo de administración central y mediación técnica.",
        });
      }
    });

    // 3. Contactos Manuales adicionales
    res.push(...contactosManuales);

    return res;
  }, [empresas, usuarios, contactosManuales]);

  // Filtrado reactivo
  const contactosFiltrados = useMemo(() => {
    return listaContactos.filter((c) => {
      // Filtro tipo
      if (filtroTipo !== "TODOS" && c.tipo !== filtroTipo) {
        return false;
      }
      // Filtro empresa
      if (filtroEmpresa !== "TODAS" && c.entidad !== filtroEmpresa) {
        return false;
      }
      // Búsqueda libre
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const coincide =
          c.nombre.toLowerCase().includes(q) ||
          c.cargo.toLowerCase().includes(q) ||
          c.entidad.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.telefono.toLowerCase().includes(q) ||
          (c.direccion && c.direccion.toLowerCase().includes(q));
        if (!coincide) return false;
      }
      return true;
    });
  }, [listaContactos, filtroTipo, filtroEmpresa, busqueda]);

  // Métricas
  const totalContactos = listaContactos.length;
  const totalEmpresas = listaContactos.filter((c) => c.tipo === "EMPRESA").length;
  const totalClientes = listaContactos.filter((c) => c.tipo === "CLIENTE").length;
  const totalEmergencias = listaContactos.filter((c) => c.tipo === "EMERGENCIA").length;

  const copiarAlPortapapeles = (texto: string, etiqueta: string) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    setTextoCopiado(`${etiqueta} copiado`);
    setTimeout(() => setTextoCopiado(null), 2500);
  };

  const obtenerEnlaceWhatsApp = (telefono: string, nombre: string) => {
    const limpio = (telefono || "").replace(/\D/g, "");
    const numFinal = limpio.length === 9 ? `51${limpio}` : limpio;
    const msg = encodeURIComponent(`Hola ${nombre}, le saludamos desde la administración de PideGas.`);
    return `https://wa.me/${numFinal}?text=${msg}`;
  };

  const handleCrearContactoManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNuevo.nombre?.trim() || !formNuevo.telefono?.trim()) {
      alert("Por favor ingrese al menos el nombre y teléfono del contacto.");
      return;
    }

    const nuevo: ContactoCRM = {
      id: `manual-${Date.now()}`,
      nombre: formNuevo.nombre.trim(),
      cargo: formNuevo.cargo?.trim() || "Contacto Registrado",
      tipo: (formNuevo.tipo as TipoContacto) || "EMPRESA",
      entidad: formNuevo.entidad?.trim() || "Contacto Externo",
      telefono: formNuevo.telefono.trim(),
      email: formNuevo.email?.trim() || "",
      direccion: formNuevo.direccion?.trim() || "",
      horario: formNuevo.horario?.trim() || "Horario Comercial",
      estado: "ACTIVO",
      notas: formNuevo.notas?.trim() || "",
      origen: "MANUAL",
      esEmergencia: formNuevo.tipo === "EMERGENCIA",
    };

    const actualizados = [...contactosManuales, nuevo];
    setContactosManuales(actualizados);
    try {
      localStorage.setItem("contactos_crm_manuales", JSON.stringify(actualizados));
    } catch (e) {
      console.warn("Error guardando en localStorage", e);
    }

    setFormNuevo({
      tipo: "EMPRESA",
      horario: "Lunes a Viernes 08:00 - 18:00",
      estado: "ACTIVO",
    });
    setModalNuevoAbierto(false);
    setMensaje({
      tipo: "exito",
      texto: "Contacto registrado exitosamente en el CRM.",
    });
  };

  const handleEliminarManual = (id: string) => {
    if (!confirm("¿Está seguro de eliminar este contacto manual?")) return;
    const filtrados = contactosManuales.filter((c) => c.id !== id);
    setContactosManuales(filtrados);
    try {
      localStorage.setItem("contactos_crm_manuales", JSON.stringify(filtrados));
    } catch (e) {
      console.warn("Error guardando en localStorage", e);
    }
  };

  const exportarCSV = () => {
    const headers = ["Nombre", "Cargo", "Tipo", "Empresa/Entidad", "Telefono", "Email", "Direccion", "Estado"];
    const rows = contactosFiltrados.map((c) => [
      `"${c.nombre.replace(/"/g, '""')}"`,
      `"${c.cargo.replace(/"/g, '""')}"`,
      `"${c.tipo}"`,
      `"${c.entidad.replace(/"/g, '""')}"`,
      `"${c.telefono}"`,
      `"${c.email}"`,
      `"${(c.direccion || "").replace(/"/g, '""')}"`,
      `"${c.estado}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `directorio_contactos_pidegas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBadgeTipo = (tipo: TipoContacto) => {
    switch (tipo) {
      case "EMPRESA":
        return <Badge className="bg-orange-500/10 text-orange-600 border border-orange-500/20 font-semibold">Distribuidora Gas</Badge>;
      case "CLIENTE":
        return <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 font-semibold">Cliente Hogar/Negocio</Badge>;
      case "REPARTIDOR":
        return <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 font-semibold">Chofer de Flota</Badge>;
      case "EMERGENCIA":
        return <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 font-semibold gap-1"><AlertTriangle className="w-3 h-3" /> Fugas & Urgencias 24/7</Badge>;
      case "ADMIN":
        return <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/20 font-semibold">Super Admin</Badge>;
    }
  };

  return (
    <div className="w-full py-6 px-6 space-y-6">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="ADMIN"
          mensaje={errorPermisos}
          onExito={cargarDatos}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-5 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-orange-500/10 text-orange-600 border border-orange-500/20">
              Módulo CRM & Directorio Global
            </span>
            <span className="text-xs text-neutral-500">Super Admin</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
            Centro de Contactos y Directorio Unificado
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Canales de comunicación directa con distribuidoras de gas, operarios, brigada de emergencias y clientes finales.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {textoCopiado && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 animate-in fade-in">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              {textoCopiado}
            </span>
          )}

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

          <Button
            variant="outline"
            size="sm"
            onClick={exportarCSV}
            className="gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-neutral-500" />
            Exportar CSV
          </Button>

          <Button
            size="sm"
            onClick={() => setModalNuevoAbierto(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Nuevo Contacto
          </Button>
        </div>
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
          <button onClick={() => setMensaje(null)} className="text-xs font-bold hover:underline ml-4">
            ✕ Cerrar
          </button>
        </div>
      )}

      {/* Tarjetas KPI de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Contactos
            </CardTitle>
            <Users className="w-4 h-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-neutral-900 dark:text-white">
              {totalContactos}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Directorio unificado de la plataforma
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Distribuidoras de Gas
            </CardTitle>
            <Building2 className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-neutral-900 dark:text-white">
              {totalEmpresas}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Titulares y mesas de despacho
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Clientes Registrados
            </CardTitle>
            <UserCheck className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-neutral-900 dark:text-white">
              {totalClientes}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Compradores residenciales y negocios
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500 shadow-sm bg-rose-50/10 dark:bg-rose-950/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-rose-600 uppercase tracking-wider">
              Líneas Emergencias 24/7
            </CardTitle>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-rose-700 dark:text-rose-400">
              {totalEmergencias}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Reporte de fugas y soporte técnico
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-card text-card-foreground border rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, empresa, teléfono, correo o dirección..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-orange-500 outline-hidden"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Selector de Tipo */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs overflow-x-auto">
            {[
              { id: "TODOS", label: "Todos" },
              { id: "EMPRESA", label: "Distribuidoras" },
              { id: "CLIENTE", label: "Clientes" },
              { id: "REPARTIDOR", label: "Repartidores" },
              { id: "EMERGENCIA", label: "Emergencias" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFiltroTipo(t.id)}
                className={`px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                  filtroTipo === t.id
                    ? "bg-white dark:bg-neutral-700 shadow-xs text-orange-600 font-bold"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Selector de Empresa */}
          {empresas.length > 0 && (
            <select
              value={filtroEmpresa}
              onChange={(e) => setFiltroEmpresa(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-orange-500 outline-hidden"
            >
              <option value="TODAS">Todas las Distribuidoras</option>
              {empresas.map((emp) => (
                <option key={emp.publicId} value={emp.nombreComercial}>
                  {emp.nombreComercial}
                </option>
              ))}
            </select>
          )}

          {/* Toggle de Vista */}
          <div className="flex items-center gap-1 border p-1 rounded-xl">
            <button
              onClick={() => setVista("grid")}
              className={`p-1.5 rounded-lg transition ${
                vista === "grid" ? "bg-neutral-200 dark:bg-neutral-800 text-foreground" : "text-neutral-400 hover:text-neutral-600"
              }`}
              title="Vista en cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVista("tabla")}
              className={`p-1.5 rounded-lg transition ${
                vista === "tabla" ? "bg-neutral-200 dark:bg-neutral-800 text-foreground" : "text-neutral-400 hover:text-neutral-600"
              }`}
              title="Vista en tabla CRM"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Resumen de resultados filtrados */}
        <div className="flex justify-between items-center text-xs text-muted-foreground pt-1 border-t dark:border-neutral-800">
          <span>
            Mostrando <strong>{contactosFiltrados.length}</strong> de <strong>{totalContactos}</strong> contactos.
          </span>
          {(busqueda || filtroTipo !== "TODOS" || filtroEmpresa !== "TODAS") && (
            <button
              onClick={() => {
                setBusqueda("");
                setFiltroTipo("TODOS");
                setFiltroEmpresa("TODAS");
              }}
              className="text-orange-600 hover:underline font-semibold"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Renderizado de Resultados: VISTA GRID */}
      {vista === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contactosFiltrados.map((c) => (
            <div
              key={c.id}
              className={`p-5 rounded-2xl border transition hover:shadow-md space-y-3.5 flex flex-col justify-between ${
                c.esEmergencia
                  ? "border-rose-300 bg-rose-50/20 dark:bg-rose-950/10"
                  : c.tipo === "EMPRESA"
                  ? "border-orange-200 bg-card"
                  : c.tipo === "CLIENTE"
                  ? "border-blue-200 bg-card"
                  : "bg-card"
              }`}
            >
              {/* Encabezado de la Tarjeta */}
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-xs shrink-0 ${
                        c.esEmergencia
                          ? "bg-rose-100 text-rose-700"
                          : c.tipo === "EMPRESA"
                          ? "bg-orange-100 text-orange-700"
                          : c.tipo === "CLIENTE"
                          ? "bg-blue-100 text-blue-700"
                          : c.tipo === "REPARTIDOR"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {c.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">
                        {c.nombre}
                      </h3>
                      <p className="text-xs text-neutral-500 font-medium">
                        {c.cargo}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {getBadgeTipo(c.tipo)}
                    {c.origen === "MANUAL" && (
                      <button
                        onClick={() => handleEliminarManual(c.id)}
                        className="text-neutral-400 hover:text-rose-600 p-0.5"
                        title="Eliminar contacto manual"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Entidad / Empresa */}
                <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-300 font-medium bg-neutral-50 dark:bg-neutral-900/60 p-2 rounded-xl border">
                  <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{c.entidad}</span>
                  {c.empresaPublicId && (
                    <Link
                      href={`/admin/empresas/${c.empresaPublicId}`}
                      className="ml-auto text-orange-600 hover:underline flex items-center gap-0.5 text-[11px] shrink-0 font-semibold"
                    >
                      Ver Ficha <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>

                {/* Datos de Contacto */}
                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      Teléfono:
                    </span>
                    <div className="flex items-center gap-1 font-semibold">
                      <span>{c.telefono || "—"}</span>
                      {c.telefono && (
                        <button
                          onClick={() => copiarAlPortapapeles(c.telefono, "Teléfono")}
                          className="p-1 text-neutral-400 hover:text-neutral-600"
                          title="Copiar"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {c.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-neutral-400" />
                        Correo:
                      </span>
                      <div className="flex items-center gap-1">
                        <a
                          href={`mailto:${c.email}`}
                          className="font-medium text-orange-600 hover:underline max-w-[170px] truncate"
                          title={c.email}
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

                  {c.direccion && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                        Sede:
                      </span>
                      <span className="text-[11px] text-right truncate text-neutral-600 dark:text-neutral-400" title={c.direccion}>
                        {c.direccion}
                      </span>
                    </div>
                  )}

                  {c.horario && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        Horario:
                      </span>
                      <span className="text-neutral-700 dark:text-neutral-300 font-medium text-[11px]">
                        {c.horario}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción Directa */}
              <div className="flex gap-2 pt-3 border-t dark:border-neutral-800">
                {c.telefono ? (
                  <>
                    <a
                      href={`tel:${c.telefono}`}
                      className="flex-1 text-center py-2 px-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-xs font-semibold transition"
                    >
                      Llamar
                    </a>
                    <a
                      href={obtenerEnlaceWhatsApp(c.telefono, c.nombre)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      WhatsApp
                    </a>
                  </>
                ) : (
                  <span className="text-xs text-neutral-400 italic py-1">Sin teléfono</span>
                )}

                {c.email && (
                  <a
                    href={`mailto:${c.email}`}
                    className="p-2 rounded-xl border hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 transition"
                    title="Enviar correo"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Renderizado de Resultados: VISTA TABLA CRM */}
      {vista === "tabla" && (
        <div className="bg-card text-card-foreground border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 uppercase tracking-wider font-semibold border-b">
                <tr>
                  <th className="px-5 py-3.5">Contacto & Cargo</th>
                  <th className="px-5 py-3.5">Tipo</th>
                  <th className="px-5 py-3.5">Empresa / Entidad</th>
                  <th className="px-5 py-3.5">Teléfono</th>
                  <th className="px-5 py-3.5">Correo Electrónico</th>
                  <th className="px-5 py-3.5">Horario / Sede</th>
                  <th className="px-5 py-3.5 text-right">Acciones Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-neutral-800">
                {contactosFiltrados.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-neutral-900 dark:text-white">
                        {c.nombre}
                      </div>
                      <div className="text-neutral-500 text-[11px]">{c.cargo}</div>
                    </td>

                    <td className="px-5 py-3.5">
                      {getBadgeTipo(c.tipo)}
                    </td>

                    <td className="px-5 py-3.5 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span>{c.entidad}</span>
                        {c.empresaPublicId && (
                          <Link
                            href={`/admin/empresas/${c.empresaPublicId}`}
                            className="text-orange-600 hover:underline"
                            title="Ver ficha de empresa"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      {c.telefono ? (
                        <div className="flex items-center gap-1.5">
                          <a href={`tel:${c.telefono}`} className="font-semibold text-neutral-800 dark:text-neutral-200 hover:text-orange-600">
                            {c.telefono}
                          </a>
                          <button
                            onClick={() => copiarAlPortapapeles(c.telefono, "Teléfono")}
                            className="p-1 text-neutral-400 hover:text-neutral-600"
                            title="Copiar"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      {c.email ? (
                        <div className="flex items-center gap-1.5">
                          <a href={`mailto:${c.email}`} className="text-orange-600 hover:underline">
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
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-neutral-600 dark:text-neutral-400 text-[11px]">
                      <div>{c.horario || "Comercial"}</div>
                      {c.direccion && <div className="text-neutral-400 truncate max-w-[150px]">{c.direccion}</div>}
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-1.5">
                      {c.telefono && (
                        <>
                          <a
                            href={`tel:${c.telefono}`}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 transition inline-block"
                          >
                            Llamar
                          </a>
                          <a
                            href={obtenerEnlaceWhatsApp(c.telefono, c.nombre)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition inline-block"
                          >
                            WhatsApp
                          </a>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Estado vacío cuando no hay resultados */}
      {contactosFiltrados.length === 0 && !cargando && (
        <div className="p-12 text-center border rounded-2xl bg-card space-y-3">
          <Users className="w-12 h-12 text-neutral-300 mx-auto" />
          <h3 className="font-bold text-base">No se encontraron contactos</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            No existen contactos que coincidan con la búsqueda &ldquo;{busqueda}&rdquo; o el filtro seleccionado.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setBusqueda("");
              setFiltroTipo("TODOS");
              setFiltroEmpresa("TODAS");
            }}
          >
            Restablecer Filtros
          </Button>
        </div>
      )}

      {/* Modal para Crear Contacto Manual */}
      {modalNuevoAbierto && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="text-lg font-bold">Registrar Nuevo Contacto en CRM</h3>
                <p className="text-xs text-muted-foreground">
                  Añada un contacto clave de distribuidora, cliente preferente o línea de emergencia.
                </p>
              </div>
              <button
                onClick={() => setModalNuevoAbierto(false)}
                className="text-neutral-400 hover:text-neutral-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearContactoManual} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Nombre Completo / Contacto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ing. Marco Polo o Central Emergencias Callao"
                  value={formNuevo.nombre || ""}
                  onChange={(e) => setFormNuevo({ ...formNuevo, nombre: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Tipo de Contacto *
                  </label>
                  <select
                    value={formNuevo.tipo || "EMPRESA"}
                    onChange={(e) => setFormNuevo({ ...formNuevo, tipo: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  >
                    <option value="EMPRESA">Distribuidora de Gas</option>
                    <option value="CLIENTE">Cliente Residencial / Negocio</option>
                    <option value="REPARTIDOR">Chofer / Repartidor de Flota</option>
                    <option value="EMERGENCIA">Emergencias & Fugas (24/7)</option>
                    <option value="ADMIN">Administrador PideGas</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Cargo o Función
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Jefe de Despacho"
                    value={formNuevo.cargo || ""}
                    onChange={(e) => setFormNuevo({ ...formNuevo, cargo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Empresa o Entidad Asociada
                </label>
                <input
                  type="text"
                  placeholder="Ej. LlamaGas Perú o Cliente Residencial"
                  value={formNuevo.entidad || ""}
                  onChange={(e) => setFormNuevo({ ...formNuevo, entidad: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
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
                    value={formNuevo.telefono || ""}
                    onChange={(e) => setFormNuevo({ ...formNuevo, telefono: e.target.value })}
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
                    value={formNuevo.email || ""}
                    onChange={(e) => setFormNuevo({ ...formNuevo, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Dirección o Sede
                </label>
                <input
                  type="text"
                  placeholder="Av. Faucett 500, Callao"
                  value={formNuevo.direccion || ""}
                  onChange={(e) => setFormNuevo({ ...formNuevo, direccion: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Horario de Atención
                </label>
                <input
                  type="text"
                  placeholder="Ej. Lun - Sáb 07:00 a 22:00 o 24/7"
                  value={formNuevo.horario || ""}
                  onChange={(e) => setFormNuevo({ ...formNuevo, horario: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Notas u Observaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre el contacto, requerimientos o preferencias..."
                  value={formNuevo.notas || ""}
                  onChange={(e) => setFormNuevo({ ...formNuevo, notas: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs focus:ring-2 focus:ring-orange-500 outline-hidden"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t dark:border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalNuevoAbierto(false)}
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
