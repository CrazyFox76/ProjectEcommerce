-- =============================================
-- TABEL ORDER REVIEWS (Rating & Catatan User)
-- Jalankan di Supabase SQL Editor
-- =============================================

-- Buat tabel order_reviews
CREATE TABLE IF NOT EXISTS public.order_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Aktifkan RLS
ALTER TABLE public.order_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: User bisa melihat review miliknya sendiri
CREATE POLICY "Users can view own reviews" ON public.order_reviews
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: User bisa membuat review untuk order miliknya
CREATE POLICY "Users can create own reviews" ON public.order_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id = auth.uid() AND status = 'completed'
    )
  );

-- Policy: Admin bisa melihat semua review
CREATE POLICY "Admins can view all reviews" ON public.order_reviews
  FOR SELECT USING (public.is_admin());

-- =========================================================================
-- OPTIONAL MIGRATION: Jika tabel orders sudah ada sebelumnya,
-- jalankan perintah di bawah ini untuk mengupdate constraint status orders
-- agar mendukung status 'preparing' (Disiapkan).
-- =========================================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tc.constraint_name 
        FROM information_schema.table_constraints tc 
        JOIN information_schema.constraint_column_usage ccu 
          ON tc.constraint_name = ccu.constraint_name 
         AND tc.table_schema = ccu.table_schema
        WHERE tc.table_name = 'orders' 
          AND ccu.column_name = 'status' 
          AND tc.constraint_type = 'CHECK'
    LOOP
        EXECUTE 'ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'paid', 'preparing', 'shipped', 'completed', 'cancelled', 'failed'));


