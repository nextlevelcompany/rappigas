import { EmpresaDetalle } from "./api/empresas.api";

// Diccionario de coordenadas para distritos clave de Perú por Código INEI (Ubigeo)
export const UBIGEO_COORDENADAS_PERU: Record<string, { lat: number; lng: number; nombre: string }> = {
  // LIMA METROPOLITANA (1501xx)
  "150101": { lat: -12.0464, lng: -77.0428, nombre: "Lima (Cercado)" },
  "150102": { lat: -11.7733, lng: -77.1764, nombre: "Ancón" },
  "150103": { lat: -12.0250, lng: -76.9180, nombre: "Ate" },
  "150104": { lat: -12.1489, lng: -77.0211, nombre: "Barranco" },
  "150105": { lat: -12.0578, lng: -77.0506, nombre: "Breña" },
  "150106": { lat: -11.8986, lng: -77.0347, nombre: "Carabayllo" },
  "150107": { lat: -11.9750, lng: -76.7686, nombre: "Chaclacayo" },
  "150108": { lat: -12.1856, lng: -77.0167, nombre: "Chorrillos" },
  "150109": { lat: -12.0911, lng: -76.7831, nombre: "Cieneguilla" },
  "150110": { lat: -11.9333, lng: -77.0500, nombre: "Comas" },
  "150111": { lat: -12.0478, lng: -77.0017, nombre: "El Agustino" },
  "150112": { lat: -11.9975, lng: -77.0450, nombre: "Independencia" },
  "150113": { lat: -12.0750, lng: -77.0485, nombre: "Jesús María" },
  "150114": { lat: -12.0833, lng: -76.9450, nombre: "La Molina" },
  "150115": { lat: -12.0658, lng: -77.0189, nombre: "La Victoria" },
  "150116": { lat: -12.0839, lng: -77.0353, nombre: "Lince" },
  "150117": { lat: -11.9912, lng: -77.0711, nombre: "Los Olivos" },
  "150118": { lat: -11.9392, lng: -76.7011, nombre: "Lurigancho (Chosica)" },
  "150119": { lat: -12.2747, lng: -76.8711, nombre: "Lurín" },
  "150120": { lat: -12.0917, lng: -77.0694, nombre: "Magdalena del Mar" },
  "150121": { lat: -12.1225, lng: -77.0300, nombre: "Miraflores" },
  "150122": { lat: -12.2289, lng: -76.8622, nombre: "Pachacámac" },
  "150123": { lat: -12.4833, lng: -76.7981, nombre: "Pucusana" },
  "150124": { lat: -12.0747, lng: -77.0631, nombre: "Pueblo Libre" },
  "150125": { lat: -11.8667, lng: -77.0750, nombre: "Puente Piedra" },
  "150126": { lat: -12.3361, lng: -76.8242, nombre: "Punta Hermosa" },
  "150127": { lat: -12.3667, lng: -76.8000, nombre: "Punta Negra" },
  "150128": { lat: -12.0308, lng: -77.0319, nombre: "Rímac" },
  "150129": { lat: -12.3897, lng: -76.7761, nombre: "San Bartolo" },
  "150130": { lat: -12.0950, lng: -76.9975, nombre: "San Borja" },
  "150131": { lat: -12.0975, lng: -77.0375, nombre: "San Isidro" },
  "150132": { lat: -11.9750, lng: -76.9875, nombre: "San Juan de Lurigancho" },
  "150133": { lat: -12.1611, lng: -76.9639, nombre: "San Juan de Miraflores" },
  "150134": { lat: -12.0739, lng: -76.9961, nombre: "San Luis" },
  "150135": { lat: -12.0125, lng: -77.0675, nombre: "San Martín de Porres" },
  "150136": { lat: -12.0772, lng: -77.0869, nombre: "San Miguel" },
  "150137": { lat: -12.0439, lng: -76.9711, nombre: "Santa Anita" },
  "150138": { lat: -12.4042, lng: -76.7681, nombre: "Santa María del Mar" },
  "150139": { lat: -11.8028, lng: -77.1639, nombre: "Santa Rosa" },
  "150140": { lat: -12.1425, lng: -76.9875, nombre: "Santiago de Surco" },
  "150141": { lat: -12.1122, lng: -77.0222, nombre: "Surquillo" },
  "150142": { lat: -12.2125, lng: -76.9400, nombre: "Villa El Salvador" },
  "150143": { lat: -12.1603, lng: -76.9297, nombre: "Villa María del Triunfo" },

  // CALLAO (0701xx)
  "070101": { lat: -12.0560, lng: -77.1180, nombre: "Callao" },
  "070102": { lat: -12.0622, lng: -77.1278, nombre: "Bellavista" },
  "070103": { lat: -12.0433, lng: -77.0894, nombre: "Carmen de la Legua" },
  "070104": { lat: -12.0700, lng: -77.1283, nombre: "La Perla" },
  "070105": { lat: -12.0717, lng: -77.1611, nombre: "La Punta" },
  "070106": { lat: -11.8767, lng: -77.1283, nombre: "Ventanilla" },
  "070107": { lat: -11.8517, lng: -77.1219, nombre: "Mi Perú" },

  // CIUDADES Y REGIONES PRINCIPALES DE PERÚ
  "040101": { lat: -16.4090, lng: -71.5375, nombre: "Arequipa (Cercado)" },
  "130101": { lat: -8.1117, lng: -79.0287, nombre: "Trujillo" },
  "140101": { lat: -6.7714, lng: -79.8409, nombre: "Chiclayo" },
  "200101": { lat: -5.1945, lng: -80.6328, nombre: "Piura" },
  "110101": { lat: -14.0678, lng: -75.7286, nombre: "Ica" },
  "080101": { lat: -13.5320, lng: -71.9675, nombre: "Cusco" },
  "120101": { lat: -12.0651, lng: -75.2049, nombre: "Huancayo" },
  "020101": { lat: -9.5278, lng: -77.5278, nombre: "Huaraz" },
  "160101": { lat: -3.7491, lng: -73.2538, nombre: "Iquitos" },
  "220101": { lat: -6.4854, lng: -76.3689, nombre: "Moyobamba / Tarapoto" },
  "230101": { lat: -18.0066, lng: -70.2463, nombre: "Tacna" },
  "210101": { lat: -15.8422, lng: -70.0199, nombre: "Puno" },
  "250101": { lat: -8.3791, lng: -74.5539, nombre: "Pucallpa" },
  "060101": { lat: -7.1617, lng: -78.5128, nombre: "Cajamarca" },
  "050101": { lat: -13.1588, lng: -74.2239, nombre: "Ayacucho" },
  "100101": { lat: -9.9306, lng: -76.2422, nombre: "Huánuco" },
  "090101": { lat: -12.7878, lng: -74.9756, nombre: "Huancavelica" },
  "030101": { lat: -13.6339, lng: -72.8814, nombre: "Abancay" },
  "180101": { lat: -17.1983, lng: -70.9356, nombre: "Moquegua" },
  "190101": { lat: -10.6675, lng: -76.2561, nombre: "Cerro de Pasco" },
  "240101": { lat: -3.5669, lng: -80.4515, nombre: "Tumbes" },
  "170101": { lat: -12.5933, lng: -69.1892, nombre: "Puerto Maldonado" },
  "010101": { lat: -6.2294, lng: -77.8714, nombre: "Chachapoyas" },
};

