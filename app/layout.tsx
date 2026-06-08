import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/client-providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "TAMIM SPAREPART - Toko Spare Part HP",
    template: "%s | TAMIM SPAREPART",
  },
  description:
    "Toko spare part HP terpercaya. LCD, Baterai, Charger, Kamera, Flexibel, IC original dengan harga terbaik dan garansi resmi.",
  keywords: ["spare part hp", "lcd hp", "baterai hp", "charger hp", "sparepart handphone"],
  verification: {
    google: "phn5DBletNXOb-b4_KFEmoZ7Kokg4Re4XPxFodgMQuM",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
