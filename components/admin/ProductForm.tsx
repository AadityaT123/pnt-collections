'use client'

import { useState, useRef, useTransition, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  createProductAction,
  updateProductAction,
  archiveProductAction,
  createCatalogAttributeAction,
  type ProductInput,
} from '@/app/admin/(dashboard)/products/actions'
import type { CatalogAttributeOption } from '@/lib/supabase/storefront'

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
  pattern?: string
  colors?: string[]
  fabrics?: string[]
  occasions?: string[]
  patterns?: string[]
  saree_length_cm?: number | null
  blouse_piece_included: boolean
  blouse_piece_length_cm?: number | null
  care_instructions?: string
  hsn_code?: string
  gst_rate?: number | null
  category_id?: string | null
  collection_id?: string | null
  seo_title?: string
  seo_description?: string
  images: ImageItem[]
}

interface ProductFormProps {
  mode: 'create' | 'edit'
  initialData?: ProductFormData
  categories: TaxonomyOption[]
  collections: TaxonomyOption[]
  initialAttributes?: CatalogAttributeOption[]
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
  initialAttributes = [],
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

  // Saree Specs: Dynamic Attributes (Color, Fabric, Occasion, Pattern)
  const [attributePool, setAttributePool] = useState<CatalogAttributeOption[]>(initialAttributes)

  // Colors (multi-select + add)
  const initialColors = useMemo(() => {
    if (initialData?.colors && initialData.colors.length > 0) return initialData.colors
    if (initialData?.color) return initialData.color.split(',').map((c) => c.trim()).filter(Boolean)
    return []
  }, [initialData])
  const [selectedColors, setSelectedColors] = useState<string[]>(initialColors)
  const [newColorInput, setNewColorInput] = useState('')

  // Fabrics (multi-select + add)
  const initialFabrics = useMemo(() => {
    if (initialData?.fabrics && initialData.fabrics.length > 0) return initialData.fabrics
    if (initialData?.fabric) return initialData.fabric.split(',').map((f) => f.trim()).filter(Boolean)
    return []
  }, [initialData])
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>(initialFabrics)
  const [newFabricInput, setNewFabricInput] = useState('')

  // Occasions (multi-select + add)
  const initialOccasions = useMemo(() => {
    if (initialData?.occasions && initialData.occasions.length > 0) return initialData.occasions
    if (initialData?.occasion) return initialData.occasion.split(',').map((o) => o.trim()).filter(Boolean)
    return []
  }, [initialData])
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(initialOccasions)
  const [newOccasionInput, setNewOccasionInput] = useState('')

  // Patterns (multi-select + add)
  const initialPatterns = useMemo(() => {
    if (initialData?.patterns && initialData.patterns.length > 0) return initialData.patterns
    if (initialData?.pattern) return initialData.pattern.split(',').map((p) => p.trim()).filter(Boolean)
    return []
  }, [initialData])
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>(initialPatterns)
  const [newPatternInput, setNewPatternInput] = useState('')

