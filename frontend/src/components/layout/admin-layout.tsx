"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

import { Menu } from "@boxicons/react"

import { AppSidebar } from "@/components/app-sidebar"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { AppLauncherDropdown } from "@/components/appLauncher-dropdown"
import { ThemeToggle } from "@/components/theme-toggle"
import { GlobalSearch } from "@/components/global-search"
import { UserDropdown } from "@/components/UserDropdown"
import { AdminConfigDropdown } from "@/components/AdminConfigDropdown"
import { CartDropdown } from "@/components/CartDropdown"
import { RoleSwitcher } from "@/components/layout/role-switcher"
import { useAuthStore } from "@/store/auth-store"

import Footer from "@/components/layout/Footer"

import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"
import { Truck, Navigation, ShoppingBag } from "lucide-react"

import { cn } from "@/lib/utils"

function LayoutContent({
  children,
  scrolled,
}: {
  children: React.ReactNode
  scrolled: boolean
}) {
  const pathname = usePathname()
  const { toggleSidebar } = useSidebar()
  const { usuario } = useAuthStore()

  const rolDetectado = pathname?.startsWith("/admin")
    ? "ADMIN"
    : pathname?.startsWith("/empresa")
    ? "EMPRESA"
    : pathname?.startsWith("/repartidor")
    ? "REPARTIDOR"
    : "CLIENTE"

  const rol = usuario?.rol || rolDetectado

  return (
    <SidebarInset>
      <header
        className={cn(
          "sticky top-0 z-40 flex h-16 w-full max-w-full min-w-0 shrink-0 items-center gap-2 border-b px-3 sm:px-6 shadow-sm transition-all duration-200 overflow-x-hidden",
          scrolled
            ? "bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md"
            : "bg-background"
        )}
      >
        {/* Left */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            id="sidebar-toggle-button"
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-10 w-10 rounded-full hover:bg-muted/60 transition-colors"
          >
            <Menu className="size-6 block shrink-0" />
          </Button>

          <GlobalSearch />
        </div>

        {/* Center: Contextual Role Badge or Admin Role Switcher */}
        <div className="mx-auto hidden md:block shrink-0">
          {rol === "ADMIN" ? (
            <RoleSwitcher />
          ) : rol === "EMPRESA" ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-950/60 dark:text-orange-400 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800">
              <Truck className="w-3.5 h-3.5" />
              <span>Panel de Distribuidora</span>
            </div>
          ) : rol === "REPARTIDOR" ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              <Navigation className="w-3.5 h-3.5" />
              <span>Ruta de Reparto</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Área de Clientes • RappiGas</span>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="ml-auto flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <AppLauncherDropdown />
          <NotificationDropdown />
          <CartDropdown />
          <AdminConfigDropdown />
          <UserDropdown />
        </div>
      </header>

      <div className="flex flex-1 flex-col bg-muted w-full max-w-full min-w-0 overflow-x-clip mx-0 text-xs app-content-scoped">
        {children}
      </div>

      <Footer />
    </SidebarInset>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [scrolled, setScrolled] = useState(false)
  const { cargarSesionDesdeStorage } = useAuthStore()

  useEffect(() => {
    cargarSesionDesdeStorage()
  }, [cargarSesionDesdeStorage])

  // Sidebar states
  const [open, setOpen] = useState(true)
  const [hovered, setHovered] = useState(false)

  const isExpanded = open || hovered

  // Header scroll effect
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", onScroll)

    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setOpen(window.innerWidth >= 1024)
    }

    handleResize()

    window.addEventListener("resize", handleResize)

    return () =>
      window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <SidebarProvider
      open={isExpanded}
      onOpenChange={setOpen}
    >
      <AppSidebar onHoverChange={setHovered} />

      <LayoutContent scrolled={scrolled}>
        {children}
      </LayoutContent>
    </SidebarProvider>
  )
}