"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { loginUser } from "@/lib/login";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import SocialLogin from "./SocialLogin";
import { sendMagicLink } from "../(main-app)/actions/sendMagicLink";

type FormErrors =
  | {
    email?: string[] | undefined;
    password?: string[] | undefined;
    unauthorised?: string[] | undefined;
  }
  | undefined;

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  const safeName =
    name.length <= 2 ? `${name[0]}*` : `${name[0]}***${name[name.length - 1]}`;
  const parts = domain.split(".");
  const d0 = parts[0] || "";
  const safeDomain =
    d0.length <= 2 ? `${d0[0]}*` : `${d0[0]}***${d0[d0.length - 1]}`;
  return `${safeName}@${safeDomain}.${parts.slice(1).join(".") || "com"}`;
}

function normalizeLoginEmail(value: string) {
  return value.trim().toLowerCase();
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [fieldError, setFieldErrors] = useState<FormErrors | undefined>(
    undefined
  );
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  const [loginWithPassword, setLoginWithPassword] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const submittedEmailRef = useRef<string | null>(null);
  const cooldownMs = cooldownUntil ? Math.max(0, cooldownUntil - now) : 0;
  const isCooldown = cooldownMs > 0;
  const canVerify = code.trim().length === 6 && /^\d{6}$/.test(code);
  useEffect(() => {
    if (!cooldownUntil) {
      setSecondsLeft(0);
      return;
    }

    const tick = () => {
      const msLeft = cooldownUntil - Date.now();
      if (msLeft <= 0) {
        setSecondsLeft(0);
        setCooldownUntil(null);
        return false;
      }
      const digit = Math.ceil(msLeft / 100);
      setSecondsLeft(digit);
      return true;
    };
    tick();

    const id = setInterval(() => {
      if (!tick()) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const { execute: handleLoginUser } = useAction(loginUser, {
    onSuccess: async ({ data }) => {
      if (data?.success) {
        router.push("/groups");
        return;
      }

      setFieldErrors({ unauthorised: ["Invalid email or password."] });
    },
    onError({ error }) {
      if (error.serverError) {
        const raw = String(error.serverError);

        try {
          const parsed = JSON.parse(raw);
          if (parsed.code === "RATE_LIMIT") {
            const ms = Number(parsed.retryAfterMs ?? 30_000);
            setCooldownUntil(Date.now() + ms);
            setFieldErrors({ unauthorised: [parsed.message] });
            return;
          }
        } catch {
          // not JSON, ignore
        }

        setFieldErrors({ unauthorised: [raw] });
        return;
      }

      console.log('Error: ', error)
    },
  });

  const { execute: handleEmailSubmit } = useAction(sendMagicLink, {
    onSuccess: ({ data }) => {
      if (!data) {
        setError(data ?? "Failed to send code.");
        return;
      }

      setError(null);
      setStep(2);
      setCooldownUntil(Date.now() + 30_000);
    },
    onError({ error }) {
      setError(error.serverError ? String(error.serverError) : "Failed to send code.");
    },
  });

  function goBackToEmail() {
    setStep(1);
    setChallengeId(null);
    setCode("");
    setError(null);
  }
  async function onCodeSubmit(e: FormEvent) {
    e.preventDefault();
    if (isVerifying || !challengeId) return;

    // optionally guard cooldown too
    if (isCooldown) return;

    setError(null);
    setIsVerifying(true);

    try {
      const res = await signIn("credentials", {
        method: "otp",
        email,
        challengeId,
        code,
        redirect: false,
      });

      if (res?.ok) {
        router.push("/groups");
        router.refresh();
        return;
      }

      // NextAuth often returns a string error; we’ll try to parse JSON (your RATE_LIMIT shape)
      const raw = String(res?.error ?? "Invalid code.");

      try {
        const parsed = JSON.parse(raw);
        if (parsed.code === "RATE_LIMIT") {
          const ms = Number(parsed.retryAfterMs ?? 30_000);
          setCooldownUntil(Date.now() + ms);
          setError(
            parsed.message ?? "Too many attempts. Please try again shortly."
          );
          return;
        }
      } catch {
        // not JSON
      }

      setError(raw === "CredentialsSignin" ? "Invalid code." : raw);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    // Todo: make div below horizontally centered
    <div className={cn("flex flex-col gap-6 max-w-1/2 mx-auto")}>
      {step === 1 ? (
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col gap-2 p-10 justify-center">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground text-balance">
                Login to your Nest account
              </p>
            </div>
            {fieldError?.unauthorised?.[0] && secondsLeft > 0 && (
              <div className="flex flex-col items-center text-center">
                <p className="text-red-600 text-xs">
                  {fieldError.unauthorised?.[0]}
                </p>
              </div>
            )}

            <div className="grid gap-1 pt-6">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                className={fieldError?.unauthorised && `border border-red-600`}
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                required
              />
              {fieldError?.email && (
                <div className="flex flex-col items-center text-center">
                  <p className="text-red-600 text-xs">
                    {fieldError.email?.[0]}
                  </p>
                </div>
              )}
            </div>
            {loginWithPassword && (
              <div className="grid gap-1 pt-6">
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
                  className={
                    fieldError?.unauthorised && `border border-red-600`
                  }
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {fieldError?.password && (
                  <div className="flex flex-col items-center text-center">
                    <p className="text-red-600 text-xs">
                      {fieldError.password?.[0]}
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              disabled={
                fieldError && fieldError.unauthorised && secondsLeft > 0
              }
              className="w-full mt-6"
              onClick={() => {
                const localError: FormErrors = {};
                const normalizedEmail = normalizeLoginEmail(email);

                if (!normalizedEmail) {
                  localError.email = ["Email is required"];
                }
                if (loginWithPassword && !password.trim()) {
                  localError.password = ["Password is required"];
                }

                if (Object.keys(localError).length > 0) {
                  setFieldErrors(localError);
                  return;
                }
                submittedEmailRef.current = normalizedEmail;
                if (normalizedEmail !== email) {
                  setEmail(normalizedEmail);
                }
                setFieldErrors(undefined);
                {
                  loginWithPassword
                    ? handleLoginUser({ email: normalizedEmail, password })
                    : handleEmailSubmit({ email: normalizedEmail });
                }
              }}
            >
              {loginWithPassword ? "Login" : "Continue"}
            </Button>
            {secondsLeft > 0 && secondsLeft}
            <SocialLogin
              onHandleWithPass={setLoginWithPassword}
              withPassword={loginWithPassword}
            />
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col gap-2 p-10 justify-center">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-2xl font-bold">Check your email</h1>
              <p className="text-muted-foreground text-balance">
                We&apos;ve sent a magic link to{" "}
                <span className="font-medium text-neutral-900 dark:text-white">
                  {maskEmail(email)}
                </span>
                . Click it to sign in.
              </p>
            </div>

            <div className="mt-6 rounded-xl py-3 text-sm text-neutral-700 text-center">
              Didn&apos;t get it?
              <button
                type="button"
                onClick={goBackToEmail}
                className="ml-2 text-xs font-semibold text-neutral-900 underline underline-offset-2 dark:text-white"
              >
                Change email
              </button>
            </div>
          </div>
        </Card>

      )}
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
