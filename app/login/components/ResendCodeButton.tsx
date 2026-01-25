import React from "react";

const RESEND_SECONDS = 45;
export function ResendOtpButton({
  onResend,
  //   isResending,
  challengeId,
}: {
  onResend: () => Promise<void> | void;
  //   isResending?: boolean;
  challengeId: string | null;
}) {
  const [unlockAt, setUnlockAt] = React.useState(
    () => Date.now() + RESEND_SECONDS * 1000
  );
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250); // small tick, smooth enough
    return () => window.clearInterval(id);
  }, []);

  const msLeft = Math.max(0, unlockAt - now);
  const secondsLeft = Math.ceil(msLeft / 1000);
  const canResend = msLeft === 0;

  const handleClick = async () => {
    if (!canResend) return;

    try {
      // IMPORTANT: await so errors don't get swallowed and so countdown restarts after success
      await onResend();
    } catch (e) {
      // If resend fails, you might want to allow retry immediately:
      // setSecondsLeft(0);
      // or keep current secondsLeft.
      console.error(e);
    }
  };
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={!canResend || !challengeId}
        className="rounded-md border px-3 py-2 disabled:opacity-50"
      >
        {"Resend code"}
      </button>

      {!canResend ? (
        <span className="text-sm text-neutral-500">
          Resend available in {secondsLeft}s
        </span>
      ) : (
        <span className="text-sm text-neutral-500">You can resend now</span>
      )}
    </div>
  );
}
