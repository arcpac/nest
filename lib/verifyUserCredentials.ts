import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

function normalizeEmail(email: string) {
    return email.trim().toLowerCase();
}

export type VerifiedUser = {
    id: string;
    email: string;
    username: string | null;
};

export async function verifyUserCredentials(email: string, password: string) {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !normalizedEmail.includes("@")) return null;
    if (!password) return null;

    const found = await db
        .select({
            id: users.id,
            email: users.email,
            username: users.username,
            password: users.password,
        })
        .from(users)
        .where(eq(users.email, normalizedEmail))
        .limit(1);

    const user = found[0];
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    const safeUser: VerifiedUser = {
        id: user.id,
        email: user.email,
        username: user.username ?? null,
    };

    return safeUser;
}
