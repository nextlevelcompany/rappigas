"use client"
import React from "react"
import { create } from "zustand"
import { cn } from "@/lib/utils"

export interface UIThemeState {
  theme: string
  primaryColor: string
  radius: string
  sidebarStyle: string
  customLogoUrl: string
  customLogoHeight: number // in pixels, default 40
  customLogoSidebarAlign: "left" | "center" | "right"
  customLogoSidebarOffset: number // in pixels (-20 to 40, default 0)
  customFaviconUrl: string
  
  // Web Logo Configuration
  customWebLogoUrl: string
  customWebLogoHeight: number // in pixels, default 44
  
  // WhatsApp Configuration
  whatsappNumber: string // ej: "51999999999" o "+51 999 999 999"
  whatsappDefaultMessage: string // ej: "Hola RappiGas, deseo pedir un balón de gas"
  whatsappEnabled: boolean // true / false

  // Text Scale / Font Size Configuration
  fontScale: number // percentage: 80 to 130, default 100 (Global)
  sidebarFontScale: number // percentage: 80 to 130, default 100 (Sidebar Navigation)
  contentFontScale: number // percentage: 80 to 130, default 100 (Internal Workspace Content)

  // Sidebar Icon Color Configuration ('default' | 'black' | 'primary' | 'orange' | 'blue' | 'emerald' | 'violet' | 'amber' | 'red' | 'muted' | hex)
  sidebarIconColor: string

  setTheme: (theme: string) => void
  setPrimaryColor: (color: string) => void
  setRadius: (radius: string) => void
  setFontScale: (scale: number) => void
  resetFontScale: () => void
  setSidebarFontScale: (scale: number) => void
  resetSidebarFontScale: () => void
  setContentFontScale: (scale: number) => void
  resetContentFontScale: () => void
  resetAllFontScales: () => void
  setSidebarIconColor: (color: string) => void
  resetSidebarIconColor: () => void
  setSidebarStyle: (style: string) => void
  setCustomLogoUrl: (url: string) => void
  setCustomLogoHeight: (height: number) => void
  setCustomLogoSidebarAlign: (align: "left" | "center" | "right") => void
  setCustomLogoSidebarOffset: (offset: number) => void
  setCustomFaviconUrl: (url: string) => void
  setCustomWebLogoUrl: (url: string) => void
  setCustomWebLogoHeight: (height: number) => void
  resetWebLogo: () => void
  setWhatsappNumber: (number: string) => void
  setWhatsappDefaultMessage: (message: string) => void
  setWhatsappEnabled: (enabled: boolean) => void
  resetWhatsapp: () => void
  resetLogo: () => void
  resetToDefaults: () => void
  loadTheme: () => void
}

