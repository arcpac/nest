import { getServerSession } from "next-auth";
import { createSafeActionClient } from "next-safe-action";
import { authOptions } from "@/lib/auth";

export const actionClient = createSafeActionClient();

export const protectedAction = createSafeActionClient().use(
  async ({ next }) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    return next({ ctx: { session } });
  }
);
