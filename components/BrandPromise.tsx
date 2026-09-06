const promises = [
  {
    icon: "✦",
    title: "Curated with Care",
    description: "Thoughtfully selected styles",
  },
  {
    icon: "◇",
    title: "Quality Fabrics",
    description: "Comfort meets elegance",
  },
  {
    icon: "□",
    title: "Reliable Shipping",
    description: "Safe & secure delivery",
  },
  {
    icon: "♡",
    title: "A Brand You Can Trust",
    description: "Style for every occasion",
  },
];

export default function BrandPromise() {
  return (
    <section className="border-y border-[#D6B978]/30 bg-[#F8F1E7] px-6 py-14 md:px-12">
      <div className="mx-auto grid max-w-6xl md:grid-cols-4">
        {promises.map((promise, index) => (
          <div
            key={promise.title}
            className={`px-6 py-6 text-center ${
              index !== 0 ? "border-[#D6B978]/40 md:border-l" : ""
            }`}
          >
            {/* Icon */}
            <div className="mb-4 text-3xl text-[#B58A45]">
              {promise.icon}
            </div>

            {/* Title */}
            <h3 className="font-serif text-xl text-[#641C24]">
              {promise.title}
            </h3>

            {/* Description */}
            <p className="mt-2 text-sm text-[#2B211C]/70">
              {promise.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}