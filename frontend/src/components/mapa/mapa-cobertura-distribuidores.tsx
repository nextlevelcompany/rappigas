"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { EmpresaDetalle } from "@/librerias/api/empresas.api";
import {
  calcularDistanciaKm,
  obtenerCoordenadasDistribuidora,
} from "@/librerias/geo-utils";

export { calcularDistanciaKm, obtenerCoordenadasDistribuidora };

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
      <div style="position: relative; width: 40px; height: 46px; display: flex; align-items: center; justify-content: center;">
        <div style="
          width: 36px;
          height: 36px;
          background: #03246b;
          border: 2.5px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 14px rgba(3, 36, 107, 0.55);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="transform: rotate(45deg); color: #ffffff; font-size: 15px; font-weight: bold; line-height: 1;">
            🏠
          </div>
        </div>
      </div>
    `,
    iconSize: [40, 46],
    iconAnchor: [20, 46],
    popupAnchor: [0, -46],
  });
};

// Icono personalizado para distribuidora autorizada
const crearIconoDistribuidora = (esDirecta: boolean, esSeleccionada: boolean) => {
  let bg = "#475569";
  let iconEmoji = "🏪";
  let ringStyle = "";

  if (esDirecta) {
    bg = "#ea580c";
    iconEmoji = "🔥";
  }

  if (esSeleccionada) {
    bg = "#e11d48";
    iconEmoji = "🔥";
    ringStyle =
      "box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.4), 0 4px 14px rgba(0, 0, 0, 0.3); transform: rotate(-45deg) scale(1.15);";
  } else {
    ringStyle = `box-shadow: 0 3px 10px ${
      esDirecta ? "rgba(234, 88, 12, 0.45)" : "rgba(71, 85, 105, 0.4)"
    }; transform: rotate(-45deg);`;
  }

  return L.divIcon({
    className: `pidegas-pin-distribuidora ${esSeleccionada ? "seleccionada" : ""}`,
    html: `
      <div style="position: relative; width: 36px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
        <div style="
          width: 32px;
          height: 32px;
          background: ${bg};
          border: 2px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          ${ringStyle}
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease-in-out;
        ">
          <div style="transform: rotate(45deg); color: #ffffff; font-size: 13px; font-weight: bold; line-height: 1;">
            ${iconEmoji}
          </div>
        </div>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -42],
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
  const markerClienteRef = useRef<L.Marker | null>(null);
  const circleClienteRef = useRef<L.Circle | null>(null);
  const distLayerRef = useRef<L.LayerGroup | null>(null);

  // Mantener referencias actualizadas de callbacks para evitar re-crear el mapa
  const onCambiarUbicacionClienteRef = useRef(onCambiarUbicacionCliente);
  onCambiarUbicacionClienteRef.current = onCambiarUbicacionCliente;

  const onSeleccionarDistribuidoraRef = useRef(onSeleccionarDistribuidora);
  onSeleccionarDistribuidoraRef.current = onSeleccionarDistribuidora;

  const permitirMoverClienteRef = useRef(permitirMoverCliente);
  permitirMoverClienteRef.current = permitirMoverCliente;

  // 1. Inicialización ÚNICA del mapa al montar el componente
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const mapa = L.map(mapContainerRef.current, {
      center: [latCliente, lngCliente],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | RappiGas',
      maxZoom: 19,
    }).addTo(mapa);

    // Capa de distribuidores
    const distLayer = L.layerGroup().addTo(mapa);
    distLayerRef.current = distLayer;

    // Círculo de cobertura del cliente
    const circle = L.circle([latCliente, lngCliente], {
      radius: 2600,
      color: "#ea580c",
      fillColor: "#ea580c",
      fillOpacity: 0.06,
      weight: 1.5,
      dashArray: "4, 6",
    }).addTo(mapa);
    circleClienteRef.current = circle;

    // Marcador del Cliente
    const markerCliente = L.marker([latCliente, lngCliente], {
      icon: crearIconoCliente(),
      draggable: true,
      zIndexOffset: 1200,
    }).addTo(mapa);

    markerCliente.bindPopup(
      `<div style="font-family: inherit; font-size: 11px; line-height: 1.4;">
        <b style="color: #03246b;">Tu Punto de Entrega</b><br/>
        <span>${direccionCliente || "Ubicación fijada"}</span>
        <br/><span style="color: #ea580c; font-size: 10px;">Puedes arrastrar el pin o hacer clic en el mapa para ajustar tu puerta.</span>
      </div>`
    );

    markerCliente.on("dragend", () => {
      const pos = markerCliente.getLatLng();
      const lat = Number(pos.lat.toFixed(6));
      const lng = Number(pos.lng.toFixed(6));
      circle.setLatLng([lat, lng]);
      onCambiarUbicacionClienteRef.current?.(lat, lng);
    });

    // EVENTO CLIC EN EL MAPA: Mueve el pin y el círculo SIN RESETEAR EL ZOOM
    mapa.on("click", (e: L.LeafletMouseEvent) => {
      if (!permitirMoverClienteRef.current) return;
      const lat = Number(e.latlng.lat.toFixed(6));
      const lng = Number(e.latlng.lng.toFixed(6));

      // Actualizar marcador y círculo in-place conservando el nivel de zoom actual
      markerCliente.setLatLng([lat, lng]);
      circle.setLatLng([lat, lng]);

      // Notificar al padre para recalcular distancias
      onCambiarUbicacionClienteRef.current?.(lat, lng);
    });

    markerClienteRef.current = markerCliente;
    mapInstanceRef.current = mapa;

    // Fix para tamaño si el contenedor padre cambia de tamaño dinámicamente
    const resizeObserver = new ResizeObserver(() => {
      mapa.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      mapa.remove();
      mapInstanceRef.current = null;
      markerClienteRef.current = null;
      circleClienteRef.current = null;
      distLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Efecto para actualizar posición del cliente SIN destruir el mapa ni cambiar el zoom
  useEffect(() => {
    if (!markerClienteRef.current || !mapInstanceRef.current) return;

    const currentPos = markerClienteRef.current.getLatLng();
    // Si la posición difiere significativamente (por ejemplo, búsqueda por texto o distrito)
    if (
      Math.abs(currentPos.lat - latCliente) > 0.0001 ||
      Math.abs(currentPos.lng - lngCliente) > 0.0001
    ) {
      markerClienteRef.current.setLatLng([latCliente, lngCliente]);
      circleClienteRef.current?.setLatLng([latCliente, lngCliente]);

      // Desplazamiento suave (panTo) MANTENIENDO el zoom actual del usuario
      mapInstanceRef.current.panTo([latCliente, lngCliente], { animate: true });
    }

    if (direccionCliente) {
      markerClienteRef.current.setPopupContent(
        `<div style="font-family: inherit; font-size: 11px; line-height: 1.4;">
          <b style="color: #03246b;">Tu Punto de Entrega</b><br/>
          <span>${direccionCliente}</span>
          <br/><span style="color: #ea580c; font-size: 10px;">Arrastra este pin o haz clic en el mapa para ajustar tu puerta.</span>
        </div>`
      );
    }
  }, [latCliente, lngCliente, direccionCliente]);

  // 3. Efecto para actualizar los marcadores de distribuidores SIN tocar el mapa
  useEffect(() => {
    if (!distLayerRef.current || !mapInstanceRef.current) return;

    distLayerRef.current.clearLayers();

    distribuidoras.forEach((dist, idx) => {
      const coords = obtenerCoordenadasDistribuidora(
        dist,
        latCliente,
        lngCliente,
        idx,
        distribuidoras.length
      );
      const latEmp = coords.lat;
      const lngEmp = coords.lng;

      const distKm = calcularDistanciaKm(latCliente, lngCliente, latEmp, lngEmp);
      const tiempoMin = Math.max(15, Math.round(distKm * 6 + 12));
      const tiempoMax = Math.max(25, Math.round(distKm * 6 + 22));

      const esDirecta = Boolean(dist.tieneCoberturaDirecta) || distKm <= 5.0;
      const esSeleccionada = dist.publicId === distribuidoraSeleccionadaId;

      const markerEmp = L.marker([latEmp, lngEmp], {
        icon: crearIconoDistribuidora(esDirecta, esSeleccionada),
        zIndexOffset: esSeleccionada ? 1000 : esDirecta ? 500 : 100,
      });

      const etiquetaZona = esDirecta
        ? `<span style="background: #dcfce7; color: #166534; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 9999px;">
             ⚡ DIRECTA (${tiempoMin}-${tiempoMax} MIN)
           </span>`
        : `<span style="background: #f1f5f9; color: #475569; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 9999px;">
             📍 ${dist.zonaNombre || "DISTRIBUIDORA"} (${distKm} KM)
           </span>`;

      const popupHtml = `
        <div style="font-family: inherit; font-size: 11px; line-height: 1.35; min-width: 200px; padding: 2px;">
          <div style="margin-bottom: 4px;">
            ${etiquetaZona}
          </div>
          <b style="color: #0f172a; font-size: 12px; display: block;">${dist.nombreComercial}</b>
          <div style="color: #64748b; font-size: 10px; margin-top: 2px;">
            RUC: ${dist.ruc} • Distribuidor Oficial
          </div>
          <div style="color: #475569; font-size: 10px; margin-top: 2px;">
            ${dist.direccionFiscal ? dist.direccionFiscal.split("[GPS:")[0].trim() : "Local Autorizado"}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 5px; padding: 3px 6px; background: #f8fafc; border-radius: 6px; font-size: 10px;">
            <span style="color: #ea580c; font-weight: 800;">📍 A ${distKm} km</span>
            <span style="color: #16a34a; font-weight: 800;">⏱️ ${tiempoMin}-${tiempoMax} min</span>
          </div>
          <button id="btn-sel-${dist.publicId}" style="
            margin-top: 6px;
            width: 100%;
            background: #ea580c;
            color: #ffffff;
            border: none;
            padding: 6px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
          ">
            ${esSeleccionada ? "✓ Distribuidora Seleccionada" : "Elegir esta Distribuidora"}
          </button>
        </div>
      `;

      markerEmp.bindPopup(popupHtml);

      markerEmp.on("popupopen", () => {
        const btn = document.getElementById(`btn-sel-${dist.publicId}`);
        if (btn) {
          btn.onclick = () => {
            onSeleccionarDistribuidoraRef.current?.(dist);
          };
        }
      });

      markerEmp.on("click", () => {
        onSeleccionarDistribuidoraRef.current?.(dist);
      });

      distLayerRef.current?.addLayer(markerEmp);
    });
  }, [distribuidoras, distribuidoraSeleccionadaId, latCliente, lngCliente]);

  // Función para re-centrar en el cliente preservando o ajustando el zoom
  const handleCentrarCliente = () => {
    if (mapInstanceRef.current) {
      const currentZoom = Math.max(14, mapInstanceRef.current.getZoom());
      mapInstanceRef.current.setView([latCliente, lngCliente], currentZoom, {
        animate: true,
      });
    }
  };

  // Función para ver todos los distribuidores
  const handleVerTodosDistribuidores = () => {
    if (mapInstanceRef.current && distLayerRef.current) {
      const markers = distLayerRef.current.getLayers() as L.Marker[];
      if (markers.length > 0) {
        const allPoints: L.LatLngExpression[] = [
          [latCliente, lngCliente],
          ...markers.map((m) => m.getLatLng()),
        ];
        const bounds = L.latLngBounds(allPoints);
        mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
      }
    }
  };

  const totalDirectas = distribuidoras.filter((d) => d.tieneCoberturaDirecta).length;
  const totalLejanas = distribuidoras.length - totalDirectas;

  return (
    <div className="relative w-full h-full min-h-[220px] rounded-xl overflow-hidden border border-slate-200 dark:border-neutral-800 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full min-h-[220px] z-0" />

      {/* Botones de control rápido sobre el mapa */}
      <div className="absolute top-2 right-2 z-[400] flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleCentrarCliente}
          className="px-2.5 py-1 bg-white/95 hover:bg-white text-slate-800 rounded-lg text-[10px] font-bold shadow-xs border border-slate-200 flex items-center gap-1 transition cursor-pointer backdrop-blur-xs"
          title="Centrar mapa en mi dirección de entrega"
        >
          <span>🏠 Mi Entrega</span>
        </button>
        <button
          type="button"
          onClick={handleVerTodosDistribuidores}
          className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[10px] font-bold shadow-xs flex items-center gap-1 transition cursor-pointer"
          title="Ver todos los distribuidores en el mapa"
        >
          <span>🗺️ Ver Todos ({distribuidoras.length})</span>
        </button>
      </div>

      {/* Leyenda flotante en el mapa */}
      <div className="absolute bottom-2 left-2 z-[400] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-neutral-800 text-[10px] shadow-sm space-y-1 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#03246b] border border-white inline-block"></span>
          <span className="font-bold text-slate-800 dark:text-neutral-200">
            Tu Entrega
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-600 border border-white inline-block"></span>
          <span className="font-bold text-orange-700 dark:text-orange-400">
            Directa ({totalDirectas})
          </span>
        </div>
        {totalLejanas > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-white inline-block"></span>
            <span className="font-semibold text-slate-600 dark:text-neutral-400">
              Otras ({totalLejanas})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
