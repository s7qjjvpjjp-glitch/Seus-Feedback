-- ============================================================
--  EQUIPE AQUARELA — Schema do Banco de Dados (Supabase)
--  Execute este SQL no Editor SQL do seu projeto Supabase:
--  https://supabase.com → seu projeto → SQL Editor
-- ============================================================

-- Perfis de usuário
create table if not exists user_profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  name text not null,
  role text not null default 'professional',
  area text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Membros da equipe (exibidos na página pública)
create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text,
  photo_url text,
  description text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Visitas domiciliares
create table if not exists visitas_domiciliares (
  id uuid primary key default gen_random_uuid(),
  patient_name text not null,
  acs_responsible text not null,
  notes text,
  return_date date not null,
  status text not null default 'pending',
  notification_sent boolean not null default false,
  created_by uuid references user_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Visitas ACS
create table if not exists visitas_acs (
  id uuid primary key default gen_random_uuid(),
  acs_name text not null,
  area text not null,
  visit_date date not null,
  visit_count int not null default 1,
  observations text,
  created_by uuid references user_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Metas
create table if not exists metas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  deadline date,
  priority text not null default 'medium',
  status text not null default 'active',
  created_by uuid references user_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Resoluções de metas
create table if not exists meta_resolucoes (
  id uuid primary key default gen_random_uuid(),
  meta_id uuid not null references metas(id) on delete cascade,
  user_id uuid not null references user_profiles(id) on delete cascade,
  note text,
  resolved_at timestamptz not null default now(),
  unique(meta_id, user_id)
);

-- Eventos / Agenda
create table if not exists eventos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  event_time time,
  event_type text not null default 'meeting',
  created_by uuid references user_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ============================================================
--  Row Level Security (RLS)
--  Permite que usuários autenticados leiam e escrevam dados.
-- ============================================================

alter table user_profiles enable row level security;
alter table team_members enable row level security;
alter table visitas_domiciliares enable row level security;
alter table visitas_acs enable row level security;
alter table metas enable row level security;
alter table meta_resolucoes enable row level security;
alter table eventos enable row level security;

-- user_profiles: qualquer autenticado lê; só o próprio ou master edita
create policy "Usuários leem perfis" on user_profiles for select using (auth.role() = 'authenticated');
create policy "Usuários editam próprio perfil" on user_profiles for update using (auth.uid() = id);
create policy "Inserção de perfis" on user_profiles for insert with check (true);
create policy "Deleção de perfis" on user_profiles for delete using (true);

-- team_members: público lê, autenticado escreve
create policy "Leitura pública equipe" on team_members for select using (true);
create policy "Escrita equipe auth" on team_members for all using (auth.role() = 'authenticated');

-- demais tabelas: somente autenticados
create policy "Auth select visitas_dom" on visitas_domiciliares for select using (auth.role() = 'authenticated');
create policy "Auth insert visitas_dom" on visitas_domiciliares for insert with check (auth.role() = 'authenticated');
create policy "Auth update visitas_dom" on visitas_domiciliares for update using (auth.role() = 'authenticated');
create policy "Auth delete visitas_dom" on visitas_domiciliares for delete using (auth.role() = 'authenticated');

create policy "Auth all visitas_acs" on visitas_acs for all using (auth.role() = 'authenticated');
create policy "Auth all metas" on metas for all using (auth.role() = 'authenticated');
create policy "Auth all resolucoes" on meta_resolucoes for all using (auth.role() = 'authenticated');
create policy "Auth all eventos" on eventos for all using (auth.role() = 'authenticated');
