import Image from "next/image";

import { assets } from "@/lib/assets";

const footerLinks = [
  {
    label: "Sarees",
    href: "#sarees",
  },
  {
    label: "Collections",
    href: "#collections",
  },
  {
    label: "About",
    href: "#about",
  },
  {
    label: "Contact",
    href: "#contact",
  },
];

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-[#641C24] px-6 py-14 text-[#F8F1E7] md:px-12"
    >
      <div className="mx-auto max-w-7xl">
        {/* Footer Main */}
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-start">
          {/* Brand */}
          <div>
            <Image
              src={assets.images.logoFooter}
              alt="PNT Collections Logo"
              width={180}
              height={120}
              className="h-auto w-[155px]"
            />

            <p className="mt-3 text-sm text-[#F8F1E7]/75">
              Ethnic wear for every you.
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3 pt-6 text-sm md:pt-8">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition-colors hover:text-[#D6B978]"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Divider & Copyright */}
        <div className="mt-10 border-t border-[#D6B978]/30 pt-6">
          <p className="text-sm text-[#F8F1E7]/60">
            © 2026 PNT Collections. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}