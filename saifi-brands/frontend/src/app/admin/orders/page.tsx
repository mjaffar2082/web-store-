"use client";

import Link from "next/link";
import { useState } from "react";
import { useAdminOrders } from "@/hooks/use-orders";
import { formatPrice } from "@/lib/utils";
import { OrderStatus } from "@/types";
import {
  Card,
  PageHeader,
  Pagination,
  EmptyState,
  Spinner,
} from "@/components/admin/ui";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";
import { ShoppingBag, ArrowUpRight } from "lucide-react";

const STATUSES: Array<OrderStatus | "ALL"> = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_COUNTS: Record<string, string> = {
  ALL: "All",
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function AdminOrdersPage() {
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminOrders({
    page,
    limit: 15,
    status: status === "ALL" ? undefined : status,
  });

  const orders = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales"
        title="Orders"
        description="Track, filter, and manage every order on your storefront."
      />

      <div className="flex flex-wrap gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={
              status === s
                ? "rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-background transition-colors"
                : "rounded-full bg-surface px-3.5 py-1.5 text-xs font-medium text-muted ring-1 ring-line transition-colors hover:bg-ink/5"
            }
          >
            {STATUS_COUNTS[s]}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders found"
            description={
              status === "ALL"
                ? "Orders placed by customers will appear here."
                : `There are no ${STATUS_COUNTS[status].toLowerCase()} orders.`
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-ink/[0.02] text-[11px] uppercase tracking-[0.14em] text-muted">
                  <th className="px-5 py-3.5 font-semibold">Order</th>
                  <th className="px-5 py-3.5 font-semibold">Customer</th>
                  <th className="px-5 py-3.5 font-semibold">Date</th>
                  <th className="px-5 py-3.5 font-semibold">Total</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Payment</th>
                  <th className="px-5 py-3.5 text-right font-semibold">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((order) => (
                  <tr key={order.id} className="transition-colors hover:bg-ink/[0.02]">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-display font-semibold text-ink hover:text-accent-hover"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {order.user?.firstName
                        ? `${order.user.firstName} ${order.user.lastName ?? ""}`
                        : order.email || order.user?.email || "Guest"}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 font-semibold text-ink">{formatPrice(order.totalAmount)}</td>
                    <td className="px-5 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-sm font-medium text-accent-hover hover:text-accent"
                      >
                        Details
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination
        page={page}
        totalPages={meta?.totalPages ?? 1}
        total={meta?.total ?? 0}
        label="orders"
        onPageChange={setPage}
      />
    </div>
  );
}