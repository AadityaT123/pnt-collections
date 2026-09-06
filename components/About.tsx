export default function About() {
  return (
    <section
      id="about"
      className="bg-[#641C24] px-6 py-20 text-center text-white md:px-12 md:py-24"
    >
      <div className="mx-auto max-w-3xl">
        {/* Eyebrow */}
        <p className="mb-4 text-sm uppercase tracking-[0.3em] text-[#D6B978]">
          Welcome to PNT Collections
        </p>

        {/* Heading */}
        <h2 className="font-serif text-4xl leading-tight md:text-5xl">
          Tradition with a Modern Touch
        </h2>

        {/* Description */}
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
          Discover thoughtfully selected ethnic wear designed to bring
          elegance and confidence to every occasion.
        </p>
      </div>
    </section>
  );
} 