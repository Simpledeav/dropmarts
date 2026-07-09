import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "brand" | "purple";
  size?: "sm" | "md";
  className?: string;
}

const variantStyles = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-brand-green/10 text-brand-green-dark",
  warning: "bg-brand-yellow/20 text-yellow-800",
  error: "bg-red-50 text-red-600",
  info: "bg-blue-50 text-blue-600",
  brand: "bg-brand-yellow/20 text-black",
  purple: "bg-brand-purple/10 text-brand-purple-dark",
};

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    placed: { label: "Placed", variant: "info" },
    confirmed: { label: "Confirmed", variant: "info" },
    processing: { label: "Processing", variant: "brand" },
    in_transit: { label: "In Transit", variant: "warning" },
    delivered: { label: "Delivered", variant: "success" },
    cancelled: { label: "Cancelled", variant: "error" },
    pending: { label: "Pending", variant: "warning" },
    approved: { label: "Approved", variant: "success" },
    rejected: { label: "Rejected", variant: "error" },
    active: { label: "Active", variant: "success" },
    inactive: { label: "Inactive", variant: "default" },
    paid: { label: "Paid", variant: "success" },
    failed: { label: "Failed", variant: "error" },
    refunded: { label: "Refunded", variant: "info" },
  };

  const config = statusConfig[status] || { label: status, variant: "default" as const };

  return (
    <Badge variant={config.variant} size="sm">
      {config.label}
    </Badge>
  );
}
