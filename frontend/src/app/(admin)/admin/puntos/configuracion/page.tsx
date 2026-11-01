"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  Sparkles,
  Calculator,
  Save,
  RotateCcw,
  CheckCircle2,
  Info,
  Flame,
  ArrowRight,
  TrendingUp,
  Percent,
  Coins,
  ShieldCheck,
  ShoppingBag,
  Gift,
  Tag,
  Clock,
  Layers,
  HelpCircle,
  ChevronRight,
  AlertCircle,
  Smartphone,
  CreditCard,
  Zap,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ConfiguracionPuntos {
  // Acumulación
  solesPorPunto: number;
  puntosMinimosPedido: number;
  puntosBalon10kg: number;
  puntosBalon15kg: number;
  puntosBalon45kg: number;
  puntosRegulador: number;

  // Canje General
  puntosPorSol: number; // 8 puntos = S/ 1.00 base
  puntosBalonGratis: number;
  minimoPuntosCanje: number;
  mesesVigencia: number;

  // Estrategia Comercial por Categorías (Opción 1: Margen Diferenciado)
  ratioValesGas: number;       // default: 8.7 (Caja / Efectivo protegido)
  ratioMenajeCocina: number;   // default: 7.5 (Incentivo rápido con margen de compra por mayor)
  ratioElectroHogar: number;   // default: 7.8 (Equilibrado)

  // Bonos
  bonoPrimerPedido: number;
  bonoPagoDigital: number;
  multiplicadorOro: number;
  multiplicadorPlata: number;
  multiplicadorBronce: number;
}

const CONFIGURACION_DEFAULT: ConfiguracionPuntos = {
  solesPorPunto: 5.0,
  puntosMinimosPedido: 10,
  puntosBalon10kg: 10,
  puntosBalon15kg: 15,
  puntosBalon45kg: 40,
  puntosRegulador: 5,

  puntosPorSol: 8, // 8 pts = S/ 1.00 => 1 pt = S/ 0.125
  puntosBalonGratis: 480, // S/ 55 balón = 480 pts (ratio 8.7)
  minimoPuntosCanje: 80,
  mesesVigencia: 12,

  ratioValesGas: 8.7,       // Balones y vales exigen más puntos para proteger caja
  ratioMenajeCocina: 7.5,   // Ollas y sartenes exigen menos puntos para premiar más rápido
  ratioElectroHogar: 7.8,   // Electrohogar y tecnología

  bonoPrimerPedido: 20,
  bonoPagoDigital: 5,
  multiplicadorOro: 1.5,
  multiplicadorPlata: 1.2,
  multiplicadorBronce: 1.0,
};

const STORAGE_KEY = "rappigas_puntos_config_v2";

