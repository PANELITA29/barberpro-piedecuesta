-- BARBERPRO SaaS - Schema para Supabase
-- Proyecto: jhycmfjfyabirtjwlkdx
-- Ejecutar en SQL Editor de Supabase

-- 1. TABLA PROFILES (extiende auth.users con roles)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text not null,
  telefono text,
  rol text not null check (rol in ('cliente','barbero','admin')),
  created_at timestamp with time zone default now()
);

-- 2. TABLA SERVICIOS
create table if not exists public.servicios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  precio integer not null, -- en COP
  duracion_min integer not null default 30,
  barbero_id uuid references public.profiles(id) on delete cascade,
  activo boolean default true,
  created_at timestamp with time zone default now()
);

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
  created_at timestamp with time zone default now()
);

-- INDICES
create index if not exists idx_reservas_cliente on public.reservas(cliente_id);
create index if not exists idx_reservas_barbero on public.reservas(barbero_id);
create index if not exists idx_reservas_fecha on public.reservas(fecha_hora);
create index if not exists idx_servicios_barbero on public.servicios(barbero_id);

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

-- Policies pagos: solo involucrados en la reserva
drop policy if exists "pagos_select_involved" on public.pagos;
create policy "pagos_select_involved" on public.pagos for select using (
  exists (select 1 from public.reservas r where r.id = pagos.reserva_id and (r.cliente_id = auth.uid() or r.barbero_id = auth.uid()))
);
drop policy if exists "pagos_insert_cliente" on public.pagos;
create policy "pagos_insert_cliente" on public.pagos for insert with check (
  exists (select 1 from public.reservas r where r.id = pagos.reserva_id and r.cliente_id = auth.uid())
);

-- TRIGGER: auto-crear profile al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nombre, telefono, rol)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email,'@',1)), new.raw_user_meta_data->>'telefono', coalesce(new.raw_user_meta_data->>'rol','cliente'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- DATOS DE PRUEBA (opcional)
-- insert into public.servicios (nombre, descripcion, precio, duracion_min, barbero_id) values ('Corte Clásico', 'Corte con tijera y máquina', 15000, 30, 'UUID_DEL_BARBERO');
