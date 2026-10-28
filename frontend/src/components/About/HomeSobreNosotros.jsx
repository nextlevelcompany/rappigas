import Link from "next/link";

const HomeSobreNosotros = ({
  image1 = null, // Reemplazado por tarjeta flotante rectangular vertical con micro-animaciones
  badgeTag = "En Vivo",
  badgeValue = "~25 min",
  badgeTitle = "Despacho Express",
  badgeSub = "Repartidor asignado por GPS en minutos",
  badgeFooter = "Compra y Gana Puntos",
  image2 = "/assets/img/about/about1-img2.png",
  supIcon = "/assets/img/icons/about1-shape-icon.png",
  supTitle = "+25,000 Familias Felices",
  supCon = "Pidiendo su gas sin estrés y ganando premios.",
  subTitle = "¿Por qué elegir RappiGas para tu cocina?",
  Title = "Pide tu gas de cocina con balanza digital, delivery gratis y gana premios",
  content = "En RappiGas te llevamos tu gas de cocina con el peso exacto verificado en tu puerta mediante balanza digital. Paga contraentrega (efectivo, Yape, Plin o POS), disfruta de delivery 100% gratis en 25 a 35 minutos y acumula puntos con cada compra para canjear premios exclusivos para tu hogar.",
  featurelist = [
    {
      title: "Proveedores 100% de confianza",
      desc: "Trabajamos solo con distribuidores formales y verificados, cerquita de tu casa.",
    },
    {
      title: "Te premiamos por tu preferencia",
      desc: "Suma puntos automáticamente en cada pedido y canjéalos por premios gratis.",
    },
    {
      title: "Paga lo justo y siéntete seguro",
      desc: "Te garantizamos el peso exacto con balanza en tu puerta y cilindros sellados.",
    },
    {
      title: "Se acabó la espera",
      desc: "Ubicamos al repartidor más cercano para que tu gas llegue en minutos a tu cocina.",
    },
  ],
  btnName = "Ver precios y pedir mi gas",
  btnUrl = "/pedir-gas",
}) => {
  return (
    <div className="about1 sp" suppressHydrationWarning>
      {/* Estilos de micro-animación para la tarjeta flotante */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatCardAnim {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-9px) rotate(-0.5deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }
        @keyframes liveDotGlow {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          70% {
            transform: scale(1.15);
            box-shadow: 0 0 0 7px rgba(34, 197, 94, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }
        .floating-live-badge {
          animation: floatCardAnim 4s ease-in-out infinite;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .floating-live-badge:hover {
          transform: translateY(-13px) scale(1.03) !important;
          box-shadow: 0 16px 32px rgba(15, 23, 42, 0.16), 0 4px 12px rgba(255, 87, 34, 0.22) !important;
        }
        .live-dot-pulse {
          animation: liveDotGlow 1.8s infinite;
        }
      ` }} />

      <div className="container">
        <div className="row align-items-center">
          {/* Columna Izquierda: Imágenes y Caja de Estadísticas en su tamaño y forma original */}
          <div className="col-lg-6">
            <div className="about-image">
              {/* Elemento Flotante Dinámico Vertical Rectangular */}
              {image1 ? (
                <div className="image1">
                  <img src={image1} alt="" />
                </div>
              ) : (
                <div
                  className="floating-live-badge"
                  style={{
                    position: 'absolute',
                    left: '0px',
                    top: '15px',
                    zIndex: 4,
                    width: '148px',
                    background: 'rgba(255, 255, 255, 0.96)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderRadius: '8px',
                    padding: '16px 12px',
                    boxShadow: '0 14px 32px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(255, 87, 34, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'default',
                  }}
                >
                  {/* Tag Superior con Punto Pulsante */}
                  <div
                    className="d-flex align-items-center mb-2 px-2 py-0.5 rounded-1"
                    style={{
                      background: '#F0FDF4',
                      border: '1px solid #DCFCE7',
                      gap: '5px',
                    }}
                  >
                    <span
                      className="live-dot-pulse"
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: '#22C55E',
                        display: 'inline-block',
                      }}
                    ></span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        color: '#16A34A',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {badgeTag}
                    </span>
                  </div>

                  {/* Icono Central con Sombra y Degradado */}
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      boxShadow: '0 6px 16px rgba(255, 87, 34, 0.35)',
                      marginBottom: '8px',
                    }}
                  >
                    <i className="bi bi-lightning-charge-fill"></i>
                  </div>

                  {/* Métrica / Tiempo */}
                  <div
                    className="fw-bold"
                    style={{
                      fontSize: '20px',
                      color: '#0F172A',
                      lineHeight: '1.1',
                      letterSpacing: '-0.02em',
                      marginBottom: '2px',
                    }}
                  >
                    {badgeValue}
                  </div>

                  {/* Título de la tarjeta */}
                  <div
                    className="fw-bold"
                    style={{
                      fontSize: '11.5px',
                      color: '#EA580C',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                      marginBottom: '4px',
                    }}
                  >
                    {badgeTitle}
                  </div>

                  {/* Descripción corta */}
                  <p
                    className="mb-0 text-muted"
                    style={{
                      fontSize: '10.5px',
                      lineHeight: '1.3',
                      color: '#64748B',
                      marginBottom: '8px',
                    }}
                  >
                    {badgeSub}
                  </p>

                  {/* Pie con Check Verificado */}
                  <div
                    className="w-100 py-1 rounded-1"
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      fontSize: '10px',
                      fontWeight: '600',
                      color: '#334155',
                    }}
                  >
                    {badgeFooter}
                  </div>
                </div>
              )}
              <div className="image2 image-anime">
                <img src={image2} alt="" />
              </div>
              <div className="icon-box">
                <img src={supIcon} alt="" />
                <h4>{supTitle}</h4>
                <p>{supCon}</p>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Contenido y Beneficios Compactos */}
          <div className="col-lg-6 col-12">
            <div className="heading1" style={{ paddingLeft: '0' }}>
              <span
                className="span mb-2"
                data-aos="zoom-in-left"
                data-aos-duration="700"
                style={{ fontSize: '14px', marginBottom: '8px' }}
              >
                <i
                  className="bi bi-fire"
                  style={{
                    color: '#FF5722',
                    marginRight: '6px',
                    fontSize: '16px',
                    verticalAlign: 'middle',
                  }}
                ></i>
                {subTitle}
              </span>
              <h2
                className="title tg-element-title mb-2"
                style={{
                  fontSize: 'clamp(22px, 2.3vw, 32px)',
                  lineHeight: '1.25',
                }}
              >
                {Title}
              </h2>
              <p
                data-aos="fade-left"
                data-aos-duration="800"
                style={{
                  fontSize: '14px',
                  lineHeight: '1.55',
                  color: '#475569',
                  marginBottom: '14px',
                }}
              >
                {content}
              </p>

              {/* Grid Compacto 2x2 de Beneficios */}
              <div
                className="row g-2 mb-3"
                data-aos="fade-left"
                data-aos-duration="1000"
              >
                {featurelist?.map((item, index) => {
                  let title = '';
                  let desc = '';
                  let icon = 'bi-shield-check';
                  let iconColor = '#0284C7';
                  let iconBg = '#E0F2FE';

                  if (typeof item === 'object' && item !== null) {
                    title = item.title;
                    desc = item.desc;
                    icon = item.icon || (
                      index === 0 ? 'bi-shield-check' :
                      index === 1 ? 'bi-gift-fill' :
                      index === 2 ? 'bi-patch-check-fill' :
                      'bi-lightning-charge-fill'
                    );
                    iconColor = item.color || (
                      index === 0 ? '#0284C7' :
                      index === 1 ? '#EA580C' :
                      index === 2 ? '#16A34A' :
                      '#D97706'
                    );
                    iconBg = item.bgColor || (
                      index === 0 ? '#E0F2FE' :
                      index === 1 ? '#FFEDD5' :
                      index === 2 ? '#DCFCE7' :
                      '#FEF3C7'
                    );
                  } else if (typeof item === 'string') {
                    if (item.includes(':')) {
                      const parts = item.split(':');
                      title = parts[0].trim();
                      desc = parts.slice(1).join(':').trim();
                    } else {
                      title = item;
                    }

                    if (index === 0) {
                      icon = 'bi-shield-check';
                      iconColor = '#0284C7';
                      iconBg = '#E0F2FE';
                    } else if (index === 1) {
                      icon = 'bi-gift-fill';
                      iconColor = '#EA580C';
                      iconBg = '#FFEDD5';
                    } else if (index === 2) {
                      icon = 'bi-patch-check-fill';
                      iconColor = '#16A34A';
                      iconBg = '#DCFCE7';
                    } else if (index === 3) {
                      icon = 'bi-lightning-charge-fill';
                      iconColor = '#D97706';
                      iconBg = '#FEF3C7';
                    }
                  }

                  return (
                    <div key={index} className="col-sm-6 col-12">
                      <div
                        className="h-100 rounded-1 d-flex align-items-start gap-2.5"
                        style={{
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          padding: '10px 12px',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '4px',
                            backgroundColor: iconBg,
                            color: iconColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '15px',
                            flexShrink: 0,
                            marginTop: '2px',
                          }}
                        >
                          <i className={`bi ${icon}`}></i>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h6
                            className="fw-bold mb-1 text-truncate-2"
                            style={{
                              fontSize: '13.5px',
                              color: '#0F172A',
                              lineHeight: '1.25',
                              letterSpacing: '-0.01em',
                              marginBottom: '2px',
                            }}
                          >
                            {title}
                          </h6>
                          {desc && (
                            <p
                              className="mb-0 text-muted"
                              style={{
                                fontSize: '12px',
                                lineHeight: '1.38',
                                color: '#64748B',
                              }}
                            >
                              {desc}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botón de Acción Compacto */}
              <div className="pt-1" data-aos="fade-left" data-aos-duration="900">
                <Link
                  className="theme-btn1"
                  href={btnUrl || '/contact'}
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {btnName}{' '}
                  <span>
                    <i className="bi bi-arrow-right"></i>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeSobreNosotros;
