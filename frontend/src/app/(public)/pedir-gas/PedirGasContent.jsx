'use client';

import React, { useState } from 'react';
import Breadcrumb from '@/app/(public)/_layout/Breadcrumb';
import GasPaymentMethods from './GasPaymentMethods';

const PedirGasContent = () => {
  const [selectedProduct, setSelectedProduct] = useState('premium');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('Los Olivos');
  const [payment, setPayment] = useState('Yape');
  const [submitted, setSubmitted] = useState(false);

  const productPrices = {
    premium: { name: 'Balón 10kg Premium Click-On', price: 48.00, tag: 'El Más Pedido' },
    tradicional: { name: 'Balón 10kg Rosca Tradicional', price: 45.00, tag: 'Económico' },
    comercial: { name: 'Balón Comercial 15kg Gas de Cocina', price: 72.00, tag: 'Negocios' },
    industrial: { name: 'Cilindro Comercial 45kg Gas de Cocina', price: 205.00, tag: 'Edificios' },
  };

  const handleOrder = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <Breadcrumb Title="Pedir Gas de Cocina a Domicilio" />
      <div className="sp" style={{ background: '#F8FAFC', paddingTop: '80px', paddingBottom: '90px' }}>
        <div className="container">
          <div className="row g-4 justify-content-center">
            <div className="col-lg-8">
              <div
                className="p-4 p-md-5 rounded-4 shadow-sm bg-white"
                style={{ border: '1px solid #E2E8F0' }}
              >
                <div className="heading1 mb-4 text-center">
                  <span
                    className="span d-inline-flex align-items-center gap-2 px-3 py-1 mb-2 rounded-pill"
                    style={{ background: 'rgba(255, 87, 34, 0.1)', color: '#FF5722', fontWeight: '700', fontSize: '13px' }}
                  >
                    <i className="bi bi-stopwatch"></i> Despacho en 25 a 35 Minutos
                  </span>
                  <h3 className="title fw-bold" style={{ color: '#0F2137' }}>
                    Solicitud de Balón con Balanza en Puerta
                  </h3>
                  <p className="text-muted" style={{ fontSize: '14px' }}>
                    Verificamos los 10 kg netos en tu presencia antes de instalar. Sin costos ocultos.
                  </p>
                </div>

                {submitted ? (
                  <div className="p-4 rounded-4 text-center" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                    <div
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        background: '#10B981',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '36px',
                        margin: '0 auto 16px',
                      }}
                    >
                      <i className="bi bi-check-lg"></i>
                    </div>
                    <h4 className="fw-bold text-success mb-2">¡Pedido Confirmado!</h4>
                    <p className="text-muted">
                      El repartidor oficial más cercano con balanza calibrada está en camino a{' '}
                      <strong>{address}, {district}</strong>. Te contactaremos al <strong>+51 {phone}</strong> en los próximos minutos.
                    </p>
                    <div className="mt-3 p-3 rounded-3 bg-white border d-inline-block text-start">
                      <div><strong>Producto:</strong> {productPrices[selectedProduct].name}</div>
                      <div><strong>Monto:</strong> S/ {productPrices[selectedProduct].price.toFixed(2)}</div>
                      <div><strong>Método de Pago:</strong> {payment}</div>
                      <div><strong>Garantía:</strong> Pesaje obligatorio en balanza digital</div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleOrder}>
                    {/* Selector de Balón */}
                    <div className="mb-4">
                      <label className="form-label fw-bold" style={{ fontSize: '14px', color: '#0F2137' }}>
                        1. Selecciona tu Tipo de Balón de Gas:
                      </label>
                      <div className="row g-2">
                        {Object.entries(productPrices).map(([key, item]) => (
                          <div key={key} className="col-md-6">
                            <div
                              onClick={() => setSelectedProduct(key)}
                              className={`p-3 rounded-3 border cursor-pointer d-flex justify-content-between align-items-center ${
                                selectedProduct === key ? 'border-danger bg-light' : 'bg-white'
                              }`}
                              style={{
                                cursor: 'pointer',
                                borderColor: selectedProduct === key ? '#FF5722' : '#E2E8F0',
                                borderWidth: selectedProduct === key ? '2px' : '1px',
                              }}
                            >
                              <div>
                                <span className="badge bg-secondary-subtle text-dark mb-1" style={{ fontSize: '11px' }}>
                                  {item.tag}
                                </span>
                                <div className="fw-bold" style={{ fontSize: '14px', color: '#0F2137' }}>
                                  {item.name}
                                </div>
                              </div>
                              <div className="fw-bold fs-5 text-danger">
                                S/ {item.price.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Datos de Entrega */}
                    <div className="mb-4">
                      <label className="form-label fw-bold" style={{ fontSize: '14px', color: '#0F2137' }}>
                        2. Datos de Entrega:
                      </label>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label text-muted" style={{ fontSize: '12px' }}>
                            Nombre Completo
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Ej: Lucía Morales"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label text-muted" style={{ fontSize: '12px' }}>
                            Teléfono de Contacto (WhatsApp)
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light fw-bold">+51</span>
                            <input
                              type="tel"
                              maxLength="9"
                              className="form-control"
                              placeholder="977 665 554"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-8">
                          <label className="form-label text-muted" style={{ fontSize: '12px' }}>
                            Dirección de Entrega
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Av. Antúnez de Mayolo 1420, Dpto 201"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label text-muted" style={{ fontSize: '12px' }}>
                            Distrito
                          </label>
                          <select
                            className="form-select"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                          >
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
                            <option>Callao</option>
                            <option>Provincias</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Método de Pago */}
                    <div className="mb-4">
                      <label className="form-label fw-bold" style={{ fontSize: '14px', color: '#0F2137' }}>
                        3. Método de Pago Preferido:
                      </label>
                      <div className="d-flex flex-wrap gap-2">
                        {['🟣 Yape (977 665 554)', '🔵 Plin', '💵 Efectivo (Contra Entrega)', '💳 Tarjeta POS en Puerta'].map((m) => (
                          <button
                            key={m}
                            type="button"
                            className={`btn ${payment === m ? 'btn-danger' : 'btn-outline-secondary'}`}
                            onClick={() => setPayment(m)}
                            style={{ borderRadius: '8px', fontSize: '13px' }}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-3 mb-4 d-flex justify-content-between align-items-center bg-light border">
                      <div>
                        <div className="text-muted" style={{ fontSize: '12px' }}>Total con delivery e instalación gratis:</div>
                        <div className="fs-3 fw-bold text-dark">S/ {productPrices[selectedProduct].price.toFixed(2)}</div>
                      </div>
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
                        <i className="bi bi-bag-check-fill me-1"></i> Confirmar Despacho Express
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <GasPaymentMethods />
    </div>
  );
};

export default PedirGasContent;
