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
  const {
    theme,
    primaryColor,
    radius,
    fontScale,
    sidebarFontScale,
    contentFontScale,
    customLogoUrl,
    customFaviconUrl,
    loadTheme,
  } = useUIThemeStore()

  // Load theme on mount and listen to cross-tab storage changes
  useEffect(() => {
    loadTheme()

    const handleStorageChange = (e: StorageEvent) => {
      if (
        !e.key ||
        e.key === "ui-custom-favicon" ||
        e.key === "ui-custom-logo" ||
        e.key === "ui-theme" ||
        e.key === "ui-primary-color" ||
        e.key === "ui-radius" ||
        e.key === "ui-font-scale" ||
        e.key === "ui-sidebar-font-scale" ||
        e.key === "ui-content-font-scale" ||
        e.key === "ui-sidebar-icon-color"
      ) {
        loadTheme()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [loadTheme])

  // Apply theme classes, dynamic CSS variables, font scale and favicon
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

    // 5. Apply dynamic global font scale (scales all rem-based typography and UI proportionately)
    if (fontScale && fontScale !== 100) {
      root.style.fontSize = `${fontScale}%`
      root.style.setProperty("--app-font-scale", `${fontScale}%`)
    } else {
      root.style.fontSize = ""
      root.style.removeProperty("--app-font-scale")
    }

    // 6. Apply granular scale for Sidebar Navigation
    if (sidebarFontScale && sidebarFontScale !== 100) {
      const sVal = (sidebarFontScale / 100).toFixed(3)
      root.style.setProperty("--sidebar-scale", sVal)
      root.style.setProperty("--sidebar-font-scale", `${sidebarFontScale}%`)
    } else {
      root.style.removeProperty("--sidebar-scale")
      root.style.removeProperty("--sidebar-font-scale")
    }

    // 7. Apply granular scale for Internal Workspace Content
    if (contentFontScale && contentFontScale !== 100) {
      const cVal = (contentFontScale / 100).toFixed(3)
      root.style.setProperty("--content-scale", cVal)
      root.style.setProperty("--content-font-scale", `${contentFontScale}%`)
    } else {
      root.style.removeProperty("--content-scale")
      root.style.removeProperty("--content-font-scale")
    }

    // 8. Apply dynamic Favicon to document head (removes old tags to force browser tab reload)
    const targetFavicon = customFaviconUrl || customLogoUrl || ""
    applyDynamicFavicon(targetFavicon)
  }, [
    theme,
    primaryColor,
    radius,
    fontScale,
    sidebarFontScale,
    contentFontScale,
    customLogoUrl,
    customFaviconUrl,
  ])

  return <>{children}</>
}

/**
 * Updates favicon links in <head> in place without removing DOM nodes,
 * preventing React hydration and reconciler "Cannot read properties of null (reading 'removeChild')" errors.
 */
export function applyDynamicFavicon(faviconUrl?: string) {
  if (typeof document === "undefined") return

  const target = faviconUrl && faviconUrl.trim() ? faviconUrl.trim() : "/api/favicon"

  // 1. Determine type
  let mimeType = "image/x-icon"
  if (target.startsWith("data:image/svg") || target.endsWith(".svg")) {
    mimeType = "image/svg+xml"
  } else if (target.startsWith("data:image/png") || target.endsWith(".png")) {
    mimeType = "image/png"
  } else if (target.startsWith("data:image/webp") || target.endsWith(".webp")) {
    mimeType = "image/webp"
  } else if (target.startsWith("data:image/jpeg") || target.endsWith(".jpg") || target.endsWith(".jpeg")) {
    mimeType = "image/jpeg"
  }

  // If it's a URL (not data:), append cache buster to guarantee immediate browser re-evaluation
  const finalHref = target.startsWith("data:")
    ? target
    : `${target}${target.includes("?") ? "&" : "?"}v=${Date.now()}`

  // 2. Update existing standard <link rel="icon"> without detaching nodes
  const existingIcons = document.querySelectorAll<HTMLLinkElement>(
    "link[rel*='icon'], link[rel='shortcut icon']"
  )

  if (existingIcons.length > 0) {
    existingIcons.forEach((el) => {
      el.href = finalHref
      if (el.type) el.type = mimeType
    })
  } else {
    try {
      const newIcon = document.createElement("link")
      newIcon.rel = "icon"
      newIcon.type = mimeType
      newIcon.href = finalHref
      document.head.appendChild(newIcon)
    } catch {
      // Safe fallback
    }
  }

  // 3. Update existing <link rel="apple-touch-icon"> without detaching nodes
  const existingApple = document.querySelectorAll<HTMLLinkElement>(
    "link[rel='apple-touch-icon']"
  )

  if (existingApple.length > 0) {
    existingApple.forEach((el) => {
      el.href = finalHref
    })
  } else {
    try {
      const newApple = document.createElement("link")
      newApple.rel = "apple-touch-icon"
      newApple.href = finalHref
      document.head.appendChild(newApple)
    } catch {
      // Safe fallback
    }
  }
}