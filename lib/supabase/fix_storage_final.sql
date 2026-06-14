-- ==========================================
-- SCRIPT FINAL PERBAIKAN BUCKET STORAGE
-- ==========================================

-- 1. Hapus semua policy lama yang mungkin menyebabkan error 503 (Schema Invalid)
DROP POLICY IF EXISTS "Public read access for products" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload products" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update products" ON storage.objects;

-- 2. Hapus secara paksa bucket yang korup dari database
DELETE FROM storage.buckets WHERE id = 'products';

-- 3. Buat ulang bucket 'products' dengan standard Supabase yang benar
-- Mengisi parameter file_size_limit dan allowed_mime_types dengan NULL agar API Storage tidak crash
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('products', 'products', true, null, null);

-- 4. Buat Policy Read (Bisa diakses siapa saja)
CREATE POLICY "Public read access for products" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'products');

-- 5. Buat Policy Insert (Hanya user login/admin) menggunakan "TO authenticated" (Lebih aman dari auth.role())
CREATE POLICY "Authenticated users can upload products" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'products');

-- 6. Buat Policy Delete
CREATE POLICY "Authenticated users can delete products" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'products');

-- 7. Buat Policy Update
CREATE POLICY "Authenticated users can update products" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'products');
