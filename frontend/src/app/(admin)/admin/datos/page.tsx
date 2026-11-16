'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  Scale,
  Flame,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  Truck,
  DollarSign,
  Gift,
  Globe,
  Tag,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { useDatosPlataformaStore, ProductoConfig } from '@/store/datos-plataforma.store';
import { toast } from 'sonner';

export default function AdminDatosPage() {
  const { datos, cargado, actualizarDatos, actualizarProducto, restablecerValores, cargarDesdeStorage } =
    useDatosPlataformaStore();

  const [tabActiva, setTabActiva] = useState<
    'empresa' | 'contacto' | 'productos' | 'metricas' | 'redes'
  >('empresa');

  // Form local state
  const [formState, setFormState] = useState(datos);
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    cargarDesdeStorage();
  }, [cargarDesdeStorage]);

  useEffect(() => {
    if (cargado) {
      setFormState(datos);
    }
  }, [cargado, datos]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: Number(value) || 0 }));
  };

  const handleProductoChange = (id: string, campo: keyof ProductoConfig, valor: any) => {
    setFormState((prev) => ({
      ...prev,
      productos: prev.productos.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)),
    }));
  };

  const handleGuardar = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    actualizarDatos(formState);
    setGuardadoExitoso(true);
    toast.success('¡Datos de la plataforma guardados exitosamente!', {
      description: 'Los cambios se reflejan inmediatamente en la web pública y en el sistema.',
    });
    setTimeout(() => setGuardadoExitoso(false), 3000);
  };

  const handleRestablecer = () => {
    if (
      window.confirm(
        '¿Estás seguro de restablecer todos los datos a sus valores predeterminados originales?'
      )
    ) {
      restablecerValores();
      toast.info('Valores restablecidos a los valores de fábrica de RappiGas');
    }
  };

  const handleCopiarJson = () => {
    navigator.clipboard.writeText(JSON.stringify(formState, null, 2));
    toast.success('Configuración copiada en formato JSON al portapapeles');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 font-sans">
      {/* --------------------------------------------------------------------- */}
      {/* 1. CABECERA DE ADMINISTRACIÓN INTERNA                                 */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-orange-600" />
            <span>Panel de Administración Interna</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Gestión y Edición de Datos de la Plataforma
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Modifica la información corporativa, teléfonos de atención, catálogo de precios, puntos y métricas públicas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopiarJson}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Copiar configuración en formato JSON"
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copiar JSON</span>
          </button>
          <button
            type="button"
            onClick={handleRestablecer}
            className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            title="Restablecer valores predeterminados"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restablecer</span>
          </button>
          <button
            type="button"
            onClick={() => handleGuardar()}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. PESTAÑAS DE NAVEGACIÓN MODULAR                                     */}
      {/* --------------------------------------------------------------------- */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 text-xs font-bold">
        <button
          type="button"
          onClick={() => setTabActiva('empresa')}
          className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer flex items-center gap-2 shrink-0 border-b-2 ${
            tabActiva === 'empresa'
              ? 'border-orange-600 text-orange-600 bg-orange-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Empresa & Fiscalización</span>
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('contacto')}
          className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer flex items-center gap-2 shrink-0 border-b-2 ${
            tabActiva === 'contacto'
              ? 'border-orange-600 text-orange-600 bg-orange-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Contacto & Despacho</span>
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('productos')}
          className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer flex items-center gap-2 shrink-0 border-b-2 ${
            tabActiva === 'productos'
              ? 'border-orange-600 text-orange-600 bg-orange-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Catálogo de Precios & Puntos</span>
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('metricas')}
          className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer flex items-center gap-2 shrink-0 border-b-2 ${
            tabActiva === 'metricas'
              ? 'border-orange-600 text-orange-600 bg-orange-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Métricas Públicas</span>
        </button>

        <button
          type="button"
          onClick={() => setTabActiva('redes')}
          className={`px-4 py-2.5 rounded-t-xl transition cursor-pointer flex items-center gap-2 shrink-0 border-b-2 ${
            tabActiva === 'redes'
              ? 'border-orange-600 text-orange-600 bg-orange-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Redes & Enlaces</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 3. FORMULARIO PRINCIPAL Y PREVISUALIZACIÓN EN VIVO                     */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulario según pestaña activa */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs space-y-6">
          <form onSubmit={(e) => handleGuardar(e)} className="space-y-6">
            {/* TAB 1: EMPRESA & FISCALIZACIÓN */}
            {tabActiva === 'empresa' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Building2 className="w-5 h-5 text-orange-600" />
                  <div>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base">
                      Datos Legales y Registro Osinergmin
                    </h3>
                    <p className="text-xs text-slate-500">
                      Información fiscal mostrada en comprobantes, pie de página y página de contacto.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Nombre Comercial</label>
                    <input
                      type="text"
                      name="nombreComercial"
                      value={formState.nombreComercial}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Razón Social</label>
                    <input
                      type="text"
                      name="razonSocial"
                      value={formState.razonSocial}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">RUC de la Empresa (11 dígitos)</label>
                    <input
                      type="text"
                      name="ruc"
                      value={formState.ruc}
                      onChange={handleInputChange}
                      maxLength={11}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Código SCOP Osinergmin</label>
                    <input
                      type="text"
                      name="codigoScop"
                      value={formState.codigoScop}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Dirección Fiscal / Sede Central</label>
                  <input
                    type="text"
                    name="direccionFiscal"
                    value={formState.direccionFiscal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Departamento</label>
                    <input
                      type="text"
                      name="departamento"
                      value={formState.departamento}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Provincia</label>
                    <input
                      type="text"
                      name="provincia"
                      value={formState.provincia}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Distrito</label>
                    <input
                      type="text"
                      name="distrito"
                      value={formState.distrito}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CONTACTO & DESPACHO */}
            {tabActiva === 'contacto' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Phone className="w-5 h-5 text-orange-600" />
                  <div>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base">
                      Canales Telefónicos y Políticas de Despacho
                    </h3>
                    <p className="text-xs text-slate-500">
                      Números telefónicos, chat de WhatsApp y tiempos de llegada informados a los clientes.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Central Telefónica de Pedidos</label>
                    <input
                      type="text"
                      name="telefonoCentral"
                      value={formState.telefonoCentral}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Número de WhatsApp (con prefijo)</label>
                    <input
                      type="text"
                      name="telefonoWhatsapp"
                      value={formState.telefonoWhatsapp}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Correo Electrónico de Contacto</label>
                    <input
                      type="email"
                      name="correoContacto"
                      value={formState.correoContacto}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Correo para Facturación y Empresas</label>
                    <input
                      type="email"
                      name="correoFacturacion"
                      value={formState.correoFacturacion}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Mensaje Predeterminado para WhatsApp</label>
                  <textarea
                    name="mensajeWhatsapp"
                    value={formState.mensajeWhatsapp}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Horario de Despacho</label>
                    <input
                      type="text"
                      name="horarioDespacho"
                      value={formState.horarioDespacho}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tiempo Mínimo (min)</label>
                    <input
                      type="number"
                      name="tiempoEntregaMin"
                      value={formState.tiempoEntregaMin}
                      onChange={handleNumberChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tiempo Máximo (min)</label>
                    <input
                      type="number"
                      name="tiempoEntregaMax"
                      value={formState.tiempoEntregaMax}
                      onChange={handleNumberChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CATÁLOGO DE PRECIOS Y PUNTOS */}
            {tabActiva === 'productos' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Tag className="w-5 h-5 text-orange-600" />
                  <div>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base">
                      Precios Oficiales de Venta y Acumulación de Puntos
                    </h3>
                    <p className="text-xs text-slate-500">
                      Modifica los precios de lista y los puntos asignados a cada tipo de balón de gas.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {formState.productos.map((prod) => (
                    <div
                      key={prod.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                          <span className="text-xs font-black text-slate-900">{prod.nombre}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold">
                            {prod.badge}
                          </span>
                        </div>
                        <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={prod.activo}
                            onChange={(e) =>
                              handleProductoChange(prod.id, 'activo', e.target.checked)
                            }
                            className="rounded text-orange-600"
                          />
                          <span>Activo en Tienda</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-3 space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Precio (S/)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                              S/
                            </span>
                            <input
                              type="number"
                              step="0.5"
                              value={prod.precio}
                              onChange={(e) =>
                                handleProductoChange(prod.id, 'precio', parseFloat(e.target.value) || 0)
                              }
                              className="w-full pl-8 pr-3 py-1.5 text-xs font-bold font-mono rounded-lg border border-slate-200 bg-white"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3 space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Rappipuntos</label>
                          <input
                            type="number"
                            value={prod.puntos}
                            onChange={(e) =>
                              handleProductoChange(prod.id, 'puntos', parseInt(e.target.value, 10) || 0)
                            }
                            className="w-full px-3 py-1.5 text-xs font-bold font-mono rounded-lg border border-slate-200 bg-white"
                          />
                        </div>

                        <div className="sm:col-span-6 space-y-1">
                          <label className="text-[11px] font-bold text-slate-600">Descripción Corta</label>
                          <input
                            type="text"
                            value={prod.descripcion}
                            onChange={(e) =>
                              handleProductoChange(prod.id, 'descripcion', e.target.value)
                            }
                            className="w-full px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: MÉTRICAS PÚBLICAS */}
            {tabActiva === 'metricas' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  <div>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base">
                      Métricas y Cifras de Confianza del Portal
                    </h3>
                    <p className="text-xs text-slate-500">
                      Indicadores visibles en la cabecera de Nosotros, Cobertura y Home.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Años de Trayectoria</label>
                    <input
                      type="text"
                      name="anosExperiencia"
                      value={formState.anosExperiencia}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Plantas y Distribuidores en Red</label>
                    <input
                      type="text"
                      name="plantasEnRed"
                      value={formState.plantasEnRed}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Departamentos con Cobertura</label>
                    <input
                      type="text"
                      name="departamentosCobertura"
                      value={formState.departamentosCobertura}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Porcentaje de Satisfacción / Pesaje</label>
                    <input
                      type="text"
                      name="porcentajeSatisfaccion"
                      value={formState.porcentajeSatisfaccion}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 font-mono focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Texto de Garantía de Pesaje</label>
                  <input
                    type="text"
                    name="garantiaPesajeTexto"
                    value={formState.garantiaPesajeTexto}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: REDES & ENLACES */}
            {tabActiva === 'redes' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Globe className="w-5 h-5 text-orange-600" />
                  <div>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base">
                      Redes Sociales y Enlaces Oficiales
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enlaces en pie de página y botones directos de atención.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Enlace Facebook</label>
                    <input
                      type="url"
                      name="enlaceFacebook"
                      value={formState.enlaceFacebook}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Enlace Instagram</label>
                    <input
                      type="url"
                      name="enlaceInstagram"
                      value={formState.enlaceInstagram}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Enlace TikTok</label>
                    <input
                      type="url"
                      name="enlaceTiktok"
                      value={formState.enlaceTiktok}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Portal Consulta Osinergmin</label>
                    <input
                      type="url"
                      name="enlaceOsinergmin"
                      value={formState.enlaceOsinergmin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400" suppressHydrationWarning>
                {mounted && formState.ultimaActualizacion
                  ? `Última actualización: ${new Date(formState.ultimaActualizacion).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}`
                  : 'Configuración activa'}
              </span>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Todos los Cambios</span>
              </button>
            </div>
          </form>
        </div>

        {/* Columna Lateral: Previsualización en Vivo de los Datos */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Previsualización en Vivo
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
                RappiGas
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Empresa & RUC</span>
                <p className="font-bold text-white text-sm">{formState.nombreComercial}</p>
                <p className="text-slate-300">{formState.razonSocial}</p>
                <p className="font-mono text-amber-400 text-[11px]">RUC: {formState.ruc}</p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 text-[10px] block">Central de Atención</span>
                <p className="font-mono text-white text-sm font-bold flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-orange-400" />
                  {formState.telefonoCentral}
                </p>
                <p className="font-mono text-emerald-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp: {formState.telefonoWhatsapp}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 text-[10px] block">Tiempos y Delivery</span>
                <p className="text-white font-medium">
                  {formState.tiempoEntregaMin} a {formState.tiempoEntregaMax} minutos
                </p>
                <span className="text-[10px] text-emerald-400 font-bold block">
                  ✓ {formState.costoDeliveryTexto}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <span className="text-slate-400 text-[10px] block">Precios de Balones</span>
                {formState.productos.map((prod) => (
                  <div key={prod.id} className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-300 truncate max-w-[170px]">{prod.nombre}</span>
                    <span className="font-mono font-bold text-amber-400">
                      S/ {prod.precio.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <Link
                href="/productos"
                target="_blank"
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Ver Tienda Pública</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Tarjeta de ayuda */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-1.5 text-xs text-amber-950">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Sincronización Inmediata</span>
            </div>
            <p className="text-amber-900/80 leading-relaxed text-[11px]">
              Al hacer clic en <strong>Guardar Cambios</strong>, los nuevos datos se actualizarán automáticamente en la barra superior, catálogo, página de cobertura y pie de página.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
