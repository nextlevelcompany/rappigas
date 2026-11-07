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
  "040103": { lat: -16.3764, lng: -71.5514, nombre: "Cayma" },
  "040104": { lat: -16.3686, lng: -71.5647, nombre: "Cerro Colorado" },
  "040126": { lat: -16.3881, lng: -71.5411, nombre: "Yanahuara" },
  "040114": { lat: -16.4278, lng: -71.5056, nombre: "Paucarpata" },
  "040110": { lat: -16.3986, lng: -71.5228, nombre: "Miraflores (Arequipa)" },
  "040129": { lat: -16.4258, lng: -71.5239, nombre: "José Luis Bustamante y Rivero" },
  "040119": { lat: -16.4628, lng: -71.5267, nombre: "Socabaya" },

  // CUSCO (0801xx)
  "080101": { lat: -13.5320, lng: -71.9675, nombre: "Cusco" },
  "080108": { lat: -13.5250, lng: -71.9575, nombre: "Wanchaq" },
  "080106": { lat: -13.5350, lng: -71.9840, nombre: "Santiago" },
  "080105": { lat: -13.5300, lng: -71.9333, nombre: "San Sebastián" },
  "080104": { lat: -13.5467, lng: -71.8989, nombre: "San Jerónimo" },

  // LA LIBERTAD (1301xx)
  "130101": { lat: -8.1117, lng: -79.0287, nombre: "Trujillo" },
  "130111": { lat: -8.1364, lng: -79.0436, nombre: "Víctor Larco Herrera" },
  "130104": { lat: -8.0833, lng: -79.1167, nombre: "Huanchaco" },
  "130102": { lat: -8.0850, lng: -79.0028, nombre: "El Porvenir" },
  "130105": { lat: -8.0700, lng: -79.0389, nombre: "La Esperanza" },
  "130103": { lat: -8.0864, lng: -79.0200, nombre: "Florencia de Mora" },
  "130107": { lat: -8.1714, lng: -79.0089, nombre: "Moche" },

  // LAMBAYEQUE (1401xx)
  "140101": { lat: -6.7714, lng: -79.8409, nombre: "Chiclayo" },
  "140105": { lat: -6.7583, lng: -79.8431, nombre: "José Leonardo Ortiz" },
  "140114": { lat: -6.7867, lng: -79.8400, nombre: "La Victoria (Chiclayo)" },
  "140112": { lat: -6.8333, lng: -79.9333, nombre: "Pimentel" },
  "140301": { lat: -6.7028, lng: -79.9042, nombre: "Lambayeque" },
  "140201": { lat: -6.6389, lng: -79.7889, nombre: "Ferreñafe" },

  // PIURA (2001xx)
  "200101": { lat: -5.1945, lng: -80.6328, nombre: "Piura" },
  "200104": { lat: -5.1983, lng: -80.6186, nombre: "Castilla" },
  "200105": { lat: -5.2667, lng: -80.6833, nombre: "Catacaos" },
  "200114": { lat: -5.1833, lng: -80.6550, nombre: "Veintiséis de Octubre" },
  "200601": { lat: -4.9039, lng: -80.6853, nombre: "Sullana" },
  "200701": { lat: -4.5772, lng: -81.2719, nombre: "Talara" },

  // JUNIN (1201xx)
  "120101": { lat: -12.0651, lng: -75.2049, nombre: "Huancayo" },
  "120114": { lat: -12.0469, lng: -75.2181, nombre: "El Tambo" },
  "120107": { lat: -12.0833, lng: -75.2000, nombre: "Chilca" },

  // ICA (1101xx)
  "110101": { lat: -14.0678, lng: -75.7286, nombre: "Ica" },
  "110105": { lat: -14.0533, lng: -75.7067, nombre: "Parcona" },
  "110112": { lat: -14.0167, lng: -75.7583, nombre: "Subtanjalla" },
  "110201": { lat: -13.4167, lng: -76.1333, nombre: "Chincha Alta" },
  "110501": { lat: -13.7103, lng: -76.2053, nombre: "Pisco" },

  // ANCASH (0201xx / 0218xx)
  "020101": { lat: -9.5278, lng: -77.5278, nombre: "Huaraz" },
  "021801": { lat: -9.0764, lng: -78.5925, nombre: "Chimbote" },
  "021809": { lat: -9.1233, lng: -78.5300, nombre: "Nuevo Chimbote" },

  // TACNA (2301xx)
  "230101": { lat: -18.0066, lng: -70.2463, nombre: "Tacna" },
  "230110": { lat: -18.0461, lng: -70.2522, nombre: "Crnl. Gregorio Albarracín" },
  "230102": { lat: -18.0011, lng: -70.2458, nombre: "Alto de la Alianza" },

  // OTRAS CAPITALES Y REGIONES
  "160101": { lat: -3.7491, lng: -73.2538, nombre: "Iquitos" },
  "220101": { lat: -6.4854, lng: -76.3689, nombre: "Tarapoto" },
  "220901": { lat: -6.0342, lng: -76.9744, nombre: "Moyobamba" },
  "210101": { lat: -15.8422, lng: -70.0199, nombre: "Puno" },
  "211101": { lat: -15.4986, lng: -70.1331, nombre: "Juliaca" },
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

