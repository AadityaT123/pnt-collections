import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'
import { getCatalogAttributes } from '@/lib/supabase/storefront'

export const metadata = {
  title: 'New Product | PNT Creation Admin',
  description: 'Add a new saree product to the catalog.',
}

export default async function NewProductPage() {
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .neq('status', 'archived')
    .order('name', { ascending: true })

  // Fetch collections
  const { data: collections } = await supabase
    .from('collections')
    .select('id, name')
    .neq('status', 'archived')
    .order('name', { ascending: true })

  // Fetch attributes foundation (colors, fabrics, occasions, patterns)
  const initialAttributes = await getCatalogAttributes()

  return (
    <ProductForm
      mode="create"
      categories={categories || []}
      collections={collections || []}
      initialAttributes={initialAttributes}
    />
  )
}
