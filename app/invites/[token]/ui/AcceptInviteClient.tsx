"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { acceptInvite } from "../invite.actions";
import { toast } from "sonner";

export default function AcceptInviteClient({
    token,
    invitedEmail,
    loggedInEmail,
    groupName,
}: {
    token: string;
    invitedEmail: string;
    loggedInEmail: string;
    groupName?: string;
}) {
    const router = useRouter();

    const { execute, status } = useAction(acceptInvite, {
        onSuccess: ({ data }) => {
            debugger
            if (!data) return;

            if (data.isSuccess) {
                toast.success(data.message ?? "Invite accepted!");
                // redirect to your group page (adjust path)
                router.replace(`/groups/${data.groupId}/view`);
                return;
            }

            if (data.type === "wrong-account") {
                toast.error(data.message);
                return;
            }

            toast.error(data.message ?? "Failed to accept invite.");
        },
        onError: ({ error }) => {
            debugger
            toast.error("Failed to accept invite.");
        },
    });

    useEffect(() => {
        // auto-try accept as soon as page loads (logged-in users)
        execute({ token });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const mismatch =
        invitedEmail.trim().toLowerCase() !== (loggedInEmail || "").trim().toLowerCase();

    return (
        <div className="mx-auto max-w-lg p-6">
            <h1 className="text-xl font-semibold">
                Accepting invite{groupName ? ` to ${groupName}` : ""}
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
                Invite for <span className="font-medium text-foreground">{invitedEmail}</span>
            </p>

            {mismatch ? (
                <p className="mt-4 text-sm">
                    You’re logged in as <b>{loggedInEmail}</b>. Please sign in as <b>{invitedEmail}</b>.
                </p>
            ) : (
                <p className="mt-4 text-sm">
                    Processing… {status === "executing" ? "Joining group…" : ""}
                </p>
            )}
        </div>
    );
}
