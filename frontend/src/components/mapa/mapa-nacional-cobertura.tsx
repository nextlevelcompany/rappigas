"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface DistribuidorNacional {
  publicId: string;
  nombreComercial: string;
  razonSocial?: string;
  ruc: string;
  direccionFiscal: string;
  distrito: string;
  departamento: string;
  telefono: string;
  emailContacto?: string;
  latitud: number;
  longitud: number;
  marca?: string;
  tiempoMin?: number;
  tiempoMax?: number;
  zonaNombre?: string;
  calificacion?: number;
  precioDesde?: number;
  deliveryGratis?: boolean;
}

interface MapaNacionalCoberturaProps {
  distribuidores: DistribuidorNacional[];
  distribuidorSeleccionadoId?: string | null;
  onSeleccionarDistribuidor: (dist: DistribuidorNacional) => void;
  onPedirGas?: (dist: DistribuidorNacional) => void;
  centroInicial?: [number, number];
  zoomInicial?: number;
  ubicacionBuscada?: { lat: number; lng: number; etiqueta?: string; zoom?: number } | null;
}

// Icono por marca de distribuidora
const obtenerColorMarca = (nombre: string = "", marca: string = "") => {
  const txt = `${nombre} ${marca}`.toLowerCase();
  if (txt.includes("solgas")) return { bg: "#0284c7", border: "#38bdf8", tag: "Solgas", emoji: "🔥" };
  if (txt.includes("zeta")) return { bg: "#16a34a", border: "#4ade80", tag: "Zeta Gas", emoji: "🟢" };
  if (txt.includes("primax")) return { bg: "#ea580c", border: "#fb923c", tag: "Primax Gas", emoji: "⚡" };
  if (txt.includes("llama")) return { bg: "#dc2626", border: "#f87171", tag: "Llamagas", emoji: "🔴" };
  return { bg: "#03246b", border: "#60a5fa", tag: "RappiGas", emoji: "🏪" };
};

const crearIconoNacional = (
  dist: DistribuidorNacional,
  esSeleccionado: boolean
) => {
  const brand = obtenerColorMarca(dist.nombreComercial, dist.marca);
  const bg = esSeleccionado ? "#dc2626" : brand.bg;
  const border = esSeleccionado ? "#fed7aa" : "#ffffff";
  const ringStyle = esSeleccionado
    ? "box-shadow: 0 0 0 5px rgba(220, 38, 38, 0.4), 0 8px 20px rgba(0,0,0,0.4); transform: scale(1.15);"
    : "box-shadow: 0 3px 12px rgba(0,0,0,0.3);";

  const nombreCorto =
    dist.nombreComercial.length > 20
      ? dist.nombreComercial.substring(0, 18) + "..."
      : dist.nombreComercial;

  return L.divIcon({
    className: `marker-dist-nacional ${esSeleccionado ? "seleccionado" : ""}`,
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; pointer-events: auto; width: 140px; margin-left: -70px; margin-top: -42px;">
        <div style="
          background: ${bg};
          border: 2px solid ${border};
          color: #ffffff;
          padding: 4px 7px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 4px;
          ${ringStyle}
          transition: all 0.2s ease-in-out;
        ">
          <span style="font-size: 13px; line-height: 1;">${brand.emoji}</span>
          <span style="font-size: 10px; font-weight: 800; white-space: nowrap; max-width: 95px; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.2px;">
            ${nombreCorto}
          </span>
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 7px solid ${bg};
          margin-top: -1px;
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -38],
  });
};

// Icono para pin de búsqueda / GPS
const crearIconoBusqueda = (etiqueta: string = "Ubicación seleccionada") => {
  return L.divIcon({
    className: "marker-busqueda-gps",
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; width: 120px; margin-left: -60px; margin-top: -46px;">
        <div style="
          width: 36px;
          height: 36px;
          background: #f97316;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 16px rgba(249, 115, 22, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="transform: rotate(45deg); color: #ffffff; font-size: 16px; font-weight: bold; line-height: 1;">
            📍
          </div>
        </div>
        <div style="
          margin-top: 3px;
          background: #0f172a;
          color: #ffffff;
          font-size: 9.5px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 9999px;
          white-space: nowrap;
          border: 1.5px solid #ffffff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        ">
          ${etiqueta}
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -46],
  });
};

