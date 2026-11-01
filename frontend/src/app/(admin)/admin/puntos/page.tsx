"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Sparkles,
  Search,
  Filter,
  Plus,
  Minus,
  TrendingUp,
  Users,
  Gift,
  RefreshCw,
  Clock,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  X,
  Phone,
  Mail,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  Coins,
} from "lucide-react";

interface ClientePuntosAdmin {
  id: string;
  nombre: string;
  documento: string;
  email: string;
  telefono: string;
  distrito: string;
  nivel: "Oro" | "Plata" | "Bronce";
  saldoPuntos: number;
  puntosGanados: number;
  puntosCanjeados: number;
  ultimoMovimiento: string;
  fechaUltimoMovimiento: string;
  movimientos: {
    id: string;
    tipo: "ACUMULACION" | "CANJE" | "BONIFICACION" | "AJUSTE";
    puntos: number;
    motivo: string;
    fecha: string;
  }[];
}

// Dataset inicial realista de clientes con puntos
const CLIENTES_INICIALES: ClientePuntosAdmin[] = [
  {
    id: "cli-01",
    nombre: "Juan Carlos Pérez Gómez",
    documento: "45892147",
    email: "juan.perez@gmail.com",
    telefono: "987654321",
    distrito: "Los Olivos",
    nivel: "Oro",
    saldoPuntos: 2840,
    puntosGanados: 4200,
    puntosCanjeados: 1360,
    ultimoMovimiento: "Acreditación por compra balón 45kg",
    fechaUltimoMovimiento: "2026-10-19 18:30",
    movimientos: [
      { id: "m-1", tipo: "ACUMULACION", puntos: 400, motivo: "Compra Balón 45kg Industrial", fecha: "2026-10-19 18:30" },
      { id: "m-2", tipo: "CANJE", puntos: -250, motivo: "Canje Sartén Record Antiadherente", fecha: "2026-10-15 14:10" },
      { id: "m-3", tipo: "ACUMULACION", puntos: 100, motivo: "Compra Balón 10kg Premium", fecha: "2026-10-02 11:20" },
      { id: "m-4", tipo: "BONIFICACION", puntos: 150, motivo: "Bono Campaña Aniversario RappiGas", fecha: "2026-09-20 09:00" },
    ],
  },
  {
    id: "cli-02",
    nombre: "María Elena García Torres",
    documento: "41258963",
    email: "m.garcia@hotmail.com",
    telefono: "991234567",
    distrito: "San Martín de Porres",
    nivel: "Oro",
    saldoPuntos: 3200,
    puntosGanados: 3500,
    puntosCanjeados: 300,
    ultimoMovimiento: "Canje Vale de Descuento S/ 15",
    fechaUltimoMovimiento: "2026-10-18 16:45",
    movimientos: [
      { id: "m-5", tipo: "CANJE", puntos: -130, motivo: "Vale Descuento S/ 15 Balón Gas", fecha: "2026-10-18 16:45" },
      { id: "m-6", tipo: "ACUMULACION", puntos: 100, motivo: "Compra Balón 10kg Rosca", fecha: "2026-10-10 12:00" },
    ],
  },
  {
    id: "cli-03",
    nombre: "Carlos Alberto Rodríguez Silva",
    documento: "70258961",
    email: "carlos.rodriguez@outlook.com",
    telefono: "976543210",
    distrito: "Independencia",
    nivel: "Plata",
    saldoPuntos: 1450,
    puntosGanados: 1950,
    puntosCanjeados: 500,
    ultimoMovimiento: "Acreditación por compra balón 15kg",
    fechaUltimoMovimiento: "2026-10-17 10:15",
    movimientos: [
      { id: "m-7", tipo: "ACUMULACION", puntos: 150, motivo: "Compra Balón 15kg Premium", fecha: "2026-10-17 10:15" },
      { id: "m-8", tipo: "CANJE", puntos: -380, motivo: "Hervidor Eléctrico Imaco", fecha: "2026-09-28 15:30" },
    ],
  },
  {
    id: "cli-04",
    nombre: "Ana Lucía Torres Mendoza",
    documento: "48963251",
    email: "ana.torres@gmail.com",
    telefono: "984512369",
    distrito: "Miraflores",
    nivel: "Plata",
    saldoPuntos: 1890,
    puntosGanados: 2390,
    puntosCanjeados: 500,
    ultimoMovimiento: "Compra Balón 10kg Premium",
    fechaUltimoMovimiento: "2026-10-16 12:20",
    movimientos: [
      { id: "m-9", tipo: "ACUMULACION", puntos: 100, motivo: "Compra Balón 10kg Premium", fecha: "2026-10-16 12:20" },
    ],
  },
  {
    id: "cli-05",
    nombre: "Luis Fernando Mendoza Vega",
    documento: "42369874",
    email: "luis.mendoza@yahoo.es",
    telefono: "993652147",
    distrito: "San Juan de Lurigancho",
    nivel: "Plata",
    saldoPuntos: 890,
    puntosGanados: 1200,
    puntosCanjeados: 310,
    ultimoMovimiento: "Ajuste manual de fidelidad",
    fechaUltimoMovimiento: "2026-10-14 17:00",
    movimientos: [
      { id: "m-10", tipo: "AJUSTE", puntos: 50, motivo: "Compensación por demora en entrega", fecha: "2026-10-14 17:00" },
    ],
  },
  {
    id: "cli-06",
    nombre: "Rosa Isabel Quispe Mamani",
    documento: "71254896",
    email: "rosa.quispe@gmail.com",
    telefono: "981254789",
    distrito: "Callao",
    nivel: "Bronce",
    saldoPuntos: 220,
    puntosGanados: 320,
    puntosCanjeados: 100,
    ultimoMovimiento: "Compra Balón 10kg Premium",
    fechaUltimoMovimiento: "2026-10-12 11:00",
    movimientos: [
      { id: "m-11", tipo: "ACUMULACION", puntos: 100, motivo: "Compra Balón 10kg Premium", fecha: "2026-10-12 11:00" },
    ],
  },
  {
    id: "cli-07",
    nombre: "Jorge Armando Flores Rivas",
    documento: "44589632",
    email: "jorge.flores@empresa.pe",
    telefono: "972365418",
    distrito: "Surco",
    nivel: "Oro",
    saldoPuntos: 4150,
    puntosGanados: 6000,
    puntosCanjeados: 1850,
    ultimoMovimiento: "Canje Olla Arrocera Oster 1.8L",
    fechaUltimoMovimiento: "2026-10-10 19:20",
    movimientos: [
      { id: "m-12", tipo: "CANJE", puntos: -520, motivo: "Canje Olla Arrocera Oster 1.8L", fecha: "2026-10-10 19:20" },
      { id: "m-13", tipo: "ACUMULACION", puntos: 400, motivo: "Compra Balón 45kg Industrial", fecha: "2026-10-05 15:40" },
    ],
  },
  {
    id: "cli-08",
    nombre: "Carmen Rosa Morales Castro",
    documento: "43258974",
    email: "carmen.morales@hotmail.com",
    telefono: "998745123",
    distrito: "San Isidro",
    nivel: "Plata",
    saldoPuntos: 1100,
    puntosGanados: 1500,
    puntosCanjeados: 400,
    ultimoMovimiento: "Compra Balón 15kg Premium",
    fechaUltimoMovimiento: "2026-10-08 14:15",
    movimientos: [
      { id: "m-14", tipo: "ACUMULACION", puntos: 150, motivo: "Compra Balón 15kg Premium", fecha: "2026-10-08 14:15" },
    ],
  },
  {
    id: "cli-09",
    nombre: "David Chávez Huamán",
    documento: "72369854",
    email: "david.chavez@gmail.com",
    telefono: "985478963",
    distrito: "Arequipa",
    nivel: "Bronce",
    saldoPuntos: 90,
    puntosGanados: 90,
    puntosCanjeados: 0,
    ultimoMovimiento: "Bono bienvenida cliente nuevo",
    fechaUltimoMovimiento: "2026-10-05 09:30",
    movimientos: [
      { id: "m-15", tipo: "BONIFICACION", puntos: 90, motivo: "Bono de bienvenida registro RappiGas", fecha: "2026-10-05 09:30" },
    ],
  },
  {
    id: "cli-10",
    nombre: "Elena Patricia Ramos Salazar",
    documento: "46589741",
    email: "elena.ramos@outlook.com",
    telefono: "974125896",
    distrito: "Trujillo",
    nivel: "Plata",
    saldoPuntos: 650,
    puntosGanados: 850,
    puntosCanjeados: 200,
    ultimoMovimiento: "Compra Balón 10kg Premium",
    fechaUltimoMovimiento: "2026-10-02 16:10",
    movimientos: [
      { id: "m-16", tipo: "ACUMULACION", puntos: 100, motivo: "Compra Balón 10kg Premium", fecha: "2026-10-02 16:10" },
    ],
  },
  {
    id: "cli-11",
    nombre: "Roberto Carlos Díaz Paredes",
    documento: "45698712",
    email: "roberto.diaz@gmail.com",
    telefono: "986532147",
    distrito: "Chiclayo",
    nivel: "Oro",
    saldoPuntos: 2900,
    puntosGanados: 3900,
    puntosCanjeados: 1000,
    ultimoMovimiento: "Canje Freidora de Aire 3.5L",
    fechaUltimoMovimiento: "2026-09-28 11:45",
    movimientos: [
      { id: "m-17", tipo: "CANJE", puntos: -750, motivo: "Canje Freidora de Aire Imaco 3.5L", fecha: "2026-09-28 11:45" },
    ],
  },
  {
    id: "cli-12",
    nombre: "Lucía Paredes Vega",
    documento: "73258941",
    email: "lucia.paredes@gmail.com",
    telefono: "997412586",
    distrito: "Cusco",
    nivel: "Bronce",
    saldoPuntos: 48,
    puntosGanados: 128,
    puntosCanjeados: 80,
    ultimoMovimiento: "Vale Descuento S/ 10",
    fechaUltimoMovimiento: "2026-09-25 10:00",
    movimientos: [
      { id: "m-18", tipo: "CANJE", puntos: -80, motivo: "Vale Descuento S/ 10 Balón Gas", fecha: "2026-09-25 10:00" },
    ],
  },
];

