import { createSupabaseServerClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ redirect?: string }>
}

export default async function LoginPage({ searchParams }: Props) {

  const { redirect: next } = await searchParams
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  console.log('User: ', user)
  if (user) {

    console.log('Next: ', next)
    const safeUrl = next?.startsWith("/") ? next : "/groups"
    redirect(safeUrl)
  }
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl mx-auto">
        <LoginForm />
      </div>
    </div>
  );
}
