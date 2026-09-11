"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFCF9] dark:bg-zinc-950 px-4">
      <div className="max-w-md w-full rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 text-center shadow-xl">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center text-xl">⚠️</div>
        <h2 className="mt-3 text-lg font-black text-zinc-900 dark:text-white">Algo salió mal</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{error.message || "Error inesperado en BarberPro."}</p>
        <div className="mt-5 flex gap-2 justify-center">
          <button onClick={reset} className="rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-600 transition">Reintentar</button>
          <a href="/" className="rounded-2xl border border-zinc-200 px-5 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300">Ir al inicio</a>
        </div>
      </div>
    </div>
  );
}
