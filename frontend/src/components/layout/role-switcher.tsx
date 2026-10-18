"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/librerias/api/auth.api";
import { User, Truck, Navigation, Shield, Loader2 } from "lucide-react";

export function RoleSwitcher() {
  const { usuario, establecerSesion } = useAuthStore();
  const [cargando, setCargando] = useState<string | null>(null);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  const cambiarRol = async (email: string, pass: string, rolNombre: string, rutaDestino?: string) => {
    setCargando(rolNombre);
    try {
      const resp = await authApi.login({ email, password: pass });
      establecerSesion(resp);
      if (rutaDestino) {
        window.location.href = rutaDestino;
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error("Error al cambiar rol:", err);
    } finally {
      setCargando(null);
    }
  };

  if (!montado) {
    return (
      <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-muted/60 rounded-full border border-border/60 text-xs">
        <span className="font-semibold text-muted-foreground mr-1 flex items-center gap-1">
          Rol Activo:
          <span className="inline-flex items-center gap-1 font-bold text-foreground bg-background px-2 py-0.5 rounded-full border shadow-2xs">
            Cargando...
          </span>
        </span>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-muted/60 rounded-full border border-border/60 text-xs">
      <span className="font-semibold text-muted-foreground mr-1 flex items-center gap-1">
        Rol Activo:
        <span className="inline-flex items-center gap-1 font-bold text-foreground bg-background px-2 py-0.5 rounded-full border shadow-2xs">
          {usuario?.rol === "CLIENTE" && <User className="w-3 h-3 text-emerald-500" />}
          {usuario?.rol === "EMPRESA" && <Truck className="w-3 h-3 text-orange-500" />}
          {usuario?.rol === "REPARTIDOR" && <Navigation className="w-3 h-3 text-blue-500" />}
          {usuario?.rol === "ADMIN" && <Shield className="w-3 h-3 text-purple-500" />}
          {usuario ? usuario.rol : "Invitado"}
        </span>
      </span>

      <span className="text-muted-foreground text-[10px]">| Cambiar a:</span>

      <button
        onClick={() => cambiarRol("cliente@pidegas.pe", "ClientePassword123!", "Cliente", "/cliente/tienda")}
        disabled={cargando !== null}
        className={`px-2 py-0.5 rounded-md font-medium transition ${
          usuario?.rol === "CLIENTE"
            ? "bg-emerald-600 text-white font-bold"
            : "hover:bg-background text-muted-foreground hover:text-foreground"
        }`}
      >
        {cargando === "Cliente" ? <Loader2 className="w-3 h-3 animate-spin" /> : "👤 Cliente"}
      </button>

      <button
        onClick={() => cambiarRol("empresa@pidegas.pe", "EmpresaPassword123!", "Distribuidora", "/empresa/pedidos")}
        disabled={cargando !== null}
        className={`px-2 py-0.5 rounded-md font-medium transition ${
          usuario?.rol === "EMPRESA"
            ? "bg-orange-600 text-white font-bold"
            : "hover:bg-background text-muted-foreground hover:text-foreground"
        }`}
      >
        {cargando === "Distribuidora" ? <Loader2 className="w-3 h-3 animate-spin" /> : "🏢 Distribuidora"}
      </button>

      <button
        onClick={() => cambiarRol("repartidor@pidegas.pe", "RepartidorPassword123!", "Repartidor", "/repartidor/pedidos")}
        disabled={cargando !== null}
        className={`px-2 py-0.5 rounded-md font-medium transition ${
          usuario?.rol === "REPARTIDOR"
            ? "bg-blue-600 text-white font-bold"
            : "hover:bg-background text-muted-foreground hover:text-foreground"
        }`}
      >
        {cargando === "Repartidor" ? <Loader2 className="w-3 h-3 animate-spin" /> : "🛵 Repartidor"}
      </button>

      <button
        onClick={() => cambiarRol("admin@pidegas.pe", "AdminPassword123!", "Admin", "/admin/empresas")}
        disabled={cargando !== null}
        className={`px-2 py-0.5 rounded-md font-medium transition ${
          usuario?.rol === "ADMIN"
            ? "bg-purple-600 text-white font-bold"
            : "hover:bg-background text-muted-foreground hover:text-foreground"
        }`}
      >
        {cargando === "Admin" ? <Loader2 className="w-3 h-3 animate-spin" /> : "🛡️ Admin"}
      </button>
    </div>
  );
}
