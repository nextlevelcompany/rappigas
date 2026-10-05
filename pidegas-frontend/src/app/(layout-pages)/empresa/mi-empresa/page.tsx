"use client";

import React, { useEffect, useState, useTransition } from "react";
import {
  empresasApi,
  EmpresaDetalle,
  ActualizarEmpresaPayload,
} from "@/librerias/api/empresas.api";
import { useAuthStore } from "@/store/auth-store";
import { BuildingHouse, CheckCircle, Save, Timer, XCircle } from "@boxicons/react";

export default function MiEmpresaPage() {
  const { usuario } = useAuthStore();
  const [empresa, setEmpresa] = useState<EmpresaDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error"; texto: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState<ActualizarEmpresaPayload>({
    nombreComercial: "",
    razonSocial: "",
    telefono: "",
    direccionFiscal: "",
  });

  const cargarMiEmpresa = async () => {
    try {
      setCargando(true);
      const res = await empresasApi.obtenerMiEmpresa();
      setEmpresa(res);
      setFormData({
        nombreComercial: res.nombreComercial || "",
        razonSocial: res.razonSocial || "",
        telefono: res.telefono || "",
        direccionFiscal: res.direccionFiscal || "",
      });
    } catch (err: any) {
      setMensaje({
        tipo: "error",
        texto: err.message || "Error al cargar la información de su distribuidora",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMiEmpresa();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const actualizada = await empresasApi.actualizarMiEmpresa(formData);
        setEmpresa(actualizada);
        setMensaje({
          tipo: "exito",
          texto: "Perfil de distribuidora actualizado correctamente.",
        });
      } catch (err: any) {
        setMensaje({
          tipo: "error",
          texto: err.message || "Error al actualizar los datos de la empresa",
        });
      }
    });
  };

  if (cargando) {
    return (
      <div className="p-8 text-center text-neutral-500">
        Cargando perfil comercial de la distribuidora...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b pb-5 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
            Tenant ID: #{usuario?.tenantId || empresa?.id || "1"}
          </span>
          <span className="text-xs text-neutral-500 font-mono">
            RUC: {empresa?.ruc}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-1">
          Perfil de Mi Distribuidora
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Información comercial visible para clientes en la plataforma PideGas.
        </p>
      </div>

      {/* Alerta de Feedback */}
      {mensaje && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-sm ${
            mensaje.tipo === "exito"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <span>{mensaje.texto}</span>
          <button
            onClick={() => setMensaje(null)}
            className="text-xs font-bold hover:underline ml-4"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Estado del Tenant */}
      <div className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <BuildingHouse className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-base">{empresa?.nombreComercial}</h3>
            <p className="text-xs text-neutral-500">{empresa?.emailContacto}</p>
          </div>
        </div>
        <div>
          {empresa?.estado === "APROBADA" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Operativa y Aprobada
            </span>
          )}
          {empresa?.estado === "PENDIENTE" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              <Timer className="w-4 h-4 text-amber-600" />
              En Revisión Documentaria
            </span>
          )}
          {empresa?.estado === "SUSPENDIDA" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              <XCircle className="w-4 h-4 text-rose-600" />
              Cuenta Suspendida
            </span>
          )}
        </div>
      </div>

      {/* Formulario de Datos Comerciales */}
      <form onSubmit={handleSubmit} className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-5">
        <h2 className="text-lg font-semibold">Datos Comerciales y Fiscales</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Nombre Comercial
            </label>
            <input
              type="text"
              required
              value={formData.nombreComercial}
              onChange={(e) =>
                setFormData({ ...formData, nombreComercial: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Razón Social (SUNAT)
            </label>
            <input
              type="text"
              value={formData.razonSocial}
              onChange={(e) =>
                setFormData({ ...formData, razonSocial: e.target.value })
              }
              className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              Teléfono de Pedidos / WhatsApp
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
              placeholder="+51999888777"
              className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
              RUC (No editable)
            </label>
            <input
              type="text"
              disabled
              value={empresa?.ruc || ""}
              className="w-full px-3 py-2 text-sm rounded-lg border bg-neutral-100 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
            Dirección Fiscal / Sede Central
          </label>
          <input
            type="text"
            value={formData.direccionFiscal}
            onChange={(e) =>
              setFormData({ ...formData, direccionFiscal: e.target.value })
            }
            placeholder="Av. Principal 123, Distrito, Lima"
            className="w-full px-3 py-2 text-sm rounded-lg border bg-background dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="pt-4 border-t dark:border-neutral-800 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Guardando cambios..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
