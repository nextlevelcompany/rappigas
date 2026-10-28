'use client';

import React, { useState } from 'react';
import Breadcrumb from '../components/Common/Breadcrumb';


const ContactGasPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <Breadcrumb Title="Central de Pedidos y Contacto" />

      <div className="contact-page sp" style={{ paddingTop: '80px', paddingBottom: '90px', background: '#F8FAFC' }}>
        <div className="container">
          <div className="row g-4">
            {/* Contact Details Column */}
            <div className="col-lg-5">
              <div
                className="p-4 rounded-4 shadow-sm bg-white h-100"
                style={{ border: '1px solid #E2E8F0' }}
              >
                <div className="heading1 mb-4">
                  <span
                    className="span d-inline-flex align-items-center gap-2 px-3 py-1 mb-2 rounded-pill"
                    style={{ background: 'rgba(255, 87, 34, 0.1)', color: '#FF5722', fontWeight: '700', fontSize: '13px' }}
                  >
                    <i className="bi bi-headset"></i> Atención Inmediata 24/7
                  </span>
                  <h3 className="title fw-bold" style={{ color: '#0F2137' }}>
                    Central de Pedidos y Emergencias
                  </h3>
                  <p className="text-muted" style={{ fontSize: '14px' }}>
                    Estamos listos para atenderte en todo momento. Pide tu balón de gas por teléfono, WhatsApp o formulario web.
                  </p>
                </div>

                <div className="d-flex flex-column gap-3">
                  {/* Phone */}
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: '#FFF7ED' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: '#FF5722',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                      }}
                    >
                      <i className="bi bi-telephone-fill"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Central Telefónica / WhatsApp</small>
                      <a href="tel:977665554" className="fw-bold text-dark fs-5 text-decoration-none">
                        977 665 554
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: '#EFF6FF' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: '#2563EB',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                      }}
                    >
                      <i className="bi bi-envelope-fill"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Correo Electrónico</small>
                      <a href="mailto:contacto@rappigas.pe" className="fw-bold text-dark text-decoration-none">
                        contacto@rappigas.pe
                      </a>
                    </div>
                  </div>

                  {/* Company Info */}
                  <div className="d-flex align-items-center gap-3 p-3 rounded-3" style={{ background: '#F1F5F9' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '12px',
                        background: '#475569',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                      }}
                    >
                      <i className="bi bi-shield-check"></i>
                    </div>
                    <div>
                      <small className="text-muted d-block">Razón Social y RUC</small>
                      <span className="fw-bold text-dark d-block">RappiGas Perú S.A.C.</span>
                      <small className="text-muted">RUC: 20609876543 • Código SCOP Activo</small>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-top text-muted" style={{ fontSize: '13px' }}>
                  <i className="bi bi-clock-history text-danger me-1"></i>
                  <strong>Horario de Despacho:</strong> Lunes a Domingo de 6:00 a.m. a 11:00 p.m.
                </div>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="col-lg-7">
              <div
                className="p-4 rounded-4 shadow-sm bg-white h-100"
                style={{ border: '1px solid #E2E8F0' }}
              >
                <div className="heading1 mb-4">
                  <h3 className="title fw-bold" style={{ color: '#0F2137' }}>
                    Envíanos un Mensaje o Solicita tu Despacho
                  </h3>
                  <p className="text-muted" style={{ fontSize: '14px' }}>
                    Completa el formulario y un repartidor con balanza será asignado a tu zona de inmediato.
                  </p>
                </div>

                {submitted ? (
                  <div className="p-4 rounded-4 text-center my-4" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: '#10B981',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '30px',
                        margin: '0 auto 16px',
                      }}
                    >
                      <i className="bi bi-check-lg"></i>
                    </div>
                    <h4 className="fw-bold text-success mb-2">¡Mensaje Enviado con Éxito!</h4>
                    <p className="text-muted mb-0">
                      Un asesor de RappiGas te contactará al teléfono indicado en menos de 5 minutos.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                          Nombres y Apellidos
                        </label>
                        <input type="text" className="form-control" placeholder="Ej: María Gonzales" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                          Teléfono de Contacto
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light fw-bold">+51</span>
                          <input type="tel" className="form-control" placeholder="977 665 554" maxLength="9" required />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                          Distrito
                        </label>
                        <select className="form-select">
                          <option>Los Olivos</option>
                          <option>San Martín de Porres</option>
                          <option>Comas</option>
                          <option>Independencia</option>
                          <option>Cercado de Lima</option>
                          <option>Breña</option>
                          <option>Jesús María</option>
                          <option>San Miguel</option>
                          <option>Miraflores</option>
                          <option>San Isidro</option>
                          <option>Surco</option>
                          <option>San Borja</option>
                          <option>Provincias (Arequipa, Trujillo, etc.)</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                          Tipo de Consulta
                        </label>
                        <select className="form-select">
                          <option>Pedido de Balón a Domicilio</option>
                          <option>Consulta de Puntos / Canjes</option>
                          <option>Afiliación de Distribuidor</option>
                          <option>Emergencia / Soporte Técnico</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                          Dirección o Mensaje Detallado
                        </label>
                        <textarea className="form-control" rows="4" placeholder="Indícanos tu dirección exacta, referencia o consulta..." required></textarea>
                      </div>
                      <div className="col-12 mt-4">
                        <button
                          type="submit"
                          className="theme-btn1 text-white border-0 w-100 py-3 fw-bold"
                          style={{
                            background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '15px',
                          }}
                        >
                          Enviar Solicitud <i className="bi bi-arrow-right ms-1"></i>
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};

export default ContactGasPage;

