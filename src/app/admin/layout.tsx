"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Store,
  Bike,
  ShoppingCart,
  FolderTree,
  Package,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/vendors", label: "Vendors", icon: Store },
  { href: "/admin/riders", label: "Riders", icon: Bike },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/lockers", label: "Lockers", icon: Package },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; roles: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!data.user || !data.user.roles.includes("admin")) {
          router.push("/login?redirect=/admin");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto bg-gray-700" />
          <Skeleton className="h-4 w-32 mx-auto bg-gray-700" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-40 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-gray-800 text-gray-300">
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">EJ</div>
            <span className="font-bold text-sm text-white">Admin</span>
          </Link>
          <Link href="/" className="p-2 rounded-lg hover:bg-gray-800 text-gray-500">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="flex">
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        <aside className={cn(
          "w-64 shrink-0 bg-gray-900 border-r border-gray-800 min-h-screen flex flex-col",
          "fixed lg:sticky top-0 left-0 z-50 lg:z-auto",
          "transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="hidden lg:flex items-center gap-2 px-6 py-5 border-b border-gray-800">
            <div className="w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">EJ</div>
            <div>
              <p className="font-bold text-sm text-white">Admin Console</p>
              <p className="text-xs text-gray-500">Platform Management</p>
            </div>
          </div>

          <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-3 right-3 p-2 rounded-lg hover:bg-gray-800 text-gray-300">
            <X className="h-5 w-5" />
          </button>

          <nav className="flex-1 p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive ? "bg-red-500/10 text-red-400" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200")}>
                  <Icon className={cn("h-4 w-4", isActive ? "text-red-400" : "text-gray-500")} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Link href="/" className="text-xs text-gray-500 hover:text-gray-300">Back to Store</Link>
              <span className="text-gray-700">|</span>
              <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); }}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                <LogOut className="h-3 w-3" /> Sign Out
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