// Mapeo de departamento a prefijo de código INEI (2 dígitos)
export const DEPARTAMENTO_PREFIJO_INEI: Record<string, string> = {
  AMAZONAS: "01",
  ANCASH: "02",
  APURIMAC: "03",
  AREQUIPA: "04",
  AYACUCHO: "05",
  CAJAMARCA: "06",
  CALLAO: "07",
  CUSCO: "08",
  HUANCAVELICA: "09",
  HUANUCO: "10",
  ICA: "11",
  JUNIN: "12",
  "LA LIBERTAD": "13",
  LAMBAYEQUE: "14",
  LIMA: "15",
  LORETO: "16",
  "MADRE DE DIOS": "17",
  MOQUEGUA: "18",
  PASCO: "19",
  PIURA: "20",
  PUNO: "21",
  "SAN MARTIN": "22",
  TACNA: "23",
  TUMBES: "24",
  UCAYALI: "25",
};

// Resolver coordenadas de un Ubigeo INEI de Perú
export const obtenerCoordenadasPorUbigeo = (
  codigoInei?: string,
  departamento?: string,
  distrito?: string,
  provincia?: string
): { lat: number; lng: number } => {
  if (codigoInei && UBIGEO_COORDENADAS_PERU[codigoInei]) {
    return {
      lat: UBIGEO_COORDENADAS_PERU[codigoInei].lat,
      lng: UBIGEO_COORDENADAS_PERU[codigoInei].lng,
    };
  }

  const depNorm = departamento ? departamento.trim().toUpperCase() : "";
  const prefijoEsperado = depNorm ? DEPARTAMENTO_PREFIJO_INEI[depNorm] : "";

  // 1. Buscar por nombre de distrito en la tabla de ubigeos filtrando preferentemente por departamento
  if (distrito) {
    const distNorm = distrito.trim().toUpperCase();

    // Primero intentar coincidencia dentro del mismo departamento
    if (prefijoEsperado) {
      for (const [code, data] of Object.entries(UBIGEO_COORDENADAS_PERU)) {
        if (code.startsWith(prefijoEsperado) && data.nombre.toUpperCase().includes(distNorm)) {
          return { lat: data.lat, lng: data.lng };
        }
      }
    }

    // Si no se encuentra dentro del departamento o no se especificó, buscar globalmente solo si no hay conflicto de departamento
    for (const [code, data] of Object.entries(UBIGEO_COORDENADAS_PERU)) {
      if (data.nombre.toUpperCase().includes(distNorm)) {
        // Evitar asignar distrito de Lima si el departamento seleccionado no es Lima o Callao
        if (depNorm && depNorm !== "LIMA" && depNorm !== "CALLAO" && (code.startsWith("15") || code.startsWith("07"))) {
          continue;
        }
        return { lat: data.lat, lng: data.lng };
      }
    }
  }

  // 2. Si no coincide distrito pero hay provincia
  if (provincia) {
    const provNorm = provincia.trim().toUpperCase();
    if (prefijoEsperado) {
      for (const [code, data] of Object.entries(UBIGEO_COORDENADAS_PERU)) {
        if (code.startsWith(prefijoEsperado) && data.nombre.toUpperCase().includes(provNorm)) {
          return { lat: data.lat, lng: data.lng };
        }
      }
    }
  }

  // 3. Usar centroide del departamento
  if (depNorm && DEPARTAMENTO_COORDENADAS_PERU[depNorm]) {
    return DEPARTAMENTO_COORDENADAS_PERU[depNorm];
  }

  // Defecto: Los Olivos / Lima Centro
  return { lat: -11.9912, lng: -77.0711 };
};

// Cache en memoria para geocodificación de Nominatim
const cacheGeocodificacion = new Map<string, { lat: number; lng: number }>();

// Geocodificar texto o dirección en Perú vía OpenStreetMap Nominatim
export async function geocodificarUbicacionPeru(
  query: string
): Promise<{ lat: number; lng: number; nombre?: string } | null> {
  const clave = query.trim().toLowerCase();
  if (!clave) return null;
  if (cacheGeocodificacion.has(clave)) {
    return cacheGeocodificacion.get(clave)!;
  }

  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}&limit=1&countrycodes=pe`,
      { headers: { "Accept-Language": "es" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      const p = data[0];
      const resultado = {
        lat: Number(Number(p.lat).toFixed(6)),
        lng: Number(Number(p.lon).toFixed(6)),
        nombre: p.display_name,
      };
      cacheGeocodificacion.set(clave, resultado);
      return resultado;
    }
  } catch (err) {
    console.warn("Error en geocodificación de ubicación:", err);
  }
  return null;
}

// Geocodificación inversa (coordenadas a dirección en Perú)
export async function geocodificarInversaPeru(
  lat: number,
  lng: number
): Promise<{ direccion: string; distrito?: string; provincia?: string; departamento?: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "Accept-Language": "es" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.display_name) {
      const addr = data.address || {};
      const calle = addr.road || addr.pedestrian || addr.suburb || "";
      const numero = addr.house_number ? ` ${addr.house_number}` : "";
      const distrito = addr.city_district || addr.suburb || addr.town || addr.village || "";
      const textoCorto = [calle + numero, distrito].filter(Boolean).join(", ");
      return {
        direccion: textoCorto || data.display_name,
        distrito: addr.city_district || addr.suburb || addr.town || addr.municipality,
        provincia: addr.county || addr.city,
        departamento: addr.state,
      };
    }
  } catch (err) {
    console.warn("Error geocodificación inversa:", err);
  }
  return null;
}

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
