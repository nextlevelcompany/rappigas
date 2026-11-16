export interface EspecificacionPremio {
  clave: string;
  valor: string;
}

export interface PremioCanje {
  id: string;
  nombre: string;
  categoria: string;
  marca: string;
  puntos: number;
  valorSoles: number;
  stock: number;
  imagen: string;
  descripcion: string;
  codigoCupon: string;
  destacado?: boolean;
  mostrarEnInicio?: boolean;
  badgeInicio?: string;
  ordenInicio?: number;
  especificaciones?: EspecificacionPremio[];
}

export interface CategoriaPremio {
  id: string;
  nombre: string;
  icono: string;
  badgeCls: string;
  descripcion?: string;
}

export const CATEGORIAS_CONFIG_DEFAULT: CategoriaPremio[] = [
  { id: "TODOS", nombre: "Todos los Premios", icono: "🎁", badgeCls: "bg-slate-100 text-slate-700" },
  { id: "GAS_VALES", nombre: "Balones de Gas & Vales", icono: "🔥", badgeCls: "bg-orange-50 text-orange-700 border-orange-200" },
  { id: "COCINA_MENAJE", nombre: "Cocina & Menaje", icono: "🍳", badgeCls: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "ELECTROHOGAR", nombre: "Electrohogar", icono: "🔌", badgeCls: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "HOGAR_TEXTIL", nombre: "Hogar & Textil", icono: "🏠", badgeCls: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "TECNOLOGIA", nombre: "Tecnología & Audio", icono: "📱", badgeCls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "FERRETERIA", nombre: "Herramientas & Auto", icono: "🔧", badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "CUIDADO_NINOS", nombre: "Niños & Cuidado", icono: "🧸", badgeCls: "bg-rose-50 text-rose-700 border-rose-200" },
];

export const CATEGORIAS_CONFIG: CategoriaPremio[] = CATEGORIAS_CONFIG_DEFAULT;

