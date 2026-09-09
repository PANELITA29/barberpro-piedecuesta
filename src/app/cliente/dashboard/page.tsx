"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { CardServicio } from "@/components/CardServicio";
import { BookingModal } from "@/components/booking/BookingModal";
import { BookingTicket } from "@/components/booking/BookingTicket";
import { BarbershopDiscovery } from "@/components/booking/BarbershopDiscovery";
import { BarberSecurityCard } from "@/components/booking/BarberSecurityCard";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  BARBERIAS_REGISTRADAS,
  BARBEROS_VERIFICADOS,
  type Barberia,
  type BarberoProfile,
} from "@/lib/geo";
import type { Servicio, Profile, Reserva } from "@/types/database";

export default function ClienteDashboard() {
  const { user, profile } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  // Tabs
  const [activeTab, setActiveTab] = useState<"catalogo" | "citas">("catalogo");

  // Geolocalización y Selección de Sede / Barbero
  const [selectedBarberia, setSelectedBarberia] = useState<Barberia>(BARBERIAS_REGISTRADAS[0]);
  const [selectedBarbero, setSelectedBarbero] = useState<BarberoProfile>(BARBEROS_VERIFICADOS[0]);

  // Datos
  const [misReservas, setMisReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modales
  const [bookingServicio, setBookingServicio] = useState<Servicio | null>(null);
  const [ticketReserva, setTicketReserva] = useState<Reserva | null>(null);
  const [reservaToCancel, setReservaToCancel] = useState<Reserva | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Barberos filtrados por la sede seleccionada
  const barberosDeSede = useMemo(() => {
    return BARBEROS_VERIFICADOS.filter((b) => b.barberia_id === selectedBarberia.id);
  }, [selectedBarberia]);

  // Manejar cambio de sede
  const handleSelectBarberia = (barberia: Barberia) => {
    setSelectedBarberia(barberia);
    const primerBarberoDeSede = BARBEROS_VERIFICADOS.find((b) => b.barberia_id === barberia.id);
    if (primerBarberoDeSede) {
      setSelectedBarbero(primerBarberoDeSede);
    }
  };

  // Servicios específicos del barbero seleccionado
  const serviciosDelBarbero = useMemo(() => {
    return selectedBarbero.servicios_ofrecidos || [];
  }, [selectedBarbero]);

  // Categorías dinámicas basadas en los servicios del barbero
  const categoriasDisponibles = useMemo(() => {
    const cats = new Set<string>(["Todos"]);
    serviciosDelBarbero.forEach((s) => {
      if (s.categoria) cats.add(s.categoria);
    });
    return Array.from(cats);
  }, [serviciosDelBarbero]);

  // Servicios filtrados por búsqueda y categoría
  const serviciosFiltrados = useMemo(() => {
    return serviciosDelBarbero.filter((s) => {
      const matchesCategory =
        categoriaFiltro === "Todos" ||
        s.nombre.toLowerCase().includes(categoriaFiltro.toLowerCase()) ||
        (s.categoria && s.categoria.toLowerCase() === categoriaFiltro.toLowerCase());

      const matchesSearch =
        s.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.descripcion && s.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [serviciosDelBarbero, categoriaFiltro, searchQuery]);

  // Cargar reservas del usuario (Supabase + LocalStorage hybrid)
  const loadData = useCallback(async () => {
    try {
      const currentUserId = user?.id || "guest";
      const localReservas: Reserva[] = [];

      try {
        const userKey = `barberpro_reservas_${currentUserId}`;
        const storedUser = JSON.parse(localStorage.getItem(userKey) || "[]");
        const storedGlobal = JSON.parse(localStorage.getItem("barberpro_reservas_all") || "[]");

        const mergedLocal = [...storedUser];
        storedGlobal.forEach((gr: Reserva) => {
          if (!mergedLocal.some((lr) => lr.id === gr.id)) {
            mergedLocal.push(gr);
          }
        });
        localReservas.push(...mergedLocal);
      } catch (e) {
        console.warn("Storage read error:", e);
      }

      if (user?.id) {
        const { data: resData } = await supabase
          .from("reservas")
          .select("*, servicios(*)")
          .eq("cliente_id", user.id)
          .order("fecha_hora", { ascending: false });

        if (resData && resData.length > 0) {
          const merged = [...(resData as unknown as Reserva[])];
          localReservas.forEach((lr) => {
            if (!merged.some((mr) => mr.id === lr.id)) {
              merged.push(lr);
            }
          });
          merged.sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime());
          setMisReservas(merged);
          return;
        }
      }

      localReservas.sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime());
      setMisReservas(localReservas);
    } catch (err) {
      console.error("Error cargando reservas del cliente:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      await loadData();
    }
    if (!ignore) {
      init();
    }
    return () => {
      ignore = true;
    };
  }, [loadData]);

  // Cancelar reserva
  const handleCancelBooking = async () => {
    if (!reservaToCancel) return;
    setCanceling(true);
    try {
      // 1. Actualizar en localStorage
      try {
        const currentUserId = user?.id || "guest";
        const userKey = `barberpro_reservas_${currentUserId}`;
        const existingUser: Reserva[] = JSON.parse(localStorage.getItem(userKey) || "[]");
        const updatedUser = existingUser.map((r) =>
          r.id === reservaToCancel.id ? { ...r, estado: "cancelada" as const } : r
        );
        localStorage.setItem(userKey, JSON.stringify(updatedUser));

        const existingGlobal: Reserva[] = JSON.parse(localStorage.getItem("barberpro_reservas_all") || "[]");
        const updatedGlobal = existingGlobal.map((r) =>
          r.id === reservaToCancel.id ? { ...r, estado: "cancelada" as const } : r
        );
        localStorage.setItem("barberpro_reservas_all", JSON.stringify(updatedGlobal));
      } catch (errLocal) {
        console.warn("Local update warning:", errLocal);
      }

      // 2. Intentar actualizar en Supabase si está logueado
      if (user?.id) {
        await supabase
          .from("reservas")
          .update({ estado: "cancelada" } as never)
          .eq("id", reservaToCancel.id);
      }

      setFeedbackMsg({ text: "Tu cita ha sido cancelada exitosamente.", type: "success" });
      setReservaToCancel(null);
      await loadData();
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ text: "Error inesperado al cancelar.", type: "error" });
    } finally {
      setCanceling(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#FCFCF9] dark:bg-zinc-950 pb-16">
      <Navbar rol="cliente" />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 px-3 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 shadow-sm mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Piedecuesta • Abierto Hoy 8:00 - 20:00
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              Hola, {profile?.nombre || "Cliente"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Elige tu estilo, agenda tu cita y llega directo a la silla sin filas.
            </p>
          </div>

          {/* Tab Pill Switcher */}
          <div className="flex rounded-2xl bg-zinc-200/70 p-1 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("catalogo")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "catalogo"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              ✂️ Catálogo & Reserva
            </button>
            <button
              onClick={() => setActiveTab("citas")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "citas"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              }`}
            >
              📅 Mis Citas
              {misReservas.length > 0 && (
                <span className="rounded-full bg-amber-500 text-white px-1.5 py-0.2 text-[10px] font-black">
                  {misReservas.length}
                </span>
              )}
            </button>
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

        {/* TAB 1: CATALOGO & RESERVA */}
        {activeTab === "catalogo" && (
          <div className="mt-6 space-y-8 animate-in fade-in duration-200">
            {/* PASO 1: DESCUBRIMIENTO & GEOLOCALIZACIÓN DE SEDES */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-black">
                  1
                </span>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                  Encuentra tu Barbería más cercana en Piedecuesta
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Calculamos la distancia en tiempo real según tu barrio o ubicación GPS.
              </p>

              <BarbershopDiscovery
                selectedBarberiaId={selectedBarberia.id}
                onSelectBarberia={handleSelectBarberia}
              />
            </div>

            {/* PASO 2: BARBEROS VERIFICADOS DE LA SEDE */}
            <div className="space-y-4 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-black">
                      2
                    </span>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                      Elige tu Barbero Certificado
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Barberos en silla para <strong className="text-zinc-800 dark:text-zinc-200">{selectedBarberia.nombre.split("—")[1] || selectedBarberia.nombre}</strong>. Todos con bioseguridad e identidad verificada.
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-[11px] font-bold self-start sm:self-auto">
                  <span>🛡️</span> 100% Profesionales Verificados
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {barberosDeSede.map((barbero) => (
                  <BarberSecurityCard
                    key={barbero.id}
                    barbero={barbero}
                    barberia={selectedBarberia}
                    isSelected={selectedBarbero.id === barbero.id}
                    onSelect={(b) => setSelectedBarbero(b)}
                  />
                ))}
              </div>
            </div>

            {/* PASO 3: CATÁLOGO EXCLUSIVO DEL BARBERO SELECCIONADO */}
            <div className="space-y-4 pt-4 border-t border-zinc-200/80 dark:border-zinc-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-black">
                      3
                    </span>
                    <h2 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-white">
                      Menú de Servicios de {selectedBarbero.nombre}
                    </h2>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Especialidad: <span className="font-bold text-amber-600 dark:text-amber-400">{selectedBarbero.especialidad}</span>. Mostrando únicamente los servicios certificados de este especialista.
                  </p>
                </div>

                <span className="text-xs font-mono font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-xl self-start sm:self-auto">
                  {serviciosFiltrados.length} servicios disponibles
                </span>
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Buscar servicio de ${selectedBarbero.nombre}...`}
                    className="w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                  />
                </div>

                {/* Dynamic Category Chips for this Barber */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categoriasDisponibles.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoriaFiltro(cat)}
                      className={`whitespace-nowrap rounded-2xl px-4 py-2 text-xs font-bold border transition-all ${
                        categoriaFiltro === cat
                          ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 shadow-sm"
                          : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Services List */}
              <div className="space-y-3">
                {serviciosFiltrados.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:bg-zinc-900 dark:border-zinc-800">
                    <span className="text-3xl mb-2 block">✂️</span>
                    <p className="font-bold text-zinc-900 dark:text-white text-sm">
                      No se encontraron servicios para este filtro
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {selectedBarbero.nombre} no ofrece esta especialidad. Prueba con otra categoría o selecciona otro barbero.
                    </p>
                  </div>
                ) : (
                  serviciosFiltrados.map((servicio) => (
                    <CardServicio
                      key={servicio.id}
                      servicio={servicio}
                      onReservar={(s) => setBookingServicio(s)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MIS CITAS / HISTORIAL */}
        {activeTab === "citas" && (
          <div className="mt-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">
                Historial de Citas y Reservas ({misReservas.length})
              </h3>
              <button
                onClick={loadData}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 transition cursor-pointer"
              >
                ↻ Actualizar
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : misReservas.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:bg-zinc-900 dark:border-zinc-800">
                <span className="text-4xl mb-2 block">📅</span>
                <p className="font-black text-zinc-900 dark:text-white text-sm">
                  Aún no tienes citas agendadas
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                  Explora nuestro catálogo y reserva tu corte o servicio en 30 segundos.
                </p>
                <button
                  onClick={() => setActiveTab("catalogo")}
                  className="mt-4 rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-600 shadow-md transition cursor-pointer"
                >
                  Explorar Catálogo →
                </button>
              </div>
            ) : (
              misReservas.map((reserva) => {
                const fecha = new Date(reserva.fecha_hora);
                const fechaTxt = fecha.toLocaleDateString("es-CO", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                });
                const horaTxt = fecha.toLocaleTimeString("es-CO", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={reserva.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-zinc-200/80 bg-white p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex flex-col items-center justify-center font-black dark:bg-zinc-800 shadow-sm">
                        <span className="text-[10px] uppercase opacity-70 leading-none">
                          {fechaTxt.split(",")[0]}
                        </span>
                        <span className="text-sm">{horaTxt}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                            {reserva.servicios?.nombre || "Servicio de Barbería"}
                          </h4>
                          <Badge estado={reserva.estado} />
                        </div>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {fechaTxt} • ${reserva.total.toLocaleString("es-CO")} COP • ID: #
                          {reserva.id.slice(0, 8)}
                        </p>

                        {reserva.notas && (
                          <p className="text-[11px] text-zinc-400 italic">
                            &ldquo;{reserva.notas}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => setTicketReserva(reserva)}
                        className="rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 transition cursor-pointer"
                      >
                        🎟️ Ver Ticket
                      </button>

                      {reserva.estado === "pendiente" && (
                        <button
                          onClick={() => setReservaToCancel(reserva)}
                          className="rounded-xl border border-red-200 bg-red-50/50 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 transition cursor-pointer"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: RESERVA EN 4 PASOS */}
      <BookingModal
        isOpen={!!bookingServicio}
        onClose={() => setBookingServicio(null)}
        servicio={bookingServicio}
        barberos={barberosDeSede}
        initialBarbero={selectedBarbero}
        clienteId={user?.id}
        onSuccess={() => {
          loadData();
          setActiveTab("citas");
        }}
      />

      {/* MODAL 2: TICKET DIGITAL VIEW */}
      <Modal
        isOpen={!!ticketReserva}
        onClose={() => setTicketReserva(null)}
        title="Tu Ticket Digital"
        subtitle="Muestra este comprobante al llegar a la barbería"
        maxWidth="sm"
      >
        {ticketReserva && (
          <BookingTicket
            reserva={{
              ...ticketReserva,
              servicio: ticketReserva.servicios || undefined,
            }}
            onClose={() => setTicketReserva(null)}
          />
        )}
      </Modal>

      {/* MODAL 3: CONFIRMACIÓN CANCELAR RESERVA */}
      <Modal
        isOpen={!!reservaToCancel}
        onClose={() => setReservaToCancel(null)}
        title="¿Cancelar Reserva?"
        subtitle="Esta acción liberará tu turno para otro cliente"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            ¿Estás seguro de que deseas cancelar tu cita para{" "}
            <b>{reservaToCancel?.servicios?.nombre || "el servicio seleccionado"}</b>?
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setReservaToCancel(null)}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400"
            >
              No, Mantener
            </button>
            <button
              onClick={handleCancelBooking}
              disabled={canceling}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
            >
              {canceling ? "Cancelando..." : "Sí, Cancelar Cita"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
