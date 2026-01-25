"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FormEvent, useEffect, useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { loginOtp, loginUser, resendCode } from "@/lib/login";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import SocialLogin from "./SocialLogin";
import { ResendOtpButton } from "./components/ResendCodeButton";

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
    onSuccess: async ({}) => {
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

      if (error.validationErrors) setFieldErrors(error.validationErrors);
    },
  });

  const { execute: handleLoginOtp } = useAction(loginOtp, {
    onSuccess: async ({ data }) => {
      if (!data.challengeId) {
        setFieldErrors({
          unauthorised: [
            "If an account exists for that email, we sent a code.",
          ],
        });
        return;
      }

      setFieldErrors({});
      setChallengeId(data.challengeId);

      setStep(2);
    },
    onError({ error }) {
      // Rate limit handling (same pattern you used)
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

      if (error.validationErrors) {
        setFieldErrors(error.validationErrors);
      }
    },
  });

  const { execute: handleResend } = useAction(resendCode, {
    onSuccess: async ({ data }) => {
      if (!data.challengeId) {
        setFieldErrors({
          unauthorised: [
            "If an account exists for that email, we sent a code.",
          ],
        });
        return;
      }

      setFieldErrors({});
      setChallengeId(data.challengeId);

      setStep(2);
    },
    onError({ error }) {
      // Rate limit handling (same pattern you used)
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

      if (error.validationErrors) {
        setFieldErrors(error.validationErrors);
      }
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

                if (!email.trim()) {
                  localError.email = ["Email is required"];
                }
                if (loginWithPassword && !password.trim()) {
                  localError.password = ["Password is required"];
                }

                if (Object.keys(localError).length > 0) {
                  setFieldErrors(localError);
                  return;
                }
                setFieldErrors(undefined);
                {
                  loginWithPassword
                    ? handleLoginUser({ email, password })
                    : handleLoginOtp({ email });
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
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground text-balance">
                Login to your Nest account
              </p>
            </div>
            <form onSubmit={onCodeSubmit} className="mt-6 space-y-4">
              <div className="rounded-xl py-3 text-sm text-neutral-700 ">
                Code sent to
                <span className="font-medium">{maskEmail(email)}</span>
                <button
                  type="button"
                  onClick={goBackToEmail}
                  className="ml-2 text-xs font-semibold text-neutral-900 underline underline-offset-2 dark:text-white"
                >
                  Change
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  6-digit code
                </label>
                <input
                  value={code}
                  onChange={(e) => {
                    // keep digits only, max 6
                    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setCode(v);
                  }}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center text-lg tracking-[0.35em] outline-none focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={!canVerify || isVerifying}
                className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900"
              >
                {isVerifying ? "Verifying…" : "Verify & sign in"}
              </button>

              <ResendOtpButton
                // todo: fix the error on onResend
                onResend={() => {
                  if (!challengeId) return;
                  handleResend({ email, challengeId });
                }}
                // isResending={isResending}
                challengeId={challengeId}
              />
              {/* <button
                type="button"
                onClick={() => requestOtp()}
                disabled={isRequesting || isCooldown}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
              >
                {isRequesting
                  ? "Resending…"
                  : isCooldown
                  ? `Resend in ${formatSeconds(cooldownMs)}`
                  : "Resend code"}
              </button> */}
            </form>
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
