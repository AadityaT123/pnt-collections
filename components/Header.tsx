import Image from "next/image";

import { assets } from "@/lib/assets";

export default function Header() {
  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#641C24] px-4 py-2.5 text-center text-sm text-white">
        Free Shipping on Orders Above ₹999
      </div>

      {/* Main Header */}
      <header className="border-b border-[#D6B978]/40 bg-[#F8F1E7]">
        <div className="mx-auto flex h-[92px] max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Logo */}
          <a href="#" className="flex items-center">
            <Image
              src={assets.images.logo}
              alt="PNT Creation Logo"
              width={120}
              height={60}
              priority
              className="h-auto w-[105px]"
            />
          </a>

          {/* Navigation */}
          <nav className="hidden items-center gap-7 md:flex">
            <a
              href="#"
              className="text-sm transition-colors hover:text-[#641C24]"
            >
              Home
            </a>

            <a
              href="#sarees"
              className="text-sm transition-colors hover:text-[#641C24]"
            >
              Sarees
            </a>

            <a
              href="#new-arrivals"
              className="text-sm transition-colors hover:text-[#641C24]"
            >
              New Arrivals
            </a>

            <a
              href="#collections"
              className="text-sm transition-colors hover:text-[#641C24]"
            >
              Collections
            </a>

            <a
              href="#about"
              className="text-sm transition-colors hover:text-[#641C24]"
            >
              About
            </a>

            <a
              href="#contact"
              className="text-sm transition-colors hover:text-[#641C24]"
            >
              Contact
            </a>
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Search"
              className="text-lg transition-colors hover:text-[#641C24]"
            >
              ⌕
            </button>

            <button
              type="button"
              aria-label="Account"
              className="text-lg transition-colors hover:text-[#641C24]"
            >
              ♙
            </button>

            <button
              type="button"
              aria-label="Cart"
              className="text-lg transition-colors hover:text-[#641C24]"
            >
              🛍
            </button>
          </div>
        </div>
      </header>
    </>
  );
}