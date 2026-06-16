import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Tablet, Headphones, Watch } from "lucide-react";

export function PromoBanner() {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1f44] via-[#1b3568] to-[#26489a] px-6 sm:px-12 py-12 sm:py-16">
          {/* Glow */}
          <div className="absolute -top-16 -right-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />

          <div className="relative grid md:grid-cols-2 gap-10 items-center">
            {/* Text */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4 text-balance">
                Hidupkan Kembali Perangkatmu
              </h2>
              <p className="text-blue-100/80 text-base sm:text-lg mb-8 max-w-md mx-auto md:mx-0">
                Temukan komponen original berkualitas dan kembalikan performa HP
                kesayanganmu seperti baru.
              </p>
              <Link href="/catalog">
                <Button
                  size="lg"
                  className="bg-white text-[#16264d] hover:bg-blue-50 rounded-xl px-8 py-6 text-base font-semibold shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5"
                >
                  Belanja Sekarang
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Device icons composition */}
            <div className="hidden md:flex items-center justify-center gap-4">
              {[
                { icon: Watch, size: "h-10 w-10", pad: "p-4" },
                { icon: Smartphone, size: "h-14 w-14", pad: "p-5" },
                { icon: Tablet, size: "h-16 w-16", pad: "p-6" },
                { icon: Headphones, size: "h-12 w-12", pad: "p-5" },
              ].map(({ icon: Icon, size, pad }, i) => (
                <div
                  key={i}
                  className={`rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 ${pad} animate-float`}
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  <Icon className={`${size} text-blue-100`} strokeWidth={1.3} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
