'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Nav from './Nav';
import { useAuthStore } from '@/store/auth-store';
import { useUIThemeStore } from '@/store/ui-theme.store';

export default function HeaderPrincipal({ variant }) {
  const pathname = usePathname();
  const [mobileToggle, setMobileToggle] = useState(false);
  const [isSticky, setIsSticky] = useState();
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  const { estaAutenticado, usuario, cargarSesionDesdeStorage } = useAuthStore();
  const {
    customWebLogoUrl,
    customWebLogoHeight,
    customLogoUrl,
    customLogoHeight,
    loadTheme,
  } = useUIThemeStore();

  useEffect(() => {
    cargarSesionDesdeStorage();
    loadTheme();
  }, [cargarSesionDesdeStorage, loadTheme]);

  const webLogo = customWebLogoUrl || customLogoUrl || '/assets/img/logo/Logo_rappi_gas.png';
  const logoHeight = customWebLogoHeight || customLogoHeight || 44;

  const dashboardUrl = usuario?.rol === 'ADMIN'
    ? '/admin/dashboard'
    : usuario?.rol === 'EMPRESA'
    ? '/empresa/dashboard'
    : usuario?.rol === 'REPARTIDOR'
    ? '/repartidor/pedidos'
    : '/cliente/tienda';

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
                <div className="d-flex align-items-center justify-md-end justify-content-start gap-3" style={{ fontSize: '13px' }}>
                  <Link
                    href="/auth/registro-empresa"
                    className="text-warning text-decoration-none fw-bold"
                  >
                    <i className="bi bi-briefcase me-1"></i> ¿Eres Distribuidor? Afíliate
                  </Link>
                  <span className="text-white-50">|</span>
                  <a
                    href="tel:977665554"
                    className="text-white text-decoration-none"
                  >
                    <i className="bi bi-telephone me-1 text-danger"></i> Central: 977 665 554
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="cs_main_header">
          <div className="container">
            <div className="cs_main_header_in">
              {/* Logo */}
              <div className="cs_main_header_left">
                <Link className="cs_site_branding" href="/">
                  <img
                    src={webLogo}
                    alt="Logo RappiGas Perú"
                    style={{
                      maxHeight: `${logoHeight}px`,
                      width: 'auto',
                      objectFit: 'contain',
                    }}
                  />
                </Link>
              </div>

              {/* Navigation Center */}
              <div className="cs_main_header_center">
                <div className="cs_nav cs_primary_font">
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
                  {/* Botón Secundario: Iniciar Sesión / Mi Panel */}
                  {estaAutenticado && usuario ? (
                    <Link
                      href={dashboardUrl}
                      className="btn fw-bold px-3 py-2 text-decoration-none text-white"
                      style={{
                        borderRadius: '8px',
                        backgroundColor: '#10B981',
                        border: '1.5px solid #10B981',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      <i className="bi bi-person-circle me-1"></i> Mi Panel ({usuario.nombres || 'Usuario'})
                    </Link>
                  ) : (
                    <a
                      href="/auth/login"
                      className="btn fw-bold px-3 py-2 text-decoration-none"
                      style={{
                        borderRadius: '8px',
                        border: '1.5px solid #0d6efd',
                        backgroundColor: (pathname === '/login' || pathname === '/auth/login') ? '#0d6efd' : 'transparent',
                        color: (pathname === '/login' || pathname === '/auth/login') ? '#ffffff' : '#0d6efd',
                        fontSize: '14px',
                        transition: 'all 0.3s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                      }}
                    >
                      <i className="bi bi-person-fill me-1"></i> Iniciar Sesión
                    </a>
                  )}

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
