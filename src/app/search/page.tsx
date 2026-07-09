"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search as SearchIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { ProductGridSkeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  vendorName: string;
  rating: number | null;
  reviewCount: number;
  status: string;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

  const fetchResults = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(query)}&limit=20`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => { fetchResults(); }, [fetchResults]);
  useEffect(() => { setSearchInput(query); }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
          <input
            type="text" placeholder="Search products, categories, vendors..."
            value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-border-light bg-white text-base focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all"
            autoFocus
          />
          {searchInput && (
            <button type="button" onClick={() => { setSearchInput(""); router.push("/search"); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 text-text-muted">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {query ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-text-primary">Results for &ldquo;{query}&rdquo;</h1>
            <span className="text-sm text-text-muted">{loading ? "Searching..." : `${products.length} result${products.length !== 1 ? "s" : ""}`}</span>
          </div>
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} id={product.id} name={product.name} price={product.price}
                  imageUrl={product.imageUrl || undefined} vendorName={product.vendorName}
                  rating={product.rating || undefined} reviewCount={product.reviewCount} status={product.status} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <SearchIcon className="h-16 w-16 mx-auto text-text-muted mb-4" />
              <h2 className="text-xl font-bold text-text-primary mb-2">No results found</h2>
              <p className="text-text-secondary mb-2">We couldn&apos;t find any products matching &ldquo;{query}&rdquo;</p>
              <p className="text-sm text-text-muted mb-6">Try different keywords or browse categories</p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/market"><Button variant="outline">Browse All Products</Button></Link>
                <button onClick={() => { setSearchInput(""); router.push("/search"); }}><Button variant="ghost">Clear Search</Button></button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <SearchIcon className="h-16 w-16 mx-auto text-text-muted mb-4" />
          <h2 className="text-xl font-bold text-text-primary mb-2">Search Products</h2>
          <p className="text-text-secondary">Search across thousands of products from trusted vendors.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 py-8"><ProductGridSkeleton count={8} /></div>}>
      <SearchContent />
    </Suspense>
  );
}
