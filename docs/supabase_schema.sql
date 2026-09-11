-- BARBERPRO SaaS - Schema para Supabase
-- Proyecto: lxegusogwngjqxeksmcw (ver .env.local)
-- Ejecutar en SQL Editor de Supabase

-- 1. TABLA PROFILES (extiende auth.users con roles)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  telefono text,
  rol text not null check (rol in ('cliente','barbero','admin')),
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Migración: añadir avatar_url si la tabla ya existía sin ella
alter table public.profiles add column if not exists avatar_url text;

-- 2. TABLA SERVICIOS
create table if not exists public.servicios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  precio integer not null, -- en COP
  duracion_min integer not null default 30,
  barbero_id uuid references public.profiles(id) on delete cascade,
  activo boolean default true,
  categoria text,
  imagen_url text,
  created_at timestamp with time zone default now()
);

-- Migración: añadir columnas si la tabla ya existía
alter table public.servicios add column if not exists categoria text;
alter table public.servicios add column if not exists imagen_url text;

-- 3. TABLA RESERVAS (tabla central)
create table if not exists public.reservas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.profiles(id) on delete cascade,
  barbero_id uuid not null references public.profiles(id) on delete cascade,
  servicio_id uuid not null references public.servicios(id) on delete restrict,
  fecha_hora timestamp with time zone not null,
  estado text not null default 'pendiente' check (estado in ('pendiente','confirmada','cancelada','completada')),
  total integer not null,
  notas text,
  created_at timestamp with time zone default now()
);

-- 4. TABLA PAGOS
create table if not exists public.pagos (
  id uuid primary key default gen_random_uuid(),
  reserva_id uuid not null unique references public.reservas(id) on delete cascade,
  monto integer not null,
  metodo text not null check (metodo in ('efectivo','nequi','tarjeta','transferencia')),
  estado_pago text not null default 'pendiente' check (estado_pago in ('pendiente','pagado','fallido')),
  referencia text,
  created_at timestamp with time zone default now()
);

alter table public.pagos add column if not exists referencia text;

-- INDICES
create index if not exists idx_reservas_cliente on public.reservas(cliente_id);
create index if not exists idx_reservas_barbero on public.reservas(barbero_id);
create index if not exists idx_reservas_fecha on public.reservas(fecha_hora);
create index if not exists idx_reservas_barbero_fecha on public.reservas(barbero_id, fecha_hora);
create index if not exists idx_servicios_barbero on public.servicios(barbero_id);
create index if not exists idx_servicios_categoria on public.servicios(categoria);

-- PREVENIR DOBLE-BOOKING: un barbero no puede tener 2 reservas activas a la misma hora exacta
-- Nota: para granularidad de slots de 30min, esta constraint evita colisión exacta; la validación de solapamiento se hace en app
create unique index if not exists idx_reservas_barbero_fecha_unique on public.reservas(barbero_id, fecha_hora) where (estado in ('pendiente','confirmada'));

-- RLS
alter table public.profiles enable row level security;
alter table public.servicios enable row level security;
alter table public.reservas enable row level security;
alter table public.pagos enable row level security;

-- Policies profiles: todos pueden ver, solo dueño edita
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Policies servicios: lectura publica, solo barbero crea/edita los suyos
drop policy if exists "servicios_select_all" on public.servicios;
create policy "servicios_select_all" on public.servicios for select using (true);
drop policy if exists "servicios_insert_barbero" on public.servicios;
create policy "servicios_insert_barbero" on public.servicios for insert with check (auth.uid() = barbero_id);
drop policy if exists "servicios_update_barbero" on public.servicios;
create policy "servicios_update_barbero" on public.servicios for update using (auth.uid() = barbero_id);
drop policy if exists "servicios_delete_barbero" on public.servicios;
create policy "servicios_delete_barbero" on public.servicios for delete using (auth.uid() = barbero_id);

-- Policies reservas: cliente ve/inserta las suyas, barbero ve las suyas
drop policy if exists "reservas_select_own" on public.reservas;
create policy "reservas_select_own" on public.reservas for select using (auth.uid() = cliente_id or auth.uid() = barbero_id);
drop policy if exists "reservas_insert_cliente" on public.reservas;
create policy "reservas_insert_cliente" on public.reservas for insert with check (auth.uid() = cliente_id);
drop policy if exists "reservas_update_involved" on public.reservas;
create policy "reservas_update_involved" on public.reservas for update using (auth.uid() = cliente_id or auth.uid() = barbero_id);
drop policy if exists "reservas_delete_involved" on public.reservas;
create policy "reservas_delete_involved" on public.reservas for delete using (auth.uid() = cliente_id or auth.uid() = barbero_id);

-- Policies pagos: solo involucrados en la reserva
drop policy if exists "pagos_select_involved" on public.pagos;
create policy "pagos_select_involved" on public.pagos for select using (
  exists (select 1 from public.reservas r where r.id = pagos.reserva_id and (r.cliente_id = auth.uid() or r.barbero_id = auth.uid()))
);
drop policy if exists "pagos_insert_cliente" on public.pagos;
create policy "pagos_insert_cliente" on public.pagos for insert with check (
  exists (select 1 from public.reservas r where r.id = pagos.reserva_id and r.cliente_id = auth.uid())
);
drop policy if exists "pagos_update_involved" on public.pagos;
create policy "pagos_update_involved" on public.pagos for update using (
  exists (select 1 from public.reservas r where r.id = pagos.reserva_id and (r.cliente_id = auth.uid() or r.barbero_id = auth.uid()))
) with check (
  exists (select 1 from public.reservas r where r.id = pagos.reserva_id and (r.cliente_id = auth.uid() or r.barbero_id = auth.uid()))
);
drop policy if exists "pagos_delete_involved" on public.pagos;
create policy "pagos_delete_involved" on public.pagos for delete using (
  exists (select 1 from public.reservas r where r.id = pagos.reserva_id and (r.cliente_id = auth.uid() or r.barbero_id = auth.uid()))
);

