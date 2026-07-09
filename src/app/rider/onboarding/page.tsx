"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check, Bike, User, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Personal", icon: User },
  { id: 2, title: "Vehicle", icon: Bike },
  { id: 3, title: "Coverage", icon: MapPin },
  { id: 4, title: "Review", icon: Check },
];

const VEHICLE_TYPES = [
  { value: "motorcycle", label: "Motorcycle", icon: "🏍️", desc: "Fast & agile for city deliveries" },
  { value: "bicycle", label: "Bicycle", icon: "🚲", desc: "Eco-friendly, short distances" },
  { value: "car", label: "Car", icon: "🚗", desc: "Large orders, longer distances" },
  { value: "truck", label: "Truck", icon: "🚚", desc: "Bulk deliveries" },
];

export default function RiderOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    vehicleType: "",
    coverageArea: "",
  });

  const canProceed = () => {
    switch (step) {
      case 1: return true;
      case 2: return !!form.vehicleType;
      case 3: return true;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/riders/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/rider/dashboard?onboarded=true");
      } else {
        setError(data.error || "Failed to submit application");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex flex-col">
      <div className="px-4 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800">
          <ChevronLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Marketplace</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-brand-purple rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bike className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-purple-900">Become a Rider</h1>
            <p className="text-gray-500 mt-2">Start earning by delivering orders in your area.</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-10">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isCompleted = step > s.id;
              const isCurrent = step === s.id;
              return (
                <div key={s.id} className="flex flex-col items-center flex-1 relative">
                  {idx < steps.length - 1 && (
                    <div className={cn("absolute top-4 left-[60%] w-[80%] h-0.5", isCompleted ? "bg-brand-purple" : "bg-gray-200")} />
                  )}
                  <div className={cn(
                    "relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    isCompleted ? "bg-brand-purple text-white" : isCurrent ? "bg-brand-purple/20 text-brand-purple border-2 border-brand-purple" : "bg-gray-100 text-gray-400"
                  )}>
                    {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className={cn("text-xs mt-1.5 text-center font-medium", isCompleted || isCurrent ? "text-purple-900" : "text-gray-400")}>{s.title}</span>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6 md:p-8">
            {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200 mb-6">{error}</div>}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-purple-900 mb-1">Personal Information</h2>
                <p className="text-sm text-gray-500 mb-4">We&apos;ll use the details from your account. Update your profile anytime.</p>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-purple-700">Your profile details will be collected from your account. Make sure your name and phone number are up to date.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-purple-900 mb-1">Vehicle Type</h2>
                <p className="text-sm text-gray-500 mb-4">What vehicle will you use for deliveries?</p>
                <div className="grid grid-cols-2 gap-3">
                  {VEHICLE_TYPES.map((v) => (
                    <button key={v.value} onClick={() => setForm((f) => ({ ...f, vehicleType: v.value }))}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                        form.vehicleType === v.value ? "border-brand-purple bg-purple-50" : "border-gray-200 hover:border-gray-300"
                      )}>
                      <span className="text-3xl">{v.icon}</span>
                      <span className="font-medium text-sm text-purple-900">{v.label}</span>
                      <span className="text-xs text-gray-500">{v.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-purple-900 mb-1">Coverage Area</h2>
                <p className="text-sm text-gray-500 mb-4">Where will you be delivering?</p>
                <Input id="coverageArea" label="Coverage Area" placeholder="e.g., Lagos Mainland, Ikeja, VI" value={form.coverageArea} onChange={(e) => setForm({ ...form, coverageArea: e.target.value })} />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-purple-900 mb-1">Review Your Application</h2>
                <p className="text-sm text-gray-500 mb-4">Please review your information before submitting.</p>
                <div className="bg-purple-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Vehicle</span>
                    <span className="text-sm font-medium text-purple-900">{VEHICLE_TYPES.find((v) => v.value === form.vehicleType)?.label || form.vehicleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Coverage Area</span>
                    <span className="text-sm font-medium text-purple-900">{form.coverageArea || "Not specified"}</span>
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Your application will be reviewed. You&apos;ll be notified once approved.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <Button variant="ghost" size="lg" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} icon={<ChevronLeft className="h-4 w-4" />}>Back</Button>
              {step < 4 ? (
                <Button variant="purple" size="lg" onClick={() => setStep(step + 1)} disabled={!canProceed()} icon={<ChevronRight className="h-4 w-4" />}>Continue</Button>
              ) : (
                <Button variant="purple" size="lg" onClick={handleSubmit} loading={loading} icon={<Check className="h-4 w-4" />}>Submit Application</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
