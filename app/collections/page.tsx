import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { assets } from "@/lib/assets";
import { getActiveStorefrontCollections } from "@/lib/supabase/storefront";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Collections — PNT Creation",
  description:
    "Explore our signature saree collections, curated for weddings, festive milestones, and timeless everyday elegance.",
};

const curatedCollections = [
  {
    title: "Festive Collection",
    image: assets.images.collections.festive,
    href: "/products?collection=festive",
  },
  {
    title: "Wedding & Occasion",
    image: assets.images.collections.wedding,
    href: "/products?collection=wedding",
  },
  {
    title: "New Arrivals",
    image: assets.images.collections.everyday,
    href: "/products?collection=new-arrivals",
  },
  {
    title: "Best Sellers",
    image: assets.images.collections.bestSellers,
    href: "/products?collection=best-sellers",
  },
];

export default async function CollectionsPage() {
  const adminCollections = await getActiveStorefrontCollections();

  return (
    <main className="min-h-screen bg-[#F8F1E7] text-[#2B211C]">
      <Header />

      {/* Hero / Page Introduction */}
      <section className="border-b border-[#D6B978]/30 bg-[#F4EDE2] px-6 py-12 md:px-12 md:py-16">
        <div className="mx-auto max-w-7xl text-center">
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#7A5A45]">
              <li>
                <Link href="/" className="transition hover:text-[#641C24]">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li className="font-medium text-[#641C24]">Collections</li>
            </ol>
          </nav>

          <p className="mb-2 text-xs uppercase tracking-[0.35em] text-[#B58A45] md:text-sm">
            Curated Themes & Heritage Weaves
          </p>

          <h1 className="font-serif text-3xl text-[#641C24] md:text-5xl">
            The Saree Collections
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#7A5A45] md:text-base">
            From regal wedding ensembles to vibrant festive edits, explore sarees thoughtfully
            curated for your most cherished occasions.
          </p>
        </div>
      </section>

      {/* SECTION A: Manual Curated Collections (Permanent 4-Column Grid) */}
      <section className="px-6 py-14 md:px-12 md:py-18">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#B58A45]">
              Explore
            </span>
            <h2 className="mt-1 font-serif text-2xl text-[#641C24] md:text-3xl">
              Shop by Collection
            </h2>
            <p className="mt-1 text-xs text-[#7A5A45] md:text-sm">
              Find the perfect saree for every occasion
            </p>
          </div>

          {/* Grid: 4 cols desktop, 2 cols tablet, 1 col mobile */}
          {/* Note: The existing collection artwork already contains its own title and "SHOP NOW ->" artwork */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {curatedCollections.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group relative block overflow-hidden rounded-sm border border-[#D6B978]/30 bg-white/40 shadow-xs transition duration-300 hover:border-[#B58A45] hover:shadow-md"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={1484}
                  height={1060}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Luxury Visual Divider & Spacing */}
      <div className="py-6 md:py-10">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-[#D6B978]/35" />
            <div className="absolute bg-[#F8F1E7] px-4 font-serif text-xs tracking-widest text-[#B58A45]">
              ✧ ✦ ✧
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: Database Collections (4:5 Portrait Grid) */}
      <section className="px-6 py-12 md:px-12 md:py-18">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-[#B58A45]">
              Curated Themes
            </span>
            <h2 className="mt-1 font-serif text-2xl text-[#641C24] md:text-3xl">
              Curated Collections
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-[#7A5A45] md:text-sm">
              Discover iconic sarees tailored to every moment
            </p>
          </div>

          {/* Active Collections from Supabase */}
          {adminCollections.length === 0 ? (
            <div className="mx-auto max-w-md rounded-lg border border-[#D6B978]/30 bg-white/60 p-8 text-center shadow-xs backdrop-blur-sm">
              <span className="text-2xl text-[#B58A45]">✦</span>
              <h3 className="mt-2 font-serif text-lg text-[#641C24]">
                New Series Arriving Soon
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#7A5A45]">
                Our studio is currently cataloging new thematic collections. Check back shortly for our
                latest editorial saree releases.
              </p>
              <Link
                href="/products"
                className="mt-5 inline-block bg-[#641C24] px-6 py-2.5 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-[#4A141B]"
              >
                Browse All Sarees
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {adminCollections.map((collection) => (
                <article
                  key={collection.id}
                  className="group flex flex-col rounded-sm border border-[#D6B978]/30 bg-white/50 p-3.5 shadow-xs transition duration-300 hover:border-[#B58A45] hover:shadow-md"
                >
                  {/* Standard 4:5 Portrait Cover Frame */}
                  <Link
                    href={`/products?collection=${collection.slug}`}
                    className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-[#EFE8DC] block"
                  >
                    {collection.image_path ? (
                      <Image
                        src={collection.image_path}
                        alt={collection.name}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        unoptimized={
                          !collection.image_path.includes('.supabase.co') &&
                          !collection.image_path.startsWith('/')
                        }
                      />
                    ) : (
                      /* Tasteful Neutral 4:5 Placeholder */
                      <div className="flex h-full w-full flex-col items-center justify-center bg-[#F4EDE2] p-6 text-center">
                        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#EFE2D0] text-lg text-[#B58A45]">
                          ✦
                        </div>
                        <p className="font-serif text-sm font-semibold text-[#641C24]">
                          {collection.name}
                        </p>
                        <span className="mt-1 text-[10px] uppercase tracking-widest text-[#B58A45]">
                          PNT Creation
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Information & Action */}
                  <div className="flex flex-1 flex-col justify-between pt-3 pb-1">
                    <div>
                      <Link
                        href={`/products?collection=${collection.slug}`}
                        className="block"
                      >
                        <h3 className="font-serif text-base text-[#2B211C] transition-colors group-hover:text-[#641C24] md:text-lg">
                          {collection.name}
                        </h3>
                      </Link>
                      {collection.description && (
                        <p className="mt-1 text-xs text-[#7A5A45] line-clamp-2 leading-relaxed">
                          {collection.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-3.5 border-t border-[#D6B978]/20 pt-2.5">
                      <Link
                        href={`/products?collection=${collection.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-[#641C24] transition-colors group-hover:text-[#4A141B]"
                      >
                        <span>Explore Collection</span>
                        <span className="transition-transform group-hover:translate-x-0.5">→</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
