"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/context/auth-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Order, OrderItem, Product, OrderReview } from "@/types";
import Image from "next/image";
import { toast } from "sonner";
import {
  ArrowLeft,
  Package,
  Clock,
  Loader2,
  CreditCard,
  Truck,
  CircleCheckBig,
  MapPin,
  Star,
  Send,
  Receipt,
  Hourglass,
  Wallet,
  Banknote,
  QrCode,
  Smartphone,
  PackageCheck,
} from "lucide-react";

// ─── Status Config ───────────────────────────────────────────────
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

// ─── Payment Type Mapping ────────────────────────────────────────
function getPaymentLabel(paymentType?: string | null, paymentMethod?: string | null) {
  // Jika payment_type sudah diisi (dari Midtrans callback/webhook), tampilkan detail spesifik
  if (paymentType) {
    const map: Record<string, { label: string; icon: typeof Wallet }> = {
      bank_transfer: { label: "Transfer Bank (VA)", icon: Banknote },
      echannel: { label: "Mandiri Bill", icon: Banknote },
      bca_va: { label: "BCA Virtual Account", icon: Banknote },
      bni_va: { label: "BNI Virtual Account", icon: Banknote },
      bri_va: { label: "BRI Virtual Account", icon: Banknote },
      permata_va: { label: "Permata Virtual Account", icon: Banknote },
      gopay: { label: "GoPay", icon: Smartphone },
      shopeepay: { label: "ShopeePay", icon: Smartphone },
      qris: { label: "QRIS", icon: QrCode },
      credit_card: { label: "Kartu Kredit/Debit", icon: CreditCard },
      cstore: { label: "Convenience Store", icon: Wallet },
      akulaku: { label: "Akulaku", icon: Wallet },
    };
    return map[paymentType] || { label: paymentType, icon: Wallet };
  }

  // Fallback: gunakan payment_method yang disimpan saat checkout
  if (paymentMethod) {
    if (paymentMethod.includes("QRIS") || paymentMethod.includes("E-Wallet")) {
      return { label: paymentMethod, icon: QrCode };
    }
    if (paymentMethod.includes("Kredit") || paymentMethod.includes("Debit")) {
      return { label: paymentMethod, icon: CreditCard };
    }
    if (paymentMethod.includes("Transfer") || paymentMethod.includes("VA")) {
      return { label: paymentMethod, icon: Banknote };
    }
    return { label: paymentMethod, icon: Wallet };
  }

  return { label: "Belum dipilih", icon: Wallet };
}

// ─── Status Tracker Steps ────────────────────────────────────────
const statusSteps = [
  { key: "paid", label: "Dibayar", icon: CreditCard, desc: "Pembayaran diterima" },
  { key: "preparing", label: "Disiapkan", icon: PackageCheck, desc: "Pesanan sedang diproses" },
  { key: "shipped", label: "Dikirim", icon: Truck, desc: "Pesanan sedang dikirim" },
  { key: "completed", label: "Diterima", icon: CircleCheckBig, desc: "Pesanan selesai" },
];

function getStepState(orderStatus: string, stepKey: string) {
  const order = ["pending", "paid", "preparing", "shipped", "completed"];
  const orderIdx = order.indexOf(orderStatus);
  const stepIdx = order.indexOf(stepKey);
  if (orderIdx >= stepIdx) return "completed";
  if (orderIdx === stepIdx - 1) return "current";
  return "upcoming";
}

