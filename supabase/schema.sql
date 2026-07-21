-- Life OS cloud foundation. Run in a new Supabase project's SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  family_name text not null,
  purpose text not null default '',
  principles jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.life_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.family_spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  principles jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.family_members (
  family_id uuid not null references public.family_spaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','adult','member')),
  joined_at timestamptz not null default now(),
  primary key (family_id,user_id)
);

alter table public.profiles enable row level security;
alter table public.life_data enable row level security;
alter table public.family_spaces enable row level security;
alter table public.family_members enable row level security;

create policy "profiles are private" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "life data is private" on public.life_data for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owners manage family spaces" on public.family_spaces for all using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy "members can view their membership" on public.family_members for select using (user_id = auth.uid());
create policy "owners add family members" on public.family_members for insert with check (
  exists (select 1 from public.family_spaces where id = family_id and created_by = auth.uid())
);
create policy "owners remove family members" on public.family_members for delete using (
  user_id = auth.uid() or exists (select 1 from public.family_spaces where id = family_id and created_by = auth.uid())
);
