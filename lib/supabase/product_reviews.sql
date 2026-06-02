-- =============================================
-- TABEL PRODUCT REVIEWS (Ulasan & Rating Produk)
-- Jalankan di Supabase SQL Editor
-- =============================================

-- 1. Buat tabel product_reviews
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  media_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Memastikan satu user hanya bisa mereview produk tertentu sekali saja
  UNIQUE(product_id, user_id)
);

-- 2. Aktifkan RLS (Row Level Security)
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang (publik/guest) bisa membaca ulasan produk
CREATE POLICY "Anyone can view product reviews" ON public.product_reviews
  FOR SELECT USING (true);

-- Policy: User terautentikasi bisa menulis ulasan untuk produk yang sudah dibeli
-- (yaitu produk tersebut ada dalam order berstatus 'completed' milik user tersebut)
CREATE POLICY "Users can create review for purchased products" ON public.product_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.order_items oi ON o.id = oi.order_id
      WHERE o.user_id = auth.uid()
        AND oi.product_id = product_reviews.product_id
        AND o.status = 'completed'
    )
  );

-- Policy: User bisa mengupdate ulasan milik mereka sendiri
CREATE POLICY "Users can update own product reviews" ON public.product_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: User bisa menghapus ulasan milik mereka sendiri
CREATE POLICY "Users can delete own product reviews" ON public.product_reviews
  FOR DELETE USING (auth.uid() = user_id);


-- =========================================================================
-- SETUP STORAGE BUCKET UNTUK MEDIA ULASAN (FOTO & VIDEO)
-- =========================================================================

-- Buat bucket 'review-media' jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-media', 'review-media', true)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan akses untuk bucket 'review-media' pada tabel storage.objects

-- 1. Siapa saja dapat melihat file media di dalam bucket ini
CREATE POLICY "Public read access for review-media" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-media');

-- 2. Pengguna yang sudah masuk/login (authenticated) bisa mengunggah file media
CREATE POLICY "Authenticated users can upload review-media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'review-media'
    AND auth.role() = 'authenticated'
  );

-- 3. Pengguna yang mengunggah dapat menghapus file media mereka sendiri
CREATE POLICY "Authenticated users can delete own review-media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'review-media'
    AND auth.role() = 'authenticated'
  );
