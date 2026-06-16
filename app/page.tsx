import { Hero } from "@/components/hero";
import { FeaturedProducts } from "@/components/featured-products";
import { PromoBanner } from "@/components/promo-banner";
import { CategorySection } from "@/components/category-section";
import { createClient } from "@/lib/supabase/server";

// Selalu render dinamis agar foto hero yang diatur admin langsung tampil
export const dynamic = "force-dynamic";

async function getHeroImageUrl(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("hero_image_url")
      .eq("id", 1)
      .single();
    return data?.hero_image_url ?? null;
  } catch {
    // Tabel site_settings belum dibuat — pakai fallback visual.
    return null;
  }
}

export default async function HomePage() {
  const heroImageUrl = await getHeroImageUrl();

  return (
    <>
      <Hero imageUrl={heroImageUrl} />
      <FeaturedProducts />
      <PromoBanner />
      <CategorySection />
    </>
  );
}
