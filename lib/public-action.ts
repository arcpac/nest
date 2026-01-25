import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { z } from "zod";
import { headers } from "next/headers";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

class ActionError extends Error {}
class RateLimitError extends ActionError {
  constructor(message: string, public retryAfterMs?: number) {
    super(message);
  }
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Pick your policy (example: 5 attempts / 1 minute)
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  analytics: true, // optional
});

export async function getClientIp() {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  // x-forwarded-for can be a list: "ip, proxy1, proxy2"
  return xff?.split(",")[0]?.trim() || "unknown";
}

export const publicAction = createSafeActionClient({
  defineMetadataSchema() {
    return z.object({
      actionName: z.string(),
    });
  },

  handleServerError(e) {
    if (e instanceof RateLimitError) {
      return JSON.stringify({
        code: "RATE_LIMIT",
        message: "Too many attempts. Please try again shortly.",
        retryAfterMs: e.retryAfterMs ?? null,
      });
    }
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
}).use(async ({ next, metadata, clientInput }) => {
  // Only rate-limit specific public actions
  const limited = new Set(["loginUser", "registerUser"]);
  if (!metadata || !limited.has(metadata.actionName)) {
    return next();
  }

  const ip = getClientIp();

  // If the action has an email, include it (slows targeted brute force)
  const maybeEmail =
    typeof clientInput === "object" && clientInput && "email" in clientInput
      ? String((clientInput as any).email)
          .toLowerCase()
          .trim()
      : "";

  const key = maybeEmail
    ? `auth:${metadata.actionName}:${ip}:${maybeEmail}`
    : `auth:${metadata.actionName}:${ip}`;

  const result = await ratelimit.limit(key);

  if (!result.success) {
    const retryAfterMs = result.reset ? result.reset - Date.now() : undefined;
    throw new RateLimitError("Rate limited", retryAfterMs);
  }

  return next();
});
