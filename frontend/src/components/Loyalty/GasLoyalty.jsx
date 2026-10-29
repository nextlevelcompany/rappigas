'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function GasLoyalty() {
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
              <div className="mt-4 pt-2 d-flex flex-wrap gap-3">
                <Link
                  href="/premios/catalogo"
                  className="btn text-white fw-bold px-4 py-3"
                  style={{
                    background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
                    borderRadius: '8px',
                    fontSize: '15px',
                    boxShadow: '0 6px 20px rgba(255, 87, 34, 0.4)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i className="bi bi-gift-fill"></i> Ver Catálogo Completo (+100 Premios)
                </Link>

                <Link
                  href="/pedir-gas"
                  className="btn btn-outline-light fw-bold px-4 py-3"
                  style={{
                    borderRadius: '8px',
                    fontSize: '15px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <i className="bi bi-fire"></i> Pedir Gas y Ganar Puntos
                </Link>
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
                    <i className="bi bi-check-circle-fill me-1"></i> ¡Tienes suficiente saldo para canjear en el catálogo!
                  </div>
                </div>
              )}

              {/* Sample Prizes Preview */}
              <div className="mt-3 pt-3 border-top">
                <span className="text-muted d-block mb-2" style={{ fontSize: '12px' }}>Premios destacados en catálogo:</span>
                <div className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '13px' }}>
                  <span><i className="bi bi-check-circle text-warning me-1"></i> Vale S/ 10</span>
                  <strong className="text-danger">150 pts</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: '13px' }}>
                  <span><i className="bi bi-check-circle text-warning me-1"></i> Balón 10kg Gratis</span>
                  <strong className="text-danger">500 pts</strong>
                </div>
                <Link
                  href="/premios/catalogo"
                  className="text-decoration-none fw-bold text-warning-emphasis d-flex align-items-center justify-content-center gap-1 mt-2 pt-2 border-top"
                  style={{ fontSize: '12px' }}
                >
                  <span>Ver todos los 100 premios</span>
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