export const PREMIOS_ZETA_PREMIA: PremioCanje[] = [
  // --- 1 a 15: BALONES DE GAS & VALES ---
  {
    id: "zp-01",
    nombre: "Vale de Descuento S/ 10.00 en Balón de Gas",
    categoria: "GAS_VALES",
    marca: "RappiGas",
    puntos: 80,
    valorSoles: 10.0,
    stock: 99,
    imagen: "/products/balon-10kg-premium.svg",
    descripcion: "Vale aplicable en cualquier pedido de gas con balanza digital contrastada.",
    codigoCupon: "VALE10GAS",
    destacado: true,
    mostrarEnInicio: true,
    badgeInicio: "CANJE RÁPIDO",
    ordenInicio: 1,
  },
  {
    id: "zp-02",
    nombre: "Vale de Descuento S/ 15.00 en Balón de Gas",
    categoria: "GAS_VALES",
    marca: "RappiGas",
    puntos: 130,
    valorSoles: 15.0,
    stock: 85,
    imagen: "/products/balon-10kg-premium.svg",
    descripcion: "Descuento directo de S/ 15 en cilindros de 10kg, 15kg o 45kg.",
    codigoCupon: "VALE15GAS",
  },
  {
    id: "zp-03",
    nombre: "Vale de Descuento S/ 20.00 en Balón de Gas",
    categoria: "GAS_VALES",
    marca: "RappiGas",
    puntos: 180,
    valorSoles: 20.0,
    stock: 70,
    imagen: "/products/balon-10kg-premium.svg",
    descripcion: "Canjea S/ 20 de saldo para pagar menos en tu próxima compra de gas.",
    codigoCupon: "VALE20GAS",
    destacado: true,
    mostrarEnInicio: true,
    badgeInicio: "CANJE RÁPIDO",
    ordenInicio: 2,
  },
  {
    id: "zp-04",
    nombre: "Vale de Descuento S/ 30.00 en Balón de Gas",
    categoria: "GAS_VALES",
    marca: "RappiGas",
    puntos: 260,
    valorSoles: 30.0,
    stock: 50,
    imagen: "/products/balon-10kg-premium.svg",
    descripcion: "Ahorro garantizado de S/ 30 aplicable en cualquier distribuidora.",
    codigoCupon: "VALE30GAS",
  },
  {
    id: "zp-05",
    nombre: "Balón Solgas 10kg Premium 100% Gratis",
    categoria: "GAS_VALES",
    marca: "Solgas",
    puntos: 480,
    valorSoles: 55.0,
    stock: 30,
    imagen: "/products/balon-10kg-premium.png",
    descripcion: "Recibe tu balón Solgas de 10kg totalmente gratis sin pagar ni un sol.",
    codigoCupon: "SOLGAS10GRATIS",
    destacado: true,
    mostrarEnInicio: true,
    badgeInicio: "MÁS PEDIDO",
    ordenInicio: 3,
  },
  {
    id: "zp-06",
    nombre: "Balón Zeta Gas 10kg Válvula Premium Gratis",
    categoria: "GAS_VALES",
    marca: "Zeta Gas",
    puntos: 480,
    valorSoles: 55.0,
    stock: 25,
    imagen: "/products/balon-10kg-premium.svg",
    descripcion: "Cilindro oficial Zeta Gas de 10kg con precinto de seguridad Osinergmin.",
    codigoCupon: "ZETAGAS10GRATIS",
    destacado: true,
  },
  {
    id: "zp-07",
    nombre: "Balón de Gas 10kg Válvula Rosca Gratis",
    categoria: "GAS_VALES",
    marca: "RappiGas",
    puntos: 490,
    valorSoles: 56.0,
    stock: 20,
    imagen: "/products/balon-10kg-rosca.svg",
    descripcion: "Balón doméstico válvula rosca certificado con entrega express.",
    codigoCupon: "ROSCAGRATIS",
  },
  {
    id: "zp-08",
    nombre: "Vale de Descuento S/ 35.00 en Balón 15kg",
    categoria: "GAS_VALES",
    marca: "RappiGas",
    puntos: 320,
    valorSoles: 35.0,
    stock: 18,
    imagen: "/products/balon-15kg-premium.svg",
    descripcion: "Para negocios o familias: S/ 35 de descuento en balones de 15kg.",
    codigoCupon: "VALE15KG35",
  },
  {
    id: "zp-09",
    nombre: "Vale de Descuento S/ 60.00 en Balón 45kg Industrial",
    categoria: "GAS_VALES",
    marca: "RappiGas",
    puntos: 550,
    valorSoles: 60.0,
    stock: 10,
    imagen: "/products/balon-45kg-industrial.svg",
    descripcion: "Ahorro masivo de S/ 60 en recarga de gas industrial para restaurantes.",
    codigoCupon: "VALE45KG60",
  },
  {
    id: "zp-10",
    nombre: "Regulador Premium con Manómetro Contrastado",
    categoria: "GAS_VALES",
    marca: "Osinergmin Formal",
    puntos: 220,
    valorSoles: 28.0,
    stock: 35,
    imagen: "/products/regulador-manometro.svg",
    descripcion: "Válvula con medidor de presión en tiempo real para saber cuánto gas te queda.",
    codigoCupon: "REGULADOR220",
    destacado: true,
    mostrarEnInicio: true,
    badgeInicio: "SEGURIDAD GLP",
    ordenInicio: 4,
  },
  {
    id: "zp-11",
    nombre: "Manguera Flexible para GLP 1.5m Reforzada",
    categoria: "GAS_VALES",
    marca: "Osinergmin Formal",
    puntos: 90,
    valorSoles: 12.0,
    stock: 50,
    imagen: "/products/regulador-manometro.svg",
    descripcion: "Manguera de seguridad de alta presión con 2 abrazaderas inoxidables.",
    codigoCupon: "MANGUERA90",
  },
  {
    id: "zp-12",
    nombre: "Kit de Seguridad: Regulador + Manguera + Abrazaderas",
    categoria: "GAS_VALES",
    marca: "RappiGas",
    puntos: 290,
    valorSoles: 38.0,
    stock: 25,
    imagen: "/products/regulador-manometro.svg",
    descripcion: "Kit completo de instalación segura certificado por normativa peruana.",
    codigoCupon: "KITSEGURIDAD290",
  },
  {
    id: "zp-13",
    nombre: "Detector de Fugas de Gas Portátil con Alarma",
    categoria: "GAS_VALES",
    marca: "SensorPro",
    puntos: 350,
    valorSoles: 45.0,
    stock: 15,
    imagen: "/products/01.png",
    descripcion: "Sensor sonoro que avisa al instante si detecta partículas de GLP en el aire.",
    codigoCupon: "SENSORFUGAS",
  },
  {
    id: "zp-14",
    nombre: "Válvula Clip-on Premium de Seguridad",
    categoria: "GAS_VALES",
    marca: "Zeta Gas",
    puntos: 170,
    valorSoles: 22.0,
    stock: 40,
    imagen: "/products/regulador-manometro.svg",
    descripcion: "Conexión rápida con traba de seguridad a prueba de manipulaciones indebidas.",
    codigoCupon: "VALVULACLIP",
  },
  {
    id: "zp-15",
    nombre: "Envío Express Gratis Ilimitado por 1 Mes",
    categoria: "GAS_VALES",
    marca: "RappiGas",
    puntos: 110,
    valorSoles: 15.0,
    stock: 100,
    imagen: "/products/balon-10kg-premium.svg",
    descripcion: "Cero costo de despacho en todos los pedidos de gas que realices este mes.",
    codigoCupon: "DELIVERYFREE",
  },

  // --- 16 a 40: COCINA & MENAJE (ZETA PREMIA STYLE) ---
  {
    id: "zp-16",
    nombre: "Sartén Antiadherente Tramontina 24cm Teflón",
    categoria: "COCINA_MENAJE",
    marca: "Tramontina",
    puntos: 240,
    valorSoles: 32.0,
    stock: 45,
    imagen: "/products/02.png",
    descripcion: "Sartén de aluminio con revestimiento Starflon antiadherente libre de PFOA.",
    codigoCupon: "SARTENTRAM24",
    destacado: true,
    mostrarEnInicio: true,
    badgeInicio: "CANJE RÁPIDO",
    ordenInicio: 5,
  },
  {
    id: "zp-17",
    nombre: "Wok Antiadherente Ilko 28cm Mango Baquelita",
    categoria: "COCINA_MENAJE",
    marca: "Ilko",
    puntos: 280,
    valorSoles: 38.0,
    stock: 30,
    imagen: "/products/03.png",
    descripcion: "Ideal para salteados peruanos como lomo saltado y arroz chaufa crujiente.",
    codigoCupon: "WOKILKO28",
  },
  {
    id: "zp-18",
    nombre: "Olla a Presión Record 6 Litros de Seguridad",
    categoria: "COCINA_MENAJE",
    marca: "Record",
    puntos: 650,
    valorSoles: 85.0,
    stock: 12,
    imagen: "/products/04.png",
    descripcion: "Cocina menestras y carnes en la mitad de tiempo ahorrando gas doméstico.",
    codigoCupon: "OLLAPRESIONREC",
    destacado: true,
    mostrarEnInicio: true,
    badgeInicio: "TOP MENAJE",
    ordenInicio: 6,
  },
  {
    id: "zp-19",
    nombre: "Juego de Ollas Record 7 Piezas Acero Inoxidable",
    categoria: "COCINA_MENAJE",
    marca: "Record",
    puntos: 980,
    valorSoles: 140.0,
    stock: 8,
    imagen: "/products/05.png",
    descripcion: "Incluye 3 ollas con tapa de vidrio templado y 1 sartén profunda antiadherente.",
    codigoCupon: "SETRECORD7PZ",
    destacado: true,
  },
  {
    id: "zp-20",
    nombre: "Juego de Cubiertos Facusa 24 Piezas Acero Inox",
    categoria: "COCINA_MENAJE",
    marca: "Facusa",
    puntos: 310,
    valorSoles: 42.0,
    stock: 35,
    imagen: "/products/06.png",
    descripcion: "Cubiertos pulidos a espejo: 6 cuchillos, 6 tenedores, 6 cucharas y 6 cucharitas.",
    codigoCupon: "CUBIERTOSFACUSA",
  },
  {
    id: "zp-21",
    nombre: "Set de Cuchillos de Chef Facusa 5 Piezas con Taco",
    categoria: "COCINA_MENAJE",
    marca: "Facusa",
    puntos: 270,
    valorSoles: 36.0,
    stock: 28,
    imagen: "/products/07.png",
    descripcion: "Cuchillo chef 8'', cuchillo pan, deshuesador, utilitario y taco de madera.",
    codigoCupon: "CUCHILLOSCHEF",
  },
  {
    id: "zp-22",
    nombre: "Tetera de Acero Inoxidable Record 2.5L con Silbato",
    categoria: "COCINA_MENAJE",
    marca: "Record",
    puntos: 190,
    valorSoles: 26.0,
    stock: 40,
    imagen: "/products/08.png",
    descripcion: "Avisa con silbido sonoro al hervir el agua. Mango aislante térmico.",
    codigoCupon: "TETERARECORD",
  },
  {
    id: "zp-23",
    nombre: "Juego de 4 Platos Hondos de Melamina Reforzada",
    categoria: "COCINA_MENAJE",
    marca: "Zeta Premia",
    puntos: 120,
    valorSoles: 16.0,
    stock: 60,
    imagen: "/products/09.png",
    descripcion: "Platos resistentes a caídas y golpes ideales para sopas y caldos.",
    codigoCupon: "PLATOSMELAMINA",
  },
  {
    id: "zp-24",
    nombre: "Juego de 4 Tazas Térmicas de Cerámica Esmaltada",
    categoria: "COCINA_MENAJE",
    marca: "Zeta Premia",
    puntos: 110,
    valorSoles: 15.0,
    stock: 55,
    imagen: "/products/10.png",
    descripcion: "Diseño vintage coleccionable perfecto para café, té y chocolate caliente.",
    codigoCupon: "TAZASCERAMICA",
  },
  {
    id: "zp-25",
    nombre: "Set de 6 Vasos de Vidrio Templado 350ml",
    categoria: "COCINA_MENAJE",
    marca: "Nadir",
    puntos: 100,
    valorSoles: 14.0,
    stock: 65,
    imagen: "/products/11.png",
    descripcion: "Vasos de vidrio extra grueso para jugos, gaseosas y agua de mesa.",
    codigoCupon: "VASOSVIDRIO6",
  },
  {
    id: "zp-26",
    nombre: "Set de 3 Recipientes Refractarios de Vidrio con Tapa",
    categoria: "COCINA_MENAJE",
    marca: "Marinex",
    puntos: 210,
    valorSoles: 29.0,
    stock: 32,
    imagen: "/products/12.png",
    descripcion: "Aptos para horno, microondas y congelador. Cierre hermético.",
    codigoCupon: "REFRACTARIOS3",
  },
  {
    id: "zp-27",
    nombre: "Escurridor de Platos Cromado de 2 Niveles",
    categoria: "COCINA_MENAJE",
    marca: "HogarMax",
    puntos: 190,
    valorSoles: 25.0,
    stock: 30,
    imagen: "/products/13.png",
    descripcion: "Con bandeja de drenaje de agua y soporte lateral para cubiertos y vasos.",
    codigoCupon: "ESCURRIDOR2NIV",
  },
  {
    id: "zp-28",
    nombre: "Tabla de Picar de Bambú Natural Antibacteriana",
    categoria: "COCINA_MENAJE",
    marca: "EcoKitchen",
    puntos: 130,
    valorSoles: 18.0,
    stock: 48,
    imagen: "/products/15.png",
    descripcion: "Madera de bambú compactada que cuida el filo de tus cuchillos.",
    codigoCupon: "TABLABAMBU",
  },
  {
    id: "zp-29",
    nombre: "Set de 5 Utensilios de Cocina Silicona y Madera",
    categoria: "COCINA_MENAJE",
    marca: "Ilko",
    puntos: 140,
    valorSoles: 19.0,
    stock: 50,
    imagen: "/products/02.png",
    descripcion: "No rayan tus sartenes de teflón. Resistentes hasta 230°C.",
    codigoCupon: "SETUTENSILIOS",
  },
  {
    id: "zp-30",
    nombre: "Jarra Térmica de Acero Inoxidable 1.5 Litros",
    categoria: "COCINA_MENAJE",
    marca: "Termolar",
    puntos: 200,
    valorSoles: 27.0,
    stock: 34,
    imagen: "/products/03.png",
    descripcion: "Mantiene bebidas calientes por 12 horas o frías por 24 horas.",
    codigoCupon: "JARRATERMICA",
  },
  {
    id: "zp-31",
    nombre: "Sartén Doble Panquequera Antiadherente 22cm",
    categoria: "COCINA_MENAJE",
    marca: "Record",
    puntos: 220,
    valorSoles: 29.0,
    stock: 26,
    imagen: "/products/04.png",
    descripcion: "Voltea tortillas, panqueques y huevos sin derrames gracias a su cierre magnético.",
    codigoCupon: "SARTENDOBLE",
  },
  {
    id: "zp-32",
    nombre: "Rallador de Acero Inoxidable 4 Caras con Contenedor",
    categoria: "COCINA_MENAJE",
    marca: "Facusa",
    puntos: 90,
    valorSoles: 12.0,
    stock: 70,
    imagen: "/products/05.png",
    descripcion: "Cuchillas ultra afiladas para queso, verduras y ralladura de cítricos.",
    codigoCupon: "RALLADOR4C",
  },
  {
    id: "zp-33",
    nombre: "Set de 4 Tapers Herméticos Libres de BPA",
    categoria: "COCINA_MENAJE",
    marca: "Rey Plast",
    puntos: 80,
    valorSoles: 11.0,
    stock: 80,
    imagen: "/products/06.png",
    descripcion: "Tapers apilables con silicona de sellado para transportar tu almuerzo.",
    codigoCupon: "TAPERS4REY",
  },
  {
    id: "zp-34",
    nombre: "Balanza Digital de Cocina con Precisión de 1 Gramo",
    categoria: "COCINA_MENAJE",
    marca: "SF-400",
    puntos: 150,
    valorSoles: 20.0,
    stock: 45,
    imagen: "/products/07.png",
    descripcion: "Pesa ingredientes hasta 10kg con función tara y pantalla LCD retroiluminada.",
    codigoCupon: "BALANZASPEC",
  },
  {
    id: "zp-35",
    nombre: "Colador Malla Fina de Acero Inox 20cm",
    categoria: "COCINA_MENAJE",
    marca: "Record",
    puntos: 70,
    valorSoles: 9.0,
    stock: 90,
    imagen: "/products/08.png",
    descripcion: "Especial para colar caldos, jugos y escurrir fideos calientes.",
    codigoCupon: "COLADORRECORD",
  },

  // --- 36 a 60: ELECTROHOGAR (ZETA PREMIA STYLE) ---
  {
    id: "zp-36",
    nombre: "Licuadora Oster Vaso de Vidrio 1.5L 2 Velocidades",
    categoria: "ELECTROHOGAR",
    marca: "Oster",
    puntos: 750,
    valorSoles: 110.0,
    stock: 14,
    imagen: "/products/09.png",
    descripcion: "Cuchilla trituradora de hielo All-Metal Drive con vaso resistente a choques térmicos.",
    codigoCupon: "LICUADORAOSTER",
    destacado: true,
    mostrarEnInicio: true,
    badgeInicio: "CALIDAD OSTER",
    ordenInicio: 7,
  },
  {
    id: "zp-37",
    nombre: "Olla Arrocera Imaco 1.8 Litros con Vaporera",
    categoria: "ELECTROHOGAR",
    marca: "Imaco",
    puntos: 590,
    valorSoles: 80.0,
    stock: 18,
    imagen: "/products/10.png",
    descripcion: "Cocina arroz graneado y verduras al vapor al mismo tiempo.",
    codigoCupon: "ARROCERAIMACO",
    destacado: true,
    mostrarEnInicio: true,
    badgeInicio: "CANJE FAVORITO",
    ordenInicio: 8,
  },
  {
    id: "zp-38",
    nombre: "Freidora de Aire Digital Oster 4 Litros",
    categoria: "ELECTROHOGAR",
    marca: "Oster",
    puntos: 1150,
    valorSoles: 180.0,
    stock: 6,
    imagen: "/products/11.png",
    descripcion: "Frituras crujientes con hasta 99.5% menos aceite gracias al aire circulante.",
    codigoCupon: "AIRFRYEROSTER",
    destacado: true,
    mostrarEnInicio: true,
    badgeInicio: "PREMIO ESTRELLA",
    ordenInicio: 9,
  },
  {
    id: "zp-39",
    nombre: "Hervidor Eléctrico Imaco 1.7 Litros Acero Inox",
    categoria: "ELECTROHOGAR",
    marca: "Imaco",
    puntos: 320,
    valorSoles: 45.0,
    stock: 28,
    imagen: "/products/12.png",
    descripcion: "Hierve agua en solo 3 minutos con apagado automático de seguridad.",
    codigoCupon: "HERVIDORIMACO",
  },
  {
    id: "zp-40",
    nombre: "Sandwichera Grill Eléctrica Imaco Placas Antiadherentes",
    categoria: "ELECTROHOGAR",
    marca: "Imaco",
    puntos: 340,
    valorSoles: 48.0,
    stock: 22,
    imagen: "/products/13.png",
    descripcion: "Sándwiches tostados y dorados en minutos sin que se pegue el queso.",
    codigoCupon: "SANDWICHERAIMA",
  },
  {
    id: "zp-41",
    nombre: "Batidora de Mano Philips 300W con Batidores Metálicos",
    categoria: "ELECTROHOGAR",
    marca: "Philips",
    puntos: 380,
    valorSoles: 55.0,
    stock: 20,
    imagen: "/products/15.png",
    descripcion: "5 velocidades más turbo para batir cremas, queques y merengues.",
    codigoCupon: "BATIDORAPHILIPS",
  },
  {
    id: "zp-42",
    nombre: "Plancha a Vapor Oster Base Antiadherente",
    categoria: "ELECTROHOGAR",
    marca: "Oster",
    puntos: 420,
    valorSoles: 60.0,
    stock: 25,
    imagen: "/products/01.png",
    descripcion: "Golpe de vapor vertical y selector de temperatura para cualquier tejido.",
    codigoCupon: "PLANCHAOSTER",
  },
  {
    id: "zp-43",
    nombre: "Cafetera de Goteo Imaco 12 Tazas Filtro Permanente",
    categoria: "ELECTROHOGAR",
    marca: "Imaco",
    puntos: 410,
    valorSoles: 58.0,
    stock: 19,
    imagen: "/products/02.png",
    descripcion: "Jarra de vidrio graduada con placa calefactora que mantiene el café caliente.",
    codigoCupon: "CAFETERAIMACO",
  },
  {
    id: "zp-44",
    nombre: "Exprimidor de Cítricos Eléctrico Philips 25W",
    categoria: "ELECTROHOGAR",
    marca: "Philips",
    puntos: 290,
    valorSoles: 39.0,
    stock: 30,
    imagen: "/products/03.png",
    descripcion: "Extrae hasta la última gota de naranjas y mandarinas con doble sentido de giro.",
    codigoCupon: "EXPRIMIDORPHIL",
  },
  {
    id: "zp-45",
    nombre: "Tostadora de Pan Imaco 2 Ranuras Regulables",
    categoria: "ELECTROHOGAR",
    marca: "Imaco",
    puntos: 260,
    valorSoles: 36.0,
    stock: 32,
    imagen: "/products/04.png",
    descripcion: "7 niveles de tostado con función descongelar y bandeja recoge migajas.",
    codigoCupon: "TOSTADORAPECO",
  },
  {
    id: "zp-46",
    nombre: "Picatodo Picador Eléctrico Oster 3 Tazas",
    categoria: "ELECTROHOGAR",
    marca: "Oster",
    puntos: 360,
    valorSoles: 49.0,
    stock: 24,
    imagen: "/products/05.png",
    descripcion: "Pica cebollas, ajo, frutos secos y hierbas aromáticas en segundos.",
    codigoCupon: "PICATODOOSTER",
  },
  {
    id: "zp-47",
    nombre: "Waflera Belga Eléctrica Antiadherente",
    categoria: "ELECTROHOGAR",
    marca: "Universal",
    puntos: 330,
    valorSoles: 44.0,
    stock: 22,
    imagen: "/products/06.png",
    descripcion: "Prepara 2 waffles gruesos y crujientes con luces indicadoras de cocción.",
    codigoCupon: "WAFLERAUNIV",
  },
  {
    id: "zp-48",
    nombre: "Ventilador de Mesa 12'' Imaco Silencioso",
    categoria: "ELECTROHOGAR",
    marca: "Imaco",
    puntos: 370,
    valorSoles: 50.0,
    stock: 26,
    imagen: "/products/07.png",
    descripcion: "Oscilación horizontal 90 grados y 3 velocidades de aire fresco.",
    codigoCupon: "VENTILADORIMACO",
  },
  {
    id: "zp-49",
    nombre: "Horno Tostador Eléctrico Imaco 10 Litros",
    categoria: "ELECTROHOGAR",
    marca: "Imaco",
    puntos: 680,
    valorSoles: 95.0,
    stock: 10,
    imagen: "/products/08.png",
    descripcion: "Hornea, tuesta y calienta pizzas, empanadas y carnes pequeñas.",
    codigoCupon: "HORNOTOSTADOR",
  },
  {
    id: "zp-4able",
    nombre: "Batidora de Pedestal con Tazón Giratorio 3.5L",
    categoria: "ELECTROHOGAR",
    marca: "Universal",
    puntos: 540,
    valorSoles: 75.0,
    stock: 14,
    imagen: "/products/09.png",
    descripcion: "Manos libres para repostería con batidores y ganchos amasadores incluidos.",
    codigoCupon: "BATIDORAPEDESTAL",
  },
  {
    id: "zp-51",
    nombre: "Parrilla Eléctrica Grill Antiadherente 1200W",
    categoria: "ELECTROHOGAR",
    marca: "Imaco",
    puntos: 490,
    valorSoles: 68.0,
    stock: 16,
    imagen: "/products/10.png",
    descripcion: "Cocina hamburguesas, chuletas y anticuchos sin humo dentro de casa.",
    codigoCupon: "PARRILLAELEC",
  },
  {
    id: "zp-52",
    nombre: "Extractor de Jugos Centrífugo 400W",
    categoria: "ELECTROHOGAR",
    marca: "Philips",
    puntos: 720,
    valorSoles: 105.0,
    stock: 9,
    imagen: "/products/11.png",
    descripcion: "Zumos naturales de zanahoria, manzana y betarraga separando la pulpa.",
    codigoCupon: "EXTRACTORPHIL",
  },
  {
    id: "zp-53",
    nombre: "Dispensador Eléctrico de Agua Recargable USB",
    categoria: "ELECTROHOGAR",
    marca: "PureWater",
    puntos: 120,
    valorSoles: 16.0,
    stock: 55,
    imagen: "/products/12.png",
    descripcion: "Se acopla a bidones de 20 litros bombeando agua con solo presionar un botón.",
    codigoCupon: "DISPENSADORUSB",
  },
  {
    id: "zp-54",
    nombre: "Picadora Manual de Verduras con Cuerda Tiradora",
    categoria: "ELECTROHOGAR",
    marca: "Ilko",
    puntos: 75,
    valorSoles: 10.0,
    stock: 85,
    imagen: "/products/13.png",
    descripcion: "Cero consumo eléctrico: jalas la cuerda y sus cuchillas giran a alta velocidad.",
    codigoCupon: "PICADORAMANUAL",
  },
  {
    id: "zp-55",
    nombre: "Plancha Seca Tradicional de Alta Potencia",
    categoria: "ELECTROHOGAR",
    marca: "Oster",
    puntos: 310,
    valorSoles: 43.0,
    stock: 30,
    imagen: "/products/15.png",
    descripcion: "Base de aluminio pulido que plancha rápido arrugas en camisas de algodón.",
    codigoCupon: "PLANCHASECA",
  },

  // --- 56 a 70: HOGAR & TEXTIL & LIMPIEZA ---
  {
    id: "zp-56",
    nombre: "Juego de Sábanas 2 Plazas Microfibra Suave",
    categoria: "HOGAR_TEXTIL",
    marca: "Cannon",
    puntos: 290,
    valorSoles: 39.0,
    stock: 35,
    imagen: "/products/01.png",
    descripcion: "Incluye sábana superior, bajera elástica y 2 fundas de almohada que no destiñen.",
    codigoCupon: "SABANAS2PLZ",
  },
  {
    id: "zp-57",
    nombre: "Toalla de Baño Grande 100% Algodón 500g",
    categoria: "HOGAR_TEXTIL",
    marca: "Zeta Premia",
    puntos: 140,
    valorSoles: 19.0,
    stock: 60,
    imagen: "/products/02.png",
    descripcion: "Máxima absorción y suavidad para secado rápido después de la ducha.",
    codigoCupon: "TOALLA100ALG",
  },
  {
    id: "zp-58",
    nombre: "Pack de 2 Almohadas Hoteleras de Silicona",
    categoria: "HOGAR_TEXTIL",
    marca: "DormiSoft",
    puntos: 230,
    valorSoles: 30.0,
    stock: 40,
    imagen: "/products/03.png",
    descripcion: "Relleno de fibra hueca siliconada que no pierde su volumen ni su forma.",
    codigoCupon: "ALMOHADAS2PK",
  },
  {
    id: "zp-59",
    nombre: "Tendedero de Ropa Plegable de Metal Reforzado",
    categoria: "HOGAR_TEXTIL",
    marca: "HogarPro",
    puntos: 260,
    valorSoles: 35.0,
    stock: 28,
    imagen: "/products/04.png",
    descripcion: "Soporta hasta 15kg de ropa húmeda. Se pliega compacto para guardar tras la puerta.",
    codigoCupon: "TENDEDEROMETA",
  },
  {
    id: "zp-60",
    nombre: "Cesto Plegable para Ropa Sucia con Asas",
    categoria: "HOGAR_TEXTIL",
    marca: "Rey Plast",
    puntos: 95,
    valorSoles: 13.0,
    stock: 65,
    imagen: "/products/05.png",
    descripcion: "Tela impermeable y ventilada que previene los malos olores de humedad.",
    codigoCupon: "CESTOPLEGABLE",
  },
  {
    id: "zp-61",
    nombre: "Mopa Giratoria 360 con Balde Escurridor",
    categoria: "HOGAR_TEXTIL",
    marca: "CleanMaster",
    puntos: 250,
    valorSoles: 34.0,
    stock: 35,
    imagen: "/products/06.png",
    descripcion: "Escurre el trapo sin tocar el agua sucia con su pedal centrífugo de acero.",
    codigoCupon: "MOPAGIRATORIA",
  },
  {
    id: "zp-62",
    nombre: "Set de 3 Organizadores de Ropa para Clóset",
    categoria: "HOGAR_TEXTIL",
    marca: "HomeBox",
    puntos: 120,
    valorSoles: 16.0,
    stock: 50,
    imagen: "/products/07.png",
    descripcion: "Cajas plegables con ventana transparente para frazadas, casacas y ropa de cama.",
    codigoCupon: "ORGANIZADORES3",
  },
  {
    id: "zp-63",
    nombre: "Alfombra de Baño Antideslizante Memory Foam",
    categoria: "HOGAR_TEXTIL",
    marca: "Zeta Premia",
    puntos: 85,
    valorSoles: 11.0,
    stock: 70,
    imagen: "/products/08.png",
    descripcion: "Espuma viscoelástica que absorbe agua al pisar y no resbala en mayólica.",
    codigoCupon: "ALFOMBRABANO",
  },
  {
    id: "zp-64",
    nombre: "Dispensador de Jabón Líquido con Sensor Infrarrojo",
    categoria: "HOGAR_TEXTIL",
    marca: "AutoSoap",
    puntos: 160,
    valorSoles: 22.0,
    stock: 38,
    imagen: "/products/09.png",
    descripcion: "Higiene sin contacto para manos con luz LED indicadora.",
    codigoCupon: "DISPENSADORJAB",
  },
  {
    id: "zp-65",
    nombre: "Lámpara de Noche LED Táctil con 3 Tonos de Luz",
    categoria: "HOGAR_TEXTIL",
    marca: "LuzHome",
    puntos: 140,
    valorSoles: 19.0,
    stock: 42,
    imagen: "/products/10.png",
    descripcion: "Batería recargable y control táctil para luz cálida, neutra o blanca.",
    codigoCupon: "LAMPARANOC",
  },
  {
    id: "zp-66",
    nombre: "Organizador de Zapatos Colgante de 24 Bolsillos",
    categoria: "HOGAR_TEXTIL",
    marca: "HomeBox",
    puntos: 90,
    valorSoles: 12.0,
    stock: 75,
    imagen: "/products/11.png",
    descripcion: "Se cuelga detrás de la puerta del dormitorio aprovechando al máximo el espacio.",
    codigoCupon: "ORGANIZADORZAP",
  },
  {
    id: "zp-67",
    nombre: "Manta Polar Térmica 1.5 Plazas Ultra Ligera",
    categoria: "HOGAR_TEXTIL",
    marca: "Cannon",
    puntos: 180,
    valorSoles: 24.0,
    stock: 45,
    imagen: "/products/12.png",
    descripcion: "Abrigo cálido y liviano para ver televisión en el mueble o para tu cama.",
    codigoCupon: "MANTAPOLAR",
  },
  {
    id: "zp-68",
    nombre: "Juego de 6 Colgadores de Ropa Terciopelo Slim",
    categoria: "HOGAR_TEXTIL",
    marca: "Zeta Premia",
    puntos: 70,
    valorSoles: 9.0,
    stock: 100,
    imagen: "/products/13.png",
    descripcion: "El terciopelo antideslizante evita que camisas y vestidos caigan al piso.",
    codigoCupon: "COLGADORESTER",
  },
  {
    id: "zp-69",
    nombre: "Plumero de Microfibra Extensible hasta 2.5 Metros",
    categoria: "HOGAR_TEXTIL",
    marca: "CleanMaster",
    puntos: 80,
    valorSoles: 10.0,
    stock: 85,
    imagen: "/products/15.png",
    descripcion: "Llega a techos altos, ventiladores y esquinas atrapando el polvo por estática.",
    codigoCupon: "PLUMEROEXT",
  },
  {
    id: "zp-70",
    nombre: "Reloj de Pared Minimalista Silencioso 30cm",
    categoria: "HOGAR_TEXTIL",
    marca: "Zeta Premia",
    puntos: 110,
    valorSoles: 15.0,
    stock: 50,
    imagen: "/products/01.png",
    descripcion: "Mecanismo continuo sin molesto tic-tac para sala o dormitorio.",
    codigoCupon: "RELOJPARED",
  },

  // --- 71 a 85: TECNOLOGÍA & AUDIO ---
  {
    id: "zp-71",
    nombre: "Parlante Bluetooth Portátil Resistente al Agua",
    categoria: "TECNOLOGIA",
    marca: "SoundPro",
    puntos: 320,
    valorSoles: 45.0,
    stock: 25,
    imagen: "/products/02.png",
    descripcion: "Graves potentes y batería para 8 horas continuas de música inalámbrica.",
    codigoCupon: "PARLANTEBT320",
    destacado: true,
  },
  {
    id: "zp-72",
    nombre: "Audífonos Inalámbricos Bluetooth TWS con Estuche",
    categoria: "TECNOLOGIA",
    marca: "Xiaomi Redmi",
    puntos: 380,
    valorSoles: 55.0,
    stock: 22,
    imagen: "/products/03.png",
    descripcion: "Cancelación de ruido en llamadas y conexión rápida Bluetooth 5.3.",
    codigoCupon: "AUDIFONOSXIA",
  },
  {
    id: "zp-73",
    nombre: "Power Bank Batería Externa 10,000 mAh Carga Rápida",
    categoria: "TECNOLOGIA",
    marca: "Baseus",
    puntos: 290,
    valorSoles: 40.0,
    stock: 30,
    imagen: "/products/04.png",
    descripcion: "Carga tu celular hasta 2.5 veces completas con 2 salidas USB simultáneas.",
    codigoCupon: "POWERBANK10K",
  },
  {
    id: "zp-74",
    nombre: "Reloj Inteligente Smartwatch Deportivo con Pulsómetro",
    categoria: "TECNOLOGIA",
    marca: "FitPro",
    puntos: 450,
    valorSoles: 65.0,
    stock: 18,
    imagen: "/products/05.png",
    descripcion: "Mide pasos, calorías, oxígeno en sangre y notifica mensajes de WhatsApp.",
    codigoCupon: "SMARTWATCH450",
    destacado: true,
  },
  {
    id: "zp-75",
    nombre: "Foco LED Inteligente RGB Wi-Fi Control por Celular",
    categoria: "TECNOLOGIA",
    marca: "SmartHome",
    puntos: 130,
    valorSoles: 18.0,
    stock: 50,
    imagen: "/products/06.png",
    descripcion: "Cambia entre 16 millones de colores y programa horarios desde tu app.",
    codigoCupon: "FOCOSMART",
  },
  {
    id: "zp-76",
    nombre: "Soporte para Celular de Auto con Fijación Automática",
    categoria: "TECNOLOGIA",
    marca: "AutoGrip",
    puntos: 90,
    valorSoles: 12.0,
    stock: 60,
    imagen: "/products/07.png",
    descripcion: "Se ajusta a la rejilla de ventilación sujetando el teléfono con una sola mano.",
    codigoCupon: "SOPORTEAUTO",
  },
  {
    id: "zp-77",
    nombre: "Aro de Luz LED 26cm con Trípode Ajustable para Celular",
    categoria: "TECNOLOGIA",
    marca: "PhotoPro",
    puntos: 210,
    valorSoles: 28.0,
    stock: 35,
    imagen: "/products/08.png",
    descripcion: "Excelente iluminación para videollamadas, fotos y videos de TikTok.",
    codigoCupon: "AROLUZ26",
  },
  {
    id: "zp-78",
    nombre: "Cable de Carga Rápida 3 en 1 Reforzado con Nylon",
    categoria: "TECNOLOGIA",
    marca: "Baseus",
    puntos: 75,
    valorSoles: 10.0,
    stock: 90,
    imagen: "/products/09.png",
    descripcion: "Conectores Type-C, Lightning (iPhone) y Micro USB en un solo cable de 1.2m.",
    codigoCupon: "CABLE3EN1",
  },
  {
    id: "zp-79",
    nombre: "Cargador Rápido de Pared Dual USB 20W",
    categoria: "TECNOLOGIA",
    marca: "QuickCharge",
    puntos: 110,
    valorSoles: 15.0,
    stock: 70,
    imagen: "/products/10.png",
    descripcion: "Carga 2 dispositivos a máxima velocidad con protección contra sobrecalentamiento.",
    codigoCupon: "CARGADOR20W",
  },
  {
    id: "zp-80",
    nombre: "Soporte Ergonómico para Laptop Plegable de Aluminio",
    categoria: "TECNOLOGIA",
    marca: "ErgoDesk",
    puntos: 170,
    valorSoles: 24.0,
    stock: 40,
    imagen: "/products/11.png",
    descripcion: "Eleva la pantalla a la altura de tus ojos evitando dolores de cuello.",
    codigoCupon: "SOPORTELAPTOP",
  },
  {
    id: "zp-81",
    nombre: "Mini Radio Portátil AM/FM Digital a Pilas y Batería",
    categoria: "TECNOLOGIA",
    marca: "SonicSound",
    puntos: 160,
    valorSoles: 22.0,
    stock: 45,
    imagen: "/products/12.png",
    descripcion: "Sintoniza tus noticias y partidos favoritos en cualquier rincón del hogar.",
    codigoCupon: "RADIOPORTATIL",
  },
  {
    id: "zp-82",
    nombre: "Combo Teclado y Mouse Inalámbrico Silencioso",
    categoria: "TECNOLOGIA",
    marca: "Logitech Style",
    puntos: 310,
    valorSoles: 44.0,
    stock: 26,
    imagen: "/products/13.png",
    descripcion: "Conexión USB nano de 2.4 GHz sin cables para teletrabajo y estudio.",
    codigoCupon: "COMBOTECLADO",
  },
  {
    id: "zp-83",
    nombre: "Enchufe Inteligente Wi-Fi con Monitor de Consumo",
    categoria: "TECNOLOGIA",
    marca: "SmartHome",
    puntos: 140,
    valorSoles: 19.0,
    stock: 50,
    imagen: "/products/15.png",
    descripcion: "Apaga o enciende artefactos desde tu celular y ahorra energía eléctrica.",
    codigoCupon: "ENCHUFESMART",
  },
  {
    id: "zp-84",
    nombre: "Audífonos de Vincha Acolchados con Micrófono",
    categoria: "TECNOLOGIA",
    marca: "SoundMax",
    puntos: 190,
    valorSoles: 26.0,
    stock: 35,
    imagen: "/products/01.png",
    descripcion: "Almohadillas suaves para clases virtuales, llamadas y música relajante.",
    codigoCupon: "AUDIFONOSVIN",
  },
  {
    id: "zp-85",
    nombre: "Linterna LED Recargable de Alta Potencia con Zoom",
    categoria: "TECNOLOGIA",
    marca: "BrightRay",
    puntos: 120,
    valorSoles: 16.0,
    stock: 55,
    imagen: "/products/02.png",
    descripcion: "Ilumina hasta 200 metros en la oscuridad. Cuerpo de aluminio militar.",
    codigoCupon: "LINTERNALED",
  },

  // --- 86 a 95: HERRAMIENTAS & FERRETERÍA ---
  {
    id: "zp-86",
    nombre: "Caja de Herramientas Plástica 16'' con Bandeja",
    categoria: "FERRETERIA",
    marca: "Stanley Style",
    puntos: 210,
    valorSoles: 29.0,
    stock: 30,
    imagen: "/products/03.png",
    descripcion: "Pestillo metálico y compartimentos superiores para tornillos y clavos.",
    codigoCupon: "CAJAHERRAM",
  },
  {
    id: "zp-87",
    nombre: "Juego de Destornilladores de Precisión 32 en 1",
    categoria: "FERRETERIA",
    marca: "ProTool",
    puntos: 110,
    valorSoles: 15.0,
    stock: 65,
    imagen: "/products/04.png",
    descripcion: "Puntas magnéticas para reparar celulares, relojes, anteojos y electrodomésticos.",
    codigoCupon: "DESTORNILLADORES",
  },
  {
    id: "zp-88",
    nombre: "Cinta Métrica Profesional 5 Metros con Bloqueo",
    categoria: "FERRETERIA",
    marca: "Stanley Style",
    puntos: 75,
    valorSoles: 10.0,
    stock: 90,
    imagen: "/products/05.png",
    descripcion: "Carcasa engomada antideslizante con cinta de acero milimetrada.",
    codigoCupon: "WINCHA5M",
  },
  {
    id: "zp-89",
    nombre: "Alicate Universal 8'' de Cromo Vanadio Aislado",
    categoria: "FERRETERIA",
    marca: "Truper Style",
    puntos: 120,
    valorSoles: 16.0,
    stock: 50,
    imagen: "/products/06.png",
    descripcion: "Mango ergonómico con filo templado para corte de cables y sujeción fuerte.",
    codigoCupon: "ALICATE8P",
  },
  {
    id: "zp-90",
    nombre: "Taladro Percutor 500W con Mandril 1/2'' y Maletín",
    categoria: "FERRETERIA",
    marca: "BlackPro",
    puntos: 780,
    valorSoles: 115.0,
    stock: 12,
    imagen: "/products/07.png",
    descripcion: "Perfora concreto, madera y metal con selector de percusión y reversa.",
    codigoCupon: "TALADRO500W",
    destacado: true,
  },
  {
    id: "zp-91",
    nombre: "Juego de Llaves Combinadas 8 Piezas 8mm a 19mm",
    categoria: "FERRETERIA",
    marca: "ProTool",
    puntos: 190,
    valorSoles: 26.0,
    stock: 35,
    imagen: "/products/08.png",
    descripcion: "Acero forjado con boca fija y corona para mecánica básica y plomería.",
    codigoCupon: "LLAVES8PZ",
  },
  {
    id: "zp-92",
    nombre: "Inflador Manual de Alta Presión con Manómetro",
    categoria: "FERRETERIA",
    marca: "AirBike",
    puntos: 150,
    valorSoles: 20.0,
    stock: 45,
    imagen: "/products/09.png",
    descripcion: "Para llantas de bicicleta, moto, pelotas y colchones inflables.",
    codigoCupon: "INFLADORMAN",
  },
  {
    id: "zp-93",
    nombre: "Linterna Frontal de Cabeza Recargable LED",
    categoria: "FERRETERIA",
    marca: "HeadBeam",
    puntos: 100,
    valorSoles: 14.0,
    stock: 60,
    imagen: "/products/10.png",
    descripcion: "Manos libres para reparaciones en la oscuridad, gasfitería o paseos nocturnos.",
    codigoCupon: "LINTERNAFRONT",
  },
  {
    id: "zp-94",
    nombre: "Set de 13 Brocas para Metal y Madera HSS",
    categoria: "FERRETERIA",
    marca: "ProTool",
    puntos: 110,
    valorSoles: 15.0,
    stock: 55,
    imagen: "/products/11.png",
    descripcion: "Medidas desde 1.5mm hasta 6.5mm en estuche organizador metálico.",
    codigoCupon: "SETBROCAS",
  },
  {
    id: "zp-95",
    nombre: "Kit de Primeros Auxilios Botiquín Portátil",
    categoria: "FERRETERIA",
    marca: "SafeCare",
    puntos: 90,
    valorSoles: 12.0,
    stock: 75,
    imagen: "/products/12.png",
    descripcion: "Incluye gasas, vendas, tijera, esparadrapo y antiséptico para auto o casa.",
    codigoCupon: "BOTIQUINPORT",
  },

  // --- 96 a 100: NIÑOS & CUIDADO PERSONAL ---
  {
    id: "zp-96",
    nombre: "Mochila Escolar Impermeable con Espaldar Acolchado",
    categoria: "CUIDADO_NINOS",
    marca: "Zeta Premia",
    puntos: 280,
    valorSoles: 38.0,
    stock: 30,
    imagen: "/products/13.png",
    descripcion: "Compartimentos reforzados para cuadernos A4, libros y botella lateral.",
    codigoCupon: "MOCHILAESC",
  },
  {
    id: "zp-97",
    nombre: "Lonchera Térmica Infantil con Aislamiento de Aluminio",
    categoria: "CUIDADO_NINOS",
    marca: "KidsMeal",
    puntos: 130,
    valorSoles: 18.0,
    stock: 50,
    imagen: "/products/15.png",
    descripcion: "Mantiene la fruta fresca y el refrigerio escolar en óptimas condiciones.",
    codigoCupon: "LONCHERATERM",
  },
  {
    id: "zp-98",
    nombre: "Termo Infantil de Acero Inox con Cañita 500ml",
    categoria: "CUIDADO_NINOS",
    marca: "KidsTherm",
    puntos: 170,
    valorSoles: 23.0,
    stock: 45,
    imagen: "/products/01.png",
    descripcion: "Antiderrame con botón de apertura rápida y correa para colgar al hombro.",
    codigoCupon: "TERMOINFANTIL",
  },
  {
    id: "zp-99",
    nombre: "Secadora de Cabello Plegable 1800W con Boquilla",
    categoria: "CUIDADO_NINOS",
    marca: "Philips Style",
    puntos: 360,
    valorSoles: 50.0,
    stock: 22,
    imagen: "/products/02.png",
    descripcion: "2 niveles de calor y aire frío. Mango plegable fácil de llevar de viaje.",
    codigoCupon: "SECADORACAB",
  },
  {
    id: "zp-100",
    nombre: "Set de Manicura Profesional 12 Piezas en Estuche",
    categoria: "CUIDADO_NINOS",
    marca: "BeautyPro",
    puntos: 95,
    valorSoles: 13.0,
    stock: 80,
    imagen: "/products/03.png",
    descripcion: "Acero inoxidable para manos, pies y rostro en elegante estuche de cuero sintético.",
    codigoCupon: "SETMANICURA",
  },
];

