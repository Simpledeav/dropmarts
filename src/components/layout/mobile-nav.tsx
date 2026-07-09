"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Search, ShoppingCart, Package, User } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/market", label: "Market", icon: Search },
  { href: "/cart", label: "Cart", icon: ShoppingCart },
  { href: "/openbox", label: "OpenBox", icon: Package },
  { href: "/account", label: "Account", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const isVendorOrRider =
    pathname.startsWith("/vendor") || pathname.startsWith("/rider");

  if (isVendorOrRider) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border-light safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || 
            (tab.href !== "/" && pathname.startsWith(tab.href));
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-3 py-1 min-w-[60px]",
                "transition-colors duration-200",
                isActive
                  ? "text-brand-green"
                  : "text-text-muted hover:text-text-primary"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
