import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { z } from "zod";
import { headers } from "next/headers";

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

  handleServerError(_e) {
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});
