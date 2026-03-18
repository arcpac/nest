"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";
import { headers } from "next/headers";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    username: z.string().min(2).max(40).optional(),
    redirectTo: z.string().optional(),
});


type RegisterResult =
    | { success: true; needsEmailConfirm: boolean }
    | { success: false; message: string };

export async function registerUser(input: unknown): Promise<RegisterResult> {
    try {
        const parsed = registerSchema.parse(input);

        const email = parsed.email.trim().toLowerCase();
        const username = parsed.username?.trim();
        const password = parsed.password;
        const redirectTo = parsed.redirectTo ?? "/";

        const supabase = await createSupabaseServerClient();

        const origin = headers().get("origin") ?? "";
        // ✅ put the next URL onto your callback
        const emailRedirectTo = origin
            ? `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
            : undefined;

        console.log('emailRedirectTo => ', emailRedirectTo)
        console.log('redirectTo => ', redirectTo)
        const options =
            username || emailRedirectTo
                ? {
                    ...(emailRedirectTo ? { emailRedirectTo } : {}),
                    ...(username ? { data: { username } } : {}),
                }
                : undefined;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            ...(options ? { options } : {}),
        });

        if (error) {
            return { success: false, message: error.message ?? "Signup failed" };
        }

        return { success: true, needsEmailConfirm: !data.session };
    } catch (e: any) {
        const msg = e?.issues?.[0]?.message || e?.message || "Signup failed";
        return { success: false, message: String(msg) };
    }
}
