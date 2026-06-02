"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Loader2,
  TrendingUp,
  Clock,
  UserPlus,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Order, User } from "@/types";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  pendingOrders: number;
  newUsersToday: number;
}

const statusConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "secondary" }> = {
  pending:   { label: "Pending",  variant: "warning" },
  paid:      { label: "Dibayar", variant: "default" },
  shipped:   { label: "Dikirim", variant: "secondary" },
  completed: { label: "Selesai", variant: "success" },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<(Order & { user: User })[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAll = useCallback(async () => {
    const supabase = createClient();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [productsRes, ordersRes, usersRes, pendingRes, newUsersRes, recentOrdersRes, recentUsersRes] =
      await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("total_price, status"),
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("users").select("*", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
        supabase.from("orders").select("*, user:users(*)").order("created_at", { ascending: false }).limit(5),
        supabase.from("users").select("*").order("created_at", { ascending: false }).limit(5),
      ]);

    const totalRevenue = ordersRes.data?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;

    setStats({
      totalProducts:  productsRes.count  || 0,
      totalOrders:    ordersRes.data?.length || 0,
      totalUsers:     usersRes.count     || 0,
      totalRevenue,
      pendingOrders:  pendingRes.count   || 0,
      newUsersToday:  newUsersRes.count  || 0,
    });

    if (recentOrdersRes.data) setRecentOrders(recentOrdersRes.data as (Order & { user: User })[]);
    if (recentUsersRes.data) setRecentUsers(recentUsersRes.data as User[]);

    setLoading(false);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    fetchAll();

    // Auto-refresh setiap 30 detik
    const interval = setInterval(fetchAll, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Produk",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
      href: "/dashboard/products",
      format: false,
    },
    {
      label: "Total Pesanan",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "bg-amber-50 text-amber-600",
      href: "/dashboard/orders",
      format: false,
      badge: stats?.pendingOrders ? `${stats.pendingOrders} pending` : null,
    },
    {
      label: "Total User",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-emerald-50 text-emerald-600",
      href: "/dashboard/users",
      format: false,
      badge: stats?.newUsersToday ? `+${stats.newUsersToday} hari ini` : null,
    },
    {
      label: "Total Pendapatan",
      value: stats?.totalRevenue || 0,
      icon: DollarSign,
      color: "bg-purple-50 text-purple-600",
      href: "/dashboard/orders",
      format: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-500 text-sm">Ringkasan toko TAMIM SPAREPART</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchAll(); }}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map(({ label, value, icon: Icon, color, href, format, badge }) => (
          <Link
            key={label}
            href={href}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-gray-300 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {format ? formatCurrency(value) : value}
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-500">{label}</p>
              {badge && (
                <span className="text-xs bg-amber-50 text-amber-600 font-medium px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Pesanan Terbaru */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-amber-500" />
              <h2 className="font-semibold text-gray-900">Pesanan Terbaru</h2>
            </div>
            <Link
              href="/dashboard/orders"
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <ShoppingCart className="h-8 w-8 mb-2" />
              <p className="text-sm">Belum ada pesanan masuk</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                return (
                  <div key={order.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-gray-900">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <Badge variant={status.variant} className="text-xs">
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {order.user?.name || order.user?.email || "User"} · {formatDate(order.created_at)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-primary-600 shrink-0 ml-3">
                      {formatCurrency(order.total_price)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* User Terbaru */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-emerald-500" />
              <h2 className="font-semibold text-gray-900">User Baru Terdaftar</h2>
            </div>
            <Link
              href="/dashboard/users"
              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Users className="h-8 w-8 mb-2" />
              <p className="text-sm">Belum ada user terdaftar</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary-600">
                      {(user.name || user.email || "U")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name || "Tanpa Nama"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                      {user.role}
                    </Badge>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 justify-end">
                      <Clock className="h-3 w-3" />
                      {formatDate(user.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Last refresh info */}
      <p className="text-xs text-gray-400 text-center">
        Terakhir diperbarui: {lastRefresh.toLocaleTimeString("id-ID")} · Auto-refresh setiap 30 detik
      </p>
    </div>
  );
}
