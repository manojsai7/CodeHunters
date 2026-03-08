import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Hero from "@/components/landing/hero";
import FeaturedCourses from "@/components/landing/featured-courses";
import PopularProjects from "@/components/landing/popular-projects";
import Testimonials from "@/components/landing/testimonials";
import ReferralBanner from "@/components/landing/referral-banner";
import PricingSection from "@/components/landing/pricing-section";
import { createServerSupabaseClient, getUser } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function HomePage() {
  let userData = null;

  try {
    const user = await getUser();
    if (user) {
      const supabase = await createServerSupabaseClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, role, gold_coins, avatar_url")
        .eq("user_id", user.id)
        .single();
      if (profile) {
        userData = {
          id: user.id,
          email: user.email || "",
          name: profile.name,
          role: profile.role,
          goldCoins: profile.gold_coins,
        };
      }
    }
  } catch {
    // Not authenticated — continue as visitor
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={userData} />
      <main>
        <Hero />
        <FeaturedCourses />
        <PopularProjects />
        <PricingSection />
        <Testimonials />
        <ReferralBanner />
      </main>
      <Footer />
    </div>
  );
}
