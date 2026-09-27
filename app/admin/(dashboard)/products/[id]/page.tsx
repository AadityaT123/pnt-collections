import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductForm, { type ProductFormData } from '@/components/admin/ProductForm'
import { getCatalogAttributes } from '@/lib/supabase/storefront'

export const metadata = {
  title: 'Edit Product | PNT Creation Admin',
  description: 'Update saree catalog product specifications and inventory.',
}

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch the product
  const { data: product, error: prodErr } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (prodErr || !product) {
    notFound()
  }

  // 2. Fetch primary variant
  const { data: variant } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  // 3. Fetch product categories
  const { data: prodCats } = await supabase
    .from('product_categories')
    .select('category_id')
    .eq('product_id', id)
    .limit(1)

  // 4. Fetch product collections
  const { data: prodCols } = await supabase
    .from('product_collections')
    .select('collection_id')
    .eq('product_id', id)
    .limit(1)

  // 5. Fetch product images
  const { data: images } = await supabase
    .from('product_images')
    .select('id, storage_path, alt_text, is_primary, sort_order')
    .eq('product_id', id)
    .order('sort_order', { ascending: true })

  // 6. Fetch taxonomy options
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .neq('status', 'archived')
    .order('name', { ascending: true })

  const { data: collections } = await supabase
    .from('collections')
    .select('id, name')
    .neq('status', 'archived')
    .order('name', { ascending: true })

  // 7. Fetch multi-value product attributes from junction table with fallback
  let colors: string[] = []
  let fabrics: string[] = []
  let occasions: string[] = []
  let patterns: string[] = []

  try {
    const { data: pavList } = await supabase
      .from('product_attribute_values')
      .select('attribute:catalog_attributes (id, type, name, slug)')
      .eq('product_id', id)

    if (pavList && pavList.length > 0) {
      for (const item of pavList) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const attr = (item as any).attribute
        if (attr) {
          if (attr.type === 'color') colors.push(attr.name)
          else if (attr.type === 'fabric') fabrics.push(attr.name)
          else if (attr.type === 'occasion') occasions.push(attr.name)
          else if (attr.type === 'pattern') patterns.push(attr.name)
        }
      }
    }
  } catch {
    // If table not yet created, fall back to scalar fields
  }

  // Graceful fallback to scalar columns if junction returned none
  if (colors.length === 0 && product.color) {
    colors = product.color.split(',').map((c) => c.trim()).filter(Boolean)
  }
  if (fabrics.length === 0 && product.fabric) {
    fabrics = product.fabric.split(',').map((f) => f.trim()).filter(Boolean)
  }
  if (occasions.length === 0 && product.occasion) {
    occasions = product.occasion.split(',').map((o) => o.trim()).filter(Boolean)
  }
  const prodPattern = (product as Record<string, unknown>).pattern as string | null
  if (patterns.length === 0 && prodPattern) {
    patterns = prodPattern.split(',').map((p) => p.trim()).filter(Boolean)
  }

  // 8. Fetch attributes catalog foundation
  const initialAttributes = await getCatalogAttributes()

  const initialData: ProductFormData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    short_description: product.short_description || '',
    description: product.description || '',
    price: variant ? variant.price_paise / 100 : 0,
    compare_at_price: variant?.compare_at_price_paise ? variant.compare_at_price_paise / 100 : null,
    sku: variant?.sku || '',
    stock: variant?.stock_on_hand ?? 0,
    status: product.status as 'draft' | 'active' | 'archived',
    is_featured: product.is_featured,
    fabric: product.fabric || '',
    weave: product.weave || '',
    color: product.color || '',
    occasion: product.occasion || '',
    pattern: prodPattern || '',
    colors,
    fabrics,
    occasions,
    patterns,
    saree_length_cm: product.saree_length_cm,
    blouse_piece_included: product.blouse_piece_included,
    blouse_piece_length_cm: product.blouse_piece_length_cm,
    care_instructions: product.care_instructions || '',
    hsn_code: product.hsn_code || '',
    gst_rate: product.gst_rate !== null ? Number(product.gst_rate) : null,
    category_id: prodCats && prodCats.length > 0 ? prodCats[0].category_id : null,
    collection_id: prodCols && prodCols.length > 0 ? prodCols[0].collection_id : null,
    seo_title: product.seo_title || '',
    seo_description: product.seo_description || '',
    images: (images || []).map((img) => ({
      id: img.id,
      storage_path: img.storage_path,
      alt_text: img.alt_text || '',
      is_primary: img.is_primary,
      sort_order: img.sort_order,
    })),
  }

  return (
    <ProductForm
      mode="edit"
      initialData={initialData}
      categories={categories || []}
      collections={collections || []}
      initialAttributes={initialAttributes}
    />
  )
}
