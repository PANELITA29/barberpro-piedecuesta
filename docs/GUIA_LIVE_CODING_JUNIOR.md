# GUÍA LIVE CODING — BARBERPRO — Para Junior (Paso a Paso con cada línea explicada)

**Alumno:** Ruben Mendoza — 11-03  
**Profe:** Ronald — Fase 6 Sustentación  
**Objetivo:** Que cambies código EN VIVO sin ponerte nervioso, y que el profe vea que tú hiciste el SaaS.

> **Qué es Live Coding para Ronald:** Te abre tu repo en tu PC, te dice “cámbiale el color a rojo” o “agrégale un campo teléfono”, y tú lo haces frente a él en 2-3 minutos. No es examen de memoria, es probar que entiendes tu código.

---

## 0. PREPARACIÓN ANTES DE ENTRAR (5 min antes)

**Ten abierto ANTES de que llegue Ronald (no pierdas tiempo buscando):**

1. VS Code con `barberia/` abierto
2. Terminal 1: `npm run dev` ya corriendo → `http://localhost:3000` abierto en Chrome
3. Chrome pestañas:
   - `http://localhost:3000/` (landing)
   - `http://localhost:3000/cliente/dashboard`
   - `http://localhost:3000/barbero/dashboard`
   - `https://supabase.com/dashboard/project/lxegusogwngjqxeksmcw/editor` (Table Editor)
   - `https://barberpro-piedecuesta.vercel.app/` (prod por si falla local)
4. Archivos ya abiertos en VS Code (Ctrl+P y escribe):
   - `src/app/globals.css:8` (colores)
   - `src/lib/geo.ts:34` (barberos IDs)
   - `docs/supabase_schema.sql:19` (tablas)
   - `src/components/booking/BookingModal.tsx:135` (lógica reserva)

**Si te pone nervioso, respira y di:** “Profe, este archivo es X, esta línea hace Y, voy a cambiar Z y probamos”.

---

## 1. DESAFÍO MÁS PROBABLE: “Cámbiale el color principal a rojo” (30 segundos)

**Por qué lo pide:** Es lo más rápido para ver si sabes Tailwind y dónde viven los colores.  
**Para qué:** Probar que no es plantilla descargada.  
**Cómo:**

### Archivo: `src/app/globals.css:8`
```css
:root {
  --background: #ffffff;
  --foreground: #111827;
  --primary: #111827;
  --accent: #F59E0B; /* ← ESTA LÍNEA ES EL NARANJA BARBERPRO */
  --accent-hover: #D97706;
}
```
**Línea por línea:**
- `:root` = variables globales, se usan en toda la app. Si cambias aquí, cambia en TODAS partes (botones, badges, mapa).
- `--accent: #F59E0B;` = el naranja ámbar que ves en botones `bg-amber-500`. Es el color de la marca.

**Qué haces en vivo:**
1. Cambia `#F59E0B` por `#DC2626` (rojo) y `#D97706` por `#991B1B` (rojo oscuro hover)
2. Guarda `Ctrl+S`
3. Ve a `http://localhost:3000` y recarga `F5` → todos los botones naranja ahora son rojos

**Qué decir:** “Profe, cambié la variable CSS global, por eso toda la app se pintó rojo sin tocar 100 archivos”.

**Si te dice “reviértelo”:** `Ctrl+Z` y guarda.

**Tiempo:** 30 segundos. **Riesgo:** Ninguno.

---

## 2. DESAFÍO PROBABLE: “Agrégale un campo WhatsApp al servicio” (3 min)

**Por qué lo pide:** Probar que sabes BD + frontend.  
**Para qué:** Ver si entiendes Supabase y tipos TypeScript.  
**Cómo en 3 capas:**

### Capa A: BD — `docs/supabase_schema.sql:19`
```sql
create table if not exists public.servicios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  precio integer not null,
  duracion_min integer not null default 30,
  barbero_id uuid references public.profiles(id) on delete cascade,
  activo boolean default true,
  categoria text,      -- ← ya agregamos esta
  imagen_url text,     -- ← ya agregamos esta
  -- AGREGAR AQUÍ:
  whatsapp text,       -- ← NUEVO CAMPO que te puede pedir
  created_at timestamp with time zone default now()
);
```
**Línea por línea:**
- `whatsapp text,` = nueva columna tipo texto (puede ser null). Si pones `text not null` obligas a que siempre tenga valor (no lo hagas).

**Qué haces:**
1. Abajo, agrega: `alter table public.servicios add column if not exists whatsapp text;` `sql:33`
2. Ve a Supabase → SQL Editor → pega solo esa línea → Run → verifica en Table Editor que aparece columna `whatsapp`

### Capa B: Tipos — `src/types/database.ts:32`
```typescript
export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion_min: number;
  barbero_id: string | null;
  activo: boolean;
  categoria?: string | null;  // ← ya existe
  imagen_url?: string | null; // ← ya existe
  whatsapp?: string | null;   // ← AGREGAR ESTA LÍNEA
  created_at: string;
}
```
**Por qué:** Si no agregas aquí, TypeScript te dirá `Property whatsapp does not exist` aunque la BD ya lo tenga.