// =========================================================================
// MÉTODOS DE PERSISTENCIA Y ADMINISTRACIÓN (SUPER ADMIN & CLIENTES)
// =========================================================================
const STORAGE_KEY_PREMIOS = "rappigas_catalogo_premios";

export function obtenerCatalogoPremios(): PremioCanje[] {
  if (typeof window === "undefined") {
    return PREMIOS_ZETA_PREMIA;
  }
  try {
    const data = localStorage.getItem(STORAGE_KEY_PREMIOS);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_PREMIOS, JSON.stringify(PREMIOS_ZETA_PREMIA));
      return PREMIOS_ZETA_PREMIA;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : PREMIOS_ZETA_PREMIA;
  } catch {
    return PREMIOS_ZETA_PREMIA;
  }
}

export function guardarCatalogoPremios(premios: PremioCanje[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_PREMIOS, JSON.stringify(premios));
    window.dispatchEvent(new Event("catalogo_premios_actualizado"));
    window.dispatchEvent(new CustomEvent("rappigas_catalogo_sincronizado", { detail: premios }));
  } catch (err) {
    console.error("Error al guardar catálogo de premios:", err);
  }
}

export function agregarPremio(nuevo: Omit<PremioCanje, "id">): PremioCanje {
  const catalogo = obtenerCatalogoPremios();
  const id = `zp-${Date.now().toString(36)}`;
  const premioCompleto: PremioCanje = { ...nuevo, id };
  const actualizado = [premioCompleto, ...catalogo];
  guardarCatalogoPremios(actualizado);
  const idx = PREMIOS_ZETA_PREMIA.findIndex((p) => p.id === id);
  if (idx === -1) {
    PREMIOS_ZETA_PREMIA.unshift(premioCompleto);
  }
  return premioCompleto;
}

