"use client";

import { useEffect, useState } from "react";
import { FolderTree, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  _count: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", imageUrl: "" });

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then((d) => setCategories(d.categories || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setCategories((prev) => [...prev, { ...data.category, _count: { products: 0 } }]);
        setForm({ name: "", slug: "", imageUrl: "" });
        setShowForm(false);
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const generateSlug = (name: string) => {
    setForm((f) => ({ ...f, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <p className="text-sm text-gray-500">{categories.length} categories</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowForm(!showForm)} icon={<Plus className="h-4 w-4" />}>
          Add Category
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-xl border border-gray-800 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => generateSlug(e.target.value)} required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Slug</label>
              <input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Image URL (optional)</label>
              <input type="text" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" size="sm" loading={saving} icon={<Save className="h-4 w-4" />}>Save</Button>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs text-gray-500 hover:text-gray-300">
              <X className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-xl bg-gray-800" />)}</div>
      ) : categories.length > 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800">
          {categories.map((cat) => (
            <div key={cat.id} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                <FolderTree className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{cat.name}</p>
                <p className="text-xs text-gray-500">/{cat.slug}</p>
              </div>
              <div className="text-xs text-gray-500">{cat._count.products} products</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-900 rounded-xl border border-dashed border-gray-800">
          <FolderTree className="h-10 w-10 mx-auto text-gray-600 mb-3" />
          <p className="text-sm text-gray-500">No categories yet.</p>
        </div>
      )}
    </div>
  );
}
