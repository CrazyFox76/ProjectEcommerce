"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";
import { toast } from "sonner";
import {
  Loader2,
  Users as UsersIcon,
  Shield,
  User as UserIcon,
  Search,
  RefreshCw,
  ShoppingCart,
  UserPlus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";

interface UserWithStats extends User {
  orderCount: number;
  totalSpent: number;
}

// ── Edit Modal ──────────────────────────────────────────────
function EditModal({
  user,
  onClose,
  onSave,
}: {
  user: UserWithStats;
  onClose: () => void;
  onSave: (id: string, name: string, role: "user" | "admin") => Promise<void>;
}) {
  const [name, setName] = useState(user.name || "");
  const [role, setRole] = useState<"user" | "admin">(user.role);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(user.id, name, role);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-gray-900">Edit User</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Email
            </label>
            <input
              type="text"
              value={user.email}
              disabled
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed"
            />
          </div>

          {/* Nama */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Role
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setRole("user")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  role === "user"
                    ? "bg-primary-50 border-primary-400 text-primary-700"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <UserIcon className="h-4 w-4" />
                User
              </button>
              <button
                onClick={() => setRole("admin")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                  role === "admin"
                    ? "bg-primary-50 border-primary-400 text-primary-700"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Shield className="h-4 w-4" />
                Admin
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Batal
          </Button>
          <Button className="flex-1" onClick={handleSave} loading={saving}>
            <Check className="h-4 w-4" />
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ────────────────────────────────────
function DeleteModal({
  user,
  onClose,
  onConfirm,
}: {
  user: UserWithStats;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onConfirm(user.id);
    setDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Hapus User?</h3>
          <p className="text-sm text-gray-500">
            Akun{" "}
            <span className="font-semibold text-gray-800">
              {user.name || user.email}
            </span>{" "}
            akan dihapus dari database. Aksi ini tidak bisa dibatalkan.
          </p>
          {user.orderCount > 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
              ⚠️ User ini memiliki {user.orderCount} pesanan yang akan ikut terhapus.
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Batal
          </Button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [filtered, setFiltered] = useState<UserWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserWithStats | null>(null);

  const supabase = createClient();

  const fetchUsers = useCallback(async () => {
    const { data: usersData } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (!usersData) { setLoading(false); return; }

    const { data: ordersData } = await supabase
      .from("orders")
      .select("user_id, total_price");

    const statsMap: Record<string, { count: number; spent: number }> = {};
    ordersData?.forEach((o) => {
      if (!statsMap[o.user_id]) statsMap[o.user_id] = { count: 0, spent: 0 };
      statsMap[o.user_id].count++;
      statsMap[o.user_id].spent += o.total_price || 0;
    });

    const enriched: UserWithStats[] = usersData.map((u) => ({
      ...u,
      orderCount: statsMap[u.id]?.count || 0,
      totalSpent: statsMap[u.id]?.spent || 0,
    }));

    setUsers(enriched);
    setFiltered(enriched);
    setLoading(false);
  }, []);

  // Realtime subscription
  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel("users-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => {
          fetchUsers(); // refresh saat ada perubahan
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchUsers]);

  // Filter & search
  useEffect(() => {
    let result = users;
    if (roleFilter !== "all") result = result.filter((u) => u.role === roleFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [roleFilter, searchQuery, users]);

  // Edit user
  const handleEdit = async (id: string, name: string, role: "user" | "admin") => {
    const { error } = await supabase
      .from("users")
      .update({ name, role })
      .eq("id", id);

    if (error) {
      toast.error("Gagal menyimpan perubahan");
    } else {
      toast.success("Data user berhasil diperbarui ✅");
    }
  };

  // Delete user
  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Gagal menghapus user");
    } else {
      toast.success("User berhasil dihapus 🗑️");
    }
  };

  const totalAdmin   = users.filter((u) => u.role === "admin").length;
  const totalUser    = users.filter((u) => u.role === "user").length;
  const todayStart   = new Date(); todayStart.setHours(0, 0, 0, 0);
  const newToday     = users.filter((u) => new Date(u.created_at) >= todayStart).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <>
      {/* Edit Modal */}
      {editingUser && (
        <EditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleEdit}
        />
      )}

      {/* Delete Modal */}
      {deletingUser && (
        <DeleteModal
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDelete}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-gray-500">{users.length} user terdaftar</span>
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs text-emerald-600 font-medium">Live</span>
            </div>
          </div>
          <button
            onClick={() => { setLoading(true); fetchUsers(); }}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <UsersIcon className="h-4 w-4 text-gray-400" />
              <span className="text-xs text-gray-500">Total User</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalUser}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-primary-500" />
              <span className="text-xs text-gray-500">Total Admin</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{totalAdmin}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-1">
              <UserPlus className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-gray-500">Daftar Hari Ini</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{newToday}</p>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2">
            {(["all", "user", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer capitalize ${
                  roleFilter === r
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {r === "all" ? "Semua" : r}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">
                    <div className="flex items-center gap-1">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Pesanan
                    </div>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden lg:table-cell">Total Belanja</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Terdaftar</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                  >
                    {/* Avatar + Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                          {user.role === "admin" ? (
                            <Shield className="h-4 w-4 text-primary-600" />
                          ) : (
                            <UserIcon className="h-4 w-4 text-primary-600" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-[120px]">
                            {user.name || "Tanpa Nama"}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-[130px] sm:hidden">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                      <span className="truncate max-w-[180px] block">{user.email}</span>
                    </td>

                    <td className="px-4 py-3">
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-sm font-semibold ${user.orderCount > 0 ? "text-amber-600" : "text-gray-400"}`}>
                        {user.orderCount}× pesanan
                      </span>
                    </td>

                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`text-sm font-semibold ${user.totalSpent > 0 ? "text-primary-600" : "text-gray-400"}`}>
                        {user.totalSpent > 0 ? formatCurrency(user.totalSpent) : "—"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-gray-500 text-xs hidden md:table-cell">
                      {formatDate(user.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit */}
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit user"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeletingUser(user)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchQuery || roleFilter !== "all"
                  ? "Tidak ada user yang cocok"
                  : "Belum ada user terdaftar"}
              </p>
            </div>
          )}
        </div>

        {/* Result count */}
        {(searchQuery || roleFilter !== "all") && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            Menampilkan {filtered.length} dari {users.length} user
            <button
              onClick={() => { setRoleFilter("all"); setSearchQuery(""); }}
              className="text-primary-600 hover:underline cursor-pointer"
            >
              Reset filter
            </button>
          </div>
        )}
      </div>
    </>
  );
}
