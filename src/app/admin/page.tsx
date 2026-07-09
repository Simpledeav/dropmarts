"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  Store,
  Bike,
  ShoppingCart,
  Package,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate, cn } from "@/lib/utils";

interface AdminData {
  summary: {
    totalUsers: number;
    totalVendors: number;
    totalRiders: number;
    totalOrders: number;
    totalProducts: number;
    totalRevenue: number;
    pendingVendors: number;
    pendingRiders: number;
  };
  recentOrders: Array<{
    id: string;
    status: string;
    total: number;
    buyerName: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/analytics");
        const d = await res.json();
        setData(d);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="space-y-6">
      <Skeleton className="h-8 w-48 bg-gray-800" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl bg-gray-800" />)}
      </div>
    </div>;
  }

  if (!data) return null;

  const { summary, recentOrders } = data;

  const cards = [
    { label: "Total Revenue", value: formatPrice(summary.totalRevenue), icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Users", value: summary.totalUsers.toLocaleString(), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Vendors", value: summary.totalVendors.toLocaleString(), icon: Store, color: "text-purple-400", bg: "bg-purple-500/10", pending: summary.pendingVendors },
    { label: "Riders", value: summary.totalRiders.toLocaleString(), icon: Bike, color: "text-cyan-400", bg: "bg-cyan-500/10", pending: summary.pendingRiders },
    { label: "Orders", value: summary.totalOrders.toLocaleString(), icon: ShoppingCart, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Products", value: summary.totalProducts.toLocaleString(), icon: Package, color: "text-pink-400", bg: "bg-pink-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Platform overview and KPIs</p>
      </div>

      {/* Pending approvals alert */}
      {(summary.pendingVendors > 0 || summary.pendingRiders > 0) && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />
          <p className="text-sm text-yellow-300">
            <strong>{summary.pendingVendors + summary.pendingRiders} pending approvals</strong> &mdash;{" "}
            {summary.pendingVendors} vendor{summary.pendingVendors !== 1 ? "s" : ""} and{" "}
            {summary.pendingRiders} rider{summary.pendingRiders !== 1 ? "s" : ""} awaiting review.
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", card.bg)}>
                <Icon className={cn("h-5 w-5", card.color)} />
              </div>
              <p className="text-xl font-bold text-white">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              {"pending" in card && card.pending! > 0 && (
                <Link href={`/admin/${card.label.toLowerCase()}`} className="text-xs text-yellow-400 hover:text-yellow-300 mt-1 block">
                  {card.pending} pending
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-900 rounded-xl border border-gray-800">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="font-bold text-white">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-red-400 hover:text-red-300">View All</Link>
        </div>
        {recentOrders.length > 0 ? (
          <div className="divide-y divide-gray-800">
            {recentOrders.slice(0, 8).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 hover:bg-gray-800/50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">#{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">{order.buyerName} &middot; {formatDate(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-bold text-white">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">No orders yet.</div>
        )}
      </div>
    </div>
  );
}
