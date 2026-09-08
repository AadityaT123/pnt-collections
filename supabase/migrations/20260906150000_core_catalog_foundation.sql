-- PNT Collections: core catalog, customer, inventory, and homepage foundation.
-- This migration intentionally does not create carts, checkout, payments, shipping,
-- refunds, coupons, or application UI.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer'
    check (role in ('customer', 'staff', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  email text not null,
  phone text,
  first_name text,
  last_name text,
  marketing_opt_in boolean not null default false,
  notes text,
  total_orders integer not null default 0 check (total_orders >= 0),
  total_spent_paise bigint not null default 0 check (total_spent_paise >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  label text,
  recipient_name text not null,
  phone text not null,
  line1 text not null,
  line2 text,
  landmark text,
  city text not null,
  state text not null,
  postal_code text not null check (postal_code ~ '^[0-9]{6}$'),
  country_code char(2) not null default 'IN' check (country_code = 'IN'),
  is_default_shipping boolean not null default false,
  is_default_billing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete restrict,
  name text not null,
  slug text not null,
  description text,
  image_path text,
  sort_order integer not null default 0,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'archived')),
  seo_title text,
  seo_description text,
  canonical_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  image_path text,
  banner_path text,
  sort_order integer not null default 0,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'archived')),
  seo_title text,
  seo_description text,
  canonical_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  short_description text,
  description text,
  status text not null default 'draft'
    check (status in ('draft', 'active', 'archived')),
  brand text,
  fabric text,
  weave text,
  color text,
  occasion text,
  saree_length_cm integer check (saree_length_cm > 0),
  blouse_piece_included boolean not null default false,
  blouse_piece_length_cm integer check (blouse_piece_length_cm > 0),
  care_instructions text,
  hsn_code text,
  gst_rate numeric(5, 2) check (gst_rate >= 0 and gst_rate <= 100),
  is_featured boolean not null default false,
  seo_title text,
  seo_description text,
  canonical_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (blouse_piece_included = true and blouse_piece_length_cm is not null)
    or (blouse_piece_included = false and blouse_piece_length_cm is null)
  )
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete restrict,
  sku text not null,
  barcode text unique,
  title text not null default 'Default',
  attributes jsonb not null default '{}'::jsonb,
  price_paise integer not null check (price_paise >= 0),
  compare_at_price_paise integer check (
    compare_at_price_paise is null or compare_at_price_paise >= price_paise
  ),
  cost_paise integer check (cost_paise is null or cost_paise >= 0),
  weight_grams integer check (weight_grams is null or weight_grams > 0),
  track_inventory boolean not null default true,
  allow_backorder boolean not null default false,
  stock_on_hand integer not null default 0 check (stock_on_hand >= 0),
  low_stock_threshold integer not null default 2 check (low_stock_threshold >= 0),
  status text not null default 'active'
    check (status in ('active', 'inactive', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, product_id)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  variant_id uuid,
  storage_path text not null unique,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (variant_id, product_id)
    references public.product_variants (id, product_id) on delete cascade
);

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (product_id, category_id)
);

create table public.product_collections (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, collection_id)
);

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants (id) on delete restrict,
  quantity_delta integer not null check (quantity_delta <> 0),
  reason text not null check (
    reason in ('initial_stock', 'restock', 'sale', 'return', 'adjustment', 'damage')
  ),
  reference_type text,
  reference_id uuid,
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null,
  sort_order integer not null default 0,
  title text,
  subtitle text,
  body text,
  image_path text,
  mobile_image_path text,
  cta_label text,
  cta_url text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_key, sort_order)
);

create index customer_addresses_customer_id_idx
  on public.customer_addresses (customer_id);
create unique index customer_addresses_default_shipping_idx
  on public.customer_addresses (customer_id) where is_default_shipping;
create unique index customer_addresses_default_billing_idx
  on public.customer_addresses (customer_id) where is_default_billing;
create index categories_parent_id_status_sort_order_idx
  on public.categories (parent_id, status, sort_order);
create unique index categories_slug_lower_key
  on public.categories (lower(slug));
create index categories_slug_idx
  on public.categories (slug);
create index collections_status_sort_order_idx
  on public.collections (status, sort_order);
create unique index collections_slug_lower_key
  on public.collections (lower(slug));
create index collections_slug_idx
  on public.collections (slug);
create index products_status_featured_created_at_idx
  on public.products (status, is_featured, created_at desc);
create unique index products_slug_lower_key
  on public.products (lower(slug));