export default function ConfiguracionPuntosPage() {
  const [config, setConfig] = useState<ConfiguracionPuntos>(CONFIGURACION_DEFAULT);
  const [guardado, setGuardado] = useState(false);

  // Estados del Simulador
  const [simuladorMontoCompra, setSimuladorMontoCompra] = useState<number>(48.0);
  const [simuladorNivelCliente, setSimuladorNivelCliente] = useState<"Bronce" | "Plata" | "Oro">("Bronce");
  const [simuladorEsApp, setSimuladorEsApp] = useState<boolean>(true);
  const [simuladorEsPagoDigital, setSimuladorEsPagoDigital] = useState<boolean>(true);

  const [simuladorValorPremio, setSimuladorValorPremio] = useState<number>(50.0);
  const [simuladorCategoriaPremio, setSimuladorCategoriaPremio] = useState<"GAS_VALES" | "COCINA_MENAJE" | "ELECTROHOGAR">("GAS_VALES");

  // Cargar configuración guardada
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setConfig((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch {
      // Usar default si falla
    }
  }, []);

  // Manejo de cambios en los inputs numéricos
  const handleChange = (field: keyof ConfiguracionPuntos, value: number) => {
    setConfig((prev) => ({
      ...prev,
      [field]: Math.max(0, isNaN(value) ? 0 : value),
    }));
    setGuardado(false);
  };

  // Guardar configuración
  const handleGuardar = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setGuardado(true);
      toast.success("Estrategia comercial y reglas de puntos guardadas", {
        description: `Vales/Gas: ${config.ratioValesGas} pts/sol | Menaje/Cocina: ${config.ratioMenajeCocina} pts/sol | Acumulación: 1 pt por cada S/ ${config.solesPorPunto}`,
      });
      setTimeout(() => setGuardado(false), 3000);
    } catch {
      toast.error("No se pudo guardar la configuración");
    }
  };

  // Restablecer por defecto
  const handleReset = () => {
    if (window.confirm("¿Seguro que deseas restablecer la estrategia oficial por defecto?")) {
      setConfig(CONFIGURACION_DEFAULT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(CONFIGURACION_DEFAULT));
      toast.info("Valores restablecidos a la estrategia comercial oficial (Opción 1)");
    }
  };

  // Cálculos derivados
  const valorMonetarioPunto = useMemo(() => {
    return config.puntosPorSol > 0 ? 1 / config.puntosPorSol : 0.125;
  }, [config.puntosPorSol]);

  // Simulador de Compra
  const resultadoSimuladorCompra = useMemo(() => {
    const puntosBasePorMonto = Math.floor(simuladorMontoCompra / (config.solesPorPunto || 5));
    const puntosBase = Math.max(config.puntosMinimosPedido, puntosBasePorMonto);

    const mult =
      simuladorNivelCliente === "Oro"
        ? config.multiplicadorOro
        : simuladorNivelCliente === "Plata"
        ? config.multiplicadorPlata
        : config.multiplicadorBronce;

    const puntosConNivel = Math.round(puntosBase * mult);
    const bonoApp = simuladorEsApp ? 0 : 0;
    const bonoPago = simuladorEsPagoDigital ? config.bonoPagoDigital : 0;
    const totalPuntos = puntosConNivel + bonoApp + bonoPago;

    const valorRetornoSoles = totalPuntos * valorMonetarioPunto;
    const porcentajeCashback = simuladorMontoCompra > 0 ? (valorRetornoSoles / simuladorMontoCompra) * 100 : 0;

    return {
      puntosBase,
      multiplicador: mult,
      bonos: bonoPago,
      totalPuntos,
      valorRetornoSoles,
      porcentajeCashback,
    };
  }, [simuladorMontoCompra, simuladorNivelCliente, simuladorEsApp, simuladorEsPagoDigital, config, valorMonetarioPunto]);

  // Simulador de Canje con Estrategia Comercial Diferenciada
  const resultadoSimuladorCanje = useMemo(() => {
    const ratioAplicado =
      simuladorCategoriaPremio === "GAS_VALES"
        ? config.ratioValesGas
        : simuladorCategoriaPremio === "COCINA_MENAJE"
        ? config.ratioMenajeCocina
        : config.ratioElectroHogar;

    // Redondear a decenas como en el catálogo oficial (ej. 240, 480, 650)
    const puntosRequeridos = Math.round((simuladorValorPremio * ratioAplicado) / 10) * 10;
    const balonesNecesarios = Math.ceil(puntosRequeridos / (config.puntosBalon10kg || 10));

    return {
      ratioAplicado,
      puntosRequeridos,
      balonesNecesarios,
    };
  }, [simuladorValorPremio, simuladorCategoriaPremio, config]);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-5 space-y-6 pb-16">
      {/* ── ENCABEZADO Y BREADCRUMB ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link href="/admin/dashboard" className="hover:text-slate-800 transition">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/admin/puntos" className="hover:text-slate-800 transition">
              Fidelidad
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-700">Reglas y Equivalencias</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 m-0">
            <Coins className="w-7 h-7 text-orange-600" />
            Reglas y Equivalencias de Puntos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 m-0">
            Estrategia de fidelización activa: <strong>Opción 1 (Márgenes Diferenciados por Categoría)</strong> con protección de caja y gratificación rápida en menaje.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs font-semibold gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleGuardar}
            className={`text-xs font-bold gap-1.5 shadow-sm transition ${
              guardado
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-orange-600 hover:bg-orange-700 text-white"
            }`}
          >
            {guardado ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {guardado ? "¡Guardado!" : "Guardar Cambios"}
          </Button>
        </div>
      </div>

      {/* ── BANNER RESUMEN DE LA TASA ACTUAL ── */}
      <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 rounded-2xl p-4 sm:p-5 text-white shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-100 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-200" /> Tasa de Acumulación
            </span>
            <div className="text-xl font-black mt-1">1 pt = S/ {config.solesPorPunto.toFixed(2)}</div>
            <p className="text-[11px] text-orange-100/90 mt-0.5 m-0">
              Por cada S/ {config.solesPorPunto.toFixed(2)} de compra se otorga 1 punto.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-100 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-amber-200" /> Tasa Base de Canje
            </span>
            <div className="text-xl font-black mt-1">{config.puntosPorSol} pts = S/ 1.00</div>
            <p className="text-[11px] text-orange-100/90 mt-0.5 m-0">
              Valor unitario promedio: <strong>S/ {valorMonetarioPunto.toFixed(3)}</strong> por punto.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-100 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-200" /> Balón 10kg Gratis
            </span>
            <div className="text-xl font-black mt-1">{config.puntosBalonGratis} Puntos</div>
            <p className="text-[11px] text-orange-100/90 mt-0.5 m-0">
              Ratio de protección de caja: {config.ratioValesGas} pts/sol.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-100 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-200" /> Vigencia de Puntos
            </span>
            <div className="text-xl font-black mt-1">{config.mesesVigencia} Meses</div>
            <p className="text-[11px] text-orange-100/90 mt-0.5 m-0">
              Caducidad por inactividad desde la última compra.
            </p>
          </div>
        </div>
      </div>

      {/* ── CUADRÍCULA DE CONFIGURACIÓN ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. TARJETA: REGLAS DE ACUMULACIÓN */}
        <Card className="shadow-xs border-slate-200 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    1. Acumulación (Compras ➔ Puntos)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Define cuántos puntos recibe el cliente al comprar balones de gas
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-orange-700 bg-orange-50 border-orange-200 text-[10px]">
                Compras
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-1 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
              <label className="font-bold text-slate-800 block text-xs">
                Monto en Soles para ganar 1 Punto (S/)
              </label>
              <p className="text-[11px] text-slate-500 m-0">
                Determina la tasa base general de acumulación por cada sol gastado.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-sm font-bold text-slate-500">S/</span>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="50"
                  value={config.solesPorPunto}
                  onChange={(e) => handleChange("solesPorPunto", parseFloat(e.target.value))}
                  className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-black text-slate-900 text-right focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-xs font-semibold text-slate-600">de compra = 1 punto</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
              <label className="font-bold text-slate-800 block text-xs">
                Puntos Mínimos Garantizados por Pedido
              </label>
              <p className="text-[11px] text-slate-500 m-0">
                Piso mínimo que recibe el cliente por cualquier balón entregado con balanza.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={config.puntosMinimosPedido}
                  onChange={(e) => handleChange("puntosMinimosPedido", parseInt(e.target.value, 10))}
                  className="w-24 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-black text-slate-900 text-right focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-xs font-semibold text-slate-600">puntos mínimos</span>
              </div>
            </div>

            {/* Puntos fijos por producto oficial */}
            <div className="space-y-2 pt-1">
              <label className="font-bold text-slate-800 block text-xs">
                Puntos Asignados por Presentación de Balón:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">Balón 10kg</span>
                    <span className="text-[10px] text-slate-400">Click-On / Rosca</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={config.puntosBalon10kg}
                    onChange={(e) => handleChange("puntosBalon10kg", parseInt(e.target.value, 10))}
                    className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-black text-orange-600 text-right"
                  />
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">Balón 15kg</span>
                    <span className="text-[10px] text-slate-400">Comercial</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={config.puntosBalon15kg}
                    onChange={(e) => handleChange("puntosBalon15kg", parseInt(e.target.value, 10))}
                    className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-black text-orange-600 text-right"
                  />
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">Cilindro 45kg</span>
                    <span className="text-[10px] text-slate-400">Industrial</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={config.puntosBalon45kg}
                    onChange={(e) => handleChange("puntosBalon45kg", parseInt(e.target.value, 10))}
                    className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-black text-orange-600 text-right"
                  />
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">Regulador</span>
                    <span className="text-[10px] text-slate-400">Accesorios</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={config.puntosRegulador}
                    onChange={(e) => handleChange("puntosRegulador", parseInt(e.target.value, 10))}
                    className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-black text-orange-600 text-right"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. TARJETA: ESTRATEGIA COMERCIAL DIFERENCIADA POR CATEGORÍAS (OPCIÓN 1) */}
        <Card className="shadow-xs border-slate-200 bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    2. Estrategia Comercial de Canje (Opción 1)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Ratios diferenciados por categoría para proteger márgenes y premiar más rápido
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px]">
                Estrategia Activa
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3.5 pt-1 text-xs">
            {/* Categoría A: Vales y Gas */}
            <div className="p-3 rounded-xl border border-orange-200 bg-orange-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-600" /> Vales de Descuento & Balones Gratis
                </span>
                <span className="text-[10px] font-black uppercase text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                  Protección de Caja
                </span>
              </div>
              <p className="text-[11px] text-slate-600 m-0">
                Pide un poco más de puntos para proteger el margen de rentabilidad del gas.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="font-semibold text-slate-600">Ratio objetivo:</span>
                <input
                  type="number"
                  step="0.1"
                  min="5"
                  max="15"
                  value={config.ratioValesGas}
                  onChange={(e) => handleChange("ratioValesGas", parseFloat(e.target.value))}
                  className="w-20 px-2.5 py-1 bg-white border border-slate-300 rounded font-black text-orange-600 text-right"
                />
                <span className="text-slate-500 font-medium">pts / Sol (1 pt = S/ {(1 / config.ratioValesGas).toFixed(3)})</span>
              </div>
            </div>

            {/* Categoría B: Cocina y Menaje */}
            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  🍳 Cocina & Menaje (Ollas, Sartenes)
                </span>
                <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Fidelización Rápida
                </span>
              </div>
              <p className="text-[11px] text-slate-600 m-0">
                Exige menos puntos porque se compran al por mayor con descuentos de fabricante.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="font-semibold text-slate-600">Ratio objetivo:</span>
                <input
                  type="number"
                  step="0.1"
                  min="5"
                  max="15"
                  value={config.ratioMenajeCocina}
                  onChange={(e) => handleChange("ratioMenajeCocina", parseFloat(e.target.value))}
                  className="w-20 px-2.5 py-1 bg-white border border-slate-300 rounded font-black text-amber-700 text-right"
                />
                <span className="text-slate-500 font-medium">pts / Sol (1 pt = S/ {(1 / config.ratioMenajeCocina).toFixed(3)})</span>
              </div>
            </div>

            {/* Categoría C: Electrohogar y Tecnología */}
            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  🔌 Electrohogar & Tecnología
                </span>
                <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                  Equilibrado
                </span>
              </div>
              <p className="text-[11px] text-slate-600 m-0">
                Premios de alto valor para clientes de consumo frecuente y negocios.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="font-semibold text-slate-600">Ratio objetivo:</span>
                <input
                  type="number"
                  step="0.1"
                  min="5"
                  max="15"
                  value={config.ratioElectroHogar}
                  onChange={(e) => handleChange("ratioElectroHogar", parseFloat(e.target.value))}
                  className="w-20 px-2.5 py-1 bg-white border border-slate-300 rounded font-black text-blue-700 text-right"
                />
                <span className="text-slate-500 font-medium">pts / Sol (1 pt = S/ {(1 / config.ratioElectroHogar).toFixed(3)})</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                <label className="font-bold text-slate-800 block text-[11px]">
                  Mínimo Canjeable
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="10"
                    value={config.minimoPuntosCanje}
                    onChange={(e) => handleChange("minimoPuntosCanje", parseInt(e.target.value, 10))}
                    className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-black text-slate-900 text-right"
                  />
                  <span className="text-[11px] text-slate-500">pts</span>
                </div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                <label className="font-bold text-slate-800 block text-[11px]">
                  Vigencia Puntos
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={config.mesesVigencia}
                    onChange={(e) => handleChange("mesesVigencia", parseInt(e.target.value, 10))}
                    className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-black text-slate-900 text-right"
                  />
                  <span className="text-[11px] text-slate-500">meses</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. BONOS Y MULTIPLICADORES POR NIVEL ── */}
      <Card className="shadow-xs border-slate-200 bg-white dark:bg-slate-900">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  3. Bonificaciones y Multiplicadores por Nivel
                </CardTitle>
                <CardDescription className="text-xs">
                  Incentiva la fidelidad y los canales digitales con puntos extra automáticos
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Bono Primer Pedido
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={config.bonoPrimerPedido}
                  onChange={(e) => handleChange("bonoPrimerPedido", parseInt(e.target.value, 10))}
                  className="w-16 px-2 py-1 bg-white border border-slate-300 rounded font-black text-orange-600 text-right"
                />
                <span className="text-[11px] font-semibold text-slate-600">puntos</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Bono Pago Yape / Plin
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={config.bonoPagoDigital}
                  onChange={(e) => handleChange("bonoPagoDigital", parseInt(e.target.value, 10))}
                  className="w-16 px-2 py-1 bg-white border border-slate-300 rounded font-black text-orange-600 text-right"
                />
                <span className="text-[11px] font-semibold text-slate-600">puntos</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 space-y-1">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block flex items-center gap-1">
                ⭐ Cliente Oro (12+ bal/año)
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={config.multiplicadorOro}
                  onChange={(e) => handleChange("multiplicadorOro", parseFloat(e.target.value))}
                  className="w-16 px-2 py-1 bg-white border border-amber-300 rounded font-black text-amber-900 text-right"
                />
                <span className="text-[11px] font-semibold text-amber-900">x puntos</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-300 bg-slate-100/60 space-y-1">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1">
                🥈 Cliente Plata (6-11 bal)
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={config.multiplicadorPlata}
                  onChange={(e) => handleChange("multiplicadorPlata", parseFloat(e.target.value))}
                  className="w-16 px-2 py-1 bg-white border border-slate-300 rounded font-black text-slate-800 text-right"
                />
                <span className="text-[11px] font-semibold text-slate-800">x puntos</span>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-orange-200 bg-orange-50/40 space-y-1">
              <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block flex items-center gap-1">
                🥉 Cliente Bronce (1-5 bal)
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  value={config.multiplicadorBronce}
                  onChange={(e) => handleChange("multiplicadorBronce", parseFloat(e.target.value))}
                  className="w-16 px-2 py-1 bg-white border border-orange-300 rounded font-black text-orange-800 text-right"
                />
                <span className="text-[11px] font-semibold text-orange-800">x puntos</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 4. SIMULADOR INTERACTIVO CON ESTRATEGIA COMERCIAL ── */}
      <Card className="shadow-xs border-indigo-200 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Simulador de Equivalencias por Categoría
                </CardTitle>
                <CardDescription className="text-xs">
                  Comprueba en tiempo real cómo impacta la estrategia comercial en las compras y en el catálogo
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-indigo-600 text-white text-[10px]">
              Simulación Activa • Opción 1
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Simulador A: Compra de Gas */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-orange-600" /> Simular Compra de Gas
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Acumulación
                </span>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-600 block">
                  Total de la compra en Soles: S/ {simuladorMontoCompra.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="40"
                  max="250"
                  step="1"
                  value={simuladorMontoCompra}
                  onChange={(e) => setSimuladorMontoCompra(parseFloat(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>S/ 40 (1 Balón)</span>
                  <span>S/ 120 (3 Balones)</span>
                  <span>S/ 250 (Industrial)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Nivel Cliente:</label>
                  <select
                    value={simuladorNivelCliente}
                    onChange={(e) => setSimuladorNivelCliente(e.target.value as any)}
                    className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                  >
                    <option value="Bronce">Bronce (1.0x)</option>
                    <option value="Plata">Plata (1.2x)</option>
                    <option value="Oro">Oro (1.5x)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="chkPago"
                    checked={simuladorEsPagoDigital}
                    onChange={(e) => setSimuladorEsPagoDigital(e.target.checked)}
                    className="rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                  />
                  <label htmlFor="chkPago" className="text-[11px] font-semibold text-slate-700 cursor-pointer">
                    Pago Yape (+{config.bonoPagoDigital} pts)
                  </label>
                </div>
              </div>

              {/* Resultado Compra */}
              <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl space-y-1 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Puntos acumulados:</span>
                  <span className="text-base font-black text-orange-600 font-mono">
                    +{resultadoSimuladorCompra.totalPuntos} PTS
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Valor monetario que retorna:</span>
                  <span className="font-bold text-slate-800">
                    S/ {resultadoSimuladorCompra.valorRetornoSoles.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Retorno efectivo (Cashback):</span>
                  <span className="font-bold text-emerald-700">
                    {resultadoSimuladorCompra.porcentajeCashback.toFixed(1)}% del pedido
                  </span>
                </div>
              </div>
            </div>

            {/* Simulador B: Canje de Premio con Selector de Categoría Comercial */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-emerald-600" /> Simular Costo de Premio
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  Canje por Categoría
                </span>
              </div>

              {/* Selector de Categoría Comercial */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  Categoría del Premio:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSimuladorCategoriaPremio("GAS_VALES")}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition border cursor-pointer ${
                      simuladorCategoriaPremio === "GAS_VALES"
                        ? "bg-orange-600 text-white border-orange-600 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    🔥 Vales / Balón
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimuladorCategoriaPremio("COCINA_MENAJE")}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition border cursor-pointer ${
                      simuladorCategoriaPremio === "COCINA_MENAJE"
                        ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    🍳 Cocina/Menaje
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimuladorCategoriaPremio("ELECTROHOGAR")}
                    className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition border cursor-pointer ${
                      simuladorCategoriaPremio === "ELECTROHOGAR"
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    🔌 Electrohogar
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-600 block">
                  Valor de mercado del premio: S/ {simuladorValorPremio.toFixed(2)}
                </label>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="5"
                  value={simuladorValorPremio}
                  onChange={(e) => setSimuladorValorPremio(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>S/ 10</span>
                  <span>S/ 55 (Balón)</span>
                  <span>S/ 140 (Ollas)</span>
                  <span>S/ 300</span>
                </div>
              </div>

              {/* Resultado Canje Comercial */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">Puntos calculados:</span>
                  <span className="text-base font-black text-emerald-700 font-mono">
                    {resultadoSimuladorCanje.puntosRequeridos} PTS
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Tasa de la categoría:</span>
                  <span className="font-mono text-slate-700 font-bold">
                    {resultadoSimuladorCanje.ratioAplicado.toFixed(1)} pts por cada S/ 1.00
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Compras requeridas del cliente:</span>
                  <span className="font-bold text-slate-800">
                    ~{resultadoSimuladorCanje.balonesNecesarios} balones de 10kg
                  </span>
                </div>
                <div className="pt-1 text-[10px] text-slate-500 italic border-t border-emerald-200/60 mt-1">
                  {simuladorCategoriaPremio === "GAS_VALES"
                    ? "🛡️ Margen protegido para caja de la empresa (ratio más exigente)."
                    : simuladorCategoriaPremio === "COCINA_MENAJE"
                    ? "🎁 Incentivo comercial rápido para el cliente (menor cantidad de puntos)."
                    : "⚡ Ratio equilibrado para productos de tecnología y hogar."}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
