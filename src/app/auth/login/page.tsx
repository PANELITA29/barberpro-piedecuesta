"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { UserRole } from "@/types/database";

function AuthForm() {
  const searchParams = useSearchParams();
  const initialRol = (searchParams.get("rol") as UserRole) || "cliente";
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [rol, setRol] = useState<UserRole>(initialRol);
  
  // Campos
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Estados de interfaz
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === "register") {
        if (!nombre.trim()) {
          setErrorMsg("Por favor ingresa tu nombre completo.");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nombre: nombre.trim(),
              telefono: telefono.trim() || null,
              rol,
            },
          },
        });

        if (error) {
          setErrorMsg(error.message);
          setLoading(false);
          return;
        }

        setSuccessMsg(
          data.session
            ? "¡Cuenta creada con éxito! Redirigiendo..."
            : "¡Registro exitoso! Por favor verifica tu correo para activar tu cuenta o inicia sesión."
        );

        setTimeout(() => {
          if (rol === "barbero") {
            router.push("/barbero/dashboard");
          } else {
            router.push("/cliente/dashboard");
          }
        }, 1200);
      } else {
        // Modo Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(
            error.message.includes("Invalid login credentials")
              ? "Credenciales incorrectas. Verifica tu correo y contraseña o regístrate."
              : error.message
          );
          setLoading(false);
          return;
        }

        // Obtener el rol del perfil del usuario para redirigir
        const { data: profile } = await supabase
          .from("profiles")
          .select("rol")
          .eq("id", data.user.id)
          .single();

        const typedProfile = profile as { rol?: UserRole } | null;
        const targetRol = typedProfile?.rol || data.user.user_metadata?.rol || rol;
        setSuccessMsg("¡Sesión iniciada correctamente! Entrando...");

        setTimeout(() => {
          if (targetRol === "barbero") {
            router.push("/barbero/dashboard");
          } else {
            router.push("/cliente/dashboard");
          }
        }, 800);
      }
    } catch (err) {
      setErrorMsg("Ocurrió un error inesperado. Inténtalo nuevamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Acceso asistido para demostraciones / sustentación
  const fillDemo = (targetRol: UserRole) => {
    setRol(targetRol);
    setEmail(targetRol === "barbero" ? "carlos.barbero@barberpro.com" : "juan.cliente@barberpro.com");
    setPassword("barberpro123456");
  };

  return (
    <div className="w-full max-w-[420px] rounded-3xl bg-white p-7 sm:p-8 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl backdrop-blur-md">
      {/* Brand Header */}
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-zinc-900 text-amber-500 flex items-center justify-center font-black text-xl shadow-md dark:bg-white">
          ✂
        </div>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
          BARBERPRO
        </h1>
        <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mt-0.5">
          SaaS Piedecuesta
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          {mode === "login" ? "Accede a tu panel y gestiona tus reservas" : "Crea tu cuenta en menos de 1 minuto"}
        </p>
      </div>

      {/* Mode Switch (Login / Registro) */}
      <div className="mt-6 flex rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-800/80">
        <button
          type="button"
          onClick={() => { setMode("login"); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
            mode === "login"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          onClick={() => { setMode("register"); setErrorMsg(null); setSuccessMsg(null); }}
          className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
            mode === "register"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
              : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400"
          }`}
        >
          Crear Cuenta
        </button>
      </div>

      {/* Role Selector */}
      <div className="mt-4">
        <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
          Soy:
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRol("cliente")}
            className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs font-bold transition-all ${
              rol === "cliente"
                ? "border-amber-500 bg-amber-50/50 text-amber-950 dark:bg-amber-950/20 dark:text-amber-200 dark:border-amber-500"
                : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            }`}
          >
            <span>🧔</span> Cliente
          </button>
          <button
            type="button"
            onClick={() => setRol("barbero")}
            className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs font-bold transition-all ${
              rol === "barbero"
                ? "border-amber-500 bg-amber-50/50 text-amber-950 dark:bg-amber-950/20 dark:text-amber-200 dark:border-amber-500"
                : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            }`}
          >
            <span>✂️</span> Barbero Pro
          </button>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleAuth} className="mt-4 space-y-3">
        {mode === "register" && (
          <>
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej. 315 123 4567"
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
              />
            </div>
          </>
        )}

        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Correo Electrónico *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Contraseña *
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:bg-zinc-950 dark:border-zinc-800 dark:text-white"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">
            ✓ {successMsg}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 rounded-2xl bg-amber-500 py-3 text-sm font-bold text-white shadow-md hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-60 transition-all cursor-pointer"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Procesando...
            </span>
          ) : mode === "login" ? (
            `Ingresar como ${rol === "barbero" ? "Barbero" : "Cliente"} →`
          ) : (
            `Registrarme como ${rol === "barbero" ? "Barbero" : "Cliente"} ✓`
          )}
        </button>
      </form>

      {/* Demo Fast Access Pill */}
      <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800 text-center">
        <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
          Acceso Rápido / Demostración:
        </p>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => fillDemo("cliente")}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            Demo Cliente
          </button>
          <button
            type="button"
            onClick={() => fillDemo("barbero")}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
          >
            Demo Barbero
          </button>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mt-4 flex justify-between items-center text-xs text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-amber-600 transition">
          ← Volver al Inicio
        </Link>
        <span className="text-[11px] text-zinc-400">Supabase Auth + RLS 🔒</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFCF9] dark:bg-zinc-950 px-4 py-12">
      {/* Signature Barber Pole Top */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,#DC2626_0_14px,white_14px_28px,#111827_28px_42px)] dark:opacity-80 z-50" />
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12 text-sm text-zinc-500">
            <span className="h-6 w-6 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mr-3" />
            Cargando BarberPro...
          </div>
        }
      >
        <AuthForm />
      </Suspense>
    </div>
  );
}
