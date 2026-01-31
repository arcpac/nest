import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.MOBILE_JWT_SECRET!);

export async function signMobileToken(payload: { userId: string }) {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(secret);
}

export async function verifyMobileToken(token: string) {
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.userId;
    if (!userId || typeof userId !== "string") throw new Error("Invalid token");
    return { userId };
}
