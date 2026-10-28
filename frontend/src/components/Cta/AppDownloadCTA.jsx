'use client';

import React from 'react';
import Link from 'next/link';

export default function AppDownloadCTA() {
  return (
    <section className="rappigas-rewards-section" id="club-recompensas" suppressHydrationWarning>
      <style dangerouslySetInnerHTML={{ __html: `
        .rappigas-rewards-section {
          background: linear-gradient(135deg, #FDFBF7 0%, #FAF5EE 50%, #F5EFE6 100%);
          padding: 55px 24px;
          position: relative;
          overflow: hidden;
          border-top: 1px solid rgba(10, 37, 64, 0.05);
          border-bottom: 1px solid rgba(10, 37, 64, 0.05);
        }

        /* Resplandores y Elementos de Fondo */
        .rappigas-rewards-section .glow-peach {
          position: absolute;
          width: 440px;
          height: 440px;
          top: -120px;
          right: -80px;
          background: radial-gradient(circle, rgba(255, 90, 31, 0.08) 0%, rgba(255, 90, 31, 0) 70%);
          filter: blur(70px);
          pointer-events: none;
          z-index: 0;
        }

        .rappigas-rewards-section .glow-blue {
          position: absolute;
          width: 460px;
          height: 460px;
          bottom: -140px;
          left: -80px;
          background: radial-gradient(circle, rgba(10, 37, 64, 0.05) 0%, rgba(10, 37, 64, 0) 70%);
          filter: blur(75px);
          pointer-events: none;
          z-index: 0;
        }

        .rappigas-rewards-section .rewards-container {
          max-width: 1260px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .rappigas-rewards-section .rewards-grid {
          display: grid;
          grid-template-columns: 0.92fr 1.08fr;
          gap: 36px;
          align-items: center;
        }

        /* ========================================= */
        /* COLUMNA IZQUIERDA: CONTENIDO COMPACTO     */
        /* ========================================= */
        .rappigas-rewards-section .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #FFFFFF;
          border: 1px solid rgba(255, 90, 31, 0.25);
          box-shadow: 0 2px 8px rgba(255, 90, 31, 0.08);
          padding: 4px 11px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #FF5A1F;
          margin-bottom: 12px;
        }

        .rappigas-rewards-section .pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #FF5A1F;
          position: relative;
        }

        .rappigas-rewards-section .pulse-dot::after {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          width: 13px;
          height: 13px;
          border-radius: 50%;
          background: rgba(255, 90, 31, 0.4);
          animation: pulseRing 1.8s cubic-bezier(0.24, 0, 0.38, 1) infinite;
        }

        @keyframes pulseRing {
          0% { transform: scale(0.6); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }

        .rappigas-rewards-section .main-title {
          font-size: clamp(28px, 3.4vw, 42px);
          font-weight: 900;
          color: #0A2540;
          line-height: 1.1;
          letter-spacing: -0.025em;
          margin-bottom: 12px;
        }

        .rappigas-rewards-section .gradient-word {
          background: linear-gradient(135deg, #FF5A1F 0%, #FF8C38 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .rappigas-rewards-section .main-desc {
          font-size: 14.5px;
          line-height: 1.5;
          color: #4A5568;
          max-width: 500px;
          margin-bottom: 18px;
        }

        .rappigas-rewards-section .main-desc strong {
          color: #0A2540;
          font-weight: 700;
        }

        /* Micro-Beneficios Compactos */
        .rappigas-rewards-section .benefits-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px 12px;
          margin-bottom: 18px;
          max-width: 510px;
        }

        .rappigas-rewards-section .benefit-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(6px);
          border: 1px solid rgba(10, 37, 64, 0.06);
          border-radius: 6px;
          padding: 7px 11px;
          font-size: 12px;
          font-weight: 600;
          color: #1A202C;
          transition: all 0.2s ease;
        }

        .rappigas-rewards-section .benefit-item:hover {
          background: #FFFFFF;
          border-color: rgba(255, 90, 31, 0.25);
          transform: translateY(-1px);
        }

        .rappigas-rewards-section .benefit-icon {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #FFF0EB;
          color: #FF5A1F;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          flex-shrink: 0;
        }

        /* ========================================= */
        /* TARJETA DE RECOMPENSA INCENTIVO (+150 PTS)*/
        /* (Ubicada en la col izquierda para no tapar */
        /*  la imagen del app en absoluto)           */
        /* ========================================= */
        .rappigas-rewards-section .reward-incentive-box {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 90, 31, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
          max-width: 510px;
          box-shadow: 0 8px 22px rgba(255, 90, 31, 0.08);
          transition: all 0.2s ease;
        }

        .rappigas-rewards-section .reward-incentive-box:hover {
          border-color: rgba(255, 90, 31, 0.4);
          box-shadow: 0 10px 26px rgba(255, 90, 31, 0.12);
        }

        .rappigas-rewards-section .reward-icon-circle {
          width: 42px;
          height: 42px;
          border-radius: 6px;
          background: linear-gradient(135deg, #FF5A1F 0%, #FF8C38 100%);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(255, 90, 31, 0.3);
        }

        .rappigas-rewards-section .reward-incentive-content {
          flex: 1;
        }

        .rappigas-rewards-section .reward-title {
          font-size: 13.5px;
          font-weight: 800;
          color: #0A2540;
          margin-bottom: 2px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .rappigas-rewards-section .reward-desc {
          font-size: 11.5px;
          color: #4A5568;
          line-height: 1.25;
          margin: 0;
        }

        /* Barra de Progreso de Puntos */
        .rappigas-rewards-section .points-progress-bar {
          background: #F1F5F9;
          height: 5px;
          border-radius: 3px;
          overflow: hidden;
          margin-top: 5px;
        }

        .rappigas-rewards-section .points-progress-fill {
          height: 100%;
          width: 50%;
          background: linear-gradient(90deg, #FF5A1F, #FFB020);
          border-radius: 3px;
        }

        .rappigas-rewards-section .points-progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 9.5px;
          font-weight: 700;
          color: #64748B;
          margin-top: 3px;
        }

        /* Botón Principal Compacto */
        .rappigas-rewards-section .action-cta-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }

        .rappigas-rewards-section .btn-rewards-main {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #0A2540;
          color: #FFFFFF;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 14.5px;
          font-weight: 700;
          text-decoration: none;
          box-shadow: 0 6px 16px rgba(10, 37, 64, 0.18);
          transition: all 0.2s ease;
        }

        .rappigas-rewards-section .btn-rewards-main:hover {
          background: #113A63;
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(10, 37, 64, 0.26);
          color: #FFFFFF;
        }

        .rappigas-rewards-section .btn-rewards-main i {
          transition: transform 0.2s ease;
        }

        .rappigas-rewards-section .btn-rewards-main:hover i {
          transform: translateX(3px);
        }

        /* Zona de Descarga Compacta */
        .rappigas-rewards-section .download-dock {
          padding-top: 16px;
          border-top: 1px solid rgba(10, 37, 64, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .rappigas-rewards-section .dock-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .rappigas-rewards-section .dock-label {
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #64748B;
        }

        .rappigas-rewards-section .google-play-card {
          display: inline-flex;
          align-items: center;
          transition: transform 0.2s ease;
        }

        .rappigas-rewards-section .google-play-card:hover {
          transform: scale(1.04);
        }

        .rappigas-rewards-section .google-play-card img {
          height: 38px;
          width: auto;
          display: block;
        }

        /* Calificación Social Proof */
        .rappigas-rewards-section .social-proof-box {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rappigas-rewards-section .stars-row {
          display: flex;
          align-items: center;
          gap: 2px;
          color: #F59E0B;
          font-size: 13px;
        }

        .rappigas-rewards-section .rating-text {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
        }

        .rappigas-rewards-section .rating-text strong {
          color: #0A2540;
        }

        /* ========================================= */
        /* COLUMNA DERECHA: IMAGEN GRANDE Y CLARA    */
        /* (100% libre de tarjetas que la tapen)     */
        /* ========================================= */
        .rappigas-rewards-section .visual-hero-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px;
        }

        .rappigas-rewards-section .main-card-frame {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          box-shadow: none;
          transition: transform 0.3s ease;
        }

        .rappigas-rewards-section .main-card-frame:hover {
          transform: translateY(-4px) scale(1.02);
        }

        .rappigas-rewards-section .main-card-frame img {
          max-height: 560px;
          width: 100%;
          max-width: 620px;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 24px 38px rgba(10, 37, 64, 0.20));
          transform: scale(1.05);
        }

        /* Insignia Flotante: Superior Derecha (Marco Perimetral) */
        .rappigas-rewards-section .floating-chip-top {
          position: absolute;
          top: -6px;
          right: -8px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 6px;
          padding: 7px 13px;
          box-shadow: 0 8px 20px rgba(10, 37, 64, 0.12);
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 2;
          animation: floatChip1 4.5s ease-in-out infinite;
        }

        @keyframes floatChip1 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .rappigas-rewards-section .floating-chip-top .chip-icon {
          width: 26px;
          height: 26px;
          border-radius: 4px;
          background: #ECFDF5;
          color: #10B981;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
        }

        .rappigas-rewards-section .chip-top-text {
          font-size: 11.5px;
          font-weight: 700;
          color: #0A2540;
          line-height: 1.15;
        }

        .rappigas-rewards-section .chip-top-sub {
          font-size: 10px;
          color: #64748B;
        }

        /* Responsividad */
        @media (max-width: 1080px) {
          .rappigas-rewards-section {
            padding: 40px 18px;
          }
          .rappigas-rewards-section .rewards-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .rappigas-rewards-section .main-card-frame img {
            max-height: 380px;
          }
          .rappigas-rewards-section .floating-chip-top {
            right: 8px;
            top: 4px;
          }
        }

        @media (max-width: 640px) {
          .rappigas-rewards-section .benefits-list {
            grid-template-columns: 1fr;
          }
          .rappigas-rewards-section .btn-rewards-main {
            width: 100%;
            justify-content: center;
          }
          .rappigas-rewards-section .download-dock {
            flex-direction: column;
            align-items: flex-start;
          }
          .rappigas-rewards-section .main-card-frame img {
            max-height: 300px;
          }
        }
      ` }} />

      {/* Resplandores Suaves de Fondo */}
      <div className="glow-peach" aria-hidden="true" />
      <div className="glow-blue" aria-hidden="true" />

      <div className="rewards-container">
        <div className="rewards-grid">
          
          {/* ========================================= */}
          {/* COLUMNA IZQUIERDA: CONTENIDO COMPACTO     */}
          {/* ========================================= */}
          <div>
            <div className="badge-pill">
              <span className="pulse-dot"></span>
              <span>Club de Recompensas</span>
            </div>

            <h2 className="main-title">
              Pide tu gas. <br />
              Suma puntos. <br />
              <span className="gradient-word">Gana premios.</span>
            </h2>

            <p className="main-desc">
              Descarga nuestra app, pide tu balón con <strong>balanza digital en vivo</strong> y acumula puntos para canjear por balones gratis, descuentos y sorpresas para tu hogar.
            </p>

            {/* Micro-Beneficios Compactos */}
            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="bi bi-coin"></i>
                </div>
                <span>1 Punto por cada S/ 10</span>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="bi bi-shield-check"></i>
                </div>
                <span>Balanza digital en vivo</span>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="bi bi-gift"></i>
                </div>
                <span>Canjes directos en la App</span>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="bi bi-lightning-charge"></i>
                </div>
                <span>Entrega en 25 - 35 min</span>
              </div>
            </div>

            {/* Tarjeta de Recompensa Incentivo (+150 Pts) en la columna izquierda */}
            <div className="reward-incentive-box">
              <div className="reward-icon-circle">
                <i className="bi bi-gift-fill"></i>
              </div>
              <div className="reward-incentive-content">
                <div className="reward-title">
                  +150 Puntos Gratis de Bienvenida <i className="bi bi-star-fill" style={{ color: '#F59E0B', fontSize: '12px' }}></i>
                </div>
                <p className="reward-desc">
                  Automáticos al registrarte y hacer tu primer pedido desde la App.
                </p>
                <div className="points-progress-bar">
                  <div className="points-progress-fill"></div>
                </div>
                <div className="points-progress-labels">
                  <span>Nivel Bronce</span>
                  <span>150 / 300 pts hacia tu primer balón gratis</span>
                </div>
              </div>
            </div>

            {/* Botón Principal */}
            <div className="action-cta-wrap">
              <Link href="/nosotros" className="btn-rewards-main">
                <span>Conoce el Catálogo de Premios</span>
                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            {/* Zona de Descarga y Social Proof */}
            <div className="download-dock">
              <div className="dock-left">
                <span className="dock-label">Descarga la App:</span>
                <a
                  href="https://play.google.com/store"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="google-play-card"
                  title="Descargar RappiGas en Google Play"
                >
                  <img
                    src="/assets/img/app/google-play-badge.svg"
                    alt="Disponible en Google Play"
                  />
                </a>
              </div>

              <div className="social-proof-box">
                <div className="stars-row">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                </div>
                <div className="rating-text">
                  <strong>4.9 / 5</strong> · +10,000 pedidos
                </div>
              </div>
            </div>
          </div>

          {/* ========================================= */}
          {/* COLUMNA DERECHA: IMAGEN GRANDE Y DESPEJADA*/}
          {/* ========================================= */}
          <div className="visual-hero-wrap">
            {/* Contenedor Principal de la Imagen (100% transparente y grande) */}
            <div className="main-card-frame">
              <img
                src="/assets/img/hero/app_rappigas.png"
                alt="Familia acumulando puntos con la App RappiGas"
              />
            </div>

            {/* Insignia Flotante: Superior Derecha (en la esquina, sin tapar) */}
            <div className="floating-chip-top">
              <div className="chip-icon">
                <i className="bi bi-lightning-fill"></i>
              </div>
              <div>
                <div className="chip-top-text">Entrega Express</div>
                <div className="chip-top-sub">25 a 35 minutos</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
