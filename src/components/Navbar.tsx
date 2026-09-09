"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export function Navbar({ rol }: { rol: "cliente" | "barbero" }) {
  const { profile, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl px-4 sm:px-6 py-3 dark:bg-zinc-950/80 dark:border-zinc-800 transition-colors">
      <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-zinc-900 dark:text-white">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 text-amber-500 text-sm font-black dark:bg-white shadow-sm">
          ✂
        </span>
        <span className="text-base font-black tracking-tight">BARBERPRO</span>
        <span className="hidden xs:inline-flex rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
          {rol}
        </span>
      </Link>

      <div className="flex items-center gap-2 text-sm">
        {profile && (
          <span className="hidden md:inline-flex text-xs font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800">
            {profile.nombre}
          </span>
        )}

        {rol === "cliente" ? (
          <>
            <Link
              href="/cliente/dashboard"
              className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition shadow-sm"
            >
              Reservar
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/barbero/dashboard"
              className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition shadow-sm"
            >
              Agenda
            </Link>
            <Link
              href="/barbero/servicios"
              className="rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-800 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
            >
              Servicios
            </Link>
          </>
        )}

        <button
          type="button"
          onClick={signOut}
          className="rounded-full px-3 py-2 text-xs font-semibold text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition"
          title="Cerrar sesión"
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
