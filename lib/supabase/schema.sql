-- =============================================
-- TAMIM SPAREPART - Database Schema
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products table
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

-- Orders table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  total_price BIGINT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'preparing', 'shipped', 'completed', 'cancelled', 'failed')),
  shipping_address TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT 'sakuku',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order items table
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price BIGINT NOT NULL DEFAULT 0
);

-- Cart table
CREATE TABLE public.cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, product_id)
);

-- =============================================
-- Row Level Security
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Allow insert for auth" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Order items policies
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can insert order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND user_id = auth.uid())
);

-- Cart policies
CREATE POLICY "Users can view own cart" ON public.cart FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert to cart" ON public.cart FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON public.cart FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from cart" ON public.cart FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- Auto-create user profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Seed Data (16 Products)
-- =============================================
INSERT INTO public.products (name, description, price, stock, image_url, category) VALUES

-- LCD (4 produk)
('LCD Samsung Galaxy A54',
'LCD Original Samsung Galaxy A54 5G dengan frame. Super AMOLED 6.4 inch, resolusi FHD+ (2340 x 1080 pixel). Mendukung refresh rate 120Hz untuk tampilan halus dan responsif.

Kualitas original dengan warna akurat dan tingkat kecerahan tinggi. Sudah termasuk frame/bezel untuk pemasangan mudah. Layar dilindungi Corning Gorilla Glass 5.

✅ Garansi 30 hari penggantian
✅ Sudah diuji kualitas QC
✅ Kompatibel: Samsung Galaxy A54 5G (SM-A546)
✅ Termasuk adhesive tape pemasangan',
450000, 25, '', 'LCD'),

('LCD iPhone 13 OLED Original',
'LCD iPhone 13 OLED Original Apple. Panel OLED Super Retina XDR 6.1 inch dengan resolusi 2532 x 1170 pixel. Mendukung HDR10, Dolby Vision, dan True Tone display.

Warna tajam dengan kontras ratio 2.000.000:1. Sentuhan 3D Touch responsif dan akurat. Tingkat kecerahan hingga 1200 nits.

✅ Garansi 30 hari penggantian
✅ Face ID compatible
✅ Kompatibel: iPhone 13 (A2633, A2631)
✅ Termasuk tool kit pemasangan',
850000, 15, '', 'LCD'),

('LCD Xiaomi Redmi Note 12',
'LCD Xiaomi Redmi Note 12 IPS fullset dengan touchscreen digitizer. Layar 6.67 inch AMOLED FHD+ (2400 x 1080). Refresh rate 120Hz, sampling rate 240Hz.

Kualitas display setara original dengan reproduksi warna akurat. Touchscreen responsif dan presisi tinggi.

✅ Garansi 30 hari
✅ Plug and play — langsung pasang
✅ Kompatibel: Redmi Note 12 (22111317G)',
320000, 30, '', 'LCD'),

('LCD Oppo Reno 10 AMOLED',
'LCD Oppo Reno 10 AMOLED fullset dengan frame. Panel AMOLED 6.7 inch FHD+ dengan 120Hz refresh rate. Warna vivid dan viewing angle luas.

Dilengkapi in-display fingerprint sensor support. Frame aluminium presisi tinggi untuk pemasangan sempurna.

✅ Garansi 30 hari
✅ Original quality
✅ Kompatibel: Oppo Reno 10 5G (CPH2531)',
520000, 20, '', 'LCD'),

-- Baterai (3 produk)
('Baterai Samsung Galaxy S23',
'Baterai original Samsung Galaxy S23 kapasitas 3900mAh Li-Ion. Teknologi Adaptive Power Saving untuk efisiensi maksimal. Tahan seharian penuh dengan pemakaian normal.

Mendukung fast charging 25W, wireless charging 15W, dan reverse wireless charging 4.5W.

✅ Garansi 30 hari
✅ Battery health 100%
✅ Sudah termasuk adhesive tape
✅ Kompatibel: Samsung Galaxy S23 (SM-S911)',
185000, 40, '', 'Baterai'),

