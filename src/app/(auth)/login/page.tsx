import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign In | Code Hunters",
  description:
    "Sign in to your Code Hunters account to access premium courses, projects, and your learning dashboard.",
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}

export default async function LoginPage({ searchParams: searchParamsPromise }: LoginPageProps) {
  const searchParams = await searchParamsPromise;

  // If ?error is present, the user was bounced here because their profile is
  // missing or the DB is unreachable. Do NOT redirect them back to the dashboard
  // — that would create an infinite redirect loop.
  if (!searchParams.error) {
    try {
      const user = await getUser();
      if (user) {
        redirect("/dashboard/my-learning");
      }
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'digest' in e) throw e;
      // Supabase not configured — show login form anyway
    }
  }

  return <LoginForm />;
}
