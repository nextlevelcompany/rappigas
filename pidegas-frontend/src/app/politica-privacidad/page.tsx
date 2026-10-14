import Link from "next/link";
import { PublicNavbar } from "@/components/publico/public-navbar";
import { PublicFooter } from "@/components/publico/public-footer";
import { Badge } from "@/components/ui/badge";
import { Lock, ShieldCheck, Database, KeyRound, Mail } from "lucide-react";

export default function PoliticaPrivacidadPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      <PublicNavbar />

      <main className="flex-1 pt-24 pb-20">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 space-y-4">
          <Badge className="bg-slate-800 text-slate-300 text-xs font-semibold">
            Protección de Datos Personales
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Política de Privacidad y Tratamiento de Datos
          </h1>
          <p className="text-xs text-slate-400">
            Conforme a la Ley N° 29733 (Ley de Protección de Datos Personales del Perú) y su Reglamento D.S. 003-2013-JUS
          </p>
        </section>

        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-8 text-sm text-slate-300 leading-relaxed">
            
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                1. Responsable del Banco de Datos
              </h2>
              <p>
                PideGas Perú S.A.C., con RUC 20608945123 y domicilio legal en Lima, Perú, es la titular y responsable de los bancos de datos personales recopilados a través del sitio web, aplicaciones móviles y canales oficiales.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                2. Datos Personales Objeto de Tratamiento
              </h2>
              <p>
                Para la prestación eficiente y segura de los servicios de entrega de gas, recopilamos los siguientes datos de los usuarios:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-400 text-xs">
                <li><strong>Datos de Identificación y Contacto:</strong> Nombres, apellidos, teléfono/WhatsApp, correo electrónico y DNI/RUC para emisión de comprobante de pago.</li>
                <li><strong>Datos de Geolocalización y Despacho:</strong> Dirección de entrega, referencias domiciliarias y coordenadas GPS para la asignación y navegación de la flota repartidora.</li>
                <li><strong>Historial Transaccional:</strong> Registro de pedidos, tipo de válvula utilizada, método de pago y puntos acumulados.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                3. Finalidad del Tratamiento
              </h2>
              <p>
                Los datos personales se procesan estrictamente con las siguientes finalidades:
              </p>
              <ul className="list-disc pl-6 space-y-1.5 text-slate-400 text-xs">
                <li>Gestionar y despachar pedidos de gas de cocina y balones domésticos hasta la puerta del cliente.</li>
                <li>Verificar la identidad del usuario y generar el código de seguridad PIN.</li>
                <li>Emitir boletas o facturas electrónicas requeridas por la SUNAT.</li>
                <li>Atender reclamos, emergencias o solicitudes de asistencia a través del canal de soporte.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-500" />
                4. Seguridad y No Transferencia a Terceros No Autorizados
              </h2>
              <p>
                PideGas adopta medidas de seguridad técnicas, organizativas y legales para evitar la alteración, pérdida o acceso no autorizado a su información. No comercializamos, alquilamos ni cedemos bases de datos a terceros con fines publicitarios no solicitados.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-orange-500" />
                5. Ejercicio de Derechos ARCO
              </h2>
              <p>
                Todo usuario tiene derecho a acceder, rectificar, cancelar u oponerse al tratamiento de sus datos personales (Derechos ARCO). Para ejercer estos derechos, puede enviar una solicitud formal con copia de su documento de identidad a: <code className="text-orange-400 font-mono">privacidad@pidegas.pe</code>.
              </p>
            </div>

          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
