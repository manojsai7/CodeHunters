import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { LoginForm } from "@/components/auth/login-form";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Sign In | Code Hunters",
  description:
    "Sign in to your Code Hunters account to access premium courses, projects, and your learning dashboard.",
};

export default async function LoginPage() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
