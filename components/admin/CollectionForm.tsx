'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  createCollectionAction,
  updateCollectionAction,
  deleteCollectionAction,
  type CollectionInput,
} from '@/app/admin/(dashboard)/collections/actions'

export interface CollectionFormData {
  id?: string
  name: string
  slug: string
  description?: string | null
  image_path?: string | null
  sort_order?: number
  status: 'draft' | 'active' | 'archived'
  seo_title?: string | null
  seo_description?: string | null
}

export interface AvailableProduct {
  id: string
  name: string
  slug: string
  status: string
  primary_image?: string | null
}

interface CollectionFormProps {
  initialData?: CollectionFormData
  isEdit?: boolean
  availableProducts?: AvailableProduct[]
  initialAssignedProductIds?: string[]
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

export default function CollectionForm({
  initialData,
  isEdit = false,
  availableProducts = [],
  initialAssignedProductIds = [],
}: CollectionFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Form Fields
  const [name, setName] = useState(initialData?.name || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [isAutoSlug, setIsAutoSlug] = useState(!initialData?.slug)
  const [description, setDescription] = useState(initialData?.description || '')
  const [status, setStatus] = useState<'draft' | 'active' | 'archived'>(
    initialData?.status || 'draft'
  )
  const [sortOrder, setSortOrder] = useState<number>(initialData?.sort_order ?? 0)
  const [imagePath, setImagePath] = useState(initialData?.image_path || '')
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || '')
  const [seoDescription, setSeoDescription] = useState(
    initialData?.seo_description || ''
  )

  // Assigned Products State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    initialAssignedProductIds || []
  )
  const [productSearch, setProductSearch] = useState('')
  const [filterSelectedOnly, setFilterSelectedOnly] = useState(false)

  // Upload & Action State
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Handle Name changes
  function handleNameChange(val: string) {
    setName(val)
    if (isAutoSlug) {
      setSlug(slugify(val))
    }
  }

  // Cover Image File Upload
  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    const file = files[0]

    setUploadError(null)
    setIsUploading(true)
    setUploadProgress(`Uploading ${file.name}...`)

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
    const maxSizeBytes = 10 * 1024 * 1024 // 10MB

