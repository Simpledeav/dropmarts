"use client";

import { useEffect, useState } from "react";
import { Settings, Bike, MapPin, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const VEHICLE_TYPES = [
  { value: "motorcycle", label: "🏍️ Motorcycle" },
  { value: "bicycle", label: "🚲 Bicycle" },
  { value: "car", label: "🚗 Car" },
  { value: "truck", label: "🚚 Truck" },
];

export default function RiderSettingsPage() {
  const [rider, setRider] = useState<{ vehicleType: string | null; coverageArea: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ vehicleType: "", coverageArea: "" });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/riders/me");
        const data = await res.json();
        if (data.rider) {
          setRider(data.rider);
          setForm({
            vehicleType: data.rider.vehicleType || "",
            coverageArea: data.rider.coverageArea || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await fetch("/api/riders/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess("Settings saved successfully!");
      } else {
        setError("Failed to save settings");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-lg mx-auto space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 rounded-xl" /></div>;
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-purple/10 flex items-center justify-center">
          <Settings className="h-5 w-5 text-brand-purple" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-purple-900">Settings</h1>
          <p className="text-sm text-gray-500">Update your rider profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}
        {success && <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg border border-green-200">{success}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
          <div className="grid grid-cols-2 gap-2">
            {VEHICLE_TYPES.map((v) => (
              <button key={v.value} type="button" onClick={() => setForm((f) => ({ ...f, vehicleType: v.value }))}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium border-2 transition-all text-left ${
                  form.vehicleType === v.value ? "border-brand-purple bg-purple-50 text-purple-900" : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <Input id="coverageArea" label="Coverage Area" placeholder="e.g., Lagos Mainland" value={form.coverageArea} onChange={(e) => setForm({ ...form, coverageArea: e.target.value })} />

        <Button type="submit" variant="purple" size="lg" loading={saving} icon={<Save className="h-4 w-4" />}>
          Save Settings
        </Button>
      </form>
    </div>
  );
}
