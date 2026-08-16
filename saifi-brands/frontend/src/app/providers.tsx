"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { Toaster } from "sonner";

function AuthBootstrap() {
  const init = useAuthStore((s) => s.init);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    init().then(() => {
      const status = useAuthStore.getState().status;
      if (status === "authenticated") {
        fetchCart();
      }
    });
  }, [init, fetchCart]);

  useEffect(() => {
    const handleLogout = () => {
      useAuthStore.getState().logout();
      useCartStore.getState().clearCart();
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap />
      <Toaster position="top-center" richColors />
      {children}
    </QueryClientProvider>
  );
}