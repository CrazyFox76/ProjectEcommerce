"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/context/cart-context";
import { formatCurrency, withTimeout } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import type { Product, ProductReview } from "@/types";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "sonner";
import {
  ShoppingCart,
  Minus,
  Plus,
  Package,
  ArrowLeft,
  Check,
  Loader2,
  Shield,
  Truck,
  RotateCcw,
  Star,
  Camera,
  Video,
  Trash2,
  User,
  Calendar,
  BadgeCheck,
  X,
  AlertCircle,
  Play
} from "lucide-react";

// Dummy products for when database is not available
const ALL_DUMMY_PRODUCTS: Product[] = [
  { id: "1", name: "LCD Samsung Galaxy A54", description: "LCD Original Samsung Galaxy A54 5G dengan frame. Super AMOLED 6.4 inch, resolusi FHD+ (2340 x 1080 pixel). Mendukung refresh rate 120Hz untuk tampilan halus dan responsif.\n\nKualitas original dengan warna akurat dan tingkat kecerahan tinggi. Sudah termasuk frame/bezel untuk pemasangan mudah. Layar dilindungi Corning Gorilla Glass 5.\n\n✅ Garansi 30 hari penggantian\n✅ Sudah diuji kualitas QC\n✅ Kompatibel: Samsung Galaxy A54 5G (SM-A546)\n✅ Termasuk adhesive tape pemasangan", price: 450000, stock: 25, image_url: "", category: "LCD", created_at: new Date().toISOString() },
  { id: "2", name: "LCD iPhone 13 OLED Original", description: "LCD iPhone 13 OLED Original Apple. Panel OLED Super Retina XDR 6.1 inch dengan resolusi 2532 x 1170 pixel. Mendukung HDR10, Dolby Vision, dan True Tone display.\n\nWarna tajam dengan kontras ratio 2.000.000:1. Sentuhan 3D Touch responsif dan akurat. Tingkat kecerahan hingga 1200 nits.\n\n✅ Garansi 30 hari penggantian\n✅ Face ID compatible\n✅ Kompatibel: iPhone 13 (A2633, A2631)\n✅ Termasuk tool kit pemasangan", price: 850000, stock: 15, image_url: "", category: "LCD", created_at: new Date().toISOString() },
  { id: "3", name: "LCD Xiaomi Redmi Note 12", description: "LCD Xiaomi Redmi Note 12 IPS fullset dengan touchscreen digitizer. Layar 6.67 inch AMOLED FHD+ (2400 x 1080). Refresh rate 120Hz, sampling rate 240Hz.\n\nKualitas display setara original dengan reproduksi warna akurat. Touchscreen responsif dan presisi tinggi.\n\n✅ Garansi 30 hari\n✅ Plug and play — langsung pasang\n✅ Kompatibel: Redmi Note 12 (22111317G)", price: 320000, stock: 30, image_url: "", category: "LCD", created_at: new Date().toISOString() },
  { id: "4", name: "LCD Oppo Reno 10 AMOLED", description: "LCD Oppo Reno 10 AMOLED fullset dengan frame. Panel AMOLED 6.7 inch FHD+ dengan 120Hz refresh rate. Warna vivid dan viewing angle luas.\n\nDilengkapi in-display fingerprint sensor support. Frame aluminium presisi tinggi untuk pemasangan sempurna.\n\n✅ Garansi 30 hari\n✅ Original quality\n✅ Kompatibel: Oppo Reno 10 5G (CPH2531)", price: 520000, stock: 20, image_url: "", category: "LCD", created_at: new Date().toISOString() },
  { id: "5", name: "Baterai Samsung Galaxy S23", description: "Baterai original Samsung Galaxy S23 kapasitas 3900mAh Li-Ion. Teknologi Adaptive Power Saving untuk efisiensi maksimal. Tahan seharian penuh dengan pemakaian normal.\n\nMendukung fast charging 25W, wireless charging 15W, dan reverse wireless charging 4.5W.\n\n✅ Garansi 30 hari\n✅ Battery health 100%\n✅ Sudah termasuk adhesive tape\n✅ Kompatibel: Samsung Galaxy S23 (SM-S911)", price: 185000, stock: 40, image_url: "", category: "Baterai", created_at: new Date().toISOString() },
  { id: "6", name: "Baterai iPhone 14 Original", description: "Baterai iPhone 14 original Apple kapasitas 3279mAh Lithium-Ion. Battery health 100%, performa optimal tanpa throttling.\n\nMendukung fast charging 20W (0-50% dalam 30 menit), MagSafe wireless charging 15W, dan Qi wireless charging 7.5W.\n\n✅ Garansi 30 hari\n✅ Kapasitas penuh, belum pernah dipakai\n✅ Kompatibel: iPhone 14 (A2649, A2881)\n✅ Termasuk waterproof seal", price: 275000, stock: 35, image_url: "", category: "Baterai", created_at: new Date().toISOString() },
  { id: "7", name: "Baterai Xiaomi Poco F5", description: "Baterai Xiaomi Poco F5 original kapasitas 5000mAh Li-Po. Baterai besar untuk penggunaan berat dan gaming marathon.\n\nMendukung Turbo Charge 67W — pengisian penuh hanya 52 menit. Siklus charge 800+ kali.\n\n✅ Garansi 30 hari\n✅ Kapasitas penuh\n✅ Kompatibel: Poco F5 (23049PCD8G)", price: 150000, stock: 50, image_url: "", category: "Baterai", created_at: new Date().toISOString() },
  { id: "8", name: "Charger Samsung 25W Fast Charging", description: "Charger Samsung 25W Super Fast Charging original EP-TA800. Konektor USB Type-C, compact design.\n\nTeknologi AFC (Adaptive Fast Charging) dan PD 3.0 untuk pengisian optimal. Kompatibel dengan semua perangkat Samsung Galaxy S/A/M/Note series.\n\n✅ Garansi 30 hari\n✅ Sertifikasi keamanan lengkap\n✅ Over-voltage & over-current protection\n✅ Termasuk kabel Type-C 1m", price: 95000, stock: 60, image_url: "", category: "Charger", created_at: new Date().toISOString() },
  { id: "9", name: "Charger iPhone 20W USB-C", description: "Apple 20W USB-C Power Adapter original A2305. Mendukung fast charging untuk iPhone 8 ke atas — 0-50% dalam 30 menit.\n\nDesign compact dan ringan, ideal untuk travel. PD (Power Delivery) technology untuk pengisian cerdas.\n\n✅ Garansi 30 hari\n✅ Apple certified\n✅ Kompatibel: semua iPhone & iPad dengan Lightning/USB-C\n✅ Kabel dijual terpisah", price: 125000, stock: 45, image_url: "", category: "Charger", created_at: new Date().toISOString() },
  { id: "10", name: "Charger Xiaomi 67W Turbo", description: "Charger Xiaomi 67W Turbo Charge original MDY-12-EH. Isi penuh baterai 5000mAh dalam 38 menit saja.\n\nTeknologi pengisian cerdas dengan proteksi multi-layer: over-voltage, over-current, over-temperature, dan short-circuit protection.\n\n✅ Garansi 30 hari\n✅ Termasuk kabel USB-A to USB-C 1m\n✅ Kompatibel: Xiaomi/Redmi/Poco series\n✅ Support QC 3.0, PD 3.0, dan Turbo Charge", price: 135000, stock: 30, image_url: "", category: "Charger", created_at: new Date().toISOString() },
  { id: "11", name: "Kamera Belakang Samsung S24 50MP", description: "Modul kamera belakang Samsung Galaxy S24 lengkap: 50MP Wide (f/1.8, OIS) + 12MP Ultra Wide (f/2.2) + 10MP Telephoto (f/2.4, 3x optical zoom).\n\nSensor ISOCELL GN3 untuk foto detail dan low-light superior. Mendukung 8K video recording, Night Mode, dan Space Zoom.\n\n✅ Garansi 30 hari\n✅ Komponen original Samsung\n✅ Kompatibel: Samsung Galaxy S24 (SM-S921)\n✅ Sudah dikalibrasi", price: 550000, stock: 10, image_url: "", category: "Kamera", created_at: new Date().toISOString() },
  { id: "12", name: "Kamera Depan iPhone 15", description: "Kamera depan iPhone 15 TrueDepth Camera System: 12MP (f/1.9) dengan autofocus. Termasuk Face ID module lengkap — IR camera, dot projector, dan flood illuminator.\n\nMendukung Smart HDR 5, Deep Fusion, Cinematic Mode 4K, dan Photonic Engine.\n\n✅ Garansi 30 hari\n✅ Face ID berfungsi sempurna\n✅ Kompatibel: iPhone 15 (A2846, A3089)\n✅ Termasuk sensor proximity & ambient light", price: 420000, stock: 12, image_url: "", category: "Kamera", created_at: new Date().toISOString() },
  { id: "13", name: "Flexibel Connector Samsung A34", description: "Flexibel connector port charging Samsung Galaxy A34 lengkap dengan microphone utama dan jack audio 3.5mm.\n\nKonektor USB Type-C, mendukung fast charging 25W dan data transfer. Kualitas flexibel premium, tidak mudah putus.\n\n✅ Garansi 30 hari\n✅ Kualitas original\n✅ Kompatibel: Samsung Galaxy A34 5G (SM-A346)\n✅ Pemasangan mudah, plug and play", price: 85000, stock: 55, image_url: "", category: "Flexibel", created_at: new Date().toISOString() },
  { id: "14", name: "Flexibel iPhone 12 Volume", description: "Flexibel tombol volume dan silent/ring switch iPhone 12. Termasuk flash LED mount dan koneksi mikrofon atas.\n\nKabel flex berkualitas tinggi dengan durabilitas terjamin. Mengatasi masalah tombol volume macet, tidak responsif, atau switch mute tidak berfungsi.\n\n✅ Garansi 30 hari\n✅ Komponen original Apple\n✅ Kompatibel: iPhone 12 (A2172, A2402)\n✅ Termasuk bracket pemasangan", price: 110000, stock: 40, image_url: "", category: "Flexibel", created_at: new Date().toISOString() },
  { id: "15", name: "IC Power Qualcomm PM8150", description: "IC Power Management Qualcomm PM8150. PMIC utama untuk regulasi daya dan distribusi voltase pada chipset Snapdragon 855/855+.\n\nMengatasi masalah: HP mati total, restart sendiri, baterai boros tidak wajar, dan charging tidak masuk.\n\n✅ Garansi 14 hari (IC)\n✅ Komponen original\n✅ Kompatibel: Samsung S10/S10+/Note 10, OnePlus 7/7 Pro, dll\n✅ Butuh teknisi berpengalaman untuk pemasangan", price: 195000, stock: 20, image_url: "", category: "IC", created_at: new Date().toISOString() },
  { id: "16", name: "IC Audio iPhone 13", description: "IC Audio codec U1201 untuk iPhone 13/13 Pro series. Bertanggung jawab atas pemrosesan sinyal audio input dan output.\n\nMengatasi masalah: speaker tidak bersuara, microphone mati, audio garuk/noise, dan panggilan telepon tidak terdengar.\n\n✅ Garansi 14 hari (IC)\n✅ Komponen original Apple\n✅ Kompatibel: iPhone 13 / iPhone 13 Pro (semua varian)\n✅ Pemasangan memerlukan micro-soldering", price: 165000, stock: 18, image_url: "", category: "IC", created_at: new Date().toISOString() },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Auth context
  const { user, isLoggedIn } = useAuth();

  // Reviews states
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  // Review Form states
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Lightbox state
  const [lightbox, setLightbox] = useState<{
    isOpen: boolean;
    url: string;
    type: "image" | "video";
  }>({
    isOpen: false,
    url: "",
    type: "image",
  });

  const openLightbox = (url: string, type: "image" | "video") => {
    setLightbox({ isOpen: true, url, type });
  };

  const fetchReviewsAndStatus = async () => {
    if (!params.id) return;
    try {
      const supabase = createClient();
      
      // 1. Fetch reviews joined with users
      const { data: reviewsData, error: reviewsError } = await withTimeout(
        supabase
          .from("product_reviews")
          .select("*, user:users(name, email)")
          .eq("product_id", params.id)
          .order("created_at", { ascending: false }),
        10000
      );

      if (!reviewsError && reviewsData) {
        setReviews(reviewsData as ProductReview[]);
        
        // Calculate average rating
        if (reviewsData.length > 0) {
          const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
          setAverageRating(Math.round((sum / reviewsData.length) * 10) / 10);
        } else {
          setAverageRating(0);
        }
      }

      // 2. Check if logged-in user has purchased
      if (user) {
        const { data: orderItems, error: orderError } = await withTimeout(
          supabase
            .from("order_items")
            .select("id, order:orders!inner(user_id, status)")
            .eq("product_id", params.id)
            .eq("order.user_id", user.id)
            .eq("order.status", "completed"),
          10000
        );

        const purchased = !!(!orderError && orderItems && orderItems.length > 0);
        setHasPurchased(purchased);

        if (purchased) {
          // Check if user already reviewed
          const { data: existingReview } = await withTimeout(
            supabase
              .from("product_reviews")
              .select("id")
              .eq("product_id", params.id)
              .eq("user_id", user.id)
              .maybeSingle(),
            10000
          );

          setHasReviewed(!!existingReview);
        }
      }
    } catch (err) {
      console.error("Error fetching reviews and status:", err);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const supabase = createClient();
        const { data } = await withTimeout(
          supabase
            .from("products")
            .select("*")
            .eq("id", params.id)
            .single(),
          10000
        );

        if (data) {
          setProduct(data);
          // Fetch related products
          const { data: relatedData } = await withTimeout(
            supabase
              .from("products")
              .select("*")
              .eq("category", data.category)
              .neq("id", data.id)
              .limit(4),
            10000
          );
          if (relatedData) setRelated(relatedData);
        } else {
          // Fallback to dummy data
          loadDummy();
        }
      } catch {
        // Database not available, use dummy
        loadDummy();
      }
      setLoading(false);
    };

    const loadDummy = () => {
      const found = ALL_DUMMY_PRODUCTS.find((p) => p.id === params.id);
      if (found) {
        setProduct(found);
        setRelated(
          ALL_DUMMY_PRODUCTS.filter(
            (p) => p.category === found.category && p.id !== found.id
          ).slice(0, 4)
        );
      }
    };

    fetchProduct();
    fetchReviewsAndStatus();
  }, [params.id, user]);
  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Berikan rating bintang terlebih dahulu");
      return;
    }
    if (!comment.trim()) {
      toast.error("Tulis ulasan terlebih dahulu");
      return;
    }

    setSubmittingReview(true);
    try {
      const supabase = createClient();

      const { error: dbError } = await supabase
        .from("product_reviews")
        .insert({
          product_id: params.id,
          user_id: user!.id,
          rating,
          comment: comment.trim(),
          media_urls: [],
        });

      if (dbError) {
        throw dbError;
      }

      toast.success("Ulasan Anda berhasil dikirim! Terima kasih 🎉");

      setRating(0);
      setComment("");

      await fetchReviewsAndStatus();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal mengirimkan ulasan");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    await addItem(product.id, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const [buying, setBuying] = useState(false);

  const handleBuyNow = async () => {
    if (!product) return;
    setBuying(true);
    await addItem(product.id, quantity);
    router.push("/checkout");
  };


  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Produk tidak ditemukan
          </h2>
          <Link href="/catalog">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Katalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/catalog" className="hover:text-primary-600 transition-colors">
          Katalog
        </Link>
        <span>/</span>
        <Link
          href={`/catalog?category=${product.category}`}
          className="hover:text-primary-600 transition-colors"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{product.name}</span>
      </nav>

      {/* Product Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Package className="h-24 w-24 text-gray-300" />
              <span className="text-sm text-gray-400">Gambar produk</span>
            </div>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
              Stok Terbatas
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="default">{product.category}</Badge>
            <div className="flex items-center gap-1 text-amber-500">
              {averageRating > 0 ? (
                <>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(averageRating)
                            ? "fill-current text-amber-500"
                            : "text-gray-300 fill-none"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-1">
                    {averageRating.toFixed(1)} ({reviews.length} ulasan)
                  </span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-gray-300 fill-none" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-1">Belum ada ulasan</span>
                </>
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          <p className="text-3xl font-extrabold text-primary-600 mb-4">
            {formatCurrency(product.price)}
          </p>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl">
              <Shield className="h-5 w-5 text-emerald-600" />
              <span className="text-xs text-gray-600 text-center font-medium">Garansi Resmi</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl">
              <Truck className="h-5 w-5 text-blue-600" />
              <span className="text-xs text-gray-600 text-center font-medium">Pengiriman Cepat</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl">
              <RotateCcw className="h-5 w-5 text-purple-600" />
              <span className="text-xs text-gray-600 text-center font-medium">Bisa Retur</span>
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-3 mb-6">
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full ${
                product.stock > 5
                  ? "bg-emerald-50 text-emerald-700"
                  : product.stock > 0
                  ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  product.stock > 5
                    ? "bg-emerald-500"
                    : product.stock > 0
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
              />
              {product.stock > 0
                ? `Stok: ${product.stock} unit`
                : "Stok Habis"}
            </span>
          </div>

          {/* Description */}
          <div className="border-t border-gray-200 py-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Deskripsi Produk
            </h3>
            <div className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
              {product.description || "Tidak ada deskripsi tersedia."}
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="border-t border-gray-200 pt-6 mt-auto">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-medium text-gray-700">Jumlah:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-50 transition-colors cursor-pointer"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 text-sm font-medium min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="p-2 hover:bg-gray-50 transition-colors cursor-pointer"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm text-gray-400">
                Subtotal: <b className="text-gray-700">{formatCurrency(product.price * quantity)}</b>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0 || added}
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" />
                    Ditambahkan!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    + Keranjang
                  </>
                )}
              </Button>
              <Button
                size="lg"
                className="flex-1 font-semibold"
                onClick={handleBuyNow}
                disabled={product.stock === 0 || buying}
                loading={buying}
              >
                Beli Sekarang
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Ulasan Pelanggan Section */}
      <section className="mt-16 border-t border-gray-200 pt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
          Ulasan Pelanggan
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ringkasan Rating */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col justify-center items-center text-center h-fit">
            <p className="text-sm font-medium text-gray-500">Rata-rata Rating</p>
            <p className="text-5xl font-extrabold text-gray-900 mt-2">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </p>
            <div className="flex items-center gap-1 mt-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? "text-amber-500 fill-amber-500"
                      : "text-gray-300 fill-none"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Berdasarkan {reviews.length} ulasan pelanggan
            </p>
          </div>

          {/* List Ulasan & Form Input */}
          <div className="lg:col-span-2 space-y-8">
            {/* Form Input Ulasan */}
            {isLoggedIn && hasPurchased && !hasReviewed && (
              <div className="bg-white border border-primary-100 rounded-2xl p-6 shadow-sm shadow-primary-500/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 to-blue-500" />
                
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-emerald-500" />
                  Bagikan Ulasan Anda (Pembeli Terverifikasi)
                </h3>

                <div className="space-y-4">
                  {/* Rating Bintang */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Berikan Rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="cursor-pointer transition-transform duration-150 hover:scale-110 focus:outline-none"
                        >
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              star <= (hoverRating || rating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-200 fill-none stroke-[1.5]"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Komentar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tulis Ulasan Anda <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Bagaimana kualitas produk? Apakah sesuai dengan deskripsi? Berikan tanggapan jujur Anda..."
                      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm transition-all focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 placeholder:text-gray-400 resize-none"
                    />
                  </div>


                  <Button
                    onClick={handleSubmitReview}
                    loading={submittingReview}
                    disabled={rating === 0 || !comment.trim()}
                    className="w-full sm:w-auto font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-primary-500/10"
                  >
                    Kirim Ulasan
                  </Button>
                </div>
              </div>
            )}

            {/* List Ulasan */}
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((rev) => {
                  const initialName = rev.user?.name
                    ? rev.user.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()
                    : "U";

                  return (
                    <div key={rev.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm shrink-0 border border-primary-200">
                            {initialName}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {rev.user?.name || "Pelanggan"}
                              </h4>
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 shrink-0">
                                <BadgeCheck className="h-3 w-3" />
                                Terverifikasi
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                              {new Date(rev.created_at).toLocaleDateString("id-ID", {
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 text-amber-400 shrink-0 bg-amber-50/50 px-2 py-1 rounded-lg border border-amber-100">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          <span className="text-xs font-bold text-amber-700">{rev.rating}.0</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 leading-relaxed font-normal">
                        {rev.comment}
                      </p>

                      {rev.media_urls && rev.media_urls.length > 0 && (
                        <div className="flex flex-wrap gap-2.5 pt-1">
                          {rev.media_urls.map((url, index) => {
                            const isVideo = url.toLowerCase().match(/\.(mp4|webm|ogg|mov)$/) || url.includes("video");
                            return (
                              <div
                                key={index}
                                onClick={() => openLightbox(url, isVideo ? "video" : "image")}
                                className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-100 cursor-zoom-in hover:scale-[1.02] hover:brightness-95 transition-all shadow-sm bg-gray-50 grow-0 shrink-0"
                              >
                                {isVideo ? (
                                  <div className="relative w-full h-full flex items-center justify-center">
                                    <video src={url} className="w-full h-full object-cover pointer-events-none" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                                      <Play className="h-6 w-6 text-white fill-white shrink-0" />
                                    </div>
                                  </div>
                                ) : (
                                  <img
                                    src={url}
                                    alt="Ulasan produk"
                                    className="w-full h-full object-cover pointer-events-none"
                                  />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3">
                  <Star className="h-10 w-10 text-gray-300" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">Belum Ada Ulasan</h4>
                    <p className="text-xs text-gray-400 mt-1">Jadilah pembeli pertama yang membagikan ulasan!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Produk Terkait
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      {lightbox.isOpen && (
        <div
          onClick={() => setLightbox({ isOpen: false, url: "", type: "image" })}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md cursor-zoom-out select-none transition-all duration-300"
        >
          <button
            onClick={() => setLightbox({ isOpen: false, url: "", type: "image" })}
            className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative max-w-5xl w-full max-h-[85vh] p-4 flex items-center justify-center cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.type === "video" ? (
              <video
                src={lightbox.url}
                controls
                autoPlay
                className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain border border-white/15"
              />
            ) : (
              <img
                src={lightbox.url}
                alt="Pratinjau ulasan produk"
                className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain border border-white/15 animate-in zoom-in-95 duration-200"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
