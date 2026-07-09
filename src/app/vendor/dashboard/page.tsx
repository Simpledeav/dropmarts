"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Plus,
  Eye,
  ArrowRight,
  Store,
  DollarSign,
  Box,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate, cn } from "@/lib/utils";

interface Analytics {
  summary: {
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    totalRevenue: number;
  };
  recentOrders: Array<{
    id: string;
    product: string;
    buyerName: string;
    status: string;
    qty: number;
    total: number;
    date: string;
  }>;
}

export default function VendorDashboardPage() {
  const searchParams = useSearchParams();
  const onboarded = searchParams.get("onboarded");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [vendorStatus, setVendorStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [meRes, analyticsRes] = await Promise.all([
          fetch("/api/vendors/me"),
          fetch("/api/vendors/me/analytics"),
        ]);

        const meData = await meRes.json();
        const analyticsData = await analyticsRes.json();

        if (meData.vendor) {
          setVendorStatus(meData.vendor.status);
        }
        if (analyticsData.summary) {
          setAnalytics(analyticsData);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  // Pending approval state
  if (vendorStatus === "pending" || vendorStatus === "rejected") {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        {onboarded && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
            <p className="text-green-700 font-medium text-sm">
              Application submitted successfully! We&apos;ll review it shortly.
            </p>
          </div>
        )}
        <Store className="h-16 w-16 mx-auto text-brand-purple mb-4" />
        <h1 className="text-2xl font-bold text-purple-900 mb-2">Application {vendorStatus === "rejected" ? "Not Approved" : "Under Review"}</h1>
        <p className="text-gray-500 mb-6">
          {vendorStatus === "rejected"
            ? "Your vendor application was not approved. Please contact support for more information."
            : "Your vendor application is being reviewed by our team. This usually takes 1-2 business days."}
        </p>
        {vendorStatus === "rejected" && (
          <Link href="/vendor/onboarding">
            <Button variant="purple">Re-apply</Button>
          </Link>
        )}
      </div>
    );
  }

  const summary = analytics?.summary;
  const recentOrders = analytics?.recentOrders || [];

  const statCards = [
    { label: "Total Revenue", value: summary?.totalRevenue || 0, icon: DollarSign, format: "currency" as const, color: "text-green-600", bg: "bg-green-50" },
    { label: "Active Products", value: summary?.activeProducts || 0, icon: Package, format: "number" as const, color: "text-brand-purple", bg: "bg-purple-50" },
    { label: "Pending Orders", value: summary?.pendingOrders || 0, icon: Clock, format: "number" as const, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Low Stock Items", value: summary?.lowStockProducts || 0, icon: AlertTriangle, format: "number" as const, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-purple-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Your store at a glance</p>
        </div>
        <Link href="/vendor/products/new">
          <Button variant="purple" icon={<Plus className="h-4 w-4" />}>
            Add Product
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bg)}>
                  <Icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {stat.format === "currency" ? formatPrice(stat.value) : stat.value.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="font-bold text-purple-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/vendor/products/new"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors group">
            <Plus className="h-6 w-6 text-brand-purple group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-purple-700">New Product</span>
          </Link>
          <Link href="/vendor/inventory"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-colors group">
            <Box className="h-6 w-6 text-yellow-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-yellow-700">Manage Stock</span>
          </Link>
          <Link href="/vendor/orders"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group">
            <ShoppingCart className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-green-700">View Orders</span>
          </Link>
          <Link href="/vendor/analytics"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group">
            <TrendingUp className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-blue-700">Analytics</span>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-purple-900">Recent Orders</h2>
          <Link href="/vendor/orders" className="text-sm text-brand-purple hover:text-purple-700 font-medium flex items-center gap-1">
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <Link href={`/vendor/orders/${order.id}`} className="text-sm font-medium text-purple-900 hover:text-brand-purple truncate block">
                    {order.product}
                  </Link>
                  <p className="text-xs text-gray-500">by {order.buyerName} &middot; {formatDate(order.date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-medium text-purple-900">{formatPrice(order.total)}</span>
                  <Link href={`/vendor/orders/${order.id}`}>
                    <Eye className="h-4 w-4 text-gray-400 hover:text-brand-purple" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <ShoppingCart className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No orders yet</p>
            <p className="text-xs text-gray-400 mt-1">Orders will appear here once customers start buying.</p>
          </div>
        )}
      </div>
    </div>
  );
}
