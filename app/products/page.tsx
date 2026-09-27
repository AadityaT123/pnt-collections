import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StorefrontCatalog, { SortOption } from '@/components/StorefrontCatalog'
import {
  PRICE_RANGES,
  getCatalogAttributes,
  getStorefrontCategories,
  getStorefrontCatalog,
  getStorefrontCollectionBySlug,
} from '@/lib/supabase/storefront'

export const dynamic = 'force-dynamic'

interface ProductsPageProps {
  searchParams?: Promise<{
    category?: string
    collection?: string
    price?: string
    color?: string
    fabric?: string
    occasion?: string
    pattern?: string
    sort?: string
    page?: string
    view?: string
  }>
}

function parseArrayParam(val?: string): string[] {
  if (!val) return []
  return val
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const resolvedParams = searchParams ? await searchParams : {}
  const collectionSlug = resolvedParams.collection
  const collectionMeta = collectionSlug
    ? await getStorefrontCollectionBySlug(collectionSlug)
    : null

  const title = collectionMeta
    ? `${collectionMeta.name} — Luxury Sarees | PNT Creation`
    : 'Sarees — Timeless Drapes for Every Occasion | PNT Creation'
  const description =
    collectionMeta?.description ||
    'Explore our curated collection of authentic, handpicked sarees crafted with heritage weaves, pure zari craftsmanship, and timeless Indian luxury.'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {}

  const collectionSlug = resolvedParams.collection
  const categorySlug = resolvedParams.category || 'all'
  const priceRanges = parseArrayParam(resolvedParams.price)
  const colors = parseArrayParam(resolvedParams.color)
  const fabrics = parseArrayParam(resolvedParams.fabric)
  const occasions = parseArrayParam(resolvedParams.occasion)
  const patterns = parseArrayParam(resolvedParams.pattern)
  const sort = (resolvedParams.sort as SortOption) || 'featured'
  const page = parseInt(resolvedParams.page || '1', 10) || 1
  const viewMode = (resolvedParams.view === 'list' ? 'list' : 'grid') as 'grid' | 'list'

  // Fetch catalog data concurrently
  const [catalogData, categories, attributes, collectionMeta] = await Promise.all([
    getStorefrontCatalog({
      category: categorySlug,
      collection: collectionSlug,
      priceRanges,
      colors,
      fabrics,
      occasions,
      patterns,
      sort,
      page,
      pageSize: 12,
    }),
    getStorefrontCategories(),
    getCatalogAttributes(),
    collectionSlug ? getStorefrontCollectionBySlug(collectionSlug) : null,
  ])

  const pageTitle = collectionMeta?.name || 'Sarees'
  const pageSubtitle =
    collectionMeta?.description || 'Timeless drapes for every occasion'

  const countBadgeText =
    catalogData.totalCount === 0
      ? 'Showing 0 products'
      : catalogData.totalCount === 1
      ? 'Showing 1 of 1 product'
      : `Showing ${catalogData.startIndex}–${catalogData.endIndex} of ${catalogData.totalCount} products`

  return (
    <main className="min-h-screen bg-[#F8F1E7] text-[#2B211C]">
      <Header />

      {/* ==================================================== */}
      {/* 1. PAGE HEADER */}
      {/* ==================================================== */}
      <section className="border-b border-[#D6B978]/30 bg-[#F4EDE2]/80 px-4 py-8 sm:px-6 sm:py-12 md:px-12 md:py-14 text-center">
        <div className="mx-auto max-w-4xl">
          {/* Breadcrumb: Home > Sarees */}
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#7A5A45]">
              <li>
                <Link href="/" className="transition-colors hover:text-[#641C24]">
                  Home
                </Link>
              </li>
              <li className="text-[#D6B978] select-none">&gt;</li>
              {collectionMeta ? (
                <>
                  <li>
                    <Link
                      href="/products"
                      className="transition-colors hover:text-[#641C24]"
                    >
                      Sarees
                    </Link>
                  </li>
                  <li className="text-[#D6B978] select-none">&gt;</li>
                  <li className="text-[#641C24] font-medium" aria-current="page">
                    {collectionMeta.name}
                  </li>
                </>
              ) : (
                <li className="text-[#641C24] font-medium" aria-current="page">
                  Sarees
                </li>
              )}
            </ol>
          </nav>

          {/* Heading */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#641C24] tracking-tight">
            {pageTitle}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-2.5 max-w-xl text-sm sm:text-base text-[#7A5A45] font-serif italic">
            &ldquo;{pageSubtitle}&rdquo;
          </p>

          {/* Dynamic Product Count Badge */}
          <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D6B978]/50 bg-white/70 px-4 py-1 text-xs font-medium tracking-wide text-[#2B211C] shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <span>{countBadgeText}</span>
            </div>

            {collectionSlug && (
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#641C24]/30 bg-white/80 px-3.5 py-1 text-xs font-medium text-[#641C24] transition hover:bg-[#641C24] hover:text-white"
              >
                <span>✕</span>
                <span>All Sarees</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* CATALOG INTERACTION SYSTEM (TOOLBAR + FILTERS + GRID) */}
      {/* ==================================================== */}
      <section className="py-6 sm:py-8 md:py-10">
        <StorefrontCatalog
          products={catalogData.products}
          totalCount={catalogData.totalCount}
          page={catalogData.page}
          pageSize={catalogData.pageSize}
          totalPages={catalogData.totalPages}
          startIndex={catalogData.startIndex}
          endIndex={catalogData.endIndex}
          categories={categories}
          priceRanges={PRICE_RANGES}
          attributes={attributes}
          initialFilters={{
            category: categorySlug,
            priceRanges,
            colors,
            fabrics,
            occasions,
            patterns,
          }}
          initialSort={sort}
          initialViewMode={viewMode}
          collectionSlug={collectionSlug}
          collectionName={collectionMeta?.name}
        />
      </section>

      <Footer />
    </main>
  )
}
