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

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

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
