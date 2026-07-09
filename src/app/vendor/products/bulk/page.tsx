"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Upload, FileText, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BulkImportPage() {
  const router = useRouter();
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ success: boolean; count: number; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    let products;
    try {
      products = JSON.parse(jsonInput);
      if (!Array.isArray(products)) throw new Error("Input must be an array");
    } catch (err) {
      setError("Invalid JSON. Please provide a valid array of products.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vendors/me/products/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setJsonInput("");
      } else {
        setError(data.error || data.details?.fieldErrors?.["products.0.name"]?.[0] || "Import failed");
      }
    } catch (err) {
      setError("Failed to import products");
    } finally {
      setLoading(false);
    }
  };

  const sampleJson = JSON.stringify([
    { name: "Sample Product 1", price: 5000, stockQty: 10, sku: "SMP-001", description: "A great product" },
    { name: "Sample Product 2", price: 3500, stockQty: 20, sku: "SMP-002", description: "Another great product" },
  ], null, 2);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/vendor/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-purple">
        <ChevronLeft className="h-4 w-4" /> Back to Products
      </Link>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-brand-purple/10 flex items-center justify-center">
            <Upload className="h-5 w-5 text-brand-purple" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-purple-900">Bulk Import Products</h1>
            <p className="text-sm text-gray-500">Import multiple products at once using JSON.</p>
          </div>
        </div>

        {result ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
            <h3 className="font-bold text-green-800 mb-1">{result.message}</h3>
            <p className="text-sm text-green-600 mb-4">{result.count} products added to your store.</p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/vendor/products"><Button variant="purple">View Products</Button></Link>
              <Button variant="outline" onClick={() => setResult(null)}>Import More</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Product Data (JSON)</label>
                <button type="button" onClick={() => setJsonInput(sampleJson)}
                  className="text-xs text-brand-purple hover:text-purple-700 flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Load Sample
                </button>
              </div>
              <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)} rows={10}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-purple resize-none"
                placeholder='[{ "name": "Product Name", "price": 5000, "stockQty": 10 }]' />
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <h4 className="text-sm font-medium text-purple-900 mb-2">JSON Format</h4>
              <p className="text-xs text-purple-700 space-y-1">
                Each product can have: <code className="bg-purple-100 px-1 rounded">name</code> (required),{" "}
                <code className="bg-purple-100 px-1 rounded">price</code> (required),{" "}
                <code className="bg-purple-100 px-1 rounded">stockQty</code>,{" "}
                <code className="bg-purple-100 px-1 rounded">sku</code>,{" "}
                <code className="bg-purple-100 px-1 rounded">description</code>,{" "}
                <code className="bg-purple-100 px-1 rounded">categoryId</code>,{" "}
                <code className="bg-purple-100 px-1 rounded">imageUrl</code>
              </p>
            </div>

            <Button type="submit" variant="purple" size="lg" loading={loading} disabled={!jsonInput.trim()}
              icon={<Upload className="h-4 w-4" />}>
              Import Products
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
