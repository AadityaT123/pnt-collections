import Image from "next/image";

import { assets } from "@/lib/assets";

export default function Hero() {
  return (
    <section className="relative min-h-[650px] overflow-hidden">
      {/* Full-width Hero Image */}
      <Image
        src={assets.images.hero.main}
        alt="Teal saree from PNT Collections"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Optional subtle overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F8F1E7]/95 via-[#F8F1E7]/40 to-transparent" />

      {/* Hero Content */}
      <div className="relative z-10 flex min-h-[650px] items-center">
        <div className="w-full px-8 md:px-16 lg:px-24">
          <div className="max-w-xl">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.35em] text-[#B58A45]">
              Timeless Tradition · Modern Elegance
            </p>

            <h1 className="font-serif text-5xl leading-tight text-[#641C24] md:text-6xl lg:text-7xl">
              Elegance,
              <br />
              Woven for You
            </h1>

            <p className="mt-7 max-w-md text-lg leading-8 text-[#2B211C]/80">
              Discover sarees that make every occasion special.
            </p>

            <a
              href="#sarees"
              className="mt-9 inline-block bg-[#641C24] px-8 py-4 text-sm font-medium uppercase tracking-wider text-white transition hover:bg-[#4A141B]"
            >
              Shop Sarees →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}