'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteCollectionAction } from '@/app/admin/(dashboard)/collections/actions'

export interface CollectionListItem {
  id: string
  name: string
  slug: string
  description: string | null
  image_path: string | null
  sort_order: number
  status: string
  created_at: string
  product_count: number
}

interface CollectionListProps {
  collections: CollectionListItem[]
}

export default function CollectionList({ collections }: CollectionListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

  // Filter collections
  const filtered = collections.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Handle Delete
  async function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete collection "${name}"? This action cannot be undone.`
    )
    if (!confirmed) return

    setIsDeletingId(id)
    try {
      const res = await deleteCollectionAction(id)
      if (res.error) {
        alert(res.error)
        setIsDeletingId(null)
        return
      }
      router.refresh()
    } catch (err) {
      console.error('Error deleting collection:', err)
      alert('Failed to delete collection.')
    } finally {
      setIsDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Bar */}
      <div className="bg-white rounded-lg border border-[#D6B978]/40 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A5A45] text-sm">
            ⌕
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search collections by name or slug..."
            className="w-full pl-9 pr-4 py-2 rounded-md border border-[#D6B978]/50 bg-[#F8F1E7]/20 text-xs text-[#2B211C] outline-none focus:border-[#641C24]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7A5A45] font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-md border border-[#D6B978]/50 bg-[#F8F1E7]/20 text-xs text-[#2B211C] outline-none focus:border-[#641C24]"
          >
            <option value="all">All ({collections.length})</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Collections Table / Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg border border-[#D6B978]/40 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#EFE2D0] mx-auto flex items-center justify-center text-[#B58A45] text-xl mb-3">
            ✦
          </div>
          <h3 className="font-serif text-lg text-[#641C24]">
            {collections.length === 0 ? 'No collections created yet' : 'No collections match your filter'}
          </h3>
          <p className="mt-1 text-xs text-[#7A5A45] max-w-md mx-auto">
            {collections.length === 0
              ? 'Organize your sarees into thematic collections such as Bridal, Festive, or Casual Chic.'
              : 'Try adjusting your search terms or status filter.'}
          </p>
          {collections.length === 0 && (
            <Link
              href="/admin/collections/new"
              className="mt-5 inline-block px-5 py-2.5 bg-[#641C24] text-white rounded-md text-xs font-medium uppercase tracking-wider hover:bg-[#4A141B] transition-colors shadow-xs"
            >
              + Create First Collection
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[#D6B978]/40 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D6B978]/40 bg-[#F8F1E7]/60 text-[11px] font-semibold uppercase tracking-wider text-[#7A5A45]">
                  <th className="py-3 px-4 w-20">Cover (4:5)</th>
                  <th className="py-3 px-4">Collection Details</th>
                  <th className="py-3 px-4 w-32">Status</th>
                  <th className="py-3 px-4 w-24 text-center">Order</th>
                  <th className="py-3 px-4 w-28 text-center">Products</th>
                  <th className="py-3 px-4 w-32 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6B978]/20 text-xs">
                {filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#F8F1E7]/30 transition-colors group"
                  >
                    {/* Cover Thumbnail (4:5 Ratio) */}
                    <td className="py-3 px-4 align-middle">
                      <div className="relative aspect-[4/5] w-12 rounded overflow-hidden bg-[#EFE2D0] border border-[#D6B978]/40 shadow-2xs">
                        {item.image_path ? (
                          <Image
                            src={item.image_path}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[8px] font-mono text-[#7A5A45]/70 p-1 text-center bg-[#F8F1E7]">
                            <span>4:5</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Details */}
                    <td className="py-3 px-4 align-middle">
                      <div className="flex flex-col">
                        <Link
                          href={`/admin/collections/${item.id}`}
                          className="font-serif text-sm font-bold text-[#2B211C] group-hover:text-[#641C24] transition-colors"
                        >
                          {item.name}
                        </Link>
                        <span className="font-mono text-[11px] text-[#7A5A45]">
                          /collections/{item.slug}
                        </span>
                        {item.description && (
                          <p className="text-[11px] text-[#2B211C]/60 line-clamp-1 mt-0.5 max-w-md">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 align-middle">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          item.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : item.status === 'draft'
                            ? 'bg-amber-50 text-amber-800 border border-amber-300'
                            : 'bg-zinc-100 text-zinc-700 border border-zinc-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* Sort Order */}
                    <td className="py-3 px-4 align-middle text-center font-mono text-xs text-[#7A5A45]">
                      {item.sort_order}
                    </td>

                    {/* Linked Products Count */}
                    <td className="py-3 px-4 align-middle text-center">
                      <span className="inline-block px-2 py-0.5 rounded bg-[#EFE2D0] text-[#641C24] font-medium text-xs">
                        {item.product_count}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/collections/${item.id}`}
                          className="px-2.5 py-1 rounded border border-[#D6B978]/60 text-xs font-medium text-[#2B211C] hover:bg-[#EFE2D0]/50 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.name)}
                          disabled={isDeletingId === item.id}
                          className="px-2.5 py-1 rounded border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {isDeletingId === item.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
