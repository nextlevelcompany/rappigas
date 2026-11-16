import 'bootstrap-icons/font/bootstrap-icons.css';
import 'slick-carousel/slick/slick.css';
import '@/assets/public-layout-shim.css';
import '@/assets/main.css';

import HeaderPrincipal from './_layout/HeaderPrincipal';
import FooterPrincipal from './_layout/FooterPrincipal';

export const metadata = {
  title: 'RappiGas - Tu Gas de Cocina Rápido & Seguro | Pedidos con Balanza Digital y Premios',
  description: 'Pide tu balón de gas de cocina con balanza digital en puerta, delivery gratis en 25 a 35 minutos y pago contraentrega. Acumula puntos y canjea premios.',
  icons: {
    icon: '/favicon.png',
  },
};

export default function PublicLayout({ children }) {
  return (
    <div className="main-page-area w-full max-w-full">
      <HeaderPrincipal />
      <main className="w-full max-w-full">{children}</main>
      <FooterPrincipal />
    </div>
  );
}
