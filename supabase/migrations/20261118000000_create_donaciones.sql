begin;

create table public.donaciones (
  id uuid primary key default gen_random_uuid(),
  restaurante_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  tipo_comida text not null check (tipo_comida ~ '[^[:space:]]'),
  porciones integer not null check (porciones > 0),
  limite_recoleccion timestamptz not null,
  ubicacion text not null check (ubicacion ~ '[^[:space:]]'),
  estado text not null default 'disponible' check (estado = 'disponible'),
  creado_en timestamptz not null default now()
);

create index donaciones_restaurante_creado_idx
  on public.donaciones (restaurante_id, creado_en desc);

alter table public.donaciones enable row level security;

revoke all privileges on table public.donaciones
  from public, anon, authenticated;

grant select on table public.donaciones to authenticated;
grant insert (tipo_comida, porciones, limite_recoleccion, ubicacion)
  on table public.donaciones to authenticated;

create policy "Leer donaciones propias"
  on public.donaciones for select to authenticated
  using (restaurante_id = (select auth.uid()));

create policy "Registrar donaciones propias"
  on public.donaciones for insert to authenticated
  with check (
    restaurante_id = (select auth.uid())
    and limite_recoleccion > now()
    and isfinite(limite_recoleccion)
  );

commit;
