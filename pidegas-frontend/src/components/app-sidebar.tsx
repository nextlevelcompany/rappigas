"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BuildingHouse,
  Flame,
  HomeAlt,
  Lock,
  BookOpen,
  MessageCircleQuestionMark,
  Cart,
} from "@boxicons/react";
import { Truck, ShoppingBag, Navigation } from "lucide-react";

// Estructura de navegación modular de PideGas
const navigationData = {
  navMain: [
    {
      title: "Super Admin",
      url: "#",
      icon: <BuildingHouse />,
      isActive: true,
      items: [
        {
          title: "Panel Global (BI)",
          url: "/admin/dashboard",
        },
        {
          title: "Distribuidoras GLP",
          url: "/admin/empresas",
        },
        {
          title: "Mediación PQRS",
          url: "/admin/soporte",
        },
        {
          title: "Auditoría Forense",
          url: "/admin/auditoria",
        },
      ],
    },
    {
      title: "Distribuidora (Tenant)",
      url: "#",
      icon: <Truck className="w-5 h-5 text-orange-500" />,
      isActive: true,
      items: [
        {
          title: "Panel y Analítica",
          url: "/empresa/dashboard",
        },
        {
          title: "Despacho en Vivo (Pedidos)",
          url: "/empresa/pedidos",
        },
        {
          title: "Flota y Repartidores",
          url: "/empresa/flota",
        },
        {
          title: "Inventario y Balones",
          url: "/empresa/inventario",
        },
        {
          title: "Catálogo de Balones",
          url: "/empresa/catalogo",
        },
        {
          title: "Zonas de Cobertura",
          url: "/empresa/cobertura",
        },
        {
          title: "Promociones y Cupones",
          url: "/empresa/promociones",
        },
        {
          title: "Finanzas y Liquidaciones",
          url: "/empresa/finanzas",
        },
        {
          title: "Incidencias y Garantías",
          url: "/empresa/soporte",
        },
        {
          title: "Mi Distribuidora",
          url: "/empresa/mi-empresa",
        },
      ],
    },
    {
      title: "Repartidor",
      url: "#",
      icon: <Navigation className="w-5 h-5 text-blue-500" />,
      isActive: true,
      items: [
        {
          title: "Ruta y Entregas",
          url: "/repartidor/pedidos",
        },
      ],
    },
    {
      title: "Cliente",
      url: "#",
      icon: <ShoppingBag className="w-5 h-5 text-emerald-500" />,
      isActive: true,
      items: [
        {
          title: "Pedir Balón de Gas",
          url: "/cliente/tienda",
        },
        {
          title: "Mis Pedidos de Gas",
          url: "/cliente/pedidos",
        },
        {
          title: "Mis Puntos de Gas",
          url: "/cliente/puntos",
        },
        {
          title: "Ayuda y Reclamos",
          url: "/cliente/soporte",
        },
      ],
    },
    {
      title: "Acceso y Registro",
      url: "#",
      icon: <Lock />,
      isActive: false,
      items: [
        {
          title: "Iniciar Sesión",
          url: "/auth/login",
        },
        {
          title: "Afiliar Distribuidora",
          url: "/auth/registro-empresa",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Documentación API",
      url: "http://localhost:8080/swagger-ui/index.html",
      icon: <BookOpen />,
    },
    {
      title: "Centro de Ayuda / FAQ",
      url: "/faq",
      icon: <MessageCircleQuestionMark />,
    },
  ],
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  onHoverChange?: (value: boolean) => void;
};

export function AppSidebar({ onHoverChange, ...props }: AppSidebarProps) {
  return (
    <div
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      <Sidebar collapsible="icon" {...props} className="shadow-lg z-50 overflow-hidden">
        {/* Cabecera del Sidebar con Marca PideGas */}
        <SidebarHeader className="h-16 justify-center px-3 border-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="p-2">
                <a href="/dashboard/analytics">
                  <div className="flex aspect-square size-8 items-center justify-center mx-auto rounded-lg bg-orange-600 text-white shadow-md shadow-orange-500/30">
                    <Flame className="size-5" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-extrabold text-base tracking-tight">
                      Pide<span className="text-orange-600">Gas</span>
                    </span>
                    <span className="truncate text-xs text-neutral-400">
                      Plataforma GLP Perú
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Menú de Navegación Activo */}
        <SidebarContent className="overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex min-h-full flex-col">
              <NavMain items={navigationData.navMain} />

              <NavSecondary
                items={navigationData.navSecondary}
                className="mt-auto px-3 pb-3"
              />
            </div>
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
