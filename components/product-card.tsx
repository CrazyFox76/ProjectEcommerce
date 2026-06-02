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
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-12 w-12 text-gray-300" />
            </div>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-md">
              Stok Terbatas
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg">
                Habis
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <span className="inline-block text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md mb-2">
            {product.category}
          </span>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-2 leading-relaxed">
            {product.description}
          </p>
        )}
        <p className="text-xs text-gray-500 mb-3">
          Stok: {product.stock} unit
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-lg font-bold text-primary-600">
            {formatCurrency(product.price)}
          </p>
          <Button
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              addItem(product.id);
            }}
            disabled={product.stock === 0}
            className="shrink-0"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
