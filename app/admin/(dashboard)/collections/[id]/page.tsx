import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CollectionForm, {
  type CollectionFormData,
  type AvailableProduct,
} from '@/components/admin/CollectionForm'

export const metadata = {
  title: 'Edit Collection | PNT Creation Admin',
  description: 'Update collection details, 4:5 cover photo, and assigned products.',
}

interface EditCollectionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCollectionPage({ params }: EditCollectionPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Fetch the collection
  const { data: collection, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error || !collection) {
    notFound()
  }

  // 2. Fetch all available products
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

  // 3. Fetch existing product assignments for this collection
  const { data: assigned } = await supabase
    .from('product_collections')
    .select('product_id, sort_order')
    .eq('collection_id', id)
    .order('sort_order', { ascending: true })

  const initialAssignedProductIds = (assigned || []).map((a) => a.product_id)

  const formData: CollectionFormData = {
    id: collection.id,
    name: collection.name,
    slug: collection.slug,
    description: collection.description,
    image_path: collection.image_path,
    sort_order: collection.sort_order,
    status: collection.status as 'draft' | 'active' | 'archived',
    seo_title: collection.seo_title,
    seo_description: collection.seo_description,
  }

  return (
    <CollectionForm
      isEdit={true}
      initialData={formData}
      availableProducts={availableProducts}
      initialAssignedProductIds={initialAssignedProductIds}
    />
  )
}