export function actualizarPremio(id: string, cambios: Partial<PremioCanje>): PremioCanje | null {
  const catalogo = obtenerCatalogoPremios();
  let encontrado: PremioCanje | null = null;
  const actualizado = catalogo.map((p) => {
    if (p.id === id) {
      encontrado = { ...p, ...cambios };
      return encontrado;
    }
    return p;
  });
  if (encontrado) {
    guardarCatalogoPremios(actualizado);
    const memIdx = PREMIOS_ZETA_PREMIA.findIndex((p) => p.id === id);
    if (memIdx !== -1) {
      PREMIOS_ZETA_PREMIA[memIdx] = { ...PREMIOS_ZETA_PREMIA[memIdx], ...cambios };
    }
  }
  return encontrado;
}

export function eliminarPremio(id: string): boolean {
  const catalogo = obtenerCatalogoPremios();
  const filtrado = catalogo.filter((p) => p.id !== id);
  if (filtrado.length !== catalogo.length) {
    guardarCatalogoPremios(filtrado);
    const memIdx = PREMIOS_ZETA_PREMIA.findIndex((p) => p.id === id);
    if (memIdx !== -1) {
      PREMIOS_ZETA_PREMIA.splice(memIdx, 1);
    }
    return true;
  }
  return false;
}

