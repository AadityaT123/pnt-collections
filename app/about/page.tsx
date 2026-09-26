import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { assets } from "@/lib/assets";

export const metadata: Metadata = {
  title: "About Us — PNT Creation",
  description:
    "Discover the story, craftsmanship, and dedication to timeless Indian ethnic wear and handpicked sarees at PNT Creation.",
};

const craftsmanshipPillars = [
  {
    icon: "✦",
    title: "Thoughtfully Selected Fabrics",
    description:
      "From soft flowing georgettes and lustrous silks to graceful organzas, every fabric is chosen for enduring beauty, comfort, and an effortless drape.",
  },
  {
    icon: "◇",
    title: "Intricate Detailing",
    description:
      "Finely woven zari borders, heritage-inspired motifs, and delicate pallu finishes that celebrate classic Indian artistry with understated grace.",
  },
  {
    icon: "□",
    title: "Impeccable Finishing",
    description:
      "Every saree is inspected for neat hemlines, consistent weave quality, and balanced proportions to ensure a truly flattering silhouette.",
  },
  {
    icon: "♡",
    title: "Occasion-Ready Styling",
    description:
      "Curated palettes and designs made to shine across festive gatherings, wedding celebrations, intimate family functions, and cultural rituals.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F8F1E7] text-[#2B211C]">
      <Header />

      {/* 1. Hero Section */}
      <section className="border-b border-[#D6B978]/30 bg-[#F4EDE2] px-6 py-14 md:px-12 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#7A5A45]">
              <li>
                <Link href="/" className="transition hover:text-[#641C24]">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li className="font-medium text-[#641C24]">About Us</li>
            </ol>
          </nav>

          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[#B58A45] md:text-sm">
            Timeless Tradition · Modern Grace
          </p>

          <h1 className="font-serif text-4xl text-[#641C24] md:text-6xl">
            About PNT Creation
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#2B211C]/80 md:text-lg">
            Celebrating the timeless poetry of the saree—where cherished Indian heritage,
            artisan craftsmanship, and contemporary elegance meet in every fold.
          </p>
        </div>
      </section>

      {/* 2. Brand Story Section */}
      <section className="px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Story Text */}
            <div className="lg:col-span-7">
              <span className="text-xs uppercase tracking-[0.3em] text-[#B58A45]">
                Our Philosophy
              </span>

              <h2 className="mt-2 font-serif text-3xl text-[#641C24] md:text-4xl">
                Woven with Elegance, Chosen for You
              </h2>

              <div className="mt-6 space-y-4 text-base leading-relaxed text-[#2B211C]/80">
                <p>
                  At PNT Creation, our journey begins with an abiding love for Indian textiles
                  and the timeless charm of the saree. We believe that a saree is far more than
                  six yards of fabric—it is an expression of heritage, personal poise, and celebration.
                </p>
                <p>
                  Our focus is on bringing you thoughtfully selected sarees that honor authentic
                  motifs and fine textures while remaining effortless to drape and wear. Whether it is a
                  quiet festive moment or a grand celebration, our goal is to offer pieces that make every
                  woman feel radiant, distinguished, and confident.
                </p>
                <p>
                  With an eye for delicate color palettes, graceful borders, and comfortable luxury,
                  we curate collections that transcend fleeting trends to become treasured favorites in
                  your wardrobe.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href="/products"
                  className="inline-block bg-[#641C24] px-8 py-3.5 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-[#4A141B]"
                >
                  Explore Our Sarees →
                </Link>
              </div>
            </div>

            {/* Visual Callout Card */}
            <div className="lg:col-span-5">
              <div className="rounded-sm border border-[#D6B978]/40 bg-white/70 p-8 shadow-sm backdrop-blur-sm">
                <div className="text-center">
                  <span className="text-3xl text-[#B58A45]">✦</span>
                  <h3 className="mt-3 font-serif text-2xl text-[#641C24]">
                    Our Promise
                  </h3>
                  <div className="mx-auto my-4 h-[1px] w-16 bg-[#D6B978]/60" />
                  <p className="text-sm italic text-[#7A5A45]">
                    &ldquo;Ethnic wear for every you.&rdquo;
                  </p>
                </div>

                <div className="mt-6 space-y-3 border-t border-[#D6B978]/20 pt-6 text-sm text-[#2B211C]/75">
                  <div className="flex items-start gap-3">
                    <span className="text-[#B58A45]">✓</span>
                    <span>Curated for special occasions and festive elegance</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#B58A45]">✓</span>
                    <span>Focus on fabric hand-feel, drape, and finishing</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[#B58A45]">✓</span>
                    <span>A commitment to classic, enduring ethnic style</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Craftsmanship & Quality Section */}
      <section className="border-t border-[#D6B978]/30 bg-[#EFE2D0]/60 px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#B58A45]">
              Artistry & Standards
            </span>
            <h2 className="mt-2 font-serif text-3xl text-[#641C24] md:text-5xl">
              Dedication to Craftsmanship
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-[#7A5A45] md:text-base">
              Every saree in our collection is curated with an emphasis on authentic texture,
              balanced aesthetics, and lasting beauty.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {craftsmanshipPillars.map((pillar) => (
              <div
                key={pillar.title}
                className="flex flex-col rounded-sm border border-[#D6B978]/30 bg-white/80 p-6 shadow-sm transition hover:border-[#B58A45]"
              >
                <div className="mb-4 text-2xl text-[#B58A45]">{pillar.icon}</div>
                <h3 className="font-serif text-lg text-[#641C24]">
                  {pillar.title}
                </h3>
                <p className="mt-2.5 text-xs leading-relaxed text-[#2B211C]/75 md:text-sm">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Luxury Visual Showcase (Using existing project assets) */}
      <section className="px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#B58A45]">
              Visual Highlights
            </span>
            <h2 className="mt-2 font-serif text-3xl text-[#641C24] md:text-4xl">
              Curated for Memorable Moments
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-[#7A5A45]">
              Explore styles curated for weddings, festivities, and timeless everyday grace.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {/* Visual Card 1 */}
            <div className="group relative overflow-hidden rounded-sm border border-[#D6B978]/30 bg-white/50">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E7DED2]">
                <Image
                  src={assets.images.collections.wedding}
                  alt="Wedding and occasion saree collection"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="font-serif text-xl text-[#641C24]">
                  Wedding & Occasion Splendor
                </h3>
                <p className="mt-2 text-xs text-[#7A5A45] leading-relaxed">
                  Rich weaves and statement pallus designed for grand ceremonies and wedding festivities.
                </p>
              </div>
            </div>

            {/* Visual Card 2 */}
            <div className="group relative overflow-hidden rounded-sm border border-[#D6B978]/30 bg-white/50">
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#E7DED2]">
                <Image
                  src={assets.images.collections.festive}
                  alt="Festive saree collection"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="font-serif text-xl text-[#641C24]">
                  Festive Celebrations
                </h3>
                <p className="mt-2 text-xs text-[#7A5A45] leading-relaxed">
                  Luminous hues and graceful drapes that bring joyous warmth to every festive gathering.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-block bg-[#641C24] px-10 py-4 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-[#4A141B]"
            >
              View The Full Catalog →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
