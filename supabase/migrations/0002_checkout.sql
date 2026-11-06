-- L'Atelier de l'Impression — paiement immédiat (ADDITIF, préfixe atelier_) — appliqué sur luvydsusnupkxvjfxsug
-- purchasable = false par défaut : aucun produit n'est payable en ligne tant que l'atelier n'a pas validé un prix.
alter table public.atelier_products add column if not exists purchasable boolean not null default false;
alter table public.atelier_orders add column if not exists access_token uuid not null default gen_random_uuid();
alter table public.atelier_orders add column if not exists paid_at timestamptz;
alter table public.atelier_orders add column if not exists idempotency_key text;
create unique index if not exists atelier_orders_idem_uidx on public.atelier_orders (idempotency_key) where idempotency_key is not null;
create index if not exists atelier_payments_order_idx on public.atelier_payments (order_id);

insert into public.atelier_products (id, name, category, price_cents, purchasable) values
  ('t-shirt','T-shirt','textile',null,false),
  ('capuche','Sweat à capuche','textile',null,false),
  ('sweat','Sweat col rond','textile',null,false),
  ('polo','Polo','textile',null,false),
  ('casquette','Casquette','accessoire',null,false),
  ('tote-bag','Tote bag','accessoire',null,false),
  ('mug','Mug','objet',null,false),
  ('pantalon','Pantalon','textile',null,false),
  ('sac-a-dos','Sac à dos','accessoire',null,false)
on conflict (id) do nothing;

-- Prix fermes validés par l'utilisateur (06/11/2026) : achat en ligne sans devis, logo inclus.
update public.atelier_products set price_cents = v.p, purchasable = true
from (values ('t-shirt',1500),('polo',1700),('capuche',2200)) as v(id,p) where atelier_products.id = v.id;

insert into public.atelier_products (id, name, category, price_cents, purchasable) values
  ('casquette-patch','Casquette à patch','accessoire',null,false),
  ('gilet','Gilet softshell','textile',null,false),
  ('bonnet','Bonnet','accessoire',null,false)
on conflict (id) do nothing;
