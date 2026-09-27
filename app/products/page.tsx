import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogProductCard from "@/components/CatalogProductCard";
import {
  getActiveStorefrontProducts,
  getStorefrontCollectionBySlug,
} from "@/lib/supabase/storefront";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Products — PNT Creation",
  description:
    "Explore our collection of authentic, handpicked sarees crafted with timeless luxury and tradition.",
};

interface ProductsPageProps {
  searchParams?: Promise<{ collection?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const collectionSlug = resolvedParams.collection;

  const [products, collectionMeta] = await Promise.all([
    getActiveStorefrontProducts(collectionSlug),
    collectionSlug ? getStorefrontCollectionBySlug(collectionSlug) : null,
  ]);

  const pageTitle = collectionMeta?.name || "The Complete Saree Collection";
  const pageDescription =
    collectionMeta?.description ||
    "Explore our curated gallery of authentic sarees, crafted with heritage weaves, exquisite fabrics, and timeless Indian elegance.";

  return (
    <main className="min-h-screen bg-[#F8F1E7] text-[#2B211C]">
      <Header />

      {/* Page Banner */}
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
              {collectionMeta ? (
                <>
                  <li>
                    <Link href="/collections" className="transition hover:text-[#641C24]">
                      Collections
                    </Link>
                  </li>
                  <li>/</li>
                  <li className="text-[#641C24] font-medium">{collectionMeta.name}</li>
                </>
              ) : (
                <li className="text-[#641C24] font-medium">All Products</li>
              )}
            </ol>
          </nav>

          <h1 className="font-serif text-3xl text-[#641C24] md:text-5xl">
            {pageTitle}
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#7A5A45] md:text-base leading-relaxed">
            {pageDescription}
          </p>

          <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D6B978]/40 bg-white/60 px-4 py-1.5 text-xs font-medium tracking-wide text-[#2B211C]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              <span>
                {products.length} {products.length === 1 ? "Product" : "Products"} Available
              </span>
            </div>

            {collectionSlug && (
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#641C24]/30 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-[#641C24] transition hover:bg-[#641C24] hover:text-white"
              >
                <span>✕</span>
                <span>View All Sarees</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Catalog Grid Section */}
      <section className="px-6 py-12 md:px-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          {products.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-lg border border-[#D6B978]/40 bg-white/60 p-10 text-center backdrop-blur-sm">
              <div className="text-3xl text-[#B58A45] mb-3">✧</div>
              <h2 className="font-serif text-2xl text-[#641C24]">
                Collection In Preparation
              </h2>
              <p className="mt-2 text-sm text-[#7A5A45] leading-relaxed">
                {collectionMeta
                  ? `Sarees for ${collectionMeta.name} are currently being cataloged. Please check back shortly or explore our complete catalog.`
                  : "Our latest handpicked sarees are currently being cataloged. Please check back shortly to explore newly arrived pieces."}
              </p>
              <Link
                href={collectionSlug ? "/products" : "/"}
                className="mt-6 inline-block bg-[#641C24] px-6 py-2.5 text-xs font-medium uppercase tracking-widest text-white transition hover:bg-[#4A141B]"
              >
                {collectionSlug ? "View All Sarees" : "Return to Homepage"}
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <CatalogProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
