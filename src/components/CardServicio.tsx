export function CardServicio({ nombre, precio, duracion, onReservar }: { nombre: string; precio: number; duracion: number; onReservar?: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border bg-white p-4 dark:bg-zinc-900">
      <div>
        <p className="font-bold">{nombre}</p>
        <p className="text-sm text-zinc-500">{duracion} min • ${precio.toLocaleString("es-CO")} COP</p>
      </div>
      <button onClick={onReservar} className="rounded-full bg-amber-500 px-5 py-2 text-sm font-bold text-white hover:bg-amber-600">Reservar</button>
    </div>
  );
}
