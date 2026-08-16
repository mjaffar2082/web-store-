"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-accent" strokeWidth={1} />
      <p className="eyebrow mt-8">Order Confirmed</p>
      <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl">Thank You</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
        Your order{orderNumber ? ` ${orderNumber}` : ""} has been placed successfully. A
        confirmation email is on its way. You can track its status from your account.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link href="/account/orders" className="btn-ink px-10 py-3.5">
          View Order
        </Link>
        <Link href="/shop" className="btn-outline px-10 py-3.5">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="bg-background">
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="w-full text-center text-muted">Loading…</div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}