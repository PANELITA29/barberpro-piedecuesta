# BarberPro — SaaS Piedecuesta

SaaS para barberías. Cliente reserva y barbero gestiona agenda. Validado Opción A (estadísticas), 4 tablas Supabase, 16 pantallas Stitch.

**Stack:** Next.js 16 + Tailwind + Supabase (lxegusogwngjqxeksmcw) + Vercel
**Alumno:** Juanda — 11-03 — Cliente caso: Ruben Mendoza

## Roles
- Cliente: catálogo, reserva, historial
- Barbero: agenda, confirmar/cancelar, CRUD servicios

## Tablas
profiles (auth.users), servicios, reservas, pagos — RLS activo

## Correr
```bash
cp .env.example .env.local # pega anon key
npm install
npm run dev # http://localhost:3000
```

## Flujo
1. /auth/login?rol=cliente → /cliente/dashboard → Reservar
2. /auth/login?rol=barbero → /barbero/dashboard → Confirmar → /barbero/servicios CRUD
