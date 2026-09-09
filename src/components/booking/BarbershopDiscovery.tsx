"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  BARBERIAS_REGISTRADAS,
  BARRIOS_PIEDECUESTA,
  calcularDistanciaKm,
  formatearDistancia,
  type Barberia,
} from "@/lib/geo";

interface BarbershopDiscoveryProps {
  selectedBarberiaId: string | null;
  onSelectBarberia: (barberia: Barberia) => void;
}

export function BarbershopDiscovery({
  selectedBarberiaId,
  onSelectBarberia,
}: BarbershopDiscoveryProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; nombre: string }>({
    lat: 6.9885,
    lng: -73.0495,
    nombre: "Centro Histórico / Parque Principal",
  });
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Detección por GPS de HTML5
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError("Tu navegador no soporta geolocalización.");
      return;
    }

    setDetectingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          nombre: "Tu ubicación GPS exacta",
        });
        setDetectingGps(false);
      },
      (error) => {
        console.warn("Error obteniendo GPS:", error);
        setGpsError("No se pudo obtener el GPS (permiso denegado). Selecciona tu barrio abajo.");
        setDetectingGps(false);
      },
      { timeout: 8000 }
    );
  };

  // Selector manual de barrio en Piedecuesta
  const handleSelectBarrio = (barrioId: string) => {
    const barrio = BARRIOS_PIEDECUESTA.find((b) => b.id === barrioId);
    if (barrio) {
      setUserLocation({
        lat: barrio.latitud,
        lng: barrio.longitud,
        nombre: barrio.nombre,
      });
      setGpsError(null);
    }
  };

  // Lista de barberías ordenadas por distancia
  const barberiasOrdenadas = useMemo(() => {
    return BARBERIAS_REGISTRADAS.map((b) => {
      const dist = calcularDistanciaKm(
        userLocation.lat,
        userLocation.lng,
        b.latitud,
        b.longitud
      );
      return {
        ...b,
        distanciaKm: dist,
        distanciaTexto: formatearDistancia(dist),
      };
    }).sort((a, b) => a.distanciaKm - b.distanciaKm);
  }, [userLocation]);

  return (
    <div className="space-y-6">
      {/* Location Bar & Selector Header */}
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 text-sm font-bold">
                📍
              </span>
              <h3 className="font-black text-zinc-900 dark:text-white text-base">
                Estás cerca de: <span className="text-amber-600 dark:text-amber-400">{userLocation.nombre}</span>
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Calculando barberías y disponibilidad más cercanas en Piedecuesta.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDetectGPS}
            disabled={detectingGps}
            className="rounded-2xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            {detectingGps ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Localizando...
              </span>
            ) : (
              <>
                <span>🎯</span> Usar mi GPS
              </>
            )}
          </button>
        </div>

        {gpsError && (
          <p className="mt-3 text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900">
            ℹ️ {gpsError}
          </p>
        )}

        {/* Quick Neighborhood Pills Selector */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap mr-1">
            Barrio:
          </span>
          {BARRIOS_PIEDECUESTA.map((barrio) => (
            <button
              key={barrio.id}
              onClick={() => handleSelectBarrio(barrio.id)}
              className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold border transition-all ${
                userLocation.nombre === barrio.nombre
                  ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                  : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300"
              }`}
            >
              {barrio.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Barbershop Sedes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">
            Barberías y Sedes Cercanas ({barberiasOrdenadas.length})
          </h3>
          <span className="text-xs text-zinc-400">Ordenadas por proximidad</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {barberiasOrdenadas.map((b) => {
            const isSelected = selectedBarberiaId === b.id;

            return (
              <div
                key={b.id}
                className={`group rounded-3xl border overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? "border-amber-500 bg-amber-500/5 dark:bg-amber-950/20 shadow-xl ring-2 ring-amber-500/20"
                    : "border-zinc-200/80 bg-white hover:border-amber-500/40 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                }`}
              >
                <div>
                  {/* Photo of Barbershop */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={b.foto_url}
                      alt={b.nombre}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Distance Pill */}
                    <div className="absolute top-3 left-3 bg-zinc-950/85 backdrop-blur-xs text-amber-400 text-xs font-black px-3 py-1 rounded-xl shadow-md flex items-center gap-1.5">
                      <span>📍</span> {b.distanciaTexto}
                    </div>

                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 bg-white/95 text-zinc-900 text-xs font-black px-2.5 py-1 rounded-xl shadow-md">
                      ★ {b.rating} ({b.total_resenas})
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-2.5">
                    <h4 className="font-black text-lg text-zinc-900 dark:text-white leading-tight">
                      {b.nombre}
                    </h4>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-1.5">
                      <span>📌</span>
                      <span>{b.direccion}</span>
                    </p>

                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <span>⏰</span>
                      <span>{b.horario}</span>
                    </p>

                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span>🚗</span>
                      <span>Parqueadero disponible para clientes</span>
                    </p>
                  </div>
                </div>

                {/* Select Barbershop Button */}
                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => onSelectBarberia(b)}
                    className={`w-full rounded-2xl py-3 text-xs font-bold transition-all shadow-md cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-amber-500 text-white hover:bg-amber-600 hover:scale-102 active:scale-98"
                    }`}
                  >
                    {isSelected
                      ? "✓ Sede Seleccionada — Ver Barberos"
                      : "Ver Barberos y Servicios de esta Sede →"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
