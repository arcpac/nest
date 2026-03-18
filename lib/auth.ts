import { redirect } from "next/navigation";
import { db } from "@/db";
import { members, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createSupabaseServerClient } from "./supabase/server";
import { cache } from "react";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const found = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        const user = found[0];
        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        return { id: user.id, username: user.username, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};



interface User {
  id: string;
  name?: string | null;
  email?: string | null;
}

export async function getUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user.id;
}

export const getUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return user;
});

export async function getUserProfile() {
  const user = await getUser();

  const supabase = await createSupabaseServerClient();

  const { data: profile, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();


  if (error) {
    // optional: log, throw, or return null
    throw new Error("User profile not found");
  }

  return { user, profile };
}

export async function requireGroupMember(userId: string, groupId: string) {
  const [row] = await db
    .select({ id: members.id })
    .from(members)
    .where(and(eq(members.user_id, userId), eq(members.group_id, groupId)))
    .limit(1);

  return !!row;
}
