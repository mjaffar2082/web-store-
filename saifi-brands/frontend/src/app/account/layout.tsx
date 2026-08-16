"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User, Package, LogOut } from "lucide-react";
import { RequireAuth } from "@/components/shared/route-guards";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const clearCart = useCartStore((s) => s.clearCart);

  const navItems = [
    { href: "/account/profile", label: "Profile", icon: User },
    { href: "/account/orders", label: "Order History", icon: Package },
  ];

  const handleLogout = async () => {
    await logout();
    clearCart();
    router.push("/");
  };

  return (
    <RequireAuth>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="eyebrow">Your Account</p>
        <h1 className="mt-3 font-display text-4xl text-ink">Account</h1>

        <div className="mt-10 grid gap-10 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <nav className="space-y-1 border border-line bg-surface p-2">
              {navItems.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                      active
                        ? "bg-ink text-background"
                        : "text-muted hover:bg-background hover:text-ink"
                    }`}
                  >
                    <item.icon className="h-4 w-4" strokeWidth={1.5} />
                    {item.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-muted transition-colors hover:bg-background hover:text-ink"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
                Sign Out
              </button>
            </nav>
          </aside>
          <div className="lg:col-span-3">{children}</div>
        </div>
      </div>
    </RequireAuth>
  );
}