# BarberPro — SaaS Piedecuesta

SaaS para barberías en Piedecuesta. Cliente reserva en 30s y barbero gestiona agenda en tiempo real. Validado Opción A (estadísticas) + Opción B (encuesta), 4 tablas Supabase, 16 pantallas Stitch, geolocalización + mapa Leaflet.

**Stack:** Next.js 16.3.4 + React 19 + Tailwind 4 + Supabase (lxegusogwngjqxeksmcw) + Leaflet + Vercel
**Alumno:** Juanda / Ruben Mendoza — 11-03 — Cliente caso: Ruben Mendoza
**Proyecto Supabase:** `lxegusogwngjqxeksmcw` (ver `.env.local` / `.env.example`)
**Deploy Vercel:** `https://barberpro-piedecuesta.vercel.app/` ✅ **¡LIVE!** (verificado 11/09/2026)

> **Por qué esta URL aquí:** El profe Ronald exige despliegue verificable (Fase 5). Sin URL pública no hay evidencia de CI/CD ni de que el SaaS corre fuera de tu localhost.
> **Para qué:** Para sustentar Live Coding, que el profe entre sin instalar nada, y que el QR del ticket apunte a prod. También es requisito de 8 commits + deploy.
> **Cómo se hizo:** `vercel.com → Import PANELITA29/barberpro-piedecuesta → env NEXT_PUBLIC_SUPABASE_URL/ANON_KEY → Deploy` (ver `docs/VERCEL_DEPLOY.md:10`) → Deploy OK en prod.

## Roles
- **Cliente:** descubre barberías por distancia (Haversine + GPS), elige barbero verificado, filtra servicios por categoría, reserva en 3 pasos (fecha/hora -> pago), recibe ticket QR y gestiona historial/cancelación.
- **Barbero:** agenda del día en Realtime, métricas ingresos COP, confirmar/cancelar/completar reservas, bloquear franjas (persistido 7 días), CRUD servicios (precio/duración/categoría/imagen_url).

## Tablas (supabase_schema.sql)
- `profiles` (id uuid PK -> auth.users, nombre, telefono, rol, avatar_url)
- `servicios` (id uuid PK, nombre, descripcion, precio, duracion_min, barbero_id FK, categoria, imagen_url, activo)
- `reservas` (id uuid PK, cliente_id, barbero_id, servicio_id, fecha_hora, estado, total, notas) + índice único anti doble-booking `(barbero_id, fecha_hora)` where estado in (pendiente,confirmada)
- `pagos` (id uuid PK, reserva_id UNIQUE FK, monto, metodo, estado_pago, referencia) — RLS completo (select/insert/update/delete)

Trigger `handle_new_user()` crea profile automáticamente. RLS: lectura pública servicios, escritura solo dueño; reservas/pagos solo involucrados.

## Correr
```bash
cp .env.example .env.local # pega anon key de lxegusogwngjqxeksmcw
npm install
npm run dev # http://localhost:3000
npm run build # verifica build
```

## Flujo
1. `/` landing con galería y mapa Piedecuesta → `Reservar Cita`
2. `/auth/login?rol=cliente&mode=register` → `/cliente/dashboard` → Descubrir sedes -> Elegir barbero -> Filtrar servicios -> `BookingModal` 3 pasos -> Ticket QR -> `Mis Citas`
3. `/auth/login?rol=barbero` → `/barbero/dashboard` → Realtime pulse -> Confirmar/Completar -> Bloquear horario -> `/barbero/servicios` CRUD

## Fixes críticos aplicados (sep 2026)
- IDs migrados a UUID válidos (`src/lib/geo.ts` BARBERO_IDS/SERVICIO_IDS)
- SQL sincronizado con `categoria/imagen_url/avatar_url/referencia` + RLS pagos update
- Anti doble-booking: constraint + validación en BookingModal (Supabase + localStorage + bloqueos)
- Date mutación corregida (clone antes de setHours)
- Barbero dashboard filtra `eq(barbero_id)` + bloqueos reales (localStorage `barberpro_bloqueos`)
- Mapa Leaflet reactivo a selección (setIcon dinámico) + cleanup correcto
- `.env.example` unificado a `lxegusogwngjqxeksmcw` + `next.config.ts` + `tsconfig target ES2022` + `loading/error/not-found`

## Deploy

**Por qué Vercel:**
Next.js 16 solo tiene deploy nativo en Vercel (creadores de Next). Cualquier otra plataforma te pide config extra. El profe pide `GitHub ≥8 commits + Vercel` como prueba de disciplina DevOps.

**Para qué:**
- URL pública 24/7 para que el cliente real (Ruben Mendoza) pruebe sin tu PC
- Realtime Supabase funciona con dominio prod (WS) no solo localhost
- Validas que `supabase_schema.sql` seed (3 barberos + 9 servicios) está en prod `lxegusogwngjqxeksmcw`

**Cómo (3 min):**
```bash
# 1. SQL ya lo hiciste: docs/supabase_schema.sql Run en Supabase ✅
# 2. Vercel import:
# - vercel.com → Add New → Project → Import PANELITA29/barberpro-piedecuesta
# - Env: NEXT_PUBLIC_SUPABASE_URL=https://lxegusogwngjqxeksmcw.supabase.co
#        NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc... (de .env.local:2)
# - Deploy → copia URL → pega arriba en README
```

## Docs
- `docs/BLUEPRINT_BARBERPRO.md` — Plan Fase 1 (stack Next 16)
- `docs/supabase_schema.sql:1` — SQL idempotente + seed UUIDs estables + RLS + trigger `handle_new_user()` **Por qué:** sin esto reservas fallan FK. **Para qué:** desplegar BD en 1 click. **Cómo:** SQL Editor → Run
- `docs/STITCH_PROMPTS_FASE2.md` — 16 prompts Stitch **Por qué:** prototipar antes de codear. **Para qué:** mobile-first validable. **Cómo:** stitch.withgoogle.com/projects/8682772906196520136
- `docs/ENCUESTA_GOOGLE_FORMS.md` — Opción B n=15 **Por qué:** Ronald no acepta suposiciones. **Para qué:** validar demanda. **Cómo:** crear Form → enviar a 15 → screenshot Resumen
- `docs/INFORME_ENTREGA_FINAL.md` — Todo el análisis + 15 fixes con `file:line`
- `docs/VERCEL_DEPLOY.md` / `docs/CHECKLIST_PROFE_RONALD.md` — Checklists Fase 1→6
- `BLUEPRINT_BARBERPRO_Ronald.pdf` — PDF final Opción A con capturas `docs/capturas/`