-- TRIGGER: auto-crear profile al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nombre, telefono, rol, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1)),
    new.raw_user_meta_data->>'telefono',
    coalesce(new.raw_user_meta_data->>'rol','cliente'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- SEED PARA DEMO SUSTENTACIÓN (ejecutar DESPUÉS de crear tablas)
-- Inserta barberos mock con UUIDs estables de src/lib/geo.ts
-- Para que el FK de reservas no falle aunque no existan en auth.users,
-- primero se elimina la FK restrictiva y se permite inserts demo.
-- ============================================================

-- Permitir perfiles demo sin FK a auth.users (opcional, comentar si quieres FK estricta)
alter table public.profiles drop constraint if exists profiles_id_fkey;

-- Insertar barberos verificados (on conflict do nothing para re-ejecutar)
insert into public.profiles (id, nombre, telefono, rol, avatar_url) values
  ('e7249fb1-3896-4c15-a69f-8d9d25b56fbf', 'Carlos Mendoza', '315 123 4567', 'barbero', '/images/barbero_carlos.jpg'),
  ('8dd0cb28-140c-4cc0-a408-26d60c5dabf6', 'Andrés Silva', '315 987 6543', 'barbero', '/images/barbero_andres.jpg'),
  ('bdc11a99-83d7-47de-8eac-17575513b131', 'Mateo Gómez', '316 789 0123', 'barbero', '/images/barbero_mateo.jpg')
on conflict (id) do update set nombre = excluded.nombre, telefono = excluded.telefono, rol = excluded.rol, avatar_url = excluded.avatar_url;

-- Insertar servicios demo asociados a cada barbero
insert into public.servicios (id, nombre, descripcion, precio, duracion_min, barbero_id, categoria, imagen_url, activo) values
  ('1c2073a6-7043-4615-a111-e03843cee7af', 'Corte Clásico & Skin Fade', 'Degradado ultra limpio a tijera y máquina con navaja, acabado mate y peinado.', 18000, 30, 'e7249fb1-3896-4c15-a69f-8d9d25b56fbf', 'Corte', '/images/corte_clasico.jpg', true),
  ('e4fb1341-9e15-4973-867d-721296b66af6', 'Diseño Freestyle & Líneas Artísticas', 'Corte degradado con diseño geométrico o líneas tribales personalizadas a navaja.', 22000, 40, 'e7249fb1-3896-4c15-a69f-8d9d25b56fbf', 'Corte', '/images/corte_clasico.jpg', true),
  ('b282003f-63ec-42b0-815f-766a7736be28', 'Combo Full VIP (Corte + Barba + Cejas)', 'Renovación total: Skin fade, barba esculpida, diseño de cejas y mascarilla black.', 28000, 50, 'e7249fb1-3896-4c15-a69f-8d9d25b56fbf', 'Combo', '/images/combo_full_vip.jpg', true),
  ('e0165765-6eba-4f30-b81b-6022d8f87370', 'Perfilado de Barba & Toalla Caliente', 'Delineado con navaja, exfoliación facial, aceites botánicos y toalla caliente aromática.', 14000, 25, '8dd0cb28-140c-4cc0-a408-26d60c5dabf6', 'Barba', '/images/perfilado_barba.jpg', true),
  ('9cf1fedc-a348-4551-9cae-dbcc6886e87f', 'Afeitado Clásico a Navaja de Cabeza o Barba', 'Afeitado total con espuma caliente, doble pasada a navaja y bálsamo refrescante.', 16000, 30, '8dd0cb28-140c-4cc0-a408-26d60c5dabf6', 'Barba', '/images/perfilado_barba.jpg', true),
  ('45162310-a09f-4d29-81c5-0951d837d7ae', 'Combo Barbero Clásico (Corte Tradicional + Barba)', 'Corte clásico tijera/peine + ritual completo de barba con toalla caliente.', 26000, 45, '8dd0cb28-140c-4cc0-a408-26d60c5dabf6', 'Combo', '/images/combo_full_vip.jpg', true),
  ('eb2b1dea-4109-4fbd-bf39-688c3952b9d1', 'Corte Urbano Taper Fade & Texturizado', 'Estilo moderno juvenil con degradado sutil en patillas y nuca, textura y styling.', 18000, 30, 'bdc11a99-83d7-47de-8eac-17575513b131', 'Corte', '/images/corte_clasico.jpg', true),
  ('a1cff0f9-432c-43bb-b9e7-b1a1997fefda', 'Depilación Facial con Cera & Black Mask', 'Depilación estética de nariz, orejas, entrecejo y aplicación de mascarilla de carbón activado.', 15000, 25, 'bdc11a99-83d7-47de-8eac-17575513b131', 'Depilacion', '/images/perfilado_barba.jpg', true),
  ('618fd465-c561-4e9c-9caa-0de2ebacbe59', 'Depilación de Pecho o Espalda Masculina', 'Depilación con cera hipoalergénica tibia para pecho o espalda completa e hidratación.', 25000, 40, 'bdc11a99-83d7-47de-8eac-17575513b131', 'Depilacion', '/images/combo_full_vip.jpg', true)
on conflict (id) do update set nombre = excluded.nombre, descripcion = excluded.descripcion, precio = excluded.precio, duracion_min = excluded.duracion_min, barbero_id = excluded.barbero_id, categoria = excluded.categoria, imagen_url = excluded.imagen_url, activo = excluded.activo;
