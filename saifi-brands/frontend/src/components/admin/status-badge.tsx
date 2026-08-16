"use client";

import { Badge } from "@/components/admin/ui";
import type { OrderStatus, PaymentStatus } from "@/types";

const ORDER_STATUS_TONE: Record<OrderStatus, "amber" | "gold" | "slate" | "purple" | "green" | "red"> = {
  PENDING: "amber",
  CONFIRMED: "gold",
  PROCESSING: "slate",
  SHIPPED: "purple",
  DELIVERED: "green",
  CANCELLED: "red",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge tone={ORDER_STATUS_TONE[status]}>
      <span className="capitalize">{status.toLowerCase()}</span>
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const tone: "green" | "amber" | "red" | "slate" =
    status === "PAID" ? "green" : status === "REFUNDED" ? "slate" : status === "FAILED" ? "red" : "amber";
  return (
    <Badge tone={tone}>
      <span className="capitalize">{status.toLowerCase()}</span>
    </Badge>
  );
}

export function ProductStatusBadge({ isActive }: { isActive: boolean }) {
  return <Badge tone={isActive ? "green" : "slate"}>{isActive ? "Active" : "Draft"}</Badge>;
}

export function RoleBadge({ role }: { role: string }) {
  const tone: "gold" | "purple" | "slate" =
    role === "ADMIN" ? "gold" : role === "SELLER" ? "purple" : "slate";
  return (
    <Badge tone={tone}>
      <span className="capitalize">{role.toLowerCase()}</span>
    </Badge>
  );
}

export function ActiveBadge({ isActive }: { isActive: boolean }) {
  return <Badge tone={isActive ? "green" : "red"}>{isActive ? "Active" : "Inactive"}</Badge>;
}