"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smartphone, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        toast.success("Login berhasil!");
        router.push("/");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
          },
        });

        if (error) throw error;

        // Jika email confirmation dimatikan, langsung login
        if (data.session) {
          toast.success("Registrasi berhasil! Selamat datang 🎉");
          router.push("/");
          router.refresh();
        } else {
          // Jika email confirmation masih aktif
          toast.success("Registrasi berhasil! Silakan cek email untuk verifikasi.");
        }
      }
    } catch (error: unknown) {
      let message = "Terjadi kesalahan, coba lagi.";
      if (error instanceof Error) {
        const raw = error.message.toLowerCase();
        if (raw.includes("user already registered") || raw.includes("already been registered")) {
          message = "Email ini sudah terdaftar. Silakan login atau gunakan email lain.";
        } else if (raw.includes("invalid email")) {
          message = "Format email tidak valid.";
        } else if (raw.includes("password")) {
          message = "Password minimal 6 karakter.";
        } else if (raw.includes("invalid login credentials")) {
          message = "Email atau password salah.";
        } else if (raw.includes("email not confirmed")) {
          message = "Email belum diverifikasi. Cek inbox email kamu.";
        } else {
          message = error.message;
        }
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { 
        redirectTo: `${window.location.origin}/auth/callback`,
        // === KUNCI BIAR MUNCUL PILIHAN AKUN ===
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) toast.error(error.message);
  };

  const handleFacebookLogin = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="bg-primary-600 text-white p-2.5 rounded-xl">
              <Smartphone className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              TAMIM <span className="text-primary-600">SPAREPART</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {mode === "login" ? "Selamat Datang Kembali" : "Buat Akun Baru"}
          </h1>
          <p className="text-gray-500 text-sm">
            {mode === "login"
              ? "Masuk ke akun untuk melanjutkan belanja"
              : "Daftar untuk mulai berbelanja spare part HP"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Social Login Buttons */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Google Login */}
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Masuk dengan Google
            </Button>

            {/* Facebook Login */}
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleFacebookLogin}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Masuk dengan Facebook
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400">atau</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nama lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {mode === "login" && (
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Lupa password?
                </Link>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {mode === "login" ? "Masuk" : "Daftar"}
            </Button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {mode === "login" ? (
              <>
                Belum punya akun?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                >
                  Daftar Sekarang
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
                >
                  Masuk
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
