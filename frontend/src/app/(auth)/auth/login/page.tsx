"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { RegistroClienteForm } from "@/components/registro-cliente-form";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShieldCheck, UserPlus, LogIn, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [tabActiva, setTabActiva] = useState<"login" | "registro">("login");

  useEffect(() => {
    if (searchParams.get("modo") === "registro") {
      setTabActiva("registro");
    }
  }, [searchParams]);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="relative flex min-h-svh flex-col bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/7640435/pexels-photo-7640435.jpeg?auto=format&fit=crop&w=2000&q=80')",
        }}
      >
        {/* Capa de overlay luminosa con desenfoque suave */}
        <div className="absolute inset-0 bg-background/65 dark:bg-background/85 backdrop-blur-[2px]" />

        {/* Cabecera superior con Logo y badge pill */}
        <header className="relative z-10 flex shrink-0 items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" title="Ir a RappiGas" className="flex items-center gap-2 hover:opacity-90 transition">
            <BrandLogo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <p className="rounded-full border border-border bg-background/80 px-4 py-2 text-xs sm:text-sm text-muted-foreground backdrop-blur-sm shadow-xs flex items-center gap-2">
              <span>¿Distribuidor?</span>
              <Link
                href="/auth/registro-empresa"
                className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80 transition"
              >
                Afiliar distribuidora
              </Link>
            </p>
            <ThemeToggle />
          </div>
        </header>

        {/* Contenedor central con la tarjeta */}
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6">
          <div
            className="w-full max-w-[460px] rounded-xl p-6 sm:p-7 shadow-2xl border border-border bg-background mx-auto transition-all"
            style={{ maxWidth: "460px", width: "100%" }}
          >
            {/* Pestañas para alternar entre Iniciar Sesión y Crear Cuenta */}
            <div className="grid grid-cols-2 p-1 bg-muted/60 dark:bg-neutral-800/60 rounded-xl mb-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTabActiva("login")}
                className={cn(
                  "py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  tabActiva === "login"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <LogIn className="size-3.5" />
                <span>Iniciar Sesión</span>
              </button>
              <button
                type="button"
                onClick={() => setTabActiva("registro")}
                className={cn(
                  "py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                  tabActiva === "registro"
                    ? "bg-background text-orange-600 dark:text-orange-400 shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <UserPlus className="size-3.5" />
                <span>Crear Cuenta</span>
                <span className="text-[9.5px] bg-orange-500/15 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full font-bold">
                  Puntos
                </span>
              </button>
            </div>

            {/* Cabecera del formulario */}
            <div className="mb-4 text-center">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {tabActiva === "login"
                  ? "Iniciar Sesión en RappiGas"
                  : "Crear Cuenta de Cliente"}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {tabActiva === "login"
                  ? "Ingresa tus credenciales para acceder a la plataforma"
                  : "Regístrate gratis para pedir gas, acumular puntos y canjear premios"}
              </p>
            </div>

            {tabActiva === "login" ? (
              <LoginForm onSwitchToRegister={() => setTabActiva("registro")} />
            ) : (
              <RegistroClienteForm onSwitchToLogin={() => setTabActiva("login")} />
            )}
          </div>

          {/* Pie de página sutil bajo la tarjeta */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              Conexión SSL Segura
            </span>
            <span>•</span>
            <span>Normativa Osinergmin</span>
            <span>•</span>
            <span>RappiGas Platform © 2026</span>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
