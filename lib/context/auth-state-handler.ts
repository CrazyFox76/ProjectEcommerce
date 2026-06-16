import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

// Handler untuk supabase.auth.onAuthStateChange.
//
// KRITIS: handler ini WAJIB sinkron dan TIDAK boleh memanggil method supabase
// lain (mis. supabase.from(...)) secara langsung di dalamnya. supabase-js akan
// deadlock bila ada panggilan async di dalam handler — panggilan supabase
// berikutnya di mana pun akan menggantung selamanya, membuat halaman "loading
// terus" dan baru muncul setelah refresh.
//
// Karena itu fetchProfile (yang memanggil supabase.from) ditunda keluar dari
// callback lewat `defer` (default: setTimeout 0).

export interface AuthChangeHandlerDeps {
  setSupabaseUser: (u: SupabaseUser | null) => void;
  setLoading: (v: boolean) => void;
  clearUser: () => void;
  fetchProfile: (u: SupabaseUser) => void;
  /** Penunda eksekusi di luar callback. Default: setTimeout(fn, 0). */
  defer?: (fn: () => void) => void;
}

export function createAuthChangeHandler(deps: AuthChangeHandlerDeps) {
  const defer = deps.defer ?? ((fn: () => void) => setTimeout(fn, 0));

  // Return type `void` (bukan Promise) — disengaja agar handler tetap sinkron.
  return (_event: string, session: Session | null): void => {
    const authUser = session?.user ?? null;
    deps.setSupabaseUser(authUser);
    deps.setLoading(false);
    if (authUser) {
      defer(() => deps.fetchProfile(authUser));
    } else {
      deps.clearUser();
    }
  };
}
