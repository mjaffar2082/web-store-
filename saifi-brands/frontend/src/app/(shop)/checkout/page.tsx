"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { useCreateOrder } from "@/hooks/use-orders";
import { createPaymentIntent, verifyPayment } from "@/services/orders";
import { formatPrice } from "@/lib/utils";
import { RequireAuth } from "@/components/shared/route-guards";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

const FREE_SHIPPING_THRESHOLD = 50000;
const FLAT_SHIPPING = 1500;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const createOrder = useCreateOrder();

  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal" | "cod">("cod");
  const [form, setForm] = useState({
    fullName: user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "",
    email: user?.email || "",
    line1: "",
    city: "",
    country: "Pakistan",
    postalCode: "",
    phone: "",
  });
  const [placing, setPlacing] = useState(false);

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const total = subtotal + shipping;

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const inputClass =
    "mt-2 w-full border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none";

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your bag is empty");
      return;
    }
    const requiredFields: Array<[keyof typeof form, string]> = [
      ["fullName", "Full Name"],
      ["email", "Email"],
      ["line1", "Street Address"],
      ["city", "City"],
      ["country", "Country"],
    ];
    const missing = requiredFields.find(([key]) => !form[key].trim());
    if (missing) {
      toast.error(`Please fill in your ${missing[1]}`);
      return;
    }
    setPlacing(true);
    try {
      const order = await createOrder.mutateAsync({
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        shippingAddress: {
          fullName: form.fullName,
          line1: form.line1,
          city: form.city,
          country: form.country,
          postalCode: form.postalCode,
          phone: form.phone,
        },
        paymentMethod,
        email: form.email,
      });

      if (paymentMethod === "cod") {
        const verified = await verifyPayment(order.id);
        router.push(`/checkout/success?order=${verified.orderNumber}`);
        return;
      }

      const intent = await createPaymentIntent(order.id);

      if (intent.mode === "mock") {
        const verified = await verifyPayment(order.id);
        router.push(`/checkout/success?order=${verified.orderNumber}`);
      } else {
        router.push(`/checkout/failure?order=${order.orderNumber}&reason=live-gateway`);
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Unable to place your order. Please try again.";
      toast.error(message);
      setPlacing(false);
    }
  };

  return (
    <RequireAuth>
      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href="/cart" className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted hover:text-ink">
            <ChevronLeft className="h-4 w-4" />
            Back to Bag
          </Link>
          <h1 className="mt-4 font-display text-4xl text-ink sm:text-5xl">Checkout</h1>

          <form onSubmit={handlePlaceOrder} noValidate className="mt-10 grid gap-10 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <section className="border border-line bg-surface p-6 sm:p-8">
                <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-ink">
                  Shipping Details
                </h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="co-fullName" className="block text-xs uppercase tracking-wider text-muted">Full Name</label>
                    <input id="co-fullName" required value={form.fullName} onChange={update("fullName")} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="co-email" className="block text-xs uppercase tracking-wider text-muted">Email</label>
                    <input id="co-email" type="email" required value={form.email} onChange={update("email")} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="co-line1" className="block text-xs uppercase tracking-wider text-muted">Street Address</label>
                    <input id="co-line1" required value={form.line1} onChange={update("line1")} placeholder="House, street, area" className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="co-city" className="block text-xs uppercase tracking-wider text-muted">City</label>
                    <input id="co-city" required value={form.city} onChange={update("city")} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="co-country" className="block text-xs uppercase tracking-wider text-muted">Country</label>
                    <input id="co-country" required value={form.country} onChange={update("country")} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="co-postalCode" className="block text-xs uppercase tracking-wider text-muted">Postal Code</label>
                    <input id="co-postalCode" value={form.postalCode} onChange={update("postalCode")} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="co-phone" className="block text-xs uppercase tracking-wider text-muted">Phone</label>
                    <input id="co-phone" value={form.phone} onChange={update("phone")} className={inputClass} />
                  </div>
                </div>
              </section>

              <section className="border border-line bg-surface p-6 sm:p-8">
                <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-ink">
                  Payment Method
                </h2>
                <div className="mt-6 space-y-3">
                  {(
                    [
                      { value: "cod", label: "Cash on Delivery", desc: "Pay when your order arrives" },
                      { value: "stripe", label: "Card (Stripe)", desc: "Credit or debit card" },
                      { value: "paypal", label: "PayPal", desc: "Pay with your PayPal account" },
                    ] as const
                  ).map((method) => (
                    <label
                      key={method.value}
                      className={`flex cursor-pointer items-center gap-4 border p-4 transition-colors ${
                        paymentMethod === method.value
                          ? "border-ink bg-background"
                          : "border-line hover:border-muted"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={() => setPaymentMethod(method.value)}
                        className="h-4 w-4 accent-accent"
                      />
                      <span>
                        <span className="block text-sm font-medium text-ink">{method.label}</span>
                        <span className="block text-xs text-muted">{method.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="border border-line bg-surface p-6">
                <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-ink">
                  Order Summary
                </h2>

                <div className="mt-5 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.image && (
                        <Image src={item.image} alt="" width={48} height={48} className="h-12 w-12 rounded object-cover" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm text-ink">{item.name}</p>
                        <p className="text-xs text-muted">Qty {item.quantity}</p>
                      </div>
                      <span className="text-sm text-ink">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
                  <div className="flex justify-between text-muted">
                    <dt>Subtotal</dt>
                    <dd>{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-muted">
                    <dt>Shipping</dt>
                    <dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-line pt-3 font-medium text-ink">
                    <dt>Total</dt>
                    <dd className="font-display text-2xl">{formatPrice(total)}</dd>
                  </div>
                </dl>

                <button type="submit" disabled={placing || items.length === 0} className="btn-ink mt-6 w-full py-3.5 disabled:opacity-50">
                  {placing ? "Placing Order..." : "Place Order"}
                </button>
                <p className="mt-3 text-center text-[0.6875rem] text-muted">
                  By placing this order you agree to our terms and conditions.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </RequireAuth>
  );
}