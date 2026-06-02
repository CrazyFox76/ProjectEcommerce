"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/types";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Dummy products for UI display when database is not connected
const DUMMY_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "LCD Samsung Galaxy A54",
    description: "LCD Original Samsung Galaxy A54 5G dengan frame. Super AMOLED 6.4 inch, resolusi FHD+. Kualitas terjamin, garansi 30 hari.",
    price: 450000,
    stock: 25,
    image_url: "",
    category: "LCD",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "LCD iPhone 13 OLED Original",
    description: "LCD iPhone 13 OLED Original Apple. Warna tajam, sentuhan responsif, True Tone display. Garansi 30 hari penggantian.",
    price: 850000,
    stock: 15,
    image_url: "",
    category: "LCD",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Baterai Samsung Galaxy S23",
    description: "Baterai original Samsung Galaxy S23 kapasitas 3900mAh. Li-Ion, tahan seharian penuh. Sudah termasuk adhesive tape.",
    price: 185000,
    stock: 40,
    image_url: "",
    category: "Baterai",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Baterai iPhone 14 Original",
    description: "Baterai iPhone 14 original Apple kapasitas 3279mAh. Battery health 100%, performa maksimal. Garansi 30 hari.",
    price: 275000,
    stock: 35,
    image_url: "",
    category: "Baterai",
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Charger Samsung 25W Fast Charging",
    description: "Charger Samsung 25W Super Fast Charging original. Konektor Type-C, compact design, aman untuk semua perangkat Samsung.",
    price: 95000,
    stock: 60,
    image_url: "",
    category: "Charger",
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    name: "Charger iPhone 20W USB-C",
    description: "Charger Apple 20W USB-C Power Adapter original. Mendukung fast charging iPhone 8 ke atas. Compact dan ringan.",
    price: 125000,
    stock: 45,
    image_url: "",
    category: "Charger",
    created_at: new Date().toISOString(),
  },
  {
    id: "7",
    name: "Kamera Belakang Samsung S24 50MP",
    description: "Modul kamera belakang Samsung Galaxy S24 50MP Wide + 12MP Ultra Wide + 10MP Telephoto. Original Samsung parts.",
    price: 550000,
    stock: 10,
    image_url: "",
    category: "Kamera",
    created_at: new Date().toISOString(),
  },
  {
    id: "8",
    name: "Flexibel Connector Samsung A34",
    description: "Flexibel connector port charging Samsung Galaxy A34 lengkap dengan microphone dan jack audio 3.5mm. Kualitas original.",
    price: 85000,
    stock: 55,
    image_url: "",
    category: "Flexibel",
    created_at: new Date().toISOString(),
  },
];

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("products")
          .select("*")
          .gt("stock", 0)
          .order("created_at", { ascending: false })
          .limit(8);

        if (data && data.length > 0) {
          setProducts(data);
        } else {
          // Fallback to dummy data
          setProducts(DUMMY_PRODUCTS);
        }
      } catch {
        // Database not available, use dummy data
        setProducts(DUMMY_PRODUCTS);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  return (
    <section className="py-16 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Produk Unggulan
            </h2>
            <p className="text-gray-500">Spare part terlaris dan terbaru</p>
          </div>
          <Link href="/catalog">
            <Button variant="ghost" className="hidden sm:flex">
              Lihat Semua
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <Link href="/catalog">
            <Button variant="outline">
              Lihat Semua Produk
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
