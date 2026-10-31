'use client';

import React, { useState } from 'react';
import Breadcrumb from '@/components/Common/Breadcrumb';

const LibroReclamacionesContent = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <Breadcrumb Title="Libro de Reclamaciones Virtual" />
      <div className="sp" style={{ background: '#F8FAFC', paddingTop: '80px', paddingBottom: '90px' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div
                className="p-4 p-md-5 rounded-4 shadow-sm bg-white"
                style={{ border: '1px solid #E2E8F0' }}
              >
                <div className="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: '#FFF7ED',
                      color: '#FF5722',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                    }}
                  >
                    <i className="bi bi-book-half"></i>
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0" style={{ color: '#0F2137' }}>
                      Hoja de Reclamación Virtual
                    </h4>
                    <small className="text-muted">
                      RappiGas Perú S.A.C. • RUC: 20609876543 • Conforme a Ley N° 29571
                    </small>
                  </div>
                </div>

                {submitted ? (
                  <div className="p-4 rounded-4 text-center" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                    <i className="bi bi-check-circle-fill text-success fs-1 mb-2 d-block"></i>
                    <h5 className="fw-bold text-success">Reclamación Registrada con Éxito</h5>
                    <p className="text-muted" style={{ fontSize: '14px' }}>
                      Código de Reclamo: <strong>REC-2026-0924</strong>. Se ha enviado una copia a tu correo electrónico. Plazo legal de respuesta: máximo 15 días hábiles.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <h6 className="fw-bold text-dark mb-3">1. Identificación del Consumidor Reclamante</h6>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '12px' }}>Nombres y Apellidos</label>
                        <input type="text" className="form-control" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '12px' }}>DNI / CE</label>
                        <input type="text" maxLength="8" className="form-control" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '12px' }}>Teléfono de Contacto</label>
                        <input type="tel" className="form-control" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '12px' }}>Correo Electrónico</label>
                        <input type="email" className="form-control" required />
                      </div>
                      <div className="col-12">
                        <label className="form-label" style={{ fontSize: '12px' }}>Domicilio (Calle, Número, Distrito)</label>
                        <input type="text" className="form-control" required />
                      </div>
                    </div>

                    <h6 className="fw-bold text-dark mb-3">2. Detalle de la Reclamación y Pedido</h6>
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '12px' }}>Tipo de Reclamación</label>
                        <select className="form-select">
                          <option>Reclamo (Disconformidad relacionada a los productos o servicios)</option>
                          <option>Queja (Disconformidad no relacionada directamente a los productos)</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '12px' }}>Fecha del Pedido o Incidente</label>
                        <input type="date" className="form-control" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '12px' }}>Monto Reclamado (S/)</label>
                        <input type="number" step="0.5" className="form-control" placeholder="0.00" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label" style={{ fontSize: '12px' }}>Descripción del Balón o Producto</label>
                        <input type="text" className="form-control" placeholder="Ej: Balón 10kg Premium" />
                      </div>
                      <div className="col-12">
                        <label className="form-label" style={{ fontSize: '12px' }}>Detalle de los Hechos</label>
                        <textarea className="form-control" rows="4" placeholder="Explique detalladamente lo ocurrido..." required></textarea>
                      </div>
                      <div className="col-12">
                        <label className="form-label" style={{ fontSize: '12px' }}>Pedido del Consumidor</label>
                        <textarea className="form-control" rows="2" placeholder="¿Qué solución espera obtener? (Ej: Cambio de balón, devolución de dinero, etc.)" required></textarea>
                      </div>
                    </div>

                    <div className="text-end">
                      <button
                        type="submit"
                        className="theme-btn1 text-white border-0 px-4 py-3 fw-bold"
                        style={{
                          background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '15px',
                        }}
                      >
                        Enviar Hoja de Reclamación
                      </button>
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

export default LibroReclamacionesContent;
