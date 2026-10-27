"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Gift,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  Ticket,
  ChevronRight,
  RefreshCw,
  Eye,
  ArrowUpDown,
  User,
  ShieldCheck,
  PackageCheck,
  Check,
  FileText,
  Send,
  MessageCircle,
} from "lucide-react";

export interface CanjePedidoAdmin {
  id: string;
  codigoCupon: string;
  fecha: string;
  cliente: {
    nombre: string;
    documento: string;
    telefono: string;
    distrito: string;
    direccion: string;
    email?: string;
  };
  premio: {
    id: string;
    nombre: string;
    categoria: string;
    marca: string;
    imagen: string;
    puntos: number;
    valorSoles: number;
  };
  estado: "PENDIENTE" | "EN_CURSO" | "ENTREGADO" | "CANCELADO";
  distribuidorAsignado: string;
  repartidor: string;
  fechaEntregaEstimada: string;
  fechaEntregaReal?: string;
  observaciones?: string;
}

// Dataset inicial con productos en curso, entregados y pendientes
const CANJES_INICIALES: CanjePedidoAdmin[] = [
  {
    id: "CNJ-2026-084",
    codigoCupon: "VALE10GAS-4821",
    fecha: "2026-10-20 08:30",
    cliente: {
      nombre: "Juan Carlos Pérez Gómez",
      documento: "45892147",
      telefono: "987654321",
      distrito: "Los Olivos",
      direccion: "Av. Las Palmeras 1245, Dpto 302",
      email: "juan.perez@gmail.com",
    },
    premio: {
      id: "zp-01",
      nombre: "Vale de Descuento S/ 10.00 en Balón de Gas",
      categoria: "GAS_VALES",
      marca: "RappiGas",
      imagen: "/products/balon-10kg-premium.svg",
      puntos: 80,
      valorSoles: 10.0,
    },
    estado: "EN_CURSO",
    distribuidorAsignado: "GasExpress Los Olivos Norte",
    repartidor: "Carlos Mendoza (Moto Torito #04)",
    fechaEntregaEstimada: "Hoy 20 Oct (10:00 - 12:00)",
    observaciones: "El cliente solicitó aplicarlo en su pedido matutino.",
  },
  {
    id: "CNJ-2026-083",
    codigoCupon: "OSTERBLENDER-9921",
    fecha: "2026-10-19 16:45",
    cliente: {
      nombre: "María Elena García Torres",
      documento: "41258963",
      telefono: "991234567",
      distrito: "San Martín de Porres",
      direccion: "Jr. Huandoy 458, Urb. Mesa Redonda",
      email: "m.garcia@hotmail.com",
    },
    premio: {
      id: "zp-36",
      nombre: "Licuadora Oster Monterrey 8 Vel + Pulsador Vaso Vidrio 1.5L",
      categoria: "ELECTROHOGAR",
      marca: "Oster",
      imagen: "/products/01.png",
      puntos: 450,
      valorSoles: 179.0,
    },
    estado: "EN_CURSO",
    distribuidorAsignado: "Almacén Central RappiGas Lima",
    repartidor: "Furgón Logístico #02 (Conductor: Luis Ramos)",
    fechaEntregaEstimada: "Hoy 20 Oct (14:00 - 18:00)",
    observaciones: "Premio físico empacado con garantía sellada de fábrica.",
  },
  {
    id: "CNJ-2026-082",
    codigoCupon: "RECORDANTIAD-3310",
    fecha: "2026-10-19 11:15",
    cliente: {
      nombre: "Carlos Alberto Rodríguez Silva",
      documento: "70258961",
      telefono: "976543210",
      distrito: "Independencia",
      direccion: "Av. Túpac Amaru 2100",
      email: "carlos.rodriguez@outlook.com",
    },
    premio: {
      id: "zp-16",
      nombre: "Sartén Record Antiadherente Granito 24cm Tapa Vidrio",
      categoria: "COCINA_MENAJE",
      marca: "Record",
      imagen: "/products/03.png",
      puntos: 220,
      valorSoles: 69.9,
    },
    estado: "ENTREGADO",
    distribuidorAsignado: "Distribuidora Independencia Gas",
    repartidor: "Jorge Quispe (Unidad #08)",
    fechaEntregaEstimada: "19 Oct 2026",
    fechaEntregaReal: "2026-10-19 15:20",
    observaciones: "Entregado conforme en domicilio. Firmó titular.",
  },
  {
    id: "CNJ-2026-081",
    codigoCupon: "SOLGAS10GRATIS-7781",
    fecha: "2026-10-18 14:00",
    cliente: {
      nombre: "Ana Lucía Torres Mendoza",
      documento: "48963251",
      telefono: "984512369",
      distrito: "Miraflores",
      direccion: "Calle Alcanfores 340, Dpto 501",
      email: "ana.torres@gmail.com",
    },
    premio: {
      id: "zp-05",
      nombre: "Balón Solgas 10kg Premium 100% Gratis",
      categoria: "GAS_VALES",
      marca: "Solgas",
      imagen: "/products/balon-10kg-premium.svg",
      puntos: 480,
      valorSoles: 55.0,
    },
    estado: "ENTREGADO",
    distribuidorAsignado: "Solgas Miraflores Express",
    repartidor: "Miguel Ángel Sánchez (Unidad #01)",
    fechaEntregaEstimada: "18 Oct 2026",
    fechaEntregaReal: "2026-10-18 16:30",
    observaciones: "Cilindro nuevo precintado entregado e instalado en cocina.",
  },
  {
    id: "CNJ-2026-080",
    codigoCupon: "IMACOHERV-6623",
    fecha: "2026-10-18 09:20",
    cliente: {
      nombre: "Luis Fernando Mendoza Vega",
      documento: "42369874",
      telefono: "993652147",
      distrito: "San Juan de Lurigancho",
      direccion: "Av. Próceres de la Independencia 1820",
      email: "luis.mendoza@yahoo.es",
    },
    premio: {
      id: "zp-41",
      nombre: "Hervidor Eléctrico Imaco 1.8L Acero Inoxidable",
      categoria: "ELECTROHOGAR",
      marca: "Imaco",
      imagen: "/products/04.png",
      puntos: 320,
      valorSoles: 89.0,
    },
    estado: "ENTREGADO",
    distribuidorAsignado: "Distribuidora SJL San Martín",
    repartidor: "Pedro Cárdenas (Unidad #11)",
    fechaEntregaEstimada: "18 Oct 2026",
    fechaEntregaReal: "2026-10-18 13:40",
    observaciones: "Entregado con boleta de canje de fidelidad.",
  },
  {
    id: "CNJ-2026-079",
    codigoCupon: "BOSHDESTORN-5510",
    fecha: "2026-10-17 18:00",
    cliente: {
      nombre: "Rosa Isabel Quispe Mamani",
      documento: "71254896",
      telefono: "981254789",
      distrito: "Comas",
      direccion: "Av. Universitaria 6520",
      email: "rosa.quispe@gmail.com",
    },
    premio: {
      id: "zp-86",
      nombre: "Kit Destornilladores y Puntas de Precisión Bosch 46 Pzas",
      categoria: "FERRETERIA",
      marca: "Bosch",
      imagen: "/products/05.png",
      puntos: 290,
      valorSoles: 85.0,
    },
    estado: "EN_CURSO",
    distribuidorAsignado: "Almacén Central RappiGas",
    repartidor: "Courier Express (Guía #7821)",
    fechaEntregaEstimada: "21 Oct 2026",
    observaciones: "En tránsito interdistrital hacia Comas.",
  },
  {
    id: "CNJ-2026-078",
    codigoCupon: "VALE20GAS-8812",
    fecha: "2026-10-17 10:10",
    cliente: {
      nombre: "Víctor Hugo Morales Castro",
      documento: "43256981",
      telefono: "975312468",
      distrito: "Surco",
      direccion: "Av. Benavides 4120, Dpto 102",
      email: "victor.morales@gmail.com",
    },
    premio: {
      id: "zp-03",
      nombre: "Vale de Descuento S/ 20.00 en Balón de Gas",
      categoria: "GAS_VALES",
      marca: "RappiGas",
      imagen: "/products/balon-10kg-premium.svg",
      puntos: 180,
      valorSoles: 20.0,
    },
    estado: "PENDIENTE",
    distribuidorAsignado: "Distribuidora Surco Gas",
    repartidor: "Por asignar",
    fechaEntregaEstimada: "Pendiente de programación",
    observaciones: "Solicitud registrada en fin de semana. Confirmar con cliente.",
  },
];

