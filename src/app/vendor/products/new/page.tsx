"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stockQty: "1",
    sku: "",
    categoryId: "",
    imageUrl: "",
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/vendors/me/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price) || 0,
          stockQty: parseInt(form.stockQty) || 0,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/vendor/products");
      } else {
        setError(data.error || "Failed to create product");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/vendor/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-purple">
        <ChevronLeft className="h-4 w-4" /> Back to Products
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-brand-purple/10 flex items-center justify-center">
            <Package className="h-5 w-5 text-brand-purple" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-purple-900">Add New Product</h1>
            <p className="text-sm text-gray-500">List a new product in your store.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200 mb-6">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" label="Product Name *" placeholder="Enter product name" value={form.name} onChange={handleChange("name")} required />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={handleChange("description")} rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent resize-none"
              placeholder="Describe your product..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input id="price" label="Price (₦) *" type="number" placeholder="0" value={form.price} onChange={handleChange("price")} required />
            <Input id="stockQty" label="Stock Quantity" type="number" placeholder="0" value={form.stockQty} onChange={handleChange("stockQty")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input id="sku" label="SKU (optional)" placeholder="e.g., PRD-001" value={form.sku} onChange={handleChange("sku")} />
            <Input id="imageUrl" label="Image URL (optional)" placeholder="https://..." value={form.imageUrl} onChange={handleChange("imageUrl")} />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <Button type="submit" variant="purple" size="lg" loading={loading} icon={<Save className="h-4 w-4" />}>
              Save Product
            </Button>
            <Link href="/vendor/products">
              <Button type="button" variant="ghost" size="lg">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
