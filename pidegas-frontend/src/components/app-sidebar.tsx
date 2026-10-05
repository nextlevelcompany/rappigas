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
  MessageCircleQuestionMark,
} from "@boxicons/react";
import { Truck, ShoppingBag, Navigation, Globe } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

// Secciones modulares de navegación PideGas
const seccionSuperAdmin = {
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
};

const seccionSupervisionAdmin = {
  title: "Supervisión Operativa",
  url: "#",
  icon: <Truck className="w-5 h-5 text-amber-500" />,
  isActive: false,
  items: [
    {
      title: "Vista Distribuidora",
      url: "/empresa/dashboard",
    },
    {
      title: "Despacho en Vivo",
      url: "/empresa/pedidos",
    },
    {
      title: "Inventario y Kardex",
      url: "/empresa/inventario",
    },
  ],
};

const seccionEmpresa = {
  title: "Distribuidora (Mi Negocio)",
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
};

const seccionRepartidor = {
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
};

const seccionCliente = {
  title: "Área de Clientes",
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
};

const seccionWebPublica = {
  title: "Web Informativa",
  url: "#",
  icon: <Globe className="w-5 h-5 text-slate-400" />,
  isActive: false,
  items: [
    {
      title: "Página de Inicio",
      url: "/",
    },
    {
      title: "Catálogo de Balones",
      url: "/productos",
    },
    {
      title: "Nosotros",
      url: "/nosotros",
    },
    {
      title: "Contacto",
      url: "/contacto",
    },
  ],
};

const navSecondary = [
  {
    title: "Web Principal PideGas",
    url: "/",
    icon: <HomeAlt />,
  },
  {
    title: "Centro de Ayuda / FAQ",
    url: "/contacto",
    icon: <MessageCircleQuestionMark />,
  },
];

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  onHoverChange?: (value: boolean) => void;
};

export function AppSidebar({ onHoverChange, ...props }: AppSidebarProps) {
  const { usuario } = useAuthStore();
  const [montado, setMontado] = React.useState(false);

  React.useEffect(() => {
    setMontado(true);
  }, []);

  const rol = montado ? usuario?.rol : null;

  // Filtrado estricto por rol para que el cliente solo vea opciones de cliente
  let itemsNavegacion = [];

  if (rol === "ADMIN") {
    // Super Admin ve administración global y supervisión
    itemsNavegacion = [seccionSuperAdmin, seccionSupervisionAdmin, seccionWebPublica];
  } else if (rol === "EMPRESA") {
    // Dueño de distribuidora ve únicamente las opciones operativas de su negocio
    itemsNavegacion = [seccionEmpresa, seccionWebPublica];
  } else if (rol === "REPARTIDOR") {
    // Repartidor ve únicamente sus rutas y pedidos
    itemsNavegacion = [seccionRepartidor, seccionWebPublica];
  } else {
    // Cliente o visitante en /cliente/tienda: VE ÚNICAMENTE OPCIONES DE CLIENTE
    itemsNavegacion = [seccionCliente, seccionWebPublica];
  }

  const rutaLogo = rol === "ADMIN"
    ? "/admin/dashboard"
    : rol === "EMPRESA"
    ? "/empresa/dashboard"
    : rol === "REPARTIDOR"
    ? "/repartidor/pedidos"
    : "/cliente/tienda";

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
                <a href={rutaLogo}>
                  <div className="flex aspect-square size-8 items-center justify-center mx-auto rounded-lg bg-orange-600 text-white shadow-md shadow-orange-500/30">
                    <Flame className="size-5" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-extrabold text-base tracking-tight">
                      Pide<span className="text-orange-600">Gas</span>
                    </span>
                    <span className="truncate text-xs text-neutral-400">
                      {rol === "ADMIN"
                        ? "Super Admin"
                        : rol === "EMPRESA"
                        ? "Distribuidora"
                        : rol === "REPARTIDOR"
                        ? "Repartidor"
                        : "Área de Clientes"}
                    </span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* Menú de Navegación Filtrado */}
        <SidebarContent className="overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex min-h-full flex-col">
              <NavMain items={itemsNavegacion} />

              <NavSecondary
                items={navSecondary}
                className="mt-auto px-3 pb-3"
              />
            </div>
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
