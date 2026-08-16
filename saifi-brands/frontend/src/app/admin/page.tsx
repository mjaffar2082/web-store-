"use client";

import Link from "next/link";
import { ShoppingBag, Wallet, Clock, Users, TrendingUp, ArrowUpRight } from "lucide-react";
import { useDashboardStats } from "@/hooks/use-orders";
import { formatPrice } from "@/lib/utils";
import { Card, PageHeader, Spinner, EmptyState, Badge } from "@/components/admin/ui";
import { OrderStatusBadge } from "@/components/admin/status-badge";

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border border-line bg-surface" />
          ))}
        </div>
        <Spinner />
      </div>
    );
  }

  const cards = [
    { label: "Total Orders", value: String(stats?.totalOrders ?? 0), icon: ShoppingBag, accent: "gold" },
    { label: "Total Revenue", value: formatPrice(stats?.totalRevenue ?? 0), icon: Wallet, accent: "green" },
    { label: "Pending Orders", value: String(stats?.pendingOrders ?? 0), icon: Clock, accent: "amber" },
    { label: "Customers", value: String(stats?.totalCustomers ?? 0), icon: Users, accent: "ink" },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="A live snapshot of your Saifi Brands storefront."
        action={
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <TrendingUp className="h-3.5 w-3.5" />
            Live
          </span>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="p-6">
            <div
              className={
                card.accent === "gold"
                  ? "flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15 text-accent-hover"
                  : card.accent === "green"
                  ? "flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"
                  : card.accent === "amber"
                  ? "flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700"
                  : "flex h-11 w-11 items-center justify-center rounded-lg bg-ink/5 text-ink"
              }
            >
              <card.icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-ink">{card.value}</p>
            <p className="mt-1 text-sm text-muted">{card.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Recent Orders</h2>
            <p className="text-sm text-muted">Latest activity across your storefront</p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-sm font-medium text-accent-hover hover:text-accent"
          >
            View all
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        {!stats?.recentOrders?.length ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            description="Once customers place orders, they will appear here."
          />
        ) : (
          <div className="divide-y divide-line">
            {stats.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-ink/[0.02]"
              >
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold text-ink">{order.orderNumber}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {order.email || order.user?.email || "Guest"} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-ink">{formatPrice(order.totalAmount)}</span>
                  <OrderStatusBadge status={order.status} />
                  <Badge tone={order.paymentStatus === "PAID" ? "green" : "amber"} className="hidden sm:inline-flex">
                    <span className="capitalize">{order.paymentStatus.toLowerCase()}</span>
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}