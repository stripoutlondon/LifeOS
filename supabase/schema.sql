-- Life OS cloud foundation. Run in a new Supabase project's SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null,
  family_name text not null,
  way_name text not null default '',
  life_mode text not null default 'personal' check (life_mode in ('personal','family','both')),
  purpose text not null default '',
  principles jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists way_name text not null default '';
alter table public.profiles add column if not exists life_mode text not null default 'personal';

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

create table if not exists public.family_invites (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.family_spaces(id) on delete cascade,
  code text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '30 days'),
  uses_remaining integer not null default 10 check (uses_remaining >= 0),
  created_at timestamptz not null default now()
);

create index if not exists family_members_user_id_idx on public.family_members(user_id);
create index if not exists family_invites_code_idx on public.family_invites(code);

create or replace function public.is_family_member(target_family uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.family_members where family_id = target_family and user_id = auth.uid()) $$;

create or replace function public.is_family_editor(target_family uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.family_members where family_id = target_family and user_id = auth.uid() and role in ('owner','adult')) $$;

alter table public.profiles enable row level security;
alter table public.life_data enable row level security;
alter table public.family_spaces enable row level security;
alter table public.family_members enable row level security;
alter table public.family_invites enable row level security;

drop policy if exists "profiles are private" on public.profiles;
drop policy if exists "life data is private" on public.life_data;
drop policy if exists "owners manage family spaces" on public.family_spaces;
drop policy if exists "members view family spaces" on public.family_spaces;
drop policy if exists "members create family spaces" on public.family_spaces;
drop policy if exists "editors update family spaces" on public.family_spaces;
drop policy if exists "owners delete family spaces" on public.family_spaces;
drop policy if exists "members can view their membership" on public.family_members;
drop policy if exists "members view family members" on public.family_members;
drop policy if exists "owners add family members" on public.family_members;
drop policy if exists "owners remove family members" on public.family_members;
drop policy if exists "editors view family invites" on public.family_invites;

create policy "profiles are private" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "life data is private" on public.life_data for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "members view family spaces" on public.family_spaces for select using (public.is_family_member(id));
create policy "members create family spaces" on public.family_spaces for insert with check (created_by = auth.uid());
create policy "editors update family spaces" on public.family_spaces for update using (public.is_family_editor(id)) with check (public.is_family_editor(id));
create policy "owners delete family spaces" on public.family_spaces for delete using (created_by = auth.uid());
create policy "members view family members" on public.family_members for select using (public.is_family_member(family_id));
create policy "editors view family invites" on public.family_invites for select using (public.is_family_editor(family_id));

create or replace function public.create_family_space(space_name text, space_principles jsonb)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare new_family uuid; invite_code text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  insert into public.family_spaces(name,created_by,principles) values (trim(space_name),auth.uid(),coalesce(space_principles,'[]'::jsonb)) returning id into new_family;
  insert into public.family_members(family_id,user_id,role) values (new_family,auth.uid(),'owner');
  invite_code := upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));
  insert into public.family_invites(family_id,code,created_by) values (new_family,invite_code,auth.uid());
  return jsonb_build_object('family_id',new_family,'code',invite_code);
end $$;

create or replace function public.join_family_space(invite_code text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare target_invite public.family_invites%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select * into target_invite from public.family_invites where code = upper(trim(invite_code)) and expires_at > now() and uses_remaining > 0 for update;
  if target_invite.id is null then raise exception 'Invitation code is invalid or expired'; end if;
  insert into public.family_members(family_id,user_id,role) values (target_invite.family_id,auth.uid(),'adult') on conflict do nothing;
  update public.family_invites set uses_remaining = greatest(uses_remaining - 1,0) where id = target_invite.id;
  return target_invite.family_id;
end $$;

revoke all on function public.is_family_member(uuid) from public;
revoke all on function public.is_family_editor(uuid) from public;
revoke all on function public.create_family_space(text,jsonb) from public;
revoke all on function public.join_family_space(text) from public;
grant execute on function public.is_family_member(uuid) to authenticated;
grant execute on function public.is_family_editor(uuid) to authenticated;
grant execute on function public.create_family_space(text,jsonb) to authenticated;
grant execute on function public.join_family_space(text) to authenticated;

create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = auth, public
as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  delete from auth.users where id = auth.uid();
end $$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;

revoke all on public.profiles,public.life_data,public.family_spaces,public.family_members,public.family_invites from anon;
grant select,insert,update,delete on public.profiles,public.life_data to authenticated;
grant select,insert,update,delete on public.family_spaces,public.family_members,public.family_invites to authenticated;
