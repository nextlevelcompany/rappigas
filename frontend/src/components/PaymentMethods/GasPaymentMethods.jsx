'use client';

import React from 'react';

export default function GasPaymentMethods() {
  const paymentOptions = [
    {
      name: 'Yape',
      brandColor: '#732283',
      bgLight: '#FBF5FD',
      badgeText: '🟣 Billetera Móvil',
      title: 'Paga con Yape al instante',
      detail: 'Al número oficial 977 665 554 o escaneando el código QR que porta el repartidor.',
      icon: 'bi-qr-code-scan',
    },
    {
      name: 'Plin',
      brandColor: '#00A3E0',
      bgLight: '#F0F9FF',
      badgeText: '🔵 Billetera Interbancaria',
      title: 'BBVA, Interbank, Scotiabank, BanBif',
      detail: 'Transferencia directa sin comisiones a nuestro número corporativo 977 665 554.',
      icon: 'bi-phone',
    },
    {
      name: 'Efectivo',
      brandColor: '#16A34A',
      bgLight: '#F0FDF4',
      badgeText: '💵 Contra Entrega',
      title: 'Pagas al recibir tu balón',
      detail: 'Llevamos vuelto exacto. Solo indícanos con cuánto cancelas al momento de confirmar el pedido.',
      icon: 'bi-cash-coin',
    },
    {
      name: 'Tarjetas POS',
      brandColor: '#1E293B',
      bgLight: '#F8FAFC',
      badgeText: '💳 Visa, Mastercard & Contactless',
      title: 'POS inalámbrico en tu puerta',
      detail: 'Aceptamos todas las tarjetas de débito y crédito sin recargo adicional.',
      icon: 'bi-credit-card',
    },
  ];

  return (
    <section className="sp" style={{ background: '#F8FAFC', paddingTop: '80px', paddingBottom: '90px' }}>
      <div className="container">
        {/* Section Heading */}
        <div className="row mb-5">
          <div className="col-lg-8 m-auto text-center">
            <div className="heading1">
              <span
                className="span d-inline-flex align-items-center gap-2 px-3 py-1 mb-2 rounded-pill"
                style={{ background: 'rgba(255, 87, 34, 0.1)', color: '#FF5722', fontWeight: '700', fontSize: '13px' }}
              >
                <i className="bi bi-shield-check"></i> Cero Comisiones Adicionales
              </span>
              <h2 className="title fw-bold" style={{ fontSize: '38px', color: '#0F2137' }}>
                Paga como prefieras, <span style={{ color: '#FF5722' }}>100% seguro</span>
              </h2>
              <p className="mt-2 text-muted" style={{ fontSize: '16px' }}>
                Opciones digitales inmediatas o pago físico contra entrega en la comodidad de tu hogar.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Payment Cards */}
        <div className="row g-4">
          {paymentOptions.map((opt, index) => (
            <div key={index} className="col-lg-3 col-md-6">
              <div
                className="h-100 p-4 rounded-4"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 8px 24px rgba(15, 33, 55, 0.05)',
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = opt.brandColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '12px',
                      background: opt.bgLight,
                      color: opt.brandColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                    }}
                  >
                    <i className={`bi ${opt.icon}`}></i>
                  </div>
                  <span
                    className="badge rounded-pill fw-bold"
                    style={{ background: opt.bgLight, color: opt.brandColor, fontSize: '11px', padding: '6px 12px' }}
                  >
                    {opt.badgeText}
                  </span>
                </div>

                <h4 className="fw-bold mb-2" style={{ fontSize: '18px', color: '#0F2137' }}>
                  {opt.title}
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: '13px', lineHeight: '1.6' }}>
                  {opt.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
