'use client';

import React from 'react';

export default function HowToCreateAccount() {
  return (
    <section className="rappigas-how-to-section" id="como-crear-cuenta" suppressHydrationWarning>
      <style dangerouslySetInnerHTML={{ __html: `
        .rappigas-how-to-section {
          background-color: #FAFAFC;
          padding: 80px 24px;
          position: relative;
          overflow: hidden;
          font-family: inherit;
        }

        .rappigas-how-to-section .section-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* Encabezado Principal */
        .rappigas-how-to-section .header-block {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 56px;
        }

        .rappigas-how-to-section .header-badge {
          display: inline-block;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #FF9500;
          background: rgba(255, 149, 0, 0.1);
          border: 1px solid rgba(255, 149, 0, 0.25);
          padding: 5px 14px;
          border-radius: 6px;
          margin-bottom: 14px;
        }

        .rappigas-how-to-section .main-heading {
          font-size: clamp(30px, 3.8vw, 46px);
          font-weight: 900;
          color: #0A2540;
          letter-spacing: -0.025em;
          line-height: 1.15;
          margin-bottom: 16px;
        }

        .rappigas-how-to-section .heading-divider {
          width: 72px;
          height: 4px;
          background: linear-gradient(90deg, #FFB800, #FF5A1F, #0A2540);
          border-radius: 3px;
          margin: 0 auto 16px;
        }

        .rappigas-how-to-section .sub-heading {
          font-size: 16px;
          color: #5A6A80;
          line-height: 1.5;
          margin: 0;
        }

        /* ========================================= */
        /* GRILLA DE LOS 3 PRIMEROS PASOS            */
        /* ========================================= */
        .rappigas-how-to-section .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
          margin-bottom: 36px;
        }

        .rappigas-how-to-section .step-card {
          background: #FFFFFF;
          border: 1px solid rgba(10, 37, 64, 0.08);
          border-radius: 8px;
          padding: 32px 26px;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 4px 20px rgba(10, 37, 64, 0.04);
          transition: all 0.28s ease;
        }

        .rappigas-how-to-section .step-card:hover {
          transform: translateY(-5px);
          border-color: rgba(255, 149, 0, 0.35);
          box-shadow: 0 16px 36px rgba(10, 37, 64, 0.09);
        }

        /* Número Orgánico */
        .rappigas-how-to-section .step-number-shape {
          width: 54px;
          height: 54px;
          background: linear-gradient(135deg, #FFB800 0%, #FF9500 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 900;
          color: #0A2540;
          box-shadow: 0 8px 18px rgba(255, 149, 0, 0.32);
          margin-bottom: 22px;
          flex-shrink: 0;
          transition: transform 0.25s ease;
        }

        .rappigas-how-to-section .step-card:hover .step-number-shape {
          transform: rotate(-6deg) scale(1.08);
        }

        .rappigas-how-to-section .step-title {
          font-size: 19px;
          font-weight: 800;
          color: #0A2540;
          margin-bottom: 10px;
          line-height: 1.25;
        }

        .rappigas-how-to-section .step-desc {
          font-size: 14.5px;
          color: #5A6A80;
          line-height: 1.55;
          margin-bottom: 22px;
          flex-grow: 1;
        }

        /* --- PASO 1: BOTÓN ANDROID PLAY STORE --- */
        .rappigas-how-to-section .store-download-card {
          background: #F8FAFC;
          border: 1px solid rgba(10, 37, 64, 0.08);
          border-radius: 8px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: auto;
        }

        .rappigas-how-to-section .play-store-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #0A2540;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 10px 18px;
          text-decoration: none;
          color: #FFFFFF;
          box-shadow: 0 6px 16px rgba(10, 37, 64, 0.18);
          transition: all 0.2s ease;
        }

        .rappigas-how-to-section .play-store-btn:hover {
          background: #113A63;
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(10, 37, 64, 0.25);
          color: #FFFFFF;
        }

        .rappigas-how-to-section .play-store-btn svg {
          width: 26px;
          height: 26px;
          flex-shrink: 0;
        }

        .rappigas-how-to-section .play-store-texts {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
          text-align: left;
        }

        .rappigas-how-to-section .play-store-texts .small-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #94A3B8;
        }

        .rappigas-how-to-section .play-store-texts .main-label {
          font-size: 15px;
          font-weight: 700;
          color: #FFFFFF;
        }

        .rappigas-how-to-section .store-pill-note {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 600;
          color: #10B981;
        }

        /* --- PASO 2: MINI PANTALLA DE APP INTERACTIVA --- */
        .rappigas-how-to-section .mini-app-screen {
          background: #F1F5F9;
          border: 2px solid #E2E8F0;
          border-radius: 8px;
          padding: 16px 14px;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: auto;
          overflow: hidden;
        }

        /* Barra de estado simulada */
        .rappigas-how-to-section .mini-screen-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 9px;
          font-weight: 700;
          color: #64748B;
          margin-bottom: 4px;
          padding: 0 4px;
        }

        /* Botón de Ingresar */
        .rappigas-how-to-section .btn-app-login {
          background: linear-gradient(135deg, #FFB800 0%, #FF9500 100%);
          color: #0A2540;
          font-size: 12.5px;
          font-weight: 800;
          text-align: center;
          padding: 10px 12px;
          border-radius: 6px;
          box-shadow: 0 4px 10px rgba(255, 149, 0, 0.25);
          user-select: none;
        }

        /* Botón de Registrarse con Foco de Click */
        .rappigas-how-to-section .btn-app-register-wrap {
          position: relative;
          text-align: center;
          padding-top: 4px;
        }

        .rappigas-how-to-section .btn-app-register {
          display: inline-block;
          font-size: 12px;
          font-weight: 800;
          color: #0A2540;
          text-decoration: underline;
          padding: 4px 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px dashed rgba(255, 149, 0, 0.6);
        }

        /* Cursor Pointer Animado */
        .rappigas-how-to-section .click-cursor-indicator {
          position: absolute;
          right: 28px;
          bottom: -10px;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 3;
          animation: clickTapAnim 2.2s infinite ease-in-out;
        }

        .rappigas-how-to-section .click-cursor-indicator svg {
          width: 28px;
          height: 28px;
          fill: #0A2540;
          filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25));
        }

        .rappigas-how-to-section .click-pulse-ring {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(255, 149, 0, 0.4);
          top: -2px;
          left: -2px;
          animation: ringPulse 2.2s infinite cubic-bezier(0.24, 0, 0.38, 1);
        }

        @keyframes clickTapAnim {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(0.85) translateY(4px); }
        }

        @keyframes ringPulse {
          0% { transform: scale(0.5); opacity: 0.9; }
          60% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* --- PASO 3: ELEMENTOS DE IDENTIFICACIÓN --- */
        .rappigas-how-to-section .id-options-stack {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: auto;
        }

        .rappigas-how-to-section .id-option-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #F8FAFC;
          border: 1px solid rgba(10, 37, 64, 0.08);
          border-radius: 6px;
          padding: 10px 14px;
          transition: all 0.2s ease;
        }

        .rappigas-how-to-section .id-option-pill:hover {
          background: #FFFFFF;
          border-color: #FF9500;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(255, 149, 0, 0.1);
        }

        .rappigas-how-to-section .id-icon-circle {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
        }

        .rappigas-how-to-section .id-icon-circle.phone {
          background: #ECFDF5;
          color: #10B981;
        }

        .rappigas-how-to-section .id-icon-circle.google {
          background: #FEF3C7;
          color: #D97706;
        }

        .rappigas-how-to-section .id-icon-circle.email {
          background: #EFF6FF;
          color: #2563EB;
        }

        .rappigas-how-to-section .id-pill-text {
          font-size: 13px;
          font-weight: 700;
          color: #0A2540;
          line-height: 1.2;
        }

        .rappigas-how-to-section .id-pill-sub {
          font-size: 10.5px;
          color: #64748B;
        }

        /* ========================================= */
        /* PASO 4: ANCHO COMPLETO DESTACADO          */
        /* ========================================= */
        .rappigas-how-to-section .step4-full-card {
          background: linear-gradient(135deg, rgba(255, 184, 0, 0.14) 0%, rgba(255, 149, 0, 0.08) 45%, rgba(10, 37, 64, 0.04) 100%);
          border: 1.5px solid rgba(255, 184, 0, 0.35);
          border-radius: 10px;
          padding: 28px 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
          box-shadow: 0 10px 30px rgba(255, 184, 0, 0.1);
          transition: all 0.3s ease;
        }

        .rappigas-how-to-section .step4-full-card:hover {
          border-color: rgba(255, 149, 0, 0.6);
          box-shadow: 0 16px 40px rgba(255, 149, 0, 0.16);
          transform: translateY(-2px);
        }

        .rappigas-how-to-section .step4-content-left {
          display: flex;
          align-items: center;
          gap: 22px;
          flex: 1;
          min-width: 300px;
        }

        .rappigas-how-to-section .step4-number-shape {
          width: 58px;
          height: 58px;
          background: linear-gradient(135deg, #FFB800 0%, #FF9500 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 900;
          color: #0A2540;
          box-shadow: 0 8px 20px rgba(255, 149, 0, 0.35);
          flex-shrink: 0;
        }

        .rappigas-how-to-section .step4-title {
          font-size: 21px;
          font-weight: 900;
          color: #0A2540;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rappigas-how-to-section .step4-desc {
          font-size: 15px;
          color: #4A5568;
          line-height: 1.5;
          margin: 0;
          max-width: 620px;
        }

        .rappigas-how-to-section .step4-desc strong {
          color: #0A2540;
          font-weight: 800;
        }

        /* Botón de Acción Paso 4 */
        .rappigas-how-to-section .step4-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #0A2540;
          color: #FFFFFF;
          padding: 14px 26px;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 800;
          text-decoration: none;
          box-shadow: 0 8px 20px rgba(10, 37, 64, 0.22);
          white-space: nowrap;
          transition: all 0.25s ease;
        }

        .rappigas-how-to-section .step4-cta-btn:hover {
          background: #113A63;
          color: #FFFFFF;
          transform: translateY(-2px);
          box-shadow: 0 12px 26px rgba(10, 37, 64, 0.3);
        }

        /* Responsividad */
        @media (max-width: 991px) {
          .rappigas-how-to-section {
            padding: 60px 18px;
          }
          .rappigas-how-to-section .steps-grid {
            grid-template-columns: 1fr;
            gap: 22px;
          }
          .rappigas-how-to-section .step4-full-card {
            padding: 24px 20px;
            flex-direction: column;
            align-items: flex-start;
          }
          .rappigas-how-to-section .step4-content-left {
            gap: 16px;
          }
          .rappigas-how-to-section .step4-cta-btn {
            width: 100%;
            justify-content: center;
          }
        }
      ` }} />

      <div className="section-container">
        
        {/* ========================================= */}
        {/* ENCABEZADO DE LA SECCIÓN                  */}
        {/* ========================================= */}
        <div className="header-block">
          <span className="header-badge">Paso a Paso</span>
          <h2 className="main-heading">¿Cómo creo mi cuenta en la RappiGas App?</h2>
          <div className="heading-divider"></div>
          <p className="sub-heading">
            Sigue estos 4 sencillos pasos para empezar a pedir tu balón con peso exacto y acumular Rappipuntos.
          </p>
        </div>

        {/* ========================================= */}
        {/* CUADRÍCULA DE PASOS (PASOS 1, 2 Y 3)      */}
        {/* ========================================= */}
        <div className="steps-grid">

          {/* PASO 1: Descarga la App */}
          <div className="step-card">
            <div className="step-number-shape">1</div>
            <h3 className="step-title">Descarga la app oficial</h3>
            <p className="step-desc">
              Disponible de forma gratuita para tu celular Android directamente en Google Play Store.
            </p>

            <div className="store-download-card">
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="play-store-btn"
                title="Descargar RappiGas en Google Play"
              >
                {/* SVG Oficial de Google Play */}
                <svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M48.7 15.3C45.3 18.9 43.3 24.3 43.3 31.2V480.8C43.3 487.7 45.3 493.1 48.7 496.7L49.9 497.8L270.7 277V275V235L49.9 14.2L48.7 15.3Z" fill="#2196F3"/>
                  <path d="M344.8 351.1L270.7 277V235L344.8 160.9L346.2 161.7L434.3 211.8C459.5 226.1 459.5 249.9 434.3 264.3L346.2 350.3L344.8 351.1Z" fill="#FFC107"/>
                  <path d="M346.2 350.3L270.7 274.9L48.7 496.8C57 505.5 70.8 506.7 86.4 497.8L346.2 350.3Z" fill="#4CAF50"/>
                  <path d="M346.2 161.7L86.4 14.2C70.8 5.3 57 6.5 48.7 15.2L270.7 237.1L346.2 161.7Z" fill="#F44336"/>
                </svg>
                <div className="play-store-texts">
                  <span className="small-label">Disponible en</span>
                  <span className="main-label">Google Play</span>
                </div>
              </a>
              <div className="store-pill-note">
                <i className="bi bi-shield-check"></i>
                <span>Descarga 100% segura y verificada</span>
              </div>
            </div>
          </div>

          {/* PASO 2: Registro Inicial (Simulación Mini-App) */}
          <div className="step-card">
            <div className="step-number-shape">2</div>
            <h3 className="step-title">Registro Inicial</h3>
            <p className="step-desc">
              Una vez dentro de la aplicación, presiona el botón <strong>“No tengo cuenta, registrarme”</strong>.
            </p>

            {/* Mini Pantalla de App Interactiva */}
            <div className="mini-app-screen">
              <div className="mini-screen-bar">
                <span>RappiGas App</span>
                <span><i className="bi bi-wifi"></i> <i className="bi bi-battery-full"></i></span>
              </div>

              {/* Botón Principal Ingresar */}
              <div className="btn-app-login">
                Ingresar a mi cuenta
              </div>

              {/* Botón Registrarse con Cursor Animado */}
              <div className="btn-app-register-wrap">
                <span className="btn-app-register">
                  No tengo cuenta, registrarme
                </span>

                {/* Mano Cursor haciendo Click */}
                <div className="click-cursor-indicator" aria-hidden="true">
                  <div className="click-pulse-ring"></div>
                  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74 0-2.49-2.01-4.5-4.5-4.5S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.09-.35-.13-.54-.13H13v-6c0-.55-.45-1-1-1s-1 .45-1 1v10.74l-3.44-.72c-.09-.02-.18-.03-.27-.03-.38 0-.73.16-.98.42l-.84.85 4.73 4.73c.39.38.91.59 1.46.59h6.43c1.03 0 1.89-.78 1.99-1.81l.57-5.59c.06-.57-.15-1.14-.58-1.54z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* PASO 3: Identificación */}
          <div className="step-card">
            <div className="step-number-shape">3</div>
            <h3 className="step-title">Elige cómo identificarte</h3>
            <p className="step-desc">
              Selecciona tu método favorito para validar tu cuenta en segundos sin contraseñas complicadas.
            </p>

            <div className="id-options-stack">
              {/* Opción Teléfono */}
              <div className="id-option-pill">
                <div className="id-icon-circle phone">
                  <i className="bi bi-telephone-fill"></i>
                </div>
                <div>
                  <div className="id-pill-text">Número de Teléfono</div>
                  <div className="id-pill-sub">Código SMS instantáneo</div>
                </div>
              </div>

              {/* Opción Google */}
              <div className="id-option-pill">
                <div className="id-icon-circle google">
                  <i className="bi bi-google"></i>
                </div>
                <div>
                  <div className="id-pill-text">Cuenta de Google</div>
                  <div className="id-pill-sub">Acceso en 1 clic</div>
                </div>
              </div>

              {/* Opción Correo */}
              <div className="id-option-pill">
                <div className="id-icon-circle email">
                  <i className="bi bi-envelope-fill"></i>
                </div>
                <div>
                  <div className="id-pill-text">Correo Electrónico</div>
                  <div className="id-pill-sub">Registro tradicional</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================= */}
        {/* PASO 4: ¡LISTO PARA GANAR! (ANCHO COMPLETO)*/}
        {/* ========================================= */}
        <div className="step4-full-card">
          <div className="step4-content-left">
            <div className="step4-number-shape">4</div>
            <div>
              <h3 className="step4-title">
                ¡Listo para ganar! 🎁
              </h3>
              <p className="step4-desc">
                Ya puedes comenzar a hacer tus pedidos con balanza digital, <strong>sumar Rappipuntos</strong> y disfrutar de descuentos y regalos exclusivos para tu hogar.
              </p>
            </div>
          </div>

          <a
            href="https://play.google.com/store"
            target="_blank"
            rel="noopener noreferrer"
            className="step4-cta-btn"
          >
            <span>Crear mi Cuenta Ahora</span>
            <i className="bi bi-arrow-right"></i>
          </a>
        </div>

      </div>
    </section>
  );
}
