"use server";

import { signIn } from "next-auth/react";

export async function signUserIn(email: string, password: string) {
  const res = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  return res;
}
