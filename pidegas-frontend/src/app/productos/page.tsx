"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/publico/public-navbar";
import { PublicFooter } from "@/components/publico/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  ShieldCheck,
  ShoppingBag,
  Scale,
  CheckCircle2,
  Sparkles,
  Info,
  Wrench,
  HelpCircle,
  Truck,
  ArrowRight,
} from "lucide-react";

export default function ProductosPage() {
  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODOS");

  const PRODUCTOS = [
    {
      id: "GLP_10KG",
      nombre: "Balón GLP 10 KG Doméstico",
      categoria: "BALONES",
      destacado: true,
      etiqueta: "El Más Solicitado",
      precioRef: "S/ 48.00",
      pesoNeto: "10.00 kg de GLP",
      taraPromedio: "11.20 - 11.80 kg",
      pesoBrutoTotal: "Aprox. 21.50 kg",
      valvulas: ["Click-On (Premium)", "Rosca Tradicional"],
      idealPara: "Cocinas de hogar familiares, departamentos y cocinas estándar de 4 quemadores.",
      duracionEstimada: "25 a 35 días (familia de 4 personas)",
      descripcion: "Cilindro inspeccionado sin corrosión externa, precinto inviolable de planta envasadora y tara grabada visible para verificación en balanza.",
    },
    {
      id: "GLP_15KG",
      nombre: "Balón GLP 15 KG Familiar",
      categoria: "BALONES",
      destacado: false,
      etiqueta: "Mayor Rendimiento",
      precioRef: "S/ 72.00",
      pesoNeto: "15.00 kg de GLP",
      taraPromedio: "14.50 - 15.20 kg",
      pesoBrutoTotal: "Aprox. 29.80 kg",
      valvulas: ["Click-On (Premium)", "Rosca Tradicional"],
      idealPara: "Familias numerosas, hogares con terma a gas o negocios caseros de repostería.",
      duracionEstimada: "40 a 55 días de uso regular",
      descripcion: "50% más de contenido respecto al balón estándar. Menos recambios y mayor autonomía para tu hogar.",
    },
    {
      id: "GLP_45KG",
      nombre: "Balón GLP 45 KG Comercial e Industrial",
      categoria: "BALONES",
      destacado: false,
      etiqueta: "Uso Gastronómico",
      precioRef: "S/ 215.00",
      pesoNeto: "45.00 kg de GLP",
      taraPromedio: "38.00 - 41.00 kg",
      pesoBrutoTotal: "Aprox. 84.00 kg",
      valvulas: ["Rosca Comercial POL"],
      idealPara: "Restaurantes, chifas, pollerías, panaderías y cocinas industriales de alto rendimiento.",
      duracionEstimada: "Según volumen de producción comercial",
      descripcion: "Abastecimiento continuo con despacho especializado en camiones plataforma. Incluye asistencia técnica y conexión en batería.",
    },
    {
      id: "VALVULA_CLICKON",
      nombre: "Válvula Reguladora Premium Click-On",
      categoria: "ACCESORIOS",
      destacado: true,
      etiqueta: "Seguridad Máxima",
      precioRef: "S/ 45.00",
      pesoNeto: "N/A (Accesorio)",
      taraPromedio: "Cuerpo de bronce / antimonio",
      pesoBrutoTotal: "0.55 kg",
      valvulas: ["Acople Click-On de 20 mm"],
      idealPara: "Hogares que priorizan la seguridad de sus niños y adultos mayores.",
      duracionEstimada: "Vida útil recomendada: 5 años",
      descripcion: "Sistema de encastre instantáneo con autobloqueo térmico automático que corta el flujo de gas si la manguera se desprende o rompe.",
    },
    {
      id: "VALVULA_ROSCA",
      nombre: "Regulador a Rosca con Manómetro",
      categoria: "ACCESORIOS",
      destacado: false,
      etiqueta: "Estándar Tradicional",
      precioRef: "S/ 38.00",
      pesoNeto: "N/A (Accesorio)",
      taraPromedio: "Bronce forjado",
      pesoBrutoTotal: "0.48 kg",
      valvulas: ["Rosca manual convencional"],
      idealPara: "Instalaciones tradicionales de balón a rosca con visor de nivel de presión.",
      duracionEstimada: "Vida útil recomendada: 5 años",
      descripcion: "Incluye manómetro con aguja indicadora de presión interna para anticipar cuándo se está agotando el GLP.",
    },
    {
      id: "KIT_MANGUERA",
      nombre: "Kit de Manguera Flexible de Alta Presión GLP",
      categoria: "ACCESORIOS",
      destacado: false,
      etiqueta: "Norma Técnica",
      precioRef: "S/ 18.00",
      pesoNeto: "N/A (Accesorio)",
      taraPromedio: "Caucho sintético reforzado",
      pesoBrutoTotal: "0.35 kg",
      valvulas: ["Universal para GLP"],
      idealPara: "Reemplazo preventivo periódico entre el regulador y la cocina.",
      duracionEstimada: "Cambio obligatorio cada 2 a 3 años",
      descripcion: "Manguera con triple capa y malla interna de poliéster resistente al gas licuado. Incluye dos abrazaderas de acero inoxidable.",
    },
  ];

  const productosFiltrados = PRODUCTOS.filter((p) => {
    if (filtroCategoria === "TODOS") return true;
    return p.categoria === filtroCategoria;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      <PublicNavbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Encabezado */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 text-center space-y-4">
          <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold">
            Catálogo Oficial PideGas
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Balones de Cocina y Accesorios Certificados
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Conoce nuestras presentaciones de gas GLP doméstico y comercial. Precios referenciales en Soles (S/) con entrega rápida a domicilio.
          </p>

          {/* Filtros de Categoría */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant={filtroCategoria === "TODOS" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltroCategoria("TODOS")}
              className={filtroCategoria === "TODOS" ? "bg-orange-600 hover:bg-orange-500 text-white font-bold" : "border-slate-800 bg-slate-900 text-slate-400"}
            >
              Todos los Productos ({PRODUCTOS.length})
            </Button>
            <Button
              variant={filtroCategoria === "BALONES" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltroCategoria("BALONES")}
              className={filtroCategoria === "BALONES" ? "bg-orange-600 hover:bg-orange-500 text-white font-bold" : "border-slate-800 bg-slate-900 text-slate-400"}
            >
              Balones de Gas GLP
            </Button>
            <Button
              variant={filtroCategoria === "ACCESORIOS" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltroCategoria("ACCESORIOS")}
              className={filtroCategoria === "ACCESORIOS" ? "bg-orange-600 hover:bg-orange-500 text-white font-bold" : "border-slate-800 bg-slate-900 text-slate-400"}
            >
              Válvulas y Reguladores
            </Button>
          </div>
        </section>

        {/* Grilla de Productos */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productosFiltrados.map((prod) => (
              <Card
                key={prod.id}
                className={`bg-slate-900/80 border-slate-800 flex flex-col justify-between overflow-hidden relative transition-all hover:border-slate-700 ${
                  prod.destacado ? "ring-1 ring-orange-500/40" : ""
                }`}
              >
                {prod.destacado && (
                  <div className="absolute top-0 right-0">
                    <span className="bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-md">
                      {prod.etiqueta}
                    </span>
                  </div>
                )}

                <CardContent className="p-6 space-y-5">
                  <div className="space-y-1">
                    <div className="w-12 h-12 rounded-xl bg-orange-950/60 border border-orange-800/40 text-orange-400 flex items-center justify-center mb-3">
                      {prod.categoria === "BALONES" ? (
                        <Flame className="w-6 h-6 text-orange-500" />
                      ) : (
                        <Wrench className="w-6 h-6 text-amber-400" />
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400 mb-1">
                      {prod.categoria === "BALONES" ? "Gas Licuado de Petróleo" : "Seguridad y Accesorios"}
                    </Badge>
                    <h3 className="text-xl font-bold text-white leading-snug">{prod.nombre}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">{prod.descripcion}</p>
                  </div>

                  {/* Ficha técnica resumida */}
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Contenido Neto:</span>
                      <span className="font-semibold text-white">{prod.pesoNeto}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Tara Cilindro:</span>
                      <span className="font-mono text-slate-300">{prod.taraPromedio}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Ideal Para:</span>
                      <span className="text-slate-300 text-right truncate max-w-[170px]">{prod.idealPara}</span>
                    </div>
                  </div>

                  {/* Compatibilidad de Válvulas */}
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Válvulas Disponibles:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {prod.valvulas.map((v, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-slate-800/80 text-slate-200 px-2.5 py-0.5 rounded-md border border-slate-700"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Precio & CTA */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">Precio Sugerido</p>
                      <p className="text-2xl font-black text-orange-400">{prod.precioRef}</p>
                    </div>

                    <Button asChild className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/30">
                      <Link href="/cliente/tienda">
                        <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
                        Pedir Ahora
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Guía de Pesaje y Tara */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <Scale className="w-8 h-8 text-amber-400 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-white">¿Cómo verificar el peso exacto de tu balón?</h3>
                <p className="text-xs text-slate-400">Todos los cilindros de gas tienen grabada la tara en el collarín metálico.</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
              <strong>Fórmula del Peso Exacto:</strong><br />
              Peso Total en Balanza = Peso de la Tara (Cilindro Vacío) + 10.00 kg de GLP.<br />
              <span className="text-amber-400 text-[11px]">
                Ejemplo: Si la tara grabada indica 11.5 kg, el balón lleno debe marcar exactamente 21.5 kg en la balanza.
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Nuestros repartidores llevan balanzas calibradas y están instruidos para pesar el cilindro frente a ti cada vez que lo desees.
            </p>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
