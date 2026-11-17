"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Clock, Gift, User, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNavCliente() {
  const pathname = usePathname();

  // Solo mostrar en rutas de cliente y ocultar en pantallas de escritorio (md:hidden)
  if (!pathname?.startsWith("/cliente")) {
    return null;
  }

  const items = [
    {
      label: "Pedir Gas",
      href: "/cliente/tienda",
      icon: Flame,
      activo: pathname === "/cliente/tienda" || pathname === "/cliente/carrito" || pathname === "/cliente/checkout",
    },
    {
      label: "Mis Pedidos",
      href: "/cliente/pedidos",
      icon: Clock,
      activo: pathname === "/cliente/pedidos",
    },
    {
      label: "Puntos & Canjes",
      href: "/cliente/puntos",
      icon: Gift,
      activo: pathname.startsWith("/cliente/puntos") || pathname.startsWith("/cliente/canjes"),
    },
    {
      label: "Mi Perfil",
      href: "/cliente/perfil",
      icon: User,
      activo: pathname === "/cliente/perfil" || pathname === "/cliente/direcciones",
    },
  ];

  return (
    <nav
      id="uber-mobile-bottom-nav"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-2 py-1.5 safe-area-bottom"
    >
      <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 cursor-pointer",
                item.activo
                  ? "text-black dark:text-white font-extrabold scale-102"
                  : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 font-medium"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-full transition-colors mb-0.5",
                  item.activo
                    ? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                    : "text-neutral-400"
                )}
              >
                <Icon className={cn("size-5", item.activo && "stroke-[2.5]")} />
              </div>
              <span className="text-[10px] tracking-tight truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