// Coordenadas departamentales de respaldo
export const DEPARTAMENTO_COORDENADAS_PERU: Record<string, { lat: number; lng: number }> = {
  LIMA: { lat: -12.0464, lng: -77.0428 },
  CALLAO: { lat: -12.0560, lng: -77.1180 },
  AREQUIPA: { lat: -16.4090, lng: -71.5375 },
  "LA LIBERTAD": { lat: -8.1117, lng: -79.0287 },
  LAMBAYEQUE: { lat: -6.7714, lng: -79.8409 },
  PIURA: { lat: -5.1945, lng: -80.6328 },
  ICA: { lat: -14.0678, lng: -75.7286 },
  CUSCO: { lat: -13.5320, lng: -71.9675 },
  JUNIN: { lat: -12.0651, lng: -75.2049 },
  ANCASH: { lat: -9.5278, lng: -77.5278 },
  PUNO: { lat: -15.8422, lng: -70.0199 },
  TACNA: { lat: -18.0066, lng: -70.2463 },
  UCAYALI: { lat: -8.3791, lng: -74.5539 },
  LORETO: { lat: -3.7491, lng: -73.2538 },
  "SAN MARTIN": { lat: -6.4854, lng: -76.3689 },
  CAJAMARCA: { lat: -7.1617, lng: -78.5128 },
  AYACUCHO: { lat: -13.1588, lng: -74.2239 },
  HUANUCO: { lat: -9.9306, lng: -76.2422 },
  HUANCAVELICA: { lat: -12.7878, lng: -74.9756 },
  APURIMAC: { lat: -13.6339, lng: -72.8814 },
  MOQUEGUA: { lat: -17.1983, lng: -70.9356 },
  PASCO: { lat: -10.6675, lng: -76.2561 },
  TUMBES: { lat: -3.5669, lng: -80.4515 },
  "MADRE DE DIOS": { lat: -12.5933, lng: -69.1892 },
  AMAZONAS: { lat: -6.2294, lng: -77.8714 },
};

// Función para calcular distancia haversine en KM (sin dependencias de DOM/Leaflet)
export const calcularDistanciaKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

