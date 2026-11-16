'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { obtenerPremiosInicio, PremioCanje, PREMIOS_ZETA_PREMIA } from '@/app/(cliente)/cliente/canjes/premios-data';

// Lista estática base para garantizar coherencia absoluta entre el HTML del servidor y la hidratación inicial del cliente
const PREMIOS_INICIO_ESTATICOS = PREMIOS_ZETA_PREMIA.filter((p) => p.mostrarEnInicio === true);

export default function ClubRappipuntosPremios() {
  const [mounted, setMounted] = useState(false);
  // Inicializar SIEMPRE con la lista estática base en el render inicial para evitar discrepancias de hidratación con localStorage
  const [premios, setPremios] = useState<PremioCanje[]>(PREMIOS_INICIO_ESTATICOS);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('TODOS');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sincronización en tiempo real con las configuraciones del módulo interno de premios tras montar en el cliente
  useEffect(() => {
    setMounted(true);
    // Sincronizar catálogo guardado en localStorage tras hidratar exitosamente
    setPremios(obtenerPremiosInicio());

    const sincronizarPremios = () => {
      setPremios(obtenerPremiosInicio());
    };

    window.addEventListener('catalogo_premios_actualizado', sincronizarPremios);
    window.addEventListener('storage', sincronizarPremios);
    return () => {
      window.removeEventListener('catalogo_premios_actualizado', sincronizarPremios);
      window.removeEventListener('storage', sincronizarPremios);
    };
  }, []);

  const premiosFiltrados = categoriaFiltro === 'TODOS'
    ? premios
    : premios.filter((p) => {
        if (categoriaFiltro === 'GAS_VALES') return p.categoria === 'GAS_VALES';
        if (categoriaFiltro === 'COCINA') return p.categoria === 'COCINA_MENAJE';
        if (categoriaFiltro === 'ELECTRO') return p.categoria === 'ELECTROHOGAR';
        return p.categoria === categoriaFiltro;
      });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="rappigas-club-premios" id="fidelidad" suppressHydrationWarning>
      <style dangerouslySetInnerHTML={{ __html: `
        .rappigas-club-premios {
          background-color: #F8FAFC;
          padding: 38px 0 42px;
          position: relative;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .rappigas-club-premios .section-header {
          text-align: center;
          max-width: 780px;
          margin: 0 auto 20px;
          padding: 0 15px;
        }

        .rappigas-club-premios .eyebrow-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 87, 34, 0.08);
          color: #FF5722;
          font-size: 11.5px;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 9999px;
          margin-bottom: 8px;
          border: 1px solid rgba(255, 87, 34, 0.18);
        }

        .rappigas-club-premios .section-title {
          font-size: 26px;
          font-weight: 800;
          color: #0F172A;
          line-height: 1.25;
          margin-bottom: 8px;
          letter-spacing: -0.015em;
        }

        .rappigas-club-premios .section-subtitle {
          font-size: 13.5px;
          color: #475569;
          line-height: 1.5;
          margin: 0;
        }

        /* 3 Pilares Informativos Compactos */
        .rappigas-club-premios .pillars-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 22px;
        }

        .rappigas-club-premios .pillar-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 1px 4px rgba(15, 23, 42, 0.03);
        }

        .rappigas-club-premios .pillar-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          flex-shrink: 0;
        }

        .rappigas-club-premios .pillar-title {
          font-size: 13px;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 2px;
        }

        .rappigas-club-premios .pillar-desc {
          font-size: 11.5px;
          color: #64748B;
          margin: 0;
          line-height: 1.3;
        }

        /* Barra de Control: Filtros + Flechas de Navegación */
        .rappigas-club-premios .carousel-control-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 16px;
        }

        .rappigas-club-premios .filter-tabs {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .rappigas-club-premios .filter-btn {
          border: 1px solid #CBD5E1;
          background: #FFFFFF;
          color: #334155;
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .rappigas-club-premios .filter-btn:hover {
          background: #F1F5F9;
          border-color: #94A3B8;
        }

        .rappigas-club-premios .filter-btn.active {
          background: #FF5722;
          color: #FFFFFF;
          border-color: #FF5722;
          box-shadow: 0 2px 8px rgba(255, 87, 34, 0.25);
        }

        .rappigas-club-premios .nav-arrows {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rappigas-club-premios .arrow-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #CBD5E1;
          background: #FFFFFF;
          color: #0F172A;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .rappigas-club-premios .arrow-btn:hover {
          background: #FF5722;
          color: #FFFFFF;
          border-color: #FF5722;
          transform: scale(1.05);
        }

        /* Contenedor Carrusel Horizontal - 1 SOLA FILA */
        .rappigas-club-premios .carousel-track {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          gap: 16px;
          padding: 4px 2px 14px;
          margin-bottom: 24px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }

        .rappigas-club-premios .carousel-track::-webkit-scrollbar {
          display: none;
        }

        /* Tarjeta Compacta en 1 Sola Línea */
        .rappigas-club-premios .premio-card {
          flex: 0 0 270px;
          width: 270px;
          min-width: 270px;
          scroll-snap-align: start;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          position: relative;
        }

        .rappigas-club-premios .premio-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
          border-color: rgba(255, 87, 34, 0.35);
        }

        .rappigas-club-premios .image-container {
          background: #F8FAFC;
          height: 135px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px;
          position: relative;
          border-bottom: 1px solid #F1F5F9;
        }

        .rappigas-club-premios .image-container img {
          max-height: 105px;
          max-width: 100%;
          object-fit: contain;
          transition: transform 0.25s ease;
        }

        .rappigas-club-premios .premio-card:hover .image-container img {
          transform: scale(1.05);
        }

        .rappigas-club-premios .card-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          font-size: 9.5px;
          font-weight: 800;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: #FFFFFF;
          padding: 3px 8px;
          border-radius: 4px;
          z-index: 2;
        }

        .rappigas-club-premios .points-pill {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #FFFFFF;
          color: #FF5722;
          font-size: 11px;
          font-weight: 800;
          padding: 3px 8px;
          border-radius: 9999px;
          border: 1px solid #FF5722;
          box-shadow: 0 2px 5px rgba(255, 87, 34, 0.12);
          display: flex;
          align-items: center;
          gap: 3px;
          z-index: 2;
        }

        .rappigas-club-premios .card-body {
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .rappigas-club-premios .brand-tag {
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748B;
          margin-bottom: 4px;
        }

        .rappigas-club-premios .card-title {
          font-size: 13.5px;
          font-weight: 700;
          color: #0F172A;
          line-height: 1.3;
          margin-bottom: 6px;
          height: 36px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .rappigas-club-premios .card-title a {
          color: inherit;
          text-decoration: none;
        }

        .rappigas-club-premios .card-title a:hover {
          color: #FF5722;
        }

        .rappigas-club-premios .card-desc {
          font-size: 11.5px;
          color: #64748B;
          line-height: 1.35;
          margin-bottom: 10px;
          height: 32px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .rappigas-club-premios .card-price-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid #F1F5F9;
          margin-bottom: 10px;
        }

        .rappigas-club-premios .price-orig {
          font-size: 11px;
          text-decoration: line-through;
          color: #94A3B8;
        }

        .rappigas-club-premios .price-val {
          font-size: 12px;
          font-weight: 700;
          color: #10B981;
        }

        .rappigas-club-premios .btn-canje {
          background: #F1F5F9;
          color: #0F172A;
          font-weight: 700;
          font-size: 12px;
          padding: 8px 10px;
          border-radius: 6px;
          text-decoration: none;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          transition: all 0.2s ease;
          border: 1px solid #E2E8F0;
        }

        .rappigas-club-premios .btn-canje:hover {
          background: #FF5722;
          color: #FFFFFF;
          border-color: #FF5722;
        }

        /* Banner Final Compacto */
        .rappigas-club-premios .bottom-cta-banner {
          background: linear-gradient(135deg, #0B132B 0%, #172554 100%);
          border-radius: 12px;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .rappigas-club-premios .cta-content {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .rappigas-club-premios .cta-icon-box {
          width: 44px;
          height: 44px;
          background: rgba(255, 87, 34, 0.18);
          border: 1px solid rgba(255, 87, 34, 0.35);
          border-radius: 10px;
          color: #FF5722;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          flex-shrink: 0;
        }

        .rappigas-club-premios .cta-title {
          font-size: 16px;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0 0 2px;
        }

        .rappigas-club-premios .cta-desc {
          font-size: 12.5px;
          color: #94A3B8;
          margin: 0;
        }

        .rappigas-club-premios .btn-main-cat {
          background: linear-gradient(135deg, #FF5722 0%, #D84315 100%);
          color: #FFFFFF;
          font-weight: 800;
          font-size: 13.5px;
          padding: 10px 22px;
          border-radius: 8px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(216, 67, 21, 0.3);
          transition: all 0.2s ease;
        }

        .rappigas-club-premios .btn-main-cat:hover {
          transform: translateY(-2px);
          color: #FFFFFF;
        }

        /* Responsividad */
        @media (max-width: 900px) {
          .rappigas-club-premios .pillars-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .rappigas-club-premios .carousel-control-bar {
            flex-direction: column;
            align-items: flex-start;
          }
          .rappigas-club-premios .nav-arrows {
            align-self: flex-end;
          }
        }

        @media (max-width: 600px) {
          .rappigas-club-premios .premio-card {
            flex: 0 0 240px;
            width: 240px;
            min-width: 240px;
          }
          .rappigas-club-premios .bottom-cta-banner {
            flex-direction: column;
            align-items: stretch;
            padding: 16px;
          }
          .rappigas-club-premios .btn-main-cat {
            width: 100%;
            justify-content: center;
          }
        }
      ` }} />

      <div className="container">
        {/* Cabecera Principal */}
        <div className="section-header">
          <div className="eyebrow-pill">
            <i className="bi bi-gift-fill"></i> Club de Recompensas Rappipuntos
          </div>
          <h2 className="section-title">
            Acumula Puntos en Cada Balón y Canjea Premios Gratis
          </h2>
          <p className="section-subtitle">
            Por cada balón de gas con balanza digital, sumas puntos automáticos para canjear vales, balones gratis, sartenes y electrohogar sin sorteos.
          </p>
        </div>

        {/* 3 Pilares Informativos Clave */}
        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon" style={{ background: 'rgba(255, 87, 34, 0.1)', color: '#FF5722' }}>
              <i className="bi bi-fire"></i>
            </div>
            <div>
              <h4 className="pillar-title">1 Balón = +50 Puntos</h4>
              <p className="pillar-desc">Suma automática en tu cuenta con tu DNI o celular.</p>
            </div>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <div>
              <h4 className="pillar-title">Sin Sorteos: Canje Directo</h4>
              <p className="pillar-desc">Llegas a la meta de puntos y tu premio es 100% tuyo.</p>
            </div>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6' }}>
              <i className="bi bi-truck"></i>
            </div>
            <div>
              <h4 className="pillar-title">Entrega Gratis en Puerta</h4>
              <p className="pillar-desc">Te llevamos tu premio gratis junto con tu balón de gas.</p>
            </div>
          </div>
        </div>

        {/* Barra de Control: Filtros por Categoría + Flechas para Desplazar */}
        <div className="carousel-control-bar">
          <div className="filter-tabs">
            <button
              type="button"
              className={`filter-btn ${categoriaFiltro === 'TODOS' ? 'active' : ''}`}
              onClick={() => setCategoriaFiltro('TODOS')}
              suppressHydrationWarning
            >
              <i className="bi bi-stars"></i> Todos <span suppressHydrationWarning>({mounted ? premios.length : PREMIOS_INICIO_ESTATICOS.length})</span>
            </button>
            <button
              type="button"
              className={`filter-btn ${categoriaFiltro === 'GAS_VALES' ? 'active' : ''}`}
              onClick={() => setCategoriaFiltro('GAS_VALES')}
            >
              <i className="bi bi-ticket-perforated-fill"></i> Vales & Balones
            </button>
            <button
              type="button"
              className={`filter-btn ${categoriaFiltro === 'COCINA' ? 'active' : ''}`}
              onClick={() => setCategoriaFiltro('COCINA')}
            >
              <i className="bi bi-egg-fried"></i> Ollas & Sartenes
            </button>
            <button
              type="button"
              className={`filter-btn ${categoriaFiltro === 'ELECTRO' ? 'active' : ''}`}
              onClick={() => setCategoriaFiltro('ELECTRO')}
            >
              <i className="bi bi-lightning-charge-fill"></i> Electrohogar
            </button>
          </div>

          <div className="nav-arrows">
            <button
              type="button"
              className="arrow-btn"
              onClick={() => scroll('left')}
              title="Mover hacia la izquierda"
              aria-label="Mover hacia la izquierda"
            >
              <i className="bi bi-chevron-left"></i>
            </button>
            <button
              type="button"
              className="arrow-btn"
              onClick={() => scroll('right')}
              title="Mover hacia la derecha"
              aria-label="Mover hacia la derecha"
            >
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* Carrusel Horizontal de 1 SOLA LÍNEA que se mueve de derecha a izquierda */}
        <div className="carousel-track" ref={scrollContainerRef}>
          {premiosFiltrados.length === 0 ? (
            <div className="w-full py-6 text-center text-slate-400 text-sm">
              No hay premios configurados para esta categoría en la página de inicio.
            </div>
          ) : (
            premiosFiltrados.map((item) => {
              const esGas = item.categoria === 'GAS_VALES';
              const esBalon = esGas && (item.nombre.toLowerCase().includes('balón') || item.nombre.toLowerCase().includes('balon'));
              const btnTexto = esBalon ? 'Canjear Balón' : esGas ? 'Canjear Vale' : 'Ver Premio';
              const badgeTexto = item.badgeInicio || (item.destacado ? 'MÁS PEDIDO' : 'CANJE DIRECTO');
              const badgeBg = badgeTexto.includes('ESTRELLA') ? '#8B5CF6'
                : badgeTexto.includes('OSTER') ? '#EC4899'
                : badgeTexto.includes('RÁPIDO') || badgeTexto.includes('RAPIDO') ? '#10B981'
                : badgeTexto.includes('FAVORITO') ? '#06B6D4'
                : badgeTexto.includes('SEGURIDAD') ? '#10B981'
                : '#FF5722';

              return (
                <div key={item.id} className="premio-card">
                  <div className="image-container">
                    <span className="card-badge" style={{ backgroundColor: badgeBg }}>
                      {badgeTexto}
                    </span>
                    <span className="points-pill">
                      <i className="bi bi-star-fill text-warning"></i> {item.puntos.toLocaleString()} Pts
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imagen}
                      alt={item.nombre}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/products/balon-10kg-premium.png';
                      }}
                    />
                  </div>

                  <div className="card-body">
                    <div className="brand-tag">{item.marca}</div>
                    <h3 className="card-title">
                      <Link href="/premios/catalogo" title={item.nombre}>
                        {item.nombre}
                      </Link>
                    </h3>
                    <p className="card-desc" title={item.descripcion}>
                      {item.descripcion}
                    </p>

                    <div className="card-price-row">
                      <span className="price-orig">S/ {item.valorSoles.toFixed(2)}</span>
                      <span className="price-val">¡0 Soles con Puntos!</span>
                    </div>

                    <Link href="/premios/catalogo" className="btn-canje">
                      <span>{btnTexto}</span>
                      <i className="bi bi-arrow-right-short fs-6"></i>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Banner Inferior Compacto: Catálogo Completo */}
        <div className="bottom-cta-banner">
          <div className="cta-content">
            <div className="cta-icon-box">
              <i className="bi bi-gift"></i>
            </div>
            <div>
              <h4 className="cta-title">¿Listo para canjear tus premios?</h4>
              <p className="cta-desc">
                Explora más de 100 productos disponibles en el catálogo de fidelidad.
              </p>
            </div>
          </div>

          <Link href="/premios/catalogo" className="btn-main-cat">
            <i className="bi bi-grid-3x3-gap-fill"></i>
            <span>Explorar Catálogo Completo (+100 Productos)</span>
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}
