"use client"

import { useEffect } from "react"
import { useUIThemeStore } from "@/store/ui-theme.store"

const CUSTOM_THEMES = [
  "dark-blue",
  "gaussian-black",
  "semi-dark",
  "sunset-energy",
]

function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace("#", "")
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    // Perceived luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return luminance > 0.6 ? "#09090b" : "#ffffff"
  }
  return "#ffffff"
}

export default function UIThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme, primaryColor, radius, loadTheme } = useUIThemeStore()

  // Load theme on mount
  useEffect(() => {
    loadTheme()
  }, [loadTheme])

  // Apply theme classes and dynamic CSS variables
  useEffect(() => {
    const root = document.documentElement

    // 1. Remove previously applied custom themes
    CUSTOM_THEMES.forEach((t) => root.classList.remove(t))

    // 2. Add current theme if selected
    if (theme) {
      if (theme !== "semi-dark") {
        root.classList.remove("light")
      }
      root.classList.add(theme)
    }

    // 3. Apply custom primary color & ring if defined
    if (primaryColor) {
      const fg = getContrastColor(primaryColor)
      root.style.setProperty("--primary", primaryColor)
      root.style.setProperty("--primary-foreground", fg)
      root.style.setProperty("--ring", primaryColor)
      root.style.setProperty("--sidebar-primary", primaryColor)
      root.style.setProperty("--sidebar-primary-foreground", fg)
      root.style.setProperty("--sidebar-ring", primaryColor)
    } else {
      root.style.removeProperty("--primary")
      root.style.removeProperty("--primary-foreground")
      root.style.removeProperty("--ring")
      root.style.removeProperty("--sidebar-primary")
      root.style.removeProperty("--sidebar-primary-foreground")
      root.style.removeProperty("--sidebar-ring")
    }

    // 4. Apply custom radius
    if (radius) {
      root.style.setProperty("--radius", radius)
    } else {
      root.style.removeProperty("--radius")
    }
  }, [theme, primaryColor, radius])

  return <>{children}</>
}