"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NavMain } from "@/components/nav-main";
import { NavPlain } from "@/components/nav-plain";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BuildingHouse,
  Flame,
  HomeAlt,
  MessageCircleQuestionMark,
} from "@boxicons/react";
import { Truck, ShoppingBag, Navigation, ChartBar, Building, CreditCard, ClipboardList, HelpCircle, Palette, Settings, ShieldCheck, Tag, Package, PackageCheck, Boxes, LayoutDashboard, Gift, LifeBuoy, User, MapPin } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useUIThemeStore } from "@/store/ui-theme.store";
import { BrandLogo } from "@/components/brand-logo";

// Secciones modulares de navegación RappiGas
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
  ],
};

//--- Catálogo de Productos de Distribuidores (Módulo Principal)
const seccionProductosAdmin = {
  title: "PRODUCTOS",
  url: "#",
  icon: <Package className="w-5 h-5" />,
  isActive: false,
  items: [
    { title: "Catálogo de Red", url: "/admin/productos" },
    { title: "Stock y Abastecimiento", url: "/admin/productos/stock" },
    { title: "Estadísticas y Ventas", url: "/admin/productos/estadisticas" },
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
  ],
};

//--- Fidelidad y Premios Section
const seccionFidelidadAdmin = {
  title: "FIDELIDAD",
  url: "#",
  icon: <Gift className="w-5 h-5" />,
  isActive: false,
  items: [
    { title: "Puntos Clientes", url: "/admin/puntos" },
    { title: "Reglas y Tasas", url: "/admin/puntos/configuracion" },
    { title: "Premios", url: "/admin/premios" },
    { title: "Canjes", url: "/admin/canjes" },
  ],
};

//--- Finanzas Section
const seccionFinanzas = {
  title: "FINANZAS",
  url: "#",
  icon: <CreditCard className="w-5 h-5" />, // lucide CreditCard
  isActive: false,
  items: [
    { title: "Comisiones y Billeteras", url: "/admin/suscripciones" },
  ],
};

//--- Monitoreo Operativo Section
const seccionMonitoreo = {
  title: "MONITOREO",
  url: "#",
  icon: <ClipboardList className="w-5 h-5" />, // lucide ClipboardList
  isActive: false,
  items: [
    { title: "Distribuidora", url: "/empresa/dashboard" },
    { title: "Flotas", url: "/empresa/flota" },
    { title: "Kardex", url: "/empresa/inventario" },
  ],
};

//--- Estadísticas Section
const seccionEstadisticas = {
  title: "ESTADÍSTICAS",
  url: "#",
  icon: <ChartBar className="w-5 h-5" />, // lucide ChartBar
  isActive: false,
  items: [
    { title: "Inteligencia de Plataforma", url: "/admin/dashboard" },
    { title: "Ventas y Stock de Red", url: "/admin/productos/estadisticas" },
    { title: "Auditoría Forense", url: "/admin/auditoria" },
  ],
};

//--- Soporte y Atención Section
const seccionSoporteMenu = {
  title: "SOPORTE",
  url: "#",
  icon: <HelpCircle className="w-5 h-5" />, // lucide HelpCircle
  isActive: false,
  items: [
    { title: "Tickets de Soporte", url: "/admin/soporte" },
  ],
};

