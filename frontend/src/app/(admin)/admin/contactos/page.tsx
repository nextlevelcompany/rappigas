"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  Users,
  AlertTriangle,
  ExternalLink,
  Eye,
  X,
  PhoneCall,
  Calendar,
  FileText,
} from "lucide-react";

export type TipoContacto = "EMPRESA" | "CLIENTE" | "REPARTIDOR" | "EMERGENCIA" | "ADMIN";

export interface ContactoCRM {
  id: string;
  nombre: string;
  cargo: string;
  tipo: TipoContacto;
  entidad: string;
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

  // Feedback y Modales
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
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

      try {
        const manualesGuardados = localStorage.getItem("contactos_crm_manuales");
        if (manualesGuardados) {
          setContactosManuales(JSON.parse(manualesGuardados));
        }
      } catch (e) {
        console.warn("Error leyendo localStorage", e);
      }
    } catch (err: any) {
      setMensaje({
        tipo: "error",
        texto: err.message || "Error al cargar la lista de contactos.",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Consolidar lista de contactos
  const listaContactos: ContactoCRM[] = useMemo(() => {
    const res: ContactoCRM[] = [];

    // 1. Contactos de Empresas / Distribuidoras
    empresas.forEach((emp) => {
      res.push({
        id: `emp-${emp.publicId}`,
        nombre: emp.adminNombre || emp.nombreComercial,
        cargo: "Titular / Administrador Oficial",
        tipo: "EMPRESA",
        entidad: emp.nombreComercial,
        empresaPublicId: emp.publicId,
        telefono: emp.telefono || emp.adminTelefono || "",
        email: emp.adminEmail || emp.emailContacto,
        direccion: emp.direccionFiscal,
        horario: "07:00 - 21:00 (Despacho)",
        estado: emp.estado,
        origen: "API_EMPRESA",
        notas: `RUC: ${emp.ruc} • Distribuidora de GLP envasado normada por Osinergmin.`,
      });
    });

    // 2. Contactos de Usuarios (Clientes y Repartidores)
    usuarios.forEach((usr) => {
      if (usr.rol === "CLIENTE") {
        res.push({
          id: `usr-${usr.publicId}`,
          nombre: `${usr.nombres} ${usr.apellidos}`.trim(),
          cargo: "Cliente Residencial / Negocio",
          tipo: "CLIENTE",
          entidad: "Cliente Final RappiGas",
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
          cargo: "Super Administrador",
          tipo: "ADMIN",
          entidad: "RappiGas Central",
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
      if (filtroTipo !== "TODOS" && c.tipo !== filtroTipo) {
        return false;
      }
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
  }, [listaContactos, filtroTipo, busqueda]);

  // Conteos
  const totalContactos = listaContactos.length;
  const totalEmpresas = useMemo(() => listaContactos.filter((c) => c.tipo === "EMPRESA").length, [listaContactos]);
  const totalClientes = useMemo(() => listaContactos.filter((c) => c.tipo === "CLIENTE").length, [listaContactos]);
  const totalRepartidores = useMemo(() => listaContactos.filter((c) => c.tipo === "REPARTIDOR").length, [listaContactos]);
  const totalEmergencias = useMemo(() => listaContactos.filter((c) => c.tipo === "EMERGENCIA").length, [listaContactos]);

  const copiarAlPortapapeles = (texto: string, id: string) => {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  const obtenerEnlaceWhatsApp = (telefono: string, nombre: string) => {
    const limpio = (telefono || "").replace(/\D/g, "");
    const numFinal = limpio.length === 9 ? `51${limpio}` : limpio;
    const msg = encodeURIComponent(`Hola ${nombre}, le saludamos desde la administración de RappiGas.`);
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
    link.setAttribute("download", `directorio_contactos_rappigas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBadgeTipo = (tipo: TipoContacto) => {
    switch (tipo) {
      case "EMPRESA":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Distribuidora
          </span>
        );
      case "CLIENTE":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Cliente
          </span>
        );
      case "REPARTIDOR":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-900">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Repartidor
          </span>
        );
      case "EMERGENCIA":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-900 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Emergencia 24/7
          </span>
        );
      case "ADMIN":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Admin
          </span>
        );
    }
  };

  const getInitials = (nombre: string) => {
    if (!nombre) return "CT";
    const parts = nombre.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-full py-3 px-3 sm:px-6 space-y-3 text-xs">
      {errorPermisos && (
        <RoleGuardAlert
          rolRequerido="ADMIN"
          mensaje={errorPermisos}
          onExito={cargarDatos}
        />
      )}

      {/* Encabezado Compacto */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 flex items-center justify-center shrink-0">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Directorio de Contactos
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border border-orange-200 dark:border-orange-900">
                CRM Global
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Canales de comunicación directa con distribuidoras, choferes y clientes de RappiGas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={cargarDatos}
            disabled={cargando}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            <RefreshCw className={`w-3 h-3 ${cargando ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportarCSV}
            className="h-7 px-2.5 text-xs gap-1.5"
          >
            <Download className="w-3 h-3 text-muted-foreground" />
            <span>CSV</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setModalNuevoAbierto(true)}
            className="h-7 px-3 text-xs gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Contacto</span>
          </Button>
        </div>
      </div>

      {/* Alerta de Notificación Compacta */}
      {mensaje && (
        <div
          className={`py-2 px-3 rounded-lg flex items-center justify-between text-xs shadow-2xs border ${
            mensaje.tipo === "exito"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
              : "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {mensaje.tipo === "exito" ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{mensaje.texto}</span>
          </div>
          <button
            onClick={() => setMensaje(null)}
            className="p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Cards Ultracompactas (Tira Horizontal) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Total Contactos</p>
            <p className="text-lg font-bold leading-tight mt-0.5">{totalContactos}</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Distribuidoras</p>
            <p className="text-lg font-bold text-orange-600 dark:text-orange-400 leading-tight mt-0.5">{totalEmpresas}</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400 flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Clientes & Choferes</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">{totalClientes + totalRepartidores}</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-2.5 px-3 rounded-lg border bg-card text-card-foreground shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[11px] text-muted-foreground font-medium">Líneas Emergencia</p>
            <p className="text-lg font-bold text-rose-600 dark:text-rose-400 leading-tight mt-0.5">{totalEmergencias}</p>
          </div>
          <div className="w-7 h-7 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda Compacta en 1 Sola Línea */}
      <div className="p-2 rounded-lg border bg-card shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        {/* Pestañas de Tipo Compactas */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setFiltroTipo("TODOS")}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              filtroTipo === "TODOS"
                ? "bg-foreground text-background shadow-2xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <span>Todos</span>
            <span className="px-1 py-0.1 rounded text-[10px] bg-black/10 dark:bg-white/15">
              {totalContactos}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroTipo("EMPRESA")}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              filtroTipo === "EMPRESA"
                ? "bg-orange-600 text-white shadow-2xs"
                : "text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40"
            }`}
          >
            <span>Distribuidoras</span>
            <span className={`px-1 py-0.1 rounded text-[10px] ${filtroTipo === "EMPRESA" ? "bg-white/20" : "bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300"}`}>
              {totalEmpresas}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroTipo("CLIENTE")}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              filtroTipo === "CLIENTE"
                ? "bg-blue-600 text-white shadow-2xs"
                : "text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
            }`}
          >
            <span>Clientes</span>
            <span className={`px-1 py-0.1 rounded text-[10px] ${filtroTipo === "CLIENTE" ? "bg-white/20" : "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"}`}>
              {totalClientes}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroTipo("REPARTIDOR")}
            className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              filtroTipo === "REPARTIDOR"
                ? "bg-amber-600 text-white shadow-2xs"
                : "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            }`}
          >
            <span>Repartidores</span>
            <span className={`px-1 py-0.1 rounded text-[10px] ${filtroTipo === "REPARTIDOR" ? "bg-white/20" : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"}`}>
              {totalRepartidores}
            </span>
          </button>

          {totalEmergencias > 0 && (
            <button
              type="button"
              onClick={() => setFiltroTipo("EMERGENCIA")}
              className={`h-7 px-2.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                filtroTipo === "EMERGENCIA"
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              }`}
            >
              <span>Emergencias</span>
              <span className={`px-1 py-0.1 rounded text-[10px] ${filtroTipo === "EMERGENCIA" ? "bg-white/20" : "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"}`}>
                {totalEmergencias}
              </span>
            </button>
          )}
        </div>

        {/* Búsqueda y Conteo Compacto */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-2" />
            <Input
              type="text"
              placeholder="Buscar nombre, teléfono, empresa..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-8 pr-7 h-7 text-xs bg-muted/30 focus:bg-background"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="absolute right-2 top-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-[11px] text-muted-foreground whitespace-nowrap hidden sm:inline">
            <strong className="text-foreground">{contactosFiltrados.length}</strong>/{totalContactos}
          </span>
        </div>
      </div>

      {/* Tabla Compacta de Alta Densidad */}
      <div className="rounded-lg border bg-card shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-muted/60 border-b text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2">Contacto</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Entidad / Sede</th>
                <th className="px-3 py-2">Canal de Contacto</th>
                <th className="px-3 py-2 text-center">Estado</th>
                <th className="px-3.5 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cargando ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-orange-600" />
                      <span className="text-xs">Cargando directorio de contactos...</span>
                    </div>
                  </td>
                </tr>
              ) : contactosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                      <Users className="w-6 h-6 text-muted-foreground/50" />
                      <p className="text-xs font-semibold text-foreground">No se encontraron contactos</p>
                      <p className="text-[11px]">Prueba con otros términos o limpia los filtros.</p>
                      {(busqueda || filtroTipo !== "TODOS") && (
                        <button
                          type="button"
                          onClick={() => {
                            setBusqueda("");
                            setFiltroTipo("TODOS");
                          }}
                          className="mt-1 text-xs text-orange-600 hover:underline font-medium"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                contactosFiltrados.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-muted/40 transition group"
                  >
                    {/* 1. Contacto con Avatar */}
                    <td className="px-3.5 py-2.5 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-md font-bold text-[10px] flex items-center justify-center shrink-0 border border-border shadow-2xs ${
                            c.esEmergencia
                              ? "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900"
                              : c.tipo === "EMPRESA"
                              ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-900"
                              : c.tipo === "CLIENTE"
                              ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900"
                              : c.tipo === "REPARTIDOR"
                              ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900"
                              : "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900"
                          }`}
                        >
                          {getInitials(c.nombre)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-foreground block truncate text-xs" title={c.nombre}>
                            {c.nombre}
                          </span>
                          <p className="text-[10px] text-muted-foreground truncate max-w-xs" title={c.cargo}>
                            {c.cargo}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* 2. Tipo */}
                    <td className="px-3 py-2.5 align-middle whitespace-nowrap">
                      {getBadgeTipo(c.tipo)}
                    </td>

                    {/* 3. Entidad / Sede */}
                    <td className="px-3 py-2.5 align-middle">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-foreground font-medium text-xs max-w-xs" title={c.entidad}>
                            {c.entidad}
                          </span>
                          {c.empresaPublicId && (
                            <Link
                              href={`/admin/empresas/${c.empresaPublicId}`}
                              className="text-orange-600 hover:text-orange-700 shrink-0"
                              title="Ver ficha de distribuidora"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                        {(c.direccion || c.horario) && (
                          <span className="text-[10px] text-muted-foreground truncate max-w-xs" title={c.direccion || c.horario}>
                            {c.direccion || c.horario}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. Canal de Contacto (Correo arriba, Teléfono + WA abajo - Idéntico a empresas) */}
                    <td className="px-3 py-2.5 align-middle">
                      <div className="flex flex-col gap-0.5">
                        {c.email ? (
                          <a
                            href={`mailto:${c.email}`}
                            className="text-[11px] text-foreground hover:text-orange-600 transition truncate max-w-xs"
                            title={c.email}
                          >
                            {c.email}
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-[10px] italic">Sin correo</span>
                        )}

                        {c.telefono ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {c.telefono}
                            </span>
                            <button
                              type="button"
                              onClick={() => copiarAlPortapapeles(c.telefono, `tel-${c.id}`)}
                              className="p-0.5 rounded text-muted-foreground hover:text-foreground transition cursor-pointer"
                              title="Copiar Teléfono"
                            >
                              {copiadoId === `tel-${c.id}` ? (
                                <Check className="w-2.5 h-2.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-2.5 h-2.5 opacity-60 hover:opacity-100" />
                              )}
                            </button>
                            <a
                              href={obtenerEnlaceWhatsApp(c.telefono, c.nombre)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-1 py-0.1 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 transition inline-flex items-center gap-0.5"
                              title="Abrir WhatsApp"
                            >
                              WA
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </td>

                    {/* 5. Estado */}
                    <td className="px-3 py-2.5 align-middle text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          c.estado === "ACTIVO" || c.estado === "APROBADA"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            : c.estado === "PENDIENTE"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                        }`}
                      >
                        {c.estado === "APROBADA" ? "ACTIVO" : c.estado}
                      </span>
                    </td>

                    {/* 6. Acciones Compactas (Solo Iconos) */}
                    <td className="px-3.5 py-2 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {/* Botón WhatsApp directo */}
                        {c.telefono && (
                          <a
                            href={obtenerEnlaceWhatsApp(c.telefono, c.nombre)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-7 w-7 rounded-md border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 flex items-center justify-center transition shadow-2xs"
                            title="Chat de WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Botón Vista Rápida Modal */}
                        <button
                          type="button"
                          onClick={() => setContactoSeleccionado(c)}
                          className="h-7 w-7 rounded-md border border-input bg-background hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition shadow-2xs cursor-pointer"
                          title="Vista Rápida de Contacto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Si es distribuidora, botón Ficha Completa */}
                        {c.empresaPublicId && (
                          <Link
                            href={`/admin/empresas/${c.empresaPublicId}`}
                            className="h-7 w-7 rounded-md border border-input bg-background hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 dark:hover:bg-orange-950/40 flex items-center justify-center transition shadow-2xs text-muted-foreground"
                            title="Ver Ficha de Distribuidora"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        {/* Botón Eliminar si es manual */}
                        {c.origen === "MANUAL" && (
                          <button
                            type="button"
                            onClick={() => handleEliminarManual(c.id)}
                            className="h-7 w-7 rounded-md border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/30 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-900/50 flex items-center justify-center transition shadow-2xs cursor-pointer"
                            title="Eliminar contacto manual"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalle Rápido de Contacto */}
      {contactoSeleccionado && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-card text-card-foreground border rounded-xl max-w-md w-full p-4 sm:p-5 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex justify-between items-start border-b pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950 font-bold text-xs flex items-center justify-center">
                  {getInitials(contactoSeleccionado.nombre)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {contactoSeleccionado.nombre}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {contactoSeleccionado.cargo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setContactoSeleccionado(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs divide-y divide-border">
              <div className="pt-1.5 flex justify-between items-center">
                <span className="text-muted-foreground">Tipo:</span>
                {getBadgeTipo(contactoSeleccionado.tipo)}
              </div>
              <div className="pt-1.5 flex justify-between">
                <span className="text-muted-foreground">Entidad / Empresa:</span>
                <span className="font-semibold text-foreground text-right max-w-[240px] truncate">
                  {contactoSeleccionado.entidad}
                </span>
              </div>
              <div className="pt-1.5 flex justify-between items-center">
                <span className="text-muted-foreground">Teléfono:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-semibold">{contactoSeleccionado.telefono || "—"}</span>
                  {contactoSeleccionado.telefono && (
                    <a
                      href={obtenerEnlaceWhatsApp(contactoSeleccionado.telefono, contactoSeleccionado.nombre)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-1 py-0.1 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200 transition"
                    >
                      WA
                    </a>
                  )}
                </div>
              </div>
              <div className="pt-1.5 flex justify-between items-center">
                <span className="text-muted-foreground">Correo:</span>
                <a href={`mailto:${contactoSeleccionado.email}`} className="text-orange-600 hover:underline font-medium">
                  {contactoSeleccionado.email || "—"}
                </a>
              </div>
              {contactoSeleccionado.direccion && (
                <div className="pt-1.5 flex justify-between">
                  <span className="text-muted-foreground">Dirección:</span>
                  <span className="text-right text-foreground max-w-[240px] truncate">
                    {contactoSeleccionado.direccion}
                  </span>
                </div>
              )}
              {contactoSeleccionado.horario && (
                <div className="pt-1.5 flex justify-between">
                  <span className="text-muted-foreground">Horario:</span>
                  <span className="text-right text-foreground">
                    {contactoSeleccionado.horario}
                  </span>
                </div>
              )}
              {contactoSeleccionado.notas && (
                <div className="pt-1.5 space-y-1">
                  <span className="text-muted-foreground block text-[11px]">Notas / Observaciones:</span>
                  <p className="text-[11px] p-2 rounded bg-muted/40 text-muted-foreground">
                    {contactoSeleccionado.notas}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setContactoSeleccionado(null)}
                className="h-7 text-xs"
              >
                Cerrar
              </Button>
              {contactoSeleccionado.empresaPublicId && (
                <Button
                  size="sm"
                  asChild
                  className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white gap-1"
                >
                  <Link href={`/admin/empresas/${contactoSeleccionado.empresaPublicId}`}>
                    <span>Ver Ficha de Distribuidora</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal para Crear Contacto Manual */}
      {modalNuevoAbierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-card text-card-foreground border rounded-xl max-w-md w-full p-4 sm:p-5 shadow-xl space-y-3 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex justify-between items-start border-b pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-foreground">Nuevo Contacto en CRM</h3>
                <p className="text-[11px] text-muted-foreground">
                  Añade un contacto directo, cliente preferente o línea de emergencia.
                </p>
              </div>
              <button
                onClick={() => setModalNuevoAbierto(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCrearContactoManual} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">
                  Nombre Completo / Contacto *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="Ej. Ing. Marco Polo o Central de Fugas"
                  value={formNuevo.nombre || ""}
                  onChange={(e) => setFormNuevo({ ...formNuevo, nombre: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Tipo de Contacto *
                  </label>
                  <select
                    value={formNuevo.tipo || "EMPRESA"}
                    onChange={(e) => setFormNuevo({ ...formNuevo, tipo: e.target.value as any })}
                    className="w-full h-8 px-2 text-xs rounded-md border bg-muted/30 focus:bg-background outline-hidden"
                  >
                    <option value="EMPRESA">Distribuidora</option>
                    <option value="CLIENTE">Cliente</option>
                    <option value="REPARTIDOR">Repartidor</option>
                    <option value="EMERGENCIA">Emergencias 24/7</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Cargo o Función
                  </label>
                  <Input
                    type="text"
                    placeholder="Ej. Jefe de Despacho"
                    value={formNuevo.cargo || ""}
                    onChange={(e) => setFormNuevo({ ...formNuevo, cargo: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground mb-1">
                  Empresa o Entidad
                </label>
                <Input
                  type="text"
                  placeholder="Ej. LlamaGas Perú o Cliente Particular"
                  value={formNuevo.entidad || ""}
                  onChange={(e) => setFormNuevo({ ...formNuevo, entidad: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <Input
                    type="tel"
                    required
                    placeholder="+51 987 654 321"
                    value={formNuevo.telefono || ""}
                    onChange={(e) => setFormNuevo({ ...formNuevo, telefono: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Correo Electrónico
                  </label>
                  <Input
                    type="email"
                    placeholder="contacto@empresa.com"
                    value={formNuevo.email || ""}
                    onChange={(e) => setFormNuevo({ ...formNuevo, email: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Dirección o Sede
                  </label>
                  <Input
                    type="text"
                    placeholder="Av. Faucett 500, Callao"
                    value={formNuevo.direccion || ""}
                    onChange={(e) => setFormNuevo({ ...formNuevo, direccion: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-foreground mb-1">
                    Horario de Atención
                  </label>
                  <Input
                    type="text"
                    placeholder="08:00 a 18:00 o 24/7"
                    value={formNuevo.horario || ""}
                    onChange={(e) => setFormNuevo({ ...formNuevo, horario: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalNuevoAbierto(false)}
                  className="h-7 text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white font-semibold"
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
