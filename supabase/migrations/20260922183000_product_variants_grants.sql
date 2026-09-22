-- ==============================================================================
-- Migration: 20260922183000_product_variants_grants.sql
-- Description: Grant table-level INSERT and UPDATE privileges on
--              public.product_variants to the authenticated role.
--              Row-level security policy "catalog: staff manage variants"
--              continues to enforce is_staff() authorization.
-- ==============================================================================

grant insert, update on public.product_variants to authenticated;
