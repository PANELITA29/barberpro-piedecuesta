"use client";

import React, { useEffect, useRef } from "react";
import type { Barberia } from "@/lib/geo";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

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
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Record<string, LeafletMarker>>({});
  const userMarkerRef = useRef<LeafletMarker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);

  // Helper para crear icono según selección
  const createBarberIcon = (
    L: typeof import("leaflet"),
    b: Barberia & { rating: number },
    isSelected: boolean
  ) => {
    const displayName = b.nombre.includes("—") ? b.nombre.split("—")[1].trim() : b.nombre;
    return L.divIcon({
      className: "leaflet-custom-marker-wrapper",
      html: `
            <div class="relative inline-flex flex-col items-center cursor-pointer transform -translate-x-1/2 -translate-y-full hover:scale-110 transition-all duration-200">
              <div class="inline-flex items-center gap-2 rounded-full ${
                isSelected
                  ? "bg-amber-500 text-white ring-4 ring-amber-500/40 shadow-2xl scale-105"
                  : "bg-zinc-950 text-white border border-amber-500/50 shadow-xl"
              } px-3 py-1.5 text-xs font-black tracking-tight whitespace-nowrap">
                <span class="text-xs">💈</span>
                <span class="text-[11px] font-bold text-amber-300 ${isSelected ? "!text-white" : ""}">${displayName}</span>
                <span class="rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] text-amber-400 font-bold ml-0.5">★ ${b.rating}</span>
              </div>
              <div class="w-2.5 h-2.5 ${
                isSelected ? "bg-amber-500" : "bg-zinc-950 border-r border-b border-amber-500/50"
              } rotate-45 -mt-1.5 shadow-sm"></div>
            </div>
          `,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  };

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = (await import("leaflet")).default as unknown as typeof import("leaflet");
      leafletRef.current = L as unknown as typeof import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (cancelled) return;

      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 15,
        zoomControl: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map as unknown as LeafletMap;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map as unknown as LeafletMap);

      L.control.zoom({ position: "topright" }).addTo(map as unknown as LeafletMap);

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
        .addTo(map as unknown as LeafletMap)
        .bindTooltip(`<b>Tu Ubicación</b><br>${userLocation.nombre}`, {
          direction: "top",
          offset: [0, -10],
          className: "leaflet-custom-tooltip",
        });

      userMarkerRef.current = uMarker as unknown as LeafletMarker;

      barberias.forEach((b) => {
        const isSelected = selectedBarberiaId === b.id;
        const barberIcon = createBarberIcon(L, b, isSelected);
        const marker = L.marker([b.latitud, b.longitud], { icon: barberIcon }).addTo(
          map as unknown as LeafletMap
        );

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

        markersRef.current[b.id] = marker as unknown as LeafletMarker;
      });
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = {};
        userMarkerRef.current = null;
      }
    };
  }, []); // init once

  // Actualizar iconos y posición cuando cambia selección o ubicación
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = leafletRef.current;
    if (!map || !L) return;

    // Actualizar icono de selección sin recrear mapa
    barberias.forEach((b) => {
      const marker = markersRef.current[b.id];
      if (marker) {
        const isSelected = selectedBarberiaId === b.id;
        const newIcon = createBarberIcon(L, b, isSelected);
        marker.setIcon(newIcon);
      }
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng] as unknown as [number, number]);
      // Actualizar tooltip texto si cambia nombre
      const tooltip = (userMarkerRef.current as unknown as { getTooltip: () => { setContent: (s: string) => void } }).getTooltip?.();
      if (tooltip) tooltip.setContent(`<b>Tu Ubicación</b><br>${userLocation.nombre}`);
    }

    if (selectedBarberiaId && markersRef.current[selectedBarberiaId]) {
      const selectedB = barberias.find((b) => b.id === selectedBarberiaId);
      if (selectedB) {
        (map as unknown as { flyTo: (latlng: [number, number], zoom: number, opts: unknown) => void }).flyTo(
          [selectedB.latitud, selectedB.longitud],
          16,
          { duration: 1.2 }
        );
      }
    }
  }, [userLocation, selectedBarberiaId, barberias]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      (mapInstanceRef.current as unknown as { flyTo: (latlng: [number, number], zoom: number, opts: unknown) => void }).flyTo(
        [userLocation.lat, userLocation.lng],
        15,
        { duration: 1 }
      );
    }
  };

  return (
    <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800 shadow-md">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-md text-xs">
        <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
        <span className="font-black text-zinc-900 dark:text-white">
          Mapa en Vivo • {barberias.length} Barberías Marcadas
        </span>
      </div>

      <button
        type="button"
        onClick={handleRecenter}
        className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-3.5 py-2 text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer"
        title="Centrar en mi ubicación"
      >
        <span>🎯</span> Mi Ubicación
      </button>

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
