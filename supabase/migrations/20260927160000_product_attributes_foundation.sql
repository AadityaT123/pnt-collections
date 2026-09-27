-- ==============================================================================
-- Migration: 20260927160000_product_attributes_foundation.sql
-- Description: Unified catalog attributes & product attribute values architecture.
--              - Adds 'pattern' column to public.products.
--              - Creates 'catalog_attributes' for extensible, dynamic attributes
--                (colors, fabrics, occasions, patterns, weaves, etc.).
--              - Creates 'product_attribute_values' junction table for multi-attribute
--                associations without duplicating data or creating separate tables.
--              - Enforces constraint that active products must retain at least one image.
--              - Establishes RLS policies ensuring secure staff writes and public active reads.
--              - Seeds standard saree catalog attributes and core categories.
-- ==============================================================================

-- 1. Extend public.products with optional 'pattern' column
alter table public.products
  add column if not exists pattern text;

-- 2. Create unified catalog_attributes table
create table if not exists public.catalog_attributes (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  name text not null,
  slug text not null,
  metadata jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint catalog_attributes_type_slug_unique unique (type, slug),
  constraint catalog_attributes_type_name_unique unique (type, name)
);

-- Index for efficient attribute browsing & filtering by type
create index if not exists catalog_attributes_type_sort_order_idx
  on public.catalog_attributes (type, sort_order, name);

-- Automatic updated_at trigger
drop trigger if exists catalog_attributes_set_updated_at on public.catalog_attributes;
create trigger catalog_attributes_set_updated_at
  before update on public.catalog_attributes
  for each row execute function public.set_updated_at();

-- 3. Create product_attribute_values junction table
create table if not exists public.product_attribute_values (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  attribute_id uuid not null references public.catalog_attributes (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint product_attribute_values_unique unique (product_id, attribute_id)
);

-- Indexes for lightning-fast join queries and faceted attribute filters
create index if not exists product_attribute_values_product_id_idx
  on public.product_attribute_values (product_id);

create index if not exists product_attribute_values_attribute_id_idx
  on public.product_attribute_values (attribute_id, product_id);

-- 4. Enable Row Level Security (RLS)
alter table public.catalog_attributes enable row level security;
alter table public.product_attribute_values enable row level security;

-- Revoke default public access
revoke all on table public.catalog_attributes, public.product_attribute_values from anon, authenticated;

-- Grants
grant select on public.catalog_attributes to anon, authenticated;
grant select, insert, update, delete on public.catalog_attributes to authenticated;

grant select on public.product_attribute_values to anon, authenticated;
grant select, insert, update, delete on public.product_attribute_values to authenticated;

-- RLS Policies: catalog_attributes
drop policy if exists "catalog_attributes: public can read attributes" on public.catalog_attributes;
create policy "catalog_attributes: public can read attributes"
  on public.catalog_attributes for select
  to anon, authenticated
  using (true);

drop policy if exists "catalog_attributes: staff manage attributes" on public.catalog_attributes;
create policy "catalog_attributes: staff manage attributes"
  on public.catalog_attributes for all
  to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));

-- RLS Policies: product_attribute_values
drop policy if exists "product_attribute_values: public reads active product attributes" on public.product_attribute_values;
create policy "product_attribute_values: public reads active product attributes"
  on public.product_attribute_values for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.products
      where id = product_attribute_values.product_id and status = 'active'
    )
  );

drop policy if exists "product_attribute_values: staff manage product attributes" on public.product_attribute_values;
create policy "product_attribute_values: staff manage product attributes"
  on public.product_attribute_values for all
  to authenticated
  using ((select public.is_staff()))
  with check ((select public.is_staff()));

-- 5. Validation trigger: Ensure active product must have at least one product image
create or replace function public.ensure_active_product_has_image()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'active' and not exists (
    select 1
    from public.product_images
    where product_id = new.id
  ) then
    raise exception 'An active product must have at least one product image';
  end if;

  return new;
end;
$$;

drop trigger if exists products_require_image on public.products;
create constraint trigger products_require_image
after insert or update of status on public.products
deferrable initially deferred
for each row execute function public.ensure_active_product_has_image();

-- 5B. Validation trigger: Ensure active product retains at least one image after image deletions.
--     Configured as a deferred constraint trigger on AFTER DELETE so that replacing an active product's
--     image gallery in one transaction (delete old + insert new) succeeds, while deleting the final
--     image without replacement is rejected at transaction commit.
create or replace function public.ensure_active_product_has_image_on_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.products
    where id = old.product_id and status = 'active'
  ) and not exists (
    select 1 from public.product_images
    where product_id = old.product_id
  ) then
    raise exception 'An active product must retain at least one product image';
  end if;

  return null;
end;
$$;

drop trigger if exists product_images_require_active_image on public.product_images;
create constraint trigger product_images_require_active_image
after delete on public.product_images
deferrable initially deferred
for each row execute function public.ensure_active_product_has_image_on_delete();

