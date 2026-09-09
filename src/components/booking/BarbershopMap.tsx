"use client";

import React, { useEffect, useRef } from "react";
import type { Barberia } from "@/lib/geo";

interface BarbershopMapProps {
  barberias: (Barberia & { distanciaTexto?: string; distanciaKm?: number })[];
  selectedBarberiaId: string | null;
  userLocation: { lat: number; lng: number; nombre: string };
  onSelectBarberia: (barberia: Barberia) => void;
}

export function BarbershopMap({
  barberias,
  selectedBarberiaId,
  userLocation,
  onSelectBarberia,
}: BarbershopMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<{ [key: string]: any }>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userMarkerRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;

      // Importar leaflet dinámicamente en el cliente
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Si el mapa ya existe, no recrearlo
      if (mapInstanceRef.current) {
        return;
      }

      // Crear instancia de mapa centrada en Piedecuesta
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      // Capa de mosaicos moderna (CartoDB Positron / OSM)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      // Control de zoom en esquina superior derecha
      L.control.zoom({ position: "topright" }).addTo(map);

      // Marcador de Usuario (GPS Pulse)
      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
            <div class="relative w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-[10px] text-white font-black">
              📍
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const uMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindTooltip(`<b>Tu Ubicación</b><br>${userLocation.nombre}`, {
          direction: "top",
          offset: [0, -10],
          className: "leaflet-custom-tooltip",
        });

      userMarkerRef.current = uMarker;

      // Crear marcadores para cada barbería
      barberias.forEach((b) => {
        const isSelected = selectedBarberiaId === b.id;

        const barberIcon = L.divIcon({
          className: `custom-barber-marker-${b.id}`,
          html: `
            <div class="group relative cursor-pointer transform transition-all duration-200 hover:scale-115">
              <div class="flex items-center gap-1.5 rounded-full ${
                isSelected
                  ? "bg-amber-500 text-white ring-4 ring-amber-500/30 shadow-xl scale-110"
                  : "bg-zinc-900 text-amber-400 border border-amber-500/50 shadow-md"
              } px-2.5 py-1 text-[11px] font-black tracking-tight whitespace-nowrap">
                <span class="text-xs">💈</span>
                <span>${b.nombre.split("—")[1]?.trim() || b.nombre.slice(0, 18)}</span>
                <span class="bg-black/30 px-1 py-0.2 rounded text-[10px] text-white">★ ${b.rating}</span>
              </div>
              <div class="w-2 h-2 bg-amber-500 rotate-45 mx-auto -mt-1 shadow-sm"></div>
            </div>
          `,
          iconSize: [140, 36],
          iconAnchor: [70, 36],
        });

        const marker = L.marker([b.latitud, b.longitud], { icon: barberIcon }).addTo(map);

        // Contenido del Popup al hacer clic
        const popupContent = document.createElement("div");
        popupContent.className = "p-1 space-y-2 max-w-[220px]";
        popupContent.innerHTML = `
          <div class="relative h-24 w-full rounded-xl overflow-hidden mb-1.5">
            <img src="${b.foto_url}" alt="${b.nombre}" class="w-full h-full object-cover" />
            <div class="absolute top-1 left-1 bg-black/80 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md">
              📍 ${b.distanciaTexto || "Piedecuesta"}
            </div>
          </div>
          <h4 class="font-black text-xs text-zinc-900 leading-tight">${b.nombre}</h4>
          <p class="text-[11px] text-zinc-500 leading-tight">📌 ${b.direccion}</p>
          <div class="flex items-center justify-between text-[10px] pt-1">
            <span class="text-amber-600 font-bold">★ ${b.rating} (${b.total_resenas} reseñas)</span>
            <span class="text-emerald-600 font-semibold">🚗 Parqueadero</span>
          </div>
          <button id="btn-select-${b.id}" class="w-full mt-2 rounded-xl bg-amber-500 py-2 text-[11px] font-black text-white hover:bg-amber-600 transition shadow-sm cursor-pointer text-center">
            ✂️ Seleccionar esta Sede
          </button>
        `;

        // Conectar el botón del popup al handler de React
        const btn = popupContent.querySelector(`#btn-select-${b.id}`);
        if (btn) {
          btn.addEventListener("click", () => {
            onSelectBarberia(b);
            map.closePopup();
          });
        }

        marker.bindPopup(popupContent, {
          offset: [0, -32],
          maxWidth: 240,
          className: "custom-leaflet-popup",
        });

        marker.on("click", () => {
          onSelectBarberia(b);
        });

        markersRef.current[b.id] = marker;
      });
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current && !isMounted) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Actualizar posición de usuario o selección cuando cambien props
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
    }

    if (selectedBarberiaId && markersRef.current[selectedBarberiaId]) {
      const selectedB = barberias.find((b) => b.id === selectedBarberiaId);
      if (selectedB) {
        map.flyTo([selectedB.latitud, selectedB.longitud], 16, {
          duration: 1.2,
        });
      }
    }
  }, [userLocation, selectedBarberiaId, barberias]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 15, {
        duration: 1,
      });
    }
  };

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-md">
      {/* Contenedor del Mapa Leaflet */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Header Info Badge */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-md text-xs">
        <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
        <span className="font-black text-zinc-900 dark:text-white">
          Mapa en Vivo • {barberias.length} Barberías Marcadas
        </span>
      </div>

      {/* Floating Recenter Button */}
      <button
        type="button"
        onClick={handleRecenter}
        className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-3.5 py-2 text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
        title="Centrar en mi ubicación"
      >
        <span>🎯</span> Mi Ubicación
      </button>

      {/* Legend Pill */}
      <div className="absolute bottom-3 left-3 z-10 hidden sm:flex items-center gap-3 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 shadow-md">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-600" /> Tú
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Barberías
        </span>
      </div>
    </div>
  );
}
