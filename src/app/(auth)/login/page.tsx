import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign In | Code Hunters",
  description:
    "Sign in to your Code Hunters account to access premium courses, projects, and your learning dashboard.",
};

export default async function LoginPage() {
  try {
    const user = await getUser();
    if (user) {
      redirect("/dashboard/my-learning");
    }
  } catch (e: unknown) {
    if (e && typeof e === 'object' && 'digest' in e) throw e;
    // Supabase not configured — show login form anyway
  }

  return <LoginForm />;
}
