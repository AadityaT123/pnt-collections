'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type ActionResponse<T = unknown> = {
  success?: boolean
  data?: T
  error?: string
}

export interface CollectionInput {
  name: string
  slug: string
  description?: string | null
  image_path?: string | null
  banner_path?: string | null
  sort_order?: number
  status: 'draft' | 'active' | 'archived'
  seo_title?: string | null
  seo_description?: string | null
  product_ids?: string[]
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
 * Helper to slugify a string
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * Create a new collection
 */
export async function createCollectionAction(
  input: CollectionInput
): Promise<ActionResponse<{ id: string; slug: string }>> {
  try {
    const authResult = await getAuthorizedAdmin()
    if ('error' in authResult) {
      return { error: authResult.error }
    }
    const { supabase } = authResult

    const name = input.name?.trim()
    if (!name) {
      return { error: 'Collection name is required.' }
    }

    let slug = input.slug?.trim() ? slugify(input.slug) : slugify(name)
    if (!slug) {
      slug = `collection-${Date.now()}`
    }

    // Check slug collision
    const { data: existingSlug } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`
    }

    const { data: newCollection, error: insertError } = await supabase
      .from('collections')
      .insert({
        name,
        slug,
        description: input.description?.trim() || null,
        image_path: input.image_path?.trim() || null,
        banner_path: input.banner_path?.trim() || null,
        sort_order: typeof input.sort_order === 'number' ? input.sort_order : 0,
        status: input.status || 'draft',
        seo_title: input.seo_title?.trim() || null,
        seo_description: input.seo_description?.trim() || null,
      })
      .select('id, slug')
      .single()

    if (insertError || !newCollection) {
      console.error('Error creating collection:', insertError)
      return { error: insertError?.message || 'Failed to create collection.' }
    }

    // Persist product assignments if provided
    if (Array.isArray(input.product_ids) && input.product_ids.length > 0) {
      const rows = input.product_ids.map((prodId, idx) => ({
        product_id: prodId,
        collection_id: newCollection.id,
        sort_order: idx,
      }))
      const { error: assocError } = await supabase
        .from('product_collections')
        .insert(rows)

      if (assocError) {
        console.error('Error assigning products to collection:', assocError)
      }
    }

    revalidatePath('/admin/collections')
    revalidatePath('/admin/products')
    revalidatePath('/collections')
    revalidatePath('/products')
    revalidatePath('/')

    return {
      success: true,
      data: { id: newCollection.id, slug: newCollection.slug },
    }
  } catch (err: unknown) {
    console.error('Unexpected error in createCollectionAction:', err)
    return {
      error: err instanceof Error ? err.message : 'An unexpected error occurred while creating collection.',
    }
  }
}

/**
 * Update an existing collection
 */
export async function updateCollectionAction(
  id: string,
  input: CollectionInput
): Promise<ActionResponse<{ id: string; slug: string }>> {
  try {
    const authResult = await getAuthorizedAdmin()
    if ('error' in authResult) {
      return { error: authResult.error }
    }
    const { supabase } = authResult

    const name = input.name?.trim()
    if (!name) {
      return { error: 'Collection name is required.' }
    }

    let slug = input.slug?.trim() ? slugify(input.slug) : slugify(name)
    if (!slug) {
      slug = `collection-${Date.now()}`
    }

    // Check if slug belongs to another collection
    const { data: existingSlug } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .maybeSingle()

    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`
    }

    const { data: updatedCollection, error: updateError } = await supabase
      .from('collections')
      .update({
        name,
        slug,
        description: input.description?.trim() || null,
        image_path: input.image_path?.trim() || null,
        banner_path: input.banner_path?.trim() || null,
        sort_order: typeof input.sort_order === 'number' ? input.sort_order : 0,
        status: input.status || 'draft',
        seo_title: input.seo_title?.trim() || null,
        seo_description: input.seo_description?.trim() || null,
      })
      .eq('id', id)
      .select('id, slug')
      .single()

    if (updateError || !updatedCollection) {
      console.error('Error updating collection:', updateError)
      return { error: updateError?.message || 'Failed to update collection.' }
    }

    // Persist product assignments if provided
    if (Array.isArray(input.product_ids)) {
      // 1. Clear existing collection assignments
      const { error: delError } = await supabase
        .from('product_collections')
        .delete()
        .eq('collection_id', id)

      if (delError) {
        console.error('Error deleting previous collection product associations:', delError)
      }

      // 2. Insert new collection assignments
      if (input.product_ids.length > 0) {
        const rows = input.product_ids.map((prodId, idx) => ({
          product_id: prodId,
          collection_id: id,
          sort_order: idx,
        }))
        const { error: assocError } = await supabase
          .from('product_collections')
          .insert(rows)

        if (assocError) {
          console.error('Error assigning products to collection:', assocError)
        }
      }
    }

    revalidatePath('/admin/collections')
    revalidatePath(`/admin/collections/${id}`)
    revalidatePath('/admin/products')
    revalidatePath('/collections')
    revalidatePath('/products')
    revalidatePath('/')

    return {
      success: true,
      data: { id: updatedCollection.id, slug: updatedCollection.slug },
    }
  } catch (err: unknown) {
    console.error('Unexpected error in updateCollectionAction:', err)
    return {
      error: err instanceof Error ? err.message : 'An unexpected error occurred while updating collection.',
    }
  }
}

/**
 * Delete a collection
 */
export async function deleteCollectionAction(
  id: string
): Promise<ActionResponse<void>> {
  try {
    const authResult = await getAuthorizedAdmin()
    if ('error' in authResult) {
      return { error: authResult.error }
    }
    const { supabase } = authResult

    const { error: deleteError } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting collection:', deleteError)
      return { error: deleteError.message || 'Failed to delete collection.' }
    }

    revalidatePath('/admin/collections')
    revalidatePath('/admin/products')
    revalidatePath('/')

    return { success: true }
  } catch (err: unknown) {
    console.error('Unexpected error in deleteCollectionAction:', err)
    return {
      error: err instanceof Error ? err.message : 'An unexpected error occurred while deleting collection.',
    }
  }
}
