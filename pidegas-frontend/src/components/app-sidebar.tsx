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
import { Truck, ShoppingBag, Navigation, ChartBar, Building, CreditCard, ClipboardList, HelpCircle, Palette, Settings, ShieldCheck, Tag, PackageCheck } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useUIThemeStore } from "@/store/ui-theme.store";
import { BrandLogo } from "@/components/brand-logo";

// Secciones modulares de navegación PideGas
//--- Dashboard Section

const seccionDashboard = {
  title: "DASHBOARD",
  url: "#",
  icon: <ChartBar className="w-5 h-5" />, // using lucide icon
  isActive: false,
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
  isActive: false,
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
  isActive: false,
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
  isActive: false,
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
  isActive: false,
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
  isActive: false,
  items: [
    { title: "Soporte", url: "/admin/soporte" },
    { title: "Comunicaciones", url: "/admin/comunicaciones" },
    { title: "Base de Conocimientos", url: "/admin/knowledge-base" },
  ],
};

//--- Configuración y Apariencia Section
const seccionConfiguracion = {
  title: "CONFIGURACIÓN",
  url: "#",
  icon: <Palette className="w-5 h-5" />,
  isActive: false,
  items: [
    { title: "Temas y Colores", url: "/admin/configuracion" },
    { title: "Auditoría Forense", url: "/admin/auditoria" },
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

//--- Secciones estructuradas para Empresa / Distribuidora de Gas
const seccionEmpresaOperaciones = {
  title: "PEDIDOS Y DESPACHO",
  url: "#",
  icon: <Truck className="w-5 h-5 text-orange-500" />,
  isActive: false,
  items: [
    {
      title: "Despacho en Vivo (Pedidos)",
      url: "/empresa/pedidos",
    },
    {
      title: "Flota y Repartidores",
      url: "/empresa/flota",
    },
    {
      title: "Zonas de Cobertura GPS",
      url: "/empresa/cobertura",
    },
  ],
};

const seccionEmpresaVentas = {
  title: "VENTAS Y FACTURACIÓN",
  url: "#",
  icon: <Flame className="w-5 h-5 text-amber-500" />,
  isActive: false,
  items: [
    {
      title: "Registro de Ventas",
      url: "/empresa/ventas",
    },
    {
      title: "Catálogo de Balones",
      url: "/empresa/catalogo",
    },
    {
      title: "Promociones y Cupones",
      url: "/empresa/promociones",
    },
    {
      title: "Inventario y Kardex",
      url: "/empresa/inventario",
    },
  ],
};

const seccionEmpresaFinanzas = {
  title: "FINANZAS Y ANALÍTICA",
  url: "#",
  icon: <CreditCard className="w-5 h-5 text-emerald-500" />,
  isActive: false,
  items: [
    {
      title: "Panel y Analítica",
      url: "/empresa/dashboard",
    },
    {
      title: "Finanzas y Liquidaciones",
      url: "/empresa/finanzas",
    },
  ],
};

const seccionEmpresaGestion = {
  title: "CALIDAD Y MI EMPRESA",
  url: "#",
  icon: <ShieldCheck className="w-5 h-5 text-blue-500" />,
  isActive: false,
  items: [
    {
      title: "Incidencias y Garantías",
      url: "/empresa/soporte",
    },
    {
      title: "Mi Distribuidora (Osinergmin)",
      url: "/empresa/mi-empresa",
    },
  ],
};

const seccionRepartidor = {
  title: "Repartidor",
  url: "#",
  icon: <Navigation className="w-5 h-5 text-blue-500" />,
  isActive: false,
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
  isActive: false,
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
    title: "Temas y Colores",
    url: "/admin/configuracion",
    icon: <Palette className="w-5 h-5 text-primary" />,
  },
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
  const { customLogoSidebarAlign, customLogoSidebarOffset } = useUIThemeStore();
  const [montado, setMontado] = React.useState(false);

  React.useEffect(() => {
    setMontado(true);
  }, []);

  const rol = montado ? usuario?.rol : null;

  // Filtrado estricto por rol para que el cliente solo vea opciones de cliente
  let itemsNavegacion = [];

  if (rol === "ADMIN") {
    // Super Admin sees the new structured menu
    itemsNavegacion = [seccionDashboard, seccionCRM, seccionFinanzas, seccionMonitoreo, seccionSoporteMenu, seccionEstadisticas, seccionConfiguracion];
  } else if (rol === "EMPRESA") {
    // Distribuidora con menú estructurado por áreas: Pedidos, Ventas, Finanzas y Gestión
    itemsNavegacion = [
      seccionEmpresaOperaciones,
      seccionEmpresaVentas,
      seccionEmpresaFinanzas,
      seccionEmpresaGestion,
    ];
  } else if (rol === "REPARTIDOR") {
    // Repartidor ve únicamente sus rutas y pedidos
    itemsNavegacion = [seccionRepartidor];
  } else {
    // Cliente o visitante en /cliente/tienda: VE ÚNICAMENTE OPCIONES DE CLIENTE
    itemsNavegacion = [seccionCliente];
  }

  const navSecondaryFiltrado = navSecondary.filter((item) => {
    if (item.url === "/admin/configuracion") {
      return rol === "ADMIN";
    }
    return true;
  });

  const rutaLogo = rol === "ADMIN"
    ? "/admin/dashboard"
    : rol === "EMPRESA"
    ? "/empresa/dashboard"
    : rol === "REPARTIDOR"
    ? "/repartidor/pedidos"
    : "/cliente/tienda";

  const alignClass =
    customLogoSidebarAlign === "center"
      ? "justify-center"
      : customLogoSidebarAlign === "right"
      ? "justify-end"
      : "justify-start";

  return (
    <div
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      <Sidebar collapsible="icon" {...props} className="shadow-lg z-50 overflow-hidden">
        {/* Cabecera del Sidebar con Marca PideGas y Alineación Dinámica */}
        <SidebarHeader className="h-16 justify-center px-3 border-0">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="p-0 hover:bg-transparent">
                <a
                  href={rutaLogo}
                  className={`flex items-center w-full transition-all duration-150 ${alignClass}`}
                  style={{
                    paddingLeft: customLogoSidebarAlign === "left" ? `${customLogoSidebarOffset ?? 8}px` : undefined,
                    paddingRight: customLogoSidebarAlign === "right" ? `${customLogoSidebarOffset ?? 8}px` : undefined,
                  }}
                >
                  <BrandLogo size="md" showText={false} className="shrink-0" />
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
                items={navSecondaryFiltrado}
                className="mt-auto px-3 pb-3"
              />
            </div>
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}
