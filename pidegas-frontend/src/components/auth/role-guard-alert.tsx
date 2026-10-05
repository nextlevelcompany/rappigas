"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { authApi } from "@/librerias/api/auth.api";
import { AlertCircle, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

interface RoleGuardAlertProps {
  rolRequerido: "EMPRESA" | "REPARTIDOR" | "CLIENTE" | "ADMIN";
  mensaje?: string;
  onExito?: () => void;
}

const CREDENCIALES: Record<
  "EMPRESA" | "REPARTIDOR" | "CLIENTE" | "ADMIN",
  { email: string; pass: string; etiqueta: string; descripcion: string }
> = {
  EMPRESA: {
    email: "empresa@pidegas.pe",
    pass: "EmpresaPassword123!",
    etiqueta: "Distribuidora (Gas Los Olivos Express)",
    descripcion: "Gestión de pedidos en tiempo real, catálogo de gas, inventario y flota.",
  },
  REPARTIDOR: {
    email: "repartidor@pidegas.pe",
    pass: "RepartidorPassword123!",
    etiqueta: "Repartidor Chofer (Carlos Mendoza)",
    descripcion: "Rutas activas, telemetría GPS y confirmación con código de seguridad.",
  },
  CLIENTE: {
    email: "cliente@pidegas.pe",
    pass: "ClientePassword123!",
    etiqueta: "Cliente Hogar (María Quispe)",
    descripcion: "Compra de balones de cocina, cupones de descuento y puntos acumulados.",
  },
  ADMIN: {
    email: "admin@pidegas.pe",
    pass: "AdminPassword123!",
    etiqueta: "Super Administrador de Plataforma",
    descripcion: "Supervisión global de empresas afiliadas y auditoría del sistema.",
  },
};

export function RoleGuardAlert({
  rolRequerido,
  mensaje = "No tienes permisos suficientes para realizar esta acción con tu rol actual.",
  onExito,
}: RoleGuardAlertProps) {
  const { establecerSesion } = useAuthStore();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const credencial = CREDENCIALES[rolRequerido];

  const handleCambiarRol = async () => {
    try {
      setCargando(true);
      setError(null);
      const res = await authApi.login({
        email: credencial.email,
        password: credencial.pass,
      });
      establecerSesion(res);
      if (onExito) {
        onExito();
      } else {
        window.location.reload();
      }
    } catch {
      setError("No se pudo iniciar sesión automática. Verifique credenciales o servidor backend.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-6 my-6 text-foreground backdrop-blur-sm shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-amber-700 dark:text-amber-300">
              Vista restringida a {credencial.etiqueta}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">{mensaje}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Perfil: <span className="font-medium">{credencial.descripcion}</span>
            </p>
            {error && (
              <p className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleCambiarRol}
          disabled={cargando}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-sm shrink-0 disabled:opacity-50"
        >
          {cargando ? (
            "Cambiando rol..."
          ) : (
            <>
              Cambiar a {rolRequerido}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
