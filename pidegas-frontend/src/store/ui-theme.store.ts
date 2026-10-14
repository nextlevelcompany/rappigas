"use client"

import { create } from "zustand"

export interface UIThemeState {
  theme: string
  primaryColor: string
  radius: string
  sidebarStyle: string
  setTheme: (theme: string) => void
  setPrimaryColor: (color: string) => void
  setRadius: (radius: string) => void
  setSidebarStyle: (style: string) => void
  resetToDefaults: () => void
  loadTheme: () => void
}

export const useUIThemeStore = create<UIThemeState>((set) => ({
  theme: "",
  primaryColor: "#ea580c", // default PideGas brand orange
  radius: "0.625rem",
  sidebarStyle: "default",

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

  resetToDefaults: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ui-theme")
      localStorage.removeItem("ui-primary-color")
      localStorage.removeItem("ui-radius")
      localStorage.removeItem("ui-sidebar-style")
    }
    set({
      theme: "",
      primaryColor: "#ea580c",
      radius: "0.625rem",
      sidebarStyle: "default",
    })
  },

  loadTheme: () => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("ui-theme") || ""
      const savedPrimary = localStorage.getItem("ui-primary-color") || "#ea580c"
      const savedRadius = localStorage.getItem("ui-radius") || "0.625rem"
      const savedSidebar = localStorage.getItem("ui-sidebar-style") || "default"

      set({
        theme: savedTheme,
        primaryColor: savedPrimary,
        radius: savedRadius,
        sidebarStyle: savedSidebar,
      })
    }
  },
}))