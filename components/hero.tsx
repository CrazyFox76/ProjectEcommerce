import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-4 py-2 rounded-full mb-6 animate-fade-in">
            <Zap className="h-4 w-4" />
            Spare Part HP Original & Berkualitas
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 animate-slide-up">
            Temukan Spare Part HP{" "}
            <span className="text-primary-200">Terbaik</span> untuk Perangkatmu
          </h1>

          <p className="text-lg sm:text-xl text-primary-100 mb-8 leading-relaxed max-w-2xl animate-slide-up stagger-1" style={{ opacity: 0 }}>
            LCD, Baterai, Charger, Kamera, Flexibel, IC — Semua tersedia
            dengan kualitas original dan harga bersaing. Garansi terpercaya.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-slide-up stagger-2" style={{ opacity: 0 }}>
            <Link href="/catalog">
              <Button
                size="lg"
                className="bg-white text-primary-700 hover:bg-gray-100 shadow-lg shadow-primary-900/30 font-semibold"
              >
                Lihat Katalog
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 mt-12 animate-slide-up stagger-3" style={{ opacity: 0 }}>
            {[
              { icon: Shield, label: "Garansi Resmi" },
              { icon: Truck, label: "Pengiriman Cepat" },
              { icon: Zap, label: "Original 100%" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-white/80"
              >
                <div className="bg-white/15 p-2 rounded-lg">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Decorative shapes */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-primary-400/10 blur-2xl" />
    </section>
  );
}
