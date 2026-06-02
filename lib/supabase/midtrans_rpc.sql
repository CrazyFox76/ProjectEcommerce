-- Hapus fungsi lama jika ada yang bentrok tipe datanya (UUID vs TEXT)
DROP FUNCTION IF EXISTS public.update_order_status(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.update_order_status(UUID, TEXT, TEXT, TEXT);

-- 1. Fungsi untuk memperbarui status pesanan dari Webhook (tanpa harus login)
CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id UUID,
  p_status TEXT,
  p_payment_type TEXT,
  p_transaction_id TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.orders 
  SET 
    status = p_status,
    payment_type = p_payment_type,
    transaction_id = p_transaction_id,
    paid_at = CASE WHEN p_status = 'paid' THEN NOW() ELSE paid_at END,
    updated_at = NOW()
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fungsi untuk menyimpan snap token ke database dari API Checkout
CREATE OR REPLACE FUNCTION public.update_order_snap_token(
  p_order_id UUID,
  p_snap_token TEXT
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.orders 
  SET snap_token = p_snap_token
  WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
