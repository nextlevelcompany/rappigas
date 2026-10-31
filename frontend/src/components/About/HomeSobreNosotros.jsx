'use client';

import Link from "next/link";

const HomeSobreNosotros = ({
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
      icon: "bi-shield-check",
      iconBg: "#E0F2FE",
      iconColor: "#0284C7",
    },
    {
      title: "Te premiamos por tu preferencia",
      desc: "Suma puntos automáticamente en cada pedido y canjéalos por premios gratis.",
      icon: "bi-gift-fill",
      iconBg: "#FFEDD5",
      iconColor: "#EA580C",
    },
    {
      title: "Paga lo justo y siéntete seguro",
      desc: "Te garantizamos el peso exacto con balanza en tu puerta y cilindros sellados.",
      icon: "bi-patch-check-fill",
      iconBg: "#DCFCE7",
      iconColor: "#16A34A",
    },
    {
      title: "Se acabó la espera",
      desc: "Ubicamos al repartidor más cercano para que tu gas llegue en minutos a tu cocina.",
      icon: "bi-lightning-charge-fill",
      iconBg: "#FEF3C7",
      iconColor: "#D97706",
    },
  ],
  btnName = "Ver precios y pedir mi gas",
  btnUrl = "/pedir-gas",
}) => {
  return (
    <section
      className="py-24 sm:py-32 lg:py-40 bg-white font-sans overflow-hidden"
      id="inicio-sobre-rappigas"
      style={{
        paddingTop: '100px',
        paddingBottom: '100px',
      }}
      suppressHydrationWarning
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* ========================================================================= */}
          {/* COLUMNA IZQUIERDA: IMAGEN CON TARJETAS FLOTANTES PERFECTAMENTE CENTRADA   */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 flex justify-center items-center py-4">
            <div className="relative w-full max-w-[420px] mx-auto">
              
              {/* Tarjeta Flotante Superior: Despacho Express en Vivo */}
              <div
                style={{
                  position: 'absolute',
                  top: '-15px',
                  left: '-15px',
                  zIndex: 20,
                  width: '145px',
                  backgroundColor: 'rgba(255, 255, 255, 0.96)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '14px',
                  padding: '12px 10px',
                  boxShadow: '0 14px 30px rgba(15, 23, 42, 0.12)',
                  border: '1px solid #E2E8F0',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#047857',
                    fontSize: '9.5px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      display: 'inline-block',
                    }}
                  />
                  {badgeTag}
                </div>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    margin: '0 auto 6px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    boxShadow: '0 4px 10px rgba(255, 87, 34, 0.3)',
                  }}
                >
                  <i className="bi bi-lightning-charge-fill" />
                </div>
                <div style={{ fontWeight: '900', fontSize: '18px', color: '#0F172A', lineHeight: '1', marginBottom: '2px' }}>
                  {badgeValue}
                </div>
                <div style={{ fontWeight: '700', fontSize: '10.5px', color: '#EA580C', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {badgeTitle}
                </div>
                <p style={{ fontSize: '9.5px', color: '#64748B', lineHeight: '1.25', margin: '0 0 6px 0' }}>
                  {badgeSub}
                </p>
                <div style={{ padding: '2px 4px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '4px', fontSize: '9px', fontWeight: '600', color: '#334155' }}>
                  {badgeFooter}
                </div>
              </div>

              {/* Imagen Principal de la clienta */}
              <div
                style={{
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 45px rgba(15, 23, 42, 0.12)',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <img
                  src={image2}
                  alt="Cliente feliz recibiendo gas de cocina con RappiGas"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '660px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>

              {/* Tarjeta Flotante Inferior: +25,000 Familias */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-15px',
                  right: '-15px',
                  zIndex: 20,
                  backgroundColor: '#0B1538',
                  color: '#ffffff',
                  borderRadius: '16px',
                  padding: '14px 16px',
                  boxShadow: '0 16px 36px rgba(11, 21, 56, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  maxWidth: '200px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    margin: '0 auto 8px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FBBF24',
                    fontSize: '18px',
                  }}
                >
                  {supIcon ? <img src={supIcon} alt="" style={{ width: '20px', height: '20px', objectFit: 'contain' }} /> : <i className="bi bi-heart-fill" />}
                </div>
                <h4 style={{ fontWeight: '900', fontSize: '14px', color: '#ffffff', lineHeight: '1.2', margin: '0 0 4px 0' }}>
                  {supTitle}
                </h4>
                <p style={{ fontSize: '11px', color: '#94A3B8', lineHeight: '1.3', margin: 0 }}>
                  {supCon}
                </p>
              </div>

            </div>
          </div>

          {/* ========================================================================= */}
          {/* COLUMNA DERECHA: TEXTO Y GRID 2x2 COMPACTO Y CENTRADO                     */}
          {/* ========================================================================= */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            {/* Tag Superior */}
            <div style={{ marginBottom: '12px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#FF5722',
                  backgroundColor: '#FFF7ED',
                  border: '1px solid #FFEDD5',
                  padding: '5px 12px',
                  borderRadius: '999px',
                }}
              >
                <i className="bi bi-fire" style={{ fontSize: '13px', color: '#FF5722' }} />
                <span>{subTitle}</span>
              </span>
            </div>

            {/* Título Principal */}
            <h2
              style={{
                fontSize: 'clamp(24px, 2.5vw, 34px)',
                fontWeight: '900',
                color: '#0F172A',
                lineHeight: '1.2',
                letterSpacing: '-0.02em',
                margin: '0 0 14px 0',
              }}
            >
              {Title}
            </h2>

            {/* Párrafo Descriptivo */}
            <p
              style={{
                fontSize: '14.5px',
                lineHeight: '1.6',
                color: '#475569',
                margin: '0 0 22px 0',
              }}
            >
              {content}
            </p>

            {/* Rejilla 2x2 de los 4 Beneficios (Auto-Height, Limpio y Ordenado) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '12px',
                marginBottom: '26px',
              }}
            >
              {featurelist.map((item, index) => {
                const title = typeof item === 'object' ? item.title : item.split(':')[0];
                const desc = typeof item === 'object' ? item.desc : (item.split(':')[1] || '');
                const icon = item.icon || (
                  index === 0 ? 'bi-shield-check' :
                  index === 1 ? 'bi-gift-fill' :
                  index === 2 ? 'bi-patch-check-fill' : 'bi-lightning-charge-fill'
                );
                const iconBg = item.iconBg || (
                  index === 0 ? '#E0F2FE' :
                  index === 1 ? '#FFEDD5' :
                  index === 2 ? '#DCFCE7' : '#FEF3C7'
                );
                const iconColor = item.iconColor || (
                  index === 0 ? '#0284C7' :
                  index === 1 ? '#EA580C' :
                  index === 2 ? '#16A34A' : '#D97706'
                );

                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: iconBg,
                        color: iconColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        flexShrink: 0,
                        marginTop: '2px',
                      }}
                    >
                      <i className={`bi ${icon}`} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4
                        style={{
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#0F172A',
                          margin: '0 0 2px 0',
                          lineHeight: '1.25',
                        }}
                      >
                        {title}
                      </h4>
                      {desc && (
                        <p
                          style={{
                            fontSize: '11.5px',
                            color: '#64748B',
                            margin: 0,
                            lineHeight: '1.35',
                          }}
                        >
                          {desc}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ========================================================================= */}
            {/* BOTÓN DE ACCIÓN CORREGIDO Y ELEGANTE (NARANJA RAPPIGAS OFICIAL)           */}
            {/* ========================================================================= */}
            <div>
              <Link
                href={btnUrl || "/pedir-gas"}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  backgroundColor: '#FF5722',
                  backgroundImage: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '14.5px',
                  padding: '13px 30px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  boxShadow: '0 8px 20px rgba(255, 87, 34, 0.32)',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                  border: 'none',
                  width: 'fit-content',
                }}
              >
                <span style={{ color: '#ffffff', textDecoration: 'none', fontWeight: '700' }}>
                  {btnName}
                </span>
                <i className="bi bi-arrow-right" style={{ color: '#ffffff', fontSize: '17px' }} />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeSobreNosotros;
