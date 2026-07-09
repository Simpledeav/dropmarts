"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Store,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  PlusCircle,
  FileSpreadsheet,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const sidebarLinks = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/products", label: "Products", icon: Package },
  { href: "/vendor/products/new", label: "Add Product", icon: PlusCircle },
  { href: "/vendor/products/bulk", label: "Bulk Import", icon: FileSpreadsheet },
  { href: "/vendor/inventory", label: "Inventory", icon: Box },
  { href: "/vendor/orders", label: "Orders", icon: ShoppingCart },
  { href: "/vendor/analytics", label: "Analytics", icon: BarChart3 },
];

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; roles: string[]; vendor?: { status: string } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!data.user || !data.user.roles.includes("vendor")) {
          router.push("/login?redirect=/vendor/dashboard");
          return;
        }
        setUser(data.user);
      } catch (err) {
        console.error("Auth check failed:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  const isOnboarding = pathname === "/vendor/onboarding";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Onboarding uses a full-screen layout without sidebar
  if (isOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-purple-100">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-purple-50 text-purple-700"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/vendor/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-purple rounded-lg flex items-center justify-center text-white font-bold text-xs">
              EJ
            </div>
            <span className="font-bold text-sm text-purple-900">Vendor Portal</span>
          </Link>
          <Link href="/" className="p-2 rounded-lg hover:bg-purple-50 text-purple-400">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "w-64 shrink-0 bg-white border-r border-purple-100 min-h-screen flex flex-col",
            "fixed lg:sticky top-0 left-0 z-50 lg:z-auto",
            "transition-transform duration-300 lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Logo */}
          <div className="hidden lg:flex items-center gap-2 px-6 py-5 border-b border-purple-100">
            <div className="w-8 h-8 bg-brand-purple rounded-xl flex items-center justify-center text-white font-bold text-sm">
              EJ
            </div>
            <div>
              <p className="font-bold text-sm text-purple-900">Vendor Portal</p>
              <p className="text-xs text-purple-400">Operator Mode</p>
            </div>
          </div>

          {/* Close button - mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-3 right-3 p-2 rounded-lg hover:bg-purple-50 text-purple-700"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Nav links */}
          <nav className="flex-1 p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href ||
                (link.href === "/vendor/products" && (pathname.startsWith("/vendor/products/") && !pathname.includes("/new") && !pathname.includes("/bulk")));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-brand-purple/10 text-brand-purple-dark"
                      : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-brand-purple" : "text-gray-400")} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-purple flex items-center justify-center text-white text-xs font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Link href="/" className="text-xs text-purple-500 hover:text-purple-700">
                Back to Store
              </Link>
              <span className="text-gray-300">|</span>
              <button
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  router.push("/login");
                }}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <LogOut className="h-3 w-3" /> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
