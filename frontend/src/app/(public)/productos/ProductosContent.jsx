'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Flame,
  MapPin,
  Truck,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Search,
  Map as MapIcon,
  Sparkles,
  Check,
  Scale,
  Award,
  Info,
  SlidersHorizontal,
  RefreshCw,
  Store,
  User,
  LogIn,
  UserPlus,
  Gift,
  Navigation,
} from 'lucide-react';
import { ubigeoApi } from '@/librerias/api/ubigeo.api';
import { empresasApi, EmpresaDetalle } from '@/librerias/api/empresas.api';
import {
  UBIGEO_COORDENADAS_PERU,
  obtenerCoordenadasPorUbigeo,
  geocodificarUbicacionPeru,
  geocodificarInversaPeru,
  calcularDistanciaKm,
  obtenerCoordenadasDistribuidora,
} from '@/librerias/geo-utils';
import { useAuthStore } from '@/store/auth-store';
import {
  sincronizarCarritoGasDesdeTienda,
  guardarEmpresaSeleccionada,
  obtenerEmpresaSeleccionada,
  guardarDireccionGas,
} from '@/librerias/carrito-gas';

// Import dinámico de Leaflet con SSR desactivado
const MapaCoberturaDistribuidores = dynamic(
  () =>
    import('@/components/mapa/mapa-cobertura-distribuidores').then(
      (mod) => mod.MapaCoberturaDistribuidores
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[280px] rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 animate-pulse border border-slate-200">
        <MapPin className="w-6 h-6 text-orange-500 animate-bounce mb-1" />
        <span className="text-xs font-semibold text-slate-700">
          Cargando mapa interactivo de distribuidores...
        </span>
      </div>
    ),
  }
);

// Fallback estático de departamentos principales para carga instantánea
const DEPARTAMENTOS_DEFAULT = [
  'LIMA',
  'CALLAO',
  'AREQUIPA',
  'LA LIBERTAD',
  'CUSCO',
  'PIURA',
  'LAMBAYEQUE',
  'JUNIN',
  'ANCASH',
  'ICA',
  'TACNA',
  'PUNO',
  'SAN MARTIN',
  'LORETO',
  'CAJAMARCA',
];

// Fallback de provincias para Lima
const PROVINCIAS_LIMA_DEFAULT = ['LIMA', 'BARRANCA', 'CANETE', 'HUARAL', 'HUAURA'];

// Fallback de distritos para Lima Metropolitana
const DISTRITOS_LIMA_DEFAULT = [
  'LOS OLIVOS',
  'SAN MARTIN DE PORRES',
  'INDEPENDENCIA',
  'COMAS',
  'MIRAFLORES',
  'SAN ISIDRO',
  'SANTIAGO DE SURCO',
  'SAN BORJA',
  'ATE',
  'SAN JUAN DE LURIGANCHO',
  'SAN MIGUEL',
  'PUEBLO LIBRE',
  'MAGDALENA DEL MAR',
  'SURQUILLO',
  'CHORRILLOS',
  'LIMA (CERCADO)',
];

// Catálogo enriquecido de cilindros y accesorios de gas (con UUIDs compatibles con backend)
const PRODUCTOS_CATALOGO = [
  {
    id: 1,
    tenantId: 2,
    publicId: '56cabcdf-d1c4-401e-ae21-0a53be0bf8ed',
    sku: 'BALON-10KG-PREM',
    nombre: 'Balón de Gas 10kg Válvula Premium Click-On',
    descripcion: 'Tara: 10.2 kg • Gas Neto: 10.0 kg • Acople rápido hermético antifugas Osinergmin con precinto intacto.',
    tipoGas: 'GLP_10KG',
    tipoValvula: 'PREMIUM',
    marca: 'Solgas / RappiGas',
    precio: 48.0,
    puntos: 50,
    destacado: true,
    tag: 'El Más Pedido ⭐',
    norma: 'NTP 350.011',
    garantia: 'Pesaje Digital en Puerta',
    tiempoEstimado: '20-30 min',
    imagenUrl: '/products/balon-10kg-premium.png',
    estado: 'ACTIVO',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    especificaciones: {
      capacidad: '10 Kilogramos netos de GLP',
      taraPromedio: '10.2 kg',
      valvula: 'Click-On de 20 mm antifugas',
      certificacion: 'Osinergmin & NTP 350.011',
      seguridad: 'Termosello termoencogible original de planta',
      ideal: 'Cocinas modernas, departamentos y familias de 3 a 5 personas',
    },
  },
  {
    id: 2,
    tenantId: 2,
    publicId: 'a53ccf40-32a5-40f6-8043-591eca1ed26a',
    sku: 'BALON-10KG-ROSC',
    nombre: 'Balón de Gas 10kg Válvula Rosca Estándar',
    descripcion: 'Tara: 10.5 kg • Gas Neto: 10.0 kg • Rosca universal 7/8" de bronce tradicional compatible con reguladores clásicos.',
    tipoGas: 'GLP_10KG',
    tipoValvula: 'ROSCA',
    marca: 'Primax Gas',
    precio: 45.0,
    puntos: 45,
    destacado: false,
    tag: 'Económico Tradicional',
    norma: 'NTP 350.011',
    garantia: 'Pesaje Digital en Puerta',
    tiempoEstimado: '20-30 min',
    imagenUrl: '/products/balon-10kg-rosca.png',
    estado: 'ACTIVO',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    especificaciones: {
      capacidad: '10 Kilogramos netos de GLP',
      taraPromedio: '10.5 kg',
      valvula: 'Rosca tradicional 7/8" POL',
      certificacion: 'Osinergmin & NTP 350.011',
      seguridad: 'Precinto numerado de planta de envasado',
      ideal: 'Hogares peruanos con regulador de rosca tradicional',
    },
  },
  {
    id: 3,
    tenantId: 2,
    publicId: '8bd1cd6c-633e-4429-99ae-561546f886db',
    sku: 'BALON-15KG-PREM',
    nombre: 'Balón Comercial 15kg Gas Alta Demanda',
    descripcion: 'Para pollerías, chifas, panaderías, restaurantes y cafeterías. Presión constante, llama azul de alto poder y boleta/factura.',
    tipoGas: 'GLP_15KG',
    tipoValvula: 'ROSCA',
    marca: 'Zeta Gas',
    precio: 72.0,
    puntos: 75,
    destacado: true,
    tag: 'Ideal Negocios 👨‍🍳',
    norma: 'NTP 350.011',
    garantia: 'Facturación Inmediata',
    tiempoEstimado: '25-35 min',
    imagenUrl: '/products/balon-15kg-premium.png',
    estado: 'ACTIVO',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    especificaciones: {
      capacidad: '15 Kilogramos netos de GLP',
      taraPromedio: '14.8 kg',
      valvula: 'Rosca reforzada de alto flujo',
      certificacion: 'Osinergmin comercial',
      seguridad: 'Doble válvula de alivio para uso continuo',
      ideal: 'Restaurantes, hornos industriales, chifas y cafeterías',
    },
  },
  {
    id: 4,
    tenantId: 2,
    publicId: 'cdf027f4-3a26-4317-a115-4c99fcf944c7',
    sku: 'BALON-45KG-IND',
    nombre: 'Cilindro Industrial 45kg GLP Edificios',
    descripcion: 'Abastecimiento continuo para edificios multifamiliares, calderas, secadoras industriales, granjas y montacargas.',
    tipoGas: 'GLP_45KG',
    tipoValvula: 'ROSCA',
    marca: 'Llama Gas',
    precio: 205.0,
    puntos: 200,
    destacado: false,
    tag: 'Industrial / Edificios 🏭',
    norma: 'NTP 350.011',
    garantia: 'Transporte Especializado',
    tiempoEstimado: '30-45 min',
    imagenUrl: '/products/balon-45kg-industrial.png',
    estado: 'ACTIVO',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    especificaciones: {
      capacidad: '45 Kilogramos netos de GLP',
      taraPromedio: '42.0 kg',
      valvula: 'Rosca industrial 3/4" NPT con regulador de caudal',
      certificacion: 'Osinergmin industrial clase 1',
      seguridad: 'Cilindro reforzado de alta presión con prueba hidrostática',
      ideal: 'Edificios, condominios, panaderías industriales y calderos',
    },
  },
  {
    id: 5,
    tenantId: 2,
    publicId: 'a60134f4-f3b6-41cc-bf09-830531fdb520',
    sku: 'VALV-REG-PREM-005',
    nombre: 'Regulador Premium Click-On con Manómetro',
    descripcion: 'Medidor de aguja de nivel de gas restante y corte automático ante fugas o manguera cortada. Conexión en 1 clic.',
    tipoGas: 'VALVULA_ACCESORIO',
    tipoValvula: 'PREMIUM',
    marca: 'RappiGas Certificado',
    precio: 38.0,
    puntos: 40,
    destacado: true,
    tag: 'Seguridad Certificada 🛡️',
    norma: 'NTP 350.011',
    garantia: 'Garantía 2 Años',
    tiempoEstimado: 'Inmediato con tu balón',
    imagenUrl: '/products/regulador-manometro.svg',
    estado: 'ACTIVO',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    especificaciones: {
      capacidad: 'Regulador de presión doméstica 28-30 mbar',
      taraPromedio: '450 g',
      valvula: 'Acople rápido Click-On 20mm con sistema antifugas',
      certificacion: 'Osinergmin & CE',
      seguridad: 'Manómetro indicador de presión y corte instantáneo de emergencia',
      ideal: 'Cualquier cocina residencial con balón Premium Click-On',
    },
  },
  {
    id: 6,
    tenantId: 2,
    publicId: 'b28f72a9-7c19-482a-a92c-5b23d9b4b011',
    sku: 'VALV-KIT-INSTAL-006',
    nombre: 'Kit de Seguridad: Manguera Reforzada + Abrazaderas',
    descripcion: 'Manguera de gas GLP de alta presión con malla interna trenzada de seguridad y 2 abrazaderas inoxidables de ajuste fácil.',
    tipoGas: 'VALVULA_ACCESORIO',
    tipoValvula: 'UNIVERSAL',
    marca: 'RappiGas Pro',
    precio: 22.0,
    puntos: 25,
    destacado: false,
    tag: 'Prevención Antifugas',
    norma: 'NTP 350.011',
    garantia: '100% Incombustible',
    tiempoEstimado: 'Inmediato con tu balón',
    imagenUrl: '/products/regulador-manometro.svg',
    estado: 'ACTIVO',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    especificaciones: {
      capacidad: '1.5 metros de manguera GLP certificada',
      taraPromedio: '300 g',
      valvula: 'Universal para rosca o click-on',
      certificacion: 'NTP 350.011 / Osinergmin',
      seguridad: 'Malla textil interna resistente a cortes e inflamación',
      ideal: 'Reemplazo obligatorio preventivo cada 2 años en hogares',
    },
  },
  {
    id: 7,
    tenantId: 2,
    publicId: 'e713600f-8c35-4309-8472-3c81e813f420',
    sku: 'BALON-10KG-SOLGAS',
    nombre: 'Balón de Gas 10kg Solgas Azul Clásico',
    descripcion: 'Tara: 10.3 kg • Gas Neto: 10.0 kg • Balón azul tradicional con sello de garantía termoencogible original de planta.',
    tipoGas: 'GLP_10KG',
    tipoValvula: 'UNIVERSAL',
    marca: 'Solgas Perú',
    precio: 47.0,
    puntos: 48,
    destacado: true,
    tag: 'Oferta Especial 🔥',
    norma: 'NTP 350.011',
    garantia: 'Pesaje Digital en Puerta',
    tiempoEstimado: '20-30 min',
    imagenUrl: '/products/balon-10kg-solgas.png',
    estado: 'ACTIVO',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    especificaciones: {
      capacidad: '10 Kilogramos netos de GLP',
      taraPromedio: '10.3 kg',
      valvula: 'Universal Click-On / Rosca',
      certificacion: 'Osinergmin & NTP 350.011',
      seguridad: 'Precinto termosellado original de planta',
      ideal: 'Hogares que prefieren la marca tradicional Solgas',
    },
  },
];

