-- ============================================================================
-- FIX: Admin "Gagal mengupdate status" (HTTP 400) saat mengubah status pesanan
-- ============================================================================
--
-- Penyebab: CHECK constraint lama pada kolom orders.status hanya mengizinkan
--   ('pending', 'paid', 'shipped', 'completed')
-- sehingga saat admin menekan "→ Disiapkan" (status = 'preparing') PostgREST
-- menolak UPDATE dengan 400 Bad Request (pelanggaran CHECK constraint 23514).
--
-- Solusi: ganti constraint agar mencakup SELURUH status yang dipakai aplikasi.
--
-- Cara pakai: buka Supabase Dashboard -> SQL Editor -> tempel & Run.
-- Aman dijalankan berkali-kali (idempotent).
-- ============================================================================

-- Drop SEMUA CHECK constraint pada tabel orders yang menyangkut kolom status,
-- apa pun namanya (constraint lama bisa bernama auto-generate yang berbeda).
-- Kalau hanya DROP berdasarkan satu nama tebakan, constraint lama yang restriktif
-- bisa tertinggal dan error 400 tetap muncul.
DO $$
DECLARE
  c record;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.orders'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.orders DROP CONSTRAINT %I', c.conname);
  END LOOP;
END $$;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'pending',
    'paid',
    'preparing',
    'shipped',
    'completed',
    'cancelled',
    'failed'
  ));
