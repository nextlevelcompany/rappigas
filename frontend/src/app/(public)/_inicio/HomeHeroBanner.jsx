'use client';

import { useEffect, useRef } from "react";
import loadBackgroudImages from "./loadBackgroudImages";
import parse from 'html-react-parser';
import Link from "next/link";
import Slider from "react-slick";

export default function HomeHeroBanner({ bgImg = "/assets/img/bg/hero1-bg.png", slides }) {
  const sliderRef = useRef(null);

  useEffect(() => {
    loadBackgroudImages();
  }, []);

  // =========================================================================
  // CONFIGURACIÓN DE DIAPOSITIVAS: GAS DE COCINA, APP, CONTRAENTREGA, PUNTOS
  // =========================================================================
  const defaultSlides = [
    // -----------------------------------------------------------------------
    // SLIDE 1: Pide tu gas de cocina con balanza digital y contraentrega
    // -----------------------------------------------------------------------
    {
      id: 1,
      subTitle: "Gas de Cocina Limpio y Rendidor",
      title: "Pide tu Balón de Gas de Cocina con RappiGas <span class='after'>a Domicilio</span> Pago Contraentrega",
      content: "Delivery 100% gratis en 25 a 35 min a tu puerta. Comprueba los 10 kg exactos en balanza digital y paga contraentrega con Yape, Plin, POS o efectivo.",
      btnName: "Pedir Gas de Cocina",
      btnUrl: "/pedir-gas",
      image2: "/assets/img/hero/hero1-image2.png",
      imageContainerStyle: { right: '15px' },
      topBadgeRight: '20px',
      topBadgeTop: '45px',
      topBadgeTitle: "Delivery 100% Gratis",
      topBadgeSubtitle: "Llegamos en 25 a 35 min",
      topBadgeIcon: "bi-truck",
      topBadgeColor: "#198754",
      topBadgeBg: "rgba(25, 135, 84, 0.12)",
      badgeLeft: '15px',
      badgeBottom: '60px',
      badgeTitle: "Balanza Digital en Puerta",
      badgeSubtitle: "10 kg exactos verificados",
      badgeIcon: "bi-shield-check",
      badgeColor: "#FF5722",
      badgeBg: "rgba(255, 87, 34, 0.12)",
    },
    // -----------------------------------------------------------------------
    // SLIDE 2: Club de Recompensas Rappipuntos (Premios sin sorteos)
    // -----------------------------------------------------------------------
    {
      id: 2,
      subTitle: "Club de Recompensas Rappipuntos • ¡Cada Compra Suma!",
      title: "Acumula Puntos en Cada Balón y <span class='after'>Canjea Premios</span> Gratis",
      content: "Pide por la app oficial y acumula puntos automáticos con cada balón de gas de cocina. Canjea recargas gratis, ollas, sartenes y electrohogar sin sorteos.",
      btnName: "Ver Premios y Puntos",
      btnUrl: "/fidelidad",
      image2: "/assets/img/hero/premios_rappigas.png",
      imageContainerStyle: { right: '15px' },
      topBadgeRight: '20px',
      topBadgeTop: '45px',
      topBadgeTitle: "+50 Puntos por Balón",
      topBadgeSubtitle: "Acumula en cada pedido",
      topBadgeIcon: "bi-stars",
      topBadgeColor: "#d97706",
      topBadgeBg: "rgba(217, 119, 6, 0.12)",
      badgeLeft: '15px',
      badgeBottom: '60px',
      badgeTitle: "Canjea Premios Gratis",
      badgeSubtitle: "Electrohogar y balones sin sorteos",
      badgeIcon: "bi-gift-fill",
      badgeColor: "#dc2626",
      badgeBg: "rgba(220, 38, 38, 0.12)",
    },
  ];

  const activeSlides = slides && slides.length > 0 ? slides : defaultSlides;

  // Configuración del carrusel / slider
  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    fade: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5500,
    arrows: false,
    pauseOnHover: true,
  };

  return (
    <div className="hero_main_area1 hero-slider-area" style={{ position: 'relative' }}>
      {/* Estilos aislados para evitar conflictos con clases heredadas del template (.shape1, .shape2, etc.) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-floating-card {
          position: absolute !important;
          background: #ffffff !important;
          border-radius: 12px !important;
          padding: 13px 18px !important;
          box-shadow: 0 14px 32px rgba(15, 23, 42, 0.13), 0 3px 8px rgba(0, 0, 0, 0.04) !important;
          display: flex !important;
          align-items: center !important;
          gap: 13px !important;
          border: 1px solid rgba(0, 0, 0, 0.07) !important;
          width: fit-content !important;
          max-width: 290px !important;
          white-space: nowrap !important;
          z-index: 5 !important;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease !important;
          box-sizing: border-box !important;
        }
        .hero-floating-card:hover {
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18), 0 6px 14px rgba(0, 0, 0, 0.08) !important;
        }
        .hero-floating-card-top {
          animation: heroBadgeFloatTop 3.6s ease-in-out infinite !important;
        }
        .hero-floating-card-bottom {
          animation: heroBadgeFloatBottom 3.6s ease-in-out infinite !important;
        }
        @keyframes heroBadgeFloatTop {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
          100% { transform: translateY(0px); }
        }
        @keyframes heroBadgeFloatBottom {
          0% { transform: translateY(0px); }
          50% { transform: translateY(7px); }
          100% { transform: translateY(0px); }
        }

        @media (max-width: 991px) {
          .hero-slider-all-images {
            height: 480px !important;
            margin-top: 30px !important;
          }
          .hero-floating-card {
            padding: 10px 14px !important;
            max-width: 250px !important;
          }
        }
        @media (max-width: 575px) {
          .hero-slider-all-images {
            height: 400px !important;
          }
          .hero-floating-card {
            padding: 8px 12px !important;
            max-width: calc(100% - 24px) !important;
            white-space: normal !important;
            border-radius: 10px !important;
          }
          .hero-floating-card .hero-badge-icon-box {
            width: 38px !important;
            height: 38px !important;
            font-size: 19px !important;
          }
          .hero-floating-card .hero-badge-title {
            font-size: 13px !important;
          }
          .hero-floating-card .hero-badge-subtitle {
            font-size: 11px !important;
          }
        }
      ` }} />

      <Slider ref={sliderRef} {...settings}>
        {activeSlides.map((slide) => (
          <div key={slide.id}>
            <div
              className="hero1"
              data-background={bgImg}
              style={{
                backgroundImage: bgImg ? `url(${bgImg})` : undefined,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '880px',
                paddingBottom: '160px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div className="container">
                <div className="row align-items-center">
                  {/* Columna Izquierda: Textos y Botón */}
                  <div className="col-lg-5 col-md-12">
                    <div className="main-headding" style={{ position: 'relative', zIndex: 3 }}>
                      {/* Subtítulo con icono vectorial nítido */}
                      <span className="span" data-aos="zoom-in-left" data-aos-duration="700">
                        <i
                          className="bi bi-fire"
                          style={{
                            color: '#FF5722',
                            marginRight: '6px',
                            fontSize: '17px',
                            verticalAlign: 'middle',
                          }}
                        ></i>
                        {slide.subTitle}
                      </span>
                      <h1
                        className="title tg-element-title"
                        style={{
                          fontSize: 'clamp(28px, 3.2vw, 46px)',
                          lineHeight: '1.2',
                          marginBottom: '16px',
                        }}
                      >
                        {parse(slide.title)}
                      </h1>
                      <div className="space16"></div>
                      <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#4A5568' }}>
                        {slide.content}
                      </p>

                      <div className="space30"></div>
                      {/* Botón principal */}
                      <div className="buttons d-flex align-items-center gap-3" style={{ position: 'relative', zIndex: 4 }}>
                        <Link className="theme-btn1" href={slide.btnUrl || "/pedir-gas"}>
                          {slide.btnName} <span><i className="bi bi-arrow-right"></i></span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha: Imágenes y Cuadros Flotantes */}
                  <div className="col-lg-7 col-md-12">
                    <div
                      className="hero-slider-all-images position-relative d-flex align-items-center justify-content-center"
                      style={{ position: 'relative', height: '600px', width: '100%' }}
                    >
                      {/* Imagen principal del balón / producto */}
                      <div
                        className="hero-slider-main-image"
                        style={{
                          position: 'relative',
                          zIndex: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%',
                          ...(slide.imageContainerStyle || {}),
                        }}
                      >
                        <img
                          src={slide.image2}
                          alt="Balón de gas de cocina RappiGas"
                          style={{
                            maxHeight: '520px',
                            maxWidth: '92%',
                            width: 'auto',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.18))',
                          }}
                        />
                      </div>

                      {/* Tarjeta Flotante Inferior Izquierda (Verificación / Premios) */}
                      {slide.badgeTitle && (
                        <div
                          className="hero-floating-card hero-floating-card-bottom"
                          style={{
                            left: slide.badgeLeft || '15px',
                            bottom: slide.badgeBottom || '60px',
                            top: 'auto',
                            right: 'auto',
                          }}
                        >
                          <div
                            className="hero-badge-icon-box"
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '8px',
                              backgroundColor: slide.badgeBg || 'rgba(255, 87, 34, 0.12)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: slide.badgeColor || '#FF5722',
                              fontSize: '22px',
                              flexShrink: 0,
                            }}
                          >
                            <i className={`bi ${slide.badgeIcon || 'bi-shield-check'}`}></i>
                          </div>
                          <div>
                            <div
                              className="hero-badge-title"
                              style={{ fontWeight: '800', fontSize: '14px', color: '#0F2137', lineHeight: '1.2' }}
                            >
                              {slide.badgeTitle}
                            </div>
                            <div
                              className="hero-badge-subtitle"
                              style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}
                            >
                              {slide.badgeSubtitle}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tarjeta Flotante Superior Derecha (Delivery Gratis / Puntos) */}
                      {slide.topBadgeTitle && (
                        <div
                          className="hero-floating-card hero-floating-card-top"
                          style={{
                            right: slide.topBadgeRight || '20px',
                            top: slide.topBadgeTop || '45px',
                            bottom: 'auto',
                            left: 'auto',
                          }}
                        >
                          <div
                            className="hero-badge-icon-box"
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '8px',
                              backgroundColor: slide.topBadgeBg || 'rgba(25, 135, 84, 0.12)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: slide.topBadgeColor || '#198754',
                              fontSize: '22px',
                              flexShrink: 0,
                            }}
                          >
                            <i className={`bi ${slide.topBadgeIcon || 'bi-truck'}`}></i>
                          </div>
                          <div>
                            <div
                              className="hero-badge-title"
                              style={{ fontWeight: '800', fontSize: '14px', color: '#0F2137', lineHeight: '1.2' }}
                            >
                              {slide.topBadgeTitle}
                            </div>
                            <div
                              className="hero-badge-subtitle"
                              style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}
                            >
                              {slide.topBadgeSubtitle}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

      {/* Flechas de Navegación Manual Limpias y Elegantes */}
      <div
        className="d-none d-md-flex align-items-center gap-2"
        style={{
          position: 'absolute',
          bottom: '115px',
          right: '50px',
          zIndex: 9,
        }}
      >
        <button
          onClick={() => sliderRef.current?.slickPrev()}
          className="btn btn-light shadow-sm rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: '42px', height: '42px', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s ease' }}
          aria-label="Diapositiva Anterior"
        >
          <i className="bi bi-chevron-left text-dark fs-6"></i>
        </button>
        <button
          onClick={() => sliderRef.current?.slickNext()}
          className="btn text-white shadow-sm rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: '42px', height: '42px', background: '#FF5722', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
          aria-label="Siguiente Diapositiva"
        >
          <i className="bi bi-chevron-right fs-6"></i>
        </button>
      </div>
    </div>
  );
}
