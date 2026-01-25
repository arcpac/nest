import { getServerSession } from "next-auth";
import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient();

export const protectedAction = createSafeActionClient().use(
  async ({ next }) => {
    const session = await getServerSession();

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    return next({ ctx: { session } });
  }
);
