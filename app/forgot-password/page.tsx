"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smartphone, Mail, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Email reset password telah dikirim");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-emerald-100 p-4 rounded-full inline-block mb-6">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Email Terkirim</h2>
          <p className="text-gray-500 mb-6">
            Kami telah mengirimkan link reset password ke <strong>{email}</strong>.
            Silakan cek inbox atau folder spam.
          </p>
          <Link href="/login">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="bg-primary-600 text-white p-2.5 rounded-xl">
              <Smartphone className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Lupa Password
          </h1>
          <p className="text-gray-500 text-sm">
            Masukkan email untuk menerima link reset password
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              Kirim Link Reset
            </Button>
          </form>
          <div className="text-center mt-4">
            <Link
              href="/login"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
