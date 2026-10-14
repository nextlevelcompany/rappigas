"use client";

import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavMain } from "@/components/nav-main";
import { NavPlain } from "@/components/nav-plain";
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
import { Truck, ShoppingBag, Navigation, ChartBar, Building, CreditCard, ClipboardList, HelpCircle } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

// Secciones modulares de navegación PideGas
//--- Dashboard Section

const seccionDashboard = {
  title: "DASHBOARD",
  url: "#",
  icon: <ChartBar className="w-5 h-5" />, // using lucide icon
  isActive: true,
  items: [
    {
      title: "Panel Global",
      url: "/admin/dashboard",
    },
    {
      title: "Análisis",
      url: "/admin/dashboard/analytics",
    },
  ],
};

//--- CRM y Empresas Section
const seccionCRM = {
  title: "CRM",
  url: "#",
  icon: <Building className="w-5 h-5" />, // lucide Building
  isActive: true,
  items: [
    { title: "Empresas", url: "/admin/empresas" },
    { title: "Contactos", url: "/admin/contactos" },
    { title: "Contratos y Adendas", url: "/admin/contratos" },
  ],
};

//--- Finanzas Section
const seccionFinanzas = {
  title: "FINANZAS",
  url: "#",
  icon: <CreditCard className="w-5 h-5" />, // lucide CreditCard
  isActive: true,
  items: [
    { title: "Planes", url: "/admin/suscripciones" },
    { title: "Facturación", url: "/admin/facturacion" },
    { title: "Transacciones", url: "/admin/transacciones" },
  ],
};

//--- Monitoreo Operativo Section
const seccionMonitoreo = {
  title: "MONITOREO ",
  url: "#",
  icon: <ClipboardList className="w-5 h-5" />, // lucide ClipboardList
  isActive: true,
  items: [
    { title: "Distribuidora", url: "/empresa/dashboard" },
    { title: "Flotas", url: "/empresa/flota" },
    { title: "Kardex", url: "/empresa/inventario" },
  ],
};

//--- Soporte y Atención Section
const seccionEstadisticas = {
  title: "ESTADISTICAS",
  url: "#",
  icon: <ChartBar className="w-5 h-5" />, // lucide ChartBar
  isActive: true,
  items: [
    { title: "Resumen global", url: "/admin/estadisticas/resumen" },
    { title: "Ingresos por plan", url: "/admin/estadisticas/ingresos" },
    { title: "Uso de la plataforma", url: "/admin/estadisticas/uso" },
    { title: "Auditoría", url: "/admin/estadisticas/auditoria" },
  ],
};

//--- Soporte y Atención Section
const seccionSoporteMenu = {
  title: "SOPORTE",
  url: "#",
  icon: <HelpCircle className="w-5 h-5" />, // lucide HelpCircle
  isActive: true,
  items: [
    { title: "Soporte", url: "/admin/soporte" },
    { title: "Comunicaciones", url: "/admin/comunicaciones" },
    { title: "Base de Conocimientos", url: "/admin/knowledge-base" },
  ],
};


//--- Portales Web Section (already defined later as seccionWebPublica)


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
    // Super Admin sees the new structured menu
    itemsNavegacion = [seccionDashboard, seccionCRM, seccionFinanzas, seccionMonitoreo, seccionSoporteMenu, seccionEstadisticas];
  } else if (rol === "EMPRESA") {
    // Dueño de distribuidora ve únicamente las opciones operativas de su negocio
    itemsNavegacion = [seccionEmpresa];
  } else if (rol === "REPARTIDOR") {
    // Repartidor ve únicamente sus rutas y pedidos
    itemsNavegacion = [seccionRepartidor];
  } else {
    // Cliente o visitante en /cliente/tienda: VE ÚNICAMENTE OPCIONES DE CLIENTE
    itemsNavegacion = [seccionCliente];
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
                {rol === "ADMIN" ? (
                  <NavMain items={itemsNavegacion} />
                ) : (
                  <NavMain items={itemsNavegacion} />
                )}

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
