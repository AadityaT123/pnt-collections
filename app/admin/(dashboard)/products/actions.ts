'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ActionResponse<T = unknown> = {
  success?: boolean
  data?: T
  error?: string
}

export interface ProductInput {
  name: string
  slug: string
  short_description?: string
  description?: string
  price: number
  compare_at_price?: number | null
  sku: string
  stock: number
  status: 'draft' | 'active' | 'archived'
  is_featured: boolean
  fabric?: string
  weave?: string
  color?: string
  occasion?: string
  saree_length_cm?: number | null
  blouse_piece_included: boolean
  blouse_piece_length_cm?: number | null
  care_instructions?: string
  hsn_code?: string
  gst_rate?: number | null
  category_id?: string | null
  collection_id?: string | null
  images?: Array<{
    id?: string
    storage_path: string
    alt_text?: string
    is_primary: boolean
    sort_order: number
  }>
}

/**
 * Validates admin session and authorization.
 */
async function getAuthorizedAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Authentication required. Please sign in.' }
  }

  const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin')
  if (rpcError || !isAdmin) {
    return { error: 'Unauthorized: Administrator privileges required.' }
  }

  return { supabase, user }
}

/**
 * Create a new product with default variant and ledger-driven stock.
 */
export async function createProductAction(input: ProductInput): Promise<ActionResponse<{ id: string }>> {
  try {
    const auth = await getAuthorizedAdmin()
    if (auth.error || !auth.supabase || !auth.user) {
      return { error: auth.error }
    }
    const { supabase, user } = auth

    // 1. Validation
    const name = input.name?.trim()
    if (!name) return { error: 'Product title is required.' }

    const slug = input.slug?.trim().toLowerCase()
    if (!slug) return { error: 'Product slug is required.' }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return { error: 'Slug must contain only lowercase letters, numbers, and hyphens.' }
    }

    const sku = input.sku?.trim().toUpperCase()
    if (!sku) return { error: 'SKU is required.' }

    if (isNaN(input.price) || input.price < 0) {
      return { error: 'Price must be a valid positive number.' }
    }
    const price_paise = Math.round(input.price * 100)

    let compare_at_price_paise: number | null = null
    if (input.compare_at_price !== null && input.compare_at_price !== undefined && input.compare_at_price > 0) {
      compare_at_price_paise = Math.round(input.compare_at_price * 100)
      if (compare_at_price_paise < price_paise) {
        return { error: 'Sale / compare-at price must be greater than or equal to regular price.' }
      }
    }

    const stock = Math.max(0, Math.floor(input.stock || 0))

    if (input.blouse_piece_included && (!input.blouse_piece_length_cm || input.blouse_piece_length_cm <= 0)) {
      return { error: 'Please specify the blouse piece length in cm when blouse piece is included.' }
    }

    // 2. Uniqueness checks
    const { data: existingSlug } = await supabase
      .from('products')
      .select('id')
      .ilike('slug', slug)
      .maybeSingle()

    if (existingSlug) {
      return { error: `A product with slug "${slug}" already exists.` }
    }

    const { data: existingSku } = await supabase
      .from('product_variants')
      .select('id')
      .ilike('sku', sku)
      .maybeSingle()

    if (existingSku) {
      return { error: `A variant with SKU "${sku}" already exists.` }
    }

    // 3. Insert product (initially draft to cleanly satisfy constraint triggers)
    const { data: newProduct, error: prodErr } = await supabase
      .from('products')
      .insert({
        name,
        slug,
        short_description: input.short_description?.trim() || null,
        description: input.description?.trim() || null,
        status: 'draft',
        brand: 'PNT Creation',
        fabric: input.fabric?.trim() || null,
        weave: input.weave?.trim() || null,
        color: input.color?.trim() || null,
        occasion: input.occasion?.trim() || null,
        saree_length_cm: input.saree_length_cm ? Number(input.saree_length_cm) : null,
        blouse_piece_included: !!input.blouse_piece_included,
        blouse_piece_length_cm: input.blouse_piece_included && input.blouse_piece_length_cm ? Number(input.blouse_piece_length_cm) : null,
        care_instructions: input.care_instructions?.trim() || null,
        hsn_code: input.hsn_code?.trim() || null,
        gst_rate: input.gst_rate !== undefined && input.gst_rate !== null ? Number(input.gst_rate) : null,
        is_featured: !!input.is_featured,
      })
      .select('id')
      .single()

    if (prodErr || !newProduct) {
      console.error('Error inserting product:', prodErr)
      return { error: prodErr?.message || 'Failed to create product.' }
    }

    // 4. Insert default variant with stock_on_hand = 0
    const { data: newVariant, error: varErr } = await supabase
      .from('product_variants')
      .insert({
        product_id: newProduct.id,
        sku,
        title: 'Default',
        price_paise,
        compare_at_price_paise,
        stock_on_hand: 0,
        status: 'active',
      })
      .select('id')
      .single()

    if (varErr || !newVariant) {
      console.error('Error inserting variant:', varErr)
      // Cleanup orphan draft product
      await supabase.from('products').delete().eq('id', newProduct.id)
      return { error: varErr?.message || 'Failed to create product variant.' }
    }

    // 5. Initial stock movement via ledger
    if (stock > 0) {
      const { error: invErr } = await supabase
        .from('inventory_movements')
        .insert({
          variant_id: newVariant.id,
          quantity_delta: stock,
          reason: 'initial_stock',
          note: 'Initial inventory on product creation',
          created_by: user.id,
        })

      if (invErr) {
        console.error('Error recording initial stock:', invErr)
      }
    }

    // 6. If requested status is 'active', promote product now that active variant exists
    if (input.status === 'active') {
      const { error: statusErr } = await supabase
        .from('products')
        .update({ status: 'active' })
        .eq('id', newProduct.id)

      if (statusErr) {
        console.error('Error promoting product to active:', statusErr)
      }
    }

    // 7. Associate category
    if (input.category_id) {
      await supabase.from('product_categories').insert({
        product_id: newProduct.id,
        category_id: input.category_id,
      })
    }

    // 8. Associate collection
    if (input.collection_id) {
      await supabase.from('product_collections').insert({
        product_id: newProduct.id,
        collection_id: input.collection_id,
        sort_order: 0,
      })
    }

    // 9. Associate product images
    if (input.images && input.images.length > 0) {
      const validImages = input.images
        .filter((img) => img.storage_path && img.storage_path.trim().length > 0)
        .map((img, idx) => ({
          product_id: newProduct.id,
          storage_path: img.storage_path.trim(),
          alt_text: img.alt_text?.trim() || name,
          is_primary: idx === 0 || !!img.is_primary,
          sort_order: idx,
        }))

      if (validImages.length > 0) {
        let hasPrimary = false
        const sanitizedImages = validImages.map((img) => {
          if (img.is_primary && !hasPrimary) {
            hasPrimary = true
            return img
          }
          return { ...img, is_primary: false }
        })
        if (!hasPrimary && sanitizedImages.length > 0) {
          sanitizedImages[0].is_primary = true
        }

        await supabase.from('product_images').insert(sanitizedImages)
      }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/products')

    return { success: true, data: { id: newProduct.id } }
  } catch (err) {
    console.error('Unhandled exception in createProductAction:', err)
    return { error: 'An unexpected system error occurred while creating product.' }
  }
}

