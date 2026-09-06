import About from "@/components/About";
import BrandPromise from "@/components/BrandPromise";
import Collections from "@/components/Collections";
import FeaturedCollection from "@/components/FeaturedCollection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Newsletter from "@/components/Newsletter";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8F1E7] text-[#2B211C]">
      <Header />
      <Hero />
      <FeaturedCollection />
      <Collections />
      <BrandPromise />
      <About />
      <Newsletter />
      <Footer />
    </main>
  );
}