-- 6. Seed standard saree catalog attributes (Colors, Fabrics, Occasions, Patterns)
insert into public.catalog_attributes (type, name, slug, metadata, sort_order)
values
  -- Colors
  ('color', 'Teal', 'teal', '{"hex": "#008080"}'::jsonb, 1),
  ('color', 'Crimson Red', 'crimson-red', '{"hex": "#990000"}'::jsonb, 2),
  ('color', 'Royal Blue', 'royal-blue', '{"hex": "#4169E1"}'::jsonb, 3),
  ('color', 'Emerald Green', 'emerald-green', '{"hex": "#046307"}'::jsonb, 4),
  ('color', 'Mustard Yellow', 'mustard-yellow', '{"hex": "#E1AD01"}'::jsonb, 5),
  ('color', 'Magenta Pink', 'magenta-pink', '{"hex": "#C71585"}'::jsonb, 6),
  ('color', 'Antique Gold', 'antique-gold', '{"hex": "#CFB53B"}'::jsonb, 7),
  ('color', 'Coral Peach', 'coral-peach', '{"hex": "#F88379"}'::jsonb, 8),
  ('color', 'Wine Purple', 'wine-purple', '{"hex": "#722F37"}'::jsonb, 9),
  ('color', 'Midnight Black', 'midnight-black', '{"hex": "#1A1A1A"}'::jsonb, 10),
  -- Fabrics
  ('fabric', 'Pure Silk', 'pure-silk', '{}'::jsonb, 1),
  ('fabric', 'Katan Silk', 'katan-silk', '{}'::jsonb, 2),
  ('fabric', 'Banarasi Georgette', 'banarasi-georgette', '{}'::jsonb, 3),
  ('fabric', 'Chanderi Silk', 'chanderi-silk', '{}'::jsonb, 4),
  ('fabric', 'Organza', 'organza', '{}'::jsonb, 5),
  ('fabric', 'Tussar Silk', 'tussar-silk', '{}'::jsonb, 6),
  ('fabric', 'Moonga Silk', 'moonga-silk', '{}'::jsonb, 7),
  ('fabric', 'Linen Cotton', 'linen-cotton', '{}'::jsonb, 8),
  ('fabric', 'Tissue Silk', 'tissue-silk', '{}'::jsonb, 9),
  -- Occasions
  ('occasion', 'Wedding & Bridal', 'wedding-bridal', '{}'::jsonb, 1),
  ('occasion', 'Festive & Puja', 'festive-puja', '{}'::jsonb, 2),
  ('occasion', 'Reception & Cocktail', 'reception-cocktail', '{}'::jsonb, 3),
  ('occasion', 'Evening Soiree', 'evening-soiree', '{}'::jsonb, 4),
  ('occasion', 'Traditional Rituals', 'traditional-rituals', '{}'::jsonb, 5),
  ('occasion', 'Daily Luxury', 'daily-luxury', '{}'::jsonb, 6),
  -- Patterns
  ('pattern', 'Zari Brocade', 'zari-brocade', '{}'::jsonb, 1),
  ('pattern', 'Floral Jaal', 'floral-jaal', '{}'::jsonb, 2),
  ('pattern', 'Paisley / Kalka', 'paisley-kalka', '{}'::jsonb, 3),
  ('pattern', 'Geometric Buta', 'geometric-buta', '{}'::jsonb, 4),
  ('pattern', 'Temple Border', 'temple-border', '{}'::jsonb, 5),
  ('pattern', 'Jangla Weave', 'jangla-weave', '{}'::jsonb, 6),
  ('pattern', 'Shikargah Motifs', 'shikargah-motifs', '{}'::jsonb, 7)
on conflict (type, slug) do nothing;

-- 7. Seed core saree categories (idempotent, safe against index expressions)
insert into public.categories (name, slug, description, sort_order, status)
select * from (values
  ('Banarasi Sarees', 'banarasi-sarees', 'Handcrafted Banarasi masterpieces with intricate zari artistry.', 1, 'active'),
  ('Kanjeevaram Sarees', 'kanjeevaram-sarees', 'Lustrous South Indian pure silk sarees with temple borders.', 2, 'active'),
  ('Chanderi Sarees', 'chanderi-sarees', 'Featherlight Chanderi silks woven with sheer elegance.', 3, 'active'),
  ('Pure Silk Sarees', 'pure-silk-sarees', 'Timeless pure silk sarees across traditional Indian weaving hubs.', 4, 'active'),
  ('Georgette & Chiffon', 'georgette-chiffon', 'Graceful flowy weaves with delicate zari and resham embroidery.', 5, 'active'),
  ('Organza Sarees', 'organza-sarees', 'Modern sheer luxury sarees with opulent borders and motifs.', 6, 'active'),
  ('Festive & Bridal Sarees', 'festive-bridal-sarees', 'Heirloom celebratory sarees for weddings, pujas, and celebrations.', 7, 'active')
) as v(name, slug, description, sort_order, status)
where not exists (
  select 1 from public.categories c where lower(c.slug) = lower(v.slug)
);
