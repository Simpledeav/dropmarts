"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, CreditCard, Truck, Package, CheckCircle2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, cn } from "@/lib/utils";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  qty: number;
  subtotal: number;
}

interface Locker {
  id: string;
  name: string;
  address: string | null;
  capacity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<"review" | "payment" | "confirmation">("review");
  const [loading, setLoading] = useState(true);
  const [lockersLoading, setLockersLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [lockers, setLockers] = useState<Locker[]>([]);
  const [selectedLockerId, setSelectedLockerId] = useState<string>("");

  const [deliveryMethod, setDeliveryMethod] = useState<"home_delivery" | "openbox_pickup">("home_delivery");
  const [address, setAddress] = useState({ line1: "", line2: "", city: "", state: "", phone: "" });
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCart() {
      try {
        const res = await fetch("/api/cart");
        const data = await res.json();
        if (!data.cart || data.cart.length === 0) {
          router.push("/cart");
          return;
        }
        setCartItems(data.cart);
        setTotal(data.total);
      } catch (err) {
        console.error("Failed to fetch cart:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
  }, [router]);

  useEffect(() => {
    if (deliveryMethod === "openbox_pickup" && lockers.length === 0) {
      setLockersLoading(true);
      fetch("/api/lockers")
        .then((res) => res.json())
        .then((data) => setLockers(data.lockers || []))
        .catch(console.error)
        .finally(() => setLockersLoading(false));
    }
  }, [deliveryMethod, lockers.length]);

  const deliveryFee = deliveryMethod === "openbox_pickup" ? 0 : (total >= 50000 ? 0 : Math.max(1500, total * 0.05));
  const grandTotal = total + deliveryFee;

  const handlePlaceOrder = async () => {
    setError("");
    setPlacingOrder(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deliveryMethod,
          deliveryAddress: deliveryMethod === "home_delivery" ? address : null,
          lockerId: deliveryMethod === "openbox_pickup" ? selectedLockerId : null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCreatedOrderId(data.order.id);
        setStep("confirmation");
      } else if (res.status === 401) {
        router.push("/login?redirect=/checkout");
      } else {
        setError(data.error || "Failed to place order");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-64 w-full rounded-xl mb-6" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (step === "confirmation") {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-brand-green" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-3">Order Placed! 🎉</h1>
        <p className="text-text-secondary mb-2">Your order has been placed successfully.</p>
        {createdOrderId && <p className="text-sm text-text-muted mb-8">Order #: {createdOrderId.slice(0, 8)}</p>}
        <div className="flex items-center justify-center gap-3">
          <Link href={`/orders/${createdOrderId || ""}`}><Button variant="primary" size="lg">Track Order</Button></Link>
          <Link href="/market"><Button variant="outline" size="lg">Continue Shopping</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8">
      <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-brand-green mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Cart
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-8">Checkout</h1>

      {error && <div className="mb-6 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Method */}
          <div className="bg-white rounded-xl border border-border-light p-6">
            <h2 className="font-bold text-lg text-text-primary mb-4">Delivery Method</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setDeliveryMethod("home_delivery")}
                className={cn("flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                  deliveryMethod === "home_delivery" ? "border-brand-green bg-brand-green/5" : "border-border-light hover:border-gray-300")}>
                <Truck className={cn("h-5 w-5", deliveryMethod === "home_delivery" ? "text-brand-green" : "text-text-muted")} />
                <div>
                  <p className="font-medium text-sm">Home Delivery</p>
                  <p className="text-xs text-text-muted">{total >= 50000 ? "Free" : `From ${formatPrice(1500)}`}</p>
                </div>
              </button>
              <button onClick={() => setDeliveryMethod("openbox_pickup")}
                className={cn("flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
                  deliveryMethod === "openbox_pickup" ? "border-brand-green bg-brand-green/5" : "border-border-light hover:border-gray-300")}>
                <Package className={cn("h-5 w-5", deliveryMethod === "openbox_pickup" ? "text-brand-green" : "text-text-muted")} />
                <div>
                  <p className="font-medium text-sm">OpenBox Pickup</p>
                  <p className="text-xs text-text-muted">Free pickup</p>
                </div>
              </button>
            </div>
          </div>

          {/* Delivery Address */}
          {deliveryMethod === "home_delivery" && (
            <div className="bg-white rounded-xl border border-border-light p-6">
              <h2 className="font-bold text-lg text-text-primary mb-4">Delivery Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input id="line1" label="Address Line 1" placeholder="Street address, P.O. box" value={address.line1}
                    onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} required />
                </div>
                <div className="sm:col-span-2">
                  <Input id="line2" label="Address Line 2 (optional)" placeholder="Apartment, suite, unit" value={address.line2}
                    onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))} />
                </div>
                <Input id="city" label="City" placeholder="Lagos" value={address.city}
                  onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} required />
                <Input id="state" label="State" placeholder="Lagos" value={address.state}
                  onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} required />
                <div className="sm:col-span-2">
                  <Input id="phone" label="Phone Number" type="tel" placeholder="+234 800 000 0000" value={address.phone}
                    onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} required />
                </div>
              </div>
            </div>
          )}

