'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import ProductFilters, { FilterState } from './ProductFilters'
import ProductCard from './ProductCard'
import ProductSkeleton from './ProductSkeleton'
import type {
  CatalogAttributeOption,
  PriceRangeOption,
  StorefrontCategory,
  StorefrontProduct,
} from '@/lib/supabase/storefront'

export type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name-asc'

export interface StorefrontCatalogProps {
  products: StorefrontProduct[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  startIndex: number
  endIndex: number
  categories: StorefrontCategory[]
  priceRanges: PriceRangeOption[]
  attributes: CatalogAttributeOption[]
  initialFilters: FilterState
  initialSort: SortOption
  initialViewMode?: 'grid' | 'list'
  collectionSlug?: string
  collectionName?: string
}

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'name-asc', label: 'Name: A–Z' },
]

export default function StorefrontCatalog({
  products,
  totalCount,
  page,
  pageSize,
  totalPages,
  startIndex,
  endIndex,
  categories,
  priceRanges,
  attributes,
  initialFilters,
  initialSort,
  initialViewMode = 'grid',
  collectionSlug,
}: StorefrontCatalogProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // View layout switch state (grid / list)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode)

  // Mobile drawer open state and draft filters during mobile interaction
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [drawerFilters, setDrawerFilters] = useState<FilterState | null>(null)

  // Active filters for display: draft filters if mobile drawer open, otherwise committed initialFilters
  const activeFilters = isMobileDrawerOpen && drawerFilters ? drawerFilters : initialFilters

  // Count committed active filters
  const activeFiltersCount =
    (initialFilters.category && initialFilters.category !== 'all' ? 1 : 0) +
    initialFilters.priceRanges.length +
    initialFilters.colors.length +
    initialFilters.fabrics.length +
    initialFilters.occasions.length +
    initialFilters.patterns.length

  const hasActiveFilters = activeFiltersCount > 0

  /**
   * Commit filter / sort / page updates to URL search parameters
   */
  function navigateWithParams(
    updatedFilters: FilterState,
    updatedSort: SortOption,
    updatedPage: number = 1,
    updatedView?: 'grid' | 'list'
  ) {
    startTransition(() => {
      const params = new URLSearchParams()

      // Preserve collection filter if exists
      if (collectionSlug) {
        params.set('collection', collectionSlug)
      } else {
        const col = searchParams.get('collection')
        if (col) params.set('collection', col)
      }

      // Category
      if (updatedFilters.category && updatedFilters.category !== 'all') {
        params.set('category', updatedFilters.category)
      }

      // Price ranges (comma-separated IDs)
      if (updatedFilters.priceRanges.length > 0) {
        params.set('price', updatedFilters.priceRanges.join(','))
      }

      // Colors
      if (updatedFilters.colors.length > 0) {
        params.set('color', updatedFilters.colors.join(','))
      }

      // Fabrics
      if (updatedFilters.fabrics.length > 0) {
        params.set('fabric', updatedFilters.fabrics.join(','))
      }

      // Occasions
      if (updatedFilters.occasions.length > 0) {
        params.set('occasion', updatedFilters.occasions.join(','))
      }

      // Patterns
      if (updatedFilters.patterns.length > 0) {
        params.set('pattern', updatedFilters.patterns.join(','))
      }

      // Sort (only if not default 'featured')
      if (updatedSort && updatedSort !== 'featured') {
        params.set('sort', updatedSort)
      }

      // View mode
      const view = updatedView || viewMode
      if (view && view !== 'grid') {
        params.set('view', view)
      }

      // Page
      if (updatedPage > 1) {
        params.set('page', updatedPage.toString())
      }

      const queryString = params.toString()
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname
      router.push(targetUrl, { scroll: false })
    })
  }

  // Filter change handler
  function handleFilterChange(newFilters: FilterState) {
    if (isMobileDrawerOpen) {
      setDrawerFilters(newFilters)
    } else {
      navigateWithParams(newFilters, initialSort, 1)
    }
  }

  // Open mobile drawer with copy of initialFilters
  function handleOpenMobileDrawer() {
    setDrawerFilters(initialFilters)
    setIsMobileDrawerOpen(true)
  }

  // Close mobile drawer without applying draft changes
  function handleCloseMobileDrawer() {
    setIsMobileDrawerOpen(false)
    setDrawerFilters(null)
  }

  // Apply mobile drawer filters
  function handleApplyMobileFilters() {
    const filtersToApply = drawerFilters || initialFilters
    setIsMobileDrawerOpen(false)
    setDrawerFilters(null)
    navigateWithParams(filtersToApply, initialSort, 1)
  }

  // Sort change handler
  function handleSortChange(newSort: SortOption) {
    navigateWithParams(initialFilters, newSort, 1)
  }

  // View toggle handler
  function handleViewToggle(newView: 'grid' | 'list') {
    setViewMode(newView)
    navigateWithParams(initialFilters, initialSort, page, newView)
  }

  // Page change handler
  function handlePageChange(newPage: number) {
    if (newPage < 1 || newPage > totalPages || newPage === page) return
    navigateWithParams(initialFilters, initialSort, newPage)
    // Smooth scroll to top of catalog section
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 260, behavior: 'smooth' })
    }
  }

  // Clear all filters handler
  function handleClearAll() {
    const emptyFilters: FilterState = {
      category: 'all',
      priceRanges: [],
      colors: [],
      fabrics: [],
      occasions: [],
      patterns: [],
    }
    setDrawerFilters(emptyFilters)
    setIsMobileDrawerOpen(false)
    navigateWithParams(emptyFilters, initialSort, 1)
  }

  // Individual chip removal helpers (act on initialFilters directly)
  function removeCategoryFilter() {
    navigateWithParams({ ...initialFilters, category: 'all' }, initialSort, 1)
  }

  function removePriceRange(rangeId: string) {
    navigateWithParams(
      {
        ...initialFilters,
        priceRanges: initialFilters.priceRanges.filter((id) => id !== rangeId),
      },
      initialSort,
      1
    )
  }

  function removeColor(color: string) {
    navigateWithParams(
      {
        ...initialFilters,
        colors: initialFilters.colors.filter((c) => c !== color),
      },
      initialSort,
      1
    )
  }

  function removeFabric(fabric: string) {
    navigateWithParams(
      {
        ...initialFilters,
        fabrics: initialFilters.fabrics.filter((f) => f !== fabric),
      },
      initialSort,
      1
    )
  }

  function removeOccasion(occasion: string) {
    navigateWithParams(
      {
        ...initialFilters,
        occasions: initialFilters.occasions.filter((o) => o !== occasion),
      },
      initialSort,
      1
    )
  }

  function removePattern(pattern: string) {
    navigateWithParams(
      {
        ...initialFilters,
        patterns: initialFilters.patterns.filter((p) => p !== pattern),
      },
      initialSort,
      1
    )
  }

  // Format count text
  const countText =
    totalCount === 0
      ? 'Showing 0 products'
      : totalCount === 1
      ? 'Showing 1 of 1 product'
      : `Showing ${startIndex}–${endIndex} of ${totalCount} products`

  // Current category name for active chip
  const activeCategoryObj = categories.find((c) => c.slug === initialFilters.category)
  const showCategoryChip =
    initialFilters.category &&
    initialFilters.category !== 'all' &&
    activeCategoryObj?.name

  return (
    <div className="w-full">
      {/* ==================================================== */}
      {/* 2. CATALOG TOOLBAR */}
      {/* ==================================================== */}
      <div className="bg-white/80 backdrop-blur-xs border-y border-[#D6B978]/40 px-4 sm:px-6 lg:px-8 py-3.5 mb-6 sm:mb-8 transition-colors">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          {/* Mobile Toolbar Buttons */}
          <div className="flex items-center gap-2 lg:hidden w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={handleOpenMobileDrawer}
              aria-label="Open filter drawer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#D6B978]/60 hover:border-[#641C24] text-xs font-medium uppercase tracking-wider text-[#2B211C] hover:text-[#641C24] rounded-sm transition-colors cursor-pointer shadow-2xs"
            >
              <span className="text-sm">⚡</span>
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 bg-[#641C24] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-sans font-semibold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Mobile Sort Dropdown */}
            <div className="relative flex-1 sm:flex-initial">
              <label htmlFor="mobile-sort-select" className="sr-only">
                Sort by
              </label>
              <select
                id="mobile-sort-select"
                value={initialSort}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                aria-label="Sort products"
                className="w-full appearance-none px-3.5 py-2 pr-8 bg-white border border-[#D6B978]/60 text-xs font-medium text-[#2B211C] rounded-sm focus:outline-none focus:border-[#641C24] cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    Sort: {opt.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[10px] text-[#7A5A45]">
                ▼
              </span>
            </div>
          </div>

          {/* Desktop Left: Dynamic Product Count */}
          <div className="hidden lg:flex items-center gap-3">
            <p className="text-xs sm:text-sm font-medium tracking-wide text-[#7A5A45]">
              {countText}
            </p>
            {isPending && (
              <span className="inline-block h-2 w-2 rounded-full bg-[#641C24] animate-ping" />
            )}
          </div>

          {/* Desktop Right: Sort By Dropdown & Grid/List Toggle */}
          <div className="hidden lg:flex items-center gap-5 ml-auto">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="desktop-sort-select"
                className="text-xs uppercase tracking-wider text-[#7A5A45] font-medium"
              >
                Sort By:
              </label>
              <div className="relative">
                <select
                  id="desktop-sort-select"
                  value={initialSort}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  aria-label="Sort products"
                  className="appearance-none px-3 py-1.5 pr-7 bg-white border border-[#D6B978]/60 text-xs font-medium text-[#2B211C] rounded-sm focus:outline-none focus:border-[#641C24] cursor-pointer hover:border-[#B58A45] transition-colors"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-[9px] text-[#7A5A45]">
                  ▼
                </span>
              </div>
            </div>

            {/* Grid / List View Toggle */}
            <div
              className="flex items-center border border-[#D6B978]/60 rounded-sm overflow-hidden bg-white"
              role="group"
              aria-label="View layout switch"
            >
              <button
                type="button"
                onClick={() => handleViewToggle('grid')}
                aria-label="Grid layout view"
                aria-pressed={viewMode === 'grid'}
                className={`px-2.5 py-1.5 text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                  viewMode === 'grid'
                    ? 'bg-[#641C24] text-white font-medium'
                    : 'text-[#7A5A45] hover:bg-[#F8F1E7] hover:text-[#2B211C]'
                }`}
              >
                <span>⊞</span>
                <span className="text-[11px]">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => handleViewToggle('list')}
                aria-label="List layout view"
                aria-pressed={viewMode === 'list'}
                className={`px-2.5 py-1.5 text-xs transition-colors cursor-pointer flex items-center gap-1 border-l border-[#D6B978]/40 ${
                  viewMode === 'list'
                    ? 'bg-[#641C24] text-white font-medium'
                    : 'text-[#7A5A45] hover:bg-[#F8F1E7] hover:text-[#2B211C]'
                }`}
              >
                <span>☰</span>
                <span className="text-[11px]">List</span>
              </button>
            </div>
          </div>

          {/* Mobile Bottom Row Count */}
          <div className="lg:hidden w-full flex items-center justify-between pt-1 border-t border-[#D6B978]/20 text-xs text-[#7A5A45]">
            <span>{countText}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleViewToggle('grid')}
                className={`p-1 text-xs rounded-xs ${
                  viewMode === 'grid' ? 'text-[#641C24] font-bold' : 'text-[#7A5A45]'
                }`}
                aria-label="Grid view"
              >
                ⊞
              </button>
              <button
                type="button"
                onClick={() => handleViewToggle('list')}
                className={`p-1 text-xs rounded-xs ${
                  viewMode === 'list' ? 'text-[#641C24] font-bold' : 'text-[#7A5A45]'
                }`}
                aria-label="List view"
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MAIN CATALOG AREA: SIDEBAR + PRODUCT GRID */}
      {/* ==================================================== */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
          {/* 3. FILTER SIDEBAR (Desktop) & MOBILE DRAWER */}
          <ProductFilters
            categories={categories}
            priceRanges={priceRanges}
            attributes={attributes}
            filters={activeFilters}
            onFilterChange={handleFilterChange}
            onClearAll={handleClearAll}
            isMobileDrawerOpen={isMobileDrawerOpen}
            onCloseMobileDrawer={handleCloseMobileDrawer}
            onApplyMobileFilters={handleApplyMobileFilters}
            totalCount={totalCount}
          />

          {/* PRODUCT DISPLAY COLUMN */}
          <div className="flex-1 w-full min-w-0">
            {/* ACTIVE FILTERS CHIP BAR */}
            {hasActiveFilters && (
              <div className="mb-6 flex flex-wrap items-center gap-2 p-3 bg-white/60 border border-[#D6B978]/30 rounded-sm">
                <span className="text-xs uppercase tracking-wider text-[#7A5A45] font-semibold mr-1">
                  Active:
                </span>

                {/* Category Chip */}
                {showCategoryChip && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#641C24]/10 text-[#641C24] text-xs rounded-full font-medium border border-[#641C24]/20">
                    <span>{activeCategoryObj.name}</span>
                    <button
                      type="button"
                      onClick={removeCategoryFilter}
                      aria-label={`Remove category filter ${activeCategoryObj.name}`}
                      className="hover:text-[#4A141B] cursor-pointer text-xs"
                    >
                      ✕
                    </button>
                  </span>
                )}

                {/* Price Range Chips */}
                {initialFilters.priceRanges.map((rangeId) => {
                  const rangeDef = priceRanges.find((r) => r.id === rangeId)
                  if (!rangeDef) return null
                  return (
                    <span
                      key={rangeId}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#641C24]/10 text-[#641C24] text-xs rounded-full font-medium border border-[#641C24]/20"
                    >
                      <span>{rangeDef.label}</span>
                      <button
                        type="button"
                        onClick={() => removePriceRange(rangeId)}
                        aria-label={`Remove price filter ${rangeDef.label}`}
                        className="hover:text-[#4A141B] cursor-pointer text-xs"
                      >
                        ✕
                      </button>
                    </span>
                  )
                })}

                {/* Color Chips */}
                {initialFilters.colors.map((color) => (
                  <span
                    key={color}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#641C24]/10 text-[#641C24] text-xs rounded-full font-medium border border-[#641C24]/20"
                  >
                    <span>{color}</span>
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      aria-label={`Remove color filter ${color}`}
                      className="hover:text-[#4A141B] cursor-pointer text-xs"
                    >
                      ✕
                    </button>
                  </span>
                ))}

                {/* Fabric Chips */}
                {initialFilters.fabrics.map((fabric) => (
                  <span
                    key={fabric}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#641C24]/10 text-[#641C24] text-xs rounded-full font-medium border border-[#641C24]/20"
                  >
                    <span>{fabric}</span>
                    <button
                      type="button"
                      onClick={() => removeFabric(fabric)}
                      aria-label={`Remove fabric filter ${fabric}`}
                      className="hover:text-[#4A141B] cursor-pointer text-xs"
                    >
                      ✕
                    </button>
                  </span>
                ))}

                {/* Occasion Chips */}
                {initialFilters.occasions.map((occasion) => (
                  <span
                    key={occasion}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#641C24]/10 text-[#641C24] text-xs rounded-full font-medium border border-[#641C24]/20"
                  >
                    <span>{occasion}</span>
                    <button
                      type="button"
                      onClick={() => removeOccasion(occasion)}
                      aria-label={`Remove occasion filter ${occasion}`}
                      className="hover:text-[#4A141B] cursor-pointer text-xs"
                    >
                      ✕
                    </button>
                  </span>
                ))}

                {/* Pattern Chips */}
                {initialFilters.patterns.map((pattern) => (
                  <span
                    key={pattern}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#641C24]/10 text-[#641C24] text-xs rounded-full font-medium border border-[#641C24]/20"
                  >
                    <span>{pattern}</span>
                    <button
                      type="button"
                      onClick={() => removePattern(pattern)}
                      aria-label={`Remove pattern filter ${pattern}`}
                      className="hover:text-[#4A141B] cursor-pointer text-xs"
                    >
                      ✕
                    </button>
                  </span>
                ))}

                {/* Clear All Action */}
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="ml-auto text-xs font-medium text-[#641C24] hover:text-[#4A141B] underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* 11. LOADING SKELETON (when transitioning) */}
            {isPending ? (
              <ProductSkeleton count={pageSize} viewMode={viewMode} />
            ) : totalCount === 0 ? (
              /* ==================================================== */
              /* 10. EMPTY STATE */
              /* ==================================================== */
              <div className="mx-auto max-w-lg rounded-sm border border-[#D6B978]/40 bg-white/70 p-8 sm:p-12 text-center backdrop-blur-xs">
                <div className="text-3xl text-[#B58A45] mb-3 select-none">✧</div>
                <h3 className="font-serif text-2xl text-[#641C24] font-normal">
                  No sarees found
                </h3>
                <p className="mt-2 text-sm text-[#7A5A45] leading-relaxed">
                  Try adjusting your filters or explore our full collection.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-6 py-2.5 bg-[#641C24] hover:bg-[#4A141B] text-white text-xs font-medium uppercase tracking-widest rounded-xs transition-colors cursor-pointer shadow-xs"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            ) : (
              /* ==================================================== */
              /* 4. PRODUCT GRID & 5. PRODUCT CARD */
              /* ==================================================== */
              <div>
                {viewMode === 'list' ? (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        viewMode="list"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        viewMode="grid"
                      />
                    ))}
                  </div>
                )}

                {/* ==================================================== */}
                {/* 9. PAGINATION */}
                {/* ==================================================== */}
                {totalPages > 1 && (
                  <nav
                    aria-label="Pagination Navigation"
                    className="mt-12 pt-6 border-t border-[#D6B978]/30 flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <p className="text-xs text-[#7A5A45] order-2 sm:order-1">
                      {countText}
                    </p>

                    <div className="inline-flex items-center gap-1.5 order-1 sm:order-2">
                      {/* Previous Page */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page <= 1 || isPending}
                        aria-label="Go to previous page"
                        className="px-3 py-1.5 border border-[#D6B978]/60 bg-white text-xs font-medium text-[#2B211C] hover:bg-[#F8F1E7] hover:border-[#641C24] rounded-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        ← Previous
                      </button>

                      {/* Page Numbers */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                        const isCurrent = p === page
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handlePageChange(p)}
                            disabled={isPending}
                            aria-label={`Page ${p}`}
                            aria-current={isCurrent ? 'page' : undefined}
                            className={`min-w-8 h-8 px-2 text-xs font-medium rounded-xs transition-colors cursor-pointer flex items-center justify-center ${
                              isCurrent
                                ? 'bg-[#641C24] text-white shadow-xs font-semibold'
                                : 'bg-white border border-[#D6B978]/60 text-[#2B211C] hover:bg-[#F8F1E7] hover:text-[#641C24]'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      })}

                      {/* Next Page */}
                      <button
                        type="button"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page >= totalPages || isPending}
                        aria-label="Go to next page"
                        className="px-3 py-1.5 border border-[#D6B978]/60 bg-white text-xs font-medium text-[#2B211C] hover:bg-[#F8F1E7] hover:border-[#641C24] rounded-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Next →
                      </button>
                    </div>
                  </nav>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
