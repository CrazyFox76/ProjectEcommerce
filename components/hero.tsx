import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white text-gray-900">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, black 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Elegant blur blobs */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-gray-200 rounded-full blur-3xl opacity-30 animate-float" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-gray-200 rounded-full blur-3xl opacity-30 animate-float stagger-2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 flex flex-col items-center text-center">
        
        {/* Minimalist Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-gray-200 bg-white shadow-sm text-sm font-medium text-gray-600 animate-fade-in">
          <Zap className="h-4 w-4" />
          <span>Spare Part HP Original & Berkualitas</span>
        </div>

        {/* Elegant Heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-balance leading-tight mb-6 animate-slide-up">
          Temukan Spare Part HP <br className="hidden sm:block" />
          <span className="text-primary-600 font-light">Terbaik untuk Perangkatmu</span>
        </h1>

        {/* Minimalist Paragraph */}
        <p className="text-lg sm:text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl text-balance animate-slide-up stagger-1" style={{ opacity: 0 }}>
          LCD, Baterai, Charger, Kamera, Flexibel, IC — Semua tersedia
          dengan kualitas original dan harga bersaing. Garansi terpercaya.
        </p>

        {/* Elegant Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up stagger-2" style={{ opacity: 0 }}>
          <Link href="/catalog">
            <Button
              size="lg"
              className="bg-primary-600 text-white hover:bg-primary-700 rounded-full px-8 py-6 text-base font-medium shadow-xl shadow-primary-600/20 transition-all hover:-translate-y-1"
            >
              Lihat Katalog
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-8 mt-16 animate-slide-up stagger-3" style={{ opacity: 0 }}>
          {[
            { icon: Shield, label: "Garansi Resmi" },
            { icon: Truck, label: "Pengiriman Cepat" },
            { icon: Zap, label: "Original 100%" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-3 text-gray-600"
            >
              <div className="bg-gray-50 p-3 rounded-full border border-gray-100 shadow-sm transition-transform hover:scale-105">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium tracking-wide">{label}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
