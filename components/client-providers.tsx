"use client";

import { AuthProvider } from "@/lib/context/auth-context";
import { CartProvider } from "@/lib/context/cart-context";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ToastProvider } from "@/components/ui/toast-provider";
import type { ReactNode } from "react";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </CartProvider>
    </AuthProvider>
  );
}
