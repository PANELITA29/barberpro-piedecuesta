"use client";

import React from "react";
import type { Reserva, Servicio, Profile } from "@/types/database";

interface BookingTicketProps {
  reserva: Partial<Reserva> & {
    servicio?: Partial<Servicio> | null;
    barbero?: Partial<Profile> | null;
    extras?: { nombre: string; precio: number }[] | null;
  };
  onClose?: () => void;
  onViewReservations?: () => void;
}

export function BookingTicket({
  reserva,
  onClose,
  onViewReservations,
}: BookingTicketProps) {
  const fecha = reserva.fecha_hora ? new Date(reserva.fecha_hora) : new Date();
  const fechaFormateada = fecha.toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const horaFormateada = fecha.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `💈 ¡Hola! Tengo una cita reservada en BarberPro Piedecuesta.\n` +
      `📅 Fecha: ${fechaFormateada} a las ${horaFormateada}\n` +
      `✂️ Servicio: ${reserva.servicio?.nombre || "Corte"}\n` +
      `💰 Total: $${(reserva.total || 0).toLocaleString("es-CO")} COP\n` +
      `Código: #${(reserva.id || "DEMO").slice(0, 8).toUpperCase()}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="w-full max-w-sm mx-auto animate-in zoom-in-95 duration-200">
      {/* Top Banner Success */}
      <div className="text-center mb-4">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold text-2xl shadow-sm mb-2">
          ✓
        </div>
        <h3 className="text-xl font-black text-zinc-900 dark:text-white">
          ¡Reserva Confirmada!
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Tu silla está asegurada en Piedecuesta
        </p>
      </div>

      {/* Ticket Voucher Card */}
      <div className="relative rounded-3xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 shadow-lg overflow-hidden">
        {/* Decorative Top Barber Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#DC2626_0_12px,white_12px_24px,#111827_24px_36px)]" />

        {/* Voucher Header */}
        <div className="flex justify-between items-start pb-4 border-b border-dashed border-zinc-300 dark:border-zinc-800 mt-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
              VOUCHER OFICIAL
            </span>
            <p className="text-sm font-black text-zinc-900 dark:text-white">
              BARBERPRO PIEDECUESTA
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded-lg text-zinc-700 dark:text-zinc-300">
            #{(reserva.id || "BP-2026").slice(0, 8).toUpperCase()}
          </span>
        </div>

        {/* Details Grid */}
        <div className="py-4 space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Barbero:</span>
            <span className="font-bold text-zinc-900 dark:text-white">
              {reserva.barbero?.nombre || "Carlos Master Barber"} ✂️
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Servicio:</span>
            <span className="font-bold text-zinc-900 dark:text-white">
              {reserva.servicio?.nombre || "Corte Clásico"}
            </span>
          </div>

          {reserva.extras && reserva.extras.length > 0 && (
            <div className="flex justify-between">
              <span className="text-zinc-500 dark:text-zinc-400">Extras:</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">
                +{reserva.extras.map((e) => e.nombre).join(", ")}
              </span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Fecha:</span>
            <span className="font-bold capitalize text-zinc-900 dark:text-white">
              {fechaFormateada}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-zinc-500 dark:text-zinc-400">Hora:</span>
            <span className="font-black text-sm text-amber-600 dark:text-amber-400">
              {horaFormateada}
            </span>
          </div>
        </div>

        {/* Total and QR Section */}
        <div className="pt-4 border-t border-dashed border-zinc-300 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                Total a pagar
              </p>
              <p className="text-xl font-black text-zinc-900 dark:text-white">
                ${(reserva.total || 0).toLocaleString("es-CO")} COP
              </p>
            </div>

            {/* QR Code Simulation */}
            <div className="flex flex-col items-center bg-white p-2 rounded-xl border border-zinc-200 shadow-sm">
              <div className="grid grid-cols-5 gap-0.5 w-10 h-10 bg-white p-0.5">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className={`${
                      (i % 2 === 0 || i % 3 === 0 || i === 0 || i === 4 || i === 20 || i === 24)
                        ? "bg-zinc-900"
                        : "bg-white"
                    } rounded-[1px]`}
                  />
                ))}
              </div>
              <span className="text-[8px] font-mono text-zinc-400 mt-0.5">QR CODE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 space-y-2">
        <button
          onClick={shareWhatsApp}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-md"
        >
          <span>💬</span> Compartir por WhatsApp
        </button>

        {onViewReservations && (
          <button
            onClick={onViewReservations}
            className="w-full rounded-2xl bg-zinc-900 py-3 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition shadow-sm"
          >
            Ver Mis Citas
          </button>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="w-full rounded-2xl border border-zinc-200 bg-white py-2.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 transition"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}
