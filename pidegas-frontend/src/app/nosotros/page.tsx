import Link from "next/link";
import { PublicNavbar } from "@/components/publico/public-navbar";
import { PublicFooter } from "@/components/publico/public-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Flame,
  ShieldCheck,
  Target,
  Eye,
  CheckCircle2,
  Users,
  Award,
  Scale,
  Sparkles,
  ArrowRight,
  Store,
  ShoppingBag,
} from "lucide-react";

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      <PublicNavbar />

      <main className="flex-1 pt-24 pb-20">
        {/* Encabezado */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 text-center space-y-4">
          <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold">
            Nuestra Historia y Propósito
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Formalizando el mercado de gas para cocina en el Perú
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Nacimos con una misión clara: erradicar el gas adulterado, los cilindros oxidados y el desabastecimiento, conectando a los hogares y negocios gastronómicos con distribuidoras formales y autorizadas.
          </p>
        </section>

        {/* Misión y Visión */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-slate-900/80 border-slate-800 p-8 space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Nuestra Misión</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Brindar a cada hogar y restaurante peruano un suministro de gas de cocina transparente, puntual y 100% seguro, garantizando el pesaje exacto del balón mediante balanzas calibradas y el uso de cilindros normados por OSINERGMIN con válvulas de autobloqueo térmico.
              </p>
            </Card>

            <Card className="bg-slate-900/80 border-slate-800 p-8 space-y-4 relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Nuestra Visión</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Consolidarnos como el estándar digital nacional para la distribución de gas de cocina y energía para el hogar en el Perú, empoderando a miles de distribuidoras locales independientes con tecnología de vanguardia para competir formalmente con honestidad y calidad.
              </p>
            </Card>
          </div>
        </section>

        {/* El Problema vs La Solución PideGas */}
        <section className="bg-slate-900/40 border-y border-slate-800 py-20 mb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl font-black text-white">¿Por qué existe PideGas?</h2>
              <p className="text-slate-400 text-sm">
                Comparamos la realidad del mercado tradicional versus los estándares de calidad de nuestra red.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Mercado Tradicional */}
              <div className="bg-slate-950/80 border border-rose-900/30 rounded-2xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  El Mercado Informal Tradicional
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>Balones que rinden menos días por contenido incompleto o trasvase clandestino.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>Cilindros con pintura vieja, hendiduras o riesgo de fugas por corrosión oculta.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>Obligatoriedad de pago en efectivo exacto, sin opción de Yape, Plin ni comprobantes formales.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">✕</span>
                    <span>Cero trazabilidad: si el balón falla, nadie asume la responsabilidad.</span>
                  </li>
                </ul>
              </div>

              {/* El Estándar PideGas */}
              <div className="bg-slate-950/80 border border-emerald-900/40 rounded-2xl p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  El Estándar Certificado PideGas
                </div>
                <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Peso exacto verificado:</strong> Balanza digital en puerta para constatar tara + contenido neto exacto.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Precinto inviolable:</strong> Sellos de seguridad de planta envasadora autorizada.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Válvula Click-On Premium:</strong> Autobloqueo térmico automático ante fugas o desconexión.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Módulo de PQRS y Garantía:</strong> Reemplazo inmediato ante cualquier irregularidad.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Pilares de Valor */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-3xl font-black text-white">Nuestros Pilares</h2>
            <p className="text-slate-400 text-sm">Los valores que rigen cada balón entregado en tu hogar</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 text-center space-y-2">
              <Scale className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="font-bold text-white text-base">Transparencia</h3>
              <p className="text-xs text-slate-400">Precios públicos sin sobrecostos sorpresa ni especulación.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="font-bold text-white text-base">Seguridad Primaria</h3>
              <p className="text-xs text-slate-400">Cilindros aptos y conformes a las exigencias de OSINERGMIN.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 text-center space-y-2">
              <Users className="w-8 h-8 text-blue-400 mx-auto" />
              <h3 className="font-bold text-white text-base">Formalidad Local</h3>
              <p className="text-xs text-slate-400">Impulsamos y formalizamos a las distribuidoras de tu propio barrio.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-orange-400 mx-auto" />
              <h3 className="font-bold text-white text-base">Tecnología Ágil</h3>
              <p className="text-xs text-slate-400">Seguimiento en vivo, código PIN y billetera de puntos de ahorro.</p>
            </div>
          </div>
        </section>

        {/* CTA Doble */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-linear-to-r from-orange-950/60 via-slate-900 to-slate-950 border border-orange-500/30 rounded-2xl p-8 sm:p-12 text-center space-y-6">
            <h2 className="text-3xl font-black text-white">¿Listo para un servicio de gas seguro y confiable?</h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
              Únete a miles de familias que ya cocinan tranquilas con balones pesados en su puerta y garantía total.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-500 text-white font-bold">
                <Link href="/cliente/tienda">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Pedir Gas Ahora
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-slate-700 bg-slate-900 text-slate-200 hover:text-white">
                <Link href="/auth/registro-empresa">
                  <Store className="w-4 h-4 mr-2 text-orange-400" />
                  Afiliar mi Distribuidora
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