export function actualizarStockPremio(id: string, nuevoStock: number): boolean {
  return !!actualizarPremio(id, { stock: Math.max(0, nuevoStock) });
}

export function alternarMostrarEnInicio(id: string): boolean {
  const catalogo = obtenerCatalogoPremios();
  const premio = catalogo.find((p) => p.id === id);
  if (!premio) return false;
  const nuevoEstado = !premio.mostrarEnInicio;
  actualizarPremio(id, { mostrarEnInicio: nuevoEstado });
  return nuevoEstado;
}

export function obtenerPremiosInicio(): PremioCanje[] {
  const catalogo = obtenerCatalogoPremios();
  const enInicio = catalogo.filter((p) => p.mostrarEnInicio === true);
  if (enInicio.length > 0) {
    return [...enInicio].sort((a, b) => (a.ordenInicio ?? 99) - (b.ordenInicio ?? 99));
  }
  // Si no hay premios explícitos para inicio, retornar destacados o los primeros
  const destacados = catalogo.filter((p) => p.destacado);
  return destacados.length > 0 ? destacados.slice(0, 10) : catalogo.slice(0, 8);
}

// =============================================================================
// REGLAS DE EQUIVALENCIA Y CÁLCULO DE PUNTOS COMERCIALES (OPCIÓN 1)
// =============================================================================
export interface RatioCategoriaInfo {
  ratio: number;
  etiqueta: string;
  motivo: string;
}

