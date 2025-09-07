"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";

import { registerUser } from "../../register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

type FormErrors =
  | {
      name?: string[] | undefined;
      email?: string[] | undefined;
      password?: string[] | undefined;
    }
  | undefined;

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const [fieldError, setFieldErrors] = useState<FormErrors | undefined>(
    undefined
  );

  const { execute: handleRegisterUser } = useAction(registerUser, {
    onSuccess({ data }) {
      if (data.isSuccess) {
        toast("User created", {
          description: "Redirecting to login...",
          icon: <CircleCheck className="text-green-500" />,
        });
        router.push("/login");
      }
    },
    onError({ error }) {
      console.log("onError rendered");
      setFieldErrors(error.validationErrors);
    },
  });

  return (
    <Card className="">
      <CardHeader>
        <h1 className="text-2xl font-bold mb-4">Create an account</h1>
      </CardHeader>
      <CardContent>
        <Input
          type="text"
          placeholder="Name"
          className="w-full p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {fieldError && <p className="text-red-500">{fieldError.name}</p>}

        <Input
          type="email"
          placeholder="Email"
          className="w-full p-2 "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {fieldError && <p className="text-red-500">{fieldError.email}</p>}

        <Input
          type="password"
          placeholder="Password"
          className="w-full p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {fieldError && <p className="text-red-500">{fieldError.password}</p>}

        <Button
          onClick={() => {
            handleRegisterUser({ name, email, password });
          }}
        >
          Sign Up
        </Button>
        <Link href="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </CardContent>
    </Card>
  );
}
