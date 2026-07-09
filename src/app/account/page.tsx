"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Store,
  Bike,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, cn } from "@/lib/utils";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  roles: string[];
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-24 w-full rounded-xl mb-6" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <User className="h-16 w-16 mx-auto text-text-muted mb-4" />
        <h1 className="text-2xl font-bold text-text-primary mb-2">Sign in to your account</h1>
        <p className="text-text-secondary mb-6">Access your orders, wishlist, and more.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/login">
            <Button variant="primary" size="lg">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" size="lg">Create Account</Button>
          </Link>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      icon: Package,
      label: "My Orders",
      href: "/orders",
      description: "View order history and track deliveries",
    },
    {
      icon: Heart,
      label: "Wishlist",
      href: "#",
      description: "Items you've saved",
    },
    {
      icon: MapPin,
      label: "Addresses",
      href: "#",
      description: "Manage your delivery addresses",
    },
    {
      icon: Store,
      label: "Sell on Dropmart",
      href: "/vendor/dashboard",
      description: "Vendor portal",
      accent: "text-brand-purple",
    },
    {
      icon: Bike,
      label: "Become a Rider",
      href: "/rider/dashboard",
      description: "Rider portal",
      accent: "text-brand-purple",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-8">My Account</h1>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-border-light p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-green flex items-center justify-center text-white text-xl font-bold">
            {getInitials(user.name)}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-text-primary">{user.name}</h2>
            <p className="text-sm text-text-muted">{user.email}</p>
            {user.phone && <p className="text-xs text-text-muted">{user.phone}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          {user.roles.map((role) => (
            <span
              key={role}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand-green/10 text-brand-green-dark capitalize"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="bg-white rounded-xl border border-border-light overflow-hidden divide-y divide-border-light">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors group"
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100",
                item.accent || "text-text-primary"
              )}>
                <Icon className={cn("h-5 w-5", item.accent)} />
              </div>
              <div className="flex-1">
                <p className={cn("font-medium text-sm", item.accent || "text-text-primary")}>
                  {item.label}
                </p>
                <p className="text-xs text-text-muted">{item.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-text-muted group-hover:text-brand-green transition-colors" />
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="mt-6">
        <Button
          variant="ghost"
          size="lg"
          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
          icon={<LogOut className="h-4 w-4" />}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}


