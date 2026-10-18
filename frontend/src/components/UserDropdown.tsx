"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth-store";
import {
  LayoutDashboard,
  Building,
  LogOut,
  LogIn,
  Palette,
} from "lucide-react";

export function UserDropdown() {
  const router = useRouter();
  const { usuario, estaAutenticado, cerrarSesion } = useAuthStore();
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  const handleLogout = () => {
    cerrarSesion();
    router.push("/auth/login");
  };

  const usuarioActivo = montado ? usuario : null;
  const autenticadoActivo = montado ? estaAutenticado : false;

  const nombreMostrar = usuarioActivo
    ? `${usuarioActivo.nombres} ${usuarioActivo.apellidos}`
    : "Invitado";
  const rolMostrar = usuarioActivo ? `Rol: ${usuarioActivo.rol}` : "Sin sesión activa";
  const iniciales = usuarioActivo
    ? `${usuarioActivo.nombres?.[0] || ""}${usuarioActivo.apellidos?.[0] || ""}`.toUpperCase() || "PG"
    : "PG";

  const rutaDashboard = usuarioActivo?.rol === "ADMIN"
    ? "/admin/dashboard"
    : usuarioActivo?.rol === "EMPRESA"
    ? "/empresa/dashboard"
    : usuarioActivo?.rol === "REPARTIDOR"
    ? "/repartidor/pedidos"
    : "/cliente/pedidos";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div id="header-user-trigger" className="flex items-center gap-3 cursor-pointer px-3 border-r border-l h-16 ml-3 hover:bg-muted/50 transition">
          <Avatar className="h-9 w-9 bg-orange-600 text-white font-bold text-xs flex items-center justify-center">
            <AvatarFallback className="bg-orange-600 text-white">
              {iniciales}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col gap-0.5 text-left">
            <p className="text-sm font-semibold truncate max-w-[130px]">
              {nombreMostrar}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono">
              {rolMostrar}
            </p>
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 p-3 rounded-xl shadow-xl">
        <DropdownMenuLabel className="border-border rounded-xl border mb-3 bg-muted/40 p-2.5">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-orange-600 text-white font-bold text-xs flex items-center justify-center">
              <AvatarFallback className="bg-orange-600 text-white">
                {iniciales}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{nombreMostrar}</p>
              <p className="text-xs text-muted-foreground truncate font-mono">
                {usuario?.email || "rappigas@pe"}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        {autenticadoActivo ? (
          <>
            <DropdownMenuItem asChild className="gap-2 h-9 cursor-pointer">
              <Link href={rutaDashboard}>
                <LayoutDashboard className="size-4" />
                <span>Panel Principal</span>
              </Link>
            </DropdownMenuItem>

            {usuarioActivo?.rol === "ADMIN" && (
              <DropdownMenuItem asChild className="gap-2 h-9 cursor-pointer">
                <Link href="/admin/empresas">
                  <Building className="size-4" />
                  <span>Distribuidoras de Gas</span>
                </Link>
              </DropdownMenuItem>
            )}

            {usuarioActivo?.rol === "EMPRESA" && (
              <DropdownMenuItem asChild className="gap-2 h-9 cursor-pointer">
                <Link href="/empresa/mi-empresa">
                  <Building className="size-4" />
                  <span>Mi Distribuidora</span>
                </Link>
              </DropdownMenuItem>
            )}

            {usuarioActivo?.rol === "ADMIN" && (
              <DropdownMenuItem asChild className="gap-2 h-9 cursor-pointer">
                <Link href="/admin/configuracion">
                  <Palette className="size-4 text-primary" />
                  <span>Personalizar Temas</span>
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator className="my-2" />

            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full h-8 justify-center gap-2 text-xs font-semibold"
            >
              <LogOut className="size-4" />
              Cerrar Sesión
            </Button>
          </>
        ) : (
          <Button
            variant="default"
            asChild
            className="w-full h-8 justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold"
          >
            <Link href="/auth/login">
              <LogIn className="size-4" />
              Iniciar Sesión
            </Link>
          </Button>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}