"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { EmpresaDetalle } from "@/librerias/api/empresas.api";

interface MapaCoberturaDistribuidoresProps {
  latCliente: number;
  lngCliente: number;
  direccionCliente?: string;
  distribuidoras: EmpresaDetalle[];
  distribuidoraSeleccionadaId?: string | null;
  onSeleccionarDistribuidora: (dist: EmpresaDetalle) => void;
  onCambiarUbicacionCliente?: (lat: number, lng: number) => void;
  permitirMoverCliente?: boolean;
}

// Icono personalizado para el punto del cliente
const crearIconoCliente = () => {
  return L.divIcon({
    className: "pidegas-pin-cliente",
    html: `
      <div style="position: relative; width: 42px; height: 48px; display: flex; align-items: center; justify-content: center;">
        <div style="
          width: 38px;
          height: 38px;
          background: #03246b;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 14px rgba(3, 36, 107, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="transform: rotate(45deg); color: #ffffff; font-size: 16px; font-weight: bold; line-height: 1;">
            🏠
          </div>
        </div>
      </div>
    `,
    iconSize: [42, 48],
    iconAnchor: [21, 48],
    popupAnchor: [0, -48],
  });
};

// Icono personalizado para distribuidora autorizada
const crearIconoDistribuidora = (esDirecta: boolean, esSeleccionada: boolean) => {
  let bg = "#475569"; // slate por defecto para lejanas
  let iconEmoji = "🏪";
  let ringStyle = "";

  if (esDirecta) {
    bg = "#ea580c"; // Naranja fuego para cobertura directa express
    iconEmoji = "🔥";
  }

  if (esSeleccionada) {
    bg = "#e11d48"; // Rojo / rosa intenso para seleccionada
    iconEmoji = "🔥";
    ringStyle = "box-shadow: 0 0 0 4px rgba(225, 29, 72, 0.35), 0 6px 16px rgba(0, 0, 0, 0.3); transform: rotate(-45deg) scale(1.15);";
  } else {
    ringStyle = `box-shadow: 0 4px 12px ${esDirecta ? "rgba(234, 88, 12, 0.5)" : "rgba(71, 85, 105, 0.45)"}; transform: rotate(-45deg);`;
  }

  return L.divIcon({
    className: `pidegas-pin-distribuidora ${esSeleccionada ? "seleccionada" : ""}`,
    html: `
      <div style="position: relative; width: 38px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="
          width: 34px;
          height: 34px;
          background: ${bg};
          border: 2.5px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          ${ringStyle}
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease-in-out;
        ">
          <div style="transform: rotate(45deg); color: #ffffff; font-size: 14px; font-weight: bold; line-height: 1;">
            ${iconEmoji}
          </div>
        </div>
      </div>
    `,
    iconSize: [38, 44],
    iconAnchor: [19, 44],
    popupAnchor: [0, -44],
  });
};

