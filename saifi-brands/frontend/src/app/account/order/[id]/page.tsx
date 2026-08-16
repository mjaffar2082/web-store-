"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useOrder } from "@/hooks/use-orders";
import { formatPrice } from "@/lib/utils";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

export default function OrderDetailPage() {
  const params = useParams();
  const { data: order, isLoading, error } = useOrder(params.id as string);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-48 animate-pulse bg-line" />
        <div className="h-64 animate-pulse border border-line bg-surface" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center">
        <h1 className="font-display text-3xl text-ink">Order Not Found</h1>
        <Link href="/account/orders" className="btn-outline mt-8">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: "Account", href: "/account/orders" },
          { label: order.orderNumber },
        ]}
      />
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl text-ink">{order.orderNumber}</h2>
          <p className="mt-1 text-sm text-muted">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            {order.status}
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            Payment: {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="divide-y divide-line border border-line bg-surface">
            {order.items.map((item) => (
              <div key={`${item.productId}-${item.variantId ?? ""}`} className="flex items-center gap-4 p-5">
                {item.image && (
                  <Image src={item.image} alt={item.name} width={64} height={64} className="h-16 w-16 shrink-0 rounded object-cover" />
                )}
                <div className="flex-1">
                  <Link href={`/product/${item.slug}`} className="text-sm font-medium text-ink hover:text-accent">
                    {item.name}
                  </Link>
                  {item.variantName && <p className="mt-0.5 text-xs text-muted">{item.variantName}</p>}
                  <p className="mt-0.5 text-xs text-muted">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-medium text-ink">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-line bg-surface p-6">
            <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-ink">
              Order Summary
            </h3>
            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-muted">
                <dt>Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between text-muted">
                <dt>Shipping</dt>
                <dd>{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</dd>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-muted">
                  <dt>Tax</dt>
                  <dd>{formatPrice(order.tax)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-3 font-medium text-ink">
                <dt>Total</dt>
                <dd className="font-display text-xl">{formatPrice(order.totalAmount)}</dd>
              </div>
            </dl>
          </div>

          <div className="border border-line bg-surface p-6">
            <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-ink">
              Shipping Address
            </h3>
            <div className="mt-4 text-sm text-muted">
              <p className="text-ink">{order.shippingAddress.fullName}</p>
              <p className="mt-1">{order.shippingAddress.line1}</p>
              <p>
                {order.shippingAddress.city}
                {order.shippingAddress.postalCode ? `, ${order.shippingAddress.postalCode}` : ""}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && <p className="mt-1">{order.shippingAddress.phone}</p>}
            </div>
          </div>

          <Link href="/shop" className="btn-outline w-full py-3">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}