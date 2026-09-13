import { createClient } from '@/lib/supabase/server'
import ProductList, { type ProductListItem } from '@/components/admin/ProductList'

export const metadata = {
  title: 'Products | PNT Creation Admin',
  description: 'Manage saree catalog, variants, pricing, and inventory.',
}

interface QueriedVariant {
  id: string
  sku: string
  price_paise: number
  compare_at_price_paise: number | null
  stock_on_hand: number
  status: string
}

interface QueriedCategoryRel {
  category_id: string
  categories: {
    id: string
    name: string
  } | null
}

interface QueriedImage {
  id: string
  storage_path: string
  alt_text: string | null
  is_primary: boolean
  sort_order: number
}

interface QueriedProduct {
  id: string
  name: string
  slug: string
  status: string
  is_featured: boolean
  created_at: string
  product_variants: QueriedVariant[]
  product_categories: QueriedCategoryRel[]
  product_images: QueriedImage[]
}

export default async function AdminProductsPage() {
  const supabase = await createClient()

  // Fetch products with their variants, categories, and images
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      status,
      is_featured,
      created_at,
      product_variants (
        id,
        sku,
        price_paise,
        compare_at_price_paise,
        stock_on_hand,
        status
      ),
      product_categories (
        category_id,
        categories (
          id,
          name
        )
      ),
      product_images (
        id,
        storage_path,
        alt_text,
        is_primary,
        sort_order
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin products:', error)
  }

  const typedProducts = (products as unknown as QueriedProduct[]) || []

  // Transform data for the client component
  const productListItems: ProductListItem[] = typedProducts.map((p) => {
    // Primary/default variant
    const variant = Array.isArray(p.product_variants) && p.product_variants.length > 0
      ? p.product_variants[0]
      : null

    // Category name
    const categoryRel = Array.isArray(p.product_categories) && p.product_categories.length > 0
      ? p.product_categories[0]
      : null
    const categoryName = categoryRel?.categories?.name || null

    // Primary image
    const images = Array.isArray(p.product_images) ? p.product_images : []
    const primaryImg = images.find((img) => img.is_primary) || images[0]
    const primaryImageUrl = primaryImg?.storage_path || null

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      status: p.status as 'draft' | 'active' | 'archived',
      is_featured: p.is_featured,
      created_at: p.created_at,
      variant: variant
        ? {
            id: variant.id,
            sku: variant.sku,
            price_paise: variant.price_paise,
            compare_at_price_paise: variant.compare_at_price_paise,
            stock_on_hand: variant.stock_on_hand,
            status: variant.status,
          }
        : null,
      categoryName,
      primaryImageUrl,
    }
  })

  return <ProductList initialProducts={productListItems} />
}
