"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/context/auth-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Order, OrderItem, Product } from "@/types";
import {
  Package,
  Clock,
  Loader2,
  ShoppingBag,
  ChevronRight,
  CreditCard,
  PackageCheck,
  Truck,
  CircleCheckBig,
  Hourglass,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "success" | "warning" | "secondary" | "danger" }
> = {
  pending: { label: "Menunggu Pembayaran", variant: "warning" },
  paid: { label: "Dibayar", variant: "default" },
  preparing: { label: "Disiapkan", variant: "default" },
  shipped: { label: "Dikirim", variant: "secondary" },
  completed: { label: "Selesai", variant: "success" },
  failed: { label: "Gagal", variant: "danger" },
};

// Steps for the visual status tracker
const statusSteps = [
  { key: "paid", label: "Dibayar", icon: CreditCard },
  { key: "preparing", label: "Disiapkan", icon: PackageCheck },
  { key: "shipped", label: "Dikirim", icon: Truck },
  { key: "completed", label: "Diterima", icon: CircleCheckBig },
];

function getStepState(orderStatus: string, stepKey: string) {
  const order = ["pending", "paid", "preparing", "shipped", "completed"];
  const orderIdx = order.indexOf(orderStatus);
  const stepIdx = order.indexOf(stepKey);
  if (orderIdx >= stepIdx) return "completed";
  if (orderIdx === stepIdx - 1) return "current";
  return "upcoming";
}

function StatusTracker({ status }: { status: string }) {
  if (status === "pending" || status === "failed") {
    return (
      <div className="flex items-center gap-2 py-3 px-4 rounded-lg bg-gray-50 border border-gray-100">
        <Hourglass className="h-4 w-4 text-amber-500 animate-pulse" />
        <span className="text-sm text-gray-600 font-medium">
          {status === "pending" ? "Menunggu pembayaran..." : "Pembayaran gagal"}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center w-full py-3">
      {statusSteps.map((step, idx) => {
        const state = getStepState(status, step.key);
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  state === "completed"
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                    : state === "current"
                    ? "bg-primary-500 text-white shadow-md shadow-primary-500/30 animate-pulse"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={`text-[10px] font-semibold whitespace-nowrap ${
                  state === "completed"
                    ? "text-emerald-600"
                    : state === "current"
                    ? "text-primary-600"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < statusSteps.length - 1 && (
              <div className="flex-1 mx-2 h-0.5 rounded-full relative overflow-hidden bg-gray-200">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                    getStepState(status, statusSteps[idx + 1].key) === "completed"
                      ? "w-full bg-emerald-500"
                      : getStepState(status, statusSteps[idx + 1].key) === "current"
                      ? "w-1/2 bg-primary-400"
                      : "w-0 bg-gray-200"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderHistoryPage() {
  const { user, supabaseUser, isLoggedIn, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<
    (Order & { order_items: (OrderItem & { product: Product })[] })[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const userId = user?.id || supabaseUser?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*, product:products(*))")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (data) {
        setOrders(data as typeof orders);

        // Background sync for pending orders to guarantee UI is up-to-date
        const pendingOrders = data.filter((o: any) => o.status === "pending");
        pendingOrders.forEach(async (order: any) => {
          try {
             const res = await fetch(`/api/orders/${order.id}/status`);
             if (res.ok) {
               const statusData = await res.json();
               if (statusData.status && statusData.status !== "pending") {
                 setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: statusData.status } : o));
               }
             }
          } catch (e) {
             console.error("Failed to sync order", order.id, e);
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, supabaseUser, isLoggedIn]);

  useEffect(() => {
    if (authLoading) return;
    fetchOrders();

    // Refetch saat user kembali ke tab/halaman agar status selalu sinkron
    // dengan perubahan admin (mis. "Disiapkan"), tanpa perlu refresh manual.
    // Mengatasi data basi dari Next.js Router Cache saat navigasi balik.
    const onFocus = () => fetchOrders({ silent: true });
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchOrders({ silent: true });
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [authLoading, fetchOrders]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Belum Ada Pesanan
          </h2>
          <p className="text-gray-500 mb-6">
            Kamu belum pernah melakukan pesanan
          </p>
          <Link href="/catalog">
            <Button>Mulai Belanja</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Riwayat Pesanan
          </h1>
          <p className="text-sm text-gray-500 mt-1">{orders.length} pesanan</p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order, index) => {
          const status = statusConfig[order.status] || statusConfig.pending;
          const totalItems = order.order_items.reduce(
            (sum, item) => sum + item.quantity,
            0
          );

          return (
            <Link
              href={`/order-history/${order.id}`}
              key={order.id}
              className={`block bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 animate-fade-in`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-2.5 rounded-xl">
                      <Package className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900 font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(order.created_at)}
                        </span>
                        <span>{totalItems} item</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary-600">
                      {formatCurrency(order.total_price)}
                    </span>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Status Tracker */}
              <div className="px-4 sm:px-5 py-2">
                <StatusTracker status={order.status} />
              </div>

              {/* Quick item preview */}
              <div className="px-4 sm:px-5 pb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <PackageCheck className="h-3.5 w-3.5" />
                  <span className="truncate">
                    {order.order_items
                      .slice(0, 2)
                      .map((item) => item.product?.name || "Produk")
                      .join(", ")}
                    {order.order_items.length > 2 &&
                      ` +${order.order_items.length - 2} lainnya`}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
