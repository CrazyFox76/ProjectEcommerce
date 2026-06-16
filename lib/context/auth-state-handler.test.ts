import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createAuthChangeHandler } from "./auth-state-handler";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

const fakeUser = { id: "user-1", email: "a@b.com" } as SupabaseUser;
const fakeSession = { user: fakeUser } as Session;

describe("createAuthChangeHandler — cegah deadlock supabase-js", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function makeDeps(overrides = {}) {
    return {
      setSupabaseUser: vi.fn(),
      setLoading: vi.fn(),
      clearUser: vi.fn(),
      fetchProfile: vi.fn(),
      ...overrides,
    };
  }

  // INTI BUG 2: handler harus sinkron (return void, bukan Promise).
  // Handler async di onAuthStateChange = deadlock supabase-js.
  it("handler bersifat sinkron (tidak mengembalikan Promise)", () => {
    const handler = createAuthChangeHandler(makeDeps());
    const result = handler("SIGNED_IN", fakeSession);
    expect(result).toBeUndefined();
    expect(result).not.toBeInstanceOf(Promise);
  });

  // INTI BUG 2: fetchProfile (yang memanggil supabase.from) TIDAK boleh
  // dipanggil sinkron di dalam callback — harus ditunda keluar.
  it("TIDAK memanggil fetchProfile secara sinkron, hanya setelah ditunda", () => {
    const deps = makeDeps();
    const handler = createAuthChangeHandler(deps);

    handler("SIGNED_IN", fakeSession);

    // Saat callback selesai, fetchProfile belum dipanggil.
    expect(deps.fetchProfile).not.toHaveBeenCalled();
    // State sinkron langsung di-set.
    expect(deps.setSupabaseUser).toHaveBeenCalledWith(fakeUser);
    expect(deps.setLoading).toHaveBeenCalledWith(false);

    // Setelah tick timer, fetchProfile baru dijalankan (di luar callback).
    vi.runAllTimers();
    expect(deps.fetchProfile).toHaveBeenCalledWith(fakeUser);
  });

  it("session null -> clearUser, tanpa fetchProfile", () => {
    const deps = makeDeps();
    const handler = createAuthChangeHandler(deps);

    handler("SIGNED_OUT", null);

    expect(deps.setSupabaseUser).toHaveBeenCalledWith(null);
    expect(deps.setLoading).toHaveBeenCalledWith(false);
    expect(deps.clearUser).toHaveBeenCalledTimes(1);
    vi.runAllTimers();
    expect(deps.fetchProfile).not.toHaveBeenCalled();
  });

  it("menggunakan defer kustom (bukti penundaan dapat dikontrol)", () => {
    const defer = vi.fn();
    const deps = makeDeps();
    const handler = createAuthChangeHandler({ ...deps, defer });

    handler("SIGNED_IN", fakeSession);

    // fetchProfile dilewatkan ke defer, bukan dipanggil langsung.
    expect(defer).toHaveBeenCalledTimes(1);
    expect(deps.fetchProfile).not.toHaveBeenCalled();

    // Jalankan fungsi yang ditunda.
    defer.mock.calls[0][0]();
    expect(deps.fetchProfile).toHaveBeenCalledWith(fakeUser);
  });
});
