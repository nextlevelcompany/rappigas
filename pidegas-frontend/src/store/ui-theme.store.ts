"use client"

import { create } from "zustand"

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
  setTheme: (theme: string) => void
  setPrimaryColor: (color: string) => void
  setRadius: (radius: string) => void
  setSidebarStyle: (style: string) => void
  setCustomLogoUrl: (url: string) => void
  setCustomLogoHeight: (height: number) => void
  setCustomLogoSidebarAlign: (align: "left" | "center" | "right") => void
  setCustomLogoSidebarOffset: (offset: number) => void
  setCustomFaviconUrl: (url: string) => void
  resetLogo: () => void
  resetToDefaults: () => void
  loadTheme: () => void
}

export const useUIThemeStore = create<UIThemeState>((set) => ({
  theme: "",
  primaryColor: "#ea580c", // default PideGas brand orange
  radius: "0.625rem",
  sidebarStyle: "default",
  customLogoUrl: "",
  customLogoHeight: 44, // 44px default
  customLogoSidebarAlign: "left", // Default aligned to the left
  customLogoSidebarOffset: 8, // 8px default padding from left
  customFaviconUrl: "",

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

  setSidebarStyle: (sidebarStyle) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("ui-sidebar-style", sidebarStyle)
    }
    set({ sidebarStyle })
  },

  setCustomLogoUrl: (customLogoUrl) => {
    if (typeof window !== "undefined") {
      if (customLogoUrl) {
        localStorage.setItem("ui-custom-logo", customLogoUrl)
      } else {
        localStorage.removeItem("ui-custom-logo")
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
      if (customFaviconUrl) {
        localStorage.setItem("ui-custom-favicon", customFaviconUrl)
      } else {
        localStorage.removeItem("ui-custom-favicon")
      }
    }
    set({ customFaviconUrl })
  },

  resetLogo: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ui-custom-logo")
      localStorage.removeItem("ui-custom-logo-height")
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
      localStorage.removeItem("ui-sidebar-style")
      localStorage.removeItem("ui-custom-logo")
      localStorage.removeItem("ui-custom-logo-height")
      localStorage.removeItem("ui-custom-logo-align")
      localStorage.removeItem("ui-custom-logo-offset")
      localStorage.removeItem("ui-custom-favicon")
    }
    set({
      theme: "",
      primaryColor: "#ea580c",
      radius: "0.625rem",
      sidebarStyle: "default",
      customLogoUrl: "",
      customLogoHeight: 44,
      customLogoSidebarAlign: "left",
      customLogoSidebarOffset: 8,
      customFaviconUrl: "",
    })
  },

  loadTheme: () => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("ui-theme") || ""
      const savedPrimary = localStorage.getItem("ui-primary-color") || "#ea580c"
      const savedRadius = localStorage.getItem("ui-radius") || "0.625rem"
      const savedSidebar = localStorage.getItem("ui-sidebar-style") || "default"
      const savedLogo = localStorage.getItem("ui-custom-logo") || ""
      const savedLogoHeight = localStorage.getItem("ui-custom-logo-height")
      const savedLogoAlign = localStorage.getItem("ui-custom-logo-align") as "left" | "center" | "right" | null
      const savedLogoOffset = localStorage.getItem("ui-custom-logo-offset")
      const savedFavicon = localStorage.getItem("ui-custom-favicon") || ""

      set({
        theme: savedTheme,
        primaryColor: savedPrimary,
        radius: savedRadius,
        sidebarStyle: savedSidebar,
        customLogoUrl: savedLogo,
        customLogoHeight: savedLogoHeight ? parseInt(savedLogoHeight, 10) : 44,
        customLogoSidebarAlign: savedLogoAlign || "left",
        customLogoSidebarOffset: savedLogoOffset ? parseInt(savedLogoOffset, 10) : 8,
        customFaviconUrl: savedFavicon,
      })
    }
  },
}))