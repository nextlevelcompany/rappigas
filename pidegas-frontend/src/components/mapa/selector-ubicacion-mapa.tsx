"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, Search, Check, X, RotateCcw } from "lucide-react";

interface SelectorUbicacionMapaProps {
  latitudInicial?: number | null;
  longitudInicial?: number | null;
  distritoNombre?: string;
  departamentoNombre?: string;
  direccionActual?: string;
  onUbicacionSeleccionada: (coords: { lat: number; lng: number; direccionSugerida?: string }) => void;
  onCerrar?: () => void;
}

// Icono personalizado con diseño PideGas (sin dependencias de archivos externos para evitar 404)
const crearIconoPin = () => {
  return L.divIcon({
    className: "pidegas-custom-pin",
    html: `
      <div style="position: relative; width: 36px; height: 42px; display: flex; align-items: center; justify-content: center;">
        <div style="
          width: 32px;
          height: 32px;
          background: #ea580c;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(234, 88, 12, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            width: 10px;
            height: 10px;
            background: #ffffff;
            border-radius: 50%;
          "></div>
        </div>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -42],
  });
};

// Coordenadas de referencia por departamento en Perú
const COORDENADAS_DEPARTAMENTOS: Record<string, [number, number]> = {
  LIMA: [-12.0464, -77.0428],
  CALLAO: [-12.0565, -77.1181],
  AREQUIPA: [-16.409, -71.5375],
  CUSCO: [-13.5319, -71.9675],
  "LA LIBERTAD": [-8.1159, -79.0299],
  PIURA: [-5.1945, -80.6328],
  LAMBAYEQUE: [-6.7714, -79.8409],
  JUNIN: [-12.0651, -75.2049],
  ANCASH: [-9.5277, -77.5289],
  ICA: [-14.0678, -75.7286],
};

export function SelectorUbicacionMapa({
  latitudInicial,
  longitudInicial,
  distritoNombre,
  departamentoNombre,
  direccionActual,
  onUbicacionSeleccionada,
  onCerrar,
}: SelectorUbicacionMapaProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Coordenada por defecto (Lima Metropolitana o departamento seleccionado)
  const defaultCoords: [number, number] =
    latitudInicial && longitudInicial
      ? [latitudInicial, longitudInicial]
      : departamentoNombre && COORDENADAS_DEPARTAMENTOS[departamentoNombre.toUpperCase()]
      ? COORDENADAS_DEPARTAMENTOS[departamentoNombre.toUpperCase()]
      : [-12.0464, -77.0428];

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: defaultCoords[0],
    lng: defaultCoords[1],
  });

  const [direccionGeocodificada, setDireccionGeocodificada] = useState<string>("");
  const [busquedaTexto, setBusquedaTexto] = useState<string>(direccionActual || "");
  const [buscando, setBuscando] = useState<boolean>(false);
  const [obteniendoGps, setObteniendoGps] = useState<boolean>(false);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Si ya existe instancia, removerla para evitar duplicación
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const mapa = L.map(mapContainerRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 15,
      zoomControl: true,
    });

    // Capa de tiles OpenStreetMap de alta definición
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapa);

    // Marcador arrastrable (Draggable Pin)
    const pin = L.marker([coords.lat, coords.lng], {
      icon: crearIconoPin(),
      draggable: true,
    }).addTo(mapa);

    pin.bindPopup(`<b>Almacén / Local</b><br>Arrastra el pin para ajustar la ubicación exacta.`).openPopup();

    pin.on("dragend", () => {
      const pos = pin.getLatLng();
      const nuevaLat = Number(pos.lat.toFixed(6));
      const nuevaLng = Number(pos.lng.toFixed(6));
      setCoords({ lat: nuevaLat, lng: nuevaLng });
      consultarDireccionInversa(nuevaLat, nuevaLng);
    });

    // Click en el mapa para mover el pin
    mapa.on("click", (e) => {
      const nuevaLat = Number(e.latlng.lat.toFixed(6));
      const nuevaLng = Number(e.latlng.lng.toFixed(6));
      pin.setLatLng([nuevaLat, nuevaLng]);
      setCoords({ lat: nuevaLat, lng: nuevaLng });
      consultarDireccionInversa(nuevaLat, nuevaLng);
    });

    mapInstanceRef.current = mapa;
    markerRef.current = pin;

    // Si tenemos distrito o departamento, geocodificar inicial si no hay lat/lng
    if (!latitudInicial && distritoNombre) {
      buscarDireccionEnMapa(`${distritoNombre}, ${departamentoNombre || "Lima"}, Peru`);
    }

    // Invalidar tamaño para renderizado correcto en contenedores dinámicos
    setTimeout(() => {
      mapa.invalidateSize();
    }, 200);

    return () => {
      mapa.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Consultar geocodificación inversa (OpenStreetMap Nominatim)
  const consultarDireccionInversa = async (lat: number, lng: number) => {
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { "Accept-Language": "es" } }
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.display_name) {
          // Extraer calle y número o descripción corta
          const addr = data.address || {};
          const calle = addr.road || addr.pedestrian || addr.suburb || "";
          const numero = addr.house_number ? ` ${addr.house_number}` : "";
          const distrito = addr.city_district || addr.suburb || addr.town || "";
          const textoCorto = [calle + numero, distrito].filter(Boolean).join(", ");
          setDireccionGeocodificada(textoCorto || data.display_name);
        }
      }
    } catch {
      // Si falla la geocodificación inversa, no bloquea el flujo
    }
  };

  // Buscar dirección por texto
  const buscarDireccionEnMapa = async (texto: string) => {
    if (!texto.trim() || !mapInstanceRef.current || !markerRef.current) return;
    try {
      setBuscando(true);
      const query = encodeURIComponent(texto);
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&countrycodes=pe`,
        { headers: { "Accept-Language": "es" } }
      );
      if (resp.ok) {
        const resultados = await resp.json();
        if (resultados && resultados.length > 0) {
          const primer = resultados[0];
          const nLat = Number(Number(primer.lat).toFixed(6));
          const nLng = Number(Number(primer.lon).toFixed(6));
          setCoords({ lat: nLat, lng: nLng });
          markerRef.current.setLatLng([nLat, nLng]);
          mapInstanceRef.current.setView([nLat, nLng], 16, { animate: true });
          setDireccionGeocodificada(primer.display_name);
        }
      }
    } catch {
      // Ignorar error de red silencioso
    } finally {
      setBuscando(false);
    }
  };

  // Usar GPS del navegador
  const usarGpsNavegador = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }
    setObteniendoGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nLat = Number(pos.coords.latitude.toFixed(6));
        const nLng = Number(pos.coords.longitude.toFixed(6));
        setCoords({ lat: nLat, lng: nLng });
        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([nLat, nLng]);
          mapInstanceRef.current.setView([nLat, nLng], 17, { animate: true });
        }
        consultarDireccionInversa(nLat, nLng);
        setObteniendoGps(false);
      },
      (err) => {
        console.warn("Error GPS:", err);
        alert("No se pudo obtener la ubicación GPS actual. Por favor marca el punto directamente en el mapa.");
        setObteniendoGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirmar = () => {
    onUbicacionSeleccionada({
      lat: coords.lat,
      lng: coords.lng,
      direccionSugerida: direccionGeocodificada || undefined,
    });
    if (onCerrar) onCerrar();
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      
      {/* Barra Superior con Controles */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 dark:bg-neutral-900">
        <div>
          <h4 className="text-sm font-bold text-[#03246b] dark:text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-600" />
            Marcar Ubicación del Almacén en el Mapa
          </h4>
          <p className="text-xs text-slate-500 dark:text-neutral-400">
            Haz clic en el mapa o arrastra el marcador naranja hasta la puerta de tu local.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón GPS */}
          <button
            type="button"
            onClick={usarGpsNavegador}
            disabled={obteniendoGps}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition shadow-2xs"
            title="Usar mi ubicación GPS actual"
          >
            <Navigation className={`w-3.5 h-3.5 text-orange-600 ${obteniendoGps ? "animate-spin" : ""}`} />
            <span>{obteniendoGps ? "Detectando..." : "Mi Ubicación GPS"}</span>
          </button>

          {onCerrar && (
            <button
              type="button"
              onClick={onCerrar}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-neutral-800 transition"
              title="Cerrar mapa"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Buscador Integrado sobre el Mapa */}
      <div className="p-3 bg-white dark:bg-neutral-900 border-b border-slate-100 dark:border-neutral-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            buscarDireccionEnMapa(busquedaTexto);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar calle, avenida o referencia (ej: Av. Nicolás de Piérola 450, Lima)"
              value={busquedaTexto}
              onChange={(e) => setBusquedaTexto(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
          <button
            type="submit"
            disabled={buscando}
            className="px-4 py-2 rounded-xl bg-[#03246b] hover:bg-[#021849] text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            {buscando ? "Buscando..." : "Buscar"}
          </button>
        </form>
      </div>

      {/* Contenedor del Mapa Leaflet */}
      <div className="relative w-full h-[320px] sm:h-[380px] bg-slate-100 dark:bg-neutral-950">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      {/* Barra Inferior con Coordenadas y Confirmación */}
      <div className="p-4 sm:p-5 bg-slate-50 dark:bg-neutral-900 border-t border-slate-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Coordenadas seleccionadas:</span>
            <span className="font-mono font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/60 px-2.5 py-0.5 rounded-lg border border-orange-200 dark:border-orange-900">
              {coords.lat}, {coords.lng}
            </span>
          </div>
          {direccionGeocodificada && (
            <p className="text-[11px] text-slate-500 dark:text-neutral-400 line-clamp-1">
              📍 {direccionGeocodificada}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 justify-end">
          {onCerrar && (
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition"
            >
              Cancelar
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirmar}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition shadow-md shadow-orange-600/25 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Fijar esta Ubicación</span>
          </button>
        </div>

      </div>

    </div>
  );
}
