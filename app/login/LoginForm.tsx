"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAction } from "next-safe-action/hooks";
import React, { useState } from "react";
import { loginUser } from "../../lib/login";
import { useRouter } from "next/navigation";
import { CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

type FormErrors =
  | {
      email?: string[] | undefined;
      password?: string[] | undefined;
      unauthorised?: string[] | undefined;
    }
  | undefined;

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldError, setFieldErrors] = useState<FormErrors | undefined>(
    undefined
  );

  const { execute: handleLoginUser } = useAction(loginUser, {
    onSuccess: async ({ data }) => {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("res", res);
      if (res?.ok) {
        router.push("/dashboard");
      } else {
        setFieldErrors({
          unauthorised: ["Incorrect email and password."],
        });
      }
    },
    onError({ error }) {
      if (error.validationErrors) {
        setFieldErrors(error.validationErrors);
      }
    },
  });

  return (
    <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
      <CardHeader>
        <h1 className="text-2xl font-bold mb-4">Login Current</h1>
      </CardHeader>
      <CardContent>
        {fieldError?.unauthorised && (
          <div className="text-red-600">{fieldError.unauthorised}</div>
        )}
        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={cn(fieldError?.email ? "border-red-500" : "")}
            placeholder={cn(
              fieldError?.email ? "Enter valid email" : "Enter your email"
            )}
            required
          />
        </div>
        <div className="mb-6">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(fieldError?.password ? "border-red-500" : "")}
            placeholder="Enter password"
            required
          />
        </div>
        <Button
          onClick={() => {
            const localError: FormErrors = {};

            if (!email.trim()) {
              localError.email = ["Email is required"];
            }
            if (!password.trim()) {
              localError.password = ["Password is required"];
            }

            if (Object.keys(localError).length > 0) {
              setFieldErrors(localError);
              return;
            }
            setFieldErrors(undefined);
            handleLoginUser({ email, password });
          }}
        >
          Login
        </Button>
        <div>
          <p>
            You don't have an account?
            <Link href="/signup" className="text-blue-600 hover:underline">
              Signup here
            </Link>
          </p>
        </div>
      </CardContent>
    </div>
  );
};

export default LoginForm;
