"use client";

import React, { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { BookingTicket } from "@/components/booking/BookingTicket";
import { createClient } from "@/lib/supabase/client";
import type { Servicio, Profile, Reserva } from "@/types/database";

interface Extra {
  id: string;
  nombre: string;
  precio: number;
  duracion: number;
}

const EXTRAS_DISPONIBLES: Extra[] = [
  { id: "barba", nombre: "Perfilado de Barba", precio: 8000, duracion: 15 },
  { id: "cejas", nombre: "Diseño de Cejas", precio: 5000, duracion: 10 },
  { id: "mascarilla", nombre: "Mascarilla Facial Black", precio: 7000, duracion: 15 },
  { id: "lavado", nombre: "Lavado y Peinado Pro", precio: 4000, duracion: 10 },
];

const HORARIOS_MANANA = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
const HORARIOS_TARDE = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"];

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicio: Servicio | null;
  barberos: Profile[];
  initialBarbero?: Profile | null;
  clienteId?: string | null;
  onSuccess?: () => void;
}

export function BookingModal({
  isOpen,
  onClose,
  servicio,
  barberos,
  initialBarbero,
  clienteId,
  onSuccess,
}: BookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedBarbero, setSelectedBarbero] = useState<Profile | null>(initialBarbero || null);
  const [selectedExtras, setSelectedExtras] = useState<Extra[]>([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const [metodoPago, setMetodoPago] = useState<"nequi" | "efectivo" | "tarjeta">("nequi");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedReserva, setConfirmedReserva] = useState<(Partial<Reserva> & {
    servicio?: Partial<Servicio>;
    barbero?: Partial<Profile>;
    extras?: { nombre: string; precio: number }[];
  }) | null>(null);

  React.useEffect(() => {
    if (initialBarbero) {
      setSelectedBarbero(initialBarbero);
    }
  }, [initialBarbero, isOpen]);

  const supabase = createClient();

  // Generar próximos 7 días
  const diasDisponibles = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return {
        date: d,
        diaSemana: d.toLocaleDateString("es-CO", { weekday: "short" }).toUpperCase(),
        numero: d.getDate(),
        mes: d.toLocaleDateString("es-CO", { month: "short" }).toUpperCase(),
      };
    });
  }, []);

  if (!servicio) return null;

  // Barbero activo por defecto
  const activeBarbero = selectedBarbero || barberos[0] || {
    id: "demo-barbero",
    nombre: "Carlos Master Barber",
    telefono: "3151234567",
    rol: "barbero" as const,
    created_at: new Date().toISOString(),
  };

  const totalExtras = selectedExtras.reduce((sum, e) => sum + e.precio, 0);
  const totalDuracion = servicio.duracion_min + selectedExtras.reduce((sum, e) => sum + e.duracion, 0);
  const totalPagar = servicio.precio + totalExtras;

  const toggleExtra = (extra: Extra) => {
    if (selectedExtras.some((e) => e.id === extra.id)) {
      setSelectedExtras(selectedExtras.filter((e) => e.id !== extra.id));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  // Helpers de validación
  function isValidUUID(str?: string | null): boolean {
    if (!str) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  }

  function isSlotBlocked(barberoId: string, fechaISO: string): boolean {
    try {
      const bloqueos: { barbero_id: string; fecha_hora: string }[] = JSON.parse(
        localStorage.getItem("barberpro_bloqueos") || "[]"
      );
      return bloqueos.some((b) => b.barbero_id === barberoId && b.fecha_hora === fechaISO);
    } catch {
      return false;
    }
  }

  async function handleConfirmBooking() {
    if (!servicio) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      // Clonar fecha para no mutar el array de diasDisponibles
      const fechaBase = diasDisponibles[selectedDateIndex].date;
      const fechaElegida = new Date(fechaBase.getTime());
      const [horas, minutos] = selectedTime.split(":").map(Number);
      fechaElegida.setHours(horas, minutos, 0, 0);
      const fechaISO = fechaElegida.toISOString();

      // Si no hay clienteId logueado, usar el usuario de la sesión actual
      let finalClienteId = clienteId;
      if (!finalClienteId) {
        const { data: userData } = await supabase.auth.getUser();
        finalClienteId = userData.user?.id;
      }

      if (!finalClienteId) {
        setErrorMsg("Debes iniciar sesión para confirmar la reserva.");
        setLoading(false);
        return;
      }

      if (!isValidUUID(activeBarbero.id)) {
        setErrorMsg("Barbero seleccionado inválido. Por favor recarga y elige otro barbero.");
        setLoading(false);
        return;
      }
      if (!isValidUUID(servicio.id)) {
        setErrorMsg("Servicio seleccionado inválido. Por favor recarga el catálogo.");
        setLoading(false);
        return;
      }

      const barberoIdToUse = activeBarbero.id;

      // Validar bloqueo horario
      if (isSlotBlocked(barberoIdToUse, fechaISO)) {
        setErrorMsg(`El horario ${selectedTime} está bloqueado por el barbero. Elige otro.`);
        setLoading(false);
        return;
      }

      // Validar doble-booking en Supabase antes de insertar
      const { data: existing } = await supabase
        .from("reservas")
        .select("id")
        .eq("barbero_id", barberoIdToUse)
        .eq("fecha_hora", fechaISO)
        .in("estado", ["pendiente", "confirmada"])
        .limit(1);

      if (existing && existing.length > 0) {
        setErrorMsg(`Ese horario (${selectedTime}) ya está reservado. Elige otro slot.`);
        setLoading(false);
        return;
      }

      // Validar doble-booking en localStorage (para modo offline/demo)
      try {
        const userKey = `barberpro_reservas_${finalClienteId}`;
        const existingLocal: Reserva[] = JSON.parse(localStorage.getItem(userKey) || "[]");
        const bloqueosLocal: { barbero_id: string; fecha_hora: string }[] = JSON.parse(
          localStorage.getItem("barberpro_bloqueos") || "[]"
        );
        const conflictoLocal =
          existingLocal.some(
            (r) => r.barbero_id === barberoIdToUse && r.fecha_hora === fechaISO && r.estado !== "cancelada"
          ) || bloqueosLocal.some((b) => b.barbero_id === barberoIdToUse && b.fecha_hora === fechaISO);
        if (conflictoLocal) {
          setErrorMsg(`Ese horario ya está ocupado (local). Elige otro.`);
          setLoading(false);
          return;
        }
      } catch {
        // ignorar error de parse
      }

      let reservaIdGenerada = `BP-${Date.now().toString().slice(-6)}`;
      let supabaseSuccess = false;

      const { data: reservaData, error: reservaError } = await supabase
        .from("reservas")
        .insert([
          {
            cliente_id: finalClienteId,
            barbero_id: barberoIdToUse,
            servicio_id: servicio.id,
            fecha_hora: fechaISO,
            estado: "pendiente",
            total: totalPagar,
            notas: notas.trim() || null,
          },
        ] as never)
        .select()
        .single();

      if (!reservaError && reservaData) {
        const createdReserva = reservaData as unknown as Reserva;
        reservaIdGenerada = createdReserva.id;
        supabaseSuccess = true;

        const { error: pagoError } = await supabase.from("pagos").insert([
          {
            reserva_id: createdReserva.id,
            monto: totalPagar,
            metodo: metodoPago,
            estado_pago: "pendiente",
          },
        ] as never);
        if (pagoError) {
          console.warn("Aviso pago no creado:", pagoError.message);
        }
      } else if (reservaError) {
        // Si es error de constraint unique, informar doble-booking
        if (reservaError.message.includes("duplicate") || reservaError.message.includes("unique")) {
          setErrorMsg("Ese horario acaba de ser reservado por otro cliente. Elige otro.");
          setLoading(false);
          return;
        }
        console.warn("Aviso en guardado Supabase (continuando offline):", reservaError.message);
      }

      const confirmedReservaObj = {
        id: reservaIdGenerada,
        fecha_hora: fechaISO,
        total: totalPagar,
        estado: "pendiente" as const,
        notas: notas.trim() || null,
        cliente_id: finalClienteId,
        barbero_id: barberoIdToUse,
        servicio_id: servicio.id,
        servicio,
        servicios: servicio,
        barbero: activeBarbero,
        extras: selectedExtras,
        created_at: new Date().toISOString(),
      };

      // Persistencia local por cliente (sin leak global)
      try {
        const userKey = `barberpro_reservas_${finalClienteId}`;
        const existingUser = JSON.parse(localStorage.getItem(userKey) || "[]");
        const merged = [confirmedReservaObj, ...existingUser.filter((r: { id: string }) => r.id !== reservaIdGenerada)];
        localStorage.setItem(userKey, JSON.stringify(merged));
      } catch (storageErr) {
        console.warn("Storage warning:", storageErr);
      }

      setConfirmedReserva(confirmedReservaObj);
      setStep(4);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocurrió un error inesperado al procesar la reserva.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 4 ? "" : "Reserva tu Cita"}
      subtitle={
        step === 1
          ? "Paso 1: Elige tu barbero y extras"
          : step === 2
          ? "Paso 2: Elige fecha y hora"
          : step === 3
          ? "Paso 3: Método de pago"
          : ""
      }
      maxWidth="md"
    >
      {/* Progress Stepper Bar */}
      {step < 4 && (
        <div className="mb-5 flex items-center justify-between gap-1">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                step >= s ? "bg-amber-500" : "bg-zinc-200 dark:bg-zinc-800"
              }`}
            />
          ))}
        </div>
      )}

      {/* STEP 1: Barbero & Extras */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Service Summary Banner with Haircut Photo */}
          <div className="flex items-center gap-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 dark:bg-amber-950/20">
            <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-amber-500/30 flex-shrink-0">
              <img
                src={
                  servicio.imagen_url ||
                  (servicio.nombre.toLowerCase().includes("barba") && !servicio.nombre.toLowerCase().includes("combo")
                    ? "/images/perfilado_barba.jpg"
                    : servicio.nombre.toLowerCase().includes("combo") || servicio.nombre.toLowerCase().includes("vip")
                    ? "/images/combo_full_vip.jpg"
                    : "/images/corte_clasico.jpg")
                }
                alt={servicio.nombre}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-zinc-900 dark:text-white text-sm leading-tight truncate">
                {servicio.nombre}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-0.5">
                {servicio.duracion_min} min • ${servicio.precio.toLocaleString("es-CO")} COP
              </p>
            </div>
            <span className="text-lg">✂️</span>
          </div>

          {/* Barbero Selector */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">
              Selecciona tu Barbero:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(barberos.length > 0 ? barberos : [activeBarbero]).map((b) => {
                const bProfile = b as {
                  id: string;
                  nombre: string;
                  foto_url?: string;
                  especialidad?: string;
                  verificado?: boolean;
                };
                const isSelected = activeBarbero.id === b.id;

                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBarbero(b)}
                    className={`flex items-center gap-3 rounded-2xl border p-2.5 text-left transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 dark:border-amber-500 shadow-sm ring-1 ring-amber-500/20"
                        : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
                    }`}
                  >
                    <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-zinc-900 text-amber-500 flex items-center justify-center font-black text-sm dark:bg-zinc-800 shadow-sm flex-shrink-0">
                      {bProfile.foto_url ? (
                        <img
                          src={bProfile.foto_url}
                          alt={b.nombre}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>✂️</span>
                      )}
                      {bProfile.verificado && (
                        <div className="absolute top-0.5 right-0.5 bg-emerald-500 text-white rounded-full p-0.5">
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white leading-tight truncate">
                          {b.nombre}
                        </p>
                        {bProfile.verificado && (
                          <span className="text-[10px] text-emerald-500 font-black">✓</span>
                        )}
                      </div>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 truncate">
                        {bProfile.especialidad || "Master Barber"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Extras Selector */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">
              Agrega Servicios Extras:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EXTRAS_DISPONIBLES.map((extra) => {
                const isSelected = selectedExtras.some((e) => e.id === extra.id);
                return (
                  <button
                    key={extra.id}
                    type="button"
                    onClick={() => toggleExtra(extra)}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-bold"
                        : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                    }`}
                  >
                    <div className="text-left">
                      <p>{extra.nombre}</p>
                      <span className="text-[10px] text-zinc-400">+{extra.duracion} min</span>
                    </div>
                    <span className="font-mono text-amber-600 dark:text-amber-400">
                      +${extra.precio.toLocaleString("es-CO")}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Total Bar & Next CTA */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase">Total estimado</p>
              <p className="text-lg font-black text-zinc-900 dark:text-white">
                ${totalPagar.toLocaleString("es-CO")}{" "}
                <span className="text-xs font-normal text-zinc-500">({totalDuracion} min)</span>
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="rounded-2xl bg-amber-500 px-6 py-3 text-xs font-bold text-white hover:bg-amber-600 shadow-md transition"
            >
              Continuar: Fecha →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Fecha y Hora */}
      {step === 2 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Horizontal Calendar Strip */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">
              1. Selecciona el Día:
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-none">
              {diasDisponibles.map((dia, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDateIndex(idx)}
                  className={`flex flex-col items-center justify-center min-w-[62px] py-3 rounded-2xl border transition-all ${
                    selectedDateIndex === idx
                      ? "bg-amber-500 text-white border-amber-500 shadow-md scale-105"
                      : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase">{dia.diaSemana}</span>
                  <span className="text-lg font-black">{dia.numero}</span>
                  <span className="text-[9px] opacity-80">{dia.mes}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
              2. Horarios Mañana (8:00 - 12:00):
            </label>
            <div className="grid grid-cols-4 gap-1.5 mb-3">
              {HORARIOS_MANANA.map((t) => {
                const d = new Date(diasDisponibles[selectedDateIndex].date.getTime());
                const [h, m] = t.split(":").map(Number);
                d.setHours(h, m, 0, 0);
                const iso = d.toISOString();
                const bloqueado = isSlotBlocked(activeBarbero.id, iso);
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={bloqueado}
                    onClick={() => !bloqueado && setSelectedTime(t)}
                    title={bloqueado ? "Horario bloqueado por el barbero" : undefined}
                    className={`rounded-xl py-2 text-xs font-bold border transition-all ${
                      bloqueado
                        ? "bg-zinc-200 text-zinc-400 border-zinc-200 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500"
                        : selectedTime === t
                        ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-amber-500"
                    }`}
                  >
                    {bloqueado ? `${t} 🚫` : t}
                  </button>
                );
              })}
            </div>

            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1.5">
              3. Horarios Tarde & Noche (14:00 - 19:30):
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {HORARIOS_TARDE.map((t) => {
                const d = new Date(diasDisponibles[selectedDateIndex].date.getTime());
                const [h, m] = t.split(":").map(Number);
                d.setHours(h, m, 0, 0);
                const iso = d.toISOString();
                const bloqueado = isSlotBlocked(activeBarbero.id, iso);
                return (
                  <button
                    key={t}
                    type="button"
                    disabled={bloqueado}
                    onClick={() => !bloqueado && setSelectedTime(t)}
                    title={bloqueado ? "Horario bloqueado por el barbero" : undefined}
                    className={`rounded-xl py-2 text-xs font-bold border transition-all ${
                      bloqueado
                        ? "bg-zinc-200 text-zinc-400 border-zinc-200 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-500"
                        : selectedTime === t
                        ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-amber-500"
                    }`}
                  >
                    {bloqueado ? `${t} 🚫` : t}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-zinc-400 mt-2 italic">🚫 = bloqueado por el barbero. Usa otro horario o fecha.</p>
          </div>

          {/* Navigation Controls */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              ← Volver
            </button>
            <button
              onClick={() => setStep(3)}
              className="rounded-2xl bg-amber-500 px-6 py-3 text-xs font-bold text-white hover:bg-amber-600 shadow-md transition"
            >
              Continuar: Pago ({selectedTime}) →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Checkout & Confirmación */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Order Summary Box */}
          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-zinc-900 dark:text-white pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <span>{servicio.nombre}</span>
              <span>${servicio.precio.toLocaleString("es-CO")} COP</span>
            </div>

            {selectedExtras.map((e) => (
              <div key={e.id} className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>+ Extra: {e.nombre}</span>
                <span>+${e.precio.toLocaleString("es-CO")}</span>
              </div>
            ))}

            <div className="flex justify-between pt-2 border-t border-dashed border-zinc-300 dark:border-zinc-700 font-black text-sm text-zinc-900 dark:text-white">
              <span>Total Final</span>
              <span className="text-amber-600 dark:text-amber-400">
                ${totalPagar.toLocaleString("es-CO")} COP
              </span>
            </div>
          </div>

          {/* Métodos de Pago */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">
              Método de Pago:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "nequi", label: "Nequi", icon: "🟣" },
                { id: "efectivo", label: "Efectivo", icon: "💵" },
                { id: "tarjeta", label: "Tarjeta", icon: "💳" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMetodoPago(m.id as "nequi" | "efectivo" | "tarjeta")}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-bold transition-all ${
                    metodoPago === m.id
                      ? "border-amber-500 bg-amber-500/10 text-amber-950 dark:text-amber-200"
                      : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                  }`}
                >
                  <span className="text-lg mb-1">{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notas Opcionales */}
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-1">
              Notas para el Barbero (opcional):
            </label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Por favor puntual, corte tipo degradado alto"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-amber-500 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
            />
          </div>

          {errorMsg && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Confirm CTA */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <button
              onClick={() => setStep(2)}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              ← Volver
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={loading}
              className="rounded-2xl bg-amber-500 px-6 py-3 text-xs font-bold text-white hover:bg-amber-600 shadow-md transition disabled:opacity-50"
            >
              {loading ? "Confirmando..." : "¡Confirmar y Reservar Silla! ✂️"}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Digital Voucher Ticket */}
      {step === 4 && confirmedReserva && (
        <BookingTicket
          reserva={confirmedReserva}
          onClose={onClose}
          onViewReservations={onSuccess}
        />
      )}
    </Modal>
  );
}
