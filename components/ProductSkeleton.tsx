export interface ProductSkeletonProps {
  count?: number
  viewMode?: 'grid' | 'list'
}

export default function ProductSkeleton({ count = 8, viewMode = 'grid' }: ProductSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i)

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {items.map((i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row bg-white/60 rounded-sm border border-[#D6B978]/30 p-3 sm:p-4 animate-pulse gap-4"
          >
            {/* Image Placeholder */}
            <div className="aspect-[3/4] w-full sm:w-48 bg-[#E7DED2] rounded-sm shrink-0" />

            {/* Info Placeholder */}
            <div className="flex-1 space-y-3 py-1">
              <div className="h-3 w-24 bg-[#E7DED2] rounded-xs" />
              <div className="h-5 w-3/4 bg-[#E7DED2] rounded-xs" />
              <div className="h-3.5 w-full bg-[#E7DED2] rounded-xs" />
              <div className="h-4 w-28 bg-[#E7DED2] rounded-xs pt-2" />
              <div className="h-8 w-36 bg-[#E7DED2] rounded-xs mt-4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {items.map((i) => (
        <div
          key={i}
          className="flex flex-col bg-white/60 rounded-sm border border-[#D6B978]/30 p-3 animate-pulse"
        >
          {/* Image Placeholder (3/4 aspect ratio) */}
          <div className="aspect-[3/4] w-full bg-[#E7DED2] rounded-sm" />

          {/* Text Placeholders */}
          <div className="pt-3 space-y-2 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="h-2.5 w-20 bg-[#E7DED2] rounded-xs" />
              <div className="h-4 w-5/6 bg-[#E7DED2] rounded-xs" />
            </div>

            <div className="pt-2 border-t border-[#D6B978]/20 space-y-2">
              <div className="h-4 w-24 bg-[#E7DED2] rounded-xs" />
              <div className="h-8 w-full bg-[#E7DED2] rounded-xs" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