export const useUIThemeStore = create<UIThemeState>((set) => ({
  theme: "",
  primaryColor: "#ea580c", // default RappiGas brand orange
  radius: "0.625rem",
  fontScale: 100, // 100% default (Global)
  sidebarFontScale: 100, // 100% default (Sidebar Navigation)
  contentFontScale: 100, // 100% default (Internal Content)
  sidebarIconColor: "default", // 'default' | 'black' | 'primary' | 'orange' | 'blue' | 'emerald' | 'violet' | 'amber' | 'red' | 'muted' | hex
  sidebarStyle: "default",
  customLogoUrl: "",
  customLogoHeight: 44, // 44px default
  customLogoSidebarAlign: "left", // Default aligned to the left
  customLogoSidebarOffset: 8, // 8px default padding from left
  customFaviconUrl: "",
  customWebLogoUrl: "",
  customWebLogoHeight: 52, // 52px default (proporcional para cabecera web)
  whatsappNumber: "51999999999",
  whatsappDefaultMessage: "Hola RappiGas, deseo pedir un balón de gas",
  whatsappEnabled: true,

  setTheme: (theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-theme", theme)
    }
    set({ theme })
  },

  setPrimaryColor: (primaryColor) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-primary-color", primaryColor)
    }
    set({ primaryColor })
  },

  setRadius: (radius) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-radius", radius)
    }
    set({ radius })
  },

  setFontScale: (fontScale) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-font-scale", fontScale.toString())
    }
    set({ fontScale })
  },

  resetFontScale: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ui-font-scale")
    }
    set({ fontScale: 100 })
  },

  setSidebarFontScale: (sidebarFontScale) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-sidebar-font-scale", sidebarFontScale.toString())
    }
    set({ sidebarFontScale })
  },

  resetSidebarFontScale: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ui-sidebar-font-scale")
    }
    set({ sidebarFontScale: 100 })
  },

  setContentFontScale: (contentFontScale) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-content-font-scale", contentFontScale.toString())
    }
    set({ contentFontScale })
  },

  resetContentFontScale: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ui-content-font-scale")
    }
    set({ contentFontScale: 100 })
  },

  resetAllFontScales: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ui-font-scale")
      localStorage.removeItem("ui-sidebar-font-scale")
      localStorage.removeItem("ui-content-font-scale")
    }
    set({ fontScale: 100, sidebarFontScale: 100, contentFontScale: 100 })
  },

  setSidebarIconColor: (sidebarIconColor) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-sidebar-icon-color", sidebarIconColor)
    }
    set({ sidebarIconColor })
  },

  resetSidebarIconColor: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ui-sidebar-icon-color")
    }
    set({ sidebarIconColor: "default" })
  },

  setSidebarStyle: (sidebarStyle) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-sidebar-style", sidebarStyle)
    }
    set({ sidebarStyle })
  },

  setCustomLogoUrl: (customLogoUrl) => {
    if (typeof window !== "undefined") {
      try {
        if (customLogoUrl) {
          localStorage.setItem("ui-custom-logo", customLogoUrl)
        } else {
          localStorage.removeItem("ui-custom-logo")
        }
      } catch (err) {
        console.warn("No se pudo guardar ui-custom-logo en localStorage:", err)
      }
    }
    set({ customLogoUrl })
  },

  setCustomLogoHeight: (customLogoHeight) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-custom-logo-height", customLogoHeight.toString())
    }
    set({ customLogoHeight })
  },

  setCustomLogoSidebarAlign: (customLogoSidebarAlign) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-custom-logo-align", customLogoSidebarAlign)
    }
    set({ customLogoSidebarAlign })
  },

  setCustomLogoSidebarOffset: (customLogoSidebarOffset) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-custom-logo-offset", customLogoSidebarOffset.toString())
    }
    set({ customLogoSidebarOffset })
  },

  setCustomFaviconUrl: (customFaviconUrl) => {
    if (typeof window !== "undefined") {
      try {
        if (customFaviconUrl) {
          localStorage.setItem("ui-custom-favicon", customFaviconUrl)
        } else {
          localStorage.removeItem("ui-custom-favicon")
        }
      } catch (err) {
        console.warn("No se pudo guardar ui-custom-favicon en localStorage:", err)
      }
    }
    set({ customFaviconUrl })
  },

  setCustomWebLogoUrl: (customWebLogoUrl) => {
    if (typeof window !== "undefined") {
      try {
        if (customWebLogoUrl) {
          localStorage.setItem("ui-custom-web-logo", customWebLogoUrl)
        } else {
          localStorage.removeItem("ui-custom-web-logo")
        }
      } catch (err) {
        console.warn("No se pudo guardar ui-custom-web-logo en localStorage:", err)
      }
    }
    set({ customWebLogoUrl })
  },

  setCustomWebLogoHeight: (customWebLogoHeight) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-custom-web-logo-height", customWebLogoHeight.toString())
    }
    set({ customWebLogoHeight })
  },

  resetWebLogo: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ui-custom-web-logo")
      localStorage.removeItem("ui-custom-web-logo-height")
    }
    set({
      customWebLogoUrl: "",
      customWebLogoHeight: 52,
    })
  },

  setWhatsappNumber: (whatsappNumber) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-whatsapp-number", whatsappNumber)
    }
    set({ whatsappNumber })
  },

  setWhatsappDefaultMessage: (whatsappDefaultMessage) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-whatsapp-message", whatsappDefaultMessage)
    }
    set({ whatsappDefaultMessage })
  },

  setWhatsappEnabled: (whatsappEnabled) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-whatsapp-enabled", String(whatsappEnabled))
    }
    set({ whatsappEnabled })
  },

  resetWhatsapp: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ui-whatsapp-number")
      localStorage.removeItem("ui-whatsapp-message")
      localStorage.removeItem("ui-whatsapp-enabled")
    }
    set({
      whatsappNumber: "51999999999",
      whatsappDefaultMessage: "Hola RappiGas, deseo pedir un balón de gas",
      whatsappEnabled: true,
    })
  },

  resetLogo: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ui-custom-logo")
      localStorage.removeItem("ui-custom-logo-height")
      localStorage.removeItem("ui-custom-web-logo")
      localStorage.removeItem("ui-custom-web-logo-height")
      localStorage.removeItem("ui-custom-logo-align")
      localStorage.removeItem("ui-custom-logo-offset")
      localStorage.removeItem("ui-custom-favicon")
    }
    set({
      customLogoUrl: "",
      customLogoHeight: 44,
      customLogoSidebarAlign: "left",
      customLogoSidebarOffset: 8,
      customFaviconUrl: "",
    })
  },

  resetToDefaults: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ui-theme")
      localStorage.removeItem("ui-primary-color")
      localStorage.removeItem("ui-radius")
      localStorage.removeItem("ui-font-scale")
      localStorage.removeItem("ui-sidebar-font-scale")
      localStorage.removeItem("ui-content-font-scale")
      localStorage.removeItem("ui-sidebar-style")
      localStorage.removeItem("ui-custom-logo")
      localStorage.removeItem("ui-custom-logo-height")
      localStorage.removeItem("ui-custom-web-logo")
      localStorage.removeItem("ui-custom-web-logo-height")
      localStorage.removeItem("ui-custom-logo-align")
      localStorage.removeItem("ui-custom-logo-offset")
      localStorage.removeItem("ui-custom-favicon")
      localStorage.removeItem("ui-sidebar-icon-color")
      localStorage.removeItem("ui-whatsapp-number")
      localStorage.removeItem("ui-whatsapp-message")
      localStorage.removeItem("ui-whatsapp-enabled")
    }
    set({
      theme: "",
      primaryColor: "#ea580c",
      radius: "0.625rem",
      fontScale: 100,
      sidebarFontScale: 100,
      contentFontScale: 100,
      sidebarIconColor: "default",
      sidebarStyle: "default",
      customLogoUrl: "",
      customLogoHeight: 44,
      customLogoSidebarAlign: "left",
      customLogoSidebarOffset: 8,
      customFaviconUrl: "",
      whatsappNumber: "51999999999",
      whatsappDefaultMessage: "Hola RappiGas, deseo pedir un balón de gas",
      whatsappEnabled: true,
    })
  },

  loadTheme: () => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("ui-theme") || ""
      const savedPrimary = localStorage.getItem("ui-primary-color") || "#ea580c"
      const savedRadius = localStorage.getItem("ui-radius") || "0.625rem"
      const savedFontScale = localStorage.getItem("ui-font-scale")
      const savedSidebarFontScale = localStorage.getItem("ui-sidebar-font-scale")
      const savedContentFontScale = localStorage.getItem("ui-content-font-scale")
      const savedSidebarIconColor = localStorage.getItem("ui-sidebar-icon-color") || "default"
      const savedSidebar = localStorage.getItem("ui-sidebar-style") || "default"
      const savedLogo = localStorage.getItem("ui-custom-logo") || ""
      const savedLogoHeight = localStorage.getItem("ui-custom-logo-height")
      const savedWebLogo = localStorage.getItem("ui-custom-web-logo") || ""
      const savedWebLogoHeight = localStorage.getItem("ui-custom-web-logo-height")
      const savedLogoAlign = localStorage.getItem("ui-custom-logo-align") as "left" | "center" | "right" | null
      const savedLogoOffset = localStorage.getItem("ui-custom-logo-offset")
      const savedFavicon = localStorage.getItem("ui-custom-favicon") || ""
      const savedWhatsappNumber = localStorage.getItem("ui-whatsapp-number") || "51999999999"
      const savedWhatsappMsg = localStorage.getItem("ui-whatsapp-message") || "Hola RappiGas, deseo pedir un balón de gas"
      const savedWhatsappEnabled = localStorage.getItem("ui-whatsapp-enabled") !== "false"

      set({
        theme: savedTheme,
        primaryColor: savedPrimary,
        radius: savedRadius,
        fontScale: savedFontScale ? parseInt(savedFontScale, 10) : 100,
        sidebarFontScale: savedSidebarFontScale ? parseInt(savedSidebarFontScale, 10) : 100,
        contentFontScale: savedContentFontScale ? parseInt(savedContentFontScale, 10) : 100,
        sidebarIconColor: savedSidebarIconColor,
        sidebarStyle: savedSidebar,
        customLogoUrl: savedLogo,
        customLogoHeight: savedLogoHeight ? parseInt(savedLogoHeight, 10) : 44,
        customWebLogoUrl: savedWebLogo,
        customWebLogoHeight: savedWebLogoHeight ? parseInt(savedWebLogoHeight, 10) : 52,
        customLogoSidebarAlign: savedLogoAlign || "left",
        customLogoSidebarOffset: savedLogoOffset ? parseInt(savedLogoOffset, 10) : 8,
        customFaviconUrl: savedFavicon,
        whatsappNumber: savedWhatsappNumber,
        whatsappDefaultMessage: savedWhatsappMsg,
        whatsappEnabled: savedWhatsappEnabled,
      })
    }
  },
}))

