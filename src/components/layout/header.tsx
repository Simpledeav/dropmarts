"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Package,
  LogOut,
  Heart,
  Store,
  Bike,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND, ROUTES } from "@/lib/constants";

interface HeaderProps {
  cartCount?: number;
}

export function Header({ cartCount = 0 }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSticky, setIsSticky] = useState(false);

  // Simple scroll listener for sticky effect
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      setIsSticky(window.scrollY > 10);
    }, { once: true });
  }

  const navLinks = [
    { href: "/market", label: "Market" },
    { href: "/categories", label: "Categories" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isSticky
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-white"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0"
          >
            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center text-white font-bold text-sm">
              <span className="text-white font-black text-lg">D</span>
            </div>
            <span className="font-bold text-lg text-text-primary hidden sm:block">
              {BRAND.name}
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md lg:max-w-lg">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border-light bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-brand-green rounded-lg hover:bg-gray-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* OpenBox Pill */}
            <Link
              href="/openbox"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/30 text-sm font-medium text-yellow-800 hover:bg-brand-yellow/20 transition-colors"
            >
              <Package className="h-3.5 w-3.5" />
              <span>OpenBox</span>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-text-primary" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-green text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              href="/account"
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <User className="h-5 w-5 text-text-primary" />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-border-light animate-slide-up">
          <div className="px-4 py-3 space-y-3">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
                    setIsMobileMenuOpen(false);
                  }
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border-light bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>

            <nav className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-brand-green rounded-lg hover:bg-gray-50"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/openbox"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-yellow-800 rounded-lg bg-brand-yellow/10 hover:bg-brand-yellow/20"
              >
                <Package className="h-4 w-4" />
                OpenBox Lockers
              </Link>
              <hr className="border-border-light my-2" />
              <Link
                href="/vendor/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-brand-purple-dark rounded-lg hover:bg-brand-purple/5"
              >
                <Store className="h-4 w-4" />
                Sell on Dropmart
              </Link>
              <Link
                href="/rider/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-brand-purple-dark rounded-lg hover:bg-brand-purple/5"
              >
                <Bike className="h-4 w-4" />
                Become a Rider
              </Link>
            </nav>

            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
