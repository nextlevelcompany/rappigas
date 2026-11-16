'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Search,
  Navigation,
  Truck,
  Phone,
  ShieldCheck,
  Scale,
  CreditCard,
  Sparkles,
  Filter,
  ArrowRight,
  Store,
  RefreshCw,
  Clock,
  CheckCircle2,
  Building2,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { empresasApi, EmpresaDetalle } from '@/librerias/api/empresas.api';
import { guardarEmpresaSeleccionada } from '@/librerias/carrito-gas';
import {
  calcularDistanciaKm,
  geocodificarUbicacionPeru,
  obtenerCoordenadasPorUbigeo,
} from '@/librerias/geo-utils';
import { ubigeoApi } from '@/librerias/api/ubigeo.api';
import type { DistribuidorNacional } from '@/components/mapa/mapa-nacional-cobertura';

// Carga dinámica de Leaflet con SSR desactivado
const MapaNacionalCobertura = dynamic(
  () =>
    import('@/components/mapa/mapa-nacional-cobertura').then(
      (mod) => mod.MapaNacionalCobertura
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[480px] bg-slate-100 rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-pulse border border-slate-200">
        <RefreshCw className="w-8 h-8 text-orange-600 animate-spin mb-3" />
        <span className="text-sm font-bold text-slate-800">
          Cargando mapa interactivo nacional de distribuidores...
        </span>
        <span className="text-xs text-slate-500 mt-1">
          Localizando plantas y distribuidoras autorizadas en todo el Perú
        </span>
      </div>
    ),
  }
);

