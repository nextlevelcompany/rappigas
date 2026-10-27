'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function FooterPrincipal() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail('');
    }
  };

  return (
    <footer className="rappigas-main-footer" id="contacto" suppressHydrationWarning>
      <style dangerouslySetInnerHTML={{ __html: `
        .rappigas-main-footer {
          background-color: #0B132B;
          color: #94A3B8;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .rappigas-main-footer .footer-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 48px 24px 28px;
        }

        /* ========================================================= */
        /* FRANJA DE SERVICIO SUPERIOR (SOLIDA, SIN DEGRADADO)       */
        /* ========================================================= */
        .rappigas-main-footer .service-strip {
          background-color: #111D42;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 18px 24px;
          margin-bottom: 28px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .rappigas-main-footer .service-strip-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .rappigas-main-footer .service-strip-icon {
          width: 40px;
          height: 40px;
          border-radius: 6px;
          background-color: rgba(255, 87, 34, 0.12);
          color: #FF5722;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          flex-shrink: 0;
        }

        .rappigas-main-footer .service-strip-icon.green {
          background-color: rgba(16, 185, 129, 0.12);
          color: #10B981;
        }

        .rappigas-main-footer .service-strip-icon.blue {
          background-color: rgba(59, 130, 246, 0.12);
          color: #3B82F6;
        }

        .rappigas-main-footer .service-strip-icon.yellow {
          background-color: rgba(245, 158, 11, 0.12);
          color: #F59E0B;
        }

        .rappigas-main-footer .service-strip-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0;
          line-height: 1.25;
        }

        .rappigas-main-footer .service-strip-desc {
          font-size: 12px;
          color: #94A3B8;
          margin: 2px 0 0;
        }

        /* ========================================================= */
        /* FRANJA DESTACADA: PROMOCIONES VIP & DESCARGA APP          */
        /* ========================================================= */
        .rappigas-main-footer .promo-app-strip {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 24px;
          margin-bottom: 40px;
        }

        .rappigas-main-footer .promo-card,
        .rappigas-main-footer .app-card {
          background-color: #111D42;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 24px 26px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          transition: border-color 0.25s ease, transform 0.25s ease;
        }

        .rappigas-main-footer .promo-card:hover,
        .rappigas-main-footer .app-card:hover {
          border-color: rgba(255, 87, 34, 0.35);
        }

        .rappigas-main-footer .promo-header-tag {
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #FF5722;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          margin-bottom: 8px;
        }

        .rappigas-main-footer .app-header-tag {
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #10B981;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          margin-bottom: 8px;
        }

        .rappigas-main-footer .promo-title,
        .rappigas-main-footer .app-title {
          font-size: 17.5px;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0 0 6px 0;
          line-height: 1.3;
        }

        .rappigas-main-footer .promo-desc,
        .rappigas-main-footer .app-desc {
          font-size: 13.5px;
          color: #94A3B8;
          margin: 0 0 16px 0;
          line-height: 1.45;
        }

        .rappigas-main-footer .promo-form {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }

        .rappigas-main-footer .promo-input-group {
          position: relative;
          flex: 1;
          min-width: 220px;
        }

        .rappigas-main-footer .promo-input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748B;
          font-size: 15px;
        }

        .rappigas-main-footer .promo-input {
          width: 100%;
          background-color: #0B132B;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          padding: 10px 14px 10px 38px;
          color: #FFFFFF;
          font-size: 13.5px;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .rappigas-main-footer .promo-input:focus {
          border-color: #FF5722;
          box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.2);
          background-color: #0E1838;
        }

        .rappigas-main-footer .promo-input::placeholder {
          color: #64748B;
        }

        .rappigas-main-footer .promo-btn {
          background-color: #FF5722;
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          padding: 10px 20px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .rappigas-main-footer .promo-btn:hover {
          background-color: #E64A19;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(255, 87, 34, 0.35);
        }

        .rappigas-main-footer .promo-success-msg {
          margin-top: 10px;
          font-size: 12.5px;
          color: #4ADE80;
          display: flex;
          align-items: center;
        }

        .rappigas-main-footer .app-badge-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .rappigas-main-footer .google-play-btn {
          display: inline-block;
          line-height: 0;
          transition: transform 0.2s ease, opacity 0.2s ease;
          border-radius: 8px;
        }

        .rappigas-main-footer .google-play-btn:hover {
          transform: translateY(-2px);
          opacity: 0.92;
        }

        .rappigas-main-footer .google-play-img {
          height: 44px;
          width: auto;
          display: block;
        }

        /* ========================================================= */
        /* CUERPO DE ENLACES (5 COLUMNAS ESTRUCTURADAS)              */
        /* ========================================================= */
        .rappigas-main-footer .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr 1.1fr;
          gap: 36px;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        /* Columna 1: Marca & Confianza */
        .rappigas-main-footer .brand-block {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .rappigas-main-footer .brand-logo-img {
          height: 38px;
          width: auto;
          object-fit: contain;
          display: block;
        }

        .rappigas-main-footer .brand-description {
          font-size: 13.5px;
          line-height: 1.55;
          color: #94A3B8;
          margin: 0;
        }

        .rappigas-main-footer .payment-methods {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 4px;
        }

        .rappigas-main-footer .pay-badge {
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #CBD5E1;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 4px;
        }

        .rappigas-main-footer .pay-badge.yape {
          color: #C084FC;
          background-color: rgba(140, 82, 255, 0.12);
          border-color: rgba(140, 82, 255, 0.3);
        }

        .rappigas-main-footer .pay-badge.plin {
          color: #38BDF8;
          background-color: rgba(0, 209, 255, 0.12);
          border-color: rgba(0, 209, 255, 0.3);
        }

        /* Columnas de Navegación */
        .rappigas-main-footer .column-heading {
          font-size: 12.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #FFFFFF;
          margin-bottom: 16px;
        }

        .rappigas-main-footer .links-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .rappigas-main-footer .links-list a {
          font-size: 13.5px;
          color: #94A3B8;
          text-decoration: none;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .rappigas-main-footer .links-list a:hover {
          color: #FF5722;
          transform: translateX(3px);
        }

        .rappigas-main-footer .tag-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          background-color: rgba(255, 87, 34, 0.15);
          color: #FF5722;
        }

        /* Tarjeta Libro de Reclamaciones */
        .rappigas-main-footer .reclamaciones-card {
          margin-top: 14px;
          background-color: #111D42;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #FFFFFF;
          transition: all 0.2s ease;
        }

        .rappigas-main-footer .reclamaciones-card:hover {
          background-color: #172554;
          border-color: #FFB020;
          transform: translateY(-2px);
        }

        .rappigas-main-footer .reclamaciones-card i {
          font-size: 24px;
          color: #FFB020;
          flex-shrink: 0;
        }

        .rappigas-main-footer .reclamaciones-card .rec-title {
          font-size: 12.5px;
          font-weight: 700;
          line-height: 1.2;
          color: #FFFFFF;
        }

        .rappigas-main-footer .reclamaciones-card .rec-sub {
          font-size: 11px;
          color: #94A3B8;
          margin-top: 2px;
        }

        /* ========================================================= */
        /* SUB-FOOTER INFERIOR                                       */
        /* ========================================================= */
        .rappigas-main-footer .sub-footer {
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .rappigas-main-footer .copyright-label {
          font-size: 12.5px;
          color: #64748B;
          margin: 0;
        }

        .rappigas-main-footer .policy-links {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .rappigas-main-footer .policy-links a {
          font-size: 12.5px;
          color: #64748B;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .rappigas-main-footer .policy-links a:hover {
          color: #CBD5E1;
        }

        .rappigas-main-footer .social-icons-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rappigas-main-footer .social-btn {
          width: 34px;
          height: 34px;
          border-radius: 6px;
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94A3B8;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .rappigas-main-footer .social-btn:hover {
          color: #FFFFFF;
          background-color: #FF5722;
          border-color: #FF5722;
          transform: translateY(-2px);
        }

        /* Responsividad */
        @media (max-width: 1080px) {
          .rappigas-main-footer .service-strip {
            grid-template-columns: repeat(2, 1fr);
          }
          .rappigas-main-footer .promo-app-strip {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .rappigas-main-footer .footer-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 28px;
          }
          .rappigas-main-footer .brand-block {
            grid-column: span 2;
          }
        }

        @media (max-width: 640px) {
          .rappigas-main-footer .footer-container {
            padding: 36px 16px 20px;
          }
          .rappigas-main-footer .service-strip {
            grid-template-columns: 1fr;
            gap: 14px;
          }
          .rappigas-main-footer .promo-card,
          .rappigas-main-footer .app-card {
            padding: 20px 18px;
          }
          .rappigas-main-footer .promo-form {
            flex-direction: column;
            align-items: stretch;
          }
          .rappigas-main-footer .promo-input-group {
            min-width: 100%;
          }
          .rappigas-main-footer .promo-btn {
            width: 100%;
            justify-content: center;
          }
          .rappigas-main-footer .footer-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .rappigas-main-footer .brand-block {
            grid-column: span 1;
          }
          .rappigas-main-footer .sub-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
        }
      ` }} />

      <div className="footer-container">
        {/* ========================================================= */}
        {/* FRANJA DE SERVICIO SUPERIOR (SOLIDA, SIN DEGRADADOS)      */}
        {/* ========================================================= */}
        <div className="service-strip">
          <div className="service-strip-item">
            <div className="service-strip-icon">
              <i className="bi bi-whatsapp"></i>
            </div>
            <div>
              <h5 className="service-strip-title">977 665 554</h5>
              <p className="service-strip-desc">Central WhatsApp 24/7</p>
            </div>
          </div>

          <div className="service-strip-item">
            <div className="service-strip-icon green">
              <i className="bi bi-truck"></i>
            </div>
            <div>
              <h5 className="service-strip-title">Delivery 100% Gratis</h5>
              <p className="service-strip-desc">Llegamos en 25 a 35 min</p>
            </div>
          </div>

          <div className="service-strip-item">
            <div className="service-strip-icon blue">
              <i className="bi bi-shield-check"></i>
            </div>
            <div>
              <h5 className="service-strip-title">Balanza en tu Puerta</h5>
              <p className="service-strip-desc">Peso 100% exacto verificado</p>
            </div>
          </div>

          <div className="service-strip-item">
            <div className="service-strip-icon yellow">
              <i className="bi bi-credit-card"></i>
            </div>
            <div>
              <h5 className="service-strip-title">Pago Contraentrega</h5>
              <p className="service-strip-desc">Yape, Plin, POS o Efectivo</p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECCIÓN DESTACADA: PROMOCIONES VIP & DESCARGA APP          */}
        {/* ========================================================= */}
        <div className="promo-app-strip">
          {/* Bloque 1: Promociones y Lista VIP */}
          <div className="promo-card">
            <div>
              <div className="promo-header-tag">
                <i className="bi bi-percent me-1"></i> PROMOCIONES
              </div>
              <h4 className="promo-title">Recibe descuentos exclusivos en cada balón</h4>
              <p className="promo-desc">
                Únete a nuestra lista VIP y recibe ofertas directas sin spam.
              </p>
            </div>
            <div>
              <form onSubmit={handleSubscribe} className="promo-form">
                <div className="promo-input-group">
                  <i className="bi bi-envelope promo-input-icon"></i>
                  <input
                    type="email"
                    required
                    placeholder="Ingresa tu correo electrónico..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="promo-input"
                  />
                </div>
                <button type="submit" className="promo-btn">
                  Suscribirme <span><i className="bi bi-arrow-right"></i></span>
                </button>
              </form>
              {subscribed && (
                <div className="promo-success-msg">
                  <i className="bi bi-check-circle-fill me-1"></i> ¡Gracias por unirte a nuestra lista VIP! Te enviaremos tus cupones directos.
                </div>
              )}
            </div>
          </div>

          {/* Bloque 2: RappiGas App */}
          <div className="app-card">
            <div>
              <div className="app-header-tag">
                📱 RAPPIGAS APP
              </div>
              <h4 className="app-title">Pide con balanza digital</h4>
              <p className="app-desc">
                Rastreo en tiempo real a tu puerta.
              </p>
            </div>
            <div className="app-badge-wrapper">
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="google-play-btn"
                title="DISPONIBLE EN Google Play"
              >
                <img
                  src="/assets/img/app/google-play-badge.svg"
                  alt="DISPONIBLE EN Google Play"
                  className="google-play-img"
                />
              </a>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CUERPO DE ENLACES (5 COLUMNAS ESTRUCTURADAS)              */}
        {/* ========================================================= */}
        <div className="footer-grid">
          {/* Columna 1: Marca & Resumen */}
          <div className="brand-block">
            <Link href="/" className="d-inline-block">
              <img
                src="/assets/img/logo/Logo_rappi_gas.png"
                alt="RappiGas Perú"
                className="brand-logo-img"
              />
            </Link>
            <p className="brand-description">
              Servicio oficial de delivery de gas de cocina para hogares y negocios. Pesaje digital en puerta, entrega rápida y acumulación de puntos en cada pedido.
            </p>

            <div className="payment-methods">
              <span className="pay-badge yape">Yape</span>
              <span className="pay-badge plin">Plin</span>
              <span className="pay-badge">POS Tarjetas</span>
              <span className="pay-badge">Efectivo</span>
            </div>
          </div>

          {/* Columna 2: Balones de Gas */}
          <div>
            <div className="column-heading">
              <span>Balones de Gas</span>
            </div>
            <ul className="links-list">
              <li>
                <Link href="/productos">
                  Balón Doméstico 10 Kg
                  <span className="tag-badge">Popular</span>
                </Link>
              </li>
              <li>
                <Link href="/productos">Balón Premium Click-On</Link>
              </li>
              <li>
                <Link href="/productos">Balón Comercial 15 Kg</Link>
              </li>
              <li>
                <Link href="/productos">Balón Comercial 45 Kg</Link>
              </li>
              <li>
                <Link href="/productos">Válvulas y Reguladores</Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Cobertura Lima */}
          <div>
            <div className="column-heading">
              <span>Cobertura Lima</span>
            </div>
            <ul className="links-list">
              <li>
                <Link href="/cobertura">Los Olivos</Link>
              </li>
              <li>
                <Link href="/cobertura">San Martín de Porres</Link>
              </li>
              <li>
                <Link href="/cobertura">Comas e Independencia</Link>
              </li>
              <li>
                <Link href="/cobertura">Puente Piedra</Link>
              </li>
              <li>
                <Link href="/cobertura" style={{ color: '#FF5722', fontWeight: '600' }}>
                  Ver zonas de cobertura →
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: RappiGas */}
          <div>
            <div className="column-heading">
              <span>RappiGas</span>
            </div>
            <ul className="links-list">
              <li>
                <Link href="/nosotros">Sobre Nosotros</Link>
              </li>
              <li>
                <Link href="/fidelidad">Club Rappipuntos</Link>
              </li>
              <li>
                <Link href="/distribuidores">Afiliar Distribuidora</Link>
              </li>
              <li>
                <Link href="/contacto">Central de Pedidos</Link>
              </li>
              <li>
                <Link href="/login">Acceso a tu Cuenta</Link>
              </li>
            </ul>
          </div>

          {/* Columna 5: Transparencia & Libro de Reclamaciones */}
          <div>
            <div className="column-heading">
              <span>Transparencia</span>
            </div>
            <ul className="links-list">
              <li>
                <Link href="/nosotros">Garantía de Peso Exacto</Link>
              </li>
              <li>
                <Link href="/nosotros">Protocolos de Seguridad</Link>
              </li>
            </ul>

            {/* Acceso Destacado a Libro de Reclamaciones */}
            <Link href="/libro-de-reclamaciones" className="reclamaciones-card">
              <i className="bi bi-book-half"></i>
              <div>
                <div className="rec-title">Libro de Reclamaciones</div>
                <div className="rec-sub">Conforme a Ley N° 29571</div>
              </div>
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SUB-FOOTER INFERIOR                                       */}
        {/* ========================================================= */}
        <div className="sub-footer">
          <p className="copyright-label" suppressHydrationWarning>
            © 2026 RappiGas Perú S.A.C. · RUC: 20609876543 · Todos los derechos reservados.
          </p>

          <div className="policy-links">
            <Link href="/nosotros">Términos</Link>
            <span style={{ color: '#334155' }}>•</span>
            <Link href="/nosotros">Privacidad</Link>
            <span style={{ color: '#334155' }}>•</span>
            <Link href="/libro-de-reclamaciones">Reclamaciones</Link>
          </div>

          <div className="social-icons-wrapper">
            <a href="https://wa.me/51977665554" target="_blank" rel="noopener noreferrer" className="social-btn" title="WhatsApp">
              <i className="bi bi-whatsapp"></i>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-btn" title="Facebook">
              <i className="bi bi-facebook"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-btn" title="Instagram">
              <i className="bi bi-instagram"></i>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="social-btn" title="TikTok">
              <i className="bi bi-tiktok"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
