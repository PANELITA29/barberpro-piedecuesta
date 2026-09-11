# Vercel Deploy — BarberPro

## 1. Supabase (una sola vez)
1. Entra a https://supabase.com/dashboard/project/lxegusogwngjqxeksmcw
2. SQL Editor → New query → pegar **todo** `docs/supabase_schema.sql` → Run
   - Es idempotente (`if not exists`, `on conflict do update`)
   - Crea 4 tablas + RLS + trigger + 3 barberos demo + 9 servicios demo con UUIDs estables (`src/lib/geo.ts` BARBERO_IDS)
3. Verifica Table Editor → deben verse `profiles`, `servicios`, `reservas`, `pagos` + 3 filas en profiles y 9 en servicios
4. Auth → Users → copia `anon key` si no la tienes (ver `.env.local`)

## 2. Env (Vercel)
- `NEXT_PUBLIC_SUPABASE_URL=https://lxegusogwngjqxeksmcw.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (de `.env.local:2`)

## 3. Git
```bash
git add .
git commit -m "fix: UUIDs estables, RLS pagos, anti doble-booking, mapa reactivo, bloqueos reales"
git push origin main
```

## 4. Vercel Import
- vercel.com → Add New Project → Import `barberia` repo
- Framework: Next.js (auto)
- Root: `.`
- Build cmd: `npm run build` (ya probado 24s)
- Output: `.next`
- Node: 20.x

## 5. Smoke Test Prod
- `/` landing OK
- `/auth/login?rol=cliente` Demo Cliente → `/cliente/dashboard` → reservar 09:00 → Ticket → Mis Citas
- En otro navegador `/auth/login?rol=barbero` Demo Barbero → `/barbero/dashboard` debe ver reserva por Realtime → Confirmar
- `/barbero/servicios` crear servicio → ver en cliente dashboard tras refresh (si barbero_id coincide, sino visible global por `select true`)

## 6. Notas
- `middleware.ts` warning `proxy` es solo deprecation, no bloquea deploy
- `public/images/*` 15 fotos ya en repo, no necesita storage externo
- Si reservas fallan FK, revisa que `supabase_schema.sql` seed haya corrido (barberos demo)
