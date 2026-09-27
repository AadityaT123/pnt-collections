import { createClient } from './server'
import { assets } from '@/lib/assets'

export interface StorefrontProduct {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  fabric: string | null
  color: string | null
  occasion: string | null
  isFeatured: boolean
  pricePaise: number
  price: string
  compareAtPricePaise: number | null
  compareAtPrice: string | null
  isInStock: boolean
  primaryImage: string
  primaryImageAlt: string
}

export interface StorefrontCollection {
  id: string
  name: string
  slug: string
  description: string | null
  image_path: string | null
  sort_order: number
}

/**
 * Format paise into Indian Rupee string (e.g. 34500 -> ₹345)
 */
export function formatINR(paise: number): string {
  const rupees = paise / 100
  return `₹${rupees.toLocaleString('en-IN')}`
}

/**
/**
 * Fetch active collection metadata by slug (supporting both DB collections and curated themes).
 */
export async function getStorefrontCollectionBySlug(slug: string): Promise<{
  name: string
  description: string | null
} | null> {
  const manualThemes: Record<string, { name: string; description: string }> = {
    festive: {
      name: 'Festive Collection',
      description: 'Radiant sarees designed for celebrations, pujas, and joyous family milestones.',
    },
    wedding: {
      name: 'Wedding & Occasion',
      description: 'Regal bridal weaves, pure zari craftsmanship, and majestic heirloom silhouettes.',
    },
    'new-arrivals': {
      name: 'New Arrivals',
      description: 'Freshly arrived sarees from master weavers across India’s premier heritage clusters.',
    },
    everyday: {
      name: 'New Arrivals',
      description: 'Freshly arrived sarees from master weavers across India’s premier heritage clusters.',
    },
    'best-sellers': {
      name: 'Best Sellers',
      description: 'Our most-beloved signature sarees, cherished by patrons for their timeless beauty.',
    },
  }

  try {
    const supabase = await createClient()
    const { data: col } = await supabase
      .from('collections')
      .select('name, description')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle()

    if (col) {
      return { name: col.name, description: col.description }
    }

    if (manualThemes[slug]) {
      return manualThemes[slug]
    }

    return null
  } catch (error) {
    console.error('Error fetching collection by slug:', error)
    return null
  }
}

/**
 * Fetch all active storefront products with their images and active variant pricing/stock.
 * Uses the existing Supabase server client, products table, and catalog_product_variants view.
 * When collectionSlug is provided, filters to products assigned via product_collections.
 */
export async function getActiveStorefrontProducts(collectionSlug?: string): Promise<StorefrontProduct[]> {
  try {
    const supabase = await createClient()

    let filteredProductIds: string[] | null = null

    if (collectionSlug) {
      // 1. Check if an active collection matches this slug
      const { data: col } = await supabase
        .from('collections')
        .select('id')
        .eq('slug', collectionSlug)
        .eq('status', 'active')
        .maybeSingle()

      if (col) {
        // Query assigned products from product_collections
        const { data: prodCols } = await supabase
          .from('product_collections')
          .select('product_id, sort_order')
          .eq('collection_id', col.id)
          .order('sort_order', { ascending: true })

        filteredProductIds = (prodCols || []).map((pc) => pc.product_id)
        if (filteredProductIds.length === 0) {
          return []
        }
      }
    }

    // 2. Fetch active products with associated images
    let productsQuery = supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        short_description,
        fabric,
        color,
        occasion,
        is_featured,
        created_at,
        product_images (
          id,
          storage_path,
          alt_text,
          is_primary,
          sort_order
        )
      `)
      .eq('status', 'active')

    if (filteredProductIds !== null) {
      productsQuery = productsQuery.in('id', filteredProductIds)
    }

    const { data: products, error: prodError } = await productsQuery.order('created_at', {
      ascending: false,
    })

    if (prodError || !products || products.length === 0) {
      if (prodError) {
        console.error('Error fetching storefront products:', prodError)
      }
      return []
    }

    // 2. Fetch active variants from the public catalog view
    const { data: variants, error: varError } = await supabase
      .from('catalog_product_variants')
      .select('*')
      .eq('status', 'active')

    if (varError) {
      console.error('Error fetching catalog product variants:', varError)
    }

    // Index variants by product_id
    const variantsByProduct = new Map<string, NonNullable<typeof variants>>()
    if (variants) {
      for (const v of variants) {
        const list = variantsByProduct.get(v.product_id) || []
        list.push(v)
        variantsByProduct.set(v.product_id, list)
      }
    }

    // 3. Assemble and map products
    return products.map((prod) => {
      // Find primary image or lowest sort_order image
      const images = [...(prod.product_images || [])].sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1
        if (!a.is_primary && b.is_primary) return 1
        return a.sort_order - b.sort_order
      })

      const primaryImg = images[0]
      let imageUrl = assets.images.products.tealSaree
      let imageAlt = prod.name

      if (primaryImg?.storage_path) {
        const path = primaryImg.storage_path.trim()
        if (path.startsWith('http://') || path.startsWith('https://')) {
          imageUrl = path
        } else {
          const { data } = supabase.storage.from('product-images').getPublicUrl(path)
          imageUrl = data.publicUrl
        }
        imageAlt = primaryImg.alt_text || prod.name
      }

      // Pick default or first active variant
      const prodVariants = variantsByProduct.get(prod.id) || []
      const defaultVariant = prodVariants[0]

      const pricePaise = defaultVariant?.price_paise ?? 0
      const compareAtPricePaise = defaultVariant?.compare_at_price_paise ?? null
      const isInStock = defaultVariant?.is_in_stock ?? false

      const formattedPrice = formatINR(pricePaise)
      const formattedComparePrice =
        compareAtPricePaise && compareAtPricePaise > pricePaise
          ? formatINR(compareAtPricePaise)
          : null

      return {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        shortDescription: prod.short_description,
        fabric: prod.fabric,
        color: prod.color,
        occasion: prod.occasion,
        isFeatured: prod.is_featured,
        pricePaise,
        price: formattedPrice,
        compareAtPricePaise,
        compareAtPrice: formattedComparePrice,
        isInStock,
        primaryImage: imageUrl,
        primaryImageAlt: imageAlt,
      }
    })
  } catch (error) {
    console.error('Unexpected error fetching storefront products:', error)
    return []
  }
}

/**
 * Fetch all active public collections ordered by sort_order and creation date.
 */
export async function getActiveStorefrontCollections(): Promise<StorefrontCollection[]> {
  try {
    const supabase = await createClient()

    const { data: collections, error } = await supabase
      .from('collections')
      .select('id, name, slug, description, image_path, sort_order')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error || !collections) {
      if (error) {
        console.error('Error fetching storefront collections:', error)
      }
      return []
    }

    return collections.map((col) => {
      let resolvedImagePath: string | null = col.image_path ? col.image_path.trim() : null
      if (resolvedImagePath) {
        if (
          !resolvedImagePath.startsWith('http://') &&
          !resolvedImagePath.startsWith('https://') &&
          !resolvedImagePath.startsWith('/')
        ) {
          const { data } = supabase.storage.from('product-images').getPublicUrl(resolvedImagePath)
          resolvedImagePath = data.publicUrl
        }
      }
      return {
        ...col,
        image_path: resolvedImagePath,
      }
    })
  } catch (error) {
    console.error('Unexpected error in getActiveStorefrontCollections:', error)
    return []
  }
}