export function obtenerRatioPorCategoria(categoria: string): RatioCategoriaInfo {
  let ratios = {
    ratioValesGas: 8.7,       // Balones y vales: margen de caja protegido
    ratioMenajeCocina: 7.5,   // Ollas y sartenes: canje rápido con margen mayorista
    ratioElectroHogar: 7.8,   // Electrodomésticos: balance comercial
    puntosPorSol: 8.0,        // Tasa general base
  };

  if (typeof window !== "undefined") {
    try {
      const cfg = localStorage.getItem("rappigas_puntos_config_v2");
      if (cfg) {
        const parsed = JSON.parse(cfg);
        ratios = { ...ratios, ...parsed };
      }
    } catch {
      // Ignorar fallback
    }
  }

  const cat = (categoria || "").toUpperCase();
  if (cat.includes("GAS") || cat.includes("VALE")) {
    return {
      ratio: ratios.ratioValesGas || 8.7,
      etiqueta: "Vales y Balones (Opción 1)",
      motivo: "Protección de caja y margen de gas",
    };
  }
  if (cat.includes("COCINA") || cat.includes("MENAJE")) {
    return {
      ratio: ratios.ratioMenajeCocina || 7.5,
      etiqueta: "Cocina y Menaje (Opción 1)",
      motivo: "Rotación rápida e incentivo fidelizador",
    };
  }
  if (cat.includes("ELECTRO") || cat.includes("TECNOLOG") || cat.includes("HOGAR")) {
    return {
      ratio: ratios.ratioElectroHogar || 7.8,
      etiqueta: "Electrohogar (Opción 1)",
      motivo: "Equilibrio comercial y valor percibido",
    };
  }

  return {
    ratio: ratios.puntosPorSol || 8.0,
    etiqueta: "General / Estándar",
    motivo: "Tasa base estándar",
  };
}

