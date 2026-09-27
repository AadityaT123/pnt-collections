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
  pattern?: string | null
  colors?: string[]
  fabrics?: string[]
  occasions?: string[]
  patterns?: string[]
  isFeatured: boolean
  pricePaise: number
  price: string
  compareAtPricePaise: number | null
  compareAtPrice: string | null
  discountPercent?: number | null
  isInStock: boolean
  primaryImage: string
  primaryImageAlt: string
  categoryName?: string | null
  categorySlug?: string | null
  createdAt?: string
  isNew?: boolean
}

export interface StorefrontCollection {
  id: string
  name: string
  slug: string
  description: string | null
  image_path: string | null
  sort_order: number
}

export interface StorefrontCategory {
  id: string
  name: string
  slug: string
  count?: number
}

export interface PriceRangeOption {
  id: string
  label: string
  min: number | null // in rupees
  max: number | null // in rupees
}

export const PRICE_RANGES: PriceRangeOption[] = [
  { id: 'under-499', label: 'Under ₹499', min: null, max: 499 },
  { id: '500-999', label: '₹500 – ₹999', min: 500, max: 999 },
  { id: '1000-1499', label: '₹1,000 – ₹1,499', min: 1000, max: 1499 },
  { id: '1500-1999', label: '₹1,500 – ₹1,999', min: 1500, max: 1999 },
  { id: '2000-2999', label: '₹2,000 – ₹2,999', min: 2000, max: 2999 },
  { id: '3000-4999', label: '₹3,000 – ₹4,999', min: 3000, max: 4999 },
  { id: '5000-plus', label: '₹5,000+', min: 5000, max: null },
]

export interface CatalogFilterParams {
  category?: string
  collection?: string
  priceRange?: string
  priceRanges?: string[]
  minPrice?: number
  maxPrice?: number
  colors?: string[]
  fabrics?: string[]
  occasions?: string[]
  patterns?: string[]
  sort?: 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name-asc'
  page?: number
  pageSize?: number
}

export interface CatalogResult {
  products: StorefrontProduct[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  startIndex: number
  endIndex: number
}

export interface CatalogAttributeOption {
  id: string
  type: string
  name: string
  slug: string
  metadata?: Record<string, unknown>
  sort_order?: number
}

export const DEFAULT_SAREE_ATTRIBUTES: Record<
  string,
  Array<{ name: string; slug: string; metadata?: Record<string, unknown> }>
> = {
  color: [
    { name: 'Teal', slug: 'teal', metadata: { hex: '#008080' } },
    { name: 'Crimson Red', slug: 'crimson-red', metadata: { hex: '#990000' } },
    { name: 'Royal Blue', slug: 'royal-blue', metadata: { hex: '#4169E1' } },
    { name: 'Emerald Green', slug: 'emerald-green', metadata: { hex: '#046307' } },
    { name: 'Mustard Yellow', slug: 'mustard-yellow', metadata: { hex: '#E1AD01' } },
    { name: 'Magenta Pink', slug: 'magenta-pink', metadata: { hex: '#C71585' } },
    { name: 'Antique Gold', slug: 'antique-gold', metadata: { hex: '#CFB53B' } },
    { name: 'Coral Peach', slug: 'coral-peach', metadata: { hex: '#F88379' } },
    { name: 'Wine Purple', slug: 'wine-purple', metadata: { hex: '#722F37' } },
    { name: 'Midnight Black', slug: 'midnight-black', metadata: { hex: '#1A1A1A' } },
  ],
  fabric: [
    { name: 'Pure Silk', slug: 'pure-silk' },
    { name: 'Katan Silk', slug: 'katan-silk' },
    { name: 'Banarasi Georgette', slug: 'banarasi-georgette' },
    { name: 'Chanderi Silk', slug: 'chanderi-silk' },
    { name: 'Organza', slug: 'organza' },
    { name: 'Tussar Silk', slug: 'tussar-silk' },
    { name: 'Moonga Silk', slug: 'moonga-silk' },
    { name: 'Linen Cotton', slug: 'linen-cotton' },
    { name: 'Tissue Silk', slug: 'tissue-silk' },
  ],
  occasion: [
    { name: 'Wedding & Bridal', slug: 'wedding-bridal' },
    { name: 'Festive & Puja', slug: 'festive-puja' },
    { name: 'Reception & Cocktail', slug: 'reception-cocktail' },
    { name: 'Evening Soiree', slug: 'evening-soiree' },
    { name: 'Traditional Rituals', slug: 'traditional-rituals' },
    { name: 'Daily Luxury', slug: 'daily-luxury' },
  ],
  pattern: [
    { name: 'Zari Brocade', slug: 'zari-brocade' },
    { name: 'Floral Jaal', slug: 'floral-jaal' },
    { name: 'Paisley / Kalka', slug: 'paisley-kalka' },
    { name: 'Geometric Buta', slug: 'geometric-buta' },
    { name: 'Temple Border', slug: 'temple-border' },
    { name: 'Jangla Weave', slug: 'jangla-weave' },
    { name: 'Shikargah Motifs', slug: 'shikargah-motifs' },
  ],
}

export const DEFAULT_SAREE_CATEGORIES: StorefrontCategory[] = [
  { id: 'cat-all', name: 'All Sarees', slug: 'all' },
  { id: 'cat-banarasi', name: 'Banarasi Sarees', slug: 'banarasi-sarees' },
  { id: 'cat-kanjeevaram', name: 'Kanjeevaram Sarees', slug: 'kanjeevaram-sarees' },
  { id: 'cat-chanderi', name: 'Chanderi Sarees', slug: 'chanderi-sarees' },
  { id: 'cat-silk', name: 'Pure Silk Sarees', slug: 'pure-silk-sarees' },
  { id: 'cat-georgette', name: 'Georgette & Chiffon', slug: 'georgette-chiffon' },
  { id: 'cat-organza', name: 'Organza Sarees', slug: 'organza-sarees' },
  { id: 'cat-festive', name: 'Festive & Bridal', slug: 'festive-bridal-sarees' },
]

/**
 * Format paise into Indian Rupee string (e.g. 34500 -> ₹345)
 */
export function formatINR(paise: number): string {
  const rupees = paise / 100
  return `₹${rupees.toLocaleString('en-IN')}`
}

/**
 * Fetch active collection metadata by slug.
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
      name: 'Daily Wear Sarees',
      description: 'Featherweight, breathable sarees tailored for daily grace and effortless elegance.',
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
 * Fetch active storefront categories.
 */
export async function getStorefrontCategories(): Promise<StorefrontCategory[]> {
  try {
    const supabase = await createClient()
    const { data: dbCategories, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })

    if (!error && dbCategories && dbCategories.length > 0) {
      return [
        { id: 'all', name: 'All Sarees', slug: 'all' },
        ...dbCategories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        })),
      ]
    }
  } catch {
    // Database table may be empty; fallback gracefully
  }

  return DEFAULT_SAREE_CATEGORIES
}

