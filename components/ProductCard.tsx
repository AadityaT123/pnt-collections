import Image from "next/image";

type ProductCardProps = {
  image: string;
  alt: string;
  name: string;
  price: string;
};

export default function ProductCard({
  image,
  alt,
  name,
  price,
}: ProductCardProps) {
  return (
    <article className="group">
      {/* Product Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#E7DED2]">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.02]"
        />
      </div>

      {/* Product Information */}
      <div className="flex items-start justify-between pt-3">
        <div>
          <h3 className="font-serif text-base text-[#2B211C] md:text-lg">
            {name}
          </h3>

          <p className="mt-1 text-base font-medium text-[#2B211C]">
            {price}
          </p>
        </div>

        {/* Shopping Bag */}
        <button
          type="button"
          aria-label={`Add ${name} to cart`}
          className="mt-1 text-2xl text-[#641C24] transition hover:text-[#4A141B]"
        >
          ♧
        </button>
      </div>
    </article>
  );
}