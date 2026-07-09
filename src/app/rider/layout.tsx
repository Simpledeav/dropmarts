"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Bike,
  Navigation,
  Map,
  Clock,
  Settings,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const sidebarLinks = [
  { href: "/rider/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/rider/requests", label: "Requests", icon: Navigation },
  { href: "/rider/active", label: "Active Delivery", icon: Bike },
  { href: "/rider/tracking", label: "Live Tracking", icon: Map },
  { href: "/rider/history", label: "History", icon: Clock },
  { href: "/rider/settings", label: "Settings", icon: Settings },
];

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; roles: string[]; rider?: { status: string; isOnline: boolean } } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (!data.user || !data.user.roles.includes("rider")) {
          router.push("/login?redirect=/rider/dashboard");
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

  const isOnboarding = pathname === "/rider/onboarding";
  const isActive = pathname === "/rider/active";

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

  if (isOnboarding) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-purple-100">
        <div className="flex items-center justify-between px-4 h-14">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-purple-50 text-purple-700">
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/rider/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-purple rounded-lg flex items-center justify-center text-white font-bold text-xs">
              EJ
            </div>
            <span className="font-bold text-sm text-purple-900">Rider Portal</span>
          </Link>
          <Link href="/" className="p-2 rounded-lg hover:bg-purple-50 text-purple-400">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="flex">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <aside className={cn(
          "w-64 shrink-0 bg-white border-r border-purple-100 min-h-screen flex flex-col",
          "fixed lg:sticky top-0 left-0 z-50 lg:z-auto",
          "transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="hidden lg:flex items-center gap-2 px-6 py-5 border-b border-purple-100">
            <div className="w-8 h-8 bg-brand-purple rounded-xl flex items-center justify-center text-white font-bold text-sm">
              EJ
            </div>
            <div>
              <p className="font-bold text-sm text-purple-900">Rider Portal</p>
              <p className="text-xs text-purple-400">On the Move</p>
            </div>
          </div>

          <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-3 right-3 p-2 rounded-lg hover:bg-purple-50 text-purple-700">
            <X className="h-5 w-5" />
          </button>

          {/* Online status badge */}
          <div className="px-4 pt-4 pb-2">
            <div className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium",
              user.rider?.isOnline ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
            )}>
              <div className={cn("w-2 h-2 rounded-full", user.rider?.isOnline ? "bg-green-500" : "bg-gray-400")} />
              {user.rider?.isOnline ? "Online" : "Offline"}
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActiveLink = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActiveLink ? "bg-brand-purple/10 text-brand-purple-dark" : "text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                  )}>
                  <Icon className={cn("h-4 w-4", isActiveLink ? "text-brand-purple" : "text-gray-400")} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

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
              <Link href="/" className="text-xs text-purple-500 hover:text-purple-700">Back to Store</Link>
              <span className="text-gray-300">|</span>
              <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); }}
                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
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