export function calcularPuntosSugeridos(valorSoles: number, categoria: string): number {
  if (valorSoles <= 0) return 0;
  const { ratio } = obtenerRatioPorCategoria(categoria);
  const puntosBrutos = Math.round(valorSoles * ratio);
  // Redondeo comercial amigable a decenas
  return Math.max(10, Math.round(puntosBrutos / 10) * 10);
}

// =============================================================================
// GESTIÓN Y PERSISTENCIA DE CATEGORÍAS
// =============================================================================
export const STORAGE_KEY_CATEGORIAS = "rappigas_catalogo_categorias";

export function obtenerCategorias(): CategoriaPremio[] {
  if (typeof window === "undefined") return CATEGORIAS_CONFIG_DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIAS);
    if (!raw) return CATEGORIAS_CONFIG_DEFAULT;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (err) {
    console.error("Error al leer categorías de localStorage:", err);
  }
  return CATEGORIAS_CONFIG_DEFAULT;
}

export function guardarCategorias(categorias: CategoriaPremio[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIAS, JSON.stringify(categorias));
    window.dispatchEvent(new Event("catalogo_categorias_actualizado"));
  } catch (err) {
    console.error("Error al guardar categorías:", err);
  }
}

export function agregarCategoria(nueva: Omit<CategoriaPremio, "id"> & { id?: string }): CategoriaPremio {
  const categorias = obtenerCategorias();
  const idGenerado = nueva.id?.trim()
    ? nueva.id.trim().toUpperCase().replace(/\s+/g, "_")
    : `CAT_${Date.now().toString(36).toUpperCase()}`;

  const categoriaCompleta: CategoriaPremio = {
    id: idGenerado,
    nombre: nueva.nombre.trim(),
    icono: nueva.icono?.trim() || "🎁",
    badgeCls: nueva.badgeCls || "bg-orange-50 text-orange-700 border-orange-200",
    descripcion: nueva.descripcion || "",
  };

  const actualizadas = [...categorias, categoriaCompleta];
  guardarCategorias(actualizadas);
  return categoriaCompleta;
}

export function actualizarCategoria(id: string, cambios: Partial<CategoriaPremio>): CategoriaPremio | null {
  const categorias = obtenerCategorias();
  let encontrada: CategoriaPremio | null = null;
  const actualizadas = categorias.map((c) => {
    if (c.id === id) {
      encontrada = { ...c, ...cambios };
      return encontrada;
    }
    return c;
  });
  if (encontrada) {
    guardarCategorias(actualizadas);
  }
  return encontrada;
}

export function eliminarCategoria(id: string): boolean {
  if (id === "TODOS") return false;
  const categorias = obtenerCategorias();
  const filtradas = categorias.filter((c) => c.id !== id);
  if (filtradas.length !== categorias.length) {
    guardarCategorias(filtradas);
    return true;
  }
  return false;
}

export function restablecerCategorias(): CategoriaPremio[] {
  guardarCategorias(CATEGORIAS_CONFIG_DEFAULT);
  return CATEGORIAS_CONFIG_DEFAULT;
}
