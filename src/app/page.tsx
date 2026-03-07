import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import Hero from "@/components/landing/hero";
import FeaturedCourses from "@/components/landing/featured-courses";
import PopularProjects from "@/components/landing/popular-projects";
import Testimonials from "@/components/landing/testimonials";
import ReferralBanner from "@/components/landing/referral-banner";
import PricingSection from "@/components/landing/pricing-section";
import { getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export const revalidate = 60;

export default async function HomePage() {
  let userData = null;

  try {
    const user = await getUser();
    if (user) {
      const profile = await prisma.profile.findUnique({
        where: { userId: user.id },
      });
      if (profile) {
        userData = {
          id: user.id,
          email: user.email || "",
          name: profile.name,
          role: profile.role,
          goldCoins: profile.goldCoins,
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
