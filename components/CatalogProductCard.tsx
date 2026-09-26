import Image from "next/image";
import type { StorefrontProduct } from "@/lib/supabase/storefront";

interface CatalogProductCardProps {
  product: StorefrontProduct;
}

export default function CatalogProductCard({ product }: CatalogProductCardProps) {
  const subtitle = [product.fabric, product.color].filter(Boolean).join(" • ");

  return (
    <article className="group flex flex-col bg-white/40 p-3 rounded-sm border border-[#D6B978]/30 transition duration-300 hover:border-[#B58A45] hover:shadow-md">
      {/* Product Image Frame (accommodates variable image dimensions gracefully) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#EFE8DC] rounded-sm">
        <Image
          src={product.primaryImage}
          alt={product.primaryImageAlt}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badges Container */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 z-10">
          {!product.isInStock && (
            <span className="bg-[#2B211C]/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-widest text-white backdrop-blur-sm">
              Out of Stock
            </span>
          )}
          {product.compareAtPrice && product.isInStock && (
            <span className="bg-[#641C24] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white">
              Sale
            </span>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col justify-between pt-3">
        <div>
          {subtitle ? (
            <p className="text-[11px] font-medium tracking-widest uppercase text-[#B58A45]">
              {subtitle}
            </p>
          ) : (
            <p className="text-[11px] font-medium tracking-widest uppercase text-[#B58A45]">
              Pure Elegance
            </p>
          )}

          <h3 className="mt-1 font-serif text-base text-[#2B211C] transition-colors group-hover:text-[#641C24] md:text-lg">
            {product.name}
          </h3>

          {product.shortDescription && (
            <p className="mt-1 text-xs text-[#7A5A45] line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Price & Stock Availability */}
        <div className="mt-3 flex items-center justify-between border-t border-[#D6B978]/20 pt-2.5">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-base font-medium text-[#2B211C] md:text-lg">
              {product.price}
            </span>
            {product.compareAtPrice && (
              <span className="text-xs font-normal text-[#7A5A45] line-through">
                {product.compareAtPrice}
              </span>
            )}
          </div>

          <span
            className={`text-[11px] font-medium tracking-wider uppercase ${
              product.isInStock ? "text-emerald-800" : "text-[#7A5A45]/70"
            }`}
          >
            {product.isInStock ? "In Stock" : "Unavailable"}
          </span>
        </div>
      </div>
    </article>
  );
}
