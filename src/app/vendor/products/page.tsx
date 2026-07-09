"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Plus, Search, Edit, Eye, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  stockQty: number;
  status: string;
  sku: string | null;
  imageUrl: string | null;
  categoryName: string | null;
  orderCount: number;
  createdAt: string;
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        const params = new URLSearchParams();
        if (search) params.set("q", search);
        if (statusFilter) params.set("status", statusFilter);
        params.set("limit", "50");

        const res = await fetch(`/api/vendors/me/products?${params}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-purple-900">Products</h1>
          <p className="text-sm text-gray-500">{products.length} product{products.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/vendor/products/bulk">
            <Button variant="outline" size="sm">Bulk Import</Button>
          </Link>
          <Link href="/vendor/products/new">
            <Button variant="purple" size="sm" icon={<Plus className="h-4 w-4" />}>Add Product</Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text" placeholder="Search products..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : products.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-purple-50/50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                  {product.imageUrl ? (
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${product.imageUrl})` }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200">
                      <Package className="h-5 w-5 text-brand-purple" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/vendor/products/${product.id}/edit`} className="text-sm font-medium text-purple-900 hover:text-brand-purple truncate block">
                    {product.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={product.status} />
                    {product.sku && <span className="text-xs text-gray-400">SKU: {product.sku}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-purple-900">{formatPrice(product.price)}</p>
                  <p className="text-xs text-gray-500">
                    {product.stockQty} in stock &middot; {product.orderCount} sold
                  </p>
                </div>
                <Link href={`/vendor/products/${product.id}/edit`} className="p-2 rounded-lg hover:bg-purple-100 text-gray-400 hover:text-brand-purple">
                  <Edit className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <h3 className="font-semibold text-purple-900 mb-1">No products yet</h3>
          <p className="text-sm text-gray-500 mb-4">Start by adding your first product.</p>
          <Link href="/vendor/products/new">
            <Button variant="purple" icon={<Plus className="h-4 w-4" />}>Add Product</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
