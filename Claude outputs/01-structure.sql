-- L'Atelier de l'Impression — structure complète (à coller dans SQL Editor du NOUVEAU projet Supabase).
-- Idempotent : peut être relancé sans risque.
-- Toutes les lectures/écritures passent par le serveur du site (clé service) : RLS activée, aucune politique publique.

create extension if not exists pgcrypto;

-- ───────── Accès administrateur ─────────
create table if not exists public.atelier_admin_emails (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

-- ───────── Catalogue et prix ─────────
create table if not exists public.atelier_products (
  id text primary key,
  name text not null,
  description text,
  category text,
  colors jsonb not null default '[]',
  sizes jsonb not null default '[]',
  print_zones jsonb not null default '{}',
  model_3d_url text,
  price_cents integer,                                   -- prix recto (centimes)
  price_both_cents integer check (price_both_cents is null or price_both_cents > 0), -- prix recto-verso (vide = prix recto)
  active boolean not null default true,
  purchasable boolean not null default false,            -- achat en ligne autorisé
  created_at timestamptz default now()
);

-- ───────── Commandes et paiements ─────────
create table if not exists public.atelier_orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  customer jsonb not null,
  items jsonb not null,
  total_cents integer not null,
  status text not null default 'nouvelle',
  payment_status text not null default 'pending',        -- pending | paid | failed | expired | refunded
  access_token uuid not null default gen_random_uuid(),
  paid_at timestamptz,
  idempotency_key text,
  created_at timestamptz default now()
);
create unique index if not exists atelier_orders_idem_uidx on public.atelier_orders (idempotency_key) where idempotency_key is not null;
create index if not exists atelier_orders_payment_idx on public.atelier_orders (payment_status, created_at desc);

create table if not exists public.atelier_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.atelier_orders on delete cascade,
  sumup_checkout_id text unique,
  amount_cents integer not null,
  currency text not null default 'EUR',
  status text not null default 'pending',
  raw jsonb,
  created_at timestamptz default now()
);
create index if not exists atelier_payments_order_idx on public.atelier_payments (order_id);

create table if not exists public.atelier_order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.atelier_orders on delete cascade,
  status text not null,
  note text,
  actor text,
  created_at timestamptz not null default now()
);
create index if not exists atelier_order_events_order_idx on public.atelier_order_events (order_id, created_at desc);

create table if not exists public.atelier_email_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.atelier_orders on delete set null,
  kind text not null,
  recipient text,
  subject text,
  status text not null,                                  -- sent | failed | skipped
  provider_id text,
  error text,
  created_at timestamptz not null default now()
);
create index if not exists atelier_email_log_order_idx on public.atelier_email_log (order_id, created_at desc);
create index if not exists atelier_email_log_created_idx on public.atelier_email_log (created_at desc);

-- ───────── Contenu modifiable depuis l'admin ─────────
create table if not exists public.atelier_custom_products (
  id text primary key,
  family text not null,
  name text not null,
  description text,
  sizes jsonb not null,
  colors jsonb not null,
  faces jsonb not null,
  max_zoom numeric,
  price_from integer,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.atelier_gallery (
  id uuid primary key default gen_random_uuid(),
  src text not null,
  alt text not null default '',
  category text not null default 'Textile',
  created_at timestamptz not null default now()
);
create table if not exists public.atelier_covers (
  key text primary key,
  src text not null,
  updated_at timestamptz not null default now()
);

-- ───────── Sécurité : tout fermé côté public (le site utilise la clé service) ─────────
alter table public.atelier_admin_emails enable row level security;
alter table public.atelier_products enable row level security;
alter table public.atelier_orders enable row level security;
alter table public.atelier_payments enable row level security;
alter table public.atelier_order_events enable row level security;
alter table public.atelier_email_log enable row level security;
alter table public.atelier_custom_products enable row level security;
alter table public.atelier_gallery enable row level security;
alter table public.atelier_covers enable row level security;

-- ───────── Stockage ─────────
-- Logos des clients (PRIVÉ : accès uniquement par le serveur / l'admin)
insert into storage.buckets (id, name, public) values ('atelier-quote-files', 'atelier-quote-files', false)
on conflict (id) do nothing;
-- Photos ajoutées par l'admin (PUBLIC : produits, galerie, couvertures)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('atelier-site-media', 'atelier-site-media', true, 3145728, array['image/webp','image/png','image/jpeg'])
on conflict (id) do nothing;
