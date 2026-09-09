import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FCFCF9] dark:bg-zinc-950 text-zinc-900 dark:text-white antialiased">
      {/* Signature: barber pole stripe - 4px */}
      <div className="h-1 w-full bg-[repeating-linear-gradient(90deg,#DC2626_0_14px,white_14px_28px,#111827_28px_42px)] dark:opacity-80" aria-hidden />

      <nav className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/80 backdrop-blur-xl dark:bg-zinc-950/70 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center text-amber-500 text-[15px] font-black tracking-tighter" aria-hidden>✂</div>
            <span className="font-black tracking-[-0.02em] text-[15px]">BARBERPRO</span>
            <span className="hidden sm:inline-flex rounded-full border border-zinc-900 bg-white px-2.5 py-1 text-[10px] font-black tracking-widest text-zinc-900 dark:bg-zinc-900 dark:text-white dark:border-zinc-700">PIEDECUESTA • 8:00—20:00</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="hidden sm:inline-flex rounded-full px-4 py-2 text-sm font-semibold hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">Ingresar</Link>
            <Link href="/auth/login" className="inline-flex rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2">Reservar ahora</Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pt-12 sm:pt-16 pb-10">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="pt-1">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 text-xs font-semibold shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
              Agenda abierta hoy • Respuesta en 30s
            </div>
            <h1 className="mt-6 text-[40px] sm:text-[54px] font-black leading-[0.9] tracking-[-0.04em] text-balance">
              Reserva en <span className="text-amber-500">30 segundos.</span><br />
              Sin WhatsApp.<br />
              <span className="text-zinc-400 dark:text-zinc-600 text-[32px] sm:text-[42px] font-black tracking-[-0.03em]">Sin filas.</span>
            </h1>
            <p className="mt-5 max-w-[48ch] text-[17px] leading-7 text-zinc-600 dark:text-zinc-400">
              Tu hora exacta, tu barbero favorito. Elige estilo, confirma al instante y llega directo a la silla. Pago seguro, recordatorio automático y recibo digital.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth/login?rol=cliente" className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-zinc-900 px-7 py-3.5 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900">Soy Cliente →</Link>
              <Link href="/auth/login?rol=barbero" className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-zinc-900 bg-white px-7 py-3.5 text-sm font-bold hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900">Soy Barbero</Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border px-3 py-1.5 font-semibold dark:bg-zinc-900 dark:border-zinc-800"><span className="text-amber-500">★</span> 4.9 · 500+ reservas</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border px-3 py-1.5 font-semibold dark:bg-zinc-900 dark:border-zinc-800">Respuesta en 30s</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border px-3 py-1.5 font-semibold dark:bg-zinc-900 dark:border-zinc-800">Sin llamadas</span>
            </div>
          </div>

          <div className="rounded-[28px] border bg-white p-5 sm:p-6 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black tracking-tight">Tu próxima visita — 4 pasos</p>
              <span className="rounded-full bg-zinc-900 text-white px-2.5 py-1 text-xs font-bold dark:bg-white dark:text-zinc-900">Mobile-first</span>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                ["01", "Elige", "Tu barbero y estilo"],
                ["02", "Hora", "Mañana, tarde o noche"],
                ["03", "Confirma", "Pago seguro"],
                ["04", "Llega", "Directo a la silla ✓"],
              ].map(([n, a, b]) => (
                <div key={a} className="flex items-center gap-4 rounded-2xl border bg-zinc-50 p-4 dark:bg-zinc-950 dark:border-zinc-800">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border text-xs font-black dark:bg-zinc-900">{n}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold leading-none">{a}</p>
                    <p className="text-xs text-zinc-500">{b}</p>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-700" aria-hidden />
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Link href="/cliente/dashboard" className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">Demo Cliente</Link>
              <Link href="/barbero/dashboard" className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-zinc-900 py-3.5 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900">Demo Barbero</Link>
            </div>
            <p className="mt-3 text-center text-xs text-zinc-500">Agenda en tiempo real • Recordatorio por hora</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12 grid gap-4 sm:grid-cols-3">
        {[
          ["Silla lista", "Hora exacta, sin espera en sala."],
          ["Pago simple", "Nequi, efectivo o tarjeta. Recibo al instante."],
          ["Barberos verificados", "Estilo consistente, reseñas reales."],
        ].map(([t, s]) => (
          <div key={t} className="rounded-2xl border bg-white p-5 dark:bg-zinc-900 dark:border-zinc-800">
            <p className="text-sm font-black tracking-tight">{t}</p>
            <p className="mt-1 text-sm leading-5 text-zinc-600 dark:text-zinc-400">{s}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-zinc-200/60 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800">BarberPro • Piedecuesta • Atención 8:00—20:00</footer>
    </div>
  );
}
