import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FCFCF9] dark:bg-zinc-950 text-zinc-900 dark:text-white antialiased selection:bg-amber-500 selection:text-white">
      {/* Signature: Barber Pole Animated Stripe */}
      <div
        className="h-1.5 w-full bg-[repeating-linear-gradient(90deg,#DC2626_0_16px,white_16px_32px,#1E3A8A_32px_48px)] dark:opacity-90 shadow-sm"
        aria-hidden
      />

      {/* Main Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-xl dark:bg-zinc-950/80 dark:border-zinc-800 transition-colors">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center text-amber-500 text-base font-black tracking-tighter shadow-sm"
              aria-hidden
            >
              ✂
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-tight text-base leading-none">
                BARBERPRO
              </span>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                PIEDECUESTA
              </span>
            </div>
            <span className="hidden md:inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[10px] font-black tracking-widest text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800">
              8:00 — 20:00
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="rounded-full px-4 py-2 text-xs font-bold text-zinc-700 hover:text-amber-600 dark:text-zinc-300 dark:hover:text-amber-400 transition"
            >
              Ingresar
            </Link>
            <Link
              href="/cliente/dashboard"
              className="inline-flex rounded-full bg-amber-500 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-amber-600 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Reservar Cita ✂️
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-10 sm:pt-16 pb-12 overflow-hidden">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Left Column: Value Proposition */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-bold text-zinc-700 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
              Sillas disponibles hoy en Piedecuesta • Respuesta en 30s
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight text-balance text-zinc-900 dark:text-white">
              Reserva en <span className="text-amber-500 underline decoration-amber-500/30">30 segundos.</span><br />
              Sin WhatsApp.<br />
              <span className="text-zinc-400 dark:text-zinc-600 text-3xl sm:text-4xl lg:text-5xl">Sin filas de espera.</span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              Tu hora exacta, tu barbero favorito en Piedecuesta. Elige corte y extras, confirma al instante con Nequi o Efectivo y llega directo a la silla con tu recibo digital.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/auth/login?rol=cliente&mode=register"
                className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-zinc-900 px-7 py-3 text-xs sm:text-sm font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-lg transition hover:scale-105 active:scale-95"
              >
                🧔 Soy Cliente → Reservar
              </Link>
              <Link
                href="/auth/login?rol=barbero"
                className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-zinc-300 bg-white px-7 py-3 text-xs sm:text-sm font-bold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 shadow-sm transition"
              >
                ✂️ Soy Barbero → Mi Agenda
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-zinc-200 px-3 py-1 font-semibold dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
                <span className="text-amber-500 font-bold">★ 4.9</span> 500+ cortes realizados
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-zinc-200 px-3 py-1 font-semibold dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
                🟣 Nequi & Efectivo
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-zinc-200 px-3 py-1 font-semibold dark:bg-zinc-900 dark:border-zinc-800 shadow-sm">
                🔒 Supabase Realtime
              </span>
            </div>
          </div>

          {/* Right Column: 4-Step Interactive Preview Card */}
          <div className="rounded-[32px] border border-zinc-200/80 bg-white p-6 sm:p-7 shadow-xl dark:bg-zinc-900 dark:border-zinc-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <p className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">
                  Tu Experiencia en 4 Pasos
                </p>
                <p className="text-[11px] text-zinc-400">Rápido, visual y 100% móvil</p>
              </div>
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                Mobile-First
              </span>
            </div>

            <div className="grid gap-2.5">
              {[
                { n: "01", t: "Elige Barbero & Estilo", s: "Corte clásico, degradado, perfilado o combos VIP." },
                { n: "02", t: "Selecciona Fecha & Hora", s: "Slots organizados por mañana, tarde y noche." },
                { n: "03", t: "Confirma & Pago Simple", s: "Paga con Nequi, efectivo en silla o tarjeta." },
                { n: "04", t: "Llega con tu Ticket QR", s: "Directo a la silla sin esperas en sala ✓" },
              ].map((step) => (
                <div
                  key={step.n}
                  className="flex items-center gap-3.5 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3.5 dark:bg-zinc-950 dark:border-zinc-800/80 hover:border-amber-500/30 transition"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-zinc-200 text-xs font-black text-zinc-900 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 shadow-sm flex-shrink-0">
                    {step.n}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                      {step.t}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {step.s}
                    </p>
                  </div>
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <Link
                href="/cliente/dashboard"
                className="flex items-center justify-center rounded-2xl bg-amber-500 py-3 text-xs font-bold text-white hover:bg-amber-600 shadow-md transition"
              >
                Probar Cliente
              </Link>
              <Link
                href="/barbero/dashboard"
                className="flex items-center justify-center rounded-2xl bg-zinc-900 py-3 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 shadow-md transition"
              >
                Probar Barbero
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE HIGHLIGHTS / STATS SECTION */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 border-t border-zinc-200/80 dark:border-zinc-800">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm space-y-1">
            <span className="text-2xl mb-1 block">⏱️</span>
            <h3 className="text-sm font-black text-zinc-900 dark:text-white">
              Cero Pérdida de Tiempo
            </h3>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Elimina las 1.5 horas diarias perdidas respondiendo WhatsApp. Agenda 24/7 en tiempo real.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm space-y-1">
            <span className="text-2xl mb-1 block">🎟️</span>
            <h3 className="text-sm font-black text-zinc-900 dark:text-white">
              Voucher Digital con QR
            </h3>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Comprobante interactivo con botón directo para compartir en WhatsApp y guardar tu turno.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 dark:bg-zinc-900 dark:border-zinc-800 shadow-sm space-y-1">
            <span className="text-2xl mb-1 block">📊</span>
            <h3 className="text-sm font-black text-zinc-900 dark:text-white">
              Control Total del Barbero
            </h3>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Métricas de ingresos en COP, gestión CRUD de catálogo y confirmación instantánea vía WebSockets.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-200/80 bg-white dark:bg-zinc-950 py-8 px-4 text-center text-xs text-zinc-500 dark:border-zinc-800">
        <div className="flex items-center justify-center gap-2 mb-2 font-black text-zinc-900 dark:text-white text-sm">
          <span>✂</span> BARBERPRO • SaaS PIEDECUESTA
        </div>
        <p className="text-[11px] text-zinc-400">
          Next.js 16 + React 19 + Supabase SSR + Tailwind CSS • Horario 8:00 a 20:00
        </p>
      </footer>
    </div>
  );
}
