'use client';

import React, { useState } from 'react';

export default function GasFaq() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: '¿Cómo sé que el balón viene con los 10 kilos completos?',
      a: 'Todos nuestros repartidores portan balanzas digitales. Al recibir tu pedido puedes solicitar el pesaje en tu presencia: el peso bruto debe marcar los 10 kg de gas más la tara metálica troquelada en el balón.',
      icon: 'bi-scale',
    },
    {
      q: '¿Cuánto tiempo demora en llegar mi pedido?',
      a: 'El promedio de entrega es de 25 a 35 minutos gracias a la asignación por GPS del repartidor más cercano a tu ubicación.',
      icon: 'bi-clock-history',
    },
    {
      q: '¿La instalación del balón tiene algún costo adicional?',
      a: 'No, la conexión segura, prueba de estanqueidad con agua jabonosa y verificación de empaque son totalmente gratis como parte de nuestro servicio.',
      icon: 'bi-tools',
    },
    {
      q: '¿Cómo gano y canjeo puntos?',
      a: 'Con tu número de celular o cuenta acumulas puntos en cada pedido. Puedes canjearlos en cualquier momento desde la sección de Premios por descuentos o balones gratis.',
      icon: 'bi-gift',
    },
  ];

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? -1 : idx);
  };

  return (
    <section className="faq3 sp" style={{ background: '#F8FAFC', paddingTop: '80px', paddingBottom: '90px' }}>
      <div className="container">
        {/* Section Heading */}
        <div className="row mb-5">
          <div className="col-lg-8 m-auto text-center">
            <div className="heading1">
              <span
                className="span d-inline-flex align-items-center gap-2 px-3 py-1 mb-2 rounded-pill"
                style={{ background: 'rgba(255, 87, 34, 0.1)', color: '#FF5722', fontWeight: '700', fontSize: '13px' }}
              >
                <i className="bi bi-question-circle-fill"></i> Resolver tus Dudas
              </span>
              <h2 className="title fw-bold" style={{ fontSize: '38px', color: '#0F2137' }}>
                Preguntas Frecuentes
              </h2>
              <p className="mt-2 text-muted" style={{ fontSize: '16px' }}>
                Transparencia total para tu seguridad y tranquilidad en cada pedido.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="d-flex flex-column gap-3">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={index}
                    className="rounded-4 overflow-hidden shadow-sm"
                    style={{
                      background: '#FFFFFF',
                      border: isOpen ? '2px solid #FF5722' : '1px solid #E2E8F0',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <button
                      onClick={() => toggle(index)}
                      className="w-100 text-start p-4 border-0 d-flex justify-content-between align-items-center bg-transparent"
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: isOpen ? '#FFF7ED' : '#F1F5F9',
                            color: isOpen ? '#FF5722' : '#64748B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            flexShrink: 0,
                          }}
                        >
                          <i className={`bi ${faq.icon}`}></i>
                        </div>
                        <span className="fw-bold fs-6 text-dark mb-0">
                          {faq.q}
                        </span>
                      </div>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isOpen ? '#FF5722' : '#F1F5F9',
                          color: isOpen ? '#fff' : '#64748B',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s ease',
                          flexShrink: 0,
                        }}
                      >
                        <i className="bi bi-chevron-down"></i>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-muted border-top" style={{ fontSize: '15px', lineHeight: '1.7', background: '#FAFCFF' }}>
                        <div className="ps-md-5 mt-2">
                          {faq.a}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
