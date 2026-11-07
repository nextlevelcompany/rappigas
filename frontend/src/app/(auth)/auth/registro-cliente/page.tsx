"use client";

import Link from "next/link";
import { RegistroClienteForm } from "@/components/registro-cliente-form";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShieldCheck, Gift, Scale, Clock, Truck } from "lucide-react";

export default function RegistroClientePage() {
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
        <div className="absolute inset-0 bg-background/70 dark:bg-background/85 backdrop-blur-[2px]" />

        {/* Cabecera superior con Logo y badges */}
        <header className="relative z-10 flex shrink-0 items-center justify-between px-6 py-4 lg:px-10">
          <Link href="/" title="Ir a RappiGas" className="flex items-center gap-2 hover:opacity-90 transition">
            <BrandLogo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <p className="rounded-full border border-border bg-background/80 px-4 py-2 text-xs sm:text-sm text-muted-foreground backdrop-blur-sm shadow-xs">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition"
              >
                Iniciar Sesión
              </Link>
            </p>
            <ThemeToggle />
          </div>
        </header>

        {/* Contenedor central con la tarjeta de registro */}
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6">
          <div
            className="w-full max-w-[480px] rounded-xl p-6 sm:p-7 shadow-2xl border border-border bg-background mx-auto"
            style={{ maxWidth: "480px", width: "100%" }}
          >
            <div className="mb-4 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold mb-2">
                <Gift className="size-3.5" />
                <span>Cuenta de Cliente RappiGas</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Crea tu Cuenta de Cliente
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Acumula RappiPuntos en cada balón y canjea premios exclusivos
              </p>
            </div>

            <RegistroClienteForm />
          </div>

          {/* Características destacadas bajo la tarjeta */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground max-w-xl text-center">
            <span className="flex items-center gap-1">
              <Scale className="size-3.5 text-orange-500" />
              Balanza Digital en Puerta
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5 text-blue-500" />
              Delivery en 25-35 min
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              Válvula y Sello Certificado
            </span>
          </div>

          <div className="mt-2 text-[11px] text-muted-foreground">
            ¿Tienes una distribuidora de gas?{" "}
            <Link
              href="/auth/registro-empresa"
              className="text-primary underline hover:text-primary/80 font-semibold"
            >
              Afiliar mi distribuidora aquí
            </Link>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
