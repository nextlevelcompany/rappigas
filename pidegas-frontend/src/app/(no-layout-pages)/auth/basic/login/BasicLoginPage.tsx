"use client";

import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShieldCheck } from "lucide-react";

export default function BasicLoginPage() {
  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="relative flex min-h-svh flex-col bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/7640435/pexels-photo-7640435.jpeg?auto=format&fit=crop&w=2000&q=80')",
        }}
      >
        {/* Capa de overlay luminosa con desenfoque suave (idéntica a Syndron UI) */}
        <div className="absolute inset-0 bg-background/65 dark:bg-background/85 backdrop-blur-[2px]" />

        {/* Cabecera superior con Logo y badge pill estilo Syndron UI */}
        <header className="relative z-10 flex shrink-0 items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" title="Ir a PideGas" className="flex items-center gap-2 hover:opacity-90 transition">
            <BrandLogo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <p className="rounded-full border border-border bg-background/80 px-4 py-2 text-xs sm:text-sm text-muted-foreground backdrop-blur-sm shadow-xs">
              ¿Nuevo aquí?{" "}
              <Link
                href="/auth/registro-empresa"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition"
              >
                Afiliar distribuidora
              </Link>
            </p>
            <ThemeToggle />
          </div>
        </header>

        {/* Contenedor central con la tarjeta de inicio de sesión de Syndron UI */}
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full sm:w-[440px] rounded-xl p-6 sm:p-8 shadow-2xl border border-border bg-background">
            <div className="mb-5 text-center">
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                Iniciar Sesión en PideGas
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Ingresa tus credenciales para acceder a la plataforma
              </p>
            </div>

            <LoginForm />
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
            <span>PideGas Platform © 2026</span>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
