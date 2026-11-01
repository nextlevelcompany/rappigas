'use client';

import React, { useState } from 'react';
import Breadcrumb from '@/app/(public)/_layout/Breadcrumb';

const DistribuidoresContent = () => {
  const [registered, setRegistered] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setRegistered(true);
  };

  return (
    <div>
      <Breadcrumb Title="Afiliación para Distribuidoras de Gas de Cocina" />
      <div className="sp" style={{ background: '#F8FAFC', paddingTop: '80px', paddingBottom: '90px' }}>
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-5">
              <div className="heading1">
                <span
                  className="span d-inline-flex align-items-center gap-2 px-3 py-1 mb-2 rounded-pill"
                  style={{ background: 'rgba(255, 87, 34, 0.1)', color: '#FF5722', fontWeight: '700', fontSize: '13px' }}
                >
                  <i className="bi bi-shop"></i> Red Nacional Autorizada
                </span>
                <h2 className="title fw-bold" style={{ fontSize: '36px', color: '#0F2137' }}>
                  Conecta tu Distribuidora a <span style={{ color: '#FF5722' }}>RappiGas</span>
                </h2>
                <p className="mt-3 text-muted" style={{ fontSize: '15px', lineHeight: '1.7' }}>
                  Recibe pedidos geolocalizados en tiempo real en tu distrito. Incrementa tus ventas diarias con tecnología de ruteo express y entregas transparentes.
                </p>

                <div className="d-flex flex-column gap-3 mt-4">
                  <div className="d-flex align-items-start gap-3">
                    <div className="p-2 rounded-3 bg-white text-danger shadow-sm border">
                      <i className="bi bi-graph-up-arrow fs-5"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">Mayor Volumen de Ventas</h6>
                      <small className="text-muted">Pedidos constantes de hogares y comercios de alta demanda.</small>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="p-2 rounded-3 bg-white text-primary shadow-sm border">
                      <i className="bi bi-geo-alt-fill fs-5"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">Asignación por Cercanía GPS</h6>
                      <small className="text-muted">Despacha únicamente en tu cuadrante y optimiza costos de combustible.</small>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="p-2 rounded-3 bg-white text-success shadow-sm border">
                      <i className="bi bi-shield-check fs-5"></i>
                    </div>
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">Cumplimiento Legal y Formalidad</h6>
                      <small className="text-muted">Trazabilidad oficial de pedidos conforme a los estándares de seguridad.</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div
                className="p-4 p-md-5 rounded-4 shadow-sm bg-white"
                style={{ border: '1px solid #E2E8F0' }}
              >
                <h4 className="fw-bold mb-2" style={{ color: '#0F2137' }}>
                  Formulario de Registro de Distribuidora
                </h4>
                <p className="text-muted mb-4" style={{ fontSize: '13px' }}>
                  Ingresa los datos fiscales y técnicos de tu empresa para la verificación comercial.
                </p>

                {registered ? (
                  <div className="p-4 rounded-4 text-center" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                    <i className="bi bi-check-circle-fill text-success fs-1 mb-2 d-block"></i>
                    <h5 className="fw-bold text-success">¡Solicitud de Afiliación Recibida!</h5>
                    <p className="text-muted mb-0" style={{ fontSize: '14px' }}>
                      Nuestro equipo legal y de operaciones validará tu registro comercial y se comunicará en menos de 24 horas hábiles.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>RUC</label>
                        <input type="text" maxLength="11" className="form-control" placeholder="20609876543" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Código SCOP / Registro Comercial</label>
                        <input type="text" className="form-control" placeholder="Ej: SCOP-8841" required />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Razón Social</label>
                        <input type="text" className="form-control" placeholder="Distribuidora de Gas SAC" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Distrito y Zona de Operación</label>
                        <input type="text" className="form-control" placeholder="Ej: Los Olivos / Lima Norte" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Teléfono de Contacto</label>
                        <input type="tel" className="form-control" placeholder="977 665 554" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Marcas que Comercializa</label>
                        <select className="form-select">
                          <option>Solgas</option>
                          <option>Primax Gas</option>
                          <option>Zeta Gas</option>
                          <option>Llamagas</option>
                          <option>Otras plantas autorizadas</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>Cantidad de Unidades de Reparto</label>
                        <select className="form-select">
                          <option>1 a 3 unidades (motos/furgones)</option>
                          <option>4 a 10 unidades</option>
                          <option>Más de 10 unidades</option>
                        </select>
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
                          Enviar Solicitud de Afiliación <i className="bi bi-arrow-right ms-1"></i>
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

export default DistribuidoresContent;