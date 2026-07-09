"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Bike,
  DollarSign,
  Navigation,
  Clock,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  Package,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, cn } from "@/lib/utils";

export default function RiderDashboardPage() {
  const searchParams = useSearchParams();
  const onboarded = searchParams.get("onboarded");
  const [rider, setRider] = useState<{ status: string; isOnline: boolean; vehicleType: string | null; coverageArea: string | null } | null>(null);
  const [history, setHistory] = useState<{ earnings: { total: number; today: number; thisWeek: number }; stats: { totalDeliveries: number; totalDistance: number } } | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [meRes, historyRes, requestsRes] = await Promise.all([
          fetch("/api/riders/me"),
          fetch("/api/riders/me/history"),
          fetch("/api/riders/me/requests"),
        ]);
        const meData = await meRes.json();
        const historyData = await historyRes.json();
        const requestsData = await requestsRes.json();

        if (meData.rider) setRider(meData.rider);
        if (historyData.earnings) setHistory(historyData);
        if (requestsData.pendingRequests) setPendingCount(requestsData.pendingRequests.length);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleOnline = async () => {
    setTogglingStatus(true);
    try {
      const res = await fetch("/api/riders/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: !rider?.isOnline }),
      });
      if (res.ok) {
        setRider((prev) => prev ? { ...prev, isOnline: !prev.isOnline } : prev);
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
    } finally {
      setTogglingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (rider?.status === "pending" || rider?.status === "rejected") {
    return (
      <div className="max-w-lg mx-auto text-center py-12">
        {onboarded && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
            <p className="text-green-700 font-medium text-sm">Application submitted! We&apos;ll review it shortly.</p>
          </div>
        )}
        <Bike className="h-16 w-16 mx-auto text-brand-purple mb-4" />
        <h1 className="text-2xl font-bold text-purple-900 mb-2">Application {rider.status === "rejected" ? "Not Approved" : "Under Review"}</h1>
        <p className="text-gray-500 mb-6">
          {rider.status === "rejected"
            ? "Your rider application was not approved. Contact support."
            : "Your application is being reviewed. This usually takes 1-2 business days."}
        </p>
      </div>
    );
  }

  const statsCards = [
    { label: "Today", value: formatPrice(history?.earnings.today || 0), icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
    { label: "This Week", value: formatPrice(history?.earnings.thisWeek || 0), icon: TrendingUp, color: "text-brand-purple", bg: "bg-purple-50" },
    { label: "Total Deliveries", value: (history?.stats.totalDeliveries || 0).toString(), icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Available Jobs", value: pendingCount.toString(), icon: Navigation, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-purple-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            {rider?.coverageArea || "No area set"} &middot; {rider?.vehicleType || "No vehicle"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={rider?.status || "pending"} />
          <button onClick={toggleOnline} disabled={togglingStatus}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              rider?.isOnline ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-200 text-gray-500 hover:bg-gray-300"
            )}>
            {rider?.isOnline ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
            {rider?.isOnline ? "Online" : "Offline"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 md:p-5">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", stat.bg)}>
                <Icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <p className="text-2xl font-bold text-purple-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/rider/requests" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors group">
          <Navigation className="h-6 w-6 text-brand-purple group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-purple-700">View Requests</span>
          {pendingCount > 0 && (
            <span className="text-xs bg-brand-purple text-white px-2 py-0.5 rounded-full">{pendingCount} new</span>
          )}
        </Link>
        <Link href="/rider/active" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors group">
          <Bike className="h-6 w-6 text-green-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-green-700">Active Delivery</span>
        </Link>
        <Link href="/rider/tracking" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group">
          <Map className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-blue-700">Live Tracking</span>
        </Link>
        <Link href="/rider/history" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-yellow-50 hover:bg-yellow-100 transition-colors group">
          <Clock className="h-6 w-6 text-yellow-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-medium text-yellow-700">History</span>
        </Link>
      </div>

      {/* Pending approval view */}
      {rider?.status !== "approved" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            <strong>Account Status:</strong> Your rider account is {rider?.status}. You&apos;ll be able to accept deliveries once approved.
          </p>
        </div>
      )}
    </div>
  );
}
