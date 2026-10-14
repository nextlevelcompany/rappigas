"use client"

import Link from "next/link"
import { useUIThemeStore } from "@/store/ui-theme.store"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  Check,
  RotateCcw,
  Palette,
  ExternalLink,
  Brush,
} from "lucide-react"

const SWATCHES = [
  { hex: "#ea580c", nombre: "Naranja" },
  { hex: "#2563eb", nombre: "Azul" },
  { hex: "#059669", nombre: "Verde" },
  { hex: "#7c3aed", nombre: "Violeta" },
  { hex: "#dc2626", nombre: "Rojo" },
  { hex: "#d97706", nombre: "Ámbar" },
  { hex: "#0891b2", nombre: "Turquesa" },
  { hex: "#db2777", nombre: "Rosa" },
  { hex: "#4f46e5", nombre: "Índigo" },
  { hex: "#18181b", nombre: "Grafito" },
]

export default function ThemeCustomizer() {
  const { theme: mode, setTheme: setMode } = useTheme()
  const {
    theme,
    primaryColor,
    radius,
    setTheme,
    setPrimaryColor,
    setRadius,
    resetToDefaults,
  } = useUIThemeStore()

  const themes = [
    {
      id: "dark-blue",
      label: "Dark Blue",
      preview: "dark-blue-preview",
    },
    {
      id: "gaussian-black",
      label: "Gaussian Black",
      preview: "gaussian-black-preview",
    },
    {
      id: "semi-dark",
      label: "Semi Dark",
      preview: "bg-gradient-to-r from-gray-300 to-gray-900",
    },
  ]

  return (
    <Sheet>
      {/* Trigger */}
      <SheetTrigger asChild>
        <Button
          id="theme-customizer-trigger"
          size="icon"
          title="Personalizar Temas y Colores"
          aria-label="Personalizar Temas y Colores"
          className="
            rounded-full h-11 w-11 fixed bottom-5 right-5 z-50 
            shadow-xl cursor-pointer 
            hover:scale-105 transition-all
            bg-primary text-primary-foreground
          "
        >
          <Palette className="size-5" />
        </Button>
      </SheetTrigger>

      {/* Panel Lateral */}
      <SheetContent side="right" className="w-88 sm:w-96 overflow-y-auto p-5">
        <SheetHeader className="pb-3 border-b border-border">
          <SheetTitle className="text-base font-bold flex items-center gap-2">
            <Palette className="size-5 text-primary" />
            Temas y Colores del Sistema
          </SheetTitle>
        </SheetHeader>

        {/* 1. MODO DE LUZ / OSCURIDAD */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-bold text-foreground block">
            Modo de Pantalla
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMode("light")}
              className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === "light"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              <Sun className="size-3.5" />
              Claro
            </button>
            <button
              type="button"
              onClick={() => setMode("dark")}
              className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === "dark"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              <Moon className="size-3.5" />
              Oscuro
            </button>
            <button
              type="button"
              onClick={() => setMode("system")}
              className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                mode === "system"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-muted text-muted-foreground"
              }`}
            >
              <Laptop className="size-3.5" />
              Auto
            </button>
          </div>
        </div>

        {/* 2. COLOR PRIMARIO EN GENERAL */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-foreground block">
              Color Primario en General
            </label>
            <span className="text-[10px] font-mono text-muted-foreground">
              {primaryColor}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {SWATCHES.map((s) => {
              const activo = primaryColor.toLowerCase() === s.hex.toLowerCase()
              return (
                <button
                  key={s.hex}
                  type="button"
                  onClick={() => setPrimaryColor(s.hex)}
                  title={s.nombre}
                  className={`h-9 rounded-xl flex items-center justify-center text-white transition cursor-pointer ${
                    activo ? "ring-2 ring-foreground/40 scale-105 shadow-sm" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: s.hex }}
                >
                  {activo && <Check className="size-4 stroke-[3]" />}
                </button>
              )
            })}
          </div>

          {/* Color Picker Libre */}
          <div className="pt-1 flex items-center gap-2">
            <input
              type="color"
              value={primaryColor || "#ea580c"}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer border border-border bg-transparent p-0.5 shrink-0"
              title="Seleccionar color personalizado libre"
            />
            <span className="text-[11px] text-muted-foreground">
              Selector personalizado libre (Hex)
            </span>
          </div>
        </div>

        {/* 3. TEMAS ESPECIALES */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-bold text-foreground block">
            Fondos y Temas Especiales
          </label>
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`relative h-16 rounded-xl cursor-pointer transition hover:scale-105 overflow-hidden border border-border ${
                  theme === t.id ? "ring-2 ring-primary scale-105" : ""
                } ${t.preview}`}
              >
                <div className="absolute inset-0 bg-black/30" />
                <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white px-1.5 py-0.5 rounded bg-black/60">
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. CURVATURA DE BORDES */}
        <div className="mt-5 space-y-2">
          <label className="text-xs font-bold text-foreground block">
            Radio de Bordes
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { val: "0rem", lbl: "0px" },
              { val: "0.375rem", lbl: "6px" },
              { val: "0.625rem", lbl: "10px" },
              { val: "1.25rem", lbl: "20px" },
            ].map((r) => (
              <button
                key={r.val}
                type="button"
                onClick={() => setRadius(r.val)}
                className={`py-1.5 px-2 text-xs font-semibold border text-center transition cursor-pointer ${
                  radius === r.val
                    ? "border-primary bg-primary/10 text-primary font-bold"
                    : "border-border hover:bg-muted text-muted-foreground"
                }`}
                style={{ borderRadius: r.val }}
              >
                {r.lbl}
              </button>
            ))}
          </div>
        </div>

        {/* ACCIONES Y ENLACE A PÁGINA COMPLETA */}
        <div className="mt-6 pt-4 border-t border-border space-y-2.5">
          <Button
            asChild
            className="w-full text-xs font-bold justify-center gap-2 cursor-pointer"
          >
            <Link href="/admin/configuracion">
              <ExternalLink className="size-4" />
              Ver Configuración Completa
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              resetToDefaults()
              setMode("system")
            }}
            className="w-full text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RotateCcw className="size-3.5 mr-1.5" />
            Restablecer a Valores por Defecto
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}