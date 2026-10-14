"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  empresasApi,
  RegistroEmpresaPayload,
} from "@/librerias/api/empresas.api";
import {
  Flame,
  CheckCircle,
} from "@boxicons/react";

export default function RegistroEmpresaPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const [form, setForm] = useState<RegistroEmpresaPayload>({
    ruc: "",
    nombreComercial: "",
    razonSocial: "",
    telefono: "",
    emailContacto: "",
    direccionFiscal: "",
    adminNombres: "",
    adminApellidos: "",
    adminEmail: "",
    adminPassword: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación básica en frontend
    if (!/^(10|20)\d{9}$/.test(form.ruc)) {
      setError("El RUC debe tener exactamente 11 dígitos y comenzar con 10 o 20.");
      return;
    }

    if (form.adminPassword.length < 6) {
      setError("La contraseña de administrador debe tener al menos 6 caracteres.");
      return;
    }

    startTransition(async () => {
      try {
        await empresasApi.registrarEmpresa(form);
        setExito(true);
      } catch (err: any) {
        setError(err.message || "Error al afiliar la empresa.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex justify-center items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-500/30">
            <Flame className="size-7" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Pide<span className="text-orange-600">Gas</span>
          </span>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Afiliación de Distribuidora de Gas
        </h2>
        <p className="mt-1 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Únete a la red digital de gas y gestiona pedidos, rutas y repartidores en tiempo real.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4 sm:px-0">
        <div className="bg-card text-card-foreground border shadow-sm rounded-2xl p-8">
          {exito ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle className="size-10" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                ¡Solicitud de Afiliación Recibida!
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                Tu empresa ha sido registrada en estado <strong>PENDIENTE</strong>. Nuestro equipo de administración verificará los datos con SUNAT y Osinergmin para activar tu cuenta.
              </p>
              <div className="pt-4">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition"
                >
                  Ir al Inicio de Sesión
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl text-sm bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                  {error}
                </div>
              )}

              {/* Sección Datos de la Empresa */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-3">
                  1. Información de la Distribuidora
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      RUC (11 dígitos) *
                    </label>
                    <input
                      name="ruc"
                      type="text"
                      maxLength={11}
                      required
                      placeholder="Ej. 20601234567"
                      value={form.ruc}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background font-mono dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Nombre Comercial *
                    </label>
                    <input
                      name="nombreComercial"
                      type="text"
                      required
                      placeholder="Ej. Solgas Los Olivos"
                      value={form.nombreComercial}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Razón Social (según SUNAT)
                    </label>
                    <input
                      name="razonSocial"
                      type="text"
                      placeholder="Ej. Distribuidora Solgas Norte SAC"
                      value={form.razonSocial}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Teléfono de Pedidos *
                    </label>
                    <input
                      name="telefono"
                      type="tel"
                      required
                      placeholder="+51 987 654 321"
                      value={form.telefono}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Email Comercial / Facturación *
                    </label>
                    <input
                      name="emailContacto"
                      type="email"
                      required
                      placeholder="contacto@miempresa.pe"
                      value={form.emailContacto}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Dirección Fiscal / Sede Central
                    </label>
                    <input
                      name="direccionFiscal"
                      type="text"
                      placeholder="Av. Principal 123, Distrito, Lima"
                      value={form.direccionFiscal}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Sección Administrador de la Distribuidora */}
              <div className="pt-4 border-t dark:border-neutral-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-3">
                  2. Cuenta del Administrador de la Distribuidora
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Nombres del Responsable *
                    </label>
                    <input
                      name="adminNombres"
                      type="text"
                      required
                      placeholder="Juan"
                      value={form.adminNombres}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Apellidos del Responsable *
                    </label>
                    <input
                      name="adminApellidos"
                      type="text"
                      required
                      placeholder="Pérez"
                      value={form.adminApellidos}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Email de Acceso al Panel *
                    </label>
                    <input
                      name="adminEmail"
                      type="email"
                      required
                      placeholder="admin@miempresa.pe"
                      value={form.adminEmail}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Contraseña *
                    </label>
                    <input
                      name="adminPassword"
                      type="password"
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={form.adminPassword}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t dark:border-neutral-800 flex items-center justify-between">
                <Link
                  href="/auth/login"
                  className="text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </Link>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                  {isPending ? "Procesando registro..." : "Enviar Solicitud"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
