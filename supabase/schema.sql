-- ============================================================
--  DressingAI — Schéma Supabase (tables, RLS, storage, triggers)
--  À exécuter dans l'éditeur SQL Supabase (ou via `supabase db push`).
-- ============================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ---------- Profils utilisateurs ----------
create table if not exists user_profiles (
  id uuid references auth.users primary key,
  prenom text,
  avatar_emoji text,
  styles_preferes text[],
  couleurs_fetiches text[],
  budget_moyen int,
  points int default 0,
  badges text[] default '{}',
  created_at timestamptz default now()
);

-- ---------- Vêtements ----------
create table if not exists vetements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles on delete cascade,
  photo_url text,
  nom text,
  categorie text, -- haut/bas/robe/chaussures/accessoire/manteau
  couleur_dominante text,
  couleur_hex text,
  couleurs_secondaires text[],
  style text[],
  saison text[],
  occasion text[],
  marque text,
  taille text,
  prix_achat numeric,
  tags text[] default '{}', -- favori/en_pret/stocke/a_donner
  nb_ports int default 0,
  derniere_date_port date,
  created_at timestamptz default now()
);
create index if not exists vetements_user_idx on vetements(user_id);

-- ---------- Tenues ----------
create table if not exists tenues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles on delete cascade,
  nom text,
  haut_id uuid references vetements on delete set null,
  bas_id uuid references vetements on delete set null,
  chaussures_id uuid references vetements on delete set null,
  accessoire_id uuid references vetements on delete set null,
  humeur text,
  score_ia int,
  photo_url text,
  created_at timestamptz default now()
);
create index if not exists tenues_user_idx on tenues(user_id);

-- ---------- Historique de port ----------
create table if not exists historique_ports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_profiles on delete cascade,
  tenue_id uuid references tenues on delete set null,
  date_port date default current_date,
  meteo text,
  humeur text,
  created_at timestamptz default now()
);
create index if not exists historique_user_idx on historique_ports(user_id);

-- ---------- Dressings partagés ----------
create table if not exists dressing_partages (
  id uuid primary key default gen_random_uuid(),
  nom text,
  owner_id uuid references user_profiles on delete cascade,
  membres uuid[] default '{}',
  created_at timestamptz default now()
);

-- ============================================================
--  Row Level Security
-- ============================================================
alter table user_profiles enable row level security;
alter table vetements enable row level security;
alter table tenues enable row level security;
alter table historique_ports enable row level security;
alter table dressing_partages enable row level security;

-- Profils : chacun gère le sien
drop policy if exists "profil_self" on user_profiles;
create policy "profil_self" on user_profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Vêtements : propriétaire uniquement
drop policy if exists "vetements_owner" on vetements;
create policy "vetements_owner" on vetements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tenues : propriétaire uniquement
drop policy if exists "tenues_owner" on tenues;
create policy "tenues_owner" on tenues
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Historique : propriétaire uniquement
drop policy if exists "historique_owner" on historique_ports;
create policy "historique_owner" on historique_ports
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Dressings partagés : owner ou membre
drop policy if exists "partage_access" on dressing_partages;
create policy "partage_access" on dressing_partages
  for all using (auth.uid() = owner_id or auth.uid() = any(membres))
  with check (auth.uid() = owner_id);

-- ============================================================
--  Storage : bucket "vetements"
-- ============================================================
insert into storage.buckets (id, name, public)
values ('vetements', 'vetements', true)
on conflict (id) do nothing;

drop policy if exists "vetements_upload" on storage.objects;
create policy "vetements_upload" on storage.objects
  for insert with check (
    bucket_id = 'vetements' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "vetements_read" on storage.objects;
create policy "vetements_read" on storage.objects
  for select using (bucket_id = 'vetements');

drop policy if exists "vetements_delete" on storage.objects;
create policy "vetements_delete" on storage.objects
  for delete using (
    bucket_id = 'vetements' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
--  Trigger : créer un profil vide à l'inscription
-- ============================================================
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
