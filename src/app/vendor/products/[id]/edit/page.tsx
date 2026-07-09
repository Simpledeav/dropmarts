"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQty: number;
  status: string;
  sku: string | null;
  images: Array<{ url: string }>;
  category: { name: string } | null;
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stockQty: "",
    sku: "",
    imageUrl: "",
  });

  useEffect(() => {
    async function fetchProduct() {
      try {
        // Fetch from the vendor products endpoint or regular product endpoint
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        const p = data.product;
        setProduct(p);
        setForm({
          name: p.name,
          description: p.description || "",
          price: p.price.toString(),
          stockQty: p.stockQty.toString(),
          sku: p.sku || "",
          imageUrl: p.images?.[0]?.url || "",
        });
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Product not found");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/vendors/me/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          stockQty: parseInt(form.stockQty),
          sku: form.sku,
          imageUrl: form.imageUrl,
        }),
      });

      if (res.ok) {
        router.push("/vendor/products");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update product");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/vendors/me/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/vendor/products");
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto space-y-4"><Skeleton className="h-8 w-32" /><Skeleton className="h-96 rounded-xl" /></div>;
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">Product not found</p>
        <Link href="/vendor/products"><Button variant="purple" className="mt-4">Back to Products</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/vendor/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-purple">
          <ChevronLeft className="h-4 w-4" /> Back to Products
        </Link>
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleDelete} loading={deleting} icon={<Trash2 className="h-4 w-4" />}>
          Delete
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-purple-900">Edit Product</h1>
            <p className="text-sm text-gray-500">{formatPrice(product.price)} &middot; <StatusBadge status={product.status} /></p>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200 mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" label="Product Name *" value={form.name} onChange={handleChange("name")} required />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={handleChange("description")} rows={3}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input id="price" label="Price (₦)" type="number" value={form.price} onChange={handleChange("price")} required />
            <Input id="stockQty" label="Stock Quantity" type="number" value={form.stockQty} onChange={handleChange("stockQty")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input id="sku" label="SKU" value={form.sku} onChange={handleChange("sku")} />
            <Input id="imageUrl" label="Image URL" value={form.imageUrl} onChange={handleChange("imageUrl")} />
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <Button type="submit" variant="purple" size="lg" loading={saving} icon={<Save className="h-4 w-4" />}>Save Changes</Button>
            <Link href="/vendor/products"><Button type="button" variant="ghost" size="lg">Cancel</Button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