export function MapaNacionalCobertura({
  distribuidores,
  distribuidorSeleccionadoId,
  onSeleccionarDistribuidor,
  onPedirGas,
  centroInicial = [-9.19, -75.015], // Centroide de Perú a nivel nacional
  zoomInicial = 5.7,
  ubicacionBuscada,
}: MapaNacionalCoberturaProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const busquedaMarkerRef = useRef<L.Marker | null>(null);
  const markersMapRef = useRef<Map<string, L.Marker>>(new Map());

  // Callbacks actualizados
  const onSeleccionarRef = useRef(onSeleccionarDistribuidor);
  onSeleccionarRef.current = onSeleccionarDistribuidor;

  const onPedirGasRef = useRef(onPedirGas);
  onPedirGasRef.current = onPedirGas;

  // 1. Inicialización del Mapa
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const mapa = L.map(mapContainerRef.current, {
      center: centroInicial,
      zoom: zoomInicial,
      zoomControl: true,
      minZoom: 5,
      maxZoom: 18,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | RappiGas Perú',
      maxZoom: 19,
    }).addTo(mapa);

    const markersLayer = L.layerGroup().addTo(mapa);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = mapa;

    const resizeObserver = new ResizeObserver(() => {
      mapa.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const timer = setTimeout(() => {
      mapa.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      mapa.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      busquedaMarkerRef.current = null;
      markersMapRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Renderizado reactivo de marcadores al cambiar la lista de distribuidores
  useEffect(() => {
    const mapa = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!mapa || !markersLayer) return;

    markersLayer.clearLayers();
    markersMapRef.current.clear();

    const bounds = L.latLngBounds([]);

    distribuidores.forEach((dist) => {
      if (!dist.latitud || !dist.longitud) return;

      const esSeleccionado = dist.publicId === distribuidorSeleccionadoId;
      const marker = L.marker([dist.latitud, dist.longitud], {
        icon: crearIconoNacional(dist, esSeleccionado),
        zIndexOffset: esSeleccionado ? 1000 : 100,
      });

      // Crear popup interactivo
      const brand = obtenerColorMarca(dist.nombreComercial, dist.marca);
      const popupHtml = `
        <div style="font-family: inherit; width: 240px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 9px; font-weight: 800; background: ${brand.bg}; color: #ffffff; padding: 2px 8px; border-radius: 9999px;">
              ${brand.tag} Autorizado
            </span>
            <span style="font-size: 9px; font-weight: 800; color: #166534; background: #dcfce7; padding: 1px 6px; border-radius: 4px;">
              Osinergmin SCOP
            </span>
          </div>

          <h4 style="margin: 0 0 2px 0; font-size: 13px; font-weight: 900; color: #0f172a; line-height: 1.2;">
            ${dist.nombreComercial}
          </h4>
          <div style="font-size: 10px; color: #64748b; margin-bottom: 6px;">
            RUC: <strong>${dist.ruc}</strong> • ${dist.distrito}, ${dist.departamento}
          </div>

          <div style="font-size: 11px; color: #334155; margin-bottom: 8px; line-height: 1.3; background: #f8fafc; padding: 6px; border-radius: 8px; border: 1px solid #e2e8f0;">
            📍 <strong>Dirección:</strong> ${dist.direccionFiscal}<br/>
            ⚡ <strong>Despacho:</strong> ${dist.tiempoMin || 20}-${dist.tiempoMax || 35} min<br/>
            📞 <strong>Tel:</strong> <a href="tel:${dist.telefono}" style="color: #0284c7; font-weight: bold; text-decoration: none;">${dist.telefono}</a>
          </div>

          <button
            id="btn-pedir-dist-${dist.publicId}"
            type="button"
            style="
              width: 100%;
              background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
              color: #ffffff;
              font-weight: 800;
              font-size: 11.5px;
              padding: 7px 10px;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              box-shadow: 0 2px 6px rgba(234, 88, 12, 0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
            "
          >
            🛒 Pedir Balón a este Distribuidor
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        maxWidth: 270,
        className: "pidegas-popup-custom",
      });

      marker.on("popupopen", () => {
        const btn = document.getElementById(`btn-pedir-dist-${dist.publicId}`);
        if (btn) {
          btn.onclick = () => {
            onPedirGasRef.current?.(dist);
          };
        }
      });

      marker.on("click", () => {
        onSeleccionarRef.current(dist);
      });

      marker.addTo(markersLayer);
      markersMapRef.current.set(dist.publicId, marker);
      bounds.extend([dist.latitud, dist.longitud]);
    });

    // Si hay un distribuidor seleccionado específico, abrir su popup y centrar
    if (distribuidorSeleccionadoId && markersMapRef.current.has(distribuidorSeleccionadoId)) {
      const selectedMarker = markersMapRef.current.get(distribuidorSeleccionadoId);
      if (selectedMarker) {
        selectedMarker.openPopup();
      }
    }
  }, [distribuidores, distribuidorSeleccionadoId]);

  // 3. Manejo de ubicación buscada (GPS o Geocoding)
  useEffect(() => {
    const mapa = mapInstanceRef.current;
    if (!mapa) return;

    if (busquedaMarkerRef.current) {
      busquedaMarkerRef.current.remove();
      busquedaMarkerRef.current = null;
    }

    if (ubicacionBuscada) {
      const marker = L.marker([ubicacionBuscada.lat, ubicacionBuscada.lng], {
        icon: crearIconoBusqueda(ubicacionBuscada.etiqueta || "Ubicación fijada"),
        zIndexOffset: 1200,
      }).addTo(mapa);

      busquedaMarkerRef.current = marker;
      const zoomDestino = typeof ubicacionBuscada.zoom === "number" ? ubicacionBuscada.zoom : 14;
      mapa.flyTo([ubicacionBuscada.lat, ubicacionBuscada.lng], zoomDestino, { duration: 1.2 });
    }
  }, [ubicacionBuscada]);

  // Función para re-encuadrar todo el mapa a nivel nacional
  const handleVerTodoPeru = () => {
    const mapa = mapInstanceRef.current;
    if (!mapa) return;
    mapa.flyTo([-9.19, -75.015], 5.8, { duration: 1.2 });
  };

  return (
    <div className="relative w-full h-full min-h-[480px]">
      <div ref={mapContainerRef} className="w-full h-full rounded-2xl overflow-hidden z-0" />

      {/* Botón Flotante para Re-encuadrar todo el Perú */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        <button
          type="button"
          onClick={handleVerTodoPeru}
          className="px-3 py-1.5 bg-white/95 hover:bg-white text-slate-900 border border-slate-200 text-xs font-bold rounded-xl shadow-md backdrop-blur-xs transition flex items-center gap-1.5 cursor-pointer hover:border-orange-500"
          title="Ver todo el territorio nacional de Perú"
        >
          <span className="text-sm">🇵🇪</span>
          <span>Ver Todo el Perú</span>
        </button>
      </div>
    </div>
  );
}