// Resolver coordenadas de un Ubigeo INEI de Perú
export const obtenerCoordenadasPorUbigeo = (
  codigoInei?: string,
  departamento?: string,
  distrito?: string
): { lat: number; lng: number } => {
  if (codigoInei && UBIGEO_COORDENADAS_PERU[codigoInei]) {
    return {
      lat: UBIGEO_COORDENADAS_PERU[codigoInei].lat,
      lng: UBIGEO_COORDENADAS_PERU[codigoInei].lng,
    };
  }

  // Buscar por nombre de distrito en la tabla de ubigeos
  if (distrito) {
    const distNorm = distrito.trim().toUpperCase();
    for (const [_, data] of Object.entries(UBIGEO_COORDENADAS_PERU)) {
      if (data.nombre.toUpperCase().includes(distNorm)) {
        return { lat: data.lat, lng: data.lng };
      }
    }
  }

  // Si no coincide distrito, usar centroide del departamento
  if (departamento) {
    const depNorm = departamento.trim().toUpperCase();
    if (DEPARTAMENTO_COORDENADAS_PERU[depNorm]) {
      return DEPARTAMENTO_COORDENADAS_PERU[depNorm];
    }
  }

  // Defecto: Los Olivos / Lima Centro
  return { lat: -11.9912, lng: -77.0711 };
};

// Resolver coordenadas de una empresa según GPS explícito, Ubigeo o reconocimiento de distrito
export const obtenerCoordenadasDistribuidora = (
  dist: EmpresaDetalle,
  latRef: number = -11.9912,
  lngRef: number = -77.0711,
  idx: number = 0,
  total: number = 1
): { lat: number; lng: number } => {
  // 1. Coordenadas numéricas directas
  if (
    typeof dist.latitud === "number" &&
    typeof dist.longitud === "number" &&
    !isNaN(dist.latitud) &&
    !isNaN(dist.longitud) &&
    dist.latitud !== 0
  ) {
    return { lat: dist.latitud, lng: dist.longitud };
  }

  // 2. Extraer tag [GPS: lat, lng]
  if (dist.direccionFiscal) {
    const matchGps = dist.direccionFiscal.match(
      /\[GPS:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/
    );
    if (matchGps) {
      const pLat = parseFloat(matchGps[1]);
      const pLng = parseFloat(matchGps[2]);
      if (!isNaN(pLat) && !isNaN(pLng)) {
        return { lat: pLat, lng: pLng };
      }
    }

    // 3. Extraer Ubigeo del texto ej. (Ubigeo: 150101) o [Ubigeo: 150112]
    const matchUbigeo = dist.direccionFiscal.match(/Ubigeo:\s*(\d{6})/i);
    if (matchUbigeo && UBIGEO_COORDENADAS_PERU[matchUbigeo[1]]) {
      return {
        lat: UBIGEO_COORDENADAS_PERU[matchUbigeo[1]].lat,
        lng: UBIGEO_COORDENADAS_PERU[matchUbigeo[1]].lng,
      };
    }
  }

  const texto = `${dist.nombreComercial || ""} ${dist.razonSocial || ""} ${dist.direccionFiscal || ""} ${dist.zonaNombre || ""}`.toLowerCase();

  if (texto.includes("los olivos")) return { lat: -11.9925, lng: -77.0715 };
  if (texto.includes("independencia") || texto.includes("tahuantinsuyo"))
    return { lat: -11.9975, lng: -77.0450 };
  if (
    texto.includes("san martin") ||
    texto.includes("condevilla") ||
    texto.includes("palao")
  )
    return { lat: -12.0125, lng: -77.0675 };
  if (texto.includes("miraflores")) return { lat: -12.1225, lng: -77.0300 };
  if (texto.includes("san isidro")) return { lat: -12.0975, lng: -77.0375 };
  if (
    texto.includes("surco") ||
    texto.includes("chacarilla") ||
    texto.includes("monterrico")
  )
    return { lat: -12.1425, lng: -76.9875 };
  if (texto.includes("san borja")) return { lat: -12.0950, lng: -76.9975 };
  if (
    texto.includes("jesus maria") ||
    texto.includes("jesús maría") ||
    texto.includes("lince")
  )
    return { lat: -12.0750, lng: -77.0485 };
  if (texto.includes("lurigancho") || texto.includes("sjl"))
    return { lat: -11.9750, lng: -76.9875 };
  if (texto.includes("callao")) return { lat: -12.0560, lng: -77.1180 };
  if (texto.includes("villa el salvador") || texto.includes("ves"))
    return { lat: -12.2125, lng: -76.9400 };

  // Fallback radial ordenado cerca a la ubicación de referencia
  const angle = (idx * (2 * Math.PI)) / Math.max(1, total);
  const offsetDist = 0.012 + (idx % 3) * 0.007;
  return {
    lat: Number((latRef + Math.sin(angle) * offsetDist).toFixed(6)),
    lng: Number((lngRef + Math.cos(angle) * offsetDist).toFixed(6)),
  };
};
