"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending reset email
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center text-white font-bold">
              D
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">Reset your password</h1>
          <p className="text-text-secondary mt-2">
            {sent
              ? "Check your email for the reset link"
              : "Enter your email and we&apos;ll send you a reset link"}
          </p>
        </div>

        {sent ? (
          <div className="bg-white rounded-xl border border-border-light p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-brand-green" />
            </div>
            <p className="text-sm text-text-secondary mb-6">
              If an account exists with the email you provided, we&apos;ve sent a password reset link.
            </p>
            <Link href="/login">
              <Button variant="outline" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border-light p-6 space-y-4">
            <Input
              id="email"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" variant="primary" size="lg" className="w-full" loading={loading} icon={<Mail className="h-4 w-4" />}>
              Send Reset Link
            </Button>
            <p className="text-center text-sm text-text-secondary">
              <Link href="/login" className="text-brand-green hover:text-brand-green-dark font-medium inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                Back to Login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