/**
 * Fetch catalog attributes dynamically from DB, with fallback to standard presets.
 */
export async function getCatalogAttributes(typeFilter?: string): Promise<CatalogAttributeOption[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('catalog_attributes')
      .select('id, type, name, slug, metadata, sort_order')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (typeFilter) {
      query = query.eq('type', typeFilter)
    }

    const { data, error } = await query

    if (!error && data && data.length > 0) {
      return data.map((d) => ({
        id: d.id,
        type: d.type,
        name: d.name,
        slug: d.slug,
        metadata: (d.metadata as Record<string, unknown>) || {},
        sort_order: d.sort_order,
      }))
    }
  } catch {
    // Database table may not be migrated yet; fallback gracefully
  }

  const results: CatalogAttributeOption[] = []
  const types = typeFilter ? [typeFilter] : Object.keys(DEFAULT_SAREE_ATTRIBUTES)

  for (const t of types) {
    const list = DEFAULT_SAREE_ATTRIBUTES[t] || []
    list.forEach((item, index) => {
      results.push({
        id: `${t}-${item.slug}`,
        type: t,
        name: item.name,
        slug: item.slug,
        metadata: item.metadata || {},
        sort_order: index + 1,
      })
    })
  }

  return results
}

/**
 * Fetch all active storefront collections.
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

/**
 * Primary Storefront Catalog Query with full multi-filter support, sorting, and pagination.
 */
