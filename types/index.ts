export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number?: string;
  total_price: number;
  status: "pending" | "paid" | "preparing" | "shipped" | "completed" | "cancelled" | "failed";
  shipping_address: string;
  payment_method: string;
  payment_type?: string;
  transaction_id?: string;
  paid_at?: string;
  created_at: string;
  updated_at?: string;
  order_items?: OrderItem[];
  user?: User;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface OrderReview {
  id: string;
  order_id: string;
  user_id: string;
  rating: number;
  note: string;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export type Category = "LCD" | "Baterai" | "Charger" | "Kamera" | "Flexibel" | "IC";

export const CATEGORIES: Category[] = ["LCD", "Baterai", "Charger", "Kamera", "Flexibel", "IC"];

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  media_urls: string[];
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
}