export default function AdminPuntosClientesPage() {
  const [clientes, setClientes] = useState<ClientePuntosAdmin[]>(() => {
    if (typeof window !== "undefined") {
      const guardado = localStorage.getItem("rappigas_admin_clientes_puntos");
      if (guardado) {
        try {
          return JSON.parse(guardado);
        } catch {
          // fallback
        }
      }
    }
    return CLIENTES_INICIALES;
  });

  const [busqueda, setBusqueda] = useState("");
  const [filtroNivel, setFiltroNivel] = useState<string>("TODOS");
  const [orden, setOrden] = useState<"SALDO_DESC" | "SALDO_ASC" | "NOMBRE_ASC">("SALDO_DESC");

  // Modales
  const [clienteAjustar, setClienteAjustar] = useState<ClientePuntosAdmin | null>(null);
  const [tipoAjuste, setTipoAjuste] = useState<"SUMAR" | "RESTAR">("SUMAR");
  const [cantidadPuntos, setCantidadPuntos] = useState<number>(100);
  const [motivoAjuste, setMotivoAjuste] = useState<string>("Bonificación especial RappiGas");

  const [clienteHistorial, setClienteHistorial] = useState<ClientePuntosAdmin | null>(null);

  // Guardar cambios
  const guardarClientes = (nuevos: ClientePuntosAdmin[]) => {
    setClientes(nuevos);
    if (typeof window !== "undefined") {
      localStorage.setItem("rappigas_admin_clientes_puntos", JSON.stringify(nuevos));
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    const totalPuntosActivos = clientes.reduce((acc, c) => acc + c.saldoPuntos, 0);
    const totalPuntosGanados = clientes.reduce((acc, c) => acc + c.puntosGanados, 0);
    const totalPuntosCanjeados = clientes.reduce((acc, c) => acc + c.puntosCanjeados, 0);
    const oro = clientes.filter((c) => c.nivel === "Oro").length;
    const plata = clientes.filter((c) => c.nivel === "Plata").length;
    const bronce = clientes.filter((c) => c.nivel === "Bronce").length;

    return {
      totalPuntosActivos,
      totalPuntosGanados,
      totalPuntosCanjeados,
      totalClientes: clientes.length,
      oro,
      plata,
      bronce,
    };
  }, [clientes]);

  // Filtrado y ordenamiento
  const clientesFiltrados = useMemo(() => {
    return clientes
      .filter((c) => {
        if (filtroNivel !== "TODOS" && c.nivel !== filtroNivel) return false;
        if (busqueda.trim()) {
          const q = busqueda.toLowerCase().trim();
          const coincideNom = c.nombre.toLowerCase().includes(q);
          const coincideDoc = c.documento.includes(q);
          const coincideEma = c.email.toLowerCase().includes(q);
          const coincideTel = c.telefono.includes(q);
          const coincideDis = c.distrito.toLowerCase().includes(q);
          if (!coincideNom && !coincideDoc && !coincideEma && !coincideTel && !coincideDis) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (orden === "SALDO_DESC") return b.saldoPuntos - a.saldoPuntos;
        if (orden === "SALDO_ASC") return a.saldoPuntos - b.saldoPuntos;
        if (orden === "NOMBRE_ASC") return a.nombre.localeCompare(b.nombre);
        return 0;
      });
  }, [clientes, busqueda, filtroNivel, orden]);

  // Aplicar ajuste de puntos
  const handleGuardarAjuste = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteAjustar) return;

    const delta = tipoAjuste === "SUMAR" ? cantidadPuntos : -cantidadPuntos;
    const nuevoSaldo = Math.max(0, clienteAjustar.saldoPuntos + delta);
    const nuevoNivel: "Oro" | "Plata" | "Bronce" =
      nuevoSaldo >= 300 ? "Oro" : nuevoSaldo >= 100 ? "Plata" : "Bronce";

    const nuevoMovimiento = {
      id: `m-${Date.now()}`,
      tipo: (tipoAjuste === "SUMAR" ? "BONIFICACION" : "AJUSTE") as any,
      puntos: delta,
      motivo: motivoAjuste || "Ajuste manual administrativo",
      fecha: new Date().toISOString().replace("T", " ").substring(0, 16),
    };

    const actualizados = clientes.map((c) => {
      if (c.id === clienteAjustar.id) {
        return {
          ...c,
          saldoPuntos: nuevoSaldo,
          puntosGanados: delta > 0 ? c.puntosGanados + delta : c.puntosGanados,
          nivel: nuevoNivel,
          ultimoMovimiento: nuevoMovimiento.motivo,
          fechaUltimoMovimiento: nuevoMovimiento.fecha,
          movimientos: [nuevoMovimiento, ...c.movimientos],
        };
      }
      return c;
    });

    guardarClientes(actualizados);
    setClienteAjustar(null);
    setCantidadPuntos(100);
    setMotivoAjuste("Bonificación especial RappiGas");
  };

  return (
    <div className="w-full px-3 sm:px-5 py-3 space-y-3 text-xs text-slate-800">
      {/* =========================================================================
          CABECERA SUPER ADMIN: GESTIÓN DE PUNTOS Y FIDELIDAD (COMPACTA)
      ========================================================================= */}
      <div className="bg-gradient-to-r from-[#03246b] via-[#021b52] to-[#03246b] rounded-xl px-4 py-2.5 text-white shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-2xs shrink-0">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">
                Super Admin • Control de Fidelización
              </span>
              <span className="text-[10px] font-medium text-slate-300">
                Programa Nacional Zeta Premia
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-white leading-tight">
              Visualización y Gestión de Puntos de Clientes
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/puntos/configuracion"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs shadow-xs transition"
          >
            <Coins className="w-3.5 h-3.5 text-slate-950" />
            <span>Reglas y Equivalencias</span>
          </Link>

          <Link
            href="/admin/canjes"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-xs transition border border-white/20"
          >
            <Truck className="w-3.5 h-3.5 text-amber-300" />
            <span>Despacho de Canjes</span>
          </Link>

          <Link
            href="/admin/premios"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xs shadow-2xs transition"
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Administrar Premios</span>
          </Link>
        </div>
      </div>

      {/* =========================================================================
          KPIS DE FIDELIDAD (COMPACTOS EN 4 COLUMNAS)
      ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Puntos Activos
            </span>
            <span className="text-lg font-black text-orange-600 font-mono block leading-tight">
              {kpis.totalPuntosActivos.toLocaleString()} <span className="text-[10px] font-bold">PTS</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              {kpis.totalClientes} clientes en cartera
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shrink-0">
            <Sparkles className="w-4 h-4 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Total Canjeados
            </span>
            <span className="text-lg font-black text-emerald-600 font-mono block leading-tight">
              {kpis.totalPuntosCanjeados.toLocaleString()} <span className="text-[10px] font-bold">PTS</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              Canjes efectivos en catálogo
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <Gift className="w-4 h-4 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Histórico Ganados
            </span>
            <span className="text-lg font-black text-[#03246b] font-mono block leading-tight">
              {kpis.totalPuntosGanados.toLocaleString()} <span className="text-[10px] font-bold">PTS</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">
              Recargas de balones y bonos
            </span>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Niveles de Cartera
            </span>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-300">
                🥇 {kpis.oro}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-300">
                🥈 {kpis.plata}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-900 border border-orange-300">
                🥉 {kpis.bronce}
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
            <Award className="w-4 h-4 text-amber-600" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          BARRA DE CONTROL: BÚSQUEDA + FILTROS DE NIVEL + ORDEN (COMPACTA)
      ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, DNI, teléfono..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full text-xs pl-8 pr-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500 transition font-medium"
          />
        </div>

        {/* Filtros de Nivel */}
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-slate-400 text-[10px] font-bold mr-0.5">NIVEL:</span>
          {[
            { id: "TODOS", label: "Todos" },
            { id: "Oro", label: "🥇 Oro" },
            { id: "Plata", label: "🥈 Plata" },
            { id: "Bronce", label: "🥉 Bronce" },
          ].map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setFiltroNivel(n.id)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer border ${
                filtroNivel === n.id
                  ? "bg-[#03246b] text-white border-[#03246b] shadow-2xs"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {n.label}
            </button>
          ))}
        </div>

        {/* Ordenamiento */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[10px] font-bold">ORDEN:</span>
          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value as any)}
            className="text-[11px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 cursor-pointer focus:outline-hidden focus:border-orange-500"
          >
            <option value="SALDO_DESC">Mayor saldo</option>
            <option value="SALDO_ASC">Menor saldo</option>
            <option value="NOMBRE_ASC">Nombre (A - Z)</option>
          </select>
        </div>
      </div>

      {/* =========================================================================
          CUADRO / TABLA PRINCIPAL DE PUNTOS (ULTRA COMPACTA)
      ========================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[9px] font-black text-[#03246b] uppercase tracking-wider border-b border-slate-200">
                <th className="py-2 px-3">Cliente / Correo</th>
                <th className="py-2 px-2.5">DNI / Teléfono</th>
                <th className="py-2 px-2.5">Distrito</th>
                <th className="py-2 px-2 text-center">Nivel</th>
                <th className="py-2 px-3 text-right">Saldo Activo</th>
                <th className="py-2 px-2.5 text-right">Ganados / Canjeados</th>
                <th className="py-2 px-3">Último Movimiento</th>
                <th className="py-2 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 space-y-1">
                    <Users className="w-7 h-7 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-600 text-xs">No se encontraron clientes con los filtros aplicados</p>
                    <p className="text-[10px] text-slate-400">Intenta con otro término o seleccionando todos los niveles.</p>
                  </td>
                </tr>
              ) : (
                clientesFiltrados.map((cliente) => {
                  const badgeNivel =
                    cliente.nivel === "Oro"
                      ? "bg-amber-100 text-amber-900 border-amber-300"
                      : cliente.nivel === "Plata"
                      ? "bg-slate-100 text-slate-700 border-slate-300"
                      : "bg-orange-100 text-orange-900 border-orange-300";

                  return (
                    <tr key={cliente.id} className="hover:bg-slate-50/90 transition">
                      {/* Cliente */}
                      <td className="py-1.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-[#03246b] text-white font-black flex items-center justify-center shrink-0 text-[10px] shadow-2xs">
                            {cliente.nombre.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                            <span className="font-bold text-[#03246b] block text-[11px] truncate leading-tight" title={cliente.nombre}>
                              {cliente.nombre}
                            </span>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 truncate leading-tight">
                              <Mail className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{cliente.email}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* DNI / Teléfono */}
                      <td className="py-1.5 px-2.5 whitespace-nowrap">
                        <div className="leading-tight">
                          <span className="font-mono font-bold text-slate-700 block text-[11px]">DNI: {cliente.documento}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                            <Phone className="w-2.5 h-2.5 shrink-0" />
                            {cliente.telefono}
                          </span>
                        </div>
                      </td>

                      {/* Ubicación */}
                      <td className="py-1.5 px-2.5 whitespace-nowrap">
                        <span className="font-medium text-slate-600 text-[11px]">{cliente.distrito}</span>
                      </td>

                      {/* Nivel */}
                      <td className="py-1.5 px-2 text-center whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black border ${badgeNivel}`}>
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>{cliente.nivel}</span>
                        </span>
                      </td>

                      {/* Saldo Activo */}
                      <td className="py-1.5 px-3 text-right whitespace-nowrap">
                        <div className="leading-tight">
                          <span className="text-xs font-black text-orange-600 font-mono block">
                            {cliente.saldoPuntos.toLocaleString()} <span className="text-[10px] font-bold">PTS</span>
                          </span>
                          <span className="text-[9px] text-emerald-600 font-bold">Activo</span>
                        </div>
                      </td>

                      {/* Ganados / Canjeados */}
                      <td className="py-1.5 px-2.5 text-right whitespace-nowrap">
                        <div className="font-mono text-[10px] leading-tight">
                          <span className="text-emerald-600 font-bold block">
                            +{cliente.puntosGanados.toLocaleString()}
                          </span>
                          <span className="text-slate-400 block">
                            -{cliente.puntosCanjeados.toLocaleString()}
                          </span>
                        </div>
                      </td>

                      {/* Último Movimiento */}
                      <td className="py-1.5 px-3">
                        <div className="max-w-[210px] leading-tight">
                          <span className="font-medium text-slate-700 block text-[11px] truncate" title={cliente.ultimoMovimiento}>
                            {cliente.ultimoMovimiento}
                          </span>
                          <span className="text-[9px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 shrink-0" />
                            {cliente.fechaUltimoMovimiento}
                          </span>
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-1.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setClienteAjustar(cliente);
                              setTipoAjuste("SUMAR");
                              setCantidadPuntos(100);
                              setMotivoAjuste("Bonificación por fidelidad RappiGas");
                            }}
                            className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded text-[10px] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Ajustar o bonificar puntos"
                          >
                            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                            <span>Ajustar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setClienteHistorial(cliente)}
                            className="px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded text-[10px] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Ver historial de movimientos"
                          >
                            <FileText className="w-2.5 h-2.5 text-slate-500" />
                            <span>Historial</span>
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

        {/* Pie de tabla compacto */}
        <div className="bg-slate-50 px-3 py-1.5 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Mostrando <strong>{clientesFiltrados.length}</strong> de {clientes.length} clientes registrados
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Fidelidad RappiGas • Control Administrativo
          </span>
        </div>
      </div>

      {/* =========================================================================
          MODAL: AJUSTAR / BONIFICAR PUNTOS A UN CLIENTE (COMPACTO)
      ========================================================================= */}
      {clienteAjustar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 shadow-xl space-y-3 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-black text-xs text-[#03246b]">Ajustar / Bonificar Puntos</h3>
                  <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{clienteAjustar.nombre}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClienteAjustar(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleGuardarAjuste} className="space-y-3">
              {/* Resumen Actual */}
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Saldo Actual</span>
                  <span className="text-base font-black text-slate-800 font-mono">
                    {clienteAjustar.saldoPuntos} PTS
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Nivel</span>
                  <span className="text-[10px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    {clienteAjustar.nivel}
                  </span>
                </div>
              </div>

              {/* Acción: Sumar o Restar */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-500 block">
                  Tipo de Operación
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipoAjuste("SUMAR")}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-black border transition flex items-center justify-center gap-1 cursor-pointer ${
                      tipoAjuste === "SUMAR"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Plus className="w-3 h-3" />
                    <span>Bonificar / Sumar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoAjuste("RESTAR")}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-black border transition flex items-center justify-center gap-1 cursor-pointer ${
                      tipoAjuste === "RESTAR"
                        ? "bg-red-600 text-white border-red-600 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Minus className="w-3 h-3" />
                    <span>Deducir / Restar</span>
                  </button>
                </div>
              </div>

              {/* Cantidad de Puntos */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-500 block">
                  Cantidad de Puntos
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={10000}
                    value={cantidadPuntos}
                    onChange={(e) => setCantidadPuntos(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full text-sm font-black font-mono px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                    PTS
                  </span>
                </div>
              </div>

              {/* Motivo o Justificación */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-500 block">
                  Motivo / Justificación
                </label>
                <input
                  type="text"
                  placeholder="Ej: Bonificación especial, compensación..."
                  value={motivoAjuste}
                  onChange={(e) => setMotivoAjuste(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-orange-500"
                  required
                />
              </div>

              {/* Previsualización del Saldo Resultante */}
              <div className="p-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-950 flex items-center justify-between text-[11px] font-bold">
                <span>Saldo Resultante:</span>
                <span className="text-xs font-mono font-black text-orange-700">
                  {Math.max(0, clienteAjustar.saldoPuntos + (tipoAjuste === "SUMAR" ? cantidadPuntos : -cantidadPuntos))}{" "}
                  PTS
                </span>
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setClienteAjustar(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xs shadow-2xs transition cursor-pointer"
                >
                  Guardar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: HISTORIAL DETALLADO DE MOVIMIENTOS DEL CLIENTE (COMPACTO)
      ========================================================================= */}
      {clienteHistorial && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 shadow-xl space-y-3 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#03246b] text-white flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-black text-xs text-[#03246b]">Historial de Fidelidad</h3>
                  <p className="text-[10px] text-slate-400">{clienteHistorial.nombre} (DNI: {clienteHistorial.documento})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setClienteHistorial(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-[9px] uppercase font-bold text-slate-400 block">Saldo Actual</span>
                <span className="font-mono font-black text-orange-600 text-xs">{clienteHistorial.saldoPuntos} PTS</span>
              </div>
              <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <span className="text-[9px] uppercase font-bold text-emerald-700 block">Total Ganados</span>
                <span className="font-mono font-black text-emerald-800 text-xs">+{clienteHistorial.puntosGanados} PTS</span>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                <span className="text-[9px] uppercase font-bold text-blue-700 block">Canjeados</span>
                <span className="font-mono font-black text-blue-800 text-xs">-{clienteHistorial.puntosCanjeados} PTS</span>
              </div>
            </div>

            {/* Listado de Movimientos */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              <span className="text-[9px] font-bold uppercase text-slate-400 block">Movimientos Registrados</span>
              {clienteHistorial.movimientos.map((mov) => {
                const esPositivo = mov.puntos > 0;
                return (
                  <div
                    key={mov.id}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          esPositivo ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {esPositivo ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 block text-[11px] truncate">{mov.motivo}</span>
                        <span className="text-[9px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {mov.fecha}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`font-mono font-black text-xs shrink-0 ${
                        esPositivo ? "text-emerald-600" : "text-orange-600"
                      }`}
                    >
                      {esPositivo ? `+${mov.puntos}` : mov.puntos} PTS
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setClienteHistorial(null)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
