import Link from "next/link";
import { Monitor, Battery, Plug, Camera, Cable, Cpu } from "lucide-react";
import type { Category } from "@/types";

const categories: { name: Category; icon: typeof Monitor; color: string }[] = [
  { name: "LCD", icon: Monitor, color: "bg-gray-100 text-gray-900 group-hover:bg-primary-600 group-hover:text-white" },
  { name: "Baterai", icon: Battery, color: "bg-gray-100 text-gray-900 group-hover:bg-primary-600 group-hover:text-white" },
  { name: "Charger", icon: Plug, color: "bg-gray-100 text-gray-900 group-hover:bg-primary-600 group-hover:text-white" },
  { name: "Kamera", icon: Camera, color: "bg-gray-100 text-gray-900 group-hover:bg-primary-600 group-hover:text-white" },
  { name: "Flexibel", icon: Cable, color: "bg-gray-100 text-gray-900 group-hover:bg-primary-600 group-hover:text-white" },
  { name: "IC", icon: Cpu, color: "bg-gray-100 text-gray-900 group-hover:bg-primary-600 group-hover:text-white" },
];

export function CategorySection() {
  return (
    <section className="py-20 sm:py-28 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Kategori Komponen
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Temukan suku cadang dengan mudah berdasarkan kategori yang Anda butuhkan
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map(({ name, icon: Icon, color }, index) => (
            <Link
              key={name}
              href={`/catalog?category=${name}`}
              className={`group flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-white border border-gray-100 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:shadow-gray-900/5 hover:border-gray-200 animate-fade-in stagger-${index + 1}`}
              style={{ opacity: 0 }}
            >
              <div className={`p-4 rounded-full transition-colors duration-500 ${color}`}>
                <Icon className="h-7 w-7" />
              </div>
              <span className="text-sm font-semibold tracking-wide text-gray-700 group-hover:text-gray-900 transition-colors">
                {name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
