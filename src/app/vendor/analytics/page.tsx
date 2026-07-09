"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatPrice, cn } from "@/lib/utils";

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
  salesData: Array<{ date: string; sales: number; orders: number }>;
  topProducts: Array<{ id: string; name: string; qty: number; revenue: number }>;
  categoryBreakdown: Array<{ name: string; value: number }>;
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

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"7d" | "30d">("30d");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/vendors/me/analytics");
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!analytics) return null;

  const { summary, salesData, topProducts } = analytics;
  const filteredSales = period === "7d" ? salesData.slice(-7) : salesData;

  const maxSales = Math.max(...filteredSales.map((d) => d.sales), 1);

  const prevPeriodSales = salesData.slice(0, salesData.length - 7).reduce((s, d) => s + d.sales, 0);
  const currentSales = salesData.slice(-7).reduce((s, d) => s + d.sales, 0);
  const salesTrend = prevPeriodSales > 0 ? ((currentSales - prevPeriodSales) / prevPeriodSales) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-purple-900">Analytics</h1>
        <p className="text-sm text-gray-500">Your store performance at a glance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatPrice(summary.totalRevenue), icon: DollarSign, trend: `${salesTrend >= 0 ? "+" : ""}${salesTrend.toFixed(0)}%`, trendUp: salesTrend >= 0 },
          { label: "Total Orders", value: summary.totalOrders.toString(), icon: ShoppingCart, subtitle: `${summary.completedOrders} completed` },
          { label: "Products", value: summary.totalProducts.toString(), icon: Package, subtitle: `${summary.activeProducts} active` },
          { label: "Pending Orders", value: summary.pendingOrders.toString(), icon: BarChart3, subtitle: "Awaiting action" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-purple/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-brand-purple" />
                </div>
                {"trend" in card && (
                  <Badge variant={card.trendUp ? "success" : "error"} size="sm">
                    {card.trendUp ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />}
                    {card.trend}
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-purple-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-purple-900">Sales Over Time</h2>
          <div className="flex gap-1">
            <button onClick={() => setPeriod("7d")}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", period === "7d" ? "bg-brand-purple text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
              7 Days
            </button>
            <button onClick={() => setPeriod("30d")}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", period === "30d" ? "bg-brand-purple text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200")}>
              30 Days
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {filteredSales.map((day) => (
            <div key={day.date} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-20 shrink-0">
                {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <div className="flex-1">
                <MiniBar value={day.sales} max={maxSales} color="bg-brand-purple" />
              </div>
              <span className="text-xs font-medium text-purple-900 w-16 text-right">
                {formatPrice(day.sales)}
              </span>
              {day.orders > 0 && (
                <span className="text-xs text-gray-400 w-10 text-right">{day.orders} ord</span>
              )}
            </div>
          ))}
          {filteredSales.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-4">No sales data for this period.</p>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="font-bold text-purple-900 mb-4">Top Selling Products</h2>
        {topProducts.length > 0 ? (
          <div className="space-y-3">
            {topProducts.map((product, idx) => {
              const maxQty = Math.max(...topProducts.map((p) => p.qty), 1);
              return (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-5">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-purple-900 truncate">{product.name}</p>
                    <div className="mt-1">
                      <MiniBar value={product.qty} max={maxQty} color="bg-brand-green" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-purple-900">{product.qty} sold</p>
                    <p className="text-xs text-gray-500">{formatPrice(product.revenue)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <TrendingUp className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No sales data yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
