"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Reserva, ReservaEstado } from "@/types/database";
import Link from "next/link";

export default function BarberoDashboard() {
  const { profile, user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  // Estados de datos
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todas" | ReservaEstado>("todas");
  const [realtimePulse, setRealtimePulse] = useState(false);

  // Modales
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockTime, setBlockTime] = useState("13:00");
  const [blockReason, setBlockReason] = useState("Almuerzo / Descanso");
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Carga de reservas — filtra por barbero_id cuando hay sesión
  const loadReservas = useCallback(async () => {
    try {
      const barberoId = user?.id || profile?.id;
      let query = supabase
        .from("reservas")
        .select("*, servicios(*), cliente:profiles!reservas_cliente_id_fkey(*)")
        .order("fecha_hora", { ascending: true });

      if (barberoId) {
        query = query.eq("barbero_id", barberoId);
      }

      const { data, error } = await query;

      if (error) {
        // Fallback sin join de cliente
        let fallbackQuery = supabase.from("reservas").select("*, servicios(*)").order("fecha_hora", { ascending: true });
        if (barberoId) fallbackQuery = fallbackQuery.eq("barbero_id", barberoId);
        const { data: fallbackData } = await fallbackQuery;
        if (fallbackData) {
          setReservas(fallbackData as unknown as Reserva[]);
        }
      } else if (data) {
        setReservas(data as unknown as Reserva[]);
      }
    } catch (err) {
      console.error("Error al cargar reservas:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, user, profile]);

  // Efecto inicial
  useEffect(() => {
    let ignore = false;
    async function init() {
      await loadReservas();
    }
    if (!ignore) {
      init();
    }
    return () => {
      ignore = true;
    };
  }, [loadReservas]);

  // SUSCRIPCIÓN EN TIEMPO REAL (Supabase WebSockets)
  useEffect(() => {
    const channel = supabase
      .channel("barbero_agenda_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservas" },
        (payload) => {
          setRealtimePulse(true);
          setTimeout(() => setRealtimePulse(false), 2500);
          loadReservas();
          setFeedbackMsg({
            text: `🔔 Notificación en Vivo: Reserva ${payload.eventType === "INSERT" ? "nueva recibida" : "actualizada"}.`,
            type: "success",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, loadReservas]);

  // Actualizar estado de una reserva
  async function updateEstado(id: string, nuevoEstado: ReservaEstado) {
    try {
      const { error } = await supabase
        .from("reservas")
        .update({ estado: nuevoEstado } as never)
        .eq("id", id);

      if (error) {
        setFeedbackMsg({ text: `Error al actualizar: ${error.message}`, type: "error" });
      } else {
        setFeedbackMsg({ text: `Reserva marcada como ${nuevoEstado} ✓`, type: "success" });
        loadReservas();
        if (selectedReserva?.id === id) {
          setSelectedReserva(null);
        }
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ text: "Error inesperado al actualizar.", type: "error" });
    }
  }

  // Bloquear franja horaria — persiste en localStorage y bloquea slots para clientes
  async function handleBlockSlot(e: React.FormEvent) {
    e.preventDefault();
    try {
      const barberoId = user?.id || profile?.id;
      if (!barberoId) {
        setFeedbackMsg({ text: "Debes estar logueado como barbero para bloquear.", type: "error" });
        return;
      }
      // Crear fecha bloqueada: hoy a blockTime (y también mañana para que el bloqueo se vea en BookingModal)
      const hoy = new Date();
      const [h, m] = blockTime.split(":").map(Number);
      const crearBloqueo = (base: Date) => {
        const d = new Date(base.getTime());
        d.setHours(h, m, 0, 0);
        return d.toISOString();
      };
      const bloqueosExistentes: { barbero_id: string; fecha_hora: string; motivo: string }[] = JSON.parse(
        localStorage.getItem("barberpro_bloqueos") || "[]"
      );
      // Bloquear para hoy + próximos 6 días (para que BookingModal lo detecte)
      const nuevosBloqueos = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(hoy.getDate() + i);
        return { barbero_id: barberoId, fecha_hora: crearBloqueo(d), motivo: blockReason };
      });
      const sinDuplicados = [...bloqueosExistentes];
      nuevosBloqueos.forEach((nb) => {
        if (!sinDuplicados.some((b) => b.barbero_id === nb.barbero_id && b.fecha_hora === nb.fecha_hora)) {
          sinDuplicados.push(nb);
        }
      });
      localStorage.setItem("barberpro_bloqueos", JSON.stringify(sinDuplicados));
      setFeedbackMsg({
        text: `Franja ${blockTime} bloqueada próximos 7 días por "${blockReason}" ✓ (visible en BookingModal)`,
        type: "success",
      });
      setShowBlockModal(false);
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ text: "Error al bloquear horario.", type: "error" });
    }
  }

  // Desbloquear todo (helper)
  const handleClearBloqueos = () => {
    const barberoId = user?.id || profile?.id;
    if (!barberoId) return;
    try {
      const bloqueos: { barbero_id: string; fecha_hora: string }[] = JSON.parse(
        localStorage.getItem("barberpro_bloqueos") || "[]"
      );
      const filtrados = bloqueos.filter((b) => b.barbero_id !== barberoId);
      localStorage.setItem("barberpro_bloqueos", JSON.stringify(filtrados));
      setFeedbackMsg({ text: "Bloqueos eliminados ✓", type: "success" });
    } catch (e) {
      console.error(e);
    }
  };

  // Filtrado y cálculos
  const reservasFiltradas = useMemo(() => {
    if (filtro === "todas") return reservas;
    return reservas.filter((r) => r.estado === filtro);
  }, [reservas, filtro]);

  // Métricas
  const totalHoy = useMemo(() => {
    return reservas
      .filter((r) => r.estado === "confirmada" || r.estado === "completada")
      .reduce((acc, curr) => acc + (curr.total || 0), 0);
  }, [reservas]);

  const pendientesCount = useMemo(() => {
    return reservas.filter((r) => r.estado === "pendiente").length;
  }, [reservas]);

  const confirmadasCount = useMemo(() => {
    return reservas.filter((r) => r.estado === "confirmada").length;
  }, [reservas]);

  // Datos demo interactivos si aún no hay reservas reales en la BD
  const demoFallbackList: Partial<Reserva>[] = [
    {
      id: "demo-1",
      fecha_hora: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
      estado: "confirmada",
      total: 18000,
      servicios: { id: "s1", nombre: "Corte Clásico + Perfilado", precio: 18000, duracion_min: 35, activo: true, descripcion: null, barbero_id: null, created_at: "" },
      notas: "Corte degradado medio",
    },
    {
      id: "demo-2",
      fecha_hora: new Date(new Date().setHours(10, 30, 0, 0)).toISOString(),
      estado: "pendiente",
      total: 25000,
      servicios: { id: "s2", nombre: "Combo Corte + Barba VIP", precio: 25000, duracion_min: 45, activo: true, descripcion: null, barbero_id: null, created_at: "" },
      notas: "Por favor puntual que tengo una reunión después",
    },
    {
      id: "demo-3",
      fecha_hora: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
      estado: "confirmada",
      total: 15000,
      servicios: { id: "s3", nombre: "Corte Clásico Tijera", precio: 15000, duracion_min: 30, activo: true, descripcion: null, barbero_id: null, created_at: "" },
      notas: null,
    },
  ];

  const listaParaMostrar = reservas.length > 0 ? reservasFiltradas : demoFallbackList;

  return (
    <div className="min-h-screen bg-[#FCFCF9] dark:bg-zinc-950 pb-16">
      <Navbar rol="barbero" />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Top Realtime Status Banner & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border transition-all ${
                  realtimePulse
                    ? "bg-amber-500 text-white border-amber-600 scale-105 shadow-md"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {realtimePulse ? "¡Sincronizando Realtime!" : "Supabase Realtime Conectado"}
              </span>
              <span className="text-[11px] text-zinc-400">Piedecuesta • Hoy</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              Panel del Barbero ✂️ {profile?.nombre ? `• ${profile.nombre}` : ""}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Gestiona tu agenda del día, confirma citas entrantes y maximiza tus ingresos.
            </p>
          </div>

          <div className="flex gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShowBlockModal(true)}
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 transition shadow-sm"
            >
              ⏸️ Bloquear Horario
            </button>
            <Link
              href="/barbero/servicios"
              className="rounded-2xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-white hover:bg-amber-600 transition shadow-md"
            >
              CRUD Servicios →
            </Link>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`mt-4 rounded-2xl p-4 text-xs font-semibold flex items-center justify-between border ${
              feedbackMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="font-bold opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* METRICS DASHBOARD CARDS */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Ingresos Hoy */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-4 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Ingresos de Hoy
            </p>
            <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              ${totalHoy.toLocaleString("es-CO")}
            </p>
            <span className="text-[10px] text-zinc-400 font-medium">COP confirmados</span>
          </div>

          {/* Citas Pendientes */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-4 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Pendientes
            </p>
            <p className="text-xl sm:text-2xl font-black text-amber-500 mt-1">
              {pendientesCount}
            </p>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
              Requieren atención
            </span>
          </div>

          {/* Citas Confirmadas */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-4 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Confirmadas
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {confirmadasCount}
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Sillas aseguradas
            </span>
          </div>

          {/* Total Agendadas */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-4 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Total Reservas
            </p>
            <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1">
              {reservas.length > 0 ? reservas.length : demoFallbackList.length}
            </p>
            <span className="text-[10px] text-zinc-400 font-medium">En el sistema</span>
          </div>
        </div>

        {/* Bloqueos activos info */}
        {(() => {
          const barberoId = user?.id || profile?.id;
          let count = 0;
          try {
            const bloqueos: { barbero_id: string }[] = JSON.parse(localStorage.getItem("barberpro_bloqueos") || "[]");
            count = barberoId ? bloqueos.filter((b) => b.barbero_id === barberoId).length : 0;
          } catch {}
          return count > 0 ? (
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 text-xs">
              <span className="font-bold text-amber-700 dark:text-amber-300">
                ⏸️ {count} franja(s) bloqueada(s) para clientes (próx. 7 días)
              </span>
              <button
                onClick={handleClearBloqueos}
                className="rounded-xl bg-white dark:bg-zinc-900 border border-amber-500/20 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-50 transition"
              >
                Desbloquear todo
              </button>
            </div>
          ) : null;
        })()}

        {/* FILTER PILLS STRIP */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(
            [
              { id: "todas" as const, label: "Todas las Citas", badge: 0 },
              { id: "pendiente" as const, label: "Pendientes", badge: pendientesCount },
              { id: "confirmada" as const, label: "Confirmadas", badge: confirmadasCount },
              { id: "completada" as const, label: "Completadas", badge: 0 },
              { id: "cancelada" as const, label: "Canceladas", badge: 0 },
            ]
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setFiltro(item.id)}
              className={`whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold border transition-all flex items-center gap-1.5 ${
                filtro === item.id
                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 shadow-sm"
                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"
              }`}
            >
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[10px] font-black">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <button
            onClick={loadReservas}
            className="whitespace-nowrap rounded-2xl bg-zinc-100 dark:bg-zinc-800 px-3.5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition ml-auto"
            title="Recargar agenda"
          >
            ↻ Actualizar
          </button>
        </div>

        {/* TIMELINE DE CITAS */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">
              Agenda del Día ({listaParaMostrar.length})
            </h3>
            {reservas.length === 0 && (
              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900">
                Visualización Demo asistida
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : listaParaMostrar.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:bg-zinc-900 dark:border-zinc-800">
              <span className="text-4xl mb-2 block">✂️</span>
              <p className="font-black text-zinc-900 dark:text-white text-sm">
                No hay citas con el filtro seleccionado
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Cambia el filtro a &ldquo;Todas las Citas&rdquo; para ver el historial completo.
              </p>
            </div>
          ) : (
            listaParaMostrar.map((r) => {
              const fecha = new Date(r.fecha_hora || new Date());
              const hora = fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
              const fechaCorta = fecha.toLocaleDateString("es-CO", { weekday: "short", day: "numeric", month: "short" });

              return (
                <div
                  key={r.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-zinc-200/80 bg-white p-4 sm:p-5 dark:bg-zinc-900 dark:border-zinc-800 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Time Box */}
                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex flex-col items-center justify-center font-black dark:bg-zinc-800 shadow-sm flex-shrink-0">
                      <span className="text-xs text-amber-500 font-bold">{hora}</span>
                      <span className="text-[9px] uppercase opacity-70 leading-none">{fechaCorta.split(",")[0]}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                          {r.servicios?.nombre || "Corte de Cabello"}
                        </h4>
                        <Badge estado={r.estado || "pendiente"} />
                      </div>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {r.cliente?.nombre ? `Cliente: ${r.cliente.nombre}` : "Cliente en Silla"} •{" "}
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          ${(r.total || 0).toLocaleString("es-CO")} COP
                        </span>{" "}
                        • {r.servicios?.duracion_min || 30} min
                      </p>

                      {r.notas && (
                        <p className="text-[11px] text-zinc-400 italic">
                          Nota: &ldquo;{r.notas}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions / Buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => setSelectedReserva(r as Reserva)}
                      className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 transition"
                    >
                      Detalle
                    </button>

                    {r.estado === "pendiente" && (
                      <>
                        <button
                          onClick={() => r.id && updateEstado(r.id, "confirmada")}
                          className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition"
                        >
                          ✓ Confirmar
                        </button>
                        <button
                          onClick={() => r.id && updateEstado(r.id, "cancelada")}
                          className="rounded-xl border border-red-200 bg-red-50/50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 transition"
                        >
                          Rechazar
                        </button>
                      </>
                    )}

                    {r.estado === "confirmada" && (
                      <button
                        onClick={() => r.id && updateEstado(r.id, "completada")}
                        className="rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition"
                      >
                        ✓ Marcar Completada
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* MODAL 1: DETALLES COMPLETOS DE LA CITA */}
      <Modal
        isOpen={!!selectedReserva}
        onClose={() => setSelectedReserva(null)}
        title="Detalles de la Reserva"
        subtitle={`ID: #${selectedReserva?.id.slice(0, 8).toUpperCase()}`}
        maxWidth="sm"
      >
        {selectedReserva && (
          <div className="space-y-4 text-xs">
            <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-950 p-4 space-y-2 border border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between">
                <span className="text-zinc-500">Servicio:</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  {selectedReserva.servicios?.nombre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Fecha y Hora:</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  {new Date(selectedReserva.fecha_hora).toLocaleString("es-CO")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Total a Cobrar:</span>
                <span className="font-black text-amber-600 text-sm">
                  ${selectedReserva.total.toLocaleString("es-CO")} COP
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Estado:</span>
                <Badge estado={selectedReserva.estado} />
              </div>
              {selectedReserva.notas && (
                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <span className="text-zinc-500 block mb-1">Notas del Cliente:</span>
                  <p className="bg-white dark:bg-zinc-900 p-2 rounded-xl italic">
                    &ldquo;{selectedReserva.notas}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Direct WhatsApp Contact Button */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Hola, te escribo de BarberPro Piedecuesta sobre tu cita de ${selectedReserva.servicios?.nombre} programada para ${new Date(selectedReserva.fecha_hora).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700 transition shadow-md"
            >
              <span>💬</span> Escribir por WhatsApp al Cliente
            </a>
          </div>
        )}
      </Modal>

      {/* MODAL 2: BLOQUEAR FRANJA HORARIA */}
      <Modal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        title="Bloquear Franja Horaria"
        subtitle="Evita que los clientes reserven en este horario"
        maxWidth="sm"
      >
        <form onSubmit={handleBlockSlot} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
              Hora a Bloquear:
            </label>
            <input
              type="time"
              value={blockTime}
              onChange={(e) => setBlockTime(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-amber-500 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
              Motivo:
            </label>
            <select
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold outline-none focus:border-amber-500 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
            >
              <option value="Almuerzo / Descanso">Almuerzo / Descanso</option>
              <option value="Compromiso Personal">Compromiso Personal</option>
              <option value="Mantenimiento de Barbería">Mantenimiento de Barbería</option>
              <option value="Cita por fuera del sistema">Cita externa / Presencial</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowBlockModal(false)}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white hover:bg-amber-600 transition shadow-md"
            >
              Confirmar Bloqueo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
