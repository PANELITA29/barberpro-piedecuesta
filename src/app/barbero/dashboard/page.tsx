"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Reserva = {
  id: string;
  fecha_hora: string;
  estado: string;
  total: number;
  servicio_id: string;
  cliente_id: string;
  servicios?: { nombre: string };
};

export default function BarberoDashboard() {
  const supabase = createClient();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [filtro, setFiltro] = useState<"todas" | "pendiente" | "confirmada">("todas");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("reservas")
      .select("id,fecha_hora,estado,total,servicio_id,cliente_id, servicios(nombre)")
      .order("fecha_hora", { ascending: true })
      .limit(20);
    if (error) setMsg(`Error: ${error.message} (si es RLS, crea cuenta barbero y loguéate)`);
    else setReservas((data as unknown as Reserva[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateEstado(id: string, estado: string) {
    const { error } = await supabase.from("reservas").update({ estado }).eq("id", id);
    if (error) setMsg(`Error actualizar: ${error.message}`);
    else { setMsg(`Reserva ${estado} ✓`); load(); }
  }

  const filtradas = filtro === "todas" ? reservas : reservas.filter(r => r.estado === filtro);
  const totalHoy = filtradas.reduce((a, b) => a + (b.total || 0), 0);

  // Datos demo si no hay reservas reales aún
  const demo = [
    { hora: "08:00", cliente: "Juan", servicio: "Corte Clásico", total: 15000, estado: "confirmada" },
    { hora: "09:00", cliente: "Pedro", servicio: "Barba Premium", total: 12000, estado: "pendiente" },
  ];

  return (
    <div className="min-h-screen bg-[#FCFCF9] dark:bg-zinc-950">
      <Navbar rol="barbero" />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Hola, Carlos ✂️</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Agenda en tiempo real • Supabase Realtime • {msg}</p>
          </div>
          <div className="rounded-2xl bg-white px-5 py-3 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-right shadow-sm">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Hoy</p><p className="text-lg font-black text-amber-600 leading-none">${totalHoy.toLocaleString("es-CO")}</p><p className="text-xs text-zinc-500 dark:text-zinc-400">{filtradas.length} citas</p>
          </div>
        </div>

        <div className="mt-6 flex gap-2 -mx-6 px-6 overflow-x-auto">
          {(["todas", "pendiente", "confirmada"] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold capitalize border ${filtro===f ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "bg-white dark:bg-zinc-900 dark:border-zinc-800"}`}>{f} {f==="pendiente"?"●":""}</button>
          ))}
          <button onClick={load} className="whitespace-nowrap rounded-full bg-amber-500 text-white px-4 py-2 text-sm font-bold">↻ Actualizar</button>
        </div>

        <section className="mt-6 grid gap-3">
          {loading ? <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-6 bg-white dark:bg-zinc-900">Cargando reservas desde public.reservas...</p> :
            filtradas.length === 0 ? (
              <>
                <div className="rounded-2xl border border-dashed bg-white p-6 text-center dark:bg-zinc-900 dark:border-zinc-700">
                  <p className="font-bold text-zinc-900 dark:text-white">Sin reservas aún</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">Crea una desde <Link href="/cliente/dashboard" className="underline font-semibold">/cliente/dashboard</Link> con una cuenta logueada.</p>
                  <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">Demo visual mientras tanto:</p>
                </div>
                {demo.map((a) => (
                  <div key={a.hora} className="flex items-center justify-between rounded-2xl bg-white p-4 dark:bg-zinc-900 border dark:border-zinc-800 opacity-60">
                    <div className="flex gap-3">
                      <div className="h-11 w-11 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center text-xs font-black text-white dark:text-zinc-900">{a.hora}</div>
                      <div>
                        <p className="font-bold leading-tight">{a.cliente} • {a.servicio}</p>
                        <p className="text-sm text-zinc-500">${a.total.toLocaleString("es-CO")}</p>
                        <span className="inline-flex mt-1 rounded-full bg-amber-100 text-amber-700 px-2.5 py-1 text-xs font-bold">{a.estado} (demo)</span>
                      </div>
                    </div>
                    <span className="text-xs text-zinc-400">—</span>
                  </div>
                ))}
              </>
            ) :
            filtradas.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-2xl bg-white p-4 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:shadow-sm transition">
              <div className="flex gap-3">
                <div className="h-11 w-11 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center text-xs font-black text-white dark:text-zinc-900">{new Date(r.fecha_hora).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</div>
                <div>
                  <p className="font-bold leading-tight text-zinc-900 dark:text-white">{r.servicios?.nombre || "Servicio"} • ${r.total.toLocaleString("es-CO")}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(r.fecha_hora).toLocaleDateString("es-CO")} • {r.id.slice(0,8)}</p>
                  <span className={`inline-flex mt-1 rounded-full px-2.5 py-1 text-xs font-bold ${r.estado === "confirmada" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : r.estado === "pendiente" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}>{r.estado}</span>
                </div>
              </div>
              {r.estado === "pendiente" ? (
                <div className="flex gap-2">
                  <button onClick={() => updateEstado(r.id, "confirmada")} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600">Confirmar</button>
                  <button onClick={() => updateEstado(r.id, "cancelada")} className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-bold hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white">Rechazar</button>
                </div>
              ) : r.estado === "confirmada" ? <button onClick={() => updateEstado(r.id, "completada")} className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-bold dark:bg-zinc-800 dark:border-zinc-700 dark:text-white">Completar</button> : <span className="text-xs text-zinc-500 dark:text-zinc-400">{r.estado}</span>}
            </div>
          ))}
        </section>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link href="/barbero/servicios" className="inline-flex items-center justify-center rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white hover:bg-amber-600 shadow-sm">CRUD Servicios →</Link>
          <Link href="/cliente/dashboard" className="inline-flex items-center justify-center rounded-2xl border bg-white py-3.5 text-sm font-bold hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800">Ver Cliente →</Link>
        </div>
        <p className="mt-3 text-center text-xs text-zinc-500">UPDATE: Confirmar/Cancelar → cambia estado en public.reservas • DELETE desde cliente • Realtime al recargar</p>
      </main>
    </div>
  );
}
