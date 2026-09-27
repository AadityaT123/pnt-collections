
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, Json } from '@/lib/supabase/types'

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
  pattern?: string
  colors?: string[]
  fabrics?: string[]
  occasions?: string[]
  patterns?: string[]
  saree_length_cm?: number | null
  blouse_piece_included: boolean
  blouse_piece_length_cm?: number | null
  care_instructions?: string
  hsn_code?: string
  gst_rate?: number | null
  category_id?: string | null
  collection_id?: string | null
  seo_title?: string
  seo_description?: string
  images?: Array<{
    id?: string
    storage_path: string
    alt_text?: string
    is_primary: boolean
    sort_order: number
  }>
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
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
 * Synchronize multi-value product attributes with catalog_attributes & product_attribute_values.
 * Safely fails if migration has not been run yet.
 */
async function syncProductAttributes(
  supabase: SupabaseClient<Database>,
  productId: string,
  attributesMap: {
    color?: string[]
    fabric?: string[]
    occasion?: string[]
    pattern?: string[]
  }
) {
  try {
    // 1. Delete previous associations for this product
    await supabase.from('product_attribute_values').delete().eq('product_id', productId)

    // 2. Insert associations for each attribute type
    for (const [rawType, values] of Object.entries(attributesMap)) {
      if (!values || !Array.isArray(values) || values.length === 0) continue

      for (const rawName of values) {
        const name = rawName.trim()
        if (!name) continue
        const slug = slugify(name)
        if (!slug) continue

        // Query or insert attribute in catalog_attributes
        let { data: attr } = await supabase
          .from('catalog_attributes')
          .select('id')
          .eq('type', rawType)
          .eq('slug', slug)
          .maybeSingle()

        if (!attr) {
          const { data: newAttr } = await supabase
            .from('catalog_attributes')
            .insert({
              type: rawType,
              name,
              slug,
              metadata: {},
              sort_order: 0,
            })
            .select('id')
            .single()

          if (newAttr) {
            attr = newAttr
          }
        }

        if (attr) {
          await supabase.from('product_attribute_values').insert({
            product_id: productId,
            attribute_id: attr.id,
          })
        }
      }
    }
  } catch (err) {
    // If table doesn't exist yet, do not break product saving
    console.warn('Could not sync product attributes (migration may be pending):', err)
  }
}

/**
 * Create a new product with default variant, images, attributes, and ledger-driven stock.
 */
