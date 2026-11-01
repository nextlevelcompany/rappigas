'use client';

import React from 'react';

export default function GasHowItWorks() {
  const steps = [
    {
      step: 'PASO 01',
      title: 'Ingresa tu Dirección o Activa tu GPS',
      desc: 'Detectamos automáticamente las distribuidoras autorizadas con stock y cobertura express en tu calle.',
      icon: 'bi-geo-alt-fill',
      color: '#2563EB',
      bgColor: '#EFF6FF',
    },
    {
      step: 'PASO 02',
      title: 'Elige tu Balón y Método de Pago',
      desc: 'Selecciona tu tipo de válvula (Premium o Rosca) y paga con Yape, Plin, Efectivo o POS.',
      icon: 'bi-credit-card-2-front-fill',
      color: '#FF5722',
      bgColor: '#FFF7ED',
    },
    {
      step: 'PASO 03',
      title: 'Recibe, Pesa y Disfruta',
      desc: 'El repartidor llega en menos de 35 minutos, verifica el peso en balanza y deja tu cocina lista para cocinar.',
      icon: 'bi-fire',
      color: '#059669',
      bgColor: '#ECFDF5',
    },
  ];

  return (
    <section className="work3 sp" style={{ background: '#FFFFFF', paddingTop: '80px', paddingBottom: '90px' }}>
      <div className="container">
        {/* Section Heading */}
        <div className="row mb-5">
          <div className="col-lg-8 m-auto text-center">
            <div className="heading1">
              <span
                className="span d-inline-flex align-items-center gap-2 px-3 py-1 mb-2 rounded-pill"
                style={{ background: 'rgba(255, 87, 34, 0.1)', color: '#FF5722', fontWeight: '700', fontSize: '13px' }}
              >
                <i className="bi bi-arrow-repeat"></i> Proceso Simple y Rápido
              </span>
              <h2 className="title fw-bold" style={{ fontSize: '38px', color: '#0F2137' }}>
                ¿Cómo Funciona? <span style={{ color: '#FF5722' }}>3 Pasos Simples</span>
              </h2>
              <p className="mt-2 text-muted" style={{ fontSize: '16px' }}>
                Desde que pides hasta que enciendes tu cocina en menos de 35 minutos y con balanza en mano.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Step Cards */}
        <div className="row g-4 position-relative">
          {steps.map((item, index) => (
            <div key={index} className="col-lg-4 col-md-6">
              <div
                className="h-100 p-4 rounded-4 position-relative text-center"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 8px 24px rgba(15, 33, 55, 0.05)',
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-6px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {/* Step badge */}
                <div className="mb-3">
                  <span
                    className="badge rounded-pill fw-bold px-3 py-2"
                    style={{ background: item.bgColor, color: item.color, fontSize: '12px', letterSpacing: '1px' }}
                  >
                    {item.step}
                  </span>
                </div>

                {/* Big Step Icon */}
                <div
                  className="mx-auto mb-3"
                  style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: '50%',
                    background: item.bgColor,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                  }}
                >
                  <i className={`bi ${item.icon}`}></i>
                </div>

                {/* Step Details */}
                <h4 className="fw-bold mb-2" style={{ fontSize: '19px', color: '#0F2137' }}>
                  {item.title}
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