// ─── Status Tracker Component ────────────────────────────────────
function StatusTrackerDetail({ status }: { status: string }) {
  if (status === "pending" || status === "failed") {
    return (
      <div className="flex items-center gap-3 py-4 px-5 rounded-xl bg-amber-50 border border-amber-200">
        <Hourglass className="h-5 w-5 text-amber-500 animate-pulse" />
        <div>
          <p className="text-sm font-semibold text-amber-800">
            {status === "pending" ? "Menunggu Pembayaran" : "Pembayaran Gagal"}
          </p>
          <p className="text-xs text-amber-600 mt-0.5">
            {status === "pending"
              ? "Silakan selesaikan pembayaran Anda"
              : "Transaksi tidak berhasil diproses"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {statusSteps.map((step, idx) => {
        const state = getStepState(status, step.key);
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex gap-3">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                  state === "completed"
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                    : state === "current"
                    ? "bg-primary-500 text-white shadow-md shadow-primary-500/25 animate-pulse"
                    : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              {idx < statusSteps.length - 1 && (
                <div
                  className={`w-0.5 flex-1 min-h-[32px] transition-all duration-300 ${
                    getStepState(status, statusSteps[idx + 1].key) !== "upcoming"
                      ? "bg-emerald-400"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="pb-6">
              <p
                className={`text-sm font-semibold ${
                  state === "completed"
                    ? "text-emerald-700"
                    : state === "current"
                    ? "text-primary-700"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
              <p
                className={`text-xs mt-0.5 ${
                  state !== "upcoming" ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {step.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Star Rating Component ───────────────────────────────────────
function StarRating({
  rating,
  onRate,
  readonly = false,
}: {
  rating: number;
  onRate?: (r: number) => void;
  readonly?: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-all duration-200 ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-125"
          }`}
        >
          <Star
            className={`h-7 w-7 transition-colors duration-200 ${
              star <= (hovered || rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Main Page Component ─────────────────────────────────────────
type OrderWithItems = Order & {
  order_items: (OrderItem & { product: Product })[];
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [review, setReview] = useState<OrderReview | null>(null);
  const [loading, setLoading] = useState(true);

  // Review form state
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const orderId = params.id as string;

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !orderId) return;
      const supabase = createClient();

      // Fetch order with items
      const { data: orderData } = await supabase
        .from("orders")
        .select("*, order_items(*, product:products(*))")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .single();

      if (orderData) {
        setOrder(orderData as OrderWithItems);
      }

      // Fetch existing review
      const { data: reviewData } = await supabase
        .from("order_reviews")
        .select("*")
        .eq("order_id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (reviewData) {
        setReview(reviewData as OrderReview);
        setRating(reviewData.rating);
        setNote(reviewData.note || "");
      }

      setLoading(false);
    };

    fetchOrder();
  }, [user, orderId]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Pilih rating bintang terlebih dahulu");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from("order_reviews")
      .insert({
        order_id: orderId,
        user_id: user!.id,
        rating,
        note: note.trim(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        toast.error("Kamu sudah memberikan review untuk pesanan ini");
      } else {
        toast.error("Gagal mengirim review");
        console.error(error);
      }
    } else {
      toast.success("Review berhasil dikirim! Terima kasih 🎉");
      setReview(data as OrderReview);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Pesanan Tidak Ditemukan
          </h2>
          <Button onClick={() => router.push("/order-history")}>
            Kembali ke Riwayat
          </Button>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const payment = getPaymentLabel(order.payment_type, order.payment_method);
  const PaymentIcon = payment.icon;

  // Calculate breakdown
  const subtotal = order.order_items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const ppn = Math.round(subtotal * 0.11);
  const adminFee = 1000;
  const totalDisplay = subtotal + ppn + adminFee;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back button */}
      <button
        onClick={() => router.push("/order-history")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Kembali ke Riwayat Pesanan
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 animate-fade-in">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Detail Pesanan</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
            <span className="font-mono font-semibold">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(order.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Tracker */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 animate-fade-in">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary-600" />
              Status Pesanan
            </h2>
            <StatusTrackerDetail status={order.status} />
          </div>

          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 animate-fade-in stagger-1">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-primary-600" />
              Detail Produk
            </h2>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0"
                >
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {item.product?.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Package className="h-5 w-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product?.name || "Produk dihapus"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Rating & Review (only for completed orders) */}
          {order.status === "completed" && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 animate-fade-in stagger-2">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Bagaimana Pengalamanmu?
              </h2>

              {review ? (
                /* Already reviewed — show read-only */
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <StarRating rating={review.rating} readonly />
                    <span className="text-sm font-semibold text-gray-700">
                      {review.rating}/5
                    </span>
                  </div>
                  {review.note && (
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                        Catatan untuk penjual
                      </p>
                      <p className="text-sm text-gray-700">{review.note}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400">
                    Dikirim pada {formatDate(review.created_at)}
                  </p>
                </div>
              ) : (
                /* Review form */
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Beri rating untuk pesananmu
                    </p>
                    <StarRating rating={rating} onRate={setRating} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Catatan untuk Penjual{" "}
                      <span className="text-gray-400 font-normal">(opsional)</span>
                    </label>
                    <textarea
                      placeholder="Tulis pengalamanmu, misal: packing rapi, pengiriman cepat..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                    />
                  </div>
                  <Button
                    onClick={handleSubmitReview}
                    loading={submitting}
                    disabled={rating === 0}
                    className="w-full sm:w-auto"
                  >
                    <Send className="h-4 w-4" />
                    Kirim Review
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column — Payment & Address summary */}
        <div className="space-y-6">
          {/* Payment Method */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 animate-fade-in stagger-1">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary-600" />
              Metode Pembayaran
            </h2>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                <PaymentIcon className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {payment.label}
                </p>
                {order.transaction_id && (
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5 break-all">
                    ID: {order.transaction_id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 animate-fade-in stagger-2">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-primary-600" />
              Rincian Pembayaran
            </h2>
            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Subtotal ({order.order_items.length} produk)
                </span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">PPN (11%)</span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(ppn)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Biaya Admin</span>
                <span className="font-medium text-gray-800">
                  {formatCurrency(adminFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ongkos Kirim</span>
                <span className="text-emerald-600 font-medium">Gratis</span>
              </div>
              <div className="border-t border-gray-200 pt-2.5 mt-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">
                    Total Pembayaran
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(totalDisplay)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 animate-fade-in stagger-3">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary-600" />
              Alamat Pengiriman
            </h2>
            <div className="bg-gray-50 rounded-lg border border-gray-100 p-3">
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {order.shipping_address || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
