"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/publico/public-navbar";
import { PublicFooter } from "@/components/publico/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Store,
  ShieldAlert,
} from "lucide-react";

export default function ContactoPage() {
  const [enviado, setEnviado] = useState(false);
  const [formData, setFormData] = useState({
    nombres: "",
    email: "",
    telefono: "",
    tipoConsulta: "CLIENTE",
    mensaje: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      <PublicNavbar />

      <main className="flex-1 pt-24 pb-20">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 text-center space-y-4">
          <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold">
            Canales de Atención Oficial
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Estamos para ayudarte las 24 horas
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Comunícate con nuestro equipo de soporte para pedidos, asistencia técnica con tu válvula o afiliar tu distribuidora a la red.
          </p>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Columna Izquierda: Información y Emergencias */}
            <div className="lg:col-span-5 space-y-6">
              {/* Tarjeta de Emergencias */}
              <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2.5 text-rose-400 font-bold text-base">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>¿Emergencia o Fuga de Gas?</span>
                </div>
                <p className="text-xs text-rose-200/80 leading-relaxed">
                  Si detectas olor a gas en tu cocina, no prendas interruptores ni uses fósforos. Ventila el lugar y llama de inmediato a las líneas de emergencia:
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <a
                    href="tel:116"
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Llamar al 116 (Bomberos)
                  </a>
                  <a
                    href="tel:0180074334"
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 border border-rose-800/80 text-rose-300 font-semibold text-xs"
                  >
                    (01) 800-PIDE
                  </a>
                </div>
              </div>

              {/* Canales Regulares */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-950/80 text-orange-400 flex items-center justify-center shrink-0 border border-orange-800/50">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Central Telefónica y WhatsApp</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Atención comercial y pedidos directos</p>
                    <p className="text-sm font-semibold text-orange-400 mt-1 font-mono">+51 987 654 321</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/80 text-blue-400 flex items-center justify-center shrink-0 border border-blue-800/50">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Correo Electrónico</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Consultas institucionales y corporativas</p>
                    <p className="text-sm font-semibold text-blue-400 mt-1 font-mono">contacto@pidegas.pe</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/50">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Horarios de Despacho</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Lunes a Domingo (incluyendo feriados)</p>
                    <p className="text-xs font-semibold text-emerald-400 mt-1">6:00 AM - 10:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-purple-400 flex items-center justify-center shrink-0 border border-purple-800/50">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Centro de Operaciones</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Av. Los Olivos 1420, Lima Norte, Lima - Perú</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Formulario Interactivo */}
            <div className="lg:col-span-7">
              <Card className="bg-slate-900/90 border-slate-800 p-8 shadow-xl">
                {enviado ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-800">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">¡Mensaje Enviado con Éxito!</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                      Hemos recibido tu solicitud. Un asesor comercial o de soporte técnico te responderá al WhatsApp o correo electrónico proporcionado a la brevedad.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setEnviado(false)}
                      className="border-slate-700 bg-slate-900 text-slate-200 mt-4"
                    >
                      Enviar Otro Mensaje
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-white">Escríbenos tu Consulta</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Respondemos en un plazo promedio de 15 minutos en horario comercial.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Nombres y Apellidos *</label>
                        <input
                          type="text"
                          required
                          value={formData.nombres}
                          onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                          placeholder="Ej. Juan Pérez"
                          className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Teléfono / WhatsApp *</label>
                        <input
                          type="tel"
                          required
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                          placeholder="Ej. 987654321"
                          className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Correo Electrónico *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="tu-correo@ejemplo.com"
                        className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Motivo del Contacto</label>
                      <select
                        value={formData.tipoConsulta}
                        onChange={(e) => setFormData({ ...formData, tipoConsulta: e.target.value })}
                        className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="CLIENTE">Soy Cliente y quiero hacer una consulta sobre balones</option>
                        <option value="EMPRESA">Tengo una Distribuidora de Gas y quiero afiliarme</option>
                        <option value="RECLAMO">Reclamo o Garantía de balón / válvula</option>
                        <option value="OTRO">Otra consulta general</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Mensaje o Detalle *</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.mensaje}
                        onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                        placeholder="Cuéntanos en qué podemos ayudarte..."
                        className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold h-12">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensaje Ahora
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
