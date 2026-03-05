import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { RegisterForm } from "@/components/auth/register-form";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Create Account | Code Hunters",
  description:
    "Join Code Hunters and start your journey with premium programming courses and ready-to-use developer projects.",
};

interface RegisterPageProps {
  searchParams: { ref?: string };
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <RegisterForm referralCode={searchParams.ref} />;
}
