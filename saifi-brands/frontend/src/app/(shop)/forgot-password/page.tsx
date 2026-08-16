"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/services/auth";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <p className="eyebrow text-center">Account Recovery</p>
          <h1 className="mt-4 text-center font-display text-4xl text-ink">Forgot Password</h1>

          {sent ? (
            <div className="mt-10 text-center">
              <p className="text-sm leading-relaxed text-muted">
                If an account exists for <span className="text-ink">{email}</span>, a password reset
                link has been sent. Please check your inbox (and spam folder).
              </p>
              <Link href="/login" className="btn-outline mt-8">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-3 text-center text-sm text-muted">
                Enter your email and we&apos;ll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="mt-10 space-y-5">
                <div>
                  <label className="block text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-ink">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 w-full border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-ink w-full py-3.5 disabled:opacity-50">
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
              <p className="mt-8 text-center text-sm text-muted">
                Remembered it?{" "}
                <Link href="/login" className="font-medium text-accent hover:text-ink">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}