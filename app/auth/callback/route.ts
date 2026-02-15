import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const url = new URL(request.url);

    // Supabase redirects back with ?code=...
    const code = url.searchParams.get("code");

    // Our app can pass ?next=/invites/<token> etc.
    const next = url.searchParams.get("next") ?? "/groups";

    // Some cases may come back with ?error=...
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

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

    // Security: only allow internal redirects
    // - allow paths that start with "/"
    // - block "http(s)://..." external redirects
    const safeNext = next.startsWith("/") ? next : "/groups";

    return NextResponse.redirect(new URL(safeNext, url));
}
