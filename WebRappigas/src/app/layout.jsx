import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'slick-carousel/slick/slick.css';
import '../assets/main.css';

import HeaderPrincipal from '../Components/Header/HeaderPrincipal';
import FooterPrincipal from '../Components/Footer/FooterPrincipal';
import LocatorSetup from '../Components/Common/LocatorSetup';

export const metadata = {
  title: 'RappiGas - Tu Gas de Cocina Rápido & Seguro | Pedidos con Balanza Digital y Premios',
  description: 'Pide tu balón de gas de cocina con balanza digital en puerta, delivery gratis en 25 a 35 minutos y pago contraentrega. Acumula puntos y canjea premios.',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Figtree:ital,wght@0,300..900;1,300..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LocatorSetup />
        <div className="main-page-area">
          <HeaderPrincipal />
          <main>{children}</main>
          <FooterPrincipal />
        </div>
      </body>
    </html>
  );
}
