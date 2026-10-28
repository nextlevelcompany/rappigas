'use client';

import React, { useState } from 'react';

export default function GasCatalog() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerDistrict, setCustomerDistrict] = useState('Los Olivos');
  const [paymentMethod, setPaymentMethod] = useState('Yape');

  const products = [
    {
      id: 1,
      badge: 'El Más Pedido',
      badgeClass: 'bg-danger text-white',
      name: 'Balón de Gas de Cocina 10kg Válvula Premium Click-On',
      tag: 'Doméstico Premium',
      technicalDetail: 'Tara: 10.2 kg • Gas Neto: 10.0 kg • Acople rápido seguro',
      price: 48.00,
      priceLabel: 'Desde S/ 48.00',
      includes: 'Instalación de cortesía y revisión de manguera sin costo',
      ctaText: 'Agregar al Carrito',
      icon: 'bi-shield-check',
      accentColor: '#FF5722',
      featured: true,
      img: '/assets/img/project/project1-img1.png',
    },
    {
      id: 2,
      badge: 'Económico Tradicional',
      badgeClass: 'bg-primary text-white',
      name: 'Balón de Gas de Cocina 10kg Rosca Estándar',
      tag: 'Doméstico Tradicional',
      technicalDetail: 'Tara: 10.5 kg • Gas Neto: 10.0 kg • Rosca universal',
      price: 45.00,
      priceLabel: 'Desde S/ 45.00',
      includes: 'Instalación y verificación de seguridad en cocina',
      ctaText: 'Agregar al Carrito',
      icon: 'bi-wrench-adjustable',
      accentColor: '#2563EB',
      featured: false,
      img: '/assets/img/project/project1-img2.png',
    },
    {
      id: 3,
      badge: 'Ideal Negocios & Familias',
      badgeClass: 'bg-success text-white',
      name: 'Balón Comercial 15kg Gas de Cocina Alta Demanda',
      tag: 'Comercial Rápido',
      technicalDetail: 'Para pollerías, chifas, panaderías y restaurantes',
      price: 72.00,
      priceLabel: 'Desde S/ 72.00',
      includes: 'Despacho prioritario y boleta o factura electrónica',
      ctaText: 'Agregar al Carrito',
      icon: 'bi-shop',
      accentColor: '#059669',
      featured: false,
      img: '/assets/img/project/project1-img3.png',
    },
    {
      id: 4,
      badge: 'Industrial & Multifamiliar',
      badgeClass: 'bg-dark text-white',
      name: 'Cilindro Comercial 45kg Gas de Cocina',
      tag: 'Industrial / Edificios',
      technicalDetail: 'Abastecimiento para edificios, calderas y montacargas',
      price: 205.00,
      priceLabel: 'Desde S/ 205.00',
      includes: 'Transporte especializado y asistencia en sala de máquinas',
      ctaText: 'Cotizar Despacho',
      icon: 'bi-buildings',
      accentColor: '#475569',
      featured: false,
      img: '/assets/img/project/project1-img4.png',
    },
    {
      id: 5,
      badge: 'Seguridad Certificada',
      badgeClass: 'bg-warning text-dark',
      name: 'Regulador Premium con Manómetro Indicador',
      tag: 'Accesorio de Seguridad',
      technicalDetail: 'Muestra el nivel exacto de gas restante y corta el flujo ante fuga',
      price: 38.00,
      priceLabel: 'S/ 38.00',
      includes: 'Garantía 12 meses y prueba de estanqueidad gratuita',
      ctaText: 'Comprar Accesorio',
      icon: 'bi-speedometer2',
      accentColor: '#D97706',
      featured: false,
      img: '/assets/img/project/project1-img5.png',
    },
  ];

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setShowOrderModal(true);
    setOrderSuccess(false);
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    setOrderSuccess(true);
    setTimeout(() => {
      setShowOrderModal(false);
      setOrderSuccess(false);
    }, 3500);
  };

  return (
    <section className="service sp" id="productos" style={{ background: '#F8FAFC', paddingTop: '80px', paddingBottom: '90px' }}>
      <div className="container">
        {/* Section Header */}
        <div className="row mb-5">
          <div className="col-lg-8 m-auto text-center">
            <div className="heading1">
              <span
                className="span d-inline-flex align-items-center gap-2 px-3 py-1 mb-2 rounded-pill"
                style={{ background: 'rgba(255, 87, 34, 0.1)', color: '#FF5722', fontWeight: '700', fontSize: '13px' }}
              >
                <i className="bi bi-tag-fill"></i> Catálogo Oficial 2026
              </span>
              <h2 className="title fw-bold" style={{ fontSize: '38px', color: '#0F2137' }}>
                Nuestros Balones y Accesorios Oficiales
              </h2>
              <p className="mt-2 text-muted" style={{ fontSize: '16px' }}>
                Precios justos de planta, sin sobrecostos y con despacho a domicilio.
              </p>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="row g-4 justify-content-center">
          {products.map((item) => (
            <div key={item.id} className={item.id === 4 || item.id === 5 ? 'col-lg-6 col-md-6' : 'col-lg-4 col-md-6'}>
              <div
                className={`card h-100 border-0 rounded-4 shadow-sm position-relative overflow-hidden ${
                  item.featured ? 'border-2' : ''
                }`}
                style={{
                  background: '#FFFFFF',
                  border: item.featured ? '2px solid #FF5722' : '1px solid #E2E8F0',
                  boxShadow: item.featured ? '0 12px 30px rgba(255,87,34,0.15)' : '0 6px 20px rgba(0,0,0,0.04)',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Ribbon Badge */}
                <div className="p-3 d-flex justify-content-between align-items-center border-bottom bg-light">
                  <span className={`badge rounded-pill px-3 py-2 fw-bold ${item.badgeClass}`} style={{ fontSize: '12px' }}>
                    {item.badge}
                  </span>
                  <span className="text-muted fw-semibold" style={{ fontSize: '12px' }}>
                    <i className="bi bi-check-circle-fill text-success me-1"></i> Stock Disponible
                  </span>
                </div>

                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        background: 'rgba(255, 87, 34, 0.08)',
                        color: item.accentColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        flexShrink: 0,
                      }}
                    >
                      <i className={`bi ${item.icon}`}></i>
                    </div>
                    <div>
                      <span className="badge bg-secondary-subtle text-secondary mb-1" style={{ fontSize: '11px' }}>
                        {item.tag}
                      </span>
                      <h4 className="fw-bold mb-0" style={{ fontSize: '18px', color: '#0F2137', lineHeight: '1.3' }}>
                        {item.name}
                      </h4>
                    </div>
                  </div>

                  {/* Technical Detail */}
                  <div className="p-2 px-3 rounded-3 mb-3" style={{ background: '#F1F5F9', fontSize: '13px', color: '#334155' }}>
                    <i className="bi bi-info-circle-fill text-primary me-1"></i>
                    <strong>Detalle técnico:</strong> {item.technicalDetail}
                  </div>

                  {/* Includes Feature */}
                  <ul className="list-unstyled mb-4 text-muted flex-grow-1" style={{ fontSize: '13px' }}>
                    <li className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-patch-check-fill text-success"></i>
                      <span>{item.includes}</span>
                    </li>
                    <li className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-patch-check-fill text-success"></i>
                      <span>Pesaje obligatorio en balanza digital frente a ti</span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                      <i className="bi bi-patch-check-fill text-success"></i>
                      <span>Acumula <strong>+50 Puntos RappiGas</strong></span>
                    </li>
                  </ul>

                  {/* Price & CTA */}
                  <div className="pt-3 border-top d-flex align-items-center justify-content-between mt-auto">
                    <div>
                      <span className="text-muted d-block" style={{ fontSize: '12px' }}>Precio referencial</span>
                      <span className="fw-bold" style={{ fontSize: '24px', color: '#0F2137' }}>
                        {item.priceLabel}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      className="btn fw-bold px-3 py-2 text-white"
                      style={{
                        background: item.featured
                          ? 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)'
                          : '#0F2137',
                        borderRadius: '8px',
                        fontSize: '14px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      }}
                    >
                      <i className="bi bi-cart-plus me-1"></i> {item.ctaText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: Pedido Express / Carrito */}
      {showOrderModal && selectedProduct && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 100000 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg p-4">
              <div className="modal-header border-0 pb-0">
                <div>
                  <span className="badge bg-warning text-dark mb-1">Despacho Express RappiGas</span>
                  <h4 className="modal-title fw-bold">Confirmar Pedido de Balón</h4>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowOrderModal(false)}
                ></button>
              </div>

              <div className="modal-body pt-3">
                {orderSuccess ? (
                  <div className="text-center py-4">
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
                    <h4 className="fw-bold text-success mb-2">¡Pedido Recibido con Éxito!</h4>
                    <p className="text-muted">
                      Hemos asignado tu entrega al repartidor oficial más cercano con balanza digital. Te contactaremos al{' '}
                      <strong>{customerPhone || '977 665 554'}</strong> para confirmar tu llegada en 25-35 minutos.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleOrderSubmit}>
                    {/* Selected product summary */}
                    <div className="p-3 rounded-3 mb-4 d-flex justify-content-between align-items-center" style={{ background: '#FFF7ED', border: '1px solid #FFEDD5' }}>
                      <div>
                        <span className="badge bg-danger mb-1">{selectedProduct.badge}</span>
                        <h6 className="fw-bold mb-0 text-dark">{selectedProduct.name}</h6>
                        <small className="text-muted">{selectedProduct.technicalDetail}</small>
                      </div>
                      <div className="text-end">
                        <span className="text-muted d-block" style={{ fontSize: '11px' }}>Total a Pagar</span>
                        <span className="fs-5 fw-bold text-danger">{selectedProduct.priceLabel}</span>
                      </div>
                    </div>

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                          Nombre Completo
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ej: Carmen Salazar"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                          Teléfono de Contacto (WhatsApp)
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light fw-bold">+51</span>
                          <input
                            type="tel"
                            className="form-control"
                            placeholder="977 665 554"
                            maxLength="9"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-8">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                          Dirección de Entrega (Calle, Número, Dpto)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Av. Antúnez de Mayolo 1240, Dpto 302"
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          required
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                          Distrito
                        </label>
                        <select
                          className="form-select"
                          value={customerDistrict}
                          onChange={(e) => setCustomerDistrict(e.target.value)}
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
                          <option>Arequipa</option>
                          <option>Trujillo</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold" style={{ fontSize: '13px' }}>
                          Método de Pago Preferido
                        </label>
                        <div className="d-flex flex-wrap gap-2">
                          {['🟣 Yape', '🔵 Plin', '💵 Efectivo (Contra Entrega)', '💳 Tarjeta POS en Puerta'].map((m) => (
                            <button
                              key={m}
                              type="button"
                              className={`btn btn-sm ${paymentMethod === m ? 'btn-danger' : 'btn-outline-secondary'}`}
                              onClick={() => setPaymentMethod(m)}
                              style={{ borderRadius: '6px' }}
                            >
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-top d-flex align-items-center justify-content-between">
                      <div className="text-muted" style={{ fontSize: '12px' }}>
                        <i className="bi bi-shield-check text-success me-1"></i>
                        Incluye verificación con balanza y prueba de fuga gratis.
                      </div>
                      <button
                        type="submit"
                        className="btn text-white fw-bold px-4 py-2"
                        style={{ background: '#FF5722', borderRadius: '8px' }}
                      >
                        Confirmar y Enviar Pedido
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
