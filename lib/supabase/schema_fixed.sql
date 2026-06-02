-- =============================================
-- 1. PEMBERSIHAN (Hapus tabel lama agar fresh)
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.set_admin(TEXT) CASCADE;
DROP TABLE IF EXISTS public.cart CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- =============================================
-- 2. PEMBUATAN TABEL
-- =============================================

-- Tabel Users (Relasi ke Auth Supabase)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel Products
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price BIGINT NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('LCD', 'Baterai', 'Charger', 'Kamera', 'Flexibel', 'IC')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders table (Updated untuk Midtrans)
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT UNIQUE,
  snap_token TEXT,
  transaction_id TEXT,
  total_price BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'preparing', 'shipped', 'completed', 'cancelled', 'failed')),
  shipping_address TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT 'midtrans',
  payment_type TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabel Order Items
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price BIGINT NOT NULL DEFAULT 0
);

-- Tabel Cart
CREATE TABLE public.cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, product_id)
);

-- =============================================
-- 3. KEAMANAN (RLS Policies)
-- =============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Fungsi pembantu mengecek admin (mencegah rekursif)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Policies Products
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (public.is_admin());

-- Policies Cart
CREATE POLICY "Users can manage own cart" ON public.cart FOR ALL USING (auth.uid() = user_id);

-- Policies Users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all users" ON public.users FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete users" ON public.users FOR DELETE USING (public.is_admin());

-- Policies Orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (public.is_admin());

-- Policies Order Items
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage order items" ON public.order_items FOR ALL USING (public.is_admin());

-- =============================================
-- 4. OTOMATISASI (Trigger & Functions)
-- =============================================

-- Fungsi buat user otomatis saat signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, ''),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fungsi untuk mengubah user jadi Admin
CREATE OR REPLACE FUNCTION public.set_admin(target_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users SET role = 'admin' WHERE email = target_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. SINKRONISASI USER LAMA & SEED DATA
-- =============================================

-- PENTING: Karena tabel public.users baru saja dihapus dan dibuat ulang,
-- kita harus menyalin data user yang sudah pernah daftar dari auth.users 
-- ke tabel public.users agar akun mereka tetap bisa digunakan.
INSERT INTO public.users (id, name, email, role)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', ''),
  COALESCE(au.email, ''),
  'user'
FROM auth.users au
ON CONFLICT (id) DO NOTHING;

-- Insert Produk (16 Produk)
INSERT INTO public.products (name, description, price, stock, image_url, category) VALUES
('LCD Samsung A51', 'Kualitas Super AMOLED', 450000, 10, 'https://picsum.photos/seed/lcd1/400', 'LCD'),
('Baterai iPhone 11', 'Kapasitas 3110mAh Original', 250000, 15, 'https://picsum.photos/seed/bat1/400', 'Baterai'),
('Charger 25W Type C', 'Fast Charging Samsung', 150000, 20, 'https://picsum.photos/seed/chg1/400', 'Charger'),
('Kamera Belakang iPhone X', 'Kamera jernih copotan', 350000, 5, 'https://picsum.photos/seed/cam1/400', 'Kamera'),
('Flexibel On Off Oppo F9', 'Kabel flexibel power', 25000, 50, 'https://picsum.photos/seed/flex1/400', 'Flexibel'),
('IC Power Xiaomi Note 8', 'Komponen IC Power', 75000, 30, 'https://picsum.photos/seed/ic1/400', 'IC'),
('LCD iPhone 12', 'OLED Screen Replacement', 1200000, 8, 'https://picsum.photos/seed/lcd2/400', 'LCD'),
('Baterai Redmi Note 9', 'Baterai BN54', 180000, 12, 'https://picsum.photos/seed/bat2/400', 'Baterai'),
('Charger iPhone 20W', 'USB-C Power Adapter', 200000, 25, 'https://picsum.photos/seed/chg2/400', 'Charger'),
('Kamera Depan Vivo V15', 'Kamera selfie pop-up', 200000, 7, 'https://picsum.photos/seed/cam2/400', 'Kamera'),
('Flexibel Charger Samsung A10', 'Board charger connector', 35000, 40, 'https://picsum.photos/seed/flex2/400', 'Flexibel'),
('IC CPU Universal', 'IC CPU Kualitas Terbaik', 150000, 20, 'https://picsum.photos/seed/ic2/400', 'IC'),
('LCD Oppo A5s', 'LCD Fullset + Touchscreen', 250000, 15, 'https://picsum.photos/seed/lcd3/400', 'LCD'),
('Baterai Asus Zenfone 5', 'Baterai 3300mAh', 120000, 10, 'https://picsum.photos/seed/bat3/400', 'Baterai'),
('Charger Micro USB', 'Standard 2A Fast', 50000, 30, 'https://picsum.photos/seed/chg3/400', 'Charger'),
('Flexibel LCD Vivo Y12', 'Kabel mainboard ke LCD', 45000, 25, 'https://picsum.photos/seed/flex3/400', 'Flexibel');

-- =============================================
-- 6. SET ADMIN (Eksekusi Terakhir)
-- =============================================
-- Baris ini sekarang akan berhasil karena user sudah disinkronisasi di langkah 5.
UPDATE public.users SET role = 'admin' WHERE email = 'aditpratama77788@gmail.com';