// -----------------------------------------------------------------------------
// RED MAESTRA DE DISTRIBUIDORES A NIVEL NACIONAL (PERÚ)
// -----------------------------------------------------------------------------
const DISTRIBUIDORES_NACIONALES_BASE: DistribuidorNacional[] = [
  // LIMA METROPOLITANA Y CALLAO
  {
    publicId: 'f30db6ba-559c-438e-8586-6282c465fe37',
    nombreComercial: 'Solgas Los Olivos & Lima Norte',
    razonSocial: 'Distribuidora Solgas Norte S.A.C.',
    ruc: '20609876543',
    direccionFiscal: 'Av. Alfredo Mendiola 456, Los Olivos',
    distrito: 'Los Olivos',
    departamento: 'LIMA',
    telefono: '912 345 678',
    emailContacto: 'contacto@solgasnorte.pe',
    latitud: -11.9875,
    longitud: -77.0750,
    marca: 'Solgas',
    tiempoMin: 20,
    tiempoMax: 30,
    zonaNombre: 'Lima Norte (Los Olivos, Independencia, SMP)',
    calificacion: 4.9,
    precioDesde: 45.0,
    deliveryGratis: true,
  },
  {
    publicId: 'bbfb7316-1762-478c-b746-b3e9e8d8cd28',
    nombreComercial: 'Zeta Gas Condevilla & Palao',
    razonSocial: 'Distribuidora Zeta Gas San Martín S.A.C.',
    ruc: '20512345001',
    direccionFiscal: 'Av. Perú 2840, San Martín de Porres',
    distrito: 'San Martín de Porres',
    departamento: 'LIMA',
    telefono: '987 110 001',
    emailContacto: 'admin.smp@zetagasnorte.pe',
    latitud: -12.0125,
    longitud: -77.0675,
    marca: 'Zeta Gas',
    tiempoMin: 20,
    tiempoMax: 35,
    zonaNombre: 'San Martín de Porres, Condevilla y Límite Callao',
    calificacion: 4.8,
    precioDesde: 46.0,
    deliveryGratis: true,
  },
  {
    publicId: '6e7e9cf5-dd72-415d-a37f-e6acff3f80d7',
    nombreComercial: 'SJL Gas San Hilarión & Canto Grande',
    razonSocial: 'Gas Oriente Metropolitano S.A.C.',
    ruc: '20512345010',
    direccionFiscal: 'Av. Próceres de la Independencia 2150, San Juan de Lurigancho',
    distrito: 'San Juan de Lurigancho',
    departamento: 'LIMA',
    telefono: '987 110 010',
    emailContacto: 'admin.sjl@sanjuanagas.pe',
    latitud: -11.9750,
    longitud: -76.9875,
    marca: 'Primax Gas',
    tiempoMin: 25,
    tiempoMax: 35,
    zonaNombre: 'San Juan de Lurigancho Integral',
    calificacion: 4.9,
    precioDesde: 47.0,
    deliveryGratis: true,
  },
  {
    publicId: '12b58233-20b3-4031-a56e-6863dd113d9a',
    nombreComercial: 'Ate & Vitarte Gas Puruchuco',
    razonSocial: 'Distribuidora Ate Vitarte Gas S.A.C.',
    ruc: '20512345011',
    direccionFiscal: 'Av. Nicolás Ayllón 4200, Ate',
    distrito: 'Ate',
    departamento: 'LIMA',
    telefono: '987 110 011',
    emailContacto: 'admin.ate@ategas.pe',
    latitud: -12.0325,
    longitud: -76.9150,
    marca: 'Llamagas',
    tiempoMin: 25,
    tiempoMax: 35,
    zonaNombre: 'Ate Vitarte, Ceres y Puruchuco',
    calificacion: 4.7,
    precioDesde: 45.0,
    deliveryGratis: true,
  },
  {
    publicId: 'b152a9b9-1800-4d0d-a228-ef4336dbf413',
    nombreComercial: 'San Isidro Gas Dasso & Corpac',
    razonSocial: 'Gas Corpac San Isidro S.A.C.',
    ruc: '20512345006',
    direccionFiscal: 'Av. Camino Real 450, San Isidro',
    distrito: 'San Isidro',
    departamento: 'LIMA',
    telefono: '987 110 006',
    emailContacto: 'admin.sanisidro@sanisidrogas.pe',
    latitud: -12.0975,
    longitud: -77.0375,
    marca: 'Solgas',
    tiempoMin: 20,
    tiempoMax: 30,
    zonaNombre: 'San Isidro, Dasso y Corpac',
    calificacion: 5.0,
    precioDesde: 48.0,
    deliveryGratis: true,
  },
  {
    publicId: 'd34ab97a-37d4-4f81-9a8b-15523d452119',
    nombreComercial: 'San Borja EcoGas Torres de Limatambo',
    razonSocial: 'EcoGas Residencial San Borja S.A.C.',
    ruc: '20512345008',
    direccionFiscal: 'Av. Aviación 2850, San Borja',
    distrito: 'San Borja',
    departamento: 'LIMA',
    telefono: '987 110 008',
    emailContacto: 'admin.sanborja@sanborjagas.pe',
    latitud: -12.0950,
    longitud: -76.9975,
    marca: 'Primax Gas',
    tiempoMin: 20,
    tiempoMax: 30,
    zonaNombre: 'San Borja, San Luis y Chacarilla',
    calificacion: 4.9,
    precioDesde: 48.0,
    deliveryGratis: true,
  },
  {
    publicId: 'a5248a9f-9eba-4782-8819-8e5264438fbf',
    nombreComercial: 'Surco Gas Express Chacarilla & Monterrico',
    razonSocial: 'Distribuidora Surco Gas S.R.L.',
    ruc: '20512345007',
    direccionFiscal: 'Av. Primavera 1020, Santiago de Surco',
    distrito: 'Santiago de Surco',
    departamento: 'LIMA',
    telefono: '987 110 007',
    emailContacto: 'admin.surco@surcogas.pe',
    latitud: -12.1425,
    longitud: -76.9875,
    marca: 'Solgas',
    tiempoMin: 20,
    tiempoMax: 30,
    zonaNombre: 'Santiago de Surco, Chacarilla y Monterrico',
    calificacion: 4.9,
    precioDesde: 48.0,
    deliveryGratis: true,
  },
  {
    publicId: 'eec3ce43-8328-4eba-8dc9-0d4706100cfc',
    nombreComercial: 'Chorrillos Gas del Pacífico & Huaylas',
    razonSocial: 'Gas Pacífico Chorrillos S.A.C.',
    ruc: '20512345012',
    direccionFiscal: 'Av. Defensores del Morro 1450, Chorrillos',
    distrito: 'Chorrillos',
    departamento: 'LIMA',
    telefono: '987 110 012',
    emailContacto: 'admin.chorrillos@chorrillosgas.pe',
    latitud: -12.1800,
    longitud: -77.0125,
    marca: 'Zeta Gas',
    tiempoMin: 20,
    tiempoMax: 35,
    zonaNombre: 'Chorrillos, Huaylas y Matellini',
    calificacion: 4.8,
    precioDesde: 46.0,
    deliveryGratis: true,
  },
  {
    publicId: '352aafae-8a06-47bb-8cfd-a7a932e2a13e',
    nombreComercial: 'Villa El Salvador Gas Industrial & Hogar',
    razonSocial: 'Distribuidora Villa Gas del Sur S.R.L.',
    ruc: '20512345013',
    direccionFiscal: 'Av. El Sol Mz. K Lt. 4, Parque Industrial, Villa El Salvador',
    distrito: 'Villa El Salvador',
    departamento: 'LIMA',
    telefono: '987 110 013',
    emailContacto: 'admin.ves@villagas.pe',
    latitud: -12.2125,
    longitud: -76.9400,
    marca: 'Llamagas',
    tiempoMin: 25,
    tiempoMax: 35,
    zonaNombre: 'Villa El Salvador y Tablada de Lurín',
    calificacion: 4.7,
    precioDesde: 45.0,
    deliveryGratis: true,
  },
  {
    publicId: '6fcee903-54d3-4e3d-b753-37df40730ee4',
    nombreComercial: 'Callao Puerto Gas Express',
    razonSocial: 'Distribuidora Marina del Callao S.A.C.',
    ruc: '20512345014',
    direccionFiscal: 'Av. Sáenz Peña 780, Callao',
    distrito: 'Callao',
    departamento: 'CALLAO',
    telefono: '987 110 014',
    emailContacto: 'admin.callao@callaogas.pe',
    latitud: -12.0550,
    longitud: -77.1375,
    marca: 'Solgas',
    tiempoMin: 20,
    tiempoMax: 35,
    zonaNombre: 'Callao Cercado, Chucuito y La Punta',
    calificacion: 4.8,
    precioDesde: 46.0,
    deliveryGratis: true,
  },
  {
    publicId: '67a0db9a-ee92-4afa-88ce-9ceeb9d0b99c',
    nombreComercial: 'Bellavista & Faucett Gas',
    razonSocial: 'Bellavista Gas del Perú S.R.L.',
    ruc: '20512345015',
    direccionFiscal: 'Av. Elmer Faucett 1420, Bellavista',
    distrito: 'Bellavista',
    departamento: 'CALLAO',
    telefono: '987 110 015',
    emailContacto: 'admin.bellavista@bellavistagas.pe',
    latitud: -12.0625,
    longitud: -77.1025,
    marca: 'Primax Gas',
    tiempoMin: 20,
    tiempoMax: 30,
    zonaNombre: 'Bellavista, La Perla y Límite San Miguel',
    calificacion: 4.9,
    precioDesde: 47.0,
    deliveryGratis: true,
  },
  {
    publicId: 'eecb7655-ec93-46ff-93d7-7f47219f914c',
    nombreComercial: 'Carabayllo Gas & Llama Túpac Amaru',
    razonSocial: 'Distribuidora Carabayllo Gas S.A.C.',
    ruc: '20512345003',
    direccionFiscal: 'Av. Túpac Amaru Km 22, Carabayllo',
    distrito: 'Carabayllo',
    departamento: 'LIMA',
    telefono: '987 110 003',
    emailContacto: 'admin.carabayllo@carabayllogas.pe',
    latitud: -11.8825,
    longitud: -77.0225,
    marca: 'Zeta Gas',
    tiempoMin: 25,
    tiempoMax: 40,
    zonaNombre: 'Carabayllo, San Pedro y Lomas',
    calificacion: 4.7,
    precioDesde: 45.0,
    deliveryGratis: true,
  },

  // LA LIBERTAD (TRUJILLO)
  {
    publicId: 'f5b13a60-11e1-4002-abd8-704c9e0fdf68',
    nombreComercial: 'Trujillo Primavera Gas & Sol',
    razonSocial: 'Distribuidora Primavera Gas Trujillo S.A.C.',
    ruc: '20512345017',
    direccionFiscal: 'Av. España 1850, Trujillo',
    distrito: 'Trujillo',
    departamento: 'LA LIBERTAD',
    telefono: '944 110 017',
    emailContacto: 'admin.trujillo@trujillogas.pe',
    latitud: -8.1100,
    longitud: -79.0300,
    marca: 'Solgas',
    tiempoMin: 20,
    tiempoMax: 35,
    zonaNombre: 'Trujillo Metropolitano (Centro, Víctor Larco, California)',
    calificacion: 5.0,
    precioDesde: 46.0,
    deliveryGratis: true,
  },

  // LAMBAYEQUE (CHICLAYO)
  {
    publicId: '860f8ed2-7969-4a96-8f0f-3eae55777c84',
    nombreComercial: 'Chiclayo Capital Gas & Amistad',
    razonSocial: 'Distribuidora del Norte Chiclayo Gas S.R.L.',
    ruc: '20512345018',
    direccionFiscal: 'Av. José Balta 1120, Chiclayo',
    distrito: 'Chiclayo',
    departamento: 'LAMBAYEQUE',
    telefono: '979 110 018',
    emailContacto: 'admin.chiclayo@chiclayogas.pe',
    latitud: -6.7700,
    longitud: -79.8400,
    marca: 'Primax Gas',
    tiempoMin: 20,
    tiempoMax: 35,
    zonaNombre: 'Chiclayo, La Victoria y José Leonardo Ortiz',
    calificacion: 4.9,
    precioDesde: 45.0,
    deliveryGratis: true,
  },

  // PIURA
  {
    publicId: 'a38bf54e-63ea-44a6-9ea0-47daff7227ab',
    nombreComercial: 'Piura Centro Gas Grau & Castilla',
    razonSocial: 'Gas del Desierto Piura S.A.C.',
    ruc: '20512345019',
    direccionFiscal: 'Av. Grau 850, Piura',
    distrito: 'Piura',
    departamento: 'PIURA',
    telefono: '969 110 019',
    emailContacto: 'admin.piura@piuragas.pe',
    latitud: -5.1950,
    longitud: -80.6300,
    marca: 'Solgas',
    tiempoMin: 20,
    tiempoMax: 35,
    zonaNombre: 'Piura Centro, Castilla y Los Ejidos',
    calificacion: 4.9,
    precioDesde: 46.0,
    deliveryGratis: true,
  },

  // AREQUIPA
  {
    publicId: 'e86b0da1-8072-4b2a-89a1-778899aabbcc',
    nombreComercial: 'Arequipa Misti Gas Cayma & Yanahuara',
    razonSocial: 'Gas Misti Arequipa S.A.C.',
    ruc: '20512345021',
    direccionFiscal: 'Av. Ejército 720, Yanahuara, Arequipa',
    distrito: 'Yanahuara',
    departamento: 'AREQUIPA',
    telefono: '958 110 021',
    emailContacto: 'admin.arequipa@mistigas.pe',
    latitud: -16.3881,
    longitud: -71.5411,
    marca: 'Solgas',
    tiempoMin: 20,
    tiempoMax: 35,
    zonaNombre: 'Arequipa Metropolitana (Cayma, Yanahuara, Cercado, Paucarpata)',
    calificacion: 5.0,
    precioDesde: 47.0,
    deliveryGratis: true,
  },

  // CUSCO
  {
    publicId: 'c14252d5-0de5-4c34-9d8f-e75a02d84221',
    nombreComercial: 'Cusco Imperial Gas Wanchaq',
    razonSocial: 'Distribuidora Imperial Gas del Cusco S.A.C.',
    ruc: '20512345020',
    direccionFiscal: 'Av. de la Cultura 2400, Wanchaq',
    distrito: 'Wanchaq',
    departamento: 'CUSCO',
    telefono: '984 110 020',
    emailContacto: 'admin.cusco@cuscogas.pe',
    latitud: -13.5225,
    longitud: -71.9650,
    marca: 'Zeta Gas',
    tiempoMin: 20,
    tiempoMax: 35,
    zonaNombre: 'Valle de Cusco (Cusco Centro, Wanchaq, San Sebastián)',
    calificacion: 4.9,
    precioDesde: 48.0,
    deliveryGratis: true,
  },

  // ÁNCASH (CHIMBOTE & HUARAZ)
  {
    publicId: '9eda2ba1-dbad-4bd5-aadd-3ed6b5e84d89',
    nombreComercial: 'Chimbote & Nuevo Chimbote Bahía Gas',
    razonSocial: 'Distribuidora Bahía Gas Chimbote S.A.C.',
    ruc: '20512345023',
    direccionFiscal: 'Av. José Pardo 1600, Chimbote',
    distrito: 'Chimbote',
    departamento: 'ANCASH',
    telefono: '943 110 023',
    emailContacto: 'admin.chimbote@chimbotegas.pe',
    latitud: -9.0750,
    longitud: -78.5900,
    marca: 'Primax Gas',
    tiempoMin: 20,
    tiempoMax: 35,
    zonaNombre: 'Bahía Chimbote y Nuevo Chimbote',
    calificacion: 4.8,
    precioDesde: 46.0,
    deliveryGratis: true,
  },
  {
    publicId: '77aa11bb-22cc-33dd-44ee-55ff66001122',
    nombreComercial: 'Huaraz Cordillera Gas Andino',
    razonSocial: 'Distribuidora Huascarán Gas S.R.L.',
    ruc: '20512345024',
    direccionFiscal: 'Av. Luzuriaga 850, Huaraz',
    distrito: 'Huaraz',
    departamento: 'ANCASH',
    telefono: '943 220 024',
    emailContacto: 'admin.huaraz@huascarangas.pe',
    latitud: -9.5278,
    longitud: -77.5278,
    marca: 'Solgas',
    tiempoMin: 25,
    tiempoMax: 40,
    zonaNombre: 'Huaraz e Independencia (Callejón de Huaylas)',
    calificacion: 4.8,
    precioDesde: 48.0,
    deliveryGratis: true,
  },

  // JUNÍN (HUANCAYO)
  {
    publicId: '33bb44cc-55dd-66ee-77ff-880011223344',
    nombreComercial: 'Huancayo Valle del Mantaro Gas',
    razonSocial: 'Distribuidora Mantaro Gas del Centro S.A.C.',
    ruc: '20512345025',
    direccionFiscal: 'Av. Ferrocarril 1120, El Tambo, Huancayo',
    distrito: 'El Tambo',
    departamento: 'JUNIN',
    telefono: '964 110 025',
    emailContacto: 'admin.huancayo@mantarogas.pe',
    latitud: -12.0469,
    longitud: -75.2181,
    marca: 'Llamagas',
    tiempoMin: 20,
    tiempoMax: 35,
    zonaNombre: 'Huancayo Metropolitano (El Tambo, Chilca, Cercado)',
    calificacion: 4.9,
    precioDesde: 47.0,
    deliveryGratis: true,
  },

  // ICA (ICA & CHINCHA)
  {
    publicId: '55cc66dd-77ee-88ff-9900-112233445566',
    nombreComercial: 'Ica Sol & Viñedos Gas',
    razonSocial: 'Gas del Sur Ica S.A.C.',
    ruc: '20512345026',
    direccionFiscal: 'Av. San Martín 890, Ica',
    distrito: 'Ica',
    departamento: 'ICA',
    telefono: '956 110 026',
    emailContacto: 'admin.ica@icagas.pe',
    latitud: -14.0678,
    longitud: -75.7286,
    marca: 'Solgas',
    tiempoMin: 20,
    tiempoMax: 30,
    zonaNombre: 'Ica Cercado, Parcona y Subtanjalla',
    calificacion: 4.8,
    precioDesde: 46.0,
    deliveryGratis: true,
  },

  // TACNA
  {
    publicId: '88ee99ff-00aa-11bb-22cc-334455667788',
    nombreComercial: 'Tacna Heroica Gas Frontera',
    razonSocial: 'Distribuidora Caplina Gas S.A.C.',
    ruc: '20512345027',
    direccionFiscal: 'Av. Bolognesi 1450, Tacna',
    distrito: 'Tacna',
    departamento: 'TACNA',
    telefono: '952 110 027',
    emailContacto: 'admin.tacna@caplinagas.pe',
    latitud: -18.0066,
    longitud: -70.2463,
    marca: 'Zeta Gas',
    tiempoMin: 20,
    tiempoMax: 35,
    zonaNombre: 'Tacna, Gregorio Albarracín y Alto de la Alianza',
    calificacion: 4.9,
    precioDesde: 47.0,
    deliveryGratis: true,
  },

  // PUNO (JULIACA & PUNO)
  {
    publicId: '99ff00aa-11bb-22cc-33dd-445566778899',
    nombreComercial: 'Puno & Juliaca Lago Gas Andino',
    razonSocial: 'Distribuidora Altiplano Gas S.R.L.',
    ruc: '20512345028',
    direccionFiscal: 'Av. El Sol 650, Puno',
    distrito: 'Puno',
    departamento: 'PUNO',
    telefono: '951 110 028',
    emailContacto: 'admin.puno@altiplangas.pe',
    latitud: -15.8422,
    longitud: -70.0199,
    marca: 'Primax Gas',
    tiempoMin: 25,
    tiempoMax: 40,
    zonaNombre: 'Puno y Juliaca Altiplano',
    calificacion: 4.8,
    precioDesde: 48.0,
    deliveryGratis: true,
  },

  // SAN MARTÍN (TARAPOTO)
  {
    publicId: '11aa22bb-33cc-44dd-55ee-667788990011',
    nombreComercial: 'Tarapoto Selva Gas Palmeras',
    razonSocial: 'Amazonas Gas Tarapoto S.A.C.',
    ruc: '20512345029',
    direccionFiscal: 'Jr. Jiménez Pimentel 740, Tarapoto',
    distrito: 'Tarapoto',
    departamento: 'SAN MARTIN',
    telefono: '942 110 029',
    emailContacto: 'admin.tarapoto@selvagas.pe',
    latitud: -6.4854,
    longitud: -76.3689,
    marca: 'Solgas',
    tiempoMin: 20,
    tiempoMax: 35,
    zonaNombre: 'Tarapoto, Morales y La Banda de Shilcayo',
    calificacion: 4.9,
    precioDesde: 49.0,
    deliveryGratis: true,
  },

  // LORETO (IQUITOS)
  {
    publicId: '22bb33cc-44dd-55ee-66ff-778899001122',
    nombreComercial: 'Iquitos Río Amazonas Gas',
    razonSocial: 'Gas del Oriente Iquitos S.A.C.',
    ruc: '20512345030',
    direccionFiscal: 'Av. Próspero 920, Iquitos',
    distrito: 'Iquitos',
    departamento: 'LORETO',
    telefono: '965 110 030',
    emailContacto: 'admin.iquitos@riogas.pe',
    latitud: -3.7491,
    longitud: -73.2538,
    marca: 'Llamagas',
    tiempoMin: 25,
    tiempoMax: 40,
    zonaNombre: 'Iquitos, Punchana, Belén y San Juan Bautista',
    calificacion: 4.8,
    precioDesde: 50.0,
    deliveryGratis: true,
  },

  // UCAYALI (PUCALLPA)
  {
    publicId: '33cc44dd-55ee-66ff-77aa-889900112233',
    nombreComercial: 'Pucallpa Ucayali Gas',
    razonSocial: 'Pucallpa Distribuidora Gas S.A.C.',
    ruc: '20512345031',
    direccionFiscal: 'Av. Centenario Km 4.5, Pucallpa',
    distrito: 'Callería',
    departamento: 'UCAYALI',
    telefono: '961 110 031',
    emailContacto: 'admin.pucallpa@ucayaligas.pe',
    latitud: -8.3791,
    longitud: -74.5539,
    marca: 'Solgas',
    tiempoMin: 20,
    tiempoMax: 35,
    zonaNombre: 'Pucallpa, Callería y Yarinacocha',
    calificacion: 4.8,
    precioDesde: 49.0,
    deliveryGratis: true,
  },
];