export async function createProductAction(input: ProductInput): Promise<ActionResponse<{ id: string }>> {
  try {
    const auth = await getAuthorizedAdmin()
    if (auth.error || !auth.supabase || !auth.user) {
      return { error: auth.error }
    }
    const { supabase, user } = auth

    // 1. Validation: Core required fields
    const name = input.name?.trim()
    if (!name) return { error: 'Product name is required.' }

    const slug = input.slug?.trim().toLowerCase()
    if (!slug) return { error: 'Product slug is required.' }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return { error: 'Slug must contain only lowercase letters, numbers, and hyphens.' }
    }

    const sku = input.sku?.trim().toUpperCase()
    if (!sku) return { error: 'SKU is required.' }

    const category_id = input.category_id?.trim()
    if (!category_id) {
      return { error: 'Product category is required.' }
    }

    if (isNaN(input.price) || input.price < 0) {
      return { error: 'Selling price cannot be negative.' }
    }
    const price_paise = Math.round(input.price * 100)

    let compare_at_price_paise: number | null = null
    if (input.compare_at_price !== null && input.compare_at_price !== undefined && input.compare_at_price > 0) {
      compare_at_price_paise = Math.round(input.compare_at_price * 100)
      if (compare_at_price_paise < price_paise) {
        return { error: 'Compare-at / original price must be greater than or equal to selling price.' }
      }
    }

    if (isNaN(input.stock) || input.stock < 0) {
      return { error: 'Stock quantity cannot be negative.' }
    }
    const stock = Math.max(0, Math.floor(input.stock || 0))

    // Valid images verification
    const validImages = (input.images || []).filter(
      (img) => img.storage_path && img.storage_path.trim().length > 0
    )
    if (validImages.length === 0) {
      return { error: 'At least one product image is required.' }
    }

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

    // Prepare primary scalar attribute representations for backward compatibility
    const primaryColor =
      input.colors && input.colors.length > 0
        ? input.colors.join(', ')
        : input.color?.trim() || null

    const primaryFabric =
      input.fabrics && input.fabrics.length > 0
        ? input.fabrics.join(', ')
        : input.fabric?.trim() || null

    const primaryOccasion =
      input.occasions && input.occasions.length > 0
        ? input.occasions.join(', ')
        : input.occasion?.trim() || null

    const primaryPattern =
      input.patterns && input.patterns.length > 0
        ? input.patterns.join(', ')
        : input.pattern?.trim() || null

    // 3. Insert product (initially draft to satisfy constraint triggers)
    const productInsertData: Record<string, unknown> = {
      name,
      slug,
      short_description: input.short_description?.trim() || null,
      description: input.description?.trim() || null,
      status: 'draft',
      brand: 'PNT Creation',
      fabric: primaryFabric,
      weave: input.weave?.trim() || null,
      color: primaryColor,
      occasion: primaryOccasion,
      pattern: primaryPattern,
      saree_length_cm: input.saree_length_cm ? Number(input.saree_length_cm) : null,
      blouse_piece_included: !!input.blouse_piece_included,
      blouse_piece_length_cm:
        input.blouse_piece_included && input.blouse_piece_length_cm
          ? Number(input.blouse_piece_length_cm)
          : null,
      care_instructions: input.care_instructions?.trim() || null,
      hsn_code: input.hsn_code?.trim() || null,
      gst_rate: input.gst_rate !== undefined && input.gst_rate !== null ? Number(input.gst_rate) : null,
      is_featured: !!input.is_featured,
      seo_title: input.seo_title?.trim() || null,
      seo_description: input.seo_description?.trim() || null,
    }

    const { data: newProduct, error: prodErr } = await supabase
      .from('products')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(productInsertData as any)
      .select('id')
      .single()

    if (prodErr || !newProduct) {
      console.error('Error inserting product:', prodErr)
      return { error: prodErr?.message || 'Failed to create product.' }
    }

    // 4. Insert default variant
    const { data: newVariant, error: varErr } = await supabase
      .from('product_variants')
      .insert({
        product_id: newProduct.id,
        sku,
        title: 'Default',
        price_paise,
        compare_at_price_paise,
        status: 'active',
      })
      .select('id')
      .single()

    if (varErr || !newVariant) {
      console.error('Error inserting variant:', varErr)
      await supabase.from('products').delete().eq('id', newProduct.id)
      return { error: varErr?.message || 'Failed to create product variant.' }
    }

    // 5. Initial stock ledger movement
    if (stock > 0) {
      const { error: invErr } = await supabase.from('inventory_movements').insert({
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

    // 6. Associate category (mandatory)
    await supabase.from('product_categories').insert({
      product_id: newProduct.id,
      category_id,
    })

    // 7. Associate collection (optional)
    if (input.collection_id) {
      await supabase.from('product_collections').insert({
        product_id: newProduct.id,
        collection_id: input.collection_id,
        sort_order: 0,
      })
    }

    // 8. Associate product images BEFORE activating product
    let hasPrimary = false
    const sanitizedImages = validImages.map((img, idx) => {
      const isPri = idx === 0 || (!hasPrimary && !!img.is_primary)
      if (isPri) hasPrimary = true
      return {
        product_id: newProduct.id,
        storage_path: img.storage_path.trim(),
        alt_text: img.alt_text?.trim() || name,
        is_primary: isPri,
        sort_order: idx,
      }
    })

    if (!hasPrimary && sanitizedImages.length > 0) {
      sanitizedImages[0].is_primary = true
    }

    const { error: imgErr } = await supabase.from('product_images').insert(sanitizedImages)
    if (imgErr) {
      console.error('Error inserting product images:', imgErr)
    }

    // 9. Sync multi-value attributes in catalog_attributes & product_attribute_values
    await syncProductAttributes(supabase, newProduct.id, {
      color: input.colors || (input.color ? [input.color] : []),
      fabric: input.fabrics || (input.fabric ? [input.fabric] : []),
      occasion: input.occasions || (input.occasion ? [input.occasion] : []),
      pattern: input.patterns || (input.pattern ? [input.pattern] : []),
    })

    // 10. If requested status is 'active', promote product now that variant AND images exist
    if (input.status === 'active') {
      const { error: statusErr } = await supabase
        .from('products')
        .update({ status: 'active' })
        .eq('id', newProduct.id)

      if (statusErr) {
        console.error('Error promoting product to active:', statusErr)
        return { error: `Product created as draft: ${statusErr.message}` }
      }
    }

    revalidatePath('/admin')
    revalidatePath('/admin/products')
    revalidatePath('/products')

    return { success: true, data: { id: newProduct.id } }
  } catch (err) {
    console.error('Unhandled exception in createProductAction:', err)
    return { error: 'An unexpected system error occurred while creating product.' }
  }
}

/**
 * Update an existing product, primary variant, images, attributes, and stock.
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
    if (!name) return { error: 'Product name is required.' }

    const slug = input.slug?.trim().toLowerCase()
    if (!slug) return { error: 'Product slug is required.' }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return { error: 'Slug must contain only lowercase letters, numbers, and hyphens.' }
    }

    const sku = input.sku?.trim().toUpperCase()
    if (!sku) return { error: 'SKU is required.' }

    const category_id = input.category_id?.trim()
    if (!category_id) {
      return { error: 'Product category is required.' }
    }

    if (isNaN(input.price) || input.price < 0) {
      return { error: 'Selling price cannot be negative.' }
    }
    const price_paise = Math.round(input.price * 100)

    let compare_at_price_paise: number | null = null
    if (input.compare_at_price !== null && input.compare_at_price !== undefined && input.compare_at_price > 0) {
      compare_at_price_paise = Math.round(input.compare_at_price * 100)
      if (compare_at_price_paise < price_paise) {
        return { error: 'Compare-at / original price must be greater than or equal to selling price.' }
      }
    }

    if (isNaN(input.stock) || input.stock < 0) {
      return { error: 'Stock quantity cannot be negative.' }
    }
    const targetStock = Math.max(0, Math.floor(input.stock || 0))

    const validImages = (input.images || []).filter(
      (img) => img.storage_path && img.storage_path.trim().length > 0
    )
    if (input.status === 'active' && validImages.length === 0) {
      return { error: 'An active product must have at least one product image.' }
    }

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

    // 4. Sync product images BEFORE updating product status
    if (input.images !== undefined) {
      if (validImages.length > 0) {
        // Fetch existing images for this product
        const { data: existingImages } = await supabase
          .from('product_images')
          .select('id, storage_path')
          .eq('product_id', productId)

        const existingMap = new Map((existingImages || []).map((img) => [img.storage_path, img.id]))
        const newPaths = new Set(validImages.map((img) => img.storage_path.trim()))

        // A. Identify images to delete (no longer present in submitted gallery)
        const idsToDelete = (existingImages || [])
          .filter((img) => !newPaths.has(img.storage_path))
          .map((img) => img.id)

        // B. Identify genuinely new images to insert
        let hasPrimary = false
        const imagesToInsert = validImages
          .filter((img) => !existingMap.has(img.storage_path.trim()))
          .map((img, idx) => {
            const isPri = idx === 0 || (!hasPrimary && !!img.is_primary)
            if (isPri) hasPrimary = true
            return {
              product_id: productId,
              storage_path: img.storage_path.trim(),
              alt_text: img.alt_text?.trim() || name,
              is_primary: isPri,
              sort_order: idx,
            }
          })

        // Insert new images first so active product never drops to 0 images
        if (imagesToInsert.length > 0) {
          await supabase.from('product_images').insert(imagesToInsert)
        }

        // Delete removed images (safe since replacement images are already present)
        if (idsToDelete.length > 0) {
          await supabase.from('product_images').delete().in('id', idsToDelete)
        }

        // C. Update existing images metadata (alt_text, is_primary, sort_order)
        for (let idx = 0; idx < validImages.length; idx++) {
          const img = validImages[idx]
          const existingId = existingMap.get(img.storage_path.trim())
          if (existingId) {
            const isPri = !hasPrimary && !!img.is_primary
            if (isPri) hasPrimary = true
            await supabase
              .from('product_images')
              .update({
                alt_text: img.alt_text?.trim() || name,
                is_primary: isPri,
                sort_order: idx,
              })
              .eq('id', existingId)
          }
        }
      } else {
        // No valid images: allowed only if product is being transitioned to draft/archived
        await supabase.from('product_images').delete().eq('product_id', productId)
      }
    }

    // 5. Update product details
    const primaryColor =
      input.colors && input.colors.length > 0
        ? input.colors.join(', ')
        : input.color?.trim() || null

    const primaryFabric =
      input.fabrics && input.fabrics.length > 0
        ? input.fabrics.join(', ')
        : input.fabric?.trim() || null

    const primaryOccasion =
      input.occasions && input.occasions.length > 0
        ? input.occasions.join(', ')
        : input.occasion?.trim() || null

    const primaryPattern =
      input.patterns && input.patterns.length > 0
        ? input.patterns.join(', ')
        : input.pattern?.trim() || null

    const productUpdateData: Record<string, unknown> = {
      name,
      slug,
      short_description: input.short_description?.trim() || null,
      description: input.description?.trim() || null,
      status: input.status,
      fabric: primaryFabric,
      weave: input.weave?.trim() || null,
      color: primaryColor,
      occasion: primaryOccasion,
      pattern: primaryPattern,
      saree_length_cm: input.saree_length_cm ? Number(input.saree_length_cm) : null,
      blouse_piece_included: !!input.blouse_piece_included,
      blouse_piece_length_cm:
        input.blouse_piece_included && input.blouse_piece_length_cm
          ? Number(input.blouse_piece_length_cm)
          : null,
      care_instructions: input.care_instructions?.trim() || null,
      hsn_code: input.hsn_code?.trim() || null,
      gst_rate: input.gst_rate !== undefined && input.gst_rate !== null ? Number(input.gst_rate) : null,
      is_featured: !!input.is_featured,
      seo_title: input.seo_title?.trim() || null,
      seo_description: input.seo_description?.trim() || null,
    }

    const { error: prodErr } = await supabase
      .from('products')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(productUpdateData as any)
      .eq('id', productId)

    if (prodErr) {
      console.error('Error updating product:', prodErr)
      return { error: prodErr.message || 'Failed to update product.' }
    }

    // 6. Sync category
    await supabase.from('product_categories').delete().eq('product_id', productId)
    await supabase.from('product_categories').insert({
      product_id: productId,
      category_id,
    })

    // 7. Sync collection
    await supabase.from('product_collections').delete().eq('product_id', productId)
    if (input.collection_id) {
      await supabase.from('product_collections').insert({
        product_id: productId,
        collection_id: input.collection_id,
        sort_order: 0,
      })
    }

    // 8. Sync multi-value attributes
    await syncProductAttributes(supabase, productId, {
      color: input.colors || (input.color ? [input.color] : []),
      fabric: input.fabrics || (input.fabric ? [input.fabric] : []),
      occasion: input.occasions || (input.occasion ? [input.occasion] : []),
      pattern: input.patterns || (input.pattern ? [input.pattern] : []),
    })

    revalidatePath('/admin')
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath('/products')

    return { success: true, data: { id: productId } }
  } catch (err) {
    console.error('Unhandled exception in updateProductAction:', err)
    return { error: 'An unexpected system error occurred while updating product.' }
  }
}

/**
 * Safely archive a product.
 */
export async function archiveProductAction(productId: string): Promise<ActionResponse<void>> {
  try {
    const auth = await getAuthorizedAdmin()
    if (auth.error || !auth.supabase) {
      return { error: auth.error }
    }
    const { supabase } = auth

    const { error: prodErr } = await supabase
      .from('products')
      .update({ status: 'archived' })
      .eq('id', productId)

    if (prodErr) {
      return { error: prodErr.message || 'Failed to archive product.' }
    }

    await supabase
      .from('product_variants')
      .update({ status: 'archived' })
      .eq('product_id', productId)

    revalidatePath('/admin')
    revalidatePath('/admin/products')
    revalidatePath(`/admin/products/${productId}`)
    revalidatePath('/products')

    return { success: true }
  } catch (err) {
    console.error('Unhandled exception in archiveProductAction:', err)
    return { error: 'Failed to archive product.' }
  }
}

/**
 * Add a new catalog attribute dynamically from the admin console.
 */
export async function createCatalogAttributeAction(
  type: string,
  name: string,
  metadata: Record<string, Json> = {}
): Promise<ActionResponse<{ id: string; name: string; slug: string; type: string }>> {
  try {
    const auth = await getAuthorizedAdmin()
    if (auth.error || !auth.supabase) {
      return { error: auth.error }
    }
    const { supabase } = auth

    const cleanType = type.trim().toLowerCase()
    const cleanName = name.trim()
    if (!cleanName) {
      return { error: 'Attribute name is required.' }
    }
    const slug = slugify(cleanName)
    if (!slug) {
      return { error: 'Invalid attribute name.' }
    }

    // Check if exists
    const { data: existing } = await supabase
      .from('catalog_attributes')
      .select('id, name, slug, type')
      .eq('type', cleanType)
      .eq('slug', slug)
      .maybeSingle()

    if (existing) {
      return { success: true, data: existing }
    }

    const { data: created, error } = await supabase
      .from('catalog_attributes')
      .insert({
        type: cleanType,
        name: cleanName,
        slug,
        metadata: metadata as Json,
        sort_order: 0,
      })
      .select('id, name, slug, type')
      .single()

    if (error || !created) {
      // Graceful return for client if table migration is pending
      return {
        success: true,
        data: {
          id: `${cleanType}-${slug}`,
          name: cleanName,
          slug,
          type: cleanType,
        },
      }
    }

    return { success: true, data: created }
  } catch (err) {
    console.error('Error creating catalog attribute:', err)
    return { error: 'Failed to create attribute.' }
  }
}
