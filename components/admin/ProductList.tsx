'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { archiveProductAction } from '@/app/admin/(dashboard)/products/actions'

export interface ProductListItem {
  id: string
  name: string
  slug: string
  status: 'draft' | 'active' | 'archived'
  is_featured: boolean
  created_at: string
  variant?: {
    id: string
    sku: string
    price_paise: number
    compare_at_price_paise: number | null
    stock_on_hand: number
    status: string
  } | null
  categoryName?: string | null
  primaryImageUrl?: string | null
}

interface ProductListProps {
  initialProducts: ProductListItem[]
}

export default function ProductList({ initialProducts }: ProductListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<string>('all')
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Filtering
  const filteredProducts = initialProducts.filter((product) => {
    // Search query
    const q = searchQuery.toLowerCase().trim()
    const matchesSearch =
      !q ||
      product.name.toLowerCase().includes(q) ||
      product.slug.toLowerCase().includes(q) ||
      (product.variant?.sku && product.variant.sku.toLowerCase().includes(q))

    // Status filter
    const matchesStatus =
      statusFilter === 'all' || product.status === statusFilter

    // Stock filter
    const stock = product.variant?.stock_on_hand ?? 0
    let matchesStock = true
    if (stockFilter === 'in_stock') {
      matchesStock = stock > 0
    } else if (stockFilter === 'low_stock') {
      matchesStock = stock > 0 && stock <= 2
    } else if (stockFilter === 'out_of_stock') {
      matchesStock = stock <= 0
    }

    return matchesSearch && matchesStatus && matchesStock
  })

  async function handleArchive(productId: string) {
    setActionError(null)
    setArchivingId(productId)
    startTransition(async () => {
      const res = await archiveProductAction(productId)
      setArchivingId(null)
      setConfirmArchiveId(null)
      if (res.error) {
        setActionError(res.error)
      } else {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-[#2B211C]">
            Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5A45] mt-1">
            Manage your sarees, variants, pricing, and live inventory.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#641C24] hover:bg-[#4A141B] text-white text-sm font-semibold rounded-lg shadow-md transition-all cursor-pointer shrink-0"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Error notification */}
      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
          <span>{actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-red-600 hover:text-red-800 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-[#FFFFFF] border border-[#D6B978]/40 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <svg
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#B58A45]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by title, slug, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-[#F8F1E7] border border-[#D6B978]/50 rounded-lg text-xs sm:text-sm text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8F1E7] border border-[#D6B978]/50 rounded-lg text-xs text-[#2B211C] focus:outline-none focus:border-[#641C24] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          {/* Stock filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 bg-[#F8F1E7] border border-[#D6B978]/50 rounded-lg text-xs text-[#2B211C] focus:outline-none focus:border-[#641C24] cursor-pointer"
          >
            <option value="all">All Stock Levels</option>
            <option value="in_stock">In Stock (&gt;0)</option>
            <option value="low_stock">Low Stock (≤2)</option>
            <option value="out_of_stock">Out of Stock (0)</option>
          </select>

          {(searchQuery || statusFilter !== 'all' || stockFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setStockFilter('all')
              }}
              className="px-2.5 py-2 text-xs text-[#7A5A45] hover:text-[#641C24] transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Products Table Card */}
      <div className="rounded-2xl bg-[#FFFFFF] border border-[#D6B978]/40 shadow-md overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#F8F1E7] border border-[#D6B978]/50 flex items-center justify-center text-[#B58A45] text-xl mb-3 shadow-xs">
              ✦
            </div>
            {initialProducts.length === 0 ? (
              <>
                <h3 className="text-base font-serif text-[#2B211C] font-medium">
                  No products in catalog yet
                </h3>
                <p className="text-xs text-[#7A5A45] mt-1 max-w-sm mx-auto">
                  Your Supabase database is connected and ready. Click below to add your first saree product.
                </p>
                <div className="mt-5">
                  <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#641C24] hover:bg-[#4A141B] text-white text-xs font-semibold rounded-lg shadow-xs transition-all"
                  >
                    <span>Create First Product</span>
                    <span>→</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base font-serif text-[#2B211C] font-medium">
                  No matching products found
                </h3>
                <p className="text-xs text-[#7A5A45] mt-1">
                  Try adjusting your search query or filters.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D6B978]/40 bg-[#F8F1E7] text-[11px] font-semibold text-[#641C24] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE2D0] text-xs">
                {filteredProducts.map((product) => {
                  const stock = product.variant?.stock_on_hand ?? 0
                  const price = product.variant ? (product.variant.price_paise / 100).toLocaleString('en-IN') : '—'
                  const comparePrice = product.variant?.compare_at_price_paise
                    ? (product.variant.compare_at_price_paise / 100).toLocaleString('en-IN')
                    : null

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-[#F8F1E7]/50 transition-colors group"
                    >
                      {/* Thumbnail & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-12 rounded bg-[#F8F1E7] border border-[#D6B978]/40 overflow-hidden shrink-0 flex items-center justify-center">
                            {product.primaryImageUrl ? (
                              <Image
                                src={product.primaryImageUrl}
                                alt={product.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-[10px] text-[#B58A45] font-serif font-bold">PNT</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={`/admin/products/${product.id}`}
                                className="font-medium text-[#2B211C] hover:text-[#641C24] transition-colors"
                              >
                                {product.name}
                              </Link>
                              {product.is_featured && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-wider">
                                  Featured
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#7A5A45] font-mono block">
                              /{product.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-3 px-4 font-mono text-[11px] text-[#2B211C]">
                        {product.variant?.sku || '—'}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-[#7A5A45]">
                        {product.categoryName || 'Uncategorized'}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-[#2B211C]">₹{price}</span>
                        {comparePrice && (
                          <span className="block text-[10px] text-[#A68A78] line-through">
                            ₹{comparePrice}
                          </span>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              stock === 0
                                ? 'bg-red-500'
                                : stock <= 2
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span
                            className={`font-mono text-xs ${
                              stock === 0
                                ? 'text-red-700 font-semibold'
                                : stock <= 2
                                ? 'text-amber-800 font-semibold'
                                : 'text-[#2B211C]'
                            }`}
                          >
                            {stock} in stock
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize tracking-wider ${
                            product.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : product.status === 'draft'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-stone-100 text-stone-700 border border-stone-300'
                          }`}
                        >
                          {product.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="px-2.5 py-1 text-xs font-medium text-[#641C24] bg-[#F8F1E7] hover:bg-[#EFE2D0] border border-[#D6B978]/50 hover:border-[#B58A45] rounded-lg transition-all shadow-xs"
                          >
                            Edit
                          </Link>

                          {product.status !== 'archived' && (
                            <button
                              onClick={() => setConfirmArchiveId(product.id)}
                              disabled={isPending || archivingId === product.id}
                              className="px-2 py-1 text-xs text-[#7A5A45] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Archive product"
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Archive Confirmation Modal */}
      {confirmArchiveId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#FFFFFF] border border-[#D6B978]/50 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-serif font-medium text-[#2B211C]">
              Archive Product?
            </h3>
            <p className="text-xs text-[#7A5A45] leading-relaxed">
              This will safely set the product and variant status to &quot;archived&quot;. The product will no longer appear in the active store catalog.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmArchiveId(null)}
                disabled={isPending}
                className="px-3.5 py-1.5 rounded-lg text-xs text-[#7A5A45] hover:text-[#2B211C] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleArchive(confirmArchiveId)}
                disabled={isPending}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-700 hover:bg-red-800 text-white shadow-xs transition-colors cursor-pointer"
              >
                {isPending ? 'Archiving...' : 'Confirm Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
