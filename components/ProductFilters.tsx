'use client'

import { useState } from 'react'
import type {
  CatalogAttributeOption,
  PriceRangeOption,
  StorefrontCategory,
} from '@/lib/supabase/storefront'

export interface FilterState {
  category: string
  priceRanges: string[]
  colors: string[]
  fabrics: string[]
  occasions: string[]
  patterns: string[]
}

interface ProductFiltersProps {
  categories: StorefrontCategory[]
  priceRanges: PriceRangeOption[]
  attributes: CatalogAttributeOption[]
  filters: FilterState
  onFilterChange: (newFilters: FilterState) => void
  onClearAll: () => void
  isMobileDrawerOpen?: boolean
  onCloseMobileDrawer?: () => void
  onApplyMobileFilters?: () => void
  totalCount?: number
}

export default function ProductFilters({
  categories,
  priceRanges,
  attributes,
  filters,
  onFilterChange,
  onClearAll,
  isMobileDrawerOpen = false,
  onCloseMobileDrawer,
  onApplyMobileFilters,
  totalCount,
}: ProductFiltersProps) {
  // Collapsible section states (open by default)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true,
    price: true,
    color: true,
    fabric: true,
    occasion: false,
    pattern: false,
  })

  function toggleSection(section: string) {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Filter option pools
  const colorOptions = attributes.filter((a) => a.type === 'color')
  const fabricOptions = attributes.filter((a) => a.type === 'fabric')
  const occasionOptions = attributes.filter((a) => a.type === 'occasion')
  const patternOptions = attributes.filter((a) => a.type === 'pattern')

  // Check if any filters are active
  const hasActiveFilters =
    (filters.category && filters.category !== 'all') ||
    filters.priceRanges.length > 0 ||
    filters.colors.length > 0 ||
    filters.fabrics.length > 0 ||
    filters.occasions.length > 0 ||
    filters.patterns.length > 0

  // Category handler
  function handleSelectCategory(catSlug: string) {
    onFilterChange({
      ...filters,
      category: catSlug,
    })
  }

  // Price range toggle
  function handleTogglePriceRange(rangeId: string) {
    const next = filters.priceRanges.includes(rangeId)
      ? filters.priceRanges.filter((id) => id !== rangeId)
      : [...filters.priceRanges, rangeId]
    onFilterChange({
      ...filters,
      priceRanges: next,
    })
  }

  // Color toggle
  function handleToggleColor(colorName: string) {
    const next = filters.colors.includes(colorName)
      ? filters.colors.filter((c) => c !== colorName)
      : [...filters.colors, colorName]
    onFilterChange({
      ...filters,
      colors: next,
    })
  }

  // Fabric toggle
  function handleToggleFabric(fabricName: string) {
    const next = filters.fabrics.includes(fabricName)
      ? filters.fabrics.filter((f) => f !== fabricName)
      : [...filters.fabrics, fabricName]
    onFilterChange({
      ...filters,
      fabrics: next,
    })
  }

  // Occasion toggle
  function handleToggleOccasion(occasionName: string) {
    const next = filters.occasions.includes(occasionName)
      ? filters.occasions.filter((o) => o !== occasionName)
      : [...filters.occasions, occasionName]
    onFilterChange({
      ...filters,
      occasions: next,
    })
  }

  // Pattern toggle
  function handleTogglePattern(patternName: string) {
    const next = filters.patterns.includes(patternName)
      ? filters.patterns.filter((p) => p !== patternName)
      : [...filters.patterns, patternName]
    onFilterChange({
      ...filters,
      patterns: next,
    })
  }

  // Reusable Filter Sections Content
  const filterContent = (
    <div className="space-y-6">
      {/* Active Filters Clear Row (when any filter is active) */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pb-3 border-b border-[#D6B978]/30">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2B211C]">
            Active Filters
          </span>
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-[#641C24] hover:text-[#4A141B] underline font-medium cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* 1. Category Section */}
      <div className="border-b border-[#D6B978]/30 pb-5">
        <button
          type="button"
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between text-left group cursor-pointer py-1"
        >
          <span className="font-serif text-sm font-semibold tracking-wide text-[#2B211C] group-hover:text-[#641C24]">
            Category
          </span>
          <span className="text-xs text-[#7A5A45] font-mono">
            {openSections.category ? '−' : '+'}
          </span>
        </button>

        {openSections.category && (
          <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const isSelected =
                filters.category === cat.slug || (!filters.category && cat.slug === 'all')
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(cat.slug)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-sm transition-colors flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#641C24] text-white font-medium'
                      : 'text-[#2B211C] hover:bg-[#EFE2D0]/60 hover:text-[#641C24]'
                  }`}
                >
                  <span>{cat.name}</span>
                  {isSelected && <span className="text-[10px]">●</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* 2. Price Range Section */}
      <div className="border-b border-[#D6B978]/30 pb-5">
        <button
          type="button"
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between text-left group cursor-pointer py-1"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-sm font-semibold tracking-wide text-[#2B211C] group-hover:text-[#641C24]">
              Price
            </span>
            {filters.priceRanges.length > 0 && (
              <span className="text-[10px] bg-[#641C24] text-white px-1.5 py-0.2 rounded-full font-sans">
                {filters.priceRanges.length}
              </span>
            )}
          </div>
          <span className="text-xs text-[#7A5A45] font-mono">
            {openSections.price ? '−' : '+'}
          </span>
        </button>

        {openSections.price && (
          <div className="mt-3 space-y-2">
            {priceRanges.map((range) => {
              const checked = filters.priceRanges.includes(range.id)
              return (
                <label
                  key={range.id}
                  className="flex items-center gap-2.5 text-xs text-[#2B211C] hover:text-[#641C24] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleTogglePriceRange(range.id)}
                    className="w-3.5 h-3.5 rounded-xs accent-[#641C24] border-[#D6B978] cursor-pointer"
                  />
                  <span>{range.label}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* 3. Color Section (with circular color swatches) */}
      <div className="border-b border-[#D6B978]/30 pb-5">
        <button
          type="button"
          onClick={() => toggleSection('color')}
          className="w-full flex items-center justify-between text-left group cursor-pointer py-1"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-sm font-semibold tracking-wide text-[#2B211C] group-hover:text-[#641C24]">
              Color
            </span>
            {filters.colors.length > 0 && (
              <span className="text-[10px] bg-[#641C24] text-white px-1.5 py-0.2 rounded-full font-sans">
                {filters.colors.length}
              </span>
            )}
          </div>
          <span className="text-xs text-[#7A5A45] font-mono">
            {openSections.color ? '−' : '+'}
          </span>
        </button>

        {openSections.color && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
            {colorOptions.map((c) => {
              const checked = filters.colors.includes(c.name)
              const hex = (c.metadata?.hex as string) || '#A68A78'
              return (
                <label
                  key={c.id}
                  className="flex items-center justify-between text-xs text-[#2B211C] hover:text-[#641C24] cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleColor(c.name)}
                      className="w-3.5 h-3.5 rounded-xs accent-[#641C24] border-[#D6B978] cursor-pointer"
                    />
                    <span
                      className="w-3 h-3 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: hex }}
                      title={c.name}
                    />
                    <span>{c.name}</span>
                  </div>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* 4. Fabric Section */}
      <div className="border-b border-[#D6B978]/30 pb-5">
        <button
          type="button"
          onClick={() => toggleSection('fabric')}
          className="w-full flex items-center justify-between text-left group cursor-pointer py-1"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-sm font-semibold tracking-wide text-[#2B211C] group-hover:text-[#641C24]">
              Fabric
            </span>
            {filters.fabrics.length > 0 && (
              <span className="text-[10px] bg-[#641C24] text-white px-1.5 py-0.2 rounded-full font-sans">
                {filters.fabrics.length}
              </span>
            )}
          </div>
          <span className="text-xs text-[#7A5A45] font-mono">
            {openSections.fabric ? '−' : '+'}
          </span>
        </button>

        {openSections.fabric && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
            {fabricOptions.map((f) => {
              const checked = filters.fabrics.includes(f.name)
              return (
                <label
                  key={f.id}
                  className="flex items-center gap-2.5 text-xs text-[#2B211C] hover:text-[#641C24] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleFabric(f.name)}
                    className="w-3.5 h-3.5 rounded-xs accent-[#641C24] border-[#D6B978] cursor-pointer"
                  />
                  <span>{f.name}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* 5. Occasion Section */}
      <div className="border-b border-[#D6B978]/30 pb-5">
        <button
          type="button"
          onClick={() => toggleSection('occasion')}
          className="w-full flex items-center justify-between text-left group cursor-pointer py-1"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-sm font-semibold tracking-wide text-[#2B211C] group-hover:text-[#641C24]">
              Occasion
            </span>
            {filters.occasions.length > 0 && (
              <span className="text-[10px] bg-[#641C24] text-white px-1.5 py-0.2 rounded-full font-sans">
                {filters.occasions.length}
              </span>
            )}
          </div>
          <span className="text-xs text-[#7A5A45] font-mono">
            {openSections.occasion ? '−' : '+'}
          </span>
        </button>

        {openSections.occasion && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
            {occasionOptions.map((o) => {
              const checked = filters.occasions.includes(o.name)
              return (
                <label
                  key={o.id}
                  className="flex items-center gap-2.5 text-xs text-[#2B211C] hover:text-[#641C24] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleToggleOccasion(o.name)}
                    className="w-3.5 h-3.5 rounded-xs accent-[#641C24] border-[#D6B978] cursor-pointer"
                  />
                  <span>{o.name}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* 6. Pattern Section */}
      <div className="pb-2">
        <button
          type="button"
          onClick={() => toggleSection('pattern')}
          className="w-full flex items-center justify-between text-left group cursor-pointer py-1"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-sm font-semibold tracking-wide text-[#2B211C] group-hover:text-[#641C24]">
              Pattern & Motifs
            </span>
            {filters.patterns.length > 0 && (
              <span className="text-[10px] bg-[#641C24] text-white px-1.5 py-0.2 rounded-full font-sans">
                {filters.patterns.length}
              </span>
            )}
          </div>
          <span className="text-xs text-[#7A5A45] font-mono">
            {openSections.pattern ? '−' : '+'}
          </span>
        </button>

        {openSections.pattern && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
            {patternOptions.map((p) => {
              const checked = filters.patterns.includes(p.name)
              return (
                <label
                  key={p.id}
                  className="flex items-center gap-2.5 text-xs text-[#2B211C] hover:text-[#641C24] cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleTogglePattern(p.name)}
                    className="w-3.5 h-3.5 rounded-xs accent-[#641C24] border-[#D6B978] cursor-pointer"
                  />
                  <span>{p.name}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* ==================================================== */}
      {/* DESKTOP FILTER SIDEBAR */}
      {/* ==================================================== */}
      <aside
        aria-label="Product filters"
        className="hidden lg:block w-64 shrink-0 bg-white/70 p-5 rounded-sm border border-[#D6B978]/40 shadow-xs h-fit sticky top-28"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#D6B978]/40 mb-4">
          <h2 className="font-serif text-base font-semibold text-[#641C24] tracking-wide">
            Filter Sarees
          </h2>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] text-[#7A5A45] hover:text-[#641C24] underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {filterContent}
      </aside>

      {/* ==================================================== */}
      {/* MOBILE FILTER DRAWER */}
      {/* ==================================================== */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobileDrawer}
          />

          {/* Drawer Sheet */}
          <div className="fixed inset-y-0 left-0 w-full max-w-xs sm:max-w-sm bg-[#F8F1E7] shadow-2xl flex flex-col z-10 transition-transform">
            {/* Drawer Header */}
            <div className="px-5 py-4 bg-white border-b border-[#D6B978]/40 flex items-center justify-between shrink-0">
              <h2 className="font-serif text-lg font-semibold text-[#641C24]">
                Filter Sarees
              </h2>
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                aria-label="Close filters drawer"
                className="w-8 h-8 rounded-full bg-[#F8F1E7] text-[#2B211C] hover:text-[#641C24] flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Filters Body */}
            <div className="p-5 overflow-y-auto flex-1">{filterContent}</div>

            {/* Sticky Drawer Footer */}
            <div className="p-4 bg-white border-t border-[#D6B978]/40 flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onClearAll}
                disabled={!hasActiveFilters}
                className="flex-1 py-2.5 border border-[#D6B978]/60 text-xs font-medium text-[#2B211C] hover:bg-[#F8F1E7] rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={onApplyMobileFilters || onCloseMobileDrawer}
                className="flex-1 py-2.5 bg-[#641C24] hover:bg-[#4A141B] text-white text-xs font-medium uppercase tracking-wider rounded-sm transition-colors shadow-xs cursor-pointer"
              >
                Apply Filters {totalCount !== undefined ? `(${totalCount})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