const DEPARTAMENTOS_DEFAULT = [
  'LIMA',
  'CALLAO',
  'AREQUIPA',
  'LA LIBERTAD',
  'LAMBAYEQUE',
  'PIURA',
  'CUSCO',
  'ANCASH',
  'JUNIN',
  'ICA',
  'TACNA',
  'PUNO',
  'SAN MARTIN',
  'LORETO',
  'UCAYALI',
  'CAJAMARCA',
  'AYACUCHO',
  'TUMBES',
  'AMAZONAS',
  'APURIMAC',
  'HUANUCO',
  'HUANCAVELICA',
  'MOQUEGUA',
  'PASCO',
  'MADRE DE DIOS',
];

const MARCAS_LISTA = ['Todas', 'Solgas', 'Zeta Gas', 'Primax Gas', 'Llamagas'];

export default function CoberturaContent() {
  const router = useRouter();

  // Estados de datos
  const [distribuidores, setDistribuidores] = useState<DistribuidorNacional[]>(
    DISTRIBUIDORES_NACIONALES_BASE
  );
  const [cargandoApi, setCargandoApi] = useState(false);

  // Filtros de Ubigeo Cascada (Departamento, Provincia, Distrito)
  const [departamentos, setDepartamentos] = useState<string[]>(DEPARTAMENTOS_DEFAULT);
  const [deptoSeleccionado, setDeptoSeleccionado] = useState<string>('TODOS');
  const [provincias, setProvincias] = useState<string[]>([]);
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string>('TODAS');
  const [distritos, setDistritos] = useState<string[]>([]);
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<string>('TODOS');
  const [cargandoUbigeo, setCargandoUbigeo] = useState<boolean>(false);

  // Filtros adicionales
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('Todas');
  const [soloDeliveryGratis, setSoloDeliveryGratis] = useState(false);

  // Interacción mapa
  const [distribuidorActivo, setDistribuidorActivo] = useState<DistribuidorNacional | null>(null);
  const [ubicacionBuscada, setUbicacionBuscada] = useState<{
    lat: number;
    lng: number;
    etiqueta?: string;
    zoom?: number;
  } | null>(null);
  const [buscandoGps, setBuscandoGps] = useState(false);
  const [buscandoDireccion, setBuscandoDireccion] = useState(false);

  // Cargar departamentos desde API al inicio
  useEffect(() => {
    async function cargarDepartamentos() {
      try {
        const lista = await ubigeoApi.listarDepartamentos();
        if (Array.isArray(lista) && lista.length > 0) {
          setDepartamentos(lista);
        }
      } catch (err) {
        console.warn('Usando lista departamental de respaldo:', err);
      }
    }
    cargarDepartamentos();
  }, []);

  // Efecto cascada: cargar provincias al cambiar departamento
  useEffect(() => {
    async function cargarProvincias() {
      if (deptoSeleccionado === 'TODOS') {
        setProvincias([]);
        setProvinciaSeleccionada('TODAS');
        setDistritos([]);
        setDistritoSeleccionado('TODOS');
        setUbicacionBuscada(null);
        return;
      }

      const coords = obtenerCoordenadasPorUbigeo(undefined, deptoSeleccionado);
      setUbicacionBuscada({
        lat: coords.lat,
        lng: coords.lng,
        etiqueta: `Región ${deptoSeleccionado}`,
        zoom: deptoSeleccionado === 'CALLAO' ? 12 : 8,
      });

      setCargandoUbigeo(true);
      try {
        const lista = await ubigeoApi.listarProvincias(deptoSeleccionado);
        if (Array.isArray(lista) && lista.length > 0) {
          setProvincias(lista);
        } else {
          setProvincias([deptoSeleccionado]);
        }
      } catch {
        if (deptoSeleccionado === 'LIMA') {
          setProvincias(['LIMA', 'BARRANCA', 'CANETE', 'HUARAL', 'HUAURA']);
        } else {
          setProvincias([deptoSeleccionado]);
        }
      } finally {
        setProvinciaSeleccionada('TODAS');
        setDistritos([]);
        setDistritoSeleccionado('TODOS');
        setCargandoUbigeo(false);
      }
    }
    cargarProvincias();
  }, [deptoSeleccionado]);

  // Efecto cascada: cargar distritos al cambiar provincia
  useEffect(() => {
    async function cargarDistritos() {
      if (provinciaSeleccionada === 'TODAS' || deptoSeleccionado === 'TODOS') {
        setDistritos([]);
        setDistritoSeleccionado('TODOS');
        return;
      }

      const coords = obtenerCoordenadasPorUbigeo(undefined, deptoSeleccionado, undefined, provinciaSeleccionada);
      setUbicacionBuscada({
        lat: coords.lat,
        lng: coords.lng,
        etiqueta: `Prov. ${provinciaSeleccionada}, ${deptoSeleccionado}`,
        zoom: 11,
      });

      setCargandoUbigeo(true);
      try {
        const items = await ubigeoApi.listarDistritos(deptoSeleccionado, provinciaSeleccionada);
        if (Array.isArray(items) && items.length > 0) {
          setDistritos(items.map((i) => i.distrito));
        } else {
          setDistritos([provinciaSeleccionada]);
        }
      } catch {
        if (provinciaSeleccionada === 'LIMA') {
          setDistritos([
            'LOS OLIVOS',
            'SAN MARTIN DE PORRES',
            'INDEPENDENCIA',
            'COMAS',
            'MIRAFLORES',
            'SAN ISIDRO',
            'SANTIAGO DE SURCO',
            'SAN JUAN DE LURIGANCHO',
            'ATE',
            'CHORRILLOS',
            'VILLA EL SALVADOR',
            'CALLAO',
            'BELLAVISTA',
          ]);
        } else {
          setDistritos([provinciaSeleccionada]);
        }
      } finally {
        setDistritoSeleccionado('TODOS');
        setCargandoUbigeo(false);
      }
    }
    cargarDistritos();
  }, [deptoSeleccionado, provinciaSeleccionada]);

  // Centrar en distrito al cambiar distrito
  useEffect(() => {
    if (distritoSeleccionado === 'TODOS' || deptoSeleccionado === 'TODOS') return;

    const coords = obtenerCoordenadasPorUbigeo(
      undefined,
      deptoSeleccionado,
      distritoSeleccionado,
      provinciaSeleccionada !== 'TODAS' ? provinciaSeleccionada : undefined
    );

    setUbicacionBuscada({
      lat: coords.lat,
      lng: coords.lng,
      etiqueta: `${distritoSeleccionado}, ${provinciaSeleccionada}`,
      zoom: 14,
    });

    let masCercano: DistribuidorNacional | null = null;
    let distMin = Infinity;
    distribuidores.forEach((d) => {
      const distKm = calcularDistanciaKm(coords.lat, coords.lng, d.latitud, d.longitud);
      if (distKm < distMin) {
        distMin = distKm;
        masCercano = d;
      }
    });
    if (masCercano && distMin < 30) {
      setDistribuidorActivo(masCercano);
    }
  }, [distritoSeleccionado, deptoSeleccionado, provinciaSeleccionada, distribuidores]);

  // 1. Cargar distribuidores reales desde backend y consolidar
  useEffect(() => {
    async function cargarDistribuidoresReales() {
      setCargandoApi(true);
      try {
        const empresasReales = await empresasApi.listarEmpresasPublicas();
        if (Array.isArray(empresasReales) && empresasReales.length > 0) {
          // Convertir a formato DistribuidorNacional
          const adaptados: DistribuidorNacional[] = empresasReales
            .filter((e) => e.estado === 'APROBADA' || !e.estado)
            .map((e) => {
              // Estimar departamento y distrito
              const texto = `${e.direccionFiscal || ''} ${e.nombreComercial || ''} ${e.zonaNombre || ''}`.toUpperCase();
              let dep = 'LIMA';
              if (texto.includes('CALLAO') || texto.includes('BELLAVISTA')) dep = 'CALLAO';
              else if (texto.includes('AREQUIPA')) dep = 'AREQUIPA';
              else if (texto.includes('TRUJILLO') || texto.includes('LIBERTAD')) dep = 'LA LIBERTAD';
              else if (texto.includes('CHICLAYO') || texto.includes('LAMBAYEQUE')) dep = 'LAMBAYEQUE';
              else if (texto.includes('PIURA')) dep = 'PIURA';
              else if (texto.includes('CUSCO')) dep = 'CUSCO';
              else if (texto.includes('CHIMBOTE') || texto.includes('ANCASH') || texto.includes('HUARAZ')) dep = 'ANCASH';
              else if (texto.includes('HUANCAYO') || texto.includes('JUNIN')) dep = 'JUNIN';
              else if (texto.includes('ICA')) dep = 'ICA';

              // Extraer o inferir marca
              let marca = 'RappiGas Red';
              if (texto.includes('SOLGAS')) marca = 'Solgas';
              else if (texto.includes('ZETA')) marca = 'Zeta Gas';
              else if (texto.includes('PRIMAX')) marca = 'Primax Gas';
              else if (texto.includes('LLAMA')) marca = 'Llamagas';

              // Coordenadas
              let lat = typeof e.latitud === 'number' && e.latitud !== 0 ? e.latitud : -12.0464;
              let lng = typeof e.longitud === 'number' && e.longitud !== 0 ? e.longitud : -77.0428;

              return {
                publicId: e.publicId,
                nombreComercial: e.nombreComercial || e.razonSocial || 'Distribuidora Autorizada',
                razonSocial: e.razonSocial,
                ruc: e.ruc,
                direccionFiscal: e.direccionFiscal || 'Dirección verificada Osinergmin',
                distrito: e.zonaNombre || 'Cobertura Local',
                departamento: dep,
                telefono: e.telefono || '912 345 678',
                emailContacto: e.emailContacto,
                latitud: lat,
                longitud: lng,
                marca,
                tiempoMin: 20,
                tiempoMax: 35,
                zonaNombre: e.zonaNombre || 'Cobertura Directa',
                calificacion: 4.9,
                precioDesde: 45.0,
                deliveryGratis: true,
              };
            });

          // Unir evitando duplicados por publicId
          const mapIds = new Set(adaptados.map((a) => a.publicId));
          const faltantes = DISTRIBUIDORES_NACIONALES_BASE.filter((b) => !mapIds.has(b.publicId));
          setDistribuidores([...adaptados, ...faltantes]);
        }
      } catch (err) {
        console.warn('Usando catálogo nacional offline de distribuidores:', err);
      } finally {
        setCargandoApi(false);
      }
    }
    cargarDistribuidoresReales();
  }, []);

  // 2. Filtrado dinámico
  const distribuidoresFiltrados = useMemo(() => {
    return distribuidores.filter((d) => {
      // Filtro Departamento / Región
      if (deptoSeleccionado !== 'TODOS') {
        const depD = (d.departamento || '').toUpperCase();
        const depSel = deptoSeleccionado.toUpperCase();
        if (depD !== depSel && !depD.includes(depSel)) {
          return false;
        }
      }

      // Filtro Provincia
      if (provinciaSeleccionada !== 'TODAS') {
        const provSel = provinciaSeleccionada.toUpperCase();
        const textoLugar = `${d.distrito} ${d.direccionFiscal} ${d.zonaNombre} ${d.nombreComercial}`.toUpperCase();
        const coincideLugar = textoLugar.includes(provSel);
        const esProvinciaCapital = provSel === (d.departamento || '').toUpperCase();
        if (!coincideLugar && !esProvinciaCapital) {
          return false;
        }
      }

      // Filtro Distrito
      if (distritoSeleccionado !== 'TODOS') {
        const distSel = distritoSeleccionado.toUpperCase();
        const textoLugar = `${d.distrito} ${d.direccionFiscal} ${d.zonaNombre} ${d.nombreComercial}`.toUpperCase();
        if (!textoLugar.includes(distSel)) {
          return false;
        }
      }

      // Filtro Marca
      if (marcaSeleccionada !== 'Todas') {
        const marcaTxt = `${d.marca || ''} ${d.nombreComercial}`.toLowerCase();
        if (!marcaTxt.includes(marcaSeleccionada.toLowerCase())) {
          return false;
        }
      }

      // Filtro Delivery Gratis
      if (soloDeliveryGratis && !d.deliveryGratis) {
        return false;
      }

      // Filtro Texto
      if (busquedaTexto.trim()) {
        const query = busquedaTexto.toLowerCase();
        const textoCompleto = `${d.nombreComercial} ${d.distrito} ${d.departamento} ${d.direccionFiscal} ${d.ruc} ${d.marca}`.toLowerCase();
        return textoCompleto.includes(query);
      }

      return true;
    });
  }, [
    distribuidores,
    deptoSeleccionado,
    provinciaSeleccionada,
    distritoSeleccionado,
    marcaSeleccionada,
    soloDeliveryGratis,
    busquedaTexto,
  ]);

  // Manejo de Selección de Distribuidor
  const handleSeleccionarDistribuidor = (dist: DistribuidorNacional) => {
    setDistribuidorActivo(dist);
  };

  // Pedir Gas con el Distribuidor Seleccionado
  const handlePedirGas = (dist: DistribuidorNacional) => {
    const empresaAdaptada: EmpresaDetalle = {
      id: 1,
      publicId: dist.publicId,
      nombreComercial: dist.nombreComercial,
      razonSocial: dist.razonSocial || dist.nombreComercial,
      ruc: dist.ruc,
      direccionFiscal: dist.direccionFiscal,
      telefono: dist.telefono,
      emailContacto: dist.emailContacto || '',
      latitud: dist.latitud,
      longitud: dist.longitud,
      estado: 'APROBADA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tieneCoberturaDirecta: true,
      zonaNombre: dist.zonaNombre,
      tiempoMin: dist.tiempoMin || 20,
      tiempoMax: dist.tiempoMax || 30,
    };

    guardarEmpresaSeleccionada(empresaAdaptada);
    router.push(`/productos?distribuidor=${encodeURIComponent(dist.publicId)}`);
  };

  // Geocodificar texto ingresado en el buscador
  const handleBuscarEnMapa = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = busquedaTexto.trim();
    if (!query) return;

    setBuscandoDireccion(true);
    try {
      const geo = await geocodificarUbicacionPeru(query);
      if (geo) {
        setUbicacionBuscada({
          lat: geo.lat,
          lng: geo.lng,
          etiqueta: geo.nombre ? geo.nombre.substring(0, 30) + '...' : query,
        });

        // Seleccionar automáticamente el distribuidor más cercano
        let masCercano: DistribuidorNacional | null = null;
        let distMin = Infinity;
        distribuidores.forEach((d) => {
          const distKm = calcularDistanciaKm(geo.lat, geo.lng, d.latitud, d.longitud);
          if (distKm < distMin) {
            distMin = distKm;
            masCercano = d;
          }
        });

        if (masCercano) {
          setDistribuidorActivo(masCercano);
        }
      }
    } finally {
      setBuscandoDireccion(false);
    }
  };

  // Ubicación por GPS
  const handleMiGps = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    setBuscandoGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setUbicacionBuscada({
          lat,
          lng,
          etiqueta: 'Tu ubicación GPS actual',
        });

        // Encontrar más cercano
        let masCercano: DistribuidorNacional | null = null;
        let distMin = Infinity;
        distribuidores.forEach((d) => {
          const distKm = calcularDistanciaKm(lat, lng, d.latitud, d.longitud);
          if (distKm < distMin) {
            distMin = distKm;
            masCercano = d;
          }
        });

        if (masCercano) {
          setDistribuidorActivo(masCercano);
        }
        setBuscandoGps(false);
      },
      (err) => {
        console.warn('Error al obtener GPS:', err);
        setBuscandoGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Resetear filtros
  const handleLimpiarFiltros = () => {
    setBusquedaTexto('');
    setDeptoSeleccionado('TODOS');
    setProvinciaSeleccionada('TODAS');
    setDistritoSeleccionado('TODOS');
    setProvincias([]);
    setDistritos([]);
    setMarcaSeleccionada('Todas');
    setSoloDeliveryGratis(false);
    setDistribuidorActivo(null);
    setUbicacionBuscada(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-[85px] md:pt-[105px] pb-16 space-y-4 font-sans bg-slate-50 min-h-screen">
      {/* --------------------------------------------------------------------- */}
      {/* 1. RIBBON COMPACTO CORPORATIVO (ESTILO CATÁLOGO RAPPI GAS)           */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white rounded-2xl p-3 sm:p-4 shadow-md flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
            <Flame className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-black tracking-tight leading-none text-white">
                RappiGas • Mapa Nacional de Distribuidores Autorizados
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-white border border-white/30">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                Red Osinergmin SCOP
              </span>
            </div>
            <p className="text-[11px] text-orange-100 hidden sm:block mt-1">
              {distribuidores.length} distribuidores y plantas en todo el Perú • Pesaje en balanza digital • Despacho express en 20-35 min
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <div className="flex items-center gap-1.5 bg-black/20 border border-white/20 px-3 py-1.5 rounded-xl text-white text-[11px]">
            <Store className="w-3.5 h-3.5 text-amber-300" />
            <span><strong>{distribuidores.length}</strong> Distribuidores</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/15 border border-white/20 px-3 py-1.5 rounded-xl text-white text-[11px] hidden sm:flex">
            <span role="img" aria-label="Perú">🇵🇪</span>
            <span>25 Departamentos</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-300 to-yellow-300 text-amber-950 px-3 py-1.5 rounded-xl shadow-xs border border-white/80 font-black text-[11px]">
            <Scale className="w-3.5 h-3.5 text-amber-900" />
            <span>Balanza Digital</span>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. BARRA DE BÚSQUEDA Y FILTROS INTELIGENTES                           */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-3 sm:p-4 space-y-3">
        {/* Fila 1: Input de Búsqueda + Botones de Ubicación GPS */}
        <form onSubmit={handleBuscarEnMapa} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busquedaTexto}
              onChange={(e) => setBusquedaTexto(e.target.value)}
              placeholder="Buscar por distrito, ciudad, dirección o nombre de distribuidor (ej. Los Olivos, Arequipa, Solgas)..."
              className="w-full pl-10 pr-20 py-2.5 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition shadow-inner"
            />
            <button
              type="submit"
              disabled={buscandoDireccion}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
            >
              {buscandoDireccion ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              <span>Buscar</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleMiGps}
              disabled={buscandoGps}
              className="px-3.5 py-2.5 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Detectar mi ubicación actual y encontrar distribuidores cercanos"
            >
              <Navigation className={`w-3.5 h-3.5 text-orange-600 ${buscandoGps ? 'animate-spin' : ''}`} />
              <span>{buscandoGps ? 'Localizando...' : '📍 Mi GPS'}</span>
            </button>

            {(busquedaTexto || deptoSeleccionado !== 'TODOS' || marcaSeleccionada !== 'Todas') && (
              <button
                type="button"
                onClick={handleLimpiarFiltros}
                className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition cursor-pointer"
                title="Restablecer todos los filtros"
              >
                Limpiar
              </button>
            )}
          </div>
        </form>

        {/* Fila 2: Selectores Cascada de Ubigeo (Región, Provincia, Distrito) y Marca */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              <span>Filtrar por Ubicación (Departamento, Provincia, Distrito):</span>
            </span>
            {cargandoUbigeo && (
              <span className="text-[10px] text-orange-600 flex items-center gap-1 font-bold animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Actualizando cobertura...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
            {/* 1. Departamento / Región */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                1. Región / Depto:
              </label>
              <select
                value={deptoSeleccionado}
                onChange={(e) => setDeptoSeleccionado(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-[11px] focus:ring-1 focus:ring-orange-500 hover:border-orange-400 cursor-pointer shadow-2xs"
              >
                <option value="TODOS">🇵🇪 Todo el Perú (Nacional)</option>
                {departamentos.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Provincia */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                2. Provincia:
              </label>
              <select
                value={provinciaSeleccionada}
                onChange={(e) => setProvinciaSeleccionada(e.target.value)}
                disabled={deptoSeleccionado === 'TODOS' || provincias.length === 0}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-[11px] focus:ring-1 focus:ring-orange-500 hover:border-orange-400 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer shadow-2xs"
              >
                <option value="TODAS">
                  {deptoSeleccionado === 'TODOS' ? 'Selecciona Región primero' : 'Todas las Provincias'}
                </option>
                {provincias.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Distrito */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                3. Distrito:
              </label>
              <select
                value={distritoSeleccionado}
                onChange={(e) => setDistritoSeleccionado(e.target.value)}
                disabled={provinciaSeleccionada === 'TODAS' || distritos.length === 0}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-[11px] focus:ring-1 focus:ring-orange-500 hover:border-orange-400 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer shadow-2xs"
              >
                <option value="TODOS">
                  {provinciaSeleccionada === 'TODAS' ? 'Selecciona Provincia primero' : 'Todos los Distritos'}
                </option>
                {distritos.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Marca de Gas */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                4. Marca de Balón:
              </label>
              <select
                value={marcaSeleccionada}
                onChange={(e) => setMarcaSeleccionada(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-[11px] focus:ring-1 focus:ring-orange-500 hover:border-orange-400 cursor-pointer shadow-2xs"
              >
                {MARCAS_LISTA.map((m) => (
                  <option key={m} value={m}>
                    {m === 'Todas' ? 'Todas las Marcas' : m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Resumen del Filtro Activo y Contador de Resultados */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <span>Filtro activo:</span>
              <span className="text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md">
                {distritoSeleccionado !== 'TODOS'
                  ? `${distritoSeleccionado}, ${provinciaSeleccionada} (${deptoSeleccionado})`
                  : provinciaSeleccionada !== 'TODAS'
                  ? `${provinciaSeleccionada} (${deptoSeleccionado})`
                  : deptoSeleccionado !== 'TODOS'
                  ? `Región ${deptoSeleccionado}`
                  : 'Nacional (Todo el Perú)'}
              </span>
              {marcaSeleccionada !== 'Todas' && (
                <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {marcaSeleccionada}
                </span>
              )}
            </div>

            <div className="font-bold text-slate-600">
              Mostrando <strong className="text-orange-600">{distribuidoresFiltrados.length}</strong> distribuidores
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 3. LAYOUT PRINCIPAL: MAPA INTERACTIVO (7 COLS) + DIRECTORIO (5 COLS)  */}
      {/* --------------------------------------------------------------------- */}
      <div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* COLUMNA IZQUIERDA: CONTENEDOR DEL MAPA NACIONAL (7 COLS) */}
          <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-md p-2.5 space-y-2 sticky top-[80px]">
            <div className="flex items-center justify-between px-2 pt-1 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="font-black text-slate-900">
                  Mapa Interactivo en Tiempo Real
                </span>
                <span className="text-slate-400 text-[10px] hidden sm:inline">
                  (Haz clic en cualquier pin o marcador para ver detalles y pedir)
                </span>
              </div>

              {distribuidorActivo && (
                <button
                  type="button"
                  onClick={() => setDistribuidorActivo(null)}
                  className="text-[11px] font-bold text-orange-600 hover:underline cursor-pointer"
                >
                  Deseleccionar
                </button>
              )}
            </div>

            {/* Marco del Mapa */}
            <div className="w-full h-[450px] sm:h-[540px] lg:h-[620px] rounded-xl overflow-hidden border border-slate-200 relative">
              <MapaNacionalCobertura
                distribuidores={distribuidoresFiltrados}
                distribuidorSeleccionadoId={distribuidorActivo?.publicId}
                onSeleccionarDistribuidor={handleSeleccionarDistribuidor}
                onPedirGas={handlePedirGas}
                ubicacionBuscada={ubicacionBuscada}
              />
            </div>

            {/* Leyenda de Marcas al pie del Mapa */}
            <div className="px-2 py-1.5 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-slate-600">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-slate-400 text-[10px] uppercase tracking-wider">Leyenda:</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" /> Solgas
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" /> Zeta Gas
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]" /> Primax Gas
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" /> Llamagas
                </span>
              </div>

              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                ✓ Verificado por Osinergmin SCOP
              </span>
            </div>
          </div>

          {/* COLUMNA DERECHA: DIRECTORIO DE DISTRIBUIDORAS (5 COLS) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-3">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-orange-600" />
                  <span>Plantas & Distribuidores</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  {distribuidoresFiltrados.length} disponibles para despacho inmediato
                </p>
              </div>

              <span className="text-xs font-black text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-xl">
                {deptoSeleccionado === 'TODOS' ? 'Nacional' : deptoSeleccionado}
              </span>
            </div>

            {/* Lista Scrollable de Tarjetas */}
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {distribuidoresFiltrados.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
                  <Store className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="font-black text-sm text-slate-800">
                    No se encontraron distribuidores con esos filtros
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Intenta buscando con otra palabra o selecciona "🇵🇪 Todo el Perú" para ver toda la red.
                  </p>
                  <button
                    type="button"
                    onClick={handleLimpiarFiltros}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Ver Todo el Perú
                  </button>
                </div>
              ) : (
                distribuidoresFiltrados.map((dist) => {
                  const esActivo = distribuidorActivo?.publicId === dist.publicId;

                  return (
                    <div
                      key={dist.publicId}
                      onClick={() => handleSeleccionarDistribuidor(dist)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer bg-white relative space-y-2.5 ${
                        esActivo
                          ? 'border-orange-500 ring-2 ring-orange-400/50 shadow-md bg-orange-50/20'
                          : 'border-slate-200/90 hover:border-orange-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Cabecera de la Tarjeta */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.2 rounded-full bg-slate-900 text-white">
                              {dist.marca || 'Gas'}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              Osinergmin SCOP
                            </span>
                          </div>
                          <h3 className="font-black text-xs sm:text-sm text-slate-900 leading-snug truncate" title={dist.nombreComercial}>
                            {dist.nombreComercial}
                          </h3>
                          <p className="text-[10px] text-slate-500 font-mono">
                            RUC: {dist.ruc} • {dist.distrito}, {dist.departamento}
                          </p>
                        </div>

                        <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-xl border border-orange-200 shrink-0 font-mono">
                          Desde S/ {dist.precioDesde?.toFixed(2) || '45.00'}
                        </span>
                      </div>

                      {/* Dirección y Métricas */}
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 space-y-1">
                        <div className="flex items-center gap-1 truncate" title={dist.direccionFiscal}>
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{dist.direccionFiscal}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold pt-0.5 border-t border-slate-200/60">
                          <span className="text-emerald-700 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Llegada: {dist.tiempoMin || 20}-{dist.tiempoMax || 35} min
                          </span>
                          <span className="text-orange-700">
                            ✓ Balanza digital en puerta
                          </span>
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePedirGas(dist);
                          }}
                          className="flex-1 py-2 px-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-black shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Pedir a esta Planta</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>

                        <a
                          href={`tel:${dist.telefono.replace(/\s+/g, '')}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl transition flex items-center justify-center"
                          title={`Llamar a ${dist.nombreComercial}`}
                        >
                          <Phone className="w-4 h-4 text-emerald-600" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 4. SECCIÓN DE CONFIANZA & SEGURIDAD DE LA RED RAPPI GAS               */}
      {/* --------------------------------------------------------------------- */}
      <section className="mt-10 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-6">
          <span className="text-xs font-black text-orange-600 uppercase tracking-wider bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
            Garantía Nacional RappiGas
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ¿Por qué comprar a través de nuestra red de distribuidores?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Auditamos rigurosamente a cada distribuidor para garantizar peso exacto, seguridad y rapidez en cada entrega.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-black text-sm text-slate-900">Balanza Digital en Puerta</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Exige el pesaje frente a ti. Comprobamos los 10kg o 15kg netos de gas antes de que pagues un solo sol.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-black text-sm text-slate-900">Certificación Osinergmin SCOP</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              100% cilindros oficiales de marcas reconocidas con precinto termosellado antifuga inviolable.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 text-sky-600" />
            </div>
            <h3 className="font-black text-sm text-slate-900">Despacho Local en 20 a 35 Min</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              El pedido es asignado a la distribuidora más cercana a tu GPS para asegurar la llegada más rápida.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-black text-sm text-slate-900">Pago Contra Entrega Seguro</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Paga al recibir: Yape, Plin, tarjeta con POS inalámbrico o efectivo exacto con boleta o factura legal.
            </p>
          </div>
        </div>

        {/* Banner para Afiliar Nuevas Distribuidoras */}
        <div className="mt-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-700 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-orange-400 font-extrabold text-xs uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              <span>Para Plantas y Distribuidoras de Gas</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              ¿Tienes una distribuidora autorizada de GLP en Perú?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Únete a la plataforma tecnológica RappiGas. Recibe pedidos geolocalizados de clientes en tu distrito y optimiza tu flota de repartidores.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/afiliar-distribuidora"
              className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <span>Afiliar mi Empresa a la Red</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
