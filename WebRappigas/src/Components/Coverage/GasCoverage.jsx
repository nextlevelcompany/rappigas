'use client';

import React, { useState } from 'react';

export default function GasCoverage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('todos');

  const zones = [
    {
      id: 'norte',
      name: 'Lima Norte',
      badge: 'Despacho < 30 min',
      badgeColor: 'bg-danger',
      districts: ['Los Olivos', 'San Martín de Porres', 'Comas', 'Independencia', 'Carabayllo', 'Puente Piedra'],
      icon: 'bi-geo-alt',
    },
    {
      id: 'centro',
      name: 'Lima Centro',
      badge: 'Despacho < 25 min',
      badgeColor: 'bg-primary',
      districts: ['Cercado de Lima', 'Breña', 'Jesús María', 'Lince', 'La Victoria', 'San Miguel', 'Pueblo Libre'],
      icon: 'bi-building',
    },
    {
      id: 'sur',
      name: 'Lima Moderna & Sur',
      badge: 'Despacho < 35 min',
      badgeColor: 'bg-success',
      districts: ['Miraflores', 'San Isidro', 'Surco', 'San Borja', 'Chorrillos', 'Villa El Salvador', 'San Juan de Lurigancho (SJL)'],
      icon: 'bi-compass',
    },
    {
      id: 'provincias',
      name: 'Provincias Autorizadas',
      badge: 'Cobertura Regional',
      badgeColor: 'bg-warning text-dark',
      districts: ['Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Cusco', 'Huancayo', 'Chimbote', 'Ica'],
      icon: 'bi-map',
    },
  ];

  const brandPartners = [
    { name: 'Solgas', logoText: 'SOLGAS', desc: 'Planta certificada SCOP', color: '#0284C7' },
    { name: 'Primax Gas', logoText: 'PRIMAX GAS', desc: 'Distribución autorizada', color: '#EA580C' },
    { name: 'Zeta Gas', logoText: 'ZETA GAS', desc: 'Red nacional de GLP', color: '#16A34A' },
    { name: 'Llamagas', logoText: 'LLAMAGAS', desc: 'Llama azul garantizada', color: '#DC2626' },
  ];

  const allDistricts = zones.flatMap((z) => z.districts);
  const filteredDistricts = searchTerm
    ? allDistricts.filter((d) => d.toLowerCase().includes(searchTerm.toLowerCase()))
    : null;

  return (
    <section className="sp" id="cobertura" style={{ background: '#FFFFFF', paddingTop: '80px', paddingBottom: '90px' }}>
      <div className="container">
        {/* Section Heading */}
        <div className="row mb-5">
          <div className="col-lg-8 m-auto text-center">
            <div className="heading1">
              <span
                className="span d-inline-flex align-items-center gap-2 px-3 py-1 mb-2 rounded-pill"
                style={{ background: 'rgba(255, 87, 34, 0.1)', color: '#FF5722', fontWeight: '700', fontSize: '13px' }}
              >
                <i className="bi bi-geo-fill"></i> Red Nacional de Gas de Cocina
              </span>
              <h2 className="title fw-bold" style={{ fontSize: '38px', color: '#0F2137' }}>
                Red de Distribuidores Autorizados en tu Distrito
              </h2>
              <p className="mt-2 text-muted" style={{ fontSize: '16px' }}>
                Conectamos las mejores plantas y distribuidoras de gas de cocina (Solgas, Primax Gas, Zeta Gas, Llamagas) en Lima Norte, Lima Centro, Lima Sur, Callao y provincias.
              </p>
            </div>
          </div>
        </div>

        {/* Brand Partners Showcase */}
        <div className="row g-3 mb-5 justify-content-center">
          {brandPartners.map((brand, i) => (
            <div key={i} className="col-lg-3 col-sm-6">
              <div
                className="p-3 rounded-3 text-center border"
                style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}
              >
                <div className="fw-bold fs-5 mb-1" style={{ color: brand.color, letterSpacing: '1px' }}>
                  <i className="bi bi-fire me-1"></i> {brand.logoText}
                </div>
                <small className="text-muted">{brand.desc}</small>
              </div>
            </div>
          ))}
        </div>

        {/* Quick District Search Bar */}
        <div className="row mb-4">
          <div className="col-lg-6 mx-auto">
            <div className="input-group shadow-sm rounded-pill overflow-hidden border">
              <span className="input-group-text bg-white border-0 ps-4 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-0 py-3"
                placeholder="Busca tu distrito (Ej: Los Olivos, Miraflores, Arequipa...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: '14px' }}
              />
              {searchTerm && (
                <button
                  className="btn bg-white border-0 text-muted"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Results Display if active */}
        {searchTerm ? (
          <div className="row justify-content-center mb-5">
            <div className="col-lg-8">
              <div className="p-4 rounded-4 bg-light border">
                <h6 className="fw-bold mb-3">
                  Resultados para "{searchTerm}": {filteredDistricts.length} distrito(s) con cobertura inmediata
                </h6>
                {filteredDistricts.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {filteredDistricts.map((d, idx) => (
                      <span key={idx} className="badge bg-success py-2 px-3 fs-6">
                        <i className="bi bi-check-circle-fill me-1"></i> {d} - ¡Entrega Express Activa!
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0">
                    No encontramos "{searchTerm}". Consulta a nuestra central telefónica al <strong>977 665 554</strong> para despachos especiales.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Zone Cards Grid */
          <div className="row g-4">
            {zones.map((zone) => (
              <div key={zone.id} className="col-lg-6 col-md-12">
                <div
                  className="p-4 rounded-4 h-100"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 8px 24px rgba(15, 33, 55, 0.05)',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          background: '#EFF6FF',
                          color: '#2563EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                        }}
                      >
                        <i className={`bi ${zone.icon}`}></i>
                      </div>
                      <h4 className="fw-bold mb-0" style={{ fontSize: '18px', color: '#0F2137' }}>
                        {zone.name}
                      </h4>
                    </div>
                    <span className={`badge rounded-pill fw-bold ${zone.badgeColor}`} style={{ fontSize: '11px', padding: '6px 12px' }}>
                      {zone.badge}
                    </span>
                  </div>

                  <p className="text-muted mb-3" style={{ fontSize: '13px' }}>
                    Distritos con entrega inmediata y repartidores conectados vía GPS:
                  </p>

                  <div className="d-flex flex-wrap gap-2">
                    {zone.districts.map((dist, idx) => (
                      <span
                        key={idx}
                        className="badge py-2 px-3 text-dark fw-medium"
                        style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', fontSize: '12px' }}
                      >
                        <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                        {dist}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
