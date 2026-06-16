// Logika finalisasi pembayaran Midtrans Snap.
//
// Dipisah dari komponen agar bisa diuji: bug sebelumnya adalah redirect
// (`router.push`) tertahan oleh `await clearCart()` yang menggantung tanpa
// timeout di dalam callback `onSuccess`/`onPending`. Di sini update status &
// clearCart dibungkus timeout (best-effort) sehingga navigasi DIJAMIN tetap
// dieksekusi. Status order yang otoritatif tetap di-set oleh webhook Midtrans
// (server-to-server), jadi kegagalan/keterlambatan di sini tidak masalah.

/** Jalankan promise dengan batas waktu; tidak pernah menolak/menggantung. */
function withTimeout(
  p: PromiseLike<unknown>,
  ms: number,
  onError: (e: unknown) => void
): Promise<void> {
  return Promise.race([
    Promise.resolve(p).then(
      () => undefined,
      (e) => {
        onError(e);
      }
    ),
    new Promise<void>((resolve) => setTimeout(resolve, ms)),
  ]) as Promise<void>;
}

export interface FinalizePaymentOptions {
  /** RPC update status order (sudah dimulai). Best-effort. */
  statusUpdate: PromiseLike<unknown>;
  /** Promise pengosongan keranjang (sudah dimulai). Best-effort. */
  clearCart: PromiseLike<unknown>;
  /** Navigasi keras — di browser ini set `window.location.href`. */
  navigate: (url: string) => void;
  /** URL tujuan setelah pembayaran. */
  targetUrl: string;
  statusTimeoutMs?: number;
  clearCartTimeoutMs?: number;
  onError?: (e: unknown) => void;
}

/**
 * Tunggu best-effort (dengan timeout), lalu SELALU navigasi ke `targetUrl`.
 * Navigasi tidak boleh terhalang oleh status update atau clearCart yang
 * lambat/menggantung/gagal.
 */
export async function finalizePayment(opts: FinalizePaymentOptions): Promise<void> {
  const {
    statusUpdate,
    clearCart,
    navigate,
    targetUrl,
    statusTimeoutMs = 2000,
    clearCartTimeoutMs = 1500,
    onError = (e) => console.error("Best-effort task gagal:", e),
  } = opts;

  await withTimeout(statusUpdate, statusTimeoutMs, onError);
  await withTimeout(clearCart, clearCartTimeoutMs, onError);
  navigate(targetUrl);
}