('Baterai iPhone 14 Original',
'Baterai iPhone 14 original Apple kapasitas 3279mAh Lithium-Ion. Battery health 100%, performa optimal tanpa throttling.

Mendukung fast charging 20W (0-50% dalam 30 menit), MagSafe wireless charging 15W, dan Qi wireless charging 7.5W.

✅ Garansi 30 hari
✅ Kapasitas penuh, belum pernah dipakai
✅ Kompatibel: iPhone 14 (A2649, A2881)
✅ Termasuk waterproof seal',
275000, 35, '', 'Baterai'),

('Baterai Xiaomi Poco F5',
'Baterai Xiaomi Poco F5 original kapasitas 5000mAh Li-Po. Baterai besar untuk penggunaan berat dan gaming marathon.

Mendukung Turbo Charge 67W — pengisian penuh hanya 52 menit. Siklus charge 800+ kali.

✅ Garansi 30 hari
✅ Kapasitas penuh
✅ Kompatibel: Poco F5 (23049PCD8G)',
150000, 50, '', 'Baterai'),

-- Charger (3 produk)
('Charger Samsung 25W Fast Charging',
'Charger Samsung 25W Super Fast Charging original EP-TA800. Konektor USB Type-C, compact design.

Teknologi AFC (Adaptive Fast Charging) dan PD 3.0 untuk pengisian optimal. Kompatibel dengan semua perangkat Samsung Galaxy S/A/M/Note series.

✅ Garansi 30 hari
✅ Sertifikasi keamanan lengkap
✅ Over-voltage & over-current protection
✅ Termasuk kabel Type-C 1m',
95000, 60, '', 'Charger'),

('Charger iPhone 20W USB-C',
'Apple 20W USB-C Power Adapter original A2305. Mendukung fast charging untuk iPhone 8 ke atas — 0-50% dalam 30 menit.

Design compact dan ringan, ideal untuk travel. PD (Power Delivery) technology untuk pengisian cerdas.

✅ Garansi 30 hari
✅ Apple certified
✅ Kompatibel: semua iPhone & iPad dengan Lightning/USB-C
✅ Kabel dijual terpisah',
125000, 45, '', 'Charger'),

('Charger Xiaomi 67W Turbo',
'Charger Xiaomi 67W Turbo Charge original MDY-12-EH. Isi penuh baterai 5000mAh dalam 38 menit saja.

Teknologi pengisian cerdas dengan proteksi multi-layer: over-voltage, over-current, over-temperature, dan short-circuit protection.

✅ Garansi 30 hari
✅ Termasuk kabel USB-A to USB-C 1m
✅ Kompatibel: Xiaomi/Redmi/Poco series
✅ Support QC 3.0, PD 3.0, dan Turbo Charge',
135000, 30, '', 'Charger'),

-- Kamera (2 produk)
('Kamera Belakang Samsung S24 50MP',
'Modul kamera belakang Samsung Galaxy S24 lengkap: 50MP Wide (f/1.8, OIS) + 12MP Ultra Wide (f/2.2) + 10MP Telephoto (f/2.4, 3x optical zoom).

Sensor ISOCELL GN3 untuk foto detail dan low-light superior. Mendukung 8K video recording, Night Mode, dan Space Zoom.

✅ Garansi 30 hari
✅ Komponen original Samsung
✅ Kompatibel: Samsung Galaxy S24 (SM-S921)
✅ Sudah dikalibrasi',
550000, 10, '', 'Kamera'),

('Kamera Depan iPhone 15',
'Kamera depan iPhone 15 TrueDepth Camera System: 12MP (f/1.9) dengan autofocus. Termasuk Face ID module lengkap — IR camera, dot projector, dan flood illuminator.

Mendukung Smart HDR 5, Deep Fusion, Cinematic Mode 4K, dan Photonic Engine.

✅ Garansi 30 hari
✅ Face ID berfungsi sempurna
✅ Kompatibel: iPhone 15 (A2846, A3089)
✅ Termasuk sensor proximity & ambient light',
420000, 12, '', 'Kamera'),