/**
 * Update an existing product, primary variant, and stock.
 */
export async function updateProductAction(
  productId: string,
  input: ProductInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const auth = await getAuthorizedAdmin()
    if (auth.error || !auth.supabase || !auth.user) {
      return { error: auth.error }
    }
    const { supabase, user } = auth

    // 1. Validation
    const name = input.name?.trim()
    if (!name) return { error: 'Product title is required.' }

    const slug = input.slug?.trim().toLowerCase()
    if (!slug) return { error: 'Product slug is required.' }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return { error: 'Slug must contain only lowercase letters, numbers, and hyphens.' }
    }

    const sku = input.sku?.trim().toUpperCase()
    if (!sku) return { error: 'SKU is required.' }

    if (isNaN(input.price) || input.price < 0) {
      return { error: 'Price must be a valid positive number.' }
    }
    const price_paise = Math.round(input.price * 100)

    let compare_at_price_paise: number | null = null
    if (input.compare_at_price !== null && input.compare_at_price !== undefined && input.compare_at_price > 0) {
      compare_at_price_paise = Math.round(input.compare_at_price * 100)
      if (compare_at_price_paise < price_paise) {
        return { error: 'Sale / compare-at price must be greater than or equal to regular price.' }
      }
    }

    const targetStock = Math.max(0, Math.floor(input.stock || 0))

    if (input.blouse_piece_included && (!input.blouse_piece_length_cm || input.blouse_piece_length_cm <= 0)) {
      return { error: 'Please specify the blouse piece length in cm when blouse piece is included.' }
    }

    // 2. Check slug uniqueness if changed
    const { data: existingSlug } = await supabase
      .from('products')
      .select('id')
      .ilike('slug', slug)
      .neq('id', productId)
      .maybeSingle()

    if (existingSlug) {
      return { error: `A product with slug "${slug}" already exists.` }
    }

    // 3. Find primary variant
    const { data: primaryVariant } = await supabase
      .from('product_variants')
      .select('id, stock_on_hand, sku')
      .eq('product_id', productId)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (primaryVariant) {
      // Check SKU uniqueness if changed
      const { data: existingSku } = await supabase
        .from('product_variants')
        .select('id')
        .ilike('sku', sku)
        .neq('id', primaryVariant.id)
        .maybeSingle()

      if (existingSku) {
        return { error: `A variant with SKU "${sku}" already exists.` }
      }

      // Update variant
      const { error: varErr } = await supabase
        .from('product_variants')
        .update({
          sku,
          price_paise,
          compare_at_price_paise,
          status: input.status === 'archived' ? 'archived' : 'active',
        })
        .eq('id', primaryVariant.id)

      if (varErr) {
        return { error: varErr.message || 'Failed to update variant details.' }
      }

      // Reconcile stock delta via ledger movement
      const currentStock = primaryVariant.stock_on_hand || 0
      const delta = targetStock - currentStock
      if (delta !== 0) {
        await supabase.from('inventory_movements').insert({
          variant_id: primaryVariant.id,
          quantity_delta: delta,
          reason: 'adjustment',
          note: `Inventory adjustment via admin console (${delta > 0 ? '+' : ''}${delta})`,
          created_by: user.id,
        })
      }
    }

    // 4. Update product details
    const { error: prodErr } = await supabase
      .from('products')
      .update({
        name,
        slug,
        short_description: input.short_description?.trim() || null,
        description: input.description?.trim() || null,
        status: input.status,
        fabric: input.fabric?.trim() || null,
        weave: input.weave?.trim() || null,
        color: input.color?.trim() || null,
        occasion: input.occasion?.trim() || null,
        saree_length_cm: input.saree_length_cm ? Number(input.saree_length_cm) : null,
        blouse_piece_included: !!input.blouse_piece_included,
        blouse_piece_length_cm: input.blouse_piece_included && input.blouse_piece_length_cm ? Number(input.blouse_piece_length_cm) : null,
        care_instructions: input.care_instructions?.trim() || null,
        hsn_code: input.hsn_code?.trim() || null,
        gst_rate: input.gst_rate !== undefined && input.gst_rate !== null ? Number(input.gst_rate) : null,
        is_featured: !!input.is_featured,
      })
      .eq('id', productId)

    if (prodErr) {
      console.error('Error updating product:', prodErr)
      return { error: prodErr.message || 'Failed to update product.' }
    }

    // 5. Sync category
    await supabase.from('product_categories').delete().eq('product_id', productId)
    if (input.category_id) {
      await supabase.from('product_categories').insert({
        product_id: productId,
        category_id: input.category_id,
      })
    }

    // 6. Sync collection
    await supabase.from('product_collections').delete().eq('product_id', productId)
    if (input.collection_id) {
      await supabase.from('product_collections').insert({
        product_id: productId,
        collection_id: input.collection_id,
        sort_order: 0,
      })
    }

    // 7. Sync product images
    if (input.images !== undefined) {
      await supabase.from('product_images').delete().eq('product_id', productId)

      const validImages = input.images
        .filter((img) => img.storage_path && img.storage_path.trim().length > 0)
        .map((img, idx) => ({
          product_id: productId,
          storage_path: img.storage_path.trim(),
          alt_text: img.alt_text?.trim() || name,
          is_primary: idx === 0 || !!img.is_primary,
          sort_order: idx,
        }))

      if (validImages.length > 0) {
        let hasPrimary = false
        const sanitizedImages = validImages.map((img) => {
          if (img.is_primary && !hasPrimary) {
            hasPrimary = true
            return img
          }
          return { ...img, is_primary: false }
        })
        if (!hasPrimary && sanitizedImages.length > 0) {
          sanitizedImages[0].is_primary = true
        }

        await supabase.from('product_images').insert(sanitizedImages)
      }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${productId}`)

    return { success: true, data: { id: productId } }
  } catch (err) {
    console.error('Unhandled exception in updateProductAction:', err)
    return { error: 'An unexpected system error occurred while updating product.' }
  }
}

/**
 * Safely archive/deactivate a product.
 */
export async function archiveProductAction(productId: string): Promise<ActionResponse<void>> {
  try {
    const auth = await getAuthorizedAdmin()
    if (auth.error || !auth.supabase) {
      return { error: auth.error }
    }
    const { supabase } = auth

    // Mark product as archived
    const { error: prodErr } = await supabase
      .from('products')
      .update({ status: 'archived' })
      .eq('id', productId)

    if (prodErr) {
      return { error: prodErr.message || 'Failed to archive product.' }
    }

    // Mark variants as archived
    await supabase
      .from('product_variants')
      .update({ status: 'archived' })
      .eq('product_id', productId)

    revalidatePath('/admin')
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${productId}`)

    return { success: true }
  } catch (err) {
    console.error('Unhandled exception in archiveProductAction:', err)
    return { error: 'Failed to archive product.' }
  }
}
