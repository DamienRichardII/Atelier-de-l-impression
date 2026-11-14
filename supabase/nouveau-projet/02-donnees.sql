-- L'Atelier de l'Impression — données de départ (à coller APRÈS 01-structure.sql).
-- Prix en centimes. Valeurs reprises de l'admin au 10/11/2026 : à vérifier / ajuster ensuite dans « Prix et catalogue ».

-- 1) Administrateurs autorisés (e-mails en minuscules)
insert into public.atelier_admin_emails (email) values
  ('atelierprint2.0@gmail.com'),
  ('damien.miyouna@gmail.com')
on conflict (email) do nothing;

-- 2) Catalogue et prix
insert into public.atelier_products (id, name, category, price_cents, price_both_cents, active, purchasable) values
  ('t-shirt',            'T-shirt',                      'textile',    1300, 1600, true, true),
  ('t-shirt-oversize',   'T-shirt ample 220 g',          'textile',    1500, 1900, true, true),
  ('t-shirt-chicago',    'T-shirt Chicago',              'textile',    1700, 2000, true, true),
  ('capuche-320',        'Sweat à capuche 320 g',        'textile',    2000, 2200, true, true),
  ('capuche-zip',        'Sweat zippé à capuche 320 g',  'textile',    1800, 2000, true, true),
  ('sweat-320',          'Sweat col rond 320 g',         'textile',    1700, 1900, true, true),
  ('polo',               'Polo',                         'textile',    1500, 1800, true, true),
  ('casquette',          'Casquette',                    'accessoire', 1500, null, true, true),
  ('casquette-patch',    'Casquette à patch',            'accessoire', 1500, null, true, true),
  ('gilet',              'Gilet softshell',              'textile',    3200, 3500, true, true),
  ('veste-polaire',      'Veste polaire',                'textile',    2700, 3000, true, true),
  ('bonnet',             'Bonnet',                       'accessoire', 1500, null, true, true),
  ('tablier',            'Tablier à bavette',            'textile',    1500, null, true, true),
  ('gilet-securite',     'Gilet de sécurité',            'textile',    1000, null, true, true),
  ('pantalon',           'Pantalon',                     'textile',    3500, null, true, true),
  ('pantalon-trekking',  'Pantalon de trekking stretch', 'textile',    3500, null, true, true),
  ('tote-bag',           'Tote bag',                     'accessoire', 1000, null, true, true),
  ('sac-a-dos',          'Sac à dos',                    'accessoire', 2000, null, true, true)
on conflict (id) do update set
  name = excluded.name, category = excluded.category,
  price_cents = excluded.price_cents, price_both_cents = excluded.price_both_cents,
  active = excluded.active, purchasable = excluded.purchasable;
