"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useUIThemeStore, SIDEBAR_ICON_COLORS, renderSidebarIcon } from "@/store/ui-theme.store";
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
  LayoutDashboard,
  Boxes,
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
  MessageCircle,
  Phone,
  Send,
  Smartphone,
  ExternalLink,
  Type,
  ZoomIn,
  ZoomOut,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/brand-logo";
import { applyDynamicFavicon } from "@/providers/ui-theme-provider";

const ESCALAS_FUENTE = [
  {
    valor: 85,
    label: "Compacto",
    sublabel: "85%",
    desc: "Alta densidad de datos. Ideal para visualizar más información y tablas extensas sin scroll.",
  },
  {
    valor: 100,
    label: "Estándar",
    sublabel: "100%",
    desc: "Predeterminado RappiGas. Equilibrio óptimo entre legibilidad, proporciones y diseño.",
  },
  {
    valor: 112,
    label: "Grande",
    sublabel: "112%",
    desc: "Texto ampliado. Mayor comodidad de lectura para jornadas operativas continuas.",
  },
  {
    valor: 125,
    label: "Extra Grande",
    sublabel: "125%",
    desc: "Máxima legibilidad. Recomendado para pantallas grandes, alta resolución o confort visual.",
  },
];

const PALETA_COLORES = [
  { id: "orange", nombre: "Naranja RappiGas (Oficial)", hex: "#ea580c", desc: "Identidad energética y entrega rápida" },
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
    titulo: "Estándar RappiGas",
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
  { valor: "0.625rem", label: "10px (Estándar)", desc: "Predeterminado RappiGas" },
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
    fontScale,
    sidebarFontScale,
    contentFontScale,
    customLogoUrl,
    customLogoHeight,
    customLogoSidebarAlign,
    customLogoSidebarOffset,
    customFaviconUrl,
    customWebLogoUrl,
    customWebLogoHeight,
    whatsappNumber,
    whatsappDefaultMessage,
    whatsappEnabled,
    sidebarIconColor,
    setTheme,
    setPrimaryColor,
    setRadius,
    setFontScale,
    resetFontScale,
    setSidebarFontScale,
    resetSidebarFontScale,
    setContentFontScale,
    resetContentFontScale,
    resetAllFontScales,
    setSidebarIconColor,
    resetSidebarIconColor,
    setCustomLogoUrl,
    setCustomLogoHeight,
    setCustomWebLogoUrl,
    setCustomWebLogoHeight,
    resetWebLogo,
    setCustomLogoSidebarAlign,
    setCustomLogoSidebarOffset,
    setCustomFaviconUrl,
    setWhatsappNumber,
    setWhatsappDefaultMessage,
    setWhatsappEnabled,
    resetWhatsapp,
    resetLogo,
    resetToDefaults,
  } = useUIThemeStore();

  const [areaEscalaActiva, setAreaEscalaActiva] = useState<"global" | "sidebar" | "content">("global");

  const [customHex, setCustomHex] = useState(primaryColor || "#ea580c");
  const [customIconHex, setCustomIconHex] = useState(sidebarIconColor?.startsWith("#") ? sidebarIconColor : "#ea580c");
  const [urlLogoInput, setUrlLogoInput] = useState("");
  const [urlWebLogoInput, setUrlWebLogoInput] = useState("");
  const [urlFaviconInput, setUrlFaviconInput] = useState("");
  const [wspNumeroInput, setWspNumeroInput] = useState(whatsappNumber || "51999999999");
  const [wspMensajeInput, setWspMensajeInput] = useState(whatsappDefaultMessage || "Hola RappiGas, deseo pedir un balón de gas");
  const [wspActivoInput, setWspActivoInput] = useState(whatsappEnabled !== false);
  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingWebLogo, setIsDraggingWebLogo] = useState(false);
  const [isDraggingFavicon, setIsDraggingFavicon] = useState(false);
  const [montado, setMontado] = useState(false);

  const fileLogoInputRef = React.useRef<HTMLInputElement>(null);
  const fileWebLogoInputRef = React.useRef<HTMLInputElement>(null);
  const fileFaviconInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMontado(true);
    if (primaryColor) {
      setCustomHex(primaryColor);
    }
    if (whatsappNumber) {
      setWspNumeroInput(whatsappNumber);
    }
    if (whatsappDefaultMessage) {
      setWspMensajeInput(whatsappDefaultMessage);
    }
    setWspActivoInput(whatsappEnabled !== false);
    if (sidebarIconColor && sidebarIconColor.startsWith("#")) {
      setCustomIconHex(sidebarIconColor);
    }
  }, [primaryColor, whatsappNumber, whatsappDefaultMessage, whatsappEnabled, sidebarIconColor]);

  // Sincroniza el favicon con el endpoint /api/favicon, almacenamiento local y pestañas abiertas
  const syncFaviconServerAndLocal = async (faviconUrl: string) => {
    setCustomFaviconUrl(faviconUrl);
    applyDynamicFavicon(faviconUrl);

    try {
      const res = await fetch("/api/favicon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favicon: faviconUrl }),
      });
      const data = await res.json();
      if (data?.success && data?.url) {
        if (data.url !== faviconUrl) {
          setCustomFaviconUrl(data.url);
          applyDynamicFavicon(data.url);
        }
      }
    } catch (err) {
      console.warn("No se pudo sincronizar favicon con /api/favicon:", err);
    }
  };

  // Manejador de subida de archivos (PNG, JPG, SVG, WEBP, ICO)
  const handleProcessImageFile = (file: File, type: "logo" | "favicon" | "webLogo") => {
    const fileNameLower = file.name.toLowerCase();
    const isIco = fileNameLower.endsWith(".ico") || file.type.includes("icon");
    const isSvg = fileNameLower.endsWith(".svg") || file.type === "image/svg+xml";
    const isImage = file.type.startsWith("image/") || isIco || isSvg;

    if (!isImage) {
      toast.error("Formato inválido", {
        description: "Por favor selecciona un archivo de imagen (.ico, .png, .svg, .webp o .jpg).",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Archivo demasiado grande", {
        description: "El tamaño máximo recomendado es de 5 MB.",
      });
      return;
    }

    // Para favicons en formatos bitmap (PNG, JPG, WEBP), redimensionamos mediante Canvas a 64x64px
    // Esto garantiza un tamaño super liviano (~3KB), sin riesgo de desbordar localStorage y con nitidez perfecta.
    if (type === "favicon" && !isSvg && !isIco) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result as string;
        const img = new window.Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const size = 64;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = "high";
              const scale = Math.min(size / img.width, size / img.height);
              const w = img.width * scale;
              const h = img.height * scale;
              const x = (size - w) / 2;
              const y = (size - h) / 2;
              ctx.drawImage(img, x, y, w, h);
              const optimizedFavicon = canvas.toDataURL("image/png");
              syncFaviconServerAndLocal(optimizedFavicon);
              toast.success("Favicon actualizado", {
                description: "El icono de la pestaña del navegador se actualizó en todas las pestañas.",
              });
              return;
            }
          } catch {
            // Fallback si canvas falla por alguna restricción
          }
          syncFaviconServerAndLocal(rawDataUrl);
          toast.success("Favicon actualizado");
        };
        img.onerror = () => {
          syncFaviconServerAndLocal(rawDataUrl);
          toast.success("Favicon actualizado");
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (type === "logo") {
        setCustomLogoUrl(dataUrl);
        toast.success("Logotipo principal actualizado", {
          description: "El nuevo logo se aplicó a la plataforma y menús en tiempo real.",
        });
      } else if (type === "webLogo") {
        setCustomWebLogoUrl(dataUrl);
        toast.success("Logotipo de la Web Pública actualizado", {
          description: "El nuevo logo se aplicó a la cabecera y pie de página de la web pública.",
        });
      } else {
        syncFaviconServerAndLocal(dataUrl);
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

  const handleGuardarWhatsapp = () => {
    const numeroLimpio = wspNumeroInput.replace(/[^0-9]/g, "");
    if (!numeroLimpio || numeroLimpio.length < 8) {
      toast.error("Número de WhatsApp inválido", {
        description: "Ingrese un número válido con al menos 9 dígitos (ej. 987654321 o 51987654321).",
      });
      return;
    }

    setWhatsappNumber(numeroLimpio);
    setWhatsappDefaultMessage(wspMensajeInput);
    setWhatsappEnabled(wspActivoInput);
    toast.success("WhatsApp Oficial Actualizado", {
      description: `Se configuró el número +${numeroLimpio} para pedidos y atención en toda la plataforma.`,
    });
  };

  const handleRestablecerWhatsapp = () => {
    resetWhatsapp();
    setWspNumeroInput("51999999999");
    setWspMensajeInput("Hola RappiGas, deseo pedir un balón de gas");
    setWspActivoInput(true);
    toast.info("WhatsApp restablecido", {
      description: "Se restauró el número y mensaje de WhatsApp predeterminados.",
    });
  };

  const handleReset = () => {
    resetToDefaults();
    syncFaviconServerAndLocal("");
    setMode("system");
    setCustomHex("#ea580c");
    setUrlLogoInput("");
    setUrlWebLogoInput("");
    setUrlFaviconInput("");
    setWspNumeroInput("51999999999");
    setWspMensajeInput("Hola RappiGas, deseo pedir un balón de gas");
    setWspActivoInput(true);
    toast.info("Configuración restablecida", {
      description: "Se restauraron los temas, colores, logotipo, WhatsApp y bordes originales del sistema.",
    });
  };

  if (!montado) return null;

  if (usuario && usuario.rol !== "ADMIN") {
    return (
      <div className="p-6 sm:p-8 lg:p-10 max-w-4xl mx-auto space-y-6">
        <RoleGuardAlert
          rolRequerido="ADMIN"
          mensaje="Acceso Restringido: La configuración global de plataforma, temas y personalización de marca solo está disponible para Administradores de RappiGas."
        />
      </div>
    );
  }

  return (
    <div className="w-full py-3 px-3 sm:px-6 space-y-3 text-xs">
      {/* ========================================================
          1. HEADER COMPACTO
         ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-foreground">
                Apariencia e Identidad de Marca
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                Personalización
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Personalice el logotipo oficial, el favicon, la paleta cromática, el modo de pantalla y el estilo visual de RappiGas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-7 px-2.5 text-xs gap-1.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restablecer</span>
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
                accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessImageFile(file, "logo");
                  e.target.value = "";
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

            {/* Tarjeta: Logotipo de la Web Pública */}
            <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-orange-500" />
                    Logotipo de la Web Pública (Cabecera y Footer)
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Logotipo visible para clientes en la cabecera y pie de página de la web pública
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {customLogoUrl && customWebLogoUrl !== customLogoUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCustomWebLogoUrl(customLogoUrl);
                        toast.success("Logotipo de la web sincronizado con el principal");
                      }}
                      className="text-xs h-7 px-2.5 gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Usar Logo Principal
                    </Button>
                  )}
                  {customWebLogoUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCustomWebLogoUrl("");
                        toast.info("Logotipo de la web restaurado al predeterminado");
                      }}
                      className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2.5 gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Restaurar
                    </Button>
                  )}
                </div>
              </div>

              {/* Zona Drag & Drop / Selector Web Logo */}
              <input
                ref={fileWebLogoInputRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessImageFile(file, "webLogo");
                  e.target.value = "";
                }}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingWebLogo(true);
                }}
                onDragLeave={() => setIsDraggingWebLogo(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingWebLogo(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleProcessImageFile(file, "webLogo");
                }}
                onClick={() => fileWebLogoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                  isDraggingWebLogo
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-muted-foreground/25 hover:border-orange-500 hover:bg-muted/40"
                }`}
              >
                <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-600">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-foreground">
                  Haga clic para subir el logo de la web o arrastre el archivo aquí
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Formatos recomendados: PNG o SVG transparente (Max 2MB)
                </p>
                {customWebLogoUrl ? (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Logo personalizado activo para la web
                  </div>
                ) : (
                  <span className="text-[10px] text-muted-foreground">
                    (Usa por defecto: {customLogoUrl ? "Logotipo Principal" : "Logo oficial RappiGas"})
                  </span>
                )}
              </div>

              {/* URL externa opcional */}
              <div className="pt-2 border-t border-border/60">
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
                  O vincular mediante URL de imagen para la web:
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="https://ejemplo.com/logo-web.png"
                      value={urlWebLogoInput}
                      onChange={(e) => setUrlWebLogoInput(e.target.value)}
                      className="pl-8 text-xs h-9"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="h-9 text-xs"
                    onClick={() => {
                      if (urlWebLogoInput.trim()) {
                        setCustomWebLogoUrl(urlWebLogoInput.trim());
                        toast.success("Logo de la web actualizado desde URL");
                      }
                    }}
                  >
                    Aplicar a la Web
                  </Button>
                </div>
              </div>

              {/* Control de Altura del Logo en la Web */}
              <div className="pt-3 border-t border-border/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-[11px] font-bold text-foreground block">
                      Altura del Logotipo en la Web:
                    </label>
                    <p className="text-[10px] text-muted-foreground">
                      Ajuste el tamaño del logo para la cabecera de la web pública
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-600 border border-orange-500/20">
                    {customWebLogoHeight || 44} px
                  </span>
                </div>

                {/* Presets Rápidos */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "Compacto", val: 36 },
                    { label: "Estándar", val: 44 },
                    { label: "Mediano", val: 52 },
                    { label: "Grande", val: 64 },
                  ].map((preset) => {
                    const isSelected = (customWebLogoHeight || 44) === preset.val;
                    return (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => {
                          setCustomWebLogoHeight(preset.val);
                          toast.success(`Tamaño de logo web ajustado a ${preset.val}px`);
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

                {/* Slider */}
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[10px] font-mono text-muted-foreground">24px</span>
                  <input
                    type="range"
                    min={24}
                    max={80}
                    step={2}
                    value={customWebLogoHeight || 44}
                    onChange={(e) => setCustomWebLogoHeight(parseInt(e.target.value, 10))}
                    className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-muted-foreground">80px</span>
                </div>
              </div>
            </div>

            {/* Tarjeta: Favicon del Navegador */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingFavicon(true);
              }}
              onDragLeave={() => setIsDraggingFavicon(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingFavicon(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleProcessImageFile(file, "favicon");
              }}
              className={`p-5 rounded-3xl bg-card border shadow-sm space-y-4 transition-all duration-200 ${
                isDraggingFavicon ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-primary" />
                    Favicon de la Pestaña del Navegador
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Icono pequeño mostrado en las pestañas y marcadores (.ico, .png, .svg, .webp)
                  </p>
                </div>
                {customFaviconUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      syncFaviconServerAndLocal("");
                      toast.info("Favicon restaurado al predeterminado");
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
                accept=".ico,.png,.svg,.webp,.jpg,.jpeg,image/png,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,image/webp,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleProcessImageFile(file, "favicon");
                  e.target.value = "";
                }}
              />

              {/* Zona de Subida / Arrastre con Vista Previa */}
              <div
                onClick={() => fileFaviconInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition flex items-center justify-between gap-4 ${
                  isDraggingFavicon
                    ? "border-primary bg-primary/10"
                    : "border-muted-foreground/25 hover:border-primary hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted/60 border border-border flex items-center justify-center shrink-0 overflow-hidden p-1 shadow-inner">
                    {customFaviconUrl ? (
                      <img
                        src={customFaviconUrl}
                        alt="Favicon Actual"
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <img
                        src="/favicon.ico"
                        alt="Favicon Predeterminado"
                        className="w-7 h-7 object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-primary" />
                      <span>{customFaviconUrl ? "Reemplazar Favicon" : "Subir Favicon (.ico, .png, .svg)"}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Haga clic o arrastre el icono aquí (se optimiza a 64x64px automáticamente)
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 gap-1.5 shrink-0"
                >
                  <Upload className="w-3 h-3 text-primary" />
                  Examinar
                </Button>
              </div>

              {customLogoUrl && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    syncFaviconServerAndLocal(customLogoUrl);
                    toast.success("Favicon sincronizado con el logotipo");
                  }}
                  className="w-full text-xs h-8 gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Usar mismo Logotipo como Favicon
                </Button>
              )}

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
                        const cleanUrl = urlFaviconInput.trim();
                        syncFaviconServerAndLocal(cleanUrl);
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
                        <img
                          src="/favicon.ico"
                          alt="Favicon Predeterminado"
                          className="w-4 h-4 object-contain rounded-xs shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      )}
                      <span className="text-[11px] font-medium truncate">
                        RappiGas — Tu balón de gas exacto
                      </span>
                    </div>
                  </div>

                  {/* Mockup 2: Cabecera Web Pública (Fondo Blanco) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      Cabecera Web Pública (Fondo Blanco):
                    </span>
                    <div className="p-3 bg-white rounded-2xl border border-neutral-200 shadow-xs flex items-center justify-between">
                      <img
                        src={customWebLogoUrl || customLogoUrl || "/assets/img/logo/Logo_rappi_gas.png"}
                        alt="Logo Web Preview"
                        style={{ maxHeight: `${customWebLogoHeight || 44}px`, width: "auto" }}
                        className="object-contain"
                      />
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full text-white" style={{ background: "linear-gradient(135deg, #FF5722 0%, #D84315 100%)" }}>
                        Pedir Ahora
                      </span>
                    </div>
                  </div>

                  {/* Mockup 2B: Pie de Página Web Pública (Fondo Oscuro) */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      Pie de Página Web (Fondo Oscuro #0B132B):
                    </span>
                    <div className="p-3 bg-[#0B132B] rounded-2xl border border-slate-800 shadow-xs flex items-center justify-between">
                      <img
                        src={customWebLogoUrl || customLogoUrl || "/assets/img/logo/Logo_rappi_gas.png"}
                        alt="Logo Web Footer Preview"
                        style={{ maxHeight: "36px", width: "auto" }}
                        className="object-contain"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">
                        © 2026 RappiGas
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
          2. SECCIÓN: CANAL OFICIAL DE ATENCIÓN Y WHATSAPP
         ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366]">
                <MessageCircle className="w-4 h-4" />
              </div>
              2. Canal Oficial de Atención y WhatsApp
            </h2>
            <p className="text-xs text-muted-foreground">
              Configure el número telefónico oficial de WhatsApp de la empresa y el mensaje predeterminado para pedidos en línea
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                wspActivoInput
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-muted text-muted-foreground border border-border"
              }`}
            >
              <span className={`size-1.5 rounded-full ${wspActivoInput ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
              {wspActivoInput ? "WhatsApp Activo" : "Desactivado"}
            </span>
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Columna Izquierda: Formulario de Configuración de WhatsApp */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#25D366]" />
                  Número de Teléfono de WhatsApp
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-muted/70 border border-border text-xs font-bold text-foreground shrink-0 select-none">
                    <span>🇵🇪 +51</span>
                  </div>
                  <Input
                    type="text"
                    value={wspNumeroInput}
                    onChange={(e) => setWspNumeroInput(e.target.value)}
                    placeholder="999 999 999"
                    className="h-10 text-sm font-semibold rounded-xl bg-background"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Ingrese el número con o sin código de país (ej. 987654321 o 51987654321). Se limpiará automáticamente para el enlace directo de WhatsApp.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-primary" />
                  Mensaje Predeterminado al Iniciar Conversación
                </label>
                <textarea
                  value={wspMensajeInput}
                  onChange={(e) => setWspMensajeInput(e.target.value)}
                  rows={3}
                  placeholder="Hola RappiGas, deseo pedir un balón de gas a domicilio..."
                  className="w-full text-sm rounded-xl border border-border bg-background p-3 focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground resize-none"
                />
                <p className="text-[11px] text-muted-foreground">
                  Texto que el cliente verá preescrito en su chat al hacer clic en el botón de WhatsApp.
                </p>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/30">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground block">
                    Habilitar WhatsApp en la Web Pública
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    Muestra el enlace en la cabecera superior y el botón flotante de pedidos
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wspActivoInput}
                    onChange={(e) => setWspActivoInput(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#25D366]"></div>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleGuardarWhatsapp}
                  className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs gap-1.5 cursor-pointer rounded-xl h-9.5 px-4 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Guardar Configuración de WhatsApp
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRestablecerWhatsapp}
                  className="text-xs gap-1.5 cursor-pointer rounded-xl h-9.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restablecer
                </Button>
              </div>
            </div>

            {/* Columna Derecha: Previsualización en Vivo de WhatsApp */}
            <div className="lg:col-span-5 bg-muted/40 p-4 rounded-2xl border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <Smartphone className="w-3.5 h-3.5" />
                  Vista Previa del Chat
                </span>
                <span className="text-[10px] text-muted-foreground">En Vivo</span>
              </div>

              {/* Mockup de pantalla WhatsApp */}
              <div className="rounded-xl overflow-hidden border border-border shadow-md bg-[#0b141a] text-white font-sans text-xs">
                {/* Header del Chat */}
                <div className="bg-[#1f2c34] p-3 flex items-center gap-3 border-b border-[#2a3942]">
                  <div className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center font-bold text-white shrink-0">
                    <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-xs truncate flex items-center gap-1">
                      RappiGas Oficial
                      <CheckCircle2 className="w-3 h-3 text-[#25D366] shrink-0 fill-[#25D366]/20" />
                    </div>
                    <div className="text-[10px] text-[#25D366] font-medium">
                      +{wspNumeroInput.replace(/[^0-9]/g, "") || "51999999999"} • En línea
                    </div>
                  </div>
                </div>

                {/* Fondo de conversación */}
                <div className="p-4 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] bg-[size:16px_16px] bg-[#0b141a] min-h-[140px] flex flex-col justify-end space-y-2">
                  <div className="bg-[#005c4b] text-[#e9edef] p-3 rounded-xl rounded-tr-none max-w-[85%] self-end shadow-xs text-xs space-y-1">
                    <p className="leading-relaxed whitespace-pre-wrap break-words">
                      {wspMensajeInput || "Hola RappiGas, deseo pedir un balón de gas"}
                    </p>
                    <div className="text-[9px] text-[#8696a0] text-right flex items-center justify-end gap-1">
                      <span>12:00 PM</span>
                      <span className="text-[#53bdeb]">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Prueba en Vivo */}
              <div className="pt-1">
                <a
                  href={`https://wa.me/${wspNumeroInput.replace(/[^0-9]/g, "") || "51999999999"}?text=${encodeURIComponent(wspMensajeInput || "Hola RappiGas")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] font-bold text-xs transition cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Probar Enlace en WhatsApp Web
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. SECCIÓN: MODO DEL SISTEMA (Light / Dark / Auto)
         ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sun className="w-4 h-4 text-primary" />
              3. Modo de Pantalla (Luz / Oscuridad)
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
          4. SECCIÓN: TAMAÑO DE LETRA Y ESCALA VISUAL (GLOBAL, SIDEBAR Y CONTENIDO)
         ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <div className="p-1 rounded-md bg-primary/10 text-primary">
                <Type className="w-4 h-4" />
              </div>
              4. Control de Tamaño de Letra y Escala Visual
            </h2>
            <p className="text-xs text-muted-foreground">
              Ajuste el tamaño del texto globalmente o configure de forma independiente el menú lateral y el contenido interno.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-muted border border-border text-muted-foreground">
              Global: <strong className="text-foreground">{fontScale || 100}%</strong> • Menú: <strong className="text-foreground">{sidebarFontScale || 100}%</strong> • Contenido: <strong className="text-foreground">{contentFontScale || 100}%</strong>
            </span>
            {((fontScale || 100) !== 100 || (sidebarFontScale || 100) !== 100 || (contentFontScale || 100) !== 100) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  resetAllFontScales();
                  toast.info("Todas las escalas restablecidas a 100% (Estándar)");
                }}
                className="h-7 px-2.5 text-xs gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive"
              >
                <RotateCcw className="w-3 h-3" />
                Restablecer Todo a 100%
              </Button>
            )}
          </div>
        </div>

        {/* Selector de Área a Configurar (Tabs) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-muted/60 rounded-2xl border border-border">
          <button
            type="button"
            onClick={() => setAreaEscalaActiva("global")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              areaEscalaActiva === "global"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-primary" />
            <div className="text-left">
              <div className="leading-tight">Todo el Sistema (Global)</div>
              <div className="text-[10px] font-mono font-normal opacity-70">Escala actual: {fontScale || 100}%</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAreaEscalaActiva("sidebar")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              areaEscalaActiva === "sidebar"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }`}
          >
            <PanelLeft className="w-3.5 h-3.5 text-primary" />
            <div className="text-left">
              <div className="leading-tight">Menú Lateral (Sidebar)</div>
              <div className="text-[10px] font-mono font-normal opacity-70">Escala actual: {sidebarFontScale || 100}%</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setAreaEscalaActiva("content")}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              areaEscalaActiva === "content"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-card/50"
            }`}
          >
            <Layout className="w-3.5 h-3.5 text-primary" />
            <div className="text-left">
              <div className="leading-tight">Contenido Interno (Páginas)</div>
              <div className="text-[10px] font-mono font-normal opacity-70">Escala actual: {contentFontScale || 100}%</div>
            </div>
          </button>
        </div>

        {/* Panel de Control para el Área Seleccionada */}
        <div className="p-4 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/60">
            <div>
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                {areaEscalaActiva === "global" ? (
                  <Globe className="w-3.5 h-3.5 text-primary" />
                ) : areaEscalaActiva === "sidebar" ? (
                  <PanelLeft className="w-3.5 h-3.5 text-primary" />
                ) : (
                  <Layout className="w-3.5 h-3.5 text-primary" />
                )}
                Ajustando:{" "}
                <span className="text-primary font-black">
                  {areaEscalaActiva === "global"
                    ? "Escala General (Todo el Sistema)"
                    : areaEscalaActiva === "sidebar"
                    ? "Menú Lateral (Barra de Navegación)"
                    : "Contenido Interno (Área de Trabajo y Páginas)"}
                </span>
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {areaEscalaActiva === "global"
                  ? "Afecta proporcionalmente a toda la plataforma: cabeceras, menús, tablas, tarjetas, modales y botones."
                  : areaEscalaActiva === "sidebar"
                  ? "Afecta exclusivamente a los módulos, enlaces, submenús y opciones de la barra lateral izquierda."
                  : "Afecta exclusivamente a las tablas, fichas de clientes, empresas, formularios, KPIs y gráficos."}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                {areaEscalaActiva === "global"
                  ? `${fontScale || 100}%`
                  : areaEscalaActiva === "sidebar"
                  ? `${sidebarFontScale || 100}%`
                  : `${contentFontScale || 100}%`}
              </span>
              {((areaEscalaActiva === "global" && (fontScale || 100) !== 100) ||
                (areaEscalaActiva === "sidebar" && (sidebarFontScale || 100) !== 100) ||
                (areaEscalaActiva === "content" && (contentFontScale || 100) !== 100)) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (areaEscalaActiva === "global") {
                      resetFontScale();
                      toast.info("Escala global restablecida al 100%");
                    } else if (areaEscalaActiva === "sidebar") {
                      resetSidebarFontScale();
                      toast.info("Escala del menú lateral restablecida al 100%");
                    } else {
                      resetContentFontScale();
                      toast.info("Escala de contenido interno restablecida al 100%");
                    }
                  }}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  100%
                </Button>
              )}
            </div>
          </div>

          {/* 4 Presets de Escala para el Área Activa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ESCALAS_FUENTE.map((item) => {
              const valorActual =
                areaEscalaActiva === "global"
                  ? (fontScale || 100)
                  : areaEscalaActiva === "sidebar"
                  ? (sidebarFontScale || 100)
                  : (contentFontScale || 100);
              const activo = valorActual === item.valor;

              return (
                <button
                  key={item.valor}
                  type="button"
                  onClick={() => {
                    if (areaEscalaActiva === "global") {
                      setFontScale(item.valor);
                      toast.success(`Escala Global: ${item.label} (${item.sublabel})`);
                    } else if (areaEscalaActiva === "sidebar") {
                      setSidebarFontScale(item.valor);
                      toast.success(`Menú Lateral: ${item.label} (${item.sublabel})`);
                    } else {
                      setContentFontScale(item.valor);
                      toast.success(`Contenido Interno: ${item.label} (${item.sublabel})`);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer group ${
                    activo
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs"
                      : "border-border bg-card hover:border-muted-foreground/40 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center font-bold font-serif text-foreground shrink-0 border border-border group-hover:scale-105 transition">
                        Aa
                      </span>
                      <div>
                        <span className="text-xs font-bold text-foreground block">
                          {item.label}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {item.sublabel}
                        </span>
                      </div>
                    </div>
                    {activo ? (
                      <span className="p-1 rounded-full bg-primary text-primary-foreground">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[10.5px] text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Slider Milimétrico para el Área Activa */}
          <div className="pt-2 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-primary" />
                Deslizador de Escala Fina ({areaEscalaActiva === "global" ? "Global" : areaEscalaActiva === "sidebar" ? "Menú Lateral" : "Contenido"}):
              </span>
              <span className="font-mono font-bold text-primary">
                {areaEscalaActiva === "global"
                  ? `${fontScale || 100}%`
                  : areaEscalaActiva === "sidebar"
                  ? `${sidebarFontScale || 100}%`
                  : `${contentFontScale || 100}%`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 shrink-0">
                <ZoomOut className="w-3 h-3" /> 80% (Compacto)
              </span>
              <input
                type="range"
                min={80}
                max={130}
                step={2}
                value={
                  areaEscalaActiva === "global"
                    ? (fontScale || 100)
                    : areaEscalaActiva === "sidebar"
                    ? (sidebarFontScale || 100)
                    : (contentFontScale || 100)
                }
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (areaEscalaActiva === "global") {
                    setFontScale(val);
                  } else if (areaEscalaActiva === "sidebar") {
                    setSidebarFontScale(val);
                  } else {
                    setContentFontScale(val);
                  }
                }}
                className="w-full accent-primary h-2 bg-muted rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 shrink-0">
                130% (Amplio) <ZoomIn className="w-3 h-3" />
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground px-1">
              <span>80% Compacto</span>
              <span>100% Estándar RappiGas</span>
              <span>112% Grande</span>
              <span>130% Máximo</span>
            </div>
          </div>

          {/* Previsualización en Vivo Dividida: Menú Lateral vs Contenido Interno */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 space-y-3 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-primary" />
                Previsualización en Tiempo Real Comparativa:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-background border border-border text-muted-foreground">
                  Menú: {sidebarFontScale || 100}%
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-background border border-border text-muted-foreground">
                  Contenido: {contentFontScale || 100}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
              {/* Lado Izquierdo: Simulación del Menú Lateral */}
              <div className="md:col-span-5 p-3 rounded-lg bg-background border border-border space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <PanelLeft className="w-3 h-3 text-primary" />
                    Menú Lateral ({sidebarFontScale || 100}%)
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground">Sidebar</span>
                </div>

                {/* Mock Item con la escala de sidebar aplicada */}
                <div
                  style={{
                    fontSize: `${((sidebarFontScale || 100) * (fontScale || 100)) / 100}%`,
                  }}
                  className="space-y-1.5 transition-all"
                >
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary font-bold text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>Empresas & Distribuidoras</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-primary/20">Activo</span>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted text-muted-foreground text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                      <span>Contactos y Clientes</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-muted text-muted-foreground text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                      <span>Kardex e Inventario</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lado Derecho: Simulación del Contenido Interno */}
              <div className="md:col-span-7 p-3 rounded-lg bg-background border border-border space-y-2.5">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Layout className="w-3 h-3 text-primary" />
                    Contenido Interno ({contentFontScale || 100}%)
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground">Workspace</span>
                </div>

                {/* Mock Card con la escala de contenido aplicada */}
                <div
                  style={{
                    fontSize: `${((contentFontScale || 100) * (fontScale || 100)) / 100}%`,
                  }}
                  className="space-y-2 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        RG
                      </div>
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          Distribuidora Gas Los Olivos S.A.C.
                        </div>
                        <div className="text-[10.5px] text-muted-foreground">
                          RUC: 20601234567 • Balón 10kg Premium
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200">
                      Operativa
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-border/60">
                    <span className="text-muted-foreground">Último Despacho: Hace 12 min</span>
                    <span className="font-bold text-primary font-mono">S/ 48.00</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10.5px] text-muted-foreground flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-primary shrink-0" />
              Los cambios en el menú lateral y en el contenido interno se aplican en vivo en toda la plataforma y se guardan automáticamente para futuras sesiones.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          5. SECCIÓN: PALETA DE COLORES EN GENERAL (Color Primario)
         ======================================================== */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Brush className="w-4 h-4 text-primary" />
              5. Paleta de Colores en General (Color Primario del Sistema)
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
          6. SECCIÓN: TEMAS INMERSIVOS Y DECORATIVOS
         ======================================================== */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            6. Variantes y Temas de Fondo Especiales
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
          7. SECCIÓN: RADIO DE BORDES (Border Radius)
         ======================================================== */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            7. Estilo y Curvatura de Bordes (Border Radius)
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
          8. SECCIÓN: COLOR DE ÍCONOS DEL MENÚ LATERAL
         ======================================================== */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              8. Color de los Íconos del Menú Lateral
            </h2>
            <p className="text-xs text-muted-foreground">
              Personaliza el estilo cromático de los íconos de la navegación lateral: original multicolor, negro monocromático o tonos de acento
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-muted border border-border">
              Activo:{" "}
              <span className="text-primary font-semibold">
                {SIDEBAR_ICON_COLORS.find((c) => c.id === sidebarIconColor)?.nombre ||
                  (sidebarIconColor?.startsWith("#") ? `Personalizado (${sidebarIconColor})` : sidebarIconColor)}
              </span>
            </span>
            {sidebarIconColor !== "default" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetSidebarIconColor();
                  toast.success("Íconos restaurados a su color original multicolor");
                }}
                className="h-7 text-xs px-2.5 gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                Original
              </Button>
            )}
          </div>
        </div>

        {/* Grilla de Opciones Preestablecidas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {SIDEBAR_ICON_COLORS.map((opt) => {
            const activo = sidebarIconColor === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setSidebarIconColor(opt.id);
                  toast.success(`Color de íconos: ${opt.nombre}`);
                }}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer group ${
                  activo
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-xs"
                    : "border-border bg-card hover:bg-card hover:border-muted-foreground/40"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-xl flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition shrink-0 border border-border/40",
                      opt.bgPreview
                    )}
                    style={opt.id === "primary" ? { backgroundColor: primaryColor } : undefined}
                  >
                    {activo ? (
                      <Check className="w-4 h-4 stroke-[3] text-white mix-blend-difference" />
                    ) : null}
                  </div>
                  {opt.hex ? (
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                      {opt.hex}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {opt.id === "default" ? "Multi" : opt.id === "black" ? "Mono" : "Dinámico"}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground truncate">
                    {opt.nombre}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                    {opt.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selector de Color Hexadecimal Libre para Íconos */}
        <div className="p-4 rounded-2xl bg-card border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="color"
              value={customIconHex}
              onChange={(e) => setCustomIconHex(e.target.value)}
              className="w-11 h-11 rounded-xl cursor-pointer border border-border bg-transparent p-1 shrink-0"
              title="Escoger color libre para los íconos"
            />
            <div>
              <span className="text-xs font-bold text-foreground block">
                Color Hexadecimal Personalizado para Íconos
              </span>
              <span className="text-[11px] text-muted-foreground">
                ¿Buscas un color específico para los íconos del menú lateral? Ingrésalo o selecciónalo aquí.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-32">
              <Input
                type="text"
                value={customIconHex}
                onChange={(e) => setCustomIconHex(e.target.value)}
                placeholder="#EA580C"
                className="h-9 text-xs font-mono uppercase"
              />
            </div>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (!/^#([0-9A-F]{3}){1,2}$/i.test(customIconHex)) {
                  toast.error("Ingresa un código hexadecimal válido (ej: #EA580C o #000000)");
                  return;
                }
                setSidebarIconColor(customIconHex);
                toast.success(`Color personalizado de íconos aplicado: ${customIconHex.toUpperCase()}`);
              }}
              className="h-9 text-xs font-bold cursor-pointer"
            >
              Aplicar a Íconos
            </Button>
          </div>
        </div>

        {/* Previsualización en Vivo de Barra Lateral */}
        <div className="p-4 rounded-2xl bg-muted/40 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-2">
              <PanelLeft className="w-3.5 h-3.5 text-primary" />
              Muestra en Vivo de Navegación Lateral
            </span>
            <span className="text-[11px] text-muted-foreground">
              Efecto en tiempo real sobre los íconos
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-border/80 shadow-xs">
              {renderSidebarIcon(<LayoutDashboard className="w-5 h-5 text-sky-500" />, sidebarIconColor)}
              <span className="text-xs font-medium text-foreground">Dashboard</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-border/80 shadow-xs">
              {renderSidebarIcon(<Truck className="w-5 h-5 text-orange-500" />, sidebarIconColor)}
              <span className="text-xs font-medium text-foreground">Despacho</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-border/80 shadow-xs">
              {renderSidebarIcon(<Boxes className="w-5 h-5 text-indigo-500" />, sidebarIconColor)}
              <span className="text-xs font-medium text-foreground">Inventario</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-border/80 shadow-xs">
              {renderSidebarIcon(<Flame className="w-5 h-5 text-amber-500" />, sidebarIconColor)}
              <span className="text-xs font-medium text-foreground">Ventas</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          9. SECCIÓN: PREVISUALIZACIÓN EN VIVO (Live Preview)
         ======================================================== */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            9. Previsualización en Vivo de Componentes
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
