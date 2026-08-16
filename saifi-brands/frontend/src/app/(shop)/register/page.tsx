"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { register } = useAuth();
  const syncToServer = useCartStore((s) => s.syncToServer);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
      });
      await syncToServer();
      toast.success("Account created — welcome to Saifi Brands");
      router.push(redirect);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="mx-auto w-full max-w-md">
      <p className="eyebrow text-center">The Edit Awaits</p>
      <h1 className="mt-4 text-center font-display text-4xl text-ink">Create Account</h1>
      <p className="mt-3 text-center text-sm text-muted">
        Join Saifi Brands for a considered shopping experience.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-ink">
              First Name
            </label>
            <input
              required
              name="firstName"
              value={form.firstName}
              onChange={update("firstName")}
              className="mt-2 w-full border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-ink">
              Last Name
            </label>
            <input
              required
              name="lastName"
              value={form.lastName}
              onChange={update("lastName")}
              className="mt-2 w-full border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-ink">
            Email
          </label>
          <input
            type="email"
            required
            name="email"
            value={form.email}
            onChange={update("email")}
            placeholder="you@example.com"
            className="mt-2 w-full border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-ink">
            Password
          </label>
          <input
            type="password"
            required
            name="password"
            minLength={8}
            value={form.password}
            onChange={update("password")}
            placeholder="At least 8 characters"
            className="mt-2 w-full border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-ink">
            Confirm Password
          </label>
          <input
            type="password"
            required
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={update("confirmPassword")}
            placeholder="Re-enter password"
            className="mt-2 w-full border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-ink w-full py-3.5 disabled:opacity-50">
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href={`/login${redirect && redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
          className="font-medium text-accent hover:text-ink"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="text-center text-muted">Loading…</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}