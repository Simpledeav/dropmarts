"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Clock, DollarSign, Bike, Star, TrendingUp, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate, cn } from "@/lib/utils";

interface HistoryItem {
  id: string;
  orderId: string;
  status: string;
  payout: number | null;
  completedAt: string;
  createdAt: string;
}

interface HistoryData {
  history: HistoryItem[];
  earnings: { total: number; thisWeek: number; today: number };
  stats: { totalDeliveries: number; totalDistance: number; avgRating: number };
}

export default function RiderHistoryPage() {
  const searchParams = useSearchParams();
  const completed = searchParams.get("completed");
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/riders/me/history");
        const d = await res.json();
        setData(d);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>;
  }

  const showSuccess = completed === "true";

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-700 font-medium">Delivery completed successfully! Payout has been added to your earnings.</p>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-purple-900">History</h1>
        <p className="text-sm text-gray-500">Your delivery history and earnings</p>
      </div>

      {/* Earnings Summary */}
      {data?.earnings && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Today", value: formatPrice(data.earnings.today), bg: "bg-green-50", icon: TrendingUp },
            { label: "This Week", value: formatPrice(data.earnings.thisWeek), bg: "bg-purple-50", icon: DollarSign },
            { label: "Total", value: formatPrice(data.earnings.total), bg: "bg-blue-50", icon: DollarSign },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={cn("rounded-xl p-4", stat.bg)}>
                <Icon className={cn("h-5 w-5 mb-2", stat.label === "Today" ? "text-green-600" : stat.label === "This Week" ? "text-brand-purple" : "text-blue-600")} />
                <p className="text-2xl font-bold text-purple-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <Bike className="h-5 w-5 mx-auto text-brand-purple mb-1" />
            <p className="text-xl font-bold text-purple-900">{data.stats.totalDeliveries}</p>
            <p className="text-xs text-gray-500">Deliveries</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <Star className="h-5 w-5 mx-auto text-yellow-500 mb-1" />
            <p className="text-xl font-bold text-purple-900">{data.stats.avgRating.toFixed(1)}</p>
            <p className="text-xs text-gray-500">Rating</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto text-brand-purple mb-1" />
            <p className="text-xl font-bold text-purple-900">{data.stats.totalDistance}km</p>
            <p className="text-xs text-gray-500">Distance</p>
          </div>
        </div>
      )}

      {/* History list */}
      <div>
        <h2 className="font-bold text-purple-900 mb-3">Delivery History</h2>
        {data?.history && data.history.length > 0 ? (
          <div className="space-y-2">
            {data.history.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-gray-400 font-mono">#{item.orderId.slice(0, 8)}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-gray-500">{formatDate(item.completedAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-brand-purple">
                    {item.payout ? formatPrice(item.payout) : "-"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
            <Clock className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No delivery history yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
