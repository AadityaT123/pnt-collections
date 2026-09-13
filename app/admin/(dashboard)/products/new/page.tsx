import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'

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

  return (
    <ProductForm
      mode="create"
      categories={categories || []}
      collections={collections || []}
    />
  )
}
