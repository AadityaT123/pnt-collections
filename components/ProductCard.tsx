'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { StorefrontProduct } from '@/lib/supabase/storefront'
import { assets } from '@/lib/assets'

export interface ProductCardProps {
  product?: StorefrontProduct
  // Backward compatibility with FeaturedCollection:
  image?: string
  alt?: string
  name?: string
  price?: string
  viewMode?: 'grid' | 'list'
  onAddToCart?: (product: StorefrontProduct) => void
  onToggleWishlist?: (productId: string) => void
  isWishlisted?: boolean
}

export default function ProductCard({
  product,
  image,
  alt,
  name,
  price,
  viewMode = 'grid',
  onAddToCart,
  onToggleWishlist,
  isWishlisted: initialWishlisted = false,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted)
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  // Resolve product data (supporting both full StorefrontProduct and legacy props)
  const resolvedName = product?.name || name || 'Saree'
  const resolvedPrice = product?.price || price || '₹0'
  const resolvedComparePrice = product?.compareAtPrice || null
  const resolvedDiscount = product?.discountPercent || null
  const resolvedImage = product?.primaryImage || image || assets.images.products.tealSaree
  const resolvedAlt = product?.primaryImageAlt || alt || resolvedName
  const resolvedSlug = product?.slug || ''
  const isInStock = product ? product.isInStock : true
  const subtitle = product
    ? [product.fabric, product.color].filter(Boolean).join(' • ')
    : null

  // Badges logic (only when supported by actual product data)
  const isFeatured = product?.isFeatured || false
  const isNew = product?.isNew || false

  function handleWishlistClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const nextState = !isWishlisted
    setIsWishlisted(nextState)
    if (product && onToggleWishlist) {
      onToggleWishlist(product.id)
    }
  }

  function handleAddToCartClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!isInStock || isAdding || justAdded) return

    setIsAdding(true)
    setTimeout(() => {
      setIsAdding(false)
      setJustAdded(true)
      if (product && onAddToCart) {
        onAddToCart(product)
      }
      setTimeout(() => {
        setJustAdded(false)
      }, 1800)
    }, 400)
  }

  const productHref = resolvedSlug ? `/products/${resolvedSlug}` : '#sarees'

  // ==========================================
  // LIST VIEW LAYOUT
  // ==========================================
  if (viewMode === 'list') {
    return (
      <article className="group relative flex flex-col sm:flex-row bg-white/70 hover:bg-white rounded-sm border border-[#D6B978]/40 hover:border-[#B58A45] p-3 sm:p-4 transition-all duration-300 hover:shadow-md">
        {/* Product Image Frame */}
        <div className="relative aspect-[3/4] w-full sm:w-48 sm:shrink-0 overflow-hidden bg-[#EFE8DC] rounded-sm">
          <Link href={productHref} className="block w-full h-full">
            <Image
              src={resolvedImage}
              alt={resolvedAlt}
              fill
              sizes="(min-width: 640px) 192px, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
            {resolvedDiscount && resolvedDiscount > 0 ? (
              <span className="bg-[#641C24] text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-xs shadow-xs">
                {resolvedDiscount}% OFF
              </span>
            ) : isFeatured ? (
              <span className="bg-[#B58A45] text-white text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-xs shadow-xs">
                Bestseller
              </span>
            ) : isNew ? (
              <span className="bg-[#2B211C] text-white text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-xs shadow-xs">
                New
              </span>
            ) : null}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? `Remove ${resolvedName} from wishlist` : `Add ${resolvedName} to wishlist`}
            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/85 hover:bg-white text-[#2B211C] hover:text-[#641C24] flex items-center justify-center transition-colors shadow-xs backdrop-blur-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#641C24]"
          >
            <span className={`text-sm ${isWishlisted ? 'text-[#641C24]' : 'text-[#7A5A45]'}`}>
              {isWishlisted ? '♥' : '♡'}
            </span>
          </button>
        </div>

        {/* Product Details */}
        <div className="flex flex-1 flex-col justify-between pt-3 sm:pt-0 sm:pl-5">
          <div className="space-y-1.5">
            {subtitle && (
              <p className="text-[11px] font-medium tracking-widest uppercase text-[#B58A45]">
                {subtitle}
              </p>
            )}

            <Link href={productHref} className="block">
              <h3 className="font-serif text-lg sm:text-xl text-[#2B211C] transition-colors group-hover:text-[#641C24]">
                {resolvedName}
              </h3>
            </Link>

            {product?.shortDescription && (
              <p className="text-xs text-[#7A5A45] line-clamp-2 leading-relaxed max-w-xl">
                {product.shortDescription}
              </p>
            )}

            {/* Price section */}
            <div className="pt-2 flex items-baseline gap-2.5">
              <span className="font-serif text-lg sm:text-xl font-medium text-[#2B211C]">
                {resolvedPrice}
              </span>
              {resolvedComparePrice && (
                <span className="text-xs sm:text-sm text-[#7A5A45] line-through font-normal">
                  {resolvedComparePrice}
                </span>
              )}
              {resolvedDiscount && resolvedDiscount > 0 && (
                <span className="text-xs font-semibold text-emerald-800">
                  Save {resolvedDiscount}%
                </span>
              )}
            </div>

            {!isInStock && (
              <span className="inline-block text-[11px] font-medium uppercase tracking-wider text-red-700 pt-1">
                Currently Out of Stock
              </span>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleAddToCartClick}
              disabled={!isInStock || isAdding}
              className={`px-6 py-2 rounded-xs text-xs font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                justAdded
                  ? 'bg-emerald-800 text-white'
                  : !isInStock
                  ? 'bg-[#EFE2D0] text-[#7A5A45] cursor-not-allowed'
                  : 'bg-[#641C24] text-white hover:bg-[#4A141B] active:scale-[0.99]'
              }`}
            >
              {justAdded ? (
                <>
                  <span>✓</span>
                  <span>Added to Bag</span>
                </>
              ) : isAdding ? (
                <span>Adding...</span>
              ) : !isInStock ? (
                'Out of Stock'
              ) : (
                <>
                  <span>+</span>
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <Link
              href={productHref}
              className="px-4 py-2 rounded-xs text-xs font-medium text-[#2B211C] hover:text-[#641C24] border border-[#D6B978]/60 hover:border-[#641C24] transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      </article>
    )
  }

  // ==========================================
  // GRID VIEW LAYOUT (DEFAULT)
  // ==========================================
  return (
    <article className="group relative flex flex-col bg-white/70 hover:bg-white rounded-sm border border-[#D6B978]/40 hover:border-[#B58A45] p-2.5 sm:p-3 transition-all duration-300 hover:shadow-md">
      {/* Product Image Frame (Consistent 3/4 aspect ratio) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#EFE8DC] rounded-sm">
        <Link href={productHref} className="block w-full h-full">
          <Image
            src={resolvedImage}
            alt={resolvedAlt}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Badges Container (Top-Left) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {resolvedDiscount && resolvedDiscount > 0 ? (
            <span className="bg-[#641C24] text-white text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-xs shadow-xs">
              {resolvedDiscount}% OFF
            </span>
          ) : isFeatured ? (
            <span className="bg-[#B58A45] text-white text-[9px] sm:text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-xs shadow-xs">
              Bestseller
            </span>
          ) : isNew ? (
            <span className="bg-[#2B211C] text-white text-[9px] sm:text-[10px] font-medium tracking-wider uppercase px-2 py-0.5 rounded-xs shadow-xs">
              New
            </span>
          ) : null}
        </div>

        {/* Wishlist Button (Top-Right) */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? `Remove ${resolvedName} from wishlist` : `Add ${resolvedName} to wishlist`}
          className="absolute top-2 right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/85 hover:bg-white text-[#2B211C] hover:text-[#641C24] flex items-center justify-center transition-colors shadow-xs backdrop-blur-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#641C24]"
        >
          <span className={`text-sm sm:text-base ${isWishlisted ? 'text-[#641C24]' : 'text-[#7A5A45]'}`}>
            {isWishlisted ? '♥' : '♡'}
          </span>
        </button>

        {/* Out of Stock Overlay */}
        {!isInStock && (
          <div className="absolute inset-0 bg-[#2B211C]/35 flex items-center justify-center pointer-events-none">
            <span className="bg-[#2B211C]/90 text-white text-[10px] font-medium uppercase tracking-widest px-2.5 py-1 rounded-xs backdrop-blur-xs">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col justify-between pt-2.5 sm:pt-3">
        <div>
          {subtitle ? (
            <p className="text-[10px] sm:text-[11px] font-medium tracking-widest uppercase text-[#B58A45] truncate">
              {subtitle}
            </p>
          ) : (
            <p className="text-[10px] sm:text-[11px] font-medium tracking-widest uppercase text-[#B58A45]">
              Pure Elegance
            </p>
          )}

          <Link href={productHref} className="block mt-0.5">
            <h3 className="font-serif text-sm sm:text-base text-[#2B211C] transition-colors group-hover:text-[#641C24] line-clamp-1">
              {resolvedName}
            </h3>
          </Link>
        </div>

        {/* Price & Discount */}
        <div className="mt-2 pt-2 border-t border-[#D6B978]/25">
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap">
            <span className="font-serif text-base sm:text-lg font-medium text-[#2B211C]">
              {resolvedPrice}
            </span>
            {resolvedComparePrice && (
              <span className="text-[11px] sm:text-xs text-[#7A5A45] line-through font-normal">
                {resolvedComparePrice}
              </span>
            )}
            {resolvedDiscount && resolvedDiscount > 0 && (
              <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-800">
                ({resolvedDiscount}% off)
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCartClick}
            disabled={!isInStock || isAdding}
            className={`mt-2.5 w-full py-1.5 sm:py-2 text-[11px] sm:text-xs font-medium uppercase tracking-wider rounded-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              justAdded
                ? 'bg-emerald-800 text-white'
                : !isInStock
                ? 'bg-[#EFE2D0] text-[#7A5A45] cursor-not-allowed'
                : 'bg-[#641C24] text-white hover:bg-[#4A141B] active:scale-[0.99]'
            }`}
          >
            {justAdded ? (
              <>
                <span>✓</span>
                <span>Added</span>
              </>
            ) : isAdding ? (
              <span>Adding...</span>
            ) : !isInStock ? (
              'Out of Stock'
            ) : (
              <>
                <span>+</span>
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
}