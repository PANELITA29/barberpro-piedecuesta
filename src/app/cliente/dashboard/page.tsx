"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { CardServicio } from "@/components/CardServicio";
import { BookingModal } from "@/components/booking/BookingModal";
import { BookingTicket } from "@/components/booking/BookingTicket";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Servicio, Profile, Reserva } from "@/types/database";

export default function ClienteDashboard() {
  const { user, profile } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  // Tabs
  const [activeTab, setActiveTab] = useState<"catalogo" | "citas">("catalogo");

  // Datos
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [barberos, setBarberos] = useState<Profile[]>([]);
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

  const loadData = useCallback(async () => {
    try {
      // 1. Cargar servicios activos
      const { data: servData } = await supabase
        .from("servicios")
        .select("*")
        .eq("activo", true)
        .order("precio", { ascending: true });

      if (servData && servData.length > 0) {
        setServicios(servData);
      } else {
        setServicios([
          {
            id: "serv-1",
            nombre: "Corte Clásico & Skin Fade",
            descripcion: "Corte moderno degradado a tijera o máquina, textura superior y peinado con pomada mate.",
            precio: 18000,
            duracion_min: 30,
            categoria: "Corte",
            activo: true,
            imagen_url: "/images/corte_clasico.jpg",
            barbero_id: null,
            created_at: new Date().toISOString(),
          },
          {
            id: "serv-2",
            nombre: "Perfilado de Barba & Toalla Caliente",
            descripcion: "Delineado con navaja desechable, aceites hidratantes y ritual de toalla caliente aromática.",
            precio: 14000,
            duracion_min: 25,
            categoria: "Barba",
            activo: true,
            imagen_url: "/images/perfilado_barba.jpg",
            barbero_id: null,
            created_at: new Date().toISOString(),
          },
          {
            id: "serv-3",
            nombre: "Combo Full VIP (Corte + Barba + Cejas)",
            descripcion: "Servicio completo premium: corte degradado, diseño de barba esculpida, cejas y mascarilla facial.",
            precio: 28000,
            duracion_min: 50,
            categoria: "Combo",
            activo: true,
            imagen_url: "/images/combo_full_vip.jpg",
            barbero_id: null,
            created_at: new Date().toISOString(),
          },
        ]);
      }

      // 2. Cargar barberos
      const { data: barbData } = await supabase
        .from("profiles")
        .select("*")
        .eq("rol", "barbero");

      if (barbData && barbData.length > 0) {
        setBarberos(barbData);
      } else {
        // Fallback demo barbero si aún no hay perfiles creados
        setBarberos([
          {
            id: "barbero-1",
            nombre: "Carlos Mendoza",
            telefono: "3151234567",
            rol: "barbero",
            created_at: new Date().toISOString(),
          },
          {
            id: "barbero-2",
            nombre: "Andrés Silva",
            telefono: "3167890123",
            rol: "barbero",
            created_at: new Date().toISOString(),
          },
        ]);
      }

      // 3. Cargar reservas del cliente si está logueado
      const currentUserId = user?.id;
      if (currentUserId) {
        const { data: resData } = await supabase
          .from("reservas")
          .select("*, servicios(*)")
          .eq("cliente_id", currentUserId)
          .order("fecha_hora", { ascending: false });

        if (resData) setMisReservas(resData as unknown as Reserva[]);
      }
    } catch (err) {
      console.error("Error cargando datos del cliente:", err);
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
      const { error } = await supabase
        .from("reservas")
        .update({ estado: "cancelada" } as never)
        .eq("id", reservaToCancel.id);

      if (error) {
        setFeedbackMsg({ text: `Error al cancelar: ${error.message}`, type: "error" });
      } else {
        setFeedbackMsg({ text: "Tu cita ha sido cancelada exitosamente.", type: "success" });
        setReservaToCancel(null);
        loadData();
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ text: "Error inesperado al cancelar.", type: "error" });
    } finally {
      setCanceling(false);
    }
  };

  // Filtrado de servicios
  const serviciosFiltrados = useMemo(() => {
    return servicios.filter((s) => {
      const matchesCategory =
        categoriaFiltro === "Todos" ||
        s.nombre.toLowerCase().includes(categoriaFiltro.toLowerCase()) ||
        (s.categoria && s.categoria.toLowerCase() === categoriaFiltro.toLowerCase());

      const matchesSearch =
        s.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.descripcion && s.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [servicios, categoriaFiltro, searchQuery]);

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
          <div className="mt-6 space-y-6 animate-in fade-in duration-200">
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
                  placeholder="Buscar servicio (ej: Degradado, Barba, Cejas)..."
                  className="w-full rounded-2xl border border-zinc-200 bg-white pl-10 pr-4 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
                />
              </div>

              {/* Category Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {["Todos", "Corte", "Barba", "Combo"].map((cat) => (
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

            {/* Barberos Destacados Strip */}
            <div>
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
                Barberos Verificados en Silla:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {barberos.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm"
                  >
                    <div className="h-10 w-10 rounded-xl bg-zinc-900 text-amber-500 flex items-center justify-center font-black text-sm dark:bg-white">
                      ✂
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">{b.nombre}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                        ★ 4.9 • Disponible
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BARBERSHOP LOCAL & LOCATION CARD (Piedecuesta) */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-6 dark:bg-zinc-900 dark:border-zinc-800 shadow-md overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-5 items-center">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-3 py-1 text-[11px] font-bold">
                    <span>📍</span> Sede Oficial • Piedecuesta
                  </div>

                  <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                    BarberPro Sede Principal
                  </h3>

                  <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                    <p className="flex items-start gap-2">
                      <span className="font-bold text-zinc-900 dark:text-white">Dirección:</span>
                      <span>Carrera 7 # 8-42, Centro Histórico (a 1 cuadra del Parque Principal), Piedecuesta, Santander</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-white">Horario:</span>
                      <span>Lunes a Sábado: 8:00 AM — 8:00 PM • Dom: 9:00 AM — 3:00 PM</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900 dark:text-white">Parqueadero:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Disponible para motos y carros</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Piedecuesta+Santander+Parque+Principal"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-md transition hover:scale-105 active:scale-95"
                    >
                      <span>🗺️</span> Abrir en Google Maps
                    </a>
                    <a
                      href="https://waze.com/ul?q=Parque+Principal+Piedecuesta"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 transition"
                    >
                      <span>🚗</span> Waze
                    </a>
                  </div>
                </div>

                {/* Local Photo */}
                <div className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-inner group">
                  <img
                    src="/images/local_piedecuesta.jpg"
                    alt="Sede BarberPro Piedecuesta"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-2 left-2 bg-zinc-950/80 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-xl">
                    📸 Fachada & Interior Silla VIP
                  </div>
                </div>
              </div>
            </div>

            {/* Services List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">
                  Servicios Disponibles ({serviciosFiltrados.length})
                </h3>
                <span className="text-xs text-zinc-400">Piedecuesta, Santander</span>
              </div>

              {loading ? (
                <div className="space-y-3">
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : serviciosFiltrados.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:bg-zinc-900 dark:border-zinc-800">
                  <span className="text-3xl mb-2 block">✂️</span>
                  <p className="font-bold text-zinc-900 dark:text-white text-sm">
                    No se encontraron servicios
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Prueba con otra búsqueda o selecciona la categoría &ldquo;Todos&rdquo;.
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
                className="text-xs font-bold text-amber-600 hover:text-amber-700 transition"
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
                  className="mt-4 rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-600 shadow-md transition"
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
                        className="rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 transition"
                      >
                        🎟️ Ver Ticket
                      </button>

                      {reserva.estado === "pendiente" && (
                        <button
                          onClick={() => setReservaToCancel(reserva)}
                          className="rounded-xl border border-red-200 bg-red-50/50 px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 transition"
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
        barberos={barberos}
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