export async function getStorefrontCatalog(params: CatalogFilterParams = {}): Promise<CatalogResult> {
  try {
    const supabase = await createClient()

    // 1. Fetch active products with images, categories, and attributes
    const { data: rawProducts, error: prodErr } = await supabase
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
        ),
        product_categories (
          category_id,
          categories (
            id,
            name,
            slug
          )
        ),
        product_collections (
          collection_id,
          collections (
            id,
            slug
          )
        )
      `)
      .eq('status', 'active')

    if (prodErr || !rawProducts || rawProducts.length === 0) {
      return {
        products: [],
        totalCount: 0,
        page: 1,
        pageSize: params.pageSize || 12,
        totalPages: 1,
        startIndex: 0,
        endIndex: 0,
      }
    }

    // 2. Fetch active variants via security-barrier view
    const { data: variants } = await supabase
      .from('catalog_product_variants')
      .select('*')
      .eq('status', 'active')

    const variantsByProduct = new Map<string, NonNullable<typeof variants>>()
    if (variants) {
      for (const v of variants) {
        const list = variantsByProduct.get(v.product_id) || []
        list.push(v)
        variantsByProduct.set(v.product_id, list)
      }
    }

    // 3. Fetch product attribute values from junction table (if available)
    const attributesByProduct = new Map<string, Record<string, string[]>>()
    try {
      const { data: pavList } = await supabase
        .from('product_attribute_values')
        .select(`
          product_id,
          attribute:catalog_attributes (
            type,
            name
          )
        `)

      if (pavList && pavList.length > 0) {
        for (const item of pavList) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const attr = (item as any).attribute
          if (attr && item.product_id) {
            const map = attributesByProduct.get(item.product_id) || {}
            const list = map[attr.type] || []
            if (!list.includes(attr.name)) list.push(attr.name)
            map[attr.type] = list
            attributesByProduct.set(item.product_id, map)
          }
        }
      }
    } catch {
      // Junction table may be pending migration
    }

    // 4. Transform and assemble full product objects
    const assembledProducts: StorefrontProduct[] = rawProducts.map((prod) => {
      // Images
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

      // Variant & Price
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

      const discountPercent =
        compareAtPricePaise && compareAtPricePaise > pricePaise
          ? Math.round(((compareAtPricePaise - pricePaise) / compareAtPricePaise) * 100)
          : null

      // Attributes
      const prodAttrs = attributesByProduct.get(prod.id) || {}
      const colors =
        prodAttrs['color'] ||
        (prod.color ? prod.color.split(',').map((c) => c.trim()).filter(Boolean) : [])
      const fabrics =
        prodAttrs['fabric'] ||
        (prod.fabric ? prod.fabric.split(',').map((f) => f.trim()).filter(Boolean) : [])
      const occasions =
        prodAttrs['occasion'] ||
        (prod.occasion ? prod.occasion.split(',').map((o) => o.trim()).filter(Boolean) : [])

      const patternVal = (prod as Record<string, unknown>).pattern as string | null
      const patterns =
        prodAttrs['pattern'] ||
        (patternVal ? patternVal.split(',').map((p) => p.trim()).filter(Boolean) : [])

      // Primary Category
      const catRel = prod.product_categories?.[0]
      const categoryName = catRel?.categories?.name || null
      const categorySlug = catRel?.categories?.slug || null

      return {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        shortDescription: prod.short_description,
        fabric: fabrics.join(', ') || prod.fabric || null,
        color: colors.join(', ') || prod.color || null,
        occasion: occasions.join(', ') || prod.occasion || null,
        pattern: patterns.join(', ') || patternVal || null,
        colors,
        fabrics,
        occasions,
        patterns,
        isFeatured: prod.is_featured,
        pricePaise,
        price: formattedPrice,
        compareAtPricePaise,
        compareAtPrice: formattedComparePrice,
        discountPercent,
        isInStock,
        primaryImage: imageUrl,
        primaryImageAlt: imageAlt,
        categoryName,
        categorySlug,
        createdAt: prod.created_at,
        isNew: prod.created_at
          ? Date.now() - new Date(prod.created_at).getTime() < 14 * 24 * 60 * 60 * 1000
          : false,
      }
    })

    // 5. Apply multi-condition filters in memory
    let filtered = assembledProducts

    // 5A. Collection Filter
    if (params.collection) {
      const colSlug = params.collection.toLowerCase().trim()
      filtered = filtered.filter((p) => {
        const prodRaw = rawProducts.find((r) => r.id === p.id)
        const cols = prodRaw?.product_collections || []
        return cols.some((pc) => pc.collections?.slug?.toLowerCase() === colSlug)
      })
    }

    // 5B. Category Filter
    if (params.category && params.category !== 'all') {
      const cat = params.category.toLowerCase().trim()
      if (cat === 'new-arrivals') {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
        filtered = filtered.filter((p) => {
          if (!p.createdAt) return true
          return new Date(p.createdAt).getTime() >= thirtyDaysAgo
        })
      } else if (cat === 'best-sellers') {
        filtered = filtered.filter((p) => p.isFeatured)
      } else {
        filtered = filtered.filter((p) => {
          const prodRaw = rawProducts.find((r) => r.id === p.id)
          const cats = prodRaw?.product_categories || []
          return (
            p.categorySlug?.toLowerCase() === cat ||
            cats.some((c) => c.categories?.slug?.toLowerCase() === cat)
          )
        })
      }
    }

    // 5C. Price Range Filter
    const activePriceRanges = params.priceRanges || (params.priceRange ? [params.priceRange] : [])
    if (activePriceRanges.length > 0) {
      filtered = filtered.filter((p) => {
        const priceRupees = p.pricePaise / 100
        return activePriceRanges.some((rangeId) => {
          const rangeDef = PRICE_RANGES.find((r) => r.id === rangeId)
          if (!rangeDef) return true
          const minOk = rangeDef.min === null || priceRupees >= rangeDef.min
          const maxOk = rangeDef.max === null || priceRupees <= rangeDef.max
          return minOk && maxOk
        })
      })
    } else if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      const min = params.minPrice !== undefined ? params.minPrice * 100 : 0
      const max = params.maxPrice !== undefined ? params.maxPrice * 100 : Infinity
      filtered = filtered.filter((p) => p.pricePaise >= min && p.pricePaise <= max)
    }

    // 5D. Color Filter
    if (params.colors && params.colors.length > 0) {
      const filterColors = params.colors.map((c) => c.toLowerCase().trim())
      filtered = filtered.filter((p) => {
        const prodColors = (p.colors || []).map((c) => c.toLowerCase())
        if (p.color) {
          p.color.split(',').forEach((c) => {
            const trimmed = c.trim().toLowerCase()
            if (trimmed && !prodColors.includes(trimmed)) prodColors.push(trimmed)
          })
        }
        return filterColors.some((fc) => prodColors.some((pc) => pc.includes(fc) || fc.includes(pc)))
      })
    }

    // 5E. Fabric Filter
    if (params.fabrics && params.fabrics.length > 0) {
      const filterFabrics = params.fabrics.map((f) => f.toLowerCase().trim())
      filtered = filtered.filter((p) => {
        const prodFabrics = (p.fabrics || []).map((f) => f.toLowerCase())
        if (p.fabric) {
          p.fabric.split(',').forEach((f) => {
            const trimmed = f.trim().toLowerCase()
            if (trimmed && !prodFabrics.includes(trimmed)) prodFabrics.push(trimmed)
          })
        }
        return filterFabrics.some((ff) => prodFabrics.some((pf) => pf.includes(ff) || ff.includes(pf)))
      })
    }

    // 5F. Occasion Filter
    if (params.occasions && params.occasions.length > 0) {
      const filterOccasions = params.occasions.map((o) => o.toLowerCase().trim())
      filtered = filtered.filter((p) => {
        const prodOccasions = (p.occasions || []).map((o) => o.toLowerCase())
        if (p.occasion) {
          p.occasion.split(',').forEach((o) => {
            const trimmed = o.trim().toLowerCase()
            if (trimmed && !prodOccasions.includes(trimmed)) prodOccasions.push(trimmed)
          })
        }
        return filterOccasions.some((fo) => prodOccasions.some((po) => po.includes(fo) || fo.includes(po)))
      })
    }

    // 5G. Pattern Filter
    if (params.patterns && params.patterns.length > 0) {
      const filterPatterns = params.patterns.map((pt) => pt.toLowerCase().trim())
      filtered = filtered.filter((p) => {
        const prodPatterns = (p.patterns || []).map((pt) => pt.toLowerCase())
        if (p.pattern) {
          p.pattern.split(',').forEach((pt) => {
            const trimmed = pt.trim().toLowerCase()
            if (trimmed && !prodPatterns.includes(trimmed)) prodPatterns.push(trimmed)
          })
        }
        return filterPatterns.some((fpt) => prodPatterns.some((ppt) => ppt.includes(fpt) || fpt.includes(ppt)))
      })
    }

    // 6. Sorting
    const sort = params.sort || 'featured'
    filtered.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        case 'price-asc':
          return a.pricePaise - b.pricePaise
        case 'price-desc':
          return b.pricePaise - a.pricePaise
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'featured':
        default:
          if (a.isFeatured !== b.isFeatured) {
            return a.isFeatured ? -1 : 1
          }
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      }
    })

    // 7. Pagination
    const totalCount = filtered.length
    const pageSize = params.pageSize || 12
    const page = Math.max(1, params.page || 1)
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
    const offset = (page - 1) * pageSize
    const paginatedProducts = filtered.slice(offset, offset + pageSize)

    const startIndex = totalCount === 0 ? 0 : offset + 1
    const endIndex = Math.min(offset + pageSize, totalCount)

    return {
      products: paginatedProducts,
      totalCount,
      page,
      pageSize,
      totalPages,
      startIndex,
      endIndex,
    }
  } catch (error) {
    console.error('Unexpected error in getStorefrontCatalog:', error)
    return {
      products: [],
      totalCount: 0,
      page: 1,
      pageSize: params.pageSize || 12,
      totalPages: 1,
      startIndex: 0,
      endIndex: 0,
    }
  }
}

/**
 * Backward compatibility wrapper for getActiveStorefrontProducts.
 */
export async function getActiveStorefrontProducts(collectionSlug?: string): Promise<StorefrontProduct[]> {
  const result = await getStorefrontCatalog({
    collection: collectionSlug,
    pageSize: 100,
  })
  return result.products
}
