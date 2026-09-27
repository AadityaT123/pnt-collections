import { createClient } from '@/lib/supabase/server'
import CollectionForm, { type AvailableProduct } from '@/components/admin/CollectionForm'

export const metadata = {
  title: 'New Collection | PNT Creation Admin',
  description: 'Create a new saree collection with custom 4:5 cover photo and details.',
}

export default async function NewCollectionPage() {
  const supabase = await createClient()

  // Fetch available products
  const { data: products } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      status,
      product_images (
        storage_path,
        is_primary,
        sort_order
      )
    `)
    .order('created_at', { ascending: false })

  const availableProducts: AvailableProduct[] = (products || []).map((p) => {
    const images = [...(p.product_images || [])].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1
      if (!a.is_primary && b.is_primary) return 1
      return (a.sort_order ?? 0) - (b.sort_order ?? 0)
    })

    let imageUrl: string | null = null
    if (images[0]?.storage_path) {
      const path = images[0].storage_path.trim()
      if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
        imageUrl = path
      } else {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path)
        imageUrl = data.publicUrl
      }
    }

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      status: p.status,
      primary_image: imageUrl,
    }
  })

  return (
    <CollectionForm
      isEdit={false}
      availableProducts={availableProducts}
      initialAssignedProductIds={[]}
    />
  )
}
