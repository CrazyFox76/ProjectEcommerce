"use client";

import { createContext, useContext, useEffect, useState, useMemo, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { createAuthChangeHandler } from "./auth-state-handler";
import type { User } from "@/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  avatarUrl: string | null;
  displayName: string;
  displayEmail: string;
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  avatarUrl: null,
  displayName: "",
  displayEmail: "",
  isLoggedIn: false,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = async (authUser: SupabaseUser) => {
    try {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();
      setUser(data);
    } catch {
      // Table might not exist yet — still allow login via supabaseUser
      setUser(null);
    }
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setSupabaseUser(authUser);
        if (authUser) {
          await fetchProfile(authUser);
        }
      } catch {
        // Auth service might be unavailable
      }
      setLoading(false);
    };

    getUser();

    // Handler dipisah & diuji di auth-state-handler.ts. Ia sinkron dan menunda
    // fetchProfile keluar dari callback untuk menghindari deadlock supabase-js
    // (penyebab bug "loading terus, harus refresh berkali-kali").
    const handleAuthChange = createAuthChangeHandler({
      setSupabaseUser,
      setLoading,
      clearUser: () => setUser(null),
      fetchProfile,
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
  };

  // Derive display values from whichever source is available
  const avatarUrl =
    supabaseUser?.user_metadata?.avatar_url ||
    supabaseUser?.user_metadata?.picture ||
    null;

  const displayName =
    user?.name ||
    supabaseUser?.user_metadata?.full_name ||
    supabaseUser?.user_metadata?.name ||
    "";

  const displayEmail =
    user?.email ||
    supabaseUser?.email ||
    "";

  const isLoggedIn = !!supabaseUser;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        avatarUrl,
        displayName,
        displayEmail,
        isLoggedIn,
        isAdmin,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
