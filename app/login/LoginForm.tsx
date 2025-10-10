"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { loginUser } from "@/lib/login";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import SocialLogin from "./SocialLogin";

type FormErrors =
  | {
      email?: string[] | undefined;
      password?: string[] | undefined;
      unauthorised?: string[] | undefined;
    }
  | undefined;

export function LoginForm() {
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

      if (res?.ok) {
        router.push("/groups");
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

  console.log("fieldError", fieldError);

  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your Acme Inc account
                </p>
              </div>

              <div className="grid gap-3 pt-6">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  className={fieldError?.password && `border border-red-600`}
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-3 pt-6">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  className={fieldError?.password && `border border-red-600`}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full mt-6"
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
              <SocialLogin />
            </div>
          </div>
          <div className="relative hidden md:block bg-[url('/login/loginLogo.png')] bg-no-repeat bg-center bg-contain">
            <div className=""></div>
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
