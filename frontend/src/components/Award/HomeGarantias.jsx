const HomeGarantias = () => {
  return (
    <div className="award-area position-relative" style={{ zIndex: 10 }}>
      <div className="container">
        <div
          className="hero-bottom-area position-relative py-4 px-4"
          style={{
            zIndex: 10,
            backgroundColor: '#ffffff',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
            borderRadius: '8px',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          <div className="row g-4 align-items-center">
            {/* Cuadro 1: Puntos Automáticos */}
            <div className="col-lg-3 col-md-6 col-12">
              <div className="single-box d-flex align-items-center">
                <div
                  className="icon me-3 text-warning fs-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 193, 7, 0.12)',
                  }}
                >
                  <i className="bi bi-stars"></i>
                </div>
                <div className="headding">
                  <h5 className="fw-bold mb-1" style={{ fontSize: '16px', color: '#0F2137' }}>
                    Suma en Cada Compra
                  </h5>
                  <p className="mb-0 text-muted" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                    Puntos automáticos en tu cuenta por cada balón de gas solicitado.
                  </p>
                </div>
              </div>
            </div>

            {/* Cuadro 2: Premios al Instante */}
            <div className="col-lg-3 col-md-6 col-12">
              <div className="single-box d-flex align-items-center">
                <div
                  className="icon me-3 text-danger fs-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(220, 53, 69, 0.12)',
                  }}
                >
                  <i className="bi bi-gift-fill"></i>
                </div>
                <div className="headding">
                  <h5 className="fw-bold mb-1" style={{ fontSize: '16px', color: '#0F2137' }}>
                    Canjea Premios Gratis
                  </h5>
                  <p className="mb-0 text-muted" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                    Ollas, sartenes, recargas y electrohogar sin sorteos.
                  </p>
                </div>
              </div>
            </div>

            {/* Cuadro 3: Balanza Digital en Puerta */}
            <div className="col-lg-3 col-md-6 col-12">
              <div className="single-box d-flex align-items-center">
                <div
                  className="icon me-3 text-primary fs-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(13, 110, 253, 0.12)',
                  }}
                >
                  <i className="bi bi-shield-check"></i>
                </div>
                <div className="headding">
                  <h5 className="fw-bold mb-1" style={{ fontSize: '16px', color: '#0F2137' }}>
                    Balanza Digital en Puerta
                  </h5>
                  <p className="mb-0 text-muted" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                    Pesaje verificado de 10 kg frente a ti antes de pagar contraentrega.
                  </p>
                </div>
              </div>
            </div>

            {/* Cuadro 4: Delivery 100% Gratis */}
            <div className="col-lg-3 col-md-6 col-12">
              <div className="single-box d-flex align-items-center">
                <div
                  className="icon me-3 text-success fs-3 d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(25, 135, 84, 0.12)',
                  }}
                >
                  <i className="bi bi-truck"></i>
                </div>
                <div className="headding">
                  <h5 className="fw-bold mb-1" style={{ fontSize: '16px', color: '#0F2137' }}>
                    Delivery 100% Gratis
                  </h5>
                  <p className="mb-0 text-muted" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                    Llegamos en 25 a 35 min sin costo de envío. Paga con Yape, Plin o POS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeGarantias;
