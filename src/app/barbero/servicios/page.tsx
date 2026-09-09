"use client";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/client";

type S = { id: string; nombre: string; precio: number; duracion_min: number; activo: boolean };

export default function ServiciosPage() {
  const supabase = createClient();
  const [servicios, setServicios] = useState<S[]>([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [duracion, setDuracion] = useState("30");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  async function fetchServicios() {
    setLoading(true);
    const { data, error } = await supabase.from("servicios").select("*").order("created_at", { ascending: false });
    if (error) setMsg(`Error leer: ${error.message}`);
    else setServicios((data as S[]) || []);
    setLoading(false);
  }

  useEffect(() => { fetchServicios(); }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre || !precio) return;
    setMsg("Creando...");
    // Para demo sin login, barbero_id null (tu schema lo permite). Con login real usaría auth.uid()
    const { data: userData } = await supabase.auth.getUser();
    const barbero_id = userData.user?.id || null;
    const { error } = await supabase.from("servicios").insert({
      nombre,
      precio: Number(precio),
      duracion_min: Number(duracion),
      barbero_id,
      activo: true,
    });
    if (error) { setMsg(`Error crear: ${error.message}`); return; }
    setMsg("¡Creado! ✓");
    setNombre(""); setPrecio("");
    fetchServicios();
  }

  async function borrar(id: string) {
    const { error } = await supabase.from("servicios").delete().eq("id", id);
    if (error) { setMsg(`Error borrar: ${error.message}`); return; }
    setMsg("Borrado ✓");
    fetchServicios();
  }

  async function editar(id: string, nombreActual: string) {
    const nuevo = prompt("Nuevo nombre:", nombreActual);
    if (!nuevo) return;
    const { error } = await supabase.from("servicios").update({ nombre: nuevo }).eq("id", id);
    if (error) { setMsg(`Error actualizar: ${error.message}`); return; }
    setMsg("Actualizado ✓");
    fetchServicios();
  }

  return (
    <div className="min-h-screen bg-[#FCFCF9] dark:bg-zinc-950">
      <Navbar rol="barbero" />
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">Mis Servicios — CRUD Real</h1>
          <span className="text-xs bg-zinc-900 text-white rounded-full px-3 py-1 dark:bg-white dark:text-zinc-900">{servicios.length} servicios</span>
        </div>
        <p className="text-xs text-zinc-500 mt-1 dark:text-zinc-400">Conectado a Supabase tabla <b>public.servicios</b> • {loading ? "Cargando..." : "Listo"} • {msg}</p>

        <form onSubmit={crear} className="mt-6 rounded-2xl bg-white p-5 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 grid gap-3 sm:grid-cols-4">
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre (Ej: Corte Clásico)" className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none dark:bg-zinc-950 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500 sm:col-span-2" required />
          <input value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="Precio COP" type="number" className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none dark:bg-zinc-950 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500" required />
          <input value={duracion} onChange={(e) => setDuracion(e.target.value)} placeholder="Min" type="number" className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none dark:bg-zinc-950 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500" />
          <button type="submit" className="sm:col-span-4 rounded-full bg-amber-500 py-3 font-bold text-white hover:bg-amber-600 shadow-sm">Crear (CREATE) → Supabase</button>
        </form>

        <div className="mt-6 grid gap-3">
          {loading ? <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">Cargando servicios...</p> :
            servicios.length === 0 ? <p className="text-center text-sm text-zinc-500 border border-dashed rounded-2xl p-6 bg-white dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-400">Sin servicios. Crea el primero arriba ↑</p> :
            servicios.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-2xl bg-white p-4 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div>
                <p className="font-bold text-zinc-900 dark:text-white">{s.nombre}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">${s.precio.toLocaleString("es-CO")} • {s.duracion_min} min {s.activo ? "• Activo" : "• Inactivo"}</p>
                <p className="text-xs text-zinc-400">{s.id.slice(0,8)}...</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => editar(s.id, s.nombre)} className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-900 hover:bg-zinc-50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white">Editar (UPDATE)</button>
                <button onClick={() => borrar(s.id)} className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600">Borrar (DELETE)</button>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">CRUD completo contra Supabase: Crear → leer → actualizar → borrar. Verifica en Table Editor.</p>
      </main>
    </div>
  );
}
