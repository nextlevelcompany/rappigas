'use client';

import { create } from 'zustand';

export interface ProductoConfig {
  id: string;
  nombre: string;
  tipo: string;
  precio: number;
  puntos: number;
  descripcion: string;
  activo: boolean;
  badge: string;
}

export interface DatosPlataforma {
  // Empresa & Fiscalización
  nombreComercial: string;
  razonSocial: string;
  ruc: string;
  codigoScop: string;
  direccionFiscal: string;
  departamento: string;
  provincia: string;
  distrito: string;

  // Contacto & Delivery
  telefonoCentral: string;
  telefonoWhatsapp: string;
  mensajeWhatsapp: string;
  correoContacto: string;
  correoFacturacion: string;
  horarioDespacho: string;
  tiempoEntregaMin: number;
  tiempoEntregaMax: number;
  costoDeliveryTexto: string;

  // Métricas y Estadísticas Públicas
  anosExperiencia: string;
  plantasEnRed: string;
  departamentosCobertura: string;
  porcentajeSatisfaccion: string;
  garantiaPesajeTexto: string;

  // Catálogo de Productos y Precios Oficiales
  productos: ProductoConfig[];

  // Redes Sociales y Enlaces
  enlaceFacebook: string;
  enlaceInstagram: string;
  enlaceTiktok: string;
  enlaceOsinergmin: string;

  // Metadatos
  ultimaActualizacion?: string;
}

export const DATOS_PLATAFORMA_DEFAULT: DatosPlataforma = {
  nombreComercial: 'RappiGas Perú',
  razonSocial: 'RappiGas Perú S.A.C.',
  ruc: '20609876543',
  codigoScop: 'SCOP-GLP-88921',
  direccionFiscal: 'Av. Alfredo Mendiola 3698, Los Olivos, Lima',
  departamento: 'LIMA',
  provincia: 'LIMA',
  distrito: 'LOS OLIVOS',

  telefonoCentral: '977 665 554',
  telefonoWhatsapp: '+51 977 665 554',
  mensajeWhatsapp: 'Hola RappiGas, deseo pedir un balón de gas con balanza digital a domicilio',
  correoContacto: 'contacto@rappigas.pe',
  correoFacturacion: 'facturacion@rappigas.pe',
  horarioDespacho: 'Lunes a Domingo de 6:00 a.m. a 11:00 p.m.',
  tiempoEntregaMin: 25,
  tiempoEntregaMax: 35,
  costoDeliveryTexto: '100% Gratis a Domicilio',

  anosExperiencia: '+10 Años',
  plantasEnRed: '38 Plantas',
  departamentosCobertura: '25 Regiones',
  porcentajeSatisfaccion: '99.8%',
  garantiaPesajeTexto: 'Pesaje Verificado en Balanza Digital',

  productos: [
    {
      id: 'balon-10kg-rosca',
      nombre: 'Balón 10kg Rosca Tradicional',
      tipo: 'DOMESTICO_ROSCA',
      precio: 45.0,
      puntos: 15,
      descripcion: 'Gas de cocina 10kg con válvula de rosca estándar universal. Pesaje verificado con balanza digital.',
      activo: true,
      badge: 'Económico Tradicional',
    },
    {
      id: 'balon-10kg-clickon',
      nombre: 'Balón 10kg Premium (Click-On)',
      tipo: 'DOMESTICO_PREMIUM',
      precio: 48.0,
      puntos: 20,
      descripcion: 'Gas de cocina 10kg con válvula Premium de acople rápido Click-On. Máxima seguridad antifuga.',
      activo: true,
      badge: 'El Más Pedido',
    },
    {
      id: 'balon-15kg-comercial',
      nombre: 'Balón Comercial 15kg Gas de Cocina',
      tipo: 'COMERCIAL',
      precio: 72.0,
      puntos: 30,
      descripcion: 'Alto rendimiento para pollerías, chifas, panaderías, restaurantes y hogares de alta demanda.',
      activo: true,
      badge: 'Ideal Negocios',
    },
    {
      id: 'balon-45kg-industrial',
      nombre: 'Balón Industrial 45kg GLP',
      tipo: 'INDUSTRIAL',
      precio: 210.0,
      puntos: 70,
      descripcion: 'Cilindro de 45kg para baterías comerciales e industriales con despacho técnico prioritario.',
      activo: true,
      badge: 'Gran Demanda',
    },
  ],

  enlaceFacebook: 'https://facebook.com/rappigas.pe',
  enlaceInstagram: 'https://instagram.com/rappigas.pe',
  enlaceTiktok: 'https://tiktok.com/@rappigas.pe',
  enlaceOsinergmin: 'https://www.osinergmin.gob.pe',
  ultimaActualizacion: '2026-11-15T00:00:00.000Z',
};

interface DatosPlataformaState {
  datos: DatosPlataforma;
  cargado: boolean;
  actualizarDatos: (nuevosDatos: Partial<DatosPlataforma>) => void;
  actualizarProducto: (id: string, datosProducto: Partial<ProductoConfig>) => void;
  restablecerValores: () => void;
  cargarDesdeStorage: () => void;
}

const STORAGE_KEY = 'rappigas_datos_plataforma';

export const useDatosPlataformaStore = create<DatosPlataformaState>((set, get) => ({
  datos: DATOS_PLATAFORMA_DEFAULT,
  cargado: false,

  actualizarDatos: (nuevosDatos) => {
    const estadoActualizado: DatosPlataforma = {
      ...get().datos,
      ...nuevosDatos,
      ultimaActualizacion: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoActualizado));
      } catch (e) {
        console.error('Error guardando datos de plataforma en storage:', e);
      }
    }

    set({ datos: estadoActualizado });
  },

  actualizarProducto: (id, datosProducto) => {
    const productosActualizados = get().datos.productos.map((prod) =>
      prod.id === id ? { ...prod, ...datosProducto } : prod
    );

    get().actualizarDatos({ productos: productosActualizados });
  },

  restablecerValores: () => {
    const defaults = { ...DATOS_PLATAFORMA_DEFAULT, ultimaActualizacion: new Date().toISOString() };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      } catch (e) {
        console.error('Error restableciendo datos de plataforma:', e);
      }
    }
    set({ datos: defaults });
  },

  cargarDesdeStorage: () => {
    if (typeof window === 'undefined') return;

    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      if (guardado) {
        const parseado = JSON.parse(guardado);
        set({ datos: { ...DATOS_PLATAFORMA_DEFAULT, ...parseado }, cargado: true });
        return;
      }
    } catch (e) {
      console.error('Error cargando datos de plataforma desde storage:', e);
    }

    set({ datos: DATOS_PLATAFORMA_DEFAULT, cargado: true });
  },
}));
