import Link from "next/link";

const About1 = ({
  image1 = "/assets/img/about/about1-img1.png",
  image2 = "/assets/img/about/en",
  supIcon = "/assets/img/icons/about1-shape-icon.png",
  supTitle = "+25,000 Familias Felices",
  supCon = "Pidiendo su gas sin estrés y ganando premios.",
  subTitle = "Por qué cada vez más hogares prefieren nuestra app",
  Title = "Pide tu gas sin complicaciones, elige a tu proveedor favorito y llévate premios",
  content = "Sabemos lo importante que es para ti cocinar con total tranquilidad. Por eso, te conectamos con los proveedores más confiables de tu zona para que tu balón llegue rápido y seguro. Además, queremos engreírte: cada pedido que hagas suma puntos que podrás cambiar por cosas lindas para tu casa. Todo con la confianza y el peso exacto que tu familia merece.",
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
    <div className="about1 sp">
      <div className="container">
        <div className="row align-items-center">
          {/* Columna Izquierda: Imágenes y Caja de Estadísticas en su tamaño y forma original */}
          <div className="col-lg-6">
            <div className="about-image">
              {image1 && (
                <div className="image1">
                  <img src={image1} alt="" />
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
                        className="h-100 rounded-3 d-flex align-items-start gap-2.5"
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
                            borderRadius: '8px',
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

export default About1;
