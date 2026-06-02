"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Shield, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    try {
      // 1. Login dengan email & password
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (authError) throw authError;

      // 2. Cek apakah user memiliki role admin
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", authData.user?.id)
        .single();

      if (userError) throw userError;

      if (userData?.role !== "admin") {
        // Bukan admin → logout paksa dan tolak akses
        await supabase.auth.signOut();
        toast.error("Akses ditolak. Akun ini bukan admin.");
        setLoading(false);
        return;
      }

      // 3. Berhasil → masuk dashboard
      toast.success("Selamat datang, Admin! 🛡️");
      router.push("/dashboard");
      router.refresh();
    } catch (error: unknown) {
      let message = "Terjadi kesalahan, coba lagi.";
      if (error instanceof Error) {
        const raw = error.message.toLowerCase();
        if (raw.includes("invalid login credentials")) {
          message = "Email atau password salah.";
        } else if (raw.includes("email not confirmed")) {
          message = "Email belum diverifikasi.";
        } else {
          message = error.message;
        }
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-700/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-700/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-800/10 rounded-full blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md z-10">
        {/* Header badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-semibold px-4 py-2 rounded-full backdrop-blur-sm">
            <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse" />
            ADMIN ACCESS ONLY
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-black/50">
          {/* Icon + Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/30">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Admin Portal
            </h1>
            <p className="text-sm text-gray-400">
              TAMIM SPAREPART — Restricted Access
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">
                Email Admin
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@tamim.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/[0.06] border border-white/10 text-white placeholder:text-gray-600 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-violet-500/60 focus:bg-white/[0.08] focus:ring-1 focus:ring-violet-500/30 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-xs font-medium text-gray-400 mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-white/[0.06] border border-white/10 text-white placeholder:text-gray-600 rounded-xl pl-10 pr-11 py-3 text-sm outline-none focus:border-violet-500/60 focus:bg-white/[0.08] focus:ring-1 focus:ring-violet-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Masuk sebagai Admin
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="border-t border-white/[0.06] mt-7 pt-5">
            <p className="text-center text-xs text-gray-600">
              Bukan halaman untuk pelanggan.{" "}
              <a
                href="/login"
                className="text-violet-400 hover:text-violet-300 transition-colors font-medium"
              >
                Login sebagai User →
              </a>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-700 mt-6">
          © 2025 TAMIM SPAREPART — Admin Panel v1.0
        </p>
      </div>
    </div>
  );
}
