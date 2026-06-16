"use client";

import { useEffect, useState, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Product, Category } from "@/types";
import { CATEGORIES } from "@/types";
import { Search, SlidersHorizontal, X, Loader2, Package } from "lucide-react";

const DUMMY_PRODUCTS: Product[] = [
  { id: "1", name: "LCD Samsung Galaxy A54", description: "LCD Original Samsung Galaxy A54 5G dengan frame. Super AMOLED 6.4 inch, resolusi FHD+. Garansi 30 hari.", price: 450000, stock: 25, image_url: "", category: "LCD", created_at: new Date().toISOString() },
  { id: "2", name: "LCD iPhone 13 OLED Original", description: "LCD iPhone 13 OLED Original Apple. Warna tajam, True Tone display, sentuhan responsif. Garansi penggantian.", price: 850000, stock: 15, image_url: "", category: "LCD", created_at: new Date().toISOString() },
  { id: "3", name: "LCD Xiaomi Redmi Note 12", description: "LCD Xiaomi Redmi Note 12 IPS fullset dengan touchscreen. Resolusi FHD+ 6.67 inch. Plug and play.", price: 320000, stock: 30, image_url: "", category: "LCD", created_at: new Date().toISOString() },
  { id: "4", name: "LCD Oppo Reno 10 AMOLED", description: "LCD Oppo Reno 10 AMOLED fullset dengan frame. Warna vivid, 120Hz refresh rate. Original quality.", price: 520000, stock: 20, image_url: "", category: "LCD", created_at: new Date().toISOString() },
  { id: "5", name: "Baterai Samsung Galaxy S23", description: "Baterai original Samsung Galaxy S23 kapasitas 3900mAh Li-Ion. Tahan seharian, sudah termasuk adhesive tape.", price: 185000, stock: 40, image_url: "", category: "Baterai", created_at: new Date().toISOString() },
  { id: "6", name: "Baterai iPhone 14 Original", description: "Baterai iPhone 14 original Apple 3279mAh. Battery health 100%, performa optimal. Garansi 30 hari.", price: 275000, stock: 35, image_url: "", category: "Baterai", created_at: new Date().toISOString() },
  { id: "7", name: "Baterai Xiaomi Poco F5", description: "Baterai Xiaomi Poco F5 original 5000mAh. Mendukung fast charging 67W, tahan lama untuk gaming.", price: 150000, stock: 50, image_url: "", category: "Baterai", created_at: new Date().toISOString() },
  { id: "8", name: "Charger Samsung 25W", description: "Charger Samsung 25W Super Fast Charging original Type-C. Compact design, kompatibel semua Samsung.", price: 95000, stock: 60, image_url: "", category: "Charger", created_at: new Date().toISOString() },
  { id: "9", name: "Charger iPhone 20W USB-C", description: "Apple 20W USB-C Power Adapter original. Fast charging untuk iPhone 8 ke atas. Compact dan ringan.", price: 125000, stock: 45, image_url: "", category: "Charger", created_at: new Date().toISOString() },
  { id: "10", name: "Charger Xiaomi 67W Turbo", description: "Charger Xiaomi 67W Turbo Charge original. Isi penuh dalam 38 menit, teknologi pengisian cerdas.", price: 135000, stock: 30, image_url: "", category: "Charger", created_at: new Date().toISOString() },
  { id: "11", name: "Kamera Belakang Samsung S24", description: "Modul kamera Samsung Galaxy S24: 50MP Wide + 12MP Ultra Wide + 10MP Telephoto. Komponen original.", price: 550000, stock: 10, image_url: "", category: "Kamera", created_at: new Date().toISOString() },
  { id: "12", name: "Kamera Depan iPhone 15", description: "Kamera depan iPhone 15 TrueDepth 12MP termasuk Face ID module, autofocus, dan sensor proximity.", price: 420000, stock: 12, image_url: "", category: "Kamera", created_at: new Date().toISOString() },
  { id: "13", name: "Flexibel Samsung Galaxy A34", description: "Flexibel connector port charging Samsung A34 lengkap dengan microphone dan jack audio 3.5mm.", price: 85000, stock: 55, image_url: "", category: "Flexibel", created_at: new Date().toISOString() },
  { id: "14", name: "Flexibel iPhone 12 Volume", description: "Flexibel tombol volume dan silent mode iPhone 12. Termasuk flash LED mount. Komponen original Apple.", price: 110000, stock: 40, image_url: "", category: "Flexibel", created_at: new Date().toISOString() },
  { id: "15", name: "IC Power Qualcomm PM8150", description: "IC Power Management Qualcomm PM8150 untuk Android flagship. Cocok untuk Samsung S10/Note 10 series.", price: 195000, stock: 20, image_url: "", category: "IC", created_at: new Date().toISOString() },
  { id: "16", name: "IC Audio iPhone 13", description: "IC Audio codec iPhone 13/13 Pro series. Mengatasi masalah speaker, mic, dan audio tidak berfungsi.", price: 165000, stock: 18, image_url: "", category: "IC", created_at: new Date().toISOString() },
];

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") as Category | null;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "">(initialCategory || "");
  const [sortBy, setSortBy] = useState<"newest" | "price-asc" | "price-desc">("newest");
  const [usingDummy, setUsingDummy] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const supabase = createClient();
      let query = supabase.from("products").select("*", { count: "exact" });

      if (search) query = query.ilike("name", `%${search}%`);
      if (category) query = query.eq("category", category);

      if (sortBy === "price-asc") query = query.order("price", { ascending: true });
      else if (sortBy === "price-desc") query = query.order("price", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), 3000));
      const result = (await Promise.race([query, timeoutPromise])) as {
        data?: any[];
        timeout?: boolean;
      };

      if (result.timeout) {
        setProducts(DUMMY_PRODUCTS);
        setUsingDummy(true);
        setLoading(false);
        return;
      }

      const data = result.data;

      if (data && data.length > 0) {
        setProducts(data);
        setUsingDummy(false);
      } else {
        setProducts(DUMMY_PRODUCTS);
        setUsingDummy(true);
      }
    } catch {
      setProducts(DUMMY_PRODUCTS);
      setUsingDummy(true);
    } finally {
      setLoading(false);
    }
  }, [search, category, sortBy]);

  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, [fetchProducts]);

  // Client-side filter for dummy data
  const filteredProducts = useMemo(() => {
    if (!usingDummy) return products;
    let result = [...DUMMY_PRODUCTS];
    if (search) {
      result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    if (category) {
      result = result.filter((p) => p.category === category);
    }
    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }
    return result;
  }, [products, usingDummy, search, category, sortBy]);

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Katalog Produk
        </h1>
        <p className="text-gray-500">Temukan spare part HP yang kamu butuhkan</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter & Pencarian</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category | "")}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">Semua Kategori</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="newest">Terbaru</option>
            <option value="price-asc">Harga: Rendah ke Tinggi</option>
            <option value="price-desc">Harga: Tinggi ke Rendah</option>
          </select>
        </div>

        {(search || category) && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {category && (
              <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full">
                {category}
                <button onClick={() => setCategory("")} className="cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {search && (
              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                &ldquo;{search}&rdquo;
                <button onClick={() => setSearch("")} className="cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Produk tidak ditemukan
          </h3>
          <p className="text-gray-500 mb-6">
            Coba ubah kata kunci pencarian atau filter kategori
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("");
              setCategory("");
            }}
          >
            Reset Filter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}

export default function CatalogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      }>
        <CatalogContent />
      </Suspense>
    </div>
  );
}
