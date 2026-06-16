import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { finalizePayment } from "./finalize-payment";

describe("finalizePayment — redirect setelah pembayaran Snap", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("navigasi ke targetUrl ketika status update & clearCart sukses cepat", async () => {
    const navigate = vi.fn();
    const promise = finalizePayment({
      statusUpdate: Promise.resolve({ ok: true }),
      clearCart: Promise.resolve(),
      navigate,
      targetUrl: "/checkout/success?order_id=abc&status=success",
    });

    await vi.runAllTimersAsync();
    await promise;

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(
      "/checkout/success?order_id=abc&status=success"
    );
  });

  // INI REGRESI UTAMA: bug lama membuat redirect tertahan karena
  // `await clearCart()` menggantung. Pastikan navigasi TETAP terjadi.
  it("TETAP navigasi walau clearCart menggantung selamanya", async () => {
    const navigate = vi.fn();
    const neverResolves = new Promise<void>(() => {}); // tidak pernah selesai

    const promise = finalizePayment({
      statusUpdate: Promise.resolve(),
      clearCart: neverResolves,
      navigate,
      targetUrl: "/checkout/success?order_id=hang&status=success",
      clearCartTimeoutMs: 1500,
    });

    // Sebelum timeout clearCart lewat, navigasi belum terjadi.
    await vi.advanceTimersByTimeAsync(1400);
    expect(navigate).not.toHaveBeenCalled();

    // Setelah timeout clearCart lewat, navigasi WAJIB terjadi.
    await vi.advanceTimersByTimeAsync(200);
    await promise;
    expect(navigate).toHaveBeenCalledWith(
      "/checkout/success?order_id=hang&status=success"
    );
  });

  it("TETAP navigasi walau status update menggantung selamanya", async () => {
    const navigate = vi.fn();
    const neverResolves = new Promise<void>(() => {});

    const promise = finalizePayment({
      statusUpdate: neverResolves,
      clearCart: Promise.resolve(),
      navigate,
      targetUrl: "/checkout/success?order_id=hang2&status=pending",
      statusTimeoutMs: 2000,
    });

    await vi.advanceTimersByTimeAsync(2001);
    await promise;
    expect(navigate).toHaveBeenCalledWith(
      "/checkout/success?order_id=hang2&status=pending"
    );
  });

  it("TETAP navigasi walau status update & clearCart menolak (reject)", async () => {
    const navigate = vi.fn();
    const onError = vi.fn();

    const promise = finalizePayment({
      statusUpdate: Promise.reject(new Error("rpc gagal")),
      clearCart: Promise.reject(new Error("clear gagal")),
      navigate,
      targetUrl: "/checkout/success?order_id=err&status=success",
      onError,
    });

    await vi.runAllTimersAsync();
    await promise;

    expect(navigate).toHaveBeenCalledWith(
      "/checkout/success?order_id=err&status=success"
    );
    expect(onError).toHaveBeenCalledTimes(2);
  });
});
