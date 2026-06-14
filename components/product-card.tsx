"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/context/cart-context";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart, Package } from "lucide-react";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-900/5 transition-all duration-500 hover:-translate-y-2 flex flex-col">
      <Link href={`/product/${product.id}`} className="block relative">
        <div className="relative aspect-square overflow-hidden bg-gray-50/50">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-10 w-10 text-gray-200 stroke-[1.5]" />
            </div>
          )}
          
          {/* Elegant Overlays */}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-900 text-[10px] uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full shadow-sm">
              Stok Terbatas
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center transition-all">
              <span className="bg-gray-900 text-white text-xs uppercase tracking-widest font-medium px-4 py-2 rounded-full shadow-lg">
                Habis
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        <Link href={`/product/${product.id}`}>
          <span className="inline-block text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-3">
            {product.category}
          </span>
          <h3 className="font-semibold text-gray-900 text-sm md:text-base line-clamp-2 mb-2 group-hover:text-gray-600 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto pt-4 flex items-end justify-between gap-2">
          <div>
            <p className="text-xs text-gray-400 mb-1">
              Stok: {product.stock}
            </p>
            <p className="text-base font-bold text-gray-900 tracking-tight">
              {formatCurrency(product.price)}
            </p>
          </div>
          
          <Button
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              addItem(product.id);
            }}
            disabled={product.stock === 0}
            className="shrink-0 h-10 w-10 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-600/20 transition-transform active:scale-95"
            aria-label="Tambah ke keranjang"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