          {/* Locker Selection */}
          {deliveryMethod === "openbox_pickup" && (
            <div className="bg-white rounded-xl border border-border-light p-6">
              <h2 className="font-bold text-lg text-text-primary mb-4">Choose a Locker Location</h2>
              {lockersLoading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}</div>
              ) : lockers.length > 0 ? (
                <div className="space-y-2">
                  {lockers.map((locker) => (
                    <button key={locker.id} onClick={() => setSelectedLockerId(locker.id)}
                      className={cn("w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                        selectedLockerId === locker.id ? "border-brand-purple bg-purple-50" : "border-border-light hover:border-gray-300")}>
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        selectedLockerId === locker.id ? "bg-brand-purple text-white" : "bg-gray-100 text-text-muted")}>
                        <Store className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-text-primary">{locker.name}</p>
                        <p className="text-xs text-text-muted truncate">{locker.address || "No address"}</p>
                      </div>
                      <div className="text-xs text-text-muted">{locker.capacity} slots</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <MapPin className="h-8 w-8 mx-auto text-text-muted mb-2" />
                  <p className="text-sm text-text-muted">No lockers available nearby</p>
                </div>
              )}
            </div>
          )}

          {/* Payment Method */}
          <div className="bg-white rounded-xl border border-border-light p-6">
            <h2 className="font-bold text-lg text-text-primary mb-4">Payment Method</h2>
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-brand-green bg-brand-green/5">
              <CreditCard className="h-5 w-5 text-brand-green" />
              <div>
                <p className="font-medium text-sm">Pay on Delivery</p>
                <p className="text-xs text-text-muted">Pay when you receive your order</p>
              </div>
            </div>
            <p className="text-xs text-text-muted mt-3">More payment options coming soon (card, transfer, USSD).</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-border-light p-6 sticky top-24">
            <h2 className="font-bold text-lg text-text-primary mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                    {item.imageUrl ? (
                      <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.imageUrl})` }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-yellow-light to-brand-green-light">
                        <span className="text-xs font-bold text-white/60">{item.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    <p className="text-xs text-text-muted">x{item.qty}</p>
                  </div>
                  <p className="text-xs font-medium">{formatPrice(item.subtotal)}</p>
                </div>
              ))}
            </div>

            <hr className="border-border-light mb-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-medium">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Delivery Fee</span>
                <span className={cn("font-medium", deliveryFee === 0 && "text-brand-green")}>
                  {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                </span>
              </div>
              <hr className="border-border-light" />
              <div className="flex justify-between text-base">
                <span className="font-bold">Total</span>
                <span className="font-bold text-brand-green">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <Button variant="primary" size="xl" className="w-full mt-6" loading={placingOrder} onClick={handlePlaceOrder}
              disabled={deliveryMethod === "home_delivery" && (!address.line1 || !address.city || !address.state) || deliveryMethod === "openbox_pickup" && !selectedLockerId}>
              Place Order
            </Button>

            <p className="text-xs text-text-muted text-center mt-3">By placing this order, you agree to our Terms of Service.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
