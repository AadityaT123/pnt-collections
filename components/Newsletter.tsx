export default function Newsletter() {
  return (
    <section className="bg-[#EFE2D0] px-6 py-20 text-center md:px-12 md:py-24">
      <div className="mx-auto max-w-2xl">
        {/* Heading */}
        <h2 className="font-serif text-4xl text-[#641C24] md:text-5xl">
          Join Our Community
        </h2>

        {/* Description */}
        <p className="mt-3 text-[#2B211C]/70">
          Get updates on new arrivals and exclusive offers.
        </p>

        {/* Newsletter Form */}
        <form className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row sm:gap-0">
          <input
            type="email"
            placeholder="Enter your email address"
            aria-label="Email address"
            className="min-w-0 flex-1 border border-[#D6B978] bg-white px-5 py-4 text-[#2B211C] outline-none placeholder:text-[#2B211C]/50 focus:border-[#641C24]"
          />

          <button
            type="submit"
            className="bg-[#641C24] px-7 py-4 text-sm font-medium uppercase tracking-wider text-white transition hover:bg-[#4A141B]"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}