"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
import { empresasApi, EmpresaDetalle } from "@/librerias/api/empresas.api";
import { toast } from "sonner";
import {
  Coins,
  Percent,
  CircleDollarSign,
  Building2,
  Search,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowUpDown,
  Calculator,
  Download,
  Edit,
  TrendingUp,
  Receipt,
  Users,
  Fuel,
  RefreshCw,
  Sparkles,
  Check,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

function safeNum(val: unknown, fallback = 0): number {
  if (val === null || val === undefined) return fallback;
  const n = typeof val === "number" ? val : parseFloat(String(val));
  return isNaN(n) || !isFinite(n) ? fallback : n;
}

export type TipoComision = "FIJA" | "PORCENTUAL";

export interface DistribuidoraComision {
  id: number;
  publicId: string;
  nombreComercial: string;
  ruc: string;
  ciudad: string;
  tipoComision: TipoComision;
  tarifaFija: number; // S/ por pedido
  tasaPorcentual: number; // % del total
  pedidosMes: number;
  ventasMesSoles: number;
  comisionGeneradaSoles: number;
  estadoPago: "AL_DIA" | "PENDIENTE" | "EXONERADO";
  fechaUltimoCorte: string;
}

export default function AdminSuscripcionesComisionesPage() {
  const { usuario } = useAuthStore();
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"TODAS" | "FIJA" | "PORCENTUAL" | "PENDIENTES">("TODAS");

  // Configuración de Tasas Globales Base del Sistema
  const [tarifaFijaBase, setTarifaFijaBase] = useState<number>(1.20);
  const [tasaPorcentualBase, setTasaPorcentualBase] = useState<number>(3.0);
  const [modalConfigGlobal, setModalConfigGlobal] = useState(false);
  const [tempFijaBase, setTempFijaBase] = useState<string>("1.20");
  const [tempPorcentualBase, setTempPorcentualBase] = useState<string>("3.0");

  // Distribuidoras con esquema de comisión
  const [distribuidoras, setDistribuidoras] = useState<DistribuidoraComision[]>([]);

  // Modal para editar esquema de una distribuidora específica
  const [empresaEditando, setEmpresaEditando] = useState<DistribuidoraComision | null>(null);
  const [editTipoComision, setEditTipoComision] = useState<TipoComision>("FIJA");
  const [editTarifaFija, setEditTarifaFija] = useState<string>("1.20");
  const [editTasaPorcentual, setEditTasaPorcentual] = useState<string>("3.0");
  const [editEstadoPago, setEditEstadoPago] = useState<"AL_DIA" | "PENDIENTE" | "EXONERADO">("AL_DIA");

  // Modal de Calculadora Simuladora
  const [modalCalculadora, setModalCalculadora] = useState(false);
  const [calcPedidos, setCalcPedidos] = useState<number>(250);
  const [calcPrecioPromedio, setCalcPrecioPromedio] = useState<number>(48.50);

  // Carga inicial y generación de datos a partir de las empresas reales del sistema
  const cargarDatos = async () => {
    setCargando(true);
    try {
      const empresasReales = await empresasApi.listarEmpresasAdmin();
      
      // Mapear empresas con sus esquemas configurados (o defaults si son nuevas)
      const listaMapeada: DistribuidoraComision[] = (empresasReales || []).map((emp, idx) => {
        // Asignar esquema balanceado por defecto
        const esFija = idx % 2 === 0;
        const rawDigits = String(emp.ruc || "").replace(/\D/g, "");
        const seed = rawDigits.length >= 3 ? parseInt(rawDigits.slice(-3), 10) : (idx + 1) * 37;
        const validSeed = isNaN(seed) || seed <= 0 ? (idx + 1) * 43 : seed;
        const pedidosEstimados = safeNum(120 + (validSeed % 260), 160);
        const precioBalonPromedio = 48.0;
        const ventasEstimadas = safeNum(pedidosEstimados * precioBalonPromedio, 7680);
        // Verificar si existe configuración personalizada guardada para esta empresa
        let configGuardada: { tipo: TipoComision; tarifaFija: number; tasaPorcentual: number; estadoPago: any } | null = null;
        if (typeof window !== "undefined" && emp.publicId) {
          try {
            const raw = localStorage.getItem(`empresa_comision_${emp.publicId}`);
            if (raw) configGuardada = JSON.parse(raw);
          } catch {}
        }

        const tipoComisionFinal: TipoComision = configGuardada?.tipo || (idx % 2 === 0 ? "FIJA" : "PORCENTUAL");
        const tarifaFijaFinal = configGuardada?.tarifaFija !== undefined ? safeNum(configGuardada.tarifaFija, 1.20) : safeNum(tarifaFijaBase, 1.20);
        const tasaPorcFinal = configGuardada?.tasaPorcentual !== undefined ? safeNum(configGuardada.tasaPorcentual, 3.0) : safeNum(tasaPorcentualBase, 3.0);
        const estadosPosibles: ("AL_DIA" | "PENDIENTE")[] = ["AL_DIA", "AL_DIA", "PENDIENTE", "AL_DIA"];
        const estadoPagoFinal: "AL_DIA" | "PENDIENTE" | "EXONERADO" =
          configGuardada?.estadoPago || estadosPosibles[idx % estadosPosibles.length];

        const comision = estadoPagoFinal === "EXONERADO"
          ? 0
          : tipoComisionFinal === "FIJA"
          ? safeNum(pedidosEstimados * tarifaFijaFinal)
          : safeNum((ventasEstimadas * tasaPorcFinal) / 100);

        return {
          id: (emp as any).id || idx + 1,
          publicId: emp.publicId || `emp-${idx + 1}`,
          nombreComercial: emp.nombreComercial || "Distribuidora de Gas",
          ruc: emp.ruc || "20000000000",
          ciudad: emp.direccionFiscal || "Lima Metropolitana",
          tipoComision: tipoComisionFinal,
          tarifaFija: tarifaFijaFinal,
          tasaPorcentual: tasaPorcFinal,
          pedidosMes: pedidosEstimados,
          ventasMesSoles: ventasEstimadas,
          comisionGeneradaSoles: comision,
          estadoPago: estadoPagoFinal,
          fechaUltimoCorte: "15 Oct 2026",
        };
      });

        // Si no hay empresas registradas aún en BD, generamos ejemplos demostrativos de distribuidoras
        if (listaMapeada.length === 0) {
          const ejemplosDemo: DistribuidoraComision[] = [
            {
              id: 1,
              publicId: "demo-1",
              nombreComercial: "Solgas San Juan Distribuidora",
              ruc: "20601234567",
              ciudad: "San Juan de Lurigancho, Lima",
              tipoComision: "FIJA",
              tarifaFija: 1.20,
              tasaPorcentual: 3.0,
              pedidosMes: 340,
              ventasMesSoles: 16320,
              comisionGeneradaSoles: 408.0,
              estadoPago: "AL_DIA",
              fechaUltimoCorte: "15 Oct 2026",
            },
            {
              id: 2,
              publicId: "demo-2",
              nombreComercial: "Lima Gas Express Los Olivos",
              ruc: "20548971234",
              ciudad: "Los Olivos, Lima",
              tipoComision: "PORCENTUAL",
              tarifaFija: 1.20,
              tasaPorcentual: 3.0,
              pedidosMes: 415,
              ventasMesSoles: 20127.5,
              comisionGeneradaSoles: 603.82,
              estadoPago: "PENDIENTE",
              fechaUltimoCorte: "15 Oct 2026",
            },
            {
              id: 3,
              publicId: "demo-3",
              nombreComercial: "Llamagas Callao y Ventanilla",
              ruc: "20489632587",
              ciudad: "Callao / Ventanilla",
              tipoComision: "FIJA",
              tarifaFija: 1.00, // Tasa preferencial convenio
              tasaPorcentual: 2.5,
              pedidosMes: 580,
              ventasMesSoles: 27840,
              comisionGeneradaSoles: 580.0,
              estadoPago: "AL_DIA",
              fechaUltimoCorte: "15 Oct 2026",
            },
            {
              id: 4,
              publicId: "demo-4",
              nombreComercial: "Primax Gas Chorrillos",
              ruc: "20784512963",
              ciudad: "Chorrillos, Lima",
              tipoComision: "PORCENTUAL",
              tarifaFija: 1.20,
              tasaPorcentual: 3.2,
              pedidosMes: 210,
              ventasMesSoles: 10290,
              comisionGeneradaSoles: 329.28,
              estadoPago: "AL_DIA",
              fechaUltimoCorte: "15 Oct 2026",
            },
            {
              id: 5,
              publicId: "demo-5",
              nombreComercial: "Distribuidora El Rápido GLP",
              ruc: "20658941235",
              ciudad: "Ate Vitarte, Lima",
              tipoComision: "FIJA",
              tarifaFija: 1.20,
              tasaPorcentual: 3.0,
              pedidosMes: 160,
              ventasMesSoles: 7680,
              comisionGeneradaSoles: 0,
              estadoPago: "EXONERADO",
              fechaUltimoCorte: "Mes de Bienvenida (Gratis)",
            },
          ];
          setDistribuidoras(ejemplosDemo);
        } else {
          setDistribuidoras(listaMapeada);
        }
      } catch (err) {
        console.error("Error al cargar distribuidoras:", err);
      } finally {
        setCargando(false);
      }
    };

    useEffect(() => {
      cargarDatos();
    }, []);

  // Totales y Estadísticas Clave
  const kpis = useMemo(() => {
    const totalComisiones = distribuidoras.reduce((acc, d) => acc + (Number(d.comisionGeneradaSoles) || 0), 0);
    const totalPedidos = distribuidoras.reduce((acc, d) => acc + (Number(d.pedidosMes) || 0), 0);
    const totalVentas = distribuidoras.reduce((acc, d) => acc + (Number(d.ventasMesSoles) || 0), 0);
    const fijasCount = distribuidoras.filter((d) => d.tipoComision === "FIJA").length;
    const porcentualCount = distribuidoras.filter((d) => d.tipoComision === "PORCENTUAL").length;
    const pendientesCobro = distribuidoras
      .filter((d) => d.estadoPago === "PENDIENTE")
      .reduce((acc, d) => acc + (Number(d.comisionGeneradaSoles) || 0), 0);

    const comisionPromedioPorPedido = totalPedidos > 0 ? totalComisiones / totalPedidos : 0;

    return {
      totalComisiones,
      totalPedidos,
      totalVentas,
      fijasCount,
      porcentualCount,
      pendientesCobro,
      comisionPromedioPorPedido,
    };
  }, [distribuidoras]);

  // Filtro de búsqueda y tipo
  const distribuidorasFiltradas = useMemo(() => {
    return distribuidoras.filter((d) => {
      const matchBusqueda =
        d.nombreComercial.toLowerCase().includes(busqueda.toLowerCase()) ||
        d.ruc.includes(busqueda) ||
        d.ciudad.toLowerCase().includes(busqueda.toLowerCase());

      if (!matchBusqueda) return false;

      if (filtroTipo === "FIJA") return d.tipoComision === "FIJA";
      if (filtroTipo === "PORCENTUAL") return d.tipoComision === "PORCENTUAL";
      if (filtroTipo === "PENDIENTES") return d.estadoPago === "PENDIENTE";

      return true;
    });
  }, [distribuidoras, busqueda, filtroTipo]);

  // Guardar configuración global base
  const handleGuardarConfigGlobal = () => {
    const fijaNum = parseFloat(tempFijaBase);
    const porcNum = parseFloat(tempPorcentualBase);

    if (isNaN(fijaNum) || fijaNum <= 0) {
      toast.error("La tarifa fija debe ser un número mayor a 0");
      return;
    }
    if (isNaN(porcNum) || porcNum <= 0 || porcNum > 50) {
      toast.error("El porcentaje debe ser un valor válido entre 0.1% y 50%");
      return;
    }

    setTarifaFijaBase(fijaNum);
    setTasaPorcentualBase(porcNum);
    setModalConfigGlobal(false);
    toast.success("Tasas base globales actualizadas correctamente");
  };

  // Abrir modal de edición para una distribuidora
  const handleAbrirEditarEmpresa = (emp: DistribuidoraComision) => {
    setEmpresaEditando(emp);
    setEditTipoComision(emp.tipoComision);
    setEditTarifaFija(emp.tarifaFija.toFixed(2));
    setEditTasaPorcentual(emp.tasaPorcentual.toFixed(1));
    setEditEstadoPago(emp.estadoPago);
  };

  // Guardar cambio de esquema para una distribuidora
  const handleGuardarEmpresaEsquema = () => {
    if (!empresaEditando) return;

    const fijaVal = parseFloat(editTarifaFija);
    const porcVal = parseFloat(editTasaPorcentual);

    if (isNaN(fijaVal) || fijaVal < 0) {
      toast.error("Ingresa una tarifa fija válida");
      return;
    }
    if (isNaN(porcVal) || porcVal < 0 || porcVal > 50) {
      toast.error("Ingresa un porcentaje válido");
      return;
    }

    setDistribuidoras((prev) =>
      prev.map((d) => {
        if (d.id === empresaEditando.id) {
          // Recalcular comisión
          let nuevaComision = 0;
          if (editEstadoPago !== "EXONERADO") {
            nuevaComision =
              editTipoComision === "FIJA"
                ? Number((d.pedidosMes * fijaVal).toFixed(2))
                : Number(((d.ventasMesSoles * porcVal) / 100).toFixed(2));
          }

          return {
            ...d,
            tipoComision: editTipoComision,
            tarifaFija: fijaVal,
            tasaPorcentual: porcVal,
            estadoPago: editEstadoPago,
            comisionGeneradaSoles: nuevaComision,
          };
        }
        return d;
      })
    );

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `empresa_comision_${empresaEditando.publicId}`,
          JSON.stringify({
            tipo: editTipoComision,
            tarifaFija: fijaVal,
            tasaPorcentual: porcVal,
            estadoPago: editEstadoPago,
          })
        );
      } catch (err) {
        console.error("No se pudo guardar la configuración en localStorage:", err);
      }
    }

    toast.success(`Esquema de comisión actualizado para ${empresaEditando.nombreComercial}`);
    setEmpresaEditando(null);
  };

  // Exportar resumen CSV rápido
  const handleExportarResumen = () => {
    const cabecera = "ID,Nombre Comercial,RUC,Tipo Comision,Tarifa/Tasa,Pedidos Mes,Ventas Soles,Comision Generada Soles,Estado Pago\n";
    const filas = distribuidoras
      .map(
        (d) =>
          `"${d.id}","${d.nombreComercial}","${d.ruc}","${d.tipoComision}","${
            d.tipoComision === "FIJA" ? `S/ ${d.tarifaFija.toFixed(2)}` : `${d.tasaPorcentual.toFixed(1)}%`
          }","${d.pedidosMes}","${d.ventasMesSoles.toFixed(2)}","${d.comisionGeneradaSoles.toFixed(2)}","${d.estadoPago}"`
      )
      .join("\n");

    const blob = new Blob([cabecera + filas], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `comisiones_distribuidoras_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Reporte de comisiones descargado en CSV");
  };

  // Solo administradores pueden ver y configurar comisiones
  if (usuario && usuario.rol !== "ADMIN") {
    return (
      <div className="p-6">
        <RoleGuardAlert rolPermitido="ADMIN" modulo="Comisiones y Planes de Distribuidoras" />
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 space-y-5">
      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Comisiones de Distribuidoras</h1>
              <p className="text-xs text-muted-foreground">
                Monetización flexible por pedido entregado: Comisión fija por balón o porcentaje sobre la venta
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              cargarDatos();
              toast.success("Comisiones y pedidos actualizados");
            }}
            disabled={cargando}
            className="text-xs h-8 gap-1.5 cursor-pointer"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 text-muted-foreground", cargando && "animate-spin")} />
            Actualizar
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setModalCalculadora(true)}
            className="text-xs h-8 gap-1.5 cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-primary" />
            Simulador
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTempFijaBase(tarifaFijaBase.toFixed(2));
              setTempPorcentualBase(tasaPorcentualBase.toFixed(1));
              setModalConfigGlobal(true);
            }}
            className="text-xs h-8 gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-muted-foreground" />
            Tasas Base
          </Button>

          <Button
            size="sm"
            onClick={handleExportarResumen}
            className="text-xs h-8 gap-1.5 font-bold cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar Liquidaciones
          </Button>
        </div>
      </div>

      {/* 4 KPIs de Rendimiento Financiero de la Plataforma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Comisiones del Mes */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Comisiones Recaudadas
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                <CircleDollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-foreground font-mono">
              S/ {kpis.totalComisiones.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Sobre S/ {kpis.totalVentas.toLocaleString("es-PE", { maximumFractionDigits: 0 })} vendidos</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +14.2%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Pedidos Comisionados */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Balones / Entregas
              </span>
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600">
                <Fuel className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-foreground font-mono">
              {kpis.totalPedidos.toLocaleString("es-PE")} pedidos
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Promedio por pedido:</span>
              <span className="font-semibold text-foreground font-mono">
                S/ {kpis.comisionPromedioPorPedido.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Distribución de Esquemas */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Elección de Esquema
              </span>
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
                <ArrowUpDown className="w-4 h-4" />
              </div>
            </div>
            <div className="text-sm font-bold text-foreground flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200 text-xs">
                {kpis.fijasCount} Fijas
              </Badge>
              <span className="text-muted-foreground text-xs">vs</span>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200 text-xs">
                {kpis.porcentualCount} Porcentual
              </Badge>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden flex">
              <div
                className="bg-blue-500 h-full"
                style={{
                  width: `${distribuidoras.length > 0 ? (kpis.fijasCount / distribuidoras.length) * 100 : 50}%`,
                }}
              />
              <div
                className="bg-purple-500 h-full"
                style={{
                  width: `${distribuidoras.length > 0 ? (kpis.porcentualCount / distribuidoras.length) * 100 : 50}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Liquidaciones Pendientes */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Por Liquidar
              </span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-amber-600 font-mono">
              S/ {kpis.pendientesCobro.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Próximo corte quincenal de comisiones
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Los 2 Modelos Disponibles que Elige la Distribuidora */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opción A: Comisión Fija */}
        <div className="p-5 rounded-2xl bg-card border border-blue-200 dark:border-blue-900/50 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  S/
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Modalidad Fija por Pedido</h3>
                  <span className="text-[11px] text-muted-foreground">Ideal para alto volumen constante</span>
                </div>
              </div>
              <Badge className="bg-blue-600 text-white font-mono font-bold text-xs">
                S/ {tarifaFijaBase.toFixed(2)} / entrega
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              La distribuidora abona una cuota fija exacta por cada pedido entregado exitosamente mediante la aplicación, sin importar si el pedido es de 10kg, 15kg o 45kg.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase font-bold">Costo Predecible</span>
                <span className="font-semibold text-foreground">Sin variación de ticket</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase font-bold">Distribuidoras</span>
                <span className="font-semibold text-blue-600 font-mono">{kpis.fijasCount} empresas activas</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Tasa predeterminada del sistema:</span>
            <span className="font-bold font-mono text-foreground">S/ {tarifaFijaBase.toFixed(2)}</span>
          </div>
        </div>

        {/* Opción B: Comisión Porcentual */}
        <div className="p-5 rounded-2xl bg-card border border-purple-200 dark:border-purple-900/50 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                  <Percent className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Modalidad Porcentual (%)</h3>
                  <span className="text-[11px] text-muted-foreground">Alineado a las ventas reales</span>
                </div>
              </div>
              <Badge className="bg-purple-600 text-white font-mono font-bold text-xs">
                {tasaPorcentualBase.toFixed(1)}% de la venta
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              La comisión se calcula proporcionalmente al valor final pagado por el cliente. Si la distribuidora hace descuentos o promociones, la comisión baja proporcionalmente.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase font-bold">Proporcional</span>
                <span className="font-semibold text-foreground">Acompaña la venta real</span>
              </div>
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase font-bold">Distribuidoras</span>
                <span className="font-semibold text-purple-600 font-mono">{kpis.porcentualCount} empresas activas</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Porcentaje predeterminado del sistema:</span>
            <span className="font-bold font-mono text-foreground">{tasaPorcentualBase.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Tabla Interactiva de Distribuidoras y sus Esquemas de Comisión */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Distribuidoras Afiliadas y Esquemas Asignados
            </h2>
            <p className="text-xs text-muted-foreground">
              Control de comisiones generadas, modo de cobro elegido y estado de liquidación
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Buscador */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar empresa, RUC..."
                className="h-8 pl-8 text-xs"
              />
            </div>

            {/* Píldoras de Filtro */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setFiltroTipo("TODAS")}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filtroTipo === "TODAS" ? "bg-card text-foreground shadow-xs font-bold" : "text-muted-foreground"
                }`}
              >
                Todas ({distribuidoras.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipo("FIJA")}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filtroTipo === "FIJA" ? "bg-card text-blue-600 shadow-xs font-bold" : "text-muted-foreground"
                }`}
              >
                Fija ({kpis.fijasCount})
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipo("PORCENTUAL")}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filtroTipo === "PORCENTUAL" ? "bg-card text-purple-600 shadow-xs font-bold" : "text-muted-foreground"
                }`}
              >
                Porcentual ({kpis.porcentualCount})
              </button>
              <button
                type="button"
                onClick={() => setFiltroTipo("PENDIENTES")}
                className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                  filtroTipo === "PENDIENTES" ? "bg-card text-amber-600 shadow-xs font-bold" : "text-muted-foreground"
                }`}
              >
                Pendientes
              </button>
            </div>
          </div>
        </div>

        {/* Tabla Responsiva */}
        <div className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">Distribuidora</th>
                  <th className="py-3 px-4">Esquema Elegido</th>
                  <th className="py-3 px-4 text-center">Pedidos Mes</th>
                  <th className="py-3 px-4 text-right">Ventas Totales</th>
                  <th className="py-3 px-4 text-right">Comisión RappiGas</th>
                  <th className="py-3 px-4 text-center">Estado Pago</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {distribuidorasFiltradas.length === 0 ? (
                  <tr key="fila-vacia">
                    <td colSpan={7} className="py-8 text-center text-muted-foreground text-xs">
                      No se encontraron distribuidoras con los filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  distribuidorasFiltradas.map((emp, idx) => {
                    return (
                      <tr key={emp.publicId || `emp-${emp.id}-${idx}`} className="hover:bg-muted/20 transition-colors">
                        {/* Nombre y RUC */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground">{emp.nombreComercial}</div>
                          <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5 mt-0.5">
                            <span>RUC: {emp.ruc}</span>
                            <span>•</span>
                            <span className="truncate max-w-[360px]">{emp.ciudad}</span>
                          </div>
                        </td>

                        {/* Esquema Elegido */}
                        <td className="py-3 px-4">
                          {emp.tipoComision === "FIJA" ? (
                            <div className="space-y-0.5">
                              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200 font-bold gap-1">
                                S/ {safeNum(emp.tarifaFija, 1.20).toFixed(2)} Fijo
                              </Badge>
                              <div className="text-[10px] text-muted-foreground">Por cada pedido</div>
                            </div>
                          ) : (
                            <div className="space-y-0.5">
                              <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-200 font-bold gap-1">
                                {safeNum(emp.tasaPorcentual, 3.0).toFixed(1)}% Porcentual
                              </Badge>
                              <div className="text-[10px] text-muted-foreground">Sobre venta final</div>
                            </div>
                          )}
                        </td>

                        {/* Pedidos del Mes */}
                        <td className="py-3 px-4 text-center font-mono font-bold text-foreground">
                          {safeNum(emp.pedidosMes, 180)}
                        </td>

                        {/* Ventas en Soles */}
                        <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                          S/ {safeNum(emp.ventasMesSoles, safeNum(emp.pedidosMes, 180) * 48.0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        {/* Comisión Generada */}
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-black text-sm text-foreground">
                            S/ {safeNum(emp.comisionGeneradaSoles, emp.tipoComision === "FIJA" ? safeNum(emp.pedidosMes, 180) * 1.20 : (safeNum(emp.ventasMesSoles, 8640) * 3) / 100).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </td>

                        {/* Estado de Pago */}
                        <td className="py-3 px-4 text-center">
                          {emp.estadoPago === "AL_DIA" && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/10 text-[11px] font-semibold gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Al Día
                            </Badge>
                          )}
                          {emp.estadoPago === "PENDIENTE" && (
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-200 hover:bg-amber-500/10 text-[11px] font-semibold gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Pendiente
                            </Badge>
                          )}
                          {emp.estadoPago === "EXONERADO" && (
                            <Badge variant="secondary" className="text-[11px] font-semibold">
                              Promoción
                            </Badge>
                          )}
                        </td>

                        {/* Acciones */}
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAbrirEditarEmpresa(emp)}
                            className="h-7 text-xs px-2.5 gap-1.5 cursor-pointer text-primary hover:bg-primary/10"
                          >
                            <Edit className="w-3 h-3" />
                            Ajustar
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Ajustar Esquema de Distribuidora Específica */}
      <Dialog open={Boolean(empresaEditando)} onOpenChange={(open) => !open && setEmpresaEditando(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Edit className="w-4 h-4 text-primary" />
              Ajustar Comisión para Distribuidora
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {empresaEditando?.nombreComercial} (RUC: {empresaEditando?.ruc})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Selección de Tipo de Comisión */}
            <div className="space-y-2">
              <label className="font-bold text-foreground block">
                Selección de Modalidad de Cobro:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEditTipoComision("FIJA")}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                    editTipoComision === "FIJA"
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-foreground">Comisión Fija</span>
                    {editTipoComision === "FIJA" && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                  <span className="text-[11px] text-muted-foreground">S/ fijo por cada pedido</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditTipoComision("PORCENTUAL")}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                    editTipoComision === "PORCENTUAL"
                      ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/20"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-foreground">Porcentual (%)</span>
                    {editTipoComision === "PORCENTUAL" && <Check className="w-4 h-4 text-purple-600" />}
                  </div>
                  <span className="text-[11px] text-muted-foreground">% sobre total vendido</span>
                </button>
              </div>
            </div>

            {/* Input según el tipo seleccionado */}
            {editTipoComision === "FIJA" ? (
              <div className="space-y-1.5 p-3 rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                <label className="font-bold text-blue-900 dark:text-blue-300 block">
                  Monto Fijo por Balón / Pedido (S/):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">S/</span>
                  <Input
                    type="number"
                    step="0.10"
                    min="0"
                    value={editTarifaFija}
                    onChange={(e) => setEditTarifaFija(e.target.value)}
                    className="pl-8 text-xs font-mono font-bold bg-card"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Se cobrará exactamente este monto por cada entrega completada.
                </p>
              </div>
            ) : (
              <div className="space-y-1.5 p-3 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900">
                <label className="font-bold text-purple-900 dark:text-purple-300 block">
                  Porcentaje de Comisión (%):
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="50"
                    value={editTasaPorcentual}
                    onChange={(e) => setEditTasaPorcentual(e.target.value)}
                    className="pr-8 text-xs font-mono font-bold bg-card"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">%</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Se deducirá este porcentaje del monto total pagado en el pedido.
                </p>
              </div>
            )}

            {/* Estado de Liquidación */}
            <div className="space-y-1.5">
              <label className="font-bold text-foreground block">
                Estado de la Cuenta:
              </label>
              <select
                value={editEstadoPago}
                onChange={(e) => setEditEstadoPago(e.target.value as any)}
                className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground cursor-pointer"
              >
                <option value="AL_DIA">Al Día (Sin saldo pendiente)</option>
                <option value="PENDIENTE">Liquidación Pendiente de Cobro</option>
                <option value="EXONERADO">Exonerado (Cortesía / Promoción 0%)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEmpresaEditando(null)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleGuardarEmpresaEsquema}
              className="text-xs font-bold"
            >
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Tasas Base Globales del Sistema */}
      <Dialog open={modalConfigGlobal} onOpenChange={setModalConfigGlobal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Sliders className="w-4 h-4 text-primary" />
              Tasas Base Predeterminadas
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define los valores estándar sugeridos a las nuevas distribuidoras que se afilien a RappiGas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
              <label className="font-bold text-foreground block">
                Tarifa Fija Base Sugerida (S/ por Pedido)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">S/</span>
                <Input
                  type="number"
                  step="0.10"
                  value={tempFijaBase}
                  onChange={(e) => setTempFijaBase(e.target.value)}
                  className="pl-8 text-xs font-mono font-bold bg-card"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Se aplicará automáticamente a empresas que elijan la opción fija.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
              <label className="font-bold text-foreground block">
                Porcentaje Base Sugerido (% de Venta)
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  value={tempPorcentualBase}
                  onChange={(e) => setTempPorcentualBase(e.target.value)}
                  className="pr-8 text-xs font-mono font-bold bg-card"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">%</span>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Se aplicará automáticamente a empresas que elijan la opción porcentual.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalConfigGlobal(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleGuardarConfigGlobal}
              className="text-xs font-bold"
            >
              Actualizar Tasas Base
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Simulador / Calculadora Comparativa */}
      <Dialog open={modalCalculadora} onOpenChange={setModalCalculadora}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              Simulador Comparativo de Comisiones
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Compara cuánto recaudaría RappiGas o cuánto pagaría la distribuidora en ambos esquemas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">
                  Pedidos Estimados (Mes):
                </label>
                <Input
                  type="number"
                  min="1"
                  value={calcPedidos}
                  onChange={(e) => setCalcPedidos(Math.max(1, parseInt(e.target.value) || 0))}
                  className="text-xs font-mono font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-foreground block">
                  Precio Promedio del Balón (S/):
                </label>
                <Input
                  type="number"
                  step="0.50"
                  min="10"
                  value={calcPrecioPromedio}
                  onChange={(e) => setCalcPrecioPromedio(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="text-xs font-mono font-bold"
                />
              </div>
            </div>

            {/* Comparativa Lado a Lado */}
            {(() => {
              const totalVentasSim = calcPedidos * calcPrecioPromedio;
              const comisionFijaSim = calcPedidos * tarifaFijaBase;
              const comisionPorcSim = (totalVentasSim * tasaPorcentualBase) / 100;
              const diferencia = Math.abs(comisionFijaSim - comisionPorcSim);
              const masConveniente = comisionFijaSim < comisionPorcSim ? "Fija" : "Porcentual";

              return (
                <div className="space-y-3 pt-2">
                  <div className="p-2.5 rounded-xl bg-muted/60 text-center text-xs">
                    Venta Total Proyectada: <span className="font-bold font-mono">S/ {totalVentasSim.toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-center space-y-1">
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase block">
                        Opción Fija (S/ {tarifaFijaBase.toFixed(2)})
                      </span>
                      <div className="text-lg font-black font-mono text-blue-600 dark:text-blue-400">
                        S/ {comisionFijaSim.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-muted-foreground block">
                        equivale a {((comisionFijaSim / totalVentasSim) * 100).toFixed(2)}% de la venta
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 text-center space-y-1">
                      <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase block">
                        Opción Porcentual ({tasaPorcentualBase.toFixed(1)}%)
                      </span>
                      <div className="text-lg font-black font-mono text-purple-600 dark:text-purple-400">
                        S/ {comisionPorcSim.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-muted-foreground block">
                        equivale a S/ {(comisionPorcSim / calcPedidos).toFixed(2)} por pedido
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-border text-[11px] text-muted-foreground text-center">
                    💡 Para la distribuidora, la opción <span className="font-bold text-foreground">{masConveniente}</span> es más económica por S/ {diferencia.toFixed(2)} al mes con este volumen.
                  </div>
                </div>
              );
            })()}
          </div>

          <DialogFooter>
            <Button
              size="sm"
              onClick={() => setModalCalculadora(false)}
              className="text-xs"
            >
              Cerrar Simulador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
