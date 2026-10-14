"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useUIThemeStore } from "@/store/ui-theme.store";
import { toast } from "sonner";
import {
  Palette,
  Sun,
  Moon,
  Laptop,
  Check,
  RotateCcw,
  Sparkles,
  Sliders,
  Eye,
  Layers,
  Layout,
  Flame,
  ShieldCheck,
  Truck,
  ArrowRight,
  Info,
  CheckCircle2,
  Brush,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PALETA_COLORES = [
  { id: "orange", nombre: "Naranja PideGas (Oficial)", hex: "#ea580c", desc: "Identidad energética y entrega rápida" },
  { id: "blue", nombre: "Azul Corporativo", hex: "#2563eb", desc: "Confianza tecnológica y seriedad empresarial" },
  { id: "emerald", nombre: "Verde Esmeralda", hex: "#059669", desc: "Sostenibilidad, pesaje justo y seguridad" },
  { id: "violet", nombre: "Violeta Real", hex: "#7c3aed", desc: "Modernidad digital y dinamismo" },
  { id: "red", nombre: "Rojo Carmesí", hex: "#dc2626", desc: "Alta urgencia, calidez y potencia" },
  { id: "amber", nombre: "Ámbar Cálido", hex: "#d97706", desc: "Llama dorada y atención comercial" },
  { id: "cyan", nombre: "Turquesa Cyan", hex: "#0891b2", desc: "Frescura, eficiencia e innovación" },
  { id: "pink", nombre: "Rosa Neón", hex: "#db2777", desc: "Estilo audaz y vibrante" },
  { id: "indigo", nombre: "Índigo Profundo", hex: "#4f46e5", desc: "Elegancia ejecutiva y calma" },
  { id: "zinc", nombre: "Grafito Neutro", hex: "#18181b", desc: "Minimalismo industrial moderno" },
];

const TEMAS_ESPECIALES = [
  {
    id: "",
    titulo: "Estándar PideGas",
    desc: "Limpio, profesional y enfocado en la operatividad diaria.",
    bgClass: "bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700",
  },
  {
    id: "semi-dark",
    titulo: "Semi Dark (Ejecutivo)",
    desc: "Barra lateral oscura de alta visibilidad con área de trabajo clara.",
    bgClass: "bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-100 text-white border-neutral-700",
  },
  {
    id: "dark-blue",
    titulo: "Dark Blue (Galáctico)",
    desc: "Tonos azul noche envolventes con brillo estelar y contraste suave.",
    bgClass: "bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white border-blue-900",
  },
  {
    id: "gaussian-black",
    titulo: "Gaussian Black (Cristal)",
    desc: "Profundidad negra absoluta con matices púrpuras y efecto de cristal.",
    bgClass: "bg-gradient-to-br from-black via-zinc-950 to-purple-950 text-white border-purple-900",
  },
];

const RADIOS_BORDE = [
  { valor: "0rem", label: "0px (Recto)", desc: "Estilo técnico e industrial" },
  { valor: "0.375rem", label: "6px (Sutil)", desc: "Bordes ligeramente suavizados" },
  { valor: "0.625rem", label: "10px (Estándar)", desc: "Predeterminado PideGas" },
  { valor: "0.875rem", label: "14px (Redondeado)", desc: "Toque moderno y amigable" },
  { valor: "1.25rem", label: "20px (Cápsula)", desc: "Diseño curvilíneo suave" },
];

export default function ConfiguracionTemasPage() {
  const { theme: mode, setTheme: setMode } = useTheme();
  const {
    theme,
    primaryColor,
    radius,
    setTheme,
    setPrimaryColor,
    setRadius,
    resetToDefaults,
  } = useUIThemeStore();

  const [customHex, setCustomHex] = useState(primaryColor || "#ea580c");
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    if (primaryColor) {
      setCustomHex(primaryColor);
    }
  }, [primaryColor]);

  const handleSelectColor = (hex: string) => {
    setCustomHex(hex);
    setPrimaryColor(hex);
    toast.success("Color primario actualizado", {
      description: `Se aplicó el color ${hex} a todos los componentes del sistema.`,
    });
  };

  const handleCustomColorApply = () => {
    if (/^#([0-9A-F]{3}){1,2}$/i.test(customHex)) {
      setPrimaryColor(customHex);
      toast.success("Color personalizado aplicado", {
        description: `La paleta se configuró con el tono ${customHex}.`,
      });
    } else {
      toast.error("Código de color inválido", {
        description: "Ingrese un formato hexadecimal válido (ej. #FF6600).",
      });
    }
  };

  const handleReset = () => {
    resetToDefaults();
    setMode("system");
    setCustomHex("#ea580c");
    toast.info("Configuración restablecida", {
      description: "Se restauraron los temas, colores y bordes originales del sistema.",
    });
  };

  if (!montado) return null;

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-10">
      {/* ========================================================
          1. HEADER & BREADCRUMBS
         ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
            <Link href="/admin/dashboard" className="hover:text-primary transition">
              Administración
            </Link>
            <span>/</span>
            <span>Configuración</span>
            <span>/</span>
            <span className="text-primary font-semibold">Temas y Colores</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Palette className="w-6 h-6" />
            </div>
            Apariencia del Sistema • Temas y Colores
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Personalice el modo de pantalla, el color primario de la aplicación, los temas envolventes y el estilo visual de toda la plataforma PideGas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs gap-1.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer Valores
          </Button>
        </div>
      </div>

      {/* ========================================================
          2. SECCIÓN: MODO DEL SISTEMA (Light / Dark / Auto)
         ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sun className="w-4 h-4 text-primary" />
              1. Modo de Pantalla (Luz / Oscuridad)
            </h2>
            <p className="text-xs text-muted-foreground">
              Seleccione la iluminación base para el contraste de textos e interfaces
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Opción Claro */}
          <button
            type="button"
            onClick={() => {
              setMode("light");
              toast.success("Modo Claro activado");
            }}
            className={`p-4 rounded-2xl border text-left transition flex items-center gap-4 cursor-pointer ${
              mode === "light"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                : "border-border bg-card hover:border-muted-foreground/30"
            }`}
          >
            <div className={`p-3 rounded-xl shrink-0 ${mode === "light" ? "bg-amber-100 text-amber-600" : "bg-muted text-muted-foreground"}`}>
              <Sun className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Modo Claro</span>
                {mode === "light" && <Check className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Fondo blanco luminoso para oficinas y luz diurna
              </p>
            </div>
          </button>

          {/* Opción Oscuro */}
          <button
            type="button"
            onClick={() => {
              setMode("dark");
              toast.success("Modo Oscuro activado");
            }}
            className={`p-4 rounded-2xl border text-left transition flex items-center gap-4 cursor-pointer ${
              mode === "dark"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                : "border-border bg-card hover:border-muted-foreground/30"
            }`}
          >
            <div className={`p-3 rounded-xl shrink-0 ${mode === "dark" ? "bg-indigo-950 text-indigo-400" : "bg-muted text-muted-foreground"}`}>
              <Moon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Modo Oscuro</span>
                {mode === "dark" && <Check className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Reduce el cansancio visual en turnos nocturnos
              </p>
            </div>
          </button>

          {/* Opción Sistema */}
          <button
            type="button"
            onClick={() => {
              setMode("system");
              toast.success("Modo Automático / Sistema activado");
            }}
            className={`p-4 rounded-2xl border text-left transition flex items-center gap-4 cursor-pointer ${
              mode === "system"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                : "border-border bg-card hover:border-muted-foreground/30"
            }`}
          >
            <div className={`p-3 rounded-xl shrink-0 ${mode === "system" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
              <Laptop className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Sincronizar con Sistema</span>
                {mode === "system" && <Check className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Sigue automáticamente las preferencias de tu PC o móvil
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================
          3. SECCIÓN: PALETA DE COLORES EN GENERAL (Color Primario)
         ======================================================== */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Brush className="w-4 h-4 text-primary" />
              2. Paleta de Colores en General (Color Primario del Sistema)
            </h2>
            <p className="text-xs text-muted-foreground">
              Define el color principal de botones, acentos, íconos activos, gráficos y navegación
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-muted border border-border">
            Color Activo: <span style={{ color: primaryColor }}>{primaryColor}</span>
          </span>
        </div>

        {/* Grilla de Colores Predeterminados */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {PALETA_COLORES.map((c) => {
            const activo = primaryColor.toLowerCase() === c.hex.toLowerCase();
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelectColor(c.hex)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer group ${
                  activo
                    ? "border-foreground/40 bg-card ring-2 shadow-md"
                    : "border-border bg-card/60 hover:bg-card hover:border-muted-foreground/40"
                }`}
                style={{
                  boxShadow: activo ? `0 4px 14px ${c.hex}33` : undefined,
                }}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-xs group-hover:scale-110 transition shrink-0"
                    style={{ backgroundColor: c.hex }}
                  >
                    {activo ? <Check className="w-4 h-4 stroke-[3]" /> : null}
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    {c.hex}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground truncate">
                    {c.nombre}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                    {c.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selector de Color Personalizado Libre */}
        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="color"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              className="w-12 h-12 rounded-xl cursor-pointer border border-border bg-transparent p-1 shrink-0"
              title="Escoger color con selector"
            />
            <div>
              <span className="text-xs font-bold text-foreground block">
                Selector de Color Hexadecimal Libre
              </span>
              <span className="text-[11px] text-muted-foreground">
                ¿Prefieres un color corporativo exacto de tu empresa? Escógelo aquí.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-32">
              <Input
                type="text"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                placeholder="#EA580C"
                className="h-9 text-xs font-mono uppercase"
              />
            </div>
            <Button
              type="button"
              size="sm"
              onClick={handleCustomColorApply}
              className="h-9 text-xs font-bold cursor-pointer"
            >
              Aplicar Color
            </Button>
          </div>
        </div>
      </div>

      {/* ========================================================
          4. SECCIÓN: TEMAS INMERSIVOS Y DECORATIVOS
         ======================================================== */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            3. Variantes y Temas de Fondo Especiales
          </h2>
          <p className="text-xs text-muted-foreground">
            Fondos temáticos diseñados para transformar la experiencia visual de dashboards y pantallas
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMAS_ESPECIALES.map((t) => {
            const activo = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  toast.success(`Tema aplicado: ${t.titulo}`);
                }}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer h-36 relative overflow-hidden ${
                  t.bgClass
                } ${
                  activo
                    ? "ring-2 ring-primary border-primary shadow-lg scale-[1.02]"
                    : "hover:scale-[1.01]"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black uppercase tracking-wider">
                    {t.titulo}
                  </span>
                  {activo && (
                    <span className="p-1 rounded-full bg-primary text-primary-foreground">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] opacity-80 leading-relaxed">
                  {t.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          5. SECCIÓN: RADIO DE BORDES (Border Radius)
         ======================================================== */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            4. Estilo y Curvatura de Bordes (Border Radius)
          </h2>
          <p className="text-xs text-muted-foreground">
            Ajusta la redondez de botones, tarjetas, cuadros de diálogo e inputs
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {RADIOS_BORDE.map((r) => {
            const activo = radius === r.valor;
            return (
              <button
                key={r.valor}
                type="button"
                onClick={() => {
                  setRadius(r.valor);
                  toast.success(`Radio de curvatura: ${r.label}`);
                }}
                className={`p-3.5 border text-center transition cursor-pointer ${
                  activo
                    ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-primary font-bold"
                    : "border-border bg-card hover:border-muted-foreground/30 text-foreground"
                }`}
                style={{ borderRadius: r.valor }}
              >
                <div className="text-xs font-bold">{r.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          6. SECCIÓN: PREVISUALIZACIÓN EN VIVO (Live Preview)
         ======================================================== */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            5. Previsualización en Vivo de Componentes
          </h2>
          <p className="text-xs text-muted-foreground">
            Así es como lucirá tu selección de color y tema en los módulos de pedidos, despachos y administración:
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
          {/* Fila de Botones */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Botones y Llamados a la Acción
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <Button className="font-bold text-xs gap-2 shadow-md">
                <Flame className="w-4 h-4" />
                Botón Primario
              </Button>
              <Button variant="secondary" className="text-xs">
                Botón Secundario
              </Button>
              <Button variant="outline" className="text-xs">
                Botón Outline
              </Button>
              <Button variant="ghost" className="text-xs text-primary">
                Botón Texto
              </Button>
            </div>
          </div>

          {/* Fila de Badges y Etiquetas */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Etiquetas y Badges de Estado
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground flex items-center gap-1.5 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Pedido Confirmado
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                En Ruta de Reparto
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Balanza Calibrada
              </span>
            </div>
          </div>

          {/* Tarjeta de Resumen con Barra de Progreso */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border max-w-md space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-foreground">Meta de Despachos del Día</span>
              <span className="text-primary font-mono">82% Completado</span>
            </div>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: "82%" }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-muted-foreground">
              <span>164 balones entregados</span>
              <span>Objetivo: 200 balones</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
