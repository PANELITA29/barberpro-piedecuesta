"use client";

import React from "react";
import Image from "next/image";
import type { BarberoProfile, Barberia } from "@/lib/geo";

interface BarberSecurityCardProps {
  barbero: BarberoProfile;
  barberia?: Barberia;
  onSelect?: (barbero: BarberoProfile) => void;
  isSelected?: boolean;
}

export function BarberSecurityCard({
  barbero,
  barberia,
  onSelect,
  isSelected = false,
}: BarberSecurityCardProps) {
  return (
    <div
      className={`group relative rounded-3xl border p-5 transition-all duration-200 flex flex-col justify-between ${
        isSelected
          ? "border-amber-500 bg-amber-500/5 dark:bg-amber-950/20 shadow-lg ring-2 ring-amber-500/20"
          : "border-zinc-200/80 bg-white hover:border-amber-500/40 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
      }`}
    >
      <div className="space-y-4">
        {/* Barber Header: Photo + Verified Badge */}
        <div className="flex items-start gap-4">
          <div className="relative h-20 w-20 rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-md flex-shrink-0">
            <Image
              src={barbero.foto_url || "/images/barbero_carlos.jpg"}
              alt={barbero.nombre}
              fill
              sizes="80px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Safety Verified Shield */}
            <div
              className="absolute top-1 right-1 bg-emerald-500 text-white p-1 rounded-full shadow-sm"
              title="Identidad y Certificación Verificada"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-black tracking-tight text-zinc-900 dark:text-white text-base leading-tight truncate">
                {barbero.nombre}
              </h4>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.2 text-[10px] font-black uppercase tracking-wider">
                🛡️ Verificado
              </span>
            </div>

            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 leading-tight">
              {barbero.especialidad}
            </p>

            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                ★ 4.9 (120+ reseñas)
              </span>
              <span>•</span>
              <span>{barbero.experiencia_anos} años exp.</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
          {barbero.biografia}
        </p>

        {/* Barbershop Affiliation */}
        {barberia && (
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950 p-3 border border-zinc-100 dark:border-zinc-800/80 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">Establecimiento:</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[170px]">
                {barberia.nombre.split("—")[1] || barberia.nombre}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              📍 {barberia.direccion}
            </p>
          </div>
        )}

        {/* Services Offered Count Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {barbero.servicios_ofrecidos.map((s) => (
            <span
              key={s.id}
              className="rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 text-[11px] font-semibold"
            >
              ✂️ {s.nombre} (${(s.precio / 1000).toFixed(0)}k)
            </span>
          ))}
        </div>
      </div>

      {/* Select CTA Button */}
      <button
        type="button"
        onClick={() => onSelect && onSelect(barbero)}
        className={`w-full mt-4 rounded-2xl py-3 text-xs font-bold transition-all shadow-md cursor-pointer ${
          isSelected
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : "bg-amber-500 text-white hover:bg-amber-600 hover:scale-102 active:scale-98"
        }`}
      >
        {isSelected ? "✓ Barbero Seleccionado" : "Elegir Barbero & Ver Menú →"}
      </button>
    </div>
  );
}
