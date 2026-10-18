"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/publico/public-navbar";
import { PublicFooter } from "@/components/publico/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, ShieldCheck, Send, FileText } from "lucide-react";

export default function LibroReclamacionesPage() {
  const [enviado, setEnviado] = useState(false);
  const [numeroReclamo, setNumeroReclamo] = useState("");
  const [tipoIncidencia, setTipoIncidencia] = useState<"RECLAMO" | "QUEJA">("RECLAMO");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correlativo = `REC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    setNumeroReclamo(correlativo);
    setEnviado(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      <PublicNavbar />

      <main className="flex-1 pt-24 pb-20">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 text-center space-y-4">
          <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
            Normativa Indecopi • Ley N° 29571
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Libro de Reclamaciones Virtual
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            RappiGas Perú S.A.C. • RUC: 20608945123 • Conforme a lo establecido en el Código de Protección y Defensa del Consumidor.
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <Card className="bg-slate-900/80 border-slate-800 p-6 sm:p-10 shadow-xl">
            {enviado ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-800">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                  Código de Registro: {numeroReclamo}
                </Badge>
                <h3 className="text-2xl font-bold text-white">Constancia de Reclamación Generada</h3>
                <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  Su hoja de reclamación ha sido registrada en nuestro sistema de atención al consumidor. Conforme a la legislación vigente, le brindaremos respuesta motivada a su correo en un plazo no mayor a 15 días hábiles.
                </p>
                <div className="pt-4">
                  <Button asChild className="bg-orange-600 hover:bg-orange-500 text-white font-bold">
                    <Link href="/">Volver al Inicio</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Diferenciación Reclamo vs Queja */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
                  <p>
                    <strong className="text-white">Reclamo:</strong> Disconformidad relacionada directamente a los bienes o servicios adquiridos (ej. balón con fuga, peso incompleto, cobro no reconocido).
                  </p>
                  <p>
                    <strong className="text-white">Queja:</strong> Malestar o descontento respecto a la atención al público (ej. tardanza en despacho, trato inadecuado).
                  </p>
                </div>

                {/* Datos del Consumidor */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                    1. Identificación del Consumidor Reclamante
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Nombres y Apellidos *</label>
                      <input
                        type="text"
                        required
                        placeholder="Juan Pérez"
                        className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Documento de Identidad (DNI / CE) *</label>
                      <input
                        type="text"
                        required
                        placeholder="DNI de 8 dígitos"
                        className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Teléfono / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        placeholder="987654321"
                        className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Correo Electrónico *</label>
                      <input
                        type="email"
                        required
                        placeholder="juan.perez@correo.com"
                        className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Domicilio y Distrito *</label>
                    <input
                      type="text"
                      required
                      placeholder="Calle, número, urbanización y distrito"
                      className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Detalle del Bien o Servicio */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                    2. Identificación del Bien Contratado y Detalle
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Tipo de Incidencia *</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setTipoIncidencia("RECLAMO")}
                          className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                            tipoIncidencia === "RECLAMO"
                              ? "bg-orange-600 text-white border-orange-500"
                              : "bg-slate-950 text-slate-400 border-slate-800"
                          }`}
                        >
                          Reclamo
                        </button>
                        <button
                          type="button"
                          onClick={() => setTipoIncidencia("QUEJA")}
                          className={`p-2 rounded-lg border text-xs font-bold transition-all ${
                            tipoIncidencia === "QUEJA"
                              ? "bg-orange-600 text-white border-orange-500"
                              : "bg-slate-950 text-slate-400 border-slate-800"
                          }`}
                        >
                          Queja
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Producto o Servicio *</label>
                      <select className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option>Balón de Gas 10 KG (Cocina / Doméstico)</option>
                        <option>Balón de Gas 15 KG Familiar</option>
                        <option>Balón de Gas 45 KG Comercial</option>
                        <option>Válvula Reguladora Click-On o Rosca</option>
                        <option>Servicio de Entrega / Repartidor</option>
                        <option>Otro</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Detalle de los Hechos *</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Describa con claridad los hechos que motivan su reclamo o queja..."
                      className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Pedido Concreto del Consumidor *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Cambio de balón sin costo, devolución de importe, etc."
                      className="w-full text-sm bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold h-12">
                  <Send className="w-4 h-4 mr-2" />
                  Registrar Reclamación Virtual
                </Button>
              </form>
            )}
          </Card>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
