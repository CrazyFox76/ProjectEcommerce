-- POLICY UNTUK BUCKET BARU: product_images

CREATE POLICY "Public read access for product_images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product_images');

CREATE POLICY "Authenticated users can upload product_images" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'product_images');

CREATE POLICY "Authenticated users can delete product_images" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'product_images');

CREATE POLICY "Authenticated users can update product_images" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'product_images');