export interface SidebarIconColorOption {
  id: string
  nombre: string
  desc: string
  hex?: string
  bgPreview: string
  borderPreview?: string
}

export const SIDEBAR_ICON_COLORS: SidebarIconColorOption[] = [
  {
    id: "default",
    nombre: "Original / Multicolor",
    desc: "Colores temáticos por sección (predeterminado)",
    bgPreview: "bg-gradient-to-tr from-orange-500 via-sky-500 to-emerald-500",
  },
  {
    id: "black",
    nombre: "Negro / Monocromático",
    desc: "Negro de alto contraste (blanco en modo oscuro)",
    bgPreview: "bg-neutral-950 dark:bg-neutral-100",
    borderPreview: "border-neutral-700",
  },
  {
    id: "primary",
    nombre: "Primario del Sistema",
    desc: "Color primario activo de la marca",
    bgPreview: "bg-primary",
  },
  {
    id: "orange",
    nombre: "Naranja RappiGas",
    desc: "Tono enérgico oficial (#EA580C)",
    hex: "#ea580c",
    bgPreview: "bg-orange-500",
  },
  {
    id: "blue",
    nombre: "Azul Corporativo",
    desc: "Tono ejecutivo de confianza (#2563EB)",
    hex: "#2563eb",
    bgPreview: "bg-blue-600",
  },
  {
    id: "emerald",
    nombre: "Verde Esmeralda",
    desc: "Seguridad y pesaje exacto (#059669)",
    hex: "#059669",
    bgPreview: "bg-emerald-600",
  },
  {
    id: "violet",
    nombre: "Violeta Moderno",
    desc: "Estilo digital refinado (#7C3AED)",
    hex: "#7c3aed",
    bgPreview: "bg-violet-600",
  },
  {
    id: "amber",
    nombre: "Ámbar Cálido",
    desc: "Llama dorada comercial (#D97706)",
    hex: "#d97706",
    bgPreview: "bg-amber-500",
  },
  {
    id: "red",
    nombre: "Rojo Carmesí",
    desc: "Alta urgencia y dinamismo (#DC2626)",
    hex: "#dc2626",
    bgPreview: "bg-red-600",
  },
  {
    id: "muted",
    nombre: "Gris Neutro",
    desc: "Minimalismo sobrio y atenuado",
    bgPreview: "bg-muted-foreground",
  },
]

