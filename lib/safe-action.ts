import { getServerSession } from "next-auth";
import { createSafeActionClient } from "next-safe-action";
import { authOptions } from "@/lib/auth";
import { createSupabaseServerClient } from "./supabase/server";

export const actionClient = createSafeActionClient();

export const protectedAction = createSafeActionClient().use(
  async ({ next }) => {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user?.id) {
      throw new Error("Unauthorized");
    }

    // Pass what you actually need in ctx
    return next({ ctx: { user } });
  }
);