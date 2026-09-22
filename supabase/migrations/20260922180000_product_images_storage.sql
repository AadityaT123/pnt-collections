-- ==============================================================================
-- Migration: 20260922180000_product_images_storage.sql
-- Description: Create public 'product-images' storage bucket with admin-only
--              upload/update/delete RLS policies enforced via public.is_admin().
-- ==============================================================================

-- 1. Create or configure public 'product-images' bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760, -- 10MB file size limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

-- 2. Ensure RLS is active on storage.objects
alter table storage.objects enable row level security;

-- 3. Public Read Policy: Storefront & public can read images from 'product-images' bucket
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
on storage.objects for select
to public
using (bucket_id = 'product-images');

-- 4. Admin Upload Policy: Only authenticated active admins can upload
drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (select public.is_admin())
);

-- 5. Admin Update Policy: Only authenticated active admins can update
drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-images'
  and (select public.is_admin())
)
with check (
  bucket_id = 'product-images'
  and (select public.is_admin())
);

-- 6. Admin Delete Policy: Only authenticated active admins can delete
drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and (select public.is_admin())
);
