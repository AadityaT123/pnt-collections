import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CollectionList, { type CollectionListItem } from '@/components/admin/CollectionList'

export const metadata = {
  title: 'Collections | PNT Creation Admin',
  description: 'Manage thematic saree collections, cover imagery, and storefront sorting.',
}

export default async function AdminCollectionsPage() {
  const supabase = await createClient()

  // Fetch collections with their associated product counts
  const { data: collections, error } = await supabase
    .from('collections')
    .select(`
      id,
      name,
      slug,
      description,
      image_path,
      sort_order,
      status,
      created_at,
      product_collections (
        id
      )
    `)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin collections:', error)
  }

  // Format data for presentation
  const formattedCollections: CollectionListItem[] = (collections || []).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    image_path: c.image_path,
    sort_order: c.sort_order,
    status: c.status,
    created_at: c.created_at,
    product_count: Array.isArray(c.product_collections) ? c.product_collections.length : 0,
  }))

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D6B978]/40 pb-5">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#2B211C]">
            Collections
          </h1>
          <p className="text-xs text-[#7A5A45] mt-1">
            Organize sarees into seasonal, bridal, and thematic collections with 4:5 cover imagery.
          </p>
        </div>

        <Link
          href="/admin/collections/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#641C24] text-white rounded-md text-xs font-semibold uppercase tracking-wider hover:bg-[#4A141B] transition-colors shadow-xs"
        >
          <span>+</span>
          <span>New Collection</span>
        </Link>
      </div>

      {/* Collection List Table */}
      <CollectionList collections={formattedCollections} />
    </div>
  )
}
