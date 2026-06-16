-- ============================================================================
-- Site settings: simpan konfigurasi tampilan toko (mis. foto hero homepage)
-- yang bisa diatur dari halaman admin.
-- Jalankan di Supabase Dashboard -> SQL Editor -> Run. Aman diulang (idempotent).
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  id          INT PRIMARY KEY DEFAULT 1,
  hero_image_url TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT site_settings_single_row CHECK (id = 1)
);

-- Pastikan selalu ada 1 baris
INSERT INTO public.site_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Semua orang boleh membaca (dipakai homepage publik)
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT USING (true);

-- Hanya admin yang boleh mengubah
DROP POLICY IF EXISTS "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE USING (public.is_admin());
