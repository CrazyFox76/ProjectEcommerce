"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/context/auth-context";
import { useCart } from "@/lib/context/cart-context";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  User,
  LogOut,
  Menu,
  X,
  Smartphone,
  LayoutDashboard,
  History,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";

export function Navbar() {
  const { isLoggedIn, isAdmin, avatarUrl, displayName, displayEmail, signOut, loading } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Berhasil logout");
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/catalog", label: "Katalog" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const userInitial = displayName?.charAt(0)?.toUpperCase() || displayEmail?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/60">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary-600 text-white p-2 rounded-lg group-hover:bg-primary-700 transition-colors">
              <Smartphone className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-gray-900 hidden sm:block">
              SHOP <span className="text-primary-600">SPAREPART</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {loading ? (
              <div className="h-9 w-9 bg-gray-100 rounded-full animate-pulse" />
            ) : isLoggedIn ? (
              /* Profile Dropdown */
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-1 pr-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName || "Profile"}
                      width={36}
                      height={36}
                      className="rounded-full object-cover ring-2 ring-gray-200"
                      unoptimized
                    />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold ring-2 ring-gray-200">
                      {userInitial}
                    </div>
                  )}
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl animate-scale-in origin-top-right z-50">
                    {/* User Info */}
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={displayName || "Profile"}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                            {userInitial}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {displayName || "User"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {displayEmail}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      {isAdmin && (
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4 text-gray-400" />
                          Dashboard Admin
                        </Link>
                      )}
                      <Link
                        href="/order-history"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <History className="h-4 w-4 text-gray-400" />
                        Riwayat Pesanan
                      </Link>
                      <Link
                        href="/cart"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <ShoppingCart className="h-4 w-4 text-gray-400" />
                        Keranjang
                        {totalItems > 0 && (
                          <span className="ml-auto bg-primary-100 text-primary-700 text-xs font-medium px-2 py-0.5 rounded-full">
                            {totalItems}
                          </span>
                        )}
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors w-full cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <Button size="sm">
                  <User className="h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {!loading && isLoggedIn && avatarUrl ? (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="cursor-pointer"
              >
                <Image
                  src={avatarUrl}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full object-cover ring-2 ring-gray-200"
                  unoptimized
                />
              </button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-fade-in">
            {isLoggedIn && (
              <div className="flex items-center gap-3 px-4 pb-4 mb-3 border-b border-gray-100">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName || "Profile"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
                    {userInitial}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {displayName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!loading && isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Link>
                  )}
                  <Link
                    href="/order-history"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
                  >
                    <History className="h-4 w-4" />
                    Riwayat Pesanan
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : !loading ? (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50"
                >
                  <User className="h-4 w-4" />
                  Login
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
