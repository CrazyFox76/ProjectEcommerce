import { Hero } from "@/components/hero";
import { CategorySection } from "@/components/category-section";
import { FeaturedProducts } from "@/components/featured-products";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategorySection />
      <FeaturedProducts />
    </>
  );
}
