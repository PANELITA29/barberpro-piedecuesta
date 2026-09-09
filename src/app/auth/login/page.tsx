"use client";
import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginInner() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"cliente" | "barbero">("cliente");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const rolParam = params.get("rol") as "cliente" | "barbero" | null;
  const defaultRol = rolParam || rol;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("Conectando a Supabase lxegusogwngjqxeksmcw...");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMsg(`Demo: ${error.message} — entrando a demo ${defaultRol}...`);
      setTimeout(() => router.push(defaultRol === "barbero" ? "/barbero/dashboard" : "/cliente/dashboard"), 700);
      setLoading(false);
      return;
    }
    router.push(defaultRol === "barbero" ? "/barbero/dashboard" : "/cliente/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFCF9] dark:bg-zinc-950 px-6 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-[380px] rounded-[28px] bg-white p-7 sm:p-8 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 rounded-2xl bg-zinc-900 text-amber-500 flex items-center justify-center font-black text-lg dark:bg-white">✂</div>
          <h1 className="mt-3 text-[22px] font-black tracking-tight">BARBERPRO</h1>
          <p className="text-sm text-zinc-500">Accede como Cliente o Barbero</p>
          <p className="mt-1 text-xs text-zinc-400">Ruben Mendoza • Piedecuesta</p>
        </div>

        <div className="mt-6 flex gap-2 rounded-full bg-zinc-100 p-1 dark:bg-zinc-800">
          {(["cliente", "barbero"] as const).map((r) => {
            const active = defaultRol === r || rol === r;
            return (
              <button key={r} type="button" onClick={() => setRol(r)} className={`flex-1 rounded-full py-2 text-sm font-bold capitalize transition ${active ? "bg-amber-500 text-white shadow" : "text-zinc-600 dark:text-zinc-300"}`}>{r}</button>
            );
          })}
        </div>

        <div className="mt-6 space-y-3">
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:bg-zinc-950 dark:border-zinc-800" required autoComplete="email" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Contraseña</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:bg-zinc-950 dark:border-zinc-800" required autoComplete="current-password" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="mt-6 w-full rounded-full bg-amber-500 py-3 font-bold text-white hover:bg-amber-600 disabled:opacity-60 transition">{loading ? "Ingresando..." : "Ingresar →"}</button>
        {msg && <p className="mt-3 text-center text-xs leading-4 text-zinc-500 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl px-3 py-2">{msg}</p>}
        <p className="mt-4 text-center text-xs text-zinc-500">Demo sin cuenta: usa cualquier email • Flujo completo sin bloquear</p>
        <div className="mt-3 flex justify-center gap-4 text-xs">
          <Link href="/" className="underline hover:text-amber-600">Volver</Link>
          <span className="text-zinc-300">•</span>
          <span className="text-zinc-500">Supabase Auth + RLS</span>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-zinc-500">Cargando...</div>}>
      <LoginInner />
    </Suspense>
  );
}
