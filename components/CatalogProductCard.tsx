import ProductCard from './ProductCard'
import type { StorefrontProduct } from '@/lib/supabase/storefront'

interface CatalogProductCardProps {
  product: StorefrontProduct
  viewMode?: 'grid' | 'list'
}

export default function CatalogProductCard({ product, viewMode = 'grid' }: CatalogProductCardProps) {
  return <ProductCard product={product} viewMode={viewMode} />
}
