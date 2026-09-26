import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact Us — PNT Creation",
  description:
    "Get in touch with PNT Creation for inquiries regarding our handcrafted saree collections, fabrics, and customer assistance.",
};

export default function ContactPage() {
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
              <li className="font-medium text-[#641C24]">Contact Us</li>
            </ol>
          </nav>

          <p className="mb-3 text-xs uppercase tracking-[0.35em] text-[#B58A45] md:text-sm">
            Customer Support & Inquiries
          </p>

          <h1 className="font-serif text-4xl text-[#641C24] md:text-6xl">
            Contact Us
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[#2B211C]/80 md:text-lg">
            We are here to assist you with inquiries regarding our sarees, collections,
            fabric specifications, and styling guidance.
          </p>
        </div>
      </section>

      {/* 2. Main Content: Assistance Info & Form */}
      <section className="px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Left: Guidance & Assistance Info */}
            <div className="space-y-6 lg:col-span-5">
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-[#B58A45]">
                  How We Can Help
                </span>
                <h2 className="mt-2 font-serif text-2xl text-[#641C24] md:text-3xl">
                  We Value Your Inquiries
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#2B211C]/75">
                  Whether you are seeking advice on selecting a saree for a wedding, have questions about
                  fabric drape and care, or wish to know more about our latest collections, we look forward
                  to assisting you.
                </p>
              </div>

              {/* Assistance Cards */}
              <div className="space-y-4 pt-2">
                <div className="rounded-sm border border-[#D6B978]/30 bg-white/70 p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-[#B58A45]">✦</span>
                    <h3 className="font-serif text-base text-[#641C24]">
                      Styling & Occasion Selection
                    </h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#7A5A45]">
                    Need guidance choosing between festive georgettes, rich silks, or elegant designer weaves?
                    Our catalog is curated for celebrations of every scale.
                  </p>
                </div>

                <div className="rounded-sm border border-[#D6B978]/30 bg-white/70 p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-[#B58A45]">◇</span>
                    <h3 className="font-serif text-base text-[#641C24]">
                      Product & Fabric Queries
                    </h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#7A5A45]">
                    For details on blouse pieces, saree length, borders, and fabric maintenance,
                    feel free to leave your message with our customer team.
                  </p>
                </div>

                <div className="rounded-sm border border-[#D6B978]/30 bg-white/70 p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-[#B58A45]">♡</span>
                    <h3 className="font-serif text-base text-[#641C24]">
                      Prompt Customer Attention
                    </h3>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#7A5A45]">
                    Our support team reviews customer questions diligently to ensure a smooth, delightful
                    shopping experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Contact Form UI */}
            <div className="lg:col-span-7">
              <div className="rounded-sm border border-[#D6B978]/40 bg-white/80 p-8 shadow-sm backdrop-blur-sm md:p-10">
                <span className="text-xs uppercase tracking-[0.3em] text-[#B58A45]">
                  Send a Message
                </span>
                <h2 className="mt-1 font-serif text-2xl text-[#641C24] md:text-3xl">
                  Inquiry Form
                </h2>
                <p className="mt-2 text-xs text-[#7A5A45] leading-relaxed">
                  Please complete the form below. Note that our online messaging service is currently
                  being prepared for launch.
                </p>

                <form className="mt-8 space-y-5">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-xs font-medium uppercase tracking-wider text-[#2B211C]"
                    >
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      disabled
                      placeholder="Your full name"
                      className="mt-2 w-full border border-[#D6B978]/60 bg-[#F8F1E7]/40 px-4 py-3 text-sm text-[#2B211C] outline-none placeholder:text-[#2B211C]/40 focus:border-[#641C24] disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-medium uppercase tracking-wider text-[#2B211C]"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      disabled
                      placeholder="your.email@example.com"
                      className="mt-2 w-full border border-[#D6B978]/60 bg-[#F8F1E7]/40 px-4 py-3 text-sm text-[#2B211C] outline-none placeholder:text-[#2B211C]/40 focus:border-[#641C24] disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-xs font-medium uppercase tracking-wider text-[#2B211C]"
                    >
                      Subject / Topic
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      disabled
                      placeholder="Product inquiry, styling assistance, or general question"
                      className="mt-2 w-full border border-[#D6B978]/60 bg-[#F8F1E7]/40 px-4 py-3 text-sm text-[#2B211C] outline-none placeholder:text-[#2B211C]/40 focus:border-[#641C24] disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-medium uppercase tracking-wider text-[#2B211C]"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      disabled
                      placeholder="Please share details about your inquiry..."
                      className="mt-2 w-full border border-[#D6B978]/60 bg-[#F8F1E7]/40 px-4 py-3 text-sm text-[#2B211C] outline-none placeholder:text-[#2B211C]/40 focus:border-[#641C24] disabled:cursor-not-allowed"
                    />
                  </div>

                  {/* Submit Button (Coming Soon / Disabled) */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="w-full cursor-not-allowed bg-[#641C24]/60 px-8 py-4 text-xs font-medium uppercase tracking-widest text-white shadow-sm"
                    >
                      Submit Inquiry (Online Form Coming Soon)
                    </button>
                    <p className="mt-3 text-center text-xs text-[#7A5A45]">
                      Our direct online inquiry service will be enabled soon. Thank you for your patience.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
