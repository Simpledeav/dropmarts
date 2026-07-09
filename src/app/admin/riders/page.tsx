"use client";

import { useEffect, useState } from "react";
import { Bike, Search, Check, X } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

interface Rider {
  id: string;
  vehicleType: string | null;
  coverageArea: string | null;
  status: string;
  isOnline: boolean;
  createdAt: string;
  user: { name: string; email: string; phone: string | null };
  _count: { dispatch: number };
}

export default function AdminRidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/riders").then((r) => r.json()).then((d) => setRiders(d.riders || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/riders/${id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (res.ok) setRiders((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const filtered = riders.filter((r) => {
    const matchesSearch = r.user.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = !filter || r.status === filter;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = riders.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Riders</h1>
        <p className="text-sm text-gray-500">{riders.length} total &middot; {pendingCount} pending</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input type="text" placeholder="Search riders..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 pl-10 pr-4 py-2 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl bg-gray-800" />)}</div>
      ) : filtered.length > 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800">
          {filtered.map((rider) => (
            <div key={rider.id} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                <Bike className="h-5 w-5 text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{rider.user.name}</p>
                <p className="text-xs text-gray-500">{rider.user.email} &middot; {rider.vehicleType || "No vehicle"}</p>
              </div>
              <div className="text-right text-xs text-gray-500">
                <div>{rider._count.dispatch} deliveries</div>
                <div className={rider.isOnline ? "text-green-400" : "text-gray-600"}>{rider.isOnline ? "Online" : "Offline"}</div>
              </div>
              <StatusBadge status={rider.status} />
              {rider.status === "pending" && (
                <div className="flex items-center gap-1">
                  <button onClick={() => updateStatus(rider.id, "approved")} disabled={actionLoading === rider.id}
                    className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 disabled:opacity-50">
                    <Check className="h-4 w-4" />
                  </button>
                  <button onClick={() => updateStatus(rider.id, "rejected")} disabled={actionLoading === rider.id}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-900 rounded-xl border border-dashed border-gray-800">
          <Bike className="h-10 w-10 mx-auto text-gray-600 mb-3" />
          <p className="text-sm text-gray-500">No riders found.</p>
        </div>
      )}
    </div>
  );
}
