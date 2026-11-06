-- L'Atelier de l'Impression — schéma initial (ADDITIF, préfixe atelier_)
-- Appliqué sur un projet Supabase partagé : aucune table existante n'est modifiée.

create table public.atelier_admins (user_id uuid primary key references auth.users on delete cascade);

create table public.atelier_products (
  id text primary key, name text not null, description text, category text,
  colors jsonb not null default '[]', sizes jsonb not null default '[]',
  print_zones jsonb not null default '{}', model_3d_url text,
  price_cents integer,            -- null = sur devis uniquement
  active boolean not null default true, created_at timestamptz default now()
);

create table public.atelier_quotes (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  first_name text not null, last_name text not null, email text not null, phone text not null,
  company text, customer_type text not null, delivery text not null, address text,
  desired_date date, comments text,
  configuration jsonb not null, files jsonb not null default '[]',
  status text not null default 'nouvelle',
  price_cents integer, sumup_link text, quote_pdf_path text,
  created_at timestamptz default now(), purge_after timestamptz default (now() + interval '3 years')
);

create table public.atelier_orders (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  quote_id uuid references public.atelier_quotes,
  customer jsonb not null, items jsonb not null, total_cents integer not null,
  status text not null default 'nouvelle',
  payment_status text not null default 'pending', -- pending|paid|failed|expired|refunded
  created_at timestamptz default now()
);

create table public.atelier_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.atelier_orders, sumup_checkout_id text unique,
  amount_cents integer not null, currency text not null default 'EUR',
  status text not null default 'pending', raw jsonb, created_at timestamptz default now()
);

create table public.atelier_site_content (key text primary key, value jsonb not null, updated_at timestamptz default now());

-- RLS : tout fermé par défaut. Les écritures publiques passent par la route serveur (service role).
alter table public.atelier_admins enable row level security;
alter table public.atelier_products enable row level security;
alter table public.atelier_quotes enable row level security;
alter table public.atelier_orders enable row level security;
alter table public.atelier_payments enable row level security;
alter table public.atelier_site_content enable row level security;

create function public.atelier_is_admin() returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.atelier_admins where user_id = auth.uid()) $$;
revoke execute on function public.atelier_is_admin() from public, anon;
grant execute on function public.atelier_is_admin() to authenticated;

create policy "catalogue public" on public.atelier_products for select using (active);
create policy "contenu public" on public.atelier_site_content for select using (true);
create policy "admin products" on public.atelier_products for all to authenticated using (public.atelier_is_admin()) with check (public.atelier_is_admin());
create policy "admin content" on public.atelier_site_content for all to authenticated using (public.atelier_is_admin()) with check (public.atelier_is_admin());
create policy "admin quotes" on public.atelier_quotes for all to authenticated using (public.atelier_is_admin()) with check (public.atelier_is_admin());
create policy "admin orders" on public.atelier_orders for all to authenticated using (public.atelier_is_admin()) with check (public.atelier_is_admin());
create policy "admin payments" on public.atelier_payments for select to authenticated using (public.atelier_is_admin());
create policy "admin lit atelier_admins" on public.atelier_admins for select to authenticated using (user_id = auth.uid());

-- Stockage privé (jamais public) : accès via URLs signées côté admin
insert into storage.buckets (id, name, public) values ('atelier-quote-files', 'atelier-quote-files', false) on conflict do nothing;
create policy "atelier admin lit les fichiers" on storage.objects for select to authenticated
  using (bucket_id = 'atelier-quote-files' and public.atelier_is_admin());