//--- Configuración y Apariencia Section
const seccionConfiguracion = {
  title: "CONFIGURACIÓN",
  url: "#",
  icon: <Settings className="w-5 h-5" />,
  isActive: false,
  items: [
    { title: "Editar Datos de Plataforma", url: "/admin/datos" },
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
const seccionEmpresaDashboard = {
  title: "DASHBOARD",
  url: "#",
  icon: <LayoutDashboard className="w-5 h-5 text-sky-500" />,
  isActive: false,
  items: [
    {
      title: "Panel General",
      url: "/empresa/dashboard",
    },
  ],
};

const seccionEmpresaDespacho = {
  title: "DESPACHO",
  url: "#",
  icon: <Truck className="w-5 h-5 text-orange-500" />,
  isActive: false,
  items: [
    {
      title: "Despacho en Vivo",
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

const seccionEmpresaInventario = {
  title: "INVENTARIO",
  url: "#",
  icon: <Boxes className="w-5 h-5 text-indigo-500" />,
  isActive: false,
  items: [
    {
      title: "Stock y Kardex",
      url: "/empresa/inventario",
    },
    {
      title: "Catálogo de Balones",
      url: "/empresa/catalogo",
    },
  ],
};

const seccionEmpresaVentas = {
  title: "VENTAS",
  url: "#",
  icon: <Flame className="w-5 h-5 text-amber-500" />,
  isActive: false,
  items: [
    {
      title: "Registro de Ventas",
      url: "/empresa/ventas",
    },
    {
      title: "Promociones y Cupones",
      url: "/empresa/promociones",
    },
  ],
};

const seccionEmpresaFinanzas = {
  title: "FINANZAS",
  url: "#",
  icon: <CreditCard className="w-5 h-5 text-emerald-500" />,
  isActive: false,
  items: [
    {
      title: "Liquidaciones y Métricas",
      url: "/empresa/finanzas",
    },
  ],
};

const seccionEmpresaGestion = {
  title: "GESTIÓN",
  url: "#",
  icon: <ShieldCheck className="w-5 h-5 text-blue-500" />,
  isActive: false,
  items: [
    {
      title: "Mi Distribuidora (Osinergmin)",
      url: "/empresa/mi-empresa",
    },
    {
      title: "Incidencias y Garantías",
      url: "/empresa/soporte",
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

const seccionClienteCompras = {
  title: "COMPRAS",
  url: "#",
  icon: <Flame className="w-5 h-5 text-orange-500" />,
  isActive: true,
  items: [
    {
      title: "Tienda",
      url: "/cliente/tienda",
    },
    {
      title: "Carrito",
      url: "/cliente/carrito",
    },
    {
      title: "Mis Pedidos",
      url: "/cliente/pedidos",
    },
  ],
};

const seccionClienteCuenta = {
  title: "MI CUENTA",
  url: "#",
  icon: <User className="w-5 h-5 text-emerald-500" />,
  isActive: true,
  items: [
    {
      title: "Mis Datos",
      url: "/cliente/perfil",
    },
    {
      title: "Mis Direcciones",
      url: "/cliente/direcciones",
    },
  ],
};

const seccionClienteFidelidad = {
  title: "RAPPIPUNTOS",
  url: "#",
  icon: <Gift className="w-5 h-5 text-amber-500" />,
  isActive: true,
  items: [
    {
      title: "Premios y Canjes",
      url: "/cliente/canjes",
    },
    {
      title: "Mis Puntos",
      url: "/cliente/puntos",
    },
    {
      title: "Historial de Canjes",
      url: "/cliente/canjes/historial",
    },
  ],
};

const seccionClienteSoporte = {
  title: "ATENCIÓN",
  url: "#",
  icon: <LifeBuoy className="w-5 h-5 text-blue-500" />,
  isActive: false,
  items: [
    {
      title: "Soporte y Ayuda",
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
    title: "Web Principal RappiGas",
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
  const pathname = usePathname();
  const { usuario } = useAuthStore();
  const { customLogoSidebarAlign, customLogoSidebarOffset, customFaviconUrl, customLogoUrl } = useUIThemeStore();
  const { state } = useSidebar();
  const faviconActivo = customFaviconUrl || customLogoUrl || "/api/favicon";

  const rolDetectado = pathname?.startsWith("/admin")
    ? "ADMIN"
    : pathname?.startsWith("/empresa")
    ? "EMPRESA"
    : pathname?.startsWith("/repartidor")
    ? "REPARTIDOR"
    : "CLIENTE";

  const rol = usuario?.rol || rolDetectado;

  // Filtrado estricto por rol para que el cliente solo vea opciones de cliente
  let itemsNavegacion = [];

  if (rol === "ADMIN") {
    // Super Admin sees the new structured menu
    itemsNavegacion = [
      seccionDashboard,
      seccionProductosAdmin,
      seccionCRM,
      seccionFidelidadAdmin,
      seccionFinanzas,
      seccionMonitoreo,
      seccionSoporteMenu,
      seccionEstadisticas,
      seccionConfiguracion,
    ];
  } else if (rol === "EMPRESA") {
    // Distribuidora con menú estructurado por áreas con títulos de una sola palabra
    itemsNavegacion = [
      seccionEmpresaDashboard,
      seccionEmpresaDespacho,
      seccionEmpresaInventario,
      seccionEmpresaVentas,
      seccionEmpresaFinanzas,
      seccionEmpresaGestion,
    ];
  } else if (rol === "REPARTIDOR") {
    // Repartidor ve únicamente sus rutas y pedidos
    itemsNavegacion = [seccionRepartidor];
  } else {
    // Cliente o visitante en /cliente/tienda: Menú estructurado por áreas
    itemsNavegacion = [
      seccionClienteCompras,
      seccionClienteCuenta,
      seccionClienteFidelidad,
      seccionClienteSoporte,
    ];
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
      <Sidebar collapsible="icon" {...props} className="shadow-lg z-50 overflow-hidden app-sidebar-scoped">
        {/* Cabecera del Sidebar con Marca RappiGas y Favicon al colapsar */}
        <SidebarHeader className="h-16 justify-center px-3 border-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
          <a
            href={rutaLogo}
            className="flex items-center w-full h-full transition-all duration-150 group-data-[collapsible=icon]:justify-center"
            title="Ir al inicio"
          >
            {/* Modo Expandido: Logotipo Completo */}
            <div
              className={`group-data-[collapsible=icon]:hidden flex items-center w-full ${alignClass}`}
              style={{
                paddingLeft: customLogoSidebarAlign === "left" && state !== "collapsed" ? `${customLogoSidebarOffset ?? 8}px` : undefined,
                paddingRight: customLogoSidebarAlign === "right" && state !== "collapsed" ? `${customLogoSidebarOffset ?? 8}px` : undefined,
              }}
            >
              <BrandLogo size="md" showText={true} className="shrink-0" />
            </div>

            {/* Modo Colapsado: Favicon o Logo Isotipo centrado */}
            <div className="hidden group-data-[collapsible=icon]:!flex items-center justify-center w-full h-full">
              <div className="w-10 h-10 rounded-xl bg-card border border-border/80 flex items-center justify-center p-1.5 shadow-xs hover:border-primary/50 transition-all overflow-hidden shrink-0">
                <img
                  src={faviconActivo}
                  alt="Favicon RappiGas"
                  className="w-7 h-7 object-contain rounded-xs"
                  onError={(e) => {
                    const img = e.currentTarget;
                    if (customLogoUrl && img.src !== customLogoUrl) {
                      img.src = customLogoUrl;
                    } else if (!img.src.includes("/favicon.ico")) {
                      img.src = "/favicon.ico";
                    }
                  }}
                />
              </div>
            </div>
          </a>
        </SidebarHeader>

        {/* Menú de Navegación Filtrado */}
        <SidebarContent className="overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex min-h-full flex-col">
              <NavMain items={itemsNavegacion} />

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
