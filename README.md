# BarberPro — SaaS Piedecuesta

SaaS para barberías en Piedecuesta. Cliente reserva en 30s y barbero gestiona agenda en tiempo real. Validado Opción A (estadísticas) + Opción B (encuesta), 4 tablas Supabase, 16 pantallas Stitch, geolocalización + mapa Leaflet.

**Stack:** Next.js 16.3.4 + React 19 + Tailwind 4 + Supabase (lxegusogwngjqxeksmcw) + Leaflet + Vercel
**Alumno:** Juanda / Ruben Mendoza — 11-03 — Cliente caso: Ruben Mendoza
**Proyecto Supabase:** `lxegusogwngjqxeksmcw` (ver `.env.local` / `.env.example`)

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

## Docs
- `docs/BLUEPRINT_BARBERPRO.md` — Plan Fase 1 (stack actualizado a Next.js 16)
- `docs/supabase_schema.sql` — SQL idempotente + seed comentado
- `docs/STITCH_PROMPTS_FASE2.md` — 16 prompts Mobile-first
- `docs/ENCUESTA_GOOGLE_FORMS.md` — Instrumento Opción B
