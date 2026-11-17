"use client";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, Users, Shield, Database, RefreshCcw, FileCog, Code, Key, Server, Palette } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

export function AdminConfigDropdown() {
  const { usuario } = useAuthStore();
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  // Solo se muestra para el Administrador General y en pantallas medianas/grandes para no saturar la cabecera
  if (!montado || usuario?.rol !== "ADMIN") {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id="header-adminconfig-trigger"
          variant="ghost"
          size="icon"
          title="Configuración de Administrador"
          aria-label="Configuración de Administrador"
          className="hidden md:inline-flex h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Settings className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl shadow-xl">
        <DropdownMenuLabel className="font-semibold">Configuración Maestro</DropdownMenuLabel>
        {/* Primary items */}
        <DropdownMenuItem asChild>
          <Link href="/admin/configuracion" className="flex items-center gap-2">
            <Palette className="size-4 text-primary" />
            <span className="font-semibold text-primary">Temas y Colores</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/usuarios" className="flex items-center gap-2">
            <Users className="size-4" />
            Usuarios del Sistema
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/roles" className="flex items-center gap-2">
            <Shield className="size-4" />
            Roles
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/admin/permisos" className="flex items-center gap-2">
            <Key className="size-4" />
            Matriz de Permisos
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Advanced section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs uppercase text-muted-foreground mt-2 mb-1">
            Avanzado
          </DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href="/admin/feature-flags" className="flex items-center gap-2">
              <FileCog className="size-4" />
              Feature Flags
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/seguridad" className="flex items-center gap-2">
              <Shield className="size-4" />
              Seguridad
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/integraciones" className="flex items-center gap-2">
              <Server className="size-4" />
              Integraciones
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {/* Maintenance section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs uppercase text-muted-foreground mt-2 mb-1">
            Mantenimiento
          </DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href="/admin/auditoria" className="flex items-center gap-2">
              <Database className="size-4" />
              Auditoría Forense
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/exportar" className="flex items-center gap-2">
              <RefreshCcw className="size-4" />
              Exportar Datos
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/backups" className="flex items-center gap-2">
              <Database className="size-4" />
              Backups
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
