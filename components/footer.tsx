import Link from "next/link";
import { Smartphone, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary-600 text-white p-2 rounded-lg">
                <Smartphone className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold text-white">
                SHOP <span className="text-primary-400">SPAREPART</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Toko spare part HP terpercaya dengan produk berkualitas original dan harga terbaik.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Menu</h3>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/catalog", label: "Katalog" },
                { href: "/cart", label: "Keranjang" },
                { href: "/order-history", label: "Riwayat Pesanan" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kategori</h3>
            <ul className="space-y-2.5">
              {["LCD", "Baterai", "Charger", "Kamera", "Flexibel", "IC"].map(
                (cat) => (
                  <li key={cat}>
                    <Link
                      href={`/catalog?category=${cat}`}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {cat}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gray-500" />
                <span className="text-sm text-gray-400">
                  JL Metlan Tambun Kecamatan Tambun Selatan Gang Sawo No 2334
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-gray-500" />
                <span className="text-sm text-gray-400">+62 813 1559 0710</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-gray-500" />
                <span className="text-sm text-gray-400">ssparepart9@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SHOP SPAREPART. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
