"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Modal } from "@/components/ui/Modal";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Servicio } from "@/types/database";
import Link from "next/link";

export default function ServiciosPage() {
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  // Estados de servicios
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Estados de modal Crear/Editar
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [duracionMin, setDuracionMin] = useState("30");
  const [categoria, setCategoria] = useState("Corte");
  const [activo, setActivo] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal eliminar
  const [servicioToDelete, setServicioToDelete] = useState<Servicio | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Cargar servicios desde Supabase
  const fetchServicios = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("servicios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al leer servicios:", error);
      } else if (data) {
        setServicios(data as Servicio[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    let ignore = false;
    async function init() {
      await fetchServicios();
    }
    if (!ignore) {
      init();
    }
    return () => {
      ignore = true;
    };
  }, [fetchServicios]);

  // Abrir modal para crear
  const openCreateModal = () => {
    setEditingServicio(null);
    setNombre("");
    setDescripcion("");
    setPrecio("");
    setDuracionMin("30");
    setCategoria("Corte");
    setActivo(true);
    setShowFormModal(true);
  };

  // Abrir modal para editar
  const openEditModal = (s: Servicio) => {
    setEditingServicio(s);
    setNombre(s.nombre);
    setDescripcion(s.descripcion || "");
    setPrecio(s.precio.toString());
    setDuracionMin(s.duracion_min.toString());
    setCategoria(s.categoria || "Corte");
    setActivo(s.activo);
    setShowFormModal(true);
  };

  // Guardar (Crear o Actualizar)
  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !precio) return;
    setSaving(true);
    setFeedbackMsg(null);

    try {
      const currentUserId = user?.id || null;
      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        precio: Number(precio),
        duracion_min: Number(duracionMin) || 30,
        categoria,
        activo,
        barbero_id: currentUserId,
      };

      if (editingServicio) {
        // UPDATE
        const { error } = await supabase
          .from("servicios")
          .update(payload as never)
          .eq("id", editingServicio.id);

        if (error) {
          setFeedbackMsg({ text: `Error al actualizar: ${error.message}`, type: "error" });
        } else {
          setFeedbackMsg({ text: `Servicio "${nombre}" actualizado con éxito ✓`, type: "success" });
          setShowFormModal(false);
          fetchServicios();
        }
      } else {
        // CREATE
        const { error } = await supabase.from("servicios").insert([payload] as never);

        if (error) {
          setFeedbackMsg({ text: `Error al crear: ${error.message}`, type: "error" });
        } else {
          setFeedbackMsg({ text: `¡Servicio "${nombre}" creado exitosamente! ✓`, type: "success" });
          setShowFormModal(false);
          fetchServicios();
        }
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ text: "Error inesperado al guardar el servicio.", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  // Toggle Activo/Pausado rápido
  async function toggleActivo(s: Servicio) {
    try {
      const { error } = await supabase
        .from("servicios")
        .update({ activo: !s.activo } as never)
        .eq("id", s.id);

      if (!error) {
        fetchServicios();
        setFeedbackMsg({
          text: `Servicio ${!s.activo ? "activado" : "pausado"} ✓`,
          type: "success",
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Confirmar Eliminación
  async function handleDelete() {
    if (!servicioToDelete) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("servicios")
        .delete()
        .eq("id", servicioToDelete.id);

      if (error) {
        setFeedbackMsg({ text: `Error al eliminar: ${error.message}`, type: "error" });
      } else {
        setFeedbackMsg({ text: "Servicio eliminado de la base de datos ✓", type: "success" });
        setServicioToDelete(null);
        fetchServicios();
      }
    } catch (err) {
      console.error(err);
      setFeedbackMsg({ text: "Error inesperado al eliminar.", type: "error" });
    } finally {
      setDeleting(false);
    }
  }

  // Filtrar
  const serviciosFiltrados = useMemo(() => {
    return servicios.filter(
      (s) =>
        s.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.descripcion && s.descripcion.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [servicios, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FCFCF9] dark:bg-zinc-950 pb-16">
      <Navbar rol="barbero" />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 px-3 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 shadow-sm mb-2">
              <span>✂️</span> Gestión de Menú y Catálogo
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              Mis Servicios ({servicios.length})
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Crea, actualiza precios, duraciones o pausa servicios de tu barbería.
            </p>
          </div>

          <div className="flex gap-2 self-start sm:self-auto">
            <Link
              href="/barbero/dashboard"
              className="rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 transition"
            >
              ← Ver Agenda
            </Link>
            <button
              onClick={openCreateModal}
              className="rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-600 shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>+</span> Nuevo Servicio
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`mt-4 rounded-2xl p-4 text-xs font-semibold flex items-center justify-between border ${
              feedbackMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button onClick={() => setFeedbackMsg(null)} className="font-bold opacity-70 hover:opacity-100">
              ✕
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="mt-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Buscar por nombre o descripción..."
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-xs outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"
          />
        </div>

        {/* Services List Grid */}
        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : serviciosFiltrados.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:bg-zinc-900 dark:border-zinc-800">
              <span className="text-4xl mb-2 block">✂️</span>
              <p className="font-black text-zinc-900 dark:text-white text-sm">
                No hay servicios registrados
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Agrega el primer servicio para que tus clientes puedan reservar.
              </p>
              <button
                onClick={openCreateModal}
                className="mt-4 rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-amber-600 shadow-md transition"
              >
                + Crear Primer Servicio
              </button>
            </div>
          ) : (
            serviciosFiltrados.map((s) => (
              <div
                key={s.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border p-4 sm:p-5 transition-all ${
                  s.activo
                    ? "border-zinc-200/80 bg-white dark:bg-zinc-900 dark:border-zinc-800 shadow-sm"
                    : "border-zinc-200 bg-zinc-50/70 dark:bg-zinc-950 dark:border-zinc-800 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-amber-500 flex items-center justify-center font-black text-lg dark:bg-zinc-800 shadow-sm flex-shrink-0">
                    ✂
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                        {s.nombre}
                      </h4>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          s.activo
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {s.activo ? "Activo" : "Pausado"}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="font-black text-amber-600 dark:text-amber-400 text-sm">
                        ${s.precio.toLocaleString("es-CO")} COP
                      </span>{" "}
                      • {s.duracion_min} min • Categoria: {s.categoria || "Corte"}
                    </p>

                    {s.descripcion && (
                      <p className="text-[11px] text-zinc-400">{s.descripcion}</p>
                    )}
                  </div>
                </div>

                {/* Control Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => toggleActivo(s)}
                    className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 transition"
                    title={s.activo ? "Pausar servicio" : "Activar servicio"}
                  >
                    {s.activo ? "⏸️ Pausar" : "▶️ Activar"}
                  </button>
                  <button
                    onClick={() => openEditModal(s)}
                    className="rounded-xl bg-zinc-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-sm transition"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => setServicioToDelete(s)}
                    className="rounded-xl border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400 transition"
                  >
                    🗑️ Borrar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* MODAL 1: FORMULARIO CREAR / EDITAR SERVICIO */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={editingServicio ? "Editar Servicio" : "Crear Nuevo Servicio"}
        subtitle="Configura los detalles que verán tus clientes al reservar"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
              Nombre del Servicio *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Corte Clásico + Barba VIP"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                Precio (COP) *
              </label>
              <input
                type="number"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="15000"
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                Duración (Minutos)
              </label>
              <select
                value={duracionMin}
                onChange={(e) => setDuracionMin(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-amber-500 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
              >
                <option value="15">15 min (Rápido / Cejas)</option>
                <option value="30">30 min (Corte Estándar)</option>
                <option value="45">45 min (Corte + Barba)</option>
                <option value="60">60 min (Combo Full VIP)</option>
                <option value="90">90 min (Tratamiento Completo)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                Categoría
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-amber-500 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
              >
                <option value="Corte">Corte de Cabello</option>
                <option value="Barba">Barba / Afeitado</option>
                <option value="Combo">Combo / Paquete</option>
                <option value="Tratamiento">Tratamiento / Facial</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-2">
                Estado Inicial
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 h-4 w-4"
                />
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Visible en Catálogo
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
              Descripción Opcional
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles sobre lo que incluye este servicio..."
              rows={2}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs outline-none focus:border-amber-500 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setShowFormModal(false)}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-white hover:bg-amber-600 shadow-md transition disabled:opacity-50"
            >
              {saving ? "Guardando..." : editingServicio ? "Guardar Cambios ✓" : "Crear Servicio ✓"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: CONFIRMAR ELIMINACIÓN */}
      <Modal
        isOpen={!!servicioToDelete}
        onClose={() => setServicioToDelete(null)}
        title="¿Eliminar Servicio?"
        subtitle="Esta acción no se puede deshacer"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            ¿Estás seguro de que deseas eliminar permanentemente el servicio{" "}
            <b>&ldquo;{servicioToDelete?.nombre}&rdquo;</b> de la base de datos de Supabase?
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setServicioToDelete(null)}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
            >
              {deleting ? "Eliminando..." : "Sí, Eliminar"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
