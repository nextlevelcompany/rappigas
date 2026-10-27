'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Nav from './Nav';

export default function HeaderPrincipal({ variant }) {
  const pathname = usePathname();
  const [mobileToggle, setMobileToggle] = useState(false);
  const [isSticky, setIsSticky] = useState();
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      if (currentScrollPos > prevScrollPos) {
        setIsSticky('cs-gescout_sticky');
      } else if (currentScrollPos !== 0) {
        setIsSticky('cs-gescout_show cs-gescout_sticky');
      } else {
        setIsSticky();
      }
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prevScrollPos]);

  return (
    <div className='header-area2 header_nav_03' id="inicio">
      <header
        className={`cs_site_header cs_style_1 ${
          variant ? variant : ''
        } cs_sticky_header cs_site_header_full_width ${
          mobileToggle ? 'cs_mobile_toggle_active' : ''
        } ${isSticky ? isSticky : ''}`}
      >
        {/* Top Header */}
        <div className="cs_top_header" style={{ background: '#0b1538', borderBottom: '2px solid rgba(255,255,255,0.08)' }}>
          <div className="container">
            <div className="row align-items-center py-0">
              <div className="col-lg-6 col-md-7 col-12">
                <div className="pera d-flex align-items-center gap-2">
                  <span className="badge bg-warning text-dark px-2 py-1 fw-bold" style={{ fontSize: '10px' }}>
                    <i className="bi bi-shield-check me-1"></i> Descargar Aplicación
                  </span>
                  <p className="mb-0 text-white-50" style={{ fontSize: '12px' }}>
                    Gas de Cocina para el Hogar y Negocios
                  </p>
                </div>
              </div>
              <div className="col-lg-6 col-md-5 col-12 text-md-end text-start mt-1 mt-md-0">
                <div className="d-flex align-items-center justify-content-md-end gap-3" style={{ fontSize: '13px' }}>
                  <Link
                    href="/distribuidores"
                    className="text-warning text-decoration-none fw-bold"
                    style={{
                      fontSize: '13px',
                      textDecoration: pathname === '/distribuidores' ? 'underline' : 'none',
                    }}
                  >
                    <i className="bi bi-shop me-1"></i> ¿Eres Distribuidor? Regístrate aquí
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="cs_main_header cs_accent_bg">
          <div className="container">
            <div className="cs_main_header_in">
              {/* Brand / Logo */}
              <div className="cs_main_header_left">
                <Link
                  href="/"
                  className="cs_site_branding text-decoration-none"
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <img
                    src="/assets/img/logo/Logo_rappi_gas.png"
                    alt="RappiGas - Energía Rápida & Segura para tu Hogar"
                    style={{
                      height: '75px',
                      maxWidth: '280px',
                      objectFit: 'contain',
                      display: 'block',
                      transition: 'all 0.3s ease',
                    }}
                  />
                </Link>
              </div>

              {/* Navigation Menu */}
              <div className="cs_main_header_center1">
                <div className="cs_nav cs_primary_font fw-medium">
                  <span
                    className={
                      mobileToggle
                        ? 'cs-munu_toggle cs_teggle_active'
                        : 'cs-munu_toggle'
                    }
                    onClick={() => setMobileToggle(!mobileToggle)}
                  >
                    <span></span>
                  </span>
                  <Nav setMobileToggle={setMobileToggle} />
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="cs_main_header_right header_right_one">
                <div className="header1-buttons d-flex align-items-center gap-2">
                  {/* Botón Secundario: Iniciar Sesión */}
                  <Link
                    href="/login"
                    className="btn fw-bold px-3 py-2 text-decoration-none"
                    style={{
                      borderRadius: '8px',
                      border: '1.5px solid #0d6efd',
                      backgroundColor: pathname === '/login' ? '#0d6efd' : 'transparent',
                      color: pathname === '/login' ? '#ffffff' : '#0d6efd',
                      fontSize: '14px',
                      transition: 'all 0.3s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <i className="bi bi-person-fill me-1"></i> Iniciar Sesión
                  </Link>

                  {/* Botón Primario: Pedir Balón de Gas */}
                  <Link
                    href="/pedir-gas"
                    className="btn fw-bold px-4 py-2 text-decoration-none text-white"
                    style={{
                      background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
                      boxShadow: pathname === '/pedir-gas'
                        ? '0 0 0 3px rgba(255, 87, 34, 0.4), 0 4px 10px rgba(216, 67, 21, 0.35)'
                        : '0 4px 10px rgba(216, 67, 21, 0.35)',
                      cursor: 'pointer',
                      padding: '12px 22px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                    }}
                  >
                    <i className="bi bi-bag-check-fill me-1"></i> Solicitar Gas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
