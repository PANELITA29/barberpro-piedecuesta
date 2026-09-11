export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFCF9] dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-zinc-900 text-amber-500 flex items-center justify-center font-black animate-pulse">✂</div>
        <div className="h-6 w-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-zinc-500">Cargando BarberPro...</p>
      </div>
    </div>
  );
}