export function MapaCoberturaDistribuidores({
  latCliente,
  lngCliente,
  direccionCliente,
  distribuidoras,
  distribuidoraSeleccionadaId,
  onSeleccionarDistribuidora,
  onCambiarUbicacionCliente,
  permitirMoverCliente = false,
}: MapaCoberturaDistribuidoresProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersEmpresasRef = useRef<L.Marker[]>([]);
  const markerClienteRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destruir mapa previo si existe
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const mapa = L.map(mapContainerRef.current, {
      center: [latCliente, lngCliente],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | RappiGas',
      maxZoom: 19,
    }).addTo(mapa);

    // Marcador del Cliente
    const markerCliente = L.marker([latCliente, lngCliente], {
      icon: crearIconoCliente(),
      draggable: permitirMoverCliente,
    }).addTo(mapa);

    markerCliente
      .bindPopup(
        `<div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
          <b style="color: #03246b;">Tu Punto de Entrega</b><br/>
          <span>${direccionCliente || "Ubicación seleccionada"}</span>
          ${
            permitirMoverCliente
              ? "<br/><span style='color: #ea580c; font-size: 11px;'>Puedes arrastrar este pin para ajustar tu puerta.</span>"
              : ""
          }
        </div>`
      );

    if (permitirMoverCliente && onCambiarUbicacionCliente) {
      markerCliente.on("dragend", () => {
        const pos = markerCliente.getLatLng();
        onCambiarUbicacionCliente(
          Number(pos.lat.toFixed(6)),
          Number(pos.lng.toFixed(6))
        );
      });

      mapa.on("click", (e: L.LeafletMouseEvent) => {
        const lat = Number(e.latlng.lat.toFixed(6));
        const lng = Number(e.latlng.lng.toFixed(6));
        markerCliente.setLatLng([lat, lng]);
        onCambiarUbicacionCliente(lat, lng);
      });
    }

    markerClienteRef.current = markerCliente;

    // Círculo de cobertura referencial (ej. radio de 3 km alrededor del cliente)
    L.circle([latCliente, lngCliente], {
      radius: 2800,
      color: "#ea580c",
      fillColor: "#ea580c",
      fillOpacity: 0.07,
      weight: 1.5,
      dashArray: "4, 6",
    }).addTo(mapa);

    // Marcadores para todos los distribuidores (locales y lejanos)
    const markersNuevos: L.Marker[] = [];

    distribuidoras.forEach((dist, idx) => {
      // Usar coordenadas reales de base de datos si existen, o calcular radial proporcional
      const hasRealCoords =
        typeof dist.latitud === "number" &&
        typeof dist.longitud === "number" &&
        !isNaN(dist.latitud) &&
        !isNaN(dist.longitud);

      let latEmp = dist.latitud!;
      let lngEmp = dist.longitud!;

      if (!hasRealCoords) {
        const angle = (idx * (2 * Math.PI)) / Math.max(1, distribuidoras.length);
        const offsetDist = 0.015 + (idx % 3) * 0.008;
        latEmp = latCliente + Math.sin(angle) * offsetDist;
        lngEmp = lngCliente + Math.cos(angle) * offsetDist;
      }

      const esDirecta = Boolean(dist.tieneCoberturaDirecta);
      const esSeleccionada = dist.publicId === distribuidoraSeleccionadaId;

      const markerEmp = L.marker([latEmp, lngEmp], {
        icon: crearIconoDistribuidora(esDirecta, esSeleccionada),
        zIndexOffset: esSeleccionada ? 1000 : esDirecta ? 500 : 100,
      }).addTo(mapa);

      const etiquetaZona = esDirecta
        ? `<span style="background: #dcfce7; color: #166534; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 9999px;">
             ⚡ COBERTURA DIRECTA (25-35 MIN)
           </span>`
        : `<span style="background: #f1f5f9; color: #475569; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 9999px;">
             📍 ${dist.zonaNombre || "DISTRIBUIDORA REGIONAL"}
           </span>`;

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.35; min-width: 200px; padding: 4px 2px;">
          <div style="margin-bottom: 6px;">
            ${etiquetaZona}
          </div>
          <b style="color: #0f172a; font-size: 13px; display: block;">${dist.nombreComercial}</b>
          <div style="color: #64748b; font-size: 11px; margin-top: 3px;">
            RUC: ${dist.ruc} • Osinergmin
          </div>
          <div style="color: #475569; font-size: 11px; margin-top: 3px;">
            ${dist.direccionFiscal || "Local Autorizado"}
          </div>
          <div style="color: #16a34a; font-size: 11px; font-weight: 700; margin-top: 5px;">
            ⚡ Balanza Digital en Puerta
          </div>
          <button id="btn-sel-${dist.publicId}" style="
            margin-top: 8px;
            width: 100%;
            background: #ea580c;
            color: #ffffff;
            border: none;
            padding: 7px 10px;
            border-radius: 8px;
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(234, 88, 12, 0.4);
          ">
            Elegir esta Distribuidora
          </button>
        </div>
      `;

      markerEmp.bindPopup(popupHtml);

      markerEmp.on("popupopen", () => {
        const btn = document.getElementById(`btn-sel-${dist.publicId}`);
        if (btn) {
          btn.onclick = () => {
            onSeleccionarDistribuidora(dist);
          };
        }
      });

      markerEmp.on("click", () => {
        onSeleccionarDistribuidora(dist);
      });

      markersNuevos.push(markerEmp);
    });

    markersEmpresasRef.current = markersNuevos;
    mapInstanceRef.current = mapa;

    return () => {
      mapa.remove();
      mapInstanceRef.current = null;
    };
  }, [
    latCliente,
    lngCliente,
    direccionCliente,
    distribuidoras,
    distribuidoraSeleccionadaId,
    permitirMoverCliente,
    onCambiarUbicacionCliente,
    onSeleccionarDistribuidora,
  ]);

  // Función para re-centrar en el cliente
  const handleCentrarCliente = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([latCliente, lngCliente], 14, { animate: true });
    }
  };

  // Función para ver todos los distribuidores (ajuste de zoom para Lima y provincias)
  const handleVerTodosDistribuidores = () => {
    if (mapInstanceRef.current && markersEmpresasRef.current.length > 0) {
      const allPoints: L.LatLngExpression[] = [
        [latCliente, lngCliente],
        ...markersEmpresasRef.current.map((m) => m.getLatLng()),
      ];
      const bounds = L.latLngBounds(allPoints);
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  };

  const totalDirectas = distribuidoras.filter((d) => d.tieneCoberturaDirecta).length;
  const totalLejanas = distribuidoras.length - totalDirectas;

  return (
    <div className="relative w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-slate-200 dark:border-neutral-800 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full min-h-[380px] z-0" />

      {/* Botones de control rápido sobre el mapa */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col gap-2">
        <button
          type="button"
          onClick={handleCentrarCliente}
          className="px-3 py-1.5 bg-white/95 hover:bg-white text-slate-800 rounded-xl text-xs font-bold shadow-md border border-slate-200 flex items-center gap-1.5 transition cursor-pointer backdrop-blur-xs"
          title="Centrar mapa en mi dirección de entrega"
        >
          <span>🏠 Mi Entrega</span>
        </button>
        <button
          type="button"
          onClick={handleVerTodosDistribuidores}
          className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer"
          title="Ver todos los distribuidores en el mapa"
        >
          <span>🗺️ Ver Todos ({distribuidoras.length})</span>
        </button>
      </div>

      {/* Leyenda flotante en el mapa */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-neutral-800 text-[11px] shadow-lg space-y-1.5 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-[#03246b] border-2 border-white inline-block shadow-xs"></span>
          <span className="font-bold text-slate-800 dark:text-neutral-200">
            Tu Dirección de Entrega
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-orange-600 border-2 border-white inline-block shadow-xs"></span>
          <span className="font-bold text-orange-700 dark:text-orange-400">
            Cobertura Directa Express ({totalDirectas})
          </span>
        </div>
        {totalLejanas > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-600 border-2 border-white inline-block shadow-xs"></span>
            <span className="font-semibold text-slate-600 dark:text-neutral-400">
              Otras Distribuidoras ({totalLejanas})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
