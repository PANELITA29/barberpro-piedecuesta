"use client";

import React from "react";
import type { Servicio } from "@/types/database";

interface CardServicioProps {
  servicio: Servicio;
  onReservar?: (servicio: Servicio) => void;
}

export function CardServicio({ servicio, onReservar }: CardServicioProps) {
  return (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-zinc-200/80 bg-white p-5 dark:bg-zinc-900 dark:border-zinc-800 hover:border-amber-500/50 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start gap-4">
        {/* Luxury Scissors Icon Box */}
        <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-amber-500 flex items-center justify-center font-black text-lg dark:bg-zinc-800 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
          ✂
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-black tracking-tight text-zinc-900 dark:text-white text-base">
              {servicio.nombre}
            </h4>
            {servicio.duracion_min && (
              <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2.5 py-0.5 text-[10px] font-bold">
                {servicio.duracion_min} min
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
            {servicio.descripcion || "Servicio profesional con tijera, máquina y acabado de alta precisión en Piedecuesta."}
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
        className="w-full sm:w-auto rounded-2xl bg-amber-500 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 transition-all cursor-pointer flex-shrink-0"
      >
        Reservar Silla →
      </button>
    </div>
  );
}
