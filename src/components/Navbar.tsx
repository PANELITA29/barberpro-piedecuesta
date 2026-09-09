import Link from "next/link";

export function Navbar({ rol }: { rol: "cliente" | "barbero" }) {
  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl px-6 py-3 dark:bg-zinc-950/80 dark:border-zinc-800">
      <Link href="/" className="flex items-center gap-2 font-black tracking-tight">✂ BARBERPRO <span className="rounded-full bg-amber-500 px-2 py-1 text-xs font-black text-white tracking-widest">{rol.toUpperCase()}</span></Link>
      <div className="flex items-center gap-1.5 text-sm">
        {rol === "cliente" ? (
          <>
            <Link href="/cliente/dashboard" className="rounded-full bg-zinc-900 px-4 py-2 text-white font-semibold dark:bg-white dark:text-zinc-900">Inicio</Link>
            <Link href="/auth/login" className="px-3 py-2 font-medium hover:text-amber-600">Salir</Link>
          </>
        ) : (
          <>
            <Link href="/barbero/dashboard" className="rounded-full bg-zinc-900 px-4 py-2 text-white font-semibold dark:bg-white dark:text-zinc-900">Agenda</Link>
            <Link href="/barbero/servicios" className="rounded-full border bg-white px-4 py-2 font-semibold hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800">Servicios</Link>
            <Link href="/auth/login" className="px-3 py-2 font-medium hover:text-amber-600">Salir</Link>
          </>
        )}
      </div>
    </nav>
  );
}
