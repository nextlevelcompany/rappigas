'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export default function GasCatalog() {
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODOS');
  const [distritoSeleccionado, setDistritoSeleccionado] = useState('Los Olivos');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Form state para el modal express
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Yape');

  const distritosDisponibles = [
    { nombre: 'Los Olivos', tiempo: '20-30 min', plantas: 4 },
    { nombre: 'San Martín de Porres', tiempo: '25-35 min', plantas: 5 },
    { nombre: 'Independencia', tiempo: '20-30 min', plantas: 3 },
    { nombre: 'Comas', tiempo: '25-35 min', plantas: 4 },
    { nombre: 'Miraflores', tiempo: '20-30 min', plantas: 3 },
    { nombre: 'San Isidro', tiempo: '20-30 min', plantas: 3 },
    { nombre: 'Santiago de Surco', tiempo: '25-35 min', plantas: 4 },
    { nombre: 'San Borja', tiempo: '20-30 min', plantas: 3 },
    { nombre: 'Ate Vitarte', tiempo: '25-40 min', plantas: 3 },
    { nombre: 'San Juan de Lurigancho', tiempo: '25-40 min', plantas: 5 },
    { nombre: 'Arequipa (Cercado / Cayma)', tiempo: '25-35 min', plantas: 3 },
    { nombre: 'Trujillo (Centro / Víctor Larco)', tiempo: '25-35 min', plantas: 3 },
  ];

  const distritoActual = distritosDisponibles.find((d) => d.nombre === distritoSeleccionado) || distritosDisponibles[0];

  const products = [
    {
      id: 1,
      sku: 'GLP-10-PREM-001',
      categoria: 'GLP_10KG',
      badge: 'El Más Pedido ⭐',
      badgeClass: 'bg-danger text-white',
      name: 'Balón de Gas 10kg Válvula Premium Click-On',
      tag: 'Doméstico Premium (Recomendado)',
      technicalDetail: 'Tara: 10.2 kg • Gas Neto: 10.0 kg • Válvula de acople rápido antifugas',
      price: 48.00,
      priceLabel: 'S/ 48.00',
      valvula: 'Click-On Premium',
      includes: 'Instalación de cortesía y revisión de manguera con detector de fugas',
      points: '+50 Puntos RappiGas',
      ctaText: 'Pedir Ahora',
      icon: 'bi-shield-check',
      accentColor: '#FF5722',
      featured: true,
      img: '/products/balon-10kg-premium.png',
    },
    {
      id: 2,
      sku: 'GLP-10-ROSC-002',
      categoria: 'GLP_10KG',
      badge: 'Económico Tradicional',
      badgeClass: 'bg-primary text-white',
      name: 'Balón de Gas 10kg Válvula Rosca Estándar',
      tag: 'Doméstico Tradicional',
      technicalDetail: 'Tara: 10.5 kg • Gas Neto: 10.0 kg • Rosca universal 7/8"',
      price: 45.00,
      priceLabel: 'S/ 45.00',
      valvula: 'Rosca Tradicional',
      includes: 'Pesaje digital en puerta y prueba de fuego en quemador',
      points: '+45 Puntos RappiGas',
      ctaText: 'Pedir Ahora',
      icon: 'bi-wrench-adjustable',
      accentColor: '#2563EB',
      featured: false,
      img: '/products/balon-10kg-rosca.png',
    },
    {
      id: 3,
      sku: 'GLP-15-COMM-003',
      categoria: 'GLP_15KG',
      badge: 'Ideal Negocios & Chifas',
      badgeClass: 'bg-success text-white',
      name: 'Balón Comercial 15kg Gas de Alta Demanda',
      tag: 'Comercial / Restaurantes',
      technicalDetail: 'Tara: 14.8 kg • Gas Neto: 15.0 kg • Presión constante para cocinas industriales',
      price: 72.00,
      priceLabel: 'S/ 72.00',
      valvula: 'Click-On / Rosca',
      includes: 'Despacho prioritario continuo con boleta o factura con RUC',
      points: '+75 Puntos RappiGas',
      ctaText: 'Pedir Comercial',
      icon: 'bi-shop',
      accentColor: '#059669',
      featured: false,
      img: '/products/balon-15kg-premium.png',
    },
    {
      id: 4,
      sku: 'GLP-45-IND-004',
      categoria: 'GLP_45KG',
      badge: 'Industrial & Edificios',
      badgeClass: 'bg-dark text-white',
      name: 'Cilindro Industrial 45kg GLP Cocina y Calderas',
      tag: 'Industrial / Edificios',
      technicalDetail: 'Gas Neto: 45.0 kg • Autonomía para salas de máquinas y baterías de gas',
      price: 205.00,
      priceLabel: 'S/ 205.00',
      valvula: 'Pol Estándar Industrial',
      includes: 'Transporte pesado seguro, conexión a múltiple y prueba técnica',
      points: '+200 Puntos RappiGas',
      ctaText: 'Pedir Cilindro 45kg',
      icon: 'bi-buildings',
      accentColor: '#475569',
      featured: false,
      img: '/products/balon-45kg-industrial.png',
    },
    {
      id: 5,
      sku: 'VALV-REG-PREM-005',
      categoria: 'VALVULA_ACCESORIO',
      badge: 'Seguridad Certificada 🛡️',
      badgeClass: 'bg-warning text-dark',
      name: 'Regulador Premium Click-On con Manómetro Antifugas',
      tag: 'Accesorio Certificado Osinergmin',
      technicalDetail: 'Medidor de aguja de nivel de gas restante y corte automático ante fuga',
      price: 38.00,
      priceLabel: 'S/ 38.00',
      valvula: 'Acople Rápido Premium',
      includes: 'Garantía 12 meses, manguera normada y 2 abrazaderas de acero',
      points: '+40 Puntos RappiGas',
      ctaText: 'Comprar Regulador',
      icon: 'bi-speedometer2',
      accentColor: '#D97706',
      featured: false,
      img: '/products/regulador-manometro.svg',
    },
  ];

  const productosFiltrados = useMemo(() => {
    if (categoriaFiltro === 'TODOS') return products;
    return products.filter((p) => p.categoria === categoriaFiltro);
  }, [categoriaFiltro]);

  const handleOpenModal = (product) => {
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
    <section className="service sp" id="productos" style={{ background: '#F8FAFC', paddingTop: '60px', paddingBottom: '90px' }}>
      <div className="container">
        {/* 1. Header con Buscador Rápido de Distrito */}
        <div className="row mb-4">
          <div className="col-lg-10 m-auto text-center">
            <span
              className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-2 rounded-pill shadow-xs"
              style={{ background: 'rgba(255, 87, 34, 0.12)', color: '#FF5722', fontWeight: '800', fontSize: '13px' }}
            >
              <i className="bi bi-fire"></i> Catálogo Oficial RappiGas 2026
            </span>
            <h2 className="fw-black" style={{ fontSize: '36px', color: '#0F2137', letterSpacing: '-0.5px' }}>
              Pide tu Balón de Gas Exacto y Seguro
            </h2>
            <p className="text-muted mt-2" style={{ fontSize: '16px', maxWidth: '700px', margin: '0 auto' }}>
              Pesaje comprobado en balanza digital frente a ti, termosello inviolable Osinergmin y entrega express en 30 minutos.
            </p>

            {/* Widget de Distrito Dinámico */}
            <div className="card border-0 rounded-4 shadow-sm p-3 mt-4 mx-auto" style={{ maxWidth: '720px', background: '#FFFFFF' }}>
              <div className="row g-2 align-items-center">
                <div className="col-md-6 text-start">
                  <label className="text-muted fw-bold mb-1 d-block" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                    <i className="bi bi-geo-alt-fill text-danger me-1"></i> Tu Distrito de Entrega:
                  </label>
                  <select
                    value={distritoSeleccionado}
                    onChange={(e) => setDistritoSeleccionado(e.target.value)}
                    className="form-select form-select-sm fw-bold border-secondary-subtle"
                    style={{ fontSize: '14px', borderRadius: '10px' }}
                  >
                    {distritosDisponibles.map((d) => (
                      <option key={d.nombre} value={d.nombre}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 text-md-end text-start">
                  <div className="d-flex flex-column align-items-md-end align-items-start">
                    <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 mb-1" style={{ fontSize: '11px', fontWeight: '700' }}>
                      <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Despacho en {distritoActual.tiempo}
                    </span>
                    <span className="text-muted" style={{ fontSize: '11px' }}>
                      <strong>{distritoActual.plantas} distribuidores</strong> listos en tu zona
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Filtros de Categoría */}
        <div className="row mb-4">
          <div className="col-12 text-center">
            <div className="d-inline-flex flex-wrap gap-2 p-1.5 bg-white rounded-4 shadow-xs border">
              {[
                { id: 'TODOS', label: '🔥 Todos los Productos' },
                { id: 'GLP_10KG', label: '🏠 10kg Doméstico' },
                { id: 'GLP_15KG', label: '🏢 15kg Comercial' },
                { id: 'GLP_45KG', label: '🏭 45kg Industrial' },
                { id: 'VALVULA_ACCESORIO', label: '🛡️ Válvulas y Reguladores' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setCategoriaFiltro(btn.id)}
                  className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold transition ${
                    categoriaFiltro === btn.id
                      ? 'btn-danger text-white shadow-xs'
                      : 'btn-light text-secondary'
                  }`}
                  style={{
                    fontSize: '13px',
                    background: categoriaFiltro === btn.id ? '#FF5722' : 'transparent',
                    borderColor: categoriaFiltro === btn.id ? '#FF5722' : 'transparent',
                  }}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Product Grid */}
        <div className="row g-4 justify-content-center">
          {productosFiltrados.map((item) => (
            <div key={item.id} className={item.id === 4 || item.id === 5 ? 'col-lg-6 col-md-6' : 'col-lg-4 col-md-6'}>
              <div
                className={`card h-100 border-0 rounded-4 shadow-sm position-relative overflow-hidden ${
                  item.featured ? 'border-2' : ''
                }`}
                style={{
                  background: '#FFFFFF',
                  border: item.featured ? '2px solid #FF5722' : '1px solid #E2E8F0',
                  boxShadow: item.featured ? '0 12px 30px rgba(255,87,34,0.12)' : '0 6px 20px rgba(0,0,0,0.03)',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Ribbon Superior */}
                <div className="p-3 d-flex justify-content-between align-items-center border-bottom bg-light">
                  <span className={`badge rounded-pill px-3 py-1.5 fw-bold ${item.badgeClass}`} style={{ fontSize: '11px' }}>
                    {item.badge}
                  </span>
                  <span className="text-success fw-bold" style={{ fontSize: '11px' }}>
                    <i className="bi bi-shield-fill-check me-1"></i> NTP 350.011 Vigente
                  </span>
                </div>

                <div className="card-body p-4 d-flex flex-column">
                  {/* Imagen y Título */}
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      style={{
                        width: '70px',
                        height: '75px',
                        borderRadius: '16px',
                        background: 'linear-gradient(180deg, #F8FAFC 0%, #FFF7ED 100%)',
                        border: '1px solid #FED7AA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={item.img}
                        alt={item.name}
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div>
                      <span className="badge bg-secondary-subtle text-secondary mb-1" style={{ fontSize: '10px' }}>
                        {item.tag}
                      </span>
                      <h4 className="fw-bold mb-0" style={{ fontSize: '17px', color: '#0F2137', lineHeight: '1.25' }}>
                        {item.name}
                      </h4>
                      <span className="text-muted" style={{ fontSize: '11px' }}>
                        Válvula: <strong>{item.valvula}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Detalle Técnico */}
                  <div className="p-2.5 px-3 rounded-3 mb-3" style={{ background: '#F1F5F9', fontSize: '12px', color: '#334155' }}>
                    <i className="bi bi-info-circle-fill text-primary me-1"></i>
                    <strong>Especificación:</strong> {item.technicalDetail}
                  </div>

                  {/* Beneficios Incluidos */}
                  <ul className="list-unstyled mb-4 text-muted flex-grow-1" style={{ fontSize: '12.5px' }}>
                    <li className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-patch-check-fill text-success"></i>
                      <span>{item.includes}</span>
                    </li>
                    <li className="d-flex align-items-center gap-2 mb-2">
                      <i className="bi bi-patch-check-fill text-success"></i>
                      <span>Pesaje obligatorio en balanza digital frente a ti</span>
                    </li>
                    <li className="d-flex align-items-center gap-2">
                      <i className="bi bi-gift-fill text-warning"></i>
                      <span>Acumula <strong className="text-dark">{item.points}</strong></span>
                    </li>
                  </ul>

                  {/* Precio & CTA */}
                  <div className="pt-3 border-top d-flex align-items-center justify-between mt-auto gap-2">
                    <div>
                      <span className="text-muted d-block" style={{ fontSize: '11px' }}>Precio oficial {distritoSeleccionado}</span>
                      <span className="fw-black" style={{ fontSize: '26px', color: '#0F2137' }}>
                        {item.priceLabel}
                      </span>
                    </div>

                    <div className="d-flex gap-1.5">
                      <Link
                        href="/cliente/tienda"
                        className="btn fw-bold px-3 py-2 text-white text-decoration-none"
                        style={{
                          background: item.featured
                            ? 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)'
                            : '#0F2137',
                          borderRadius: '10px',
                          fontSize: '13px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                        }}
                      >
                        <i className="bi bi-bag-check-fill me-1"></i> Pedir
                      </Link>

                      <button
                        onClick={() => handleOpenModal(item)}
                        className="btn btn-outline-secondary btn-sm px-2.5 py-2 rounded-3"
                        title="Pedido rápido WhatsApp / Express"
                      >
                        <i className="bi bi-whatsapp text-success"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 4. Comparativa Educativa de Válvulas: Click-On vs Rosca */}
        <div className="row mt-5 pt-4">
          <div className="col-lg-10 m-auto">
            <div className="card border-0 rounded-4 shadow-sm p-4" style={{ background: '#FFFFFF' }}>
              <div className="row align-items-center g-4">
                <div className="col-md-5 text-center">
                  <span className="badge bg-warning-subtle text-warning-emphasis px-3 py-1 rounded-pill fw-bold mb-2">
                    💡 Guía de Seguridad Doméstica
                  </span>
                  <h3 className="fw-bold" style={{ fontSize: '22px', color: '#0F2137' }}>
                    ¿Qué tipo de válvula necesita tu cocina?
                  </h3>
                  <p className="text-muted" style={{ fontSize: '13px' }}>
                    RappiGas entrega cilindros homologados bajo la norma NTP 350.011 para ambos sistemas:
                  </p>
                </div>

                <div className="col-md-7">
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <div className="p-3 rounded-4 border bg-light h-100">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="badge bg-success text-white">RECOMENDADO</span>
                          <strong style={{ fontSize: '14px' }}>Válvula Click-On</strong>
                        </div>
                        <ul className="text-muted ps-3 mb-0" style={{ fontSize: '12px' }}>
                          <li>Acople rápido a presión en 1 clic.</li>
                          <li>Cero herramientas para cambiar el balón.</li>
                          <li>Corte hermético automático ante fugas.</li>
                        </ul>
                      </div>
                    </div>

                    <div className="col-sm-6">
                      <div className="p-3 rounded-4 border bg-light h-100">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="badge bg-secondary text-white">UNIVERSAL</span>
                          <strong style={{ fontSize: '14px' }}>Rosca Estándar</strong>
                        </div>
                        <ul className="text-muted ps-3 mb-0" style={{ fontSize: '12px' }}>
                          <li>Rosca de bronce tradicional 7/8".</li>
                          <li>Requiere llave inglesa o ajuste manual.</li>
                          <li>Compatible con el 95% de reguladores en Perú.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. 4 Pilares de Confianza RappiGas */}
        <div className="row mt-4 g-3 text-center justify-content-center">
          <div className="col-md-3 col-6">
            <div className="p-3 bg-white rounded-3 shadow-2xs border h-100">
              <i className="bi bi-speedometer2 text-danger fs-3 d-block mb-1"></i>
              <strong className="d-block text-dark" style={{ fontSize: '13px' }}>Balanza Digital</strong>
              <span className="text-muted" style={{ fontSize: '11px' }}>Pesamos el cilindro en tu puerta</span>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="p-3 bg-white rounded-3 shadow-2xs border h-100">
              <i className="bi bi-shield-check text-success fs-3 d-block mb-1"></i>
              <strong className="d-block text-dark" style={{ fontSize: '13px' }}>Termosello Osinergmin</strong>
              <span className="text-muted" style={{ fontSize: '11px' }}>Precinto de planta inviolable</span>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="p-3 bg-white rounded-3 shadow-2xs border h-100">
              <i className="bi bi-lightning-charge-fill text-warning fs-3 d-block mb-1"></i>
              <strong className="d-block text-dark" style={{ fontSize: '13px' }}>Entrega en 30 Minutos</strong>
              <span className="text-muted" style={{ fontSize: '11px' }}>Flota express en tu distrito</span>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="p-3 bg-white rounded-3 shadow-2xs border h-100">
              <i className="bi bi-credit-card-2-front-fill text-primary fs-3 d-block mb-1"></i>
              <strong className="d-block text-dark" style={{ fontSize: '13px' }}>Yape, Plin o Efectivo</strong>
              <span className="text-muted" style={{ fontSize: '11px' }}>Pagas contra entrega sin recargos</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Pedido Express / WhatsApp */}
      {showOrderModal && selectedProduct && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 100000 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
              <div className="modal-header border-bottom py-3" style={{ background: '#FFF7ED' }}>
                <div>
                  <span className="badge bg-danger rounded-pill px-2.5 py-1 text-white mb-1" style={{ fontSize: '10px' }}>
                    Despacho Express • {distritoSeleccionado}
                  </span>
                  <h5 className="modal-title fw-black mb-0 text-dark" style={{ fontSize: '16px' }}>
                    {selectedProduct.name}
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowOrderModal(false)}
                ></button>
              </div>

              <div className="modal-body p-4">
                {orderSuccess ? (
                  <div className="text-center py-4">
                    <div
                      className="rounded-circle bg-success-subtle text-success d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: '64px', height: '64px', fontSize: '32px' }}
                    >
                      <i className="bi bi-check-lg"></i>
                    </div>
                    <h5 className="fw-bold text-dark">¡Pedido Registrado con Éxito!</h5>
                    <p className="text-muted mt-2" style={{ fontSize: '13px' }}>
                      Una unidad de reparto está asignada para salir hacia tu dirección en <strong>{distritoSeleccionado}</strong>.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleOrderSubmit}>
                    <div className="p-3 rounded-3 mb-3 border bg-light d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted d-block" style={{ fontSize: '11px' }}>Total a Pagar contra entrega</span>
                        <strong className="fs-5 text-dark">{selectedProduct.priceLabel}</strong>
                      </div>
                      <span className="badge bg-success text-white px-2.5 py-1">Envío Gratis</span>
                    </div>

                    <div className="mb-2">
                      <label className="form-label fw-bold mb-1" style={{ fontSize: '12px' }}>Tu Nombre y Apellido:</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Ej. Juan Pérez"
                        className="form-control form-control-sm rounded-3"
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label fw-bold mb-1" style={{ fontSize: '12px' }}>Teléfono Celular (para confirmar):</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Ej. 987 654 321"
                        className="form-control form-control-sm rounded-3"
                      />
                    </div>

                    <div className="mb-2">
                      <label className="form-label fw-bold mb-1" style={{ fontSize: '12px' }}>Dirección de Entrega:</label>
                      <input
                        type="text"
                        required
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Ej. Av. Antúnez de Mayolo 1234, Dpto 301"
                        className="form-control form-control-sm rounded-3"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold mb-1" style={{ fontSize: '12px' }}>Método de Pago:</label>
                      <div className="d-flex gap-2">
                        {['Yape', 'Plin', 'Efectivo', 'Tarjeta'].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setPaymentMethod(m)}
                            className={`btn btn-sm flex-fill fw-bold rounded-2 ${
                              paymentMethod === m ? 'btn-danger text-white' : 'btn-outline-secondary'
                            }`}
                            style={{ fontSize: '11px' }}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-danger w-100 fw-bold py-2 rounded-3 shadow-xs"
                      style={{ background: '#FF5722', borderColor: '#FF5722', fontSize: '14px' }}
                    >
                      <i className="bi bi-truck me-1"></i> Confirmar Despacho Express
                    </button>

                    <div className="text-center mt-2.5">
                      <a
                        href={`https://wa.me/51977665554?text=${encodeURIComponent(`Hola RappiGas, deseo pedir un ${selectedProduct.name} para entrega en ${distritoSeleccionado}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-success btn-sm w-100 rounded-3 fw-bold"
                        style={{ fontSize: '12px' }}
                      >
                        <i className="bi bi-whatsapp me-1"></i> O pedir directo por WhatsApp
                      </a>
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
