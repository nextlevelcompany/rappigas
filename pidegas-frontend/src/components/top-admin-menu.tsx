"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

// Define the admin configuration links (same as super admin sidebar items)
const adminLinks = [
  { title: "Panel Global (BI)", url: "/admin/dashboard" },
  { title: "Distribuidoras de Gas", url: "/admin/empresas" },
  { title: "Mediación PQRS", url: "/admin/soporte" },
  { title: "Auditoría Forense", url: "/admin/auditoria" },
  { title: "Gestión de Usuarios", url: "/admin/users" },
  { title: "Gestión de Roles", url: "/admin/roles" },
  { title: "Configuración de Seguridad", url: "/admin/security" },
  { title: "Feature Flags", url: "/admin/feature-flags" },
  { title: "Exportar Datos", url: "/admin/export" },
  { title: "Matriz de Permisos", url: "/admin/permissions" },
];

export function TopAdminMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Settings className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Configuración</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {adminLinks.map((link) => (
          <DropdownMenuItem key={link.url} asChild>
            <Link href={link.url}>{link.title}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
