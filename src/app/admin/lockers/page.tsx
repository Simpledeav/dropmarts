"use client";

import { useEffect, useState } from "react";
import { Package, Plus, Save, X, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Locker {
  id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  status: string;
  capacity: number;
}

export default function AdminLockersPage() {
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", lat: "", lng: "", capacity: "20" });

  useEffect(() => {
    fetch("/api/admin/lockers").then((r) => r.json()).then((d) => setLockers(d.lockers || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/lockers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setLockers((prev) => [...prev, data.locker]);
        setForm({ name: "", address: "", lat: "", lng: "", capacity: "20" });
        setShowForm(false);
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await fetch("/api/admin/lockers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      setLockers((prev) => prev.map((l) => l.id === id ? { ...l, status: newStatus } : l));
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">OpenBox Lockers</h1>
          <p className="text-sm text-gray-500">{lockers.length} locker locations</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowForm(!showForm)} icon={<Plus className="h-4 w-4" />}>
          Add Locker
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Address</label>
              <input type="text" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Latitude</label>
              <input type="text" value={form.lat} onChange={(e) => setForm((f) => ({ ...f, lat: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Longitude</label>
              <input type="text" value={form.lng} onChange={(e) => setForm((f) => ({ ...f, lng: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Capacity</label>
              <input type="number" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" size="sm" loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs text-gray-500 hover:text-gray-300"><X className="h-4 w-4" /></button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl bg-gray-800" />)}</div>
      ) : lockers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lockers.map((locker) => (
            <div key={locker.id} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{locker.name}</p>
                    <p className="text-xs text-gray-500">{locker.address || "No address"}</p>
                  </div>
                </div>
                <button onClick={() => toggleStatus(locker.id, locker.status)}
                  className={cn("px-2 py-0.5 rounded text-xs font-medium transition-colors",
                    locker.status === "active" ? "bg-green-500/10 text-green-400 hover:bg-green-500/20" : "bg-gray-800 text-gray-500 hover:bg-gray-700")}>
                  {locker.status}
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>{locker.capacity} capacity</span>
                {locker.lat && locker.lng && (
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {locker.lat.toFixed(4)}, {locker.lng.toFixed(4)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-900 rounded-xl border border-dashed border-gray-800">
          <Package className="h-10 w-10 mx-auto text-gray-600 mb-3" />
          <p className="text-sm text-gray-500">No lockers configured.</p>
        </div>
      )}
    </div>
  );
}
