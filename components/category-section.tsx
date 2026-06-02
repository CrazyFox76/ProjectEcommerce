import Link from "next/link";
import { Monitor, Battery, Plug, Camera, Cable, Cpu } from "lucide-react";
import type { Category } from "@/types";

const categories: { name: Category; icon: typeof Monitor; color: string }[] = [
  { name: "LCD", icon: Monitor, color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
  { name: "Baterai", icon: Battery, color: "bg-green-50 text-green-600 hover:bg-green-100" },
  { name: "Charger", icon: Plug, color: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
  { name: "Kamera", icon: Camera, color: "bg-purple-50 text-purple-600 hover:bg-purple-100" },
  { name: "Flexibel", icon: Cable, color: "bg-rose-50 text-rose-600 hover:bg-rose-100" },
  { name: "IC", icon: Cpu, color: "bg-cyan-50 text-cyan-600 hover:bg-cyan-100" },
];

export function CategorySection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Kategori Produk
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Temukan spare part yang kamu butuhkan berdasarkan kategori
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map(({ name, icon: Icon, color }, index) => (
            <Link
              key={name}
              href={`/catalog?category=${name}`}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl border border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-fade-in stagger-${index + 1}`}
              style={{ opacity: 0 }}
            >
              <div className={`p-3 rounded-xl ${color} transition-colors`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-semibold text-gray-700">{name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
