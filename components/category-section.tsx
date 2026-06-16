import Link from "next/link";
import { Monitor, Battery, Plug, Camera, Cable, Cpu } from "lucide-react";
import type { Category } from "@/types";

const categories: { name: Category; icon: typeof Monitor }[] = [
  { name: "LCD", icon: Monitor },
  { name: "Baterai", icon: Battery },
  { name: "Charger", icon: Plug },
  { name: "Kamera", icon: Camera },
  { name: "Flexibel", icon: Cable },
  { name: "IC", icon: Cpu },
];

export function CategorySection() {
  return (
    <section className="py-20 sm:py-28 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Belanja per Kategori
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Temukan suku cadang dengan mudah berdasarkan kategori yang Anda butuhkan
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {categories.map(({ name, icon: Icon }, index) => (
            <Link
              key={name}
              href={`/catalog?category=${name}`}
              className={`group rounded-2xl bg-white border border-gray-100 overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-gray-900/5 hover:border-gray-200 animate-fade-in stagger-${index + 1}`}
              style={{ opacity: 0 }}
            >
              {/* Image-like top area */}
              <div className="relative aspect-square flex items-center justify-center bg-gradient-to-br from-[#0f1f44] via-[#1b3568] to-[#26489a] overflow-hidden">
                <div
                  className="absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                    backgroundSize: "20px 20px",
                  }}
                />
                <Icon className="relative h-12 w-12 text-white transition-transform duration-500 group-hover:scale-110" strokeWidth={1.3} />
              </div>
              <div className="py-4 text-center">
                <span className="text-sm font-semibold tracking-wide text-gray-800 group-hover:text-primary-600 transition-colors">
                  {name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
