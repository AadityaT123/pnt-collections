import Image from "next/image";

import { assets } from "@/lib/assets";

const collections = [
  {
    title: "Festive Collection",
    image: assets.images.collections.festive,
  },
  {
    title: "Wedding & Occasion",
    image: assets.images.collections.wedding,
  },
  {
    title: "Elegant Everyday",
    image: assets.images.collections.everyday,
  },
  {
    title: "Best Sellers",
    image: assets.images.collections.bestSellers,
  },
];

export default function Collections() {
  return (
    <section
      id="collections"
      className="bg-[#F8F1E7] px-6 py-16 md:px-12 md:py-20"
    >
      <div className="mx-auto max-w-7xl text-center">
        {/* Section Heading */}
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-[#B58A45]">
          Explore
        </p>

        <h2 className="font-serif text-4xl text-[#641C24] md:text-5xl">
          Shop by Collection
        </h2>

        <p className="mt-3 text-[#2B211C]/70">
          Find the perfect saree for every occasion
        </p>

        {/* Collection Images */}
        <div className="mt-10 grid gap-3 md:grid-cols-4">
          {collections.map((collection) => (
            <a
              key={collection.title}
              href="#sarees"
              className="group relative block overflow-hidden"
            >
              <Image
                src={collection.image}
                alt={collection.title}
                width={800}
                height={520}
                sizes="(min-width: 768px) 25vw, 100vw"
                className="h-auto w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}