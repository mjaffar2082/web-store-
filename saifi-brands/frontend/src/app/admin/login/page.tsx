"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { toast } from "sonner";
import { Lock, Mail, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && user?.role === "ADMIN") {
      router.replace("/admin");
    } else if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      if (useAuthStore.getState().user?.role !== "ADMIN") {
        toast.error("This area is restricted to administrators");
        router.replace("/");
        return;
      }
      toast.success("Welcome back, admin");
      router.replace("/admin");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Login failed. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-4">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 0%, rgba(176,141,79,0.25), transparent 55%), radial-gradient(ellipse at 90% 100%, rgba(176,141,79,0.15), transparent 50%)",
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-background p-8 shadow-2xl sm:p-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent font-display text-xl font-bold text-white">
              S
            </div>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
              Saifi Brands
            </p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-ink">Admin Studio</h1>
            <p className="mt-2 text-sm text-muted">
              Sign in to manage your catalog, orders, and customers.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Email
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/70" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@saifibrands.com"
                  className="w-full rounded-lg border border-line bg-surface py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Password
              </label>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/70" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-line bg-surface py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-muted/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-accent py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <Link
            href="/"
            className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to storefront
          </Link>
        </div>
      </div>
    </div>
  );
}