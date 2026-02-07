import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";
import { z } from "zod";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createSupabaseServerClient } from "./supabase/server";
import { getClientIp } from "./public-action"; // reuse your helper

class ActionError extends Error { }
class RateLimitError extends ActionError {
  constructor(message: string, public retryAfterMs?: number) {
    super(message);
  }
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Example policy for protected writes (tweak to taste)
const protectedRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, "30 s"), // 10 requests per 10 seconds
  analytics: true,
});

export const authMiddleware = async ({ next }: any) => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  const user = data?.user;
  if (error || !user?.id) {
    throw new Error("Unauthorized");
  }

  return next({ ctx: { user } });
};

export const rateLimitMiddleware = async (opts: any) => {
  const { next, ctx, metadata } = opts;

  // ctx is typed as `object` by the library — so narrow it here
  const userId: string | undefined = ctx?.user?.id;
  if (!userId) throw new Error("Unauthorized");

  const actionName: string = metadata?.actionName ?? "unknown";

  // Only rate-limit specific protected actions (recommended)
  const limited = new Set(["createExpense", "addGroupMember"]);
  if (!limited.has(actionName)) {
    return next();
  }
  const ip = await getClientIp();

  const key = `u:${userId}:${actionName}`;
  console.log("[RL]", { actionName, userId, key });
  const result = await protectedRatelimit.limit(key);
  console.log("[RL RESULT]", { success: result.success, remaining: result.remaining, reset: result.reset });


  if (!result.success) {
    console.log('ASDFASFAFADF')
    const retryAfterMs = result.reset ? result.reset - Date.now() : undefined;
    throw new RateLimitError("Rate limited", retryAfterMs);
  }

  return next();
};

export const protectedAction = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },

  handleServerError(e) {
    if (e instanceof RateLimitError) {
      return {
        code: "RATE_LIMIT",
        message: "Too many requests. Please slow down and try again.",
        retryAfterMs: e.retryAfterMs ?? null,
      };
    }

    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
})
  .use(authMiddleware)
  .use(rateLimitMiddleware);
