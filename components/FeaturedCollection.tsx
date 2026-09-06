import ProductCard from "@/components/ProductCard";
import { assets } from "@/lib/assets";

const products = [
  {
    image: assets.images.products.tealSaree,
    alt: "Teal printed saree",
    name: "Teal Printed Saree",
    price: "₹1,899",
  },
  {
    image: assets.images.products.purpleSaree,
    alt: "Purple embroidered saree",
    name: "Purple Embroidered Saree",
    price: "₹2,499",
  },
  {
    image: assets.images.products.blackSaree,
    alt: "Black designer saree",
    name: "Black Designer Saree",
    price: "₹2,299",
  },
];

export default function FeaturedCollection() {
  return (
    <section id="sarees" className="bg-[#F8F1E7] px-6 py-16 md:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="relative mb-8 text-center">
          <h2 className="font-serif text-4xl text-[#641C24] md:text-5xl">
            Featured Collection
          </h2>

          <p className="mt-2 text-[#7A5A45]">
            Handpicked Sarees for Your Special Moments
          </p>

          <a
            href="#sarees"
            className="absolute right-0 top-1/2 hidden -translate-y-1/2 text-sm text-[#641C24] transition hover:text-[#4A141B] md:block"
          >
            View All →
          </a>
        </div>

        {/* Products */}
        <div className="grid gap-5 md:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.name} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
} 