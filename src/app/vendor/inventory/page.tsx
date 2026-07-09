"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Box, Search, AlertTriangle, CheckCircle2, XCircle, Edit3, Save, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, cn } from "@/lib/utils";

interface InventoryItem {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stockQty: number;
  status: string;
  imageUrl: string | null;
  totalSold: number;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");

  useEffect(() => {
    async function fetchInventory() {
      try {
        const res = await fetch("/api/vendors/me/inventory");
        const data = await res.json();
        setItems(data.inventory || []);
      } catch (err) {
        console.error("Failed to fetch inventory:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchInventory();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()));
    if (filter === "low") return matchesSearch && item.stockQty > 0 && item.stockQty <= 5;
    if (filter === "out") return matchesSearch && item.stockQty <= 0;
    return matchesSearch;
  });

  const startEdit = (item: InventoryItem) => {
    setEditing(item.id);
    setEditValues({ ...editValues, [item.id]: item.stockQty.toString() });
  };

  const saveEdit = async (itemId: string) => {
    setSaving(itemId);
    try {
      const res = await fetch("/api/vendors/me/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: itemId, stockQty: parseInt(editValues[itemId]) || 0 }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems(items.map((i) => i.id === itemId ? { ...i, stockQty: data.product.stockQty, status: data.product.status } : i));
        setEditing(null);
      }
    } catch (err) {
      console.error("Failed to update inventory:", err);
    } finally {
      setSaving(null);
    }
  };

  const stats = {
    total: items.length,
    lowStock: items.filter((i) => i.stockQty > 0 && i.stockQty <= 5).length,
    outOfStock: items.filter((i) => i.stockQty <= 0).length,
    inStock: items.filter((i) => i.stockQty > 5).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-purple-900">Inventory</h1>
        <p className="text-sm text-gray-500">Manage your stock levels</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Items", value: stats.total, color: "text-purple-900", bg: "bg-purple-50" },
          { label: "In Stock", value: stats.inStock, color: "text-green-600", bg: "bg-green-50" },
          { label: "Low Stock", value: stats.lowStock, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Out of Stock", value: stats.outOfStock, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className={cn("rounded-xl p-4", s.bg)}>
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-sm text-gray-600 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple" />
        </div>
        <div className="flex gap-2">
          {([
            { key: "all" as const, label: "All" },
            { key: "low" as const, label: "Low Stock" },
            { key: "out" as const, label: "Out of Stock" },
          ]).map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={cn("px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === f.key ? "bg-brand-purple text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50")}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
      ) : filteredItems.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredItems.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.imageUrl})` }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                      <Package className="h-4 w-4 text-brand-purple" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/vendor/products/${item.id}/edit`} className="text-sm font-medium text-purple-900 hover:text-brand-purple truncate block">
                    {item.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.sku && <span className="text-xs text-gray-400">SKU: {item.sku}</span>}
                    <span className="text-xs text-gray-400">{item.totalSold} sold</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{formatPrice(item.price)}</p>
                </div>

                {/* Stock editor */}
                {editing === item.id ? (
                  <div className="flex items-center gap-2">
                    <input type="number" value={editValues[item.id] || "0"} min="0"
                      onChange={(e) => setEditValues({ ...editValues, [item.id]: e.target.value })}
                      className="w-20 rounded-lg border border-brand-purple px-2 py-1.5 text-sm text-center font-medium focus:outline-none focus:ring-2 focus:ring-brand-purple" />
                    <button onClick={() => saveEdit(item.id)} disabled={saving === item.id}
                      className="p-1.5 rounded-lg bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20">
                      <Save className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-bold min-w-[40px] text-right",
                      item.stockQty <= 0 ? "text-red-500" : item.stockQty <= 5 ? "text-yellow-600" : "text-green-600")}>
                      {item.stockQty}
                    </span>
                    <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-brand-purple">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <Box className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="font-semibold text-purple-900 mb-1">No products in inventory</h3>
          <p className="text-sm text-gray-500 mb-4">Add products to start managing stock.</p>
          <Link href="/vendor/products/new"><Button variant="purple">Add Product</Button></Link>
        </div>
      )}
    </div>
  );
}
