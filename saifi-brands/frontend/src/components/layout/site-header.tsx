"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, User, ShoppingBag, ChevronDown, Heart } from "lucide-react";
import { useCategories } from "@/hooks/use-categories";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";

export function SiteHeader() {
  const router = useRouter();
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const collectionsRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const { data: categories } = useCategories();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);
  const clearCart = useCartStore((s) => s.clearCart);
  const itemCount = useCartStore((s) => s.itemCount);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (collectionsRef.current && !collectionsRef.current.contains(event.target as Node)) {
        setCollectionsOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const topCategories = categories?.filter((c) => !c.parentId).slice(0, 6) ?? [];

  const handleLogout = async () => {
    setAccountOpen(false);
    await logout();
    clearCart();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-ink text-[#d9cdb8]">
        <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2 text-center">
          <p className="text-[0.6875rem] uppercase tracking-[0.22em]">
            Complimentary worldwide shipping on orders over {">"}150
          </p>
        </div>
      </div>

      <div className="border-b border-line bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-5 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Saifi Brands logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl tracking-[0.04em] text-ink">
                Saifi
              </span>
              <span className="mt-1 text-[0.5625rem] uppercase tracking-[0.42em] text-accent">
                Brands
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/shop"
              className="text-[0.8125rem] uppercase tracking-[0.14em] text-ink transition-colors hover:text-accent"
            >
              Shop All
            </Link>
            <div
              ref={collectionsRef}
              className="relative"
              onMouseEnter={() => setCollectionsOpen(true)}
              onMouseLeave={() => setCollectionsOpen(false)}
            >
              <button
                className="flex items-center gap-1.5 text-[0.8125rem] uppercase tracking-[0.14em] text-ink transition-colors hover:text-accent"
                onClick={() => setCollectionsOpen((o) => !o)}
              >
                Collections
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {collectionsOpen && (
                <div className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-4">
                  <div className="border border-line bg-surface p-2 shadow-xl">
                    {topCategories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/category/${cat.slug}`}
                        onClick={() => setCollectionsOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-muted transition-colors hover:bg-background hover:text-ink"
                      >
                        <span>{cat.name}</span>
                        <span className="text-[0.625rem] uppercase tracking-[0.2em] text-accent">
                          View
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link
              href="/shop?sort=popular"
              className="text-[0.8125rem] uppercase tracking-[0.14em] text-ink transition-colors hover:text-accent"
            >
              Popular
            </Link>
          </nav>

          <div className="flex items-center gap-5">
            <Link
              href="/shop"
              aria-label="Search"
              className="hidden text-ink transition-colors hover:text-accent sm:block"
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="hidden text-ink transition-colors hover:text-accent sm:block"
            >
              <Heart className="h-5 w-5" strokeWidth={1.5} />
            </Link>

            <div ref={accountRef} className="relative">
              <button
                aria-label="Account"
                onClick={() => {
                  if (status === "authenticated") {
                    setAccountOpen((o) => !o);
                  } else {
                    router.push("/login");
                  }
                }}
                className="text-ink transition-colors hover:text-accent"
              >
                <User className="h-5 w-5" strokeWidth={1.5} />
              </button>
              {accountOpen && user && (
                <div className="absolute right-0 top-full z-50 pt-3">
                  <div className="w-56 border border-line bg-surface p-2 shadow-xl">
                    <div className="border-b border-line px-4 py-3">
                      <p className="text-sm font-medium text-ink">
                        {user.firstName || user.email}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted">{user.email}</p>
                    </div>
                    <Link
                      href="/account/profile"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2.5 text-sm text-muted transition-colors hover:bg-background hover:text-ink"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setAccountOpen(false)}
                      className="block px-4 py-2.5 text-sm text-muted transition-colors hover:bg-background hover:text-ink"
                    >
                      Order History
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin/products"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2.5 text-sm text-muted transition-colors hover:bg-background hover:text-ink"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2.5 text-left text-sm text-danger transition-colors hover:bg-background"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/cart"
              aria-label="Shopping bag"
              className="relative text-ink transition-colors hover:text-accent"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-semibold text-background">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}