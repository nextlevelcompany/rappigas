import Link from "next/link";
import {
  Flame,
  ShieldCheck,
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  BookOpen,
  FileText,
  Lock,
  ArrowRight,
} from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Barra superior de Emergencias y Seguridad */}
      <div className="bg-linear-to-r from-orange-950/40 via-amber-950/30 to-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-400">Atención activa en Lima y Callao:</span>
            <span>Despacho regular de 6:00 AM a 10:00 PM todos los días.</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <span className="text-slate-400">¿Olor a gas o fuga sospechosa?</span>
            <a
              href="tel:116"
              className="font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              Emergencias: 116 (Bomberos)
            </a>
          </div>
        </div>
      </div>

      {/* Contenido principal del Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Columna 1: Marca & Misión */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/30">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Pide<span className="text-orange-500">Gas</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              La plataforma tecnológica líder en el Perú para la distribución formal, segura y transparente de balones de gas de cocina (10kg, 15kg y 45kg) con balanza calibrada, precinto de seguridad y válvula Premium Click-On.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Distribuidoras y vehículos autorizados por OSINERGMIN.</span>
            </div>
          </div>

          {/* Columna 2: Navegación & Compras */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Balones y Pedidos
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/cliente/tienda" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Pedir Balón de Cocina</span>
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-white transition-colors">
                  Balón de Gas 10kg Doméstico
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-white transition-colors">
                  Balón de Gas 15kg Familiar
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-white transition-colors">
                  Balón de Gas 45kg Comercial
                </Link>
              </li>
              <li>
                <Link href="/productos" className="hover:text-white transition-colors">
                  Válvulas Click-On y Rosca
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Para Negocios y Plataforma */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Para Empresas & Red
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/auth/registro-empresa" className="text-orange-400 hover:text-orange-300 font-medium transition-colors flex items-center gap-1">
                  <span>Afiliar mi Distribuidora</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="hover:text-white transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-white transition-colors">
                  Contacto Comercial
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-white transition-colors">
                  Acceso a Mi Panel (Login)
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Legales y Cumplimiento Normativo */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Legal y Reclamaciones
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/terminos-servicio" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Términos del Servicio</span>
                </Link>
              </li>
              <li>
                <Link href="/terminos-condiciones" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Términos y Condiciones</span>
                </Link>
              </li>
              <li>
                <Link href="/politica-privacidad" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Políticas de Privacidad</span>
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/libro-reclamaciones"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-950/20 text-amber-300 hover:bg-amber-900/30 text-xs font-semibold transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Libro de Reclamaciones</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Separador inferior */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} RappiGas Perú S.A.C. Todos los derechos reservados. RUC 20608945123.</p>
          <div className="flex items-center gap-6">
            <span>Lima - Perú</span>
            <span>•</span>
            <Link href="/terminos-servicio" className="hover:text-slate-400">
              Condiciones de Entrega
            </Link>
            <span>•</span>
            <Link href="/politica-privacidad" className="hover:text-slate-400">
              Protección Datos Ley 29733
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