create index products_slug_idx
  on public.products (slug);
create index product_variants_product_id_status_idx
  on public.product_variants (product_id, status);
create unique index product_variants_sku_lower_key
  on public.product_variants (lower(sku));
create index product_variants_sku_idx
  on public.product_variants (sku);
create index product_images_product_id_sort_order_idx
  on public.product_images (product_id, sort_order);
create unique index product_images_primary_per_product_idx
  on public.product_images (product_id) where is_primary;
create index product_categories_category_id_product_id_idx
  on public.product_categories (category_id, product_id);
create index product_collections_collection_id_sort_order_idx
  on public.product_collections (collection_id, sort_order, product_id);
create index inventory_movements_variant_id_created_at_idx
  on public.inventory_movements (variant_id, created_at desc);
create index homepage_sections_published_idx
  on public.homepage_sections (section_key, sort_order)
  where status = 'published' and is_active;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_active = true
      and role in ('staff', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and is_active = true
      and role = 'admin'
  );
$$;

create or replace function public.owns_customer(target_customer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.customers
    where id = target_customer_id
      and auth_user_id = auth.uid()
  );
$$;

create or replace function public.apply_inventory_movement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  inventory_is_tracked boolean;
begin
  select track_inventory
  into inventory_is_tracked
  from public.product_variants
  where id = new.variant_id
  for update;

  if inventory_is_tracked is null then
    raise exception 'Product variant % does not exist', new.variant_id;
  end if;

  if inventory_is_tracked then
    update public.product_variants
    set stock_on_hand = stock_on_hand + new.quantity_delta
    where id = new.variant_id
      and stock_on_hand + new.quantity_delta >= 0;

    if not found then
      raise exception 'Inventory movement would reduce stock below zero for variant %', new.variant_id;
    end if;
  end if;

  return new;
end;
$$;

-- This function is intentionally not granted to anon or authenticated roles.
-- A database owner uses it once from the Supabase SQL Editor to bootstrap the
-- first admin after that user's Auth record exists.
create or replace function public.bootstrap_first_admin(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from auth.users where id = target_user_id) then
    raise exception 'Auth user % does not exist', target_user_id;
  end if;

  if exists (
    select 1
    from public.profiles
    where is_active = true
      and role in ('staff', 'admin')
  ) then
    raise exception 'An active staff or admin profile already exists';
  end if;

  insert into public.profiles (id, role, is_active)
  values (target_user_id, 'admin', true)
  on conflict (id) do update
    set role = excluded.role,
        is_active = excluded.is_active;
end;
$$;

create or replace function public.ensure_new_variant_starts_without_stock()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.stock_on_hand <> 0 then
    raise exception 'Create initial stock with an inventory movement';
  end if;

  return new;
end;
$$;

create or replace function public.ensure_active_product_has_variant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'active' and not exists (
    select 1
    from public.product_variants
    where product_id = new.id
      and status = 'active'
  ) then
    raise exception 'An active product must have at least one active variant';
  end if;

  return new;
end;
$$;

create or replace function public.prevent_removing_final_active_variant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parent_product_id uuid;
  is_removing_active_variant boolean;
begin
  parent_product_id := old.product_id;

  if tg_op = 'DELETE' then
    is_removing_active_variant := true;
  else
    is_removing_active_variant := new.status <> 'active';
  end if;

  if old.status = 'active'
    and is_removing_active_variant
    and exists (
      select 1 from public.products
      where id = parent_product_id and status = 'active'
    )
    and not exists (
      select 1 from public.product_variants
      where product_id = parent_product_id
        and id <> old.id
        and status = 'active'
    ) then
    raise exception 'An active product must retain at least one active variant';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create or replace function public.prevent_variant_product_reassignment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.product_id is distinct from old.product_id then
    raise exception 'A product variant cannot be reassigned to another product';
  end if;

  return new;
end;
$$;

create or replace function public.prevent_deleting_used_variant()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1
    from public.inventory_movements
    where variant_id = old.id
  ) then
    raise exception 'A variant with inventory history must be archived, not deleted';
  end if;

  return old;
end;
$$;

create or replace function public.prevent_category_cycle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.parent_id is null then
    return new;
  end if;

  if new.parent_id = new.id then
    raise exception 'A category cannot be its own parent';
  end if;

  if exists (
    with recursive ancestors(id, path) as (
      select new.parent_id, array[new.parent_id]
      union all
      select category.parent_id, ancestor.path || category.parent_id
      from public.categories as category
      join ancestors as ancestor on ancestor.id = category.id
      where category.parent_id is not null
        and not category.parent_id = any(ancestor.path)
    )
    select 1 from ancestors where id = new.id
  ) then
    raise exception 'A category cannot be assigned to one of its descendants';
  end if;

  return new;