    try {
      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          `File "${file.name}" has an unsupported format (${file.type}). Please select JPG, PNG, WebP, AVIF, or GIF.`
        )
      }

      if (file.size > maxSizeBytes) {
        throw new Error(
          `File "${file.name}" exceeds the 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`
        )
      }

      const supabase = createClient()
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      const storagePath = `collections/${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanFileName}`

      const { error: uploadErr } = await supabase.storage
        .from('product-images')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadErr) {
        throw new Error(`Upload failed: ${uploadErr.message}`)
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('product-images').getPublicUrl(storagePath)

      setImagePath(publicUrl)
    } catch (err: unknown) {
      console.error('Cover upload error:', err)
      setUploadError(
        err instanceof Error ? err.message : 'An error occurred during cover upload.'
      )
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Filter available products by search & selected-only
  const filteredProducts = availableProducts.filter((p) => {
    const matchesSearch =
      productSearch.trim() === '' ||
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.slug.toLowerCase().includes(productSearch.toLowerCase())

    if (filterSelectedOnly) {
      return matchesSearch && selectedProductIds.includes(p.id)
    }
    return matchesSearch
  })

  function toggleProduct(productId: string) {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }

  // Handle Form Submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage(null)

    if (!name.trim()) {
      setErrorMessage('Please enter a collection name.')
      return
    }

    setIsSubmitting(true)

    const payload: CollectionInput = {
      name: name.trim(),
      slug: slug.trim() || slugify(name),
      description: description.trim() || null,
      image_path: imagePath.trim() || null,
      sort_order: sortOrder,
      status,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      product_ids: selectedProductIds,
    }

    try {
      if (isEdit && initialData?.id) {
        const res = await updateCollectionAction(initialData.id, payload)
        if (res.error) {
          setErrorMessage(res.error)
          setIsSubmitting(false)
          return
        }
      } else {
        const res = await createCollectionAction(payload)
        if (res.error) {
          setErrorMessage(res.error)
          setIsSubmitting(false)
          return
        }
      }

      router.push('/admin/collections')
      router.refresh()
    } catch (err: unknown) {
      console.error('Error saving collection:', err)
      setErrorMessage(
        err instanceof Error ? err.message : 'An unexpected error occurred while saving.'
      )
      setIsSubmitting(false)
    }
  }

  // Handle Delete
  async function handleDelete() {
    if (!initialData?.id) return
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`
    )
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const res = await deleteCollectionAction(initialData.id)
      if (res.error) {
        alert(res.error)
        setIsDeleting(false)
        return
      }
      router.push('/admin/collections')
      router.refresh()
    } catch (err: unknown) {
      console.error('Error deleting collection:', err)
      alert('An unexpected error occurred.')
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D6B978]/40 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#7A5A45] mb-1">
            <Link href="/admin/collections" className="hover:text-[#641C24] transition-colors">
              Collections
            </Link>
            <span>/</span>
            <span className="text-[#641C24] font-medium">
              {isEdit ? 'Edit Collection' : 'New Collection'}
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#2B211C]">
            {isEdit ? `Edit Collection: ${name || 'Untitled'}` : 'Create New Collection'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/collections"
            className="px-4 py-2 border border-[#D6B978]/60 rounded-md text-xs font-medium text-[#2B211C] hover:bg-[#EFE2D0]/40 transition-colors"
          >
            Cancel
          </Link>

          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isSubmitting}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-md text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="px-6 py-2 bg-[#641C24] text-white rounded-md text-xs font-medium tracking-wide hover:bg-[#4A141B] transition-colors shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Collection' : 'Save Collection'}
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-md bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <span className="text-red-500 mt-0.5">⚠</span>
          <div>
            <p className="font-medium">Action failed</p>
            <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Collection Details (8 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Basic Info */}
          <div className="bg-white rounded-lg border border-[#D6B978]/40 p-6 shadow-xs space-y-5">
            <h2 className="text-base font-serif font-bold text-[#641C24]">
              Collection Information
            </h2>

            {/* Name */}
            <div>
              <label htmlFor="collection-name" className="block text-xs font-semibold text-[#2B211C] mb-1.5">
                Collection Name <span className="text-red-600">*</span>
              </label>
              <input
                id="collection-name"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Royal Banarasi Heritage"
                className="w-full px-3.5 py-2.5 rounded-md border border-[#D6B978]/60 bg-[#F8F1E7]/20 text-sm text-[#2B211C] outline-none focus:border-[#641C24] transition-colors"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="collection-slug" className="block text-xs font-semibold text-[#2B211C]">
                  URL Slug <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAutoSlug(!isAutoSlug)}
                  className="text-[11px] text-[#B58A45] hover:text-[#641C24] transition-colors"
                >
                  {isAutoSlug ? 'Unlock manual slug' : 'Lock auto-slug'}
                </button>
              </div>
              <div className="flex items-center rounded-md border border-[#D6B978]/60 bg-[#F8F1E7]/20 px-3 py-2 text-sm text-[#7A5A45]">
                <span className="text-xs text-[#7A5A45]/70 mr-1 select-none font-mono">/collections/</span>
                <input
                  id="collection-slug"
                  type="text"
                  value={slug}
                  disabled={isAutoSlug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="royal-banarasi-heritage"
                  className="w-full bg-transparent text-sm text-[#2B211C] outline-none disabled:text-[#7A5A45]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="collection-desc" className="block text-xs font-semibold text-[#2B211C] mb-1.5">
                Description
              </label>
              <textarea
                id="collection-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the aesthetic, fabrics, and occasions curated in this collection..."
                className="w-full px-3.5 py-2.5 rounded-md border border-[#D6B978]/60 bg-[#F8F1E7]/20 text-sm text-[#2B211C] outline-none focus:border-[#641C24] transition-colors"
              />
            </div>
          </div>

          {/* Card: Assign Sarees / Products */}
          <div className="bg-white rounded-lg border border-[#D6B978]/40 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D6B978]/30 pb-3">
              <div>
                <h2 className="text-base font-serif font-bold text-[#641C24]">
                  Assign Sarees / Products
                </h2>
                <p className="text-xs text-[#7A5A45] mt-0.5">
                  Select sarees from your catalog to include in this collection.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE2D0] text-[#641C24] text-xs font-semibold self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B58A45]" />
                {selectedProductIds.length} {selectedProductIds.length === 1 ? 'Saree Assigned' : 'Sarees Assigned'}
              </span>
            </div>

            {/* Filter and Quick Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by name or slug..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-md border border-[#D6B978]/60 bg-[#F8F1E7]/20 text-xs text-[#2B211C] outline-none focus:border-[#641C24]"
                />
                <span className="absolute left-2.5 top-2 text-xs text-[#7A5A45]/70">⌕</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterSelectedOnly(!filterSelectedOnly)}
                  className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${
                    filterSelectedOnly
                      ? 'bg-[#641C24] text-white border-[#641C24]'
                      : 'border-[#D6B978]/60 text-[#7A5A45] hover:bg-[#F8F1E7]'
                  }`}
                >
                  {filterSelectedOnly ? 'Showing Assigned Only' : 'Show Assigned Only'}
                </button>
              </div>
            </div>

            {/* Products List */}
            {availableProducts.length === 0 ? (
              <div className="p-6 text-center rounded-md border border-dashed border-[#D6B978]/60 bg-[#F8F1E7]/20">
                <p className="text-xs text-[#7A5A45]">No sarees available in the catalog yet.</p>
                <Link
                  href="/admin/products/new"
                  className="inline-block mt-2 text-xs font-medium text-[#641C24] hover:underline"
                >
                  + Create a Saree First
                </Link>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-5 text-center rounded-md border border-[#D6B978]/30 bg-[#F8F1E7]/10 text-xs text-[#7A5A45]">
                No sarees match your search filter.
              </div>
            ) : (
              <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1 divide-y divide-[#D6B978]/20 border border-[#D6B978]/30 rounded-md p-2 bg-[#F8F1E7]/10">
                {filteredProducts.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id)
                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleProduct(p.id)}
                      className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#EFE2D0]/70 border border-[#B58A45]/40 shadow-xs'
                          : 'hover:bg-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by parent div click
                          className="h-4 w-4 rounded border-[#D6B978] text-[#641C24] focus:ring-[#641C24]"
                        />

                        {/* Thumbnail */}
                        <div className="relative w-10 h-12 rounded bg-[#EFE8DC] overflow-hidden flex-shrink-0 border border-[#D6B978]/40">
                          {p.primary_image ? (
                            <Image
                              src={p.primary_image}
                              alt={p.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#B58A45]">
                              ✦
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[#2B211C] truncate">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-[#7A5A45] font-mono truncate">
                            /{p.slug}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded uppercase font-medium tracking-wide ${
                            p.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}
                        >
                          {p.status}
                        </span>

                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded transition-colors ${
                            isSelected
                              ? 'text-red-700 hover:bg-red-50'
                              : 'text-[#641C24] hover:bg-[#EFE2D0]'
                          }`}
                        >
                          {isSelected ? 'Remove' : '+ Add'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Card: SEO / Metadata */}
          <div className="bg-white rounded-lg border border-[#D6B978]/40 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-serif font-bold text-[#641C24]">
              Search Engine Optimization (SEO)
            </h2>
            <div>
              <label htmlFor="seo-title" className="block text-xs font-semibold text-[#2B211C] mb-1.5">
                SEO Title
              </label>
              <input
                id="seo-title"
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="e.g. Royal Banarasi Sarees | PNT Creation"
                className="w-full px-3.5 py-2 rounded-md border border-[#D6B978]/60 bg-[#F8F1E7]/20 text-sm text-[#2B211C] outline-none focus:border-[#641C24]"
              />
            </div>

            <div>
              <label htmlFor="seo-desc" className="block text-xs font-semibold text-[#2B211C] mb-1.5">
                SEO Description
              </label>
              <textarea
                id="seo-desc"
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Brief meta description for search engine previews..."
                className="w-full px-3.5 py-2 rounded-md border border-[#D6B978]/60 bg-[#F8F1E7]/20 text-sm text-[#2B211C] outline-none focus:border-[#641C24]"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Cover Image & Status (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: 4:5 Collection Cover Image */}
          <div className="bg-white rounded-lg border border-[#D6B978]/40 p-6 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-serif font-bold text-[#641C24]">
                Collection Cover Image
              </h2>
              <p className="text-xs text-[#7A5A45] mt-0.5">
                Standard 4:5 portrait ratio used for collection cards and showcase displays.
              </p>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />

            {/* Upload Feedback */}
            {isUploading && (
              <div className="p-3 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-md text-xs text-[#641C24] flex items-center gap-2">
                <span className="animate-spin text-[#B58A45]">⟳</span>
                <span>{uploadProgress || 'Uploading image...'}</span>
              </div>
            )}

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
                {uploadError}
              </div>
            )}

            {/* 4:5 Frame Container */}
            <div className="flex justify-center">
              {imagePath ? (
                /* Uploaded State: Exact 4:5 frame with object-cover */
                <div className="relative aspect-[4/5] w-full max-w-[280px] rounded-lg overflow-hidden border border-[#D6B978]/50 bg-[#EFE2D0] shadow-sm group">
                  <Image
                    src={imagePath}
                    alt={name ? `${name} cover` : 'Collection cover'}
                    fill
                    sizes="280px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#2B211C]/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2.5 p-4">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-1.5 rounded bg-white text-[#2B211C] text-xs font-semibold shadow hover:bg-[#F8F1E7] transition-colors"
                    >
                      Change Cover
                    </button>
                    <button
                      type="button"
                      onClick={() => setImagePath('')}
                      disabled={isUploading}
                      className="px-4 py-1.5 rounded bg-[#641C24] text-white text-xs font-semibold shadow hover:bg-[#4A141B] transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Placeholder State: Exact requested 4:5 placeholder */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative aspect-[4/5] w-full max-w-[280px] rounded-lg border-2 border-dashed border-[#D6B978]/70 bg-[#F8F1E7]/50 hover:bg-[#EFE2D0]/40 transition-colors flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#EFE2D0] flex items-center justify-center text-[#B58A45] mb-3 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-xs font-serif font-bold uppercase tracking-wider text-[#641C24]">
                    COLLECTION COVER IMAGE
                  </p>
                  <p className="mt-1 text-xs font-mono font-medium text-[#B58A45] tracking-widest">
                    4 : 5
                  </p>
                  <p className="mt-3 text-[11px] text-[#7A5A45]">
                    Click to browse files (JPEG, PNG, WebP)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card: Status & Sorting */}
          <div className="bg-white rounded-lg border border-[#D6B978]/40 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-serif font-bold text-[#641C24]">
              Publishing & Sorting
            </h2>

            {/* Status Radio / Select */}
            <div>
              <label className="block text-xs font-semibold text-[#2B211C] mb-2">
                Collection Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['draft', 'active', 'archived'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`py-2 px-3 text-xs rounded-md border font-medium capitalize transition-all ${
                      status === s
                        ? s === 'active'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 font-semibold'
                          : s === 'draft'
                          ? 'bg-amber-50 border-amber-600 text-amber-800 font-semibold'
                          : 'bg-zinc-100 border-zinc-500 text-zinc-800 font-semibold'
                        : 'border-[#D6B978]/40 text-[#7A5A45] hover:bg-[#F8F1E7]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#7A5A45] mt-1.5">
                {status === 'active'
                  ? 'Visible on public storefront collections pages.'
                  : status === 'draft'
                  ? 'Hidden from customers while being prepared.'
                  : 'Archived and hidden from public catalog.'}
              </p>
            </div>

            {/* Sort Order */}
            <div>
              <label htmlFor="sort-order" className="block text-xs font-semibold text-[#2B211C] mb-1.5">
                Display Sort Order
              </label>
              <input
                id="sort-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 rounded-md border border-[#D6B978]/60 bg-[#F8F1E7]/20 text-sm text-[#2B211C] outline-none focus:border-[#641C24]"
              />
              <p className="text-[11px] text-[#7A5A45] mt-1">
                Lower numbers appear first on storefront collection grids (e.g. 0, 1, 2).
              </p>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
