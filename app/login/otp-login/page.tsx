"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAction } from "next-safe-action/hooks";
import { requestOtp } from "@/app/(main-app)/actions/requestOtp";

type ApiError = {
  serverError?: string;
  retryAfterMs?: number;
  error?: string;
};

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

function formatSeconds(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}s`;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export default function OtpLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // one interval; used for cooldown display
  useEffect(() => {
    if (!cooldownUntil) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [cooldownUntil]);

  const cooldownMs = cooldownUntil ? Math.max(0, cooldownUntil - now) : 0;
  const isCooldown = cooldownMs > 0;
  const { execute: handleEmailSubmit } = useAction(requestOtp, {
    onSuccess: ({ data }) => {
      debugger
      if (!data?.success) {
        setError(data?.message ?? "Failed to send code.");
        return;
      }

      setError(null);
      // move to next step
      setStep(2);

      // optional: start cooldown UI
      setCooldownUntil(Date.now() + 30_000);
    },
    onError({ error }) {
      setError(error.serverError ? String(error.serverError) : "Failed to send code.");
    },
  });


  async function onCodeSubmit(e: FormEvent) {
    e.preventDefault();
    if (isVerifying) return;
    if (isCooldown) return;

    setError(null);
    setIsVerifying(true);

    try {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email", // for email OTP
      });

      if (error) {
        const msg = error.message?.toLowerCase().includes("rate limit")
          ? "Too many attempts. Please wait a bit and try again."
          : error.message ?? "Invalid code.";

        setError(msg);
        return;
      }

      // ✅ session is now set in cookies/storage automatically
      router.push("/groups");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }


  function goBackToEmail() {
    setStep(1);
    setChallengeId(null);
    setCode("");
    setError(null);
  }

  const canRequest = email.trim().length > 3 && email.includes("@");
  const canVerify = code.trim().length === 6 && /^\d{6}$/.test(code);

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Sign in with a code
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
          We’ll email you a one-time code to log in.
        </p>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
            {isCooldown ? (
              <div className="mt-1 text-xs opacity-90">
                Try again in {formatSeconds(cooldownMs)}.
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none ring-0 focus:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
              />
            </div>

            <div
              onClick={() => {
                if (isCooldown) return;
                handleEmailSubmit({ email });
              }} className="w-full rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-neutral-900"
            >
              {isRequesting
                ? "Sending code…"
                : isCooldown
                  ? `Wait ${formatSeconds(cooldownMs)}`
                  : "Send code"}
            </div>

            <div className="text-center text-xs text-neutral-500 dark:text-neutral-400">
              You’ll enter a 6-digit code on the next step.
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-200">
              Code sent to{" "}
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

            <div
              onClick={() => handleEmailSubmit({ email })}
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
            >
              {isRequesting
                ? "Resending…"
                : isCooldown
                  ? `Resend in ${formatSeconds(cooldownMs)}`
                  : "Resend code"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
