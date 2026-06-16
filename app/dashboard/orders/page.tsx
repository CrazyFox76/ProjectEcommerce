"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Order, OrderItem, Product, User } from "@/types";
import { toast } from "sonner";
import {
  Loader2,
  Package,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Filter,
  Phone,
  Mail,
  User as UserIcon,
} from "lucide-react";

// Helper: Ekstrak nomor telepon dari shipping_address
// Format alamat: "Penerima: Nama (08xxx)\n..."
function extractPhone(shippingAddress?: string | null): string | null {
  if (!shippingAddress) return null;
  const match = shippingAddress.match(/\((08[\d\s-]+)\)/);
  return match ? match[1].trim() : null;
}

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "secondary"; color: string }> = {
  pending:   { label: "Pending",  variant: "warning",   color: "bg-amber-50  border-amber-200" },
  paid:      { label: "Dibayar", variant: "default",   color: "bg-blue-50   border-blue-200"  },
  preparing: { label: "Disiapkan", variant: "default",   color: "bg-indigo-50 border-indigo-200" },
  shipped:   { label: "Dikirim", variant: "secondary", color: "bg-gray-50   border-gray-200"  },
  completed: { label: "Selesai", variant: "success",   color: "bg-emerald-50 border-emerald-200" },
};

const statusOrder = ["pending", "paid", "preparing", "shipped", "completed"];

type OrderWithDetails = Order & {
  user: User;
  order_items: (OrderItem & { product: Product })[];
};

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [filtered, setFiltered] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  const fetchOrders = useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, user:users(*), order_items(*, product:products(*))")
      .order("created_at", { ascending: false });

    if (data) {
      setOrders(data as OrderWithDetails[]);
      setFiltered(data as OrderWithDetails[]);

      // Background sync for pending orders
      const pendingOrders = data.filter((o: any) => o.status === "pending");
      pendingOrders.forEach(async (order: any) => {
        try {
           const res = await fetch(`/api/orders/${order.id}/status`);
           if (res.ok) {
             const statusData = await res.json();
             if (statusData.status && statusData.status !== "pending") {
               setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: statusData.status } as OrderWithDetails : o));
             }
           }
        } catch (e) {
           console.error("Failed to sync order", order.id, e);
        }
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter & Search
  useEffect(() => {
    let result = orders;
    if (filterStatus !== "all") {
      result = result.filter((o) => o.status === filterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.user?.name?.toLowerCase().includes(q) ||
          o.user?.email?.toLowerCase().includes(q) ||
          o.shipping_address?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [filterStatus, searchQuery, orders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast.error("Gagal mengupdate status");
    } else {
      toast.success(`Status berhasil diubah ke "${statusConfig[newStatus].label}"`);
      fetchOrders();
    }
  };

  const statusCounts = statusOrder.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pesanan</h1>
          <p className="text-sm text-gray-500">{orders.length} total pesanan</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchOrders(); }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Status Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            filterStatus === "all"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Semua ({orders.length})
        </button>
        {statusOrder.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              filterStatus === s
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {statusConfig[s].label} ({statusCounts[s] || 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Cari ID pesanan, nama, atau email user..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all"
        />
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {searchQuery || filterStatus !== "all" ? "Tidak ada pesanan yang cocok" : "Belum ada pesanan"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const currentIndex = statusOrder.indexOf(order.status);
            const nextStatus = statusOrder[currentIndex + 1];
            const isExpanded = expandedId === order.id;

            return (
              <div
                key={order.id}
                className={`bg-white border rounded-xl overflow-hidden transition-all ${status.color}`}
              >
                {/* Order Header */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-gray-900 font-mono text-sm">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(order.created_at)}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-gray-700">
                          <UserIcon className="h-3 w-3" />
                          {order.user?.name || "User"}
                        </span>
                        {order.user?.email && (
                          <a
                            href={`mailto:${order.user.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                          >
                            <Mail className="h-3 w-3" />
                            {order.user.email}
                          </a>
                        )}
                        {extractPhone(order.shipping_address) && (
                          <a
                            href={`tel:${extractPhone(order.shipping_address)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                          >
                            <Phone className="h-3 w-3" />
                            {extractPhone(order.shipping_address)}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-lg font-bold text-primary-600">
                        {formatCurrency(order.total_price)}
                      </span>
                      {nextStatus && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(order.id, nextStatus)}
                          className="text-xs"
                        >
                          → {statusConfig[nextStatus].label}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Toggle Detail */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="mt-3 flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" /> Sembunyikan detail
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" />
                        Lihat {order.order_items?.length || 0} item
                      </>
                    )}
                  </button>
                </div>

                {/* Order Items Detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-white px-4 sm:px-5 py-3">
                    {/* Kontak User */}
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">
                        Kontak Pembeli
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <a
                          href={`mailto:${order.user?.email}`}
                          className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 font-medium hover:underline transition-colors"
                        >
                          <div className="p-1 bg-blue-100 rounded-md">
                            <Mail className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          {order.user?.email || "—"}
                        </a>
                        {extractPhone(order.shipping_address) && (
                          <a
                            href={`tel:${extractPhone(order.shipping_address)}`}
                            className="flex items-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-medium hover:underline transition-colors"
                          >
                            <div className="p-1 bg-emerald-100 rounded-md">
                              <Phone className="h-3.5 w-3.5 text-emerald-600" />
                            </div>
                            {extractPhone(order.shipping_address)}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Alamat Pengiriman
                      </p>
                      <p className="text-sm text-gray-800 whitespace-pre-line">
                        {order.shipping_address || "—"}
                      </p>
                    </div>

                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Detail Item
                    </p>
                    <div className="space-y-2">
                      {order.order_items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.product?.name || "Produk dihapus"}
                              </p>
                              <p className="text-xs text-gray-400">
                                {item.quantity} × {formatCurrency(item.price)}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 shrink-0 ml-3">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500 font-medium">Total Pesanan</span>
                      <span className="text-sm font-bold text-primary-600">
                        {formatCurrency(order.total_price)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Filter indicator */}
      {(filterStatus !== "all" || searchQuery) && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Filter className="h-3.5 w-3.5" />
          Menampilkan {filtered.length} dari {orders.length} pesanan
          <button
            onClick={() => { setFilterStatus("all"); setSearchQuery(""); }}
            className="text-primary-600 hover:underline cursor-pointer"
          >
            Reset filter
          </button>
        </div>
      )}
    </div>
  );
}
