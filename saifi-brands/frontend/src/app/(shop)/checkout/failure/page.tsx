"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { XCircle } from "lucide-react";

function FailureContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "";

  return (
    <div className="text-center">
      <XCircle className="mx-auto h-16 w-16 text-danger" strokeWidth={1} />
      <p className="eyebrow mt-8">Payment Incomplete</p>
      <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl">We Couldn&apos;t Complete Your Order</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
        {orderNumber
          ? `Order ${orderNumber} was created but payment was not completed.`
          : "Your payment was not completed."}{" "}
        No charge has been made. You can try again or contact support.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link href="/checkout" className="btn-ink px-10 py-3.5">
          Try Again
        </Link>
        <Link href="/shop" className="btn-outline px-10 py-3.5">
          Back to Shop
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutFailurePage() {
  return (
    <div className="bg-background">
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="w-full text-center text-muted">Loading…</div>}>
          <FailureContent />
        </Suspense>
      </div>
    </div>
  );
}