export default function ProductosContent() {
  const router = useRouter();

  // ---------------------------------------------------------------------------
  // SESIÓN DE CLIENTE (AUTH STORE)
  // ---------------------------------------------------------------------------
  const { usuario, estaAutenticado, cargarSesionDesdeStorage } = useAuthStore();

  useEffect(() => {
    cargarSesionDesdeStorage();
  }, [cargarSesionDesdeStorage]);

  // Medir dinámicamente la altura exacta del header para situar el catálogo a 5px de separación
  const [headerPadding, setHeaderPadding] = useState<number | null>(null);

  useEffect(() => {
    const calculateHeaderHeight = () => {
      const header = document.querySelector('.cs_site_header') as HTMLElement | null;
      if (!header) return;

      const topHeader = header.querySelector('.cs_top_header') as HTMLElement | null;
      const mainHeader = header.querySelector('.cs_main_header') as HTMLElement | null;

      let totalHeight = 0;
      if (topHeader && window.getComputedStyle(topHeader).display !== 'none') {
        totalHeight += topHeader.offsetHeight;
      }
      if (mainHeader) {
        totalHeight += mainHeader.offsetHeight;
      }

      if (totalHeight > 0) {
        setHeaderPadding(totalHeight + 5);
      }
    };

    calculateHeaderHeight();
    const timer = setTimeout(calculateHeaderHeight, 150);
    window.addEventListener('resize', calculateHeaderHeight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateHeaderHeight);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // 1. ESTADO DE UBIGEO CASCADA (PERÚ -> DEPARTAMENTO -> PROVINCIA -> DISTRITO)
  // ---------------------------------------------------------------------------
  const [departamentos, setDepartamentos] = useState<string[]>(DEPARTAMENTOS_DEFAULT);
  const [provincias, setProvincias] = useState<string[]>(PROVINCIAS_LIMA_DEFAULT);
  const [distritos, setDistritos] = useState<string[]>(DISTRITOS_LIMA_DEFAULT);

  const [deptoSeleccionado, setDeptoSeleccionado] = useState<string>('LIMA');
  const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string>('LIMA');
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<string>('LOS OLIVOS');
  const [direccionExacta, setDireccionExacta] = useState<string>('Av. Antúnez de Mayolo 1234');

  const [busquedaTexto, setBusquedaTexto] = useState<string>('');
  const [cargandoUbigeo, setCargandoUbigeo] = useState<boolean>(false);
  const [obteniendoGps, setObteniendoGps] = useState<boolean>(false);
  const [buscandoDireccion, setBuscandoDireccion] = useState<boolean>(false);

  // Coordenadas actuales del mapa
  const [latitud, setLatitud] = useState<number>(-11.9912);
  const [longitud, setLongitud] = useState<number>(-77.0711);

  // ---------------------------------------------------------------------------
  // 2. ESTADOS DE FILTRO, VISTA Y DISTRIBUIDOR SELECCIONADO
  // ---------------------------------------------------------------------------
  const [filtroTipoGas, setFiltroTipoGas] = useState<string>('TODOS');
  const [filtroMarca, setFiltroMarca] = useState<string>('TODAS');
  const [vistaPrincipal, setVistaPrincipal] = useState<'catalogo' | 'mapa'>('catalogo');
  const [productoFichaModal, setProductoFichaModal] = useState<typeof PRODUCTOS_CATALOGO[0] | null>(null);

  // Estado del distribuidor que vende actualmente
  const [distribuidoraSeleccionada, setDistribuidoraSeleccionada] = useState<any>(null);
  const [empresasReales, setEmpresasReales] = useState<EmpresaDetalle[]>([]);

  // ---------------------------------------------------------------------------
  // 3. ESTADOS DE CARRITO Y COMPRA
  // ---------------------------------------------------------------------------
  const [carrito, setCarrito] = useState<{ [id: string]: number }>({
    '56cabcdf-d1c4-401e-ae21-0a53be0bf8ed': 1,
  });
  const [metodoPago, setMetodoPago] = useState<'YAPE' | 'PLIN' | 'EFECTIVO' | 'TARJETA'>('YAPE');
  const [codigoCupon, setCodigoCupon] = useState<string>('');
  const [cuponAplicado, setCuponAplicado] = useState<string | null>(null);
  const [descuentoCupon, setDescuentoCupon] = useState<number>(0);

  // Modal checkout express híbrido
  const [modalCheckoutAbierto, setModalCheckoutAbierto] = useState<boolean>(false);
  const [nombreCliente, setNombreCliente] = useState<string>('');
  const [telefonoCliente, setTelefonoCliente] = useState<string>('');
  const [pedidoExitoso, setPedidoExitoso] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // CARGA DE UBIGEO DESDE LA API DEL BACKEND
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function cargarDepartamentos() {
      try {
        const lista = await ubigeoApi.listarDepartamentos();
        if (Array.isArray(lista) && lista.length > 0) {
          setDepartamentos(lista);
        }
      } catch (err) {
        // Fallback activo silencioso
      }
    }
    cargarDepartamentos();
  }, []);

  useEffect(() => {
    async function cargarEmpresas() {
      try {
        const emps = await empresasApi.listarEmpresasPublicas();
        if (Array.isArray(emps) && emps.length > 0) {
          setEmpresasReales(emps);
        }
      } catch {
        // Fallback activo silencioso
      }
    }
    cargarEmpresas();
  }, []);

  useEffect(() => {
    async function cargarProvincias() {
      if (!deptoSeleccionado) return;
      // Centrar de inmediato en el departamento seleccionado
      const coordsDepto = obtenerCoordenadasPorUbigeo(undefined, deptoSeleccionado);
      setLatitud(coordsDepto.lat);
      setLongitud(coordsDepto.lng);

      setCargandoUbigeo(true);
      try {
        const lista = await ubigeoApi.listarProvincias(deptoSeleccionado);
        if (Array.isArray(lista) && lista.length > 0) {
          setProvincias(lista);
          setProvinciaSeleccionada(lista[0]);
        } else {
          setProvincias([deptoSeleccionado]);
          setProvinciaSeleccionada(deptoSeleccionado);
        }
      } catch (err) {
        if (deptoSeleccionado === 'LIMA') {
          setProvincias(PROVINCIAS_LIMA_DEFAULT);
          setProvinciaSeleccionada('LIMA');
        } else {
          setProvincias([deptoSeleccionado]);
          setProvinciaSeleccionada(deptoSeleccionado);
        }
      } finally {
        setCargandoUbigeo(false);
      }
    }
    cargarProvincias();
  }, [deptoSeleccionado]);

  useEffect(() => {
    async function cargarDistritos() {
      if (!deptoSeleccionado || !provinciaSeleccionada) return;
      setCargandoUbigeo(true);
      try {
        const items = await ubigeoApi.listarDistritos(deptoSeleccionado, provinciaSeleccionada);
        if (Array.isArray(items) && items.length > 0) {
          const nombres = items.map((i) => i.distrito);
          setDistritos(nombres);
          setDistritoSeleccionado(nombres[0] || 'CERCADO');
        } else {
          setDistritos([provinciaSeleccionada]);
          setDistritoSeleccionado(provinciaSeleccionada);
        }
      } catch (err) {
        if (provinciaSeleccionada === 'LIMA') {
          setDistritos(DISTRITOS_LIMA_DEFAULT);
          setDistritoSeleccionado('LOS OLIVOS');
        } else {
          setDistritos([provinciaSeleccionada]);
          setDistritoSeleccionado(provinciaSeleccionada);
        }
      } finally {
        setCargandoUbigeo(false);
      }
    }
    cargarDistritos();
  }, [deptoSeleccionado, provinciaSeleccionada]);

  // Actualizar coordenadas estimadas cuando cambia el ubigeo (departamento, provincia, distrito)
  useEffect(() => {
    if (!deptoSeleccionado && !provinciaSeleccionada && !distritoSeleccionado) return;

    // 1. Coordenadas sincrónicas locales inmediatas para respuesta sin demora
    const coords = obtenerCoordenadasPorUbigeo(
      undefined,
      deptoSeleccionado,
      distritoSeleccionado,
      provinciaSeleccionada
    );
    setLatitud(coords.lat);
    setLongitud(coords.lng);

    // 2. Geocodificación precisa en segundo plano vía Nominatim de OpenStreetMap
    let cancelado = false;
    const query = `${distritoSeleccionado || ''}, ${provinciaSeleccionada || ''}, ${deptoSeleccionado || ''}, Peru`.replace(/^,\s*/, '');
    geocodificarUbicacionPeru(query).then((res) => {
      if (!cancelado && res) {
        setLatitud(res.lat);
        setLongitud(res.lng);
      }
    });

    return () => {
      cancelado = true;
    };
  }, [distritoSeleccionado, provinciaSeleccionada, deptoSeleccionado]);

  // Manejador para usar GPS del navegador
  const handleUsarGps = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización GPS.');
      return;
    }
    setObteniendoGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const nLat = Number(pos.coords.latitude.toFixed(6));
        const nLng = Number(pos.coords.longitude.toFixed(6));
        setLatitud(nLat);
        setLongitud(nLng);

        try {
          const info = await geocodificarInversaPeru(nLat, nLng);
          if (info) {
            if (info.direccion) {
              setDireccionExacta(info.direccion);
            }
            if (info.departamento) {
              const depMatch = departamentos.find(
                (d) => d.toLowerCase() === info.departamento?.toLowerCase()
              );
              if (depMatch) setDeptoSeleccionado(depMatch);
            }
          }
        } catch (e) {
          console.warn('Error en reverse geocoding GPS:', e);
        } finally {
          setObteniendoGps(false);
        }
      },
      (err) => {
        console.warn('Error de GPS:', err);
        alert('No se pudo obtener la ubicación GPS actual. Puedes ingresar tu dirección manualmente o mover el pin en el mapa.');
        setObteniendoGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Manejador para buscar dirección escrita por el usuario
  const handleBuscarDireccion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!direccionExacta.trim()) return;

    setBuscandoDireccion(true);
    try {
      const queryCompleto = `${direccionExacta}, ${distritoSeleccionado}, ${provinciaSeleccionada}, Peru`;
      const res = (await geocodificarUbicacionPeru(queryCompleto)) || (await geocodificarUbicacionPeru(`${direccionExacta}, Peru`));
      if (res) {
        setLatitud(res.lat);
        setLongitud(res.lng);
      } else {
        alert('No pudimos localizar la dirección exacta en el mapa. Revisa el texto o ajusta el marcador directamente en el mapa.');
      }
    } catch (err) {
      console.warn('Error al buscar dirección:', err);
    } finally {
      setBuscandoDireccion(false);
    }
  };

  // Manejador cuando el usuario mueve el marcador en el mapa
  const handleCambiarUbicacionMapa = async (lat: number, lng: number) => {
    setLatitud(lat);
    setLongitud(lng);

    try {
      const info = await geocodificarInversaPeru(lat, lng);
      if (info && info.direccion) {
        setDireccionExacta(info.direccion);
      }
    } catch {
      // Silencioso
    }
  };

  // ---------------------------------------------------------------------------
  // DISTRIBUIDORAS EN RED PARA LA ZONA SELECCIONADA
  // ---------------------------------------------------------------------------
  const DISTRIBUIDORAS_FALLBACK: EmpresaDetalle[] = useMemo(() => [
    {
      id: 1,
      publicId: 'f30db6ba-559c-438e-8586-6282c465fe37',
      nombreComercial: `Solgas Express ${distritoSeleccionado}`,
      ruc: '20609876543',
      direccionFiscal: `Av. Principal 450, ${distritoSeleccionado}`,
      telefono: '912 345 678',
      emailContacto: 'contacto@solgasnorte.pe',
      latitud: latitud + 0.007,
      longitud: longitud - 0.005,
      estado: 'APROBADA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tieneCoberturaDirecta: true,
      zonaNombre: `Cobertura Directa ${distritoSeleccionado}`,
    },
    {
      id: 2,
      publicId: 'bbfb7316-1762-478c-b746-b3e9e8d8cd28',
      nombreComercial: `Zeta Gas Express ${distritoSeleccionado}`,
      ruc: '20512345001',
      direccionFiscal: `Av. Central 890, ${distritoSeleccionado}`,
      telefono: '987 110 001',
      emailContacto: 'admin.smp@zetagasnorte.pe',
      latitud: latitud - 0.008,
      longitud: longitud + 0.006,
      estado: 'APROBADA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tieneCoberturaDirecta: true,
      zonaNombre: `Zona ${distritoSeleccionado} y alrededores`,
    },
    {
      id: 3,
      publicId: '6e7e9cf5-dd72-415d-a37f-e6acff3f80d7',
      nombreComercial: `Primax Gas Express ${distritoSeleccionado}`,
      ruc: '20512345010',
      direccionFiscal: `Av. Los Próceres 2150, ${distritoSeleccionado}`,
      telefono: '987 110 010',
      emailContacto: 'admin.sjl@sanjuanagas.pe',
      latitud: latitud + 0.012,
      longitud: longitud + 0.009,
      estado: 'APROBADA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tieneCoberturaDirecta: true,
      zonaNombre: `Planta Autorizada ${distritoSeleccionado}`,
    },
    {
      id: 4,
      publicId: '12b58233-20b3-4031-a56e-6863dd113d9a',
      nombreComercial: `Llama Gas Oficial ${distritoSeleccionado}`,
      ruc: '20512345011',
      direccionFiscal: `Av. Nicolás Ayllón 4200, ${distritoSeleccionado}`,
      telefono: '987 110 011',
      emailContacto: 'admin.ate@ategas.pe',
      latitud: latitud + 0.004,
      longitud: longitud + 0.008,
      estado: 'APROBADA',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tieneCoberturaDirecta: true,
      zonaNombre: `Distribuidor Oficial ${distritoSeleccionado}`,
    },
  ], [distritoSeleccionado, latitud, longitud]);

  const distribuidorasMapa = useMemo(() => {
    const fuente = empresasReales.length > 0 ? empresasReales : DISTRIBUIDORAS_FALLBACK;
    return fuente.map((emp, idx) => {
      const coords = emp.latitud && emp.longitud
        ? { lat: emp.latitud, lng: emp.longitud }
        : obtenerCoordenadasDistribuidora(emp, latitud, longitud, idx, fuente.length);
      const distKm = calcularDistanciaKm(latitud, longitud, coords.lat, coords.lng);
      const tiempoMin = Math.max(15, Math.round(distKm * 6 + 12));
      const tiempoMax = Math.max(25, Math.round(distKm * 6 + 22));
      return {
        ...emp,
        latitud: coords.lat,
        longitud: coords.lng,
        distanciaKm: distKm,
        tiempoMin,
        tiempoMax,
        tieneCoberturaDirecta: distKm <= 10.0,
        zonaNombre: emp.zonaNombre || `Distribuidor Oficial ${distritoSeleccionado}`,
      };
    }).sort((a, b) => (a.distanciaKm || 0) - (b.distanciaKm || 0));
  }, [empresasReales, DISTRIBUIDORAS_FALLBACK, latitud, longitud, distritoSeleccionado]);

  // Restaurar distribuidora elegida desde Cobertura o Tienda
  useEffect(() => {
    const guardada = obtenerEmpresaSeleccionada();
    if (guardada) {
      setDistribuidoraSeleccionada(guardada);
      if (typeof guardada.latitud === 'number' && guardada.latitud !== 0) {
        setLatitud(guardada.latitud);
      }
      if (typeof guardada.longitud === 'number' && guardada.longitud !== 0) {
        setLongitud(guardada.longitud);
      }
    }
  }, []);

  // Sincronizar distribuidor seleccionado por defecto si cambia la lista
  useEffect(() => {
    if (distribuidorasMapa.length > 0) {
      const existe = distribuidorasMapa.find(
        (d) => d.publicId === distribuidoraSeleccionada?.publicId
      );
      if (!existe && !distribuidoraSeleccionada) {
        setDistribuidoraSeleccionada(distribuidorasMapa[0]);
      }
    }
  }, [distribuidorasMapa, distribuidoraSeleccionada]);

  // ---------------------------------------------------------------------------
  // FILTRADO DINÁMICO DE PRODUCTOS
  // ---------------------------------------------------------------------------
  const productosFiltrados = useMemo(() => {
    return PRODUCTOS_CATALOGO.filter((prod) => {
      const cumpleTipo =
        filtroTipoGas === 'TODOS' || prod.tipoGas === filtroTipoGas;
      const cumpleMarca =
        filtroMarca === 'TODAS' || prod.marca.toLowerCase().includes(filtroMarca.toLowerCase());
      const cumpleBusqueda =
        !busquedaTexto ||
        prod.nombre.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
        prod.descripcion.toLowerCase().includes(busquedaTexto.toLowerCase()) ||
        prod.sku.toLowerCase().includes(busquedaTexto.toLowerCase());

      return cumpleTipo && cumpleMarca && cumpleBusqueda;
    });
  }, [filtroTipoGas, filtroMarca, busquedaTexto]);

  // ---------------------------------------------------------------------------
  // MANEJO DE CARRITO
  // ---------------------------------------------------------------------------
  const modificarCantidad = (id: string, delta: number) => {
    setCarrito((prev) => {
      const actual = prev[id] || 0;
      const nuevo = actual + delta;
      if (nuevo <= 0) {
        const copia = { ...prev };
        delete copia[id];
        return copia;
      }
      return { ...prev, [id]: nuevo };
    });
  };

  const subtotal = useMemo(() => {
    return Object.entries(carrito).reduce((sum, [id, cant]) => {
      const prod = PRODUCTOS_CATALOGO.find((p) => p.publicId === id);
      return sum + (prod ? prod.precio * cant : 0);
    }, 0);
  }, [carrito]);

  const puntosTotales = useMemo(() => {
    return Object.entries(carrito).reduce((sum, [id, cant]) => {
      const prod = PRODUCTOS_CATALOGO.find((p) => p.publicId === id);
      return sum + (prod ? prod.puntos * cant : 0);
    }, 0);
  }, [carrito]);

  const totalFinal = Math.max(0, subtotal - descuentoCupon);
  const totalItems = Object.values(carrito).reduce((a, b) => a + b, 0);

  // ---------------------------------------------------------------------------
  // FLUJO HÍBRIDO INTELIGENTE:
  // Si está logueado -> Sincroniza y va directo al Carrito (/cliente/checkout)
  // Si no está logueado -> Abre Modal Express Híbrido (Pide con Celular y guarda Puntos)
  // ---------------------------------------------------------------------------
  const handleProcederCheckout = () => {
    if (totalItems === 0) return;

    // Sincronizar hacia el almacenamiento global de RappiGas
    sincronizarCarritoGasDesdeTienda(
      carrito,
      PRODUCTOS_CATALOGO as any,
      distribuidoraSeleccionada
    );
    guardarEmpresaSeleccionada(distribuidoraSeleccionada);
    guardarDireccionGas({
      direccionExacta,
      distrito: distritoSeleccionado,
      ciudad: provinciaSeleccionada,
      departamento: deptoSeleccionado,
      referencia: `Referencia en ${distritoSeleccionado}`,
      telefono: telefonoCliente || (usuario?.email || ''),
      notas: '',
      latitud,
      longitud,
    });

    if (estaAutenticado && usuario?.rol === 'CLIENTE') {
      // CLIENTE LOGUEADO: Va directamente a la página interna de Checkout / Carrito
      router.push('/cliente/checkout');
    } else {
      // INVITADO / SIN LOGIN: Abre modal híbrido express para no perder la venta
      setModalCheckoutAbierto(true);
    }
  };

  const handleIrALogin = () => {
    sincronizarCarritoGasDesdeTienda(
      carrito,
      PRODUCTOS_CATALOGO as any,
      distribuidoraSeleccionada
    );
    guardarEmpresaSeleccionada(distribuidoraSeleccionada);
    router.push('/auth/login?redirect=/cliente/checkout');
  };

  const handleAplicarCupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (codigoCupon.trim().toUpperCase() === 'GASPRIMERO') {
      setCuponAplicado('GASPRIMERO');
      setDescuentoCupon(5.0);
    } else {
      alert('Cupón no válido. Prueba con: GASPRIMERO (S/ 5.00 de descuento de bienvenida).');
    }
  };

  const handleConfirmarPedido = (e: React.FormEvent) => {
    e.preventDefault();
    setPedidoExitoso(true);
    setTimeout(() => {
      setModalCheckoutAbierto(false);
      setPedidoExitoso(false);
      setCarrito({});
    }, 4500);
  };

  return (
    <div
      className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-[85px] md:pt-[117px] pb-10 space-y-4 font-sans"
      style={headerPadding ? { paddingTop: `${headerPadding}px` } : undefined}
    >
      {/* --------------------------------------------------------------------- */}
      {/* 1. RIBBON SUPERIOR CORPORATIVO                                        */}
      {/* --------------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white rounded-2xl p-3 sm:p-4 shadow-md flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
            <Flame className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-black tracking-tight leading-none text-white">
                RappiGas • Catálogo Oficial de Productos de Gas
              </h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs text-white border border-white/30">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                Certificación NTP 350.011
              </span>
            </div>
            <p className="text-[11px] text-orange-100 hidden sm:block mt-1">
              Despacho express a domicilio • Balanza digital en puerta • Precinto de seguridad Osinergmin intacto
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          {/* Estado de Sesión del Cliente */}
          {estaAutenticado && usuario ? (
            <div className="flex items-center gap-1.5 bg-black/20 border border-white/20 px-3 py-1.5 rounded-xl text-white text-[11px] font-bold">
              <User className="w-3.5 h-3.5 text-amber-300" />
              <span className="truncate max-w-[120px] sm:max-w-[160px]">
                {usuario.nombres}
              </span>
              <span className="text-[9px] bg-emerald-500/80 text-white px-1.5 py-0.2 rounded font-extrabold">
                Conectado
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleIrALogin}
                className="flex items-center gap-1 bg-white/15 hover:bg-white/25 border border-white/30 px-2.5 py-1.5 rounded-xl text-white text-[11px] font-bold transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-200" />
                <span>Iniciar Sesión</span>
              </button>
              <Link
                href="/auth/login?modo=registro"
                className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5 text-orange-700" />
                <span>Crear Cuenta</span>
              </Link>
            </div>
          )}

          {/* Badge de Puntos Ganables */}
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300 text-amber-950 px-3 py-1.5 rounded-xl shadow-sm border border-white/80 font-black shrink-0">
            <Sparkles className="w-4 h-4 text-amber-900 fill-amber-900 animate-pulse shrink-0" />
            <div className="flex items-center gap-1 leading-none">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-900">
                Ganas:
              </span>
              <span className="text-xs font-black text-amber-950 bg-white/90 px-1.5 py-0.5 rounded shadow-2xs font-mono">
                +50 PTS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. BÚSQUEDA POR UBICACIÓN EN PERÚ (COMPACTO)                          */}
      {/* --------------------------------------------------------------------- */}
      <div className="relative z-10 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-2.5 sm:p-3 space-y-2">
        {/* Fila 1: Título Compacto + Cobertura + Distribuidor + Botón Ver Mapa */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap min-w-0 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-base" role="img" aria-label="Perú">🇵🇪</span>
              <span className="text-xs font-black text-slate-900">Ubicación:</span>
              <span className="text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-lg">
                {distritoSeleccionado}, {provinciaSeleccionada} ({deptoSeleccionado})
              </span>
            </div>

            <span className="text-slate-300 hidden md:inline">•</span>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-700">
              <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ⚡ {distribuidoraSeleccionada?.tiempoMin || 20}-{distribuidoraSeleccionada?.tiempoMax || 30} min
              </span>
              <span className="text-slate-500">Distribuidor:</span>
              <strong className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                {distribuidoraSeleccionada?.nombreComercial || 'Solgas Express'}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {cargandoUbigeo && (
              <span className="inline-flex items-center gap-1 text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-md animate-pulse">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span className="hidden sm:inline">Actualizando...</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => setVistaPrincipal(vistaPrincipal === 'mapa' ? 'catalogo' : 'mapa')}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#03246b] hover:bg-blue-900 text-white text-[11px] font-bold transition shadow-2xs cursor-pointer"
            >
              <MapIcon className="w-3.5 h-3.5 text-sky-300" />
              <span>{vistaPrincipal === 'mapa' ? 'Ver Catálogo' : '🗺️ Ver Mapa y Distribuidores'}</span>
            </button>
          </div>
        </div>

        {/* Fila 2: Selectores Cascada (Depto, Prov, Dist) + Dirección Exacta + GPS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 text-xs">
          {/* 1. Departamento */}
          <div>
            <select
              value={deptoSeleccionado}
              onChange={(e) => setDeptoSeleccionado(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-[11px] font-bold focus:ring-1 focus:ring-orange-500 hover:border-orange-400 transition shadow-2xs cursor-pointer"
              title="Selecciona Departamento"
            >
              {departamentos.map((dep) => (
                <option key={dep} value={dep}>
                  {dep}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Provincia */}
          <div>
            <select
              value={provinciaSeleccionada}
              onChange={(e) => setProvinciaSeleccionada(e.target.value)}
              disabled={provincias.length === 0}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-[11px] font-bold focus:ring-1 focus:ring-orange-500 hover:border-orange-400 transition disabled:bg-slate-100 shadow-2xs cursor-pointer"
              title="Selecciona Provincia"
            >
              {provincias.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Distrito */}
          <div>
            <select
              value={distritoSeleccionado}
              onChange={(e) => setDistritoSeleccionado(e.target.value)}
              disabled={distritos.length === 0}
              className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-[11px] font-bold focus:ring-1 focus:ring-orange-500 hover:border-orange-400 transition disabled:bg-slate-100 shadow-2xs cursor-pointer"
              title="Selecciona Distrito"
            >
              {distritos.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Dirección Exacta (Ocupa 2 columnas en lg) */}
          <div className="col-span-2 relative flex items-center">
            <input
              type="text"
              value={direccionExacta}
              onChange={(e) => setDireccionExacta(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleBuscarDireccion();
                }
              }}
              placeholder="Ej. Av. Antúnez de Mayolo 1234..."
              className="w-full pl-2.5 pr-16 py-1.5 text-[11px] font-medium rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-orange-500 hover:border-orange-400 transition shadow-2xs"
            />
            <button
              type="button"
              onClick={() => handleBuscarDireccion()}
              disabled={buscandoDireccion || !direccionExacta.trim()}
              className="absolute right-1 px-2 py-0.5 rounded-md bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-[10px] font-bold transition cursor-pointer shadow-2xs flex items-center gap-0.5"
              title="Ubicar dirección exacta"
            >
              {buscandoDireccion ? <RefreshCw className="w-2.5 h-2.5 animate-spin" /> : <Search className="w-2.5 h-2.5" />}
              <span>Ubicar</span>
            </button>
          </div>

          {/* 5. Botón GPS */}
          <div>
            <button
              type="button"
              onClick={handleUsarGps}
              disabled={obteniendoGps}
              className="w-full px-2 py-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer shadow-2xs"
              title="Detectar ubicación actual por GPS"
            >
              <Navigation className={`w-3 h-3 text-orange-600 ${obteniendoGps ? 'animate-spin' : ''}`} />
              <span className="truncate">{obteniendoGps ? 'GPS...' : '📍 Mi GPS'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 3. LAYOUT PRINCIPAL: 2 COLUMNAS (CATÁLOGO IZQ + RESUMEN PEDIDO DCHA)  */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* COLUMNA IZQUIERDA: Filtros, Mapa y Catálogo de Balones Estilo Premios */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4">
          {/* Barra de Filtros Rápidos y Búsqueda */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Categorías Principales de Balones */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {[
                  { id: 'TODOS', label: '🔥 Todos los Balones' },
                  { id: 'GLP_10KG', label: '🏠 10kg Doméstico' },
                  { id: 'GLP_15KG', label: '🏢 15kg Comercial' },
                  { id: 'GLP_45KG', label: '🏭 45kg Industrial' },
                  { id: 'VALVULA_ACCESORIO', label: '🛡️ Válvulas y Reguladores' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFiltroTipoGas(tab.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                      filtroTipoGas === tab.id
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Campo de Búsqueda de Balón */}
              <div className="relative min-w-[200px] sm:min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={busquedaTexto}
                  onChange={(e) => setBusquedaTexto(e.target.value)}
                  placeholder="Buscar por marca, válvula, SKU..."
                  className="w-full pl-9 pr-8 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500 text-slate-800 placeholder:text-slate-400 transition"
                />
                {busquedaTexto && (
                  <button
                    type="button"
                    onClick={() => setBusquedaTexto('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Marcas Oficiales Disponibles en Red */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap text-xs">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Marca:
              </span>
              {['TODAS', 'Solgas', 'Primax Gas', 'Zeta Gas', 'Llama Gas', 'RappiGas'].map((marca) => (
                <button
                  key={marca}
                  type="button"
                  onClick={() => setFiltroMarca(marca)}
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border transition cursor-pointer ${
                    filtroMarca === marca
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {marca}
                </button>
              ))}
              <span className="ml-auto text-[11px] text-slate-400 font-medium">
                Mostrando <strong>{productosFiltrados.length}</strong> balones certificados
              </span>
            </div>
          </div>

          {/* VISTA DE MAPA INTERACTIVO CON NOMBRES DE DISTRIBUIDORES */}
          {vistaPrincipal === 'mapa' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
                    <MapPin className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">
                      Mapa de Distribuidores en {distritoSeleccionado}, {provinciaSeleccionada}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      En el mapa figura el nombre de cada distribuidor. Haz clic sobre cualquiera para elegir quién te vende.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setVistaPrincipal('catalogo')}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs transition flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  Volver al Catálogo ✕
                </button>
              </div>

              {/* Opción arriba de poner la ubicación exacta para el mapa interactivo */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 sm:p-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 shadow-2xs">
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-[11px] font-black text-slate-700 whitespace-nowrap flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                    Poner Ubicación:
                  </span>
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="text"
                      value={direccionExacta}
                      onChange={(e) => setDireccionExacta(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleBuscarDireccion();
                        }
                      }}
                      placeholder="Escribe calle, avenida o referencia para centrar el pin..."
                      className="w-full pl-3 pr-20 py-1.5 text-xs font-bold rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleBuscarDireccion()}
                      disabled={buscandoDireccion || !direccionExacta.trim()}
                      className="absolute right-1 px-2.5 py-0.5 rounded-md bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white text-[10px] font-black transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      {buscandoDireccion ? (
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                      ) : (
                        <Search className="w-2.5 h-2.5" />
                      )}
                      <span>Buscar</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleUsarGps}
                    disabled={obteniendoGps}
                    className="px-2.5 py-1.5 rounded-lg border border-orange-300 bg-white hover:bg-orange-50 text-orange-700 text-xs font-black flex items-center gap-1 transition cursor-pointer shadow-2xs"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${obteniendoGps ? 'animate-spin' : ''}`} />
                    <span>{obteniendoGps ? 'Buscando...' : '📍 Usar Mi GPS'}</span>
                  </button>

                  <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-1 rounded-lg border border-slate-200 hidden sm:inline-block">
                    [{latitud.toFixed(4)}, {longitud.toFixed(4)}]
                  </span>
                </div>
              </div>

              {/* Contenedor del Mapa */}
              <div className="w-full h-[300px] sm:h-[340px] rounded-xl overflow-hidden border border-slate-200 shadow-inner relative">
                <MapaCoberturaDistribuidores
                  latCliente={latitud}
                  lngCliente={longitud}
                  direccionCliente={
                    direccionExacta
                      ? `${direccionExacta} (${distritoSeleccionado}, ${provinciaSeleccionada})`
                      : `Distrito de ${distritoSeleccionado}, ${provinciaSeleccionada}`
                  }
                  distribuidoras={distribuidorasMapa as any}
                  distribuidoraSeleccionadaId={distribuidoraSeleccionada?.publicId}
                  onSeleccionarDistribuidora={(dist) => setDistribuidoraSeleccionada(dist)}
                  permitirMoverCliente={true}
                  onCambiarUbicacionCliente={handleCambiarUbicacionMapa}
                />
              </div>

              {/* Tarjetas de Distribuidores Disponibles para Elección Inmediata */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-orange-600" />
                    <span>Distribuidores en {distritoSeleccionado} ({distribuidorasMapa.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Haz clic para seleccionarlo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {distribuidorasMapa.map((dist) => {
                    const esSeleccionado = dist.publicId === distribuidoraSeleccionada?.publicId;

                    return (
                      <div
                        key={dist.publicId}
                        onClick={() => setDistribuidoraSeleccionada(dist)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                          esSeleccionado
                            ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-300 shadow-md'
                            : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-black uppercase text-orange-600 tracking-wider">
                              {dist.zonaNombre || 'Distribuidor Oficial'}
                            </span>
                            {esSeleccionado && (
                              <span className="text-[9px] font-black bg-orange-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                                ✓ Vendedor Asignado
                              </span>
                            )}
                          </div>

                          <h5 className="font-black text-slate-900 text-xs line-clamp-1">
                            {dist.nombreComercial}
                          </h5>

                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            📍 {dist.direccionFiscal}
                          </p>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div className="text-[10px]">
                            <span className="text-slate-400 block font-mono">RUC: {dist.ruc}</span>
                            <span className="font-extrabold text-emerald-600">⚡ {dist.tiempoMin}-{dist.tiempoMax} min</span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDistribuidoraSeleccionada(dist);
                            }}
                            className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition cursor-pointer ${
                              esSeleccionado
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                            }`}
                          >
                            {esSeleccionado ? '✓ Seleccionado' : 'Elegir'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* GRID DE PRODUCTOS EN FORMATO DE PREMIOS (CARD EXACTA DE PREMIOS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
            {productosFiltrados.map((prod) => {
              const cantidadEnCarrito = carrito[prod.publicId] || 0;

              return (
                <div
                  key={prod.publicId}
                  className={`catalogo-product-card bg-white rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden group ${
                    cantidadEnCarrito > 0
                      ? 'border-orange-500 ring-2 ring-orange-200/80'
                      : 'border-slate-200/90 hover:border-orange-300/80'
                  }`}
                >
                  {/* Contenido Superior Clickeable para abrir la Ficha Técnica */}
                  <div
                    onClick={() => setProductoFichaModal(prod)}
                    className="p-4 sm:p-4.5 space-y-2.5 block cursor-pointer group flex-1"
                  >
                    {/* Cabecera de la Tarjeta */}
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs truncate">
                        {prod.marca}
                      </span>

                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 shrink-0">
                        {prod.norma}
                      </span>
                    </div>

                    {/* Contenedor de Imagen con Fondo Gradiente y Hover Zoom */}
                    <div className="w-full h-40 sm:h-44 bg-gradient-to-b from-slate-50 to-slate-100/70 rounded-xl p-3 flex items-center justify-center border border-slate-100/90 overflow-hidden relative shadow-inner">
                      {prod.destacado && (
                        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white text-[9px] font-black shadow-md border border-amber-300 uppercase tracking-wider animate-in fade-in">
                          <Sparkles className="w-2.5 h-2.5 fill-white text-white" />
                          <span>{prod.tag}</span>
                        </div>
                      )}

                      {/* Badge de Balanza Digital */}
                      <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-slate-700 text-[9px] font-bold shadow-xs border border-slate-200">
                        <Scale className="w-2.5 h-2.5 text-orange-600" />
                        <span>Balanza Digital</span>
                      </div>

                      <img
                        src={prod.imagenUrl}
                        alt={prod.nombre}
                        className="max-h-full max-w-full object-contain filter drop-shadow-md group-hover:scale-108 transition-transform duration-300 ease-out"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/products/balon-10kg-premium.png';
                        }}
                      />
                    </div>

                    {/* Nombre y Descripción */}
                    <div className="pt-0.5 space-y-1">
                      <h3
                        className="card-title font-black text-sm text-[#03246b] line-clamp-1 group-hover:text-orange-600 transition-colors"
                        title={prod.nombre}
                      >
                        {prod.nombre}
                      </h3>
                      <p className="card-desc text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
                        {prod.descripcion}
                      </p>
                    </div>

                    {/* Distribuidor que Vende este Balón */}
                    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-orange-50/70 border border-orange-200/80 text-[10px]">
                      <Store className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                      <span className="text-orange-800 font-bold shrink-0">Vende:</span>
                      <span className="font-extrabold text-slate-900 truncate" title={distribuidoraSeleccionada?.nombreComercial}>
                        {distribuidoraSeleccionada?.nombreComercial || 'Solgas Express'}
                      </span>
                    </div>

                    {/* Chips de Seguridad Osinergmin */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-[10px]">
                      <span className="font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                        {prod.garantia}
                      </span>
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        ⚡ {distribuidoraSeleccionada?.tiempoMin || 20}-{distribuidoraSeleccionada?.tiempoMax || 30} min
                      </span>
                    </div>
                  </div>

                  {/* Pie con Costo en Soles, Puntos RappiGas y Botón de Pedido */}
                  <div className="p-3.5 bg-gradient-to-b from-slate-50/80 to-slate-100/50 border-t border-slate-100/90 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block leading-none">
                          Precio Oficial:
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-lg font-black text-orange-600 font-mono tracking-tight leading-none">
                            S/ {prod.precio.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Bonus de Puntos */}
                      <div className="text-right">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block leading-none">
                          Puntos:
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 mt-1">
                          +{prod.puntos} PTS
                        </span>
                      </div>
                    </div>

                    {/* Acciones de Tarjeta: Incrementar o Agregar */}
                    <div className="flex items-center gap-2 pt-0.5">
                      {cantidadEnCarrito > 0 ? (
                        <div className="flex-1 flex items-center justify-between bg-white border border-orange-400 rounded-xl px-2 py-1 shadow-xs">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              modificarCantidad(prod.publicId, -1);
                            }}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center justify-center transition cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <div className="text-center">
                            <span className="font-black text-xs text-slate-900 block leading-none">
                              {cantidadEnCarrito} en pedido
                            </span>
                            <span className="text-[10px] text-orange-600 font-bold font-mono">
                              S/ {(prod.precio * cantidadEnCarrito).toFixed(2)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              modificarCantidad(prod.publicId, 1);
                            }}
                            className="w-6 h-6 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center justify-center transition cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            modificarCantidad(prod.publicId, 1);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs shadow-sm hover:shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Pedir Balón
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setProductoFichaModal(prod)}
                        title="Ver Ficha Técnica"
                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition cursor-pointer shrink-0"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparativa Educativa de Válvulas */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-slate-900 text-sm sm:text-base">
                Guía Técnica: ¿Cuál es la válvula recomendada para tu cocina?
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Válvula Click-On Premium (Recomendada por Osinergmin)</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Se conecta a presión en 1 solo movimiento sin herramientas. Incorpora corte automático instantáneo si la manguera se desprende, evitando fugas de gas.
                </p>
                <div className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 p-2 rounded-lg">
                  ✓ 100% Hermética • Cero herramientas • Corte automático
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <span>Válvula de Rosca Tradicional (Universal 7/8" POL)</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  La rosca universal presente en hogares peruanos convencionales. Requiere ajuste manual. Nuestros repartidores verifican con detector de burbujas en tu puerta.
                </p>
                <div className="text-[10px] font-bold text-slate-700 bg-slate-200/70 p-2 rounded-lg">
                  ✓ Compatible con regulador roscado • Sello de fábrica
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: RESUMEN DEL PEDIDO (STICKY SIDE PANEL CON COLOR DISTINTIVO) */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-4 lg:sticky lg:top-[115px] xl:top-[120px] self-start z-20">
          <div className="bg-gradient-to-b from-orange-50/80 via-amber-50/30 to-white rounded-2xl border-2 border-orange-300/80 shadow-lg p-4 sm:p-5 space-y-3.5 max-h-[calc(100vh-140px)] overflow-y-auto">
            {/* Header Distintivo de Resumen con Color Propio */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 -mx-4 -mt-4 sm:-mx-5 sm:-mt-5 p-3.5 rounded-t-2xl text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                  <ShoppingBag className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-white text-xs sm:text-sm leading-tight flex items-center gap-1.5">
                    Resumen del Pedido
                  </h2>
                  <p className="text-[10px] text-orange-100 leading-none mt-0.5">
                    Despacho Exprés RappiGas
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black text-amber-950 bg-amber-300 px-2.5 py-1 rounded-lg shadow-xs font-mono">
                {totalItems} {totalItems === 1 ? 'balón' : 'balones'}
              </span>
            </div>

            {/* Distribuidor Asignado en el Resumen */}
            <div className="p-2.5 bg-orange-50/70 rounded-xl border border-orange-200/80 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-orange-800 tracking-wider">
                  Distribuidor que te vende:
                </span>
                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                  Osinergmin
                </span>
              </div>
              <p className="font-black text-slate-900 text-xs truncate">
                🏪 {distribuidoraSeleccionada?.nombreComercial || 'Solgas Express'}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-600">
                <span>RUC: {distribuidoraSeleccionada?.ruc || '20609876543'}</span>
                <span className="font-bold text-emerald-700">⚡ {distribuidoraSeleccionada?.tiempoMin || 20}-{distribuidoraSeleccionada?.tiempoMax || 30} min</span>
              </div>
            </div>

            {/* Lista de Items en el Resumen */}
            {totalItems === 0 ? (
              <div className="p-5 text-center space-y-2 border border-dashed border-orange-200 rounded-xl bg-white/90 shadow-2xs">
                <ShoppingBag className="w-8 h-8 text-orange-300 mx-auto" />
                <p className="text-xs font-bold text-slate-700">Tu pedido está vacío</p>
                <p className="text-[11px] text-slate-400">
                  Haz clic en "Pedir Balón" en el catálogo para agregarlo a tu resumen.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-2.5 border border-orange-100 shadow-2xs divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1 space-y-1">
                {Object.entries(carrito).map(([id, cant]) => {
                  const prod = PRODUCTOS_CATALOGO.find((p) => p.publicId === id);
                  if (!prod) return null;

                  return (
                    <div key={id} className="pt-2 pb-2 flex items-center justify-between text-xs gap-2">
                      <div className="min-w-0 pr-1 flex-1">
                        <p className="font-black text-slate-900 truncate text-[11px]" title={prod.nombre}>
                          {prod.nombre}
                        </p>
                        <span className="text-[10px] text-slate-500 font-mono">
                          S/ {prod.precio.toFixed(2)} c/u
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => modificarCantidad(id, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-black text-xs w-4 text-center text-slate-900">
                          {cant}
                        </span>
                        <button
                          type="button"
                          onClick={() => modificarCantidad(id, 1)}
                          className="w-6 h-6 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold flex items-center justify-center transition cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Cupón de Descuento */}
            <form onSubmit={handleAplicarCupon} className="flex gap-1.5 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={codigoCupon}
                onChange={(e) => setCodigoCupon(e.target.value)}
                placeholder="Cupón (ej. GASPRIMERO)"
                className="flex-1 px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-orange-500 uppercase font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shrink-0 transition cursor-pointer"
              >
                Aplicar
              </button>
            </form>

            {cuponAplicado && (
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-[11px] text-emerald-800">
                <span>Cupón <strong>{cuponAplicado}</strong> aplicado (-S/ 5.00)</span>
                <button
                  type="button"
                  onClick={() => {
                    setCuponAplicado(null);
                    setDescuentoCupon(0);
                  }}
                  className="text-emerald-950 font-bold hover:underline cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Desglose de Precios */}
            <div className="space-y-1.5 text-xs p-3 bg-white/90 rounded-xl border border-orange-100 shadow-2xs">
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Subtotal balones:</span>
                <span className="font-mono">S/ {subtotal.toFixed(2)}</span>
              </div>
              {descuentoCupon > 0 && (
                <div className="flex justify-between text-emerald-600 text-[11px] font-bold">
                  <span>Descuento cupón:</span>
                  <span className="font-mono">-S/ {descuentoCupon.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Delivery express:</span>
                <span className="font-bold text-emerald-600">GRATIS</span>
              </div>
              <div className="flex justify-between text-slate-900 text-sm font-black pt-1.5 border-t border-slate-200">
                <span>Total a Pagar:</span>
                <span className="text-orange-600 font-mono text-base">S/ {totalFinal.toFixed(2)}</span>
              </div>
            </div>

            {/* Puntos Ganables */}
            {puntosTotales > 0 && (
              <div className="p-2.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Puntos a ganar:</span>
                </div>
                <span className="font-black text-amber-950 font-mono bg-white/80 px-2 py-0.5 rounded border border-amber-200">
                  +{puntosTotales} PTS
                </span>
              </div>
            )}

            {/* Formas de Pago Contra Entrega */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Forma de Pago Contra Entrega:
              </span>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                {[
                  { id: 'YAPE', label: '🟣 Yape' },
                  { id: 'PLIN', label: '🔵 Plin' },
                  { id: 'EFECTIVO', label: '💵 Efectivo' },
                  { id: 'TARJETA', label: '💳 POS Tarjeta' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMetodoPago(m.id as any)}
                    className={`p-1.5 rounded-lg border font-bold text-center transition cursor-pointer text-[10px] ${
                      metodoPago === m.id
                        ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Invitación a Crear Cuenta para acumular puntos si no está logeado */}
            {!estaAutenticado && (
              <div className="p-2.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 rounded-xl flex items-center justify-between text-[11px] gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="text-slate-700 font-medium truncate">
                    ¿Quieres acumular los <strong className="text-orange-700">+{puntosTotales} pts</strong> de este pedido?
                  </span>
                </div>
                <Link
                  href="/auth/login?modo=registro"
                  className="font-black text-orange-700 hover:text-orange-900 underline shrink-0 whitespace-nowrap"
                >
                  Crear cuenta gratis
                </Link>
              </div>
            )}

            {/* Botón Principal de Confirmación */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleProcederCheckout}
                disabled={totalItems === 0}
                className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 text-white rounded-xl font-black text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>
                  {estaAutenticado && usuario?.rol === 'CLIENTE'
                    ? 'Ir a Mi Carrito / Checkout'
                    : 'Confirmar Pedido Express'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <Link
                href="/cliente/tienda"
                className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-[11px] transition flex items-center justify-center gap-1 text-center"
              >
                Abrir Tienda Completa de Cliente
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 4. BARRA FLOTANTE MÓVIL (VISIBLE SOLO EN PANTALLAS PEQUEÑAS)          */}
      {/* --------------------------------------------------------------------- */}
      {totalItems > 0 && (
        <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-3 animate-in slide-in-from-bottom-5">
          <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 shadow-2xl border border-slate-700 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs text-white">
                  {totalItems} {totalItems === 1 ? 'balón' : 'balones'}
                </span>
                <span className="text-[10px] font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.2 rounded-full">
                  +{puntosTotales} PTS
                </span>
              </div>
              <span className="text-base font-black text-orange-400 font-mono block leading-tight">
                S/ {totalFinal.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleProcederCheckout}
              className="py-2 px-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>
                {estaAutenticado && usuario?.rol === 'CLIENTE'
                  ? 'Ir a Mi Carrito'
                  : 'Pedir Express'}
              </span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 5. MODAL DE FICHA TÉCNICA DEL BALÓN                                   */}
      {/* --------------------------------------------------------------------- */}
      {productoFichaModal && (
        <div className="fixed inset-0 z-[1050] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">
                  Ficha Técnica Oficial • {productoFichaModal.norma}
                </span>
                <h3 className="font-black text-slate-900 text-base leading-snug">
                  {productoFichaModal.nombre}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setProductoFichaModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="w-full h-44 bg-gradient-to-b from-slate-50 to-slate-100 rounded-xl p-4 flex items-center justify-center border border-slate-100 relative">
              <img
                src={productoFichaModal.imagenUrl}
                alt={productoFichaModal.nombre}
                className="max-h-full max-w-full object-contain filter drop-shadow-md"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-slate-800 text-[10px] font-bold border border-slate-200 shadow-xs">
                <Award className="w-3 h-3 text-orange-600" />
                <span>{productoFichaModal.marca}</span>
              </div>
            </div>

            {/* Identificación del Distribuidor que Atiende */}
            <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-orange-700">
                  Distribuidor Oficial que Despacha:
                </span>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                  Activo
                </span>
              </div>
              <p className="font-black text-slate-900 text-xs">
                🏪 {distribuidoraSeleccionada?.nombreComercial || 'Solgas Express'}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-600">
                <span>RUC: {distribuidoraSeleccionada?.ruc || '20609876543'}</span>
                <span className="text-emerald-700 font-bold">⚡ {distribuidoraSeleccionada?.tiempoMin || 20}-{distribuidoraSeleccionada?.tiempoMax || 30} min</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 uppercase text-[10px] tracking-wider text-slate-400">
                Especificaciones Certificadas:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[9px] font-bold uppercase">Capacidad Neta:</span>
                  <span className="font-bold text-slate-800">{productoFichaModal.especificaciones.capacidad}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[9px] font-bold uppercase">Tara Cilindro:</span>
                  <span className="font-bold text-slate-800">{productoFichaModal.especificaciones.taraPromedio}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[9px] font-bold uppercase">Válvula:</span>
                  <span className="font-bold text-slate-800">{productoFichaModal.especificaciones.valvula}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[9px] font-bold uppercase">Certificación:</span>
                  <span className="font-bold text-slate-800">{productoFichaModal.especificaciones.certificacion}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Precio Oficial:</span>
                <span className="text-xl font-black text-orange-600 font-mono">
                  S/ {productoFichaModal.precio.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    modificarCantidad(productoFichaModal.publicId, 1);
                    setProductoFichaModal(null);
                  }}
                  className="py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-extrabold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Agregar al Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* 6. MODAL HÍBRIDO EXPRESS (PARA VISITANTES NO LOGUEADOS)                */}
      {/* --------------------------------------------------------------------- */}
      {modalCheckoutAbierto && (
        <div className="fixed inset-0 z-[1050] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-orange-600 tracking-wider">
                  Pedido Express en 30 Segundos
                </span>
                <h3 className="font-black text-slate-900 text-base">
                  Datos de Despacho Inmediato
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalCheckoutAbierto(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Aviso de Puntos por Número de Celular */}
            <div className="p-2.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 animate-pulse" />
                <span className="text-amber-950 font-bold text-[11px]">
                  Tus <strong>+{puntosTotales} Puntos</strong> se guardarán automáticamente a tu celular
                </span>
              </div>
            </div>

            {/* Identificación del Distribuidor en el Checkout */}
            <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-orange-700">
                  Distribuidor que te vende:
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                  Osinergmin Verificado
                </span>
              </div>
              <p className="font-black text-slate-900 text-xs">
                🏪 {distribuidoraSeleccionada?.nombreComercial}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-600">
                <span>RUC: {distribuidoraSeleccionada?.ruc}</span>
                <span className="text-emerald-700 font-bold">⚡ Entrega en {distribuidoraSeleccionada?.tiempoMin || 20}-{distribuidoraSeleccionada?.tiempoMax || 30} min</span>
              </div>
            </div>

            {pedidoExitoso ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-black text-slate-900 text-lg">¡Pedido Despachado!</h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto">
                  <strong>{distribuidoraSeleccionada?.nombreComercial}</strong> ya recibió la orden. El repartidor llegará en 20-30 minutos con balanza digital.
                </p>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-medium">
                  🎉 ¡Se han acreditado <strong>+{puntosTotales} Puntos</strong> a tu celular <strong>{telefonoCliente}</strong>!
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs">
                  Total a cancelar contra entrega: <strong>S/ {totalFinal.toFixed(2)}</strong> ({metodoPago})
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmarPedido} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tu Nombre Completo:</label>
                  <input
                    type="text"
                    required
                    value={nombreCliente}
                    onChange={(e) => setNombreCliente(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Teléfono Celular (aquí se guardan tus puntos):
                  </label>
                  <input
                    type="tel"
                    required
                    value={telefonoCliente}
                    onChange={(e) => setTelefonoCliente(e.target.value)}
                    placeholder="Ej. 987 654 321"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Dirección de Entrega ({distritoSeleccionado}, {provinciaSeleccionada}):
                  </label>
                  <input
                    type="text"
                    required
                    value={direccionExacta}
                    onChange={(e) => setDireccionExacta(e.target.value)}
                    placeholder="Ej. Av. Antúnez de Mayolo 1234, Dpto 402"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-semibold"
                  />
                </div>

                {/* Forma de Pago */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Forma de Pago Contra Entrega:</label>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {[
                      { id: 'YAPE', label: '🟣 Yape' },
                      { id: 'PLIN', label: '🔵 Plin' },
                      { id: 'EFECTIVO', label: '💵 Efectivo' },
                      { id: 'TARJETA', label: '💳 POS Tarjeta' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMetodoPago(m.id as any)}
                        className={`p-2 rounded-xl border font-bold text-center transition cursor-pointer ${
                          metodoPago === m.id
                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="text-slate-600 font-semibold">Total a pagar:</span>
                  <span className="font-black text-orange-600 text-base font-mono">
                    S/ {totalFinal.toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  Confirmar y Despachar a Mi Domicilio
                </button>

                {/* Alternativa para Clientes Registrados */}
                <div className="pt-2 text-center border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleIrALogin}
                    className="text-[11px] text-slate-500 hover:text-orange-600 font-semibold underline cursor-pointer"
                  >
                    ¿Ya tienes cuenta de cliente? Iniciar sesión para ir al carrito completo
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
