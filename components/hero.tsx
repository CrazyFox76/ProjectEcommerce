import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Smartphone,
  Monitor,
  Battery,
  Plug,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function Hero({ imageUrl }: { imageUrl?: string | null }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0f1f44] via-[#1b3568] to-[#26489a] text-white">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "38px 38px",
        }}
      />
      {/* Glow blobs */}
      <div className="absolute -top-24 -right-16 w-[28rem] h-[28rem] bg-blue-400/20 rounded-full blur-3xl animate-float" />
      <div className="absolute -bottom-32 -left-20 w-[26rem] h-[26rem] bg-indigo-500/20 rounded-full blur-3xl animate-float stagger-2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
        {/* ── Left: copy ── */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border border-white/15 bg-white/10 backdrop-blur-sm text-sm font-medium text-blue-100 animate-fade-in">
            <Zap className="h-4 w-4" />
            <span>Spare Part HP Original &amp; Bergaransi</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-6 animate-slide-up text-balance">
            Spare Part HP
            <br />
            <span className="bg-gradient-to-r from-blue-200 to-white bg-clip-text text-transparent">
              Terlengkap &amp; Original
            </span>
          </h1>

          <p className="text-base sm:text-lg text-blue-100/80 mb-9 leading-relaxed max-w-xl mx-auto lg:mx-0 animate-slide-up stagger-1">
            LCD, Baterai, Charger, Kamera, Flexibel, hingga IC — semua tersedia
            dengan kualitas original, harga bersaing, dan garansi terpercaya.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-slide-up stagger-2">
            <Link href="/catalog">
              <Button
                size="lg"
                className="bg-white text-[#16264d] hover:bg-blue-50 rounded-xl px-8 py-6 text-base font-semibold shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 w-full sm:w-auto"
              >
                Belanja Sekarang
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/catalog">
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl px-8 py-6 text-base font-semibold border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white w-full sm:w-auto"
              >
                Lihat Katalog
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center lg:justify-start mt-10 animate-slide-up stagger-3">
            {[
              { icon: ShieldCheck, label: "Garansi Resmi" },
              { icon: Zap, label: "Original 100%" },
              { icon: Smartphone, label: "Semua Tipe HP" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-blue-100/80 text-sm">
                <Icon className="h-4 w-4 text-blue-200" />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: showcase visual ── */}
        <div className="relative hidden lg:flex items-center justify-center animate-scale-in">
          <div className="relative w-full max-w-md aspect-square">
            {/* Soft glow behind the product */}
            <div className="absolute inset-10 rounded-full bg-blue-400/20 blur-3xl" />

            {imageUrl ? (
              /* Configurable product photo (transparent PNG looks best) */
              <Image
                src={imageUrl}
                alt="Produk unggulan"
                fill
                unoptimized
                priority
                className="relative object-contain drop-shadow-2xl animate-float"
                sizes="(max-width: 1024px) 0px, 32rem"
              />
            ) : (
              <>
                {/* Fallback visual when no hero image is set in admin */}
                <div className="absolute inset-6 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/15 shadow-2xl shadow-black/30 flex items-center justify-center">
                  <div className="rounded-3xl bg-gradient-to-br from-white/20 to-white/5 p-10">
                    <Smartphone className="h-28 w-28 text-white drop-shadow-lg" strokeWidth={1.2} />
                  </div>
                </div>
                <FloatChip className="top-0 left-2 stagger-1" icon={Monitor} label="LCD" />
                <FloatChip className="top-10 right-0 stagger-2" icon={Battery} label="Baterai" />
                <FloatChip className="bottom-6 left-0 stagger-3" icon={Plug} label="Charger" />
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatChip({
  className,
  icon: Icon,
  label,
}: {
  className?: string;
  icon: typeof Monitor;
  label: string;
}) {
  return (
    <div
      className={`absolute flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/95 text-[#16264d] shadow-xl shadow-black/20 animate-float ${className}`}
    >
      <Icon className="h-4 w-4 text-primary-600" />
      <span className="text-xs font-semibold">{label}</span>
    </div>
  );
}
