import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateRelative(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function calculateDeliveryFee(subtotal: number): number {
  if (subtotal >= 50000) return 0;
  return Math.max(1500, subtotal * 0.05);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    placed: "text-brand-yellow",
    confirmed: "text-blue-500",
    processing: "text-brand-purple",
    in_transit: "text-brand-green",
    delivered: "text-brand-green",
    cancelled: "text-red-500",
  };
  return colors[status] || "text-text-secondary";
}

export function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    placed: "Package",
    confirmed: "CheckCircle",
    processing: "RefreshCw",
    in_transit: "Truck",
    delivered: "CheckCircle2",
    cancelled: "XCircle",
  };
  return icons[status] || "Circle";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function randomId(): string {
  return Math.random().toString(36).substring(2, 10);
}
