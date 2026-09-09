import React from "react";
import type { ReservaEstado } from "@/types/database";

interface BadgeProps {
  estado: ReservaEstado | string;
  className?: string;
}

export function Badge({ estado, className = "" }: BadgeProps) {
  const getStyle = () => {
    switch (estado) {
      case "confirmada":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "pendiente":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "completada":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "cancelada":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";
    }
  };

  const getLabel = () => {
    switch (estado) {
      case "confirmada":
        return "Confirmada";
      case "pendiente":
        return "Pendiente";
      case "completada":
        return "Completada";
      case "cancelada":
        return "Cancelada";
      default:
        return estado;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize transition-colors ${getStyle()} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          estado === "confirmada"
            ? "bg-emerald-500"
            : estado === "pendiente"
            ? "bg-amber-500 animate-pulse"
            : estado === "completada"
            ? "bg-blue-500"
            : "bg-red-500"
        }`}
      />
      {getLabel()}
    </span>
  );
}
