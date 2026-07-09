import Link from "next/link";
import { Package, Store, Bike, Shield, Truck, HeadphonesIcon } from "lucide-react";
import { BRAND } from "@/lib/constants";

const footerLinks = {
  shop: {
    title: "Shop",
    links: [
      { href: "/market", label: "All Products" },
      { href: "/market/electronics", label: "Electronics" },
      { href: "/market/fashion", label: "Fashion" },
      { href: "/market/home", label: "Home & Garden" },
      { href: "/market/beauty", label: "Beauty" },
    ],
  },
  sell: {
    title: "Sell",
    links: [
      { href: "/vendor/onboarding", label: "Start Selling" },
      { href: "/vendor/dashboard", label: "Vendor Dashboard" },
      { href: "/pricing", label: "Pricing" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  ride: {
    title: "Ride",
    links: [
      { href: "/rider/onboarding", label: "Become a Rider" },
      { href: "/rider/dashboard", label: "Rider Dashboard" },
      { href: "/coverage", label: "Coverage Area" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/openbox", label: "OpenBox Lockers" },
      { href: "/contact", label: "Contact" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/privacy", label: "Privacy Policy" },
    ],
  },
};

const trustBadges = [
  { icon: Shield, label: "Secure Payments" },
  { icon: Truck, label: "Fast Delivery" },
  { icon: HeadphonesIcon, label: "24/7 Support" },
  { icon: Package, label: "OpenBox Lockers" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      {/* Trust Badges */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-3 justify-center md:justify-start"
              >
                <badge.icon className="h-5 w-5 text-brand-green" />
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center text-white font-bold text-sm">
                D
              </div>
              <span className="font-bold text-lg text-white">
                {BRAND.name}
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              {BRAND.description}
            </p>
            <div className="flex gap-3">
              <Store className="h-5 w-5 text-brand-yellow" />
              <Bike className="h-5 w-5 text-brand-green" />
              <Package className="h-5 w-5 text-brand-purple" />
            </div>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((group) => (
            <div key={group.title}>
              <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-brand-green transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Made with 💚 in Nigeria</span>
              <span>Built on trust, powered by community</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
