"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  Menu,
  X,
  ShoppingBag,
  Store,
  User,
  Truck,
  Shield,
  Navigation,
  LogOut,
  ChevronRight,
  PhoneCall,
} from "lucide-react";

export function PublicNavbar() {
  const router = useRouter();
  const { usuario, estaAutenticado, cerrarSesion } = useAuthStore();
  const [montado, setMontado] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMontado(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    cerrarSesion();
    router.push("/");
  };

  const usuarioActivo = montado ? usuario : null;
  const autenticadoActivo = montado ? estaAutenticado : false;

  const getRutaPanel = () => {
    if (!usuarioActivo) return "/auth/login";
    switch (usuarioActivo.rol) {
      case "CLIENTE":
        return "/cliente/tienda";
      case "EMPRESA":
        return "/empresa/dashboard";
      case "REPARTIDOR":
        return "/repartidor/pedidos";
      case "ADMIN":
        return "/admin/dashboard";
      default:
        return "/auth/login";
    }
  };

  const getTextoBotonPanel = () => {
    if (!usuarioActivo) return "Iniciar Sesión";
    switch (usuarioActivo.rol) {
      case "CLIENTE":
        return "Mi Cuenta (Cliente)";
      case "EMPRESA":
        return "Panel Distribuidora";
      case "REPARTIDOR":
        return "Mis Entregas";
      case "ADMIN":
        return "Panel Global Admin";
      default:
        return "Mi Panel";
    }
  };

  const getIconoRol = () => {
    if (!usuarioActivo) return <User className="w-4 h-4" />;
    switch (usuarioActivo.rol) {
      case "CLIENTE":
        return <User className="w-4 h-4 text-emerald-400" />;
      case "EMPRESA":
        return <Truck className="w-4 h-4 text-orange-400" />;
      case "REPARTIDOR":
        return <Navigation className="w-4 h-4 text-blue-400" />;
      case "ADMIN":
        return <Shield className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg py-3"
          : "bg-slate-950/60 backdrop-blur-sm border-b border-slate-800/40 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo PideGas */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">
                  Pide<span className="text-orange-500">Gas</span>
                </span>
                <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] py-0 px-1.5 font-bold">
                  GLP Perú
                </Badge>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-medium uppercase -mt-0.5">
                Gas de Cocina Seguro
              </p>
            </div>
          </Link>

          {/* Enlaces de Navegación de Escritorio */}
          <nav className="hidden md:flex items-center gap-7">
            <Link
              href="/"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/nosotros"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Nosotros
            </Link>
            <Link
              href="/productos"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Productos y Balones
            </Link>
            <Link
              href="/contacto"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Contacto
            </Link>
          </nav>

          {/* Botones de Acción Segmentados por Rol */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Botón de Emergencia / Llamada rápida */}
            <a
              href="tel:0180074334"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-orange-400 transition-colors mr-1"
            >
              <PhoneCall className="w-3.5 h-3.5 text-orange-500" />
              <span>(01) 800-PIDE</span>
            </a>

            {/* Botón B2B: Para Dueños de Negocio de Gas */}
            {(!autenticadoActivo || usuarioActivo?.rol !== "EMPRESA") && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold"
              >
                <Link href="/auth/registro-empresa">
                  <Store className="w-3.5 h-3.5 mr-1.5 text-orange-400" />
                  Afiliar Distribuidora
                </Link>
              </Button>
            )}

            {/* Botón para Comprar Gas (Cliente) */}
            <Button
              size="sm"
              asChild
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/30"
            >
              <Link href="/cliente/tienda">
                <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                Pedir Balón de Gas
              </Link>
            </Button>

            {/* Botón de Acceso Inteligente por Rol */}
            {autenticadoActivo && usuarioActivo ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700"
                >
                  <Link href={getRutaPanel()}>
                    <span className="flex items-center gap-1.5">
                      {getIconoRol()}
                      <span>{getTextoBotonPanel()}</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </span>
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                  className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold"
              >
                <Link href="/auth/login">
                  <User className="w-3.5 h-3.5 mr-1.5" />
                  Iniciar Sesión
                </Link>
              </Button>
            )}
          </div>

          {/* Botón Menú Móvil */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              size="sm"
              asChild
              className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold py-1 px-3"
            >
              <Link href="/cliente/tienda">
                <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                Pedir
              </Link>
            </Button>

            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil Desplegable */}
      {menuAbierto && (
        <div className="md:hidden bg-slate-950/95 border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-3 duration-200">
          <nav className="flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setMenuAbierto(false)}
              className="text-sm font-medium text-slate-200 hover:text-orange-400 py-1"
            >
              Inicio
            </Link>
            <Link
              href="/nosotros"
              onClick={() => setMenuAbierto(false)}
              className="text-sm font-medium text-slate-200 hover:text-orange-400 py-1"
            >
              Nosotros
            </Link>
            <Link
              href="/productos"
              onClick={() => setMenuAbierto(false)}
              className="text-sm font-medium text-slate-200 hover:text-orange-400 py-1"
            >
              Productos y Balones de Gas
            </Link>
            <Link
              href="/contacto"
              onClick={() => setMenuAbierto(false)}
              className="text-sm font-medium text-slate-200 hover:text-orange-400 py-1"
            >
              Contacto
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-800 space-y-2.5">
            <Button
              asChild
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm"
            >
              <Link href="/cliente/tienda" onClick={() => setMenuAbierto(false)}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Pedir Balón de Gas Ahora
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
              className="w-full border-slate-700 bg-slate-900 text-slate-200 hover:text-white text-sm"
            >
              <Link href="/auth/registro-empresa" onClick={() => setMenuAbierto(false)}>
                <Store className="w-4 h-4 mr-2 text-orange-400" />
                Afiliar mi Distribuidora GLP
              </Link>
            </Button>

            {autenticadoActivo && usuarioActivo ? (
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="secondary"
                  asChild
                  className="w-full justify-between bg-slate-900 text-slate-200 border border-slate-700"
                >
                  <Link href={getRutaPanel()} onClick={() => setMenuAbierto(false)}>
                    <span className="flex items-center gap-2">
                      {getIconoRol()}
                      <span>{getTextoBotonPanel()}</span>
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleLogout();
                    setMenuAbierto(false);
                  }}
                  className="w-full justify-center"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                asChild
                className="w-full justify-center text-slate-300 hover:text-white hover:bg-slate-900"
              >
                <Link href="/auth/login" onClick={() => setMenuAbierto(false)}>
                  <User className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
