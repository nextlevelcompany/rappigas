import 'bootstrap-icons/font/bootstrap-icons.css';
import 'slick-carousel/slick/slick.css';
import '@/assets/public-layout-shim.css';
import '@/assets/main.css';

import HeaderPrincipal from '@/components/Header/HeaderPrincipal';
import FooterPrincipal from '@/components/Footer/FooterPrincipal';

export const metadata = {
  title: 'RappiGas - Tu Gas de Cocina Rápido & Seguro | Pedidos con Balanza Digital y Premios',
  description: 'Pide tu balón de gas de cocina con balanza digital en puerta, delivery gratis en 25 a 35 minutos y pago contraentrega. Acumula puntos y canjea premios.',
  icons: {
    icon: '/favicon.png',
  },
};

export default function PublicLayout({ children }) {
  return (
    <div className="main-page-area">
      <HeaderPrincipal />
      <main>{children}</main>
      <FooterPrincipal />
    </div>
  );
}