  // Additional Specs
  const [weave, setWeave] = useState(initialData?.weave || '')
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

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || '')
  const [seoDescription, setSeoDescription] = useState(initialData?.seo_description || '')

  // Taxonomy
  const [categoryId, setCategoryId] = useState<string>(initialData?.category_id || '')
  const [collectionId, setCollectionId] = useState<string>(initialData?.collection_id || '')

  // Images & Supabase Storage state
  const [images, setImages] = useState<ImageItem[]>(initialData?.images || [])
  const [newImagePath, setNewImagePath] = useState('')
  const [newImageAlt, setNewImageAlt] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showManualAdd, setShowManualAdd] = useState(false)

  // Available attributes by type
  const availableColors = useMemo(
    () => attributePool.filter((a) => a.type === 'color'),
    [attributePool]
  )
  const availableFabrics = useMemo(
    () => attributePool.filter((a) => a.type === 'fabric'),
    [attributePool]
  )
  const availableOccasions = useMemo(
    () => attributePool.filter((a) => a.type === 'occasion'),
    [attributePool]
  )
  const availablePatterns = useMemo(
    () => attributePool.filter((a) => a.type === 'pattern'),
    [attributePool]
  )

  // Dynamic attribute helpers
  function toggleColor(name: string) {
    setSelectedColors((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    )
  }

  async function handleAddColor() {
    const val = newColorInput.trim()
    if (!val) return
    if (!selectedColors.includes(val)) {
      setSelectedColors((prev) => [...prev, val])
    }
    if (!availableColors.some((c) => c.name.toLowerCase() === val.toLowerCase())) {
      const newOption: CatalogAttributeOption = {
        id: `color-${slugify(val)}`,
        type: 'color',
        name: val,
        slug: slugify(val),
      }
      setAttributePool((prev) => [...prev, newOption])
      createCatalogAttributeAction('color', val).catch(() => {})
    }
    setNewColorInput('')
  }

  function toggleFabric(name: string) {
    setSelectedFabrics((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name]
    )
  }

  async function handleAddFabric() {
    const val = newFabricInput.trim()
    if (!val) return
    if (!selectedFabrics.includes(val)) {
      setSelectedFabrics((prev) => [...prev, val])
    }
    if (!availableFabrics.some((f) => f.name.toLowerCase() === val.toLowerCase())) {
      const newOption: CatalogAttributeOption = {
        id: `fabric-${slugify(val)}`,
        type: 'fabric',
        name: val,
        slug: slugify(val),
      }
      setAttributePool((prev) => [...prev, newOption])
      createCatalogAttributeAction('fabric', val).catch(() => {})
    }
    setNewFabricInput('')
  }

  function toggleOccasion(name: string) {
    setSelectedOccasions((prev) =>
      prev.includes(name) ? prev.filter((o) => o !== name) : [...prev, name]
    )
  }

  async function handleAddOccasion() {
    const val = newOccasionInput.trim()
    if (!val) return
    if (!selectedOccasions.includes(val)) {
      setSelectedOccasions((prev) => [...prev, val])
    }
    if (!availableOccasions.some((o) => o.name.toLowerCase() === val.toLowerCase())) {
      const newOption: CatalogAttributeOption = {
        id: `occasion-${slugify(val)}`,
        type: 'occasion',
        name: val,
        slug: slugify(val),
      }
      setAttributePool((prev) => [...prev, newOption])
      createCatalogAttributeAction('occasion', val).catch(() => {})
    }
    setNewOccasionInput('')
  }

  function togglePattern(name: string) {
    setSelectedPatterns((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    )
  }

  async function handleAddPattern() {
    const val = newPatternInput.trim()
    if (!val) return
    if (!selectedPatterns.includes(val)) {
      setSelectedPatterns((prev) => [...prev, val])
    }
    if (!availablePatterns.some((p) => p.name.toLowerCase() === val.toLowerCase())) {
      const newOption: CatalogAttributeOption = {
        id: `pattern-${slugify(val)}`,
        type: 'pattern',
        name: val,
        slug: slugify(val),
      }
      setAttributePool((prev) => [...prev, newOption])
      createCatalogAttributeAction('pattern', val).catch(() => {})
    }
    setNewPatternInput('')
  }

  // Handle Title changes
  function handleTitleChange(val: string) {
    setName(val)
    if (isAutoSlug) {
      setSlug(slugify(val))
    }
  }

  // File Upload to Supabase Storage
  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadError(null)
    setIsUploading(true)

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
    const maxSizeBytes = 10 * 1024 * 1024 // 10MB

    const fileArray = Array.from(files)
    const supabase = createClient()
    const newlyUploaded: ImageItem[] = []

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        setUploadProgress(`Uploading ${i + 1} of ${fileArray.length}: ${file.name}...`)

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

        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const storagePath = `products/${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanFileName}`

        const { error: uploadErr } = await supabase.storage
          .from('product-images')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadErr) {
          throw new Error(`Upload failed for "${file.name}": ${uploadErr.message}`)
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('product-images').getPublicUrl(storagePath)

        const fallbackAlt = name
          ? `${name} - saree photo`
          : file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')

        newlyUploaded.push({
          storage_path: publicUrl,
          alt_text: fallbackAlt,
          is_primary: images.length === 0 && newlyUploaded.length === 0,
          sort_order: images.length + newlyUploaded.length,
        })
      }

      setImages((prev) => [...prev, ...newlyUploaded])
    } catch (err: unknown) {
      console.error('File upload error:', err)
      setUploadError(
        err instanceof Error ? err.message : 'An unexpected error occurred during image upload.'
      )
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  function handleMoveImage(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= images.length) return
    const updated = [...images]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setImages(updated.map((img, i) => ({ ...img, sort_order: i })))
  }

  function handleAltChange(index: number, alt: string) {
    setImages(images.map((img, i) => (i === index ? { ...img, alt_text: alt } : img)))
  }

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
    setImages(remaining.map((img, i) => ({ ...img, sort_order: i })))
  }

  // Submit Handler with strict validation rules
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setServerError(null)

    // 1. Mandatory: Product Name
    const cleanName = name.trim()
    if (!cleanName) {
      setServerError('Product name is required.')
      return
    }

    // 2. Mandatory: Slug
    const cleanSlug = slug.trim().toLowerCase()
    if (!cleanSlug) {
      setServerError('Product slug is required.')
      return
    }

    // 3. Mandatory: SKU
    const cleanSku = sku.trim().toUpperCase()
    if (!cleanSku) {
      setServerError('SKU code is required.')
      return
    }

    // 4. Mandatory: Category
    if (!categoryId || !categoryId.trim()) {
      setServerError('Please select a Primary Category for this product.')
      return
    }

    // 5. Mandatory: Selling Price (>= 0)
    const numPrice = parseFloat(price)
    if (isNaN(numPrice) || numPrice < 0) {
      setServerError('Selling price must be a valid non-negative number.')
      return
    }

    // Optional: Compare-at Price
    let numComparePrice: number | null = null
    if (compareAtPrice && compareAtPrice.trim()) {
      numComparePrice = parseFloat(compareAtPrice)
      if (isNaN(numComparePrice) || numComparePrice < 0) {
        setServerError('Sale / original price must be a valid non-negative number.')
        return
      }
      if (numComparePrice < numPrice) {
        setServerError('Sale / compare-at price must be greater than or equal to regular selling price.')
        return
      }
    }

    // 6. Mandatory: Stock Quantity (>= 0)
    const numStock = parseInt(stock, 10)
    if (isNaN(numStock) || numStock < 0) {
      setServerError('Stock on hand must be a non-negative integer.')
      return
    }

    // 7. Mandatory: At least one product image
    const validImages = images.filter((img) => img.storage_path && img.storage_path.trim().length > 0)
    if (validImages.length === 0) {
      setServerError('At least one product image is required.')
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
      fabric: selectedFabrics.join(', ') || undefined,
      weave: weave.trim() || undefined,
      color: selectedColors.join(', ') || undefined,
      occasion: selectedOccasions.join(', ') || undefined,
      pattern: selectedPatterns.join(', ') || undefined,
      colors: selectedColors,
      fabrics: selectedFabrics,
      occasions: selectedOccasions,
      patterns: selectedPatterns,
      saree_length_cm: sareeLengthCm ? parseInt(sareeLengthCm, 10) : null,
      blouse_piece_included: blouseIncluded,
      blouse_piece_length_cm: blouseIncluded ? parseInt(blouseLengthCm, 10) : null,
      care_instructions: careInstructions.trim() || undefined,
      hsn_code: hsnCode.trim() || undefined,
      gst_rate: gstRate ? parseFloat(gstRate) : null,
      category_id: categoryId,
      collection_id: collectionId || null,
      seo_title: seoTitle.trim() || undefined,
      seo_description: seoDescription.trim() || undefined,
      images: validImages,
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
            <span className="text-[#2B211C] font-medium">
              {mode === 'create' ? 'New Product' : 'Edit Product'}
            </span>
          </div>
          <h1 className="text-2xl font-serif font-medium text-[#2B211C]">
            {mode === 'create' ? 'Create New Saree Product' : `Edit: ${name || 'Product'}`}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-[#D6B978]/60 text-xs font-medium text-[#2B211C] rounded-lg hover:bg-[#F8F1E7] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending || isUploading}
            className="px-5 py-2 bg-[#641C24] hover:bg-[#4A141B] text-white text-xs font-medium uppercase tracking-wider rounded-lg transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saving...</span>
              </>
            ) : mode === 'create' ? (
              'Publish Product'
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {serverError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">⚠</span>
            <span>{serverError}</span>
          </div>
          <button
            type="button"
            onClick={() => setServerError(null)}
            className="text-red-600 hover:text-red-900 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Core Product Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Basic Details */}
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
                placeholder="e.g. Royal Cyan Pure Katan Silk Banarasi Saree"
                className="w-full px-3.5 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs sm:text-sm text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
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
                  className="text-[10px] text-[#B58A45] hover:text-[#641C24] underline cursor-pointer"
                >
                  {isAutoSlug ? 'Unlock manual slug edit' : 'Lock & auto-generate from title'}
                </button>
              </div>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-[#EFE2D0] border border-r-0 border-[#D6B978]/60 rounded-l-lg text-[11px] text-[#7A5A45] font-mono select-none">
                  /products/
                </span>
                <input
                  id="product-slug"
                  type="text"
                  required
                  value={slug}
                  disabled={isAutoSlug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  placeholder="royal-cyan-pure-katan-silk-saree"
                  className="w-full px-3 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-r-lg text-xs font-mono text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24] disabled:opacity-75"
                />
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label htmlFor="product-short-desc" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                Short Subtitle / Excerpt
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
                  Selling Price (₹) <span className="text-red-600">*</span>
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
                  Compare-at / Original Price (₹) <span className="text-[10px] text-[#7A5A45]">(Optional strike-through)</span>
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

          {/* Card: Saree Attributes & Specifications */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D6B978]/40 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#B58A45]">
                Saree Attributes & Specifications
              </h2>
              <span className="text-[10px] text-[#7A5A45]">Select existing or add new</span>
            </div>

            {/* 1. Color (multi-select + add) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#2B211C]">
                  Color(s) <span className="text-[10px] text-[#7A5A45]">(Select one or multiple)</span>
                </label>
                {selectedColors.length > 0 && (
                  <span className="text-[10px] text-[#B58A45] font-medium">
                    {selectedColors.length} selected: {selectedColors.join(', ')}
                  </span>
                )}
              </div>

              {/* Color pills */}
              <div className="flex flex-wrap gap-1.5 p-2 bg-[#F8F1E7]/60 rounded-xl border border-[#D6B978]/40 max-h-32 overflow-y-auto">
                {availableColors.map((c) => {
                  const isSelected = selectedColors.includes(c.name)
                  const hex = (c.metadata?.hex as string) || undefined
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleColor(c.name)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#641C24] text-white border border-[#641C24]'
                          : 'bg-white text-[#2B211C] border border-[#D6B978]/60 hover:border-[#641C24]'
                      }`}
                    >
                      {hex && (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: hex }}
                        />
                      )}
                      <span>{c.name}</span>
                      {isSelected && <span className="text-[10px]">✕</span>}
                    </button>
                  )
                })}
              </div>

              {/* Add custom color */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newColorInput}
                  onChange={(e) => setNewColorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddColor()
                    }
                  }}
                  placeholder="Add new color (e.g. Peacock Blue)..."
                  className="flex-1 px-3 py-1.5 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3 py-1.5 bg-[#EFE2D0] hover:bg-[#D6B978]/40 border border-[#D6B978]/60 rounded-lg text-xs font-medium text-[#2B211C] transition-colors cursor-pointer"
                >
                  + Add Color
                </button>
              </div>
            </div>

            {/* 2. Fabric (multi-select + add) */}
            <div className="space-y-2 pt-2 border-t border-[#D6B978]/30">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#2B211C]">
                  Fabric / Material <span className="text-[10px] text-[#7A5A45]">(Select one or multiple)</span>
                </label>
                {selectedFabrics.length > 0 && (
                  <span className="text-[10px] text-[#B58A45] font-medium">
                    {selectedFabrics.length} selected: {selectedFabrics.join(', ')}
                  </span>
                )}
              </div>

              {/* Fabric pills */}
              <div className="flex flex-wrap gap-1.5 p-2 bg-[#F8F1E7]/60 rounded-xl border border-[#D6B978]/40 max-h-32 overflow-y-auto">
                {availableFabrics.map((f) => {
                  const isSelected = selectedFabrics.includes(f.name)
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => toggleFabric(f.name)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#641C24] text-white border border-[#641C24]'
                          : 'bg-white text-[#2B211C] border border-[#D6B978]/60 hover:border-[#641C24]'
                      }`}
                    >
                      <span>{f.name}</span>
                      {isSelected && <span className="ml-1 text-[10px]">✕</span>}
                    </button>
                  )
                })}
              </div>

              {/* Add custom fabric */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newFabricInput}
                  onChange={(e) => setNewFabricInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddFabric()
                    }
                  }}
                  placeholder="Add new fabric (e.g. Mulberry Silk)..."
                  className="flex-1 px-3 py-1.5 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
                />
                <button
                  type="button"
                  onClick={handleAddFabric}
                  className="px-3 py-1.5 bg-[#EFE2D0] hover:bg-[#D6B978]/40 border border-[#D6B978]/60 rounded-lg text-xs font-medium text-[#2B211C] transition-colors cursor-pointer"
                >
                  + Add Fabric
                </button>
              </div>
            </div>

            {/* 3. Occasion (multi-select + add) */}
            <div className="space-y-2 pt-2 border-t border-[#D6B978]/30">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#2B211C]">
                  Occasion <span className="text-[10px] text-[#7A5A45]">(Select one or multiple)</span>
                </label>
                {selectedOccasions.length > 0 && (
                  <span className="text-[10px] text-[#B58A45] font-medium">
                    {selectedOccasions.length} selected: {selectedOccasions.join(', ')}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 p-2 bg-[#F8F1E7]/60 rounded-xl border border-[#D6B978]/40 max-h-28 overflow-y-auto">
                {availableOccasions.map((o) => {
                  const isSelected = selectedOccasions.includes(o.name)
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => toggleOccasion(o.name)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#641C24] text-white border border-[#641C24]'
                          : 'bg-white text-[#2B211C] border border-[#D6B978]/60 hover:border-[#641C24]'
                      }`}
                    >
                      <span>{o.name}</span>
                      {isSelected && <span className="ml-1 text-[10px]">✕</span>}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newOccasionInput}
                  onChange={(e) => setNewOccasionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddOccasion()
                    }
                  }}
                  placeholder="Add new occasion (e.g. Sangeet)..."
                  className="flex-1 px-3 py-1.5 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
                />
                <button
                  type="button"
                  onClick={handleAddOccasion}
                  className="px-3 py-1.5 bg-[#EFE2D0] hover:bg-[#D6B978]/40 border border-[#D6B978]/60 rounded-lg text-xs font-medium text-[#2B211C] transition-colors cursor-pointer"
                >
                  + Add Occasion
                </button>
              </div>
            </div>

            {/* 4. Pattern (multi-select + add) */}
            <div className="space-y-2 pt-2 border-t border-[#D6B978]/30">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#2B211C]">
                  Pattern / Motifs <span className="text-[10px] text-[#7A5A45]">(Select one or multiple)</span>
                </label>
                {selectedPatterns.length > 0 && (
                  <span className="text-[10px] text-[#B58A45] font-medium">
                    {selectedPatterns.length} selected: {selectedPatterns.join(', ')}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-1.5 p-2 bg-[#F8F1E7]/60 rounded-xl border border-[#D6B978]/40 max-h-28 overflow-y-auto">
                {availablePatterns.map((p) => {
                  const isSelected = selectedPatterns.includes(p.name)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePattern(p.name)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#641C24] text-white border border-[#641C24]'
                          : 'bg-white text-[#2B211C] border border-[#D6B978]/60 hover:border-[#641C24]'
                      }`}
                    >
                      <span>{p.name}</span>
                      {isSelected && <span className="ml-1 text-[10px]">✕</span>}
                    </button>
                  )
                })}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newPatternInput}
                  onChange={(e) => setNewPatternInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddPattern()
                    }
                  }}
                  placeholder="Add new pattern (e.g. Peacock Motifs)..."
                  className="flex-1 px-3 py-1.5 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
                />
                <button
                  type="button"
                  onClick={handleAddPattern}
                  className="px-3 py-1.5 bg-[#EFE2D0] hover:bg-[#D6B978]/40 border border-[#D6B978]/60 rounded-lg text-xs font-medium text-[#2B211C] transition-colors cursor-pointer"
                >
                  + Add Pattern
                </button>
              </div>
            </div>

            {/* Weave, Length, Blouse */}
            <div className="pt-3 border-t border-[#D6B978]/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="spec-weave" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                  Weave Technique
                </label>
                <input
                  id="spec-weave"
                  type="text"
                  value={weave}
                  onChange={(e) => setWeave(e.target.value)}
                  placeholder="Kanjeevaram Korvai, Jacquard, Kadwa"
                  className="w-full px-3 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
                />
              </div>

              <div>
                <label htmlFor="spec-length" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                  Saree Length (cm)
                </label>
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

              <div>
                <label htmlFor="spec-care" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                  Wash & Care Instructions
                </label>
                <input
                  id="spec-care"
                  type="text"
                  value={careInstructions}
                  onChange={(e) => setCareInstructions(e.target.value)}
                  placeholder="Dry clean recommended. Wrap in muslin cloth."
                  className="w-full px-3 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
                />
              </div>

              <div>
                <label htmlFor="spec-hsn" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                  HSN Code
                </label>
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
                <label htmlFor="spec-gst" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                  GST Rate (%)
                </label>
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
          </div>

          {/* Card: SEO & Metadata */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D6B978]/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#B58A45]">
                Search Engine Optimization (SEO)
              </h2>
              <span className="text-[10px] text-[#7A5A45]">Optional metadata</span>
            </div>

            <div>
              <label htmlFor="seo-title" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                SEO Meta Title
              </label>
              <input
                id="seo-title"
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Royal Cyan Banarasi Silk Saree — PNT Creation"
                className="w-full px-3.5 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
              />
            </div>

            <div>
              <label htmlFor="seo-desc" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                SEO Meta Description
              </label>
              <textarea
                id="seo-desc"
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Shop our authentic handcrafted pure silk Banarasi saree with opulent zari border. Free insured shipping across India."
                className="w-full px-3.5 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Column: Status, Organization & Images */}
        <div className="space-y-6">
          {/* Card: Status & Visibility */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D6B978]/40 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#B58A45]">
              Status & Visibility
            </h2>

            <div>
              <label htmlFor="product-status" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                Product Status <span className="text-red-600">*</span>
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

          {/* Card: Organization (Category mandatory) */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D6B978]/40 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#B58A45]">
              Organization
            </h2>

            {/* Category */}
            <div>
              <label htmlFor="product-category" className="block text-xs font-medium text-[#2B211C] mb-1.5">
                Primary Category <span className="text-red-600">*</span>
              </label>
              <select
                id="product-category"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F1E7] border border-[#D6B978]/60 rounded-lg text-xs text-[#2B211C] focus:outline-none focus:border-[#641C24] cursor-pointer"
              >
                <option value="">Select a category...</option>
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
                Collection <span className="text-[10px] text-[#7A5A45]">(Optional)</span>
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

          {/* Card: Product Images (Mandatory: at least 1 image) */}
          <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#D6B978]/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#B58A45]">
                Product Images <span className="text-red-600">*</span>
              </h2>
              <span className="text-[10px] text-[#7A5A45] font-medium">
                {images.length} added
              </span>
            </div>

            {/* File Upload Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setIsDragging(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                setIsDragging(false)
                handleFilesSelected(e.dataTransfer.files)
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`relative p-5 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#641C24] bg-[#641C24]/5'
                  : 'border-[#D6B978]/60 bg-[#F8F1E7]/50 hover:bg-[#F8F1E7] hover:border-[#641C24]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
                disabled={isUploading}
              />

              {isUploading ? (
                <div className="py-2 flex flex-col items-center gap-2">
                  <svg className="animate-spin h-6 w-6 text-[#641C24]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-xs font-medium text-[#2B211C]">
                    {uploadProgress || 'Uploading to Supabase Storage...'}
                  </span>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-[#EFE2D0] flex items-center justify-center mb-2 text-[#641C24]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-[#2B211C]">
                    Click to browse or drag & drop saree photos
                  </p>
                  <p className="text-[10px] text-[#7A5A45] mt-0.5">
                    Supports JPG, PNG, WebP, AVIF up to 10MB each
                  </p>
                </>
              )}
            </div>

            {/* Upload Error notification */}
            {uploadError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between">
                <span>{uploadError}</span>
                <button
                  type="button"
                  onClick={() => setUploadError(null)}
                  className="text-red-600 hover:text-red-800 font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Current Images List */}
            {images.length > 0 && (
              <div className="space-y-3 pt-1">
                <span className="text-[11px] font-semibold text-[#B58A45] block uppercase tracking-wider">
                  Product Gallery ({images.length})
                </span>
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#F8F1E7] border border-[#D6B978]/50 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-3"
                  >
                    {/* Thumbnail Preview */}
                    <div className="relative w-16 h-20 rounded-lg overflow-hidden border border-[#D6B978]/60 bg-white shrink-0 shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.storage_path}
                        alt={img.alt_text || 'Saree thumbnail'}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#2B211C]/80 text-[#F8F1E7]">
                        #{idx + 1}
                      </span>
                    </div>

                    {/* Details & Alt Edit */}
                    <div className="flex-1 w-full space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-mono text-[#7A5A45] truncate max-w-[180px]" title={img.storage_path}>
                          {img.storage_path.split('/').pop() || img.storage_path}
                        </span>
                        {img.is_primary ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#B58A45]/20 text-[#B58A45] font-semibold border border-[#B58A45]/40 shrink-0">
                            ★ Primary Image
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className="text-[10px] text-[#7A5A45] hover:text-[#641C24] font-medium cursor-pointer shrink-0 underline"
                          >
                            Set as Primary
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-[#7A5A45] mb-0.5">
                          Alt Text (Accessibility & SEO)
                        </label>
                        <input
                          type="text"
                          value={img.alt_text || ''}
                          onChange={(e) => handleAltChange(idx, e.target.value)}
                          placeholder="e.g. Front pallu view of royal cyan banarasi saree"
                          className="w-full px-2.5 py-1 text-xs bg-white border border-[#D6B978]/60 rounded-md text-[#2B211C] placeholder-[#A68A78] focus:outline-none focus:border-[#641C24]"
                        />
                      </div>
                    </div>

                    {/* Order & Remove Controls */}
                    <div className="flex sm:flex-col items-center justify-end gap-1.5 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#D6B978]/30">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'up')}
                          disabled={idx === 0}
                          title="Move image up in display order"
                          className="p-1 px-1.5 rounded bg-white hover:bg-[#EFE2D0] border border-[#D6B978]/50 text-[#2B211C] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'down')}
                          disabled={idx === images.length - 1}
                          title="Move image down in display order"
                          className="p-1 px-1.5 rounded bg-white hover:bg-[#EFE2D0] border border-[#D6B978]/50 text-[#2B211C] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs"
                        >
                          ▼
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded font-bold cursor-pointer"
                        title="Remove image"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Manual Reference Entry Accordion */}
            <div className="pt-2 border-t border-[#D6B978]/40">
              <button
                type="button"
                onClick={() => setShowManualAdd(!showManualAdd)}
                className="text-xs text-[#7A5A45] hover:text-[#2B211C] font-medium flex items-center justify-between w-full cursor-pointer py-1"
              >
                <span>{showManualAdd ? '▾ Hide manual URL/path input' : '▸ Or add image by URL / existing path'}</span>
                <span className="text-[10px] text-[#B58A45]">{showManualAdd ? 'Collapse' : 'Expand'}</span>
              </button>

              {showManualAdd && (
                <div className="pt-2 space-y-2">
                  <input
                    type="text"
                    value={newImagePath}
                    onChange={(e) => setNewImagePath(e.target.value)}
                    placeholder="Image URL or path (e.g. /images/products/teal-saree.jpg)"
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
              )}
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
