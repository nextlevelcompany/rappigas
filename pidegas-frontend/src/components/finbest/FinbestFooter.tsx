"use client";

import React from "react";
import Link from "next/link";

export default function FinbestFooter() {
  return (
    <footer
      className="tp-footer-area-2 pt-120 p-relative z-index-1"
      style={{ backgroundColor: "#16243E" }}
    >
      {/* Formas geométricas flotantes del Footer Finbest */}
      <div className="tp-footer-bg-shape-2">
        <img
          className="shape-1"
          src="/assets/img/footer/home-2/shape-1.png"
          alt="footer-shape-1"
        />
        <img
          className="shape-2"
          src="/assets/img/footer/home-2/shape-2.png"
          alt="footer-shape-2"
        />
      </div>

      <div className="tp-footer-main-area tp-footer-border pb-50">
        <div className="container">
          <div className="row">
            
            {/* Columna 1: Logo e Información Institucional */}
            <div className="col-xl-4 col-lg-4 col-md-6 col-sm-6">
              <div className="tp-footer-widget tp-footer-2-col-1 mb-50">
                <div className="tp-footer-logo mb-25 d-flex align-items-center gap-2">
                  <Link href="/" className="d-flex align-items-center gap-2">
                    <img
                      src="/assets/img/logo/logo-black.png"
                      alt="PideGas"
                      style={{ height: "40px", width: "auto", filter: "brightness(0) invert(1)" }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--tp-ff-heading, 'Jost', sans-serif)",
                        fontWeight: 900,
                        fontSize: "26px",
                        color: "#FFFFFF",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      Pide<span style={{ color: "#00A3C3" }}>Gas</span>
                    </span>
                  </Link>
                </div>
                <div className="tp-footer-widget-content">
                  <p style={{ color: "#9ca3af", lineHeight: "1.7", fontSize: "14px" }}>
                    La plataforma oficial de gas de cocina en el Perú. Conectamos tu hogar y negocio con camiones y distribuidoras formales, balanza digital certificada en puerta y válvula Click-On antifugas.
                  </p>
                  <div className="tp-footer-widget-social mt-4">
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="me-2">
                      <i className="fa-brands fa-facebook-f"></i>
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noreferrer" className="me-2">
                      <i className="fa-brands fa-twitter"></i>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noreferrer" className="me-2">
                      <i className="fa-brands fa-instagram"></i>
                    </a>
                    <a href="https://wa.me/51987654321" target="_blank" rel="noreferrer">
                      <i className="fa-brands fa-whatsapp"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna 2: Enlaces Rápidos */}
            <div className="col-xl-2 col-lg-2 col-md-6 col-sm-6">
              <div className="tp-footer-widget tp-footer-2-col-2 mb-50">
                <h3 className="tp-footer-widget-title" style={{ color: "#FFFFFF" }}>
                  Navegación
                </h3>
                <div className="tp-footer-widget-content">
                  <ul>
                    <li>
                      <Link href="/">Inicio</Link>
                    </li>
                    <li>
                      <Link href="/nosotros">Nosotros</Link>
                    </li>
                    <li>
                      <Link href="/productos">Productos y Tarifas</Link>
                    </li>
                    <li>
                      <Link href="/contacto">Contacto Comercial</Link>
                    </li>
                    <li>
                      <Link href="/auth/registro-empresa">Afiliar Distribuidora</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Columna 3: Artículos de Interés y Seguridad */}
            <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
              <div className="tp-footer-widget tp-footer-2-col-3 mb-50">
                <h3 className="tp-footer-widget-title" style={{ color: "#FFFFFF" }}>
                  Guía de Seguridad
                </h3>
                <div className="tp-footer-widget-content">
                  <div className="tp-footer-widget-item mb-3">
                    <h4 className="tp-footer-widget-item-title">
                      <Link href="/productos">
                        ¿Cómo verificar la tara metálica y el peso exacto en tu balanza?
                      </Link>
                    </h4>
                    <span style={{ color: "#00A3C3", fontSize: "12px" }}>
                      <i className="fa-regular fa-calendar-days me-1"></i> Control OSINERGMIN
                    </span>
                  </div>
                  <div className="tp-footer-widget-item">
                    <h4 className="tp-footer-widget-item-title">
                      <Link href="/nosotros">
                        Válvula Click-On Premium vs perilla manual a rosca
                      </Link>
                    </h4>
                    <span style={{ color: "#00A3C3", fontSize: "12px" }}>
                      <i className="fa-regular fa-calendar-days me-1"></i> Prevención de Fugas
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna 4: Boletín y Emergencias */}
            <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
              <div className="tp-footer-widget tp-footer-2-col-4 mb-50">
                <h3 className="tp-footer-widget-title" style={{ color: "#FFFFFF" }}>
                  Boletín y Promociones
                </h3>
                <div className="tp-footer-widget-content">
                  <p style={{ color: "#9ca3af", fontSize: "13px" }}>
                    Recibe cupones de descuento mensuales y tips de ahorro de gas en tu correo:
                  </p>
                  <div className="tp-footer-content-email">
                    <form onSubmit={(e) => e.preventDefault()}>
                      <input
                        type="email"
                        placeholder="tu-correo@ejemplo.com"
                        required
                        style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#fff" }}
                      />
                      <button type="submit">
                        <span>
                          <i className="fa-solid fa-paper-plane"></i>
                        </span>
                      </button>
                    </form>
                  </div>
                  <div className="mt-3 p-2 rounded" style={{ background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)" }}>
                    <span style={{ color: "#f87171", fontSize: "11px", fontWeight: "bold" }}>
                      Emergencias por Fugas: 116 (Bomberos del Perú)
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Copyright e Información Legal */}
      <div className="tp-footer-copyright-area p-relative" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "24px 0" }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-12 col-lg-6">
              <div className="tp-footer-copyright-inner">
                <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>
                  © {new Date().getFullYear()} PideGas Perú S.A.C. Todos los derechos reservados. RUC 20608945123.
                </p>
              </div>
            </div>
            <div className="col-md-12 col-lg-6">
              <div className="tp-footer-copyright-inner text-lg-end">
                <Link href="/terminos-servicio" className="me-3" style={{ color: "#9ca3af", fontSize: "12px" }}>
                  Términos de Servicio
                </Link>
                <Link href="/terminos-condiciones" className="me-3" style={{ color: "#9ca3af", fontSize: "12px" }}>
                  Condiciones
                </Link>
                <Link href="/politica-privacidad" className="me-3" style={{ color: "#9ca3af", fontSize: "12px" }}>
                  Privacidad
                </Link>
                <Link
                  href="/libro-reclamaciones"
                  style={{
                    color: "#00A3C3",
                    fontSize: "12px",
                    fontWeight: "bold",
                    borderBottom: "1px solid #00A3C3",
                  }}
                >
                  Libro de Reclamaciones
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