end;
$$;

create or replace function public.enforce_customer_fields_protection()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_staff() then
    if tg_op = 'INSERT' then
      if new.total_orders <> 0 then
        raise exception 'total_orders cannot be initialized by customer';
      end if;
      if new.total_spent_paise <> 0 then
        raise exception 'total_spent_paise cannot be initialized by customer';
      end if;
      if new.notes is not null then
        raise exception 'notes cannot be initialized by customer';
      end if;
    elsif tg_op = 'UPDATE' then
      if new.auth_user_id is distinct from old.auth_user_id then
        raise exception 'auth_user_id cannot be changed';
      end if;
      if new.total_orders is distinct from old.total_orders then
        raise exception 'total_orders cannot be modified by customer';
      end if;
      if new.total_spent_paise is distinct from old.total_spent_paise then
        raise exception 'total_spent_paise cannot be modified by customer';
      end if;
      if new.notes is distinct from old.notes then
        raise exception 'notes cannot be modified by customer';
      end if;
    end if;
  end if;

  return new;
end;
$$;

-- Views use explicit filters because their owner can read the protected base tables.
-- The public view intentionally excludes cost, stock, barcode, and other internal fields.
create view public.catalog_product_variants
with (security_barrier = true)
as
select
  variant.id,
  variant.product_id,
  variant.sku,
  variant.title,
  variant.attributes,
  variant.price_paise,
  variant.compare_at_price_paise,
  variant.status,
  (not variant.track_inventory or variant.allow_backorder or variant.stock_on_hand > 0) as is_in_stock,
  variant.created_at,
  variant.updated_at
from public.product_variants as variant
join public.products as product on product.id = variant.product_id
where variant.status = 'active'
  and product.status = 'active';

create view public.admin_product_variants
with (security_barrier = true)
as
select variant.*
from public.product_variants as variant
where (select public.is_staff());

create view public.admin_customers
with (security_barrier = true)
as
select customer.*
from public.customers as customer
where (select public.is_staff());

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create trigger customers_enforce_fields_protection
before insert or update on public.customers
for each row execute function public.enforce_customer_fields_protection();

create trigger customer_addresses_set_updated_at
before update on public.customer_addresses
for each row execute function public.set_updated_at();

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger categories_prevent_cycle
before insert or update of parent_id on public.categories
for each row execute function public.prevent_category_cycle();

create trigger collections_set_updated_at
before update on public.collections
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger product_variants_start_without_stock
before insert on public.product_variants
for each row execute function public.ensure_new_variant_starts_without_stock();

create trigger product_variants_prevent_reassignment
before update of product_id on public.product_variants
for each row execute function public.prevent_variant_product_reassignment();

create trigger product_variants_set_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

create trigger product_images_set_updated_at
before update on public.product_images
for each row execute function public.set_updated_at();

create trigger homepage_sections_set_updated_at
before update on public.homepage_sections
for each row execute function public.set_updated_at();

create constraint trigger products_require_active_variant
after insert or update of status on public.products
deferrable initially deferred
for each row execute function public.ensure_active_product_has_variant();

create trigger product_variants_require_active_variant
before update of status or delete on public.product_variants
for each row execute function public.prevent_removing_final_active_variant();

create trigger product_variants_prevent_used_deletion
before delete on public.product_variants
for each row execute function public.prevent_deleting_used_variant();

create trigger inventory_movements_apply_stock
before insert on public.inventory_movements
for each row execute function public.apply_inventory_movement();

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_collections enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.homepage_sections enable row level security;

revoke all on table public.profiles, public.customers, public.customer_addresses,
  public.categories, public.collections, public.products, public.product_variants,
  public.product_images, public.product_categories, public.product_collections,
  public.inventory_movements, public.homepage_sections from anon, authenticated;

grant usage on schema public to anon, authenticated;
revoke all on function public.set_updated_at(), public.is_staff(), public.is_admin(),
  public.owns_customer(uuid), public.bootstrap_first_admin(uuid),
  public.apply_inventory_movement(),
  public.ensure_new_variant_starts_without_stock(),
  public.ensure_active_product_has_variant(),
  public.prevent_removing_final_active_variant(),
  public.prevent_variant_product_reassignment(),
  public.prevent_deleting_used_variant(), public.prevent_category_cycle(),
  public.enforce_customer_fields_protection()
  from public;
