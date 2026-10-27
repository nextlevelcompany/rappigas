'use client';

import React from 'react';

// =========================================================================
// IMPORTACIÓN DE SECCIONES CON NOMBRES DESCRIPTIVOS Y COHERENTES
// =========================================================================
import HeroSliderSection from "../Components/HeroBanner/HomeHeroBanner";
import BarraGarantiasSection from "../Components/Award/HomeGarantias";
import SobreRappigasSection from "../Components/About/HomeSobreNosotros";
import AppRecompensasSection from "../Components/Cta/AppDownloadCTA";
import ComoFuncionaSection from "../Components/Choose/HomeComoFunciona";
import ClubRappipuntosSection from "../Components/Project/ClubRappipuntosPremios";
import CatalogoBalonesSection from "../Components/Pricing/HomeCatalogoPrecios";
import GuiaCrearCuentaSection from "../Components/HowTo/HowToCreateAccount";

const Home = () => {
    return (
        <main className="home-page1" id="pagina-inicio">
            {/* 1. SECCIÓN HERO: Slider Principal con Pedidos y Promociones */}
            <section id="inicio-hero" aria-label="Slider Principal RappiGas">
                <HeroSliderSection bgImg="/assets/img/bg/hero1-bg.png" />
            </section>

            {/* 2. SECCIÓN GARANTÍAS: Barra de 4 Pilares (Puntos, Premios, Balanza y Express) */}
            <section id="inicio-garantias" aria-label="Garantías y Beneficios Inmediatos">
                <BarraGarantiasSection />
            </section>

            {/* 3. SECCIÓN SOBRE RAPPIGAS: Pesaje en Balanza Digital y Razones para Elegirnos */}
            <section id="inicio-sobre-rappigas" aria-label="Sobre RappiGas y Balanza Digital">
                <SobreRappigasSection />
            </section>

            {/* 4. SECCIÓN APP & RECOMPENSAS: Descarga de la App y Club de Puntos */}
            <section id="inicio-app-recompensas" aria-label="Club de Recompensas y Descarga de App">
                <AppRecompensasSection />
            </section>

            {/* 5. SECCIÓN CÓMO FUNCIONA: Despacho Express en 3 Pasos */}
            <section id="inicio-como-funciona" aria-label="Cómo Funciona el Delivery en 3 Pasos">
                <ComoFuncionaSection />
            </section>

            {/* 6. SECCIÓN CLUB RAPPIPUNTOS: Programa de Premios y Fidelidad */}
            <section id="inicio-club-rappipuntos" aria-label="Premios del Club Rappipuntos">
                <ClubRappipuntosSection />
            </section>

            {/* 7. SECCIÓN CATÁLOGO: Balones de 10kg, Premium Click-On y Precios de Planta */}
            <section id="inicio-catalogo-balones" aria-label="Catálogo de Balones de Gas y Precios">
                <CatalogoBalonesSection />
            </section>

            {/* 8. SECCIÓN GUÍA: ¿Cómo creo mi cuenta en la RappiGas App? (Flujo de 4 Pasos) */}
            <section id="inicio-guia-crear-cuenta" aria-label="Guía para Crear Cuenta en la App">
                <GuiaCrearCuentaSection />
            </section>
        </main>
    );
};

export default Home;
