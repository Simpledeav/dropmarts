"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check, Store, Building2, FileText, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, title: "Business Info", icon: Building2 },
  { id: 2, title: "Details", icon: FileText },
  { id: 3, title: "Payout", icon: CreditCard },
  { id: 4, title: "Review", icon: Check },
];

export default function VendorOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    businessName: "",
    category: "",
    description: "",
    payoutBankName: "",
    payoutAccountNumber: "",
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return form.businessName.length >= 2;
      case 2: return true;
      case 3: return true;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/vendors/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/vendor/dashboard?onboarded=true");
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
      {/* Header */}
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
              <Store className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-purple-900">Become a Vendor</h1>
            <p className="text-gray-500 mt-2">Set up your store and start selling in minutes.</p>
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
                    <div
                      className={cn(
                        "absolute top-4 left-[60%] w-[80%] h-0.5",
                        isCompleted ? "bg-brand-purple" : "bg-gray-200"
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                      isCompleted
                        ? "bg-brand-purple text-white"
                        : isCurrent
                        ? "bg-brand-purple/20 text-brand-purple border-2 border-brand-purple"
                        : "bg-gray-100 text-gray-400"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={cn(
                    "text-xs mt-1.5 text-center font-medium",
                    isCompleted || isCurrent ? "text-purple-900" : "text-gray-400"
                  )}>
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-xl border border-purple-100 p-6 md:p-8">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200 mb-6">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-purple-900 mb-1">Business Information</h2>
                <p className="text-sm text-gray-500 mb-4">Tell us about your business.</p>
                <Input
                  id="businessName"
                  label="Business Name *"
                  placeholder="Your store name"
                  value={form.businessName}
                  onChange={handleChange("businessName")}
                  required
                />
                <Input
                  id="category"
                  label="Business Category"
                  placeholder="e.g., Electronics, Fashion, Home"
                  value={form.category}
                  onChange={handleChange("category")}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-purple-900 mb-1">About Your Store</h2>
                <p className="text-sm text-gray-500 mb-4">Describe what you sell and what makes you unique.</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Store Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={handleChange("description")}
                    placeholder="Tell customers about your products..."
                    rows={4}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent resize-none"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-purple-900 mb-1">Payout Details</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Where should we send your earnings? You can update this later.
                </p>
                <Input
                  id="payoutBankName"
                  label="Bank Name"
                  placeholder="e.g., GTBank, Access Bank"
                  value={form.payoutBankName}
                  onChange={handleChange("payoutBankName")}
                />
                <Input
                  id="payoutAccountNumber"
                  label="Account Number"
                  placeholder="e.g., 0123456789"
                  value={form.payoutAccountNumber}
                  onChange={handleChange("payoutAccountNumber")}
                />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-purple-900 mb-1">Review Your Application</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Please review your information before submitting.
                </p>
                <div className="bg-purple-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Business Name</span>
                    <span className="text-sm font-medium text-purple-900">{form.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Category</span>
                    <span className="text-sm font-medium text-purple-900">{form.category || "Not specified"}</span>
                  </div>
                  {form.description && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Description</span>
                      <span className="text-sm font-medium text-purple-900 max-w-[200px] text-right truncate">{form.description}</span>
                    </div>
                  )}
                  {(form.payoutBankName || form.payoutAccountNumber) && (
                    <>
                      <hr className="border-purple-200" />
                      {form.payoutBankName && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Bank</span>
                          <span className="text-sm font-medium text-purple-900">{form.payoutBankName}</span>
                        </div>
                      )}
                      {form.payoutAccountNumber && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Account Number</span>
                          <span className="text-sm font-medium text-purple-900">{form.payoutAccountNumber}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Your application will be reviewed by our team.
                    You will be notified once your store is approved.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1}
                icon={<ChevronLeft className="h-4 w-4" />}
              >
                Back
              </Button>

              {step < 4 ? (
                <Button
                  variant="purple"
                  size="lg"
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  icon={<ChevronRight className="h-4 w-4" />}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  variant="purple"
                  size="lg"
                  onClick={handleSubmit}
                  loading={loading}
                  icon={<Check className="h-4 w-4" />}
                >
                  Submit Application
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