grant execute on function public.is_staff(), public.is_admin() to authenticated;
grant execute on function public.owns_customer(uuid) to authenticated;

grant select on public.categories, public.collections, public.products,
  public.product_images, public.product_categories,
  public.product_collections, public.homepage_sections to anon, authenticated;
grant select on public.catalog_product_variants to anon, authenticated;
grant select on public.admin_product_variants, public.admin_customers to authenticated;
grant select, insert, update, delete on public.customer_addresses to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update, delete on public.categories, public.collections,
  public.products, public.product_images,
  public.product_categories, public.product_collections, public.homepage_sections
  to authenticated;
grant select, delete on public.product_variants to authenticated;
grant insert (id, product_id, sku, barcode, title, attributes, price_paise,
  compare_at_price_paise, cost_paise, weight_grams, track_inventory,
  allow_backorder, low_stock_threshold, status) on public.product_variants
  to authenticated;
grant update (sku, barcode, title, attributes, price_paise, compare_at_price_paise,
  cost_paise, weight_grams, track_inventory, allow_backorder,
  low_stock_threshold, status) on public.product_variants to authenticated;
grant select, insert on public.inventory_movements to authenticated;

create policy "profiles: users read their own profile"
on public.profiles for select to authenticated
using (id = auth.uid());

create policy "profiles: users create their customer profile"
on public.profiles for insert to authenticated
with check (id = auth.uid() and role = 'customer');

create policy "profiles: users update their customer profile"
on public.profiles for update to authenticated
using (id = auth.uid() and role = 'customer')
with check (id = auth.uid() and role = 'customer');

create policy "profiles: staff view all profiles"
on public.profiles for select to authenticated
using ((select public.is_staff()));

create policy "profiles: admin manage all profiles"
on public.profiles for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "customers: users read their customer record"
on public.customers for select to authenticated
using (auth_user_id = auth.uid());

create policy "customers: users create their customer record"
on public.customers for insert to authenticated
with check (auth_user_id = auth.uid());

create policy "customers: users update their customer record"
on public.customers for update to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

create policy "customers: staff manage all customers"
on public.customers for all to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

create policy "customer addresses: users manage their own addresses"
on public.customer_addresses for all to authenticated
using ((select public.owns_customer(customer_id)))
with check ((select public.owns_customer(customer_id)));

create policy "customer addresses: staff manage all addresses"
on public.customer_addresses for all to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

create policy "catalog: public reads active categories"
on public.categories for select to anon, authenticated
using (status = 'active');

create policy "catalog: public reads active collections"
on public.collections for select to anon, authenticated
using (status = 'active');

create policy "catalog: public reads active products"
on public.products for select to anon, authenticated
using (status = 'active');

create policy "catalog: public reads images of active products"
on public.product_images for select to anon, authenticated
using (
  exists (
    select 1 from public.products
    where id = product_images.product_id and status = 'active'
  )
);

create policy "catalog: public reads active product categories"
on public.product_categories for select to anon, authenticated
using (
  exists (
    select 1 from public.products where id = product_id and status = 'active'
  ) and exists (
    select 1 from public.categories where id = category_id and status = 'active'
  )
);

create policy "catalog: public reads active product collections"
on public.product_collections for select to anon, authenticated
using (
  exists (
    select 1 from public.products where id = product_id and status = 'active'
  ) and exists (
    select 1 from public.collections where id = collection_id and status = 'active'
  )
);

create policy "homepage: public reads published active sections"
on public.homepage_sections for select to anon, authenticated
using (status = 'published' and is_active = true);

create policy "catalog: staff manage categories"
on public.categories for all to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

create policy "catalog: staff manage collections"
on public.collections for all to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

create policy "catalog: staff manage products"
on public.products for all to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

create policy "catalog: staff manage variants"
on public.product_variants for all to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

create policy "catalog: staff manage product images"
on public.product_images for all to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

create policy "catalog: staff manage product categories"
on public.product_categories for all to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

create policy "catalog: staff manage product collections"
on public.product_collections for all to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

create policy "inventory: staff creates and reads movements"
on public.inventory_movements for select to authenticated
using ((select public.is_staff()));

create policy "inventory: staff records movements"
on public.inventory_movements for insert to authenticated
with check (
  (select public.is_staff())
  and (created_by is null or created_by = auth.uid())
);

create policy "homepage: staff manage sections"
on public.homepage_sections for all to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));
