'use client';

import React, { useState } from 'react';

export default function GasLoyalty() {
  const [showPrizesModal, setShowPrizesModal] = useState(false);
  const [phonePoints, setPhonePoints] = useState('');
  const [pointsResult, setPointsResult] = useState(null);

  const benefits = [
    {
      num: '1',
      title: '1 Balón de Gas = +50 Puntos',
      desc: 'Acumulación directa y automática ligada a tu número de celular en cada entrega confirmada.',
      icon: 'bi-coin',
    },
    {
      num: '2',
      title: 'Vales de descuento automáticos',
      desc: 'Canjea vales de S/ 10 y S/ 20 aplicables al instante en tu siguiente pedido de gas.',
      icon: 'bi-ticket-perforated',
    },
    {
      num: '3',
      title: 'Electrohogar y cocina',
      desc: 'Premios de primer nivel: Ollas a presión, licuadoras, freidoras de aire y sartenes de teflón.',
      icon: 'bi-gift',
    },
    {
      num: '4',
      title: 'Sin sorteos ni trucos',
      desc: 'Acumulas tus puntos y canjeas de manera transparente y directa en la plataforma.',
      icon: 'bi-trophy',
    },
  ];

  const prizesList = [
    { title: 'Vale de Descuento S/ 10', points: '150 Puntos', tag: 'Descuento Express', icon: 'bi-receipt' },
    { title: 'Vale de Descuento S/ 20', points: '280 Puntos', tag: 'Ahorro Máximo', icon: 'bi-tag-fill' },
    { title: 'Balón de Gas 10kg Gratis', points: '500 Puntos', tag: 'El Más Canjeado', icon: 'bi-fire' },
    { title: 'Sartén Antiadherente Tefal', points: '650 Puntos', tag: 'Cocina & Chef', icon: 'bi-egg-fried' },
    { title: 'Licuadora Oster 2 Velocidades', points: '950 Puntos', tag: 'Electrohogar', icon: 'bi-cup-hot' },
    { title: 'Freidora de Aire Digital 4.5L', points: '1,400 Puntos', tag: 'Premio Mayor', icon: 'bi-basket2' },
  ];

  const handleCheckPoints = (e) => {
    e.preventDefault();
    if (phonePoints.length === 9) {
      setPointsResult({
        points: 250,
        name: 'Cliente RappiGas',
        tier: 'Miembro Plata',
      });
    } else {
      alert('Ingresa un número válido de 9 dígitos.');
    }
  };

  return (
    <section className="about1 sp position-relative overflow-hidden" id="fidelidad" style={{ background: '#0F2137', color: '#fff', paddingTop: '90px', paddingBottom: '90px' }}>
      <div className="container">
        <div className="row align-items-center">
          {/* Left Column: Information & Benefits */}
          <div className="col-lg-7 mb-5 mb-lg-0">
            <div className="heading1-w">
              <span
                className="badge px-3 py-2 rounded-pill mb-3"
                style={{ background: 'rgba(255, 193, 7, 0.2)', color: '#FFC107', fontSize: '13px', border: '1px solid rgba(255,193,7,0.3)' }}
              >
                <i className="bi bi-stars me-1"></i> Programa de Puntos RappiGas
              </span>

              <h2 className="title text-white fw-bold" style={{ fontSize: '38px', lineHeight: '1.25' }}>
                Gana Puntos en Cada Balón y <span style={{ color: '#FF5722' }}>Canjea Premios Gratis</span>
              </h2>

              <p className="mt-3 text-white-50" style={{ fontSize: '16px', lineHeight: '1.7' }}>
                Por cada compra de gas acumulas puntos en tu billetera digital. Canjéalos por vales de descuento de S/ 10 y S/ 20, balones 100% gratis o electrodomésticos para tu cocina.
              </p>

              {/* 4 Benefits Grid */}
              <div className="row g-3 mt-3">
                {benefits.map((b) => (
                  <div key={b.num} className="col-md-6">
                    <div
                      className="p-3 rounded-3 h-100"
                      style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: '#FF5722',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '15px',
                            color: '#fff',
                          }}
                        >
                          <i className={`bi ${b.icon}`}></i>
                        </div>
                        <h6 className="fw-bold mb-0 text-white">{b.title}</h6>
                      </div>
                      <p className="text-white-50 mb-0" style={{ fontSize: '13px' }}>
                        {b.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="mt-4 pt-2">
                <button
                  onClick={() => setShowPrizesModal(true)}
                  className="btn text-white fw-bold px-4 py-3"
                  style={{
                    background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
                    borderRadius: '8px',
                    fontSize: '15px',
                    boxShadow: '0 6px 20px rgba(255, 87, 34, 0.4)',
                  }}
                >
                  <i className="bi bi-gift-fill me-2"></i> Ver Catálogo de Premios a Canjear
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Check Points Card */}
          <div className="col-lg-5">
            <div
              className="p-4 rounded-4 shadow-lg text-dark"
              style={{ background: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <div className="d-flex align-items-center gap-2 mb-3">
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: '#FFF7ED',
                    color: '#FF5722',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                  }}
                >
                  <i className="bi bi-wallet2"></i>
                </div>
                <div>
                  <h5 className="fw-bold mb-0" style={{ color: '#0F2137' }}>Consulta tus Puntos</h5>
                  <small className="text-muted">Ingresa tu número registrado</small>
                </div>
              </div>

              <form onSubmit={handleCheckPoints}>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary" style={{ fontSize: '13px' }}>
                    Número de Celular
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light fw-bold">+51</span>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="977 665 554"
                      maxLength="9"
                      value={phonePoints}
                      onChange={(e) => setPhonePoints(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn w-100 text-white fw-bold py-2 mb-3"
                  style={{ background: '#0F2137', borderRadius: '8px' }}
                >
                  <i className="bi bi-search me-1"></i> Consultar Saldo de Puntos
                </button>
              </form>

              {pointsResult && (
                <div className="p-3 rounded-3 mt-2" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="badge bg-success mb-1">{pointsResult.tier}</span>
                      <div className="fw-bold text-dark">{pointsResult.name}</div>
                    </div>
                    <div className="text-end">
                      <div className="fs-3 fw-bold text-success">{pointsResult.points}</div>
                      <small className="text-muted">Puntos acumulados</small>
                    </div>
                  </div>
                  <div className="mt-2 text-success fw-semibold" style={{ fontSize: '12px' }}>
                    <i className="bi bi-check-circle-fill me-1"></i> ¡Tienes suficiente saldo para canjear un Vale de S/ 10!
                  </div>
                </div>
              )}

              {/* Sample Prizes Preview */}
              <div className="mt-3 pt-3 border-top">
                <span className="text-muted d-block mb-2" style={{ fontSize: '12px' }}>Próximos premios destacados:</span>
                <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '13px' }}>
                  <span><i className="bi bi-check-circle text-warning me-1"></i> Vale S/ 10</span>
                  <strong className="text-danger">150 pts</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '13px' }}>
                  <span><i className="bi bi-check-circle text-warning me-1"></i> Balón 10kg Gratis</span>
                  <strong className="text-danger">500 pts</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Catálogo de Premios a Canjear */}
      {showPrizesModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100000 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg p-4 text-dark">
              <div className="modal-header border-0 pb-0">
                <div>
                  <span className="badge bg-warning text-dark mb-1">Catálogo Oficial de Fidelidad</span>
                  <h4 className="modal-title fw-bold" style={{ color: '#0F2137' }}>Premios Disponibles para Canje</h4>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPrizesModal(false)}
                ></button>
              </div>

              <div className="modal-body pt-3">
                <p className="text-muted" style={{ fontSize: '14px' }}>
                  Canjea tus puntos acumulados en cualquier momento directamente al realizar tu pedido o desde tu cuenta RappiGas.
                </p>

                <div className="row g-3">
                  {prizesList.map((prize, i) => (
                    <div key={i} className="col-md-6">
                      <div
                        className="p-3 rounded-3 d-flex align-items-center justify-content-between border"
                        style={{ background: '#F8FAFC' }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '10px',
                              background: '#FFF7ED',
                              color: '#FF5722',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px',
                            }}
                          >
                            <i className={`bi ${prize.icon}`}></i>
                          </div>
                          <div>
                            <span className="badge bg-light text-secondary border mb-1" style={{ fontSize: '10px' }}>
                              {prize.tag}
                            </span>
                            <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '14px' }}>{prize.title}</h6>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="badge bg-danger rounded-pill fw-bold" style={{ fontSize: '12px' }}>
                            {prize.points}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 rounded-3 text-center" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                  <span className="fw-semibold text-warning-emphasis" style={{ fontSize: '13px' }}>
                    <i className="bi bi-info-circle-fill me-1"></i> Cada balón que pides acumula automáticamente +50 puntos. ¡Pide hoy y empieza a sumar!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
