import Link from "next/link";
import { PublicNavbar } from "@/components/publico/public-navbar";
import { PublicFooter } from "@/components/publico/public-footer";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Clock, RotateCcw, Award, CheckCircle2 } from "lucide-react";

export default function TerminosCondicionesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      <PublicNavbar />

      <main className="flex-1 pt-24 pb-20">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-4">
          <Badge className="bg-slate-800 text-slate-300 text-xs font-semibold">
            Condiciones Comerciales y Transaccionales
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Términos y Condiciones Generales
          </h1>
          <p className="text-xs text-slate-400">
            Última actualización: 04 de Octubre de 2026 • Aplicable a compras y operaciones en PideGas
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-8 text-sm text-slate-300 leading-relaxed">
            
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-500" />
                1. Precios y Medios de Pago
              </h2>
              <p>
                Todos los precios de los balones de gas y accesorios se expresan en moneda nacional (Soles - S/) e incluyen el Impuesto General a las Ventas (IGV). La plataforma y sus repartidores autorizados aceptan los siguientes canales de liquidación:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-400 text-xs">
                <li>Billeteras digitales móviles: Yape y Plin mediante código QR dinámico o estático en el momento de la entrega.</li>
                <li>Tarjetas de débito o crédito (Visa, Mastercard, American Express) a través de terminales POS móviles del repartidor.</li>
                <li>Efectivo en moneda nacional contra entrega. Se recomienda indicar en la orden si se requiere vuelto o cambio.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                2. Tiempos de Despacho y Entrega
              </h2>
              <p>
                El tiempo estimado de llegada regular oscila entre 25 y 45 minutos desde la confirmación de la orden, sujeto a condiciones de tráfico, clima y disponibilidad de unidades en la zona. El cliente puede realizar el seguimiento del estado de su pedido en tiempo real a través de la web o PWA.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-orange-500" />
                3. Cancelación y Modificación de Pedidos
              </h2>
              <p>
                El cliente puede cancelar su solicitud sin penalidad alguna mientras el pedido se encuentre en estado <code className="text-orange-400 bg-slate-950 px-1 py-0.5 rounded">PENDIENTE</code>. Si la orden ya pasó a estado <code className="text-blue-400 bg-slate-950 px-1 py-0.5 rounded">EN_CAMINO</code> y la unidad se encuentra en ruta hacia el domicilio, solicitamos contactar de inmediato a soporte o al repartidor para coordinar la anulación.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-500" />
                4. Programa de Puntos y Cupones de Fidelidad
              </h2>
              <p>
                Los clientes acumulan puntos con cada compra completada exitosamente a través de la plataforma. Los puntos acumulados son personales e intransferibles, y pueden canjearse como descuento directo en soles en futuras compras de balones de cocina. Los cupones de descuento no son acumulables entre sí para una misma orden, salvo indicación expresa de la promoción.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                5. Garantía de Hermeticidad y Cambio Inmediato
              </h2>
              <p>
                Si un cilindro presenta olor a gas, pérdida de presión o defecto de fábrica en la válvula durante los primeros 7 días posteriores a su entrega, la distribuidora asignada realizará la reposición del cilindro por uno nuevo sin ningún costo adicional para el cliente.
              </p>
            </div>

          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
