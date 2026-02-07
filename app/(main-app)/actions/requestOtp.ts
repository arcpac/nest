"use server";

import { z } from "zod";
import { flattenValidationErrors } from "next-safe-action";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { publicAction } from "@/lib/public-action";

const requestOtpSchema = z.object({
    email: z.email(),
});

export const requestOtp = publicAction
    .metadata({ actionName: "requestOtp" })
    .inputSchema(requestOtpSchema, {
        handleValidationErrorsShape: async (ve) =>
            flattenValidationErrors(ve).fieldErrors,
    })
    .action(async ({ parsedInput: { email } }) => {
        const supabase = await createSupabaseServerClient();
        const { error } = await supabase.auth.signInWithOtp({
            email: email.trim(),
            options: {
                shouldCreateUser: true,
                emailRedirectTo: `${process.env.SITE_URL}/auth/callback`,
            },
        });

        if (error) {
            return { success: false as const, message: error.message };
        }

        return { success: true as const };
    });