/**
 * Clones and applies the configured icon color override to sidebar icons
 * without introducing wrapper <div>/<span> elements, ensuring that
 * icon-only collapsed sidebar mode retains its exact layout and visibility.
 */
export function renderSidebarIcon(icon: React.ReactNode, colorMode?: string): React.ReactNode {
  if (!icon || !React.isValidElement(icon)) return icon
  if (!colorMode || colorMode === "default") return icon

  const el = icon as React.ReactElement<{ className?: string; style?: React.CSSProperties }>

  if (colorMode.startsWith("#")) {
    return React.cloneElement(el, {
      style: { ...(el.props.style || {}), color: colorMode },
      className: cn(el.props.className, "!text-[currentColor]"),
    })
  }

  const colorClassMap: Record<string, string> = {
    black: "!text-neutral-950 dark:!text-neutral-100",
    primary: "!text-primary",
    orange: "!text-orange-500",
    blue: "!text-blue-500",
    emerald: "!text-emerald-500",
    violet: "!text-violet-500",
    amber: "!text-amber-500",
    red: "!text-red-500",
    muted: "!text-muted-foreground",
  }

  const colorClass = colorClassMap[colorMode]
  if (!colorClass) return icon

  return React.cloneElement(el, {
    className: cn(el.props.className, colorClass),
  })
}