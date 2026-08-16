"use client";

import Link from "next/link";
import { useMyOrders } from "@/hooks/use-orders";
import { formatPrice } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const { data, isLoading } = useMyOrders({ limit: 20 });
  const orders = data?.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-ink">
          Order History
        </h2>
        <span className="text-xs text-muted">{data?.meta.total ?? 0} orders</span>
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse border border-line bg-surface" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-sm text-muted">You have not placed any orders yet.</p>
          <Link href="/shop" className="btn-ink mt-6 px-8 py-3">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-line border border-line bg-surface">
          {orders.map((order) => (
            <Link key={order.id} href={`/account/order/${order.id}`} className="block p-5 transition-colors hover:bg-background">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">{order.orderNumber}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {new Date(order.createdAt).toLocaleDateString()} · {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display text-lg text-ink">{formatPrice(order.totalAmount)}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}