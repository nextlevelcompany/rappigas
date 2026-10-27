'use client';

import React from 'react';
import Link from 'next/link';
import Breadcrumb from '../Components/Common/Breadcrumb';

export default function AboutUsPage() {
  return (
    <main className="about-us-wrapper" id="pagina-sobre-nosotros" suppressHydrationWarning>
      <style dangerouslySetInnerHTML={{ __html: `
        .about-us-wrapper {
          background-color: #FFFFFF;
          color: #1E293B;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          -webkit-font-smoothing: antialiased;
        }

        /* TIPOGRAFÍA GENERAL ESTILO HOME PAGE */
        .about-us-wrapper h1,
        .about-us-wrapper h2,
        .about-us-wrapper h3,
        .about-us-wrapper h4,
        .about-us-wrapper h5,
        .about-us-wrapper h6 {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
          letter-spacing: -0.03em !important;
        }

        .about-us-wrapper p,
        .about-us-wrapper span,
        .about-us-wrapper a {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
        }

        /* 1. SECCIÓN HERO / BREADCRUMB: ENCABEZADO DE PÁGINA */
        .about-us-wrapper .common-hero {
          min-height: auto !important;
          padding: 140px 24px 50px !important;
          background: linear-gradient(135deg, #06152B 0%, #0A2540 50%, #0F355C 100%) !important;
          position: relative !important;
          z-index: 1 !important;
          overflow: hidden !important;
          margin: 0 !important;
          text-align: left !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .about-us-wrapper .common-hero::before {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          top: -120px;
          right: -80px;
          background: radial-gradient(circle, rgba(255, 90, 31, 0.16) 0%, rgba(255, 90, 31, 0) 70%);
          filter: blur(75px);
          pointer-events: none;
        }

        .about-us-wrapper .common-hero::after {
          display: none !important;
        }

        .about-us-wrapper .common-hero .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .about-us-wrapper .common-hero .row {
          justify-content: flex-start !important;
          text-align: left !important;
        }

        .about-us-wrapper .common-hero .col-lg-6 {
          margin: 0 !important;
          text-align: left !important;
          max-width: 100% !important;
          width: 100% !important;
        }

        .about-us-wrapper .common-hero .main-heading {
          text-align: left !important;
        }

        .about-us-wrapper .common-hero .main-heading h1 {
          color: #FFFFFF !important;
          font-size: clamp(34px, 4.4vw, 52px) !important;
          font-weight: 900 !important;
          letter-spacing: -0.035em !important;
          line-height: 1.1 !important;
          margin-bottom: 14px !important;
          text-align: left !important;
        }

        .about-us-wrapper .common-hero .main-heading span.span {
          color: #94A3B8 !important;
          font-size: 13.5px !important;
          font-weight: 600 !important;
          text-align: left !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          letter-spacing: -0.01em !important;
        }

        .about-us-wrapper .common-hero .main-heading span.span a {
          color: #E2E8F0 !important;
          text-decoration: none !important;
          font-weight: 600 !important;
          transition: color 0.2s ease !important;
        }

        .about-us-wrapper .common-hero .main-heading span.span a:hover {
          color: #FFB800 !important;
        }

        .about-us-wrapper .common-hero .main-heading span.span .arrow {
          color: #64748B !important;
          margin: 0 4px !important;
        }

        /* BADGES ESTILO HOME PAGE CON PUNTO PULSANTE */
        .about-us-wrapper .pill-tag-home {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #FFFFFF;
          border: 1px solid rgba(255, 90, 31, 0.25);
          box-shadow: 0 2px 10px rgba(255, 90, 31, 0.08);
          padding: 5px 14px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #FF5A1F;
          margin-bottom: 16px;
        }

        .about-us-wrapper .pulse-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #FF5A1F;
          position: relative;
        }

        .about-us-wrapper .pulse-indicator::after {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: rgba(255, 90, 31, 0.4);
          animation: ringPulse 1.8s infinite;
        }

        @keyframes ringPulse {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        /* 2. SECCIÓN TRAYECTORIA Y VALOR (EXACTO TEMPLATE ABOUT6) */
        .about-us-wrapper .about2.about-page-sec {
          padding: 90px 0;
          background: #FFFFFF;
        }

        .about-us-wrapper .about2-images {
          position: relative;
          height: 520px;
          text-align: center;
        }

        .about-us-wrapper .about2-images .image1 {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 3;
        }

        .about-us-wrapper .about2-images .image1 img {
          border-radius: 6px;
          box-shadow: 0 12px 28px rgba(10, 37, 64, 0.12);
          border: 3px solid #FFFFFF;
          max-width: 100%;
        }

        .about-us-wrapper .about2-images .image2 {
          padding-top: 50px;
          display: inline-block;
          z-index: 1;
        }

        .about-us-wrapper .about2-images .image2 img {
          border-radius: 8px;
          box-shadow: 0 20px 44px rgba(10, 37, 64, 0.16);
          border: 4px solid #FFFFFF;
          max-width: 100%;
        }

        .about-us-wrapper .about2-images .image3 {
          position: absolute;
          bottom: 10px;
          right: 0;
          z-index: 2;
        }

        .about-us-wrapper .about2-images .image3 img {
          border-radius: 6px;
          box-shadow: 0 12px 28px rgba(10, 37, 64, 0.12);
          border: 3px solid #FFFFFF;
          max-width: 100%;
        }

        .about-us-wrapper .about2-images .counter-box {
          background: #0A2540;
          width: 210px;
          padding: 18px 20px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          position: absolute;
          top: 0;
          right: 0;
          z-index: 5;
          box-shadow: 0 14px 30px rgba(10, 37, 64, 0.22);
          border: 2px solid rgba(255, 184, 0, 0.35);
          animation: floatCounter 4s ease-in-out infinite;
        }

        @keyframes floatCounter {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .about-us-wrapper .about2-images .counter-box h3 {
          font-size: 40px;
          line-height: 1;
          color: #FFB800;
          font-weight: 900;
          margin: 0;
          letter-spacing: -0.03em;
        }

        .about-us-wrapper .about2-images .counter-box p {
          text-align: start;
          padding-left: 14px;
          font-size: 13.5px;
          line-height: 1.25;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .about-us-wrapper .about2.about-page-sec .heading1 {
          padding-left: 20px;
        }

        .about-us-wrapper .about2.about-page-sec .heading1 span.span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #FF5A1F;
          margin-bottom: 16px;
        }

        .about-us-wrapper .about2.about-page-sec .heading1 h2.title {
          font-size: clamp(28px, 3.4vw, 42px);
          line-height: 1.15;
          font-weight: 900;
          color: #0A2540;
          letter-spacing: -0.03em;
          margin-bottom: 18px;
        }

        .about-us-wrapper .gradient-text-accent {
          background: linear-gradient(135deg, #FF5A1F 0%, #FF8C38 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .about-us-wrapper .about2.about-page-sec .heading1 p {
          font-size: 16px;
          line-height: 1.65;
          color: #475569;
          letter-spacing: -0.01em;
          margin-bottom: 24px;
        }

        .about-us-wrapper .about2.about-page-sec .heading1 p strong {
          color: #0A2540;
          font-weight: 700;
        }

        .about-us-wrapper .about2.about-page-sec .porgress-line-all {
          background: #FAFAFC;
          border: 1px solid rgba(10, 37, 64, 0.08);
          border-radius: 8px;
          padding: 24px 28px;
          margin-top: 10px;
          margin-bottom: 10px;
          box-shadow: 0 2px 12px rgba(10, 37, 64, 0.03);
        }

        .about-us-wrapper .about2.about-page-sec .porgress-line-all .progress-line {
          position: relative;
          margin-top: 20px;
        }

        .about-us-wrapper .about2.about-page-sec .porgress-line-all .progress-line:first-child {
          margin-top: 0;
        }

        .about-us-wrapper .about2.about-page-sec .porgress-line-all .progress-line h6 {
          font-size: 14.5px;
          font-weight: 800;
          color: #0A2540;
          margin-bottom: 8px;
          letter-spacing: -0.015em;
          padding-right: 50px;
        }

        .about-us-wrapper .about2.about-page-sec .porgress-line-all .progress-line .percentCount6 {
          position: absolute;
          right: 0;
          top: 0;
          font-size: 15px;
          font-weight: 800;
          color: #FF5A1F !important;
        }

        .about-us-wrapper .about2.about-page-sec .porgress-line-all .progressbar {
          width: 100%;
          height: 8px;
          background: #E2E8F0;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 8px;
        }

        .about-us-wrapper .about2.about-page-sec .porgress-line-all .proggress2 {
          height: 100%;
          border-radius: 4px;
          background: linear-gradient(90deg, #FFB800 0%, #FF5A1F 100%);
        }

        .about-us-wrapper .about2.about-page-sec .heading1 .theme-btn1 {
          background: #0A2540;
          color: #FFFFFF;
          padding: 15px 32px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.01em;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 24px rgba(10, 37, 64, 0.2);
          transition: all 0.25s ease;
        }

        .about-us-wrapper .about2.about-page-sec .heading1 .theme-btn1:hover {
          background: #FF5A1F;
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(255, 90, 31, 0.35);
        }

        .about-us-wrapper .about2.about-page-sec .heading1 .theme-btn1 i {
          transition: transform 0.2s ease;
        }

        .about-us-wrapper .about2.about-page-sec .heading1 .theme-btn1:hover i {
          transform: translateX(4px);
        }

        /* 3. SECCIÓN MISIÓN & VISIÓN */
        .about-us-wrapper .mission-vision-section {
          padding: 90px 24px;
          background: #FFFFFF;
          border-top: 1px solid rgba(10, 37, 64, 0.05);
        }

        .about-us-wrapper .mv-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .about-us-wrapper .mission-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: center;
          margin-bottom: 85px;
        }

        .about-us-wrapper .vision-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: center;
        }

        .about-us-wrapper .vision-mosaic-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .about-us-wrapper .vision-mosaic-grid .big-item {
          grid-column: span 2;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 14px 32px rgba(10, 37, 64, 0.09);
        }

        .about-us-wrapper .vision-mosaic-grid .small-item {
          border-radius: 6px;
          overflow: hidden;
          box-shadow: 0 10px 24px rgba(10, 37, 64, 0.07);
        }

        .about-us-wrapper .vision-mosaic-grid img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        /* Tarjetas de Solución Estilo Home */
        .about-us-wrapper .solution-items-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 24px;
        }

        .about-us-wrapper .solution-item-box {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          background: #FAFAFC;
          border: 1px solid rgba(10, 37, 64, 0.08);
          border-radius: 8px;
          padding: 16px 20px;
          box-shadow: 0 2px 10px rgba(10, 37, 64, 0.02);
          transition: all 0.22s ease;
        }

        .about-us-wrapper .solution-item-box:hover {
          background: #FFFFFF;
          border-color: rgba(255, 90, 31, 0.35);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 90, 31, 0.08);
        }

        .about-us-wrapper .solution-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: 6px;
          background: #FFF7ED;
          color: #FF5A1F;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .about-us-wrapper .solution-item-title {
          font-size: 15.5px;
          font-weight: 800;
          color: #0A2540;
          letter-spacing: -0.02em;
          margin-bottom: 3px;
        }

        .about-us-wrapper .solution-item-desc {
          font-size: 13.5px;
          line-height: 1.5;
          color: #5A6A80;
          margin: 0;
        }

        /* 4. LLAMADO A LA ACCIÓN FINAL */
        .about-us-wrapper .cta-strip-final {
          padding: 75px 24px;
          background: #FFFFFF;
        }

        .about-us-wrapper .cta-strip-card {
          max-width: 1100px;
          margin: 0 auto;
          background: linear-gradient(135deg, #0A2540 0%, #113A63 100%);
          color: #FFFFFF;
          border-radius: 10px;
          padding: 46px 50px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 28px;
          box-shadow: 0 18px 44px rgba(10, 37, 64, 0.28);
        }

        .about-us-wrapper .cta-strip-card h3 {
          font-size: clamp(24px, 2.8vw, 32px);
          font-weight: 900;
          letter-spacing: -0.03em;
          margin-bottom: 8px;
          color: #FFFFFF;
          line-height: 1.2;
        }

        .about-us-wrapper .cta-strip-card p {
          font-size: 15.5px;
          color: #CBD5E1;
          margin: 0;
          max-width: 580px;
          line-height: 1.55;
        }

        .about-us-wrapper .cta-strip-buttons {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .about-us-wrapper .btn-whatsapp-glow {
          background: #25D366;
          color: #FFFFFF;
          padding: 15px 28px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.01em;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 8px 22px rgba(37, 211, 102, 0.35);
          transition: all 0.25s ease;
        }

        .about-us-wrapper .btn-whatsapp-glow:hover {
          background: #20BD5A;
          color: #FFFFFF;
          transform: translateY(-2px);
        }

        /* Responsividad */
        @media (max-width: 991px) {
          .about-us-wrapper .about2.about-page-sec .heading1 {
            padding-left: 0;
            padding-top: 40px;
          }
          .about-us-wrapper .mission-row,
          .about-us-wrapper .vision-row {
            grid-template-columns: 1fr;
            gap: 36px;
          }
          .about-us-wrapper .cta-strip-card {
            padding: 32px 24px;
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 767px) {
          .about-us-wrapper .about2-images {
            height: 560px;
          }
          .about-us-wrapper .about2-images .counter-box {
            top: 10px;
            right: 10px;
          }
        }

        @media (max-width: 575px) {
          .about-us-wrapper .about2-images {
            height: 490px;
          }
          .about-us-wrapper .about2-images .image1 img,
          .about-us-wrapper .about2-images .image3 img {
            max-width: 140px;
          }
          .about-us-wrapper .about2-images .image2 img {
            max-width: 280px;
          }
          .about-us-wrapper .about2-images .counter-box {
            width: 175px;
            padding: 12px 14px;
          }
          .about-us-wrapper .about2-images .counter-box h3 {
            font-size: 32px;
          }
          .about-us-wrapper .about2-images .counter-box p {
            font-size: 12px;
            padding-left: 8px;
          }
        }
      ` }} />

      {/* ========================================================= */}
      {/* 1. SECCIÓN HERO / BREADCRUMB: ENCABEZADO DE PÁGINA        */}
      {/* ========================================================= */}
      <section id="nosotros-hero" aria-label="Encabezado Sobre Nosotros">
        <Breadcrumb Title="Sobre Nosotros • Trayectoria y Compromiso" />
      </section>

      {/* ========================================================= */}
      {/* 2. SECCIÓN TRAYECTORIA Y SERVICIO: BALANZA DIGITAL & APP  */}
      {/* ========================================================= */}
      <section id="nosotros-trayectoria-servicio" className="about2 about-page-sec sp" aria-label="Servicio y Trayectoria con Balanza Digital">
        <div className="container">
          <div className="row align-items-center">
            {/* Columna Izquierda: 3 imágenes exactas y counter-box de la plantilla */}
            <div className="col-lg-6">
              <div className="about2-images">
                <div className="image1">
                  <img
                    src="/assets/img/about/about2-img1.png"
                    alt="Atención técnica de gas de cocina RappiGas"
                    style={{ width: '247px', height: 'auto', objectFit: 'cover' }}
                  />
                </div>
                <div className="image2 image-anime">
                  <img
                    src="/assets/img/about/about2-img2.png"
                    alt="Repartidor de gas entregando balón a domicilio con delivery gratis"
                    style={{ width: '470px', height: 'auto', objectFit: 'cover' }}
                  />
                </div>
                <div className="image3">
                  <img
                    src="/assets/img/about/about2-img3.png"
                    alt="Pesaje en balanza digital y peso exacto en tu cocina"
                    style={{ width: '247px', height: 'auto', objectFit: 'cover' }}
                  />
                </div>
                <div className="counter-box">
                  <h3>+10</h3>
                  <p>
                    Años de <br /> Experiencia
                  </p>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Orientado a gas de cocina, app, contraentrega */}
            <div className="col-lg-6">
              <div className="heading1">
                <span className="span">
                  <img src="/assets/img/icons/span1.png" alt="" /> Nuestro Servicio
                </span>
                <h2 className="title tg-element-title">
                  Tu balón de gas de cocina con <span className="gradient-text-accent">balanza digital, delivery gratis</span> y pago contraentrega
                </h2>
                <div className="space16"></div>
                <p>
                  En RappiGas modernizamos la compra de gas de cocina para los hogares peruanos. Pide tu balón de 10 kg fácilmente desde nuestra aplicación móvil para Android, recíbelo en tu puerta con <strong>delivery 100% gratis en 25 a 35 minutos</strong> y comprueba el peso exacto en nuestra balanza digital frente a ti antes de pagar contraentrega (Yape, Plin, POS o efectivo). Además, acumulas puntos por cada pedido para canjear increíbles premios.
                </p>

                <div className="space10"></div>

                <div className="porgress-line-all">
                  <div className="progress-line">
                    <h6>Pesaje en Puerta con Balanza Digital (10 kg Exactos)</h6>
                    <div id="progress1">
                      <div className="percentCount percentCount6">100%</div>
                      <div className="progressbar">
                        <div className="proggress2" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="progress-line">
                    <h6>Delivery Gratis y Puntual a tu Domicilio (&lt; 35 min)</h6>
                    <div id="progress2">
                      <div className="percentCount percentCount6">98%</div>
                      <div className="progressbar">
                        <div className="proggress2" style={{ width: '98%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="progress-line">
                    <h6>Pagos Flexibles Contraentrega (Yape, Plin, POS o Efectivo)</h6>
                    <div id="progress3">
                      <div className="percentCount percentCount6">100%</div>
                      <div className="progressbar">
                        <div className="proggress2" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space30"></div>
                <div className="button">
                  <Link className="theme-btn1" href="/productos">
                    Pide por la App <span><i className="bi bi-arrow-right"></i></span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. SECCIÓN MISIÓN Y VISIÓN: DELIVERY GRATIS, APP Y PUNTOS  */}
      {/* ========================================================= */}
      <section id="nosotros-mision-vision" className="mission-vision-section" aria-label="Misión y Visión RappiGas">
        <div className="mv-container">
          
          {/* Fila 1: Nuestra Misión */}
          <div className="mission-row">
            <div>
              <div className="pill-tag-home">
                <span className="pulse-indicator"></span>
                <span>Nuestra Misión</span>
              </div>

              <h2 className="section-title-custom">
                Gas de cocina honesto, peso completo y <span className="gradient-text-accent">delivery gratis</span> para tu hogar
              </h2>

              <p className="section-desc-custom">
                Nuestra misión es asegurar que cada familia cocine con total tranquilidad. Eliminamos los cobros de envío y la duda del peso incompleto: cada balón de gas de cocina se pesa frente a tus ojos en <strong>balanza digital</strong> y pagas contraentrega únicamente cuando estás conforme.
              </p>

              <div className="solution-items-group">
                <div className="solution-item-box">
                  <div className="solution-icon-circle">
                    <i className="bi bi-truck"></i>
                  </div>
                  <div>
                    <div className="solution-item-title">Delivery 100% Gratis</div>
                    <p className="solution-item-desc">Llevamos tu balón de gas de cocina directo a tu hogar sin ningún costo de envío adicional.</p>
                  </div>
                </div>

                <div className="solution-item-box">
                  <div className="solution-icon-circle">
                    <i className="bi bi-gift-fill"></i>
                  </div>
                  <div>
                    <div className="solution-item-title">Puntos para Canjear Premios</div>
                    <p className="solution-item-desc">Pide desde la aplicación y suma puntos en cada compra para canjear por balones gratis, descuentos y premios para tu cocina.</p>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 18px 40px rgba(10,37,64,0.12)', border: '4px solid #FFFFFF' }}>
              <img
                src="/assets/img/others/solution-img1.png"
                alt="Familia cocinando con balón de gas seguro RappiGas"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>

          {/* Fila 2: Nuestra Visión */}
          <div className="vision-row">
            {/* Mosaico de 3 fotos para Visión */}
            <div className="vision-mosaic-grid">
              <div className="big-item">
                <img src="/assets/img/about/visiton-img1.png" alt="Aplicación móvil para pedir gas de cocina" />
              </div>
              <div className="small-item">
                <img src="/assets/img/about/visiton-img2.png" alt="Instalación técnica gratuita y segura" />
              </div>
              <div className="small-item">
                <img src="/assets/img/about/visiton-img3.png" alt="Control de balanza y llama azul" />
              </div>
            </div>

            <div>
              <div className="pill-tag-home">
                <span className="pulse-indicator"></span>
                <span>Nuestra Visión</span>
              </div>

              <h2 className="section-title-custom">
                La aplicación móvil líder en venta de <span className="gradient-text-accent">gas de cocina</span> en el Perú
              </h2>

              <p className="section-desc-custom">
                Aspiramos a ser la aplicación indispensable en cada cocina peruana: la forma más práctica, rápida y confiable de pedir tu balón de gas con beneficios y premios en cada recarga.
              </p>

              <div className="solution-items-group">
                <div className="solution-item-box">
                  <div className="solution-icon-circle">
                    <i className="bi bi-credit-card-2-front-fill"></i>
                  </div>
                  <div>
                    <div className="solution-item-title">Pagos Seguros Contraentrega</div>
                    <p className="solution-item-desc">Tú eliges cómo pagar al recibir tu balón: Yape, Plin, tarjeta con POS inalámbrico o efectivo.</p>
                  </div>
                </div>

                <div className="solution-item-box">
                  <div className="solution-icon-circle">
                    <i className="bi bi-shield-lock-fill"></i>
                  </div>
                  <div>
                    <div className="solution-item-title">Instalación y Válvulas Cero Fugas</div>
                    <p className="solution-item-desc">Conexión profesional sin costo con comprobación de llama azul limpia para el cuidado de tu familia.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. SECCIÓN LLAMADO A LA ACCIÓN FINAL: PEDIDOS & WHATSAPP   */}
      {/* ========================================================= */}
      <section id="nosotros-cta-pedidos" className="cta-strip-final" aria-label="Pedir Gas de Cocina a Domicilio">
        <div className="cta-strip-card">
          <div>
            <h3>¿Se te acabó el gas de cocina? Pídelo ahora con delivery gratis</h3>
            <p>
              Pide tu balón en minutos por la aplicación o WhatsApp, acumula puntos para premios y paga contraentrega al recibirlo con balanza digital.
            </p>
          </div>

          <div className="cta-strip-buttons">
            <a
              href="https://wa.me/51977665554"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp-glow"
              title="Pedir gas de cocina por WhatsApp"
            >
              <i className="bi bi-whatsapp"></i>
              <span>Pedir al 977 665 554</span>
            </a>
            <Link href="/productos" className="btn-action-primary" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}>
              <span>Ver Balones de Cocina</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
