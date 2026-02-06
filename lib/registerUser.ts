"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { z } from "zod";

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    username: z.string().min(2).max(40).optional(),
});

type RegisterResult =
    | { success: true; needsEmailConfirm: boolean }
    | { success: false; message: string };

export async function registerUser(input: unknown): Promise<RegisterResult> {
    try {
        const { email, password, username } = registerSchema.parse(input);

        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: { data: username ? { username } : undefined },
        });

        if (error) {
            return { success: false, message: String(error.message ?? "Signup failed") };
        }

        return { success: true, needsEmailConfirm: !data.session };
    } catch (e: any) {
        const msg = e?.issues?.[0]?.message || e?.message || "Signup failed";
        return { success: false, message: String(msg) };
    }
}
