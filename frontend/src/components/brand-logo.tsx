"use client";

import React, { useState, useEffect } from "react";
import { useUIThemeStore } from "@/store/ui-theme.store";
import { Flame } from "lucide-react";

interface BrandLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark" | "auto";
}

export function BrandLogo({
  className = "",
  iconClassName = "",
  textClassName = "",
  showText = true,
  size = "md",
  variant = "auto",
}: BrandLogoProps) {
  const { customLogoUrl, customLogoHeight, customWebLogoUrl, customWebLogoHeight } = useUIThemeStore();
  const [montado, setMontado] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  const defaultLogo = "/assets/img/logo/Logo_rappi_gas.png";
  const logoUrl = montado ? (customLogoUrl || customWebLogoUrl || defaultLogo) : defaultLogo;
  const baseHeight = montado ? (customLogoHeight || customWebLogoHeight || 52) : 52;

  // Calculamos la altura según el tamaño del contexto
  const computedHeight =
    size === "sm"
      ? Math.round(baseHeight * 0.75)
      : size === "lg"
      ? Math.round(baseHeight * 1.35)
      : baseHeight;

  if (logoUrl && !imgError) {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        <img
          src={logoUrl}
          alt="Logo RappiGas"
          style={{ height: `${computedHeight}px` }}
          className={`w-auto object-contain transition-all ${
            variant === "light" ? "brightness-0 invert drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" : ""
          } ${iconClassName}`}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Logo por defecto con isotipo de llama RappiGas
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`rounded-xl bg-gradient-to-tr from-[#03246b] to-[#1c58d5] flex items-center justify-center shadow-md shadow-blue-900/10 shrink-0 ${
          size === "sm"
            ? "w-8 h-8 rounded-lg"
            : size === "lg"
            ? "w-14 h-14 rounded-xl"
            : "w-11 h-11"
        } ${iconClassName}`}
      >
        <Flame
          className={`${
            size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6"
          } text-orange-400`}
        />
      </div>
      {showText && (
        <div>
          <span
            className={`block font-black tracking-tight leading-tight ${
              variant === "light"
                ? "text-white"
                : variant === "dark"
                ? "text-[#03246b]"
                : "text-foreground"
            } ${
              size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl"
            } ${textClassName}`}
          >
            Rappi<span className="text-orange-600">Gas</span>
          </span>
          <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 -mt-1">
            Distribución Certificada
          </span>
        </div>
      )}
    </div>
  );
}
