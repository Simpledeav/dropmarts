"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  SlidersHorizontal,
  Grid3X3,
  List,
  X,
  Search,
  ArrowUpDown,
  ChevronDown,
  Filter,
  RotateCcw,
  Package,
  Laptop,
  Shirt,
  Home,
  Sparkles,
  Dumbbell,
  BookOpen,
  Pizza,
  Watch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  vendorName: string;
  categoryName: string | null;
  rating: number | null;
  reviewCount: number;
  status: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

const categoryIcons: Record<string, typeof Laptop> = {
  electronics: Laptop,
  fashion: Shirt,
  home: Home,
  beauty: Sparkles,
  sports: Dumbbell,
  books: BookOpen,
  food: Pizza,
  accessories: Watch,
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A-Z" },
];

function MarketContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const currentSearch = searchParams.get("q") || "";
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentCategory) params.set("category", currentCategory);
      if (currentSort) params.set("sort", currentSort);
      if (currentPage) params.set("page", currentPage.toString());
      if (currentSearch) params.set("q", currentSearch);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (inStock) params.set("inStock", "true");
      params.set("limit", "20");

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 0);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [currentCategory, currentSort, currentPage, currentSearch, minPrice, maxPrice, inStock]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.set("page", "1");
    router.push(`/market?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinPrice(""); setMaxPrice(""); setInStock(false);
    router.push("/market");
  };

  const hasActiveFilters = currentCategory || minPrice || maxPrice || inStock || currentSearch;
  const activeCategoryName = categories.find((c) => c.id === currentCategory)?.name || currentSearch || "All Products";

  const getCategoryIcon = (slug: string) => {
    const Icon = categoryIcons[slug];
    return Icon ? <Icon className="h-4 w-4" /> : null;
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      {/* Page Header */}
      <div className="bg-white border-b border-border-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-text-primary capitalize">
                {activeCategoryName}
              </h1>
              <p className="text-sm text-text-secondary mt-1">
                {total} product{total !== 1 ? "s" : ""} found
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="relative">
                <select
                  value={currentSort}
                  onChange={(e) => updateFilter("sort", e.target.value)}
                  className="appearance-none bg-white border border-border-light rounded-lg px-3 py-2 pr-8 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
              </div>

              {/* View toggle */}
              <div className="hidden sm:flex border border-border-light rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn("p-2 transition-colors", viewMode === "grid" ? "bg-brand-green text-white" : "bg-white text-text-muted hover:bg-gray-50")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn("p-2 transition-colors", viewMode === "list" ? "bg-brand-green text-white" : "bg-white text-text-muted hover:bg-gray-50")}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile filter toggle */}
              <Button
                variant={hasActiveFilters ? "primary" : "secondary"}
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileFilterOpen(true)}
                icon={<Filter className="h-4 w-4" />}
              >
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center font-bold">
                    {[currentCategory, minPrice, maxPrice, inStock, currentSearch].filter(Boolean).length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Active filter badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 animate-fade-in">
            {currentCategory && (
              <Badge variant="brand" size="md">
                {categories.find((c) => c.id === currentCategory)?.name || currentCategory}
                <button onClick={() => updateFilter("category", "")} className="ml-1.5 hover:opacity-70">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {currentSearch && (
              <Badge variant="brand" size="md">
                &ldquo;{currentSearch}&rdquo;
                <button onClick={() => router.push("/market")} className="ml-1.5 hover:opacity-70">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {minPrice && (
              <Badge variant="brand" size="md">
                Min: ₦{Number(minPrice).toLocaleString()}
                <button onClick={() => { setMinPrice(""); updateFilter("minPrice", ""); }} className="ml-1.5 hover:opacity-70">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {maxPrice && (
              <Badge variant="brand" size="md">
                Max: ₦{Number(maxPrice).toLocaleString()}
                <button onClick={() => { setMaxPrice(""); updateFilter("maxPrice", ""); }} className="ml-1.5 hover:opacity-70">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-text-muted hover:text-red-500 font-medium flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              Clear All
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* ─── Desktop Sidebar ─── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="space-y-6 sticky top-24">
              {/* Categories */}
              <div className="bg-white rounded-xl border border-border-light p-4">
                <h3 className="font-bold text-sm text-text-primary mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-brand-green" />
                  Categories
                </h3>
                <div className="space-y-0.5">
                  <Link
                    href="/market"
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all",
                      !currentCategory
                        ? "bg-brand-green/10 text-brand-green-dark font-medium"
                        : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
                    )}
                  >
                    All Products
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/market?category=${cat.id}`}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all",
                        currentCategory === cat.id
                          ? "bg-brand-green/10 text-brand-green-dark font-medium"
                          : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
                      )}
                    >
                      <span className="shrink-0">{getCategoryIcon(cat.slug)}</span>
                      <span className="flex-1 truncate">{cat.name}</span>
                      <span className="text-xs text-text-muted">({cat._count.products})</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-white rounded-xl border border-border-light p-4">
                <h3 className="font-bold text-sm text-text-primary mb-3">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full border border-border-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                  <span className="text-text-muted">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full border border-border-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
                  />
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => { updateFilter("minPrice", minPrice); updateFilter("maxPrice", maxPrice); }}
                >
                  Apply Price
                </Button>
              </div>

              {/* In Stock */}
              <div className="bg-white rounded-xl border border-border-light p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => { setInStock(e.target.checked); updateFilter("inStock", e.target.checked ? "true" : ""); }}
                    className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green"
                  />
                  <span className="text-sm font-medium text-text-primary">In Stock Only</span>
                </label>
              </div>

              {/* Clear button */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="w-full text-text-muted" onClick={clearFilters}>
                  <RotateCcw className="h-4 w-4" />
                  Clear All Filters
                </Button>
              )}
            </div>
          </aside>

          {/* ─── Mobile Filter Drawer ─── */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileFilterOpen(false)} />
              <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl animate-slide-up">
                <div className="flex items-center justify-between p-4 border-b border-border-light">
                  <h2 className="font-bold text-lg">Filters</h2>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
                  {/* Categories */}
                  <div>
                    <h3 className="font-bold text-sm text-text-primary mb-3">Categories</h3>
                    <div className="space-y-0.5">
                      <Link
                        href="/market"
                        onClick={() => setMobileFilterOpen(false)}
                        className={cn(
                          "block px-3 py-2 text-sm rounded-lg transition-colors",
                          !currentCategory ? "bg-brand-green/10 text-brand-green-dark font-medium" : "text-text-secondary hover:bg-gray-50"
                        )}
                      >
                        All Products
                      </Link>
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/market?category=${cat.id}`}
                          onClick={() => setMobileFilterOpen(false)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                            currentCategory === cat.id ? "bg-brand-green/10 text-brand-green-dark font-medium" : "text-text-secondary hover:bg-gray-50"
                          )}
                        >
                          {cat.name}
                          <span className="text-xs text-text-muted ml-auto">({cat._count.products})</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <h3 className="font-bold text-sm text-text-primary mb-3">Price Range</h3>
                    <div className="flex items-center gap-2">
                      <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full border border-border-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green" />
                      <span className="text-text-muted">—</span>
                      <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full border border-border-light rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green" />
                    </div>
                    <Button variant="primary" size="sm" className="w-full mt-3" onClick={() => { updateFilter("minPrice", minPrice); updateFilter("maxPrice", maxPrice); setMobileFilterOpen(false); }}>
                      Apply Price
                    </Button>
                  </div>

                  {/* In Stock */}
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={inStock} onChange={(e) => { setInStock(e.target.checked); updateFilter("inStock", e.target.checked ? "true" : ""); }}
                        className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green" />
                      <span className="text-sm font-medium text-text-primary">In Stock Only</span>
                    </label>
                  </div>

                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" className="w-full" onClick={() => { clearFilters(); setMobileFilterOpen(false); }}>
                      <RotateCcw className="h-4 w-4" /> Clear All Filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── Product Grid ─── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <ProductGridSkeleton count={8} />
            ) : products.length > 0 ? (
              <>
                <div
                  className={cn(
                    viewMode === "grid"
                      ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5"
                      : "space-y-4"
                  )}
                >
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      imageUrl={product.imageUrl || undefined}
                      vendorName={product.vendorName}
                      rating={product.rating || undefined}
                      reviewCount={product.reviewCount}
                      status={product.status}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => updateFilter("page", page.toString())}
                        className={cn(
                          "w-10 h-10 rounded-xl text-sm font-medium transition-all",
                          page === currentPage
                            ? "bg-brand-green text-white shadow-md shadow-brand-green/20"
                            : "bg-white border border-border-light text-text-secondary hover:bg-gray-50 hover:border-brand-green"
                        )}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-border-default">
                <Search className="h-16 w-16 mx-auto text-text-muted mb-4" />
                <h3 className="text-xl font-bold text-text-primary mb-2">No products found</h3>
                <p className="text-text-secondary mb-6 max-w-sm mx-auto">
                  Try adjusting your filters or search terms to find what you&apos;re looking for.
                </p>
                <Button variant="outline" size="md" onClick={clearFilters}>
                  <RotateCcw className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 skeleton rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 skeleton rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    }>
      <MarketContent />
    </Suspense>
  );
}
