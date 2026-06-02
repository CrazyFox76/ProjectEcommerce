"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./auth-context";
import type { CartItem, Product } from "@/types";
import { toast } from "sonner";

interface CartItemWithProduct {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

interface CartContextType {
  items: CartItemWithProduct[];
  loading: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  loading: true,
  addItem: async () => {},
  removeItem: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  totalItems: 0,
  totalPrice: 0,
});

// Local storage key
const CART_KEY = "tamim_cart";

// Load cart from localStorage
function loadLocalCart(): CartItemWithProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save cart to localStorage
function saveLocalCart(items: CartItemWithProduct[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

// All dummy products for local cart lookups
const DUMMY_PRODUCTS: Product[] = [
  { id: "1", name: "LCD Samsung Galaxy A54", description: "", price: 450000, stock: 25, image_url: "", category: "LCD", created_at: "" },
  { id: "2", name: "LCD iPhone 13 OLED Original", description: "", price: 850000, stock: 15, image_url: "", category: "LCD", created_at: "" },
  { id: "3", name: "LCD Xiaomi Redmi Note 12", description: "", price: 320000, stock: 30, image_url: "", category: "LCD", created_at: "" },
  { id: "4", name: "LCD Oppo Reno 10 AMOLED", description: "", price: 520000, stock: 20, image_url: "", category: "LCD", created_at: "" },
  { id: "5", name: "Baterai Samsung Galaxy S23", description: "", price: 185000, stock: 40, image_url: "", category: "Baterai", created_at: "" },
  { id: "6", name: "Baterai iPhone 14 Original", description: "", price: 275000, stock: 35, image_url: "", category: "Baterai", created_at: "" },
  { id: "7", name: "Baterai Xiaomi Poco F5", description: "", price: 150000, stock: 50, image_url: "", category: "Baterai", created_at: "" },
  { id: "8", name: "Charger Samsung 25W Fast Charging", description: "", price: 95000, stock: 60, image_url: "", category: "Charger", created_at: "" },
  { id: "9", name: "Charger iPhone 20W USB-C", description: "", price: 125000, stock: 45, image_url: "", category: "Charger", created_at: "" },
  { id: "10", name: "Charger Xiaomi 67W Turbo", description: "", price: 135000, stock: 30, image_url: "", category: "Charger", created_at: "" },
  { id: "11", name: "Kamera Belakang Samsung S24 50MP", description: "", price: 550000, stock: 10, image_url: "", category: "Kamera", created_at: "" },
  { id: "12", name: "Kamera Depan iPhone 15", description: "", price: 420000, stock: 12, image_url: "", category: "Kamera", created_at: "" },
  { id: "13", name: "Flexibel Connector Samsung A34", description: "", price: 85000, stock: 55, image_url: "", category: "Flexibel", created_at: "" },
  { id: "14", name: "Flexibel iPhone 12 Volume", description: "", price: 110000, stock: 40, image_url: "", category: "Flexibel", created_at: "" },
  { id: "15", name: "IC Power Qualcomm PM8150", description: "", price: 195000, stock: 20, image_url: "", category: "IC", created_at: "" },
  { id: "16", name: "IC Audio iPhone 13", description: "", price: 165000, stock: 18, image_url: "", category: "IC", created_at: "" },
];

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [useLocal, setUseLocal] = useState(false);
  const { isLoggedIn, supabaseUser } = useAuth();
  const supabase = createClient();

  // Try to fetch from Supabase, fallback to localStorage
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn || !supabaseUser) {
      // Not logged in: use local cart
      setItems(loadLocalCart());
      setUseLocal(true);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("cart")
        .select("*, product:products(*)")
        .eq("user_id", supabaseUser.id);

      if (!error && data && data.length >= 0) {
        setItems(data as CartItemWithProduct[]);
        setUseLocal(false);
      } else {
        // Table might not exist, fallback to local
        setItems(loadLocalCart());
        setUseLocal(true);
      }
    } catch {
      setItems(loadLocalCart());
      setUseLocal(true);
    }
    setLoading(false);
  }, [isLoggedIn, supabaseUser, supabase]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const findDummyProduct = (productId: string): Product | undefined => {
    return DUMMY_PRODUCTS.find((p) => p.id === productId);
  };

  const addItem = async (productId: string, quantity: number = 1) => {
    // Local cart mode (no DB or not logged in)
    if (useLocal || !isLoggedIn) {
      const existing = items.find((item) => item.product_id === productId);
      let newItems: CartItemWithProduct[];

      if (existing) {
        newItems = items.map((item) =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        toast.success("Jumlah produk diperbarui");
      } else {
        const product = findDummyProduct(productId);
        if (!product) {
          toast.error("Produk tidak ditemukan");
          return;
        }
        newItems = [
          ...items,
          {
            id: `local_${Date.now()}`,
            product_id: productId,
            quantity,
            product,
          },
        ];
        toast.success("Produk ditambahkan ke keranjang");
      }

      setItems(newItems);
      saveLocalCart(newItems);
      return;
    }

    // Supabase cart mode
    const existing = items.find((item) => item.product_id === productId);

    if (existing) {
      const { error } = await supabase
        .from("cart")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);

      if (!error) {
        toast.success("Jumlah produk diperbarui");
        fetchCart();
      }
    } else {
      const { error } = await supabase
        .from("cart")
        .insert({ user_id: supabaseUser!.id, product_id: productId, quantity });

      if (!error) {
        toast.success("Produk ditambahkan ke keranjang");
        fetchCart();
      } else {
        // Fallback: add locally if DB insert fails
        const product = findDummyProduct(productId);
        if (product) {
          const newItems = [...items, { id: `local_${Date.now()}`, product_id: productId, quantity, product }];
          setItems(newItems);
          saveLocalCart(newItems);
          setUseLocal(true);
          toast.success("Produk ditambahkan ke keranjang");
        }
      }
    }
  };

  const removeItem = async (productId: string) => {
    if (useLocal || !isLoggedIn) {
      const newItems = items.filter((item) => item.product_id !== productId);
      setItems(newItems);
      saveLocalCart(newItems);
      toast.success("Produk dihapus dari keranjang");
      return;
    }

    const { error } = await supabase
      .from("cart")
      .delete()
      .eq("user_id", supabaseUser!.id)
      .eq("product_id", productId);

    if (!error) {
      toast.success("Produk dihapus dari keranjang");
      fetchCart();
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    if (useLocal || !isLoggedIn) {
      const newItems = items.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      );
      setItems(newItems);
      saveLocalCart(newItems);
      return;
    }

    const { error } = await supabase
      .from("cart")
      .update({ quantity })
      .eq("user_id", supabaseUser!.id)
      .eq("product_id", productId);

    if (!error) {
      fetchCart();
    }
  };

  const clearCart = async () => {
    if (useLocal || !isLoggedIn) {
      setItems([]);
      saveLocalCart([]);
      return;
    }

    await supabase.from("cart").delete().eq("user_id", supabaseUser!.id);
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
