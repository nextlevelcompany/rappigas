"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useUIThemeStore } from "@/store/ui-theme.store";
import { useAuthStore } from "@/store/auth-store";
import { RoleGuardAlert } from "@/components/auth/role-guard-alert";
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
  Upload,
  Image as ImageIcon,
  Trash2,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/brand-logo";

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
  const { usuario } = useAuthStore();
  const { theme: mode, setTheme: setMode } = useTheme();
  const {
    theme,
    primaryColor,
    radius,
    customLogoUrl,
    customLogoHeight,
    customLogoSidebarAlign,
    customLogoSidebarOffset,
    customFaviconUrl,
    setTheme,
    setPrimaryColor,
    setRadius,
    setCustomLogoUrl,
    setCustomLogoHeight,
    setCustomLogoSidebarAlign,
    setCustomLogoSidebarOffset,
    setCustomFaviconUrl,
    resetLogo,
    resetToDefaults,
  } = useUIThemeStore();

  const [customHex, setCustomHex] = useState(primaryColor || "#ea580c");
  const [urlLogoInput, setUrlLogoInput] = useState("");
  const [urlFaviconInput, setUrlFaviconInput] = useState("");
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [montado, setMontado] = useState(false);

  const fileLogoInputRef = React.useRef<HTMLInputElement>(null);
  const fileFaviconInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMontado(true);
    if (primaryColor) {
      setCustomHex(primaryColor);
    }
  }, [primaryColor]);

  // Manejador de subida de archivos (PNG, JPG, SVG, WEBP, ICO)
  const handleProcessImageFile = (file: File, type: "logo" | "favicon") => {
    if (!file.type.startsWith("image/") && !file.name.endsWith(".ico")) {
      toast.error("Formato inválido", {
        description: "Por favor selecciona un archivo de imagen (PNG, JPG, SVG, WEBP o ICO).",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Archivo demasiado grande", {
        description: "El tamaño máximo recomendado es de 2 MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (type === "logo") {
        setCustomLogoUrl(dataUrl);
        toast.success("Logotipo actualizado", {
          description: "El nuevo logo se aplicó a la web, panel y menús en tiempo real.",
        });
      } else {
        setCustomFaviconUrl(dataUrl);
        toast.success("Favicon actualizado", {
          description: "El icono de la pestaña del navegador ha sido actualizado.",
        });
      }
    };
    reader.readAsDataURL(file);
  };

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
    setUrlLogoInput("");
    setUrlFaviconInput("");
    toast.info("Configuración restablecida", {
      description: "Se restauraron los temas, colores, logotipo y bordes originales del sistema.",
    });
  };

  if (!montado) return null;

  if (usuario && usuario.rol !== "ADMIN") {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto space-y-6">
        <RoleGuardAlert
          rolRequerido="ADMIN"
          mensaje="Acceso Restringido: La configuración global de plataforma, temas y personalización de marca solo está disponible para Administradores de PideGas."
        />
      </div>
    );
  }

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
            <span className="text-primary font-semibold">Identidad y Temas</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Palette className="w-6 h-6" />
            </div>
            Apariencia e Identidad de Marca
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl">
            Personalice el logotipo oficial, el favicon del navegador, la paleta cromática, el modo de pantalla y el estilo visual de toda la plataforma PideGas.
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
          1. SECCIÓN: IDENTIDAD DE MARCA (Logotipo y Favicon)
         ======================================================== */}
      <div className="space-y-5">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-primary" />
            1. Logotipo Oficial y Favicon del Navegador
          </h2>
          <p className="text-xs text-muted-foreground">
            Suba los archivos gráficos de su empresa. Se reflejarán inmediatamente en la web pública, el panel de administración y la pestaña del navegador.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Subida de Logo & Favicon */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tarjeta: Logotipo Principal */}
            <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-primary" />
                    Logotipo Principal (Cabecera y Menús)
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Formatos recomendados: PNG o SVG transparente (Max 2MB)
                  </p>
                </div>
                {customLogoUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCustomLogoUrl("");
                      toast.info("Logotipo restaurado al predeterminado");
                    }}
                    className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2.5 gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Quitar Logo
                  </Button>
                )}
              </div>

              {/* Zona Drag & Drop / Selector */}
              <input
                ref={fileLogoInputRef}
                type="file"
                accept="image/png, image/jpeg, image/svg+xml, image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessImageFile(file, "logo");
                }}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingLogo(true);
                }}
                onDragLeave={() => setIsDraggingLogo(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingLogo(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleProcessImageFile(file, "logo");
                }}
                onClick={() => fileLogoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                  isDraggingLogo
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/25 hover:border-primary hover:bg-muted/40"
                }`}
              >
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-foreground">
                  Haga clic para subir o arrastre el archivo aquí
                </div>
                <p className="text-[11px] text-muted-foreground">
                  PNG, SVG, WEBP o JPG hasta 2 MB
                </p>
              </div>

              {/* URL externa opcional */}
              <div className="pt-2 border-t border-border/60">
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
                  O vincular mediante URL de imagen:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="https://ejemplo.com/logo.png"
                      value={urlLogoInput}
                      onChange={(e) => setUrlLogoInput(e.target.value)}
                      className="pl-8 text-xs h-9"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => {
                      if (urlLogoInput.trim()) {
                        setCustomLogoUrl(urlLogoInput.trim());
                        toast.success("Logo actualizado desde URL");
                      }
                    }}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>

              {/* Control de Tamaño del Logotipo */}
              <div className="pt-3 border-t border-border/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-bold text-foreground block">
                      Tamaño de Altura del Logotipo:
                    </label>
                    <p className="text-[10px] text-muted-foreground">
                      Ajuste la altura en píxeles para que se adapte perfectamente a la cabecera
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                    {customLogoHeight || 44} px
                  </span>
                </div>

                {/* Presets Rápidos */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Pequeño", val: 32 },
                    { label: "Estándar", val: 44 },
                    { label: "Grande", val: 56 },
                    { label: "Maxi", val: 72 },
                  ].map((preset) => {
                    const isSelected = (customLogoHeight || 44) === preset.val;
                    return (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => {
                          setCustomLogoHeight(preset.val);
                          toast.success(`Tamaño de logo ajustado a ${preset.val}px`);
                        }}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-muted/40 hover:bg-muted text-foreground border-border"
                        }`}
                      >
                        {preset.label} ({preset.val}px)
                      </button>
                    );
                  })}
                </div>

                {/* Slider de ajuste fino */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[10px] font-mono text-muted-foreground">24px</span>
                  <input
                    type="range"
                    min={24}
                    max={90}
                    step={2}
                    value={customLogoHeight || 44}
                    onChange={(e) => setCustomLogoHeight(parseInt(e.target.value, 10))}
                    className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-muted-foreground">90px</span>
                </div>
              </div>

              {/* Control de Posición y Alineación en la Barra Lateral (Dashboard / Admin) */}
              <div className="pt-3 border-t border-border/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-bold text-foreground block">
                      Alineación del Logo en Barra Lateral (Admin / Dashboard):
                    </label>
                    <p className="text-[10px] text-muted-foreground">
                      Mueva el logotipo más a la izquierda, al centro o ajuste el margen exacto
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                    {customLogoSidebarAlign === "left"
                      ? `Izquierda (${customLogoSidebarOffset ?? 8}px)`
                      : customLogoSidebarAlign === "right"
                      ? "Derecha"
                      : "Centrado"}
                  </span>
                </div>

                {/* Botones de Alineación */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "left" as const, label: "A la Izquierda" },
                    { id: "center" as const, label: "Centrado" },
                    { id: "right" as const, label: "A la Derecha" },
                  ].map((pos) => {
                    const isSelected = (customLogoSidebarAlign || "left") === pos.id;
                    return (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => {
                          setCustomLogoSidebarAlign(pos.id);
                          toast.success(`Alineación del logo: ${pos.label}`);
                        }}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer text-center ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-muted/40 hover:bg-muted text-foreground border-border"
                        }`}
                      >
                        {pos.label}
                      </button>
                    );
                  })}
                </div>

                {/* Ajuste fino de margen izquierdo */}
                {customLogoSidebarAlign === "left" && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                      <span>Margen / Sangría Izquierda:</span>
                      <span className="font-mono font-bold text-foreground">{customLogoSidebarOffset ?? 8} px</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-muted-foreground">0px</span>
                      <input
                        type="range"
                        min={0}
                        max={36}
                        step={2}
                        value={customLogoSidebarOffset ?? 8}
                        onChange={(e) => setCustomLogoSidebarOffset(parseInt(e.target.value, 10))}
                        className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                      />
                      <span className="text-[10px] font-mono text-muted-foreground">36px</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tarjeta: Favicon del Navegador */}
            <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    Favicon de la Pestaña del Navegador
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Icono pequeño mostrado en las pestañas y marcadores del navegador
                  </p>
                </div>
                {customFaviconUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCustomFaviconUrl("");
                      toast.info("Favicon restaurado");
                    }}
                    className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2.5 gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Restablecer
                  </Button>
                )}
              </div>

              <input
                ref={fileFaviconInputRef}
                type="file"
                accept="image/png, image/x-icon, image/svg+xml, image/webp, image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessImageFile(file, "favicon");
                }}
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileFaviconInputRef.current?.click()}
                  className="text-xs h-10 gap-2 cursor-pointer flex-1"
                >
                  <Upload className="w-4 h-4 text-primary" />
                  Subir Favicon Independiente (.ico, .png, .svg)
                </Button>

                {customLogoUrl && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setCustomFaviconUrl(customLogoUrl);
                      toast.success("Favicon sincronizado con el logotipo");
                    }}
                    className="text-xs h-10 gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    Usar mismo Logotipo como Favicon
                  </Button>
                )}
              </div>

              {/* URL externa de favicon */}
              <div className="pt-2 border-t border-border/60">
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
                  O vincular favicon mediante URL:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="https://ejemplo.com/favicon.ico"
                      value={urlFaviconInput}
                      onChange={(e) => setUrlFaviconInput(e.target.value)}
                      className="pl-8 text-xs h-9"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => {
                      if (urlFaviconInput.trim()) {
                        setCustomFaviconUrl(urlFaviconInput.trim());
                        toast.success("Favicon actualizado desde URL");
                      }
                    }}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Vista Previa en Tiempo Real de Marca */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-4 h-full flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Vista Previa en Tiempo Real
                </span>
                <p className="text-xs text-muted-foreground mb-4">
                  Así se visualiza su identidad en los diferentes entornos del sistema:
                </p>

                <div className="space-y-4">
                  {/* Mockup 1: Pestaña del navegador con favicon */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      Pestaña del Navegador Web:
                    </span>
                    <div className="bg-neutral-800 text-neutral-200 rounded-xl px-3 py-2 flex items-center gap-2.5 max-w-xs shadow-inner border border-neutral-700">
                      {customFaviconUrl ? (
                        <img
                          src={customFaviconUrl}
                          alt="Favicon Preview"
                          className="w-4 h-4 object-contain rounded-xs shrink-0"
                        />
                      ) : (
                        <Flame className="w-4 h-4 text-orange-500 shrink-0" />
                      )}
                      <span className="text-[11px] font-medium truncate">
                        PideGas — Tu balón de gas exacto
                      </span>
                    </div>
                  </div>

                  {/* Mockup 2: Cabecera Web Pública (Fondo Blanco) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      Cabecera Web Pública (Fondo Blanco):
                    </span>
                    <div className="p-3 bg-white rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
                      <BrandLogo variant="dark" />
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-orange-500 text-white">
                        Pedir Ahora
                      </span>
                    </div>
                  </div>

                  {/* Mockup 3: Cabecera Menú Lateral / Admin (Fondo Oscuro) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      Barra Lateral de Administración (Fondo Oscuro):
                    </span>
                    <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 shadow-xs flex items-center justify-between">
                      <div
                        className={`flex items-center flex-1 transition-all ${
                          customLogoSidebarAlign === "center"
                            ? "justify-center"
                            : customLogoSidebarAlign === "right"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                        style={{
                          paddingLeft: customLogoSidebarAlign === "left" ? `${customLogoSidebarOffset ?? 8}px` : undefined,
                          paddingRight: customLogoSidebarAlign === "right" ? `${customLogoSidebarOffset ?? 8}px` : undefined,
                        }}
                      >
                        <BrandLogo variant="light" size="sm" />
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 shrink-0">
                        Admin
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-muted/60 text-[11px] text-muted-foreground flex items-center gap-2 mt-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Los cambios se guardan automáticamente en su navegador.</span>
              </div>
            </div>
          </div>
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
              2. Modo de Pantalla (Luz / Oscuridad)
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