const STORAGE_KEY_CANJES = "rappigas_canjes_pedidos";

export default function AdminCanjesFidelidadPage() {
  const [canjes, setCanjes] = useState<CanjePedidoAdmin[]>([]);
  const [cargando, setCargando] = useState(true);

  // Filtros
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"TODOS" | "EN_CURSO" | "ENTREGADO" | "PENDIENTE" | "CANCELADO">("TODOS");
  const [orden, setOrden] = useState<"FECHA_DESC" | "FECHA_ASC" | "PUNTOS_DESC" | "CLIENTE_ASC">("FECHA_DESC");

  // Modal de Detalle / Gestión de Canje
  const [canjeSeleccionado, setCanjeSeleccionado] = useState<CanjePedidoAdmin | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<CanjePedidoAdmin["estado"]>("EN_CURSO");
  const [observacionesInput, setObservacionesInput] = useState("");
  const [repartidorInput, setRepartidorInput] = useState("");

  // Cargar pedidos de canje desde localStorage
  const cargarCanjes = () => {
    setCargando(true);
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_CANJES);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCanjes(parsed);
            setCargando(false);
            return;
          }
        }
      } catch (err) {
        console.error("Error al leer canjes de localStorage:", err);
      }
      // Fallback
      setCanjes(CANJES_INICIALES);
      localStorage.setItem(STORAGE_KEY_CANJES, JSON.stringify(CANJES_INICIALES));
    }
    setCargando(false);
  };

  useEffect(() => {
    cargarCanjes();

    const handleSync = () => {
      cargarCanjes();
    };

    window.addEventListener("nuevo_canje_registrado", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("nuevo_canje_registrado", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Guardar cambios en localStorage
  const guardarCanjes = (lista: CanjePedidoAdmin[]) => {
    setCanjes(lista);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_CANJES, JSON.stringify(lista));
      window.dispatchEvent(new Event("nuevo_canje_registrado"));
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    const total = canjes.length;
    const enCurso = canjes.filter((c) => c.estado === "EN_CURSO").length;
    const entregados = canjes.filter((c) => c.estado === "ENTREGADO").length;
    const pendientes = canjes.filter((c) => c.estado === "PENDIENTE").length;
    const cancelados = canjes.filter((c) => c.estado === "CANCELADO").length;
    const totalPuntos = canjes.reduce((acc, c) => acc + c.premio.puntos, 0);

    return {
      total,
      enCurso,
      entregados,
      pendientes,
      cancelados,
      totalPuntos,
    };
  }, [canjes]);

  // Filtrado y orden
  const canjesFiltrados = useMemo(() => {
    return canjes
      .filter((c) => {
        if (filtroEstado !== "TODOS" && c.estado !== filtroEstado) return false;

        if (busqueda.trim()) {
          const q = busqueda.toLowerCase().trim();
          const coincideId = c.id.toLowerCase().includes(q);
          const coincideCupon = c.codigoCupon.toLowerCase().includes(q);
          const coincideNom = c.cliente.nombre.toLowerCase().includes(q);
          const coincideDoc = c.cliente.documento.includes(q);
          const coincideTel = c.cliente.telefono.includes(q);
          const coincideDis = c.cliente.distrito.toLowerCase().includes(q);
          const coincidePre = c.premio.nombre.toLowerCase().includes(q);
          const coincideMar = c.premio.marca.toLowerCase().includes(q);
          if (
            !coincideId &&
            !coincideCupon &&
            !coincideNom &&
            !coincideDoc &&
            !coincideTel &&
            !coincideDis &&
            !coincidePre &&
            !coincideMar
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (orden === "FECHA_DESC") return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
        if (orden === "FECHA_ASC") return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
        if (orden === "PUNTOS_DESC") return b.premio.puntos - a.premio.puntos;
        if (orden === "CLIENTE_ASC") return a.cliente.nombre.localeCompare(b.cliente.nombre);
        return 0;
      });
  }, [canjes, filtroEstado, busqueda, orden]);

  // Cambiar estado rápido
  const handleCambiarEstadoRapido = (id: string, nuevo: CanjePedidoAdmin["estado"]) => {
    const actualizados = canjes.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          estado: nuevo,
          fechaEntregaReal:
            nuevo === "ENTREGADO"
              ? new Date().toISOString().replace("T", " ").substring(0, 16)
              : c.fechaEntregaReal,
        };
      }
      return c;
    });
    guardarCanjes(actualizados);
  };

  // Abrir modal de gestión
  const handleAbrirGestion = (canje: CanjePedidoAdmin) => {
    setCanjeSeleccionado(canje);
    setNuevoEstado(canje.estado);
    setObservacionesInput(canje.observaciones || "");
    setRepartidorInput(canje.repartidor || "");
  };

  // Guardar cambios del modal
  const handleGuardarGestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canjeSeleccionado) return;

    const actualizados = canjes.map((c) => {
      if (c.id === canjeSeleccionado.id) {
        return {
          ...c,
          estado: nuevoEstado,
          observaciones: observacionesInput,
          repartidor: repartidorInput,
          fechaEntregaReal:
            nuevoEstado === "ENTREGADO" && !c.fechaEntregaReal
              ? new Date().toISOString().replace("T", " ").substring(0, 16)
              : c.fechaEntregaReal,
        };
      }
      return c;
    });

    guardarCanjes(actualizados);
    setCanjeSeleccionado(null);
  };

  // Restablecer canjes de demostración
  const handleRestablecerCanjes = () => {
    if (confirm("¿Deseas restablecer la lista de pedidos de canje a los datos iniciales?")) {
      guardarCanjes(CANJES_INICIALES);
    }
  };

  return (
    <div className="w-full px-3 sm:px-5 py-3 space-y-3 text-xs text-slate-800">
      {/* =========================================================================
          CABECERA SUPER ADMIN: CANJES EN CURSO Y ENTREGADOS
      ========================================================================= */}
      <div className="bg-gradient-to-r from-[#03246b] via-[#021b52] to-[#03246b] rounded-xl px-4 py-3 text-white shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 backdrop-blur-xs flex items-center justify-center border border-orange-400/30 shadow-2xs shrink-0">
            <Truck className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">
                Super Admin • Control de Entregas
              </span>
              <span className="text-[10px] font-medium text-slate-300">
                Programa Nacional Zeta Premia
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-white leading-tight">
              Despacho de Canjes: En Curso y Entregados
            </h1>
            <p className="text-[11px] text-slate-300">
              Supervisa la preparación, asignación de reparto y entrega de premios canjeados por los clientes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/premios"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition border border-white/20"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Catálogo Premios</span>
          </Link>

          <Link
            href="/admin/puntos"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xs shadow-2xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ver Billeteras</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          KPIS DE DESPACHO Y ESTADO DE CANJES
      ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Canjes En Curso */}
        <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Canjes En Curso
            </span>
            <span className="text-lg font-black text-amber-600 font-mono block leading-tight">
              {kpis.enCurso} <span className="text-[10px] font-bold text-slate-400">pedidos</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              En preparación o reparto activo
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
            <Truck className="w-4 h-4 text-amber-600" />
          </div>
        </div>

        {/* Canjes Entregados */}
        <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Canjes Entregados
            </span>
            <span className="text-lg font-black text-emerald-600 font-mono block leading-tight">
              {kpis.entregados} <span className="text-[10px] font-bold text-slate-400">completados</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              Recibidos con éxito por clientes
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <PackageCheck className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        {/* Canjes Pendientes */}
        <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Por Programar
            </span>
            <span className="text-lg font-black text-blue-600 font-mono block leading-tight">
              {kpis.pendientes} <span className="text-[10px] font-bold text-slate-400">pendientes</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              Requieren asignación de reparto
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        {/* Puntos Canjeados */}
        <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Puntos Canjeados
            </span>
            <span className="text-lg font-black text-orange-600 font-mono block leading-tight">
              {kpis.totalPuntos.toLocaleString()} <span className="text-[10px] font-bold">PTS</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              En {kpis.total} canjes registrados
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
            <Gift className="w-4 h-4 text-orange-600" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          BARRA DE CONTROL: BUSCADOR + FILTRO POR ESTADO + ORDEN
      ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, DNI, cupón o premio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full text-xs pl-8 pr-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500 font-medium"
          />
        </div>

        {/* Filtros de Estado */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-slate-400 text-[10px] font-bold mr-0.5">ESTADO:</span>
          {[
            { id: "TODOS", label: "Todos", count: kpis.total },
            { id: "EN_CURSO", label: "🚚 En Curso", count: kpis.enCurso },
            { id: "ENTREGADO", label: "✅ Entregados", count: kpis.entregados },
            { id: "PENDIENTE", label: "⏳ Pendientes", count: kpis.pendientes },
            { id: "CANCELADO", label: "❌ Cancelados", count: kpis.cancelados },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setFiltroEstado(st.id as any)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer border flex items-center gap-1 ${
                filtroEstado === st.id
                  ? "bg-[#03246b] text-white border-[#03246b] shadow-2xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>{st.label}</span>
              <span className={`text-[9px] px-1 rounded font-mono ${filtroEstado === st.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                {st.count}
              </span>
            </button>
          ))}
        </div>

        {/* Orden */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[10px] font-bold">ORDEN:</span>
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as any)}
            className="text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-hidden focus:border-orange-500"
          >
            <option value="FECHA_DESC">Más recientes primero</option>
            <option value="FECHA_ASC">Más antiguos primero</option>
            <option value="PUNTOS_DESC">Mayor puntaje canjeado</option>
            <option value="CLIENTE_ASC">Cliente (A - Z)</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          TABLA PRINCIPAL DE CANJES (ULTRA COMPACTA)
      ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[9px] font-black text-[#03246b] uppercase tracking-wider border-b border-slate-200">
                <th className="py-2 px-2.5 w-[14%]">ID / Cupón</th>
                <th className="py-2 px-2.5 w-[22%]">Cliente / Destinatario</th>
                <th className="py-2 px-2.5 w-[25%]">Premio Canjeado</th>
                <th className="py-2 px-2 w-[11%]">Fecha Solicitud</th>
                <th className="py-2 px-2 text-center w-[13%]">Estado del Canje</th>
                <th className="py-2 px-2 w-[15%]">Distribución / Reparto</th>
                <th className="py-2 px-2 text-center w-[8%]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {canjesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 space-y-1">
                    <Truck className="w-7 h-7 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-600 text-xs">No se encontraron canjes con los filtros aplicados</p>
                    <p className="text-[10px] text-slate-400">Prueba con otro término de búsqueda o selecciona otro estado.</p>
                  </td>
                </tr>
              ) : (
                canjesFiltrados.map((canje) => {
                  const badgeEstado =
                    canje.estado === "ENTREGADO"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : canje.estado === "EN_CURSO"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : canje.estado === "PENDIENTE"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-rose-50 text-rose-700 border-rose-200";

                  const iconoEstado =
                    canje.estado === "ENTREGADO" ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    ) : canje.estado === "EN_CURSO" ? (
                      <Truck className="w-3 h-3 text-amber-600 shrink-0" />
                    ) : canje.estado === "PENDIENTE" ? (
                      <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                    );

                  return (
                    <tr key={canje.id} className="hover:bg-slate-50/90 transition">
                      {/* ID / Cupón */}
                      <td className="py-1.5 px-2.5 whitespace-nowrap">
                        <div className="leading-tight">
                          <span className="font-mono font-black text-[#03246b] text-[11px] block">
                            {canje.id}
                          </span>
                          <span className="font-mono font-bold text-orange-600 bg-orange-50 px-1 py-0.2 rounded border border-orange-200 text-[9px] inline-block mt-0.5">
                            {canje.codigoCupon}
                          </span>
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="py-1.5 px-2.5">
                        <div className="min-w-0 leading-tight">
                          <span className="font-bold text-slate-800 block text-[11px] truncate" title={canje.cliente.nombre}>
                            {canje.cliente.nombre}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono truncate">
                            <span>DNI: {canje.cliente.documento}</span>
                            <span>•</span>
                            <Phone className="w-2.5 h-2.5" />
                            <span>{canje.cliente.telefono}</span>
                          </span>
                          <span className="text-[9px] text-slate-500 flex items-center gap-1 truncate" title={canje.cliente.direccion}>
                            <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                            <span className="truncate">{canje.cliente.distrito} - {canje.cliente.direccion}</span>
                          </span>
                        </div>
                      </td>

                      {/* Premio Canjeado */}
                      <td className="py-1.5 px-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={canje.premio.imagen}
                              alt={canje.premio.nombre}
                              className="w-full h-full object-contain p-0.5"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/products/balon-10kg-premium.svg";
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-[#03246b] block text-[11px] truncate leading-tight" title={canje.premio.nombre}>
                              {canje.premio.nombre}
                            </span>
                            <div className="flex items-center gap-1.5 text-[9px]">
                              <span className="font-bold text-slate-500">{canje.premio.marca}</span>
                              <span className="font-black text-orange-600 font-mono">
                                {canje.premio.puntos} PTS
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Fecha de Solicitud */}
                      <td className="py-1.5 px-2 whitespace-nowrap">
                        <div className="leading-tight">
                          <span className="font-mono text-slate-700 font-bold block text-[10px]">
                            {canje.fecha.split(" ")[0]}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {canje.fecha.split(" ")[1] || ""}
                          </span>
                        </div>
                      </td>

                      {/* Estado con Selector Rápido */}
                      <td className="py-1.5 px-2 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black border ${badgeEstado}`}>
                            {iconoEstado}
                            <span>
                              {canje.estado === "EN_CURSO"
                                ? "En Curso"
                                : canje.estado === "ENTREGADO"
                                ? "Entregado"
                                : canje.estado === "PENDIENTE"
                                ? "Pendiente"
                                : "Cancelado"}
                            </span>
                          </span>

                          {/* Botón rápido para cambiar estado */}
                          {canje.estado === "EN_CURSO" && (
                            <button
                              type="button"
                              onClick={() => handleCambiarEstadoRapido(canje.id, "ENTREGADO")}
                              className="text-[8px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300 transition cursor-pointer"
                              title="Marcar como entregado al cliente"
                            >
                              Marcar Entregado ✓
                            </button>
                          )}
                          {canje.estado === "PENDIENTE" && (
                            <button
                              type="button"
                              onClick={() => handleCambiarEstadoRapido(canje.id, "EN_CURSO")}
                              className="text-[8px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300 transition cursor-pointer"
                              title="Iniciar despacho"
                            >
                              Poner En Curso 🚚
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Distribución / Reparto */}
                      <td className="py-1.5 px-2">
                        <div className="min-w-0 leading-tight">
                          <span className="font-bold text-slate-700 block text-[10px] truncate" title={canje.distribuidorAsignado}>
                            {canje.distribuidorAsignado}
                          </span>
                          <span className="text-[9px] text-slate-400 flex items-center gap-1 truncate" title={canje.repartidor}>
                            <User className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{canje.repartidor}</span>
                          </span>
                          {canje.estado === "ENTREGADO" && canje.fechaEntregaReal && (
                            <span className="text-[9px] text-emerald-600 font-bold block truncate">
                              Entregado: {canje.fechaEntregaReal}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-1.5 px-2 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleAbrirGestion(canje)}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[10px] border border-slate-200 transition cursor-pointer flex items-center gap-1"
                            title="Ver ficha de canje y gestionar entrega"
                          >
                            <Eye className="w-2.5 h-2.5 text-slate-500" />
                            <span>Detalle</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de tabla */}
        <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-500">
          <span>
            Mostrando <strong>{canjesFiltrados.length}</strong> de {canjes.length} pedidos de canje registrados
          </span>
          <span className="font-mono text-slate-400">
            Control de Fidelidad RappiGas • Auditoría en tiempo real
          </span>
        </div>
      </div>

      {/* =========================================================================
          MODAL: DETALLE Y GESTIÓN DE CANJE
      ========================================================================= */}
      {canjeSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl space-y-3.5 border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-xs text-[#03246b]">Ficha de Despacho de Canje</h3>
                  <p className="text-[10px] text-slate-400">
                    ID: {canjeSeleccionado.id} • Cupón: {canjeSeleccionado.codigoCupon}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCanjeSeleccionado(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGuardarGestion} className="space-y-3 text-xs">
              {/* Resumen del Premio */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={canjeSeleccionado.premio.imagen}
                    alt={canjeSeleccionado.premio.nombre}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-[#03246b] block text-xs truncate">
                    {canjeSeleccionado.premio.nombre}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                    <span className="text-slate-500 font-semibold">{canjeSeleccionado.premio.marca}</span>
                    <span>•</span>
                    <span className="font-mono font-black text-orange-600">
                      {canjeSeleccionado.premio.puntos} PUNTOS
                    </span>
                    <span>•</span>
                    <span className="text-slate-400 font-mono">
                      Ref: S/ {canjeSeleccionado.premio.valorSoles.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Datos del Cliente y Entrega */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">
                  Datos del Destinatario
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[9px]">Nombre:</span>
                    <span className="font-bold text-slate-800">{canjeSeleccionado.cliente.nombre}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">DNI:</span>
                    <span className="font-mono font-bold text-slate-800">{canjeSeleccionado.cliente.documento}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Teléfono:</span>
                    <span className="font-mono font-bold text-slate-800">{canjeSeleccionado.cliente.telefono}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">Distrito:</span>
                    <span className="font-bold text-slate-800">{canjeSeleccionado.cliente.distrito}</span>
                  </div>
                </div>
                <div className="pt-1 border-t border-slate-200/80">
                  <span className="text-slate-400 block text-[9px]">Dirección Completa de Entrega:</span>
                  <span className="font-bold text-slate-800 text-[11px] block">{canjeSeleccionado.cliente.direccion}</span>
                </div>
              </div>

              {/* Estado de Despacho */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-500 block">
                  Estado del Canje
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {[
                    { id: "PENDIENTE", label: "Pendiente", cls: "bg-blue-50 text-blue-700 border-blue-200" },
                    { id: "EN_CURSO", label: "En Curso", cls: "bg-amber-50 text-amber-700 border-amber-200" },
                    { id: "ENTREGADO", label: "Entregado", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                    { id: "CANCELADO", label: "Cancelado", cls: "bg-rose-50 text-rose-700 border-rose-200" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setNuevoEstado(st.id as any)}
                      className={`px-2 py-1.5 rounded-lg text-center font-bold text-[10px] border transition cursor-pointer ${
                        nuevoEstado === st.id
                          ? "ring-2 ring-orange-500 font-black shadow-2xs " + st.cls
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Repartidor / Unidad */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-500 block">
                  Repartidor / Unidad Asignada
                </label>
                <input
                  type="text"
                  placeholder="Ej: Carlos Mendoza (Unidad Torito #04)"
                  value={repartidorInput}
                  onChange={(e) => setRepartidorInput(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              {/* Observaciones */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-500 block">
                  Observaciones de Entrega
                </label>
                <textarea
                  rows={2}
                  placeholder="Notas de entrega, persona que recibió, incidencias..."
                  value={observacionesInput}
                  onChange={(e) => setObservacionesInput(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCanjeSeleccionado(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xs shadow-2xs transition cursor-pointer"
                >
                  Guardar Cambios de Canje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
