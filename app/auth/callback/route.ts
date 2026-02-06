import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const url = new URL(request.url);
    console.log('GOT REQUEST: ', request)
    // Supabase redirects back with ?code=...
    const code = url.searchParams.get("code");

    // Some cases may come back with ?error=...
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");
    console.log('CODE: ', code)
    if (error) {
        return NextResponse.redirect(
            new URL(`/login?error=${encodeURIComponent(errorDescription ?? error)}`, url)
        );
    }

    if (!code) {
        return NextResponse.redirect(new URL("/login", url));
    }

    const supabase = await createSupabaseServerClient();

    // Exchanges the code for a session and sets cookies
    await supabase.auth.exchangeCodeForSession(code);

    // Go to dashboard
    return NextResponse.redirect(new URL("/groups", url));
}