-- Flexibel (2 produk)
('Flexibel Connector Samsung A34',
'Flexibel connector port charging Samsung Galaxy A34 lengkap dengan microphone utama dan jack audio 3.5mm.

Konektor USB Type-C, mendukung fast charging 25W dan data transfer. Kualitas flexibel premium, tidak mudah putus.

✅ Garansi 30 hari
✅ Kualitas original
✅ Kompatibel: Samsung Galaxy A34 5G (SM-A346)
✅ Pemasangan mudah, plug and play',
85000, 55, '', 'Flexibel'),

('Flexibel iPhone 12 Volume',
'Flexibel tombol volume dan silent/ring switch iPhone 12. Termasuk flash LED mount dan koneksi mikrofon atas.

Kabel flex berkualitas tinggi dengan durabilitas terjamin. Mengatasi masalah tombol volume macet, tidak responsif, atau switch mute tidak berfungsi.

✅ Garansi 30 hari
✅ Komponen original Apple
✅ Kompatibel: iPhone 12 (A2172, A2402)
✅ Termasuk bracket pemasangan',
110000, 40, '', 'Flexibel'),

-- IC (2 produk)
('IC Power Qualcomm PM8150',
'IC Power Management Qualcomm PM8150. PMIC utama untuk regulasi daya dan distribusi voltase pada chipset Snapdragon 855/855+.

Mengatasi masalah: HP mati total, restart sendiri, baterai boros tidak wajar, dan charging tidak masuk.

✅ Garansi 14 hari (IC)
✅ Komponen original
✅ Kompatibel: Samsung S10/S10+/Note 10, OnePlus 7/7 Pro, dll
✅ Butuh teknisi berpengalaman untuk pemasangan',
195000, 20, '', 'IC'),

('IC Audio iPhone 13',
'IC Audio codec U1201 untuk iPhone 13/13 Pro series. Bertanggung jawab atas pemrosesan sinyal audio input dan output.

Mengatasi masalah: speaker tidak bersuara, microphone mati, audio garuk/noise, dan panggilan telepon tidak terdengar.

✅ Garansi 14 hari (IC)
✅ Komponen original Apple
✅ Kompatibel: iPhone 13 / iPhone 13 Pro (semua varian)
✅ Pemasangan memerlukan micro-soldering',
165000, 18, '', 'IC');

-- =============================================
-- Storage Setup (Run manually in Supabase Dashboard)
-- =============================================
-- 1. Go to Storage > New bucket
-- 2. Name: products, Public: true
-- 3. Upload product images to this bucket

-- =============================================
-- ADMIN SETUP
-- =============================================
-- Jalankan query di bawah ini SETELAH kamu login/register akun di website.
-- Ganti email dengan email akun Google kamu.

-- >> SET ADMIN (ganti email di bawah) <<
UPDATE public.users SET role = 'admin' WHERE email = 'aditpratama77788@gmail.com';

-- Fungsi untuk set admin (bisa dipanggil kapan saja)
CREATE OR REPLACE FUNCTION public.set_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.users SET role = 'admin' WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Contoh penggunaan:
-- SELECT set_admin('emailkamu@gmail.com');

-- =============================================
-- FIX RLS POLICY (Jalankan di Supabase SQL Editor)
-- Data TIDAK akan terhapus, hanya policy akses yang diperbaiki
-- =============================================

-- Step 1: Buat fungsi helper is_admin() agar tidak rekursif
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Step 2: Hapus policy lama yang rekursif (data AMAN, hanya aturan yang dihapus)
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

-- Step 3: Buat ulang policy yang benar menggunakan is_admin()
CREATE POLICY "Admins can view all users"       ON public.users       FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all users"     ON public.users       FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete users"         ON public.users       FOR DELETE USING (public.is_admin());

CREATE POLICY "Admins can insert products"      ON public.products    FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update products"      ON public.products    FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete products"      ON public.products    FOR DELETE USING (public.is_admin());
CREATE POLICY "Admins can view all orders"      ON public.orders      FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update orders"        ON public.orders      FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (public.is_admin());

-- Step 4: Fix trigger agar tidak gagal jika email NULL
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

-- Step 5: Sync user yang sudah daftar tapi belum masuk public.users
INSERT INTO public.users (id, name, email, role)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', ''),
  COALESCE(au.email, ''),
  'user'
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;


