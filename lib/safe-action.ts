import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient();

export const protectedAction = createSafeActionClient()
  .use(async ({ next }) => {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    return next({ ctx: { session } });
  });