"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Servicio = { id: string; nombre: string; precio: number; duracion_min: number; descripcion?: string };

export default function ClienteDashboard() {
  const supabase = createClient();
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [filtro, setFiltro] = useState("Todos");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from("servicios").select("id,nombre,precio,duracion_min,descripcion").eq("activo", true).order("precio");
      if (error) setMsg(`Error: ${error.message}`);
      else setServicios((data as Servicio[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  async function reservar(servicio: Servicio) {
    setMsg(`Reservando ${servicio.nombre}...`);
    const { data: userData } = await supabase.auth.getUser();
    const cliente_id = userData.user?.id;
    if (!cliente_id) {
      setMsg("Demo: sin sesión. Crea cuenta en /auth/login para guardar real. Simulación OK ✓");
      return;
    }
    const { error } = await supabase.from("reservas").insert({
      cliente_id,
      barbero_id: cliente_id,
      servicio_id: servicio.id,
      fecha_hora: new Date(Date.now() + 24*3600*1000).toISOString(),
      estado: "pendiente",
      total: servicio.precio,
    });
    if (error) setMsg(`Error reserva: ${error.message}`);
    else setMsg(`¡Reserva creada! ${servicio.nombre} → revisa /barbero/dashboard y Supabase reservas ✓`);
  }

  const filtrados = filtro === "Todos" ? servicios : servicios.filter(s => s.nombre.toLowerCase().includes(filtro.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#FCFCF9] dark:bg-zinc-950">
      <Navbar rol="cliente" />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Hola, Cliente 👋</h1>
            <p className="text-sm text-zinc-500">Piedecuesta • Reserva en 30s • Realtime Supabase</p>
          </div>
          <span className="hidden sm:inline-flex rounded-full bg-white border px-3 py-1 text-xs font-semibold dark:bg-zinc-900 dark:border-zinc-800">{servicios.length} servicios</span>
        </div>
        {msg && <p className="mt-3 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200">{msg}</p>}

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 -mx-6 px-6">
          {["Todos", "Corte", "Barba", "Combo"].map((c) => (
            <button key={c} onClick={() => setFiltro(c)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold border transition ${filtro === c ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900" : "bg-white dark:bg-zinc-900 dark:border-zinc-800 hover:bg-zinc-50"}`}>{c}</button>
          ))}
        </div>

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-black tracking-tight">Servicios en Supabase {loading ? "• cargando..." : `• ${filtrados.length}`}</h2>
          <div className="grid gap-3">
            {loading ? <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-zinc-500">Cargando desde public.servicios...</div> :
              filtrados.length === 0 ? <div className="rounded-2xl border border-dashed bg-white p-6 text-center dark:bg-zinc-900"><p className="text-sm font-semibold">No hay servicios</p><p className="text-xs text-zinc-500">Ve a /barbero/servicios y crea uno.</p></div> :
              filtrados.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-2xl border bg-white p-4 dark:bg-zinc-900 dark:border-zinc-800 hover:shadow-sm transition">
                <div className="flex gap-3">
                  <div className="hidden sm:flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 text-amber-500 font-black dark:bg-white">✂</div>
                  <div>
                    <p className="font-bold leading-tight">{s.nombre}</p>
                    <p className="text-sm text-zinc-500">{s.duracion_min} min • ${s.precio.toLocaleString("es-CO")} COP</p>
                    {s.descripcion && <p className="text-xs text-zinc-400">{s.descripcion}</p>}
                  </div>
                </div>
                <button onClick={() => reservar(s)} className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-600 shadow-sm">Reservar</button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-5 dark:bg-zinc-900 border dark:border-zinc-800">
          <h3 className="font-bold text-sm">Cómo probar CRUD para el profe</h3>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">1. Crea en <Link href="/barbero/servicios" className="underline font-semibold">/barbero/servicios</Link> → 2. Aparece aquí (READ) → 3. Reserva acá (CREATE reservas) → 4. Ve a <Link href="/barbero/dashboard" className="underline font-semibold">/barbero/dashboard</Link></p>
        </section>
      </main>
    </div>
  );
}