### Capa C: UI — `src/app/barbero/servicios/page.tsx:28` (form crear servicio)
```typescript
const [whatsapp, setWhatsapp] = useState("");
```
Y en el form `page.tsx:366` agrega:
```tsx
<div>
  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
    WhatsApp del servicio
  </label>
  <input
    type="text"
    value={whatsapp}
    onChange={(e) => setWhatsapp(e.target.value)}
    placeholder="Ej: 315 123 4567"
    className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs ..."
  />
</div>
```
Y en `handleSave` `page.tsx:103` agrega al payload:
```typescript
const payload = {
  nombre: nombre.trim(),
  whatsapp: whatsapp.trim() || null, // ← nuevo
  // ...resto
};
```

**Qué decir:** “Profe, toqué 3 capas: BD, tipos y UI, por eso el campo persiste y no da error”.

---

## 3. DESAFÍO: “Cambia una regla RLS para que solo barberos vean servicios” (2 min)

**Por qué lo pide:** Es lo más “backend” que puede pedir.  
**Para qué:** Probar que entiendes seguridad Row Level Security.  
**Archivo:** `docs/supabase_schema.sql:88`

**Actual (todos pueden ver servicios):**
```sql
create policy "servicios_select_all" on public.servicios for select using (true);
```
`using (true)` = cualquiera, sin login, puede leer. Es para que cliente vea catálogo sin loguearse.

**Si te pide “solo barberos”:**
```sql
drop policy if exists "servicios_select_all" on public.servicios;
create policy "servicios_select_barberos" on public.servicios for select using (
  exists (select 1 from public.profiles where id = auth.uid() and rol = 'barbero')
);
```
**Línea por línea:**
- `drop policy if exists` = borra la vieja para no duplicar
- `using (exists (...))` = solo si tu `profiles.rol` es `barbero` te deja ver

**Qué haces:**
1. Edita el archivo, guarda
2. Copia esas 2 líneas → Supabase SQL Editor → Run
3. Prueba: sin login, `/cliente/dashboard` ya no muestra servicios (falla a propósito) → revierte a `using (true)` y Run de nuevo

**Qué decir:** “RLS es el guardia de Supabase, con `using` decido quién ve qué”.

---

## 4. DESAFÍO: “Agrega una categoría nueva ‘Tinte’” (1 min)

**Archivo:** `src/app/barbero/servicios/page.tsx:419`
```tsx
<select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
  <option value="Corte">Corte de Cabello</option>
  <option value="Barba">Barba / Afeitado</option>
  <option value="Combo">Combo / Paquete</option>
  <option value="Tratamiento">Tratamiento / Facial</option>
  <option value="Tinte">Tinte / Color</option> {/* ← AGREGAR */}
</select>
```
Y en `src/lib/geo.ts:72` (si quieres que aparezca en filtro cliente):
```typescript
// No hay que tocar nada, el filtro ya es dinámico: categoriasDisponibles se genera de s.categoria
```

**Prueba:** Ve a `/barbero/servicios` → Nuevo Servicio → ahora sale Tinte.

---

## 5. DESAFÍO: “Agranda el border radius / spacing” (30s)

**Archivo:** `src/app/globals.css` o cualquier `rounded-2xl`
- Cambia `rounded-2xl` por `rounded-3xl` en `src/components/CardServicio.tsx:27`
- Guarda → ve el card más redondo en `/cliente/dashboard`

**Qué decir:** “Tailwind es clases, 2xl=16px, 3xl=24px”.

---

## 6. CHEAT SHEET DE COMANDOS (tenlo en post-it)

```bash
npm run dev       # prende local
npm run build     # verifica que no rompiste tipos
npx tsc --noEmit  # solo verifica tipos sin build
git add .; git commit -m "live: cambio color a rojo"; git push origin main # si te pide commitear
```

---

## 7. QUÉ DECIR MIENTRAS CODEAS (script para no quedarte mudo)

1. “Profe, este archivo es `globals.css:8`, aquí vive el color global, lo cambio a rojo...”
2. “Guardo y recargo localhost:3000... mire, ya se pintó”
3. “Si lo quiere revertir, Ctrl+Z y listo”

**Nunca digas:** “No sé”, “Creo que es aquí”. Di: “Este es el archivo que maneja X, lo verificamos juntos”.

---

## 8. QUÉ NO HACES NUNCA

- No toques `.env.local` en vivo (rompes Supabase)
- No borres `node_modules`
- No hagas `git reset --hard` sin backup
- No inventes código a lo loco: si no sabes, di “ese cambio toca 3 archivos: BD, tipo y UI, lo haría así...”

---

## 9. FINAL: Qué tener listo para sacar 5.0

- [ ] Laptop cargada + cargador
- [ ] `npm run dev` ya corriendo
- [ ] 4 pestañas Chrome abiertas (ver arriba)
- [ ] VS Code con 4 archivos abiertos
- [ ] PDF `BLUEPRINT_BARBERPRO_Ronald.pdf` abierto en otra ventana por si pide teoría
- [ ] Celular con `https://barberpro-piedecuesta.vercel.app/` por si falla WiFi local

**Si te pide algo que no está en esta guía, respira y aplica la misma lógica:** 1) ¿Es visual? → `globals.css` o componente 2) ¿Es dato? → `supabase_schema.sql` + `database.ts` + UI 3) ¿Es permiso? → `supabase_schema.sql` policies.

¡Rómpela, Junior!
