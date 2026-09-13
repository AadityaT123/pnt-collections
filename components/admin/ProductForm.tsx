'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  createProductAction,
  updateProductAction,
  archiveProductAction,
  type ProductInput,
} from '@/app/admin/(dashboard)/products/actions'

interface TaxonomyOption {
  id: string
  name: string
}

interface ImageItem {
  id?: string
  storage_path: string
  alt_text?: string
  is_primary: boolean
  sort_order: number
}

export interface ProductFormData {
  id?: string
  name: string
  slug: string
  short_description?: string
  description?: string
  price: number
  compare_at_price?: number | null
  sku: string
  stock: number
  status: 'draft' | 'active' | 'archived'
  is_featured: boolean
  fabric?: string
  weave?: string
  color?: string
  occasion?: string
  saree_length_cm?: number | null
  blouse_piece_included: boolean
  blouse_piece_length_cm?: number | null
  care_instructions?: string
  hsn_code?: string
  gst_rate?: number | null
  category_id?: string | null
  collection_id?: string | null
  images: ImageItem[]
}

interface ProductFormProps {
  mode: 'create' | 'edit'
  initialData?: ProductFormData
  categories: TaxonomyOption[]
  collections: TaxonomyOption[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function ProductForm({
  mode,
  initialData,
  categories,
  collections,
}: ProductFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [isAutoSlug, setIsAutoSlug] = useState(mode === 'create')
  const [confirmArchive, setConfirmArchive] = useState(false)

  // Form states
  const [name, setName] = useState(initialData?.name || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [shortDescription, setShortDescription] = useState(initialData?.short_description || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [price, setPrice] = useState<string>(initialData ? String(initialData.price) : '')
  const [compareAtPrice, setCompareAtPrice] = useState<string>(
    initialData?.compare_at_price ? String(initialData.compare_at_price) : ''
  )
  const [sku, setSku] = useState(initialData?.sku || '')
  const [stock, setStock] = useState<string>(initialData ? String(initialData.stock) : '0')
  const [status, setStatus] = useState<'draft' | 'active' | 'archived'>(initialData?.status || 'draft')
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured || false)

  // Saree Specs
  const [fabric, setFabric] = useState(initialData?.fabric || '')
  const [weave, setWeave] = useState(initialData?.weave || '')
  const [color, setColor] = useState(initialData?.color || '')
  const [occasion, setOccasion] = useState(initialData?.occasion || '')
  const [sareeLengthCm, setSareeLengthCm] = useState<string>(
    initialData?.saree_length_cm ? String(initialData.saree_length_cm) : '550'
  )
  const [blouseIncluded, setBlouseIncluded] = useState(initialData?.blouse_piece_included || false)
  const [blouseLengthCm, setBlouseLengthCm] = useState<string>(
    initialData?.blouse_piece_length_cm ? String(initialData.blouse_piece_length_cm) : '80'
  )
  const [careInstructions, setCareInstructions] = useState(
    initialData?.care_instructions || 'Dry clean recommended. Store in a cool, dry muslin cloth.'
  )
  const [hsnCode, setHsnCode] = useState(initialData?.hsn_code || '5208')
  const [gstRate, setGstRate] = useState<string>(
    initialData?.gst_rate !== undefined && initialData?.gst_rate !== null
      ? String(initialData.gst_rate)
      : '5.0'
  )

  // Taxonomy
  const [categoryId, setCategoryId] = useState<string>(initialData?.category_id || '')
  const [collectionId, setCollectionId] = useState<string>(initialData?.collection_id || '')

  // Images
  const [images, setImages] = useState<ImageItem[]>(initialData?.images || [])
  const [newImagePath, setNewImagePath] = useState('')
  const [newImageAlt, setNewImageAlt] = useState('')

  // Handle Title changes
  function handleTitleChange(val: string) {
    setName(val)
    if (isAutoSlug) {
      setSlug(slugify(val))
    }
  }

  // Add an image path
  function handleAddImage() {
    const path = newImagePath.trim()
    if (!path) return

    const newImg: ImageItem = {
      storage_path: path,
      alt_text: newImageAlt.trim() || name || 'Product image',
      is_primary: images.length === 0,
      sort_order: images.length,
    }
    setImages([...images, newImg])
    setNewImagePath('')
    setNewImageAlt('')
  }

  function handleSetPrimaryImage(index: number) {
    setImages(
      images.map((img, idx) => ({
        ...img,
        is_primary: idx === index,
      }))
    )
  }

  function handleRemoveImage(index: number) {
    const remaining = images.filter((_, idx) => idx !== index)
    if (remaining.length > 0 && !remaining.some((img) => img.is_primary)) {
      remaining[0].is_primary = true
    }
    setImages(remaining)
  }

  // Submit Handler
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    // Validation
    const cleanName = name.trim()
    if (!cleanName) {
      setServerError('Product title is required.')
      return
    }

    const cleanSlug = slug.trim().toLowerCase()
    if (!cleanSlug) {
      setServerError('Product slug is required.')
      return
    }

    const cleanSku = sku.trim().toUpperCase()
    if (!cleanSku) {
      setServerError('SKU is required.')
      return
    }

    const numPrice = parseFloat(price)
    if (isNaN(numPrice) || numPrice < 0) {
      setServerError('Valid regular price is required.')
      return
    }

    let numComparePrice: number | null = null
    if (compareAtPrice && compareAtPrice.trim()) {
      numComparePrice = parseFloat(compareAtPrice)
      if (isNaN(numComparePrice) || numComparePrice < 0) {
        setServerError('Sale price must be a valid number.')
        return
      }
      if (numComparePrice < numPrice) {
        setServerError('Sale / compare-at price must be greater than or equal to regular price.')
        return
      }
    }

    const numStock = parseInt(stock, 10)
    if (isNaN(numStock) || numStock < 0) {
      setServerError('Stock quantity must be a non-negative integer.')
      return
    }

    if (blouseIncluded) {
      const numBlouseLength = parseInt(blouseLengthCm, 10)
      if (isNaN(numBlouseLength) || numBlouseLength <= 0) {
        setServerError('Please provide blouse piece length in cm when blouse piece is included.')
        return
      }
    }

    const payload: ProductInput = {
      name: cleanName,
      slug: cleanSlug,
      short_description: shortDescription.trim() || undefined,
      description: description.trim() || undefined,
      price: numPrice,
      compare_at_price: numComparePrice,
      sku: cleanSku,
      stock: numStock,
      status,
      is_featured: isFeatured,
      fabric: fabric.trim() || undefined,
      weave: weave.trim() || undefined,
      color: color.trim() || undefined,
      occasion: occasion.trim() || undefined,
      saree_length_cm: sareeLengthCm ? parseInt(sareeLengthCm, 10) : null,
      blouse_piece_included: blouseIncluded,
      blouse_piece_length_cm: blouseIncluded ? parseInt(blouseLengthCm, 10) : null,
      care_instructions: careInstructions.trim() || undefined,
      hsn_code: hsnCode.trim() || undefined,
      gst_rate: gstRate ? parseFloat(gstRate) : null,
      category_id: categoryId || null,
      collection_id: collectionId || null,
      images,
    }

    startTransition(async () => {
      if (mode === 'create') {
        const res = await createProductAction(payload)
        if (res.error) {
          setServerError(res.error)
        } else {
          router.push('/admin/products')
          router.refresh()
        }
      } else if (mode === 'edit' && initialData?.id) {
        const res = await updateProductAction(initialData.id, payload)
        if (res.error) {
          setServerError(res.error)
        } else {
          router.push('/admin/products')
          router.refresh()
        }
      }
    })
  }

  function handleArchive() {
    if (!initialData?.id) return
    startTransition(async () => {
      const res = await archiveProductAction(initialData.id!)
      if (res.error) {
        setServerError(res.error)
      } else {
        router.push('/admin/products')
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D6B978]/40 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#7A5A45] mb-1">
            <Link href="/admin/products" className="hover:text-[#641C24] transition-colors">
              Products
            </Link>
            <span className="text-[#B58A45]">/</span>
            <span className="text-[#2B211C] font-medium">{mode === 'create' ? 'New Product' : 'Edit Product'}</span>
          </div>
          <h1 className="text-2xl font-serif font-medium text-[#2B211C]">
            {mode === 'create' ? 'Create New Saree Product' : `Edit: ${name || 'Product'}`}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-lg text-xs font-medium text-[#7A5A45] hover:text-[#2B211C] bg-[#FFFFFF] hover:bg-[#EFE2D0] border border-[#D6B978]/60 transition-colors shadow-xs"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#641C24] hover:bg-[#4A141B] text-white shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isPending && (
              <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            <span>{isPending ? 'Saving...' : mode === 'create' ? 'Publish Product' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Error alert */}
      {serverError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
          <span>{serverError}</span>
          <button type="button" onClick={() => setServerError(null)} className="text-red-600 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Core & Specifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Basic Information */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D6B978]/40 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#B58A45]">
              Basic Information
            </h2>

            {/* Title */}
            <div>
              <label htmlFor="product-name" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                Product Title <span className="text-red-600">*</span>
              </label>
              <input
                id="product-name"
                type="text"
                required
                value={name}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Royal Cyan Banarasi Silk Saree"
                className="w-full px-3.5 py-2.5 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-sm text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
              />
            </div>

            {/* Slug */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="product-slug" className="block text-xs font-medium text-[#2B211C]">
                  URL Slug <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsAutoSlug(!isAutoSlug)}
                  className="text-[11px] text-[#7A5A45] hover:text-[#641C24]"
                >
                  {isAutoSlug ? 'Unlock manual edit' : 'Lock to title auto-generate'}
                </button>
              </div>
              <div className="flex items-center bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg overflow-hidden focus-within:border-[#641C24]">
                <span className="px-3 text-xs text-[#7A5A45] font-mono border-r border-[#D6B978]/40 bg-[#EFE2D0]/40">
                  /products/
                </span>
                <input
                  id="product-slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase())
                    setIsAutoSlug(false)
                  }}
                  placeholder="royal-cyan-banarasi-silk-saree"
                  className="w-full px-3 py-2 bg-transparent text-xs text-[#2B211C] font-mono placeholder-[#A68A78] focus:outline-none"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label htmlFor="product-short-desc" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                Short Description / Highlight
              </label>
              <input
                id="product-short-desc"
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Exquisite handwoven zari pallu saree for festive elegance."
                className="w-full px-3.5 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label htmlFor="product-desc" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                Detailed Description
              </label>
              <textarea
                id="product-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter detailed fabric texture, zari motifs, styling suggestions, and drape notes..."
                className="w-full px-3.5 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
              />
            </div>
          </div>

          {/* Card: Pricing & Inventory */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D6B978]/40 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#B58A45]">
              Pricing & Inventory
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Regular Price */}
              <div>
                <label htmlFor="product-price" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                  Regular Price (₹) <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A5A45] text-xs font-medium">₹</span>
                  <input
                    id="product-price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="2499.00"
                    className="w-full pl-7 pr-3.5 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs sm:text-sm text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
                  />
                </div>
              </div>

              {/* Sale / Compare Price */}
              <div>
                <label htmlFor="product-compare-price" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                  Sale / Original Price (₹) <span className="text-[10px] text-[#7A5A45]">(Optional strike-through)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A5A45] text-xs font-medium">₹</span>
                  <input
                    id="product-compare-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="3499.00"
                    className="w-full pl-7 pr-3.5 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs sm:text-sm text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
                  />
                </div>
              </div>

              {/* SKU */}
              <div>
                <label htmlFor="product-sku" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                  SKU Code <span className="text-red-600">*</span>
                </label>
                <input
                  id="product-sku"
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="PNT-BAN-001"
                  className="w-full px-3.5 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs sm:text-sm font-mono text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24] uppercase"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <label htmlFor="product-stock" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                  Stock on Hand <span className="text-red-600">*</span>
                </label>
                <input
                  id="product-stock"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  className="w-full px-3.5 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs sm:text-sm text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
                />
                <span className="text-[10px] text-[#7A5A45] mt-1 block">
                  Managed via ledger movements trigger.
                </span>
              </div>
            </div>
          </div>

          {/* Card: Saree Specifications */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D6B978]/40 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#B58A45]">
              Saree Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="spec-fabric" className="block text-xs font-medium text-[#2B211C] mb-1.5">Fabric</label>
                <input
                  id="spec-fabric"
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  placeholder="Pure Silk, Georgette, Chanderi"
                  className="w-full px-3 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
                />
              </div>

              <div>
                <label htmlFor="spec-weave" className="block text-xs font-medium text-[#2B211C] mb-1.5">Weave</label>
                <input
                  id="spec-weave"
                  type="text"
                  value={weave}
                  onChange={(e) => setWeave(e.target.value)}
                  placeholder="Jacquard, Kanjeevaram, Zari"
                  className="w-full px-3 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
                />
              </div>

              <div>
                <label htmlFor="spec-color" className="block text-xs font-medium text-[#2B211C] mb-1.5">Color</label>
                <input
                  id="spec-color"
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="Teal, Deep Crimson, Emerald"
                  className="w-full px-3 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
                />
              </div>

              <div>
                <label htmlFor="spec-occasion" className="block text-xs font-medium text-[#2B211C] mb-1.5">Occasion</label>
                <input
                  id="spec-occasion"
                  type="text"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="Wedding, Festive, Evening"
                  className="w-full px-3 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
                />
              </div>

              <div>
                <label htmlFor="spec-length" className="block text-xs font-medium text-[#2B211C] mb-1.5">Saree Length (cm)</label>
                <input
                  id="spec-length"
                  type="number"
                  value={sareeLengthCm}
                  onChange={(e) => setSareeLengthCm(e.target.value)}
                  placeholder="550"
                  className="w-full px-3 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-[#2B211C] pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blouseIncluded}
                    onChange={(e) => setBlouseIncluded(e.target.checked)}
                    className="rounded bg-[#F8F1E7] border-[#D6B978] text-[#641C24] focus:ring-0 cursor-pointer"
                  />
                  <span>Blouse Piece Included</span>
                </label>

                {blouseIncluded && (
                  <div>
                    <label htmlFor="spec-blouse-length" className="block text-[11px] text-[#7A5A45] mb-1">
                      Blouse Piece Length (cm) <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="spec-blouse-length"
                      type="number"
                      value={blouseLengthCm}
                      onChange={(e) => setBlouseLengthCm(e.target.value)}
                      placeholder="80"
                      className="w-full px-3 py-1.5 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] focus:outline-none focus:border-[#641C24]"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="spec-hsn" className="block text-xs font-medium text-[#2B211C] mb-1.5">HSN Code</label>
                <input
                  id="spec-hsn"
                  type="text"
                  value={hsnCode}
                  onChange={(e) => setHsnCode(e.target.value)}
                  placeholder="5208"
                  className="w-full px-3 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
                />
              </div>

              <div>
                <label htmlFor="spec-gst" className="block text-xs font-medium text-[#2B211C] mb-1.5">GST Rate (%)</label>
                <input
                  id="spec-gst"
                  type="number"
                  step="0.1"
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  placeholder="5.0"
                  className="w-full px-3 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="spec-care" className="block text-xs font-medium text-[#2B211C] mb-1.5">Care Instructions</label>
              <input
                id="spec-care"
                type="text"
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                placeholder="Dry clean only"
                className="w-full px-3 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Column: Status, Categorization & Images */}
        <div className="space-y-6">
          {/* Card: Status & Visibility */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D6B978]/40 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#B58A45]">
              Status & Visibility
            </h2>

            <div>
              <label htmlFor="product-status" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                Product Status
              </label>
              <select
                id="product-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'active' | 'archived')}
                className="w-full px-3 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] focus:outline-none focus:border-[#641C24] cursor-pointer"
              >
                <option value="draft">Draft (Hidden from catalog)</option>
                <option value="active">Active (Live in catalog)</option>
                <option value="archived">Archived (Deactivated)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs text-[#2B211C] cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded bg-[#F8F1E7] border-[#D6B978] text-[#641C24] focus:ring-0 cursor-pointer"
              />
              <span>Feature on homepage banner</span>
            </label>
          </div>

          {/* Card: Organization */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D6B978]/40 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#B58A45]">
              Organization
            </h2>

            {/* Category */}
            <div>
              <label htmlFor="product-category" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                Primary Category
              </label>
              <select
                id="product-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] focus:outline-none focus:border-[#641C24] cursor-pointer"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Collection */}
            <div>
              <label htmlFor="product-collection" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                Collection
              </label>
              <select
                id="product-collection"
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] focus:outline-none focus:border-[#641C24] cursor-pointer"
              >
                <option value="">No collection</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Card: Product Images */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D6B978]/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#B58A45]">
                Product Images
              </h2>
              <span className="text-[10px] text-[#7A5A45] font-medium">
                {images.length} added
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#F8F1E7] border border-[#D6B978]/40 text-[11px] text-[#7A5A45]">
              Supabase Storage bucket creation is pending. You can associate image paths or external image URLs below.
            </div>

            {/* Current Images List */}
            {images.length > 0 && (
              <div className="space-y-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#F8F1E7] border border-[#D6B978]/50 text-xs"
                  >
                    <div className="truncate flex-1">
                      <p className="text-[#2B211C] truncate font-mono text-[11px]">{img.storage_path}</p>
                      <span className="text-[10px] text-[#7A5A45] block truncate">
                        {img.alt_text || 'No alt text'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {img.is_primary ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#B58A45]/20 text-[#B58A45] font-semibold">
                          Primary
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="text-[10px] text-[#7A5A45] hover:text-[#641C24] cursor-pointer"
                        >
                          Set Primary
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="text-red-600 hover:text-red-800 px-1 font-bold cursor-pointer"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Image input */}
            <div className="pt-2 border-t border-[#D6B978]/40 space-y-2">
              <input
                type="text"
                value={newImagePath}
                onChange={(e) => setNewImagePath(e.target.value)}
                placeholder="Image path e.g. /images/products/teal-saree.jpg"
                className="w-full px-3 py-1.5 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
              />
              <input
                type="text"
                value={newImageAlt}
                onChange={(e) => setNewImageAlt(e.target.value)}
                placeholder="Alt text (optional)"
                className="w-full px-3 py-1.5 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="w-full py-1.5 text-xs font-medium text-[#2B211C] bg-[#EFE2D0] hover:bg-[#D6B978]/30 border border-[#D6B978]/60 rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                + Add Image Reference
              </button>
            </div>
          </div>

          {/* Archive / Deactivate button (in edit mode) */}
          {mode === 'edit' && status !== 'archived' && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <h3 className="text-xs font-medium text-red-900 mb-1">Archive Product</h3>
              <p className="text-[11px] text-red-700 mb-3">
                Safely deactivates this product and preserves inventory ledger history.
              </p>
              {confirmArchive ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleArchive}
                    disabled={isPending}
                    className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-medium shadow-xs cursor-pointer"
                  >
                    Confirm Archive
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmArchive(false)}
                    className="px-2 py-1 text-xs text-[#7A5A45] hover:text-[#2B211C] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmArchive(true)}
                  className="text-xs text-red-700 hover:text-red-900 underline cursor-pointer font-medium"
                >
                  Archive this product
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </form>
  )
}
