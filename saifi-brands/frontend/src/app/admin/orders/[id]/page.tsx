"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAdminOrder, useUpdateOrderStatus } from "@/hooks/use-orders";
import { formatPrice } from "@/lib/utils";
import { OrderStatus } from "@/types";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  PageHeader,
  Spinner,
  EmptyState,
  Button,
  Select,
} from "@/components/admin/ui";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/status-badge";
import { ArrowLeft, ShoppingBag, Check, X, MapPin, User as UserIcon, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
const ALL_STATUSES: OrderStatus[] = [...STATUS_FLOW, "CANCELLED"];

function StatusStepper({ current }: { current: OrderStatus }) {
  const cancelled = current === "CANCELLED";
  const currentIndex = STATUS_FLOW.indexOf(current);

  if (cancelled) {
    return (
      <div className="px-5 py-5">
        <div className="flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
            <X className="h-4 w-4 text-red-700" />
          </span>
          <div>
            <p className="text-sm font-semibold text-red-700">Order cancelled</p>
            <p className="text-xs text-red-600/70">This order was cancelled and will not be fulfilled.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-6">
      <div className="flex items-center">
        {STATUS_FLOW.map((step, i) => {
          const isDone = i <= currentIndex;
          const isLast = i === STATUS_FLOW.length - 1;
          return (
            <div key={step} className={cn("flex items-center", !isLast && "flex-1")}>
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold",
                    isDone ? "border-accent bg-accent text-white" : "border-line bg-surface text-muted"
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "mt-1.5 text-[11px] font-medium uppercase tracking-wider",
                    isDone ? "text-accent-hover" : "text-muted"
                  )}
                >
                  {step.toLowerCase()}
                </span>
              </div>
              {!isLast && (
                <div className={cn("mx-2 mb-5 h-0.5 flex-1 rounded", i < currentIndex ? "bg-accent" : "bg-line")} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: order, isLoading } = useAdminOrder(id);
  const updateStatus = useUpdateOrderStatus();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-ink/10" />
        <Spinner />
      </div>
    );
  }

  if (!order) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Order not found"
        description="This order may have been removed."
        action={
          <Link href="/admin/orders">
            <Button variant="outline">Back to Orders</Button>
          </Link>
        }
      />
    );
  }

  const handleStatusChange = async (next: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id: order.id, status: next });
      toast.success(`Order marked ${next.toLowerCase()}`);
    } catch {
      toast.error("Could not update status");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales"
        title={order.orderNumber}
        description={`Placed ${new Date(order.createdAt).toLocaleString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}`}
        action={
          <Link href="/admin/orders">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
          </Link>
        }
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-semibold text-ink">Order Progress</h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Update status
            </label>
            <Select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              disabled={updateStatus.isPending}
              className="w-44"
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <StatusStepper current={order.status} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Items"
            subtitle={`${order.items.length} item${order.items.length === 1 ? "" : "s"} in this order`}
          />
          <div className="divide-y divide-line">
            {order.items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId ?? ""}`}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink/5">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="h-5 w-5 text-muted" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    SKU: {item.sku}
                    {item.variantName ? ` · ${item.variantName}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">× {item.quantity}</p>
                  <p className="text-sm font-semibold text-ink">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Summary" />
            <dl className="space-y-2.5 px-5 py-4 text-sm">
              <div className="flex justify-between text-muted">
                <dt>Subtotal</dt>
                <dd className="text-ink">{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Shipping</dt>
                <dd className="text-ink">
                  {order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}
                </dd>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-muted">
                  <dt>Tax</dt>
                  <dd className="text-ink">{formatPrice(order.tax)}</dd>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-line pt-3">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="font-display text-lg font-bold text-ink">
                  {formatPrice(order.totalAmount)}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Payment" />
            <div className="space-y-3 px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted">
                  <CreditCard className="h-4 w-4" />
                  {order.paymentMethod || "—"}
                </span>
                <PaymentStatusBadge status={order.paymentStatus} />
              </div>
              {order.payments?.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg bg-ink/[0.02] px-3 py-2 text-xs text-muted"
                >
                  <span>{p.provider || p.method}</span>
                  <span>{p.status}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Customer" />
            <div className="px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent-hover">
                  <UserIcon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">
                    {order.user?.firstName
                      ? `${order.user.firstName} ${order.user.lastName ?? ""}`
                      : "Guest"}
                  </p>
                  <p className="text-xs text-muted">{order.user?.email || order.email || "—"}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Shipping Address" />
            <div className="px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink/5">
                  <MapPin className="h-5 w-5 text-muted" />
                </span>
                <div className="text-sm text-muted">
                  <p className="font-medium text-ink">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>
                    {order.shippingAddress.city}
                    {order.shippingAddress.postalCode ? `, ${order.shippingAddress.postalCode}` : ""}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}