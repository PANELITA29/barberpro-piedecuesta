"use client";

import React from "react";
import type { Servicio } from "@/types/database";
import Image from "next/image";

interface CardServicioProps {
  servicio: Servicio;
  onReservar?: (servicio: Servicio) => void;
}

export function CardServicio({ servicio, onReservar }: CardServicioProps) {
  // Asignar imagen adecuada según el nombre o categoría si no tiene imagen_url explícita
  const getImageSource = () => {
    if (servicio.imagen_url) return servicio.imagen_url;
    const lowerName = servicio.nombre.toLowerCase();
    if (lowerName.includes("barba") && !lowerName.includes("combo")) {
      return "/images/perfilado_barba.jpg";
    }
    if (lowerName.includes("combo") || lowerName.includes("vip")) {
      return "/images/combo_full_vip.jpg";
    }
    return "/images/corte_clasico.jpg";
  };

  return (
    <div className="group flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-3xl border border-zinc-200/80 bg-white p-4 sm:p-5 dark:bg-zinc-900 dark:border-zinc-800 hover:border-amber-500/50 hover:shadow-xl transition-all duration-200">
      <div className="flex items-start sm:items-center gap-4">
        {/* Haircut Preview Photo */}
        <div className="relative h-24 w-24 sm:h-20 sm:w-20 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex-shrink-0 shadow-md">
          <Image
            src={getImageSource()}
            alt={servicio.nombre}
            fill
            sizes="(max-width: 768px) 100px, 80px"
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-1 left-1 bg-zinc-900/80 backdrop-blur-xs text-amber-400 text-[10px] font-black px-1.5 py-0.5 rounded-lg">
            ★ 4.9
          </div>
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-black tracking-tight text-zinc-900 dark:text-white text-base">
              {servicio.nombre}
            </h4>
            {servicio.duracion_min && (
              <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2.5 py-0.5 text-[10px] font-bold">
                ⏱️ {servicio.duracion_min} min
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
            {servicio.descripcion ||
              "Corte profesional de alta precisión, delineado impecable y peinado con fijación mate en Piedecuesta."}
          </p>

          <p className="text-sm font-black text-amber-600 dark:text-amber-400">
            ${servicio.precio.toLocaleString("es-CO")}{" "}
            <span className="text-[10px] font-semibold text-zinc-400">COP</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onReservar && onReservar(servicio)}
        className="w-full sm:w-auto rounded-2xl bg-amber-500 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-all cursor-pointer flex-shrink-0 hover:scale-105 active:scale-95 text-center"
      >
        Reservar Silla ✂️
      </button>
    </div>
  );
}
