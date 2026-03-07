import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Create Account | Code Hunters",
  description:
    "Join Code Hunters and start your journey with premium programming courses and ready-to-use developer projects.",
};

interface RegisterPageProps {
  searchParams: Promise<{ ref?: string; error?: string }>;
}

export default async function RegisterPage({ searchParams: searchParamsPromise }: RegisterPageProps) {
  const searchParams = await searchParamsPromise;

  if (!searchParams.error) {
    try {
      const user = await getUser();
      if (user) {
        redirect("/dashboard/my-learning");
      }
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'digest' in e) throw e;
      // Supabase not configured — show register form anyway
    }
  }

  return <RegisterForm referralCode={searchParams.ref} />;
}
