import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFCF9] dark:bg-zinc-950 px-4">
      <div className="max-w-md w-full rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 text-center shadow-xl">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-zinc-900 text-amber-500 flex items-center justify-center font-black">✂</div>
        <h2 className="mt-3 text-2xl font-black text-zinc-900 dark:text-white">404 — No encontrado</h2>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">La página que buscas no existe o fue movida.</p>
        <Link href="/" className="mt-5 inline-flex rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-600 transition">Volver al inicio</Link>
      </div>
    </div>
  );
}
