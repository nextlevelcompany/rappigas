"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PedidoRepartidor } from "@/app/(repartidor)/repartidor/pedidos/page";
import { Compass, Navigation, Phone, MessageCircle, Truck, ShieldCheck, MapPin, Layers } from "lucide-react";

interface MapaRepartidorRutaProps {
  coordenadasGps: { lat: number; lng: number };
  pedidos: PedidoRepartidor[];
  pedidoSeleccionadoId?: string | null;
  onSeleccionarPedido?: (pedido: PedidoRepartidor) => void;
  onIniciarRuta?: (pedidoPublicId: string) => void;
  onValidarEntrega?: (pedido: PedidoRepartidor) => void;
  altura?: string;
}

// Icono animado del repartidor con GPS en vivo (Moto Torito GLP)
const crearIconoChofer = () => {
  return L.divIcon({
    className: "rappigas-pin-chofer",
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <div style="
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(147, 51, 234, 0.25);
          animation: pulse 2s infinite ease-out;
        "></div>
        <div style="
          width: 34px;
          height: 34px;
          background: #7e22ce;
          border: 2.5px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(126, 34, 206, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        ">
          🛵
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
};

// Icono para parada de entrega de cliente
const crearIconoPedido = (
  indice: number,
  esActivo: boolean,
  esEnCamino: boolean,
  numeroPedido?: string
) => {
  const bg = esEnCamino ? "#16a34a" : esActivo ? "#ea580c" : "#2563eb";
  const etiqueta = numeroPedido ? numeroPedido.replace("PG-2026-", "#").replace("PG-", "#") : `#${indice + 1}`;

  return L.divIcon({
    className: "rappigas-pin-pedido",
    html: `
      <div style="position: relative; width: 40px; height: 48px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="
          width: 36px;
          height: 36px;
          background: ${bg};
          border: 2.5px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            color: #ffffff;
            font-size: 11px;
            font-weight: 900;
            font-family: monospace;
            line-height: 1;
            text-align: center;
          ">
            ${esEnCamino ? "🚚" : "🔥"}
          </div>
        </div>
        <div style="
          margin-top: -2px;
          background: #0f172a;
          color: #ffffff;
          font-family: monospace;
          font-size: 9px;
          font-weight: 800;
          padding: 1px 4px;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.4);
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.25);
        ">
          ${etiqueta}
        </div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -48],
  });
};

export function MapaRepartidorRuta({
  coordenadasGps,
  pedidos,
  pedidoSeleccionadoId,
  onSeleccionarPedido,
  onIniciarRuta,
  onValidarEntrega,
  altura = "380px",
}: MapaRepartidorRutaProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const choferMarkerRef = useRef<L.Marker | null>(null);
  const pedidosLayerRef = useRef<L.LayerGroup | null>(null);
  const rutaPolylineRef = useRef<L.Polyline | null>(null);

  // Inicialización del Mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const mapa = L.map(mapContainerRef.current, {
      center: [coordenadasGps.lat, coordenadasGps.lng],
      zoom: 14,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(mapa);

    // Capa de mapa oficial de OpenStreetMap (100% libre, sin requerir API key)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | RappiGas Ruta',
      maxZoom: 19,
    }).addTo(mapa);

    pedidosLayerRef.current = L.layerGroup().addTo(mapa);
    mapInstanceRef.current = mapa;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Actualizar marcador GPS del chofer
  useEffect(() => {
    const mapa = mapInstanceRef.current;
    if (!mapa) return;

    if (!choferMarkerRef.current) {
      choferMarkerRef.current = L.marker([coordenadasGps.lat, coordenadasGps.lng], {
        icon: crearIconoChofer(),
        zIndexOffset: 1000,
      }).addTo(mapa);

      choferMarkerRef.current.bindPopup(`
        <div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
          <strong style="color: #7e22ce; display: block; margin-bottom: 2px;">🛵 Mi Posición Actual</strong>
          <span style="color: #64748b;">Transmitiendo GPS en vivo a central</span>
        </div>
      `);
    } else {
      choferMarkerRef.current.setLatLng([coordenadasGps.lat, coordenadasGps.lng]);
    }
  }, [coordenadasGps]);

  // Dibujar pedidos y ruta en el mapa
  useEffect(() => {
    const mapa = mapInstanceRef.current;
    const layer = pedidosLayerRef.current;
    if (!mapa || !layer) return;

    layer.clearLayers();

    if (rutaPolylineRef.current) {
      rutaPolylineRef.current.remove();
      rutaPolylineRef.current = null;
    }

    const bounds = L.latLngBounds([L.latLng(coordenadasGps.lat, coordenadasGps.lng)]);
    const puntosRuta: [number, number][] = [[coordenadasGps.lat, coordenadasGps.lng]];

    pedidos.forEach((pedido, idx) => {
      if (!pedido.latitud || !pedido.longitud) return;

      const esEnCamino = pedido.estado === "EN_CAMINO";
      const esSeleccionado = pedido.publicId === pedidoSeleccionadoId;
      const icono = crearIconoPedido(idx, esSeleccionado, esEnCamino, pedido.numeroPedido);

      const marker = L.marker([pedido.latitud, pedido.longitud], { icon: icono });

      // Contenido del popup interactivo
      const totalBalones = pedido.items?.reduce((a, b) => a + b.cantidad, 0) || 1;
      const primerItemNombre = pedido.items?.[0]?.nombreProducto || "Balón de Gas GLP";
      const msgWa = encodeURIComponent(
        `Hola ${pedido.nombreCliente}, soy tu repartidor de RappiGas con tu pedido de ${primerItemNombre}. Me encuentro cerca a tu dirección: ${pedido.direccionEntrega}. ¡Llego en unos minutos! 🚚🔥`
      );

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; min-width: 220px; max-width: 260px; font-size: 11px; color: #1e293b; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 4px;">
            <strong style="font-family: monospace; color: #0f172a; font-size: 11px;">
              ${pedido.numeroPedido || `#PG-${pedido.publicId.slice(0, 8).toUpperCase()}`}
            </strong>
            <span style="
              font-size: 9px;
              font-weight: 800;
              padding: 1px 6px;
              border-radius: 999px;
              background: ${esEnCamino ? "#f3e8ff" : "#eff6ff"};
              color: ${esEnCamino ? "#6b21a8" : "#1d4ed8"};
              border: 1px solid ${esEnCamino ? "#d8b4fe" : "#bfdbfe"};
            ">
              ${esEnCamino ? "EN RUTA" : "POR SALIR"}
            </span>
          </div>

          <div style="margin-bottom: 4px;">
            <div style="font-weight: 900; font-size: 12px; color: #0f172a;">${pedido.nombreCliente}</div>
            <div style="color: #475569; font-size: 10px; margin-top: 2px;">📍 ${pedido.direccionEntrega}</div>
            ${pedido.referenciaDireccion ? `<div style="color: #64748b; font-size: 9px; margin-top: 1px;">Ref: ${pedido.referenciaDireccion}</div>` : ""}
          </div>

          <div style="background: #fff7ed; border: 1px solid #fed7aa; padding: 3px 6px; border-radius: 6px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #9a3412; font-weight: 700; font-size: 10px;">🔥 ${totalBalones} cilindro(s)</span>
            <strong style="font-family: monospace; color: #ea580c; font-size: 12px;">S/ ${pedido.total.toFixed(2)} (${pedido.metodoPago})</strong>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 4px;">
            ${pedido.telefonoCliente ? `
              <a href="https://wa.me/51${pedido.telefonoCliente}?text=${msgWa}" target="_blank" style="
                background: #ecfdf5;
                color: #047857;
                border: 1px solid #a7f3d0;
                padding: 4px 6px;
                border-radius: 6px;
                text-align: center;
                font-weight: 800;
                text-decoration: none;
                font-size: 10px;
                display: block;
              ">💬 WhatsApp</a>
              <a href="tel:${pedido.telefonoCliente}" style="
                background: #f1f5f9;
                color: #334155;
                border: 1px solid #cbd5e1;
                padding: 4px 6px;
                border-radius: 6px;
                text-align: center;
                font-weight: 800;
                text-decoration: none;
                font-size: 10px;
                display: block;
              ">📞 Llamar</a>
            ` : ""}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; margin-top: 4px;">
            <a href="https://www.google.com/maps/dir/?api=1&destination=${pedido.latitud},${pedido.longitud}" target="_blank" style="
              background: #eff6ff;
              color: #1d4ed8;
              border: 1px solid #bfdbfe;
              padding: 4px 6px;
              border-radius: 6px;
              text-align: center;
              font-weight: 800;
              text-decoration: none;
              font-size: 10px;
              display: block;
            ">🗺️ Maps</a>
            <a href="https://waze.com/ul?ll=${pedido.latitud},${pedido.longitud}&navigate=yes" target="_blank" style="
              background: #ecfeff;
              color: #0e7490;
              border: 1px solid #a5f3fc;
              padding: 4px 6px;
              border-radius: 6px;
              text-align: center;
              font-weight: 800;
              text-decoration: none;
              font-size: 10px;
              display: block;
            ">🧭 Waze</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        if (onSeleccionarPedido) onSeleccionarPedido(pedido);
      });

      layer.addLayer(marker);
      bounds.extend([pedido.latitud, pedido.longitud]);

      if (esEnCamino || esSeleccionado) {
        puntosRuta.push([pedido.latitud, pedido.longitud]);
      }
    });

    // Trazo de línea de ruta conectando la moto con las entregas
    if (puntosRuta.length > 1) {
      rutaPolylineRef.current = L.polyline(puntosRuta, {
        color: "#ea580c",
        weight: 3,
        dashArray: "6, 8",
        opacity: 0.85,
      }).addTo(mapa);
    }

    // Auto-ajustar zoom para ver tanto al repartidor como a sus entregas
    if (pedidos.length > 0) {
      mapa.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [pedidos, coordenadasGps, pedidoSeleccionadoId]);

  // Centrar en GPS
  const handleCentrarGps = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([coordenadasGps.lat, coordenadasGps.lng], 16, {
      duration: 1.2,
    });
  };

  // Ajustar todos los puntos
  const handleVerTodo = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([L.latLng(coordenadasGps.lat, coordenadasGps.lng)]);
    pedidos.forEach((p) => {
      if (p.latitud && p.longitud) bounds.extend([p.latitud, p.longitud]);
    });
    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      {/* Contenedor del Mapa Leaflet */}
      <div ref={mapContainerRef} style={{ width: "100%", height: altura }} />

      {/* Controles Flotantes Sobre el Mapa */}
      <div className="absolute top-2.5 right-2.5 z-[500] flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleCentrarGps}
          className="p-2 rounded-xl bg-white/95 backdrop-blur-xs hover:bg-white text-purple-700 shadow-md border border-slate-200 transition cursor-pointer flex items-center gap-1.5 text-[11px] font-bold"
          title="Centrar en mi ubicación GPS"
        >
          <Compass className="w-3.5 h-3.5 text-purple-600 animate-spin shrink-0" />
          <span>Mi GPS</span>
        </button>

        <button
          type="button"
          onClick={handleVerTodo}
          className="p-2 rounded-xl bg-white/95 backdrop-blur-xs hover:bg-white text-slate-700 shadow-md border border-slate-200 transition cursor-pointer flex items-center gap-1.5 text-[11px] font-bold"
          title="Encuadrar todas las entregas"
        >
          <Navigation className="w-3.5 h-3.5 text-orange-600 shrink-0" />
          <span>Ver Ruta</span>
        </button>
      </div>

      {/* Leyenda Inferior Discreta */}
      <div className="absolute bottom-2.5 left-2.5 z-[500] bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm text-[10px] flex items-center gap-2.5 text-slate-600 font-bold">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
          <span>Mi Moto (GPS)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
          <span>Por Salir</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
          <span>En Camino</span>
        </div>
      </div>
    </div>
  );
}
