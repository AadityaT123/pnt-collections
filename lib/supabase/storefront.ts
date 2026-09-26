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

/**
 * Format paise into Indian Rupee string (e.g. 34500 -> ₹345)
 */
export function formatINR(paise: number): string {
  const rupees = paise / 100
  return `₹${rupees.toLocaleString('en-IN')}`
}

/**
 * Fetch all active storefront products with their images and active variant pricing/stock.
 * Uses the existing Supabase server client, products table, and catalog_product_variants view.
 */
export async function getActiveStorefrontProducts(): Promise<StorefrontProduct[]> {
  try {
    const supabase = await createClient()

    // 1. Fetch active products with associated images
    const { data: products, error: prodError } = await supabase
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
      .order('created_at', { ascending: false })

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
