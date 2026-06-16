"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, Loader2, ArrowRight, ShoppingBag } from "lucide-react";
import { Suspense } from "react";

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const status = searchParams.get("status") || "success";

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="text-center animate-scale-in max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="bg-emerald-100 p-4 rounded-full inline-flex items-center justify-center mb-6">
          <Check className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {status === "pending" ? "Pesanan Diterima!" : "Pembayaran Berhasil!"}
        </h2>
        <p className="text-gray-500 mb-8">
          {status === "pending" 
            ? "Terima kasih telah berbelanja. Silakan selesaikan pembayaran Anda."
            : "Terima kasih telah berbelanja di TAMIM SPAREPART. Pesanan Anda akan segera diproses."}
        </p>
        
        <div className="flex flex-col gap-3">
          {orderId && (
            <Button
              onClick={() => router.push(`/order-history/${orderId}`)}
              className="w-full flex items-center justify-center gap-2"
              size="lg"
            >
              <ShoppingBag className="w-4 h-4" />
              Lihat Status Pesanan
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            Kembali ke Beranda
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
