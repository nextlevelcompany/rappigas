import Link from "next/link";
import { PublicNavbar } from "@/components/publico/public-navbar";
import { PublicFooter } from "@/components/publico/public-footer";
import { Badge } from "@/components/ui/badge";
import { FileText, ShieldCheck, Scale, AlertCircle } from "lucide-react";

export default function TerminosServicioPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      <PublicNavbar />

      <main className="flex-1 pt-24 pb-20">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-4">
          <Badge className="bg-slate-800 text-slate-300 text-xs font-semibold">
            Marco Legal y Operativo
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Términos del Servicio de Distribución
          </h1>
          <p className="text-xs text-slate-400">
            Última actualización: 04 de Octubre de 2026 • Conforme a la normativa de hidrocarburos del Perú
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-8 text-sm text-slate-300 leading-relaxed">
            
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-orange-500" />
                1. Naturaleza de la Plataforma PideGas
              </h2>
              <p>
                PideGas Perú S.A.C. opera una plataforma tecnológica de intermediación digital que conecta a consumidores finales (domésticos, comerciales e industriales) con distribuidoras autorizadas de gas envasado para cocina y uso doméstico formalmente constituidas y debidamente autorizadas con Registro de Hidrocarburos vigente ante el Organismo Supervisor de la Inversión en Energía y Minería (OSINERGMIN).
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                2. Régimen de Intercambio de Cilindros (Parque de Balones)
              </h2>
              <p>
                Al solicitar un balón de gas de 10kg o 15kg bajo la modalidad de recarga habitual, el cliente debe entregar un cilindro vacío en condiciones reglamentarias:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-400 text-xs">
                <li>El cilindro entregado no debe presentar abolladuras severas, corrosión perforante ni modificaciones en el collarín o base.</li>
                <li>No se aceptarán cilindros con signos evidentes de trasvase clandestino o adulteración de la tara original.</li>
                <li>Si el cliente no dispone de un cilindro para intercambio, deberá adquirir el envase metálico nuevo o en garantía pagando el costo de envase fijado por la distribuidora.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-500" />
                3. Verificación de Tara y Peso en Presencia del Usuario
              </h2>
              <p>
                Es derecho irrenunciable del usuario solicitar al repartidor la verificación del peso del cilindro en balanza calibrada antes de la entrega final. La conformidad del peso se rige por:
              </p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-amber-300">
                Peso Balanza = Tara Grabada en Collarín + Contenido Neto de Gas (Margen de tolerancia según Norma Técnica Peruana: ± 100 gramos).
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                4. Código PIN de Confirmación de Entrega
              </h2>
              <p>
                Para garantizar que el pedido fue recibido conforme y evitar suplantaciones, la plataforma genera un código PIN de 4 dígitos para cada orden. El cliente debe proporcionar este PIN al repartidor únicamente tras haber verificado el cilindro y el precinto intacto.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white">5. Protocolo de Seguridad en Instalación</h2>
              <p>
                El repartidor podrá apoyar en la colocación de la válvula (Click-On o Rosca) si el usuario lo requiere. Es responsabilidad del usuario constatar la ausencia de olor a gas antes de encender cualquier artefacto. Ante la mínima sospecha de fuga, se aplicará el cambio inmediato del balón o regulador sin costo.
              </p>
            </div>

          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
