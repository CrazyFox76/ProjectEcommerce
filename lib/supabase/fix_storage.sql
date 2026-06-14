-- SETUP STORAGE BUCKET UNTUK PRODUK
-- Eksekusi file ini di SQL Editor Supabase Anda

-- 1. Buat bucket 'products' jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Kebijakan akses untuk bucket 'products' pada tabel storage.objects

-- A. Siapa saja dapat melihat/membaca file gambar produk
CREATE POLICY "Public read access for products" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

-- B. Authenticated users (Admin) dapat mengunggah gambar produk
CREATE POLICY "Authenticated users can upload products" ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    bucket_id = 'products'
  );

-- C. Authenticated users (Admin) dapat menghapus gambar produk
CREATE POLICY "Authenticated users can delete products" ON storage.objects
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    bucket_id = 'products'
  );

-- D. Authenticated users (Admin) dapat mengupdate gambar produk
CREATE POLICY "Authenticated users can update products" ON storage.objects
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    bucket_id = 'products'
  );
